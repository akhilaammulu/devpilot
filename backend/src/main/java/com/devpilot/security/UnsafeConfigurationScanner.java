package com.devpilot.security;

import com.devpilot.analysis.AnalysisEngine;
import com.devpilot.analysis.AnalysisFinding;
import com.devpilot.analysis.EngineAnalysisResult;
import com.devpilot.model.EngineExecutionReport;
import com.devpilot.model.IssueSeverity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

/**
 * Unsafe Configuration Scanner (Phase 3).
 * Inspects framework configurations, Spring Security settings, CORS policies,
 * Docker containers, and environment properties for insecure configurations.
 */
@Component
public class UnsafeConfigurationScanner implements SecurityAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(UnsafeConfigurationScanner.class);

    @Override
    public AnalysisEngine getEngine() {
        return AnalysisEngine.CONFIG_AUDIT;
    }

    @Override
    public EngineAnalysisResult analyze(Path repositoryPath, String branch) {
        long startTime = System.currentTimeMillis();
        List<AnalysisFinding> findings = new ArrayList<>();

        log.info("Starting Unsafe Configuration Scan on {}", repositoryPath);

        // 1. Audit Spring Security configuration
        auditSpringSecurity(repositoryPath, findings);

        // 2. Audit Application YAML / Properties
        auditApplicationProperties(repositoryPath, findings);

        // 3. Audit Docker and Container configurations
        auditDockerfiles(repositoryPath, findings);

        long elapsed = System.currentTimeMillis() - startTime;
        log.info("Unsafe Configuration Scan completed with {} findings in {}ms", findings.size(), elapsed);

        EngineExecutionReport report = new EngineExecutionReport(
                getEngine().getDisplayName(),
                "COMPLETED",
                findings.size(),
                elapsed
        );

        return new EngineAnalysisResult(AnalysisEngine.CONFIG_AUDIT, findings, report);
    }

    private void auditSpringSecurity(Path repoRoot, List<AnalysisFinding> findings) {
        Path securityConfig = repoRoot.resolve("backend/src/main/java/com/devpilot/config/SecurityConfig.java");
        if (!Files.exists(securityConfig)) {
            securityConfig = repoRoot.resolve("src/main/java/com/devpilot/config/SecurityConfig.java");
        }

        if (!Files.exists(securityConfig)) return;

        String relPath = repoRoot.relativize(securityConfig).toString();

        try {
            List<String> lines = Files.readAllLines(securityConfig);
            for (int i = 0; i < lines.size(); i++) {
                String line = lines.get(i);
                int lineNum = i + 1;

                // Check for CSRF disabled
                if (line.contains("csrf(AbstractHttpConfigurer::disable)") || line.contains(".csrf().disable()")) {
                    findings.add(new AnalysisFinding(
                            AnalysisEngine.CONFIG_AUDIT,
                            "Java",
                            IssueSeverity.HIGH,
                            "SEC_CSRF_DISABLED",
                            relPath,
                            lineNum,
                            lineNum,
                            "Cross-Site Request Forgery (CSRF) protection is completely disabled in Spring Security.",
                            line.trim(),
                            "Disabling CSRF permits malicious cross-origin websites to submit unauthorized state-changing requests if session cookies are used.",
                            "If using session cookies, configure CookieCsrfTokenRepository.withHttpOnlyFalse(). If stateless JWT, verify strict Authorization header validation."
                    ));
                }

                // Check for Permissive CORS
                if (line.contains("setAllowedOrigins") && line.contains("\"*\"")) {
                    findings.add(new AnalysisFinding(
                            AnalysisEngine.CONFIG_AUDIT,
                            "Java",
                            IssueSeverity.HIGH,
                            "SEC_PERMISSIVE_CORS_WILDCARD",
                            relPath,
                            lineNum,
                            lineNum,
                            "Wildcard CORS origin '*' configured with credentials allowed.",
                            line.trim(),
                            "Allowing wildcard origins with credentials enables unauthorized origins to read sensitive authenticated responses.",
                            "Explicitly whitelist authorized frontend domains (e.g. `http://localhost:3000`, `https://app.devpilot.io`)."
                    ));
                }
            }
        } catch (Exception e) {
            log.warn("Error auditing Spring Security: {}", e.getMessage());
        }
    }

    private void auditApplicationProperties(Path repoRoot, List<AnalysisFinding> findings) {
        List<Path> propFiles = new ArrayList<>();
        findConfigFiles(repoRoot, propFiles);

        for (Path file : propFiles) {
            String relPath = repoRoot.relativize(file).toString();
            try {
                List<String> lines = Files.readAllLines(file);
                for (int i = 0; i < lines.size(); i++) {
                    String line = lines.get(i);
                    int lineNum = i + 1;

                    // Plain text DB password without env fallback
                    if (line.matches(".*password:\\s*['\"]?[a-zA-Z0-9_-]{6,}['\"]?.*") &&
                        !line.contains("${") && !line.contains("password: ${") && !line.contains("password:}")) {
                        findings.add(new AnalysisFinding(
                                AnalysisEngine.CONFIG_AUDIT,
                                "YAML",
                                IssueSeverity.HIGH,
                                "SEC_HARDCODED_DATASOURCE_SECRET",
                                relPath,
                                lineNum,
                                lineNum,
                                "Plaintext database password configured without environment variable substitution.",
                                line.trim(),
                                "Static credentials in configuration files are committed to version control and accessible to anyone with repository access.",
                                "Use dynamic environment variable interpolation: `password: ${SPRING_DATASOURCE_PASSWORD}`"
                        ));
                    }

                    // Actuator wildcards
                    if (line.contains("include: \"*\"") || line.contains("include: '*'") ||
                        (line.contains("exposure.include") && line.contains("*"))) {
                        findings.add(new AnalysisFinding(
                                AnalysisEngine.CONFIG_AUDIT,
                                "YAML",
                                IssueSeverity.MEDIUM,
                                "SEC_ACTUATOR_EXPOSED_ALL",
                                relPath,
                                lineNum,
                                lineNum,
                                "All Spring Boot Actuator management endpoints are exposed without path restriction.",
                                line.trim(),
                                "Exposing all actuator endpoints like `/env`, `/beans`, and `/heapdump` leaks application memory and environment secrets.",
                                "Restrict exposed endpoints to health and info only: `include: 'health,info'`."
                        ));
                    }
                }
            } catch (Exception ignored) {
            }
        }
    }

    private void auditDockerfiles(Path repoRoot, List<AnalysisFinding> findings) {
        Path dockerDir = repoRoot.resolve("docker");
        if (!Files.exists(dockerDir)) return;

        try (Stream<Path> stream = Files.walk(dockerDir)) {
            stream.filter(Files::isRegularFile)
                  .filter(p -> p.getFileName().toString().toLowerCase().contains("dockerfile"))
                  .forEach(dockerfile -> {
                      String relPath = repoRoot.relativize(dockerfile).toString();
                      try {
                          List<String> lines = Files.readAllLines(dockerfile);
                          boolean hasUser = lines.stream().anyMatch(l -> l.trim().startsWith("USER "));
                          if (!hasUser) {
                              findings.add(new AnalysisFinding(
                                      AnalysisEngine.CONFIG_AUDIT,
                                      "Dockerfile",
                                      IssueSeverity.MEDIUM,
                                      "SEC_DOCKER_ROOT_CONTAINER",
                                      relPath,
                                      1,
                                      1,
                                      "Container runs processes as root. No non-root USER instruction specified in Dockerfile.",
                                      lines.isEmpty() ? "FROM ..." : lines.get(0).trim(),
                                      "Processes running as root inside a container can break container isolation in the event of a container breakout vulnerability.",
                                      "Add `RUN useradd -u 1001 appuser && USER appuser` before starting application binaries."
                              ));
                          }
                      } catch (Exception ignored) {
                      }
                  });
        } catch (Exception ignored) {
        }
    }

    private void findConfigFiles(Path root, List<Path> result) {
        try (Stream<Path> stream = Files.walk(root, 4)) {
            stream.filter(Files::isRegularFile)
                  .filter(p -> {
                      String name = p.getFileName().toString().toLowerCase();
                      return name.equals("application.yml") || name.equals("application.properties") ||
                             name.equals("application-prod.yml");
                  })
                  .forEach(result::add);
        } catch (Exception ignored) {
        }
    }
}
