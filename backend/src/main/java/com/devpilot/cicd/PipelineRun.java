package com.devpilot.cicd;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pipeline_runs")
public class PipelineRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pipeline_config_id", nullable = false)
    private UUID pipelineConfigId;

    @Column(name = "repository_id", nullable = false)
    private UUID repositoryId;

    @Column(name = "run_number", nullable = false)
    private int runNumber;

    @Column(name = "pipeline_name", nullable = false)
    private String pipelineName;

    @Column(nullable = false)
    private String branch;

    @Column(name = "commit_sha", nullable = false)
    private String commitSha;

    @Column(name = "trigger_type", nullable = false, length = 32)
    private String triggerType = "MANUAL";

    @Column(nullable = false, length = 32)
    private String status = "QUEUED";

    @Column(name = "quality_score")
    private Integer qualityScore;

    @Column(name = "security_score")
    private Integer securityScore;

    @Column(name = "test_coverage")
    private Integer testCoverage;

    @Column(name = "quality_gate_passed")
    private Boolean qualityGatePassed;

    @Column(name = "quality_gate_reason", columnDefinition = "TEXT")
    private String qualityGateReason;

    @Column(name = "duration_ms")
    private Long durationMs = 0L;

    @Column(name = "stages_json", columnDefinition = "TEXT")
    private String stagesJson;

    @Column(name = "logs_json", columnDefinition = "TEXT")
    private String logsJson;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    public PipelineRun() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getPipelineConfigId() {
        return pipelineConfigId;
    }

    public void setPipelineConfigId(UUID pipelineConfigId) {
        this.pipelineConfigId = pipelineConfigId;
    }

    public UUID getRepositoryId() {
        return repositoryId;
    }

    public void setRepositoryId(UUID repositoryId) {
        this.repositoryId = repositoryId;
    }

    public int getRunNumber() {
        return runNumber;
    }

    public void setRunNumber(int runNumber) {
        this.runNumber = runNumber;
    }

    public String getPipelineName() {
        return pipelineName;
    }

    public void setPipelineName(String pipelineName) {
        this.pipelineName = pipelineName;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getCommitSha() {
        return commitSha;
    }

    public void setCommitSha(String commitSha) {
        this.commitSha = commitSha;
    }

    public String getTriggerType() {
        return triggerType;
    }

    public void setTriggerType(String triggerType) {
        this.triggerType = triggerType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Integer qualityScore) {
        this.qualityScore = qualityScore;
    }

    public Integer getSecurityScore() {
        return securityScore;
    }

    public void setSecurityScore(Integer securityScore) {
        this.securityScore = securityScore;
    }

    public Integer getTestCoverage() {
        return testCoverage;
    }

    public void setTestCoverage(Integer testCoverage) {
        this.testCoverage = testCoverage;
    }

    public Boolean getQualityGatePassed() {
        return qualityGatePassed;
    }

    public void setQualityGatePassed(Boolean qualityGatePassed) {
        this.qualityGatePassed = qualityGatePassed;
    }

    public String getQualityGateReason() {
        return qualityGateReason;
    }

    public void setQualityGateReason(String qualityGateReason) {
        this.qualityGateReason = qualityGateReason;
    }

    public Long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(Long durationMs) {
        this.durationMs = durationMs;
    }

    public String getStagesJson() {
        return stagesJson;
    }

    public void setStagesJson(String stagesJson) {
        this.stagesJson = stagesJson;
    }

    public String getLogsJson() {
        return logsJson;
    }

    public void setLogsJson(String logsJson) {
        this.logsJson = logsJson;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
