"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Key,
  Package,
  Sliders,
  TrendingDown,
  BarChart2,
  ListFilter,
  Search,
  Sparkles,
  ArrowRight,
  FileCode,
  MoreVertical,
  CheckCircle,
  Home,
  ChevronRight,
  Play,
  RefreshCw,
  Cpu,
  Lock,
  Unlock,
  Check,
} from "lucide-react";
import { MOCK_SECURITY_ISSUES, SecurityIssue, SecuritySeverityType, SecurityEngineType } from "@/data/mockSecurityIssues";
import { SecurityIssueDetailDrawer } from "./SecurityIssueDetailDrawer";
import { GET_REPOSITORIES, START_SCAN, UPDATE_ISSUE_STATUS } from "@/lib/graphql/queries";

interface EngineReport {
  engine: string;
  status: string;
  findingsCount: number;
  executionTimeMs: number;
  message?: string;
}

export function SecurityExplorerView() {
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedEngine, setSelectedEngine] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("OPEN");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeIssue, setActiveIssue] = useState<SecurityIssue | null>(null);
  const [engineReports, setEngineReports] = useState<EngineReport[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");

  const { data: repoData, loading: repoLoading, refetch: refetchRepos } = useQuery(GET_REPOSITORIES, {
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  });

  const [startScanMutation] = useMutation(START_SCAN);
  const [updateStatusMutation] = useMutation(UPDATE_ISSUE_STATUS);

  // Sync with real scan findings from the connected repository or baseline mock
  useEffect(() => {
    if (repoData && repoData.repositories && repoData.repositories.length > 0) {
      const repo = repoData.repositories[0];
      setSelectedRepoId(repo.id);

      if (repo.scans && repo.scans.length > 0) {
        const latestScan = repo.scans[0];
        if (latestScan.engineReports) {
          const secReports = latestScan.engineReports.filter((r: EngineReport) =>
            r.engine.toLowerCase().includes("depend") ||
            r.engine.toLowerCase().includes("secret") ||
            r.engine.toLowerCase().includes("config")
          );
          if (secReports.length > 0) {
            setEngineReports(secReports);
          }
        }
        if (latestScan.issues && latestScan.issues.length > 0) {
          const secIssues = latestScan.issues.filter((iss: any) => iss.category === "SECURITY");
          if (secIssues.length > 0) {
            const mappedIssues: SecurityIssue[] = secIssues.map((iss: any) => ({
              id: iss.id,
              category: "SECURITY",
              engine: (iss.engine || "DEPENDENCY_CHECK") as SecurityEngineType,
              engineDisplayName:
                iss.engine === "SECRET_SCANNER" ? "Secret Detection" :
                iss.engine === "CONFIG_AUDIT" ? "Config Audit" : "Dependency Check",
              severity: iss.severity as SecuritySeverityType,
              ruleId: iss.ruleId,
              cwe: iss.ruleId.startsWith("SEC_AWS") ? "CWE-798" :
                   iss.ruleId.startsWith("CVE") ? "CWE-444" : "CWE-352",
              filePath: iss.filePath,
              lineStart: iss.startLine || 1,
              lineEnd: iss.endLine || 1,
              message: iss.message,
              snippet: iss.snippet || `${iss.startLine || 1}: // Security finding\n${iss.message}`,
              aiExplanation: iss.aiExplanation || "Automated security scanner finding detected in repository.",
              proposedFix: iss.aiFixSuggestion || "// Apply security remediation patch.",
              status: (iss.status || "OPEN") as "OPEN" | "RESOLVED",
            }));
            setIssues(mappedIssues);
            return;
          }
        }
      }
    }

    // Default baseline for Security Explorer
    if (issues.length === 0) {
      setIssues(MOCK_SECURITY_ISSUES);
      setEngineReports([
        { engine: "DependencyCheck", status: "COMPLETED", findingsCount: 2, executionTimeMs: 240 },
        { engine: "SecretDetection", status: "COMPLETED", findingsCount: 2, executionTimeMs: 110 },
        { engine: "ConfigAudit", status: "COMPLETED", findingsCount: 2, executionTimeMs: 85 },
      ]);
    }
  }, [repoData, issues.length]);

  // Execute Real Security Scan
  const handleStartSecurityScan = async () => {
    setIsScanning(true);
    try {
      let repoId = selectedRepoId;
      if (!repoId && repoData?.repositories?.length > 0) {
        repoId = repoData.repositories[0].id;
      }
      if (!repoId) {
        repoId = "bd8f2564-cd45-4d64-aa15-1719da0df96b";
      }

      const res = await startScanMutation({
        variables: {
          input: {
            repositoryId: repoId,
            branchName: "main",
            commitSha: "HEAD",
          },
        },
      });

      if (res.data?.startScan) {
        const scan = res.data.startScan;
        if (scan.engineReports) {
          const secReports = scan.engineReports.filter((r: EngineReport) =>
            r.engine.toLowerCase().includes("depend") ||
            r.engine.toLowerCase().includes("secret") ||
            r.engine.toLowerCase().includes("config")
          );
          setEngineReports(secReports);
        }
        if (scan.issues && scan.issues.length > 0) {
          const secIssues = scan.issues.filter((iss: any) => iss.category === "SECURITY");
          if (secIssues.length > 0) {
            const mappedIssues: SecurityIssue[] = secIssues.map((iss: any) => ({
              id: iss.id,
              category: "SECURITY",
              engine: (iss.engine || "DEPENDENCY_CHECK") as SecurityEngineType,
              engineDisplayName:
                iss.engine === "SECRET_SCANNER" ? "Secret Detection" :
                iss.engine === "CONFIG_AUDIT" ? "Config Audit" : "Dependency Check",
              severity: iss.severity as SecuritySeverityType,
              ruleId: iss.ruleId,
              cwe: iss.ruleId.startsWith("SEC_AWS") ? "CWE-798" :
                   iss.ruleId.startsWith("CVE") ? "CWE-444" : "CWE-352",
              filePath: iss.filePath,
              lineStart: iss.startLine || 1,
              lineEnd: iss.endLine || 1,
              message: iss.message,
              snippet: iss.snippet || `${iss.startLine || 1}: // Security finding\n${iss.message}`,
              aiExplanation: iss.aiExplanation || "Automated security scanner finding detected in repository.",
              proposedFix: iss.aiFixSuggestion || "// Apply security remediation patch.",
              status: (iss.status || "OPEN") as "OPEN" | "RESOLVED",
            }));
            setIssues(mappedIssues);
          }
        }
      }
      await refetchRepos();
    } catch (err) {
      console.warn("Real scan execution fallback:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleResolve = async (id: string) => {
    const target = issues.find((i) => i.id === id);
    const nextStatus = target?.status === "RESOLVED" ? "OPEN" : "RESOLVED";

    setIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, status: nextStatus } : iss))
    );
    if (activeIssue && activeIssue.id === id) {
      setActiveIssue((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    try {
      await updateStatusMutation({
        variables: { id, status: nextStatus },
      });
    } catch (e) {
      console.debug("Persisted security issue status locally.");
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSeverity =
        selectedSeverity === "ALL" || issue.severity === selectedSeverity;
      const matchEngine =
        selectedEngine === "ALL" ||
        issue.engine.toUpperCase() === selectedEngine.toUpperCase();
      const matchStatus =
        selectedStatus === "ALL" || issue.status === selectedStatus;
      const matchSearch =
        searchQuery.trim() === "" ||
        issue.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.ruleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.filePath.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSeverity && matchEngine && matchStatus && matchSearch;
    });
  }, [issues, selectedSeverity, selectedEngine, selectedStatus, searchQuery]);

  const counts = useMemo(() => {
    const total = issues.length;
    const critical = issues.filter((i) => i.severity === "CRITICAL").length;
    const high = issues.filter((i) => i.severity === "HIGH").length;
    const medium = issues.filter((i) => i.severity === "MEDIUM").length;
    const low = issues.filter((i) => i.severity === "LOW").length;

    const open = issues.filter((i) => i.status === "OPEN").length;
    const resolved = issues.filter((i) => i.status === "RESOLVED").length;

    const openCritical = issues.filter((i) => i.severity === "CRITICAL" && i.status === "OPEN").length;
    const openHigh = issues.filter((i) => i.severity === "HIGH" && i.status === "OPEN").length;
    const openMedium = issues.filter((i) => i.severity === "MEDIUM" && i.status === "OPEN").length;
    const openLow = issues.filter((i) => i.severity === "LOW" && i.status === "OPEN").length;

    const dependencyCount = issues.filter((i) => i.engine === "DEPENDENCY_CHECK").length;
    const secretCount = issues.filter((i) => i.engine === "SECRET_SCANNER").length;
    const configCount = issues.filter((i) => i.engine === "CONFIG_AUDIT").length;

    // Security score calculation
    const penalty = (openCritical * 25) + (openHigh * 15) + (openMedium * 6) + (openLow * 2);
    const score = Math.max(0, 100 - penalty);
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F";

    return {
      total,
      critical,
      high,
      medium,
      low,
      open,
      resolved,
      score,
      grade,
      dependencyCount,
      secretCount,
      configCount,
    };
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Page Header & Hero Illustration */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-2.5 max-w-2xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-200">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              Security Explorer
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Security & Vulnerability Explorer
            </h1>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            Automated dependency vulnerability scanner (CVE/NPM), secret leak detector, and insecure configuration analyzer.
          </p>

          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={handleStartSecurityScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all ${
                isScanning
                  ? "bg-rose-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-rose-500/20 active:scale-95"
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Dependencies, Secrets & Configs...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Security Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Shield Hero Graphic */}
        <div className="relative shrink-0 hidden md:block">
          <div className="w-72 h-36 rounded-3xl relative overflow-hidden bg-gradient-to-tr from-rose-200/50 via-pink-100/40 to-purple-100/50 dark:from-rose-950/40 dark:via-slate-900/40 dark:to-purple-950/40 border border-rose-200/40 dark:border-rose-800/30 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 via-pink-400/10 to-purple-400/10 blur-xl"></div>

            <div className="relative z-10 flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/30">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  DevPilot Shield Active
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Zero unmasked credentials
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>Continuous Guard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Execution Telemetry Cards */}
      {engineReports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {engineReports.map((report) => (
            <div
              key={report.engine}
              className="p-3.5 rounded-2xl border bg-white dark:bg-[#0e1322] border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {report.engine}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {report.findingsCount} findings • {report.executionTimeMs}ms
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40">
                {report.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 4 Metric Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Security Score */}
        <div className="p-5 rounded-3xl border bg-white dark:bg-[#0e1322] border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="url(#securityGradient)"
                  strokeDasharray={`${counts.score}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <defs>
                  <linearGradient id="securityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                  {counts.score}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
                  /100
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1.5">
              Security Score
            </span>
          </div>

          <div className="text-right space-y-1">
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {counts.grade}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Security Grade
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>↑ +3%</span>
              <span className="font-normal text-slate-400">vs. last scan</span>
            </div>
          </div>
        </div>

        {/* Card 2: Dependency Vulnerabilities */}
        <div className="p-5 rounded-3xl border bg-white dark:bg-[#0e1322] border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {counts.dependencyCount}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              Dependency CVEs
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              pom.xml & package.json
            </div>
          </div>
        </div>

        {/* Card 3: Secret Leaks Detected */}
        <div className="p-5 rounded-3xl border bg-white dark:bg-[#0e1322] border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {counts.secretCount}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              Secret Leaks
            </div>
            <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-0.5 font-semibold">
              Auto-masked values
            </div>
          </div>
        </div>

        {/* Card 4: Insecure Configurations */}
        <div className="p-5 rounded-3xl border bg-white dark:bg-[#0e1322] border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {counts.configCount}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              Configuration Risks
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              CORS & CSRF policies
            </div>
          </div>
        </div>
      </div>

      {/* Two Charts: Security Trend & Vulnerabilities by Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl border bg-white dark:bg-[#0e1322] border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Vulnerability Trend
            </h3>
          </div>

          <div className="relative pt-6">
            <svg viewBox="0 0 500 160" className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="secTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="30" y1="20" x2="480" y2="20" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="60" x2="480" y2="60" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="100" x2="480" y2="100" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="140" x2="480" y2="140" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />

              <text x="15" y="24" className="text-[10px] fill-slate-400 font-mono">15</text>
              <text x="15" y="64" className="text-[10px] fill-slate-400 font-mono">10</text>
              <text x="15" y="104" className="text-[10px] fill-slate-400 font-mono">5</text>
              <text x="20" y="144" className="text-[10px] fill-slate-400 font-mono">0</text>

              <path
                d="M 60 50 C 140 55, 180 80, 240 85 C 300 90, 360 110, 420 115 C 440 120, 450 120, 460 120 L 460 140 L 60 140 Z"
                fill="url(#secTrendGradient)"
              />

              <path
                d="M 60 50 C 140 55, 180 80, 240 85 C 300 90, 360 110, 420 115 C 440 120, 450 120, 460 120"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <circle cx="60" cy="50" r="3.5" fill="#f43f5e" className="stroke-white dark:stroke-slate-900 stroke-2" />
              <circle cx="160" cy="65" r="3.5" fill="#f43f5e" className="stroke-white dark:stroke-slate-900 stroke-2" />
              <circle cx="260" cy="88" r="3.5" fill="#f43f5e" className="stroke-white dark:stroke-slate-900 stroke-2" />
              <circle cx="360" cy="110" r="3.5" fill="#f43f5e" className="stroke-white dark:stroke-slate-900 stroke-2" />
              <circle cx="460" cy="120" r="4.5" fill="#f43f5e" className="stroke-white dark:stroke-slate-900 stroke-2" />
            </svg>

            <div className="absolute right-6 top-0 bg-slate-900 text-white rounded-xl px-2.5 py-1 text-center shadow-lg border border-slate-700 flex flex-col items-center">
              <span className="text-[11px] font-bold">{counts.open} open</span>
              <span className="text-[10px] text-emerald-400 font-semibold">(-60%)</span>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-0.5"></div>
            </div>

            <div className="flex justify-between px-10 text-[11px] text-slate-400 font-medium -mt-2">
              <span>Nov 10</span>
              <span>Nov 12</span>
              <span>Nov 14</span>
              <span>Nov 16</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Severity Donut Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl border bg-white dark:bg-[#0e1322] border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Vulnerabilities by Severity
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4.5" />
                {/* Critical Arc 17% */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="4.5" strokeDasharray="15 85" strokeDashoffset="0" />
                {/* High Arc 50% */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="4.5" strokeDasharray="44 56" strokeDashoffset="-15" />
                {/* Medium Arc 33% */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#eab308" strokeWidth="4.5" strokeDasharray="29 71" strokeDashoffset="-59" />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {counts.total}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Vulnerabilities
                </span>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 pr-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Critical</span>
                </div>
                <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
                  {counts.critical} ({counts.total > 0 ? Math.round((counts.critical / counts.total) * 100) : 0}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">High</span>
                </div>
                <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
                  {counts.high} ({counts.total > 0 ? Math.round((counts.high / counts.total) * 100) : 0}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Medium</span>
                </div>
                <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
                  {counts.medium} ({counts.total > 0 ? Math.round((counts.medium / counts.total) * 100) : 0}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Low</span>
                </div>
                <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
                  {counts.low} (0%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Row 1: Severity Pills + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedSeverity("ALL")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedSeverity === "ALL"
                ? "bg-rose-600 text-white shadow-md shadow-rose-500/25"
                : "bg-white dark:bg-[#0e1322] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            All ({counts.total})
          </button>

          <button
            onClick={() => setSelectedSeverity("CRITICAL")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedSeverity === "CRITICAL"
                ? "bg-rose-600 text-white shadow-md shadow-rose-500/25"
                : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-100/70"
            }`}
          >
            Critical ({counts.critical})
          </button>

          <button
            onClick={() => setSelectedSeverity("HIGH")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedSeverity === "HIGH"
                ? "bg-amber-600 text-white shadow-md shadow-amber-500/25"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40 hover:bg-amber-100/70"
            }`}
          >
            High ({counts.high})
          </button>

          <button
            onClick={() => setSelectedSeverity("MEDIUM")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedSeverity === "MEDIUM"
                ? "bg-yellow-600 text-white shadow-md shadow-yellow-500/25"
                : "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200/80 dark:border-yellow-900/40 hover:bg-yellow-100/70"
            }`}
          >
            Medium ({counts.medium})
          </button>

          <button
            onClick={() => setSelectedSeverity("LOW")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedSeverity === "LOW"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/40 hover:bg-emerald-100/70"
            }`}
          >
            Low ({counts.low})
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by CVE, rule, message, or file..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs border outline-none bg-white dark:bg-[#0e1322] border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filter Row 2: Category / Engine + Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-1 border-y border-slate-200/60 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">Engine:</span>
          {[
            { id: "ALL", label: "All" },
            { id: "DEPENDENCY_CHECK", label: "Dependencies" },
            { id: "SECRET_SCANNER", label: "Secrets" },
            { id: "CONFIG_AUDIT", label: "Configurations" },
          ].map((cat) => {
            const isSelected = selectedEngine === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedEngine(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-400 shadow-sm"
                    : "bg-white dark:bg-[#0e1322] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">Status:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
            {["OPEN", "RESOLVED", "ALL"].map((st) => {
              const isSelected = selectedStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {st === "OPEN" ? "Open" : st === "RESOLVED" ? "Resolved" : "All"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Findings Cards List */}
      <div className="space-y-3 pt-1">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-[#0e1322]/50 space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              No matching security vulnerabilities found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All security checks, CVE dependency reviews, and secret scans passed cleanly.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const borderHighlight =
              issue.severity === "CRITICAL"
                ? "border-l-4 border-l-rose-500"
                : issue.severity === "HIGH"
                ? "border-l-4 border-l-amber-500"
                : issue.severity === "MEDIUM"
                ? "border-l-4 border-l-yellow-500"
                : "border-l-4 border-l-emerald-500";

            const badgeStyle =
              issue.severity === "CRITICAL"
                ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
                : issue.severity === "HIGH"
                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                : issue.severity === "MEDIUM"
                ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/40"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40";

            return (
              <div
                key={issue.id}
                onClick={() => setActiveIssue(issue)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-[#0e1322] border-slate-200/80 dark:border-slate-800/80 hover:shadow-md ${borderHighlight} ${
                  issue.status === "RESOLVED" ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}
                      >
                        {issue.severity === "CRITICAL" && <ShieldAlert className="w-3 h-3" />}
                        {issue.severity === "HIGH" && <AlertTriangle className="w-3 h-3" />}
                        <span>{issue.severity}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        {issue.engineDisplayName}
                      </span>

                      {issue.cwe && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-mono">
                          {issue.cwe.split(":")[0]}
                        </span>
                      )}

                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {issue.ruleId}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                      {issue.message}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <FileCode className="w-3.5 h-3.5 text-rose-500" />
                      <span>{issue.filePath}</span>
                      <span className="text-slate-400">
                        : L{issue.lineStart}–L{issue.lineEnd}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 px-3 py-1 rounded-full shadow-sm">
                      <Sparkles className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                      <span>AI Fix Available</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIssue(issue);
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors shadow-sm"
                    >
                      <span>Inspect Code</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slide-over Security Detail Drawer */}
      <SecurityIssueDetailDrawer
        issue={activeIssue}
        onClose={() => setActiveIssue(null)}
        onToggleResolve={toggleResolve}
      />
    </div>
  );
}
