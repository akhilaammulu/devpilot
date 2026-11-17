package com.devpilot.service;

import com.devpilot.accessibility.AccessibilityMetrics;
import com.devpilot.accessibility.AccessibilityScanOrchestrator;
import com.devpilot.accessibility.AccessibilityScoreCalculator;
import com.devpilot.analysis.CodeQualityOrchestrator;
import com.devpilot.analysis.QualityScoreCalculator;
import com.devpilot.model.*;
import com.devpilot.repository.IssueRepository;
import com.devpilot.repository.RepositoryRepository;
import com.devpilot.repository.RepositoryScanRepository;
import com.devpilot.security.SecurityMetrics;
import com.devpilot.security.SecurityScanOrchestrator;
import com.devpilot.security.SecurityScoreCalculator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ScanService {

    private final RepositoryScanRepository scanRepository;
    private final RepositoryRepository repositoryRepository;
    private final IssueRepository issueRepository;
    private final CodeQualityOrchestrator qualityOrchestrator;
    private final QualityScoreCalculator qualityScoreCalculator;
    private final SecurityScanOrchestrator securityOrchestrator;
    private final SecurityScoreCalculator securityScoreCalculator;
    private final AccessibilityScanOrchestrator accessibilityOrchestrator;
    private final AccessibilityScoreCalculator accessibilityScoreCalculator;

    @Value("${devpilot.workspace.root:/Users/akhilagadipally/Desktop/devpilot}")
    private String defaultWorkspaceRoot;

    public ScanService(RepositoryScanRepository scanRepository,
                       RepositoryRepository repositoryRepository,
                       IssueRepository issueRepository,
                       CodeQualityOrchestrator qualityOrchestrator,
                       QualityScoreCalculator qualityScoreCalculator,
                       SecurityScanOrchestrator securityOrchestrator,
                       SecurityScoreCalculator securityScoreCalculator,
                       AccessibilityScanOrchestrator accessibilityOrchestrator,
                       AccessibilityScoreCalculator accessibilityScoreCalculator) {
        this.scanRepository = scanRepository;
        this.repositoryRepository = repositoryRepository;
        this.issueRepository = issueRepository;
        this.qualityOrchestrator = qualityOrchestrator;
        this.qualityScoreCalculator = qualityScoreCalculator;
        this.securityOrchestrator = securityOrchestrator;
        this.securityScoreCalculator = securityScoreCalculator;
        this.accessibilityOrchestrator = accessibilityOrchestrator;
        this.accessibilityScoreCalculator = accessibilityScoreCalculator;
    }

    public List<RepositoryScan> getScansByRepositoryId(UUID repositoryId) {
        return scanRepository.findByRepositoryIdOrderByStartedAtDesc(repositoryId);
    }

    public Optional<RepositoryScan> getScanById(UUID id) {
        return scanRepository.findById(id);
    }

    @Transactional
    public RepositoryScan startScan(UUID repositoryId, String branchName, String commitSha) {
        Repository repository = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new IllegalArgumentException("Repository not found with id: " + repositoryId));

        RepositoryScan scan = new RepositoryScan(repository, branchName, commitSha);
        scan.setStatus(ScanStatus.RUNNING);
        scan.setAccessibilityScore(88);

        RepositoryScan savedScan = scanRepository.save(scan);

        Path repoPath = Paths.get(defaultWorkspaceRoot);

        // 1. Execute Code Quality Multi-Engine Scan (Phase 2)
        CodeQualityOrchestrator.QualityScanResult qualityResult =
                qualityOrchestrator.executeQualityScan(savedScan, repoPath, branchName);

        for (Issue issue : qualityResult.getIssues()) {
            issueRepository.save(issue);
        }

        // 2. Execute Security Analysis Suite (Phase 3: Dependencies, Secrets, Configs)
        SecurityScanOrchestrator.SecurityScanResult securityResult =
                securityOrchestrator.executeSecurityScan(savedScan, repoPath, branchName);

        for (Issue issue : securityResult.getIssues()) {
            issueRepository.save(issue);
        }

        // 3. Execute Accessibility Analysis (Phase 4: Playwright + axe-core)
        AccessibilityScanOrchestrator.AccessibilityScanResult a11yResult =
                accessibilityOrchestrator.executeAccessibilityScan(savedScan, repoPath, "http://localhost:3001");

        for (Issue issue : a11yResult.getIssues()) {
            issueRepository.save(issue);
        }

        // 4. Combine telemetry reports from all engines
        List<EngineExecutionReport> combinedReports = new ArrayList<>(qualityResult.getEngineReports());
        combinedReports.addAll(securityResult.getEngineReports());
        combinedReports.addAll(a11yResult.getEngineReports());

        savedScan.setStatus(ScanStatus.COMPLETED);
        savedScan.setCompletedAt(Instant.now());
        savedScan.setQualityScore(qualityResult.getMetrics().getQualityScore());
        savedScan.setSecurityScore(securityResult.getMetrics().getSecurityScore());
        savedScan.setAccessibilityScore(a11yResult.getMetrics().getAccessibilityScore());
        savedScan.setEngineReports(combinedReports);

        return scanRepository.save(savedScan);
    }

    @Transactional
    public RepositoryScan startAccessibilityScan(UUID repositoryId, String branchName, String commitSha) {
        Repository repository = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new IllegalArgumentException("Repository not found with id: " + repositoryId));

        RepositoryScan scan = new RepositoryScan(repository, branchName, commitSha);
        scan.setStatus(ScanStatus.RUNNING);
        RepositoryScan savedScan = scanRepository.save(scan);

        Path repoPath = Paths.get(defaultWorkspaceRoot);
        AccessibilityScanOrchestrator.AccessibilityScanResult a11yResult =
                accessibilityOrchestrator.executeAccessibilityScan(savedScan, repoPath, "http://localhost:3001");

        for (Issue issue : a11yResult.getIssues()) {
            issueRepository.save(issue);
        }

        savedScan.setStatus(ScanStatus.COMPLETED);
        savedScan.setCompletedAt(Instant.now());
        savedScan.setAccessibilityScore(a11yResult.getMetrics().getAccessibilityScore());
        savedScan.setEngineReports(a11yResult.getEngineReports());

        return scanRepository.save(savedScan);
    }

    public List<Issue> getIssues(UUID scanId, IssueCategory category, IssueSeverity severity, String engine, String status) {
        List<Issue> issues = issueRepository.findByScanIdOrderByCreatedAtDesc(scanId);

        return issues.stream()
                .filter(i -> category == null || i.getCategory() == category)
                .filter(i -> severity == null || i.getSeverity() == severity)
                .filter(i -> engine == null || "ALL".equalsIgnoreCase(engine) || engine.equalsIgnoreCase(i.getEngine()))
                .filter(i -> status == null || "ALL".equalsIgnoreCase(status) || status.equalsIgnoreCase(i.getStatus()))
                .collect(Collectors.toList());
    }

    public QualityMetrics getQualityMetrics(UUID scanId) {
        List<Issue> issues = issueRepository.findByScanId(scanId);
        return qualityScoreCalculator.calculateFromIssues(issues);
    }

    public SecurityMetrics getSecurityMetrics(UUID scanId) {
        List<Issue> issues = issueRepository.findByScanId(scanId);
        return securityScoreCalculator.calculateFromIssues(issues);
    }

    public AccessibilityMetrics getAccessibilityMetrics(UUID scanId) {
        List<Issue> issues = issueRepository.findByScanId(scanId);
        List<Issue> a11yIssues = issues.stream()
                .filter(i -> i.getCategory() == IssueCategory.ACCESSIBILITY)
                .collect(Collectors.toList());
        return accessibilityOrchestrator.computeMetricsForScan(a11yIssues);
    }

    @Transactional
    public Issue updateIssueStatus(UUID issueId, String status) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with id: " + issueId));

        issue.setStatus(status.toUpperCase());
        Issue saved = issueRepository.save(issue);

        // Recalculate scan quality, security, and accessibility scores based on active issues
        if (issue.getScan() != null) {
            QualityMetrics qm = getQualityMetrics(issue.getScan().getId());
            SecurityMetrics sm = getSecurityMetrics(issue.getScan().getId());
            AccessibilityMetrics am = getAccessibilityMetrics(issue.getScan().getId());
            issue.getScan().setQualityScore(qm.getQualityScore());
            issue.getScan().setSecurityScore(sm.getSecurityScore());
            issue.getScan().setAccessibilityScore(am.getAccessibilityScore());
            scanRepository.save(issue.getScan());
        }

        return saved;
    }
}
