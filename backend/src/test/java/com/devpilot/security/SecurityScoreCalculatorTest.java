package com.devpilot.security;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SecurityScoreCalculatorTest {

    private SecurityScoreCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new SecurityScoreCalculator();
    }

    @Test
    void testPerfectScoreWhenNoIssues() {
        SecurityMetrics metrics = calculator.calculateFromIssues(List.of());
        assertEquals(100, metrics.getSecurityScore());
        assertEquals("A+", metrics.getGrade());
        assertEquals(0, metrics.getOpenVulnerabilitiesCount());
    }

    @Test
    void testCriticalAndHighPenalties() {
        List<Issue> issues = new ArrayList<>();

        Issue critical = new Issue();
        critical.setCategory(IssueCategory.SECURITY);
        critical.setSeverity(IssueSeverity.CRITICAL);
        critical.setEngine("SECRET_SCANNER");
        critical.setStatus("OPEN");
        issues.add(critical); // -25

        Issue high = new Issue();
        high.setCategory(IssueCategory.SECURITY);
        high.setSeverity(IssueSeverity.HIGH);
        high.setEngine("DEPENDENCY_CHECK");
        high.setStatus("OPEN");
        issues.add(high); // -15

        SecurityMetrics metrics = calculator.calculateFromIssues(issues);

        // 100 - (25 + 15) = 60
        assertEquals(60, metrics.getSecurityScore());
        assertEquals("F", metrics.getGrade());
        assertEquals(2, metrics.getOpenVulnerabilitiesCount());
        assertEquals(1, metrics.getSecretLeaksCount());
        assertEquals(1, metrics.getDependencyIssuesCount());
    }

    @Test
    void testResolvedIssuesDoNotPenalizeScore() {
        List<Issue> issues = new ArrayList<>();

        Issue resolvedCritical = new Issue();
        resolvedCritical.setCategory(IssueCategory.SECURITY);
        resolvedCritical.setSeverity(IssueSeverity.CRITICAL);
        resolvedCritical.setEngine("SECRET_SCANNER");
        resolvedCritical.setStatus("RESOLVED");
        issues.add(resolvedCritical);

        SecurityMetrics metrics = calculator.calculateFromIssues(issues);

        assertEquals(100, metrics.getSecurityScore());
        assertEquals("A+", metrics.getGrade());
        assertEquals(0, metrics.getOpenVulnerabilitiesCount());
        assertEquals(1, metrics.getResolvedVulnerabilitiesCount());
    }

    @Test
    void testModeratePenaltiesForMediumAndLow() {
        List<Issue> issues = new ArrayList<>();

        Issue medium = new Issue();
        medium.setCategory(IssueCategory.SECURITY);
        medium.setSeverity(IssueSeverity.MEDIUM);
        medium.setEngine("CONFIG_AUDIT");
        medium.setStatus("OPEN");
        issues.add(medium); // -6

        Issue low = new Issue();
        low.setCategory(IssueCategory.SECURITY);
        low.setSeverity(IssueSeverity.LOW);
        low.setEngine("CONFIG_AUDIT");
        low.setStatus("OPEN");
        issues.add(low); // -2

        SecurityMetrics metrics = calculator.calculateFromIssues(issues);

        // 100 - (6 + 2) = 92
        assertEquals(92, metrics.getSecurityScore());
        assertEquals("A", metrics.getGrade());
        assertEquals(2, metrics.getConfigurationIssuesCount());
    }
}
