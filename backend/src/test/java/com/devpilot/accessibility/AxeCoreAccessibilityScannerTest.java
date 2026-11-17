package com.devpilot.accessibility;

import com.devpilot.analysis.AnalysisEngine;
import com.devpilot.analysis.EngineAnalysisResult;
import com.devpilot.model.IssueSeverity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class AxeCoreAccessibilityScannerTest {

    private AxeCoreAccessibilityScanner scanner;

    @BeforeEach
    void setUp() {
        scanner = new AxeCoreAccessibilityScanner();
    }

    @Test
    void testEngineIdentity() {
        assertEquals(AnalysisEngine.AXE_CORE, scanner.getEngine());
    }

    @Test
    void testFallbackDetectsUnlabelledIconButton(@TempDir Path tempDir) throws IOException {
        Path frontendSrc = tempDir.resolve("frontend/src");
        Files.createDirectories(frontendSrc);

        Path component = frontendSrc.resolve("NavBar.tsx");
        Files.writeString(component, """
            export function NavBar() {
                return (
                    <header>
                        <button className="p-2">
                            <Moon className="w-5 h-5" />
                        </button>
                    </header>
                );
            }
            """);

        EngineAnalysisResult result = scanner.analyze(tempDir, "http://invalid-unreachable-domain-1234.local");

        assertNotNull(result);
        assertEquals(AnalysisEngine.AXE_CORE, result.getEngine());
        assertFalse(result.getFindings().isEmpty());
        assertTrue(result.getFindings().stream().anyMatch(f -> "AXE_BUTTON_NAME".equals(f.getRuleId())));
        assertTrue(result.getFindings().stream().anyMatch(f -> f.getSeverity() == IssueSeverity.CRITICAL));
    }

    @Test
    void testFallbackDetectsImageWithoutAlt(@TempDir Path tempDir) throws IOException {
        Path frontendSrc = tempDir.resolve("frontend/src");
        Files.createDirectories(frontendSrc);

        Path component = frontendSrc.resolve("Hero.tsx");
        Files.writeString(component, """
            export function Hero() {
                return (
                    <div>
                        <img src="/banner.png" />
                    </div>
                );
            }
            """);

        EngineAnalysisResult result = scanner.analyze(tempDir, "http://invalid-unreachable-domain-1234.local");

        assertNotNull(result);
        assertTrue(result.getFindings().stream().anyMatch(f -> "AXE_IMAGE_ALT".equals(f.getRuleId())));
        assertTrue(result.getFindings().stream().anyMatch(f -> f.getSeverity() == IssueSeverity.HIGH));
    }
}
