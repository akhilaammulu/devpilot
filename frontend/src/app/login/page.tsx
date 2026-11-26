"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Github,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [showGithubInput, setShowGithubInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!githubUsername.trim() && showGithubInput) return;

    setIsLoading(true);
    const targetUsername = githubUsername.trim() || user?.username || "developer";
    const targetName = targetUsername.charAt(0).toUpperCase() + targetUsername.slice(1);

    setTimeout(() => {
      login({
        username: targetUsername,
        name: targetName,
        email: `${targetUsername}@users.noreply.github.com`,
        avatarUrl: `https://github.com/${targetUsername}.png`,
        githubConnected: true,
      });
      router.push("/");
    }, 600);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const prefix = email.split("@")[0] || "developer";
    const displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);

    setTimeout(() => {
      login({
        email: email,
        username: prefix.toLowerCase(),
        name: displayName,
        githubConnected: false,
      });
      router.push("/");
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors bg-slate-50 dark:bg-[#090b10] text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b transition-colors bg-white/70 dark:bg-[#11151e]/70 backdrop-blur-md border-slate-200 dark:border-[#1e2433]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-[#0e1322] rounded-[14px] flex items-center justify-center">
              <span className="font-mono text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 to-pink-400 font-bold text-sm">
                &lt;/&gt;
              </span>
            </div>
          </div>
          <div>
            <span className="font-bold text-base text-slate-900 dark:text-white">DevPilot</span>
            <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              AI Platform
            </span>
          </div>
        </Link>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-purple-600" />
          )}
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md rounded-3xl p-8 border transition-all bg-white dark:bg-[#11151e] border-slate-200 dark:border-[#1e2433] shadow-xl shadow-purple-500/5 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign in to DevPilot
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connect your repositories and start intelligent code analysis.
            </p>
          </div>

          {/* GitHub OAuth Flow */}
          {!showGithubInput ? (
            <div className="space-y-3">
              <button
                onClick={() => setShowGithubInput(true)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-[#24292F] hover:bg-[#1B1F23] dark:bg-slate-800 dark:hover:bg-slate-750 transition-all shadow-md active:scale-95 border border-slate-700/60"
              >
                <Github className="w-4 h-4" />
                <span>Continue with GitHub</span>
              </button>

              {user && (
                <div className="p-3.5 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-400">@{user.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/")}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleGitHubLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Enter your GitHub Username
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g. akhilaammulu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#24292F] hover:bg-[#1B1F23] transition-all"
                >
                  {isLoading ? "Authenticating..." : "Authorize with GitHub"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGithubInput(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-[#1e2433]"></div>
            <span className="absolute px-3 text-[11px] uppercase tracking-wider font-semibold text-slate-400 bg-white dark:bg-[#11151e]">
              or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 shadow-md shadow-pink-500/20 transition-all hover:scale-[1.01] active:scale-95"
            >
              {isLoading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Footer Highlights */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#1e2433] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              SOC2 & HIPAA Compliant
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              AI Code Remediation
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/60 dark:border-[#1e2433]/60">
        DevPilot &copy; 2026. AI-Powered Developer Platform.
      </footer>
    </div>
  );
}
