"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, Shield, Sparkles, Code2, Eye, AlertCircle } from "lucide-react";
import { RepoItem } from "./RepositorySelector";

export interface ScanResult {
  id: string;
  commitSha: string;
  branchName: string;
  status: string;
  qualityScore: number;
  securityScore: number;
  accessibilityScore: number;
  startedAt: string;
  completedAt?: string;
  issues?: Array<{
    id: string;
    category: string;
    severity: string;
    ruleId: string;
    filePath: string;
    lineStart?: number;
    message: string;
    aiExplanation?: string;
    aiFixSuggestion?: string;
  }>;
}

interface ScanDashboardProps {
  repository: RepoItem;
  scans: ScanResult[];
  onStartScan: () => void;
  isScanning: boolean;
}

export function ScanDashboard({ repository, scans, onStartScan, isScanning }: ScanDashboardProps) {
  const latestScan = scans[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Scan Trigger */}
      <div className="bg-[#111827]/70 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active Repository
          </span>
          <h2 className="text-xl font-bold text-white mt-1">{repository.fullName}</h2>
          <p className="text-xs text-gray-400 mt-1">
            Default Branch: <code className="text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded">{repository.defaultBranch}</code>
          </p>
        </div>

        <button
          onClick={onStartScan}
          disabled={isScanning}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
            isScanning
              ? "bg-blue-600/50 text-blue-200 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95"
          }`}
        >
          <Play className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
          {isScanning ? "Running Scan..." : "Start Placeholder Scan"}
        </button>
      </div>

      {/* Metrics Cards */}
      {latestScan ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111827]/70 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Code Quality Score</span>
              <Code2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{latestScan.qualityScore}%</div>
            <p className="text-xs text-gray-400 mt-1">Static analysis baseline</p>
          </div>

          <div className="bg-[#111827]/70 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Security Score</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">{latestScan.securityScore}%</div>
            <p className="text-xs text-gray-400 mt-1">Vulnerabilities & secret checks</p>
          </div>

          <div className="bg-[#111827]/70 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Accessibility Score</span>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{latestScan.accessibilityScore}%</div>
            <p className="text-xs text-gray-400 mt-1">axe-core & WCAG audits</p>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-800 rounded-2xl p-10 text-center text-gray-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-500" />
          <p className="text-sm font-medium">No scans executed yet for this repository.</p>
          <p className="text-xs text-gray-500 mt-1">
            Click &quot;Start Placeholder Scan&quot; above to initialize Phase 1 scan validation.
          </p>
        </div>
      )}

      {/* Findings Section */}
      {latestScan && latestScan.issues && latestScan.issues.length > 0 && (
        <div className="bg-[#111827]/70 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Scan Findings & AI Recommendations
          </h3>

          <div className="space-y-4">
            {latestScan.issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {issue.category}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      {issue.severity}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{issue.ruleId}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{issue.filePath}</span>
                </div>

                <p className="text-sm text-gray-200">{issue.message}</p>

                {issue.aiExplanation && (
                  <div className="bg-blue-950/20 border border-blue-800/40 rounded-lg p-3 text-xs text-blue-200">
                    <strong className="block text-blue-400 font-semibold mb-1">AI Explanation:</strong>
                    {issue.aiExplanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
