package com.devpilot.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;

/**
 * Traverses repository files, parses them via CodeChunker, and indexes vectors into VectorStore.
 */
@Service
public class RepositoryIngestionService {

    private static final Logger log = LoggerFactory.getLogger(RepositoryIngestionService.class);

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".java", ".ts", ".tsx", ".js", ".jsx", ".graphqls", ".graphql", ".sql", ".yml", ".yaml", ".json"
    );

    private static final Set<String> IGNORED_DIRS = Set.of(
            ".git", "node_modules", "target", ".next", "dist", ".idea", ".vscode", "build", "out", ".system_generated"
    );

    private final CodeChunker codeChunker;
    private final VectorStore vectorStore;

    @Value("${devpilot.workspace.root:/Users/akhilagadipally/Desktop/devpilot}")
    private String defaultWorkspaceRoot;

    @Autowired
    public RepositoryIngestionService(CodeChunker codeChunker, VectorStore vectorStore) {
        this.codeChunker = codeChunker;
        this.vectorStore = vectorStore;
    }

    public RepositoryIngestionService(CodeChunker codeChunker, VectorStore vectorStore, String defaultWorkspaceRoot) {
        this.codeChunker = codeChunker;
        this.vectorStore = vectorStore;
        this.defaultWorkspaceRoot = defaultWorkspaceRoot;
    }

    public RepositoryIndexResult indexRepository(UUID repositoryId) {
        log.info("Starting codebase ingestion for repository {}", repositoryId);
        vectorStore.clear(repositoryId);

        Path rootPath = (defaultWorkspaceRoot != null && !defaultWorkspaceRoot.isBlank())
                ? Paths.get(defaultWorkspaceRoot)
                : Paths.get(".");

        int filesIndexed = 0;
        int totalChunks = 0;

        try {
            if (!Files.exists(rootPath)) {
                log.warn("Workspace root does not exist: {}", rootPath);
                return new RepositoryIndexResult(repositoryId, 0, 0, "FAILED_DIR_NOT_FOUND");
            }

            List<Path> codeFiles = new ArrayList<>();
            Files.walkFileTree(rootPath, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
                    String dirName = dir.getFileName() != null ? dir.getFileName().toString() : "";
                    if (IGNORED_DIRS.contains(dirName)) {
                        return FileVisitResult.SKIP_SUBTREE;
                    }
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                    String fileName = file.getFileName().toString();
                    if (isIndexable(fileName) && attrs.size() < 1_000_000) { // skip >1MB
                        codeFiles.add(file);
                    }
                    return FileVisitResult.CONTINUE;
                }
            });

            for (Path file : codeFiles) {
                try {
                    String content = Files.readString(file);
                    String relPath = rootPath.relativize(file).toString().replace('\\', '/');
                    List<CodeChunk> chunks = codeChunker.chunkFile(repositoryId, relPath, content);
                    vectorStore.addChunks(repositoryId, chunks);
                    totalChunks += chunks.size();
                    filesIndexed++;
                } catch (Exception ex) {
                    log.debug("Skipping unreadable file {}: {}", file, ex.getMessage());
                }
            }

            log.info("Repository {} indexed successfully: {} files, {} chunks",
                    repositoryId, filesIndexed, totalChunks);

            return new RepositoryIndexResult(repositoryId, filesIndexed, totalChunks, "COMPLETED");
        } catch (IOException e) {
            log.error("Failed to index repository {}: {}", repositoryId, e.getMessage(), e);
            return new RepositoryIndexResult(repositoryId, filesIndexed, totalChunks, "ERROR: " + e.getMessage());
        }
    }

    public int getIndexedChunkCount(UUID repositoryId) {
        return vectorStore.getChunkCount(repositoryId);
    }

    public int getIndexedFileCount(UUID repositoryId) {
        return (int) vectorStore.getAllChunks(repositoryId).stream()
                .map(CodeChunk::getFilePath)
                .distinct()
                .count();
    }

    private boolean isIndexable(String fileName) {
        String lower = fileName.toLowerCase();
        for (String ext : ALLOWED_EXTENSIONS) {
            if (lower.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }
}
