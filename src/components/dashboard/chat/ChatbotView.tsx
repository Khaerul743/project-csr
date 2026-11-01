"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  Bot,
  User,
  ArrowRight,
  Copy,
  Check,
  Compass,
  FileText,
  Activity,
  Lightbulb,
  Building2,
  Calendar,
  MapPin,
  Coins,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  fullContent?: string;
  isTyping?: boolean;
  cards?: any[];
  toolCallsMade?: string[];
  timestamp: string;
}

interface ChatbotViewProps {
  role: string;
  userName: string;
  organizationName?: string;
  onNavigate?: (menu: string) => void;
}

export function ChatbotView({
  role,
  userName,
  organizationName,
  onNavigate,
}: ChatbotViewProps) {
  const isPartner = role === "PARTNER_ADMIN";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultPrompts = isPartner
    ? [
        {
          icon: Compass,
          title: "Cari Peluang Terbuka",
          prompt: "Rekomendasikan peluang CSR yang sedang buka di platform SIPENA",
        },
        {
          icon: Lightbulb,
          title: "Brainstorming Proposal",
          prompt: "Bantu saya brainstorming draf ide proposal program CSR bidang lingkungan dengan target SDG 13",
        },
        {
          icon: FileText,
          title: "Cek Status Proposal",
          prompt: "Bagaimana status proposal saya yang terakhir dan apakah ada catatan revisi?",
        },
        {
          icon: TrendingUp,
          title: "Tips Lolos AI Screening",
          prompt: "Apa saja tips agar proposal mitra lolos screening AI dengan skor tinggi?",
        },
      ]
    : [
        {
          icon: Activity,
          title: "Rekap Program Aktif",
          prompt: "Berapa total serapan anggaran dan progres program CSR kita yang sedang berjalan?",
        },
        {
          icon: Lightbulb,
          title: "Rancang Inisiatif Baru",
          prompt: "Berikan 3 ide konsep program CSR inovatif yang selaras dengan POJK 51 dan SDG 12",
        },
        {
          icon: FileText,
          title: "Evaluasi Proposal Masuk",
          prompt: "Ada berapa proposal mitra yang statusnya masih UNDER_REVIEW?",
        },
        {
          icon: TrendingUp,
          title: "Indikator ESG & Dampak",
          prompt: "Panduan indikator keberlanjutan terukur untuk laporan tahunan CSR",
        },
      ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history from sessionStorage if available
  useEffect(() => {
    const saved = sessionStorage.getItem(`sipena_chat_${role}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }
  }, [role]);

  // Save chat history to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(`sipena_chat_${role}`, JSON.stringify(messages));
    }
  }, [messages, role]);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  const handleSkipTyping = (msgId: string, fullText?: string) => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, content: fullText || m.content, isTyping: false } : m
      )
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Stop any active typing
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [
      ...messages.map((m) =>
        m.isTyping ? { ...m, content: m.fullContent || m.content, isTyping: false } : m
      ),
      userMsg,
    ];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mendapatkan respon dari server");
      }

      const json = await res.json();
      const fullReply = json.data?.reply || "Maaf, tidak ada respon yang dihasilkan.";
      const aiMsgId = crypto.randomUUID();

      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        fullContent: fullReply,
        cards: json.data?.cards || [],
        toolCallsMade: json.data?.toolCallsMade || [],
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isTyping: true,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false); // Stop loading animation since typing has started!

      // Token-by-token typewriter animation stream
      let currentIdx = 0;
      const chunkSize = 3; // ~1 token (3-4 characters) per tick
      const speed = 12; // 12ms per tick for natural reading speed

      typingTimerRef.current = setInterval(() => {
        currentIdx += chunkSize;
        if (currentIdx >= fullReply.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, content: fullReply, isTyping: false } : m
            )
          );
        } else {
          const partial = fullReply.slice(0, currentIdx);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, content: partial, isTyping: true } : m
            )
          );
        }
      }, speed);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ Terjadi kendala saat menghubungi asisten AI: ${err.message || "Koneksi terputus"}. Silakan coba kirim ulang.`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isTyping: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsLoading(false);
    } finally {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (confirm("Apakah Anda yakin ingin membersihkan percakapan ini?")) {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setMessages([]);
      sessionStorage.removeItem(`sipena_chat_${role}`);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-6xl mx-auto w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* 1. Header Bar */}
      <header className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#181343] tracking-tight">
                SIPENA AI Advisor
              </h2>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Drizzle DB
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isPartner
                ? "Proposal & Opportunity Co-Pilot untuk Mitra"
                : "Konsultan Perencanaan & Evaluasi Program ESG"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200/60 transition flex items-center gap-1.5"
              title="Bersihkan Percakapan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Chat</span>
            </button>
          )}
          <Badge variant={isPartner ? "purple" : "blue"} size="sm">
            {organizationName || (isPartner ? "Mitra NGO" : "Perusahaan Korporasi")}
          </Badge>
        </div>
      </header>

      {/* 2. Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60">
        {messages.length === 0 ? (
          // Empty State & Suggested Prompts
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 py-8">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
                <Bot className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-[#181343] tracking-tight">
                Halo, {userName}! 👋
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Saya adalah asisten cerdas SIPENA yang terhubung langsung ke basis data program,
                peluang CSR, dan standar keberlanjutan. Apa yang ingin Anda diskusikan hari ini?
              </p>
            </div>

            {/* Prompt Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {defaultPrompts.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.prompt)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-200 group flex items-start gap-3.5 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-normal">
                        {p.prompt}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // Message List
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${
                  msg.role === "user" ? "items-end text-right" : "items-start text-left"
                }`}
              >
                {/* Bubble */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#181343] text-white rounded-br-xs shadow-md shadow-indigo-950/10"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-sm"
                  }`}
                >
                  {/* Tool Call Badges if any */}
                  {msg.toolCallsMade && msg.toolCallsMade.length > 0 && (
                    <div className="mb-3 flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Data Diakses:
                      </span>
                      {msg.toolCallsMade.map((toolName, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-mono font-semibold border border-emerald-200/50"
                        >
                          ⚡ {toolName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Content Rendered with MarkdownRenderer */}
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-wrap leading-relaxed text-sm select-text">
                      {msg.content}
                    </div>
                  ) : (
                    <MarkdownRenderer content={msg.content} isTyping={msg.isTyping} />
                  )}

                  {/* Skip typing button */}
                  {msg.isTyping && (
                    <button
                      onClick={() => handleSkipTyping(msg.id, msg.fullContent)}
                      className="mt-2 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 underline transition flex items-center gap-1"
                    >
                      ⚡ Tampilkan teks langsung
                    </button>
                  )}

                  {/* Render Structured Interactive Cards once typing completes */}
                  {!msg.isTyping && msg.cards && msg.cards.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-300">
                      {msg.cards.map((card, cIdx) => {
                        // 1. Opportunities Card
                        if (card.type === "OPPORTUNITIES" && card.items) {
                          return (
                            <div key={cIdx} className="space-y-2.5">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                📌 Kartu Rekomendasi Peluang:
                              </span>
                              <div className="grid grid-cols-1 gap-2.5">
                                {card.items.slice(0, 3).map((item: any, itemIdx: number) => (
                                  <div
                                    key={itemIdx}
                                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500/60 transition group text-left"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <h5 className="font-extrabold text-slate-900 text-xs group-hover:text-emerald-700 transition">
                                          {item.title}
                                        </h5>
                                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                          <Building2 className="w-3 h-3 text-slate-400" />
                                          {item.companyName || item.company || "Perusahaan Korporasi"}
                                        </p>
                                      </div>
                                      <span className="px-2 py-0.5 rounded-md bg-teal-100/70 text-teal-800 text-[10px] font-bold">
                                        {item.focusArea}
                                      </span>
                                    </div>

                                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                                        <span>
                                          {item.estimatedBudget
                                            ? `Rp ${Number(item.estimatedBudget).toLocaleString("id-ID")}`
                                            : item.budget || "Fleksibel"}
                                        </span>
                                      </div>
                                      {onNavigate && (
                                        <button
                                          onClick={() =>
                                            onNavigate(isPartner ? "explore" : "opportunities")
                                          }
                                          className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px] hover:underline"
                                        >
                                          Buka Menu Peluang
                                          <ArrowRight className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        // 2. Proposals Card
                        if (card.type === "PROPOSALS" && card.items) {
                          return (
                            <div key={cIdx} className="space-y-2">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                📑 Status Proposal:
                              </span>
                              <div className="grid grid-cols-1 gap-2">
                                {card.items.slice(0, 3).map((item: any, pIdx: number) => (
                                  <div
                                    key={pIdx}
                                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-xs text-slate-900 truncate">
                                        {item.title}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                                        {item.status}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                      Peluang: {item.opportunityTitle || item.opportunity}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  )}
                </div>

                {/* Footer metadata & copy action */}
                <div
                  className={`flex items-center gap-2 text-[11px] text-slate-400 px-1 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === "assistant" && !msg.isTyping && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.fullContent || msg.content)}
                      className="p-1 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition flex items-center gap-1"
                      title="Salin Teks"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 text-[10px] font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Salin</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-white border border-slate-200/80 rounded-tl-xs shadow-sm flex items-center gap-2 text-slate-500 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
              <span className="font-medium ml-1">Menganalisis data & menyusun respon...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input & Action Bar */}
      <footer className="p-4 border-t border-slate-200/80 bg-white">
        <div className="relative rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isPartner
                ? "Tanyakan peluang CSR, bantuan draf proposal, atau status pengajuan..."
                : "Tanyakan ide program baru, rekapitulasi data program, atau kriteria evaluasi..."
            }
            className="w-full bg-transparent resize-none border-none focus:outline-hidden text-sm text-slate-800 placeholder:text-slate-400 px-2 py-1 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 px-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="hidden sm:inline">Tekan</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                Enter
              </kbd>
              <span className="hidden sm:inline">untuk mengirim,</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                Shift + Enter
              </kbd>
              <span className="hidden sm:inline">baris baru</span>
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
