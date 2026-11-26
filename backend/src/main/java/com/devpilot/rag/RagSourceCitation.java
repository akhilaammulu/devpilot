package com.devpilot.rag;

/**
 * Citation representing a specific code file and line range used as RAG context.
 */
public class RagSourceCitation {

    private String filePath;
    private int startLine;
    private int endLine;
    private String snippet;
    private double relevanceScore;
    private String symbolName;

    public RagSourceCitation() {
    }

    public RagSourceCitation(String filePath, int startLine, int endLine, String snippet, double relevanceScore, String symbolName) {
        this.filePath = filePath;
        this.startLine = startLine;
        this.endLine = endLine;
        this.snippet = snippet;
        this.relevanceScore = relevanceScore;
        this.symbolName = symbolName;
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

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }

    public double getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    public String getSymbolName() {
        return symbolName;
    }

    public void setSymbolName(String symbolName) {
        this.symbolName = symbolName;
    }
}
