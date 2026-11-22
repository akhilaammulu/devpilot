import { gql } from "@apollo/client";

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      githubUserId
      username
      email
      avatarUrl
    }
  }
`;

export const GET_REPOSITORIES = gql`
  query GetRepositories {
    repositories {
      id
      githubRepoId
      fullName
      defaultBranch
      isPrivate
      htmlUrl
      connectedAt
      scans {
        id
        status
        qualityScore
        securityScore
        accessibilityScore
        startedAt
        completedAt
        engineReports {
          engine
          status
          findingsCount
          executionTimeMs
          message
        }
        issues {
          id
          category
          severity
          ruleId
          filePath
          lineStart
          lineEnd
          startLine
          endLine
          startColumn
          endColumn
          message
          snippet
          aiExplanation
          aiFixSuggestion
          aiWhyItMatters
          aiSuggestedUnitTest
          aiModelUsed
          engine
          status
          language
          createdAt
        }
      }
    }
  }
`;

export const CONNECT_REPOSITORY = gql`
  mutation ConnectRepository($input: ConnectRepositoryInput!) {
    connectRepository(input: $input) {
      id
      githubRepoId
      fullName
      defaultBranch
      isPrivate
      htmlUrl
    }
  }
`;

export const START_SCAN = gql`
  mutation StartScan($input: StartScanInput!) {
    startScan(input: $input) {
      id
      commitSha
      branchName
      status
      qualityScore
      securityScore
      accessibilityScore
      startedAt
      completedAt
      engineReports {
        engine
        status
        findingsCount
        executionTimeMs
        message
      }
      issues {
        id
        category
        severity
        ruleId
        filePath
        lineStart
        lineEnd
        startLine
        endLine
        startColumn
        endColumn
        message
        snippet
        aiExplanation
        aiFixSuggestion
        aiWhyItMatters
        aiSuggestedUnitTest
        aiModelUsed
        engine
        status
        language
        createdAt
      }
    }
  }
`;

export const START_SECURITY_SCAN = gql`
  mutation StartSecurityScan($input: StartScanInput!) {
    startSecurityScan(input: $input) {
      id
      commitSha
      branchName
      status
      qualityScore
      securityScore
      accessibilityScore
      startedAt
      completedAt
      engineReports {
        engine
        status
        findingsCount
        executionTimeMs
        message
      }
      issues {
        id
        category
        severity
        ruleId
        filePath
        lineStart
        lineEnd
        startLine
        endLine
        startColumn
        endColumn
        message
        snippet
        aiExplanation
        aiFixSuggestion
        aiWhyItMatters
        aiSuggestedUnitTest
        aiModelUsed
        engine
        status
        language
        createdAt
      }
    }
  }
`;

export const GET_SCAN_ISSUES = gql`
  query GetScanIssues($scanId: ID!, $category: IssueCategory, $severity: IssueSeverity, $engine: String, $status: String) {
    issues(scanId: $scanId, category: $category, severity: $severity, engine: $engine, status: $status) {
      id
      category
      severity
      ruleId
      filePath
      lineStart
      lineEnd
      startLine
      endLine
      startColumn
      endColumn
      message
      snippet
      aiExplanation
      aiFixSuggestion
      aiWhyItMatters
      aiSuggestedUnitTest
      aiModelUsed
      engine
      status
      language
      createdAt
    }
  }
`;

export const GET_QUALITY_METRICS = gql`
  query GetQualityMetrics($scanId: ID!) {
    qualityMetrics(scanId: $scanId) {
      qualityScore
      grade
      maintainabilityScore
      cyclomaticComplexity
      openIssuesCount
      resolvedIssuesCount
      criticalCount
      highCount
      mediumCount
      lowCount
    }
  }
`;

export const GET_SECURITY_METRICS = gql`
  query GetSecurityMetrics($scanId: ID!) {
    securityMetrics(scanId: $scanId) {
      securityScore
      grade
      openVulnerabilitiesCount
      resolvedVulnerabilitiesCount
      criticalCount
      highCount
      mediumCount
      lowCount
      dependencyIssuesCount
      secretLeaksCount
      configurationIssuesCount
    }
  }
`;

export const GET_ACCESSIBILITY_METRICS = gql`
  query GetAccessibilityMetrics($scanId: ID!) {
    accessibilityMetrics(scanId: $scanId) {
      accessibilityScore
      grade
      wcagLevel
      openViolationsCount
      resolvedViolationsCount
      criticalCount
      highCount
      mediumCount
      lowCount
      perceivableCount
      operableCount
      understandableCount
      robustCount
    }
  }
`;

export const START_ACCESSIBILITY_SCAN = gql`
  mutation StartAccessibilityScan($input: StartScanInput!) {
    startAccessibilityScan(input: $input) {
      id
      commitSha
      branchName
      status
      qualityScore
      securityScore
      accessibilityScore
      startedAt
      completedAt
      engineReports {
        engine
        status
        findingsCount
        executionTimeMs
        message
      }
      issues {
        id
        category
        severity
        ruleId
        filePath
        lineStart
        lineEnd
        startLine
        endLine
        startColumn
        endColumn
        message
        snippet
        aiExplanation
        aiFixSuggestion
        aiWhyItMatters
        aiSuggestedUnitTest
        aiModelUsed
        engine
        status
        language
        createdAt
      }
    }
  }
`;

export const UPDATE_ISSUE_STATUS = gql`
  mutation UpdateIssueStatus($id: ID!, $status: String!) {
    updateIssueStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const EXPLAIN_ISSUE = gql`
  query ExplainIssue($issueId: ID!) {
    explainIssue(issueId: $issueId) {
      issueId
      ruleId
      title
      whyItMatters
      remediationGuidance
      codeFix
      suggestedUnitTest
      confidenceScore
      modelUsed
      createdAt
    }
  }
`;

export const GENERATE_AI_ANALYSIS = gql`
  mutation GenerateAiAnalysis($issueId: ID!) {
    generateAiAnalysis(issueId: $issueId) {
      issueId
      ruleId
      title
      whyItMatters
      remediationGuidance
      codeFix
      suggestedUnitTest
      confidenceScore
      modelUsed
      createdAt
    }
  }
`;

export const GENERATE_BULK_AI_ANALYSIS = gql`
  mutation GenerateBulkAiAnalysis($scanId: ID!) {
    generateBulkAiAnalysis(scanId: $scanId) {
      issueId
      ruleId
      title
      whyItMatters
      remediationGuidance
      codeFix
      suggestedUnitTest
      confidenceScore
      modelUsed
      createdAt
    }
  }
`;

export const ASK_REPOSITORY = gql`
  query AskRepository($repositoryId: ID!, $query: String!) {
    askRepository(repositoryId: $repositoryId, query: $query) {
      query
      answer
      confidenceScore
      modelUsed
      createdAt
      sources {
        filePath
        startLine
        endLine
        snippet
        relevanceScore
      }
    }
  }
`;

export const INDEX_REPOSITORY = gql`
  mutation IndexRepository($repositoryId: ID!) {
    indexRepository(repositoryId: $repositoryId) {
      repositoryId
      filesIndexed
      chunksCreated
      status
      indexedAt
    }
  }
`;

export const GET_REPOSITORY_INDEX_STATUS = gql`
  query GetRepositoryIndexStatus($repositoryId: ID!) {
    repositoryIndexStatus(repositoryId: $repositoryId) {
      repositoryId
      filesIndexed
      chunksCreated
      status
      indexedAt
    }
  }
`;
