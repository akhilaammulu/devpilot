"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldAlert, Wrench, Workflow, ArrowRight } from "lucide-react";

export interface IntelligenceSignal {
  id: string;
  kind: "Quality Alert" | "AI Recommendation" | "Security Insight" | "Pipeline Insight";
  title: string;
  whatChanged: string;
  whyItMatters: string;
  nextAction: string;
  href: string;
  severity: "critical" | "warning" | "info";
}

interface IntelligenceLayerProps {
  signals: IntelligenceSignal[];
}

export function IntelligenceLayer({ signals }: IntelligenceLayerProps) {
  const getKindStyle = (kind: IntelligenceSignal["kind"]) => {
    switch (kind) {
      case "Security Insight":
        return {
          icon: ShieldAlert,
          badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
          accent: "text-rose-400",
        };
      case "Pipeline Insight":
        return {
          icon: Workflow,
          badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          accent: "text-amber-400",
        };
      case "Quality Alert":
        return {
          icon: Wrench,
          badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
          accent: "text-indigo-400",
        };
      default:
        return {
          icon: Sparkles,
          badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
          accent: "text-violet-400",
        };
    }
  };

  return (
    <div className="layer-intelligence rounded-3xl p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-violet-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Contextual AI Intelligence Layer</span>
          </div>
          <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">
            What Changed · Why It Matters · Next Action
          </h2>
        </div>
        <Link
          href="/ai-insights"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 transition-colors"
        >
          <span>Open RAG Q&amp;A</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {signals.map((sig) => {
          const style = getKindStyle(sig.kind);
          const Icon = style.icon;
          return (
            <div
              key={sig.id}
              className="card-3d card-3d-interactive rounded-2xl p-4 bg-[#0a0e17]/90 border border-[#232b40] flex flex-col justify-between gap-3"
            >
              <div className="space-y-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${style.badge}`}
                >
                  <Icon className="w-3 h-3" />
                  {sig.kind}
                </span>
                <div className="text-xs font-bold text-white leading-snug">{sig.title}</div>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <p>
                    <span className="text-slate-300 font-semibold">Changed:</span> {sig.whatChanged}
                  </p>
                  <p>
                    <span className="text-slate-300 font-semibold">Impact:</span> {sig.whyItMatters}
                  </p>
                </div>
              </div>

              <Link
                href={sig.href}
                className={`inline-flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px] font-bold ${style.accent} hover:underline`}
              >
                <span>{sig.nextAction}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
