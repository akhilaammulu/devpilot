"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Code2,
  Sparkles,
  Workflow,
  GitPullRequest,
  Shield,
  Eye,
  FolderGit2,
  History,
  Settings,
} from "lucide-react";

interface NavNode {
  label: string;
  sublabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (path: string) => boolean;
  accent: string;
}

const WORKSPACE_NODES: NavNode[] = [
  {
    label: "Overview",
    sublabel: "Control Center & System Map",
    href: "/",
    icon: Compass,
    match: (p) => p === "/" || p === "/dashboard" || p === "/overview",
    accent: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  },
  {
    label: "Code",
    sublabel: "Code Intelligence Tree",
    href: "/code-quality",
    icon: Code2,
    match: (p) => p === "/code-quality" || p === "/quality",
    accent: "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
  },
  {
    label: "Intelligence",
    sublabel: "Contextual AI & RAG",
    href: "/ai-insights",
    icon: Sparkles,
    match: (p) => p === "/ai-insights",
    accent: "text-violet-400 border-violet-500/40 bg-violet-500/10",
  },
  {
    label: "Delivery",
    sublabel: "Living CI/CD Flow",
    href: "/pipelines",
    icon: Workflow,
    match: (p) => p === "/pipelines",
    accent: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  },
  {
    label: "Insights",
    sublabel: "PR Reviews & Signals",
    href: "/pull-requests",
    icon: GitPullRequest,
    match: (p) => p === "/pull-requests",
    accent: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  },
];

const SYSTEM_NODES: NavNode[] = [
  {
    label: "Security",
    sublabel: "CVE & Secrets",
    href: "/security",
    icon: Shield,
    match: (p) => p === "/security",
    accent: "text-rose-400 border-rose-500/40 bg-rose-500/10",
  },
  {
    label: "Accessibility",
    sublabel: "WCAG Audit",
    href: "/accessibility",
    icon: Eye,
    match: (p) => p === "/accessibility",
    accent: "text-teal-400 border-teal-500/40 bg-teal-500/10",
  },
  {
    label: "Repositories",
    sublabel: "Connected Systems",
    href: "/repositories",
    icon: FolderGit2,
    match: (p) => p === "/repositories",
    accent: "text-sky-400 border-sky-500/40 bg-sky-500/10",
  },
  {
    label: "History",
    sublabel: "Scan Executions",
    href: "/scans",
    icon: History,
    match: (p) => p === "/scans",
    accent: "text-slate-200 border-slate-500/40 bg-slate-500/10",
  },
  {
    label: "Settings",
    sublabel: "Profile & Workspace",
    href: "/profile",
    icon: Settings,
    match: (p) => p === "/profile",
    accent: "text-slate-200 border-slate-500/40 bg-slate-500/10",
  },
];

function RailItem({ node, active }: { node: NavNode; active: boolean }) {
  const Icon = node.icon;
  return (
    <Link
      href={node.href}
      aria-label={node.label}
      className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-200 ${
        active
          ? `${node.accent} shadow-[0_0_20px_-6px_rgba(34,211,238,0.35)]`
          : "border-transparent text-slate-500 hover:text-slate-200 hover:bg-[#121722] hover:border-[#1e2638]"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[9px] font-mono tracking-tight mt-0.5 leading-none opacity-80">
        {node.label.slice(0, 5)}
      </span>

      {/* Floating Spatial Tooltip */}
      <div className="pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 absolute left-full ml-3 z-50 whitespace-nowrap px-3 py-2 rounded-xl bg-[#0e131d]/95 border border-[#252f44] shadow-2xl backdrop-blur-md">
        <div className="text-xs font-bold text-white">{node.label}</div>
        <div className="text-[10px] text-slate-400">{node.sublabel}</div>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="w-[76px] shrink-0 flex flex-col items-center justify-between py-4 px-2 sticky top-16 h-[calc(100vh-4rem)] bg-[#080b11]/95 border-r border-[#182030] select-none z-30">
      {/* Primary Workflow Rail */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600 mb-1">
          Flow
        </span>
        {WORKSPACE_NODES.map((node) => (
          <RailItem key={node.href} node={node} active={node.match(pathname)} />
        ))}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-[#182030] my-2" />

      {/* Domain & System Rail */}
      <div className="flex flex-col items-center gap-1.5">
        {SYSTEM_NODES.map((node) => (
          <RailItem key={node.href} node={node} active={node.match(pathname)} />
        ))}
      </div>
    </aside>
  );
}
