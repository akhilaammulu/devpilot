package com.devpilot.pr;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Verifies GitHub webhook HMAC-SHA256 signatures (X-Hub-Signature-256).
 */
@Component
public class GitHubWebhookSignatureVerifier {

    private static final String HMAC_SHA256 = "HmacSHA256";

    @Value("${devpilot.github.webhook-secret:}")
    private String webhookSecret;

    public GitHubWebhookSignatureVerifier() {
    }

    public GitHubWebhookSignatureVerifier(String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }

    public boolean isValid(String payload, String signatureHeader) {
        // When no secret is configured (local dev), allow simulation payloads
        if (webhookSecret == null || webhookSecret.isBlank()) {
            return true;
        }
        if (signatureHeader == null || !signatureHeader.startsWith("sha256=")) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec keySpec = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(keySpec);
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = "sha256=" + bytesToHex(digest);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signatureHeader.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
