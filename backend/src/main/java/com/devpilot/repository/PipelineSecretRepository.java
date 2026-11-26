package com.devpilot.repository;

import com.devpilot.cicd.PipelineSecret;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PipelineSecretRepository extends JpaRepository<PipelineSecret, UUID> {
    List<PipelineSecret> findByRepositoryIdOrderByCreatedAtDesc(UUID repositoryId);
}
