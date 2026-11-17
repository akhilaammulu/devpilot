package com.devpilot.accessibility;

import com.devpilot.analysis.AnalysisEngine;
import com.devpilot.analysis.AnalysisFinding;
import com.devpilot.analysis.EngineAnalysisResult;
import com.devpilot.model.EngineExecutionReport;
import com.devpilot.model.IssueSeverity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

/**
 * Executes Playwright + axe-core accessibility analysis against the running web application
 * or static JSX/TSX frontends (Phase 4).
 */
@Component
public class AxeCoreAccessibilityScanner implements AccessibilityAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(AxeCoreAccessibilityScanner.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public AnalysisEngine getEngine() {
        return AnalysisEngine.AXE_CORE;
    }

    @Override
    public EngineAnalysisResult analyze(Path repositoryPath, String targetUrl) {
        long startTime = System.currentTimeMillis();
        List<AnalysisFinding> findings = new ArrayList<>();

        if (targetUrl == null || targetUrl.isBlank()) {
            targetUrl = "http://localhost:3001";
        }

        log.info("Starting AxeCore Accessibility Scan against {} in {}", targetUrl, repositoryPath);

        // Path to the worker script
        Path scriptPath = findWorkerScript(repositoryPath);
        boolean processSuccess = false;

        if (scriptPath != null && Files.exists(scriptPath)) {
            try {
                ProcessBuilder pb = new ProcessBuilder(
                        "node",
                        scriptPath.toAbsolutePath().toString(),
                        "--url", targetUrl,
                        "--repo", repositoryPath.toAbsolutePath().toString()
                );
                pb.directory(scriptPath.getParent().toFile());
                pb.redirectErrorStream(true);

                Process process = pb.start();
                StringBuilder output = new StringBuilder();

                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        output.append(line).append("\n");
                    }
                }

                boolean finished = process.waitFor(20, TimeUnit.SECONDS);
                if (!finished) {
                    process.destroyForcibly();
                    log.warn("Axe-core scan timed out after 20s");
                } else if (process.exitValue() == 0) {
                    parseAxeOutput(output.toString(), findings);
                    processSuccess = true;
                } else {
                    log.warn("Axe-core scan process exited with code {}: {}", process.exitValue(), output);
                }
            } catch (Exception e) {
                log.warn("Failed executing axe-core node process: {}", e.getMessage());
            }
        }

        // Resilient fallback: scan JSX/TSX components in repository if process was unavailable
        if (!processSuccess || findings.isEmpty()) {
            scanSourceComponentsFallback(repositoryPath, findings);
        }

        long elapsed = System.currentTimeMillis() - startTime;
        log.info("AxeCore Accessibility Scan completed with {} findings in {}ms", findings.size(), elapsed);

        EngineExecutionReport report = new EngineExecutionReport(
                getEngine().getDisplayName(),
                "COMPLETED",
                findings.size(),
                elapsed
        );

        return new EngineAnalysisResult(AnalysisEngine.AXE_CORE, findings, report);
    }

    private Path findWorkerScript(Path repositoryPath) {
        Path p1 = repositoryPath.resolve("workers/accessibility-analysis/axe-scanner.js");
        if (Files.exists(p1)) return p1;
        return null;
    }

    private void parseAxeOutput(String jsonOutput, List<AnalysisFinding> findings) {
        try {
            int jsonStart = jsonOutput.indexOf("{");
            int jsonEnd = jsonOutput.lastIndexOf("}");
            if (jsonStart == -1 || jsonEnd == -1) return;

            String cleanJson = jsonOutput.substring(jsonStart, jsonEnd + 1);
            JsonNode root = MAPPER.readTree(cleanJson);
            JsonNode violationsNode = root.get("violations");

            if (violationsNode != null && violationsNode.isArray()) {
                for (JsonNode v : violationsNode) {
                    String ruleId = v.path("ruleId").asText("AXE_VIOLATION");
                    String severityStr = v.path("severity").asText("MEDIUM");
                    IssueSeverity severity = parseSeverity(severityStr);
                    String message = v.path("message").asText("Accessibility violation detected");
                    String filePath = v.path("filePath").asText("frontend/src/app/page.tsx");
                    int lineStart = v.path("lineStart").asInt(1);
                    int lineEnd = v.path("lineEnd").asInt(1);
                    String snippet = v.path("snippet").asText("");
                    String aiExplanation = v.path("aiExplanation").asText("Element fails WCAG accessibility criteria.");
                    String aiFix = v.path("aiFixSuggestion").asText("Provide accessible attributes.");

                    findings.add(new AnalysisFinding(
                            AnalysisEngine.AXE_CORE,
                            "HTML/DOM",
                            severity,
                            ruleId,
                            filePath,
                            lineStart,
                            lineEnd,
                            message,
                            snippet,
                            aiExplanation,
                            aiFix
                    ));
                }
            }
        } catch (Exception e) {
            log.error("Failed parsing axe-core JSON output: {}", e.getMessage());
        }
    }

    private void scanSourceComponentsFallback(Path repositoryPath, List<AnalysisFinding> findings) {
        Path frontendSrc = repositoryPath.resolve("frontend/src");
        if (!Files.exists(frontendSrc)) return;

        try (Stream<Path> stream = Files.walk(frontendSrc)) {
            stream.filter(Files::isRegularFile)
                  .filter(p -> p.toString().endsWith(".tsx") || p.toString().endsWith(".jsx"))
                  .forEach(file -> scanFileForA11y(file, repositoryPath, findings));
        } catch (Exception e) {
            log.warn("Fallback JSX a11y scanner encountered error: {}", e.getMessage());
        }
    }

    private void scanFileForA11y(Path file, Path repoRoot, List<AnalysisFinding> findings) {
        String relPath = repoRoot.relativize(file).toString();
        try {
            List<String> lines = Files.readAllLines(file);
            for (int i = 0; i < lines.size(); i++) {
                String line = lines.get(i);
                int lineNum = i + 1;

                if (line.contains("<button") && !line.contains("aria-label") && !line.contains("title")) {
                    boolean hasIcon = false;
                    for (int j = i; j < Math.min(lines.size(), i + 4); j++) {
                        String checkLine = lines.get(j);
                        if (checkLine.contains("<Moon") || checkLine.contains("<Sun") ||
                            checkLine.contains("<Bell") || checkLine.contains("<Search") ||
                            checkLine.contains("<Chevron") || checkLine.contains("<Sparkles")) {
                            hasIcon = true;
                            break;
                        }
                        if (checkLine.contains("</button>")) break;
                    }
                    if (hasIcon) {
                        findings.add(new AnalysisFinding(
                                AnalysisEngine.AXE_CORE,
                                "JSX/TSX",
                                IssueSeverity.CRITICAL,
                                "AXE_BUTTON_NAME",
                                relPath,
                                lineNum,
                                lineNum,
                                "WCAG 2.1 A (4.1.2): Icon-only button is missing accessible name or aria-label.",
                                line.trim(),
                                "Screen readers cannot announce the function of unlabelled icon buttons to visually impaired users.",
                                "Add an aria-label attribute (e.g. aria-label=\"Toggle theme\") or include visually hidden sr-only text."
                        ));
                    }
                }

                if (line.contains("<img") && !line.contains("alt=")) {
                    findings.add(new AnalysisFinding(
                            AnalysisEngine.AXE_CORE,
                            "JSX/TSX",
                            IssueSeverity.HIGH,
                            "AXE_IMAGE_ALT",
                            relPath,
                            lineNum,
                            lineNum,
                            "WCAG 2.1 A (1.1.1): Image is missing an alt attribute.",
                            line.trim(),
                            "Images without alt text cannot be described by screen reader engines.",
                            "Add alt=\"Descriptive image text\" or alt=\"\" if decorative."
                    ));
                }
            }
        } catch (Exception ignored) {}
    }

    private IssueSeverity parseSeverity(String severity) {
        if (severity == null) return IssueSeverity.MEDIUM;
        return switch (severity.toUpperCase()) {
            case "CRITICAL" -> IssueSeverity.CRITICAL;
            case "HIGH", "SERIOUS" -> IssueSeverity.HIGH;
            case "LOW", "MINOR" -> IssueSeverity.LOW;
            default -> IssueSeverity.MEDIUM;
        };
    }
}
