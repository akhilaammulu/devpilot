package com.devpilot.accessibility;

import com.devpilot.analysis.AnalysisFinding;
import com.devpilot.analysis.EngineAnalysisResult;
import com.devpilot.model.EngineExecutionReport;
import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import com.devpilot.model.RepositoryScan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Orchestrates accessibility scanning with Playwright + axe-core, mapping findings
 * into normalized Issue entities and calculating accessibility compliance scores (Phase 4).
 */
@Service
public class AccessibilityScanOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(AccessibilityScanOrchestrator.class);

    private final AxeCoreAccessibilityScanner axeScanner;
    private final AccessibilityScoreCalculator scoreCalculator;

    public AccessibilityScanOrchestrator(AxeCoreAccessibilityScanner axeScanner,
                                         AccessibilityScoreCalculator scoreCalculator) {
        this.axeScanner = axeScanner;
        this.scoreCalculator = scoreCalculator;
    }

    public AccessibilityScanResult executeAccessibilityScan(RepositoryScan scan, Path repositoryPath, String targetUrl) {
        log.info("Executing Accessibility Analysis on scan {} (Target: {})",
                scan != null ? scan.getId() : "test", targetUrl);

        EngineAnalysisResult result = axeScanner.analyze(repositoryPath, targetUrl);
        List<EngineExecutionReport> reports = List.of(result.getReport());

        List<Issue> issues = new ArrayList<>();
        for (AnalysisFinding finding : result.getFindings()) {
            Issue issue = new Issue();
            issue.setCategory(IssueCategory.ACCESSIBILITY);
            issue.setScan(scan);
            issue.setEngine(finding.getEngine().name());
            issue.setRuleId(finding.getRuleId());
            issue.setSeverity(finding.getSeverity());
            issue.setMessage(finding.getMessage());
            issue.setFilePath(finding.getFilePath());
            issue.setStartLine(finding.getLineStart());
            issue.setEndLine(finding.getLineEnd());
            issue.setLineStart(finding.getLineStart());
            issue.setLineEnd(finding.getLineEnd());
            issue.setSnippet(finding.getSnippet());
            issue.setAiExplanation(finding.getAiExplanation());
            issue.setAiFixSuggestion(finding.getProposedFix());
            issue.setStatus("OPEN");
            issue.setLanguage(finding.getLanguage());

            issues.add(issue);
        }

        int score = scoreCalculator.calculateScore(issues);
        String grade = scoreCalculator.calculateGrade(score);
        String wcagLevel = scoreCalculator.calculateWcagLevel(score);

        if (scan != null) {
            scan.setAccessibilityScore(score);
        }

        AccessibilityMetrics metrics = buildMetrics(issues, score, grade, wcagLevel);

        log.info("Accessibility Scan completed: {} violations, Score: {}/100 ({}, {})",
                issues.size(), score, grade, wcagLevel);

        return new AccessibilityScanResult(issues, reports, metrics);
    }

    public AccessibilityMetrics computeMetricsForScan(List<Issue> issues) {
        int score = scoreCalculator.calculateScore(issues);
        String grade = scoreCalculator.calculateGrade(score);
        String wcagLevel = scoreCalculator.calculateWcagLevel(score);
        return buildMetrics(issues, score, grade, wcagLevel);
    }

    private AccessibilityMetrics buildMetrics(List<Issue> issues, int score, String grade, String wcagLevel) {
        int openViolations = (int) issues.stream().filter(i -> !"RESOLVED".equalsIgnoreCase(i.getStatus())).count();
        int resolvedViolations = (int) issues.stream().filter(i -> "RESOLVED".equalsIgnoreCase(i.getStatus())).count();

        int critical = (int) issues.stream().filter(i -> i.getSeverity() == IssueSeverity.CRITICAL && !"RESOLVED".equalsIgnoreCase(i.getStatus())).count();
        int high = (int) issues.stream().filter(i -> i.getSeverity() == IssueSeverity.HIGH && !"RESOLVED".equalsIgnoreCase(i.getStatus())).count();
        int medium = (int) issues.stream().filter(i -> i.getSeverity() == IssueSeverity.MEDIUM && !"RESOLVED".equalsIgnoreCase(i.getStatus())).count();
        int low = (int) issues.stream().filter(i -> i.getSeverity() == IssueSeverity.LOW && !"RESOLVED".equalsIgnoreCase(i.getStatus())).count();

        int perceivable = 0;
        int operable = 0;
        int understandable = 0;
        int robust = 0;

        for (Issue i : issues) {
            String rule = (i.getRuleId() != null ? i.getRuleId().toUpperCase() : "");
            if (rule.contains("COLOR") || rule.contains("IMAGE") || rule.contains("HEADING") || rule.contains("CONTRAST")) {
                perceivable++;
            } else if (rule.contains("BUTTON") || rule.contains("LINK") || rule.contains("LANDMARK") || rule.contains("VIEWPORT") || rule.contains("KEYBOARD")) {
                operable++;
            } else if (rule.contains("LABEL") || rule.contains("LANG") || rule.contains("FORM")) {
                understandable++;
            } else {
                robust++;
            }
        }

        return new AccessibilityMetrics(
                score, grade, wcagLevel,
                openViolations, resolvedViolations,
                critical, high, medium, low,
                perceivable, operable, understandable, robust
        );
    }

    public static class AccessibilityScanResult {
        private final List<Issue> issues;
        private final List<EngineExecutionReport> engineReports;
        private final AccessibilityMetrics metrics;

        public AccessibilityScanResult(List<Issue> issues,
                                       List<EngineExecutionReport> engineReports,
                                       AccessibilityMetrics metrics) {
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

        public AccessibilityMetrics getMetrics() {
            return metrics;
        }
    }
}
