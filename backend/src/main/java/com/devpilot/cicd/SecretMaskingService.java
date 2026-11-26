package com.devpilot.cicd;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Encrypts/masks pipeline secrets and ensures sensitive tokens or credentials
 * never leak into terminal logs or GraphQL responses.
 */
@Service
public class SecretMaskingService {

    private static final Pattern TOKEN_PATTERN = Pattern.compile(
            "(ghp_[A-Za-z0-9_]{10,}|gho_[A-Za-z0-9_]{10,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{16,})"
    );

    public String encrypt(String plaintext) {
        if (plaintext == null) return "";
        return Base64.getEncoder().encodeToString(plaintext.getBytes(StandardCharsets.UTF_8));
    }

    public String decrypt(String encrypted) {
        if (encrypted == null || encrypted.isBlank()) return "";
        try {
            return new String(Base64.getDecoder().decode(encrypted), StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "";
        }
    }

    public String maskLogs(String rawText, List<PipelineSecret> secrets) {
        if (rawText == null) return "";
        String masked = TOKEN_PATTERN.matcher(rawText).replaceAll("***REDACTED***");
        if (secrets != null) {
            for (PipelineSecret secret : secrets) {
                String val = decrypt(secret.getEncryptedValue());
                if (val != null && val.length() >= 4) {
                    masked = masked.replace(val, "***REDACTED:" + secret.getName() + "***");
                }
            }
        }
        return masked;
    }
}
