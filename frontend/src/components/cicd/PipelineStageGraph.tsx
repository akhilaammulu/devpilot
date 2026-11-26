"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  SkipForward,
  Ban,
  Package,
  RotateCcw,
  ArrowRight,
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
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PASSED":
        return "border-emerald-500/30 bg-emerald-500/5 text-emerald-400";
      case "RUNNING":
        return "border-violet-500/50 bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/30";
      case "FAILED":
        return "border-rose-500/40 bg-rose-500/10 text-rose-400";
      case "CANCELLED":
        return "border-amber-500/30 bg-amber-500/5 text-amber-400";
      case "SKIPPED":
        return "border-[#1e2433] bg-[#0d1017] text-slate-500 opacity-65";
      default: // QUEUED
        return "border-[#1e2433] bg-[#11151e] text-slate-400";
    }
  };

  const renderIcon = (status: string) => {
    switch (status) {
      case "PASSED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "RUNNING":
        return <RefreshCw className="w-4 h-4 text-violet-400 animate-spin" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case "CANCELLED":
        return <Ban className="w-4 h-4 text-amber-400" />;
      case "SKIPPED":
        return <SkipForward className="w-4 h-4 text-slate-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch gap-2 min-w-max">
        {stages.map((stage, idx) => (
          <React.Fragment key={`${stage.name}-${idx}`}>
            <div
              className={`card-3d w-48 p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all ${getStatusStyle(
                stage.status
              )}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-100 truncate">{stage.name}</span>
                {renderIcon(stage.status)}
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Status</span>
                  <span className="font-mono font-bold">{stage.status}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Duration</span>
                  <span className="font-mono">{(stage.durationMs / 1000).toFixed(2)}s</span>
                </div>
                {stage.qualityScore !== undefined && stage.qualityScore !== null && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Score</span>
                    <span className="font-mono font-bold text-violet-300">{stage.qualityScore}/100</span>
                  </div>
                )}
                {stage.warningsCount > 0 && (
                  <div className="flex items-center justify-between text-amber-400">
                    <span>Findings</span>
                    <span className="font-mono font-bold">{stage.warningsCount}</span>
                  </div>
                )}
              </div>

              {stage.artifacts && stage.artifacts.length > 0 && (
                <div className="pt-1.5 border-t border-[#1e2433] flex items-center gap-1 text-[10px] font-mono text-emerald-300 truncate">
                  <Package className="w-3 h-3 shrink-0" />
                  <span className="truncate">{stage.artifacts[0]}</span>
                </div>
              )}

              {stage.status === "FAILED" && onRetryStage && (
                <button
                  onClick={() => onRetryStage(stage.name)}
                  disabled={isRetrying}
                  className="w-full mt-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry Stage</span>
                </button>
              )}
            </div>

            {idx < stages.length - 1 && (
              <div className="flex items-center justify-center px-0.5">
                <div
                  className={`w-6 h-0.5 rounded-full transition-all ${
                    stage.status === "PASSED"
                      ? "bg-emerald-500/60"
                      : stage.status === "RUNNING"
                      ? "bg-violet-500 animate-pulse"
                      : stage.status === "FAILED"
                      ? "bg-rose-500/60"
                      : "bg-[#1e2433]"
                  }`}
                />
                <ArrowRight
                  className={`w-3.5 h-3.5 -ml-1 ${
                    stage.status === "PASSED"
                      ? "text-emerald-400"
                      : stage.status === "RUNNING"
                      ? "text-violet-400"
                      : "text-slate-600"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
