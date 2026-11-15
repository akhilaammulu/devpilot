"use client";

import React from "react";
import { Plus, Github, Shield, CheckCircle2, Eye, FlaskConical, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onConnectClick: () => void;
  onImportClick: () => void;
}

export function HeroSection({ onConnectClick, onImportClick }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all bg-white/70 dark:bg-[#0e1322]/70 backdrop-blur-xl border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-2xl">
      {/* Background radial glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute -bottom-10 right-10 w-72 h-72 bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Greeting, Headlines & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            Welcome back, <span className="text-slate-800 dark:text-slate-200 font-bold">Akhila</span> 👋
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Let&apos;s analyze your code{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              smarter
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Connect a repository, run an AI-powered scan, and get insights on code quality, security, accessibility, and tests.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onConnectClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Repository</span>
            </button>

            <button
              onClick={onImportClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-[#121829] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm"
            >
              <Github className="w-4 h-4 text-slate-800 dark:text-white" />
              <span>Import from GitHub</span>
            </button>
          </div>
        </div>

        {/* Right Column: Stylized Laptop & Floating Badges */}
        <div className="lg:col-span-5 relative flex items-center justify-center py-4">
          <div className="relative w-full max-w-sm aspect-[4/3] flex items-center justify-center">
            {/* Glowing Backdrop Ring */}
            <div className="absolute inset-0 m-auto w-56 h-56 rounded-full bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-indigo-500/20 blur-xl"></div>

            {/* Laptop Base Mockup */}
            <div className="relative z-10 w-52 sm:w-60 bg-gradient-to-b from-slate-800 to-slate-900 dark:from-[#181f33] dark:to-[#0f1424] rounded-2xl p-2.5 shadow-2xl border border-slate-700/60 dark:border-slate-700/50">
              {/* Screen */}
              <div className="w-full aspect-[16/10] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden border border-purple-500/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 to-transparent"></div>
                <span className="font-mono text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-200 tracking-wider">
                  &lt;/&gt;
                </span>
                <span className="text-[10px] text-purple-300/80 font-mono mt-1">
                  devpilot.ai
                </span>
              </div>
              {/* Keyboard bottom base */}
              <div className="w-full h-2 bg-slate-700/50 dark:bg-slate-800/80 rounded-b-lg mt-1.5 flex justify-center items-center">
                <div className="w-12 h-0.5 bg-slate-600 rounded-full"></div>
              </div>
            </div>

            {/* Floating Badge 1: Code Quality */}
            <div className="absolute -top-1 left-2 sm:left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-[#151c30]/90 backdrop-blur-md text-purple-600 dark:text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Code Quality</span>
            </div>

            {/* Floating Badge 2: Security */}
            <div className="absolute top-12 -left-2 sm:left-0 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-[#151c30]/90 backdrop-blur-md text-rose-600 dark:text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-500/10">
              <Shield className="w-3.5 h-3.5 text-rose-500" />
              <span>Security</span>
            </div>

            {/* Floating Badge 3: Accessibility */}
            <div className="absolute -top-1 right-2 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-[#151c30]/90 backdrop-blur-md text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
              <span>Accessibility</span>
            </div>

            {/* Floating Badge 4: Tests */}
            <div className="absolute top-16 right-0 sm:right-2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-[#151c30]/90 backdrop-blur-md text-amber-600 dark:text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              <span>Tests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
