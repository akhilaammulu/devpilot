package com.devpilot.model;

public class EngineExecutionReport {

    private String engine; // CHECKSTYLE, PMD, SPOTBUGS, ESLINT
    private String status; // COMPLETED, SKIPPED, UNAVAILABLE, FAILED
    private int findingsCount;
    private long executionTimeMs;
    private String message;

    public EngineExecutionReport() {
    }

    public EngineExecutionReport(String engine, String status, int findingsCount, long executionTimeMs, String message) {
        this.engine = engine;
        this.status = status;
        this.findingsCount = findingsCount;
        this.executionTimeMs = executionTimeMs;
        this.message = message;
    }

    public String getEngine() {
        return engine;
    }

    public void setEngine(String engine) {
        this.engine = engine;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getFindingsCount() {
        return findingsCount;
    }

    public void setFindingsCount(int findingsCount) {
        this.findingsCount = findingsCount;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
