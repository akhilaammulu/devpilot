package com.devpilot.rag;

import java.util.UUID;

/**
 * Represents a chunk of code extracted from a repository file for RAG indexing.
 */
public class CodeChunk {

    private UUID id;
    private UUID repositoryId;
    private String filePath;
    private int startLine;
    private int endLine;
    private String content;
    private String language;
    private String symbolName;
    private float[] embedding;

    public CodeChunk() {
        this.id = UUID.randomUUID();
    }

    public CodeChunk(UUID repositoryId, String filePath, int startLine, int endLine,
                     String content, String language, String symbolName) {
        this.id = UUID.randomUUID();
        this.repositoryId = repositoryId;
        this.filePath = filePath;
        this.startLine = startLine;
        this.endLine = endLine;
        this.content = content;
        this.language = language;
        this.symbolName = symbolName;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRepositoryId() {
        return repositoryId;
    }

    public void setRepositoryId(UUID repositoryId) {
        this.repositoryId = repositoryId;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public int getStartLine() {
        return startLine;
    }

    public void setStartLine(int startLine) {
        this.startLine = startLine;
    }

    public int getEndLine() {
        return endLine;
    }

    public void setEndLine(int endLine) {
        this.endLine = endLine;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getSymbolName() {
        return symbolName;
    }

    public void setSymbolName(String symbolName) {
        this.symbolName = symbolName;
    }

    public float[] getEmbedding() {
        return embedding;
    }

    public void setEmbedding(float[] embedding) {
        this.embedding = embedding;
    }
}
