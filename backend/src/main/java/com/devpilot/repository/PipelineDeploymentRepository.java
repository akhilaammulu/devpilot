package com.devpilot.repository;

import com.devpilot.cicd.PipelineDeployment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PipelineDeploymentRepository extends JpaRepository<PipelineDeployment, UUID> {
    List<PipelineDeployment> findByRepositoryIdOrderByDeployedAtDesc(UUID repositoryId);
}
