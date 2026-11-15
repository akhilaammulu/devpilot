package com.devpilot.repository;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IssueRepository extends JpaRepository<Issue, UUID> {
    List<Issue> findByScanId(UUID scanId);
    List<Issue> findByScanIdAndCategory(UUID scanId, IssueCategory category);
}
