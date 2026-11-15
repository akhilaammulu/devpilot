package com.devpilot.analysis;

import com.devpilot.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class CodeQualityOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(CodeQualityOrchestrator.class);

    private final List<StaticAnalyzer> analyzers;
    private final QualityScoreCalculator calculator;

    public CodeQualityOrchestrator(List<StaticAnalyzer> analyzers, QualityScoreCalculator calculator) {
        this.analyzers = analyzers;
        this.calculator = calculator;
    }

    public static class QualityScanResult {
        private final List<Issue> issues;
        private final QualityMetrics metrics;

        public QualityScanResult(List<Issue> issues, QualityMetrics metrics) {
            this.issues = issues;
            this.metrics = metrics;
        }

        public List<Issue> getIssues() {
            return issues;
        }

        public QualityMetrics getMetrics() {
            return metrics;
        }
    }

    /**
     * Executes all registered static analysis engines, normalizes findings,
     * computes quality metrics, and enriches the scan entity.
     */
    public QualityScanResult executeQualityScan(RepositoryScan scan, Path repositoryPath, String branch) {
        log.info("Starting static analysis execution for scan {} on branch {}", scan.getId(), branch);

        List<AnalysisFinding> allFindings = new ArrayList<>();

        for (StaticAnalyzer analyzer : analyzers) {
            try {
                log.info("Running analyzer: {}", analyzer.getEngine().getDisplayName());
                List<AnalysisFinding> findings = analyzer.analyze(repositoryPath, branch);
                allFindings.addAll(findings);
                log.info("Analyzer {} discovered {} findings", analyzer.getEngine().getDisplayName(), findings.size());
            } catch (Exception e) {
                log.error("Analyzer {} encountered error: {}", analyzer.getEngine().getDisplayName(), e.getMessage(), e);
            }
        }

        List<Issue> issues = new ArrayList<>();
        for (AnalysisFinding f : allFindings) {
            Issue issue = new Issue(
                    scan,
                    IssueCategory.CODE_QUALITY,
                    f.getSeverity(),
                    f.getRuleId(),
                    f.getFilePath(),
                    f.getLineStart(),
                    f.getLineEnd(),
                    f.getMessage()
            );
            issue.setSnippet(f.getSnippet());
            issue.setAiExplanation(f.getAiExplanation());
            issue.setAiFixSuggestion(f.getProposedFix());
            issue.setEngine(f.getEngine().getDisplayName());
            issue.setLanguage(f.getLanguage());
            issue.setStatus("OPEN");
            issues.add(issue);
        }

        QualityMetrics metrics = calculator.calculateFromFindings(allFindings);

        scan.setQualityScore(metrics.getQualityScore());
        scan.setStatus(ScanStatus.COMPLETED);
        scan.setCompletedAt(Instant.now());

        return new QualityScanResult(issues, metrics);
    }
}
