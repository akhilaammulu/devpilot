package com.devpilot.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "repository_scans")
public class RepositoryScan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repository_id", nullable = false)
    private Repository repository;

    @Column(name = "commit_sha", nullable = false)
    private String commitSha;

    @Column(name = "branch_name", nullable = false)
    private String branchName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScanStatus status = ScanStatus.PENDING;

    @Column(name = "quality_score")
    private Integer qualityScore;

    @Column(name = "security_score")
    private Integer securityScore;

    @Column(name = "accessibility_score")
    private Integer accessibilityScore;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @OneToMany(mappedBy = "scan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Issue> issues = new ArrayList<>();

    @Transient
    private List<EngineExecutionReport> engineReports = new ArrayList<>();

    public RepositoryScan() {
    }

    public RepositoryScan(Repository repository, String branchName, String commitSha) {
        this.repository = repository;
        this.branchName = branchName;
        this.commitSha = commitSha;
        this.status = ScanStatus.PENDING;
        this.startedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Repository getRepository() {
        return repository;
    }

    public void setRepository(Repository repository) {
        this.repository = repository;
    }

    public String getCommitSha() {
        return commitSha;
    }

    public void setCommitSha(String commitSha) {
        this.commitSha = commitSha;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public ScanStatus getStatus() {
        return status;
    }

    public void setStatus(ScanStatus status) {
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

    public Integer getAccessibilityScore() {
        return accessibilityScore;
    }

    public void setAccessibilityScore(Integer accessibilityScore) {
        this.accessibilityScore = accessibilityScore;
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

    public List<Issue> getIssues() {
        return issues;
    }

    public void setIssues(List<Issue> issues) {
        this.issues = issues;
    }

    public List<EngineExecutionReport> getEngineReports() {
        return engineReports;
    }

    public void setEngineReports(List<EngineExecutionReport> engineReports) {
        this.engineReports = engineReports;
    }
}
