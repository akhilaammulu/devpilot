package com.devpilot.analysis;

import com.devpilot.model.IssueSeverity;

public class AnalysisFinding {

    private AnalysisEngine engine;
    private String language;
    private IssueSeverity severity;
    private String ruleId;
    private String filePath;
    private Integer lineStart;
    private Integer lineEnd;
    private String message;
    private String snippet;
    private String aiExplanation;
    private String proposedFix;

    public AnalysisFinding() {
    }

    public AnalysisFinding(AnalysisEngine engine, String language, IssueSeverity severity,
                           String ruleId, String filePath, Integer lineStart, Integer lineEnd,
                           String message, String snippet, String aiExplanation, String proposedFix) {
        this.engine = engine;
        this.language = language;
        this.severity = severity;
        this.ruleId = ruleId;
        this.filePath = filePath;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
        this.message = message;
        this.snippet = snippet;
        this.aiExplanation = aiExplanation;
        this.proposedFix = proposedFix;
    }

    public AnalysisEngine getEngine() {
        return engine;
    }

    public void setEngine(AnalysisEngine engine) {
        this.engine = engine;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public IssueSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(IssueSeverity severity) {
        this.severity = severity;
    }

    public String getRuleId() {
        return ruleId;
    }

    public void setRuleId(String ruleId) {
        this.ruleId = ruleId;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Integer getLineStart() {
        return lineStart;
    }

    public void setLineStart(Integer lineStart) {
        this.lineStart = lineStart;
    }

    public Integer getLineEnd() {
        return lineEnd;
    }

    public void setLineEnd(Integer lineEnd) {
        this.lineEnd = lineEnd;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }

    public String getAiExplanation() {
        return aiExplanation;
    }

    public void setAiExplanation(String aiExplanation) {
        this.aiExplanation = aiExplanation;
    }

    public String getProposedFix() {
        return proposedFix;
    }

    public void setProposedFix(String proposedFix) {
        this.proposedFix = proposedFix;
    }
}
