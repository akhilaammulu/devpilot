package com.devpilot.accessibility;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AccessibilityScoreCalculatorTest {

    private AccessibilityScoreCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new AccessibilityScoreCalculator();
    }

    @Test
    void testPerfectScoreWithNoIssues() {
        int score = calculator.calculateScore(Collections.emptyList());
        assertEquals(100, score);
        assertEquals("A+", calculator.calculateGrade(score));
        assertEquals("WCAG 2.1 Level AAA", calculator.calculateWcagLevel(score));
    }

    @Test
    void testCriticalIssuePenalty() {
        List<Issue> issues = new ArrayList<>();
        Issue critical = new Issue();
        critical.setCategory(IssueCategory.ACCESSIBILITY);
        critical.setSeverity(IssueSeverity.CRITICAL);
        critical.setStatus("OPEN");
        issues.add(critical);

        int score = calculator.calculateScore(issues);
        assertEquals(80, score); // 100 - 20 = 80
        assertEquals("B", calculator.calculateGrade(score));
        assertEquals("WCAG 2.1 Level A", calculator.calculateWcagLevel(score));
    }

    @Test
    void testResolvedIssuesDoNotPenalize() {
        List<Issue> issues = new ArrayList<>();
        Issue resolved = new Issue();
        resolved.setCategory(IssueCategory.ACCESSIBILITY);
        resolved.setSeverity(IssueSeverity.CRITICAL);
        resolved.setStatus("RESOLVED");
        issues.add(resolved);

        int score = calculator.calculateScore(issues);
        assertEquals(100, score);
        assertEquals("A+", calculator.calculateGrade(score));
    }

    @Test
    void testMixedSeverityPenaltiesAndNonCompliantTier() {
        List<Issue> issues = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            Issue crit = new Issue();
            crit.setCategory(IssueCategory.ACCESSIBILITY);
            crit.setSeverity(IssueSeverity.CRITICAL);
            crit.setStatus("OPEN");
            issues.add(crit);
        }

        for (int i = 0; i < 2; i++) {
            Issue high = new Issue();
            high.setCategory(IssueCategory.ACCESSIBILITY);
            high.setSeverity(IssueSeverity.HIGH);
            high.setStatus("OPEN");
            issues.add(high);
        }

        int score = calculator.calculateScore(issues); // 50 cap (critical) + 24 (high) = 74 penalty -> 26 score
        assertEquals(26, score);
        assertEquals("F", calculator.calculateGrade(score));
        assertEquals("Non-Compliant", calculator.calculateWcagLevel(score));
    }
}
