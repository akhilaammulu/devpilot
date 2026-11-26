package com.devpilot.cicd;

import java.util.ArrayList;
import java.util.List;

/**
 * Shared DTO records for CI/CD pipeline configuration, stage execution, logs, and metrics.
 */
public class PipelineDtos {

    public static class StageDefinition {
        private String name;
        private String type; // SOURCE, BUILD, QUALITY, SECURITY, TEST, PACKAGE, DEPLOY
        private String command;
        private boolean enabled = true;

        public StageDefinition() {}

        public StageDefinition(String name, String type, String command, boolean enabled) {
            this.name = name;
            this.type = type;
            this.command = command;
            this.enabled = enabled;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getCommand() { return command; }
        public void setCommand(String command) { this.command = command; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
    }

    public static class StageResult {
        private String name;
        private String type;
        private String status; // QUEUED, RUNNING, PASSED, FAILED, CANCELLED, SKIPPED
        private long durationMs;
        private int errorsCount;
        private int warningsCount;
        private Integer qualityScore;
        private List<String> artifacts = new ArrayList<>();
        private String command;

        public StageResult() {}

        public StageResult(String name, String type, String status, String command) {
            this.name = name;
            this.type = type;
            this.status = status;
            this.command = command;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getDurationMs() { return durationMs; }
        public void setDurationMs(long durationMs) { this.durationMs = durationMs; }
        public int getErrorsCount() { return errorsCount; }
        public void setErrorsCount(int errorsCount) { this.errorsCount = errorsCount; }
        public int getWarningsCount() { return warningsCount; }
        public void setWarningsCount(int warningsCount) { this.warningsCount = warningsCount; }
        public Integer getQualityScore() { return qualityScore; }
        public void setQualityScore(Integer qualityScore) { this.qualityScore = qualityScore; }
        public List<String> getArtifacts() { return artifacts; }
        public void setArtifacts(List<String> artifacts) { this.artifacts = artifacts; }
        public String getCommand() { return command; }
        public void setCommand(String command) { this.command = command; }
    }

    public static class LogEntry {
        private String timestamp;
        private String stage;
        private String level; // INFO, WARN, ERROR, CMD
        private String command;
        private String message;

        public LogEntry() {}

        public LogEntry(String timestamp, String stage, String level, String command, String message) {
            this.timestamp = timestamp;
            this.stage = stage;
            this.level = level;
            this.command = command;
            this.message = message;
        }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public String getStage() { return stage; }
        public void setStage(String stage) { this.stage = stage; }
        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }
        public String getCommand() { return command; }
        public void setCommand(String command) { this.command = command; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class QualityGateConfig {
        private int maxCritical = 0;
        private int maxHigh = 5;
        private int minCoverage = 80;
        private boolean requireBuildPass = true;
        private boolean requireSecurityPass = true;

        public int getMaxCritical() { return maxCritical; }
        public void setMaxCritical(int maxCritical) { this.maxCritical = maxCritical; }
        public int getMaxHigh() { return maxHigh; }
        public void setMaxHigh(int maxHigh) { this.maxHigh = maxHigh; }
        public int getMinCoverage() { return minCoverage; }
        public void setMinCoverage(int minCoverage) { this.minCoverage = minCoverage; }
        public boolean isRequireBuildPass() { return requireBuildPass; }
        public void setRequireBuildPass(boolean requireBuildPass) { this.requireBuildPass = requireBuildPass; }
        public boolean isRequireSecurityPass() { return requireSecurityPass; }
        public void setRequireSecurityPass(boolean requireSecurityPass) { this.requireSecurityPass = requireSecurityPass; }
    }

    public record PipelineMetrics(
            int totalPipelines,
            int runningPipelines,
            int successfulPipelines,
            int failedPipelines,
            int successRate,
            long avgDurationMs,
            String latestDeploymentStatus,
            String latestDeploymentEnv
    ) {}
}
