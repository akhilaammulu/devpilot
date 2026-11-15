package com.devpilot.service;

import com.devpilot.model.*;
import com.devpilot.repository.IssueRepository;
import com.devpilot.repository.RepositoryRepository;
import com.devpilot.repository.RepositoryScanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ScanService {

    private final RepositoryScanRepository scanRepository;
    private final RepositoryRepository repositoryRepository;
    private final IssueRepository issueRepository;

    public ScanService(RepositoryScanRepository scanRepository,
                       RepositoryRepository repositoryRepository,
                       IssueRepository issueRepository) {
        this.scanRepository = scanRepository;
        this.repositoryRepository = repositoryRepository;
        this.issueRepository = issueRepository;
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
        scan.setStatus(ScanStatus.COMPLETED);
        scan.setCompletedAt(Instant.now());
        scan.setQualityScore(92);
        scan.setSecurityScore(95);
        scan.setAccessibilityScore(88);

        RepositoryScan savedScan = scanRepository.save(scan);

        Issue placeholderIssue = new Issue(
                savedScan,
                IssueCategory.CODE_QUALITY,
                IssueSeverity.LOW,
                "DEV-001",
                "src/main/resources/application.yml",
                1,
                5,
                "Baseline placeholder scan initialized successfully for DevPilot."
        );
        placeholderIssue.setAiExplanation("This is a placeholder finding generated as part of Phase 1 Foundation acceptance testing.");
        placeholderIssue.setAiFixSuggestion("Once Phase 2 static analyzers and Phase 3 security scanners are integrated, live findings will replace this.");

        issueRepository.save(placeholderIssue);

        return savedScan;
    }
}
