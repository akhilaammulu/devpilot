package com.devpilot.pr;

import com.devpilot.accessibility.*;
import com.devpilot.analysis.*;
import com.devpilot.model.PullRequest;
import com.devpilot.model.PullRequestReviewHistory;
import com.devpilot.model.Repository;
import com.devpilot.model.User;
import com.devpilot.repository.PullRequestRepository;
import com.devpilot.repository.PullRequestReviewHistoryRepository;
import com.devpilot.repository.RepositoryRepository;
import com.devpilot.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PrAnalysisServiceTest {

    private PullRequestRepository prRepo;
    private PullRequestReviewHistoryRepository historyRepo;
    private RepositoryRepository repoRepo;
    private PrAnalysisService prAnalysisService;
    private Repository testRepo;

    @BeforeEach
    void setUp() {
        prRepo = mock(PullRequestRepository.class);
        historyRepo = mock(PullRequestReviewHistoryRepository.class);
        repoRepo = mock(RepositoryRepository.class);

        CodeQualityOrchestrator qualityOrchestrator = new CodeQualityOrchestrator(
                List.of(new CheckstyleAnalyzer(), new PmdAnalyzer(), new SpotBugsAnalyzer()),
                new QualityScoreCalculator()
        );
        SecurityScanOrchestrator securityOrchestrator = new SecurityScanOrchestrator(
                new DependencyVulnerabilityScanner(),
                new SecretDetectionScanner(),
                new UnsafeConfigurationScanner(),
                new SecurityScoreCalculator()
        );
        AccessibilityScanOrchestrator a11yOrchestrator = new AccessibilityScanOrchestrator(
                new AxeCoreAccessibilityScanner(),
                new AccessibilityScoreCalculator()
        );
        GitHubPrClient gitHubPrClient = new GitHubPrClient();

        prAnalysisService = new PrAnalysisService(
                prRepo, historyRepo, repoRepo,
                qualityOrchestrator, securityOrchestrator, a11yOrchestrator,
                gitHubPrClient
        );

        User user = new User("123", "akhilaammulu", "akhila@example.com", null);
        testRepo = new Repository(user, "999", "akhilaammulu/devpilot", "main", false, "https://github.com/akhilaammulu/devpilot");
        testRepo.setId(UUID.randomUUID());
    }

    @Test
    void testTriggerPrAnalysisComputesScoresAndSummary() {
        when(repoRepo.findById(testRepo.getId())).thenReturn(Optional.of(testRepo));
        when(prRepo.findByRepositoryIdAndGithubPrNumber(testRepo.getId(), 42)).thenReturn(Optional.empty());
        when(prRepo.save(any(PullRequest.class))).thenAnswer(inv -> {
            PullRequest p = inv.getArgument(0);
            if (p.getId() == null) p.setId(UUID.randomUUID());
            return p;
        });
        when(historyRepo.save(any(PullRequestReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        PullRequest result = prAnalysisService.triggerOrCreateAndAnalyzePr(
                testRepo.getId(),
                42,
                "feat: add PR webhook analyzer",
                "akhilaammulu",
                "feature/pr-analyzer",
                "main",
                "abc1234",
                "OPEN",
                List.of("backend/src/main/java/com/devpilot/pr/PrAnalysisService.java"),
                true
        );

        assertNotNull(result);
        assertEquals(42, result.getGithubPrNumber());
        assertNotNull(result.getPrScore());
        assertTrue(result.getPrScore() >= 0 && result.getPrScore() <= 100);
        assertNotNull(result.getReviewSummary());
        assertTrue(result.getReviewSummary().contains("DevPilot Automated PR Review"));
        assertTrue(result.getReviewSummary().contains("Overall PR Score"));
        assertTrue(Boolean.TRUE.equals(result.getGithubCommentPosted()));
        verify(historyRepo, times(1)).save(any(PullRequestReviewHistory.class));
    }

    @Test
    void testHandleWebhookPullRequestOpenedEvent() {
        when(repoRepo.findFirstByFullName("akhilaammulu/devpilot")).thenReturn(Optional.of(testRepo));
        when(repoRepo.findById(testRepo.getId())).thenReturn(Optional.of(testRepo));
        when(prRepo.findByRepositoryIdAndGithubPrNumber(testRepo.getId(), 15)).thenReturn(Optional.empty());
        when(prRepo.save(any(PullRequest.class))).thenAnswer(inv -> {
            PullRequest p = inv.getArgument(0);
            if (p.getId() == null) p.setId(UUID.randomUUID());
            return p;
        });
        when(historyRepo.save(any(PullRequestReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> payload = Map.of(
                "action", "opened",
                "repository", Map.of("full_name", "akhilaammulu/devpilot"),
                "pull_request", Map.of(
                        "number", 15,
                        "title", "fix: sanitize user input",
                        "state", "open",
                        "user", Map.of("login", "akhilaammulu"),
                        "head", Map.of("ref", "fix/sanitize", "sha", "deadbeef"),
                        "base", Map.of("ref", "main")
                )
        );

        Map<String, Object> response = prAnalysisService.handleWebhookEvent("pull_request", payload);
        assertEquals("analyzed", response.get("status"));
        assertEquals(15, response.get("prNumber"));
        assertNotNull(response.get("prScore"));
    }
}
