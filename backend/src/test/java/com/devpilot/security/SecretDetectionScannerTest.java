package com.devpilot.security;

import com.devpilot.analysis.EngineAnalysisResult;
import com.devpilot.model.IssueSeverity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class SecretDetectionScannerTest {

    private SecretDetectionScanner scanner;

    @BeforeEach
    void setUp() {
        scanner = new SecretDetectionScanner();
    }

    @Test
    void testDetectsAwsKey(@TempDir Path tempDir) throws IOException {
        Path codeFile = tempDir.resolve("AwsClient.java");
        Files.writeString(codeFile, """
            public class AwsClient {
                // Hardcoded AWS Key
                private static final String AWS_KEY = "AKIA1234567890ABCDEF";
            }
            """);

        EngineAnalysisResult result = scanner.analyze(tempDir, "main");

        assertFalse(result.getFindings().isEmpty());
        assertTrue(result.getFindings().stream().anyMatch(f -> "SEC_AWS_ACCESS_KEY".equals(f.getRuleId())));
        assertTrue(result.getFindings().stream().anyMatch(f -> f.getSeverity() == IssueSeverity.CRITICAL));
    }

    @Test
    void testMasksSecretValue() {
        String original = "AKIA1234567890ABCDEF";
        String masked = SecretDetectionScanner.maskSecret(original);

        assertNotEquals(original, masked);
        assertTrue(masked.contains("****"));
        assertTrue(masked.startsWith("AKIA"));
        assertTrue(masked.endsWith("CDEF"));
    }

    @Test
    void testDetectsGitHubToken(@TempDir Path tempDir) throws IOException {
        Path configFile = tempDir.resolve("deploy.sh");
        Files.writeString(configFile, """
            #!/bin/bash
            export GITHUB_TOKEN="ghp_1234567890abcdef1234567890abcdef1234"
            """);

        EngineAnalysisResult result = scanner.analyze(tempDir, "main");

        assertFalse(result.getFindings().isEmpty());
        assertTrue(result.getFindings().stream().anyMatch(f -> "SEC_GITHUB_TOKEN".equals(f.getRuleId())));
    }

    @Test
    void testIgnoresPlaceholderComments(@TempDir Path tempDir) throws IOException {
        Path safeFile = tempDir.resolve("SafeConfig.java");
        Files.writeString(safeFile, """
            public class SafeConfig {
                private String key = "${AWS_SECRET_KEY}";
                private String placeholder = "placeholder-client-id";
            }
            """);

        EngineAnalysisResult result = scanner.analyze(tempDir, "main");
        assertTrue(result.getFindings().isEmpty());
    }
}
