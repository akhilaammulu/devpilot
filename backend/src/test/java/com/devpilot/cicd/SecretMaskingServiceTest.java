package com.devpilot.cicd;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SecretMaskingServiceTest {

    @Test
    void testEncryptDecryptAndMaskLogs() {
        SecretMaskingService service = new SecretMaskingService();
        String secretVal = "super-secret-api-token-9988";
        String encrypted = service.encrypt(secretVal);

        assertNotEquals(secretVal, encrypted);
        assertEquals(secretVal, service.decrypt(encrypted));

        PipelineSecret secret = new PipelineSecret();
        secret.setId(UUID.randomUUID());
        secret.setName("DEPLOY_API_TOKEN");
        secret.setEncryptedValue(encrypted);

        String rawLog = "Deploying with token " + secretVal + " and ghp_1234567890abcdef";
        String masked = service.maskLogs(rawLog, List.of(secret));

        assertFalse(masked.contains(secretVal));
        assertFalse(masked.contains("ghp_1234567890abcdef"));
        assertTrue(masked.contains("***REDACTED:DEPLOY_API_TOKEN***"));
        assertTrue(masked.contains("***REDACTED***"));
    }
}
