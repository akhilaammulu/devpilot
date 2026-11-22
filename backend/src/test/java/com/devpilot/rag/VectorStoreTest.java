package com.devpilot.rag;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class VectorStoreTest {

    private VectorStore vectorStore;
    private UUID repoId;

    @BeforeEach
    void setUp() {
        vectorStore = new VectorStore();
        repoId = UUID.randomUUID();
    }

    @Test
    void testEmbeddingCalculationAndCosineSimilarity() {
        float[] v1 = vectorStore.computeEmbedding("Spring Security OAuth2 Authentication Filter");
        float[] v2 = vectorStore.computeEmbedding("Spring Security OAuth2 Login");
        float[] v3 = vectorStore.computeEmbedding("Playwright Axe Accessibility Color Contrast");

        assertNotNull(v1);
        assertNotNull(v2);
        assertNotNull(v3);

        // Security queries should have higher similarity than completely unrelated accessibility query
        double simSecurity = dotProduct(v1, v2);
        double simUnrelated = dotProduct(v1, v3);

        assertTrue(simSecurity > simUnrelated, "Security terms should be closer than unrelated terms");
    }

    @Test
    void testSearchRetrievesMostRelevantChunk() {
        CodeChunk authChunk = new CodeChunk(
                repoId, "SecurityConfig.java", 1, 40,
                "public class SecurityConfig { SecurityFilterChain filterChain(HttpSecurity http) { http.oauth2Login(); // authentication configuration } }",
                "Java", "SecurityConfig"
        );
        CodeChunk a11yChunk = new CodeChunk(
                repoId, "AccessibilityScanner.java", 1, 40,
                "public class AccessibilityScanner { void runAxeCore() { axe.analyze(); } }",
                "Java", "AccessibilityScanner"
        );

        vectorStore.addChunks(repoId, List.of(authChunk, a11yChunk));

        List<VectorStore.ScoredChunk> results = vectorStore.search(repoId, "How is authentication configured?", 1);

        assertFalse(results.isEmpty());
        assertEquals("SecurityConfig.java", results.get(0).chunk().getFilePath());
        assertTrue(results.get(0).score() > 0.1);
    }

    private double dotProduct(float[] a, float[] b) {
        double dot = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
        }
        return dot;
    }
}
