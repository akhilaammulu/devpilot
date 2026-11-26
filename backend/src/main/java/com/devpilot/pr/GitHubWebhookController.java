package com.devpilot.pr;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * GitHub Webhook Receiver Endpoint (Phase 7).
 * Listens for pull_request events (opened, synchronize, reopened, closed),
 * verifies HMAC-SHA256 signatures, and triggers automated PR analysis.
 */
@RestController
@RequestMapping("/api/webhooks")
public class GitHubWebhookController {

    private static final Logger log = LoggerFactory.getLogger(GitHubWebhookController.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final GitHubWebhookSignatureVerifier signatureVerifier;
    private final PrAnalysisService prAnalysisService;

    public GitHubWebhookController(GitHubWebhookSignatureVerifier signatureVerifier,
                                   PrAnalysisService prAnalysisService) {
        this.signatureVerifier = signatureVerifier;
        this.prAnalysisService = prAnalysisService;
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
