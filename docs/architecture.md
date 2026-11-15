# DevPilot Architecture

## High-Level System Architecture

DevPilot uses a decoupled full-stack architecture with an asynchronous, event-driven analysis pipeline.

```mermaid
flowchart TD
    User["Developer / User"]
    Frontend["Next.js + TypeScript Dashboard<br/>(Apollo Client)"]
    API["Spring Boot Backend<br/>(GraphQL / REST / Security)"]
    DB[(PostgreSQL + pgvector)]
    Redis[(Redis Cache)]
    Kafka["Apache Kafka<br/>Event Broker"]
    GitHub["GitHub API / Webhooks"]

    subgraph Workers["Analysis Workers & Pipelines"]
        WorkerCode["Code Quality Worker<br/>(Checkstyle / PMD / ESLint)"]
        WorkerSec["Security Scan Worker<br/>(Dependencies / Secrets)"]
        WorkerA11y["Accessibility Worker<br/>(Playwright + axe-core)"]
        WorkerAI["AI / RAG Service<br/>(LLM Context Engine)"]
    end

    User -->|Interacts| Frontend
    Frontend -->|GraphQL Queries / Mutations| API
    API -->|Persists Data| DB
    API -->|Session / Cache| Redis
    API -->|OAuth / Sync| GitHub
    GitHub -->|Webhooks (PRs)| API

    API -->|Publish SCAN_REQUESTED| Kafka
    Kafka -->|Consume| WorkerCode
    Kafka -->|Consume| WorkerSec
    Kafka -->|Consume| WorkerA11y
    Kafka -->|Consume| WorkerAI

    WorkerCode -->|Publish CODE_ANALYSIS_COMPLETED| Kafka
    WorkerSec -->|Publish SECURITY_SCAN_COMPLETED| Kafka
    WorkerA11y -->|Publish ACCESSIBILITY_SCAN_COMPLETED| Kafka
    WorkerAI -->|Publish AI_ANALYSIS_COMPLETED| Kafka

    Kafka -->|Aggregate Results| API
```

---

## Key Components

### 1. Frontend (Dashboard)
- **Framework**: Next.js 14+ (App Router), React, TypeScript
- **State & Data**: Apollo Client querying the Spring Boot GraphQL endpoints
- **Features**:
  - GitHub account connection & repository selection
  - Real-time scan progress visualization
  - Filterable issues table by category (Code Quality, Security, Accessibility) and severity
  - AI Remediation drawer with diff previews and explanation
  - Repository Q&A interactive chat interface

### 2. Backend (Core API)
- **Framework**: Java 21, Spring Boot 3.x
- **API Protocol**: GraphQL (Spring for GraphQL)
- **Security**: Spring Security with GitHub OAuth2 integration and JWT session tokens
- **Data Access**: Spring Data JPA with Hibernate

### 3. Messaging & Asynchronous Processing
- **Event Bus**: Apache Kafka
- **Topics**:
  - `devpilot.scans.requested`: Triggered when a manual scan or PR webhook arrives.
  - `devpilot.analysis.code`: Consumed by code quality workers.
  - `devpilot.analysis.security`: Consumed by security scanner.
  - `devpilot.analysis.accessibility`: Consumed by Playwright accessibility worker.
  - `devpilot.analysis.ai`: Consumed by LLM remediation & explanation service.
  - `devpilot.scans.completed`: Aggregate event marking scan completion.

### 4. Storage & Retrieval
- **Relational DB**: PostgreSQL for users, repositories, scans, findings, and pull requests.
- **Vector DB / pgvector**: Stores repository code chunk embeddings for RAG-based context retrieval.
- **Cache**: Redis for temporary analysis states, rate limiting, and session caching.
