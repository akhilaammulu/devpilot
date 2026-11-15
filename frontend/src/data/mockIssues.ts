export type ToolType = "SpotBugs" | "PMD" | "Checkstyle" | "ESLint";
export type SeverityType = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface CodeIssue {
  id: string;
  tool: ToolType;
  language: "Java" | "TypeScript";
  severity: SeverityType;
  ruleId: string;
  ruleUrl?: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  message: string;
  codeSnippet: string;
  aiExplanation: string;
  proposedFix: string;
  status: "OPEN" | "RESOLVED";
}

export const MOCK_ISSUES: CodeIssue[] = [
  {
    id: "issue-1",
    tool: "SpotBugs",
    language: "Java",
    severity: "CRITICAL",
    ruleId: "NP_NULL_ON_SOME_PATH",
    filePath: "src/main/java/com/devpilot/service/ScanService.java",
    lineStart: 42,
    lineEnd: 46,
    message: "Possible null pointer dereference: repository.getUser() may be null on line 44",
    codeSnippet: `41:  public RepositoryScan startScan(UUID repositoryId, String branch) {
42:      Repository repository = repositoryRepository.findById(repositoryId).orElse(null);
43:      // SpotBugs warning: repository may dereference null here
44:      String username = repository.getUser().getUsername();
45:      return createScanRecord(repository, username);
46:  }`,
    aiExplanation: "The code retrieves a Repository using `.orElse(null)` and immediately accesses `.getUser()` without a null check. If an invalid repository ID is passed, this will throw a Runtime NullPointerException in production.",
    proposedFix: `Repository repository = repositoryRepository.findById(repositoryId)
    .orElseThrow(() -> new EntityNotFoundException("Repository not found: " + repositoryId));

String username = Optional.ofNullable(repository.getUser())
    .map(User::getUsername)
    .orElse("system");`,
    status: "OPEN",
  },
  {
    id: "issue-2",
    tool: "PMD",
    language: "Java",
    severity: "HIGH",
    ruleId: "CloseResource",
    filePath: "src/main/java/com/devpilot/config/DatabaseHealthCheck.java",
    lineStart: 28,
    lineEnd: 35,
    message: "Resource 'Connection' is created but not closed in all exception paths",
    codeSnippet: `28:  Connection conn = dataSource.getConnection();
29:  Statement stmt = conn.createStatement();
30:  ResultSet rs = stmt.executeQuery("SELECT 1");
31:  if (rs.next()) {
32:      return true;
33:  }
34:  conn.close();
35:  return false;`,
    aiExplanation: "If an SQLException is thrown between lines 29 and 32, `conn.close()` on line 34 is bypassed, causing database connection leaks that will eventually exhaust your connection pool under load.",
    proposedFix: `try (Connection conn = dataSource.getConnection();
     Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery("SELECT 1")) {
    return rs.next();
}`,
    status: "OPEN",
  },
  {
    id: "issue-3",
    tool: "ESLint",
    language: "TypeScript",
    severity: "HIGH",
    ruleId: "react-hooks/exhaustive-deps",
    filePath: "src/hooks/useRepositoryScans.ts",
    lineStart: 18,
    lineEnd: 24,
    message: "React Hook useEffect has a missing dependency: 'fetchScans'. Either include it or remove the dependency array.",
    codeSnippet: `18:  useEffect(() => {
19:      if (repoId) {
20:          fetchScans(repoId);
21:      }
22:  }, [repoId]); // Warning: fetchScans is not listed in dependencies`,
    aiExplanation: "If `fetchScans` changes (or references state/props from parent renders), this effect may invoke a stale closure of `fetchScans`, causing UI desynchronization or race conditions.",
    proposedFix: `const fetchScans = useCallback(async (id: string) => {
    const data = await client.query({ query: GET_SCANS, variables: { id } });
    setScans(data);
}, [client]);

useEffect(() => {
    if (repoId) {
        fetchScans(repoId);
    }
}, [repoId, fetchScans]);`,
    status: "OPEN",
  },
  {
    id: "issue-4",
    tool: "ESLint",
    language: "TypeScript",
    severity: "MEDIUM",
    ruleId: "@typescript-eslint/no-explicit-any",
    filePath: "src/lib/api-client.ts",
    lineStart: 31,
    lineEnd: 33,
    message: "Unexpected any. Specify a different type or use 'unknown' with type guards.",
    codeSnippet: `31:  export async function postPayload(endpoint: string, payload: any): Promise<any> {
32:      return fetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
33:  }`,
    aiExplanation: "Using `any` turns off TypeScript's type checker for payload and response. This masks breaking API schema changes and prevents compile-time contract safety.",
    proposedFix: `export async function postPayload<TBody, TResponse>(
    endpoint: string, 
    payload: TBody
): Promise<TResponse> {
    const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
    return res.json() as Promise<TResponse>;
}`,
    status: "OPEN",
  },
  {
    id: "issue-5",
    tool: "Checkstyle",
    language: "Java",
    severity: "MEDIUM",
    ruleId: "MethodLength",
    filePath: "src/main/java/com/devpilot/controller/GraphQLScanController.java",
    lineStart: 50,
    lineEnd: 118,
    message: "Method 'handleScanExecution' length is 68 lines (max allowed is 50).",
    codeSnippet: `50:  @MutationMapping
51:  public RepositoryScan startScan(@Argument Map<String, Object> input) {
52:      // 68 lines of business logic, database queries, and event dispatching...
...
118: }`,
    aiExplanation: "Long methods reduce readability, increase cognitive complexity, and violate the Single Responsibility Principle. Decomposing into helper methods improves unit testability.",
    proposedFix: `// Extract scan setup, validation, and event dispatch into distinct private methods:
validateScanInput(input);
RepositoryScan scan = scanService.initiateScanRecord(input);
eventPublisher.dispatchScanRequested(scan);
return scan;`,
    status: "OPEN",
  },
  {
    id: "issue-6",
    tool: "Checkstyle",
    language: "Java",
    severity: "LOW",
    ruleId: "AvoidStarImport",
    filePath: "src/main/java/com/devpilot/model/User.java",
    lineStart: 3,
    lineEnd: 3,
    message: "Using the '.*' form of import should be avoided - java.util.*.",
    codeSnippet: `3:  import java.util.*;`,
    aiExplanation: "Star imports pollute the namespace and can introduce ambiguity when two packages define classes with identical names (e.g. java.util.Date vs java.sql.Date).",
    proposedFix: `import java.util.ArrayList;
import java.util.List;
import java.util.UUID;`,
    status: "OPEN",
  },
  {
    id: "issue-7",
    tool: "PMD",
    language: "Java",
    severity: "LOW",
    ruleId: "UnusedPrivateMethod",
    filePath: "src/main/java/com/devpilot/service/TokenService.java",
    lineStart: 72,
    lineEnd: 77,
    message: "Avoid unused private methods such as 'cleanupExpiredTokens(long)'.",
    codeSnippet: `72:  private void cleanupExpiredTokens(long expiryThreshold) {
73:      // Never invoked within TokenService or package
74:  }`,
    aiExplanation: "Dead code adds maintenance overhead, creates false assumptions during refactoring, and inflates the codebase footprint.",
    proposedFix: `// Delete the method or connect it to a scheduled cron job with @Scheduled:
@Scheduled(cron = "0 0 * * * *")
public void cleanupExpiredTokens() { ... }`,
    status: "OPEN",
  },
  {
    id: "issue-8",
    tool: "SpotBugs",
    language: "Java",
    severity: "MEDIUM",
    ruleId: "EI_EXPOSE_REP2",
    filePath: "src/main/java/com/devpilot/model/RepositoryScan.java",
    lineStart: 38,
    lineEnd: 41,
    message: "RepositoryScan.setStartedAt(Date) may expose internal representation by storing an externally mutable object into 'startedAt'",
    codeSnippet: `38:  public void setStartedAt(Date startedAt) {
39:      this.startedAt = startedAt; // Warning: Date is mutable
40:  }`,
    aiExplanation: "`java.util.Date` is mutable. If an external caller modifies the Date reference after passing it into the entity, the entity's internal state is mutated unexpectedly. Prefer immutable `Instant` or defensive copying.",
    proposedFix: `public void setStartedAt(Instant startedAt) {
    this.startedAt = startedAt; // Instant is immutable
}`,
    status: "OPEN",
  }
];
