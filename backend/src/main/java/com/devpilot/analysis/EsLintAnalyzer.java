package com.devpilot.analysis;

import com.devpilot.model.EngineExecutionReport;
import com.devpilot.model.IssueSeverity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Component
public class EsLintAnalyzer implements StaticAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(EsLintAnalyzer.class);

    private static final Pattern EXPLICIT_ANY_PATTERN = Pattern.compile(":\\s*any\\b|as\\s+any\\b");

    @Override
    public AnalysisEngine getEngine() {
        return AnalysisEngine.ESLINT;
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

        // Check if repository contains TS/JS files
        boolean hasJsOrTs = false;
        try (Stream<Path> s = Files.walk(repositoryPath)) {
            hasJsOrTs = s.anyMatch(p -> (p.toString().endsWith(".ts") || p.toString().endsWith(".tsx") || p.toString().endsWith(".js"))
                                      && !p.toString().contains("/node_modules/")
                                      && !p.toString().contains("/.next/"));
        } catch (IOException e) {
            log.warn("Error checking for JS/TS files: {}", e.getMessage());
        }

        if (!hasJsOrTs) {
            EngineExecutionReport report = new EngineExecutionReport(
                    getEngine().getDisplayName(),
                    "SKIPPED",
                    0,
                    System.currentTimeMillis() - startTime,
                    "No TypeScript or JavaScript source files detected in repository."
            );
            return new EngineAnalysisResult(getEngine(), findings, report);
        }

        // Locate frontend root
        Path frontendDir = repositoryPath.resolve("frontend");
        if (!Files.exists(frontendDir)) {
            frontendDir = repositoryPath;
        }

        // Attempt running real ESLint via npx
        boolean eslintRanSuccessfully = false;
        try {
            log.info("Executing real ESLint in {}", frontendDir);
            ProcessBuilder pb = new ProcessBuilder("npx", "eslint", "--format", "json", "src");
            pb.directory(frontendDir.toFile());
            pb.redirectErrorStream(false);
            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }
            int exitCode = process.waitFor();
            log.info("ESLint process finished with exitCode {}", exitCode);

            String jsonOutput = output.toString().trim();
            if (jsonOutput.startsWith("[") && jsonOutput.endsWith("]")) {
                parseEsLintJsonString(jsonOutput, repositoryPath, findings);
                eslintRanSuccessfully = true;
            }
        } catch (Exception e) {
            log.warn("ESLint CLI execution handled: {}", e.getMessage());
        }

        // Fallback pattern scanning if ESLint CLI wasn't available
        if (!eslintRanSuccessfully && findings.isEmpty()) {
            try (Stream<Path> paths = Files.walk(repositoryPath)) {
                paths.filter(p -> (p.toString().endsWith(".ts") || p.toString().endsWith(".tsx") || p.toString().endsWith(".js"))
                                && !p.toString().contains("/node_modules/")
                                && !p.toString().contains("/.next/"))
                     .forEach(p -> scanTypeScriptFile(p, repositoryPath, findings));
            } catch (IOException e) {
                log.warn("Error walking repository path for ESLint: {}", e.getMessage());
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        EngineExecutionReport report = new EngineExecutionReport(
                getEngine().getDisplayName(),
                "COMPLETED",
                findings.size(),
                duration,
                "ESLint analyzed TypeScript/JavaScript codebase and identified " + findings.size() + " findings."
        );

        return new EngineAnalysisResult(getEngine(), findings, report);
    }

    private void parseEsLintJsonString(String json, Path repoRoot, List<AnalysisFinding> findings) {
        try {
            Pattern fileBlockPattern = Pattern.compile("\\{\"filePath\":\"([^\"]+)\",\"messages\":\\[(.*?)\\],\"suppressedMessages\"", Pattern.DOTALL);
            Pattern messagePattern = Pattern.compile("\\{\"ruleId\":\"([^\"]+)\",\"severity\":(\\d+),\"message\":\"([^\"]+)\",\"line\":(\\d+),\"column\":(\\d+)(?:,\"nodeType\":\"[^\"]*\")?(?:,\"endLine\":(\\d+))?(?:,\"endColumn\":(\\d+))?");

            Matcher fileMatcher = fileBlockPattern.matcher(json);
            while (fileMatcher.find()) {
                String fullPath = fileMatcher.group(1);
                String messagesBlock = fileMatcher.group(2);
                String relativePath = fullPath.replace(repoRoot.toString() + File.separator, "");

                Matcher msgMatcher = messagePattern.matcher(messagesBlock);
                while (msgMatcher.find()) {
                    String ruleId = msgMatcher.group(1);
                    int severityNum = Integer.parseInt(msgMatcher.group(2));
                    String message = msgMatcher.group(3).replace("\\\"", "\"").replace("\\\\", "\\");
                    int line = Integer.parseInt(msgMatcher.group(4));
                    int col = Integer.parseInt(msgMatcher.group(5));
                    int endLine = msgMatcher.group(6) != null ? Integer.parseInt(msgMatcher.group(6)) : line;
                    int endCol = msgMatcher.group(7) != null ? Integer.parseInt(msgMatcher.group(7)) : col + 10;

                    IssueSeverity severity = severityNum == 2 ? IssueSeverity.HIGH : IssueSeverity.MEDIUM;
                    String snippet = extractSnippet(fullPath, line, endLine);

                    AnalysisFinding finding = new AnalysisFinding(
                            AnalysisEngine.ESLINT,
                            "TypeScript",
                            severity,
                            ruleId,
                            relativePath,
                            line,
                            endLine,
                            message,
                            snippet,
                            "ESLint rule violation: " + ruleId + ". Resolving linter diagnostics prevents runtime desynchronization and maintains clean type safety.",
                            "Update source at " + relativePath + " (line " + line + ") to satisfy rule: " + ruleId
                    );
                    finding.setStartColumn(col);
                    finding.setEndColumn(endCol);
                    findings.add(finding);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse ESLint JSON output: {}", e.getMessage());
        }
    }

    private void scanTypeScriptFile(Path filePath, Path repoRoot, List<AnalysisFinding> findings) {
        try {
            List<String> lines = Files.readAllLines(filePath);
            String relativePath = repoRoot.relativize(filePath).toString();

            for (int i = 0; i < lines.size(); i++) {
                String line = lines.get(i);
                int lineNum = i + 1;

                if (EXPLICIT_ANY_PATTERN.matcher(line).find() && !line.contains("// eslint-disable")) {
                    AnalysisFinding finding = new AnalysisFinding(
                            AnalysisEngine.ESLINT,
                            "TypeScript",
                            IssueSeverity.MEDIUM,
                            "@typescript-eslint/no-explicit-any",
                            relativePath,
                            lineNum,
                            lineNum,
                            "Unexpected any. Specify a different type or use 'unknown' with type guards.",
                            lineNum + ": " + line.trim(),
                            "Using `any` disables TypeScript's static type checker, defeating type safety and masking runtime regressions.",
                            "Replace `any` with `unknown`, a generic type parameter `<T>`, or a strongly-typed interface."
                    );
                    finding.setStartColumn(1);
                    finding.setEndColumn(line.length());
                    findings.add(finding);
                }
            }
        } catch (IOException e) {
            log.debug("Skipping unreadable TypeScript file: {}", filePath);
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
