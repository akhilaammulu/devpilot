"use client";

import React from "react";
import {
  Play,
  MoreVertical,
  Clock,
  Sparkles,
  Shield,
  Eye,
  FlaskConical,
  Search,
  CheckCircle2,
  FileCode2,
} from "lucide-react";
import { RepoItem } from "./ConnectedRepositories";

export interface ScanFinding {
  id: string;
  category: "CODE_QUALITY" | "SECURITY" | "ACCESSIBILITY" | "TESTS";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  ruleId: string;
  filePath: string;
  message: string;
  aiExplanation?: string;
  aiFixSuggestion?: string;
}

export interface ScanRecord {
  id: string;
  commitSha: string;
  branchName: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  startedAt: string;
  completedAt?: string;
  qualityScore: number;
  securityScore: number;
  accessibilityScore: number;
  testsScore: number;
  findings: ScanFinding[];
}

interface ActiveRepoScanSectionProps {
  repository: RepoItem;
  scans: ScanRecord[];
  isScanning: boolean;
  onStartScan: () => void;
}

export function ActiveRepoScanSection({
  repository,
  scans,
  isScanning,
  onStartScan,
}: ActiveRepoScanSectionProps) {
  const latestScan = scans[0] || null;

  return (
    <div className="rounded-3xl border transition-all overflow-hidden bg-white dark:bg-[#11151e] border-slate-200 dark:border-[#1e2433] shadow-sm">
      {/* Top Banner Header */}
      <div className="p-5 border-b border-slate-100 dark:border-[#1e2433] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Repo Details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 font-mono text-sm font-bold">
            &lt;/&gt;
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {repository.fullName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active Repository
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Default Branch:{" "}
              <code className="text-slate-600 dark:text-slate-300 font-mono font-semibold">
                {repository.defaultBranch}
              </code>
            </p>
          </div>
        </div>

        {/* Right: Scan CTA Button & 3-dots */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStartScan}
            disabled={isScanning}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${
              isScanning
                ? "bg-purple-600/50 cursor-not-allowed opacity-80"
                : "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 shadow-pink-500/25 hover:opacity-95"
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning Repository..." : "Start Placeholder Scan"}</span>
          </button>

          <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800/80">
        {/* Left Column (7 cols): Recent Scans */}
        <div className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-purple-500" />
            <h4>Recent Scans</h4>
          </div>

          {!latestScan ? (
            /* Empty State matching image exactly */
            <div className="border border-dashed border-slate-200 dark:border-[#1e2433] rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                  No scans executed yet
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Run your first scan to analyze code quality, security, accessibility, and test coverage.
                </p>
              </div>

              <button
                onClick={onStartScan}
                disabled={isScanning}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all text-purple-600 dark:text-purple-300 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Placeholder Scan</span>
              </button>
            </div>
          ) : (
            /* Scanned State with Findings */
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Scan Completed Successfully
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Commit <code className="font-mono text-purple-400">{latestScan.commitSha}</code> on branch{" "}
                      <code className="font-mono text-purple-400">{latestScan.branchName}</code>
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                  COMPLETED
                </span>
              </div>

              {/* Findings List */}
              <div className="space-y-2">
                {latestScan.findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-4 rounded-2xl border transition-all space-y-2 bg-slate-50/70 dark:bg-[#161b26] border-slate-200 dark:border-[#1e2433]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                          {finding.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {finding.severity}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {finding.ruleId}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <FileCode2 className="w-3 h-3 text-slate-400" />
                        {finding.filePath}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200">
                      {finding.message}
                    </p>

                    {finding.aiExplanation && (
                      <div className="p-3 rounded-xl text-xs bg-purple-500/5 dark:bg-purple-950/30 border border-purple-500/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-[11px]">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Remediation Suggestion:</span>
                        </div>
                        <p className="text-slate-600 dark:text-purple-200 text-[11px] leading-relaxed">
                          {finding.aiExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): What you'll get from a scan */}
        <div className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h4>What you&apos;ll get from a scan</h4>
          </div>

          <div className="space-y-3.5">
            {/* Item 1: Code Quality */}
            <div className="flex items-start gap-3 p-3 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                &lt;/&gt;
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Code quality analysis
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Detect code smells, complexity and best practices
                </p>
              </div>
            </div>

            {/* Item 2: Security Scan */}
            <div className="flex items-start gap-3 p-3 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Security scan
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Find vulnerabilities and risky patterns
                </p>
              </div>
            </div>

            {/* Item 3: Accessibility check */}
            <div className="flex items-start gap-3 p-3 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Accessibility check
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Validate UI against WCAG guidelines
                </p>
              </div>
            </div>

            {/* Item 4: Test analysis */}
            <div className="flex items-start gap-3 p-3 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Test analysis
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Check test coverage and suggest improvements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
