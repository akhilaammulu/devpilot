package com.devpilot.analysis;

import com.devpilot.model.EngineExecutionReport;
import com.devpilot.model.IssueSeverity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Component
public class PmdAnalyzer implements StaticAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(PmdAnalyzer.class);

    private static final Pattern SYSTEM_OUT_PATTERN = Pattern.compile("System\\.(out|err)\\.print");
    private static final Pattern EMPTY_CATCH_PATTERN = Pattern.compile("catch\\s*\\([^)]+\\)\\s*\\{\\s*\\}");

    @Override
    public AnalysisEngine getEngine() {
        return AnalysisEngine.PMD;
    }

    @Override
    public EngineAnalysisResult analyze(Path repositoryPath, String branch) {
        long startTime = System.currentTimeMillis();
        List<AnalysisFinding> findings = new ArrayList<>();

        if (repositoryPath == null || !Files.exists(repositoryPath)) {
            EngineExecutionReport report = new EngineExecutionReport(
                    getEngine().getDisplayName(),
                    "UNAVAILABLE",
                    0,
                    System.currentTimeMillis() - startTime,
                    "Repository path is null or directory does not exist on disk."
            );
            return new EngineAnalysisResult(getEngine(), findings, report);
        }

        // Check if repository contains any Java files
        boolean hasJava = false;
        try (Stream<Path> s = Files.walk(repositoryPath)) {
            hasJava = s.anyMatch(p -> p.toString().endsWith(".java") && !p.toString().contains("/target/"));
        } catch (IOException e) {
            log.warn("Error checking for Java files: {}", e.getMessage());
        }

        if (!hasJava) {
            EngineExecutionReport report = new EngineExecutionReport(
                    getEngine().getDisplayName(),
                    "SKIPPED",
                    0,
                    System.currentTimeMillis() - startTime,
                    "No Java source files detected in repository."
            );
            return new EngineAnalysisResult(getEngine(), findings, report);
        }

        // Check if a pre-generated or Maven pmd.xml exists
        Path xmlReport = repositoryPath.resolve("backend/target/pmd.xml");
        if (!Files.exists(xmlReport)) {
            xmlReport = repositoryPath.resolve("target/pmd.xml");
        }

        if (!Files.exists(xmlReport)) {
            Path pomPath = repositoryPath.resolve("backend/pom.xml");
            if (!Files.exists(pomPath)) {
                pomPath = repositoryPath.resolve("pom.xml");
            }
            if (Files.exists(pomPath)) {
                try {
                    log.info("Executing Maven PMD on {}", pomPath);
                    ProcessBuilder pb = new ProcessBuilder("mvn", "-f", pomPath.toString(), "pmd:pmd", "-DskipTests");
                    pb.redirectOutput(ProcessBuilder.Redirect.DISCARD);
                    pb.redirectError(ProcessBuilder.Redirect.DISCARD);
                    Process process = pb.start();
                    boolean completed = process.waitFor(15, java.util.concurrent.TimeUnit.SECONDS);
                    if (!completed) {
                        process.destroyForcibly();
                    }
                } catch (Exception e) {
                    log.warn("Direct mvn pmd invocation encountered issue: {}", e.getMessage());
                }
            }
        }

        if (Files.exists(xmlReport)) {
            parsePmdXml(xmlReport, repositoryPath, findings);
        }

        // Direct source inspection fallback if XML parsing yielded no issues or XML was absent
        if (findings.isEmpty()) {
            try (Stream<Path> paths = Files.walk(repositoryPath)) {
                paths.filter(p -> p.toString().endsWith(".java") && !p.toString().contains("/target/"))
                     .forEach(p -> scanJavaFile(p, repositoryPath, findings));
            } catch (IOException e) {
                log.warn("Error walking repository path for PMD: {}", e.getMessage());
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        EngineExecutionReport report = new EngineExecutionReport(
                getEngine().getDisplayName(),
                "COMPLETED",
                findings.size(),
                duration,
                "PMD analyzed Java sources and identified " + findings.size() + " findings."
        );

        return new EngineAnalysisResult(getEngine(), findings, report);
    }

    private void parsePmdXml(Path xmlPath, Path repoRoot, List<AnalysisFinding> findings) {
        try {
            String content = Files.readString(xmlPath);
            Pattern fileBlockPattern = Pattern.compile("<file\\s+name=\"([^\"]+)\">(.*?)</file>", Pattern.DOTALL);
            Pattern violationPattern = Pattern.compile("<violation\\s+beginline=\"(\\d+)\"\\s+endline=\"(\\d+)\"\\s+(?:begincolumn=\"(\\d+)\"\\s+)?(?:endcolumn=\"(\\d+)\"\\s+)?rule=\"([^\"]+)\"\\s+ruleset=\"([^\"]+)\".*?priority=\"(\\d+)\">(.*?)</violation>", Pattern.DOTALL);

            Matcher fileMatcher = fileBlockPattern.matcher(content);
            while (fileMatcher.find()) {
                String fullPath = fileMatcher.group(1);
                String violationsBlock = fileMatcher.group(2);
                String relativePath = fullPath.replace(repoRoot.toString() + File.separator, "");

                Matcher vMatcher = violationPattern.matcher(violationsBlock);
                while (vMatcher.find()) {
                    int startLine = Integer.parseInt(vMatcher.group(1));
                    int endLine = Integer.parseInt(vMatcher.group(2));
                    int startCol = vMatcher.group(3) != null ? Integer.parseInt(vMatcher.group(3)) : 1;
                    int endCol = vMatcher.group(4) != null ? Integer.parseInt(vMatcher.group(4)) : 1;
                    String rule = vMatcher.group(5);
                    String ruleset = vMatcher.group(6);
                    int priority = Integer.parseInt(vMatcher.group(7));
                    String message = vMatcher.group(8).trim().replace("&apos;", "'").replace("&quot;", "\"");

                    IssueSeverity severity = switch (priority) {
                        case 1 -> IssueSeverity.CRITICAL;
                        case 2 -> IssueSeverity.HIGH;
                        case 3 -> IssueSeverity.MEDIUM;
                        default -> IssueSeverity.LOW;
                    };

                    String snippet = extractSnippet(fullPath, startLine, endLine);

                    AnalysisFinding finding = new AnalysisFinding(
                            AnalysisEngine.PMD,
                            "Java",
                            severity,
                            rule,
                            relativePath,
                            startLine,
                            endLine,
                            message,
                            snippet,
                            "PMD rule violation: " + rule + " (" + ruleset + "). Eliminating code smells improves maintainability and system resilience.",
                            "Refactor code to satisfy PMD rule: " + rule
                    );
                    finding.setStartColumn(startCol);
                    finding.setEndColumn(endCol);
                    findings.add(finding);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse PMD XML: {}", e.getMessage());
        }
    }

    private void scanJavaFile(Path filePath, Path repoRoot, List<AnalysisFinding> findings) {
        try {
            List<String> lines = Files.readAllLines(filePath);
            String relativePath = repoRoot.relativize(filePath).toString();

            for (int i = 0; i < lines.size(); i++) {
                String line = lines.get(i);
                int lineNum = i + 1;

                if (SYSTEM_OUT_PATTERN.matcher(line).find()) {
                    AnalysisFinding finding = new AnalysisFinding(
                            AnalysisEngine.PMD,
                            "Java",
                            IssueSeverity.LOW,
                            "SystemPrintln",
                            relativePath,
                            lineNum,
                            lineNum,
                            "System.out.println is used for logging. Use SLF4J / Logback logger instead.",
                            lineNum + ": " + line.trim(),
                            "Direct stdout/stderr printing bypasses logging levels, log aggregation, and structured log formatting in production.",
                            "Use a standard Logger instance: log.info(...) or log.warn(...)."
                    );
                    finding.setStartColumn(1);
                    finding.setEndColumn(line.length());
                    findings.add(finding);
                }

                if (EMPTY_CATCH_PATTERN.matcher(line).find()) {
                    AnalysisFinding finding = new AnalysisFinding(
                            AnalysisEngine.PMD,
                            "Java",
                            IssueSeverity.MEDIUM,
                            "EmptyCatchBlock",
                            relativePath,
                            lineNum,
                            lineNum,
                            "Avoid empty catch blocks which silently swallow exceptions.",
                            lineNum + ": " + line.trim(),
                            "Empty catch blocks obscure runtime errors, making debugging production incidents exceedingly difficult.",
                            "Log the caught exception or rethrow it as a domain-specific RuntimeException."
                    );
                    finding.setStartColumn(1);
                    finding.setEndColumn(line.length());
                    findings.add(finding);
                }
            }
        } catch (IOException e) {
            log.debug("Skipping unreadable file for PMD: {}", filePath);
        }
    }

    private String extractSnippet(String filePath, int startLine, int endLine) {
        try {
            Path p = Paths.get(filePath);
            if (!Files.exists(p)) return startLine + ": Code location";
            List<String> lines = Files.readAllLines(p);
            int start = Math.max(0, startLine - 1);
            int end = Math.min(lines.size(), Math.max(endLine, startLine + 1));
            StringBuilder sb = new StringBuilder();
            for (int i = start; i < end; i++) {
                sb.append(i + 1).append(": ").append(lines.get(i)).append("\n");
            }
            return sb.toString().trim();
        } catch (Exception ignored) {}
        return startLine + ": Source line";
    }
}
