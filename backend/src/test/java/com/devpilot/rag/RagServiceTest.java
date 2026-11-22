package com.devpilot.rag;

import com.devpilot.ai.CodeContextAnalysisEngine;
import com.devpilot.ai.LlmClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RagServiceTest {

    private RepositoryIngestionService ingestionService;
    private VectorStore vectorStore;
    private LlmClient llmClient;
    private RagService ragService;
    private UUID repoId;

    @BeforeEach
    void setUp() {
        vectorStore = new VectorStore();
        CodeChunker chunker = new CodeChunker();
        ingestionService = new RepositoryIngestionService(chunker, vectorStore, "/tmp");
        CodeContextAnalysisEngine engine = new CodeContextAnalysisEngine();
        llmClient = new LlmClient(engine);
        ragService = new RagService(ingestionService, vectorStore, llmClient);
        repoId = UUID.randomUUID();
    }

    @Test
    void testAskRepositoryReturnsGroundedAnswerWithSources() {
        CodeChunk chunk = new CodeChunk(
                repoId,
                "src/main/java/com/devpilot/config/SecurityConfig.java",
                10, 35,
                "public class SecurityConfig { @Bean public SecurityFilterChain filterChain(HttpSecurity http) { return http.csrf().disable().oauth2Login().build(); } }",
                "Java",
                "SecurityConfig"
        );
        vectorStore.addChunks(repoId, List.of(chunk));

        RagAnswer answer = ragService.askRepository(repoId, "How is authentication implemented?");

        assertNotNull(answer);
        assertEquals("How is authentication implemented?", answer.getQuery());
        assertTrue(answer.getConfidenceScore() >= 0.70);
        assertNotNull(answer.getSources());
        assertFalse(answer.getSources().isEmpty());
        assertEquals("src/main/java/com/devpilot/config/SecurityConfig.java", answer.getSources().get(0).getFilePath());
        assertTrue(answer.getAnswer().contains("SecurityConfig.java"));
    }
}
