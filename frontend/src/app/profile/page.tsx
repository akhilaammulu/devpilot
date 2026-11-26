"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon,
  Github,
  Mail,
  Shield,
  Key,
  ExternalLink,
  CheckCircle2,
  Sun,
  Moon,
  Save,
  RefreshCw,
  FolderGit2,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      username,
      email,
      bio,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const initial = name
    ? name.charAt(0).toUpperCase()
    : username
    ? username.charAt(0).toUpperCase()
    : "D";

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-slate-50 dark:bg-[#090b10] text-slate-900 dark:text-slate-100">
      <Header currentPhase="Phase 1 - Foundation" />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto space-y-6 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-200">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">User Profile</span>
          </div>

          {/* Profile Header Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all bg-white dark:bg-[#11151e] border-slate-200 dark:border-[#1e2433] shadow-sm">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-1 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={username}
                      className="w-full h-full rounded-[20px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0e1322] rounded-[20px] flex items-center justify-center text-white text-2xl font-black">
                      {initial}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {name || "Developer"}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      {user?.plan || "Pro"} Tier
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    @{username} &bull; {email}
                  </p>
                </div>
              </div>

              {/* GitHub Connected Pill */}
              <div className="flex items-center gap-3">
                {user?.githubConnected ? (
                  <a
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold border transition-all bg-slate-50 dark:bg-[#161b26] border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub Connected</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </a>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700"
                  >
                    <Github className="w-4 h-4" />
                    <span>Connect GitHub</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form & Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Edit Profile Form */}
            <div className="lg:col-span-8 rounded-3xl p-6 border transition-all bg-white dark:bg-[#11151e] border-slate-200 dark:border-[#1e2433] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-[#1e2433]">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-purple-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Personal Information
                  </h2>
                </div>
                {isSaved && (
                  <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved successfully!
                  </span>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Bio & Developer Focus
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about what you are building..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500 resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 shadow-md shadow-pink-500/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right 4 Cols: Appearance & Integration Preferences */}
            <div className="lg:col-span-4 space-y-6">
              {/* Theme Preference Box */}
              <div className="rounded-3xl p-6 border transition-all bg-white dark:bg-[#11151e] border-slate-200 dark:border-[#1e2433] shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Theme Preference
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      theme === "light"
                        ? "border-purple-500 bg-purple-500/10 text-purple-600 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-bold">Light Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      theme === "dark"
                        ? "border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Moon className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold">Dark Theme</span>
                  </button>
                </div>
              </div>

              {/* GitHub OAuth Details */}
              <div className="rounded-3xl p-6 border transition-all bg-white dark:bg-[#11151e] border-slate-200 dark:border-[#1e2433] shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-800 dark:text-white" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    GitHub OAuth Scope
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Repository Access:</span>
                    <span className="font-semibold text-emerald-500">Read & Write (repo)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Pull Request Reviews:</span>
                    <span className="font-semibold text-emerald-500">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Webhooks:</span>
                    <span className="font-semibold text-purple-500">Active</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/"
                    className="block text-center py-2 rounded-xl text-xs font-semibold border border-purple-500/30 text-purple-600 dark:text-purple-300 bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
