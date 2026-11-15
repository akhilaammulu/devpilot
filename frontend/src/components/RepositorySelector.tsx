"use client";

import React, { useState } from "react";
import { FolderGit2, Plus, ExternalLink, CheckCircle2 } from "lucide-react";

export interface RepoItem {
  id: string;
  githubRepoId: string;
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
}

interface RepositorySelectorProps {
  repositories: RepoItem[];
  selectedRepo: RepoItem | null;
  onSelect: (repo: RepoItem) => void;
  onConnectNew: (repoData: { fullName: string; htmlUrl: string; defaultBranch: string }) => void;
}

export function RepositorySelector({
  repositories,
  selectedRepo,
  onSelect,
  onConnectNew,
}: RepositorySelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [repoName, setRepoName] = useState("akhilaammulu/devpilot");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName.trim()) return;
    onConnectNew({
      fullName: repoName,
      htmlUrl: `https://github.com/${repoName}`,
      defaultBranch: "main",
    });
    setIsAdding(false);
  };

  return (
    <div className="bg-[#111827]/70 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Connected Repositories</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Connect Repository
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-gray-800/60 border border-gray-700 rounded-xl space-y-3">
          <label className="block text-xs font-medium text-gray-300">
            GitHub Repository (owner/repo)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g. owner/repository"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {repositories.map((repo) => {
          const isSelected = selectedRepo?.id === repo.id;
          return (
            <div
              key={repo.id}
              onClick={() => onSelect(repo)}
              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                isSelected
                  ? "bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/10"
                  : "bg-gray-900/60 border-gray-800 hover:border-gray-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    {repo.fullName}
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Branch: {repo.defaultBranch}</p>
                </div>
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-500 hover:text-gray-300"
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
