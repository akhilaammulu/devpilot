"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ConsolidatedDashboardView } from "@/components/ConsolidatedDashboardView";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col transition-colors bg-[#f4f6fb] dark:bg-[#090b10] text-slate-900 dark:text-slate-100">
      <Header currentPhase="Phase 7 - GitHub Pull Request Analysis" />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          <ConsolidatedDashboardView />
        </main>
      </div>
    </div>
  );
}
