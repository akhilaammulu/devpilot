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
        symbolName
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

export const GET_PULL_REQUESTS = gql`
  query GetPullRequests($repositoryId: ID!) {
    pullRequests(repositoryId: $repositoryId) {
      id
      githubPrNumber
      title
      author
      sourceBranch
      targetBranch
      headSha
      state
      prScore
      qualityScore
      securityScore
      accessibilityScore
      reviewStatus
      reviewSummary
      changedFilesCount
      changedFiles
      findingsCount
      githubCommentPosted
      githubCommentUrl
      lastAnalyzedAt
      openedAt
      updatedAt
      history {
        id
        commitSha
        prScore
        qualityScore
        securityScore
        accessibilityScore
        findingsCount
        reviewStatus
        githubCommentPosted
        createdAt
      }
    }
  }
`;

export const TRIGGER_PULL_REQUEST_ANALYSIS = gql`
  mutation TriggerPullRequestAnalysis($input: TriggerPullRequestInput!) {
    triggerPullRequestAnalysis(input: $input) {
      id
      githubPrNumber
      title
      author
      sourceBranch
      targetBranch
      headSha
      state
      prScore
      qualityScore
      securityScore
      accessibilityScore
      reviewStatus
      reviewSummary
      changedFilesCount
      changedFiles
      findingsCount
      githubCommentPosted
      githubCommentUrl
      lastAnalyzedAt
    }
  }
`;

export const ANALYZE_PULL_REQUEST = gql`
  mutation AnalyzePullRequest($pullRequestId: ID!) {
    analyzePullRequest(pullRequestId: $pullRequestId) {
      id
      prScore
      qualityScore
      securityScore
      accessibilityScore
      reviewStatus
      reviewSummary
      findingsCount
      lastAnalyzedAt
    }
  }
`;

export const POST_PR_REVIEW_COMMENT = gql`
  mutation PostPrReviewComment($pullRequestId: ID!) {
    postPrReviewComment(pullRequestId: $pullRequestId) {
      id
      githubCommentPosted
      githubCommentUrl
    }
  }
`;

export const GET_PIPELINE_METRICS = gql`
  query GetPipelineMetrics($repositoryId: ID!) {
    pipelineMetrics(repositoryId: $repositoryId) {
      totalPipelines
      runningPipelines
      successfulPipelines
      failedPipelines
      successRate
      avgDurationMs
      latestDeploymentStatus
      latestDeploymentEnv
    }
  }
`;

export const GET_PIPELINES = gql`
  query GetPipelines($repositoryId: ID!) {
    pipelines(repositoryId: $repositoryId) {
      id
      repositoryId
      name
      branch
      language
      buildTool
      testFramework
      environment
      deploymentTarget
      triggers
      stages {
        name
        type
        command
        enabled
      }
      qualityGate {
        maxCritical
        maxHigh
        minCoverage
        requireBuildPass
        requireSecurityPass
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PIPELINE_RUNS = gql`
  query GetPipelineRuns($repositoryId: ID!, $pipelineConfigId: ID) {
    pipelineRuns(repositoryId: $repositoryId, pipelineConfigId: $pipelineConfigId) {
      id
      pipelineConfigId
      runNumber
      pipelineName
      branch
      commitSha
      triggerType
      status
      qualityScore
      securityScore
      testCoverage
      qualityGatePassed
      qualityGateReason
      durationMs
      stages {
        name
        type
        status
        durationMs
        errorsCount
        warningsCount
        qualityScore
        artifacts
        command
      }
      logs {
        timestamp
        stage
        level
        command
        message
      }
      startedAt
      completedAt
    }
  }
`;

export const GET_PIPELINE_DEPLOYMENTS = gql`
  query GetPipelineDeployments($repositoryId: ID!) {
    pipelineDeployments(repositoryId: $repositoryId) {
      id
      pipelineRunId
      environment
      version
      commitSha
      status
      deployedBy
      rolledBackFromId
      deployedAt
    }
  }
`;

export const GET_PIPELINE_SECRETS = gql`
  query GetPipelineSecrets($repositoryId: ID!) {
    pipelineSecrets(repositoryId: $repositoryId) {
      id
      name
      maskedValue
      scope
      createdAt
    }
  }
`;

export const CREATE_PIPELINE = gql`
  mutation CreatePipeline($input: CreatePipelineInput!) {
    createPipeline(input: $input) {
      id
      name
      branch
      language
    }
  }
`;

export const UPDATE_PIPELINE_STAGES = gql`
  mutation UpdatePipelineStages($pipelineId: ID!, $stages: [StageDefinitionInput!]!) {
    updatePipelineStages(pipelineId: $pipelineId, stages: $stages) {
      id
      stages {
        name
        type
        command
        enabled
      }
    }
  }
`;

export const RUN_PIPELINE = gql`
  mutation RunPipeline($pipelineId: ID!, $triggerType: String, $commitSha: String) {
    runPipeline(pipelineId: $pipelineId, triggerType: $triggerType, commitSha: $commitSha) {
      id
      runNumber
      status
    }
  }
`;

export const RETRY_PIPELINE_STAGE = gql`
  mutation RetryPipelineStage($runId: ID!, $stageName: String!) {
    retryPipelineStage(runId: $runId, stageName: $stageName) {
      id
      status
    }
  }
`;

export const CANCEL_PIPELINE_RUN = gql`
  mutation CancelPipelineRun($runId: ID!) {
    cancelPipelineRun(runId: $runId) {
      id
      status
    }
  }
`;

export const DEPLOY_PIPELINE_RUN = gql`
  mutation DeployPipelineRun($runId: ID!, $environment: String!) {
    deployPipelineRun(runId: $runId, environment: $environment) {
      id
      environment
      version
      status
    }
  }
`;

export const ROLLBACK_DEPLOYMENT = gql`
  mutation RollbackDeployment($deploymentId: ID!) {
    rollbackDeployment(deploymentId: $deploymentId) {
      id
      environment
      version
      status
    }
  }
`;

export const SAVE_PIPELINE_SECRET = gql`
  mutation SavePipelineSecret($repositoryId: ID!, $name: String!, $value: String!, $scope: String) {
    savePipelineSecret(repositoryId: $repositoryId, name: $name, value: $value, scope: $scope) {
      id
      name
      maskedValue
      scope
    }
  }
`;

export const DELETE_PIPELINE_SECRET = gql`
  mutation DeletePipelineSecret($secretId: ID!) {
    deletePipelineSecret(secretId: $secretId)
  }
`;
