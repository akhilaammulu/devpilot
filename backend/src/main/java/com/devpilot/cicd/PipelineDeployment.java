package com.devpilot.cicd;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pipeline_deployments")
public class PipelineDeployment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pipeline_run_id", nullable = false)
    private UUID pipelineRunId;

    @Column(name = "repository_id", nullable = false)
    private UUID repositoryId;

    @Column(nullable = false, length = 32)
    private String environment = "DEVELOPMENT";

    @Column(nullable = false, length = 64)
    private String version;

    @Column(name = "commit_sha", nullable = false, length = 64)
    private String commitSha;

    @Column(nullable = false, length = 32)
    private String status = "DEPLOYED";

    @Column(name = "deployed_by", length = 128)
    private String deployedBy = "akhilaammulu";

    @Column(name = "rolled_back_from_id")
    private UUID rolledBackFromId;

    @Column(name = "deployed_at", nullable = false)
    private Instant deployedAt = Instant.now();

    public PipelineDeployment() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getPipelineRunId() {
        return pipelineRunId;
    }

    public void setPipelineRunId(UUID pipelineRunId) {
        this.pipelineRunId = pipelineRunId;
    }

    public UUID getRepositoryId() {
        return repositoryId;
    }

    public void setRepositoryId(UUID repositoryId) {
        this.repositoryId = repositoryId;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCommitSha() {
        return commitSha;
    }

    public void setCommitSha(String commitSha) {
        this.commitSha = commitSha;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDeployedBy() {
        return deployedBy;
    }

    public void setDeployedBy(String deployedBy) {
        this.deployedBy = deployedBy;
    }

    public UUID getRolledBackFromId() {
        return rolledBackFromId;
    }

    public void setRolledBackFromId(UUID rolledBackFromId) {
        this.rolledBackFromId = rolledBackFromId;
    }

    public Instant getDeployedAt() {
        return deployedAt;
    }

    public void setDeployedAt(Instant deployedAt) {
        this.deployedAt = deployedAt;
    }
}
