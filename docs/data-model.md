# DevPilot Data Model

This document outlines the core entities and relational schemas for DevPilot as defined in Phase 1 (Foundation) and expanded through subsequent phases.

```mermaid
erDiagram
    USER ||--o{ REPOSITORY : owns_or_connects
    REPOSITORY ||--o{ REPOSITORY_SCAN : undergoes
    REPOSITORY ||--o{ PULL_REQUEST : tracks
    REPOSITORY_SCAN ||--o{ ISSUE : detects
    PULL_REQUEST ||--o{ REPOSITORY_SCAN : triggers

    USER {
        uuid id PK
        string github_user_id UK
        string username
        string email
        string avatar_url
        string access_token_enc
        timestamp created_at
        timestamp updated_at
    }

    REPOSITORY {
        uuid id PK
        uuid user_id FK
        string github_repo_id UK
        string full_name
        string default_branch
        boolean is_private
        string html_url
        timestamp connected_at
    }

    REPOSITORY_SCAN {
        uuid id PK
        uuid repository_id FK
        uuid triggered_by_user_id FK
        uuid pull_request_id FK "nullable"
        string commit_sha
        string branch_name
        string status "PENDING, RUNNING, COMPLETED, FAILED"
        int quality_score
        int security_score
        int accessibility_score
        timestamp started_at
        timestamp completed_at
    }

    PULL_REQUEST {
        uuid id PK
        uuid repository_id FK
        int github_pr_number
        string title
        string source_branch
        string target_branch
        string head_sha
        string state "OPEN, CLOSED, MERGED"
        timestamp opened_at
        timestamp updated_at
    }

    ISSUE {
        uuid id PK
        uuid scan_id FK
        string category "CODE_QUALITY, SECURITY, ACCESSIBILITY"
        string severity "CRITICAL, HIGH, MEDIUM, LOW"
        string rule_id
        string file_path
        int line_start
        int line_end
        string message
        text snippet
        text ai_explanation
        text ai_fix_suggestion
        timestamp created_at
    }
```

---

## Entity Descriptions

### `User`
Stores authenticated developers connecting via GitHub OAuth2. Handles user identity and credentials.

### `Repository`
Stores connected GitHub repositories monitored by DevPilot. Contains sync settings, webhook secrets, and metadata.

### `RepositoryScan`
Represents an individual scan execution against a specific commit and branch. Aggregates overall scores and tracks lifecycle status across worker stages.

### `PullRequest`
Tracks active and historical PRs analyzed by DevPilot via GitHub webhooks. Correlates scans directly to PR reviews.

### `Issue`
Normalized findings model produced by all scanner engines:
- **Code Quality**: Checkstyle, PMD, SpotBugs, ESLint
- **Security**: Dependency vulnerabilities (CVEs), secret leaks, unsafe configurations
- **Accessibility**: axe-core violations, WCAG criteria tags, HTML element selectors
- **AI Fields**: Enriched with AI remediation, explanations, and patch suggestions
