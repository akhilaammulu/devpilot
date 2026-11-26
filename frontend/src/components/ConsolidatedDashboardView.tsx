"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_REPOSITORIES,
  START_SCAN,
  GET_PULL_REQUESTS,
  GET_REPOSITORY_INDEX_STATUS,
  GET_PIPELINE_METRICS,
  GET_PIPELINE_RUNS,
} from "@/lib/graphql/queries";
import { AiRemediationModal, AiIssueData } from "@/components/ai/AiRemediationModal";
import { ProjectHealthCore } from "@/components/control-center/ProjectHealthCore";
import {
  LifecycleSystemMap,
  LifecycleNodeId,
  LifecycleNodeData,
} from "@/components/control-center/LifecycleSystemMap";
import {
  IntelligenceLayer,
  IntelligenceSignal,
} from "@/components/control-center/IntelligenceLayer";
import {
  Play,
  RefreshCw,
  GitBranch,
  GitPullRequest,
  Workflow,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface ScanIssue {
  id: string;
  category: "CODE_QUALITY" | "SECURITY" | "ACCESSIBILITY";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  ruleId: string;
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  startLine?: number;
  endLine?: number;
  message: string;
  snippet?: string;
  aiExplanation?: string;
  aiFixSuggestion?: string;
  aiWhyItMatters?: string;
  aiSuggestedUnitTest?: string;
  aiModelUsed?: string;
  engine: string;
  status: string;
}

interface ScanRecord {
  id: string;
  status: string;
  qualityScore?: number;
  securityScore?: number;
  accessibilityScore?: number;
  startedAt?: string;
  completedAt?: string;
  issues?: ScanIssue[];
}

export function ConsolidatedDashboardView() {
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [selectedNodeId, setSelectedNodeId] = useState<LifecycleNodeId | null>("quality");
  const [isScanning, setIsScanning] = useState(false);
  const [aiModalIssue, setAiModalIssue] = useState<AiIssueData | null>(null);

  const { data: repoData, refetch: refetchRepos } = useQuery(GET_REPOSITORIES, {
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  });

  const [startScanMutation] = useMutation(START_SCAN);

  useEffect(() => {
    if (repoData?.repositories?.length > 0 && !selectedRepoId) {
      setSelectedRepoId(repoData.repositories[0].id);
    }
  }, [repoData, selectedRepoId]);

  const { data: prData } = useQuery(GET_PULL_REQUESTS, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  });

  const { data: indexStatusData } = useQuery(GET_REPOSITORY_INDEX_STATUS, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  });

  const { data: pipelineMetricsData } = useQuery(GET_PIPELINE_METRICS, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  });

  const { data: pipelineRunsData } = useQuery(GET_PIPELINE_RUNS, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  });

  const activeRepo = useMemo(() => {
    if (!repoData?.repositories?.length) return null;
    return (
      repoData.repositories.find((r: { id: string }) => r.id === selectedRepoId) ||
      repoData.repositories[0]
    );
  }, [repoData, selectedRepoId]);

  const scans: ScanRecord[] = useMemo(() => activeRepo?.scans || [], [activeRepo]);
  const latestScan: ScanRecord | null = scans.length > 0 ? scans[0] : null;
  const previousScan: ScanRecord | null = scans.length > 1 ? scans[1] : null;
  const allIssues: ScanIssue[] = useMemo(() => latestScan?.issues || [], [latestScan]);
  const openIssues = useMemo(() => allIssues.filter((i) => i.status !== "RESOLVED"), [allIssues]);

  const qualityScore = latestScan?.qualityScore ?? 84;
  const securityScore = latestScan?.securityScore ?? 95;
  const a11yScore = latestScan?.accessibilityScore ?? 88;

  const pipelineMetrics = pipelineMetricsData?.pipelineMetrics;
  const pipelineRuns = useMemo(() => pipelineRunsData?.pipelineRuns || [], [pipelineRunsData]);
  const latestRun = pipelineRuns.length > 0 ? pipelineRuns[0] : null;
  const prs = prData?.pullRequests || [];
  const latestPr = prs.length > 0 ? prs[0] : null;
  const indexStatus = indexStatusData?.repositoryIndexStatus;

  const qualityIssues = openIssues.filter((i) => i.category === "CODE_QUALITY");
  const securityIssues = openIssues.filter((i) => i.category === "SECURITY");
  const a11yIssues = openIssues.filter((i) => i.category === "ACCESSIBILITY");
  const criticalIssues = openIssues.filter((i) => i.severity === "CRITICAL" || i.severity === "HIGH");

  // Compute the 6 Project Health Core dimensions dynamically from live repo telemetry
  const testCoverageScore = latestRun?.qualityScore ?? a11yScore;
  const maintainabilityScore = Math.max(
    18,
    Math.min(100, Math.round(qualityScore * 0.65 + (100 - Math.min(80, openIssues.length / 20)) * 0.35))
  );
  const performanceScore = pipelineMetrics?.averageDurationMs
    ? Math.max(45, Math.min(98, Math.round(100 - pipelineMetrics.averageDurationMs / 2500)))
    : 86;
  const reliabilityScore =
    pipelineMetrics?.successRate !== undefined
      ? Math.round(pipelineMetrics.successRate)
      : Math.round((securityScore + a11yScore) / 2);

  const overallScore = Math.round(
    qualityScore * 0.25 +
      securityScore * 0.25 +
      testCoverageScore * 0.15 +
      maintainabilityScore * 0.15 +
      performanceScore * 0.1 +
      reliabilityScore * 0.1
  );

  const prevQuality = previousScan?.qualityScore ?? qualityScore;
  const qualityDelta = qualityScore - prevQuality;

  const formatRelTime = (iso?: string) => {
    if (!iso) return "Just now";
    const diffMin = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.round(diffHr / 24)}d ago`;
  };

  const lifecycleNodes: Record<LifecycleNodeId, LifecycleNodeData> = useMemo(() => {
    const repoName = activeRepo?.fullName || "devpilot/platform";
    const lastScanTime = formatRelTime(latestScan?.completedAt || latestScan?.startedAt);
    const enginesUsed = Array.from(new Set(allIssues.map((i) => i.engine).filter(Boolean)));

    return {
      repository: {
        id: "repository",
        title: repoName.split("/").pop() || repoName,
        stageLabel: "01 · CODE",
        status: "HEALTHY",
        score: null,
        metricLabel: `${activeRepo?.defaultBranch || "main"} branch`,
        metricValue: `${scans.length} scans`,
        issuesDetected: 0,
        lastExecution: lastScanTime,
        trend: "flat",
        trendLabel: "Synced",
        href: "/repositories",
        summary: `Connected repository ${repoName} tracking ${activeRepo?.defaultBranch || "main"} with automated webhook and RAG indexing.`,
        highlights: [
          `Default branch: ${activeRepo?.defaultBranch || "main"}`,
          `${prs.length} Pull Requests analyzed`,
          `${indexStatus?.filesIndexed ?? 0} source files indexed`,
        ],
      },
      analysis: {
        id: "analysis",
        title: "Static & Deep Analysis",
        stageLabel: "02 · ANALYZE",
        status: isScanning ? "RUNNING" : "HEALTHY",
        score: null,
        metricLabel: `${enginesUsed.length || 4} engines active`,
        metricValue: `${allIssues.length}`,
        issuesDetected: openIssues.length,
        lastExecution: lastScanTime,
        trend: "flat",
        trendLabel: `${enginesUsed.length || 4} analyzers`,
        href: "/scans",
        summary: `Multi-engine execution pipeline running Checkstyle, PMD, SpotBugs, ESLint, Security, and axe-core in parallel.`,
        highlights: [
          `Engines: ${enginesUsed.length > 0 ? enginesUsed.join(", ") : "Checkstyle, PMD, SpotBugs, ESLint"}`,
          `${openIssues.length} open findings across latest scan`,
          `Scan status: ${latestScan?.status || "COMPLETED"}`,
        ],
      },
      quality: {
        id: "quality",
        title: "Code Quality",
        stageLabel: "03 · QUALITY",
        status: qualityScore >= 80 ? "HEALTHY" : qualityScore >= 50 ? "WARNING" : "CRITICAL",
        score: qualityScore,
        metricLabel: `${qualityIssues.length} findings`,
        metricValue: `${qualityScore}`,
        issuesDetected: qualityIssues.length,
        lastExecution: lastScanTime,
        trend: qualityDelta > 0 ? "up" : qualityDelta < 0 ? "down" : "flat",
        trendLabel: qualityDelta === 0 ? "Steady" : `${qualityDelta > 0 ? "+" : ""}${qualityDelta}`,
        href: "/code-quality",
        summary: `Code Intelligence Tree across Java & TypeScript modules. Click Open Workspace to drill down Project → Module → File → Issue.`,
        highlights: [
          `${criticalIssues.length} critical/high priority items`,
          `${qualityIssues.length} total open code quality issues`,
          `AI remediation available per finding`,
        ],
      },
      security: {
        id: "security",
        title: "Security Posture",
        stageLabel: "04 · SECURITY",
        status: securityScore >= 85 ? "HEALTHY" : securityScore >= 60 ? "WARNING" : "CRITICAL",
        score: securityScore,
        metricLabel: "CVE & Secrets",
        metricValue: `${securityScore}`,
        issuesDetected: securityIssues.length,
        lastExecution: lastScanTime,
        trend: "up",
        trendLabel: "+2",
        href: "/security",
        summary: `Dependency vulnerability, secret exposure, and OWASP pattern analysis across the repository.`,
        highlights: [
          `${securityIssues.length} active security findings`,
          `Secrets & credential scanner active`,
          `Security score: ${securityScore}/100`,
        ],
      },
      ai: {
        id: "ai",
        title: "AI Intelligence",
        stageLabel: "04B · INSIGHT",
        status: "HEALTHY",
        score: null,
        metricLabel: "RAG Vector DB",
        metricValue: `${indexStatus?.chunksCreated ?? 0}`,
        issuesDetected: 0,
        lastExecution: "Live",
        trend: "up",
        trendLabel: "Indexed",
        href: "/ai-insights",
        summary: `Repository-aware RAG knowledge base grounding architectural Q&A, root-cause diagnosis, and fix generation.`,
        highlights: [
          `${indexStatus?.filesIndexed ?? 0} files & ${indexStatus?.chunksCreated ?? 0} chunks indexed`,
          `Grounded citations per AI answer`,
          `Automated unit test & patch generation`,
        ],
      },
      tests: {
        id: "tests",
        title: "Tests & A11y",
        stageLabel: "05 · TEST",
        status: a11yScore >= 80 ? "HEALTHY" : "WARNING",
        score: a11yScore,
        metricLabel: "axe-core & suites",
        metricValue: `${a11yScore}`,
        issuesDetected: a11yIssues.length,
        lastExecution: lastScanTime,
        trend: "up",
        trendLabel: "WCAG 2.1",
        href: "/accessibility",
        summary: `Automated Playwright + axe-core WCAG 2.1 accessibility checks and test gate verification.`,
        highlights: [
          `${a11yIssues.length} WCAG violations detected`,
          `Accessibility score: ${a11yScore}/100`,
          `Quality gate threshold: ≥ 80%`,
        ],
      },
      build: {
        id: "build",
        title: "CI/CD Build",
        stageLabel: "06 · BUILD",
        status:
          latestRun?.status === "FAILED"
            ? "CRITICAL"
            : latestRun?.status === "RUNNING"
            ? "RUNNING"
            : "HEALTHY",
        score: pipelineMetrics?.successRate !== undefined ? Math.round(pipelineMetrics.successRate) : 92,
        metricLabel: `${pipelineMetrics?.totalPipelines ?? 0} pipelines`,
        metricValue: `${latestRun?.status || "READY"}`,
        issuesDetected: pipelineMetrics?.failedRuns ?? 0,
        lastExecution: formatRelTime(latestRun?.startedAt),
        trend: "flat",
        trendLabel: `${pipelineMetrics?.totalRuns ?? 0} runs`,
        href: "/pipelines",
        summary: `Living CI/CD execution graph with automated Quality Gate enforcement, artifact tracking, and terminal logs.`,
        highlights: [
          `Latest run: ${latestRun?.status || "No runs yet"}`,
          `Average duration: ${
            pipelineMetrics?.averageDurationMs
              ? `${(pipelineMetrics.averageDurationMs / 1000).toFixed(1)}s`
              : "—"
          }`,
          `Success rate: ${
            pipelineMetrics?.successRate !== undefined
              ? `${Math.round(pipelineMetrics.successRate)}%`
              : "—"
          }`,
        ],
      },
      deploy: {
        id: "deploy",
        title: "Deployment",
        stageLabel: "07 · DEPLOY",
        status: latestRun?.status === "PASSED" ? "HEALTHY" : "IDLE",
        score: null,
        metricLabel: "Target env",
        metricValue: pipelineMetrics?.latestDeploymentStatus || "STAGING",
        issuesDetected: 0,
        lastExecution: formatRelTime(latestRun?.completedAt),
        trend: "up",
        trendLabel: "Protected",
        href: "/pipelines",
        summary: `Environment promotion with production approval safeguards, secret masking, and one-click rollback.`,
        highlights: [
          `Status: ${pipelineMetrics?.latestDeploymentStatus || "Ready for promotion"}`,
          `Production gate requires Quality Gate pass`,
          `Instant rollback supported`,
        ],
      },
    };
  }, [
    activeRepo,
    latestScan,
    allIssues,
    openIssues.length,
    qualityIssues.length,
    securityIssues.length,
    a11yIssues.length,
    criticalIssues.length,
    qualityScore,
    securityScore,
    a11yScore,
    qualityDelta,
    scans.length,
    prs.length,
    indexStatus,
    pipelineMetrics,
    latestRun,
    isScanning,
  ]);

  const intelligenceSignals: IntelligenceSignal[] = useMemo(() => {
    return [
      {
        id: "sig-quality",
        kind: "Quality Alert",
        title:
          qualityScore < 70
            ? `Code Quality at ${qualityScore}/100 (${qualityIssues.length} open findings)`
            : `Code Quality holding steady at ${qualityScore}/100`,
        whatChanged:
          qualityDelta < 0
            ? `Quality score dropped ${Math.abs(qualityDelta)} pts since the previous scan.`
            : `${qualityIssues.length} static findings detected across Checkstyle, PMD, SpotBugs, and ESLint.`,
        whyItMatters:
          "Unresolved static and maintainability debt blocks the CI/CD Quality Gate before deployment.",
        nextAction: "Explore Code Tree",
        href: "/code-quality",
        severity: qualityScore < 60 ? "critical" : "warning",
      },
      {
        id: "sig-ai",
        kind: "AI Recommendation",
        title:
          indexStatus?.chunksCreated > 0
            ? `${indexStatus.chunksCreated} code chunks indexed for root-cause fixes`
            : "Index repository for architecture-aware remediation",
        whatChanged: `RAG Vector DB covers ${indexStatus?.filesIndexed ?? 0} source files in ${activeRepo?.fullName || "repository"}.`,
        whyItMatters:
          "Grounded context lets DevPilot generate exact patches and unit tests instead of generic advice.",
        nextAction: "Ask Repository AI",
        href: "/ai-insights",
        severity: "info",
      },
      {
        id: "sig-security",
        kind: "Security Insight",
        title:
          securityIssues.length > 0
            ? `${securityIssues.length} security finding(s) require triage`
            : `Zero critical vulnerabilities detected (${securityScore}/100)`,
        whatChanged: `Latest security sweep scored ${securityScore}/100 across dependencies and secrets.`,
        whyItMatters: "Early CVE and secret detection prevents credential leaks from reaching main.",
        nextAction: "Inspect Security Layer",
        href: "/security",
        severity: securityIssues.length > 0 ? "critical" : "info",
      },
      {
        id: "sig-pipeline",
        kind: "Pipeline Insight",
        title: latestRun
          ? `Latest pipeline ${latestRun.status.toLowerCase()} (${Math.round(
              pipelineMetrics?.successRate ?? 100
            )}% pass rate)`
          : "Configure automated lifecycle pipeline",
        whatChanged: latestRun
          ? `Execution completed across ${latestRun.stages?.length || 7} lifecycle stages.`
          : "No pipeline runs executed yet for this repository.",
        whyItMatters:
          "Connecting Quality Gates to Build & Deploy enforces zero-regression releases.",
        nextAction: "Open Living Pipeline",
        href: "/pipelines",
        severity: latestRun?.status === "FAILED" ? "warning" : "info",
      },
    ];
  }, [
    qualityScore,
    qualityDelta,
    qualityIssues.length,
    securityScore,
    securityIssues.length,
    indexStatus,
    activeRepo,
    latestRun,
    pipelineMetrics,
  ]);

  const handleRunFullScan = async () => {
    if (!activeRepo?.id) return;
    setIsScanning(true);
    try {
      await startScanMutation({
        variables: {
          input: {
            repositoryId: activeRepo.id,
            branchName: activeRepo.defaultBranch || "main",
            commitSha: "HEAD",
          },
        },
      });
      await refetchRepos();
    } catch (e) {
      console.error("Full scan failed", e);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Layer 2: Project Command Center Bar */}
      <div className="layer-environment rounded-3xl px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-up">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>Project Command Center</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Understanding → Exploration → Action</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {activeRepo?.fullName || "DevPilot Engineering System"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {repoData?.repositories?.length > 0 && (
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#090d16] border border-[#222d42] text-xs font-mono text-slate-200 outline-none focus:border-cyan-500/60"
            >
              {repoData.repositories.map((r: { id: string; fullName: string }) => (
                <option key={r.id} value={r.id}>
                  {r.fullName}
                </option>
              ))}
            </select>
          )}

          {activeRepo && (
            <span className="px-3 py-2 rounded-xl bg-[#090d16] border border-[#222d42] text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              {activeRepo.defaultBranch || "main"}
            </span>
          )}

          <button
            onClick={handleRunFullScan}
            disabled={isScanning || !activeRepo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#06080d] bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_24px_-6px_rgba(34,211,238,0.6)] disabled:opacity-50 transition-all"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Lifecycle...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Execute Full Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Layer 3: Project Health Core + Interactive Code Lifecycle Map */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-up delay-75">
        <div className="xl:col-span-4">
          <ProjectHealthCore
            projectName={activeRepo?.fullName || "devpilot"}
            branchName={activeRepo?.defaultBranch || "main"}
            overallScore={overallScore}
            qualityScore={qualityScore}
            securityScore={securityScore}
            a11yScore={a11yScore}
            testCoverageScore={testCoverageScore}
            maintainabilityScore={maintainabilityScore}
            performanceScore={performanceScore}
            reliabilityScore={reliabilityScore}
            totalOpenIssues={openIssues.length}
            isScanning={isScanning}
          />
        </div>

        <div className="xl:col-span-8">
          <LifecycleSystemMap
            nodes={lifecycleNodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId((prev) => (prev === id ? null : id))}
            onCloseDetail={() => setSelectedNodeId(null)}
            isScanning={isScanning}
          />
        </div>
      </div>

      {/* Layer 5: Contextual AI Intelligence Layer */}
      <div className="animate-fade-up delay-150">
        <IntelligenceLayer signals={intelligenceSignals} />
      </div>

      {/* Command Center Activity Strip: Recent Changes · Pipeline Activity · Critical Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up delay-225">
        {/* Recent Changes / PR Reviews */}
        <div className="layer-environment rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />
              Recent Changes
            </span>
            <Link href="/pull-requests" className="text-[11px] font-mono text-cyan-400 hover:underline">
              {prs.length} PRs →
            </Link>
          </div>
          {latestPr ? (
            <div className="p-3.5 rounded-2xl bg-[#090d16] border border-[#1d273b] space-y-1.5">
              <div className="text-xs font-bold text-white truncate">
                #{latestPr.githubPrNumber} · {latestPr.title}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="text-cyan-400 font-bold">Score {latestPr.prScore ?? "--"}/100</span>
                <span>·</span>
                <span>{latestPr.reviewStatus || "PENDING"}</span>
                <span>·</span>
                <span>{latestPr.findingsCount ?? 0} findings</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#090d16] border border-[#1d273b] text-xs text-slate-500">
              No pull request events recorded yet.
            </div>
          )}
        </div>

        {/* Pipeline Activity */}
        <div className="layer-environment rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Workflow className="w-3.5 h-3.5 text-emerald-400" />
              Pipeline Activity
            </span>
            <Link href="/pipelines" className="text-[11px] font-mono text-cyan-400 hover:underline">
              Living Flow →
            </Link>
          </div>
          {latestRun ? (
            <div className="p-3.5 rounded-2xl bg-[#090d16] border border-[#1d273b] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="truncate">{latestRun.pipelineName || "CI/CD Pipeline"}</span>
                {latestRun.status === "PASSED" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : latestRun.status === "FAILED" ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>{latestRun.status}</span>
                <span>·</span>
                <span>{latestRun.branchName || "main"}</span>
                <span>·</span>
                <span>{formatRelTime(latestRun.startedAt)}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#090d16] border border-[#1d273b] text-xs text-slate-500">
              No pipeline runs yet. Launch one from Delivery.
            </div>
          )}
        </div>

        {/* Critical Issues */}
        <div className="layer-environment rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Critical Issues ({criticalIssues.length})
            </span>
            <Link href="/code-quality" className="text-[11px] font-mono text-cyan-400 hover:underline">
              Code Tree →
            </Link>
          </div>
          {criticalIssues.length > 0 ? (
            <div className="space-y-2">
              {criticalIssues.slice(0, 2).map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() =>
                    setAiModalIssue({
                      id: issue.id,
                      ruleId: issue.ruleId,
                      severity: issue.severity,
                      filePath: issue.filePath,
                      lineStart: issue.startLine || issue.lineStart || 1,
                      lineEnd: issue.endLine || issue.lineEnd || 1,
                      message: issue.message,
                      codeSnippet: issue.snippet,
                      aiExplanation: issue.aiExplanation,
                      proposedFix: issue.aiFixSuggestion,
                      aiWhyItMatters: issue.aiWhyItMatters,
                      aiSuggestedUnitTest: issue.aiSuggestedUnitTest,
                      modelUsed: issue.aiModelUsed,
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl bg-[#090d16] hover:bg-[#101726] border border-[#1d273b] hover:border-rose-500/40 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">{issue.message}</div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {issue.filePath}
                    </div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#090d16] border border-[#1d273b] text-xs text-emerald-400 flex items-center justify-between">
              <span>No critical/high blockers detected.</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      <AiRemediationModal
        isOpen={!!aiModalIssue}
        issue={aiModalIssue}
        onClose={() => setAiModalIssue(null)}
      />
    </div>
  );
}
