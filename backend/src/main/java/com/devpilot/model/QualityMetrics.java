package com.devpilot.model;

public class QualityMetrics {

    private int qualityScore;
    private String grade;
    private int maintainabilityScore;
    private double cyclomaticComplexity;
    private int openIssuesCount;
    private int resolvedIssuesCount;
    private int criticalCount;
    private int highCount;
    private int mediumCount;
    private int lowCount;

    public QualityMetrics() {
    }

    public QualityMetrics(int qualityScore, String grade, int maintainabilityScore, double cyclomaticComplexity,
                          int openIssuesCount, int resolvedIssuesCount, int criticalCount, int highCount,
                          int mediumCount, int lowCount) {
        this.qualityScore = qualityScore;
        this.grade = grade;
        this.maintainabilityScore = maintainabilityScore;
        this.cyclomaticComplexity = cyclomaticComplexity;
        this.openIssuesCount = openIssuesCount;
        this.resolvedIssuesCount = resolvedIssuesCount;
        this.criticalCount = criticalCount;
        this.highCount = highCount;
        this.mediumCount = mediumCount;
        this.lowCount = lowCount;
    }

    public int getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(int qualityScore) {
        this.qualityScore = qualityScore;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public int getMaintainabilityScore() {
        return maintainabilityScore;
    }

    public void setMaintainabilityScore(int maintainabilityScore) {
        this.maintainabilityScore = maintainabilityScore;
    }

    public double getCyclomaticComplexity() {
        return cyclomaticComplexity;
    }

    public void setCyclomaticComplexity(double cyclomaticComplexity) {
        this.cyclomaticComplexity = cyclomaticComplexity;
    }

    public int getOpenIssuesCount() {
        return openIssuesCount;
    }

    public void setOpenIssuesCount(int openIssuesCount) {
        this.openIssuesCount = openIssuesCount;
    }

    public int getResolvedIssuesCount() {
        return resolvedIssuesCount;
    }

    public void setResolvedIssuesCount(int resolvedIssuesCount) {
        this.resolvedIssuesCount = resolvedIssuesCount;
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
}
