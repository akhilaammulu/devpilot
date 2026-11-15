"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  FileCode,
  ExternalLink,
  ShieldAlert,
  Code2,
  ArrowRight,
} from "lucide-react";
import { CodeIssue } from "@/data/mockIssues";

interface IssueDetailDrawerProps {
  issue: CodeIssue | null;
  onClose: () => void;
  onToggleResolve: (id: string) => void;
}

export function IssueDetailDrawer({
  issue,
  onClose,
  onToggleResolve,
}: IssueDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!issue) return null;

  const handleCopyFix = () => {
    navigator.clipboard.writeText(issue.proposedFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity: string) => {
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

  const getToolBadge = (tool: string) => {
    switch (tool) {
      case "SpotBugs":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "PMD":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "Checkstyle":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "ESLint":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose}></div>

      {/* Drawer Container */}
      <div className="w-full max-w-2xl bg-white dark:bg-[#0e1322] border-l border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-[#0e1322]/90 backdrop-blur-md z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadge(
                  issue.severity
                )}`}
              >
                {issue.severity}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getToolBadge(
                  issue.tool
                )}`}
              >
                {issue.tool} ({issue.language})
              </span>
              {issue.status === "RESOLVED" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Resolved
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {issue.ruleId}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <FileCode className="w-3.5 h-3.5 text-purple-500" />
              <span>{issue.filePath}</span>
              <span className="text-slate-400">
                (Lines {issue.lineStart}–{issue.lineEnd})
              </span>
            </p>
          </div>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Finding Message */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rule Violation Message
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {issue.message}
            </p>
          </div>

          {/* Affected Code Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-500" />
                Affected Source Code
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Line {issue.lineStart}
              </span>
            </div>

            <div className="rounded-2xl p-4 bg-slate-950 border border-slate-800 overflow-x-auto text-xs font-mono text-slate-200 shadow-inner leading-relaxed">
              <pre className="text-[12px]">{issue.codeSnippet}</pre>
            </div>
          </div>

          {/* AI Explanation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>AI Static Analysis Insight</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {issue.aiExplanation}
            </p>
          </div>

          {/* Proposed Fix & Diff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Recommended Remediation
              </span>

              <button
                onClick={handleCopyFix}
                className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Fix</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl p-4 bg-slate-950 border border-emerald-500/30 overflow-x-auto text-xs font-mono text-emerald-300 shadow-inner">
              <pre className="text-[12px] leading-relaxed">{issue.proposedFix}</pre>
            </div>
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-[#0e1322]/90 backdrop-blur-md sticky bottom-0 flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleResolve(issue.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              issue.status === "RESOLVED"
                ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {issue.status === "RESOLVED"
                ? "Reopen Finding"
                : "Mark as Resolved"}
            </span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold border text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
