package com.devpilot.analysis;

import com.devpilot.model.IssueSeverity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class EsLintAnalyzerTest {

    private EsLintAnalyzer analyzer;

    @BeforeEach
    void setUp() {
        analyzer = new EsLintAnalyzer();
    }

    @Test
    @DisplayName("Should report ESLINT engine")
    void shouldReportEsLintEngine() {
        assertEquals(AnalysisEngine.ESLINT, analyzer.getEngine());
    }

    @Test
    @DisplayName("Should detect explicit any in TypeScript files")
    void shouldDetectExplicitAny(@TempDir Path tempDir) throws IOException {
        Path tsFile = tempDir.resolve("api.ts");
        String content = """
                export function process(input: any): any {
                    return input;
                }
                """;
        Files.writeString(tsFile, content);

        List<AnalysisFinding> findings = analyzer.analyze(tempDir, "main");

        assertFalse(findings.isEmpty());
        boolean hasAny = findings.stream()
                .anyMatch(f -> "@typescript-eslint/no-explicit-any".equals(f.getRuleId()) && f.getSeverity() == IssueSeverity.MEDIUM);
        assertTrue(hasAny, "ESLint @typescript-eslint/no-explicit-any should be detected");
    }

    @Test
    @DisplayName("Should return default baseline findings on null repo path")
    void shouldReturnDefaultBaseline() {
        List<AnalysisFinding> findings = analyzer.analyze(null, "main");
        assertNotNull(findings);
        assertFalse(findings.isEmpty());
        assertTrue(findings.stream().anyMatch(f -> "react-hooks/exhaustive-deps".equals(f.getRuleId())));
    }
}
