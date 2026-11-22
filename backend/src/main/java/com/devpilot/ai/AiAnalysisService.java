package com.devpilot.ai;

import com.devpilot.model.Issue;
import com.devpilot.repository.IssueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * AI Analysis Service (Phase 5).
 * Coordinates finding explanations, root-cause analyses, code fixes,
 * and automated regression tests.
 */
@Service
public class AiAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AiAnalysisService.class);

    private final IssueRepository issueRepository;
    private final LlmClient llmClient;

    @Value("${devpilot.workspace.root:/Users/akhilagadipally/Desktop/devpilot}")
    private String defaultWorkspaceRoot;

    @Autowired
    public AiAnalysisService(IssueRepository issueRepository, LlmClient llmClient) {
        this.issueRepository = issueRepository;
        this.llmClient = llmClient;
    }

    public AiAnalysisService(IssueRepository issueRepository, LlmClient llmClient, String defaultWorkspaceRoot) {
        this.issueRepository = issueRepository;
        this.llmClient = llmClient;
        this.defaultWorkspaceRoot = defaultWorkspaceRoot;
    }

    @Transactional
    public AiIssueAnalysis explainIssue(UUID issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with id: " + issueId));

        log.info("Generating AI Analysis for issue {} ({})", issueId, issue.getRuleId());

        Path repoRoot = (defaultWorkspaceRoot != null && !defaultWorkspaceRoot.isBlank())
                ? Paths.get(defaultWorkspaceRoot)
                : Paths.get(".");
        AiIssueAnalysis analysis = llmClient.analyzeIssue(issue, repoRoot);

        // Persist deep AI analysis into issue
        issue.setAiExplanation(analysis.getWhyItMatters());
        issue.setAiFixSuggestion(analysis.getCodeFix());
        issue.setAiWhyItMatters(analysis.getWhyItMatters());
        issue.setAiSuggestedUnitTest(analysis.getSuggestedUnitTest());
        issue.setAiModelUsed(analysis.getModelUsed());
        issueRepository.save(issue);

        return analysis;
    }

    @Transactional
    public List<AiIssueAnalysis> analyzeScanIssues(UUID scanId) {
        List<Issue> issues = issueRepository.findByScanId(scanId);
        List<AiIssueAnalysis> results = new ArrayList<>();

        Path repoRoot = (defaultWorkspaceRoot != null && !defaultWorkspaceRoot.isBlank())
                ? Paths.get(defaultWorkspaceRoot)
                : Paths.get(".");
        for (Issue issue : issues) {
            try {
                AiIssueAnalysis analysis = llmClient.analyzeIssue(issue, repoRoot);
                issue.setAiExplanation(analysis.getWhyItMatters());
                issue.setAiFixSuggestion(analysis.getCodeFix());
                issue.setAiWhyItMatters(analysis.getWhyItMatters());
                issue.setAiSuggestedUnitTest(analysis.getSuggestedUnitTest());
                issue.setAiModelUsed(analysis.getModelUsed());
                issueRepository.save(issue);
                results.add(analysis);
            } catch (Exception e) {
                log.warn("Failed generating AI analysis for issue {}: {}", issue.getId(), e.getMessage());
            }
        }

        return results;
    }
}
