"use client";

import React, { useState, useMemo } from "react";
import {
  Terminal,
  Search,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

export interface PipelineLogEntry {
  timestamp: string;
  stage: string;
  level: string;
  command?: string;
  message: string;
}

interface TerminalLogViewerProps {
  logs: PipelineLogEntry[];
  runNumber?: number;
}

export function TerminalLogViewer({ logs, runNumber }: TerminalLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [copied, setCopied] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});

  const stageNames = useMemo(() => {
    const names = Array.from(new Set(logs.map((l) => l.stage)));
    return ["ALL", ...names];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (selectedLevel !== "ALL" && l.level !== selectedLevel) return false;
      if (selectedStage !== "ALL" && l.stage !== selectedStage) return false;
      if (
        searchQuery.trim() &&
        !l.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(l.command || "").toLowerCase().includes(searchQuery.toLowerCase()) &&
        !l.stage.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [logs, selectedLevel, selectedStage, searchQuery]);

  const groupedByStage = useMemo(() => {
    const map = new Map<string, PipelineLogEntry[]>();
    for (const log of filteredLogs) {
      const arr = map.get(log.stage) || [];
      arr.push(log);
      map.set(log.stage, arr);
    }
    return Array.from(map.entries());
  }, [filteredLogs]);

  const formatRawLogs = () =>
    filteredLogs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level}] [${l.stage}]${l.command ? ` ($ ${l.command})` : ""} ${l.message}`
      )
      .join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(formatRawLogs());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formatRawLogs()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devpilot-pipeline-run-${runNumber || "latest"}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleStageCollapse = (stage: string) => {
    setCollapsedStages((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "ERROR":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "WARN":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "CMD":
        return "text-violet-400 bg-violet-500/10 border-violet-500/20";
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <div className="card-3d rounded-3xl bg-[#0c0f16] border border-[#1e2433] overflow-hidden">
      {/* Terminal Toolbar */}
      <div className="p-4 border-b border-[#1e2433] bg-[#11151e] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Terminal className="w-4 h-4 text-violet-400" />
          <span>Pipeline Execution Logs</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#161b26] text-slate-400 border border-[#1e2433]">
            {filteredLogs.length} lines
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#090b10] border border-[#1e2433] text-slate-200 outline-none focus:border-violet-500"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-[#090b10] border border-[#1e2433] text-slate-300 outline-none"
          >
            {["ALL", "INFO", "CMD", "WARN", "ERROR"].map((lvl) => (
              <option key={lvl} value={lvl}>
                Level: {lvl}
              </option>
            ))}
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-[#090b10] border border-[#1e2433] text-slate-300 outline-none"
          >
            {stageNames.map((st) => (
              <option key={st} value={st}>
                Stage: {st}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161b26] hover:bg-[#1d2433] text-slate-300 border border-[#1e2433] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161b26] hover:bg-[#1d2433] text-slate-300 border border-[#1e2433] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Log Output Sections */}
      <div className="p-4 max-h-[380px] overflow-y-auto font-mono text-[11px] space-y-2.5">
        {groupedByStage.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No logs match the current filter.
          </div>
        ) : (
          groupedByStage.map(([stage, entries]) => {
            const isCollapsed = !!collapsedStages[stage];
            return (
              <div key={stage} className="rounded-xl border border-[#1e2433] bg-[#090b10] overflow-hidden">
                <button
                  onClick={() => toggleStageCollapse(stage)}
                  className="w-full px-3 py-2 bg-[#11151e] flex items-center justify-between text-left hover:bg-[#161b26] transition-colors"
                >
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{stage}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{entries.length} entries</span>
                </button>

                {!isCollapsed && (
                  <div className="p-3 space-y-1.5">
                    {entries.map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-slate-600 shrink-0">
                          {entry.timestamp.includes("T")
                            ? entry.timestamp.split("T")[1].slice(0, 8)
                            : entry.timestamp}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${getLevelBadge(
                            entry.level
                          )}`}
                        >
                          {entry.level}
                        </span>
                        <div className="min-w-0 break-all">
                          {entry.level === "CMD" && entry.command && (
                            <span className="text-violet-400 font-bold mr-2">$ {entry.command}</span>
                          )}
                          <span
                            className={
                              entry.level === "ERROR"
                                ? "text-rose-300"
                                : entry.level === "WARN"
                                ? "text-amber-300"
                                : "text-slate-300"
                            }
                          >
                            {entry.message}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
