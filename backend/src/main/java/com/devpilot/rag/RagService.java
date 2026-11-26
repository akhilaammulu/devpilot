package com.devpilot.rag;

import com.devpilot.ai.LlmClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Repository-Aware RAG Service (Phase 6).
 * Combines hybrid vector + lexical retrieval with context-aware LLM prompting
 * and dynamic AST/symbol-level code synthesis grounded in retrieved repository files.
 */
@Service
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private static final Pattern ANNOTATION_PATTERN = Pattern.compile("@([A-Za-z0-9_]+)");
    private static final Pattern METHOD_PATTERN = Pattern.compile(
            "(?:public|protected|private|async|export)\\s+(?:static\\s+)?(?:[A-Za-z0-9_<>\\[\\],\\s]+?)\\s+([a-zA-Z0-9_]+)\\s*\\([^)]*\\)"
    );

    private final RepositoryIngestionService ingestionService;
    private final VectorStore vectorStore;
    private final LlmClient llmClient;

    @Autowired
    public RagService(RepositoryIngestionService ingestionService, VectorStore vectorStore, LlmClient llmClient) {
        this.ingestionService = ingestionService;
        this.vectorStore = vectorStore;
        this.llmClient = llmClient;
    }

    public RagAnswer askRepository(UUID repositoryId, String query) {
        log.info("Received RAG query for repo {}: '{}'", repositoryId, query);

        // Ensure codebase is ingested into persistent vector store
        if (vectorStore.getChunkCount(repositoryId) == 0) {
            log.info("Repository {} not yet indexed in vector store; indexing now...", repositoryId);
            ingestionService.indexRepository(repositoryId);
        }

        // Semantic & lexical hybrid retrieval
        List<VectorStore.ScoredChunk> scoredChunks = vectorStore.search(repositoryId, query, 5);

        List<RagSourceCitation> sources = new ArrayList<>();
        StringBuilder formattedContext = new StringBuilder();
        double avgScore = 0.0;

        for (VectorStore.ScoredChunk sc : scoredChunks) {
            CodeChunk chunk = sc.chunk();
            String[] lines = chunk.getContent().split("\\r?\\n");
            StringBuilder snippet = new StringBuilder();
            int limit = Math.min(lines.length, 15);
            for (int i = 0; i < limit; i++) {
                snippet.append(lines[i]).append("\n");
            }
            if (lines.length > 15) {
                snippet.append("... [remaining lines omitted]\n");
            }

            sources.add(new RagSourceCitation(
                    chunk.getFilePath(),
                    chunk.getStartLine(),
                    chunk.getEndLine(),
                    snippet.toString(),
                    Math.round(sc.score() * 100.0) / 100.0,
                    chunk.getSymbolName()
            ));

            formattedContext.append("[File: ").append(chunk.getFilePath())
                    .append(" (Lines ").append(chunk.getStartLine()).append("-").append(chunk.getEndLine())
                    .append(", Symbol: ").append(chunk.getSymbolName()).append(")]\n")
                    .append(chunk.getContent()).append("\n\n");

            avgScore += sc.score();
        }

        if (!scoredChunks.isEmpty()) {
            avgScore /= scoredChunks.size();
        }

        double confidenceScore = scoredChunks.isEmpty()
                ? 0.35
                : Math.min(0.98, Math.max(0.70, avgScore + 0.30));

        // 1. Try external LLM with full retrieved context if configured
        String remoteAnswer = llmClient.askWithContext(query, formattedContext.toString());
        String finalAnswer;
        String modelUsed;

        if (remoteAnswer != null && !remoteAnswer.isBlank()) {
            finalAnswer = remoteAnswer;
            modelUsed = "DevPilot-RAG-LLM";
        } else {
            // 2. Dynamic code-grounded synthesis directly from retrieved chunks
            finalAnswer = synthesizeFromRetrievedChunks(query, scoredChunks);
            modelUsed = "DevPilot-RAG-Context-Engine";
        }

        return new RagAnswer(query, finalAnswer, confidenceScore, sources, modelUsed);
    }

    /**
     * Dynamically summarizes the actual retrieved code chunks (annotations, methods, key calls,
     * and file structure) rather than returning hardcoded static templates.
     */
    private String synthesizeFromRetrievedChunks(String query, List<VectorStore.ScoredChunk> chunks) {
        if (chunks.isEmpty()) {
            return "No matching code context was found in the indexed repository for \"" + query + "\". "
                    + "Try re-indexing the repository or using specific class, method, or feature names.";
        }

        StringBuilder sb = new StringBuilder();
        CodeChunk primary = chunks.get(0).chunk();

        sb.append("### Repository Context Analysis\n\n");
        sb.append("Based on vector & symbol retrieval across the repository, the primary implementation for **\"")
                .append(query).append("\"** is located in `").append(primary.getFilePath())
                .append("` (Lines ").append(primary.getStartLine()).append("–").append(primary.getEndLine()).append(").\n\n");

        // Group findings by unique file so we don't repeat the same file twice
        Map<String, List<VectorStore.ScoredChunk>> byFile = new LinkedHashMap<>();
        for (VectorStore.ScoredChunk sc : chunks) {
            byFile.computeIfAbsent(sc.chunk().getFilePath(), k -> new ArrayList<>()).add(sc);
        }

        sb.append("#### Relevant Code Findings\n\n");
        int idx = 1;
        for (Map.Entry<String, List<VectorStore.ScoredChunk>> entry : byFile.entrySet()) {
            if (idx > 4) break;
            String filePath = entry.getKey();
            List<VectorStore.ScoredChunk> fileChunks = entry.getValue();
            CodeChunk first = fileChunks.get(0).chunk();

            StringBuilder combinedContent = new StringBuilder();
            for (VectorStore.ScoredChunk sc : fileChunks) {
                combinedContent.append(sc.chunk().getContent()).append("\n");
            }
            String content = combinedContent.toString();

            Set<String> annotations = extractMatches(ANNOTATION_PATTERN, content, 5);
            Set<String> methods = extractMatches(METHOD_PATTERN, content, 5);
            List<String> behaviors = inferCodeBehaviors(content);

            sb.append(idx).append(". **`").append(filePath).append("`** (Lines ")
                    .append(first.getStartLine()).append("–").append(first.getEndLine())
                    .append(", `").append(first.getLanguage()).append("`):\n");

            if (!"Module".equals(first.getSymbolName())) {
                sb.append("   - **Primary Symbol**: `").append(first.getSymbolName()).append("`\n");
            }
            if (!annotations.isEmpty()) {
                sb.append("   - **Annotations**: `").append(String.join("`, `", annotations)).append("`\n");
            }
            if (!methods.isEmpty()) {
                sb.append("   - **Key Methods / Functions**: `").append(String.join("()`, `", methods)).append("()`\n");
            }
            if (!behaviors.isEmpty()) {
                sb.append("   - **Observed Behavior**: ").append(String.join("; ", behaviors)).append(".\n");
            }
            sb.append("\n");
            idx++;
        }

        return sb.toString().trim();
    }

    private Set<String> extractMatches(Pattern pattern, String content, int limit) {
        Set<String> results = new LinkedHashSet<>();
        Matcher m = pattern.matcher(content);
        while (m.find() && results.size() < limit) {
            String val = m.group(1);
            if (val != null && val.length() > 1 && !val.equals("Override")) {
                results.add(val);
            }
        }
        return results;
    }

    private List<String> inferCodeBehaviors(String content) {
        List<String> behaviors = new ArrayList<>();
        String lower = content.toLowerCase();
        if (lower.contains("oauth2login") || lower.contains("securityfilterchain")) {
            behaviors.add("Configures Spring Security filter chain and OAuth2 login authentication");
        }
        if (lower.contains("csrf")) {
            behaviors.add("Manages CSRF protection policies on HTTP endpoints");
        }
        if (lower.contains("cors")) {
            behaviors.add("Configures Cross-Origin Resource Sharing (CORS) rules");
        }
        if (lower.contains("querymapping") || lower.contains("mutationmapping")) {
            behaviors.add("Exposes GraphQL Query/Mutation resolvers");
        }
        if (lower.contains("try {") || lower.contains("catch (") || lower.contains("orelseThrow".toLowerCase())) {
            behaviors.add("Implements explicit exception catching or fallback error handling");
        }
        if (lower.contains("@test") || lower.contains("assertequals") || lower.contains("asserttrue") || lower.contains("assertnotNull".toLowerCase())) {
            behaviors.add("Executes automated JUnit assertions and test verification");
        }
        if (lower.contains("usequery") || lower.contains("usemutation") || lower.contains("uselazyquery")) {
            behaviors.add("Connects UI components to backend GraphQL APIs via Apollo Client");
        }
        if (lower.contains("axe") || lower.contains("playwright")) {
            behaviors.add("Runs automated accessibility / browser verification checks");
        }
        if (lower.contains("vector") || lower.contains("embedding") || lower.contains("cosine")) {
            behaviors.add("Computes vector embeddings and cosine similarity search");
        }
        return behaviors;
    }
}
