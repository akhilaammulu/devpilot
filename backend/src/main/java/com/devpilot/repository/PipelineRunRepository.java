package com.devpilot.repository;

import com.devpilot.cicd.PipelineRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PipelineRunRepository extends JpaRepository<PipelineRun, UUID> {
    List<PipelineRun> findByRepositoryIdOrderByStartedAtDesc(UUID repositoryId);
    List<PipelineRun> findByPipelineConfigIdOrderByStartedAtDesc(UUID pipelineConfigId);
    int countByPipelineConfigId(UUID pipelineConfigId);
}
