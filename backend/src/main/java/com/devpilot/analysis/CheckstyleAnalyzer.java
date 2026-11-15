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
public class CheckstyleAnalyzer implements StaticAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(CheckstyleAnalyzer.class);

    private static final Pattern STAR_IMPORT_PATTERN = Pattern.compile("^\\s*import\\s+[a-zA-Z0-9_.]+\\.\\*;");
    private static final Pattern CONSTANT_PATTERN = Pattern.compile("public\\s+static\\s+final\\s+[a-zA-Z0-9_<>\\[\\]]+\\s+([a-zA-Z0-9_]+)\\s*=");

    @Override
    public AnalysisEngine getEngine() {
        return AnalysisEngine.CHECKSTYLE;
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

        // Check if a pre-generated or Maven checkstyle-result.xml exists
        Path xmlReport = repositoryPath.resolve("backend/target/checkstyle-result.xml");
        if (!Files.exists(xmlReport)) {
            xmlReport = repositoryPath.resolve("target/checkstyle-result.xml");
        }

        // If not found, attempt invoking maven checkstyle plugin
        if (!Files.exists(xmlReport)) {
            Path pomPath = repositoryPath.resolve("backend/pom.xml");
            if (!Files.exists(pomPath)) {
                pomPath = repositoryPath.resolve("pom.xml");
            }
            if (Files.exists(pomPath)) {
                try {
                    log.info("Executing Maven Checkstyle on {}", pomPath);
                    ProcessBuilder pb = new ProcessBuilder("mvn", "-f", pomPath.toString(), "checkstyle:checkstyle", "-DskipTests");
                    pb.redirectOutput(ProcessBuilder.Redirect.DISCARD);
                    pb.redirectError(ProcessBuilder.Redirect.DISCARD);
                    Process process = pb.start();
                    boolean completed = process.waitFor(15, java.util.concurrent.TimeUnit.SECONDS);
                    if (!completed) {
                        process.destroyForcibly();
                    }
                } catch (Exception e) {
                    log.warn("Direct mvn checkstyle invocation encountered issue: {}", e.getMessage());
                }
            }
        }

        if (Files.exists(xmlReport)) {
            parseCheckstyleXml(xmlReport, repositoryPath, findings);
        }

        // Direct source inspection fallback if XML parsing yielded no issues or XML was absent
        if (findings.isEmpty()) {
            try (Stream<Path> paths = Files.walk(repositoryPath)) {
                paths.filter(p -> p.toString().endsWith(".java") && !p.toString().contains("/target/"))
                     .forEach(p -> scanJavaFile(p, repositoryPath, findings));
            } catch (IOException e) {
                log.warn("Error walking repository path for Checkstyle: {}", e.getMessage());
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        EngineExecutionReport report = new EngineExecutionReport(
                getEngine().getDisplayName(),
                "COMPLETED",
                findings.size(),
                duration,
                "Checkstyle analyzed Java sources and identified " + findings.size() + " findings."
        );

        return new EngineAnalysisResult(getEngine(), findings, report);
    }

    private void parseCheckstyleXml(Path xmlPath, Path repoRoot, List<AnalysisFinding> findings) {
        try {
            String content = Files.readString(xmlPath);
            Pattern fileBlockPattern = Pattern.compile("<file\\s+name=\"([^\"]+)\">(.*?)</file>", Pattern.DOTALL);
            Pattern errorPattern = Pattern.compile("<error\\s+line=\"(\\d+)\"\\s+(?:column=\"(\\d+)\"\\s+)?severity=\"([^\"]+)\"\\s+message=\"([^\"]+)\"\\s+source=\"([^\"]+)\"");

            Matcher fileMatcher = fileBlockPattern.matcher(content);
            while (fileMatcher.find()) {
                String fullPath = fileMatcher.group(1);
                String errorsBlock = fileMatcher.group(2);
                String relativePath = fullPath.replace(repoRoot.toString() + File.separator, "");

                Matcher errMatcher = errorPattern.matcher(errorsBlock);
                while (errMatcher.find()) {
                    int line = Integer.parseInt(errMatcher.group(1));
                    int col = errMatcher.group(2) != null ? Integer.parseInt(errMatcher.group(2)) : 1;
                    String sev = errMatcher.group(3).toLowerCase();
                    String msg = errMatcher.group(4).replace("&apos;", "'").replace("&quot;", "\"").replace("&lt;", "<").replace("&gt;", ">");
                    String source = errMatcher.group(5);
                    String ruleName = source.substring(source.lastIndexOf('.') + 1).replace("Check", "");

                    IssueSeverity severity = IssueSeverity.LOW;
                    if ("error".equals(sev)) {
                        severity = IssueSeverity.HIGH;
                    } else if ("warning".equals(sev)) {
                        // Style rule warnings (indentation, javadoc, imports) are LOW severity
                        severity = IssueSeverity.LOW;
                    }

                    String snippet = extractSnippet(fullPath, line);

                    AnalysisFinding finding = new AnalysisFinding(
                            AnalysisEngine.CHECKSTYLE,
                            "Java",
                            severity,
                            ruleName,
                            relativePath,
                            line,
                            line,
                            msg,
                            snippet,
                            "Checkstyle rule violation: " + ruleName + ". Adherence to coding conventions ensures consistent code aesthetics and reduces cognitive load.",
                            "Update source formatting around line " + line + " to conform with style guidelines."
                    );
                    finding.setStartColumn(col);
                    finding.setEndColumn(col + 10);
                    findings.add(finding);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse checkstyle xml: {}", e.getMessage());
        }
    }

    private void scanJavaFile(Path filePath, Path repoRoot, List<AnalysisFinding> findings) {
        try {
            List<String> lines = Files.readAllLines(filePath);
            String relativePath = repoRoot.relativize(filePath).toString();

            for (int i = 0; i < lines.size(); i++) {
                String line = lines.get(i);
                int lineNum = i + 1;

                if (STAR_IMPORT_PATTERN.matcher(line).find()) {
                    AnalysisFinding finding = new AnalysisFinding(
                            AnalysisEngine.CHECKSTYLE,
                            "Java",
                            IssueSeverity.LOW,
                            "AvoidStarImport",
                            relativePath,
                            lineNum,
                            lineNum,
                            "Using the '.*' form of import should be avoided - " + line.trim().replace("import ", "").replace(";", ""),
                            lineNum + ": " + line.trim(),
                            "Wildcard imports pollute the package namespace and make class origin ambiguous, causing potential symbol collisions.",
                            "Replace wildcard import with explicit individual class imports."
                    );
                    finding.setStartColumn(1);
                    finding.setEndColumn(line.length());
                    findings.add(finding);
                }

                Matcher constMatcher = CONSTANT_PATTERN.matcher(line);
                if (constMatcher.find()) {
                    String constName = constMatcher.group(1);
                    if (!constName.matches("^[A-Z][A-Z0-9_]*$")) {
                        AnalysisFinding finding = new AnalysisFinding(
                                AnalysisEngine.CHECKSTYLE,
                                "Java",
                                IssueSeverity.LOW,
                                "ConstantName",
                                relativePath,
                                lineNum,
                                lineNum,
                                "Name '" + constName + "' must match pattern '^[A-Z][A-Z0-9_]*$'.",
                                lineNum + ": " + line.trim(),
                                "Constants in Java should be defined in uppercase snake_case to follow standard naming conventions.",
                                "Rename constant to " + constName.toUpperCase() + "."
                        );
                        finding.setStartColumn(constMatcher.start(1) + 1);
                        finding.setEndColumn(constMatcher.end(1) + 1);
                        findings.add(finding);
                    }
                }
            }
        } catch (IOException e) {
            log.debug("Skipping unreadable file: {}", filePath);
        }
    }

    private String extractSnippet(String filePath, int lineNum) {
        try {
            Path p = Paths.get(filePath);
            if (!Files.exists(p)) return lineNum + ": Code location";
            List<String> lines = Files.readAllLines(p);
            if (lineNum > 0 && lineNum <= lines.size()) {
                int start = Math.max(0, lineNum - 2);
                int end = Math.min(lines.size(), lineNum + 2);
                StringBuilder sb = new StringBuilder();
                for (int i = start; i < end; i++) {
                    sb.append(i + 1).append(": ").append(lines.get(i)).append("\n");
                }
                return sb.toString().trim();
            }
        } catch (Exception ignored) {}
        return lineNum + ": Source line";
    }
}
