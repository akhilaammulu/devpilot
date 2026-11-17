package com.devpilot.security;

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

class SecurityScanOrchestratorTest {

    private SecurityScanOrchestrator orchestrator;

    @BeforeEach
    void setUp() {
        DependencyVulnerabilityScanner depScanner = new DependencyVulnerabilityScanner();
        SecretDetectionScanner secScanner = new SecretDetectionScanner();
        UnsafeConfigurationScanner cfgScanner = new UnsafeConfigurationScanner();
        SecurityScoreCalculator scoreCalculator = new SecurityScoreCalculator();

        orchestrator = new SecurityScanOrchestrator(depScanner, secScanner, cfgScanner, scoreCalculator);
    }

    @Test
    void testEndToEndSecurityScanExecution(@TempDir Path tempDir) throws IOException {
        // Create sample security issues
        Path src = tempDir.resolve("src");
        Files.createDirectories(src);
        Files.writeString(src.resolve("ApiKey.java"), "String key = \"AKIA1234567890ABCDEF\";");

        Repository repo = new Repository();
        RepositoryScan scan = new RepositoryScan(repo, "main", "HEAD");

        SecurityScanOrchestrator.SecurityScanResult result = orchestrator.executeSecurityScan(scan, tempDir, "main");

        assertNotNull(result);
        assertNotNull(result.getIssues());
        assertFalse(result.getIssues().isEmpty());

        // Verify all mapped issues belong to SECURITY category
        assertTrue(result.getIssues().stream().allMatch(i -> i.getCategory() == IssueCategory.SECURITY));
        assertEquals(3, result.getEngineReports().size());
        assertNotNull(result.getMetrics());
        assertTrue(result.getMetrics().getSecurityScore() <= 100);
    }
}
