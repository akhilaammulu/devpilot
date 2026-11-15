package com.devpilot.repository;

import com.devpilot.model.RepositoryScan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RepositoryScanRepository extends JpaRepository<RepositoryScan, UUID> {
    List<RepositoryScan> findByRepositoryIdOrderByStartedAtDesc(UUID repositoryId);
}
