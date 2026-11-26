"use client";

import React from "react";
import Link from "next/link";
import {
  FolderGit2,
  Cpu,
  Code2,
  Shield,
  Sparkles,
  FlaskConical,
  Hammer,
  Rocket,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export type LifecycleNodeId =
  | "repository"
  | "analysis"
  | "quality"
  | "security"
  | "ai"
  | "tests"
  | "build"
  | "deploy";

export interface LifecycleNodeData {
  id: LifecycleNodeId;
  title: string;
  stageLabel: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "RUNNING" | "IDLE";
  score: number | null;
  metricLabel: string;
  metricValue: string;
  issuesDetected: number;
  lastExecution: string;
  trend: "up" | "down" | "flat";
  trendLabel: string;
  href: string;
  summary: string;
  highlights: string[];
}

interface LifecycleSystemMapProps {
  nodes: Record<LifecycleNodeId, LifecycleNodeData>;
  selectedNodeId: LifecycleNodeId | null;
  onSelectNode: (id: LifecycleNodeId) => void;
  onCloseDetail: () => void;
  isScanning?: boolean;
}

const NODE_ICONS: Record<LifecycleNodeId, React.ComponentType<{ className?: string }>> = {
  repository: FolderGit2,
  analysis: Cpu,
  quality: Code2,
  security: Shield,
  ai: Sparkles,
  tests: FlaskConical,
  build: Hammer,
  deploy: Rocket,
};

function statusRing(status: LifecycleNodeData["status"]) {
  switch (status) {
    case "HEALTHY":
      return "border-emerald-500/35 hover:border-emerald-400/70 bg-[#0d141d]";
    case "WARNING":
      return "border-amber-500/40 hover:border-amber-400/75 bg-[#141319]";
    case "CRITICAL":
      return "border-rose-500/45 hover:border-rose-400/80 bg-[#171018]";
    case "RUNNING":
      return "border-cyan-400/60 bg-[#0d1724] ring-1 ring-cyan-400/30";
    default:
      return "border-[#222b3e] hover:border-slate-500 bg-[#0e131e]";
  }
}

function statusDot(status: LifecycleNodeData["status"]) {
  switch (status) {
    case "HEALTHY":
      return "bg-emerald-400";
    case "WARNING":
      return "bg-amber-400";
    case "CRITICAL":
      return "bg-rose-400";
    case "RUNNING":
      return "bg-cyan-400 animate-ping";
    default:
      return "bg-slate-500";
  }
}

function TrendBadge({ trend, label }: { trend: "up" | "down" | "flat"; label: string }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-emerald-400">
        <TrendingUp className="w-3 h-3" />
        {label}
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-rose-400">
        <TrendingDown className="w-3 h-3" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400">
      <Minus className="w-3 h-3" />
      {label}
    </span>
  );
}

