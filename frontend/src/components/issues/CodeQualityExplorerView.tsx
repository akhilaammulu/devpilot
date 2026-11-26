"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Code2,
  Folder,
  FolderOpen,
  FileCode,
  ChevronRight,
  ChevronDown,
  Search,
  Sparkles,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Layers,
  Terminal,
  Check,
} from "lucide-react";
import { MOCK_ISSUES, CodeIssue, SeverityType, ToolType } from "@/data/mockIssues";
import { IssueDetailDrawer } from "./IssueDetailDrawer";
import { GET_REPOSITORIES, START_SCAN, UPDATE_ISSUE_STATUS } from "@/lib/graphql/queries";

interface EngineReport {
  engine: string;
  status: string;
  findingsCount: number;
  executionTimeMs: number;
  message?: string;
}

interface TreeFileNode {
  filePath: string;
  fileName: string;
  issues: CodeIssue[];
}

interface TreeModuleNode {
  name: string;
  files: TreeFileNode[];
  issueCount: number;
}

interface TreeLayerNode {
  name: "Backend" | "Frontend" | "Infrastructure";
  modules: TreeModuleNode[];
  issueCount: number;
}

function classifyLayer(filePath: string): "Backend" | "Frontend" | "Infrastructure" {
  const lower = filePath.toLowerCase();
  if (lower.includes("frontend/") || lower.endsWith(".tsx") || lower.endsWith(".ts") || lower.endsWith(".jsx") || lower.endsWith(".css")) {
    return "Frontend";
  }
  if (
    lower.includes("docker") ||
    lower.includes("k8s") ||
    lower.includes("kubernetes") ||
    lower.includes(".github") ||
    lower.endsWith(".yml") ||
    lower.endsWith(".yaml")
  ) {
    return "Infrastructure";
  }
  return "Backend";
}

function extractModuleName(filePath: string): string {
  const parts = filePath.split("/").filter(Boolean);
  if (parts.length >= 2) {
    const idx = parts.findIndex((p) => p === "devpilot" || p === "src" || p === "components" || p === "app");
    if (idx !== -1 && parts[idx + 1]) {
      return parts[idx + 1];
    }
    return parts[parts.length - 2];
  }
  return "root";
}

