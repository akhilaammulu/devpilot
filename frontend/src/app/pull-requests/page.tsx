"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Code2,
  Sparkles,
  GitBranch,
} from "lucide-react";

interface PullRequestItem {
  id: string;
  number: number;
  title: string;
  repo: string;
  author: string;
  sourceBranch: string;
  targetBranch: string;
  updatedAt: string;
  status: "PASSED" | "WARNINGS" | "FAILED";
  qualityScore: number;
  securityScore: number;
  commentsCount: number;
}

const mockPRs: PullRequestItem[] = [
  {
    id: "pr-1",
    number: 1,
    title: "feat: initialize DevPilot project architecture and phased build plan",
    repo: "akhilaammulu/devpilot",
    author: "akhilaammulu",
    sourceBranch: "feature/initial-scaffold",
    targetBranch: "main",
    updatedAt: "1 hour ago",
    status: "PASSED",
    qualityScore: 96,
    securityScore: 99,
    commentsCount: 2,
  },
  {
    id: "pr-2",
    number: 2,
    title: "feat(phase-1): foundation setup with Spring Boot GraphQL, dark/light Next.js UI, login & profile",
    repo: "akhilaammulu/devpilot",
    author: "akhilaammulu",
    sourceBranch: "feature/phase-1-foundation",
    targetBranch: "main",
    updatedAt: "Just now",
    status: "PASSED",
    qualityScore: 94,
    securityScore: 98,
    commentsCount: 4,
  },
  {
    id: "pr-3",
    number: 14,
    title: "refactor(auth): migrate JWT token exchange to Spring Security filter chain",
    repo: "akhilaammulu/devpilot",
    author: "akhilaammulu",
    sourceBranch: "feature/jwt-refactor",
    targetBranch: "main",
    updatedAt: "2 days ago",
    status: "WARNINGS",
    qualityScore: 82,
    securityScore: 88,
    commentsCount: 6,
  },
];

export default function PullRequestsPage() {
  const [prs, setPrs] = useState<PullRequestItem[]>(mockPRs);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredPrs = prs.filter(
    (p) => selectedStatus === "ALL" || p.status === selectedStatus
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-[#f4f6fb] dark:bg-[#080b14] text-slate-900 dark:text-slate-100">
      <Header currentPhase="Phase 2 - Prototype (Static Analysis)" />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-200">
                  Dashboard
                </Link>
                <span>&gt;</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Pull Requests
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <GitPullRequest className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span>Automated PR Code Reviews</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                  {prs.length} Open
                </span>
              </h1>
            </div>

            <a
              href="https://github.com/akhilaammulu/devpilot/pulls"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold border transition-all text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedStatus("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedStatus === "ALL"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#0e1322] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              All ({prs.length})
            </button>
            <button
              onClick={() => setSelectedStatus("PASSED")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedStatus === "PASSED"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white dark:bg-[#0e1322] text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
              }`}
            >
              Passed (2)
            </button>
            <button
              onClick={() => setSelectedStatus("WARNINGS")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedStatus === "WARNINGS"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white dark:bg-[#0e1322] text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
              }`}
            >
              Warnings (1)
            </button>
          </div>

          {/* PR List */}
          <div className="space-y-3">
            {filteredPrs.map((pr) => (
              <div
                key={pr.id}
                className="p-5 rounded-3xl border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-purple-500/40 hover:shadow-md space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                        #{pr.number}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {pr.title}
                      </h3>
                      {pr.status === "PASSED" ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Checks Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Warnings Found
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>{pr.repo}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-purple-400" />
                        {pr.sourceBranch} &rarr; {pr.targetBranch}
                      </span>
                      <span>&bull;</span>
                      <span>Updated {pr.updatedAt} by @{pr.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Quality</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {pr.qualityScore}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Security</span>
                      <span className="font-bold text-emerald-500">
                        {pr.securityScore}%
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-1 text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      <MessageSquare className="w-3 h-3" />
                      <span>{pr.commentsCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DevPilot automated review bot has completed scan on commit HEAD</span>
                  </div>

                  <a
                    href={`https://github.com/${pr.repo}/pull/${pr.number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white flex items-center gap-1"
                  >
                    <span>View GitHub PR</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
