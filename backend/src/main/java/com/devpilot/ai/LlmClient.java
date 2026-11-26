package com.devpilot.ai;

import com.devpilot.model.Issue;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

/**
 * Intelligent LLM Client (Phase 5).
 * Connects to LLM endpoints (Gemini, OpenAI, or local Ollama) if configured,
 * or delegates to CodeContextAnalysisEngine for deterministic, code-aware analysis.
 */
@Component
public class LlmClient {

    private static final Logger log = LoggerFactory.getLogger(LlmClient.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Value("${devpilot.ai.llm.api-key:}")
    private String apiKey;

    @Value("${devpilot.ai.llm.endpoint:}")
    private String endpoint;

    @Value("${devpilot.ai.llm.model:gemini-1.5-pro}")
    private String modelName;

    private final CodeContextAnalysisEngine contextEngine;
    private final HttpClient httpClient;

    public LlmClient(CodeContextAnalysisEngine contextEngine) {
        this.contextEngine = contextEngine;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Sends a context-aware RAG prompt (system instruction + retrieved repository code chunks + query)
     * to the configured LLM endpoint. Returns null if no external LLM is configured or if invocation fails.
     */
    public String askWithContext(String query, String formattedContext) {
        if (apiKey == null || apiKey.isBlank() || endpoint == null || endpoint.isBlank()) {
            return null;
        }
        try {
            String prompt = String.format("""
                You are DevPilot, a repository-aware AI software engineering assistant.
                Answer the developer's question using ONLY the provided repository code context below.
                Always cite exact file paths and line ranges (e.g. `SecurityConfig.java` Lines 15-42) when explaining implementation details.
                If the provided context does not contain the answer, state what is missing rather than guessing.

                --- REPOSITORY CODE CONTEXT ---
                %s
                --- END CONTEXT ---

                Developer Question: %s
                """, formattedContext, query);

            String requestBody = MAPPER.writeValueAsString(Map.of(
                    "model", modelName,
                    "prompt", prompt,
                    "temperature", 0.2
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = MAPPER.readTree(response.body());
                String text = root.path("response").asText("");
                if (text.isBlank()) {
                    // Support OpenAI chat/completions response shape too
                    text = root.path("choices").path(0).path("message").path("content").asText("");
                }
                if (!text.isBlank()) {
                    return text;
                }
            }
        } catch (Exception e) {
            log.warn("Remote RAG LLM invocation failed ({}); falling back to dynamic code synthesis", e.getMessage());
        }
        return null;
    }

    public AiIssueAnalysis analyzeIssue(Issue issue, Path repoRoot) {
        // If an API key and endpoint are provided, attempt live LLM invocation
        if (apiKey != null && !apiKey.isBlank() && endpoint != null && !endpoint.isBlank()) {
            try {
                AiIssueAnalysis remoteResult = invokeRemoteLlm(issue, repoRoot);
                if (remoteResult != null) {
                    return remoteResult;
                }
            } catch (Exception e) {
                log.warn("Remote LLM invocation failed ({}); falling back to local contextual engine", e.getMessage());
            }
        }

        // Deterministic contextual code engine (code-aware, instant, reliable)
        return contextEngine.analyze(issue, repoRoot);
    }

    private AiIssueAnalysis invokeRemoteLlm(Issue issue, Path repoRoot) throws Exception {
        String prompt = String.format("""
            You are DevPilot AI code assistant. Analyze this finding:
            Rule: %s
            Severity: %s
            File: %s (Lines: %s-%s)
            Message: %s
            Snippet:
            %s
            
            Return JSON with keys:
            whyItMatters, remediationGuidance, codeFix, suggestedUnitTest
            """,
            issue.getRuleId(),
            issue.getSeverity(),
            issue.getFilePath(),
            issue.getLineStart(),
            issue.getLineEnd(),
            issue.getMessage(),
            issue.getSnippet()
        );

        String requestBody = MAPPER.writeValueAsString(Map.of(
                "model", modelName,
                "prompt", prompt,
                "temperature", 0.2
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = MAPPER.readTree(response.body());
            String text = root.path("response").asText("");
            if (!text.isBlank()) {
                return new AiIssueAnalysis(
                        issue.getId(),
                        issue.getRuleId(),
                        "AI Remediation for " + issue.getRuleId(),
                        text,
                        "Apply proposed changes carefully and execute regression tests.",
                        issue.getSnippet() != null ? issue.getSnippet() : "",
                        "// Automated regression test generated by " + modelName,
                        0.98,
                        modelName,
                        Instant.now().toString()
                );
            }
        }
        return null;
    }
}
