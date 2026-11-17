package com.devpilot.security;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Security Score Calculator (Phase 3).
 * Evaluates repository security posture based on open CVE vulnerabilities,
 * secret leaks, and unsafe configurations.
 */
@Component
public class SecurityScoreCalculator {

    public SecurityMetrics calculateFromIssues(List<Issue> issues) {
        if (issues == null || issues.isEmpty()) {
            return new SecurityMetrics(100, "A+", 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }

        // Filter for security issues only
        List<Issue> secIssues = issues.stream()
                .filter(i -> i.getCategory() == IssueCategory.SECURITY)
                .toList();

        if (secIssues.isEmpty()) {
            return new SecurityMetrics(100, "A+", 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }

        int critical = 0;
        int high = 0;
        int medium = 0;
        int low = 0;

        int open = 0;
        int resolved = 0;

        int dependencyCount = 0;
        int secretCount = 0;
        int configCount = 0;

        for (Issue issue : secIssues) {
            boolean isOpen = !"RESOLVED".equalsIgnoreCase(issue.getStatus());
            if (isOpen) {
                open++;
                if (issue.getSeverity() == IssueSeverity.CRITICAL) critical++;
                else if (issue.getSeverity() == IssueSeverity.HIGH) high++;
                else if (issue.getSeverity() == IssueSeverity.MEDIUM) medium++;
                else if (issue.getSeverity() == IssueSeverity.LOW) low++;
            } else {
                resolved++;
            }

            String engine = issue.getEngine();
            if ("DEPENDENCY_CHECK".equalsIgnoreCase(engine)) {
                dependencyCount++;
            } else if ("SECRET_SCANNER".equalsIgnoreCase(engine) || "SECRET_DETECTION".equalsIgnoreCase(engine)) {
                secretCount++;
            } else if ("CONFIG_AUDIT".equalsIgnoreCase(engine)) {
                configCount++;
            }
        }

        // Security penalty calculation:
        // Critical: -25 points
        // High: -15 points
        // Medium: -6 points
        // Low: -2 points (capped at 10)
        int lowPenalty = Math.min(10, low * 2);
        int penalty = (critical * 25) + (high * 15) + (medium * 6) + lowPenalty;

        int score = Math.max(0, 100 - penalty);

        String grade;
        if (score == 100) grade = "A+";
        else if (score >= 90) grade = "A";
        else if (score >= 80) grade = "B";
        else if (score >= 70) grade = "C";
        else grade = "F";

        return new SecurityMetrics(
                score,
                grade,
                open,
                resolved,
                critical,
                high,
                medium,
                low,
                dependencyCount,
                secretCount,
                configCount
        );
    }
}
