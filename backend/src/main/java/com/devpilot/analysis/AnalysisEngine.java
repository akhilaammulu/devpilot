package com.devpilot.analysis;

public enum AnalysisEngine {
    CHECKSTYLE("Checkstyle", "Java"),
    PMD("PMD", "Java"),
    SPOTBUGS("SpotBugs", "Java"),
    ESLINT("ESLint", "TypeScript");

    private final String displayName;
    private final String language;

    AnalysisEngine(String displayName, String language) {
        this.displayName = displayName;
        this.language = language;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getLanguage() {
        return language;
    }
}
