"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { CodeQualityExplorerView } from "@/components/issues/CodeQualityExplorerView";

export default function ScansPage() {
  return (
    <div className="min-h-screen flex flex-col transition-colors bg-[#f4f6fb] dark:bg-[#080b14] text-slate-900 dark:text-slate-100">
      <Header currentPhase="Phase 2 - Prototype (Static Analysis)" />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          <CodeQualityExplorerView />
        </main>
      </div>
    </div>
  );
}
