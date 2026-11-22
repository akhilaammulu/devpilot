package com.devpilot.rag;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Structural code chunker for repository RAG ingestion.
 * Divides source files into semantic windows with overlap and symbol context.
 */
@Component
public class CodeChunker {

    private static final int DEFAULT_CHUNK_SIZE = 40; // lines
    private static final int DEFAULT_OVERLAP = 10;    // lines

    private static final Pattern SYMBOL_PATTERN = Pattern.compile(
            "(?:class|interface|record|enum|function|def)\\s+([a-zA-Z0-9_]+)|(?:public|protected|private|static|final)\\s+(?:[a-zA-Z0-9_<>\\[\\]]+\\s+)*([a-zA-Z0-9_]+)\\s*\\("
    );

    public List<CodeChunk> chunkFile(UUID repositoryId, String filePath, String content) {
        List<CodeChunk> chunks = new ArrayList<>();
        if (content == null || content.isBlank()) {
            return chunks;
        }

        String language = detectLanguage(filePath);
        String[] lines = content.split("\\r?\\n");
        int totalLines = lines.length;

        if (totalLines <= DEFAULT_CHUNK_SIZE) {
            String symbolName = extractSymbol(content);
            chunks.add(new CodeChunk(repositoryId, filePath, 1, totalLines, content, language, symbolName));
            return chunks;
        }

        int step = DEFAULT_CHUNK_SIZE - DEFAULT_OVERLAP;
        for (int start = 0; start < totalLines; start += step) {
            int end = Math.min(start + DEFAULT_CHUNK_SIZE, totalLines);
            StringBuilder chunkContent = new StringBuilder();
            for (int i = start; i < end; i++) {
                chunkContent.append(lines[i]).append("\n");
            }

            String chunkStr = chunkContent.toString();
            String symbolName = extractSymbol(chunkStr);

            chunks.add(new CodeChunk(
                    repositoryId,
                    filePath,
                    start + 1,
                    end,
                    chunkStr,
                    language,
                    symbolName
            ));

            if (end >= totalLines) {
                break;
            }
        }

        return chunks;
    }

    private String detectLanguage(String filePath) {
        String lower = filePath.toLowerCase();
        if (lower.endsWith(".java")) return "Java";
        if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "TypeScript";
        if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "JavaScript";
        if (lower.endsWith(".sql")) return "SQL";
        if (lower.endsWith(".graphql") || lower.endsWith(".graphqls")) return "GraphQL";
        if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "YAML";
        if (lower.endsWith(".json")) return "JSON";
        if (lower.endsWith(".xml")) return "XML";
        if (lower.endsWith(".md")) return "Markdown";
        return "Text";
    }

    private String extractSymbol(String text) {
        Matcher matcher = SYMBOL_PATTERN.matcher(text);
        if (matcher.find()) {
            String name = matcher.group(1);
            if (name == null || name.isBlank()) {
                name = matcher.group(2);
            }
            if (name != null && !name.isBlank()) {
                return name;
            }
        }
        return "Module";
    }
}
