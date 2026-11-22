"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import {
  Sparkles,
  Send,
  Bot,
  User,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  codeSnippet?: string;
  sourceFiles?: string[];
  timestamp: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "Hello Akhila! I am your DevPilot AI Assistant. I have indexed your repository context. Ask me anything about your code architecture, static analysis issues, or remediation strategies.",
    timestamp: "10:30 AM",
  },
  {
    id: "msg-2",
    sender: "user",
    text: "How is authentication implemented in the backend?",
    timestamp: "10:31 AM",
  },
  {
    id: "msg-3",
    sender: "ai",
    text: "Authentication is implemented using Spring Security 6 with GitHub OAuth2 client integration in `SecurityConfig.java`. It validates incoming JWT tokens and sets the SecurityContext for GraphQL queries.",
    codeSnippet: `@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .oauth2Login(Customizer.withDefaults())
            .build();
    }
}`,
    sourceFiles: [
      "src/main/java/com/devpilot/config/SecurityConfig.java",
      "src/main/resources/application.yml",
    ],
    timestamp: "10:31 AM",
  },
];

export default function AIInsightsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: inputText.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Based on repository analysis of 'akhilaammulu/devpilot': Your query regarding '${userMsg.text}' relates to the Phase 2 static analysis architecture. All findings are parsed into the unified Issue schema with severity categorization.`,
        sourceFiles: [
          "src/main/java/com/devpilot/service/ScanService.java",
          "src/main/resources/graphql/schema.graphqls",
        ],
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 1200);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-[#f4f6fb] dark:bg-[#080b14] text-slate-900 dark:text-slate-100">
      <Header currentPhase="Phase 5 - AI Analysis" />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full flex flex-col h-[calc(100vh-4rem)]">
          {/* Breadcrumb & Header */}
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
              <span>Repository-Aware AI Assistant</span>
            </h1>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold shrink-0">Try asking:</span>
            {[
              "Where are payment errors handled?",
              "What tests cover this service?",
              "Explain the SpotBugs null pointer finding",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputText(prompt)}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 shrink-0 shadow-sm transition-all"
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
                className={`flex gap-3 max-w-2xl ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-gradient-to-tr from-cyan-400 to-purple-600 text-white shadow-md shadow-purple-500/20"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`rounded-2xl p-4 text-xs space-y-2.5 ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {msg.codeSnippet && (
                    <div className="relative rounded-xl p-3 bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
                      <button
                        onClick={() => handleCopy(msg.id, msg.codeSnippet!)}
                        className="absolute top-2 right-2 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <pre>{msg.codeSnippet}</pre>
                    </div>
                  )}

                  {msg.sourceFiles && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-500">Grounded in:</span>
                      {msg.sourceFiles.map((file) => (
                        <span
                          key={file}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-purple-600 dark:text-purple-400"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-2xl mr-auto items-center text-xs text-slate-400">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-slate-800">
                  <span className="animate-pulse">DevPilot AI is analyzing repository files...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about your code, bugs, or architecture..."
              className="flex-1 px-4 py-3 rounded-2xl text-xs bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 shadow-md shadow-pink-500/20 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
