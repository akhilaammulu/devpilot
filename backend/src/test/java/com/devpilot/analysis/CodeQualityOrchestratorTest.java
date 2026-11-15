package com.devpilot.analysis;

import com.devpilot.model.IssueCategory;
import com.devpilot.model.RepositoryScan;
import com.devpilot.model.ScanStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

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
    @DisplayName("Should orchestrate all 4 engines and produce normalized findings and scores")
    void shouldOrchestrateAllEngines() {
        RepositoryScan scan = new RepositoryScan();

        CodeQualityOrchestrator.QualityScanResult result = orchestrator.executeQualityScan(scan, null, "main");

        assertNotNull(result);
        assertNotNull(result.getIssues());
        assertFalse(result.getIssues().isEmpty());

        // Verify engines represented in findings
        boolean hasSpotBugs = result.getIssues().stream().anyMatch(i -> "SpotBugs".equalsIgnoreCase(i.getEngine()));
        boolean hasPmd = result.getIssues().stream().anyMatch(i -> "PMD".equalsIgnoreCase(i.getEngine()));
        boolean hasCheckstyle = result.getIssues().stream().anyMatch(i -> "Checkstyle".equalsIgnoreCase(i.getEngine()));
        boolean hasEsLint = result.getIssues().stream().anyMatch(i -> "ESLint".equalsIgnoreCase(i.getEngine()));

        assertTrue(hasSpotBugs, "SpotBugs engine should have produced findings");
        assertTrue(hasPmd, "PMD engine should have produced findings");
        assertTrue(hasCheckstyle, "Checkstyle engine should have produced findings");
        assertTrue(hasEsLint, "ESLint engine should have produced findings");

        // Verify scan entity was enriched
        assertEquals(ScanStatus.COMPLETED, scan.getStatus());
        assertNotNull(scan.getCompletedAt());
        assertNotNull(scan.getQualityScore());
        assertTrue(scan.getQualityScore() > 0 && scan.getQualityScore() <= 100);

        // Verify all issues are categorized as CODE_QUALITY and OPEN
        result.getIssues().forEach(issue -> {
            assertEquals(IssueCategory.CODE_QUALITY, issue.getCategory());
            assertEquals("OPEN", issue.getStatus());
            assertNotNull(issue.getMessage());
            assertNotNull(issue.getAiExplanation());
            assertNotNull(issue.getAiFixSuggestion());
        });
    }
}
