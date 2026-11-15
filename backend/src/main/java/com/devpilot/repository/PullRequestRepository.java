package com.devpilot.repository;

import com.devpilot.model.PullRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PullRequestRepository extends JpaRepository<PullRequest, UUID> {
    List<PullRequest> findByRepositoryId(UUID repositoryId);
    Optional<PullRequest> findByRepositoryIdAndGithubPrNumber(UUID repositoryId, int githubPrNumber);
}
