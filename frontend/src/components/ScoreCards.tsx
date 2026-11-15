"use client";

import React from "react";
import { Shield, Eye, FlaskConical } from "lucide-react";

interface ScoreCardsProps {
  qualityScore?: number | null;
  securityScore?: number | null;
  accessibilityScore?: number | null;
  testsScore?: number | null;
  hasScanned?: boolean;
}

export function ScoreCards({
  qualityScore = null,
  securityScore = null,
  accessibilityScore = null,
  testsScore = null,
  hasScanned = false,
}: ScoreCardsProps) {
  const cards = [
    {
      title: "Code Quality",
      score: qualityScore,
      change: hasScanned ? "+5%" : "Baseline",
      icon: (
        <span className="font-mono text-purple-500 font-bold text-xs">&lt;/&gt;</span>
      ),
      iconBg: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
      barBg: "bg-gradient-to-r from-purple-500 to-indigo-500",
      shadow: "shadow-purple-500/5",
    },
    {
      title: "Security",
      score: securityScore,
      change: hasScanned ? "+2%" : "Baseline",
      icon: <Shield className="w-3.5 h-3.5 text-rose-500" />,
      iconBg: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
      barBg: "bg-gradient-to-r from-rose-500 to-pink-500",
      shadow: "shadow-rose-500/5",
    },
    {
      title: "Accessibility",
      score: accessibilityScore,
      change: hasScanned ? "+8%" : "Baseline",
      icon: <Eye className="w-3.5 h-3.5 text-emerald-500" />,
      iconBg: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      barBg: "bg-gradient-to-r from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/5",
    },
    {
      title: "Tests",
      score: testsScore,
      change: hasScanned ? "+4%" : "Baseline",
      icon: <FlaskConical className="w-3.5 h-3.5 text-amber-500" />,
      iconBg: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      barBg: "bg-gradient-to-r from-amber-500 to-yellow-500",
      shadow: "shadow-amber-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const displayScore = card.score !== null && card.score !== undefined ? card.score : 0;
        const isCalculated = card.score !== null && card.score !== undefined;

        return (
          <div
            key={card.title}
            className={`rounded-3xl p-5 border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm ${card.shadow} hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${card.iconBg}`}
                >
                  {card.icon}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {card.title}
                </span>
              </div>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {isCalculated && <span>↑</span>}
                <span>{card.change}</span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isCalculated ? displayScore : "—"}
              </span>
              <span className="text-xs font-medium text-slate-400">/100</span>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5 w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${card.barBg}`}
                style={{ width: `${displayScore}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
