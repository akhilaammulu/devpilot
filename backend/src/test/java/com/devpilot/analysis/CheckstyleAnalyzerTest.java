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

class CheckstyleAnalyzerTest {

    private CheckstyleAnalyzer analyzer;

    @BeforeEach
    void setUp() {
        analyzer = new CheckstyleAnalyzer();
    }

    @Test
    @DisplayName("Should report CHECKSTYLE engine")
    void shouldReportCheckstyleEngine() {
        assertEquals(AnalysisEngine.CHECKSTYLE, analyzer.getEngine());
    }

    @Test
    @DisplayName("Should detect star import violations in Java source file")
    void shouldDetectStarImports(@TempDir Path tempDir) throws IOException {
        Path javaFile = tempDir.resolve("Example.java");
        String content = """
                package com.example;
                import java.util.*;
                
                public class Example {
                    public static final String valid_constant = "test";
                }
                """;
        Files.writeString(javaFile, content);

        EngineAnalysisResult result = analyzer.analyze(tempDir, "main");
        List<AnalysisFinding> findings = result.getFindings();

        assertEquals("COMPLETED", result.getReport().getStatus());
        assertFalse(findings.isEmpty());
        boolean hasStarImport = findings.stream()
                .anyMatch(f -> "AvoidStarImport".equals(f.getRuleId()) && f.getSeverity() == IssueSeverity.LOW);
        assertTrue(hasStarImport, "AvoidStarImport finding should be present");
    }

    @Test
    @DisplayName("Should return UNAVAILABLE status when directory is null")
    void shouldReturnUnavailableOnNullDir() {
        EngineAnalysisResult result = analyzer.analyze(null, "main");

        assertNotNull(result);
        assertEquals("UNAVAILABLE", result.getReport().getStatus());
    }
}
