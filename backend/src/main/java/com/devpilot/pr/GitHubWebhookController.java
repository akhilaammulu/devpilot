package com.devpilot.pr;

import com.devpilot.cicd.PipelineConfig;
import com.devpilot.cicd.PipelineExecutionService;
import com.devpilot.cicd.PipelineRun;
import com.devpilot.repository.RepositoryRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * GitHub Webhook Receiver Endpoint (Phase 7 & CI/CD).
 * Listens for pull_request and push events, verifies HMAC-SHA256 signatures,
 * and triggers automated PR analysis or CI/CD pipeline runs.
 */
@RestController
@RequestMapping("/api/webhooks")
public class GitHubWebhookController {

    private static final Logger log = LoggerFactory.getLogger(GitHubWebhookController.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final GitHubWebhookSignatureVerifier signatureVerifier;
    private final PrAnalysisService prAnalysisService;
    private final PipelineExecutionService pipelineExecutionService;
    private final RepositoryRepository repositoryRepository;

    @Autowired
    public GitHubWebhookController(GitHubWebhookSignatureVerifier signatureVerifier,
                                   PrAnalysisService prAnalysisService,
                                   @Autowired(required = false) PipelineExecutionService pipelineExecutionService,
                                   @Autowired(required = false) RepositoryRepository repositoryRepository) {
        this.signatureVerifier = signatureVerifier;
        this.prAnalysisService = prAnalysisService;
        this.pipelineExecutionService = pipelineExecutionService;
        this.repositoryRepository = repositoryRepository;
    }

    @PostMapping("/github")
    public ResponseEntity<Map<String, Object>> handleGitHubWebhook(
            @RequestHeader(value = "X-GitHub-Event", defaultValue = "ping") String eventType,
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature,
            @RequestBody String rawPayload) {

        if (!signatureVerifier.isValid(rawPayload, signature)) {
            log.warn("Rejected GitHub webhook due to invalid X-Hub-Signature-256");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid webhook signature"));
        }

        if ("ping".equalsIgnoreCase(eventType)) {
            return ResponseEntity.ok(Map.of("status", "pong", "message", "DevPilot webhook active"));
        }

        try {
            Map<String, Object> payload = MAPPER.readValue(rawPayload, new TypeReference<>() {});
            if ("push".equalsIgnoreCase(eventType) && pipelineExecutionService != null && repositoryRepository != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> repoObj = (Map<String, Object>) payload.get("repository");
                String fullName = repoObj != null ? String.valueOf(repoObj.getOrDefault("full_name", "")) : "";
                String ref = String.valueOf(payload.getOrDefault("ref", "refs/heads/main")).replace("refs/heads/", "");
                String sha = String.valueOf(payload.getOrDefault("after", "HEAD"));
                var repoOpt = repositoryRepository.findFirstByFullName(fullName);
                if (repoOpt.isPresent()) {
                    List<PipelineConfig> pipelines = pipelineExecutionService.getPipelines(repoOpt.get().getId());
                    int triggered = 0;
                    for (PipelineConfig pc : pipelines) {
                        if (pc.getBranch().equalsIgnoreCase(ref)) {
                            PipelineRun run = pipelineExecutionService.triggerPipelineRun(pc.getId(), "PUSH", sha, true);
                            log.info("Triggered CI/CD pipeline {} run #{} from push webhook", pc.getName(), run.getRunNumber());
                            triggered++;
                        }
                    }
                    return ResponseEntity.ok(Map.of("status", "triggered", "event", "push", "pipelinesTriggered", triggered));
                }
            }
            Map<String, Object> result = prAnalysisService.handleWebhookEvent(eventType, payload);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Bad webhook payload: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing GitHub webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Webhook processing failed: " + e.getMessage()));
        }
    }
}
