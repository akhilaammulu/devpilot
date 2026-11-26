"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Workflow,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export interface StageDef {
  name: string;
  type: string;
  command: string;
  enabled: boolean;
}

interface VisualPipelineDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositoryId: string;
  repositoryName: string;
  onCreatePipeline: (input: any) => Promise<void>;
  isSubmitting: boolean;
}

const LANGUAGE_DEFAULTS: Record<string, { buildTool: string; testFramework: string; buildCmd: string; testCmd: string }> = {
  Java: { buildTool: "Maven", testFramework: "JUnit 5", buildCmd: "mvn clean compile -DskipTests", testCmd: "mvn test" },
  "Node.js": { buildTool: "npm", testFramework: "Jest", buildCmd: "npm ci && npm run build", testCmd: "npm test -- --coverage" },
  "React/Next.js": { buildTool: "npm", testFramework: "Playwright + Jest", buildCmd: "npm ci && npm run build", testCmd: "npm run test:e2e" },
  Angular: { buildTool: "npm", testFramework: "Karma / Jasmine", buildCmd: "npm ci && ng build", testCmd: "ng test --watch=false" },
  TypeScript: { buildTool: "npm", testFramework: "Vitest", buildCmd: "npm ci && tsc --noEmit", testCmd: "npx vitest run" },
  Python: { buildTool: "pip", testFramework: "pytest", buildCmd: "pip install -r requirements.txt", testCmd: "pytest --cov=." },
};

