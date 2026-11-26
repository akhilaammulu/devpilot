package com.devpilot.controller;

import com.devpilot.model.PullRequest;
import com.devpilot.model.PullRequestReviewHistory;
import com.devpilot.pr.PrAnalysisService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
public class GraphQLPrController {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final PrAnalysisService prAnalysisService;

    public GraphQLPrController(PrAnalysisService prAnalysisService) {
        this.prAnalysisService = prAnalysisService;
    }

    @QueryMapping
    public List<PullRequest> pullRequests(@Argument UUID repositoryId) {
        return prAnalysisService.getPullRequests(repositoryId);
    }

    @QueryMapping
    public PullRequest pullRequest(@Argument UUID id) {
        return prAnalysisService.getPullRequest(id).orElse(null);
    }

    @MutationMapping
    public PullRequest analyzePullRequest(@Argument UUID pullRequestId) {
        return prAnalysisService.analyzePullRequest(pullRequestId);
    }

    @MutationMapping
    @SuppressWarnings("unchecked")
    public PullRequest triggerPullRequestAnalysis(@Argument Map<String, Object> input) {
        UUID repositoryId = UUID.fromString(String.valueOf(input.get("repositoryId")));
        int prNumber = ((Number) input.get("prNumber")).intValue();
        String title = String.valueOf(input.get("title"));
        String author = input.get("author") != null ? String.valueOf(input.get("author")) : "akhilaammulu";
        String sourceBranch = String.valueOf(input.get("sourceBranch"));
        String targetBranch = String.valueOf(input.get("targetBranch"));
        String headSha = String.valueOf(input.get("headSha"));
        List<String> changedFiles = (List<String>) input.get("changedFiles");
        boolean postComment = Boolean.TRUE.equals(input.get("postComment"));

        return prAnalysisService.triggerOrCreateAndAnalyzePr(
                repositoryId, prNumber, title, author, sourceBranch, targetBranch, headSha, "OPEN", changedFiles, postComment
        );
    }

    @MutationMapping
    public PullRequest postPrReviewComment(@Argument UUID pullRequestId) {
        return prAnalysisService.postReviewCommentToGitHub(pullRequestId);
    }

    @SchemaMapping(typeName = "PullRequest", field = "changedFiles")
    public List<String> changedFiles(PullRequest pr) {
        if (pr.getChangedFilesJson() == null || pr.getChangedFilesJson().isBlank()) {
            return Collections.emptyList();
        }
        try {
            return MAPPER.readValue(pr.getChangedFilesJson(), new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @SchemaMapping(typeName = "PullRequest", field = "history")
    public List<PullRequestReviewHistory> history(PullRequest pr) {
        return prAnalysisService.getReviewHistory(pr.getId());
    }
}
