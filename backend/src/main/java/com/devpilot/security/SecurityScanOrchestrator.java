package com.devpilot.security;

import com.devpilot.analysis.AnalysisFinding;
import com.devpilot.analysis.EngineAnalysisResult;
import com.devpilot.model.EngineExecutionReport;
import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.RepositoryScan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Security Scan Orchestrator (Phase 3).
 * Manages the execution lifecycle for Dependency Vulnerability Checking,
 * Secret Detection, and Insecure Configuration Auditing.
 */
@Service
public class SecurityScanOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(SecurityScanOrchestrator.class);

    private final DependencyVulnerabilityScanner dependencyScanner;
    private final SecretDetectionScanner secretScanner;
    private final UnsafeConfigurationScanner configScanner;
    private final SecurityScoreCalculator scoreCalculator;

    public SecurityScanOrchestrator(DependencyVulnerabilityScanner dependencyScanner,
                                    SecretDetectionScanner secretScanner,
                                    UnsafeConfigurationScanner configScanner,
                                    SecurityScoreCalculator scoreCalculator) {
        this.dependencyScanner = dependencyScanner;
        this.secretScanner = secretScanner;
        this.configScanner = configScanner;
        this.scoreCalculator = scoreCalculator;
    }

    public SecurityScanResult executeSecurityScan(RepositoryScan scan, Path repositoryPath, String branch) {
        log.info("Executing full security analysis suite on {}", repositoryPath);

        List<Issue> issues = new ArrayList<>();
        List<EngineExecutionReport> reports = new ArrayList<>();

        // 1. Dependency Vulnerability Scanner
        try {
            EngineAnalysisResult depResult = dependencyScanner.analyze(repositoryPath, branch);
            reports.add(depResult.getReport());
            for (AnalysisFinding f : depResult.getFindings()) {
                issues.add(mapToIssue(scan, f));
            }
        } catch (Exception e) {
            log.error("Dependency Vulnerability Scanner failed: {}", e.getMessage());
            reports.add(new EngineExecutionReport("DependencyCheck", "FAILED", 0, 0, e.getMessage()));
        }

        // 2. Secret Detection Scanner
        try {
            EngineAnalysisResult secretResult = secretScanner.analyze(repositoryPath, branch);
            reports.add(secretResult.getReport());
            for (AnalysisFinding f : secretResult.getFindings()) {
                issues.add(mapToIssue(scan, f));
            }
        } catch (Exception e) {
            log.error("Secret Detection Scanner failed: {}", e.getMessage());
            reports.add(new EngineExecutionReport("SecretDetection", "FAILED", 0, 0, e.getMessage()));
        }

        // 3. Unsafe Configuration Scanner
        try {
            EngineAnalysisResult configResult = configScanner.analyze(repositoryPath, branch);
            reports.add(configResult.getReport());
            for (AnalysisFinding f : configResult.getFindings()) {
                issues.add(mapToIssue(scan, f));
            }
        } catch (Exception e) {
            log.error("Unsafe Configuration Scanner failed: {}", e.getMessage());
            reports.add(new EngineExecutionReport("ConfigAudit", "FAILED", 0, 0, e.getMessage()));
        }

        SecurityMetrics metrics = scoreCalculator.calculateFromIssues(issues);

        log.info("Security Scan finished: {} findings, security score: {}/100 (Grade {})",
                issues.size(), metrics.getSecurityScore(), metrics.getGrade());

        return new SecurityScanResult(issues, reports, metrics);
    }

    private Issue mapToIssue(RepositoryScan scan, AnalysisFinding finding) {
        Issue issue = new Issue();
        issue.setScan(scan);
        issue.setCategory(IssueCategory.SECURITY);
        issue.setSeverity(finding.getSeverity());
        issue.setRuleId(finding.getRuleId());
        issue.setFilePath(finding.getFilePath());
        issue.setLineStart(finding.getLineStart());
        issue.setLineEnd(finding.getLineEnd());
        issue.setStartLine(finding.getLineStart());
        issue.setEndLine(finding.getLineEnd());
        issue.setStartColumn(finding.getStartColumn());
        issue.setEndColumn(finding.getEndColumn());
        issue.setMessage(finding.getMessage());
        issue.setSnippet(finding.getSnippet());
        issue.setAiExplanation(finding.getAiExplanation());
        issue.setAiFixSuggestion(finding.getProposedFix());
        issue.setEngine(finding.getEngine().name());
        issue.setLanguage(finding.getLanguage());
        issue.setStatus("OPEN");
        return issue;
    }

    public static class SecurityScanResult {
        private final List<Issue> issues;
        private final List<EngineExecutionReport> engineReports;
        private final SecurityMetrics metrics;

        public SecurityScanResult(List<Issue> issues, List<EngineExecutionReport> engineReports, SecurityMetrics metrics) {
            this.issues = issues;
            this.engineReports = engineReports;
            this.metrics = metrics;
        }

        public List<Issue> getIssues() {
            return issues;
        }

        public List<EngineExecutionReport> getEngineReports() {
            return engineReports;
        }

        public SecurityMetrics getMetrics() {
            return metrics;
        }
    }
}