export function VisualPipelineDesignerModal({
  isOpen,
  onClose,
  repositoryId,
  repositoryName,
  onCreatePipeline,
  isSubmitting,
}: VisualPipelineDesignerModalProps) {
  const [name, setName] = useState("DevPilot CI/CD Pipeline");
  const [branch, setBranch] = useState("main");
  const [language, setLanguage] = useState("Java");
  const [buildTool, setBuildTool] = useState("Maven");
  const [testFramework, setTestFramework] = useState("JUnit 5");
  const [environment, setEnvironment] = useState("Development");
  const [deploymentTarget, setDeploymentTarget] = useState("AWS ECS");
  const [triggers, setTriggers] = useState<string[]>(["PUSH", "PULL_REQUEST", "MANUAL"]);

  // Quality Gate thresholds
  const [maxCritical, setMaxCritical] = useState(0);
  const [maxHigh, setMaxHigh] = useState(5);
  const [minCoverage, setMinCoverage] = useState(80);

  // Visual Stage Builder
  const [stages, setStages] = useState<StageDef[]>([
    { name: "Source", type: "SOURCE", command: "git checkout $BRANCH && git pull", enabled: true },
    { name: "Build", type: "BUILD", command: "mvn clean compile -DskipTests", enabled: true },
    { name: "Code Quality", type: "QUALITY", command: "devpilot analyze --quality", enabled: true },
    { name: "Security Scan", type: "SECURITY", command: "devpilot analyze --security", enabled: true },
    { name: "Test", type: "TEST", command: "mvn test", enabled: true },
    { name: "Package", type: "PACKAGE", command: "mvn package -DskipTests", enabled: true },
    { name: "Deploy", type: "DEPLOY", command: "devpilot deploy --env development", enabled: true },
  ]);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const defaults = LANGUAGE_DEFAULTS[lang];
    if (defaults) {
      setBuildTool(defaults.buildTool);
      setTestFramework(defaults.testFramework);
      setStages((prev) =>
        prev.map((s) =>
          s.type === "BUILD"
            ? { ...s, command: defaults.buildCmd }
            : s.type === "TEST"
            ? { ...s, command: defaults.testCmd }
            : s
        )
      );
    }
  };

  const toggleTrigger = (t: string) => {
    setTriggers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const moveStage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= stages.length) return;
    const updated = [...stages];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setStages(updated);
  };

  const addCustomStage = () => {
    setStages((prev) => [
      ...prev,
      { name: "Custom Check", type: "QUALITY", command: "echo 'Running custom step'", enabled: true },
    ]);
  };

  const removeStage = (idx: number) => {
    setStages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError("Pipeline name is required.");
      return;
    }
    if (stages.filter((s) => s.enabled).length === 0) {
      setValidationError("At least one enabled stage is required.");
      return;
    }
    if (triggers.length === 0) {
      setValidationError("Select at least one pipeline trigger.");
      return;
    }

    await onCreatePipeline({
      repositoryId,
      name: name.trim(),
      branch: branch.trim() || "main",
      language,
      buildTool,
      testFramework,
      environment,
      deploymentTarget,
      triggers,
      stages,
      qualityGate: {
        maxCritical,
        maxHigh,
        minCoverage,
        requireBuildPass: true,
        requireSecurityPass: true,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#11151e] border border-[#1e2433] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1e2433] bg-[#0d1017] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Create & Design CI/CD Pipeline
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Repository: {repositoryName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#171c28]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={validateAndSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Core Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Pipeline Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] text-slate-100 outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Target Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] text-slate-100 font-mono outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Language / Stack</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] text-slate-100 outline-none focus:border-violet-500"
              >
                {Object.keys(LANGUAGE_DEFAULTS).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Build Tool</label>
              <input
                type="text"
                value={buildTool}
                onChange={(e) => setBuildTool(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Test Framework</label>
              <input
                type="text"
                value={testFramework}
                onChange={(e) => setTestFramework(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] text-slate-100 outline-none"
              >
                <option value="Development">Development</option>
                <option value="Staging">Staging</option>
                <option value="Production">Production</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Deployment Target</label>
              <select
                value={deploymentTarget}
                onChange={(e) => setDeploymentTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#1e2433] text-slate-100 outline-none"
              >
                <option value="AWS ECS">AWS ECS</option>
                <option value="Kubernetes (EKS)">Kubernetes (EKS)</option>
                <option value="Docker Compose">Docker Compose</option>
                <option value="Vercel">Vercel</option>
              </select>
            </div>
          </div>

          {/* Triggers & Quality Gate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#0d1017] border border-[#1e2433] space-y-2.5">
              <span className="font-bold text-slate-200 block">Pipeline Triggers</span>
              <div className="flex flex-wrap gap-2">
                {["PUSH", "PULL_REQUEST", "MERGE", "MANUAL", "SCHEDULE"].map((trig) => (
                  <button
                    type="button"
                    key={trig}
                    onClick={() => toggleTrigger(trig)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                      triggers.includes(trig)
                        ? "bg-violet-600/20 text-violet-300 border-violet-500/40"
                        : "bg-[#11151e] text-slate-500 border-[#1e2433]"
                    }`}
                  >
                    {trig}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1017] border border-[#1e2433] space-y-2.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Quality Gate Thresholds
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block">Max Critical</label>
                  <input
                    type="number"
                    min={0}
                    value={maxCritical}
                    onChange={(e) => setMaxCritical(Number(e.target.value))}
                    className="w-full mt-0.5 px-2 py-1.5 rounded-lg bg-[#090b10] border border-[#1e2433] text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Max High</label>
                  <input
                    type="number"
                    min={0}
                    value={maxHigh}
                    onChange={(e) => setMaxHigh(Number(e.target.value))}
                    className="w-full mt-0.5 px-2 py-1.5 rounded-lg bg-[#090b10] border border-[#1e2433] text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Min Coverage %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={minCoverage}
                    onChange={(e) => setMinCoverage(Number(e.target.value))}
                    className="w-full mt-0.5 px-2 py-1.5 rounded-lg bg-[#090b10] border border-[#1e2433] text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Drag-and-Drop Visual Stage Designer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-200">
                  Visual Stage Designer (Drag & Drop or Reorder)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Drag stages to reorder the workflow or customize commands before saving.
                </p>
              </div>
              <button
                type="button"
                onClick={addCustomStage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold bg-[#171c28] hover:bg-[#1f2637] text-violet-300 border border-violet-500/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stage</span>
              </button>
            </div>

            <div className="space-y-2">
              {stages.map((st, idx) => (
                <div
                  key={`${st.name}-${idx}`}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== idx) {
                      moveStage(dragIndex, idx);
                    }
                    setDragIndex(null);
                  }}
                  className="p-3 rounded-2xl bg-[#0d1017] border border-[#1e2433] hover:border-violet-500/40 flex flex-wrap sm:flex-nowrap items-center gap-2.5 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-[10px] font-mono text-slate-500 w-5">{idx + 1}.</span>

                  <input
                    type="text"
                    value={st.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStages((prev) => prev.map((x, i) => (i === idx ? { ...x, name: val } : x)));
                    }}
                    className="w-36 px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-[#1e2433] text-slate-100 font-semibold"
                  />

                  <select
                    value={st.type}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStages((prev) => prev.map((x, i) => (i === idx ? { ...x, type: val } : x)));
                    }}
                    className="px-2 py-1.5 rounded-lg bg-[#090b10] border border-[#1e2433] text-violet-300 font-mono text-[11px]"
                  >
                    {["SOURCE", "BUILD", "QUALITY", "SECURITY", "TEST", "PACKAGE", "DEPLOY"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={st.command}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStages((prev) => prev.map((x, i) => (i === idx ? { ...x, command: val } : x)));
                    }}
                    className="flex-1 min-w-[160px] px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-[#1e2433] text-slate-300 font-mono text-[11px]"
                  />

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveStage(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-[#171c28] text-slate-400 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStage(idx, idx + 1)}
                      disabled={idx === stages.length - 1}
                      className="p-1 rounded hover:bg-[#171c28] text-slate-400 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStage(idx)}
                      className="p-1 rounded hover:bg-rose-500/10 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#1e2433] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold border border-[#1e2433] text-slate-300 hover:bg-[#171c28]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Validate & Save Pipeline"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
