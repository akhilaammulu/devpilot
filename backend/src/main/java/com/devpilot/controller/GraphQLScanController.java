package com.devpilot.controller;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import com.devpilot.model.QualityMetrics;
import com.devpilot.model.RepositoryScan;
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

    public GraphQLScanController(ScanService scanService, IssueRepository issueRepository) {
        this.scanService = scanService;
        this.issueRepository = issueRepository;
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

    @SchemaMapping(typeName = "RepositoryScan", field = "issues")
    public List<Issue> getIssuesForScan(RepositoryScan scan) {
        return issueRepository.findByScanIdOrderByCreatedAtDesc(scan.getId());
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
    public Issue updateIssueStatus(@Argument UUID id, @Argument String status) {
        return scanService.updateIssueStatus(id, status);
    }
}
