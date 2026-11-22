package com.devpilot.rag;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO tracking repository ingestion and indexing status.
 */
public class RepositoryIndexResult {

    private UUID repositoryId;
    private int filesIndexed;
    private int chunksCreated;
    private String status;
    private String indexedAt;

    public RepositoryIndexResult() {
        this.indexedAt = Instant.now().toString();
    }

    public RepositoryIndexResult(UUID repositoryId, int filesIndexed, int chunksCreated, String status) {
        this.repositoryId = repositoryId;
        this.filesIndexed = filesIndexed;
        this.chunksCreated = chunksCreated;
        this.status = status;
        this.indexedAt = Instant.now().toString();
    }

    public UUID getRepositoryId() {
        return repositoryId;
    }

    public void setRepositoryId(UUID repositoryId) {
        this.repositoryId = repositoryId;
    }

    public int getFilesIndexed() {
        return filesIndexed;
    }

    public void setFilesIndexed(int filesIndexed) {
        this.filesIndexed = filesIndexed;
    }

    public int getChunksCreated() {
        return chunksCreated;
    }

    public void setChunksCreated(int chunksCreated) {
        this.chunksCreated = chunksCreated;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getIndexedAt() {
        return indexedAt;
    }

    public void setIndexedAt(String indexedAt) {
        this.indexedAt = indexedAt;
    }
}
