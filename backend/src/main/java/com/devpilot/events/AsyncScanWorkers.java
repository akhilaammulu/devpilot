package com.devpilot.events;

import com.devpilot.accessibility.AccessibilityScanOrchestrator;
import com.devpilot.ai.AiAnalysisService;
import com.devpilot.analysis.CodeQualityOrchestrator;
import com.devpilot.model.*;
import com.devpilot.repository.IssueRepository;
import com.devpilot.repository.RepositoryRepository;
import com.devpilot.repository.RepositoryScanRepository;
import com.devpilot.security.SecurityScanOrchestrator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;

/**
 * Asynchronous Event-Driven Scan Workers (Phase 8).
 * Returns scan requests immediately while Code Quality, Security, Accessibility,
 * and AI Analysis workers progress asynchronously through domain events.
 */
@Service
public class AsyncScanWorkers {

    private static final Logger log = LoggerFactory.getLogger(AsyncScanWorkers.class);

    private final RepositoryRepository repositoryRepository;
    private final RepositoryScanRepository scanRepository;
    private final IssueRepository issueRepository;
    private final CodeQualityOrchestrator qualityOrchestrator;
    private final SecurityScanOrchestrator securityOrchestrator;
    private final AccessibilityScanOrchestrator accessibilityOrchestrator;
    private final AiAnalysisService aiAnalysisService;
    private final EventBusService eventBus;

    @Value("${devpilot.workspace.root:/Users/akhilagadipally/Desktop/devpilot}")
    private String defaultWorkspaceRoot;

    @Autowired
    public AsyncScanWorkers(RepositoryRepository repositoryRepository,
                            RepositoryScanRepository scanRepository,
                            IssueRepository issueRepository,
                            CodeQualityOrchestrator qualityOrchestrator,
                            SecurityScanOrchestrator securityOrchestrator,
                            AccessibilityScanOrchestrator accessibilityOrchestrator,
                            AiAnalysisService aiAnalysisService,
                            EventBusService eventBus) {
        this.repositoryRepository = repositoryRepository;
        this.scanRepository = scanRepository;
        this.issueRepository = issueRepository;
        this.qualityOrchestrator = qualityOrchestrator;
        this.securityOrchestrator = securityOrchestrator;
        this.accessibilityOrchestrator = accessibilityOrchestrator;
        this.aiAnalysisService = aiAnalysisService;
        this.eventBus = eventBus;
    }

    /**
     * Immediately persists a RUNNING scan, emits SCAN_REQUESTED, and returns fast
     * while workers process asynchronously.
     */
    public RepositoryScan startAsyncScan(UUID repositoryId, String branchName, String commitSha) {
        Repository repo = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new IllegalArgumentException("Repository not found: " + repositoryId));

        RepositoryScan scan = new RepositoryScan(repo, branchName, commitSha);
        scan.setStatus(ScanStatus.RUNNING);
        RepositoryScan savedScan = scanRepository.save(scan);

        ScanEventRecord requested = eventBus.publish(
                savedScan.getId(),
                repositoryId,
                ScanEventType.SCAN_REQUESTED,
                Map.of("branch", branchName, "commitSha", commitSha)
        );

        eventBus.executeWithRetryAndDlq(requested, evt -> runWorkersSequentially(savedScan.getId(), repositoryId, branchName));

        return savedScan;
    }

    private void runWorkersSequentially(UUID scanId, UUID repositoryId, String branchName) {
        RepositoryScan scan = scanRepository.findById(scanId)
                .orElseThrow(() -> new IllegalStateException("Scan missing: " + scanId));

        Path repoPath = (defaultWorkspaceRoot != null && !defaultWorkspaceRoot.isBlank())
                ? Paths.get(defaultWorkspaceRoot)
                : Paths.get(".");

        List<EngineExecutionReport> reports = new ArrayList<>();

        // Worker 1: Code Quality Analysis
        CodeQualityOrchestrator.QualityScanResult qRes =
                qualityOrchestrator.executeQualityScan(scan, repoPath, branchName);
        issueRepository.saveAll(qRes.getIssues());
        reports.addAll(qRes.getEngineReports());
        scan.setQualityScore(qRes.getMetrics().getQualityScore());
        eventBus.publish(scanId, repositoryId, ScanEventType.CODE_ANALYSIS_COMPLETED,
                Map.of("qualityScore", qRes.getMetrics().getQualityScore(), "findings", qRes.getIssues().size()));

        // Worker 2: Security Analysis
        SecurityScanOrchestrator.SecurityScanResult sRes =
                securityOrchestrator.executeSecurityScan(scan, repoPath, branchName);
        issueRepository.saveAll(sRes.getIssues());
        reports.addAll(sRes.getEngineReports());
        scan.setSecurityScore(sRes.getMetrics().getSecurityScore());
        eventBus.publish(scanId, repositoryId, ScanEventType.SECURITY_SCAN_COMPLETED,
                Map.of("securityScore", sRes.getMetrics().getSecurityScore(), "findings", sRes.getIssues().size()));

        // Worker 3: Accessibility Analysis
        AccessibilityScanOrchestrator.AccessibilityScanResult aRes =
                accessibilityOrchestrator.executeAccessibilityScan(scan, repoPath, "http://localhost:3001");
        issueRepository.saveAll(aRes.getIssues());
        reports.addAll(aRes.getEngineReports());
        scan.setAccessibilityScore(aRes.getMetrics().getAccessibilityScore());
        eventBus.publish(scanId, repositoryId, ScanEventType.ACCESSIBILITY_SCAN_COMPLETED,
                Map.of("accessibilityScore", aRes.getMetrics().getAccessibilityScore(), "findings", aRes.getIssues().size()));

        // Worker 4: AI Analysis Enrichment (top 3 issues)
        List<Issue> topIssues = issueRepository.findByScanId(scanId).stream().limit(3).toList();
        for (Issue iss : topIssues) {
            try {
                aiAnalysisService.explainIssue(iss.getId());
            } catch (Exception e) {
                log.debug("AI enrichment skipped for issue {}: {}", iss.getId(), e.getMessage());
            }
        }
        eventBus.publish(scanId, repositoryId, ScanEventType.AI_ANALYSIS_COMPLETED,
                Map.of("enrichedCount", topIssues.size()));

        // Finalize scan
        scan.setEngineReports(reports);
        scan.setStatus(ScanStatus.COMPLETED);
        scan.setCompletedAt(Instant.now());
        scanRepository.save(scan);

        eventBus.publish(scanId, repositoryId, ScanEventType.SCAN_COMPLETED,
                Map.of("status", "COMPLETED", "qualityScore", scan.getQualityScore(), "securityScore", scan.getSecurityScore()));
        log.info("Async scan {} completed via event-driven workers", scanId);
    }
}
