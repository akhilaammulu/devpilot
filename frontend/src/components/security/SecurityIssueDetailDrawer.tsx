"use client";

import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  Copy,
  Check,
  FileCode,
  Sparkles,
  ExternalLink,
  Shield,
  Key,
  Package,
  Sliders,
} from "lucide-react";
import { SecurityIssue } from "@/data/mockSecurityIssues";
import { AiRemediationModal } from "@/components/ai/AiRemediationModal";

interface SecurityIssueDetailDrawerProps {
  issue: (SecurityIssue & {
    aiWhyItMatters?: string;
    aiSuggestedUnitTest?: string;
    aiModelUsed?: string;
  }) | null;
  onClose: () => void;
  onToggleResolve: (id: string) => void;
}

export function SecurityIssueDetailDrawer({
  issue,
  onClose,
  onToggleResolve,
}: SecurityIssueDetailDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  if (!issue) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(issue.proposedFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isResolved = issue.status === "RESOLVED";

  const severityBadge =
    issue.severity === "CRITICAL"
      ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60"
      : issue.severity === "HIGH"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60"
      : issue.severity === "MEDIUM"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/60"
      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60";

  const engineIcon =
    issue.engine === "SECRET_SCANNER" ? (
      <Key className="w-3.5 h-3.5 text-rose-500" />
    ) : issue.engine === "DEPENDENCY_CHECK" ? (
      <Package className="w-3.5 h-3.5 text-purple-500" />
    ) : (
      <Sliders className="w-3.5 h-3.5 text-amber-500" />
    );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#11151e] h-full shadow-2xl border-l border-slate-200 dark:border-[#1e2433] flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-[#1e2433] flex items-start justify-between gap-4 sticky top-0 bg-white/95 dark:bg-[#11151e]/95 backdrop-blur z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${severityBadge}`}
              >
                {issue.severity === "CRITICAL" ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>{issue.severity} VULNERABILITY</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                {engineIcon}
                <span>{issue.engineDisplayName}</span>
              </span>

              {issue.cwe && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  {issue.cwe}
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
              {issue.ruleId}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Finding Message */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Vulnerability Overview
            </h4>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-[#1e2433]">
              {issue.message}
            </p>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Affected Location
            </h4>
            <div className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200/80 dark:border-[#1e2433] text-xs font-mono bg-white dark:bg-[#161b26] text-slate-700 dark:text-slate-300">
              <FileCode className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {issue.filePath}
              </span>
              <span className="text-slate-400">
                : L{issue.lineStart}–L{issue.lineEnd}
              </span>
            </div>
          </div>

          {/* Code / Configuration Snippet */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Code Context / Masked Secret
            </h4>
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#080c14]">
              <div className="px-4 py-2 bg-[#0e1322] border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>{issue.filePath}</span>
                <span className="text-[10px] text-rose-400 font-bold">Vulnerable Line</span>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {issue.snippet}
              </pre>
            </div>
          </div>

          {/* AI Security Analysis */}
          <div className="space-y-2 p-4 rounded-3xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>AI Security Impact Assessment</span>
              </div>

              <button
                onClick={() => setShowAiModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deep AI Analysis & Test</span>
              </button>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {issue.aiWhyItMatters || issue.aiExplanation}
            </p>
          </div>

          {/* AI Proposed Remediation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Recommended Remediation Patch</span>
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Fix"}</span>
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-emerald-900/50 bg-[#08120e]">
              <div className="px-4 py-2 bg-[#0d1a15] border-b border-emerald-950 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                <span>Remediation Solution</span>
                <span className="text-[10px] text-emerald-500 font-bold">Tested Fix</span>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {issue.proposedFix}
              </pre>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 border-t border-slate-200/80 dark:border-[#1e2433] bg-slate-50 dark:bg-[#11151e] flex items-center justify-between gap-4 sticky bottom-0">
          <button
            onClick={() => onToggleResolve(issue.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
              isResolved
                ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 active:scale-95"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isResolved ? "Reopen Vulnerability" : "Mark as Remediated"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <AiRemediationModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        issue={{
          id: issue.id,
          ruleId: issue.ruleId,
          category: "SECURITY",
          severity: issue.severity,
          filePath: issue.filePath,
          lineStart: issue.lineStart,
          lineEnd: issue.lineEnd,
          message: issue.message,
          codeSnippet: issue.snippet,
          aiWhyItMatters: issue.aiWhyItMatters,
          aiExplanation: issue.aiExplanation,
          proposedFix: issue.proposedFix,
          aiSuggestedUnitTest: issue.aiSuggestedUnitTest,
          modelUsed: issue.aiModelUsed,
        }}
      />
    </div>
  );
}
