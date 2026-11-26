package com.devpilot.rag;

import com.devpilot.repository.CodeChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Persistent hybrid vector store for codebase chunks.
 * Combines semantic CamelCase/synonym-expanded embeddings (L2-normalized cosine similarity)
 * with lexical symbol matching and optional JPA database persistence.
 */
@Component
public class VectorStore {

    private static final Logger log = LoggerFactory.getLogger(VectorStore.class);
    private static final Pattern NON_ALNUM = Pattern.compile("[^a-zA-Z0-9]+");
    private static final Pattern CAMEL_CASE_SPLIT = Pattern.compile("(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])");
    private static final int VECTOR_DIMENSION = 512;

    private static final Set<String> STOP_WORDS = Set.of(
            "how", "is", "what", "where", "when", "why", "who", "are", "was", "were",
            "the", "this", "that", "these", "those", "does", "did", "can", "could",
            "should", "would", "with", "for", "from", "into", "about", "in", "on",
            "at", "to", "of", "and", "or", "an", "be", "it", "my", "our", "your",
            "implemented", "handled", "cover", "work", "works", "structured", "used"
    );

    private static final Map<String, List<String>> SYNONYMS = Map.ofEntries(
            Map.entry("auth", List.of("oauth2", "security", "login", "jwt", "token", "filter")),
            Map.entry("authentication", List.of("oauth2", "security", "login", "jwt", "token", "filter", "auth")),
            Map.entry("login", List.of("oauth2", "security", "auth", "session", "user")),
            Map.entry("error", List.of("exception", "catch", "throw", "handler", "fallback")),
            Map.entry("errors", List.of("exception", "catch", "throw", "handler", "fallback", "error")),
            Map.entry("exception", List.of("error", "catch", "throw", "handler")),
            Map.entry("payment", List.of("stripe", "billing", "checkout", "transaction")),
            Map.entry("test", List.of("junit", "assert", "mock", "verify", "spec")),
            Map.entry("tests", List.of("junit", "assert", "mock", "verify", "test")),
            Map.entry("coverage", List.of("test", "junit", "assert", "verify")),
            Map.entry("accessibility", List.of("axe", "wcag", "playwright", "aria", "a11y")),
            Map.entry("security", List.of("cve", "secret", "csrf", "vulnerability", "scanner")),
            Map.entry("database", List.of("jpa", "repository", "entity", "hibernate", "sql", "datasource"))
    );

    // repositoryId -> list of CodeChunks (in-memory cache backed by JPA repository)
    private final Map<UUID, List<CodeChunk>> repositoryChunks = new ConcurrentHashMap<>();
    private final CodeChunkRepository codeChunkRepository;

    public VectorStore() {
        this.codeChunkRepository = null;
    }

    @Autowired
    public VectorStore(CodeChunkRepository codeChunkRepository) {
        this.codeChunkRepository = codeChunkRepository;
    }

    public void addChunks(UUID repositoryId, List<CodeChunk> chunks) {
        List<CodeChunkEntity> entities = new ArrayList<>();
        for (CodeChunk chunk : chunks) {
            if (chunk.getEmbedding() == null) {
                chunk.setEmbedding(computeEmbedding(chunk.getContent() + " " + chunk.getFilePath() + " " + chunk.getSymbolName()));
            }
            if (codeChunkRepository != null) {
                CodeChunkEntity entity = new CodeChunkEntity();
                entity.setId(chunk.getId());
                entity.setRepositoryId(repositoryId);
                entity.setFilePath(chunk.getFilePath());
                entity.setStartLine(chunk.getStartLine());
                entity.setEndLine(chunk.getEndLine());
                entity.setContent(chunk.getContent());
                entity.setLanguage(chunk.getLanguage());
                entity.setSymbolName(chunk.getSymbolName());
                entity.setEmbeddingJson(serializeVector(chunk.getEmbedding()));
                entities.add(entity);
            }
        }
        repositoryChunks.computeIfAbsent(repositoryId, k -> new ArrayList<>()).addAll(chunks);

        if (codeChunkRepository != null && !entities.isEmpty()) {
            try {
                codeChunkRepository.saveAll(entities);
            } catch (Exception e) {
                log.warn("Failed persisting code chunks to database: {}", e.getMessage());
            }
        }
    }

