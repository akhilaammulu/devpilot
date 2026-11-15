"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ConnectRepoModal } from "@/components/ConnectRepoModal";
import {
  FolderGit2,
  Github,
  Plus,
  Search,
  ExternalLink,
  GitBranch,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Globe,
} from "lucide-react";

interface RepoItem {
  id: string;
  name: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
  lastScanTime: string;
  qualityScore: number;
  securityScore: number;
}

const initialRepos: RepoItem[] = [
  {
    id: "repo-1",
    name: "devpilot",
    owner: "akhilaammulu",
    defaultBranch: "main",
    isPrivate: false,
    htmlUrl: "https://github.com/akhilaammulu/devpilot",
    lastScanTime: "2 hours ago",
    qualityScore: 87,
    securityScore: 92,
  },
  {
    id: "repo-2",
    name: "ecommerce-api",
    owner: "akhilaammulu",
    defaultBranch: "main",
    isPrivate: true,
    htmlUrl: "https://github.com/akhilaammulu/ecommerce-api",
    lastScanTime: "Yesterday",
    qualityScore: 91,
    securityScore: 95,
  },
  {
    id: "repo-3",
    name: "payment-gateway",
    owner: "akhilaammulu",
    defaultBranch: "develop",
    isPrivate: true,
    htmlUrl: "https://github.com/akhilaammulu/payment-gateway",
    lastScanTime: "3 days ago",
    qualityScore: 84,
    securityScore: 89,
  },
];

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<RepoItem[]>(initialRepos);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanningRepoId, setScanningRepoId] = useState<string | null>(null);

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddRepo = (data: { fullName: string; defaultBranch: string; htmlUrl: string }) => {
    const parts = data.fullName.split("/");
    const owner = parts.length > 1 ? parts[0] : "akhilaammulu";
    const name = parts.length > 1 ? parts[1] : parts[0];

    const newRepo: RepoItem = {
      id: `repo-${Date.now()}`,
      name,
      owner,
      defaultBranch: data.defaultBranch || "main",
      isPrivate: false,
      htmlUrl: data.htmlUrl,
      lastScanTime: "Just now",
      qualityScore: 88,
      securityScore: 94,
    };
    setRepos([newRepo, ...repos]);
  };

  const handleTriggerScan = (id: string) => {
    setScanningRepoId(id);
    setTimeout(() => {
      setScanningRepoId(null);
      setRepos((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, lastScanTime: "Just now", qualityScore: 92 } : r
        )
      );
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-[#f4f6fb] dark:bg-[#080b14] text-slate-900 dark:text-slate-100">
      <Header currentPhase="Phase 2 - Prototype (Static Analysis)" />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Breadcrumb & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-200">
                  Dashboard
                </Link>
                <span>&gt;</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Repositories
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <FolderGit2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span>Connected Repositories</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                  {repos.length} Total
                </span>
              </h1>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 shadow-md shadow-pink-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Repository</span>
            </button>
          </div>

          {/* Search Toolbar */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search connected repositories..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Repositories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="rounded-3xl p-5 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-purple-500/40 hover:shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        <Github className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {repo.owner}/{repo.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Last scanned: {repo.lastScanTime}</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                      <GitBranch className="w-2.5 h-2.5" />
                      {repo.defaultBranch}
                    </span>

                    {repo.isPrivate ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <Lock className="w-2.5 h-2.5" /> Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <Globe className="w-2.5 h-2.5" /> Public
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-slate-400 text-[10px] block">Quality Score</span>
                    <span className="font-extrabold text-purple-600 dark:text-purple-400 text-base">
                      {repo.qualityScore}%
                    </span>
                  </div>

                  <button
                    onClick={() => handleTriggerScan(repo.id)}
                    disabled={scanningRepoId === repo.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-sm"
                  >
                    <Play className={`w-3 h-3 ${scanningRepoId === repo.id ? "animate-spin" : ""}`} />
                    <span>{scanningRepoId === repo.id ? "Scanning..." : "Scan Now"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ConnectRepoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleAddRepo}
      />
    </div>
  );
}
