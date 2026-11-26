"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_REPOSITORIES,
  GET_PULL_REQUESTS,
  TRIGGER_PULL_REQUEST_ANALYSIS,
  ANALYZE_PULL_REQUEST,
  POST_PR_REVIEW_COMMENT,
} from "@/lib/graphql/queries";
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Code2,
  Eye,
  Sparkles,
  GitBranch,
  Play,
  RefreshCw,
  Copy,
  Check,
  X,
  FileCode,
  History,
  Send,
  Webhook,
} from "lucide-react";

interface PrHistoryItem {
  id: string;
  commitSha: string;
  prScore: number;
  qualityScore: number;
  securityScore: number;
  accessibilityScore: number;
  findingsCount: number;
  reviewStatus: string;
  githubCommentPosted: boolean;
  createdAt: string;
}

interface PullRequestItem {
  id: string;
  githubPrNumber: number;
  title: string;
  author?: string;
  sourceBranch: string;
  targetBranch: string;
  headSha: string;
  state: string;
  prScore?: number;
  qualityScore?: number;
  securityScore?: number;
  accessibilityScore?: number;
  reviewStatus?: string;
  reviewSummary?: string;
  changedFilesCount?: number;
  changedFiles?: string[];
  findingsCount?: number;
  githubCommentPosted?: boolean;
  githubCommentUrl?: string;
  lastAnalyzedAt?: string;
  openedAt: string;
  updatedAt: string;
  history?: PrHistoryItem[];
}

