"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import {
  Sparkles,
  Send,
  Bot,
  User,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  RefreshCw,
  Layers,
  AlertCircle,
  Code2,
} from "lucide-react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_REPOSITORIES,
  ASK_REPOSITORY,
  INDEX_REPOSITORY,
  GET_REPOSITORY_INDEX_STATUS,
} from "@/lib/graphql/queries";

interface RagSource {
  filePath: string;
  startLine: number;
  endLine: number;
  snippet: string;
  relevanceScore: number;
  symbolName?: string;
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  confidenceScore?: number;
  modelUsed?: string;
  sources?: RagSource[];
  isError?: boolean;
  timestamp: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: "msg-welcome",
    sender: "ai",
    text: "Hello! I am your **DevPilot Repository-Aware RAG Assistant**. I retrieve real code chunks from your indexed repository vector store and ground every answer with exact file paths, line ranges, and symbols.\n\nTry asking about authentication, error handling, test coverage, or any class/service in your codebase.",
    timestamp: "Ready",
  },
];

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function FormattedRagText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={idx} className="text-xs font-extrabold text-slate-900 dark:text-white pt-1.5">
              {renderInlineMarkdown(trimmed.slice(5))}
            </h4>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-sm font-extrabold text-slate-900 dark:text-white pt-1">
              {renderInlineMarkdown(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-3">
              <span className="text-purple-500 font-bold mt-0.5">•</span>
              <span>{renderInlineMarkdown(trimmed.slice(2))}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s(.*)$/);
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-2 pt-1 font-medium">
                <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0">{match[1]}</span>
                <span>{renderInlineMarkdown(match[2])}</span>
              </div>
            );
          }
        }
        return <p key={idx}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

