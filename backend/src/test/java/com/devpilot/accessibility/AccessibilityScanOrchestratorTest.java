package com.devpilot.accessibility;

import com.devpilot.model.IssueCategory;
import com.devpilot.model.Repository;
import com.devpilot.model.RepositoryScan;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class AccessibilityScanOrchestratorTest {

    private AccessibilityScanOrchestrator orchestrator;

    @BeforeEach
    void setUp() {
        AxeCoreAccessibilityScanner scanner = new AxeCoreAccessibilityScanner();
        AccessibilityScoreCalculator calculator = new AccessibilityScoreCalculator();
        orchestrator = new AccessibilityScanOrchestrator(scanner, calculator);
    }

    @Test
    void testEndToEndAccessibilityScanExecution(@TempDir Path tempDir) throws IOException {
        Path frontendSrc = tempDir.resolve("frontend/src");
        Files.createDirectories(frontendSrc);
        Files.writeString(frontendSrc.resolve("Button.tsx"), "<button><Sun /></button>");

        Repository repo = new Repository();
        RepositoryScan scan = new RepositoryScan(repo, "main", "HEAD");

        AccessibilityScanOrchestrator.AccessibilityScanResult result =
                orchestrator.executeAccessibilityScan(scan, tempDir, "http://invalid-domain.local");

        assertNotNull(result);
        assertNotNull(result.getIssues());
        assertFalse(result.getIssues().isEmpty());
        assertTrue(result.getIssues().stream().allMatch(i -> i.getCategory() == IssueCategory.ACCESSIBILITY));
        assertEquals(1, result.getEngineReports().size());
        assertEquals("AxeCore", result.getEngineReports().get(0).getEngine());

        assertNotNull(result.getMetrics());
        assertTrue(result.getMetrics().getAccessibilityScore() <= 100);
        assertNotNull(result.getMetrics().getWcagLevel());
        assertNotNull(result.getMetrics().getGrade());
    }
}
