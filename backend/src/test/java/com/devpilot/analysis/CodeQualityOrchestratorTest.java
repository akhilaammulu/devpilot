package com.devpilot.analysis;

import com.devpilot.model.IssueCategory;
import com.devpilot.model.RepositoryScan;
import com.devpilot.model.ScanStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CodeQualityOrchestratorTest {

    private CodeQualityOrchestrator orchestrator;

    @BeforeEach
    void setUp() {
        CheckstyleAnalyzer checkstyle = new CheckstyleAnalyzer();
        PmdAnalyzer pmd = new PmdAnalyzer();
        SpotBugsAnalyzer spotBugs = new SpotBugsAnalyzer();
        EsLintAnalyzer esLint = new EsLintAnalyzer();

        QualityScoreCalculator calculator = new QualityScoreCalculator();
        orchestrator = new CodeQualityOrchestrator(List.of(checkstyle, pmd, spotBugs, esLint), calculator);
    }

    @Test
    @DisplayName("Should detect project types correctly")
    void shouldDetectProjectTypes(@TempDir Path tempDir) throws IOException {
        assertEquals(CodeQualityOrchestrator.ProjectType.EMPTY, orchestrator.detectProjectType(tempDir));

        Files.writeString(tempDir.resolve("Test.java"), "public class Test {}");
        assertEquals(CodeQualityOrchestrator.ProjectType.JAVA_ONLY, orchestrator.detectProjectType(tempDir));

        Files.writeString(tempDir.resolve("App.tsx"), "export default function App() { return null; }");
        assertEquals(CodeQualityOrchestrator.ProjectType.POLYGLOT, orchestrator.detectProjectType(tempDir));
    }

    @Test
    @DisplayName("Should orchestrate all 4 engines and produce normalized findings, reports and scores")
    void shouldOrchestrateAllEngines(@TempDir Path tempDir) throws IOException {
        // Create sample Java and TS files
        Path javaFile = tempDir.resolve("Service.java");
        Files.writeString(javaFile, """
                package com.example;
                import java.util.*;
                
                public class Service {
                    public void run() {
                        System.out.println("hello");
                    }
                }
                """);

        Path tsFile = tempDir.resolve("api.ts");
        Files.writeString(tsFile, "export const data: any = {};");

        RepositoryScan scan = new RepositoryScan();

        CodeQualityOrchestrator.QualityScanResult result = orchestrator.executeQualityScan(scan, tempDir, "main");

        assertNotNull(result);
        assertNotNull(result.getIssues());
        assertFalse(result.getIssues().isEmpty());
        assertNotNull(result.getEngineReports());
        assertEquals(4, result.getEngineReports().size());

        // Verify scan entity was enriched
        assertEquals(ScanStatus.COMPLETED, scan.getStatus());
        assertNotNull(scan.getCompletedAt());
        assertNotNull(scan.getQualityScore());
        assertTrue(scan.getQualityScore() > 0 && scan.getQualityScore() <= 100);

        // Verify issues are normalized with line and column numbers
        result.getIssues().forEach(issue -> {
            assertEquals(IssueCategory.CODE_QUALITY, issue.getCategory());
            assertEquals("OPEN", issue.getStatus());
            assertNotNull(issue.getMessage());
            assertNotNull(issue.getEngine());
            assertNotNull(issue.getRuleId());
            assertNotNull(issue.getStartLine());
            assertNotNull(issue.getStartColumn());
            assertNotNull(issue.getAiExplanation());
            assertNotNull(issue.getAiFixSuggestion());
        });
    }
}
