package com.devpilot.repository;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IssueRepository extends JpaRepository<Issue, UUID> {

    @Query("SELECT i FROM Issue i WHERE i.scan.id = :scanId")
    List<Issue> findByScanId(@Param("scanId") UUID scanId);

    @Query("SELECT i FROM Issue i WHERE i.scan.id = :scanId ORDER BY i.createdAt DESC")
    List<Issue> findByScanIdOrderByCreatedAtDesc(@Param("scanId") UUID scanId);

    @Query("SELECT i FROM Issue i WHERE i.scan.id = :scanId AND i.category = :category")
    List<Issue> findByScanIdAndCategory(@Param("scanId") UUID scanId, @Param("category") IssueCategory category);

    @Query("SELECT i FROM Issue i WHERE i.scan.id = :scanId AND i.severity = :severity")
    List<Issue> findByScanIdAndSeverity(@Param("scanId") UUID scanId, @Param("severity") IssueSeverity severity);

    @Query("SELECT i FROM Issue i WHERE i.scan.id = :scanId AND i.engine = :engine")
    List<Issue> findByScanIdAndEngine(@Param("scanId") UUID scanId, @Param("engine") String engine);

    @Query("SELECT i FROM Issue i WHERE i.scan.id = :scanId AND i.status = :status")
    List<Issue> findByScanIdAndStatus(@Param("scanId") UUID scanId, @Param("status") String status);
}
