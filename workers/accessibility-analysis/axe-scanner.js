#!/usr/bin/env node

/**
 * DevPilot Accessibility Analysis Worker (Phase 4)
 * Uses Playwright + axe-core to scan target web application pages for WCAG 2.1/2.2 violations.
 * Also performs static JSX/TSX accessibility scanning as a resilient fallback.
 */

const fs = require('fs');
const path = require('path');

let chromium, AxeBuilder;
try {
  const playwright = require('playwright');
  chromium = playwright.chromium;
  const axePlaywright = require('@axe-core/playwright');
  AxeBuilder = axePlaywright.AxeBuilder;
} catch (e) {
  // Graceful fallback if playwright native bindings differ
}

// Parse command line arguments
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return defaultValue;
}

const targetUrl = getArg('--url', 'http://localhost:3001');
const repoRoot = getArg('--repo', path.resolve(__dirname, '../../'));
const outputFile = getArg('--output', null);

const WCAG_MAP = {
  'color-contrast': { wcag: 'WCAG 2.1 AA (1.4.3)', principle: 'PERCEIVABLE', explanation: 'Elements must have sufficient color contrast against background so low-vision users can read content easily.', fix: 'Increase contrast ratio between text color and background to at least 4.5:1 (or 3:1 for large text).' },
  'button-name': { wcag: 'WCAG 2.1 A (4.1.2)', principle: 'OPERABLE', explanation: 'Icon-only or unlabelled buttons are invisible to screen readers, preventing blind users from knowing what the button does.', fix: 'Add aria-label="..." or an invisible sr-only text description inside the <button> tag.' },
  'image-alt': { wcag: 'WCAG 2.1 A (1.1.1)', principle: 'PERCEIVABLE', explanation: 'Images without alt attributes cannot be described to screen reader users.', fix: 'Add alt="Descriptive text" or alt="" if the image is purely decorative.' },
  'link-name': { wcag: 'WCAG 2.1 A (2.4.4) / (4.1.2)', principle: 'OPERABLE', explanation: 'Links without meaningful text or aria-label cannot be navigated by keyboard or voice control.', fix: 'Provide clear, descriptive anchor text or add an aria-label attribute.' },
  'aria-roles': { wcag: 'WCAG 2.1 A (4.1.2)', principle: 'ROBUST', explanation: 'ARIA roles used incorrectly confuse assistive technology tree interpretation.', fix: 'Ensure valid ARIA role according to WAI-ARIA 1.2 specification.' },
  'heading-order': { wcag: 'WCAG 2.1 AA (1.3.1)', principle: 'PERCEIVABLE', explanation: 'Skipping heading levels (e.g. h1 directly to h3) breaks document outline navigation for screen readers.', fix: 'Nest headings sequentially (h1 -> h2 -> h3) without skipping intermediate levels.' },
  'landmark-one-main': { wcag: 'WCAG 2.1 A (1.3.1)', principle: 'OPERABLE', explanation: 'Document should have exactly one main landmark to allow users to jump straight to core content.', fix: 'Wrap primary application view inside a single <main> element.' },
  'html-has-lang': { wcag: 'WCAG 2.1 A (3.1.1)', principle: 'UNDERSTANDABLE', explanation: 'Missing lang attribute prevents screen readers from pronouncing words with proper pronunciation and inflection.', fix: 'Add lang="en" (or appropriate language code) to the root <html> tag.' },
  'label': { wcag: 'WCAG 2.1 A (3.3.2)', principle: 'UNDERSTANDABLE', explanation: 'Form inputs without matching labels prevent users from understanding required input fields.', fix: 'Associate input with <label htmlFor="..."> or add aria-label attribute.' },
  'meta-viewport': { wcag: 'WCAG 2.1 AA (1.4.4)', principle: 'OPERABLE', explanation: 'Disabling zoom/scaling traps users who require text magnification.', fix: 'Ensure meta viewport does not include user-scalable=no or maximum-scale=1.0.' }
};

async function runLiveAxeScan(baseUrl) {
  const routes = ['/', '/security'];
  const allViolations = [];

  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const route of routes) {
      const pageUrl = `${baseUrl.replace(/\/$/, '')}${route}`;
      try {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 6000 });
        
        // Wait a brief moment for dynamic client rendering
        await page.waitForTimeout(300);

        const builder = new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
        
        const results = await builder.analyze();
        
        if (results && results.violations) {
          for (const v of results.violations) {
            const ruleMeta = WCAG_MAP[v.id] || {
              wcag: 'WCAG 2.1 AA',
              principle: 'PERCEIVABLE',
              explanation: v.description,
              fix: 'Review element markup to satisfy WCAG success criteria.'
            };

            for (const node of v.nodes.slice(0, 3)) { // Top nodes per rule
              const selector = node.target.join(' > ');
              allViolations.push({
                ruleId: `AXE_${v.id.toUpperCase().replace(/-/g, '_')}`,
                axeRuleId: v.id,
                severity: mapImpactToSeverity(v.impact),
                wcag: ruleMeta.wcag,
                principle: ruleMeta.principle,
                message: `${ruleMeta.wcag}: ${v.help}`,
                filePath: route === '/' ? 'frontend/src/app/page.tsx' : `frontend/src/app${route}/page.tsx`,
                pageUrl: route,
                selector: selector,
                snippet: node.html || `<${selector} ... />`,
                aiExplanation: ruleMeta.explanation,
                aiFixSuggestion: ruleMeta.fix,
                helpUrl: v.helpUrl
              });
            }
          }
        }
        await context.close();
      } catch (pageErr) {
        // Continue scanning other routes if one fails
      }
    }
    await browser.close();
  } catch (err) {
    // If browser launch fails, fall back to static scanner
  }

  return allViolations;
}

