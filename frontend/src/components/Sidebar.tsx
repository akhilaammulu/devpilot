"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  GitPullRequest,
  BarChart3,
  Sparkles,
  Settings,
  Rocket,
  ArrowRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Repositories", href: "/repositories", icon: Code2 },
    { name: "Pull Requests", href: "/pull-requests", icon: GitPullRequest },
    { name: "Scans & Reports", href: "/scans", icon: BarChart3 },
    { name: "AI Insights", href: "/ai-insights", icon: Sparkles },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r hidden md:flex flex-col justify-between p-4 transition-colors bg-slate-50/50 dark:bg-[#080b14] border-slate-200 dark:border-slate-800/80 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <nav className="space-y-1.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-purple-600/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300 shadow-sm border border-purple-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Upgrade Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 border transition-all bg-gradient-to-b from-purple-500/10 to-pink-500/5 dark:from-[#151329] dark:to-[#181126] border-purple-500/20 dark:border-purple-500/30 shadow-xl shadow-purple-500/5">
        {/* Glow orb */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-pink-500/20 dark:bg-pink-500/30 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Rocket className="w-4 h-4" />
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Upgrade to Pro
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Unlock advanced AI analysis, PR reviews and team features.
            </p>
          </div>

          <button
            onClick={() => alert("DevPilot Pro subscription plans coming soon!")}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 shadow-md shadow-pink-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Upgrade Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
