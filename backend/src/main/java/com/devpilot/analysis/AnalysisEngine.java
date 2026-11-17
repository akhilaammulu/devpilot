package com.devpilot.analysis;

public enum AnalysisEngine {
    // Code Quality Engines (Phase 2)
    CHECKSTYLE("Checkstyle", "Java"),
    PMD("PMD", "Java"),
    SPOTBUGS("SpotBugs", "Java"),
    ESLINT("ESLint", "TypeScript"),

    // Security Analysis Engines (Phase 3)
    DEPENDENCY_CHECK("DependencyCheck", "Polyglot"),
    SECRET_SCANNER("SecretDetection", "Polyglot"),
    CONFIG_AUDIT("ConfigAudit", "Configuration");

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
