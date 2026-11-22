package com.devpilot.rag;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Answer produced by the Repository-Aware RAG system.
 */
public class RagAnswer {

    private String query;
    private String answer;
    private double confidenceScore;
    private List<RagSourceCitation> sources;
    private String modelUsed;
    private String createdAt;

    public RagAnswer() {
        this.sources = new ArrayList<>();
        this.createdAt = Instant.now().toString();
    }

    public RagAnswer(String query, String answer, double confidenceScore,
                     List<RagSourceCitation> sources, String modelUsed) {
        this.query = query;
        this.answer = answer;
        this.confidenceScore = confidenceScore;
        this.sources = sources != null ? sources : new ArrayList<>();
        this.modelUsed = modelUsed;
        this.createdAt = Instant.now().toString();
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public List<RagSourceCitation> getSources() {
        return sources;
    }

    public void setSources(List<RagSourceCitation> sources) {
        this.sources = sources;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
