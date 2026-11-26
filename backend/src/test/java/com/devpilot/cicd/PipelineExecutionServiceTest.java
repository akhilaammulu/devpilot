package com.devpilot.cicd;

import com.devpilot.analysis.*;
import com.devpilot.repository.*;
import com.devpilot.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PipelineExecutionServiceTest {

    private PipelineConfigRepository configRepo;
    private PipelineRunRepository runRepo;
    private PipelineDeploymentRepository deploymentRepo;
    private PipelineSecretRepository secretRepo;
    private PipelineExecutionService service;
    private UUID repoId;

    @BeforeEach
    void setUp() {
        configRepo = mock(PipelineConfigRepository.class);
        runRepo = mock(PipelineRunRepository.class);
        deploymentRepo = mock(PipelineDeploymentRepository.class);
        secretRepo = mock(PipelineSecretRepository.class);

        CodeQualityOrchestrator qualityOrchestrator = new CodeQualityOrchestrator(
                List.of(new CheckstyleAnalyzer(), new PmdAnalyzer(), new SpotBugsAnalyzer()),
                new QualityScoreCalculator()
        );
        SecurityScanOrchestrator securityOrchestrator = new SecurityScanOrchestrator(
                new DependencyVulnerabilityScanner(),
                new SecretDetectionScanner(),
                new UnsafeConfigurationScanner(),
                new SecurityScoreCalculator()
        );

        service = new PipelineExecutionService(
                configRepo, runRepo, deploymentRepo, secretRepo,
                qualityOrchestrator, securityOrchestrator, new SecretMaskingService()
        );
        repoId = UUID.randomUUID();
    }

    @Test
    void testCreatePipelineAndRunSynchronously() {
        when(configRepo.save(any(PipelineConfig.class))).thenAnswer(inv -> {
            PipelineConfig c = inv.getArgument(0);
            if (c.getId() == null) c.setId(UUID.randomUUID());
            return c;
        });

        PipelineConfig config = service.createPipeline(
                repoId,
                "DevPilot Main CI/CD",
                "main",
                "Java",
                "Maven",
                "JUnit 5",
                "Staging",
                "AWS ECS",
                List.of("PUSH", "PULL_REQUEST", "MANUAL"),
                null,
                null
        );

        assertNotNull(config);
        assertEquals("DevPilot Main CI/CD", config.getName());
        assertTrue(config.getStagesJson().contains("Code Quality"));
        assertTrue(config.getStagesJson().contains("Security Scan"));

        when(configRepo.findById(config.getId())).thenReturn(Optional.of(config));
        when(runRepo.countByPipelineConfigId(config.getId())).thenReturn(0);
        when(secretRepo.findByRepositoryIdOrderByCreatedAtDesc(repoId)).thenReturn(Collections.emptyList());

        Map<UUID, PipelineRun> runStore = new HashMap<>();
        when(runRepo.save(any(PipelineRun.class))).thenAnswer(inv -> {
            PipelineRun r = inv.getArgument(0);
            if (r.getId() == null) r.setId(UUID.randomUUID());
            runStore.put(r.getId(), r);
            return r;
        });
        when(runRepo.findById(any(UUID.class))).thenAnswer(inv -> Optional.ofNullable(runStore.get(inv.getArgument(0))));
        when(deploymentRepo.save(any(PipelineDeployment.class))).thenAnswer(inv -> inv.getArgument(0));

        PipelineRun run = service.triggerPipelineRun(config.getId(), "MANUAL", "abc1234", false);

        assertNotNull(run);
        assertEquals(1, run.getRunNumber());
        assertNotNull(run.getStagesJson());
        assertNotNull(run.getLogsJson());
        assertTrue(run.getLogsJson().contains("Source"));
        assertTrue(run.getLogsJson().contains("Code Quality"));
    }
}
