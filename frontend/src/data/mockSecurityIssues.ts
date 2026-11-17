export type SecurityEngineType = "DEPENDENCY_CHECK" | "SECRET_SCANNER" | "CONFIG_AUDIT";
export type SecuritySeverityType = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface SecurityIssue {
  id: string;
  category: "SECURITY";
  engine: SecurityEngineType;
  engineDisplayName: string;
  severity: SecuritySeverityType;
  ruleId: string;
  cwe?: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  message: string;
  snippet: string;
  aiExplanation: string;
  proposedFix: string;
  status: "OPEN" | "RESOLVED";
}

export const MOCK_SECURITY_ISSUES: SecurityIssue[] = [
  {
    id: "sec-1",
    category: "SECURITY",
    engine: "SECRET_SCANNER",
    engineDisplayName: "Secret Detection",
    severity: "CRITICAL",
    ruleId: "SEC_AWS_ACCESS_KEY",
    cwe: "CWE-798: Use of Hard-coded Credentials",
    filePath: "src/config/awsClient.ts",
    lineStart: 12,
    lineEnd: 15,
    message: "Hardcoded AWS Access Key ID detected in client config: 'AKIA************7X2P'",
    snippet: `11:  // S3 bucket backup initialization
12:  const credentials = {
13:      accessKeyId: "AKIA************7X2P",
14:      secretAccessKey: process.env.AWS_SECRET_KEY
15:  };`,
    aiExplanation: "Hardcoded AWS Access Key credentials committed into version control can be scraped by automated bots, resulting in immediate unauthorized cloud infrastructure control, data exfiltration, or crypto-mining bills.",
    proposedFix: `const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
};`,
    status: "OPEN"
  },
  {
    id: "sec-2",
    category: "SECURITY",
    engine: "DEPENDENCY_CHECK",
    engineDisplayName: "Dependency Check",
    severity: "HIGH",
    ruleId: "CVE-2024-46982",
    cwe: "CWE-444: Inconsistent HTTP Parsing",
    filePath: "frontend/package.json",
    lineStart: 16,
    lineEnd: 16,
    message: "Next.js version 14.2.15 contains cache-key normalization vulnerability allowing CDN cache poisoning",
    snippet: `15:    "lucide-react": "^0.453.0",
16:    "next": "14.2.15",
17:    "react": "^18.3.1",`,
    aiExplanation: "Attackers can manipulate HTTP request path delimiters to force intermediate CDN edge nodes into caching attacker-controlled responses for legitimate users, leading to persistent reflected XSS.",
    proposedFix: `// In frontend/package.json:
"next": "^14.2.18"

// Then run:
npm install next@^14.2.18`,
    status: "OPEN"
  },
  {
    id: "sec-3",
    category: "SECURITY",
    engine: "CONFIG_AUDIT",
    engineDisplayName: "Config Audit",
    severity: "HIGH",
    ruleId: "SEC_CSRF_DISABLED",
    cwe: "CWE-352: Cross-Site Request Forgery",
    filePath: "backend/src/main/java/com/devpilot/config/SecurityConfig.java",
    lineStart: 24,
    lineEnd: 24,
    message: "Cross-Site Request Forgery (CSRF) protection is completely disabled in Spring Security chain",
    snippet: `23:  http
24:      .csrf(AbstractHttpConfigurer::disable)
25:      .authorizeHttpRequests(auth -> auth...);`,
    aiExplanation: "Disabling CSRF permits malicious cross-origin websites to submit unauthorized state-changing actions using the victim's authenticated session cookies.",
    proposedFix: `// Enable CSRF with HttpOnly=false cookie repository for SPA frontend:
http.csrf(csrf -> csrf
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
);`,
    status: "OPEN"
  },
  {
    id: "sec-4",
    category: "SECURITY",
    engine: "SECRET_SCANNER",
    engineDisplayName: "Secret Detection",
    severity: "HIGH",
    ruleId: "SEC_GITHUB_TOKEN",
    cwe: "CWE-522: Insufficiently Protected Credentials",
    filePath: ".github/workflows/deploy.yml",
    lineStart: 34,
    lineEnd: 36,
    message: "Potential GitHub Personal Access Token string hardcoded in CI deployment action",
    snippet: `33:  env:
34:    GH_TOKEN: "ghp_********************************6f9a"
35:  run: ./deploy-production.sh`,
    aiExplanation: "Hardcoded personal access tokens expose the developer's complete GitHub identity across organizations and allow unauthorized release tagging or PR merging.",
    proposedFix: `env:
  GH_TOKEN: \${{ secrets.DEV_PAT_SECRET }}`,
    status: "OPEN"
  },
  {
    id: "sec-5",
    category: "SECURITY",
    engine: "DEPENDENCY_CHECK",
    engineDisplayName: "Dependency Check",
    severity: "MEDIUM",
    ruleId: "CVE-2022-23221",
    cwe: "CWE-94: Code Injection",
    filePath: "backend/pom.xml",
    lineStart: 48,
    lineEnd: 52,
    message: "H2 Database driver included in runtime dependencies. Verify H2 Console is disabled in production",
    snippet: `48:  <dependency>
49:      <groupId>com.h2database</groupId>
50:      <artifactId>h2</artifactId>
51:      <scope>runtime</scope>
52:  </dependency>`,
    aiExplanation: "The H2 Console web servlet allows unauthenticated users to initiate remote JNDI LDAP queries, which can result in Remote Code Execution if accessible over public network ports.",
    proposedFix: `// Ensure application.yml explicitly disables console in production:
spring:
  h2:
    console:
      enabled: false`,
    status: "OPEN"
  },
  {
    id: "sec-6",
    category: "SECURITY",
    engine: "CONFIG_AUDIT",
    engineDisplayName: "Config Audit",
    severity: "MEDIUM",
    ruleId: "SEC_DOCKER_ROOT_CONTAINER",
    cwe: "CWE-250: Execution with Unnecessary Privileges",
    filePath: "docker/Dockerfile",
    lineStart: 1,
    lineEnd: 4,
    message: "Container runs process as root. No non-root USER instruction configured in Dockerfile",
    snippet: `1:  FROM eclipse-temurin:21-jre-alpine
2:  WORKDIR /app
3:  COPY target/devpilot-backend.jar app.jar
4:  ENTRYPOINT ["java", "-jar", "app.jar"]`,
    aiExplanation: "Running containerized workloads as root increases blast radius significantly during container breakout exploits or kernel vulnerability exploitation.",
    proposedFix: `RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
ENTRYPOINT ["java", "-jar", "app.jar"]`,
    status: "OPEN"
  }
];
