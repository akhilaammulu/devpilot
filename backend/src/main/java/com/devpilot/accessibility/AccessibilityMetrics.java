package com.devpilot.accessibility;

/**
 * DTO capturing Accessibility Metrics, WCAG Compliance Level, and violation categories (Phase 4).
 */
public class AccessibilityMetrics {

    private int accessibilityScore;
    private String grade;
    private String wcagLevel;
    private int openViolationsCount;
    private int resolvedViolationsCount;
    private int criticalCount;
    private int highCount;
    private int mediumCount;
    private int lowCount;
    private int perceivableCount;
    private int operableCount;
    private int understandableCount;
    private int robustCount;

    public AccessibilityMetrics() {}

    public AccessibilityMetrics(int accessibilityScore, String grade, String wcagLevel,
                                int openViolationsCount, int resolvedViolationsCount,
                                int criticalCount, int highCount, int mediumCount, int lowCount,
                                int perceivableCount, int operableCount, int understandableCount, int robustCount) {
        this.accessibilityScore = accessibilityScore;
        this.grade = grade;
        this.wcagLevel = wcagLevel;
        this.openViolationsCount = openViolationsCount;
        this.resolvedViolationsCount = resolvedViolationsCount;
        this.criticalCount = criticalCount;
        this.highCount = highCount;
        this.mediumCount = mediumCount;
        this.lowCount = lowCount;
        this.perceivableCount = perceivableCount;
        this.operableCount = operableCount;
        this.understandableCount = understandableCount;
        this.robustCount = robustCount;
    }

    public int getAccessibilityScore() {
        return accessibilityScore;
    }

    public void setAccessibilityScore(int accessibilityScore) {
        this.accessibilityScore = accessibilityScore;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getWcagLevel() {
        return wcagLevel;
    }

    public void setWcagLevel(String wcagLevel) {
        this.wcagLevel = wcagLevel;
    }

    public int getOpenViolationsCount() {
        return openViolationsCount;
    }

    public void setOpenViolationsCount(int openViolationsCount) {
        this.openViolationsCount = openViolationsCount;
    }

    public int getResolvedViolationsCount() {
        return resolvedViolationsCount;
    }

    public void setResolvedViolationsCount(int resolvedViolationsCount) {
        this.resolvedViolationsCount = resolvedViolationsCount;
    }

    public int getCriticalCount() {
        return criticalCount;
    }

    public void setCriticalCount(int criticalCount) {
        this.criticalCount = criticalCount;
    }

    public int getHighCount() {
        return highCount;
    }

    public void setHighCount(int highCount) {
        this.highCount = highCount;
    }

    public int getMediumCount() {
        return mediumCount;
    }

    public void setMediumCount(int mediumCount) {
        this.mediumCount = mediumCount;
    }

    public int getLowCount() {
        return lowCount;
    }

    public void setLowCount(int lowCount) {
        this.lowCount = lowCount;
    }

    public int getPerceivableCount() {
        return perceivableCount;
    }

    public void setPerceivableCount(int perceivableCount) {
        this.perceivableCount = perceivableCount;
    }

    public int getOperableCount() {
        return operableCount;
    }

    public void setOperableCount(int operableCount) {
        this.operableCount = operableCount;
    }

    public int getUnderstandableCount() {
        return understandableCount;
    }

    public void setUnderstandableCount(int understandableCount) {
        this.understandableCount = understandableCount;
    }

    public int getRobustCount() {
        return robustCount;
    }

    public void setRobustCount(int robustCount) {
        this.robustCount = robustCount;
    }
}
