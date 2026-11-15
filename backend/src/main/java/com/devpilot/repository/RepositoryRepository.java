package com.devpilot.repository;

import com.devpilot.model.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@org.springframework.stereotype.Repository
public interface RepositoryRepository extends JpaRepository<Repository, UUID> {
    Optional<Repository> findByGithubRepoId(String githubRepoId);
    Optional<Repository> findByFullName(String fullName);
    List<Repository> findByUserId(UUID userId);
}
