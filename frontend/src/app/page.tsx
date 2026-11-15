"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { HeroSection } from "@/components/HeroSection";
import { ScoreCards } from "@/components/ScoreCards";
import { ConnectedRepositories, RepoItem } from "@/components/ConnectedRepositories";
import { ActiveRepoScanSection, ScanRecord } from "@/components/ActiveRepoScanSection";
import { ConnectRepoModal } from "@/components/ConnectRepoModal";

const initialRepositories: RepoItem[] = [
  {
    id: "repo-1",
    githubRepoId: "devpilot-001",
    fullName: "akhilaammulu/devpilot",
    defaultBranch: "main",
    isPrivate: false,
    htmlUrl: "https://github.com/akhilaammulu/devpilot",
    updatedAt: "Updated 2 hours ago",
    isActive: true,
  },
];

export default function DashboardPage() {
  const [repositories, setRepositories] = useState<RepoItem[]>(initialRepositories);
  const [selectedRepo, setSelectedRepo] = useState<RepoItem>(initialRepositories[0]);
  const [scansByRepo, setScansByRepo] = useState<Record<string, ScanRecord[]>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Scores
  const [scores, setScores] = useState({
    quality: 87,
    security: 92,
    accessibility: 81,
    tests: 76,
  });

  const handleConnectNewRepo = (newRepoData: {
    fullName: string;
    defaultBranch: string;
    htmlUrl: string;
  }) => {
    const newRepo: RepoItem = {
      id: `repo-${Date.now()}`,
      githubRepoId: `gh-${Date.now()}`,
      fullName: newRepoData.fullName,
      defaultBranch: newRepoData.defaultBranch,
      isPrivate: false,
      htmlUrl: newRepoData.htmlUrl,
      updatedAt: "Just now",
      isActive: true,
    };
    setRepositories((prev) => [newRepo, ...prev]);
    setSelectedRepo(newRepo);
  };

  const handleStartScan = () => {
    if (!selectedRepo) return;
    setIsScanning(true);

    setTimeout(() => {
      const completedScan: ScanRecord = {
        id: `scan-${Date.now()}`,
        commitSha: "31b614e",
        branchName: selectedRepo.defaultBranch,
        status: "COMPLETED",
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        qualityScore: 94,
        securityScore: 98,
        accessibilityScore: 91,
        testsScore: 89,
        findings: [
          {
            id: "fnd-1",
            category: "CODE_QUALITY",
            severity: "LOW",
            ruleId: "DEV-PHASE1-INIT",
            filePath: "README.md",
            message: "Initial baseline scan executed successfully for DevPilot repository.",
            aiExplanation:
              "DevPilot Phase 1 Foundation verification confirmed. Spring Boot GraphQL backend, PostgreSQL models, and Next.js reactive dashboard are verified.",
            aiFixSuggestion:
              "Continue to Phase 2 for full Java Checkstyle/PMD and TypeScript ESLint rules integration.",
          },
        ],
      };

      setScansByRepo((prev) => ({
        ...prev,
        [selectedRepo.id]: [completedScan, ...(prev[selectedRepo.id] || [])],
      }));

      // Bump scores slightly on scan completion
      setScores({
        quality: 94,
        security: 98,
        accessibility: 91,
        tests: 89,
      });

      setIsScanning(false);
    }, 1800);
  };

  const activeScans = scansByRepo[selectedRepo.id] || [];

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-slate-50 dark:bg-[#080b14] text-slate-900 dark:text-slate-100">
      {/* Top Navigation */}
      <Header currentPhase="Phase 1 - Foundation" />

      {/* Main Layout: Sidebar + Dashboard Content */}
      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Hero / Welcome Section */}
          <HeroSection
            onConnectClick={() => setIsModalOpen(true)}
            onImportClick={() => setIsModalOpen(true)}
          />

          {/* 4 Score Cards */}
          <ScoreCards
            qualityScore={scores.quality}
            securityScore={scores.security}
            accessibilityScore={scores.accessibility}
            testsScore={scores.tests}
          />

          {/* Connected Repositories */}
          <ConnectedRepositories
            repositories={repositories}
            selectedRepo={selectedRepo}
            onSelectRepo={(repo) => setSelectedRepo(repo)}
          />

          {/* Active Repository & Scan Panel */}
          {selectedRepo && (
            <ActiveRepoScanSection
              repository={selectedRepo}
              scans={activeScans}
              isScanning={isScanning}
              onStartScan={handleStartScan}
            />
          )}
        </main>
      </div>

      {/* Modal for connecting a new repository */}
      <ConnectRepoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnectNewRepo}
      />
    </div>
  );
}
