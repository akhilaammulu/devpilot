package com.devpilot.accessibility;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueSeverity;
import org.springframework.stereotype.Component;

import java.util.Collection;

/**
 * Calculates dynamic accessibility score (0-100), letter grade (A+ through F),
 * and WCAG compliance tier (AAA, AA, A, Non-Compliant) based on open accessibility findings.
 */
@Component
public class AccessibilityScoreCalculator {

    public static final int PENALTY_CRITICAL = 20; // Max cap 50
    public static final int PENALTY_HIGH = 12;     // Max cap 40
    public static final int PENALTY_MEDIUM = 5;    // Max cap 25
    public static final int PENALTY_LOW = 2;       // Max cap 10

    public int calculateScore(Collection<Issue> issues) {
        if (issues == null || issues.isEmpty()) {
            return 100;
        }

        long openCritical = issues.stream()
                .filter(i -> i.getSeverity() == IssueSeverity.CRITICAL && !"RESOLVED".equalsIgnoreCase(i.getStatus()))
                .count();

        long openHigh = issues.stream()
                .filter(i -> i.getSeverity() == IssueSeverity.HIGH && !"RESOLVED".equalsIgnoreCase(i.getStatus()))
                .count();

        long openMedium = issues.stream()
                .filter(i -> i.getSeverity() == IssueSeverity.MEDIUM && !"RESOLVED".equalsIgnoreCase(i.getStatus()))
                .count();

        long openLow = issues.stream()
                .filter(i -> i.getSeverity() == IssueSeverity.LOW && !"RESOLVED".equalsIgnoreCase(i.getStatus()))
                .count();

        int criticalPenalty = (int) Math.min(openCritical * PENALTY_CRITICAL, 50);
        int highPenalty = (int) Math.min(openHigh * PENALTY_HIGH, 40);
        int mediumPenalty = (int) Math.min(openMedium * PENALTY_MEDIUM, 25);
        int lowPenalty = (int) Math.min(openLow * PENALTY_LOW, 10);

        int totalPenalty = criticalPenalty + highPenalty + mediumPenalty + lowPenalty;
        return Math.max(0, 100 - totalPenalty);
    }

    public String calculateGrade(int score) {
        if (score >= 95) return "A+";
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        return "F";
    }

    public String calculateWcagLevel(int score) {
        if (score >= 100) return "WCAG 2.1 Level AAA";
        if (score >= 90) return "WCAG 2.1 Level AA";
        if (score >= 75) return "WCAG 2.1 Level A";
        return "Non-Compliant";
    }
}
