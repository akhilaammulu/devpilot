package com.devpilot.cicd;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pipeline_configs")
public class PipelineConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "repository_id", nullable = false)
    private UUID repositoryId;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 128)
    private String branch = "main";

    @Column(nullable = false, length = 64)
    private String language = "Java";

    @Column(name = "build_tool", nullable = false, length = 64)
    private String buildTool = "Maven";

    @Column(name = "test_framework", nullable = false, length = 64)
    private String testFramework = "JUnit 5";

    @Column(nullable = false, length = 64)
    private String environment = "Development";

    @Column(name = "deployment_target", nullable = false, length = 128)
    private String deploymentTarget = "AWS ECS";

    @Column(name = "triggers_json", columnDefinition = "TEXT")
    private String triggersJson = "[\"PUSH\",\"PULL_REQUEST\",\"MANUAL\"]";

    @Column(name = "stages_json", columnDefinition = "TEXT")
    private String stagesJson;

    @Column(name = "quality_gate_json", columnDefinition = "TEXT")
    private String qualityGateJson = "{\"maxCritical\":0,\"maxHigh\":5,\"minCoverage\":80,\"requireBuildPass\":true,\"requireSecurityPass\":true}";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public PipelineConfig() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRepositoryId() {
        return repositoryId;
    }

    public void setRepositoryId(UUID repositoryId) {
        this.repositoryId = repositoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getBuildTool() {
        return buildTool;
    }

    public void setBuildTool(String buildTool) {
        this.buildTool = buildTool;
    }

    public String getTestFramework() {
        return testFramework;
    }

    public void setTestFramework(String testFramework) {
        this.testFramework = testFramework;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getDeploymentTarget() {
        return deploymentTarget;
    }

    public void setDeploymentTarget(String deploymentTarget) {
        this.deploymentTarget = deploymentTarget;
    }

    public String getTriggersJson() {
        return triggersJson;
    }

    public void setTriggersJson(String triggersJson) {
        this.triggersJson = triggersJson;
    }

    public String getStagesJson() {
        return stagesJson;
    }

    public void setStagesJson(String stagesJson) {
        this.stagesJson = stagesJson;
    }

    public String getQualityGateJson() {
        return qualityGateJson;
    }

    public void setQualityGateJson(String qualityGateJson) {
        this.qualityGateJson = qualityGateJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
