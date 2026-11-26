"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  SkipForward,
  Ban,
  Package,
  RotateCcw,
  Terminal,
  ShieldCheck,
} from "lucide-react";

export interface PipelineStageResult {
  name: string;
  type: string;
  status: string;
  durationMs: number;
  errorsCount: number;
  warningsCount: number;
  qualityScore?: number;
  artifacts: string[];
  command?: string;
}

interface PipelineStageGraphProps {
  stages: PipelineStageResult[];
  onRetryStage?: (stageName: string) => void;
  isRetrying?: boolean;
}

export function PipelineStageGraph({ stages, onRetryStage, isRetrying }: PipelineStageGraphProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const selectedStage = stages[selectedIdx] || stages[0];

  const getNodeStyle = (status: string, isSelected: boolean) => {
    const selectedRing = isSelected ? "ring-2 ring-cyan-400/70 border-cyan-400/70" : "";
    switch (status) {
      case "PASSED":
        return `border-emerald-500/35 bg-emerald-500/5 text-emerald-300 ${selectedRing}`;
      case "RUNNING":
        return `border-cyan-400/60 bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/30 ${selectedRing}`;
      case "FAILED":
        return `border-rose-500/45 bg-rose-500/10 text-rose-300 ${selectedRing}`;
      case "CANCELLED":
        return `border-amber-500/35 bg-amber-500/5 text-amber-300 ${selectedRing}`;
      case "SKIPPED":
        return `border-[#1e2433] bg-[#0b0f18] text-slate-500 opacity-70 ${selectedRing}`;
      default:
        return `border-[#1e2433] bg-[#0d121d] text-slate-400 ${selectedRing}`;
    }
  };

  const renderIcon = (status: string) => {
    switch (status) {
      case "PASSED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "RUNNING":
        return <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case "CANCELLED":
        return <Ban className="w-4 h-4 text-amber-400" />;
      case "SKIPPED":
        return <SkipForward className="w-4 h-4 text-slate-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Living Horizontal Flow Timeline */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-0 min-w-max">
          {stages.map((stage, idx) => (
            <React.Fragment key={`${stage.name}-${idx}`}>
              <button
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`card-3d text-left w-44 p-3.5 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${getNodeStyle(
                  stage.status,
                  idx === selectedIdx
                )}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    0{idx + 1} · {stage.type}
                  </span>
                  {renderIcon(stage.status)}
                </div>

                <div className="text-xs font-extrabold text-white truncate">{stage.name}</div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  <span>{(stage.durationMs / 1000).toFixed(2)}s</span>
                  {stage.qualityScore !== undefined && stage.qualityScore !== null ? (
                    <span className="text-cyan-400 font-bold">{stage.qualityScore}/100</span>
                  ) : (
                    <span>{stage.status}</span>
                  )}
                </div>
              </button>

              {idx < stages.length - 1 && (
                <div className="w-10 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 40 12" className="w-10 h-3">
                    <line
                      x1="0"
                      y1="6"
                      x2="40"
                      y2="6"
                      stroke={
                        stage.status === "PASSED"
                          ? "#10b981"
                          : stage.status === "RUNNING"
                          ? "#22d3ee"
                          : stage.status === "FAILED"
                          ? "#f43f5e"
                          : "#334155"
                      }
                      strokeWidth="2"
                      className={
                        stage.status === "RUNNING" || stage.status === "PASSED" ? "conduit-flow" : ""
                      }
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Selected Stage Floating Detail Panel */}
      {selectedStage && (
        <div className="layer-float rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {renderIcon(selectedStage.status)}
              <span className="text-sm font-extrabold text-white">{selectedStage.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#0a0e17] border border-[#222c40] text-slate-300">
                {selectedStage.status}
              </span>
            </div>
            {selectedStage.command && (
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedStage.command}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400">
              <span>Duration: {(selectedStage.durationMs / 1000).toFixed(2)}s</span>
              <span>Errors: {selectedStage.errorsCount}</span>
              <span>Warnings: {selectedStage.warningsCount}</span>
              {selectedStage.qualityScore !== undefined && selectedStage.qualityScore !== null && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Gate Score: {selectedStage.qualityScore}/100
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedStage.artifacts?.map((art, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-300"
              >
                <Package className="w-3.5 h-3.5" />
                {art}
              </span>
            ))}

            {selectedStage.status === "FAILED" && onRetryStage && (
              <button
                type="button"
                onClick={() => onRetryStage(selectedStage.name)}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/35 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Stage</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
