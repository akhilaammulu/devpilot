package com.devpilot.controller;

import com.devpilot.accessibility.AccessibilityMetrics;
import com.devpilot.ai.AiAnalysisService;
import com.devpilot.ai.AiIssueAnalysis;
import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import com.devpilot.model.QualityMetrics;
import com.devpilot.model.RepositoryScan;
import com.devpilot.rag.RagAnswer;
import com.devpilot.rag.RagService;
import com.devpilot.rag.RepositoryIndexResult;
import com.devpilot.rag.RepositoryIngestionService;
import com.devpilot.repository.IssueRepository;
import com.devpilot.security.SecurityMetrics;
import com.devpilot.service.ScanService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
public class GraphQLScanController {

    private final ScanService scanService;
    private final IssueRepository issueRepository;
    private final AiAnalysisService aiAnalysisService;
    private final RagService ragService;
    private final RepositoryIngestionService repositoryIngestionService;

    public GraphQLScanController(ScanService scanService,
                                 IssueRepository issueRepository,
                                 AiAnalysisService aiAnalysisService,
                                 RagService ragService,
                                 RepositoryIngestionService repositoryIngestionService) {
        this.scanService = scanService;
        this.issueRepository = issueRepository;
        this.aiAnalysisService = aiAnalysisService;
        this.ragService = ragService;
        this.repositoryIngestionService = repositoryIngestionService;
    }

    @QueryMapping
    public List<RepositoryScan> scans(@Argument UUID repositoryId) {
        return scanService.getScansByRepositoryId(repositoryId);
    }

    @QueryMapping
    public RepositoryScan scan(@Argument UUID id) {
        return scanService.getScanById(id).orElse(null);
    }

    @QueryMapping
    public List<Issue> issues(@Argument UUID scanId,
                              @Argument IssueCategory category,
                              @Argument IssueSeverity severity,
                              @Argument String engine,
                              @Argument String status) {
        return scanService.getIssues(scanId, category, severity, engine, status);
    }

    @QueryMapping
    public QualityMetrics qualityMetrics(@Argument UUID scanId) {
        return scanService.getQualityMetrics(scanId);
    }

    @QueryMapping
    public SecurityMetrics securityMetrics(@Argument UUID scanId) {
        return scanService.getSecurityMetrics(scanId);
    }

    @QueryMapping
    public AccessibilityMetrics accessibilityMetrics(@Argument UUID scanId) {
        return scanService.getAccessibilityMetrics(scanId);
    }

    @QueryMapping
    public AiIssueAnalysis explainIssue(@Argument UUID issueId) {
        return aiAnalysisService.explainIssue(issueId);
    }

    @SchemaMapping(typeName = "RepositoryScan", field = "issues")
    public List<Issue> getIssuesForScan(RepositoryScan scan) {
        return issueRepository.findByScanIdOrderByCreatedAtDesc(scan.getId());
    }

    @MutationMapping
    public AiIssueAnalysis generateAiAnalysis(@Argument UUID issueId) {
        return aiAnalysisService.explainIssue(issueId);
    }

    @MutationMapping
    public List<AiIssueAnalysis> generateBulkAiAnalysis(@Argument UUID scanId) {
        return aiAnalysisService.analyzeScanIssues(scanId);
    }

    @MutationMapping
    public RepositoryScan startScan(@Argument Map<String, Object> input) {
        UUID repositoryId = UUID.fromString((String) input.get("repositoryId"));
        String branchName = (String) input.getOrDefault("branchName", "main");
        String commitSha = (String) input.getOrDefault("commitSha", "HEAD");

        return scanService.startScan(repositoryId, branchName, commitSha);
    }

    @MutationMapping
    public RepositoryScan startSecurityScan(@Argument Map<String, Object> input) {
        return startScan(input);
    }

    @MutationMapping
    public RepositoryScan startAccessibilityScan(@Argument Map<String, Object> input) {
        UUID repositoryId = UUID.fromString((String) input.get("repositoryId"));
        String branchName = (String) input.getOrDefault("branchName", "main");
        String commitSha = (String) input.getOrDefault("commitSha", "HEAD");

        return scanService.startAccessibilityScan(repositoryId, branchName, commitSha);
    }

    @MutationMapping
    public Issue updateIssueStatus(@Argument UUID id, @Argument String status) {
        return scanService.updateIssueStatus(id, status);
    }

    @QueryMapping
    public RagAnswer askRepository(@Argument UUID repositoryId, @Argument String query) {
        return ragService.askRepository(repositoryId, query);
    }

    @QueryMapping
    public RepositoryIndexResult repositoryIndexStatus(@Argument UUID repositoryId) {
        int count = repositoryIngestionService.getIndexedChunkCount(repositoryId);
        return new RepositoryIndexResult(repositoryId, count > 0 ? count / 3 : 0, count, count > 0 ? "INDEXED" : "NOT_INDEXED");
    }

    @MutationMapping
    public RepositoryIndexResult indexRepository(@Argument UUID repositoryId) {
        return repositoryIngestionService.indexRepository(repositoryId);
    }
}
