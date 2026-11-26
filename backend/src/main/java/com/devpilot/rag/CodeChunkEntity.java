package com.devpilot.rag;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Persistent JPA entity for storing codebase chunks and their vector embeddings
 * in the database so the RAG vector index persists across restarts.
 */
@Entity
@Table(name = "code_chunks", indexes = {
        @Index(name = "idx_code_chunks_repo_id", columnList = "repository_id")
})
public class CodeChunkEntity {

    @Id
    private UUID id;

    @Column(name = "repository_id", nullable = false)
    private UUID repositoryId;

    @Column(name = "file_path", nullable = false, length = 512)
    private String filePath;

    @Column(name = "start_line", nullable = false)
    private int startLine;

    @Column(name = "end_line", nullable = false)
    private int endLine;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "language", nullable = false, length = 64)
    private String language;

    @Column(name = "symbol_name", length = 256)
    private String symbolName;

    @Column(name = "embedding_json", columnDefinition = "TEXT")
    private String embeddingJson;

    @Column(name = "indexed_at", nullable = false)
    private Instant indexedAt = Instant.now();

    public CodeChunkEntity() {
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

    public String getEmbeddingJson() {
        return embeddingJson;
    }

    public void setEmbeddingJson(String embeddingJson) {
        this.embeddingJson = embeddingJson;
    }

    public Instant getIndexedAt() {
        return indexedAt;
    }

    public void setIndexedAt(Instant indexedAt) {
        this.indexedAt = indexedAt;
    }
}
