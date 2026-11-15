package com.devpilot.analysis;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueSeverity;
import com.devpilot.model.QualityMetrics;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Component
public class QualityScoreCalculator {

    public QualityMetrics calculateFromIssues(Collection<Issue> issues) {
        int critical = 0;
        int high = 0;
        int medium = 0;
        int low = 0;
        int openCount = 0;
        int resolvedCount = 0;

        for (Issue issue : issues) {
            boolean isResolved = "RESOLVED".equalsIgnoreCase(issue.getStatus());
            if (isResolved) {
                resolvedCount++;
                continue; // Only active/open issues affect quality deductions
            }

            openCount++;
            if (issue.getSeverity() == IssueSeverity.CRITICAL) {
                critical++;
            } else if (issue.getSeverity() == IssueSeverity.HIGH) {
                high++;
            } else if (issue.getSeverity() == IssueSeverity.MEDIUM) {
                medium++;
            } else if (issue.getSeverity() == IssueSeverity.LOW) {
                low++;
            }
        }

        return computeMetrics(critical, high, medium, low, openCount, resolvedCount);
    }

    public QualityMetrics calculateFromFindings(Collection<AnalysisFinding> findings) {
        int critical = 0;
        int high = 0;
        int medium = 0;
        int low = 0;

        for (AnalysisFinding f : findings) {
            if (f.getSeverity() == IssueSeverity.CRITICAL) {
                critical++;
            } else if (f.getSeverity() == IssueSeverity.HIGH) {
                high++;
            } else if (f.getSeverity() == IssueSeverity.MEDIUM) {
                medium++;
            } else if (f.getSeverity() == IssueSeverity.LOW) {
                low++;
            }
        }

        return computeMetrics(critical, high, medium, low, findings.size(), 0);
    }

    private QualityMetrics computeMetrics(int critical, int high, int medium, int low, int openCount, int resolvedCount) {
        // Penalty calculation
        int penalty = (critical * 15) + (high * 8) + (medium * 3) + (low * 1);
        int qualityScore = Math.max(0, 100 - penalty);

        // Maintainability calculation
        int maintPenalty = (high * 4) + (medium * 2) + (low * 1);
        int maintainabilityScore = Math.max(0, 100 - maintPenalty);

        // Cyclomatic complexity average estimation
        double complexity = 2.0 + (critical * 0.5) + (high * 0.3) + (medium * 0.1);
        double roundedComplexity = Math.round(complexity * 10.0) / 10.0;

        String grade = computeGrade(qualityScore);

        return new QualityMetrics(
                qualityScore,
                grade,
                maintainabilityScore,
                roundedComplexity,
                openCount,
                resolvedCount,
                critical,
                high,
                medium,
                low
        );
    }

    public String computeGrade(int score) {
        if (score >= 95) return "A+";
        if (score >= 90) return "A";
        if (score >= 85) return "A-";
        if (score >= 80) return "B+";
        if (score >= 75) return "B";
        if (score >= 70) return "B-";
        if (score >= 60) return "C";
        return "F";
    }
}
