"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_REPOSITORIES,
  GET_PIPELINE_METRICS,
  GET_PIPELINES,
  GET_PIPELINE_RUNS,
  GET_PIPELINE_DEPLOYMENTS,
  GET_PIPELINE_SECRETS,
  CREATE_PIPELINE,
  RUN_PIPELINE,
  RETRY_PIPELINE_STAGE,
  CANCEL_PIPELINE_RUN,
  DEPLOY_PIPELINE_RUN,
  ROLLBACK_DEPLOYMENT,
  SAVE_PIPELINE_SECRET,
  DELETE_PIPELINE_SECRET,
} from "@/lib/graphql/queries";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { TiltCard } from "@/components/ui/TiltCard";
import { PipelineStageGraph } from "@/components/cicd/PipelineStageGraph";
import { TerminalLogViewer } from "@/components/cicd/TerminalLogViewer";
import { VisualPipelineDesignerModal } from "@/components/cicd/VisualPipelineDesignerModal";
import {
  Workflow,
  Play,
  Plus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Rocket,
  ShieldCheck,
  ShieldAlert,
  History,
  KeyRound,
  Trash2,
  RotateCcw,
  GitBranch,
  Ban,
  AlertTriangle,
  Lock,
} from "lucide-react";

export default function PipelinesPage() {
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"execution" | "history" | "deployments" | "secrets">("execution");
  const [showDesignerModal, setShowDesignerModal] = useState(false);

  // Production confirmation modal
  const [pendingProdDeployRunId, setPendingProdDeployRunId] = useState<string | null>(null);

  // Secret form state
  const [secretName, setSecretName] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [secretScope, setSecretScope] = useState("ALL");

  const { data: repoData } = useQuery(GET_REPOSITORIES, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  });

  useEffect(() => {
    if (repoData?.repositories?.length > 0 && !selectedRepoId) {
      setSelectedRepoId(repoData.repositories[0].id);
    }
  }, [repoData, selectedRepoId]);

  const { data: metricsData, refetch: refetchMetrics } = useQuery(GET_PIPELINE_METRICS, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  });

  const { data: pipelinesData, refetch: refetchPipelines } = useQuery(GET_PIPELINES, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  });

  const pipelines = useMemo(() => pipelinesData?.pipelines || [], [pipelinesData]);

  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [pipelines, selectedPipelineId]);

  const { data: runsData, refetch: refetchRuns } = useQuery(GET_PIPELINE_RUNS, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
    pollInterval: 1500,
  });

  const { data: deploymentsData, refetch: refetchDeployments } = useQuery(GET_PIPELINE_DEPLOYMENTS, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  });

  const { data: secretsData, refetch: refetchSecrets } = useQuery(GET_PIPELINE_SECRETS, {
    variables: { repositoryId: selectedRepoId },
    skip: !selectedRepoId,
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  });

  const [createPipelineMut, { loading: isCreating }] = useMutation(CREATE_PIPELINE);
  const [runPipelineMut, { loading: isStartingRun }] = useMutation(RUN_PIPELINE);
  const [retryStageMut, { loading: isRetrying }] = useMutation(RETRY_PIPELINE_STAGE);
  const [cancelRunMut] = useMutation(CANCEL_PIPELINE_RUN);
  const [deployRunMut, { loading: isDeploying }] = useMutation(DEPLOY_PIPELINE_RUN);
  const [rollbackMut] = useMutation(ROLLBACK_DEPLOYMENT);
  const [saveSecretMut] = useMutation(SAVE_PIPELINE_SECRET);
  const [deleteSecretMut] = useMutation(DELETE_PIPELINE_SECRET);

  const runs = useMemo(() => runsData?.pipelineRuns || [], [runsData]);
  const activeRun = useMemo(() => {
    if (runs.length === 0) return null;
    if (selectedRunId) {
      return runs.find((r: any) => r.id === selectedRunId) || runs[0];
    }
    return runs[0];
  }, [runs, selectedRunId]);

  const metrics = metricsData?.pipelineMetrics;
  const deployments = deploymentsData?.pipelineDeployments || [];
  const secrets = secretsData?.pipelineSecrets || [];

  const activeRepoName =
    repoData?.repositories?.find((r: any) => r.id === selectedRepoId)?.fullName || "akhilaammulu/devpilot";

  const handleCreatePipeline = async (input: any) => {
    const res = await createPipelineMut({ variables: { input } });
    await refetchPipelines();
    await refetchMetrics();
    if (res.data?.createPipeline?.id) {
      setSelectedPipelineId(res.data.createPipeline.id);
    }
    setShowDesignerModal(false);
  };

  const handleRunPipeline = async () => {
    let targetPipelineId = selectedPipelineId;
    if (!targetPipelineId && selectedRepoId) {
      // Auto-create default pipeline on first click if none exists yet
      const created = await createPipelineMut({
        variables: {
          input: {
            repositoryId: selectedRepoId,
            name: "DevPilot Main CI/CD",
            branch: "main",
            language: "Java",
            buildTool: "Maven",
            testFramework: "JUnit 5",
            environment: "Development",
            deploymentTarget: "AWS ECS",
            triggers: ["PUSH", "PULL_REQUEST", "MANUAL"],
          },
        },
      });
      targetPipelineId = created.data?.createPipeline?.id;
      setSelectedPipelineId(targetPipelineId);
      await refetchPipelines();
    }
    if (!targetPipelineId) return;

    const res = await runPipelineMut({
      variables: {
        pipelineId: targetPipelineId,
        triggerType: "MANUAL",
        commitSha: Math.random().toString(16).substring(2, 9),
      },
    });
    if (res.data?.runPipeline?.id) {
      setSelectedRunId(res.data.runPipeline.id);
    }
    setActiveTab("execution");
    await Promise.all([refetchRuns(), refetchMetrics(), refetchDeployments()]);
  };

  const handleDeploy = async (runId: string, env: string) => {
    if (env === "PRODUCTION") {
      setPendingProdDeployRunId(runId);
      return;
    }
    await deployRunMut({ variables: { runId, environment: env } });
    await Promise.all([refetchDeployments(), refetchMetrics()]);
  };

  const confirmProdDeploy = async () => {
    if (!pendingProdDeployRunId) return;
    await deployRunMut({ variables: { runId: pendingProdDeployRunId, environment: "PRODUCTION" } });
    setPendingProdDeployRunId(null);
    await Promise.all([refetchDeployments(), refetchMetrics()]);
  };

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepoId || !secretName.trim() || !secretValue.trim()) return;
    await saveSecretMut({
      variables: {
        repositoryId: selectedRepoId,
        name: secretName.trim(),
        value: secretValue,
        scope: secretScope,
      },
    });
    setSecretName("");
    setSecretValue("");
    await refetchSecrets();
  };

  const getRunBadge = (status: string) => {
    switch (status) {
      case "PASSED":
      case "DEPLOYED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "RUNNING":
      case "QUEUED":
        return "bg-violet-500/10 text-violet-300 border-violet-500/30";
      case "FAILED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/25";
      case "CANCELLED":
      case "ROLLED_BACK":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/25";
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-[#f4f6fb] dark:bg-[#090b10] text-slate-900 dark:text-slate-100">
      <Header currentPhase="CI/CD Pipeline Integration" />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Top Header */}
          <div className="animate-fade-up card-3d flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#11151e] p-6 rounded-3xl border border-slate-200/80 dark:border-[#1e2433]">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Link href="/" className="hover:text-slate-200">
                  Dashboard
                </Link>
                <span>&gt;</span>
                <span className="text-violet-400 font-semibold">CI/CD Pipelines</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <Workflow className="w-6 h-6 text-violet-400" />
                <span>CI/CD Automation & Delivery Pipelines</span>
              </h1>
              <p className="text-xs text-slate-400">
                Automated build, static quality gates, security scanning, testing, and multi-environment deployments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {pipelines.length > 0 && (
                <select
                  value={selectedPipelineId}
                  onChange={(e) => setSelectedPipelineId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] text-xs font-semibold text-slate-200 outline-none"
                >
                  {pipelines.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.branch})
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setShowDesignerModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#171c28] hover:bg-[#1f2637] text-slate-200 border border-[#2a3245] transition-all"
              >
                <Plus className="w-4 h-4 text-violet-400" />
                <span>New Pipeline</span>
              </button>

              <button
                onClick={handleRunPipeline}
                disabled={isStartingRun}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white border border-violet-500/40 shadow-sm disabled:opacity-50 transition-all"
              >
                {isStartingRun ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* KPI Overview Cards */}
          <div className="animate-fade-up delay-75 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <TiltCard>
              <div className="card-3d card-3d-interactive p-5 rounded-3xl bg-[#11151e] border border-[#1e2433] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Pipelines
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <AnimatedCounter
                      value={metrics?.totalPipelines ?? pipelines.length}
                      className="text-3xl font-extrabold text-white tabular-nums"
                    />
                    <span className="text-xs text-violet-400 font-semibold">
                      {metrics?.runningPipelines ?? 0} running
                    </span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                  <Workflow className="w-5 h-5" />
                </div>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="card-3d card-3d-interactive p-5 rounded-3xl bg-[#11151e] border border-[#1e2433] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Success Rate
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <AnimatedCounter
                      value={metrics?.successRate ?? 100}
                      className="text-3xl font-extrabold text-emerald-400 tabular-nums"
                    />
                    <span className="text-lg font-bold text-emerald-400">%</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {metrics?.successfulPipelines ?? 0} passed · {metrics?.failedPipelines ?? 0} failed
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="card-3d card-3d-interactive p-5 rounded-3xl bg-[#11151e] border border-[#1e2433] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Avg Execution Time
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-slate-100 tabular-nums">
                      {((metrics?.avgDurationMs ?? 0) / 1000).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">sec</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Async multi-stage runner</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="card-3d card-3d-interactive p-5 rounded-3xl bg-[#11151e] border border-[#1e2433] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Latest Deployment
                  </span>
                  <div className="text-xl font-extrabold text-slate-100 mt-1">
                    {metrics?.latestDeploymentEnv || "N/A"}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Status: {metrics?.latestDeploymentStatus || "NONE"}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Rocket className="w-5 h-5" />
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#1e2433] pb-3 text-xs">
            {[
              { id: "execution", label: "Live Execution & Logs", icon: Play },
              { id: "history", label: `Pipeline History (${runs.length})`, icon: History },
              { id: "deployments", label: `Deployments (${deployments.length})`, icon: Rocket },
              { id: "secrets", label: `Secrets & Env (${secrets.length})`, icon: KeyRound },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-[#171c28] text-white border border-violet-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#11151e]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-violet-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Live Execution & Terminal Logs */}
          {activeTab === "execution" && (
            <div className="space-y-6 animate-fade-up">
              {!activeRun ? (
                <div className="card-3d p-12 rounded-3xl bg-[#11151e] border border-[#1e2433] text-center space-y-3">
                  <Workflow className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-200">No Pipeline Executions Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click <strong>Run Pipeline</strong> to execute Source → Build → Code Quality → Security Scan → Test → Package → Deploy with real-time logs.
                  </p>
                </div>
              ) : (
                <>
                  {/* Active Run Header & Quality Gate Banner */}
                  <div className="card-3d p-5 rounded-3xl bg-[#11151e] border border-[#1e2433] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getRunBadge(
                            activeRun.status
                          )}`}
                        >
                          {activeRun.status}
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {activeRun.pipelineName} — Run #{activeRun.runNumber}
                        </span>
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <GitBranch className="w-3.5 h-3.5" />
                          {activeRun.branch} @ {activeRun.commitSha}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#161b26] border border-[#1e2433] text-[10px] font-mono text-slate-400">
                          Trigger: {activeRun.triggerType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {(activeRun.status === "RUNNING" || activeRun.status === "QUEUED") && (
                          <button
                            onClick={() => cancelRunMut({ variables: { runId: activeRun.id } })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                        {activeRun.status === "PASSED" && (
                          <button
                            onClick={() => handleDeploy(activeRun.id, "PRODUCTION")}
                            disabled={isDeploying}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <Rocket className="w-3.5 h-3.5" />
                            <span>Promote to Production</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quality Gate Status */}
                    {activeRun.qualityGatePassed !== null && activeRun.qualityGatePassed !== undefined && (
                      <div
                        className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                          activeRun.qualityGatePassed
                            ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-300"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {activeRun.qualityGatePassed ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="font-bold">
                            Quality Gate: {activeRun.qualityGatePassed ? "PASSED" : "BLOCKED"}
                          </span>
                          <span className="text-slate-300">— {activeRun.qualityGateReason}</span>
                        </div>
                        <div className="flex items-center gap-4 font-mono text-[11px]">
                          <span>Quality: {activeRun.qualityScore ?? "--"}/100</span>
                          <span>Security: {activeRun.securityScore ?? "--"}/100</span>
                          <span>Coverage: {activeRun.testCoverage ?? "--"}%</span>
                        </div>
                      </div>
                    )}

                    {/* Visual Stage Workflow */}
                    <PipelineStageGraph
                      stages={activeRun.stages || []}
                      isRetrying={isRetrying}
                      onRetryStage={async (stageName) => {
                        await retryStageMut({ variables: { runId: activeRun.id, stageName } });
                        refetchRuns();
                      }}
                    />
                  </div>

                  {/* Terminal Logs */}
                  <TerminalLogViewer logs={activeRun.logs || []} runNumber={activeRun.runNumber} />
                </>
              )}
            </div>
          )}

          {/* TAB 2: Pipeline History */}
          {activeTab === "history" && (
            <div className="card-3d animate-fade-up rounded-3xl bg-[#11151e] border border-[#1e2433] overflow-hidden">
              <div className="p-5 border-b border-[#1e2433]">
                <h2 className="text-sm font-extrabold text-white">Pipeline Execution History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0d1017] text-slate-400 uppercase text-[10px] font-bold border-b border-[#1e2433]">
                    <tr>
                      <th className="px-5 py-3">Run</th>
                      <th className="px-5 py-3">Branch</th>
                      <th className="px-5 py-3">Commit</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Duration</th>
                      <th className="px-5 py-3">Trigger</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2433]">
                    {runs.map((r: any) => (
                      <tr
                        key={r.id}
                        onClick={() => {
                          setSelectedRunId(r.id);
                          setActiveTab("execution");
                        }}
                        className="hover:bg-[#161b26] cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5 font-bold text-white">
                          #{r.runNumber} · {r.pipelineName}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">{r.branch}</td>
                        <td className="px-5 py-3.5 font-mono text-violet-400">{r.commitSha}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRunBadge(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-400">
                          {(r.durationMs / 1000).toFixed(2)}s
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-400">{r.triggerType}</td>
                        <td className="px-5 py-3.5 text-right text-violet-400 font-semibold">
                          Inspect →
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Deployments & Rollback */}
          {activeTab === "deployments" && (
            <div className="space-y-6 animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["DEVELOPMENT", "STAGING", "PRODUCTION"].map((env) => {
                  const envDep = deployments.find((d: any) => d.environment === env);
                  return (
                    <div
                      key={env}
                      className="card-3d p-5 rounded-3xl bg-[#11151e] border border-[#1e2433] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-white">{env}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRunBadge(
                            envDep?.status || "IDLE"
                          )}`}
                        >
                          {envDep ? envDep.status : "NOT DEPLOYED"}
                        </span>
                      </div>
                      {envDep ? (
                        <div className="text-xs space-y-1 text-slate-400 font-mono">
                          <div className="text-slate-200 font-bold">{envDep.version}</div>
                          <div>Commit: {envDep.commitSha}</div>
                          <div>By: {envDep.deployedBy}</div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No active deployment in {env}.</p>
                      )}
                      {activeRun && activeRun.status === "PASSED" && (
                        <button
                          onClick={() => handleDeploy(activeRun.id, env)}
                          className="w-full py-2 rounded-xl text-xs font-bold bg-[#171c28] hover:bg-[#1f2637] text-violet-300 border border-violet-500/30"
                        >
                          Deploy Run #{activeRun.runNumber} to {env}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="card-3d rounded-3xl bg-[#11151e] border border-[#1e2433] overflow-hidden">
                <div className="p-5 border-b border-[#1e2433]">
                  <h2 className="text-sm font-extrabold text-white">Deployment History</h2>
                </div>
                <div className="divide-y divide-[#1e2433]">
                  {deployments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No deployments recorded yet.
                    </div>
                  ) : (
                    deployments.map((d: any) => (
                      <div key={d.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{d.environment}</span>
                            <span className="font-mono text-violet-400">{d.version}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRunBadge(d.status)}`}>
                              {d.status}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            Commit {d.commitSha} · Deployed by {d.deployedBy}
                          </div>
                        </div>
                        {d.status === "DEPLOYED" && (
                          <button
                            onClick={async () => {
                              await rollbackMut({ variables: { deploymentId: d.id } });
                              await refetchDeployments();
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Rollback</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Secrets & Environment Variables */}
          {activeTab === "secrets" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
              <form
                onSubmit={handleAddSecret}
                className="card-3d p-5 rounded-3xl bg-[#11151e] border border-[#1e2433] space-y-4 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-white">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Add Encrypted Secret</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Secrets are encrypted at rest, never returned in plaintext, and automatically redacted from all pipeline logs.
                </p>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Secret Name</label>
                  <input
                    type="text"
                    value={secretName}
                    onChange={(e) => setSecretName(e.target.value)}
                    placeholder="e.g. AWS_ACCESS_KEY_ID"
                    className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] font-mono text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Secret Value</label>
                  <input
                    type="password"
                    value={secretValue}
                    onChange={(e) => setSecretValue(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] font-mono text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Environment Scope</label>
                  <select
                    value={secretScope}
                    onChange={(e) => setSecretScope(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] text-slate-100"
                  >
                    <option value="ALL">All Environments</option>
                    <option value="DEVELOPMENT">Development</option>
                    <option value="STAGING">Staging</option>
                    <option value="PRODUCTION">Production</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white"
                >
                  Encrypt & Save Secret
                </button>
              </form>

              <div className="lg:col-span-2 card-3d rounded-3xl bg-[#11151e] border border-[#1e2433] overflow-hidden">
                <div className="p-5 border-b border-[#1e2433] flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-white">Configured Secrets</h2>
                  <span className="text-[11px] text-emerald-400 font-semibold">Auto-redacted in logs</span>
                </div>
                <div className="divide-y divide-[#1e2433]">
                  {secrets.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No secrets configured yet. Add API tokens or deploy credentials on the left.
                    </div>
                  ) : (
                    secrets.map((s: any) => (
                      <div key={s.id} className="p-4 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-mono font-bold text-white">{s.name}</div>
                          <div className="font-mono text-[11px] text-slate-500">
                            {s.maskedValue} · Scope: {s.scope}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            await deleteSecretMut({ variables: { secretId: s.id } });
                            await refetchSecrets();
                          }}
                          className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Visual Pipeline Designer Modal */}
      <VisualPipelineDesignerModal
        isOpen={showDesignerModal}
        onClose={() => setShowDesignerModal(false)}
        repositoryId={selectedRepoId}
        repositoryName={activeRepoName}
        onCreatePipeline={handleCreatePipeline}
        isSubmitting={isCreating}
      />

      {/* Production Deployment Confirmation Modal */}
      {pendingProdDeployRunId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#11151e] border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-extrabold text-white">Confirm Production Deployment</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to deploy this build to the <strong>PRODUCTION</strong> environment. All Quality Gate and Security Scan checks have passed. Proceed?
            </p>
            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setPendingProdDeployRunId(null)}
                className="px-4 py-2 rounded-xl font-semibold border border-[#1e2433] text-slate-300 hover:bg-[#171c28]"
              >
                Cancel
              </button>
              <button
                onClick={confirmProdDeploy}
                className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Confirm & Deploy to Production
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
