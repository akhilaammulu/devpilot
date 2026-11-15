package com.devpilot.analysis;

import com.devpilot.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

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
        private final List<EngineExecutionReport> engineReports;

        public QualityScanResult(List<Issue> issues, QualityMetrics metrics, List<EngineExecutionReport> engineReports) {
            this.issues = issues;
            this.metrics = metrics;
            this.engineReports = engineReports;
        }

        public List<Issue> getIssues() {
            return issues;
        }

        public QualityMetrics getMetrics() {
            return metrics;
        }

        public List<EngineExecutionReport> getEngineReports() {
            return engineReports;
        }
    }

    public enum ProjectType {
        JAVA_ONLY,
        TYPESCRIPT_ONLY,
        POLYGLOT,
        EMPTY
    }

    public ProjectType detectProjectType(Path repositoryPath) {
        if (repositoryPath == null || !Files.exists(repositoryPath)) {
            return ProjectType.EMPTY;
        }

        boolean hasJava = false;
        boolean hasJsTs = false;

        try (Stream<Path> stream = Files.walk(repositoryPath)) {
            List<Path> paths = stream.toList();
            hasJava = paths.stream().anyMatch(p -> p.toString().endsWith(".java") && !p.toString().contains("/target/"));
            hasJsTs = paths.stream().anyMatch(p -> (p.toString().endsWith(".ts") || p.toString().endsWith(".tsx") || p.toString().endsWith(".js"))
                    && !p.toString().contains("/node_modules/")
                    && !p.toString().contains("/.next/"));
        } catch (IOException e) {
            log.warn("Could not walk repository directory to detect type: {}", e.getMessage());
        }

        if (hasJava && hasJsTs) return ProjectType.POLYGLOT;
        if (hasJava) return ProjectType.JAVA_ONLY;
        if (hasJsTs) return ProjectType.TYPESCRIPT_ONLY;
        return ProjectType.EMPTY;
    }

    /**
     * Executes all registered static analysis engines, normalizes findings,
     * computes quality metrics, and enriches the scan entity.
     */
    public QualityScanResult executeQualityScan(RepositoryScan scan, Path repositoryPath, String branch) {
        ProjectType projectType = detectProjectType(repositoryPath);
        log.info("Starting static analysis execution for scan {} on branch {} (Detected project type: {})",
                scan != null ? scan.getId() : "test", branch, projectType);

        List<AnalysisFinding> allFindings = new ArrayList<>();
        List<EngineExecutionReport> engineReports = new ArrayList<>();

        for (StaticAnalyzer analyzer : analyzers) {
            try {
                log.info("Running analyzer: {}", analyzer.getEngine().getDisplayName());
                EngineAnalysisResult result = analyzer.analyze(repositoryPath, branch);
                allFindings.addAll(result.getFindings());
                engineReports.add(result.getReport());
                log.info("Analyzer {} completed with status {} ({} findings in {}ms)",
                        analyzer.getEngine().getDisplayName(),
                        result.getReport().getStatus(),
                        result.getFindings().size(),
                        result.getReport().getExecutionTimeMs());
            } catch (Exception e) {
                log.error("Analyzer {} encountered error: {}", analyzer.getEngine().getDisplayName(), e.getMessage(), e);
                engineReports.add(new EngineExecutionReport(
                        analyzer.getEngine().getDisplayName(),
                        "FAILED",
                        0,
                        0,
                        "Execution error: " + e.getMessage()
                ));
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
            issue.setStartColumn(f.getStartColumn());
            issue.setEndColumn(f.getEndColumn());
            issue.setSnippet(f.getSnippet());
            issue.setAiExplanation(f.getAiExplanation());
            issue.setAiFixSuggestion(f.getProposedFix());
            issue.setEngine(f.getEngine().getDisplayName().toUpperCase());
            issue.setLanguage(f.getLanguage());
            issue.setStatus("OPEN");
            issues.add(issue);
        }

        QualityMetrics metrics = calculator.calculateFromFindings(allFindings);

        if (scan != null) {
            scan.setQualityScore(metrics.getQualityScore());
            scan.setStatus(ScanStatus.COMPLETED);
            scan.setCompletedAt(Instant.now());
        }

        return new QualityScanResult(issues, metrics, engineReports);
    }
}
