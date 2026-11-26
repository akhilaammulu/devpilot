package com.devpilot.repository;

import com.devpilot.cicd.PipelineConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PipelineConfigRepository extends JpaRepository<PipelineConfig, UUID> {
    List<PipelineConfig> findByRepositoryIdOrderByCreatedAtDesc(UUID repositoryId);
}
