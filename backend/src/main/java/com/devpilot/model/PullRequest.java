package com.devpilot.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pull_requests")
public class PullRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repository_id", nullable = false)
    private Repository repository;

    @Column(name = "github_pr_number", nullable = false)
    private int githubPrNumber;

    @Column(nullable = false)
    private String title;

    @Column(name = "source_branch", nullable = false)
    private String sourceBranch;

    @Column(name = "target_branch", nullable = false)
    private String targetBranch;

    @Column(name = "head_sha", nullable = false)
    private String headSha;

    @Column(nullable = false)
    private String state = "OPEN";

    @Column(name = "opened_at", nullable = false)
    private Instant openedAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(length = 128)
    private String author = "akhilaammulu";

    @Column(name = "pr_score")
    private Integer prScore;

    @Column(name = "quality_score")
    private Integer qualityScore;

    @Column(name = "security_score")
    private Integer securityScore;

    @Column(name = "accessibility_score")
    private Integer accessibilityScore;

    @Column(name = "review_status", length = 32)
    private String reviewStatus = "PENDING";

    @Column(name = "review_summary", columnDefinition = "TEXT")
    private String reviewSummary;

    @Column(name = "changed_files_count")
    private Integer changedFilesCount = 0;

    @Column(name = "changed_files_json", columnDefinition = "TEXT")
    private String changedFilesJson;

    @Column(name = "findings_count")
    private Integer findingsCount = 0;

    @Column(name = "github_comment_posted")
    private Boolean githubCommentPosted = false;

    @Column(name = "github_comment_url", length = 512)
    private String githubCommentUrl;

    @Column(name = "last_analyzed_at")
    private Instant lastAnalyzedAt;

    public PullRequest() {
    }

    public PullRequest(Repository repository, int githubPrNumber, String title, String sourceBranch, String targetBranch, String headSha) {
        this.repository = repository;
        this.githubPrNumber = githubPrNumber;
        this.title = title;
        this.sourceBranch = sourceBranch;
        this.targetBranch = targetBranch;
        this.headSha = headSha;
        this.openedAt = Instant.now();
        this.updatedAt = Instant.now();
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

    public int getGithubPrNumber() {
        return githubPrNumber;
    }

    public void setGithubPrNumber(int githubPrNumber) {
        this.githubPrNumber = githubPrNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSourceBranch() {
        return sourceBranch;
    }

    public void setSourceBranch(String sourceBranch) {
        this.sourceBranch = sourceBranch;
    }

    public String getTargetBranch() {
        return targetBranch;
    }

    public void setTargetBranch(String targetBranch) {
        this.targetBranch = targetBranch;
    }

    public String getHeadSha() {
        return headSha;
    }

    public void setHeadSha(String headSha) {
        this.headSha = headSha;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Instant getOpenedAt() {
        return openedAt;
    }

    public void setOpenedAt(Instant openedAt) {
        this.openedAt = openedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Integer getPrScore() {
        return prScore;
    }

    public void setPrScore(Integer prScore) {
        this.prScore = prScore;
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

    public String getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(String reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public String getReviewSummary() {
        return reviewSummary;
    }

    public void setReviewSummary(String reviewSummary) {
        this.reviewSummary = reviewSummary;
    }

    public Integer getChangedFilesCount() {
        return changedFilesCount;
    }

    public void setChangedFilesCount(Integer changedFilesCount) {
        this.changedFilesCount = changedFilesCount;
    }

    public String getChangedFilesJson() {
        return changedFilesJson;
    }

    public void setChangedFilesJson(String changedFilesJson) {
        this.changedFilesJson = changedFilesJson;
    }

    public Integer getFindingsCount() {
        return findingsCount;
    }

    public void setFindingsCount(Integer findingsCount) {
        this.findingsCount = findingsCount;
    }

    public Boolean getGithubCommentPosted() {
        return githubCommentPosted;
    }

    public void setGithubCommentPosted(Boolean githubCommentPosted) {
        this.githubCommentPosted = githubCommentPosted;
    }

    public String getGithubCommentUrl() {
        return githubCommentUrl;
    }

    public void setGithubCommentUrl(String githubCommentUrl) {
        this.githubCommentUrl = githubCommentUrl;
    }

    public Instant getLastAnalyzedAt() {
        return lastAnalyzedAt;
    }

    public void setLastAnalyzedAt(Instant lastAnalyzedAt) {
        this.lastAnalyzedAt = lastAnalyzedAt;
    }
}