export default function PullRequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [activePr, setActivePr] = useState<PullRequestItem | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Simulate PR form state
  const [prNumberInput, setPrNumberInput] = useState("9");
  const [prTitleInput, setPrTitleInput] = useState("feat(security): enforce CSRF cookie repository & sanitize SQL queries");
  const [sourceBranchInput, setSourceBranchInput] = useState("feature/pr-security-hardening");
  const [targetBranchInput, setTargetBranchInput] = useState("main");
  const [changedFilesInput, setChangedFilesInput] = useState(
    "backend/src/main/java/com/devpilot/config/SecurityConfig.java\nbackend/src/main/java/com/devpilot/pr/PrAnalysisService.java"
  );
  const [postCommentInput, setPostCommentInput] = useState(true);

  const { data: repoData } = useQuery(GET_REPOSITORIES, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  });

  useEffect(() => {
    if (repoData?.repositories?.length > 0 && !selectedRepoId) {
      setSelectedRepoId(repoData.repositories[0].id);
    }
  }, [repoData, selectedRepoId]);

  const { data: prData, loading: prsLoading, refetch: refetchPrs } = useQuery(GET_PULL_REQUESTS, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  });

  const [triggerPrMutation, { loading: isTriggering }] = useMutation(TRIGGER_PULL_REQUEST_ANALYSIS);
  const [analyzePrMutation, { loading: isReanalyzing }] = useMutation(ANALYZE_PULL_REQUEST);
  const [postCommentMutation, { loading: isPostingComment }] = useMutation(POST_PR_REVIEW_COMMENT);

  const prs: PullRequestItem[] = prData?.pullRequests || [];
  const filteredPrs = prs.filter(
    (p) => selectedStatus === "ALL" || (p.reviewStatus || "PENDING") === selectedStatus
  );

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepoId) return;

    const changedFiles = changedFilesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await triggerPrMutation({
        variables: {
          input: {
            repositoryId: selectedRepoId,
            prNumber: parseInt(prNumberInput, 10) || 1,
            title: prTitleInput.trim() || "Pull Request",
            author: "akhilaammulu",
            sourceBranch: sourceBranchInput.trim() || "feature/update",
            targetBranch: targetBranchInput.trim() || "main",
            headSha: Math.random().toString(16).substring(2, 9),
            changedFiles,
            postComment: postCommentInput,
          },
        },
      });
      await refetchPrs();
      setShowSimulateModal(false);
      if (res.data?.triggerPullRequestAnalysis) {
        setActivePr(res.data.triggerPullRequestAnalysis);
      }
    } catch (err) {
      console.error("Failed triggering PR analysis", err);
    }
  };

  const handleReanalyze = async (prId: string) => {
    try {
      const res = await analyzePrMutation({ variables: { pullRequestId: prId } });
      await refetchPrs();
      if (res.data?.analyzePullRequest && activePr?.id === prId) {
        setActivePr({ ...activePr, ...res.data.analyzePullRequest });
      }
    } catch (err) {
      console.error("Re-analyze failed", err);
    }
  };

  const handlePostComment = async (prId: string) => {
    try {
      const res = await postCommentMutation({ variables: { pullRequestId: prId } });
      await refetchPrs();
      if (res.data?.postPrReviewComment && activePr?.id === prId) {
        setActivePr({ ...activePr, ...res.data.postPrReviewComment });
      }
    } catch (err) {
      console.error("Post comment failed", err);
    }
  };

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "PASSED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "WARNINGS":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "FAILED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  const currentRepoName =
    repoData?.repositories?.find((r: { id: string; fullName: string }) => r.id === selectedRepoId)?.fullName ||
    "akhilaammulu/devpilot";

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-[#f4f6fb] dark:bg-[#080b14] text-slate-900 dark:text-slate-100">
      <Header currentPhase="Phase 7 - GitHub Pull Request Analysis" />

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
                <span>Automated Pull Request Reviews</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {repoData?.repositories?.length > 0 && (
                <select
                  value={selectedRepoId}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none shadow-sm"
                >
                  {repoData.repositories.map((r: { id: string; fullName: string }) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setShowSimulateModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Analyze / Simulate PR</span>
              </button>
            </div>
          </div>

          {/* Webhook Endpoint Banner */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Webhook className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  GitHub Webhook Listener Active
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  POST /api/webhooks/github · Events: pull_request (opened, synchronize, reopened)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {["ALL", "PASSED", "WARNINGS", "FAILED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    selectedStatus === status
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* PR List */}
          {prsLoading ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-purple-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading pull requests...</span>
            </div>
          ) : filteredPrs.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <GitPullRequest className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Pull Requests Analyzed Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Trigger a GitHub <code className="font-mono">pull_request</code> webhook to{" "}
                  <code className="font-mono">/api/webhooks/github</code> or click{" "}
                  <strong>Analyze / Simulate PR</strong> to run an automated review.
                </p>
              </div>
              <button
                onClick={() => setShowSimulateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run First PR Review</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrs.map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => setActivePr(pr)}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-purple-400/60 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          pr.reviewStatus
                        )}`}
                      >
                        {pr.reviewStatus === "PASSED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : pr.reviewStatus === "FAILED" ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{pr.reviewStatus || "PENDING"}</span>
                      </span>

                      <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                        #{pr.githubPrNumber}
                      </span>

                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {pr.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                        {pr.sourceBranch} → {pr.targetBranch}
                      </span>
                      <span>by {pr.author || "akhilaammulu"}</span>
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-slate-400" />
                        {pr.changedFilesCount ?? 0} changed files
                      </span>
                      <span>{pr.findingsCount ?? 0} findings</span>
                      {pr.githubCommentPosted && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <MessageSquare className="w-3 h-3" />
                          Comment Posted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Pills & Quick Actions */}
                  <div
                    className="flex flex-wrap items-center gap-3 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <div className="px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400 font-semibold">PR Score</div>
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {pr.prScore ?? "--"}/100
                        </div>
                      </div>
                      <div className="hidden sm:block px-2.5 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">Quality</div>
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          {pr.qualityScore ?? "--"}
                        </div>
                      </div>
                      <div className="hidden sm:block px-2.5 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">Security</div>
                        <div className="font-bold text-rose-600 dark:text-rose-400">
                          {pr.securityScore ?? "--"}
                        </div>
                      </div>
                      <div className="hidden sm:block px-2.5 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">A11y</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {pr.accessibilityScore ?? "--"}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReanalyze(pr.id)}
                      disabled={isReanalyzing}
                      title="Re-run PR analysis"
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <RefreshCw className={`w-4 h-4 ${isReanalyzing ? "animate-spin" : ""}`} />
                    </button>

                    <button
                      onClick={() => setActivePr(pr)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
                    >
                      View Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Simulate / Trigger PR Analysis Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-purple-600" />
                <span>Analyze Pull Request ({currentRepoName})</span>
              </h3>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    PR #
                  </label>
                  <input
                    type="number"
                    value={prNumberInput}
                    onChange={(e) => setPrNumberInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    PR Title
                  </label>
                  <input
                    type="text"
                    value={prTitleInput}
                    onChange={(e) => setPrTitleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Source Branch
                  </label>
                  <input
                    type="text"
                    value={sourceBranchInput}
                    onChange={(e) => setSourceBranchInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Target Branch
                  </label>
                  <input
                    type="text"
                    value={targetBranchInput}
                    onChange={(e) => setTargetBranchInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Changed Files (one per line, optional)
                </label>
                <textarea
                  rows={3}
                  value={changedFilesInput}
                  onChange={(e) => setChangedFilesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                />
              </div>

              <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postCommentInput}
                  onChange={(e) => setPostCommentInput(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>Generate & Post Review Summary Comment to GitHub PR</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTriggering}
                  className="px-5 py-2 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isTriggering ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing PR...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run PR Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PR Review Summary Drawer */}
      {activePr && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="flex-1" onClick={() => setActivePr(null)} />
          <div className="w-full max-w-2xl bg-white dark:bg-[#0e1322] border-l border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                      activePr.reviewStatus
                    )}`}
                  >
                    {activePr.reviewStatus || "PENDING"}
                  </span>
                  <span className="font-mono text-xs font-bold text-purple-600">
                    PR #{activePr.githubPrNumber}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    ({activePr.headSha?.slice(0, 7)})
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {activePr.title}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {activePr.sourceBranch} → {activePr.targetBranch}
                </p>
              </div>
              <button
                onClick={() => setActivePr(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Score Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <div className="text-[10px] font-bold text-purple-600 uppercase">PR Score</div>
                  <div className="text-xl font-extrabold text-purple-700 dark:text-purple-300">
                    {activePr.prScore ?? "--"}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                    <Code2 className="w-3 h-3" /> Quality
                  </div>
                  <div className="text-xl font-extrabold text-indigo-600">
                    {activePr.qualityScore ?? "--"}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Security
                  </div>
                  <div className="text-xl font-extrabold text-rose-600">
                    {activePr.securityScore ?? "--"}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" /> A11y
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600">
                    {activePr.accessibilityScore ?? "--"}
                  </div>
                </div>
              </div>

              {/* Automated Review Summary Comment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                    <span>Generated GitHub Review Comment</span>
                  </h4>
                  {activePr.reviewSummary && (
                    <button
                      onClick={() => handleCopySummary(activePr.reviewSummary!)}
                      className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline"
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Markdown</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {activePr.reviewSummary || "No review summary generated yet. Click Re-run Analysis."}
                </pre>
              </div>

              {/* Review History Timeline */}
              {activePr.history && activePr.history.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-purple-500" />
                    <span>PR Score History ({activePr.history.length} runs)</span>
                  </h4>
                  <div className="space-y-2">
                    {activePr.history.map((h) => (
                      <div
                        key={h.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-purple-600 font-bold">{h.commitSha.slice(0, 7)}</span>
                          <span className="text-slate-400">·</span>
                          <span>{h.findingsCount} findings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">Score: {h.prScore}/100</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                              h.reviewStatus
                            )}`}
                          >
                            {h.reviewStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handlePostComment(activePr.id)}
                disabled={isPostingComment}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {activePr.githubCommentPosted ? "Re-post Comment to GitHub" : "Post Comment to GitHub"}
                </span>
              </button>

              <button
                onClick={() => handleReanalyze(activePr.id)}
                disabled={isReanalyzing}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Re-run Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
