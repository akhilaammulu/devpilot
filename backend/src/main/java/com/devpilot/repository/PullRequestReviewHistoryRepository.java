package com.devpilot.repository;

import com.devpilot.model.PullRequestReviewHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PullRequestReviewHistoryRepository extends JpaRepository<PullRequestReviewHistory, UUID> {
    List<PullRequestReviewHistory> findByPullRequestIdOrderByCreatedAtDesc(UUID pullRequestId);
}
