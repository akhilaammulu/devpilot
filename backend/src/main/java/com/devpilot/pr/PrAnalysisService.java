package com.devpilot.pr;

import com.devpilot.accessibility.AccessibilityScanOrchestrator;
import com.devpilot.analysis.CodeQualityOrchestrator;
import com.devpilot.model.*;
import com.devpilot.repository.PullRequestRepository;
import com.devpilot.repository.PullRequestReviewHistoryRepository;
import com.devpilot.repository.RepositoryRepository;
import com.devpilot.security.SecurityScanOrchestrator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;

/**
 * Automated Pull Request Code-Review Service (Phase 7).
 * Handles GitHub PR webhooks, analyzes changed files across quality/security/accessibility,
 * computes PR scores, tracks review history, and posts summary comments to GitHub.
 */
@Service
public class PrAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(PrAnalysisService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final PullRequestRepository pullRequestRepository;
    private final PullRequestReviewHistoryRepository historyRepository;
    private final RepositoryRepository repositoryRepository;
    private final CodeQualityOrchestrator qualityOrchestrator;
    private final SecurityScanOrchestrator securityOrchestrator;
    private final AccessibilityScanOrchestrator accessibilityOrchestrator;
    private final GitHubPrClient gitHubPrClient;

    @Value("${devpilot.workspace.root:/Users/akhilagadipally/Desktop/devpilot}")
    private String defaultWorkspaceRoot;

    @Autowired
    public PrAnalysisService(PullRequestRepository pullRequestRepository,
                             PullRequestReviewHistoryRepository historyRepository,
                             RepositoryRepository repositoryRepository,
                             CodeQualityOrchestrator qualityOrchestrator,
                             SecurityScanOrchestrator securityOrchestrator,
                             AccessibilityScanOrchestrator accessibilityOrchestrator,
                             GitHubPrClient gitHubPrClient) {
        this.pullRequestRepository = pullRequestRepository;
        this.historyRepository = historyRepository;
        this.repositoryRepository = repositoryRepository;
        this.qualityOrchestrator = qualityOrchestrator;
        this.securityOrchestrator = securityOrchestrator;
        this.accessibilityOrchestrator = accessibilityOrchestrator;
        this.gitHubPrClient = gitHubPrClient;
    }

    public List<PullRequest> getPullRequests(UUID repositoryId) {
        return pullRequestRepository.findByRepositoryId(repositoryId);
    }

    public Optional<PullRequest> getPullRequest(UUID id) {
        return pullRequestRepository.findById(id);
    }

    public List<PullRequestReviewHistory> getReviewHistory(UUID pullRequestId) {
        return historyRepository.findByPullRequestIdOrderByCreatedAtDesc(pullRequestId);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> handleWebhookEvent(String eventType, Map<String, Object> payload) {
        if (!"pull_request".equalsIgnoreCase(eventType)) {
            return Map.of("status", "ignored", "reason", "Unsupported event type: " + eventType);
        }

        String action = String.valueOf(payload.getOrDefault("action", ""));
        Map<String, Object> prObj = (Map<String, Object>) payload.get("pull_request");
        Map<String, Object> repoObj = (Map<String, Object>) payload.get("repository");

        if (prObj == null || repoObj == null) {
            throw new IllegalArgumentException("Invalid pull_request webhook payload: missing pull_request or repository");
        }

        String repoFullName = String.valueOf(repoObj.getOrDefault("full_name", ""));
        int prNumber = ((Number) prObj.getOrDefault("number", 0)).intValue();
        String title = String.valueOf(prObj.getOrDefault("title", "Pull Request #" + prNumber));
        String state = String.valueOf(prObj.getOrDefault("state", "open")).toUpperCase();

        Map<String, Object> userObj = (Map<String, Object>) prObj.get("user");
        String author = userObj != null ? String.valueOf(userObj.getOrDefault("login", "unknown")) : "unknown";

        Map<String, Object> headObj = (Map<String, Object>) prObj.get("head");
        Map<String, Object> baseObj = (Map<String, Object>) prObj.get("base");
        String sourceBranch = headObj != null ? String.valueOf(headObj.getOrDefault("ref", "feature")) : "feature";
        String headSha = headObj != null ? String.valueOf(headObj.getOrDefault("sha", "HEAD")) : "HEAD";
        String targetBranch = baseObj != null ? String.valueOf(baseObj.getOrDefault("ref", "main")) : "main";

        Repository repo = repositoryRepository.findFirstByFullName(repoFullName)
                .orElseGet(() -> repositoryRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Repository not registered: " + repoFullName)));

        if ("closed".equalsIgnoreCase(action)) {
            PullRequest pr = pullRequestRepository.findByRepositoryIdAndGithubPrNumber(repo.getId(), prNumber)
                    .orElse(null);
            if (pr != null) {
                boolean merged = Boolean.TRUE.equals(prObj.get("merged"));
                pr.setState(merged ? "MERGED" : "CLOSED");
                pr.setUpdatedAt(Instant.now());
                pullRequestRepository.save(pr);
            }
            return Map.of("status", "updated", "action", "closed", "prNumber", prNumber);
        }

        if ("opened".equalsIgnoreCase(action) || "synchronize".equalsIgnoreCase(action) || "reopened".equalsIgnoreCase(action)) {
            PullRequest analyzed = triggerOrCreateAndAnalyzePr(
                    repo.getId(), prNumber, title, author, sourceBranch, targetBranch, headSha, state, null, true
            );
            return Map.of(
                    "status", "analyzed",
                    "action", action,
                    "pullRequestId", analyzed.getId().toString(),
                    "prNumber", analyzed.getGithubPrNumber(),
                    "prScore", analyzed.getPrScore(),
                    "reviewStatus", analyzed.getReviewStatus(),
                    "findingsCount", analyzed.getFindingsCount(),
                    "githubCommentPosted", analyzed.getGithubCommentPosted()
            );
        }

        return Map.of("status", "ignored", "action", action);
    }

    @Transactional
    public PullRequest triggerOrCreateAndAnalyzePr(UUID repositoryId,
                                                   int prNumber,
                                                   String title,
                                                   String author,
                                                   String sourceBranch,
                                                   String targetBranch,
                                                   String headSha,
                                                   String state,
                                                   List<String> providedChangedFiles,
                                                   boolean postComment) {
        Repository repo = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new IllegalArgumentException("Repository not found: " + repositoryId));

        PullRequest pr = pullRequestRepository.findByRepositoryIdAndGithubPrNumber(repositoryId, prNumber)
                .orElseGet(() -> new PullRequest(repo, prNumber, title, sourceBranch, targetBranch, headSha));

        pr.setTitle(title);
        pr.setAuthor(author != null && !author.isBlank() ? author : "akhilaammulu");
        pr.setSourceBranch(sourceBranch);
        pr.setTargetBranch(targetBranch);
        pr.setHeadSha(headSha);
        pr.setState(state != null && !state.isBlank() ? state.toUpperCase() : "OPEN");
        pr.setUpdatedAt(Instant.now());

        PullRequest savedPr = pullRequestRepository.save(pr);
        return analyzePullRequestInternal(savedPr, providedChangedFiles, postComment);
    }

    @Transactional
    public PullRequest analyzePullRequest(UUID pullRequestId) {
        PullRequest pr = pullRequestRepository.findById(pullRequestId)
                .orElseThrow(() -> new IllegalArgumentException("PullRequest not found: " + pullRequestId));
        return analyzePullRequestInternal(pr, null, false);
    }

    @Transactional
    public PullRequest postReviewCommentToGitHub(UUID pullRequestId) {
        PullRequest pr = pullRequestRepository.findById(pullRequestId)
                .orElseThrow(() -> new IllegalArgumentException("PullRequest not found: " + pullRequestId));

        if (pr.getReviewSummary() == null || pr.getReviewSummary().isBlank()) {
            pr = analyzePullRequestInternal(pr, null, false);
        }

        String repoFullName = pr.getRepository().getFullName();
        GitHubPrClient.PrCommentResult result = gitHubPrClient.postPrComment(
                repoFullName, pr.getGithubPrNumber(), pr.getReviewSummary()
        );

        pr.setGithubCommentPosted(result.posted());
        pr.setGithubCommentUrl(result.commentUrl());
        pr.setUpdatedAt(Instant.now());
        return pullRequestRepository.save(pr);
    }

    private PullRequest analyzePullRequestInternal(PullRequest pr, List<String> providedChangedFiles, boolean postComment) {
        Path repoPath = (defaultWorkspaceRoot != null && !defaultWorkspaceRoot.isBlank())
                ? Paths.get(defaultWorkspaceRoot)
                : Paths.get(".");

        String repoFullName = pr.getRepository().getFullName();
        List<String> changedFiles = (providedChangedFiles != null && !providedChangedFiles.isEmpty())
                ? providedChangedFiles
                : gitHubPrClient.fetchChangedFiles(repoFullName, pr.getGithubPrNumber(), repoPath);

        log.info("Analyzing PR #{} ({}) on {} ({} changed files)",
                pr.getGithubPrNumber(), pr.getTitle(), repoFullName, changedFiles.size());

        // Execute multi-domain analysis
        CodeQualityOrchestrator.QualityScanResult qualityResult =
                qualityOrchestrator.executeQualityScan(null, repoPath, pr.getSourceBranch());
        SecurityScanOrchestrator.SecurityScanResult securityResult =
                securityOrchestrator.executeSecurityScan(null, repoPath, pr.getSourceBranch());
        AccessibilityScanOrchestrator.AccessibilityScanResult a11yResult =
                accessibilityOrchestrator.executeAccessibilityScan(null, repoPath, "http://localhost:3001");

        List<Issue> allIssues = new ArrayList<>();
        allIssues.addAll(qualityResult.getIssues());
        allIssues.addAll(securityResult.getIssues());
        allIssues.addAll(a11yResult.getIssues());

        // Scope findings to changed files when available
        List<Issue> scopedIssues = filterIssuesToChangedFiles(allIssues, changedFiles);

        int qualityScore = computeScopedScore(
                qualityResult.getMetrics().getQualityScore(),
                scopedIssues, IssueCategory.CODE_QUALITY, !changedFiles.isEmpty()
        );
        int securityScore = computeScopedScore(
                securityResult.getMetrics().getSecurityScore(),
                scopedIssues, IssueCategory.SECURITY, !changedFiles.isEmpty()
        );
        int a11yScore = computeScopedScore(
                a11yResult.getMetrics().getAccessibilityScore(),
                scopedIssues, IssueCategory.ACCESSIBILITY, !changedFiles.isEmpty()
        );

        int prScore = (int) Math.round((qualityScore * 0.40) + (securityScore * 0.40) + (a11yScore * 0.20));

        boolean hasCritical = scopedIssues.stream().anyMatch(i -> i.getSeverity() == IssueSeverity.CRITICAL);
        boolean hasHigh = scopedIssues.stream().anyMatch(i -> i.getSeverity() == IssueSeverity.HIGH);

        String reviewStatus;
        if (hasCritical || prScore < 70) {
            reviewStatus = "FAILED";
        } else if (hasHigh || prScore < 85) {
            reviewStatus = "WARNINGS";
        } else {
            reviewStatus = "PASSED";
        }

        String summary = buildMarkdownSummary(
                pr, prScore, qualityScore, securityScore, a11yScore, reviewStatus, changedFiles, scopedIssues
        );

        pr.setPrScore(prScore);
        pr.setQualityScore(qualityScore);
        pr.setSecurityScore(securityScore);
        pr.setAccessibilityScore(a11yScore);
        pr.setReviewStatus(reviewStatus);
        pr.setReviewSummary(summary);
        pr.setChangedFilesCount(changedFiles.size());
        pr.setFindingsCount(scopedIssues.size());
        pr.setLastAnalyzedAt(Instant.now());
        pr.setUpdatedAt(Instant.now());

        try {
            pr.setChangedFilesJson(MAPPER.writeValueAsString(changedFiles));
        } catch (Exception e) {
            pr.setChangedFilesJson("[]");
        }

        if (postComment) {
            GitHubPrClient.PrCommentResult commentRes = gitHubPrClient.postPrComment(
                    repoFullName, pr.getGithubPrNumber(), summary
            );
            pr.setGithubCommentPosted(commentRes.posted());
            pr.setGithubCommentUrl(commentRes.commentUrl());
        }

        PullRequest saved = pullRequestRepository.save(pr);

        // Save review history snapshot
        PullRequestReviewHistory history = new PullRequestReviewHistory();
        history.setPullRequestId(saved.getId());
        history.setCommitSha(saved.getHeadSha());
        history.setPrScore(prScore);
        history.setQualityScore(qualityScore);
        history.setSecurityScore(securityScore);
        history.setAccessibilityScore(a11yScore);
        history.setFindingsCount(scopedIssues.size());
        history.setReviewStatus(reviewStatus);
        history.setReviewSummary(summary);
        history.setGithubCommentPosted(Boolean.TRUE.equals(saved.getGithubCommentPosted()));
        historyRepository.save(history);

        return saved;
    }

    private List<Issue> filterIssuesToChangedFiles(List<Issue> allIssues, List<String> changedFiles) {
        if (changedFiles == null || changedFiles.isEmpty()) {
            return allIssues;
        }
        List<Issue> matched = new ArrayList<>();
        for (Issue issue : allIssues) {
            String path = issue.getFilePath() != null ? issue.getFilePath().replace('\\', '/') : "";
            for (String changed : changedFiles) {
                String normChanged = changed.replace('\\', '/');
                if (path.endsWith(normChanged) || normChanged.endsWith(path) || path.contains(normChanged)) {
                    matched.add(issue);
                    break;
                }
            }
        }
        return matched;
    }

    private int computeScopedScore(int baselineScore, List<Issue> scopedIssues, IssueCategory category, boolean hasChangedFiles) {
        if (!hasChangedFiles) {
            return baselineScore;
        }
        long critical = scopedIssues.stream().filter(i -> i.getCategory() == category && i.getSeverity() == IssueSeverity.CRITICAL).count();
        long high = scopedIssues.stream().filter(i -> i.getCategory() == category && i.getSeverity() == IssueSeverity.HIGH).count();
        long medium = scopedIssues.stream().filter(i -> i.getCategory() == category && i.getSeverity() == IssueSeverity.MEDIUM).count();
        long low = scopedIssues.stream().filter(i -> i.getCategory() == category && i.getSeverity() == IssueSeverity.LOW).count();

        int penalty = (int) (critical * 20 + high * 10 + medium * 4 + low * 1);
        return Math.max(0, 100 - penalty);
    }

    private String buildMarkdownSummary(PullRequest pr,
                                        int prScore,
                                        int qualityScore,
                                        int securityScore,
                                        int a11yScore,
                                        String reviewStatus,
                                        List<String> changedFiles,
                                        List<Issue> scopedIssues) {
        String badge = "PASSED".equals(reviewStatus) ? "✅ PASSED"
                : "WARNINGS".equals(reviewStatus) ? "⚠️ WARNINGS" : "❌ FAILED";

        StringBuilder sb = new StringBuilder();
        sb.append("## DevPilot Automated PR Review — ").append(badge).append("\n\n");
        sb.append("**PR #").append(pr.getGithubPrNumber()).append("**: ").append(pr.getTitle())
                .append(" (`").append(pr.getSourceBranch()).append("` → `").append(pr.getTargetBranch()).append("`)\n\n");

        sb.append("| Metric | Score | Status |\n");
        sb.append("|---|---|---|\n");
        sb.append("| **Overall PR Score** | **").append(prScore).append("/100** | ").append(badge).append(" |\n");
        sb.append("| Code Quality | ").append(qualityScore).append("/100 | Checkstyle · PMD · SpotBugs · ESLint |\n");
        sb.append("| Security | ").append(securityScore).append("/100 | Dependencies · Secrets · Config |\n");
        sb.append("| Accessibility | ").append(a11yScore).append("/100 | Playwright · axe-core (WCAG 2.1) |\n\n");

        if (!changedFiles.isEmpty()) {
            sb.append("### Changed Files Analyzed (").append(changedFiles.size()).append(")\n");
            for (int i = 0; i < Math.min(changedFiles.size(), 10); i++) {
                sb.append("- `").append(changedFiles.get(i)).append("`\n");
            }
            if (changedFiles.size() > 10) {
                sb.append("- ...and ").append(changedFiles.size() - 10).append(" more files\n");
            }
            sb.append("\n");
        }

        sb.append("### Findings Summary (").append(scopedIssues.size()).append(" total)\n");
        if (scopedIssues.isEmpty()) {
            sb.append("No quality, security, or accessibility issues were introduced in the changed files.\n");
        } else {
            for (int i = 0; i < Math.min(scopedIssues.size(), 8); i++) {
                Issue issue = scopedIssues.get(i);
                sb.append("- **[").append(issue.getSeverity()).append("]** `").append(issue.getRuleId()).append("` in `")
                        .append(issue.getFilePath()).append(":").append(issue.getLineStart() != null ? issue.getLineStart() : 1)
                        .append("` — ").append(issue.getMessage()).append("\n");
            }
            if (scopedIssues.size() > 8) {
                sb.append("- ...and ").append(scopedIssues.size() - 8).append(" additional findings in the DevPilot dashboard.\n");
            }
        }

        return sb.toString();
    }
}
