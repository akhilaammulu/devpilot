package com.devpilot.repository;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IssueRepository extends JpaRepository<Issue, UUID> {
    List<Issue> findByScanId(UUID scanId);
    List<Issue> findByScanIdOrderByCreatedAtDesc(UUID scanId);
    List<Issue> findByScanIdAndCategory(UUID scanId, IssueCategory category);
    List<Issue> findByScanIdAndSeverity(UUID scanId, IssueSeverity severity);
    List<Issue> findByScanIdAndEngine(UUID scanId, String engine);
    List<Issue> findByScanIdAndStatus(UUID scanId, String status);
}
