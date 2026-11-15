package com.devpilot.controller;

import com.devpilot.model.Repository;
import com.devpilot.service.RepositoryService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
public class GraphQLRepositoryController {

    private final RepositoryService repositoryService;

    public GraphQLRepositoryController(RepositoryService repositoryService) {
        this.repositoryService = repositoryService;
    }

    @QueryMapping
    public List<Repository> repositories() {
        return repositoryService.getAllRepositories();
    }

    @QueryMapping
    public Repository repository(@Argument UUID id) {
        return repositoryService.getRepositoryById(id).orElse(null);
    }

    @MutationMapping
    public Repository connectRepository(@Argument Map<String, Object> input) {
        String githubRepoId = (String) input.get("githubRepoId");
        String fullName = (String) input.get("fullName");
        String defaultBranch = (String) input.getOrDefault("defaultBranch", "main");
        boolean isPrivate = Boolean.TRUE.equals(input.get("isPrivate"));
        String htmlUrl = (String) input.get("htmlUrl");

        return repositoryService.connectRepository(githubRepoId, fullName, defaultBranch, isPrivate, htmlUrl);
    }
}
