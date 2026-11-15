"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  GitPullRequest,
  BarChart3,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  Eye,
  FlaskConical,
  Bot,
  ArrowRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [scansOpen, setScansOpen] = useState(true);

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between p-4 transition-colors min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#180e29] via-[#1f1438] to-[#120a22] text-white border-r border-purple-950/40">
      {/* Navigation Links */}
      <nav className="space-y-1.5">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
            pathname === "/"
              ? "bg-white/15 text-white shadow-sm border border-white/10"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-purple-400" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/repositories"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <FolderGit2 className="w-4 h-4 text-purple-400" />
          <span>Repositories</span>
        </Link>

        <Link
          href="/pull-requests"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <GitPullRequest className="w-4 h-4 text-purple-400" />
          <span>Pull Requests</span>
        </Link>

        {/* Scans & Reports Expandable Menu */}
        <div className="space-y-1">
          <button
            onClick={() => setScansOpen(!scansOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Scans & Reports</span>
            </div>
            {scansOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {scansOpen && (
            <div className="pl-4 space-y-1">
              <Link
                href="/scans"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/scans" || pathname === "/"
                    ? "bg-gradient-to-r from-purple-500/25 to-pink-500/15 text-white border border-purple-400/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="font-mono text-purple-400 font-bold">&lt;/&gt;</span>
                <span>Code Quality</span>
              </Link>

              <Link
                href="/scans"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Security</span>
              </Link>

              <Link
                href="/scans"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accessibility</span>
              </Link>

              <Link
                href="/scans"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                <span>Tests</span>
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/ai-insights"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI Insights</span>
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-4 h-4 text-purple-400" />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Bottom AI Fix Assistant Banner */}
      <div className="relative overflow-hidden rounded-3xl p-4 border transition-all bg-gradient-to-b from-[#251745] to-[#190f33] border-purple-500/30 shadow-xl shadow-purple-950/40">
        <div className="relative z-10 space-y-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30 text-lg">
            🤖
          </div>

          <div>
            <h4 className="text-xs font-bold text-white">AI Fix Assistant</h4>
            <p className="text-[10px] text-purple-200/70 mt-0.5 leading-relaxed">
              Get AI-powered fixes, explanations and best practices for your code issues.
            </p>
          </div>

          <button
            onClick={() => alert("AI Fix Assistant activated")}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Try Now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