function MapNode({
  node,
  selected,
  onClick,
}: {
  node: LifecycleNodeData;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = NODE_ICONS[node.id];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card-3d card-3d-interactive text-left w-full p-3.5 rounded-2xl border transition-all relative ${statusRing(
        node.status
      )} ${selected ? "ring-2 ring-cyan-400/70 border-cyan-400/70 shadow-[0_0_26px_-8px_rgba(34,211,238,0.45)]" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#131b2b] border border-[#232f46] flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
              {node.stageLabel}
            </div>
            <div className="text-xs font-bold text-white truncate">{node.title}</div>
          </div>
        </div>
        <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(node.status)}`} />
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="text-lg font-extrabold font-mono text-white tabular-nums">
            {node.score !== null ? `${node.score}` : node.metricValue}
          </span>
          {node.score !== null && (
            <span className="text-[10px] font-mono text-slate-500 ml-0.5">/100</span>
          )}
        </div>
        <TrendBadge trend={node.trend} label={node.trendLabel} />
      </div>

      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="truncate">{node.metricLabel}</span>
        {node.issuesDetected > 0 ? (
          <span className="text-amber-400 font-bold shrink-0">{node.issuesDetected} issues</span>
        ) : (
          <span className="text-slate-500 shrink-0">{node.lastExecution}</span>
        )}
      </div>
    </button>
  );
}

export function LifecycleSystemMap({
  nodes,
  selectedNodeId,
  onSelectNode,
  onCloseDetail,
  isScanning,
}: LifecycleSystemMapProps) {
  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

  return (
    <div className="layer-environment rounded-3xl p-6 space-y-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-400">
            Interactive System Map
          </div>
          <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">
            CODE → ANALYZE → QUALITY → SECURITY → TEST → BUILD → DEPLOY
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0c121e] border border-[#1f293d]">
            <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? "bg-cyan-400 animate-ping" : "bg-emerald-400"}`} />
            {isScanning ? "Lifecycle Executing" : "Click any node to inspect"}
          </span>
        </div>
      </div>

      {/* Spatial Topology Grid with Animated Conduits */}
      <div className="relative">
        {/* Background SVG Flow Conduits (Desktop) */}
        <svg
          viewBox="0 0 900 320"
          preserveAspectRatio="none"
          className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Repo -> Analysis */}
          <line x1="175" y1="160" x2="235" y2="160" stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="2" className="conduit-flow" />
          {/* Analysis -> Quality (top branch) */}
          <path d="M 380 140 C 415 140, 415 58, 455 58" fill="none" stroke="#818cf8" strokeOpacity="0.4" strokeWidth="2" className="conduit-flow" />
          {/* Analysis -> Security (middle branch) */}
          <line x1="380" y1="160" x2="455" y2="160" stroke="#fb7185" strokeOpacity="0.4" strokeWidth="2" className="conduit-flow" />
          {/* Analysis -> AI Insights (bottom branch) */}
          <path d="M 380 180 C 415 180, 415 262, 455 262" fill="none" stroke="#a78bfa" strokeOpacity="0.4" strokeWidth="2" className="conduit-flow" />
          {/* Quality -> Tests */}
          <path d="M 615 58 C 655 58, 655 140, 690 140" fill="none" stroke="#34d399" strokeOpacity="0.35" strokeWidth="2" className="conduit-flow" />
          {/* Security -> Tests */}
          <line x1="615" y1="160" x2="690" y2="160" stroke="#34d399" strokeOpacity="0.35" strokeWidth="2" className="conduit-flow" />
          {/* AI -> Tests */}
          <path d="M 615 262 C 655 262, 655 180, 690 180" fill="none" stroke="#34d399" strokeOpacity="0.35" strokeWidth="2" className="conduit-flow" />
        </svg>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center relative z-10">
          {/* Column 1: Repository */}
          <div>
            <MapNode
              node={nodes.repository}
              selected={selectedNodeId === "repository"}
              onClick={() => onSelectNode("repository")}
            />
          </div>

          {/* Column 2: Analysis */}
          <div>
            <MapNode
              node={nodes.analysis}
              selected={selectedNodeId === "analysis"}
              onClick={() => onSelectNode("analysis")}
            />
          </div>

          {/* Column 3: Branching Quality / Security / AI Insights */}
          <div className="space-y-3">
            <MapNode
              node={nodes.quality}
              selected={selectedNodeId === "quality"}
              onClick={() => onSelectNode("quality")}
            />
            <MapNode
              node={nodes.security}
              selected={selectedNodeId === "security"}
              onClick={() => onSelectNode("security")}
            />
            <MapNode
              node={nodes.ai}
              selected={selectedNodeId === "ai"}
              onClick={() => onSelectNode("ai")}
            />
          </div>

          {/* Column 4: Tests -> Build -> Deploy */}
          <div className="space-y-3">
            <MapNode
              node={nodes.tests}
              selected={selectedNodeId === "tests"}
              onClick={() => onSelectNode("tests")}
            />
            <MapNode
              node={nodes.build}
              selected={selectedNodeId === "build"}
              onClick={() => onSelectNode("build")}
            />
            <MapNode
              node={nodes.deploy}
              selected={selectedNodeId === "deploy"}
              onClick={() => onSelectNode("deploy")}
            />
          </div>
        </div>
      </div>

      {/* Layer 4: Floating Detail Panel when a node is selected */}
      {selectedNode && (
        <div className="layer-float rounded-2xl p-5 animate-fade-up space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
                  {selectedNode.stageLabel} Inspector
                </span>
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {selectedNode.lastExecution}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white">{selectedNode.title}</h3>
              <p className="text-xs text-slate-300 max-w-2xl">{selectedNode.summary}</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={selectedNode.href}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 transition-colors"
              >
                <span>Open Workspace</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={onCloseDetail}
                aria-label="Close stage inspector"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/5">
            {selectedNode.highlights.map((item, idx) => (
              <div
                key={idx}
                className="px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-[#1d273b] flex items-start gap-2 text-xs text-slate-300"
              >
                {selectedNode.issuesDetected > 0 && idx === 0 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                )}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
