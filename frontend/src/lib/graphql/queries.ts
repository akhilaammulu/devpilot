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
      }
    }
  }
`;

export const CONNECT_REPOSITORY = gql`
  mutation ConnectRepository($input: ConnectRepositoryInput!) {
    connectRepository(input: input) {
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
    startScan(input: input) {
      id
      commitSha
      branchName
      status
      qualityScore
      securityScore
      accessibilityScore
      startedAt
      completedAt
      issues {
        id
        category
        severity
        ruleId
        filePath
        lineStart
        lineEnd
        message
        aiExplanation
        aiFixSuggestion
      }
    }
  }
`;
