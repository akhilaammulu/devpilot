package com.devpilot.pr;

import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class GitHubWebhookSignatureVerifierTest {

    @Test
    void testValidHmacSha256Signature() throws Exception {
        String secret = "devpilot-test-secret";
        String payload = "{\"action\":\"opened\",\"number\":7}";
        GitHubWebhookSignatureVerifier verifier = new GitHubWebhookSignatureVerifier(secret);

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder("sha256=");
        for (byte b : digest) {
            hex.append(String.format("%02x", b));
        }

        assertTrue(verifier.isValid(payload, hex.toString()));
        assertFalse(verifier.isValid(payload, "sha256=deadbeef"));
        assertFalse(verifier.isValid(payload, null));
    }

    @Test
    void testEmptySecretAllowsLocalSimulation() {
        GitHubWebhookSignatureVerifier verifier = new GitHubWebhookSignatureVerifier("");
        assertTrue(verifier.isValid("{\"action\":\"opened\"}", null));
    }
}