export function CodeQualityExplorerView() {
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedTool, setSelectedTool] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("OPEN");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeIssue, setActiveIssue] = useState<CodeIssue | null>(null);
  const [engineReports, setEngineReports] = useState<EngineReport[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");

  // Tree navigation state
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({
    Backend: true,
    Frontend: true,
    Infrastructure: true,
  });
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [selectedModuleKey, setSelectedModuleKey] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const { data: repoData, refetch: refetchRepos } = useQuery(GET_REPOSITORIES, {
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  });

  const [startScanMutation] = useMutation(START_SCAN);
  const [updateStatusMutation] = useMutation(UPDATE_ISSUE_STATUS);

  useEffect(() => {
    if (repoData && repoData.repositories && repoData.repositories.length > 0) {
      const repo = repoData.repositories[0];
      setSelectedRepoId(repo.id);

      if (repo.scans && repo.scans.length > 0) {
        const latestScan = repo.scans[0];
        if (latestScan.engineReports) {
          setEngineReports(latestScan.engineReports);
        }
        if (latestScan.issues && latestScan.issues.length > 0) {
          const mappedIssues: CodeIssue[] = latestScan.issues.map((iss: any) => ({
            id: iss.id,
            tool: (iss.engine === "CHECKSTYLE"
              ? "Checkstyle"
              : iss.engine === "PMD"
              ? "PMD"
              : iss.engine === "SPOTBUGS"
              ? "SpotBugs"
              : "ESLint") as ToolType,
            language: (iss.language || (iss.engine === "ESLINT" ? "TypeScript" : "Java")) as
              | "Java"
              | "TypeScript",
            severity: iss.severity as SeverityType,
            ruleId: iss.ruleId,
            filePath: iss.filePath,
            lineStart: iss.startLine || iss.lineStart || 1,
            lineEnd: iss.endLine || iss.lineEnd || 1,
            message: iss.message,
            codeSnippet: iss.snippet || `${iss.startLine || 1}: // Source code location\n${iss.message}`,
            aiExplanation: iss.aiExplanation || "Automated static analysis finding detected during repository scan.",
            proposedFix: iss.aiFixSuggestion || "// Inspect and conform to code quality guidelines.",
            aiWhyItMatters: iss.aiWhyItMatters,
            aiSuggestedUnitTest: iss.aiSuggestedUnitTest,
            aiModelUsed: iss.aiModelUsed,
            status: (iss.status || "OPEN") as "OPEN" | "RESOLVED",
          }));
          setIssues(mappedIssues);
          return;
        }
      }
    }

    if (issues.length === 0) {
      setIssues(MOCK_ISSUES);
      setEngineReports([
        { engine: "SpotBugs", status: "COMPLETED", findingsCount: 2, executionTimeMs: 180 },
        { engine: "PMD", status: "COMPLETED", findingsCount: 2, executionTimeMs: 240 },
        { engine: "Checkstyle", status: "COMPLETED", findingsCount: 2, executionTimeMs: 310 },
        { engine: "ESLint", status: "COMPLETED", findingsCount: 2, executionTimeMs: 420 },
      ]);
    }
  }, [repoData, issues.length]);

  const handleStartRealScan = async () => {
    setIsScanning(true);
    try {
      let repoId = selectedRepoId;
      if (!repoId && repoData?.repositories?.length > 0) {
        repoId = repoData.repositories[0].id;
      }
      if (!repoId) {
        repoId = "bd8f2564-cd45-4d64-aa15-1719da0df96b";
      }

      const res = await startScanMutation({
        variables: {
          input: {
            repositoryId: repoId,
            branchName: "main",
            commitSha: "HEAD",
          },
        },
      });

      if (res.data?.startScan) {
        const scan = res.data.startScan;
        if (scan.engineReports) {
          setEngineReports(scan.engineReports);
        }
        if (scan.issues && scan.issues.length > 0) {
          const mappedIssues: CodeIssue[] = scan.issues.map((iss: any) => ({
            id: iss.id,
            tool: (iss.engine === "CHECKSTYLE"
              ? "Checkstyle"
              : iss.engine === "PMD"
              ? "PMD"
              : iss.engine === "SPOTBUGS"
              ? "SpotBugs"
              : "ESLint") as ToolType,
            language: (iss.language || (iss.engine === "ESLINT" ? "TypeScript" : "Java")) as
              | "Java"
              | "TypeScript",
            severity: iss.severity as SeverityType,
            ruleId: iss.ruleId,
            filePath: iss.filePath,
            lineStart: iss.startLine || 1,
            lineEnd: iss.endLine || 1,
            message: iss.message,
            codeSnippet: iss.snippet || `${iss.startLine || 1}: // Scan finding\n${iss.message}`,
            aiExplanation: iss.aiExplanation || "Real scanner finding detected during automated pipeline execution.",
            proposedFix: iss.aiFixSuggestion || "// Apply static analysis remediation.",
            status: (iss.status || "OPEN") as "OPEN" | "RESOLVED",
          }));
          setIssues(mappedIssues);
        }
      }
      await refetchRepos();
    } catch (err) {
      console.warn("Real scan execution fallback:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleResolve = async (id: string) => {
    const target = issues.find((i) => i.id === id);
    const nextStatus = target?.status === "RESOLVED" ? "OPEN" : "RESOLVED";

    setIssues((prev) => prev.map((iss) => (iss.id === id ? { ...iss, status: nextStatus } : iss)));
    if (activeIssue && activeIssue.id === id) {
      setActiveIssue((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    try {
      await updateStatusMutation({
        variables: { id, status: nextStatus },
      });
    } catch (e) {
      console.debug("Persisted issue status toggle locally.");
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSeverity = selectedSeverity === "ALL" || issue.severity === selectedSeverity;
      const matchTool = selectedTool === "ALL" || issue.tool.toUpperCase() === selectedTool.toUpperCase();
      const matchStatus = selectedStatus === "ALL" || issue.status === selectedStatus;
      const matchSearch =
        searchQuery.trim() === "" ||
        issue.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.ruleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.filePath.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchTool && matchStatus && matchSearch;
    });
  }, [issues, selectedSeverity, selectedTool, selectedStatus, searchQuery]);

  // Build hierarchical Project -> Layer -> Module -> File -> Issues tree
  const treeLayers: TreeLayerNode[] = useMemo(() => {
    const layerOrder: Array<"Backend" | "Frontend" | "Infrastructure"> = [
      "Backend",
      "Frontend",
      "Infrastructure",
    ];
    const layerMap = new Map<string, Map<string, Map<string, CodeIssue[]>>>();
    for (const l of layerOrder) {
      layerMap.set(l, new Map());
    }

    for (const iss of filteredIssues) {
      const layer = classifyLayer(iss.filePath);
      const mod = extractModuleName(iss.filePath);
      const modMap = layerMap.get(layer)!;
      if (!modMap.has(mod)) modMap.set(mod, new Map());
      const fileMap = modMap.get(mod)!;
      if (!fileMap.has(iss.filePath)) fileMap.set(iss.filePath, []);
      fileMap.get(iss.filePath)!.push(iss);
    }

    return layerOrder
      .map((layerName) => {
        const modMap = layerMap.get(layerName)!;
        const modules: TreeModuleNode[] = Array.from(modMap.entries())
          .map(([modName, fileMap]) => {
            const files: TreeFileNode[] = Array.from(fileMap.entries())
              .map(([filePath, fileIssues]) => ({
                filePath,
                fileName: filePath.split("/").pop() || filePath,
                issues: fileIssues,
              }))
              .sort((a, b) => b.issues.length - a.issues.length);

            return {
              name: modName,
              files,
              issueCount: files.reduce((sum, f) => sum + f.issues.length, 0),
            };
          })
          .sort((a, b) => b.issueCount - a.issueCount);

        return {
          name: layerName,
          modules,
          issueCount: modules.reduce((sum, m) => sum + m.issueCount, 0),
        };
      })
      .filter((l) => l.issueCount > 0);
  }, [filteredIssues]);

  // Auto-select first file if none selected
  useEffect(() => {
    if (!selectedFilePath && treeLayers.length > 0) {
      const firstLayer = treeLayers[0];
      const firstMod = firstLayer.modules[0];
      const firstFile = firstMod?.files[0];
      if (firstFile) {
        setSelectedLayer(firstLayer.name);
        const modKey = `${firstLayer.name}:${firstMod.name}`;
        setSelectedModuleKey(modKey);
        setExpandedModules((prev) => ({ ...prev, [modKey]: true }));
        setSelectedFilePath(firstFile.filePath);
      }
    }
  }, [treeLayers, selectedFilePath]);

  const inspectedIssues = useMemo(() => {
    if (selectedFilePath) {
      return filteredIssues.filter((i) => i.filePath === selectedFilePath);
    }
    if (selectedModuleKey) {
      const [layer, mod] = selectedModuleKey.split(":");
      return filteredIssues.filter(
        (i) => classifyLayer(i.filePath) === layer && extractModuleName(i.filePath) === mod
      );
    }
    if (selectedLayer) {
      return filteredIssues.filter((i) => classifyLayer(i.filePath) === selectedLayer);
    }
    return filteredIssues.slice(0, 25);
  }, [filteredIssues, selectedFilePath, selectedModuleKey, selectedLayer]);

  const repoName = repoData?.repositories?.[0]?.fullName || "akhilaammulu/devpilot";

  const severityBadge = (sev: SeverityType) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Intelligence Workspace Header */}
      <div className="layer-environment rounded-3xl px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-up">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-indigo-400">
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Intelligence Workspace</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Project → Module → File → Function → Issue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {repoName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {engineReports.slice(0, 4).map((rep) => (
            <span
              key={rep.engine}
              className="px-2.5 py-1.5 rounded-xl bg-[#090d16] border border-[#1d273b] text-[10px] font-mono text-slate-300"
            >
              {rep.engine}
            </span>
          ))}
          <button
            onClick={handleStartRealScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_-6px_rgba(99,102,241,0.65)] disabled:opacity-50 transition-all"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Code Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="layer-environment rounded-2xl p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by file, rule, or message..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#090d16] border border-[#1d273b] text-xs font-mono text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/60"
          />
        </div>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#090d16] border border-[#1d273b] text-xs font-mono text-slate-300 outline-none"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#090d16] border border-[#1d273b] text-xs font-mono text-slate-300 outline-none"
        >
          <option value="ALL">All Engines</option>
          <option value="Checkstyle">Checkstyle</option>
          <option value="PMD">PMD</option>
          <option value="SpotBugs">SpotBugs</option>
          <option value="ESLint">ESLint</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#090d16] border border-[#1d273b] text-xs font-mono text-slate-300 outline-none"
        >
          <option value="OPEN">Open ({issues.filter((i) => i.status === "OPEN").length})</option>
          <option value="RESOLVED">Resolved ({issues.filter((i) => i.status === "RESOLVED").length})</option>
          <option value="ALL">All ({issues.length})</option>
        </select>
      </div>

      {/* Main Split Intelligence Workspace: Expandable System Tree + Progressive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hierarchical System Tree */}
        <div className="lg:col-span-5 layer-environment rounded-3xl p-4 space-y-2 max-h-[680px] overflow-y-auto">
          <div className="px-2 py-1.5 flex items-center justify-between border-b border-white/5 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              System Hierarchy
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {filteredIssues.length} findings
            </span>
          </div>

          {treeLayers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No matching findings in hierarchy.
            </div>
          ) : (
            <div className="space-y-1.5">
              {treeLayers.map((layer) => {
                const isLayerOpen = !!expandedLayers[layer.name];
                return (
                  <div key={layer.name} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedLayers((prev) => ({ ...prev, [layer.name]: !prev[layer.name] }));
                        setSelectedLayer(layer.name);
                        setSelectedModuleKey(null);
                        setSelectedFilePath(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                        selectedLayer === layer.name && !selectedModuleKey
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                          : "text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isLayerOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        {isLayerOpen ? (
                          <FolderOpen className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Folder className="w-4 h-4 text-cyan-400" />
                        )}
                        <span>{layer.name}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#090d16] text-slate-400">
                        {layer.issueCount}
                      </span>
                    </button>

                    {isLayerOpen && (
                      <div className="pl-4 space-y-1 border-l border-[#1e2638] ml-4">
                        {layer.modules.map((mod) => {
                          const modKey = `${layer.name}:${mod.name}`;
                          const isModOpen = !!expandedModules[modKey];
                          return (
                            <div key={modKey} className="space-y-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedModules((prev) => ({ ...prev, [modKey]: !prev[modKey] }));
                                  setSelectedLayer(layer.name);
                                  setSelectedModuleKey(modKey);
                                  setSelectedFilePath(null);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                  selectedModuleKey === modKey && !selectedFilePath
                                    ? "bg-indigo-500/15 text-indigo-300"
                                    : "text-slate-300 hover:bg-white/5"
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  {isModOpen ? (
                                    <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                                  )}
                                  <span className="truncate font-mono">{mod.name}</span>
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                  {mod.issueCount}
                                </span>
                              </button>

                              {isModOpen && (
                                <div className="pl-4 space-y-0.5 border-l border-[#1a2132] ml-3">
                                  {mod.files.map((file) => (
                                    <button
                                      key={file.filePath}
                                      type="button"
                                      onClick={() => {
                                        setSelectedLayer(layer.name);
                                        setSelectedModuleKey(modKey);
                                        setSelectedFilePath(file.filePath);
                                      }}
                                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-colors ${
                                        selectedFilePath === file.filePath
                                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                      }`}
                                    >
                                      <span className="flex items-center gap-1.5 truncate">
                                        <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                        <span className="truncate">{file.fileName}</span>
                                      </span>
                                      <span className="text-[10px] text-amber-400 font-bold shrink-0 ml-2">
                                        {file.issues.length}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Progressive Code Intelligence Inspector */}
        <div className="lg:col-span-7 layer-float rounded-3xl p-6 space-y-4 max-h-[680px] overflow-y-auto">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 flex-wrap">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300">{repoName.split("/").pop()}</span>
              {selectedLayer && (
                <>
                  <span>/</span>
                  <span className="text-cyan-300">{selectedLayer}</span>
                </>
              )}
              {selectedModuleKey && (
                <>
                  <span>/</span>
                  <span className="text-indigo-300">{selectedModuleKey.split(":")[1]}</span>
                </>
              )}
              {selectedFilePath && (
                <>
                  <span>/</span>
                  <span className="text-white font-bold">{selectedFilePath.split("/").pop()}</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {inspectedIssues.length} finding(s) in scope
            </span>
          </div>

          {/* Progressive Issue Cards */}
          <div className="space-y-3">
            {inspectedIssues.slice(0, 40).map((issue) => (
              <div
                key={issue.id}
                className="rounded-2xl p-4 bg-[#090d16] border border-[#1d273b] hover:border-indigo-500/40 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${severityBadge(
                          issue.severity
                        )}`}
                      >
                        {issue.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#131a29] text-slate-300 border border-[#232f46]">
                        {issue.tool}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        Line {issue.lineStart}
                        {issue.lineEnd && issue.lineEnd !== issue.lineStart ? `–${issue.lineEnd}` : ""}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{issue.ruleId}</span>
                    </div>
                    <div className="text-xs font-bold text-white leading-snug">{issue.message}</div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {issue.filePath}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleResolve(issue.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                        issue.status === "RESOLVED"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-[#121927] text-slate-300 border-[#243047] hover:border-emerald-500/40"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {issue.status === "RESOLVED" ? "Resolved" : "Resolve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveIssue(issue)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Inspect &amp; AI Fix</span>
                    </button>
                  </div>
                </div>

                {issue.codeSnippet && (
                  <pre className="p-3 rounded-xl bg-[#05070c] border border-[#182032] text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {issue.codeSnippet}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeIssue && (
        <IssueDetailDrawer
          issue={activeIssue}
          onClose={() => setActiveIssue(null)}
          onToggleResolve={toggleResolve}
        />
      )}
    </div>
  );
}