    public void clear(UUID repositoryId) {
        repositoryChunks.remove(repositoryId);
        if (codeChunkRepository != null) {
            try {
                codeChunkRepository.deleteByRepositoryId(repositoryId);
            } catch (Exception e) {
                log.warn("Failed clearing code chunks from database: {}", e.getMessage());
            }
        }
    }

    public int getChunkCount(UUID repositoryId) {
        List<CodeChunk> cached = ensureLoaded(repositoryId);
        return cached.size();
    }

    public List<CodeChunk> getAllChunks(UUID repositoryId) {
        return ensureLoaded(repositoryId);
    }

    public record ScoredChunk(CodeChunk chunk, double score) {}

    public List<ScoredChunk> search(UUID repositoryId, String query, int topK) {
        List<CodeChunk> chunks = ensureLoaded(repositoryId);
        if (chunks.isEmpty() || query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        Set<String> baseTokens = extractTokens(query);
        Set<String> expandedTokens = expandQueryTokens(baseTokens);
        float[] queryEmbedding = computeEmbeddingFromTokens(expandedTokens);

        boolean askingForTests = baseTokens.contains("test") || baseTokens.contains("tests")
                || baseTokens.contains("junit") || baseTokens.contains("coverage");
        boolean askingForRag = baseTokens.contains("rag") || baseTokens.contains("vector")
                || baseTokens.contains("chunk") || baseTokens.contains("embedding");

        List<ScoredChunk> scored = new ArrayList<>();
        for (CodeChunk chunk : chunks) {
            double vectorSim = cosineSimilarity(queryEmbedding, chunk.getEmbedding());

            String lowerContent = chunk.getContent().toLowerCase();
            String lowerPath = chunk.getFilePath().toLowerCase();
            String lowerSymbol = chunk.getSymbolName() != null ? chunk.getSymbolName().toLowerCase() : "";

            double keywordScoreSum = 0.0;
            for (String token : baseTokens) {
                if (lowerPath.contains(token) || lowerSymbol.contains(token)) {
                    keywordScoreSum += 1.5; // Strong boost for file path or symbol name match
                } else if (lowerContent.contains(token)) {
                    keywordScoreSum += 1.0;
                } else if (token.length() > 4 && lowerContent.contains(token.substring(0, token.length() - 2))) {
                    keywordScoreSum += 0.6;
                }
            }
            for (String syn : expandedTokens) {
                if (!baseTokens.contains(syn) && (lowerPath.contains(syn) || lowerSymbol.contains(syn) || lowerContent.contains(syn))) {
                    keywordScoreSum += 0.65;
                }
            }
            double lexicalScore = baseTokens.isEmpty() ? 0 : Math.min(1.0, keywordScoreSum / baseTokens.size());

            double hybridScore = (0.50 * vectorSim) + (0.50 * lexicalScore);

            // Path-aware relevance adjustment
            if (!askingForTests && (lowerPath.contains("/test/") || lowerPath.endsWith("test.java") || lowerPath.endsWith(".test.ts"))) {
                hybridScore *= 0.60;
            }
            if (!askingForRag && (lowerPath.contains("/rag/") || lowerPath.endsWith("ai-insights/page.tsx"))) {
                hybridScore *= 0.45;
            }

            if (hybridScore > 0.05) {
                scored.add(new ScoredChunk(chunk, hybridScore));
            }
        }

        return scored.stream()
                .sorted((a, b) -> Double.compare(b.score(), a.score()))
                .limit(topK)
                .collect(Collectors.toList());
    }

    public float[] computeEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return new float[VECTOR_DIMENSION];
        }
        return computeEmbeddingFromTokens(extractTokens(text));
    }

    private float[] computeEmbeddingFromTokens(Set<String> tokens) {
        float[] vector = new float[VECTOR_DIMENSION];
        if (tokens.isEmpty()) {
            return vector;
        }

        for (String token : tokens) {
            int hash = Math.abs(token.hashCode());
            int idx1 = hash % VECTOR_DIMENSION;
            int idx2 = (hash / VECTOR_DIMENSION) % VECTOR_DIMENSION;
            vector[idx1] += 1.0f;
            vector[idx2] += 0.5f;
        }

        double norm = 0;
        for (float v : vector) {
            norm += v * v;
        }
        if (norm > 0) {
            float sqrtNorm = (float) Math.sqrt(norm);
            for (int i = 0; i < VECTOR_DIMENSION; i++) {
                vector[i] /= sqrtNorm;
            }
        }

        return vector;
    }

    private List<CodeChunk> ensureLoaded(UUID repositoryId) {
        List<CodeChunk> cached = repositoryChunks.get(repositoryId);
        if (cached != null && !cached.isEmpty()) {
            return cached;
        }
        if (codeChunkRepository != null) {
            List<CodeChunkEntity> persisted = codeChunkRepository.findByRepositoryId(repositoryId);
            if (!persisted.isEmpty()) {
                List<CodeChunk> loaded = new ArrayList<>(persisted.size());
                for (CodeChunkEntity e : persisted) {
                    CodeChunk c = new CodeChunk(
                            e.getRepositoryId(),
                            e.getFilePath(),
                            e.getStartLine(),
                            e.getEndLine(),
                            e.getContent(),
                            e.getLanguage(),
                            e.getSymbolName()
                    );
                    c.setId(e.getId());
                    c.setEmbedding(deserializeVector(e.getEmbeddingJson()));
                    loaded.add(c);
                }
                repositoryChunks.put(repositoryId, loaded);
                return loaded;
            }
        }
        return Collections.emptyList();
    }

    private double cosineSimilarity(float[] a, float[] b) {
        if (a == null || b == null || a.length != b.length) {
            return 0.0;
        }
        double dot = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
        }
        return Math.max(0.0, Math.min(1.0, dot));
    }

    private Set<String> extractTokens(String text) {
        Set<String> tokens = new HashSet<>();
        String[] rawParts = NON_ALNUM.split(text);
        for (String part : rawParts) {
            if (part.length() < 2) continue;
            String lowerPart = part.toLowerCase();
            if (!STOP_WORDS.contains(lowerPart)) {
                tokens.add(lowerPart);
            }
            // Split camelCase identifiers (e.g. SecurityFilterChain -> security, filter, chain)
            String[] camelParts = CAMEL_CASE_SPLIT.split(part);
            if (camelParts.length > 1) {
                for (String cp : camelParts) {
                    String lowerCp = cp.toLowerCase();
                    if (lowerCp.length() >= 2 && !STOP_WORDS.contains(lowerCp)) {
                        tokens.add(lowerCp);
                    }
                }
            }
        }
        return tokens;
    }

    private Set<String> expandQueryTokens(Set<String> baseTokens) {
        Set<String> expanded = new HashSet<>(baseTokens);
        for (String token : baseTokens) {
            List<String> syns = SYNONYMS.get(token);
            if (syns != null) {
                expanded.addAll(syns);
            }
        }
        return expanded;
    }

    private String serializeVector(float[] vec) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < vec.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(vec[i]);
        }
        return sb.toString();
    }

    private float[] deserializeVector(String raw) {
        if (raw == null || raw.isBlank()) {
            return new float[VECTOR_DIMENSION];
        }
        String[] parts = raw.split(",");
        float[] vec = new float[VECTOR_DIMENSION];
        int len = Math.min(parts.length, VECTOR_DIMENSION);
        for (int i = 0; i < len; i++) {
            try {
                vec[i] = Float.parseFloat(parts[i]);
            } catch (NumberFormatException ignored) {
                vec[i] = 0.0f;
            }
        }
        return vec;
    }
}
