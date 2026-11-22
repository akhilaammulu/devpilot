package com.devpilot.rag;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * High-performance vector store and hybrid retrieval engine for codebase chunks.
 * Combines semantic term embedding representation with keyword-boosted ranking.
 */
@Component
public class VectorStore {

    private static final Pattern TOKEN_SPLIT = Pattern.compile("[^a-zA-Z0-9_]+");
    private static final int VECTOR_DIMENSION = 256;

    // repositoryId -> list of CodeChunks
    private final Map<UUID, List<CodeChunk>> repositoryChunks = new ConcurrentHashMap<>();

    public void addChunks(UUID repositoryId, List<CodeChunk> chunks) {
        for (CodeChunk chunk : chunks) {
            if (chunk.getEmbedding() == null) {
                chunk.setEmbedding(computeEmbedding(chunk.getContent() + " " + chunk.getFilePath()));
            }
        }
        repositoryChunks.computeIfAbsent(repositoryId, k -> new ArrayList<>()).addAll(chunks);
    }

    public void clear(UUID repositoryId) {
        repositoryChunks.remove(repositoryId);
    }

    public int getChunkCount(UUID repositoryId) {
        List<CodeChunk> list = repositoryChunks.get(repositoryId);
        return list != null ? list.size() : 0;
    }

    public List<CodeChunk> getAllChunks(UUID repositoryId) {
        return repositoryChunks.getOrDefault(repositoryId, Collections.emptyList());
    }

    public record ScoredChunk(CodeChunk chunk, double score) {}

    public List<ScoredChunk> search(UUID repositoryId, String query, int topK) {
        List<CodeChunk> chunks = repositoryChunks.get(repositoryId);
        if (chunks == null || chunks.isEmpty() || query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        float[] queryEmbedding = computeEmbedding(query);
        Set<String> queryTokens = extractTokens(query);

        List<ScoredChunk> scored = new ArrayList<>();
        for (CodeChunk chunk : chunks) {
            double vectorSim = cosineSimilarity(queryEmbedding, chunk.getEmbedding());

            // Keyword boost for exact identifiers, symbols, and root stems
            double keywordMatchCount = 0;
            String lowerContent = (chunk.getContent() + " " + chunk.getFilePath()).toLowerCase();
            for (String token : queryTokens) {
                if (lowerContent.contains(token)) {
                    keywordMatchCount += 1.0;
                } else if (token.length() > 4 && lowerContent.contains(token.substring(0, token.length() - 2))) {
                    keywordMatchCount += 0.75;
                }
            }
            double lexicalScore = queryTokens.isEmpty() ? 0 : (keywordMatchCount / queryTokens.size());

            // Hybrid score: 50% semantic vector similarity + 50% lexical/symbol overlap
            double hybridScore = (0.50 * vectorSim) + (0.50 * lexicalScore);

            if (hybridScore > 0.05) {
                scored.add(new ScoredChunk(chunk, hybridScore));
            }
        }

        return scored.stream()
                .sorted((a, b) -> Double.compare(b.score(), a.score()))
                .limit(topK)
                .collect(Collectors.toList());
    }

    /**
     * Compute a normalized semantic hash-projection embedding vector for code tokens.
     */
    public float[] computeEmbedding(String text) {
        float[] vector = new float[VECTOR_DIMENSION];
        if (text == null || text.isBlank()) {
            return vector;
        }

        Set<String> tokens = extractTokens(text);
        for (String token : tokens) {
            int hash = Math.abs(token.hashCode());
            int idx1 = hash % VECTOR_DIMENSION;
            int idx2 = (hash / VECTOR_DIMENSION) % VECTOR_DIMENSION;
            vector[idx1] += 1.0f;
            vector[idx2] += 0.5f;
        }

        // L2 normalization
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
        String[] raw = TOKEN_SPLIT.split(text.toLowerCase());
        Set<String> tokens = new HashSet<>();
        for (String t : raw) {
            if (t.length() >= 2) {
                tokens.add(t);
            }
        }
        return tokens;
    }
}
