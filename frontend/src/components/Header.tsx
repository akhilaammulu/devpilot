"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  currentPhase?: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ currentPhase = "Phase 7 - GitHub Pull Request Analysis", onSearchChange }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPhaseMenu, setShowPhaseMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const phases = [
    { num: 1, name: "Foundation", status: "Completed" },
    { num: 2, name: "Prototype (Static Analysis)", status: "Completed" },
    { num: 3, name: "Security Analysis", status: "Completed" },
    { num: 4, name: "Accessibility Analysis", status: "Completed" },
    { num: 5, name: "AI Analysis", status: "Completed" },
    { num: 6, name: "Repository-Aware RAG", status: "Completed" },
    { num: 7, name: "GitHub Pull Request Analysis", status: "Active" },
    { num: 8, name: "Event-Driven Architecture", status: "Upcoming" },
    { num: 9, name: "Production & Cloud", status: "Upcoming" },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  const displayName = "akhilaammulu";
  const displayUsername = "akhilaammulu";

  return (
    <header className="h-16 px-6 border-b flex items-center justify-between sticky top-0 z-40 transition-colors backdrop-blur-md bg-white/95 dark:bg-[#0d1017]/95 border-slate-200/80 dark:border-[#1e2433]">
      {/* Left: Logo & Phase Badge */}
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-[1px] shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1017] rounded-[11px] flex items-center justify-center">
              <span className="font-mono text-violet-400 font-bold text-sm">
                &lt;/&gt;
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                DevPilot
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 -mt-0.5 font-medium">
              AI-Powered Developer Platform
            </p>
          </div>
        </Link>

        {/* Phase Pill with Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowPhaseMenu(!showPhaseMenu)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40 hover:bg-emerald-100/70 transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            🌱 {currentPhase}
            <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </button>

          {showPhaseMenu && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl p-2 shadow-2xl border transition-all z-50 bg-white dark:bg-[#161b26] border-slate-200 dark:border-[#1e2433]">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-[#1e2433]">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  DevPilot Build Roadmap
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                {phases.map((p) => (
                  <div
                    key={p.num}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                      p.num === 4
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>Phase {p.num}: {p.name}</span>
                    <span className="text-[10px] font-semibold opacity-70">{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Universal Search Bar matching screenshot */}
      <div className="hidden lg:flex items-center flex-1 max-w-lg mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search repositories, scans, issues..."
            className="w-full pl-9 pr-14 py-2 rounded-full text-xs transition-all border outline-none bg-slate-50 dark:bg-[#161b26]/90 border-slate-200 dark:border-[#1e2433] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:border-purple-500 dark:focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-1.5 py-0.5 rounded-md shadow-sm">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Theme Switch, Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button with Amber Sun */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <Moon className="w-5 h-5 text-purple-400" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0e1322]"></span>
        </button>

        {/* Profile Pill matching exact screenshot */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all bg-white dark:bg-[#161b26] border-slate-200 dark:border-[#1e2433] hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              A
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {displayUsername}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-2xl border transition-all z-50 bg-white dark:bg-[#161b26] border-slate-200 dark:border-[#1e2433]">
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-[#1e2433]">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  @{displayUsername}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  <UserIcon className="w-4 h-4 text-purple-400" />
                  Your Profile
                </Link>
                <Link
                  href="/login"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  Switch / Login Account
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-[#1e2433]">
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
