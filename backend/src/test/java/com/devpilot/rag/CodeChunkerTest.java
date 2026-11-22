package com.devpilot.rag;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CodeChunkerTest {

    private CodeChunker chunker;

    @BeforeEach
    void setUp() {
        chunker = new CodeChunker();
    }

    @Test
    void testChunkShortJavaFile() {
        UUID repoId = UUID.randomUUID();
        String content = "package com.example;\n\npublic class UserService {\n    public void saveUser() {}\n}\n";
        List<CodeChunk> chunks = chunker.chunkFile(repoId, "UserService.java", content);

        assertNotNull(chunks);
        assertEquals(1, chunks.size());
        assertEquals("Java", chunks.get(0).getLanguage());
        assertEquals("UserService", chunks.get(0).getSymbolName());
        assertEquals(1, chunks.get(0).getStartLine());
        assertEquals(5, chunks.get(0).getEndLine());
    }

    @Test
    void testChunkLongFileProducesMultipleChunksWithOverlap() {
        UUID repoId = UUID.randomUUID();
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 100; i++) {
            sb.append("// Line ").append(i).append(": public void testMethod").append(i).append("() {}\n");
        }

        List<CodeChunk> chunks = chunker.chunkFile(repoId, "src/components/ScanView.tsx", sb.toString());

        assertNotNull(chunks);
        assertTrue(chunks.size() >= 3, "Expected multiple chunks for 100-line file");
        assertEquals("TypeScript", chunks.get(0).getLanguage());
        // Verify overlap: step is 30, so chunk 1: 1-40, chunk 2: 31-70
        assertEquals(1, chunks.get(0).getStartLine());
        assertEquals(40, chunks.get(0).getEndLine());
        assertEquals(31, chunks.get(1).getStartLine());
        assertEquals(70, chunks.get(1).getEndLine());
    }

    @Test
    void testEmptyContentReturnsEmptyList() {
        UUID repoId = UUID.randomUUID();
        List<CodeChunk> chunks = chunker.chunkFile(repoId, "Empty.java", "");
        assertTrue(chunks.isEmpty());
    }
}
