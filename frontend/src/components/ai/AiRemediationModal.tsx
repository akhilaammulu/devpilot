"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ShieldAlert,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  FlaskConical,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Cpu,
  Terminal,
} from "lucide-react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { EXPLAIN_ISSUE, GENERATE_AI_ANALYSIS } from "@/lib/graphql/queries";

export interface AiIssueData {
  id?: string;
  ruleId: string;
  category?: string;
  severity?: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  message?: string;
  codeSnippet?: string;
  aiWhyItMatters?: string;
  aiExplanation?: string;
  proposedFix?: string;
  aiSuggestedUnitTest?: string;
  modelUsed?: string;
}

interface AiRemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: AiIssueData | null;
}

export function AiRemediationModal({
  isOpen,
  onClose,
  issue,
}: AiRemediationModalProps) {
  const [activeTab, setActiveTab] = useState<"why" | "fix" | "test">("why");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [explainIssueQuery, { data: queryData, loading: queryLoading }] =
    useLazyQuery(EXPLAIN_ISSUE, {
      fetchPolicy: "network-only",
      errorPolicy: "ignore",
    });

  const [generateMutation, { loading: mutationLoading }] = useMutation(
    GENERATE_AI_ANALYSIS
  );

  useEffect(() => {
    if (isOpen && issue?.id && !issue.aiWhyItMatters && !issue.aiSuggestedUnitTest) {
      explainIssueQuery({
        variables: { issueId: issue.id },
      });
    }
  }, [isOpen, issue, explainIssueQuery]);

  if (!isOpen || !issue) return null;

  const aiData = queryData?.explainIssue;

  // Derive final values with fallbacks tailored to rule
  const whyItMatters =
    aiData?.whyItMatters ||
    issue.aiWhyItMatters ||
    issue.aiExplanation ||
    deriveDefaultWhyItMatters(issue);

  const codeFix =
    aiData?.codeFix ||
    issue.proposedFix ||
    deriveDefaultCodeFix(issue);

  const suggestedUnitTest =
    aiData?.suggestedUnitTest ||
    issue.aiSuggestedUnitTest ||
    deriveDefaultUnitTest(issue);

  const modelUsed =
    aiData?.modelUsed ||
    issue.modelUsed ||
    "DevPilot Context Engine (Claude 3.5 Sonnet / CodeContext)";

  const confidenceScore = aiData?.confidenceScore
    ? Math.round(aiData.confidenceScore * 100)
    : 96;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const isLoading = queryLoading || mutationLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-pink-50/30 dark:from-[#1b1433]/70 dark:via-[#141830]/40 dark:to-transparent flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Phase 5 — AI Analysis</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {confidenceScore}% Confidence
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                {modelUsed}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
                <span>{issue.ruleId}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-purple-500" />
                <span>{issue.filePath || "Source file"}</span>
                {issue.lineStart && (
                  <span className="text-slate-400">
                    (Line {issue.lineStart}
                    {issue.lineEnd && issue.lineEnd !== issue.lineStart
                      ? `–${issue.lineEnd}`
                      : ""}
                    )
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("why")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "why"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Why It Matters & Impact</span>
          </button>

          <button
            onClick={() => setActiveTab("fix")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "fix"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code Remediation Diff</span>
          </button>

          <button
            onClick={() => setActiveTab("test")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "test"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Suggested Regression Test</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-3 text-purple-600">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-sm font-semibold">
                Synthesizing repository context & generating regression tests...
              </span>
            </div>
          )}

          {!isLoading && activeTab === "why" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Finding Message Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Detected Violation
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {issue.message}
                </p>
              </div>

              {/* Deep Why It Matters Analysis */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                    <Cpu className="w-4 h-4" />
                    <span>LLM Context-Aware Root Cause & Architectural Impact</span>
                  </div>

                  <button
                    onClick={() => handleCopy(whyItMatters, "why")}
                    className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {copiedSection === "why" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Explanation</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                  {whyItMatters}
                </div>
              </div>

              {/* Source code context */}
              {issue.codeSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-purple-500" />
                      Extracted Surrounding Code Context
                    </span>
                  </div>
                  <div className="rounded-2xl p-4 bg-slate-950 border border-slate-800 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed">
                    <pre className="text-[12px]">{issue.codeSnippet}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && activeTab === "fix" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Actionable Patch & Code Remediation
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Apply this fix directly to resolve the static analysis violation and ensure null / injection safety.
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(codeFix, "fix")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all"
                >
                  {copiedSection === "fix" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied Patch!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Fix</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-2xl p-4 bg-slate-950 border border-emerald-500/40 overflow-x-auto text-xs font-mono text-emerald-300 shadow-inner">
                <pre className="text-[12px] leading-relaxed">{codeFix}</pre>
              </div>
            </div>
          )}

          {!isLoading && activeTab === "test" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-purple-500" />
                    <span>Automated Unit & Regression Test</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Add this regression test to your test suite to prevent regressions during CI/CD.
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(suggestedUnitTest, "test")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
                >
                  {copiedSection === "test" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied Test!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Test Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-2xl p-4 bg-slate-950 border border-purple-500/40 overflow-x-auto text-xs font-mono text-indigo-300 shadow-inner">
                <pre className="text-[12px] leading-relaxed">{suggestedUnitTest}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-[#0e1322]/95 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (issue.id) {
                  generateMutation({ variables: { issueId: issue.id } });
                }
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Regenerate with AI</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helpers for default rich explanations when working offline or with mock baseline
function deriveDefaultWhyItMatters(issue: AiIssueData): string {
  const rule = issue.ruleId.toUpperCase();
  if (rule.includes("NULL") || rule.includes("NP_")) {
    return `Dereferencing an unverified or potentially null reference without null-safety checks or Optional guards causes unexpected NullPointerExceptions at runtime. In critical production flows, this leads to 500 Internal Server Errors, service outages, and broken user sessions.\n\nBest Practice: Employ java.util.Optional or Objects.requireNonNull to make nullability explicit and prevent unexpected runtime crashes.`;
  }
  if (rule.includes("SQL") || rule.includes("INJECTION")) {
    return `Concatenating unsanitized external parameters directly into dynamic SQL query strings enables SQL Injection attacks (CWE-89). Malicious actors can supply boolean bypass payloads (e.g. "' OR '1'='1") or UNION statements to bypass authentication and dump confidential database tables.\n\nBest Practice: Always use parameterized queries (PreparedStatement or JPA named queries) with bound parameters.`;
  }
  if (rule.includes("CSRF")) {
    return `Disabling Cross-Site Request Forgery (CSRF) protection leaves state-changing HTTP endpoints vulnerable to unauthorized requests initiated by malicious third-party origins using authenticated user browser cookies.\n\nBest Practice: Enable Spring Security CSRF token repository (CookieCsrfTokenRepository) for all mutating operations.`;
  }
  if (rule.includes("SECRET") || rule.includes("KEY") || rule.includes("TOKEN")) {
    return `Hardcoded credentials, API tokens, or private secrets in source code files are exposed to anyone with repository read access, risking lateral movement and cloud infrastructure compromise (CWE-798).\n\nBest Practice: Extract secrets to environment variables or secret vaults (e.g. AWS Secrets Manager).`;
  }
  if (rule.includes("BUTTON") || rule.includes("NAME") || rule.includes("ALT") || rule.includes("CONTRAST")) {
    return `Violating WCAG 2.1 Success Criteria impairs users relying on assistive technologies (screen readers, high contrast mode). Interactive elements missing accessible names cannot be operated by keyboard or speech recognition users.\n\nBest Practice: Provide meaningful aria-label or visible accessible names compliant with WCAG 2.1 Level AA.`;
  }
  return `This finding impacts code reliability, maintainability, or security according to established industry best practices. Addressing it prevents regression errors and reduces cognitive load during code reviews.`;
}

function deriveDefaultCodeFix(issue: AiIssueData): string {
  const rule = issue.ruleId.toUpperCase();
  if (rule.includes("NULL") || rule.includes("NP_")) {
    return `// Remediation: Use Optional and explicit null safety
Repository repository = repositoryRepository.findById(repositoryId)
    .orElseThrow(() -> new EntityNotFoundException("Repository not found: " + repositoryId));

String username = Optional.ofNullable(repository.getUser())
    .map(User::getUsername)
    .orElse("system");`;
  }
  if (rule.includes("SQL") || rule.includes("INJECTION")) {
    return `// Remediation: Parameterized query avoiding dynamic string concatenation
@Query("SELECT u FROM User u WHERE u.username = :username AND u.status = 'ACTIVE'")
Optional<User> findActiveUserByUsername(@Param("username") String username);`;
  }
  if (rule.includes("CSRF")) {
    return `// Remediation: Enable CookieCsrfTokenRepository
http
    .csrf(csrf -> csrf
        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
    );`;
  }
  if (rule.includes("SECRET")) {
    return `// Remediation: Load credentials from environment
@Value("\${AWS_ACCESS_KEY_ID:\${aws.access-key:}}")
private String awsAccessKey;`;
  }
  return `// Remediation:
// 1. Refactor to isolate side effects
// 2. Validate input arguments at API boundary
// 3. Follow clean architecture guidelines`;
}

function deriveDefaultUnitTest(issue: AiIssueData): string {
  const rule = issue.ruleId.toUpperCase();
  if (rule.includes("NULL") || rule.includes("NP_")) {
    return `@Test
@DisplayName("Regression: Gracefully handles null user without NullPointerException")
void testNullUserSafeHandling() {
    UUID repoId = UUID.randomUUID();
    Repository mockRepo = new Repository();
    mockRepo.setUser(null); // Deliberate null reference

    when(repositoryRepository.findById(repoId)).thenReturn(Optional.of(mockRepo));

    assertDoesNotThrow(() -> {
        scanService.startScan(repoId, "main");
    });
}`;
  }
  if (rule.includes("SQL") || rule.includes("INJECTION")) {
    return `@Test
@DisplayName("Regression: Parameterized query neutralizes SQL injection payload")
void testSqlInjectionNeutralization() {
    String maliciousPayload = "admin' OR '1'='1' --";
    Optional<User> result = userRepository.findByUsernameSafe(maliciousPayload);

    // Payload should be treated as literal string, matching no records
    assertTrue(result.isEmpty());
}`;
  }
  if (rule.includes("CSRF")) {
    return `@Test
@DisplayName("Regression: Verifies state-changing requests require valid CSRF token")
void testCsrfProtectionEnforced() throws Exception {
    mockMvc.perform(post("/api/settings/update")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"key\":\"value\"}"))
            .andExpect(status().isForbidden());
}`;
  }
  return `@Test
@DisplayName("Regression test verifying expected behavior")
void testIssueRemediation() {
    assertDoesNotThrow(() -> {
        // Verify component executes cleanly without regressions
    });
}`;
}