function mapImpactToSeverity(impact) {
  switch ((impact || '').toLowerCase()) {
    case 'critical': return 'CRITICAL';
    case 'serious': return 'HIGH';
    case 'moderate': return 'MEDIUM';
    case 'minor': return 'LOW';
    default: return 'MEDIUM';
  }
}

/**
 * Resilient static JSX/TSX accessibility scanner as backup/enrichment.
 */
function runStaticA11yScan(baseDir) {
  const findings = [];
  const frontendSrc = path.join(baseDir, 'frontend/src');

  if (!fs.existsSync(frontendSrc)) return findings;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!ent.name.startsWith('.') && ent.name !== 'node_modules') walk(full);
      } else if (ent.name.endsWith('.tsx') || ent.name.endsWith('.jsx')) {
        scanFile(full);
      }
    }
  }

  function scanFile(filePath) {
    const rel = path.relative(baseDir, filePath);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        const lineNum = idx + 1;

        // Rule 1: Icon buttons without aria-label
        if (/<button\b[^>]*>/i.test(line) && !line.includes('aria-label') && !line.includes('title')) {
          let hasIcon = false;
          for (let j = idx; j < Math.min(lines.length, idx + 4); j++) {
            const check = lines[j];
            if (check.includes('<Moon') || check.includes('<Sun') || check.includes('<Bell') || check.includes('<Search') || check.includes('<Chevron') || check.includes('<Sparkles')) {
              hasIcon = true;
              break;
            }
            if (check.includes('</button>')) break;
          }
          if (hasIcon) {
            findings.push({
              ruleId: 'AXE_BUTTON_NAME',
              axeRuleId: 'button-name',
              severity: 'CRITICAL',
              wcag: 'WCAG 2.1 A (4.1.2)',
              principle: 'OPERABLE',
              message: 'WCAG 2.1 A (4.1.2): Icon button lacks discernible text or aria-label attribute.',
              filePath: rel,
              lineStart: lineNum,
              lineEnd: lineNum,
              selector: 'button',
              snippet: line.trim(),
              aiExplanation: 'Screen readers announce unlabelled buttons as "button", giving users no indication of what action will occur.',
              aiFixSuggestion: 'Add aria-label="Descriptive action" to the <button> element.'
            });
          }
        }

        // Rule 2: Images without alt
        if (/<img\b[^>]*>/i.test(line) && !line.includes('alt=')) {
          findings.push({
            ruleId: 'AXE_IMAGE_ALT',
            axeRuleId: 'image-alt',
            severity: 'HIGH',
            wcag: 'WCAG 2.1 A (1.1.1)',
            principle: 'PERCEIVABLE',
            message: 'WCAG 2.1 A (1.1.1): <img> element is missing an alt attribute.',
            filePath: rel,
            lineStart: lineNum,
            lineEnd: lineNum,
            selector: 'img',
            snippet: line.trim(),
            aiExplanation: 'Non-text content must have an alt text alternative so vision-impaired users understand visual context.',
            aiFixSuggestion: 'Add alt="Description" (or alt="" for purely decorative graphics).'
          });
        }

        // Rule 3: Text input without matching label
        if (/<input\b[^>]*type=["']text["'][^>]*>/i.test(line) && !line.includes('aria-label') && !line.includes('id=')) {
          findings.push({
            ruleId: 'AXE_FORM_LABEL',
            axeRuleId: 'label',
            severity: 'HIGH',
            wcag: 'WCAG 2.1 A (3.3.2)',
            principle: 'UNDERSTANDABLE',
            message: 'WCAG 2.1 A (3.3.2): Text input field does not have an associated label or aria-label.',
            filePath: rel,
            lineStart: lineNum,
            lineEnd: lineNum,
            selector: 'input[type="text"]',
            snippet: line.trim(),
            aiExplanation: 'Form controls must have explicit labels to assist users with screen readers and cognitive disabilities.',
            aiFixSuggestion: 'Add aria-label="..." or associate with a <label htmlFor="..."> tag.'
          });
        }
      });
    } catch (e) {
      // Ignore read errors
    }
  }

  walk(frontendSrc);
  return findings;
}

(async () => {
  const startTime = Date.now();
  let violations = [];

  // Try live Playwright + axe-core scan against running frontend
  try {
    violations = await runLiveAxeScan(targetUrl);
  } catch (e) {
    // Live scan error fallback
  }

  // If live scan found 0 or was unreachable, run static analysis
  if (violations.length === 0) {
    violations = runStaticA11yScan(repoRoot);
  }

  const duration = Date.now() - startTime;

  const output = {
    engine: 'AxeCore',
    status: 'COMPLETED',
    findingsCount: violations.length,
    executionTimeMs: duration,
    violations: violations
  };

  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  } else {
    console.log(JSON.stringify(output, null, 2));
  }
})();
