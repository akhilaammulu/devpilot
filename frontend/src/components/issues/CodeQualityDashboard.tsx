"use client";

import React, { useState, useMemo } from "react";
import {
  Code2,
  Shield,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  FileCode,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { MOCK_ISSUES, CodeIssue, ToolType, SeverityType } from "@/data/mockIssues";
import { IssueDetailDrawer } from "./IssueDetailDrawer";

export function CodeQualityDashboard() {
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

  // Filter logic
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

  // Counts
  const counts = useMemo(() => {
    const total = issues.length;
    const critical = issues.filter((i) => i.severity === "CRITICAL").length;
    const high = issues.filter((i) => i.severity === "HIGH").length;
    const medium = issues.filter((i) => i.severity === "MEDIUM").length;
    const low = issues.filter((i) => i.severity === "LOW").length;
    const resolved = issues.filter((i) => i.status === "RESOLVED").length;
    return { total, critical, high, medium, low, resolved };
  }, [issues]);

  const getSeverityIcon = (severity: SeverityType) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />;
      case "HIGH":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case "MEDIUM":
        return <Info className="w-3.5 h-3.5 text-yellow-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: SeverityType) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "HIGH":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Quality Score & Metrics Breakdown */}
      <div className="rounded-3xl p-6 sm:p-8 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Phase 2 Static Analysis
              </span>
              <span className="text-xs text-slate-400">&bull; Live Multi-Engine Scanners</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Code Quality Explorer
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Consolidated static analysis findings from Checkstyle, PMD, SpotBugs (Java) and ESLint (TypeScript), classified by severity.
            </p>
          </div>

          {/* Metrics summary widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quality Grade
              </p>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
                A-
              </p>
              <p className="text-[10px] text-slate-400">87/100 Index</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Maintainability
              </p>
              <p className="text-2xl font-black text-emerald-500 mt-0.5">
                92%
              </p>
              <p className="text-[10px] text-slate-400">High rating</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Complexity
              </p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-0.5">
                3.2
              </p>
              <p className="text-[10px] text-slate-400">Cyclomatic avg</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Open Issues
              </p>
              <p className="text-2xl font-black text-amber-500 mt-0.5">
                {issues.filter((i) => i.status === "OPEN").length}
              </p>
              <p className="text-[10px] text-slate-400">{counts.resolved} resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-3xl p-5 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Severity Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: `All (${counts.total})` },
              { id: "CRITICAL", label: `Critical (${counts.critical})`, color: "text-rose-500" },
              { id: "HIGH", label: `High (${counts.high})`, color: "text-amber-500" },
              { id: "MEDIUM", label: `Medium (${counts.medium})`, color: "text-yellow-500" },
              { id: "LOW", label: `Low (${counts.low})`, color: "text-blue-500" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedSeverity(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedSeverity === btn.id
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-slate-100 dark:bg-[#121829] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by rule, message, or file..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Secondary Filter: Analyzers / Tools & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
              <Filter className="w-3 h-3 text-purple-500" />
              Engine:
            </span>
            {["ALL", "SpotBugs", "PMD", "Checkstyle", "ESLint"].map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedTool === tool
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tool}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px]">Status:</span>
            {["OPEN", "RESOLVED", "ALL"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedStatus === st
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issues List Table */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 bg-white/40 dark:bg-[#0e1322]/40">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No findings matching the current filters
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query, tool filter, or severity selection above.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => setActiveIssue(issue)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${
                issue.status === "RESOLVED"
                  ? "bg-slate-50/50 dark:bg-[#0c101c]/50 border-slate-200 dark:border-slate-850 opacity-60"
                  : "bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 hover:border-purple-500/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Badges & Rule */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getSeverityBadge(
                        issue.severity
                      )}`}
                    >
                      {getSeverityIcon(issue.severity)}
                      <span>{issue.severity}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                      {issue.tool}
                    </span>

                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {issue.ruleId}
                    </span>

                    {issue.status === "RESOLVED" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Resolved
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                    {issue.message}
                  </p>

                  {/* File & Line Info */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <FileCode className="w-3.5 h-3.5 text-purple-500" />
                    <span>{issue.filePath}</span>
                    <span className="text-slate-400">
                      :L{issue.lineStart}–L{issue.lineEnd}
                    </span>
                  </div>
                </div>

                {/* Right: AI badge & View Code Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-xl">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Fix Available</span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors flex items-center gap-1">
                    <span>Inspect Code</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
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
