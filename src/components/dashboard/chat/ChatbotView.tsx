"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  User,
  ArrowRight,
  Copy,
  Check,
  Compass,
  FileText,
  Activity,
  Lightbulb,
  Building2,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  MapPin,
  Plus,
  Users,
  Globe,
  Paperclip,
  X,
  FileUp,
} from "lucide-react";
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
  attachedDocument?: {
    fileName: string;
    fileSize: number;
    mimeType?: string;
  };
}

interface ChatbotViewProps {
  role: string;
  userName: string;
  organizationName?: string;
  onNavigate?: (menu: string) => void;
  onOpenCreateOpportunity?: (provinceName?: string, draftData?: any) => void;
}

const parseSdgsFromList = (sdgsList: any[]): number[] => {
  const result: number[] = [];
  if (!Array.isArray(sdgsList)) return result;
  sdgsList.forEach((item) => {
    if (typeof item === "number" && item >= 1 && item <= 17) {
      if (!result.includes(item)) result.push(item);
    } else if (typeof item === "string") {
      const match = item.match(/\b(?:SDG\s*)?(\d+)\b/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num >= 1 && num <= 17 && !result.includes(num)) result.push(num);
      }
    }
  });
  return result.sort((a, b) => a - b);
};

export function ChatbotView({
  role,
  userName,
  organizationName,
  onNavigate,
  onOpenCreateOpportunity,
}: ChatbotViewProps) {
  const isPartner = role === "PARTNER_ADMIN";
  const aiEnabled = isAiFeatureEnabled();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isNearBottomRef = useRef(true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowed = ["pdf", "docx", "doc"];
    if (!allowed.includes(ext)) {
      alert("Hanya berkas berformat PDF atau Word (.docx, .doc) yang didukung.");
      e.target.value = "";
      return;
    }

    const MAX_MB = 15;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Ukuran berkas terlalu besar. Maksimal ${MAX_MB}MB.`);
      e.target.value = "";
      return;
    }

    setAttachedFile(file);
  };

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
          icon: Globe,
          title: "Rekomendasi Wilayah Baru",
          subtitle: "Analisis provinsi belum terjangkau dan peluang ekspansi.",
          prompt: "Rekomendasikan ekspansi wilayah program CSR baru yang belum pernah dijangkau oleh perusahaan kami.",
        },
        {
          icon: Activity,
          title: "Rekap Program Aktif",
          subtitle: "Pantau serapan anggaran dan progres program berjalan.",
          prompt: "Berapa total serapan anggaran dan progres program CSR kita yang sedang berjalan?",
        },
        {
          icon: Lightbulb,
          title: "Rancang Inisiatif Baru",
          subtitle: "Konsep inisiatif strategis berbasis pilar ESG dan SDGs.",
          prompt: "Berikan 3 ide konsep program CSR inovatif yang selaras dengan prinsip ESG dan SDG 12",
        },
        {
          icon: FileText,
          title: "Evaluasi Proposal Masuk",
          subtitle: "Tinjau proposal mitra yang membutuhkan seleksi.",
          prompt: "Ada berapa proposal mitra yang statusnya masih UNDER_REVIEW?",
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
    const fileToUpload = attachedFile;

    if ((!text && !fileToUpload) || isLoading) return;

    // Reset attached file & input
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const displayText =
      text ||
      (fileToUpload
        ? `Tolong telaah dan analisis isi berkas "${fileToUpload.name}" ini, lalu berikan wawasan, ringkasan, atau rekomendasi program CSR yang relevan.`
        : "");

    setLastUserPrompt(displayText);

    // Stop any active typing
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: displayText,
      attachedDocument: fileToUpload
        ? {
            fileName: fileToUpload.name,
            fileSize: fileToUpload.size,
            mimeType: fileToUpload.type,
          }
        : undefined,
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
      let res: Response;

      if (fileToUpload) {
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append(
          "messages",
          JSON.stringify(
            newMessages.map((m) => ({
              role: m.role,
              content: m.content,
              attachedDocument: m.attachedDocument,
            }))
          )
        );
        formData.append(
          "context",
          JSON.stringify({
            currentPage: typeof window !== "undefined" ? window.location.pathname : undefined,
          })
        );

        res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });
      } else {
        res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
              attachedDocument: m.attachedDocument,
            })),
          }),
        });
      }

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
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setMessages([]);
    setIsConfirmingReset(false);
    sessionStorage.removeItem(`sipena_chat_${role}`);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayName = organizationName || userName;

  return (
    <div className="w-full h-full flex-1 flex flex-col max-w-[1120px] mx-auto bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. HEADER AI (Clean, Sederhana, Tanpa Jargon Teknis) */}
      {/* ========================================================================= */}
      <header className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#181343] text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#181343] tracking-tight truncate">
                SIPENA AI Advisor
              </h2>
              {aiEnabled ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/70 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                  Siap Membantu
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200/70 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Fitur AI Nonaktif
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {isPartner
                ? "Asisten kolaborasi CSR untuk mitra pelaksana"
                : "Konsultan perencanaan & evaluasi portofolio CSR/ESG"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            isConfirmingReset ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                >
                  Ya, Bersihkan
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-[#E5E7EB] transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingReset(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-[#E5E7EB] transition flex items-center gap-1.5 cursor-pointer"
                title="Bersihkan Percakapan"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Percakapan</span>
              </button>
            )
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CHAT MESSAGES AREA (Scroll Independen, Tanpa Double Scrollbar) */}
      {/* ========================================================================= */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#F9F9FB] flex flex-col"
      >
        {messages.length === 0 ? (
          /* ========================================================================= */
          /* EMPTY STATE: CLEAN WELCOME & 4 QUICK PROMPTS */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center space-y-7 py-6 my-auto">
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl sm:text-2xl font-black text-[#181343] tracking-tight">
                Halo, {displayName}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isPartner
                  ? "Saya siap membantu Anda menemukan peluang CSR, menyusun draf proposal, dan memantau perkembangan pengajuan kerja sama."
                  : "Saya siap membantu menelaah rekap program berjalan, merancang inisiatif CSR baru, mengevaluasi proposal mitra, dan menyiapkan indikator ESG."}
              </p>
            </div>

            {/* Grid 2x2 Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
              {defaultPrompts.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p.prompt)}
                    className="p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#059669]/60 transition-colors flex items-start gap-3 text-left group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 group-hover:bg-[#059669] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#181343] group-hover:text-[#059669] transition leading-snug">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-normal">
                        {p.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#059669] shrink-0 self-center transition-transform group-hover:translate-x-0.5" />
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
                    <div className="space-y-2 select-text font-normal text-left">
                      {msg.attachedDocument && (
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/15 border border-white/20 text-xs">
                          <FileText className="w-4 h-4 text-emerald-300 shrink-0" />
                          <div className="truncate flex-1 min-w-0">
                            <span className="font-semibold text-white truncate block">
                              {msg.attachedDocument.fileName}
                            </span>
                            <span className="text-[10px] text-emerald-200">
                              {(msg.attachedDocument.fileSize / 1024).toFixed(1)} KB (Dokumen Terlampir)
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
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
                      className="mt-2 text-[11px] font-semibold text-[#059669] hover:underline transition flex items-center gap-1 cursor-pointer"
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
                                    className="p-3 rounded-xl bg-slate-50 border border-[#E5E7EB] hover:border-[#059669]/50 transition text-left space-y-1.5"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <h5 className="font-bold text-[#181343] text-xs">
                                          {item.title}
                                        </h5>
                                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                          <Building2 className="w-3 h-3 text-slate-400" />
                                          {item.companyName || item.company || "Perusahaan Mitra"}
                                        </p>
                                      </div>
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[10px] font-bold shrink-0">
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
                                          className="text-[#059669] hover:text-[#047857] hover:underline font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                                        >
                                          <span>{isPartner ? "Lihat di Eksplorasi" : "Lihat Katalog"}</span>
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

                        // 3. Territory Expansion Card (Rekomendasi Ekspansi Wilayah Baru)
                        if (card.type === "TERRITORY_EXPANSION" && card.recommendations) {
                          return (
                            <div key={cIdx} className="space-y-2.5 mt-2">
                              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/70">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-[#181343] text-emerald-400 flex items-center justify-center shrink-0">
                                    <MapPin className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-xs text-[#181343]">
                                      Analisis Jangkauan Peta Nasional
                                    </h5>
                                    <p className="text-[11px] text-slate-600">
                                      Terjangkau: <span className="font-bold text-emerald-700">{card.coveredCount}</span> dari {card.totalNational} provinsi ({card.unreachedCount} provinsi belum pernah terjangkau)
                                    </p>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-white text-[#181343] text-[10px] font-bold border border-slate-200 shrink-0">
                                  {Math.round(((card.coveredCount || 0) / (card.totalNational || 38)) * 100)}% Cakupan
                                </span>
                              </div>

                              <div className="grid grid-cols-1 gap-2">
                                {card.recommendations.map((rec: any, rIdx: number) => (
                                  <div
                                    key={rIdx}
                                    className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#059669]/60 transition shadow-2xs space-y-2 text-left"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-extrabold text-[#181343] text-xs">
                                            {rec.province}
                                          </span>
                                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {rec.island}
                                          </span>
                                        </div>
                                        <h6 className="text-[11px] font-bold text-emerald-800 mt-1">
                                          {rec.proposedProgramTitle}
                                        </h6>
                                      </div>
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold shrink-0">
                                        {rec.focusArea ? rec.focusArea.replace(/_/g, " ") : "UMUM"}
                                      </span>
                                    </div>

                                    <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                                      <strong className="text-slate-700">Urgensi Daerah: </strong>
                                      {rec.urgencyTopic}
                                    </p>

                                    {rec.sdgs && rec.sdgs.length > 0 && (
                                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                        <span className="text-[10px] font-bold text-slate-400 mr-1">SDGs:</span>
                                        {rec.sdgs.map((sdg: string, sIdx: number) => (
                                          <span
                                            key={sIdx}
                                            className="px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60"
                                          >
                                            {sdg}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                                      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                        <span>
                                          {rec.verifiedPartnersCount > 0
                                            ? `${rec.verifiedPartnersCount} mitra lokal terverifikasi`
                                            : "Peluang terbuka untuk mitra lokal"}
                                        </span>
                                      </div>

                                      {onOpenCreateOpportunity && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const sdgNums = parseSdgsFromList(rec.sdgs);
                                            onOpenCreateOpportunity(rec.province, {
                                              title: rec.proposedProgramTitle,
                                              targetProvince: rec.province,
                                              focusArea: rec.focusArea,
                                              description: `Program CSR "${rec.proposedProgramTitle}" diinisiasi sebagai langkah strategis ekspansi jangkauan wilayah berkelanjutan di Provinsi ${rec.province} (${rec.island}).\n\nUrgensi Kebutuhan Daerah:\n${rec.urgencyTopic}\n\nKomitmen Dampak:\nMendorong pemberdayaan inklusif dan kolaborasi bersama pemangku kepentingan serta mitra lokal terverifikasi di wilayah sasaran.`,
                                              sdgs: sdgNums,
                                            });
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer shrink-0"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Buat Peluang di Sini</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        // 4. Survey Recommendations Card (Rekomendasi Berdasarkan Survei Wilayah)
                        if (card.type === "SURVEY_PROGRAM_RECOMMENDATIONS" && card.recommendations) {
                          return (
                            <div key={cIdx} className="space-y-3 mt-3">
                              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-[#181343] text-emerald-400 flex items-center justify-center shrink-0">
                                    <FileUp className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h5 className="font-bold text-xs text-[#181343]">
                                        Hasil Telaah Dokumen &amp; Rekomendasi
                                      </h5>
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        {card.detectedProvince || "Provinsi Teridentifikasi"}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                      Berkas: <span className="font-semibold">{card.fileName}</span> ({(card.fileSize / 1024).toFixed(1)} KB)
                                    </p>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-white text-[#059669] text-[10px] font-extrabold border border-emerald-200 shrink-0">
                                  {card.recommendations.length} Usulan Program
                                </span>
                              </div>

                              <div className="grid grid-cols-1 gap-2.5">
                                {card.recommendations.map((rec: any, rIdx: number) => (
                                  <div
                                    key={rIdx}
                                    className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#059669]/60 transition shadow-2xs space-y-2.5 text-left"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-extrabold text-[#181343] text-xs">
                                            {rec.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                                          <MapPin className="w-3 h-3 text-emerald-600" />
                                          <span>Wilayah Sasaran: <strong>{rec.province}</strong></span>
                                        </div>
                                      </div>
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold shrink-0">
                                        {rec.focusArea ? rec.focusArea.replace(/_/g, " ") : "UMUM"}
                                      </span>
                                    </div>

                                    <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                                      <strong className="text-slate-700">Urgensi Isu Lapangan: </strong>
                                      {rec.urgencyReason}
                                    </p>

                                    {rec.sdgs && rec.sdgs.length > 0 && (
                                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                        <span className="text-[10px] font-bold text-slate-400 mr-1">Sasaran SDGs:</span>
                                        {rec.sdgs.map((sdg: string, sIdx: number) => (
                                          <span
                                            key={sIdx}
                                            className="px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60"
                                          >
                                            {sdg}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                                      <span className="text-slate-400 text-[10px]">
                                        Disesuaikan dengan temuan survei
                                      </span>

                                      {onOpenCreateOpportunity && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const sdgNums = parseSdgsFromList(rec.sdgs);
                                            onOpenCreateOpportunity(rec.province, {
                                              title: rec.title,
                                              targetProvince: rec.province,
                                              focusArea: rec.focusArea,
                                              description: `Inisiatif program CSR "${rec.title}" dirancang berdasarkan telaah berkas survei kondisi dan kebutuhan wilayah di ${rec.province}.\n\nLatar Belakang & Urgensi Lapangan:\n${rec.urgencyReason}\n\nFokus Sasaran & Dampak:\nProgram ini diarahkan untuk mempercepat pemenuhan kebutuhan riil warga lokal dan pencapaian target SDGs prioritas melalui kemitraan strategis dengan organisasi pelaksana yang terverifikasi.`,
                                              sdgs: sdgNums,
                                            });
                                          }}
                                          className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          <span>Buat Peluang CSR Berdasarkan Rekomendasi Ini</span>
                                        </button>
                                      )}
                                    </div>
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
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] rounded-tl-xs flex items-center gap-2 text-slate-500 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-[#059669] animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-[#059669] animate-bounce"
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
      <footer className="p-3 sm:p-4 border-t border-[#E5E7EB] bg-white shrink-0">
        {!aiEnabled && (
          <div className="mb-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="leading-snug">
              Fitur AI Advisor saat ini dinonaktifkan oleh administrator melalui konfigurasi lingkungan (<code>ENABLE_AI_FEATURES=false</code>).
            </span>
          </div>
        )}
        <div className="rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] focus-within:border-[#059669] focus-within:ring-2 focus-within:ring-[#059669]/20 transition-all p-2 space-y-2">
          {/* File Attachment Chip Preview */}
          {attachedFile && (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 truncate min-w-0">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold truncate">{attachedFile.name}</span>
                <span className="text-[11px] text-emerald-700/80 shrink-0">
                  ({(attachedFile.size / 1024).toFixed(1)} KB)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-extrabold shrink-0">
                  Dokumen
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttachedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1 rounded-md text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100/80 transition cursor-pointer shrink-0"
                title="Hapus berkas"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
                : attachedFile
                ? `Berkas "${attachedFile.name}" siap dianalisis. Tekan Kirim atau tambahkan instruksi khusus...`
                : isPartner
                ? "Tanyakan peluang CSR, bantuan draf proposal, atau status pengajuan..."
                : "Tanyakan ide program baru, rekapitulasi data program, atau unggah dokumen..."
            }
            className="w-full bg-transparent resize-none border-none focus:outline-hidden text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 px-2 py-1 leading-relaxed max-h-32 disabled:opacity-60 disabled:cursor-not-allowed"
          />

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 px-1 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || !aiEnabled}
                className="px-3 py-1.5 rounded-xl bg-emerald-50/90 hover:bg-emerald-100 text-[#007A5A] hover:text-emerald-950 border border-emerald-300/80 hover:border-emerald-400 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                title="Unggah berkas dokumen (PDF / Word)"
              >
                <Paperclip className="w-4 h-4 text-[#007A5A] shrink-0" />
                <span>Unggah Dokumen</span>
              </button>

              <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
                <span>Tekan</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-medium">
                  Enter
                </kbd>
                <span>untuk kirim</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={(!inputText.trim() && !attachedFile) || isLoading || !aiEnabled}
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
