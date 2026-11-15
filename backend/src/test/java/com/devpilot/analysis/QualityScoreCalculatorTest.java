package com.devpilot.analysis;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import com.devpilot.model.QualityMetrics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class QualityScoreCalculatorTest {

    private QualityScoreCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new QualityScoreCalculator();
    }

    @Test
    @DisplayName("Should compute 100% and A+ grade when there are no issues")
    void shouldReturnPerfectScoreForNoIssues() {
        List<Issue> issues = List.of();
        QualityMetrics metrics = calculator.calculateFromIssues(issues);

        assertEquals(100, metrics.getQualityScore());
        assertEquals("A+", metrics.getGrade());
        assertEquals(100, metrics.getMaintainabilityScore());
        assertEquals(0, metrics.getOpenIssuesCount());
        assertEquals(0, metrics.getResolvedIssuesCount());
    }

    @Test
    @DisplayName("Should correctly penalize critical and high severity issues")
    void shouldPenalizeSeverityProperly() {
        List<Issue> issues = new ArrayList<>();

        // 1 Critical (15 pts), 2 High (16 pts), 3 Medium (9 pts), 2 Low (2 pts) -> total penalty = 42 -> score = 58
        Issue crit = new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.CRITICAL, "CRIT-1", "Test.java", 1, 2, "Crit");
        issues.add(crit);

        issues.add(new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.HIGH, "HIGH-1", "Test.java", 3, 4, "High 1"));
        issues.add(new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.HIGH, "HIGH-2", "Test.java", 5, 6, "High 2"));

        issues.add(new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.MEDIUM, "MED-1", "Test.java", 7, 8, "Med 1"));
        issues.add(new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.MEDIUM, "MED-2", "Test.java", 9, 10, "Med 2"));
        issues.add(new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.MEDIUM, "MED-3", "Test.java", 11, 12, "Med 3"));

        issues.add(new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.LOW, "LOW-1", "Test.java", 13, 14, "Low 1"));
        issues.add(new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.LOW, "LOW-2", "Test.java", 15, 16, "Low 2"));

        QualityMetrics metrics = calculator.calculateFromIssues(issues);

        assertEquals(8, metrics.getOpenIssuesCount());
        assertEquals(1, metrics.getCriticalCount());
        assertEquals(2, metrics.getHighCount());
        assertEquals(3, metrics.getMediumCount());
        assertEquals(2, metrics.getLowCount());
        assertEquals(59, metrics.getQualityScore());
        assertEquals("F", metrics.getGrade());
    }

    @Test
    @DisplayName("Should ignore RESOLVED issues when deducting score")
    void shouldIgnoreResolvedIssues() {
        List<Issue> issues = new ArrayList<>();

        Issue resolvedCrit = new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.CRITICAL, "CRIT-1", "Test.java", 1, 2, "Crit");
        resolvedCrit.setStatus("RESOLVED");
        issues.add(resolvedCrit);

        Issue activeLow = new Issue(null, IssueCategory.CODE_QUALITY, IssueSeverity.LOW, "LOW-1", "Test.java", 13, 14, "Low 1");
        activeLow.setStatus("OPEN");
        issues.add(activeLow);

        QualityMetrics metrics = calculator.calculateFromIssues(issues);

        assertEquals(1, metrics.getOpenIssuesCount());
        assertEquals(1, metrics.getResolvedIssuesCount());
        assertEquals(99, metrics.getQualityScore());
        assertEquals("A+", metrics.getGrade());
    }
}
