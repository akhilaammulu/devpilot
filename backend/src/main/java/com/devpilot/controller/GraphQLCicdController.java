package com.devpilot.controller;

import com.devpilot.cicd.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.*;

@Controller
public class GraphQLCicdController {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final PipelineExecutionService pipelineService;

    public GraphQLCicdController(PipelineExecutionService pipelineService) {
        this.pipelineService = pipelineService;
    }

    @QueryMapping
    public List<PipelineConfig> pipelines(@Argument UUID repositoryId) {
        return pipelineService.getPipelines(repositoryId);
    }

    @QueryMapping
    public List<PipelineRun> pipelineRuns(@Argument UUID repositoryId, @Argument UUID pipelineConfigId) {
        return pipelineService.getPipelineRuns(repositoryId, pipelineConfigId);
    }

    @QueryMapping
    public PipelineRun pipelineRun(@Argument UUID id) {
        return pipelineService.getPipelineRun(id).orElse(null);
    }

    @QueryMapping
    public List<PipelineDeployment> pipelineDeployments(@Argument UUID repositoryId) {
        return pipelineService.getDeployments(repositoryId);
    }

    @QueryMapping
    public List<Map<String, Object>> pipelineSecrets(@Argument UUID repositoryId) {
        return pipelineService.getSecrets(repositoryId).stream()
                .map(s -> Map.<String, Object>of(
                        "id", s.getId().toString(),
                        "repositoryId", s.getRepositoryId().toString(),
                        "name", s.getName(),
                        "maskedValue", "••••••••••••",
                        "scope", s.getScope(),
                        "createdAt", s.getCreatedAt().toString()
                ))
                .toList();
    }

    @QueryMapping
    public PipelineDtos.PipelineMetrics pipelineMetrics(@Argument UUID repositoryId) {
        return pipelineService.getMetrics(repositoryId);
    }

    @MutationMapping
    @SuppressWarnings("unchecked")
    public PipelineConfig createPipeline(@Argument Map<String, Object> input) {
        UUID repositoryId = UUID.fromString(String.valueOf(input.get("repositoryId")));
        String name = String.valueOf(input.get("name"));
        String branch = String.valueOf(input.get("branch"));
        String language = String.valueOf(input.get("language"));
        String buildTool = String.valueOf(input.get("buildTool"));
        String testFramework = String.valueOf(input.get("testFramework"));
        String environment = String.valueOf(input.get("environment"));
        String deploymentTarget = String.valueOf(input.get("deploymentTarget"));
        List<String> triggers = (List<String>) input.get("triggers");

        List<PipelineDtos.StageDefinition> stages = null;
        if (input.get("stages") instanceof List<?> rawStages) {
            stages = rawStages.stream()
                    .map(obj -> MAPPER.convertValue(obj, PipelineDtos.StageDefinition.class))
                    .toList();
        }

        PipelineDtos.QualityGateConfig gate = null;
        if (input.get("qualityGate") instanceof Map<?, ?> rawGate) {
            gate = MAPPER.convertValue(rawGate, PipelineDtos.QualityGateConfig.class);
        }

        return pipelineService.createPipeline(
                repositoryId, name, branch, language, buildTool, testFramework,
                environment, deploymentTarget, triggers, stages, gate
        );
    }

    @MutationMapping
    public PipelineConfig updatePipelineStages(@Argument UUID pipelineId, @Argument List<Map<String, Object>> stages) {
        List<PipelineDtos.StageDefinition> defs = stages.stream()
                .map(obj -> MAPPER.convertValue(obj, PipelineDtos.StageDefinition.class))
                .toList();
        return pipelineService.updatePipelineStages(pipelineId, defs);
    }

    @MutationMapping
    public PipelineRun runPipeline(@Argument UUID pipelineId, @Argument String triggerType, @Argument String commitSha) {
        return pipelineService.triggerPipelineRun(pipelineId, triggerType, commitSha, true);
    }

    @MutationMapping
    public PipelineRun retryPipelineStage(@Argument UUID runId, @Argument String stageName) {
        return pipelineService.retryFailedStage(runId, stageName);
    }

    @MutationMapping
    public PipelineRun cancelPipelineRun(@Argument UUID runId) {
        return pipelineService.cancelRun(runId);
    }

    @MutationMapping
    public PipelineDeployment deployPipelineRun(@Argument UUID runId, @Argument String environment) {
        return pipelineService.deployRunToEnvironment(runId, environment);
    }

    @MutationMapping
    public PipelineDeployment rollbackDeployment(@Argument UUID deploymentId) {
        return pipelineService.rollbackDeployment(deploymentId);
    }

    @MutationMapping
    public Map<String, Object> savePipelineSecret(@Argument UUID repositoryId,
                                                    @Argument String name,
                                                    @Argument String value,
                                                    @Argument String scope) {
        PipelineSecret s = pipelineService.saveSecret(repositoryId, name, value, scope);
        return Map.of(
                "id", s.getId().toString(),
                "repositoryId", s.getRepositoryId().toString(),
                "name", s.getName(),
                "maskedValue", "••••••••••••",
                "scope", s.getScope(),
                "createdAt", s.getCreatedAt().toString()
        );
    }

    @MutationMapping
    public boolean deletePipelineSecret(@Argument UUID secretId) {
        return pipelineService.deleteSecret(secretId);
    }

    @SchemaMapping(typeName = "PipelineConfig", field = "triggers")
    public List<String> triggers(PipelineConfig config) {
        try {
            return MAPPER.readValue(config.getTriggersJson(), new TypeReference<>() {});
        } catch (Exception e) {
            return List.of("PUSH", "MANUAL");
        }
    }

    @SchemaMapping(typeName = "PipelineConfig", field = "stages")
    public List<PipelineDtos.StageDefinition> stages(PipelineConfig config) {
        try {
            return MAPPER.readValue(config.getStagesJson(), new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @SchemaMapping(typeName = "PipelineConfig", field = "qualityGate")
    public PipelineDtos.QualityGateConfig qualityGate(PipelineConfig config) {
        try {
            return MAPPER.readValue(config.getQualityGateJson(), PipelineDtos.QualityGateConfig.class);
        } catch (Exception e) {
            return new PipelineDtos.QualityGateConfig();
        }
    }

    @SchemaMapping(typeName = "PipelineRun", field = "stages")
    public List<PipelineDtos.StageResult> runStages(PipelineRun run) {
        try {
            return MAPPER.readValue(run.getStagesJson(), new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @SchemaMapping(typeName = "PipelineRun", field = "logs")
    public List<PipelineDtos.LogEntry> runLogs(PipelineRun run) {
        try {
            return MAPPER.readValue(run.getLogsJson(), new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
