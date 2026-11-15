"use client";

import React from "react";
import { Github, ExternalLink, GitBranch, ArrowRight } from "lucide-react";

export interface RepoItem {
  id: string;
  githubRepoId: string;
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
  updatedAt?: string;
  isActive?: boolean;
}

interface ConnectedRepositoriesProps {
  repositories: RepoItem[];
  selectedRepo: RepoItem | null;
  onSelectRepo: (repo: RepoItem) => void;
}

export function ConnectedRepositories({
  repositories,
  selectedRepo,
  onSelectRepo,
}: ConnectedRepositoriesProps) {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4 text-slate-800 dark:text-white" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Connected Repositories
          </h3>
          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
            {repositories.length}
          </span>
        </div>

        <button
          onClick={() => alert("All repositories list")}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Repository List */}
      <div className="space-y-2">
        {repositories.map((repo) => {
          const isSelected = selectedRepo?.id === repo.id;
          return (
            <div
              key={repo.id}
              onClick={() => onSelectRepo(repo)}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-purple-500/[0.04] dark:bg-purple-950/20 border-purple-500/40 shadow-sm"
                  : "bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  <Github className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {repo.fullName}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                      <GitBranch className="w-2.5 h-2.5" />
                      {repo.defaultBranch}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {repo.updatedAt || "Updated 2 hours ago"}
                  </p>
                </div>
              </div>

              {/* Right: Active status & link */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>

                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
