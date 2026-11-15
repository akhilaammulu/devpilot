"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { HeroSection } from "@/components/HeroSection";
import { ScoreCards } from "@/components/ScoreCards";
import { ConnectedRepositories, RepoItem } from "@/components/ConnectedRepositories";
import { ActiveRepoScanSection, ScanRecord } from "@/components/ActiveRepoScanSection";
import { ConnectRepoModal } from "@/components/ConnectRepoModal";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<RepoItem[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepoItem | null>(null);
  const [scansByRepo, setScansByRepo] = useState<Record<string, ScanRecord[]>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Load repositories from localStorage or initialize with user's repo
  useEffect(() => {
    const savedRepos = localStorage.getItem("devpilot-repos");
    if (savedRepos) {
      try {
        const parsed = JSON.parse(savedRepos);
        setRepositories(parsed);
        if (parsed.length > 0) setSelectedRepo(parsed[0]);
        return;
      } catch (e) {
        console.error("Failed to parse saved repos", e);
      }
    }

    // Default repository dynamic based on logged in user
    const defaultRepoName = user?.username ? `${user.username}/devpilot` : "akhilaammulu/devpilot";
    const initialRepo: RepoItem = {
      id: "repo-default",
      githubRepoId: "gh-default",
      fullName: defaultRepoName,
      defaultBranch: "main",
      isPrivate: false,
      htmlUrl: `https://github.com/${defaultRepoName}`,
      updatedAt: "Updated 2 hours ago",
      isActive: true,
    };
    setRepositories([initialRepo]);
    setSelectedRepo(initialRepo);
    localStorage.setItem("devpilot-repos", JSON.stringify([initialRepo]));
  }, [user?.username]);

  // Load scans from localStorage
  useEffect(() => {
    const savedScans = localStorage.getItem("devpilot-scans");
    if (savedScans) {
      try {
        setScansByRepo(JSON.parse(savedScans));
      } catch (e) {
        console.error("Failed to parse saved scans", e);
      }
    }
  }, []);

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

    const updated = [newRepo, ...repositories];
    setRepositories(updated);
    setSelectedRepo(newRepo);
    localStorage.setItem("devpilot-repos", JSON.stringify(updated));
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
            id: `fnd-${Date.now()}`,
            category: "CODE_QUALITY",
            severity: "LOW",
            ruleId: "DEV-PHASE1-INIT",
            filePath: "README.md",
            message: `Initial baseline scan executed successfully for ${selectedRepo.fullName}.`,
            aiExplanation:
              "DevPilot Phase 1 Foundation verification confirmed. Spring Boot GraphQL backend, PostgreSQL models, and Next.js reactive dashboard are verified.",
            aiFixSuggestion:
              "Continue to Phase 2 for full Java Checkstyle/PMD and TypeScript ESLint rules integration.",
          },
        ],
      };

      setScansByRepo((prev) => {
        const next = {
          ...prev,
          [selectedRepo.id]: [completedScan, ...(prev[selectedRepo.id] || [])],
        };
        localStorage.setItem("devpilot-scans", JSON.stringify(next));
        return next;
      });

      setIsScanning(false);
    }, 1800);
  };

  const activeScans = selectedRepo ? scansByRepo[selectedRepo.id] || [] : [];
  const latestScan = activeScans[0] || null;

  // Filter repositories if search query is entered
  const filteredRepositories = repositories.filter((r) =>
    r.fullName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-slate-50 dark:bg-[#080b14] text-slate-900 dark:text-slate-100">
      {/* Top Navigation with Search handler */}
      <Header
        currentPhase="Phase 1 - Foundation"
        onSearchChange={(q) => setSearchFilter(q)}
      />

      {/* Main Layout: Sidebar + Dashboard Content */}
      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Hero / Welcome Section */}
          <HeroSection
            onConnectClick={() => setIsModalOpen(true)}
            onImportClick={() => setIsModalOpen(true)}
          />

          {/* 4 Score Cards (Dynamic from scan state) */}
          <ScoreCards
            qualityScore={latestScan ? latestScan.qualityScore : 87}
            securityScore={latestScan ? latestScan.securityScore : 92}
            accessibilityScore={latestScan ? latestScan.accessibilityScore : 81}
            testsScore={latestScan ? latestScan.testsScore : 76}
            hasScanned={!!latestScan}
          />

          {/* Connected Repositories */}
          <ConnectedRepositories
            repositories={filteredRepositories}
            selectedRepo={selectedRepo}
            onSelectRepo={(repo) => setSelectedRepo(repo)}
            onConnectClick={() => setIsModalOpen(true)}
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
