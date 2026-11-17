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
  ArrowRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [scansOpen, setScansOpen] = useState(true);

  // In this static analysis explorer view, "Code Quality" is the primary active route
  const isCodeQualityActive =
    pathname === "/" ||
    pathname === "/scans" ||
    pathname === "/quality" ||
    pathname === "/code-quality" ||
    pathname === "/dashboard";

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between p-4 transition-colors min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#160d2e] via-[#1d123d] to-[#120a24] text-white border-r border-purple-950/40 select-none">
      {/* Navigation Links */}
      <nav className="space-y-1.5">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
            pathname === "/overview"
              ? "bg-white/15 text-white shadow-sm border border-white/10"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-purple-400" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/repositories"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
            pathname === "/repositories"
              ? "bg-white/15 text-white shadow-sm border border-white/10"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-purple-400" />
          <span>Repositories</span>
        </Link>

        <Link
          href="/pull-requests"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
            pathname === "/pull-requests"
              ? "bg-white/15 text-white shadow-sm border border-white/10"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <GitPullRequest className="w-4 h-4 text-purple-400" />
          <span>Pull Requests</span>
        </Link>

        {/* Scans & Reports Expandable Menu */}
        <div className="space-y-1 pt-1">
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
            <div className="pl-3 space-y-1">
              {/* Active Code Quality Pill with purple gradient and glow matching screenshot */}
              <Link
                href="/"
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isCodeQualityActive
                    ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600/80 text-white border border-purple-400/40 shadow-lg shadow-purple-600/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="font-mono text-purple-300 font-extrabold text-sm">&lt;/&gt;</span>
                <span>Code Quality</span>
              </Link>

              <Link
                href="/security"
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/security"
                    ? "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white border border-rose-400/40 shadow-lg shadow-rose-600/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5 font-medium"
                }`}
              >
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Security</span>
              </Link>

              <Link
                href="/accessibility"
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/accessibility"
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white border border-emerald-400/40 shadow-lg shadow-emerald-600/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5 font-medium"
                }`}
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Accessibility</span>
              </Link>

              <Link
                href="/scans"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span>Tests</span>
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/ai-insights"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
            pathname === "/ai-insights"
              ? "bg-white/15 text-white shadow-sm border border-white/10"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI Insights</span>
        </Link>

        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
            pathname === "/profile"
              ? "bg-white/15 text-white shadow-sm border border-white/10"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Settings className="w-4 h-4 text-purple-400" />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Bottom AI Fix Assistant Banner matching screenshot */}
      <div className="relative overflow-hidden rounded-3xl p-4 border transition-all bg-gradient-to-b from-[#2a174d] to-[#180d33] border-purple-500/30 shadow-xl shadow-purple-950/50 mt-4">
        <div className="relative z-10 space-y-2.5">
          {/* 3D Robot Avatar icon */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#160d2e] rounded-[14px] flex items-center justify-center text-xl">
              🤖
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white tracking-tight">AI Fix Assistant</h4>
            <p className="text-[10px] text-purple-200/70 mt-0.5 leading-relaxed font-normal">
              Get AI-powered fixes, explanations and best practices for your code issues.
            </p>
          </div>

          <Link
            href="/ai-insights"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
          >
            <span>Try Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
