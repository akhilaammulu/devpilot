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

class SpotBugsAnalyzerTest {

    private SpotBugsAnalyzer analyzer;

    @BeforeEach
    void setUp() {
        analyzer = new SpotBugsAnalyzer();
    }

    @Test
    @DisplayName("Should report SPOTBUGS engine")
    void shouldReportSpotBugsEngine() {
        assertEquals(AnalysisEngine.SPOTBUGS, analyzer.getEngine());
    }

    @Test
    @DisplayName("Should detect possible null pointer dereference after orElse(null)")
    void shouldDetectNullDereference(@TempDir Path tempDir) throws IOException {
        Path javaFile = tempDir.resolve("NpeSmell.java");
        String content = """
                package com.example;
                import java.util.Optional;
                
                public class NpeSmell {
                    public String getVal(Optional<String> opt) {
                        String s = opt.orElse(null);
                        return s.toLowerCase();
                    }
                }
                """;
        Files.writeString(javaFile, content);

        List<AnalysisFinding> findings = analyzer.analyze(tempDir, "main");

        assertFalse(findings.isEmpty());
        boolean hasNpe = findings.stream()
                .anyMatch(f -> "NP_NULL_ON_SOME_PATH".equals(f.getRuleId()) && f.getSeverity() == IssueSeverity.CRITICAL);
        assertTrue(hasNpe, "SpotBugs NP_NULL_ON_SOME_PATH critical finding should be identified");
    }

    @Test
    @DisplayName("Should return default baseline findings on null repo path")
    void shouldReturnDefaultBaseline() {
        List<AnalysisFinding> findings = analyzer.analyze(null, "main");
        assertNotNull(findings);
        assertFalse(findings.isEmpty());
        assertTrue(findings.stream().anyMatch(f -> "NP_NULL_ON_SOME_PATH".equals(f.getRuleId())));
    }
}
