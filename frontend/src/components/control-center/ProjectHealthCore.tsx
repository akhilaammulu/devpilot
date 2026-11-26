"use client";

import React from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Shield, Code2, FlaskConical, Wrench, Zap, Activity } from "lucide-react";

export interface HealthDimension {
  key: string;
  label: string;
  score: number;
  detail: string;
  color: string;
  barColor: string;
}

interface ProjectHealthCoreProps {
  projectName: string;
  branchName: string;
  overallScore: number;
  qualityScore: number;
  securityScore: number;
  a11yScore: number;
  testCoverageScore: number;
  maintainabilityScore: number;
  performanceScore: number;
  reliabilityScore: number;
  totalOpenIssues: number;
  isScanning?: boolean;
}

export function ProjectHealthCore({
  projectName,
  branchName,
  overallScore,
  qualityScore,
  securityScore,
  testCoverageScore,
  maintainabilityScore,
  performanceScore,
  reliabilityScore,
  totalOpenIssues,
  isScanning,
}: ProjectHealthCoreProps) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, overallScore));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const coreColor =
    clamped >= 80 ? "#10b981" : clamped >= 60 ? "#22d3ee" : clamped >= 40 ? "#f59e0b" : "#f43f5e";

  const dimensions: Array<HealthDimension & { icon: React.ComponentType<{ className?: string }> }> = [
    {
      key: "quality",
      label: "Code Quality",
      score: qualityScore,
      detail: `${totalOpenIssues} open findings`,
      color: "text-indigo-400",
      barColor: "bg-indigo-500",
      icon: Code2,
    },
    {
      key: "security",
      label: "Security",
      score: securityScore,
      detail: "CVE & secrets posture",
      color: "text-rose-400",
      barColor: "bg-rose-500",
      icon: Shield,
    },
    {
      key: "coverage",
      label: "Test Coverage",
      score: testCoverageScore,
      detail: "Unit & integration",
      color: "text-emerald-400",
      barColor: "bg-emerald-500",
      icon: FlaskConical,
    },
    {
      key: "maintainability",
      label: "Maintainability",
      score: maintainabilityScore,
      detail: "Complexity & debt",
      color: "text-cyan-400",
      barColor: "bg-cyan-500",
      icon: Wrench,
    },
    {
      key: "performance",
      label: "Performance",
      score: performanceScore,
      detail: "Build & runtime speed",
      color: "text-amber-400",
      barColor: "bg-amber-500",
      icon: Zap,
    },
    {
      key: "reliability",
      label: "Reliability",
      score: reliabilityScore,
      detail: "Pipeline & runtime",
      color: "text-violet-400",
      barColor: "bg-violet-500",
      icon: Activity,
    },
  ];

  return (
    <div className="layer-environment rounded-3xl p-6 flex flex-col justify-between gap-6 relative overflow-hidden">
      {/* Subtle Core Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-400">
            Project Health Core
          </div>
          <div className="text-sm font-bold text-white truncate max-w-[220px] mt-0.5">
            {projectName}
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#0b101b] border border-[#222c40] text-slate-300">
          {branchName}
        </span>
      </div>

      {/* Central Living Core Visualization */}
      <div className="relative flex items-center justify-center py-2">
        <svg viewBox="0 0 180 180" className="w-48 h-48 overflow-visible">
          {/* Outer Orbital Dashed Ring */}
          <circle
            cx="90"
            cy="90"
            r="82"
            fill="none"
            stroke="rgba(34, 211, 238, 0.16)"
            strokeWidth="1"
            strokeDasharray="3 6"
            className="animate-orbit-slow"
          />
          {/* Track Ring */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(30, 41, 59, 0.75)"
            strokeWidth="10"
          />
          {/* Active Health Arc */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={coreColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 90 90)"
            style={{
              transition: "stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.4s ease",
              filter: `drop-shadow(0 0 10px ${coreColor}55)`,
            }}
          />
          {/* Inner Core Halo */}
          <circle
            cx="90"
            cy="90"
            r="48"
            fill="rgba(12, 17, 29, 0.9)"
            stroke="rgba(51, 65, 85, 0.45)"
            strokeWidth="1"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-slate-400">
            {isScanning ? "ANALYZING" : "HEALTH"}
          </span>
          <AnimatedCounter
            value={clamped}
            className="text-4xl font-extrabold text-white tabular-nums tracking-tight leading-none my-1"
          />
          <span className="text-[10px] font-mono text-slate-400">
            / 100
          </span>
        </div>
      </div>

      {/* 6-Dimension Breakdown */}
      <div className="space-y-2.5">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          return (
            <div key={dim.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${dim.color}`} />
                  <span className="font-semibold text-slate-200">{dim.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                    {dim.detail}
                  </span>
                  <span className={`font-mono font-bold tabular-nums ${dim.color}`}>
                    {dim.score}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#131a29] overflow-hidden">
                <div
                  className={`h-full rounded-full ${dim.barColor} transition-all duration-700`}
                  style={{ width: `${Math.max(4, Math.min(100, dim.score))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