export default function AIInsightsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");

  const { data: repoData } = useQuery(GET_REPOSITORIES, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  });

  const [askRepoQuery, { loading: isAsking }] = useLazyQuery(ASK_REPOSITORY, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const [indexRepoMutation, { loading: isIndexing }] = useMutation(INDEX_REPOSITORY);

  const { data: indexStatusData, refetch: refetchIndexStatus } = useQuery(
    GET_REPOSITORY_INDEX_STATUS,
    {
      variables: { repositoryId: selectedRepoId },
      skip: !selectedRepoId,
      fetchPolicy: "network-only",
      errorPolicy: "ignore",
    }
  );

  useEffect(() => {
    if (repoData?.repositories?.length > 0 && !selectedRepoId) {
      setSelectedRepoId(repoData.repositories[0].id);
    }
  }, [repoData, selectedRepoId]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText("");

    const targetRepoId = selectedRepoId || "692fd4e3-4ca7-4c74-866c-6142c4a693a0";

    try {
      const res = await askRepoQuery({
        variables: {
          repositoryId: targetRepoId,
          query: textToSend,
        },
      });

      if (res.data?.askRepository) {
        const rag = res.data.askRepository;
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: rag.answer,
          confidenceScore: rag.confidenceScore,
          modelUsed: rag.modelUsed,
          sources: rag.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        refetchIndexStatus();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "ai",
            isError: true,
            text: "Unable to retrieve repository context from the GraphQL backend. Please ensure the DevPilot backend server is running on port 8080.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          isError: true,
          text: "Network error while querying the RAG endpoint. Please verify the backend service is active.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  const handleIndexRepo = async () => {
    const targetRepoId = selectedRepoId || "692fd4e3-4ca7-4c74-866c-6142c4a693a0";
    try {
      await indexRepoMutation({
        variables: { repositoryId: targetRepoId },
      });
      refetchIndexStatus();
    } catch (e) {
      console.error("Indexing failed", e);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSourceExpand = (key: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const indexStatus = indexStatusData?.repositoryIndexStatus;

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-[#f4f6fb] dark:bg-[#080b14] text-slate-900 dark:text-slate-100">
      <Header currentPhase="Phase 6 - Repository-Aware RAG" />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-5 max-w-5xl mx-auto w-full flex flex-col h-[calc(100vh-4rem)]">
          {/* Breadcrumb & Phase Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-200">
                  Dashboard
                </Link>
                <span>&gt;</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  AI Insights & RAG Q&A
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span>Repository-Aware RAG Assistant</span>
              </h1>
            </div>

            {/* Repository Selector & Vector Index Status */}
            <div className="flex flex-wrap items-center gap-2.5">
              {repoData?.repositories?.length > 0 && (
                <select
                  value={selectedRepoId}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  className="px-3 py-1.5 rounded-2xl bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-purple-500 shadow-sm"
                >
                  {repoData.repositories.map((r: { id: string; fullName: string }) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
                <Database
                  className={`w-4 h-4 ${
                    indexStatus?.chunksCreated > 0 ? "text-emerald-500" : "text-amber-500"
                  }`}
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Vector DB:
                </span>
                <span
                  className={`font-bold ${
                    indexStatus?.chunksCreated > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {indexStatus?.chunksCreated > 0
                    ? `${indexStatus.filesIndexed} Files · ${indexStatus.chunksCreated} Chunks`
                    : "Auto-Indexes on Query"}
                </span>
              </div>

              <button
                onClick={handleIndexRepo}
                disabled={isIndexing}
                title="Re-index repository vector embeddings"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isIndexing ? "animate-spin" : ""}`} />
                <span>{isIndexing ? "Indexing..." : "Re-index"}</span>
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold shrink-0">Try asking:</span>
            {[
              "How is authentication implemented?",
              "How are GraphQL errors handled?",
              "What tests cover this service?",
              "How does the accessibility scanner work?",
              "How does QualityScoreCalculator compute scores?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                disabled={isAsking}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 shrink-0 shadow-sm transition-all disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Window Container */}
          <div className="flex-1 rounded-3xl border transition-all bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800/80 shadow-sm p-6 overflow-y-auto space-y-4 flex flex-col">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white"
                      : msg.isError
                      ? "bg-rose-500 text-white"
                      : "bg-gradient-to-tr from-cyan-400 to-purple-600 text-white shadow-md shadow-purple-500/20"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : msg.isError ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`rounded-2xl p-4 text-xs space-y-3 ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white shadow-md"
                      : msg.isError
                      ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300"
                      : "bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {/* Model & Confidence Header for AI replies */}
                  {msg.sender === "ai" && (msg.confidenceScore || msg.modelUsed) && (
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800 text-[11px]">
                      {msg.confidenceScore && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                          {Math.round(msg.confidenceScore * 100)}% Confidence
                        </span>
                      )}
                      {msg.modelUsed && (
                        <span className="text-slate-400 font-mono text-[10px]">
                          {msg.modelUsed}
                        </span>
                      )}
                    </div>
                  )}

                  {msg.sender === "user" ? (
                    <p className="leading-relaxed">{msg.text}</p>
                  ) : (
                    <FormattedRagText text={msg.text} />
                  )}

                  {/* Grounded Source Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <Layers className="w-3.5 h-3.5 text-purple-500" />
                        <span>Grounded Source Citations ({msg.sources.length} chunks)</span>
                      </div>

                      <div className="space-y-1.5">
                        {msg.sources.map((source, idx) => {
                          const key = `${msg.id}-${idx}`;
                          const isExpanded = !!expandedSources[key];
                          return (
                            <div
                              key={key}
                              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322] overflow-hidden"
                            >
                              <div
                                onClick={() => toggleSourceExpand(key)}
                                className="p-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-2 font-mono text-[11px] text-purple-600 dark:text-purple-400 font-semibold min-w-0">
                                  <FileCode className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                  <span className="truncate">{source.filePath}</span>
                                  <span className="text-slate-400 text-[10px] shrink-0">
                                    L{source.startLine}–L{source.endLine}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {source.symbolName && source.symbolName !== "Module" && (
                                    <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      <Code2 className="w-2.5 h-2.5" />
                                      {source.symbolName}
                                    </span>
                                  )}
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                    {Math.round(source.relevanceScore * 100)}% match
                                  </span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="relative p-3 bg-slate-950 text-slate-200 border-t border-slate-800 font-mono text-[11px] overflow-x-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(key, source.snippet);
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  >
                                    {copiedId === key ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <pre className="leading-relaxed">{source.snippet}</pre>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAsking && (
              <div className="flex gap-3 max-w-2xl mr-auto items-center text-xs text-slate-400">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching persistent vector index & grounding repository context...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about your architecture, authentication, tests, or scanners..."
              className="flex-1 px-4 py-3 rounded-2xl text-xs bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isAsking}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 shadow-md shadow-pink-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
