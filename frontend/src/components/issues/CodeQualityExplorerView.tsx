"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Code2,
  Layers,
  Share2,
  Bug,
  TrendingDown,
  BarChart2,
  ListFilter,
  Search,
  Sparkles,
  ArrowRight,
  FileCode,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { MOCK_ISSUES, CodeIssue, SeverityType, ToolType } from "@/data/mockIssues";
import { IssueDetailDrawer } from "./IssueDetailDrawer";

export function CodeQualityExplorerView() {
  const [issues, setIssues] = useState<CodeIssue[]>(MOCK_ISSUES);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedTool, setSelectedTool] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("OPEN");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeIssue, setActiveIssue] = useState<CodeIssue | null>(null);

  const toggleResolve = (id: string) => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === id
          ? {
              ...iss,
              status: iss.status === "RESOLVED" ? "OPEN" : "RESOLVED",
            }
          : iss
      )
    );
    if (activeIssue && activeIssue.id === id) {
      setActiveIssue((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "RESOLVED" ? "OPEN" : "RESOLVED",
            }
          : null
      );
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSeverity =
        selectedSeverity === "ALL" || issue.severity === selectedSeverity;
      const matchTool = selectedTool === "ALL" || issue.tool === selectedTool;
      const matchStatus =
        selectedStatus === "ALL" || issue.status === selectedStatus;
      const matchSearch =
        searchQuery.trim() === "" ||
        issue.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.ruleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.filePath.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSeverity && matchTool && matchStatus && matchSearch;
    });
  }, [issues, selectedSeverity, selectedTool, selectedStatus, searchQuery]);

  const counts = useMemo(() => {
    const total = issues.length;
    const critical = issues.filter((i) => i.severity === "CRITICAL").length;
    const high = issues.filter((i) => i.severity === "HIGH").length;
    const medium = issues.filter((i) => i.severity === "MEDIUM").length;
    const low = issues.filter((i) => i.severity === "LOW").length;
    const open = issues.filter((i) => i.status === "OPEN").length;
    const resolved = issues.filter((i) => i.status === "RESOLVED").length;
    return { total, critical, high, medium, low, open, resolved };
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Page Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-200">
              Dashboard
            </Link>
            <span>&gt;</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              Code Quality Explorer
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center font-mono font-bold text-sm">
              &lt;/&gt;
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Code Quality Explorer
            </h1>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Consolidated static analysis findings from Checkstyle, PMD, SpotBugs (Java) and ESLint (TypeScript), classified by severity.
          </p>
        </div>

        {/* Right 3D Laptop Graphic Mockup matching Image */}
        <div className="hidden lg:flex items-center justify-end">
          <div className="relative w-64 h-32 flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute inset-0 m-auto w-48 h-28 bg-purple-500/15 dark:bg-purple-600/20 rounded-full blur-2xl"></div>

            {/* Laptop Base */}
            <div className="relative z-10 w-44 bg-gradient-to-b from-[#2a1d4a] to-[#170e2e] rounded-xl p-2 shadow-xl border border-purple-400/30">
              <div className="w-full aspect-[16/10] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 rounded-lg flex items-center justify-center border border-purple-500/30">
                <span className="font-mono text-xl font-bold text-purple-300">&lt;/&gt;</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-b mt-1 flex justify-center items-center">
                <div className="w-8 h-0.5 bg-slate-600 rounded-full"></div>
              </div>
            </div>

            {/* Floating Checkmark Pill */}
            <div className="absolute top-2 right-4 z-20 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white dark:border-[#0e1322]">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            {/* Floating Mini Code Snippet Cards */}
            <div className="absolute -left-2 top-4 z-20 w-16 h-10 bg-indigo-900/90 rounded-lg p-1.5 border border-indigo-400/30 shadow-lg space-y-1">
              <div className="w-8 h-1 bg-indigo-400 rounded-full"></div>
              <div className="w-12 h-1 bg-indigo-300/60 rounded-full"></div>
              <div className="w-6 h-1 bg-pink-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Quality Score & Grade */}
        <div className="rounded-3xl p-5 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Donut Gauge */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-pink-500"
                  strokeDasharray="87, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">87</span>
                <span className="text-[8px] text-slate-400 -mt-1">/100</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Quality Score</p>
            </div>
          </div>

          <div className="border-l border-slate-100 dark:border-slate-800 pl-4 space-y-1">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 leading-none">
              A-
            </span>
            <p className="text-[10px] text-slate-400">Code Quality Grade</p>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              <span>↑ +5%</span>
              <span className="text-slate-400 font-normal">vs. last scan</span>
            </span>
          </div>
        </div>

        {/* Card 2: Maintainability */}
        <div className="rounded-3xl p-5 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">92%</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Maintainability</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              High rating
            </p>
          </div>
        </div>

        {/* Card 3: Complexity */}
        <div className="rounded-3xl p-5 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">3.2</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Complexity</div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Cyclomatic avg</p>
          </div>
        </div>

        {/* Card 4: Open Issues */}
        <div className="rounded-3xl p-5 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Bug className="w-4 h-4" />
          </div>

          <div>
            <div className="text-2xl font-black text-amber-500">{counts.open}</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Open Issues</div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {counts.resolved} resolved
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Two Charts (Issue Trend & Issues by Severity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Chart (7 cols): Issue Trend */}
        <div className="lg:col-span-7 rounded-3xl p-6 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Issue Trend</h3>
          </div>

          {/* SVG Line Chart */}
          <div className="relative pt-4">
            {/* Tooltip Badge on Sep 8 */}
            <div className="absolute top-1 right-8 z-10 bg-[#160f29] text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-purple-500/40 shadow-lg flex items-center gap-1">
              <span>8 issues</span>
              <span className="text-emerald-400">(-27%)</span>
            </div>

            <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="40" y1="50" x2="480" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="#e2e8f0" className="dark:stroke-slate-800" />

              {/* Y Axis Labels */}
              <text x="25" y="24" className="text-[9px] fill-slate-400">30</text>
              <text x="25" y="54" className="text-[9px] fill-slate-400">20</text>
              <text x="25" y="84" className="text-[9px] fill-slate-400">10</text>
              <text x="30" y="114" className="text-[9px] fill-slate-400">0</text>

              {/* Area Fill */}
              <polygon
                points="60,35 150,45 240,40 330,65 420,75 420,110 60,110"
                fill="url(#purpleAreaGrad)"
              />

              {/* Smooth Trend Line */}
              <polyline
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                points="60,35 150,45 240,40 330,65 420,75"
              />

              {/* Data points */}
              <circle cx="60" cy="35" r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="150" cy="45" r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="240" cy="40" r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="330" cy="65" r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="420" cy="75" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between pl-10 pr-6 text-[10px] text-slate-400 pt-1">
              <span>Aug 28</span>
              <span>Aug 30</span>
              <span>Sep 2</span>
              <span>Sep 5</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Sep 8</span>
            </div>
          </div>
        </div>

        {/* Right Chart (5 cols): Issues by Severity */}
        <div className="lg:col-span-5 rounded-3xl p-6 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Issues by Severity</h3>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 42 42">
                {/* Background Ring */}
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="5" className="dark:stroke-slate-800" />
                {/* Critical segment (12%) */}
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f43f5e" strokeWidth="5" strokeDasharray="12 88" strokeDashoffset="0" />
                {/* High segment (25%) */}
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f97316" strokeWidth="5" strokeDasharray="25 75" strokeDashoffset="-12" />
                {/* Medium segment (38%) */}
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#eab308" strokeWidth="5" strokeDasharray="38 62" strokeDashoffset="-37" />
                {/* Low segment (25%) */}
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray="25 75" strokeDashoffset="-75" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">8</span>
                <span className="text-[9px] text-slate-400 font-medium">Total Issues</span>
              </div>
            </div>

            {/* Severity Legend */}
            <div className="space-y-2 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Critical</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">1 <span className="text-slate-400 font-normal">(12%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>High</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">2 <span className="text-slate-400 font-normal">(25%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span>Medium</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">3 <span className="text-slate-400 font-normal">(38%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Low</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">2 <span className="text-slate-400 font-normal">(25%)</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Filter Toolbar matching Image */}
      <div className="space-y-3">
        {/* Top Filter Bar: Severity Buttons + Search Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSeverity("ALL")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedSeverity === "ALL"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "bg-slate-100 dark:bg-[#121829] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              All (8)
            </button>

            <button
              onClick={() => setSelectedSeverity("CRITICAL")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedSeverity === "CRITICAL"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
              }`}
            >
              Critical (1)
            </button>

            <button
              onClick={() => setSelectedSeverity("HIGH")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedSeverity === "HIGH"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40"
              }`}
            >
              High (2)
            </button>

            <button
              onClick={() => setSelectedSeverity("MEDIUM")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedSeverity === "MEDIUM"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
              }`}
            >
              Medium (3)
            </button>

            <button
              onClick={() => setSelectedSeverity("LOW")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedSeverity === "LOW"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
              }`}
            >
              Low (2)
            </button>
          </div>

          {/* Search Box on Right */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by rule, message, or file..."
              className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs bg-white dark:bg-[#121829] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500 shadow-sm"
            />
          </div>
        </div>

        {/* Bottom Engine & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px]">Engine:</span>
            {["All", "SpotBugs", "PMD", "Checkstyle", "ESLint"].map((tool) => {
              const val = tool === "All" ? "ALL" : tool;
              const isSelected = selectedTool === val;
              return (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    isSelected
                      ? "bg-purple-600/10 text-purple-600 dark:text-purple-300 border border-purple-500/40 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tool}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Status:</span>
            <button
              onClick={() => setSelectedStatus("OPEN")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedStatus === "OPEN"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setSelectedStatus("RESOLVED")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedStatus === "RESOLVED"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setSelectedStatus("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedStatus === "ALL"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Findings Cards List matching Image */}
      <div className="space-y-3">
        {filteredIssues.map((issue) => {
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
              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
              : issue.severity === "MEDIUM"
              ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/40"
              : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40";

          return (
            <div
              key={issue.id}
              onClick={() => setActiveIssue(issue)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 hover:shadow-md ${borderHighlight} ${
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
                      {issue.tool}
                    </span>

                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {issue.ruleId}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                    {issue.message}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <FileCode className="w-3.5 h-3.5 text-purple-500" />
                    <span>{issue.filePath}</span>
                    <span className="text-slate-400">
                      : L{issue.lineStart}–L{issue.lineEnd}
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Fix Available</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIssue(issue);
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
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
        })}
      </div>

      {/* Slide-over Code Drawer */}
      <IssueDetailDrawer
        issue={activeIssue}
        onClose={() => setActiveIssue(null)}
        onToggleResolve={toggleResolve}
      />
    </div>
  );
}
