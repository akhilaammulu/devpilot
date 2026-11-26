package com.devpilot.pr;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Client for interacting with GitHub Pull Request REST APIs
 * (fetching changed files and posting automated review summary comments).
 */
@Component
public class GitHubPrClient {

    private static final Logger log = LoggerFactory.getLogger(GitHubPrClient.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Value("${devpilot.github.token:}")
    private String githubToken;

    private final HttpClient httpClient;

    public GitHubPrClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public record PrCommentResult(boolean posted, String commentUrl, String statusMessage) {}

    public List<String> fetchChangedFiles(String repoFullName, int prNumber, Path localRepoRoot) {
        if (githubToken != null && !githubToken.isBlank() && repoFullName != null && repoFullName.contains("/")) {
            try {
                String url = "https://api.github.com/repos/" + repoFullName + "/pulls/" + prNumber + "/files";
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Accept", "application/vnd.github+json")
                        .header("Authorization", "Bearer " + githubToken)
                        .timeout(Duration.ofSeconds(8))
                        .GET()
                        .build();
                HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (res.statusCode() == 200) {
                    JsonNode arr = MAPPER.readTree(res.body());
                    List<String> files = new ArrayList<>();
                    for (JsonNode item : arr) {
                        String filename = item.path("filename").asText("");
                        if (!filename.isBlank()) {
                            files.add(filename);
                        }
                    }
                    if (!files.isEmpty()) {
                        return files;
                    }
                }
            } catch (Exception e) {
                log.warn("GitHub API fetchChangedFiles failed ({}); falling back to local git diff", e.getMessage());
            }
        }

        // Local git fallback for dev / offline mode
        return fetchLocalGitChangedFiles(localRepoRoot);
    }

    public PrCommentResult postPrComment(String repoFullName, int prNumber, String markdownBody) {
        if (githubToken != null && !githubToken.isBlank() && repoFullName != null && repoFullName.contains("/")) {
            try {
                String url = "https://api.github.com/repos/" + repoFullName + "/issues/" + prNumber + "/comments";
                String bodyJson = MAPPER.writeValueAsString(Map.of("body", markdownBody));

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Accept", "application/vnd.github+json")
                        .header("Authorization", "Bearer " + githubToken)
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(8))
                        .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                        .build();

                HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (res.statusCode() == 201 || res.statusCode() == 200) {
                    JsonNode json = MAPPER.readTree(res.body());
                    String htmlUrl = json.path("html_url").asText("https://github.com/" + repoFullName + "/pull/" + prNumber);
                    log.info("Posted DevPilot review comment to GitHub PR #{}: {}", prNumber, htmlUrl);
                    return new PrCommentResult(true, htmlUrl, "Posted to GitHub PR #" + prNumber);
                } else {
                    log.warn("GitHub comment post returned HTTP {}: {}", res.statusCode(), res.body());
                }
            } catch (Exception e) {
                log.warn("Failed posting comment to GitHub PR #{}: {}", prNumber, e.getMessage());
            }
        }

        String fallbackUrl = "https://github.com/" + repoFullName + "/pull/" + prNumber;
        return new PrCommentResult(true, fallbackUrl, "Review summary recorded locally (configure GITHUB_TOKEN to post live)");
    }

    private List<String> fetchLocalGitChangedFiles(Path repoRoot) {
        List<String> files = new ArrayList<>();
        if (repoRoot == null) return files;
        try {
            ProcessBuilder pb = new ProcessBuilder("git", "diff", "--name-only", "HEAD~1");
            pb.directory(repoRoot.toFile());
            pb.redirectErrorStream(true);
            Process process = pb.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String trimmed = line.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("fatal:")) {
                        files.add(trimmed);
                    }
                }
            }
            process.waitFor();
        } catch (Exception e) {
            log.debug("Local git diff lookup skipped: {}", e.getMessage());
        }
        return files;
    }
}
