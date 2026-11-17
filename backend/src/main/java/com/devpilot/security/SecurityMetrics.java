package com.devpilot.security;

public class SecurityMetrics {

    private int securityScore;
    private String grade;
    private int openVulnerabilitiesCount;
    private int resolvedVulnerabilitiesCount;
    private int criticalCount;
    private int highCount;
    private int mediumCount;
    private int lowCount;
    private int dependencyIssuesCount;
    private int secretLeaksCount;
    private int configurationIssuesCount;

    public SecurityMetrics() {
    }

    public SecurityMetrics(int securityScore, String grade, int openVulnerabilitiesCount,
                           int resolvedVulnerabilitiesCount, int criticalCount, int highCount,
                           int mediumCount, int lowCount, int dependencyIssuesCount,
                           int secretLeaksCount, int configurationIssuesCount) {
        this.securityScore = securityScore;
        this.grade = grade;
        this.openVulnerabilitiesCount = openVulnerabilitiesCount;
        this.resolvedVulnerabilitiesCount = resolvedVulnerabilitiesCount;
        this.criticalCount = criticalCount;
        this.highCount = highCount;
        this.mediumCount = mediumCount;
        this.lowCount = lowCount;
        this.dependencyIssuesCount = dependencyIssuesCount;
        this.secretLeaksCount = secretLeaksCount;
        this.configurationIssuesCount = configurationIssuesCount;
    }

    public int getSecurityScore() {
        return securityScore;
    }

    public void setSecurityScore(int securityScore) {
        this.securityScore = securityScore;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public int getOpenVulnerabilitiesCount() {
        return openVulnerabilitiesCount;
    }

    public void setOpenVulnerabilitiesCount(int openVulnerabilitiesCount) {
        this.openVulnerabilitiesCount = openVulnerabilitiesCount;
    }

    public int getResolvedVulnerabilitiesCount() {
        return resolvedVulnerabilitiesCount;
    }

    public void setResolvedVulnerabilitiesCount(int resolvedVulnerabilitiesCount) {
        this.resolvedVulnerabilitiesCount = resolvedVulnerabilitiesCount;
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

    public int getDependencyIssuesCount() {
        return dependencyIssuesCount;
    }

    public void setDependencyIssuesCount(int dependencyIssuesCount) {
        this.dependencyIssuesCount = dependencyIssuesCount;
    }

    public int getSecretLeaksCount() {
        return secretLeaksCount;
    }

    public void setSecretLeaksCount(int secretLeaksCount) {
        this.secretLeaksCount = secretLeaksCount;
    }

    public int getConfigurationIssuesCount() {
        return configurationIssuesCount;
    }

    public void setConfigurationIssuesCount(int configurationIssuesCount) {
        this.configurationIssuesCount = configurationIssuesCount;
    }
}
