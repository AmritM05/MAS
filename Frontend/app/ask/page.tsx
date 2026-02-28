"use client";

import { useState, useRef, useEffect } from "react";
import { useData } from "../../context/DataContext";
import Link from "next/link";
import { askCFO } from "../../services/api";

interface Message {
  role: "user" | "cfo";
  text: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Can we afford to hire two engineers next month?",
  "What is our biggest expense category?",
  "How can we extend our runway by 3 months?",
  "Should we increase marketing spend?",
  "What happens if revenue drops 20%?",
  "Give me a one-sentence financial health summary.",
];

export default function AskCFOPage() {
  const { metrics, cashBalance } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!metrics) {
    return (
      <div className="futuristic-card p-12 text-center max-w-lg mx-auto">
        <p className="text-4xl mb-3 opacity-30">🤖</p>
        <p className="text-slate-400 mb-4">Upload data first to chat with the AI CFO.</p>
        <Link href="/" className="neon-btn px-6 py-2 rounded-lg text-sm text-white">Go to Dashboard</Link>
      </div>
    );
  }

  const sendMessage = async (question?: string) => {
    const q = question || input.trim();
    if (!q || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await askCFO(q, cashBalance);
      setMessages((prev) => [...prev, { role: "cfo", text: res.answer, timestamp: new Date() }]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || "AI CFO is unavailable. Please try again.";
      setMessages((prev) => [...prev, { role: "cfo", text: `Error: ${errMsg}`, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 240px)", minHeight: 500 }}>
      {/* Header */}
      <div className="futuristic-card p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Ask the CFO</h2>
            <p className="text-xs text-slate-500">AI-powered financial advisor — ask anything about your finances</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400">Online</span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 px-1 mb-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-3 opacity-20">💬</p>
            <p className="text-slate-500 text-sm mb-6">Start a conversation with your AI CFO</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-left text-sm text-slate-400 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-lg px-4 py-3 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-violet-600/30 to-cyan-600/20 text-slate-100 border border-violet-500/20"
                  : "bg-white/[0.04] text-slate-300 border border-white/5"
              }`}
            >
              {msg.role === "cfo" && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-[10px]">🤖</span>
                  <span className="text-xs font-semibold text-cyan-400">AI CFO</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <p className="text-[10px] text-slate-600 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/5 rounded-2xl px-4 py-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-[10px]">🤖</span>
                <span className="text-xs font-semibold text-cyan-400">AI CFO</span>
              </div>
              <div className="flex gap-1 mt-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="futuristic-card p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your finances..."
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="neon-btn text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
