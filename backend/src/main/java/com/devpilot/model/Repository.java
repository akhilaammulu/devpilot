package com.devpilot.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "repositories")
public class Repository {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "github_repo_id", nullable = false)
    private String githubRepoId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "default_branch", nullable = false)
    private String defaultBranch = "main";

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate = false;

    @Column(name = "html_url", nullable = false)
    private String htmlUrl;

    @Column(name = "connected_at", nullable = false, updatable = false)
    private Instant connectedAt = Instant.now();

    @OneToMany(mappedBy = "repository", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RepositoryScan> scans = new ArrayList<>();

    @OneToMany(mappedBy = "repository", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PullRequest> pullRequests = new ArrayList<>();

    public Repository() {
    }

    public Repository(User user, String githubRepoId, String fullName, String defaultBranch, boolean isPrivate, String htmlUrl) {
        this.user = user;
        this.githubRepoId = githubRepoId;
        this.fullName = fullName;
        this.defaultBranch = defaultBranch;
        this.isPrivate = isPrivate;
        this.htmlUrl = htmlUrl;
        this.connectedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getGithubRepoId() {
        return githubRepoId;
    }

    public void setGithubRepoId(String githubRepoId) {
        this.githubRepoId = githubRepoId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDefaultBranch() {
        return defaultBranch;
    }

    public void setDefaultBranch(String defaultBranch) {
        this.defaultBranch = defaultBranch;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean aPrivate) {
        isPrivate = aPrivate;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

    public void setHtmlUrl(String htmlUrl) {
        this.htmlUrl = htmlUrl;
    }

    public Instant getConnectedAt() {
        return connectedAt;
    }

    public void setConnectedAt(Instant connectedAt) {
        this.connectedAt = connectedAt;
    }

    public List<RepositoryScan> getScans() {
        return scans;
    }

    public void setScans(List<RepositoryScan> scans) {
        this.scans = scans;
    }

    public List<PullRequest> getPullRequests() {
        return pullRequests;
    }

    public void setPullRequests(List<PullRequest> pullRequests) {
        this.pullRequests = pullRequests;
    }
}
