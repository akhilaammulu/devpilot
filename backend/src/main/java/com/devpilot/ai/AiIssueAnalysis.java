package com.devpilot.ai;

import java.util.UUID;

/**
 * Detailed AI Analysis model for a code quality, security, or accessibility finding (Phase 5).
 * Contains root cause explanation, security/quality impact, concrete remediation patch,
 * and an automated regression test.
 */
public class AiIssueAnalysis {

    private UUID issueId;
    private String ruleId;
    private String title;
    private String whyItMatters;
    private String remediationGuidance;
    private String codeFix;
    private String suggestedUnitTest;
    private double confidenceScore;
    private String modelUsed;
    private String createdAt;

    public AiIssueAnalysis() {}

    public AiIssueAnalysis(UUID issueId, String ruleId, String title, String whyItMatters,
                           String remediationGuidance, String codeFix, String suggestedUnitTest,
                           double confidenceScore, String modelUsed, String createdAt) {
        this.issueId = issueId;
        this.ruleId = ruleId;
        this.title = title;
        this.whyItMatters = whyItMatters;
        this.remediationGuidance = remediationGuidance;
        this.codeFix = codeFix;
        this.suggestedUnitTest = suggestedUnitTest;
        this.confidenceScore = confidenceScore;
        this.modelUsed = modelUsed;
        this.createdAt = createdAt;
    }

    public UUID getIssueId() {
        return issueId;
    }

    public void setIssueId(UUID issueId) {
        this.issueId = issueId;
    }

    public String getRuleId() {
        return ruleId;
    }

    public void setRuleId(String ruleId) {
        this.ruleId = ruleId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getWhyItMatters() {
        return whyItMatters;
    }

    public void setWhyItMatters(String whyItMatters) {
        this.whyItMatters = whyItMatters;
    }

    public String getRemediationGuidance() {
        return remediationGuidance;
    }

    public void setRemediationGuidance(String remediationGuidance) {
        this.remediationGuidance = remediationGuidance;
    }

    public String getCodeFix() {
        return codeFix;
    }

    public void setCodeFix(String codeFix) {
        this.codeFix = codeFix;
    }

    public String getSuggestedUnitTest() {
        return suggestedUnitTest;
    }

    public void setSuggestedUnitTest(String suggestedUnitTest) {
        this.suggestedUnitTest = suggestedUnitTest;
    }

    public double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
