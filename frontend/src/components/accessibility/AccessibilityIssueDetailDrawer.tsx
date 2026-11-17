"use client";

import React, { useState } from "react";
import {
  X,
  Eye,
  AlertTriangle,
  ShieldAlert,
  FileCode,
  Sparkles,
  Copy,
  Check,
  CheckCircle,
  ExternalLink,
  Code2,
  MousePointerClick,
} from "lucide-react";
import { AccessibilityIssue } from "@/data/mockAccessibilityIssues";

interface AccessibilityIssueDetailDrawerProps {
  issue: AccessibilityIssue | null;
  onClose: () => void;
  onToggleResolve: (id: string) => void;
}

export function AccessibilityIssueDetailDrawer({
  issue,
  onClose,
  onToggleResolve,
}: AccessibilityIssueDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!issue) return null;

  const handleCopyFix = () => {
    navigator.clipboard.writeText(issue.proposedFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityBadge =
    issue.severity === "CRITICAL"
      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
      : issue.severity === "HIGH"
      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
      : issue.severity === "MEDIUM"
      ? "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/60"
      : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#0e1322] h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Top Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-transparent dark:from-emerald-950/20">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${severityBadge}`}
              >
                {issue.severity === "CRITICAL" && <ShieldAlert className="w-3.5 h-3.5" />}
                {issue.severity === "HIGH" && <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{issue.severity}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 font-mono">
                {issue.wcagCriterion}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {issue.principle}
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
              {issue.ruleId}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {issue.message}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close accessibility drawer"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Affected Location & Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span>Affected Component / Route</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                Route: {issue.pageUrl || "/"}
              </span>
            </div>

            <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all">
              {issue.filePath} <span className="text-slate-400">: L{issue.lineStart}–L{issue.lineEnd}</span>
            </div>

            {issue.selector && (
              <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <MousePointerClick className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span className="truncate">Selector: {issue.selector}</span>
              </div>
            )}
          </div>

          {/* Affected DOM Element HTML Evidence */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>Affected DOM Element (axe-core Evidence)</span>
            </div>
            <pre className="p-4 rounded-2xl bg-[#0d1117] text-emerald-300 text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">
              <code>{issue.snippet}</code>
            </pre>
          </div>

          {/* Assistive Tech Impact Explanation */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>User & Screen Reader Impact</span>
            </div>
            <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
              {issue.aiExplanation}
            </p>
          </div>

          {/* Suggested Code Fix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Actionable Remediation Patch</span>
              </div>
              <button
                onClick={handleCopyFix}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
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
            <pre className="p-4 rounded-2xl bg-[#0d1117] text-indigo-300 text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">
              <code>{issue.proposedFix}</code>
            </pre>
          </div>

          {/* External Documentation Reference */}
          {issue.helpUrl && (
            <div className="pt-2">
              <a
                href={issue.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>View Deque University WCAG Guidelines</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => onToggleResolve(issue.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              issue.status === "RESOLVED"
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {issue.status === "RESOLVED" ? "Reopen Violation" : "Mark as Resolved"}
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
}
