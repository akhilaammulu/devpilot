package com.devpilot.analysis;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PmdAnalyzerTest {

    private PmdAnalyzer analyzer;

    @BeforeEach
    void setUp() {
        analyzer = new PmdAnalyzer();
    }

    @Test
    @DisplayName("Should report PMD engine")
    void shouldReportPmdEngine() {
        assertEquals(AnalysisEngine.PMD, analyzer.getEngine());
    }

    @Test
    @DisplayName("Should detect System.out.println in Java source file")
    void shouldDetectSystemOut(@TempDir Path tempDir) throws IOException {
        Path javaFile = tempDir.resolve("LoggerSmell.java");
        String content = """
                package com.example;
                public class LoggerSmell {
                    public void run() {
                        System.out.println("Processing event");
                    }
                }
                """;
        Files.writeString(javaFile, content);

        EngineAnalysisResult result = analyzer.analyze(tempDir, "main");
        List<AnalysisFinding> findings = result.getFindings();

        assertEquals("COMPLETED", result.getReport().getStatus());
        assertFalse(findings.isEmpty());
        boolean hasPrintln = findings.stream().anyMatch(f -> "SystemPrintln".equals(f.getRuleId()));
        assertTrue(hasPrintln, "SystemPrintln code smell should be flagged");
    }

    @Test
    @DisplayName("Should return UNAVAILABLE status on null repo path")
    void shouldReturnUnavailableOnNull() {
        EngineAnalysisResult result = analyzer.analyze(null, "main");
        assertNotNull(result);
        assertEquals("UNAVAILABLE", result.getReport().getStatus());
    }
}
