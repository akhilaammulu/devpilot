package com.devpilot.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pull_request_reviews")
public class PullRequestReviewHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pull_request_id", nullable = false)
    private UUID pullRequestId;

    @Column(name = "commit_sha", nullable = false)
    private String commitSha;

    @Column(name = "pr_score", nullable = false)
    private int prScore;

    @Column(name = "quality_score", nullable = false)
    private int qualityScore;

    @Column(name = "security_score", nullable = false)
    private int securityScore;

    @Column(name = "accessibility_score", nullable = false)
    private int accessibilityScore;

    @Column(name = "findings_count", nullable = false)
    private int findingsCount;

    @Column(name = "review_status", nullable = false, length = 32)
    private String reviewStatus;

    @Column(name = "review_summary", columnDefinition = "TEXT")
    private String reviewSummary;

    @Column(name = "github_comment_posted", nullable = false)
    private boolean githubCommentPosted;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public PullRequestReviewHistory() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getPullRequestId() {
        return pullRequestId;
    }

    public void setPullRequestId(UUID pullRequestId) {
        this.pullRequestId = pullRequestId;
    }

    public String getCommitSha() {
        return commitSha;
    }

    public void setCommitSha(String commitSha) {
        this.commitSha = commitSha;
    }

    public int getPrScore() {
        return prScore;
    }

    public void setPrScore(int prScore) {
        this.prScore = prScore;
    }

    public int getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(int qualityScore) {
        this.qualityScore = qualityScore;
    }

    public int getSecurityScore() {
        return securityScore;
    }

    public void setSecurityScore(int securityScore) {
        this.securityScore = securityScore;
    }

    public int getAccessibilityScore() {
        return accessibilityScore;
    }

    public void setAccessibilityScore(int accessibilityScore) {
        this.accessibilityScore = accessibilityScore;
    }

    public int getFindingsCount() {
        return findingsCount;
    }

    public void setFindingsCount(int findingsCount) {
        this.findingsCount = findingsCount;
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

    public boolean isGithubCommentPosted() {
        return githubCommentPosted;
    }

    public void setGithubCommentPosted(boolean githubCommentPosted) {
        this.githubCommentPosted = githubCommentPosted;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
