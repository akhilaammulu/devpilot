# DevPilot

> **AI-Powered Developer Platform**  
> A production-style developer platform demonstrating Full Stack development, Java 21 / Spring Boot, GraphQL, AI/RAG, automated code/security/accessibility scanning, event-driven pipelines with Apache Kafka, and cloud observability.

---

## 🚀 Project Overview

DevPilot is designed to connect to GitHub repositories, perform automated static code analysis, security auditing, accessibility scanning, and provide intelligent AI-driven remediation and repository-aware Q&A using RAG.

See the complete [Phased Build Plan](PLAN.md) for milestone goals and deliverables.

---

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Apollo Client, Tailwind CSS
- **Backend**: Java 21, Spring Boot 3.x, Spring Security, Spring for GraphQL, JPA / Hibernate
- **Database & Storage**: PostgreSQL, Redis, Vector Database (pgvector)
- **AI & RAG**: LLM API integration, vector embeddings, semantic retrieval pipeline
- **Static Analysis**: Checkstyle, PMD, SpotBugs (Java), ESLint (TS/JS)
- **Accessibility**: Playwright + axe-core
- **Event-Driven Messaging**: Apache Kafka
- **Testing**: JUnit 5, Mockito, Testcontainers, Playwright E2E
- **DevOps & Observability**: Docker Compose, GitHub Actions CI/CD, AWS, Prometheus, Grafana, Spring Boot Actuator

---

## 📁 Repository Structure

```text
devpilot/
├── backend/                   # Java 21 + Spring Boot GraphQL API
├── frontend/                  # Next.js + TypeScript dashboard
├── workers/                   # Analysis & asynchronous worker services
│   ├── code-analysis/         # Java & TS static analysis (Checkstyle, PMD, SpotBugs, ESLint)
│   ├── security-analysis/     # Dependency & vulnerability scans, secret detection
│   └── accessibility-analysis/# Playwright + axe-core automated scanner
├── docker/                    # Docker Compose & local infrastructure (Postgres, Kafka, Redis)
├── docs/                      # Technical documentation & architecture designs
│   ├── architecture.md        # System architecture diagram and flow
│   └── data-model.md          # Core entity models & schemas
├── .github/workflows/         # CI/CD pipelines
├── PLAN.md                    # Detailed 9-Phase implementation plan & milestones
└── README.md                  # Project overview & quickstart
```

---

## 🚦 Roadmap Summary

- [ ] **Phase 1 — Foundation**: Next.js UI, Spring Boot GraphQL API, PostgreSQL, GitHub OAuth
- [ ] **Phase 2 — Code Quality Analysis**: Checkstyle/PMD/SpotBugs/ESLint, quality score dashboard
- [ ] **Phase 3 — Security Analysis**: Dependency scanning, secret detection, security score
- [ ] **Phase 4 — Accessibility Analysis**: Playwright + axe-core scans, WCAG classifications
- [ ] **Phase 5 — AI Analysis**: Code-aware explanations, suggested fixes, test generation
- [ ] **Phase 6 — Repository-Aware RAG**: Vector embeddings, repository Q&A
- [ ] **Phase 7 — GitHub PR Automation**: Webhook triggers, automated review comments
- [ ] **Phase 8 — Event-Driven Architecture**: Kafka event pipeline (`SCAN_REQUESTED` -> workers)
- [ ] **Phase 9 — Production, Cloud & Observability**: Docker, AWS, Prometheus/Grafana, Testcontainers

---

## 🏁 Getting Started with Phase 1

1. Start infrastructure services via Docker Compose:
   ```bash
   cd docker && docker compose up -d
   ```
2. Initialize and run the Spring Boot backend:
   ```bash
   cd ../backend && ./mvnw spring-boot:run
   ```
3. Initialize and run the Next.js frontend:
   ```bash
   cd ../frontend && npm run dev
   ```
