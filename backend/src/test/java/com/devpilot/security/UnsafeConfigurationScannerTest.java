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

class UnsafeConfigurationScannerTest {

    private UnsafeConfigurationScanner scanner;

    @BeforeEach
    void setUp() {
        scanner = new UnsafeConfigurationScanner();
    }

    @Test
    void testDetectsDisabledCsrf(@TempDir Path tempDir) throws IOException {
        Path configDir = tempDir.resolve("src/main/java/com/devpilot/config");
        Files.createDirectories(configDir);
        Path securityConfig = configDir.resolve("SecurityConfig.java");
        Files.writeString(securityConfig, """
            package com.devpilot.config;
            public class SecurityConfig {
                public void configure() {
                    http.csrf(AbstractHttpConfigurer::disable);
                }
            }
            """);

        EngineAnalysisResult result = scanner.analyze(tempDir, "main");

        assertFalse(result.getFindings().isEmpty());
        assertTrue(result.getFindings().stream().anyMatch(f -> "SEC_CSRF_DISABLED".equals(f.getRuleId())));
        assertTrue(result.getFindings().stream().anyMatch(f -> f.getSeverity() == IssueSeverity.HIGH));
    }

    @Test
    void testDetectsPermissiveCorsWildcard(@TempDir Path tempDir) throws IOException {
        Path configDir = tempDir.resolve("src/main/java/com/devpilot/config");
        Files.createDirectories(configDir);
        Path securityConfig = configDir.resolve("SecurityConfig.java");
        Files.writeString(securityConfig, """
            package com.devpilot.config;
            public class SecurityConfig {
                public void configure() {
                    configuration.setAllowedOrigins(List.of("*"));
                }
            }
            """);

        EngineAnalysisResult result = scanner.analyze(tempDir, "main");

        assertFalse(result.getFindings().isEmpty());
        assertTrue(result.getFindings().stream().anyMatch(f -> "SEC_PERMISSIVE_CORS_WILDCARD".equals(f.getRuleId())));
    }

    @Test
    void testDetectsExposedActuators(@TempDir Path tempDir) throws IOException {
        Path appYml = tempDir.resolve("application.yml");
        Files.writeString(appYml, """
            management:
              endpoints:
                web:
                  exposure:
                    include: "*"
            """);

        EngineAnalysisResult result = scanner.analyze(tempDir, "main");

        assertFalse(result.getFindings().isEmpty());
        assertTrue(result.getFindings().stream().anyMatch(f -> "SEC_ACTUATOR_EXPOSED_ALL".equals(f.getRuleId())));
    }
}
