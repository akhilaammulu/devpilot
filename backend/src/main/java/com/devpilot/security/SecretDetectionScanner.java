package com.devpilot.security;

import com.devpilot.analysis.AnalysisEngine;
import com.devpilot.analysis.AnalysisFinding;
import com.devpilot.analysis.EngineAnalysisResult;
import com.devpilot.model.EngineExecutionReport;
import com.devpilot.model.IssueSeverity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

/**
 * Secret Detection Scanner (Phase 3).
 * Detects hardcoded API keys, private credentials, tokens, AWS keys,
 * and database passwords committed to source code or configuration files.
 */
@Component
public class SecretDetectionScanner implements SecurityAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(SecretDetectionScanner.class);

    private static final List<SecretRule> RULES = List.of(
            new SecretRule(
                    "SEC_AWS_ACCESS_KEY",
                    Pattern.compile("\\b(AKIA[0-9A-Z]{16})\\b"),
                    IssueSeverity.CRITICAL,
                    "Hardcoded AWS Access Key ID detected in source code.",
                    "Hardcoded AWS keys committed to repositories lead to full infrastructure compromise when accessed by unauthorized parties.",
                    "Immediately revoke this key in AWS IAM. Use AWS Secrets Manager, IAM Roles, or environment variables."
            ),
            new SecretRule(
                    "SEC_GITHUB_TOKEN",
                    Pattern.compile("\\b(gh[pousr]_[a-zA-Z0-9]{36,255})\\b"),
                    IssueSeverity.CRITICAL,
                    "Hardcoded GitHub Personal Access Token detected.",
                    "Exposed GitHub tokens allow attackers to clone private repositories, tamper with releases, and alter CI/CD actions.",
                    "Revoke token via GitHub Settings -> Developer Settings -> Personal access tokens. Use environment variables."
            ),
            new SecretRule(
                    "SEC_PRIVATE_KEY",
                    Pattern.compile("-----BEGIN (?:RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----"),
                    IssueSeverity.CRITICAL,
                    "Unencrypted Private Cryptographic Key committed to repository.",
                    "Private keys must never be committed to source code repositories under any circumstances.",
                    "Delete private key from Git history using BFG Repo-Cleaner or git filter-repo. Rotate all associated certificates."
            ),
            new SecretRule(
                    "SEC_SLACK_WEBHOOK",
                    Pattern.compile("https://hooks\\.slack\\.com/services/T[a-zA-Z0-9_]+/B[a-zA-Z0-9_]+/[a-zA-Z0-9_]+"),
                    IssueSeverity.HIGH,
                    "Exposed Slack Incoming Webhook URL.",
                    "Public Slack webhooks allow spammers and malicious actors to spam internal communications channels.",
                    "Regenerate the Slack webhook in the Slack App Directory and store in a secure secret store."
            ),
            new SecretRule(
                    "SEC_HARDCODED_PASSWORD",
                    Pattern.compile("(?i)(?:password|passwd|db_password)\\s*[:=]\\s*['\"]([^'\"]{6,})['\"]"),
                    IssueSeverity.HIGH,
                    "Potentially hardcoded password or credential found in code or configuration.",
                    "Plaintext passwords in source code create persistent security vulnerabilities and violate SOC2/PCI-DSS compliance.",
                    "Replace hardcoded passwords with environment variable references (e.g. `${DB_PASSWORD}`) or HashiCorp Vault."
            ),
            new SecretRule(
                    "SEC_GENERIC_API_KEY",
                    Pattern.compile("(?i)(?:api_key|apikey|secret_key|client_secret)\\s*[:=]\\s*['\"]([a-zA-Z0-9_\\-]{24,})['\"]"),
                    IssueSeverity.HIGH,
                    "High-entropy API key or client secret committed to code.",
                    "Hardcoded API secrets grant access to third-party services and APIs, leading to account takeover or financial liability.",
                    "Store API credentials in `.env.local` (ensure included in `.gitignore`) or production secret managers."
            )
    );

    @Override
    public AnalysisEngine getEngine() {
        return AnalysisEngine.SECRET_SCANNER;
    }

    @Override
    public EngineAnalysisResult analyze(Path repositoryPath, String branch) {
        long startTime = System.currentTimeMillis();
        List<AnalysisFinding> findings = new ArrayList<>();

        log.info("Starting Secret Detection Scan on {}", repositoryPath);

        try (Stream<Path> stream = Files.walk(repositoryPath)) {
            stream.filter(Files::isRegularFile)
                  .filter(this::isScannableFile)
                  .forEach(file -> scanFileForSecrets(file, repositoryPath, findings));
        } catch (IOException e) {
            log.error("Failed walking repository path for secrets: {}", e.getMessage());
        }

        long elapsed = System.currentTimeMillis() - startTime;
        log.info("Secret Detection Scan completed with {} findings in {}ms", findings.size(), elapsed);

        EngineExecutionReport report = new EngineExecutionReport(
                getEngine().getDisplayName(),
                "COMPLETED",
                findings.size(),
                elapsed
        );

        return new EngineAnalysisResult(AnalysisEngine.SECRET_SCANNER, findings, report);
    }

    private boolean isScannableFile(Path path) {
        String p = path.toString();
        // Skip build artifacts, git internals, test suites, node_modules, and binaries
        if (p.contains("/.git/") || p.contains("/target/") || p.contains("/node_modules/") ||
            p.contains("/.next/") || p.contains("/out/") || p.contains("/dist/") ||
            p.contains("/src/test/")) {
            return false;
        }

        String name = path.getFileName().toString().toLowerCase();
        if (name.endsWith("test.java") || name.endsWith("tests.java") ||
            name.endsWith(".test.ts") || name.endsWith(".spec.ts") ||
            name.endsWith(".test.js") || name.endsWith(".spec.js")) {
            return false;
        }
        if (name.endsWith(".db") || name.endsWith(".mv.db") || name.endsWith(".png") ||
            name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".pdf") ||
            name.endsWith(".ico") || name.endsWith(".jar") || name.endsWith(".class") ||
            name.endsWith(".lock")) {
            return false;
        }

        return true;
    }

    private void scanFileForSecrets(Path file, Path repoRoot, List<AnalysisFinding> findings) {
        String relPath = repoRoot.relativize(file).toString();

        try {
            List<String> lines = Files.readAllLines(file);
            for (int i = 0; i < lines.size(); i++) {
                String line = lines.get(i);
                int lineNum = i + 1;

                // Skip comments with obvious placeholders
                if (line.contains("placeholder-") || line.contains("EXAMPLE_KEY") || line.contains("${")) {
                    continue;
                }

                for (SecretRule rule : RULES) {
                    Matcher matcher = rule.pattern.matcher(line);
                    if (matcher.find()) {
                        String matched = matcher.group(0);
                        String masked = maskSecret(matched);

                        findings.add(new AnalysisFinding(
                                AnalysisEngine.SECRET_SCANNER,
                                detectLanguage(file),
                                rule.severity,
                                rule.ruleId,
                                relPath,
                                lineNum,
                                lineNum,
                                rule.description,
                                line.replace(matched, masked).trim(),
                                rule.explanation,
                                rule.remediation
                        ));
                        break; // One finding per line
                    }
                }
            }
        } catch (Exception ignored) {
            // Ignore binary or unreadable files gracefully
        }
    }

    public static String maskSecret(String secret) {
        if (secret == null || secret.length() <= 8) {
            return "********";
        }
        int keep = Math.min(4, secret.length() / 4);
        String prefix = secret.substring(0, keep);
        String suffix = secret.substring(secret.length() - keep);
        return prefix + "*".repeat(secret.length() - (keep * 2)) + suffix;
    }

    private String detectLanguage(Path file) {
        String name = file.getFileName().toString().toLowerCase();
        if (name.endsWith(".java")) return "Java";
        if (name.endsWith(".ts") || name.endsWith(".tsx")) return "TypeScript";
        if (name.endsWith(".js") || name.endsWith(".jsx")) return "JavaScript";
        if (name.endsWith(".yml") || name.endsWith(".yaml")) return "YAML";
        if (name.endsWith(".properties")) return "Properties";
        return "Configuration";
    }

    private static class SecretRule {
        String ruleId;
        Pattern pattern;
        IssueSeverity severity;
        String description;
        String explanation;
        String remediation;

        SecretRule(String ruleId, Pattern pattern, IssueSeverity severity, String description, String explanation, String remediation) {
            this.ruleId = ruleId;
            this.pattern = pattern;
            this.severity = severity;
            this.description = description;
            this.explanation = explanation;
            this.remediation = remediation;
        }
    }
}
