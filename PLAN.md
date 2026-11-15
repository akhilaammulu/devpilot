# DevPilot: AI-Powered Developer Platform — Phased Build Plan

## Overview & Goal
Build a production-style portfolio project demonstrating Full Stack development, Java/Spring Boot, GraphQL, AI/RAG, security, accessibility, testing, event-driven architecture, cloud deployment, and observability.

### Resume Goal
The finished project should demonstrate that you can build a complete production-style Full Stack system:
Next.js/TypeScript frontend, Java/Spring Boot backend, GraphQL APIs, AI/RAG capabilities, automated code/security/accessibility analysis, event-driven processing, GitHub integration, testing, CI/CD, cloud deployment, and observability.

---

## Suggested Final Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Apollo Client, GraphQL |
| **Backend** | Java 21, Spring Boot, Spring Security, GraphQL, JPA/Hibernate |
| **Data** | PostgreSQL, Redis, Vector Database (e.g. pgvector / Qdrant) |
| **AI** | LLM API, embeddings, RAG |
| **Analysis** | Checkstyle, PMD, SpotBugs, ESLint, Playwright, axe-core |
| **Messaging** | Apache Kafka |
| **Testing** | JUnit, Mockito, Testcontainers, Playwright |
| **DevOps** | Docker, GitHub Actions, AWS |
| **Observability** | Spring Boot Actuator, Prometheus, Grafana, structured logging |

---

## Recommended Build Order

Finish each phase as a usable milestone and push it to GitHub with meaningful commits, tests, and documentation.

1. **Milestone 1** — Working application shell + GitHub connection + repository dashboard
2. **Milestone 2** — Real code-quality scanning and issue storage
3. **Milestone 3** — Security findings and security dashboard
4. **Milestone 4** — Playwright + axe-core accessibility scanning
5. **Milestone 5** — AI issue explanations and remediation suggestions
6. **Milestone 6** — RAG-based repository Q&A
7. **Milestone 7** — GitHub PR automation
8. **Milestone 8** — Kafka asynchronous pipeline
9. **Milestone 9** — Docker + CI/CD + AWS + observability + complete test suite

---

## Detailed Phase Breakdown

### Phase 1 — Foundation
- **Objective**: Create the base platform and connect a GitHub repository.
- **Build**:
  - Next.js + TypeScript dashboard
  - Java 21 + Spring Boot backend
  - PostgreSQL database
  - GraphQL API
  - GitHub OAuth / repository integration
  - Basic user authentication and repository selection
- **Data Model**: `users`, `repositories`, `repository_scans`, `issues`, `pull_requests`
- **Done When**: A user can sign in, connect GitHub, select a repository, and start a placeholder scan from the dashboard.

### Phase 2 — Code Quality Analysis
- **Objective**: Turn DevPilot into a real static-analysis platform.
- **Build**:
  - Java analysis with Checkstyle / PMD / SpotBugs
  - TypeScript/JavaScript analysis with ESLint
  - Parse findings into a common issue model
  - Severity levels: `Critical`, `High`, `Medium`, `Low`
  - Quality score and issue dashboard
- **Done When**: A repository scan produces stored findings that are visible and filterable in the UI.

### Phase 3 — Security Analysis
- **Objective**: Add application and dependency security checks.
- **Build**:
  - Dependency vulnerability scanning
  - Secret detection
  - Unsafe configuration checks
  - Security severity classification
  - Security score
  - Finding details with file, line, category, and remediation guidance
- **Done When**: DevPilot can identify security findings and present them separately from code-quality issues.

### Phase 4 — Accessibility Analysis
- **Objective**: Use Playwright + axe-core as a differentiator.
- **Build**:
  - Start target application in a test environment
  - Playwright page discovery/navigation
  - axe-core scans
  - WCAG issue classification
  - Accessibility score
  - Evidence/details for affected elements
- **Done When**: DevPilot can scan an application and show actionable accessibility findings in the dashboard.

### Phase 5 — AI Analysis
- **Objective**: Add AI that explains findings instead of only listing them.
- **Build**:
  - LLM integration
  - Send finding + relevant code context to the model
  - Explain why the issue matters
  - Generate remediation suggestions
  - Generate example fixes
  - Generate suggested tests
  - *Example*: For a SQL-injection finding, show the affected code, explain the risk, suggest a parameterized query, and propose a regression test.
- **Done When**: A user can click an issue and receive a useful, code-aware AI explanation and suggested remediation.

### Phase 6 — Repository-Aware RAG
- **Objective**: Make the AI understand the repository rather than relying only on generic prompts.
- **Build**:
  - Repository file ingestion
  - Chunking and metadata
  - Embeddings
  - Vector database
  - Retrieval pipeline
  - Context-aware prompting
  - Repository Q&A
  - *Example Questions*:
    - "How is authentication implemented?"
    - "Where are payment errors handled?"
    - "What tests cover this service?"
- **Done When**: AI answers are grounded in relevant repository files and can identify the source files used for context.

### Phase 7 — GitHub Pull Request Analysis
- **Objective**: Turn DevPilot into an automated code-review assistant.
- **Build**:
  - GitHub webhooks
  - Detect opened/updated PRs
  - Analyze changed files when possible
  - Generate PR quality/security/accessibility findings
  - Post summary comments to GitHub
  - PR score and history
- **Done When**: Opening or updating a PR can trigger DevPilot analysis and produce a useful review summary.

### Phase 8 — Event-Driven Architecture
- **Objective**: Make long-running scans asynchronous and production-like.
- **Build**:
  - Apache Kafka
  - `SCAN_REQUESTED` event
  - Separate analysis workers
  - `CODE_ANALYSIS_COMPLETED`
  - `SECURITY_SCAN_COMPLETED`
  - `ACCESSIBILITY_SCAN_COMPLETED`
  - `AI_ANALYSIS_COMPLETED`
  - `SCAN_COMPLETED`
  - Retry and dead-letter handling
- **Done When**: A scan request returns quickly while analysis progresses asynchronously through events.

### Phase 9 — Production, Cloud & Observability
- **Objective**: Deploy and operate DevPilot like a real production application.
- **Build**:
  - Docker / Docker Compose
  - GitHub Actions CI/CD
  - AWS deployment
  - Redis for caching and short-lived state
  - Prometheus metrics
  - Grafana dashboards
  - Structured logging and correlation IDs
  - Health checks and Spring Boot Actuator
- **Testing**:
  - JUnit + Mockito
  - Testcontainers for integration tests
  - Playwright E2E tests
  - axe-core accessibility tests
- **Done When**: The application is deployed, automatically tested on changes, observable, and documented.
