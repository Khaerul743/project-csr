"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  RotateCcw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  fullContent?: string;
  isTyping?: boolean;
  cards?: any[];
  toolCallsMade?: string[];
  timestamp: string;
  isError?: boolean;
  failedPrompt?: string;
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
  const aiEnabled = isAiFeatureEnabled();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isNearBottomRef = useRef(true);

  // 4 Standardized Quick Prompts for NGO Mitra
  const defaultPrompts = isPartner
    ? [
        {
          icon: Compass,
          title: "Temukan Peluang CSR",
          subtitle: "Cari peluang sesuai keahlian dan wilayah lembaga.",
          prompt:
            "Rekomendasikan peluang CSR yang sedang dibuka di SIPENA yang relevan dengan fokus keahlian dan wilayah kerja lembaga kami.",
        },
        {
          icon: Lightbulb,
          title: "Bantu Susun Proposal",
          subtitle: "Kembangkan ide, metodologi, dan target program.",
          prompt:
            "Bantu kami mengembangkan ide proposal inisiatif CSR, rancangan metodologi pelaksanaan, dan target penerima manfaat.",
        },
        {
          icon: FileText,
          title: "Cek Status Proposal",
          subtitle: "Lihat perkembangan pengajuan dan catatan revisi.",
          prompt:
            "Bagaimana status pengajuan proposal lembaga kami saat ini dan apakah terdapat catatan evaluasi atau revisi dari perusahaan?",
        },
        {
          icon: CheckCircle2,
          title: "Evaluasi Kesiapan Proposal",
          subtitle: "Periksa kelengkapan dan kesesuaian pengajuan.",
          prompt:
            "Berikan panduan evaluasi kesiapan proposal sebelum diajukan, mencakup kelengkapan TOR, estimasi RAB, dan keselarasan dengan target SDGs.",
        },
      ]
    : [
        {
          icon: Activity,
          title: "Rekap Program Aktif",
          subtitle: "Pantau serapan anggaran dan progres program berjalan.",
          prompt: "Berapa total serapan anggaran dan progres program CSR kita yang sedang berjalan?",
        },
        {
          icon: Lightbulb,
          title: "Rancang Inisiatif Baru",
          subtitle: "Konsep inisiatif strategis berbasis POJK 51 dan SDGs.",
          prompt: "Berikan 3 ide konsep program CSR inovatif yang selaras dengan POJK 51 dan SDG 12",
        },
        {
          icon: FileText,
          title: "Evaluasi Proposal Masuk",
          subtitle: "Tinjau proposal mitra yang membutuhkan seleksi.",
          prompt: "Ada berapa proposal mitra yang statusnya masih UNDER_REVIEW?",
        },
        {
          icon: CheckCircle2,
          title: "Indikator ESG & Dampak",
          subtitle: "Panduan pengukuran dampak sosial-lingkungan terukur.",
          prompt: "Panduan indikator keberlanjutan terukur untuk laporan tahunan CSR",
        },
      ];

  // Detect user scroll position to avoid forceful auto-scroll disruption
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    isNearBottomRef.current = distanceFromBottom < 100;
  }, []);

  // Smooth scroll to bottom if user is already near bottom or just sent a message
  const scrollToBottomIfNeeded = useCallback((force = false) => {
    if (force || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottomIfNeeded();
  }, [messages, isLoading, scrollToBottomIfNeeded]);

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
    scrollToBottomIfNeeded(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setLastUserPrompt(text);

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

    // Filter out previous error messages and finalize uncompleted typing
    const newMessages = [
      ...messages
        .filter((m) => !m.isError)
        .map((m) =>
          m.isTyping ? { ...m, content: m.fullContent || m.content, isTyping: false } : m
        ),
      userMsg,
    ];

    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);
    setTimeout(() => scrollToBottomIfNeeded(true), 50);

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
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || "Gagal mendapatkan respon dari asisten AI");
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
      setIsLoading(false);

      // Token-by-token typewriter animation
      let currentIdx = 0;
      const chunkSize = 3;
      const speed = 12;

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
        content: `Terjadi kendala saat menghubungi asisten AI: ${
          err.message || "Koneksi terputus"
        }. Silakan coba kirim ulang.`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isTyping: false,
        isError: true,
        failedPrompt: text,
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
    if (confirm("Bersihkan seluruh riwayat percakapan ini?")) {
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

  const displayName = organizationName || userName;

  return (
    <div className="flex flex-col h-full w-full max-w-[1120px] mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. HEADER AI (Clean, Sederhana, Tanpa Jargon Teknis) */}
      {/* ========================================================================= */}
      <header className="px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Ikon AI SIPENA Resmi */}
          <div className="w-9 h-9 rounded-xl bg-[#181343] text-emerald-400 flex items-center justify-center border border-[#26224C] shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#181343] tracking-tight truncate">
                SIPENA AI Advisor
              </h2>
              {/* Indikator Ketersediaan Layanan (Clean & Nyata) */}
              {aiEnabled ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Siap Membantu
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200/60 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Fitur AI Nonaktif
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {isPartner
                ? "Asisten kolaborasi CSR untuk mitra"
                : "Konsultan perencanaan & evaluasi program ESG"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/70 transition flex items-center gap-1.5 cursor-pointer"
              title="Bersihkan Percakapan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Percakapan</span>
            </button>
          )}

          <Badge variant={isPartner ? "emerald" : "blue"} size="sm" className="hidden sm:inline-flex">
            {organizationName || (isPartner ? "Mitra Pelaksana" : "Perusahaan Korporasi")}
          </Badge>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CHAT MESSAGES AREA (Scroll Independen, Tanpa Double Scrollbar) */}
      {/* ========================================================================= */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#F9F9FB]"
      >
        {messages.length === 0 ? (
          /* ========================================================================= */
          /* EMPTY STATE: PROPORTIONAL WELCOME SECTION & 4 QUICK PROMPTS */
          /* ========================================================================= */
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center space-y-6 py-4">
            {/* Welcome Box with subtle flowing glow ornament */}
            <div className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-white via-white to-slate-50/70 border border-slate-200/80 shadow-2xs w-full overflow-hidden space-y-3">
              {/* Soft subtle glow accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#181343]/5 rounded-full blur-2xl pointer-events-none" />

              {/* Icon */}
              <div className="w-11 h-11 rounded-2xl bg-[#181343] text-emerald-400 flex items-center justify-center mx-auto shadow-sm border border-[#26224C]">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>

              {/* Heading: Nama Resmi Organisasi */}
              <h3 className="text-lg sm:text-xl font-bold text-[#181343] tracking-tight">
                Halo, {displayName}!
              </h3>

              {/* Deskripsi Resmi */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                Saya siap membantu Anda menemukan peluang CSR, menyusun ide proposal, dan memahami perkembangan pengajuan kerja sama.
              </p>
            </div>

            {/* Grid 2x2 Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {defaultPrompts.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p.prompt)}
                    className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 hover:border-[#009E75]/50 hover:shadow-xs transition-all flex items-start gap-3 text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#009E75] flex items-center justify-center shrink-0 group-hover:bg-[#009E75] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#009E75] transition leading-snug">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-normal">
                        {p.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#009E75] shrink-0 self-center transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MESSAGE LIST */
          /* ========================================================================= */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-[#181343] text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-[#26224C]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] space-y-1.5 ${
                  msg.role === "user" ? "items-end text-right" : "items-start text-left"
                }`}
              >
                {/* Bubble Message */}
                <div
                  className={`p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed rounded-2xl ${
                    msg.role === "user"
                      ? "bg-[#181343] text-white rounded-br-xs shadow-xs font-normal"
                      : msg.isError
                      ? "bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs shadow-xs font-normal"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs font-normal"
                  }`}
                >
                  {/* Tool Call Badges jika ada pengambilan data riil */}
                  {msg.toolCallsMade && msg.toolCallsMade.length > 0 && (
                    <div className="mb-2.5 flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Data Terverifikasi:
                      </span>
                      {msg.toolCallsMade.map((toolName, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-mono font-medium border border-emerald-200/60"
                        >
                          ✓ {toolName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Konten Pesan */}
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-wrap leading-relaxed select-text font-normal">
                      {msg.content}
                    </div>
                  ) : msg.isError ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-800 font-medium">{msg.content}</p>
                      </div>
                      {msg.failedPrompt && (
                        <button
                          type="button"
                          onClick={() => handleSendMessage(msg.failedPrompt)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Coba Lagi</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <MarkdownRenderer content={msg.content} isTyping={msg.isTyping} />
                  )}

                  {/* Tombol Tampilkan Teks Langsung saat mengetik */}
                  {msg.isTyping && (
                    <button
                      onClick={() => handleSkipTyping(msg.id, msg.fullContent)}
                      className="mt-2 text-[11px] font-semibold text-[#009E75] hover:underline transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Tampilkan teks langsung</span>
                    </button>
                  )}

                  {/* Render Structured Interactive Cards */}
                  {!msg.isTyping && msg.cards && msg.cards.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-200">
                      {msg.cards.map((card, cIdx) => {
                        // 1. Opportunities Card
                        if (card.type === "OPPORTUNITIES" && card.items) {
                          return (
                            <div key={cIdx} className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Rujukan Peluang Terkait:
                              </span>
                              <div className="grid grid-cols-1 gap-2">
                                {card.items.slice(0, 3).map((item: any, itemIdx: number) => (
                                  <div
                                    key={itemIdx}
                                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#009E75]/60 transition text-left space-y-1.5"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <h5 className="font-bold text-slate-900 text-xs">
                                          {item.title}
                                        </h5>
                                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                          <Building2 className="w-3 h-3 text-slate-400" />
                                          {item.companyName || item.company || "Perusahaan Mitra"}
                                        </p>
                                      </div>
                                      <span className="px-2 py-0.5 rounded-md bg-teal-100/70 text-teal-800 text-[10px] font-bold shrink-0">
                                        {item.focusArea}
                                      </span>
                                    </div>

                                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                      <span className="text-slate-600 font-semibold">
                                        {item.estimatedBudget
                                          ? `Rp ${Number(item.estimatedBudget).toLocaleString("id-ID")}`
                                          : item.budget || "Fleksibel"}
                                      </span>
                                      {onNavigate && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onNavigate(isPartner ? "explore" : "opportunities")
                                          }
                                          className="text-[#009E75] hover:underline font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                                        >
                                          <span>Lihat di Eksplorasi</span>
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
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Status Proposal Anda:
                              </span>
                              <div className="grid grid-cols-1 gap-2">
                                {card.items.slice(0, 3).map((item: any, pIdx: number) => (
                                  <div
                                    key={pIdx}
                                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left"
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
                                      Inisiatif: {item.opportunityTitle || item.opportunity}
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

                {/* Footer Metadata & Salin Teks */}
                <div
                  className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === "assistant" && !msg.isTyping && !msg.isError && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.fullContent || msg.content)}
                      className="p-1 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition flex items-center gap-1 cursor-pointer"
                      title="Salin Teks"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 text-[10px] font-semibold">Tersalin</span>
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
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-[#181343] text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-[#26224C]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 rounded-tl-xs shadow-xs flex items-center gap-2 text-slate-500 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#009E75] animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-[#009E75] animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-[#009E75] animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
              <span className="font-normal text-slate-500 ml-1">
                SIPENA AI sedang menelaah data &amp; menyusun respon...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================================= */}
      {/* 3. INPUT COMPOSER (Tersemat di Bagian Bawah, Selalu Terjangkau) */}
      {/* ========================================================================= */}
      <footer className="p-3 sm:p-4 border-t border-slate-200/80 bg-white shrink-0">
        {!aiEnabled && (
          <div className="mb-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="leading-snug">
              Fitur AI Advisor saat ini dinonaktifkan oleh administrator melalui konfigurasi lingkungan (<code>ENABLE_AI_FEATURES=false</code>).
            </span>
          </div>
        )}
        <div className="rounded-xl bg-slate-50/90 border border-slate-200 focus-within:border-[#009E75] focus-within:ring-1 focus-within:ring-[#009E75]/30 transition-all p-2 space-y-1.5">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!aiEnabled}
            placeholder={
              !aiEnabled
                ? "Fitur AI saat ini sedang dinonaktifkan via environment variable..."
                : isPartner
                ? "Tanyakan peluang CSR, bantuan draf proposal, atau status pengajuan..."
                : "Tanyakan ide program baru, rekapitulasi data program, atau kriteria evaluasi..."
            }
            className="w-full bg-transparent resize-none border-none focus:outline-hidden text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 px-2 py-1 leading-relaxed max-h-32 disabled:opacity-60 disabled:cursor-not-allowed"
          />

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 px-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="hidden sm:inline">Tekan</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-medium">
                Enter
              </kbd>
              <span className="hidden sm:inline">untuk mengirim,</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-medium">
                Shift + Enter
              </kbd>
              <span className="hidden sm:inline">baris baru</span>
            </div>

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading || !aiEnabled}
              className="px-4 py-1.5 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
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
