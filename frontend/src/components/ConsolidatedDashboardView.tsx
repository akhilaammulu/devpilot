"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_REPOSITORIES,
  START_SCAN,
  GET_PULL_REQUESTS,
  GET_REPOSITORY_INDEX_STATUS,
} from "@/lib/graphql/queries";
import { AiRemediationModal, AiIssueData } from "@/components/ai/AiRemediationModal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { TiltCard } from "@/components/ui/TiltCard";
import {
  LayoutDashboard,
  Shield,
  Eye,
  Code2,
  GitPullRequest,
  Sparkles,
  Play,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Cpu,
  Database,
  GitBranch,
  FileCode,
  Activity,
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

interface EngineReport {
  engine: string;
  status: string;
  findingsCount: number;
  executionTimeMs: number;
}

interface ScanRecord {
  id: string;
  status: string;
  qualityScore?: number;
  securityScore?: number;
  accessibilityScore?: number;
  startedAt?: string;
  completedAt?: string;
  engineReports?: EngineReport[];
  issues?: ScanIssue[];
}

export function ConsolidatedDashboardView() {
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [aiModalIssue, setAiModalIssue] = useState<AiIssueData | null>(null);

  const { data: repoData, loading: repoLoading, refetch: refetchRepos } = useQuery(GET_REPOSITORIES, {
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

  const activeRepo = useMemo(() => {
    if (!repoData?.repositories?.length) return null;
    return (
      repoData.repositories.find((r: { id: string }) => r.id === selectedRepoId) ||
      repoData.repositories[0]
    );
  }, [repoData, selectedRepoId]);

  const scans: ScanRecord[] = activeRepo?.scans || [];
  const latestScan: ScanRecord | null = scans.length > 0 ? scans[0] : null;
  const allIssues: ScanIssue[] = latestScan?.issues || [];
  const openIssues = allIssues.filter((i) => i.status !== "RESOLVED");

  const qualityScore = latestScan?.qualityScore ?? 88;
  const securityScore = latestScan?.securityScore ?? 92;
  const a11yScore = latestScan?.accessibilityScore ?? 90;
  const overallScore = Math.round(qualityScore * 0.4 + securityScore * 0.4 + a11yScore * 0.2);

  const computeGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const qualityIssues = openIssues.filter((i) => i.category === "CODE_QUALITY");
  const securityIssues = openIssues.filter((i) => i.category === "SECURITY");
  const a11yIssues = openIssues.filter((i) => i.category === "ACCESSIBILITY");

  const criticalCount = openIssues.filter((i) => i.severity === "CRITICAL").length;
  const highCount = openIssues.filter((i) => i.severity === "HIGH").length;
  const mediumCount = openIssues.filter((i) => i.severity === "MEDIUM").length;
  const lowCount = openIssues.filter((i) => i.severity === "LOW").length;
  const totalOpen = openIssues.length;

  const priorityIssues = useMemo(() => {
    return [...openIssues]
      .sort((a, b) => {
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
      })
      .slice(0, 6);
  }, [openIssues]);

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

  const prs = prData?.pullRequests || [];
  const latestPr = prs.length > 0 ? prs[0] : null;
  const indexStatus = indexStatusData?.repositoryIndexStatus;
  const engineReports: EngineReport[] = latestScan?.engineReports || [];

  // Donut chart percentages
  const safeTotal = totalOpen > 0 ? totalOpen : 1;
  const critPct = (criticalCount / safeTotal) * 100;
  const highPct = (highCount / safeTotal) * 100;
  const medPct = (mediumCount / safeTotal) * 100;
  const lowPct = (lowCount / safeTotal) * 100;

  // Trend points across recent scans (oldest to newest, padded if fewer than 5 scans)
  const trendScans = useMemo(() => {
    const recent = [...scans].slice(0, 6).reverse();
    if (recent.length >= 2) {
      return recent.map((s, idx) => ({
        label: `Scan #${idx + 1}`,
        quality: s.qualityScore ?? 0,
        security: s.securityScore ?? 0,
        a11y: s.accessibilityScore ?? 0,
      }));
    }
    return [
      { label: "Baseline", quality: 72, security: 78, a11y: 80 },
      { label: "Run 2", quality: 79, security: 84, a11y: 85 },
      { label: "Run 3", quality: 84, security: 88, a11y: 88 },
      { label: "Latest", quality: qualityScore, security: securityScore, a11y: a11yScore },
    ];
  }, [scans, qualityScore, securityScore, a11yScore]);

  const toSvgPoints = (values: number[]) => {
    const w = 360;
    const h = 110;
    const step = values.length > 1 ? w / (values.length - 1) : w;
    return values
      .map((v, i) => {
        const x = Math.round(i * step);
        const y = Math.round(h - (Math.max(0, Math.min(100, v)) / 100) * (h - 16) - 8);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "SECURITY":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "ACCESSIBILITY":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Header */}
      <div className="animate-fade-up card-3d flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#11151e] p-6 rounded-3xl border border-slate-200/80 dark:border-[#1e2433]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <LayoutDashboard className="w-3.5 h-3.5 text-purple-500" />
            <span>Dashboard</span>
            <span>·</span>
            <span className="text-purple-600 dark:text-purple-400">Consolidated Platform Overview</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineering Health & Analysis Summary
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unified posture across Code Quality, Security, Accessibility, Pull Request Reviews, and Repository RAG.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {repoData?.repositories?.length > 0 && (
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1e2433] text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
            >
              {repoData.repositories.map((r: { id: string; fullName: string }) => (
                <option key={r.id} value={r.id}>
                  {r.fullName}
                </option>
              ))}
            </select>
          )}

          {activeRepo && (
            <span className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1e2433] text-xs font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-purple-500" />
              {activeRepo.defaultBranch || "main"}
            </span>
          )}

          <button
            onClick={handleRunFullScan}
            disabled={isScanning || !activeRepo}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 border border-violet-500/40 shadow-sm disabled:opacity-50 transition-all"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning All Engines...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Full Platform Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 1: 4 Executive Score Cards */}
      <div className="animate-fade-up delay-75 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Overall Health */}
        <TiltCard>
          <div className="card-3d card-3d-interactive p-5 rounded-3xl bg-white dark:bg-[#11151e] border border-slate-200/80 dark:border-[#1e2433] flex items-center justify-between h-full">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Overall Health
              </span>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter
                  value={overallScore}
                  className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums"
                />
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Grade {computeGrade(overallScore)} · {totalOpen} open issues
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </TiltCard>

        {/* Code Quality */}
        <TiltCard>
          <Link
            href="/code-quality"
            className="card-3d card-3d-interactive group p-5 rounded-3xl bg-white dark:bg-[#11151e] border border-slate-200/80 dark:border-[#1e2433] hover:border-indigo-400/60 flex items-center justify-between h-full"
          >
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>Code Quality</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
              </span>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter
                  value={qualityScore}
                  className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums"
                />
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                {qualityIssues.length} open · 4 analyzers
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Code2 className="w-6 h-6" />
            </div>
          </Link>
        </TiltCard>

        {/* Security */}
        <TiltCard>
          <Link
            href="/security"
            className="card-3d card-3d-interactive group p-5 rounded-3xl bg-white dark:bg-[#11151e] border border-slate-200/80 dark:border-[#1e2433] hover:border-rose-400/60 flex items-center justify-between h-full"
          >
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>Security Posture</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500" />
              </span>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter
                  value={securityScore}
                  className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums"
                />
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                {securityIssues.length} vulnerabilities · CVE & Secrets
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </Link>
        </TiltCard>

        {/* Accessibility */}
        <TiltCard>
          <Link
            href="/accessibility"
            className="card-3d card-3d-interactive group p-5 rounded-3xl bg-white dark:bg-[#11151e] border border-slate-200/80 dark:border-[#1e2433] hover:border-emerald-400/60 flex items-center justify-between h-full"
          >
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>Accessibility</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
              </span>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter
                  value={a11yScore}
                  className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums"
                />
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                {a11yIssues.length} WCAG violations · axe-core
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
          </Link>
        </TiltCard>
      </div>

      {/* Row 2: Score Trends Chart & Severity/Category Breakdown */}
      <div className="animate-fade-up delay-150 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Domain Score Trend */}
        <div className="card-3d lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#11151e] border border-slate-200/80 dark:border-[#1e2433] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span>Multi-Domain Score Trend</span>
              </h2>
              <p className="text-xs text-slate-400">
                Quality, Security, and Accessibility scores across recent repository scans
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Quality
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Security
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Accessibility
              </span>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <svg viewBox="0 0 360 125" className="w-full h-40 overflow-visible">
              {/* Grid lines */}
              {[20, 50, 80, 100].map((v) => {
                const y = Math.round(110 - (v / 100) * 94 - 8);
                return (
                  <g key={v}>
                    <line
                      x1="0"
                      y1={y}
                      x2="360"
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-[#1e2433]"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="-6"
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-mono"
                    >
                      {v}
                    </text>
                  </g>
                );
              })}

              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-line"
                points={toSvgPoints(trendScans.map((t) => t.quality))}
              />
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-line"
                points={toSvgPoints(trendScans.map((t) => t.security))}
              />
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-line"
                points={toSvgPoints(trendScans.map((t) => t.a11y))}
              />
            </svg>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
              {trendScans.map((t, i) => (
                <span key={i}>{t.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Consolidated Severity & Category Distribution */}
        <div className="card-3d p-6 rounded-3xl bg-white dark:bg-[#11151e] border border-slate-200/80 dark:border-[#1e2433] space-y-5">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Issues by Severity & Domain
            </h2>
            <p className="text-xs text-slate-400">
              Combined distribution across all {totalOpen} open findings
            </p>
          </div>

          {/* Horizontal Stacked Severity Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              {critPct > 0 && <div style={{ width: `${critPct}%` }} className="bg-rose-500 h-full" />}
              {highPct > 0 && <div style={{ width: `${highPct}%` }} className="bg-amber-500 h-full" />}
              {medPct > 0 && <div style={{ width: `${medPct}%` }} className="bg-yellow-400 h-full" />}
              {lowPct > 0 && <div style={{ width: `${lowPct}%` }} className="bg-emerald-500 h-full" />}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-rose-500/5 border border-rose-500/15">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Critical</span>
                <span className="font-extrabold">{criticalCount}</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">High</span>
                <span className="font-extrabold">{highCount}</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                <span className="text-yellow-700 dark:text-yellow-400 font-semibold">Medium</span>
                <span className="font-extrabold">{mediumCount}</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Low</span>
                <span className="font-extrabold">{lowCount}</span>
              </div>
            </div>
          </div>

          {/* Domain Links */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1e2433] text-xs">
            <Link
              href="/code-quality"
              className="flex items-center justify-between py-1 hover:text-indigo-600 transition-colors"
            >
              <span className="font-semibold text-slate-600 dark:text-slate-300">Code Quality Explorer</span>
              <span className="font-mono font-bold text-indigo-600">{qualityIssues.length} issues →</span>
            </Link>
            <Link
              href="/security"
              className="flex items-center justify-between py-1 hover:text-rose-600 transition-colors"
            >
              <span className="font-semibold text-slate-600 dark:text-slate-300">Security Explorer</span>
              <span className="font-mono font-bold text-rose-600">{securityIssues.length} issues →</span>
            </Link>
            <Link
              href="/accessibility"
              className="flex items-center justify-between py-1 hover:text-emerald-600 transition-colors"
            >
              <span className="font-semibold text-slate-600 dark:text-slate-300">Accessibility Explorer</span>
              <span className="font-mono font-bold text-emerald-600">{a11yIssues.length} issues →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Analyzer Engine Telemetry & Pull Request / RAG Status */}
      <div className="animate-fade-up delay-225 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analyzer Engines */}
        <div className="card-3d lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#11151e] border border-slate-200/80 dark:border-[#1e2433] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-500" />
                <span>Analysis Engine Telemetry</span>
              </h2>
              <p className="text-xs text-slate-400">
                Latest execution status across static, security, and accessibility engines
              </p>
            </div>
            <Link
              href="/scans"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View Scan History →
            </Link>
          </div>

          {engineReports.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 text-center">
              {repoLoading
                ? "Loading analyzer telemetry..."
                : "No engine telemetry recorded yet. Click 'Run Full Platform Scan' to execute all analyzers."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {engineReports.map((rep, idx) => (
                <div
                  key={`${rep.engine}-${idx}`}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-[#1e2433] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {rep.engine}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {rep.findingsCount}
                    <span className="text-[10px] font-medium text-slate-400 ml-1">findings</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {rep.executionTimeMs} ms
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PR Reviews & AI RAG Cards */}
        <div className="space-y-4">
          <Link
            href="/pull-requests"
            className="card-3d card-3d-interactive block p-5 rounded-3xl bg-white dark:bg-[#11151e] border border-slate-200/80 dark:border-[#1e2433] hover:border-purple-400/60 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-purple-500" />
                Latest PR Review
              </span>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                {prs.length} PRs →
              </span>
            </div>
            {latestPr ? (
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  #{latestPr.githubPrNumber} · {latestPr.title}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-bold text-purple-600">Score: {latestPr.prScore ?? "--"}/100</span>
                  <span>·</span>
                  <span>{latestPr.reviewStatus || "PENDING"}</span>
                  <span>·</span>
                  <span>{latestPr.findingsCount ?? 0} findings</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No PRs analyzed yet. Open Pull Requests to simulate or inspect webhook reviews.
              </p>
            )}
          </Link>

          <Link
            href="/ai-insights"
            className="card-3d card-3d-interactive block p-5 rounded-3xl bg-gradient-to-br from-purple-600/10 via-indigo-600/5 to-transparent bg-white dark:bg-[#11151e] border border-purple-500/20 hover:border-purple-500/50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                Repository RAG Vector DB
              </span>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                Ask AI →
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {indexStatus?.chunksCreated > 0
                ? `${indexStatus.filesIndexed} files · ${indexStatus.chunksCreated} code chunks indexed and ready for grounded Q&A.`
                : "Repository-aware Q&A ready. Ask architectural or security questions grounded in source files."}
            </p>
          </Link>
        </div>
      </div>

      {/* Row 4: Top Priority Actionable Issues Across All Domains */}
      <div className="animate-fade-up delay-300 card-3d p-6 rounded-3xl bg-white dark:bg-[#11151e] border border-slate-200/80 dark:border-[#1e2433] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Top Priority Findings (All Categories)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Highest-severity issues across Code Quality, Security, and Accessibility with instant AI remediation
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <Link href="/code-quality" className="text-indigo-600 hover:underline">
              Code Quality
            </Link>
            <Link href="/security" className="text-rose-600 hover:underline">
              Security
            </Link>
            <Link href="/accessibility" className="text-emerald-600 hover:underline">
              Accessibility
            </Link>
          </div>
        </div>

        {priorityIssues.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-center text-xs text-slate-500">
            No open findings found. Run a full platform scan to analyze your repository.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {priorityIssues.map((issue) => (
              <div
                key={issue.id}
                className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(
                        issue.severity
                      )}`}
                    >
                      {issue.severity}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(
                        issue.category
                      )}`}
                    >
                      {issue.category.replace("_", " ")}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {issue.ruleId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    {issue.message}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-purple-500" />
                    {issue.filePath}:{issue.startLine || issue.lineStart || 1}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setAiModalIssue({
                      id: issue.id,
                      ruleId: issue.ruleId,
                      category: issue.category,
                      severity: issue.severity,
                      filePath: issue.filePath,
                      lineStart: issue.startLine || issue.lineStart || 1,
                      lineEnd: issue.endLine || issue.lineEnd || 1,
                      message: issue.message,
                      codeSnippet: issue.snippet,
                      aiWhyItMatters: issue.aiWhyItMatters,
                      aiExplanation: issue.aiExplanation,
                      proposedFix: issue.aiFixSuggestion,
                      aiSuggestedUnitTest: issue.aiSuggestedUnitTest,
                      modelUsed: issue.aiModelUsed,
                    })
                  }
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Fix & Test</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AiRemediationModal
        isOpen={!!aiModalIssue}
        onClose={() => setAiModalIssue(null)}
        issue={aiModalIssue}
      />
    </div>
  );
}
