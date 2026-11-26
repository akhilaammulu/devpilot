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
  Bot,
  Workflow,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [scansOpen, setScansOpen] = useState(true);

  const isDashboardActive = pathname === "/" || pathname === "/dashboard" || pathname === "/overview";
  const isCodeQualityActive = pathname === "/code-quality" || pathname === "/quality";

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between p-4 transition-colors min-h-[calc(100vh-4rem)] bg-[#0c0f16] text-slate-300 border-r border-[#1e2433] select-none">
      {/* Navigation Links */}
      <nav className="space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isDashboardActive
              ? "bg-[#171c28] text-white border border-violet-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${isDashboardActive ? "text-violet-400" : "text-slate-500"}`} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/repositories"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            pathname === "/repositories"
              ? "bg-[#171c28] text-white border border-violet-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
          }`}
        >
          <FolderGit2 className={`w-4 h-4 ${pathname === "/repositories" ? "text-violet-400" : "text-slate-500"}`} />
          <span>Repositories</span>
        </Link>

        <Link
          href="/pull-requests"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            pathname === "/pull-requests"
              ? "bg-[#171c28] text-white border border-violet-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
          }`}
        >
          <GitPullRequest className={`w-4 h-4 ${pathname === "/pull-requests" ? "text-violet-400" : "text-slate-500"}`} />
          <span>Pull Requests</span>
        </Link>

        <Link
          href="/pipelines"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            pathname === "/pipelines"
              ? "bg-[#171c28] text-white border border-violet-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
          }`}
        >
          <Workflow className={`w-4 h-4 ${pathname === "/pipelines" ? "text-violet-400" : "text-slate-500"}`} />
          <span>CI/CD Pipelines</span>
        </Link>

        {/* Scans & Reports Expandable Menu */}
        <div className="space-y-1 pt-2">
          <button
            onClick={() => setScansOpen(!scansOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Scans & Reports</span>
            </div>
            {scansOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {scansOpen && (
            <div className="pl-2 space-y-1">
              <Link
                href="/code-quality"
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isCodeQualityActive
                    ? "bg-[#171c28] text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
                }`}
              >
                <span className={`font-mono font-bold text-xs ${isCodeQualityActive ? "text-indigo-400" : "text-slate-500"}`}>
                  &lt;/&gt;
                </span>
                <span>Code Quality</span>
              </Link>

              <Link
                href="/security"
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname === "/security"
                    ? "bg-[#171c28] text-white border border-rose-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
                }`}
              >
                <Shield className={`w-4 h-4 ${pathname === "/security" ? "text-rose-400" : "text-slate-500"}`} />
                <span>Security</span>
              </Link>

              <Link
                href="/accessibility"
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname === "/accessibility"
                    ? "bg-[#171c28] text-white border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
                }`}
              >
                <Eye className={`w-4 h-4 ${pathname === "/accessibility" ? "text-emerald-400" : "text-slate-500"}`} />
                <span>Accessibility</span>
              </Link>

              <Link
                href="/scans"
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname === "/scans"
                    ? "bg-[#171c28] text-white border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
                }`}
              >
                <FlaskConical className={`w-4 h-4 ${pathname === "/scans" ? "text-amber-400" : "text-slate-500"}`} />
                <span>Tests</span>
              </Link>
            </div>
          )}
        </div>

        <div className="pt-2 space-y-1">
          <Link
            href="/ai-insights"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/ai-insights"
                ? "bg-[#171c28] text-white border border-violet-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${pathname === "/ai-insights" ? "text-violet-400" : "text-slate-500"}`} />
            <span>AI Insights</span>
          </Link>

          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/profile"
                ? "bg-[#171c28] text-white border border-violet-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-[#131722]"
            }`}
          >
            <Settings className={`w-4 h-4 ${pathname === "/profile" ? "text-violet-400" : "text-slate-500"}`} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Bottom AI Fix Assistant Card */}
      <div className="rounded-2xl p-4 border border-[#1e2433] bg-[#11151e] space-y-3 mt-4">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          <Bot className="w-5 h-5" />
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-100 tracking-tight">AI Fix Assistant</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Repository-aware RAG Q&A, root-cause fixes, and regression tests.
          </p>
        </div>

        <Link
          href="/ai-insights"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-100 bg-[#171c28] hover:bg-[#1f2637] border border-[#2a3245] transition-all"
        >
          <span>Open Assistant</span>
          <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
        </Link>
      </div>
    </aside>
  );
}
