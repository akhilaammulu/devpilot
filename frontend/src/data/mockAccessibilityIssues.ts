export type AccessibilitySeverityType = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type WCAGPrinciple = "PERCEIVABLE" | "OPERABLE" | "UNDERSTANDABLE" | "ROBUST";

export interface AccessibilityIssue {
  id: string;
  category: "ACCESSIBILITY";
  engine: "AXE_CORE";
  engineDisplayName: string;
  severity: AccessibilitySeverityType;
  ruleId: string;
  wcagCriterion: string;
  principle: WCAGPrinciple;
  pageUrl: string;
  filePath: string;
  selector: string;
  lineStart: number;
  lineEnd: number;
  message: string;
  snippet: string;
  aiExplanation: string;
  proposedFix: string;
  helpUrl?: string;
  status: "OPEN" | "RESOLVED";
}

export const MOCK_ACCESSIBILITY_ISSUES: AccessibilityIssue[] = [
  {
    id: "a11y-001",
    category: "ACCESSIBILITY",
    engine: "AXE_CORE",
    engineDisplayName: "axe-core",
    severity: "CRITICAL",
    ruleId: "AXE_BUTTON_NAME",
    wcagCriterion: "WCAG 2.1 A (4.1.2)",
    principle: "OPERABLE",
    pageUrl: "/",
    filePath: "frontend/src/components/Header.tsx",
    selector: "header button.p-2.rounded-xl",
    lineStart: 134,
    lineEnd: 144,
    message: "WCAG 2.1 A (4.1.2): Icon-only theme toggle button is missing an accessible name or aria-label.",
    snippet: `<button onClick={toggleTheme} className="p-2 rounded-xl text-amber-500 hover:bg-slate-100">
  <Sun className="w-5 h-5 text-amber-500" />
</button>`,
    aiExplanation: "Screen reader users hearing 'button' without accessible name have no way of knowing this button switches between Light and Dark mode.",
    proposedFix: `<button
  onClick={toggleTheme}
  aria-label="Toggle between light and dark theme"
  className="p-2 rounded-xl text-amber-500 hover:bg-slate-100"
>
  <Sun className="w-5 h-5 text-amber-500" />
</button>`,
    helpUrl: "https://dequeuniversity.com/rules/axe/4.14/button-name",
    status: "OPEN",
  },
  {
    id: "a11y-002",
    category: "ACCESSIBILITY",
    engine: "AXE_CORE",
    engineDisplayName: "axe-core",
    severity: "HIGH",
    ruleId: "AXE_COLOR_CONTRAST",
    wcagCriterion: "WCAG 2.1 AA (1.4.3)",
    principle: "PERCEIVABLE",
    pageUrl: "/",
    filePath: "frontend/src/components/Header.tsx",
    selector: "header p.text-\\[11px\\]",
    lineStart: 69,
    lineEnd: 71,
    message: "WCAG 2.1 AA (1.4.3): Subtitle text color contrast ratio (3.2:1) is below the minimum required 4.5:1 threshold.",
    snippet: `<p className="text-[11px] text-slate-400 dark:text-slate-400 -mt-0.5 font-medium">
  AI-Powered Developer Platform
</p>`,
    aiExplanation: "Low-contrast gray text on light backgrounds is difficult or impossible to read for users with moderate low vision or in brightly lit environments.",
    proposedFix: `<p className="text-[11px] text-slate-600 dark:text-slate-300 -mt-0.5 font-medium">
  AI-Powered Developer Platform
</p>`,
    helpUrl: "https://dequeuniversity.com/rules/axe/4.14/color-contrast",
    status: "OPEN",
  },
  {
    id: "a11y-003",
    category: "ACCESSIBILITY",
    engine: "AXE_CORE",
    engineDisplayName: "axe-core",
    severity: "CRITICAL",
    ruleId: "AXE_BUTTON_NAME",
    wcagCriterion: "WCAG 2.1 A (4.1.2)",
    principle: "OPERABLE",
    pageUrl: "/security",
    filePath: "frontend/src/components/security/SecurityExplorerView.tsx",
    selector: "div.shrink-0 button.p-1.rounded-lg",
    lineStart: 849,
    lineEnd: 855,
    message: "WCAG 2.1 A (4.1.2): Contextual action menu button is missing an accessible name.",
    snippet: `<button onClick={(e) => e.stopPropagation()} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
  <MoreVertical className="w-4 h-4" />
</button>`,
    aiExplanation: "Assistive technologies cannot convey the purpose of icon-only action menus without explicit aria-labels.",
    proposedFix: `<button
  onClick={(e) => e.stopPropagation()}
  aria-label="More issue actions"
  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
>
  <MoreVertical className="w-4 h-4" />
</button>`,
    helpUrl: "https://dequeuniversity.com/rules/axe/4.14/button-name",
    status: "OPEN",
  },
  {
    id: "a11y-004",
    category: "ACCESSIBILITY",
    engine: "AXE_CORE",
    engineDisplayName: "axe-core",
    severity: "HIGH",
    ruleId: "AXE_IMAGE_ALT",
    wcagCriterion: "WCAG 2.1 A (1.1.1)",
    principle: "PERCEIVABLE",
    pageUrl: "/profile",
    filePath: "frontend/src/app/profile/page.tsx",
    selector: "div.flex.items-center img",
    lineStart: 87,
    lineEnd: 87,
    message: "WCAG 2.1 A (1.1.1): User avatar image is missing an alt text description.",
    snippet: `<img src="https://github.com/akhilaammulu.png" className="w-16 h-16 rounded-full" />`,
    aiExplanation: "Non-text content without alternative text leaves screen reader users unaware of visual representations.",
    proposedFix: `<img
  src="https://github.com/akhilaammulu.png"
  alt="akhilaammulu profile avatar"
  className="w-16 h-16 rounded-full"
/>`,
    helpUrl: "https://dequeuniversity.com/rules/axe/4.14/image-alt",
    status: "OPEN",
  },
  {
    id: "a11y-005",
    category: "ACCESSIBILITY",
    engine: "AXE_CORE",
    engineDisplayName: "axe-core",
    severity: "MEDIUM",
    ruleId: "AXE_HEADING_ORDER",
    wcagCriterion: "WCAG 2.1 AA (1.3.1)",
    principle: "PERCEIVABLE",
    pageUrl: "/",
    filePath: "frontend/src/components/issues/CodeQualityExplorerView.tsx",
    selector: "div.p-6 h3.text-sm",
    lineStart: 494,
    lineEnd: 497,
    message: "WCAG 2.1 AA (1.3.1): Heading order skips from h1 directly to h3 without an intervening h2.",
    snippet: `<h3 className="text-sm font-bold text-slate-900 dark:text-white">Quality Score Trend</h3>`,
    aiExplanation: "Skipped heading levels disrupt semantic document hierarchy and navigation landmarks for keyboard and screen reader users.",
    proposedFix: `<h2 className="text-sm font-bold text-slate-900 dark:text-white">Quality Score Trend</h2>`,
    helpUrl: "https://dequeuniversity.com/rules/axe/4.14/heading-order",
    status: "OPEN",
  },
  {
    id: "a11y-006",
    category: "ACCESSIBILITY",
    engine: "AXE_CORE",
    engineDisplayName: "axe-core",
    severity: "LOW",
    ruleId: "AXE_LANDMARK_ONE_MAIN",
    wcagCriterion: "WCAG 2.1 A (1.3.1)",
    principle: "OPERABLE",
    pageUrl: "/login",
    filePath: "frontend/src/app/login/page.tsx",
    selector: "body > div.min-h-screen",
    lineStart: 12,
    lineEnd: 15,
    message: "WCAG 2.1 A (1.3.1): Document should contain exactly one <main> landmark container.",
    snippet: `<div className="min-h-screen flex items-center justify-center">...</div>`,
    aiExplanation: "Landmarks allow assistive technology users to jump directly to key sections of the page without tabbing through every element.",
    proposedFix: `<main className="min-h-screen flex items-center justify-center">...</main>`,
    helpUrl: "https://dequeuniversity.com/rules/axe/4.14/landmark-one-main",
    status: "OPEN",
  },
];
