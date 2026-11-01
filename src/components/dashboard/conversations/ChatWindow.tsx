"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  X,
  FileText,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Loader2,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ConversationListItem,
  MessageWithSender,
  COLLABORATION_STATUS_CONFIG,
} from "./types";
import { OrganizationAvatar } from "./ConversationList";

interface ChatWindowProps {
  activeConversation: ConversationListItem | null;
  messages: MessageWithSender[];
  currentUserId: string;
  userRole: "CSR_ADMIN" | "PARTNER_ADMIN";
  onSendMessage: (
    content: string,
    attachmentUrl?: string | null,
    attachmentName?: string | null
  ) => Promise<void>;
  onViewCollaborationDetails?: (collaborationId: string) => void;
  isLoadingMessages: boolean;
  isSending: boolean;
}

function getDateGroupLabel(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) return "Hari Ini";

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Kemarin";

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function ChatWindow({
  activeConversation,
  messages,
  currentUserId,
  userRole,
  onSendMessage,
  onViewCollaborationDetails,
  isLoadingMessages,
  isSending,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When active conversation changes, reset input error
  useEffect(() => {
    setSendError(null);
    setUploadError(null);
  }, [activeConversation?.collaborationId]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F9F9FB]/60 text-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E8EA] flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
          <MessageSquare className="w-5 h-5 text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-[#181343] mb-1">
          Pilih Percakapan
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Pilih salah satu kemitraan di panel sebelah kiri untuk melihat pesan dan berkoordinasi.
        </p>
      </div>
    );
  }

  const targetName =
    userRole === "CSR_ADMIN"
      ? activeConversation.partnerName
      : activeConversation.companyName;
  const targetLogo =
    userRole === "CSR_ADMIN"
      ? activeConversation.partnerLogo
      : activeConversation.companyLogo;

  const statusCfg =
    COLLABORATION_STATUS_CONFIG[activeConversation.collaborationStatus] || {
      label: activeConversation.collaborationStatus,
      variant: "slate" as const,
    };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Ukuran berkas maksimal 10MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah berkas");
      }

      setAttachment({
        url: json.data.url,
        name: file.name,
      });
    } catch (err: any) {
      setUploadError(err.message || "Gagal mengunggah berkas lampiran");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachment) || isSending || isUploading) return;

    const textToSend = inputText.trim();
    const currentAttachment = attachment;

    setSendError(null);

    try {
      await onSendMessage(
        textToSend || "Melampirkan dokumen:",
        currentAttachment?.url || null,
        currentAttachment?.name || null
      );
      // Bersihkan input HANYA setelah pengiriman berhasil
      setInputText("");
      setAttachment(null);
      setUploadError(null);
    } catch (err: any) {
      setSendError(err.message || "Gagal mengirim pesan. Silakan coba kembali.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FDFDFE] overflow-hidden">
      {/* ============================================================ */}
      {/* 1. HEADER PERCAKAPAN (Clean, Sederhana, Tanpa Anggaran)       */}
      {/* ============================================================ */}
      <div className="p-3.5 sm:p-4 bg-white border-b border-[#E8E8EA] flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <OrganizationAvatar
            logoUrl={targetLogo}
            name={targetName}
            size="md"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-extrabold text-[#181343] truncate">
                {targetName}
              </h2>
              <Badge variant={statusCfg.variant} size="sm">
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-teal-800 font-semibold truncate">
              {activeConversation.opportunityTitle}
            </p>
          </div>
        </div>

        {/* Tombol Detail Kerja Sama */}
        {onViewCollaborationDetails && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onViewCollaborationDetails(activeConversation.collaborationId)
            }
            className="text-xs font-bold border-[#E8E8EA] text-[#181343] hover:text-[#009E75] hover:border-emerald-300 hover:bg-emerald-50 rounded-xl shrink-0 transition-all cursor-pointer"
            leftIcon={<FileText className="w-3.5 h-3.5 text-teal-700" />}
          >
            Detail Kerja Sama
          </Button>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. AREA PESAN (Stream + Empty State Kontekstual)             */}
      {/* ============================================================ */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            <span className="text-xs font-semibold">Memuat riwayat percakapan...</span>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State Berdasarkan Status Kemitraan (Requirement 4) */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-3 shadow-2xs">
              <MessageSquare className="w-5 h-5 text-teal-600" />
            </div>

            {activeConversation.collaborationStatus === "AGREED" ? (
              <div className="max-w-sm space-y-1">
                <h3 className="text-sm font-bold text-[#181343]">
                  Mulai Koordinasi dengan Mitra
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gunakan percakapan ini untuk berkomunikasi dan berkoordinasi terkait kerja sama yang telah disepakati.
                </p>
              </div>
            ) : (
              <div className="max-w-sm space-y-1">
                <h3 className="text-sm font-bold text-[#181343]">
                  Mulai Diskusi Kerja Sama
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gunakan ruang ini untuk membahas proposal, anggaran, dan kebutuhan kolaborasi bersama mitra.
                </p>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const isImageAttachment =
              msg.attachmentUrl &&
              /\.(jpg|jpeg|png|webp|gif)$/i.test(msg.attachmentUrl);

            // Pengelompokan pesan berdasarkan tanggal (Requirement 5)
            const messageDateKey = new Date(msg.createdAt)
              .toISOString()
              .substring(0, 10);
            const prevMessageDateKey =
              idx > 0
                ? new Date(messages[idx - 1].createdAt)
                    .toISOString()
                    .substring(0, 10)
                : null;
            const showDateDivider = messageDateKey !== prevMessageDateKey;

            return (
              <React.Fragment key={msg.id}>
                {showDateDivider && (
                  <div className="flex items-center justify-center my-3 select-none">
                    <span className="px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-[10px] font-bold text-slate-500">
                      {getDateGroupLabel(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  {/* Nama Pengirim untuk Pesan Mitra */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-bold text-[#181343]">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold uppercase border border-slate-200/80">
                        {msg.senderRole === "CSR_ADMIN"
                          ? "CSR Perusahaan"
                          : "Mitra Pelaksana"}
                      </span>
                    </div>
                  )}

                  {/* Bubble Pesan (Subtle, Compact, Rounded Medium) */}
                  <div
                    className={`max-w-[85%] md:max-w-[72%] rounded-2xl p-3 shadow-2xs space-y-1.5 ${
                      isMe
                        ? "bg-[#181343] text-white rounded-tr-xs"
                        : "bg-[#F4F4F6] text-[#181343] border border-[#E8E8EA] rounded-tl-xs"
                    }`}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap break-words font-normal">
                      {msg.content}
                    </p>

                    {/* Pratinjau Lampiran Dokumen / Gambar */}
                    {msg.attachmentUrl && (
                      <div
                        className={`p-2 rounded-xl border flex items-center gap-2 mt-1 ${
                          isMe
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-white border-[#E8E8EA] text-[#181343]"
                        }`}
                      >
                        {isImageAttachment ? (
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-black/10">
                            <img
                              src={msg.attachmentUrl}
                              alt="Lampiran"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isMe ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold block truncate">
                            {msg.attachmentName || "Dokumen Lampiran"}
                          </span>
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`text-[10px] font-semibold underline inline-flex items-center gap-1 ${
                              isMe
                                ? "text-emerald-300 hover:text-white"
                                : "text-teal-700 hover:text-teal-900"
                            }`}
                          >
                            <span>Buka Berkas</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Footer Pesan: Jam & Centang Pengiriman */}
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] ${
                        isMe ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {isMe && (
                        msg.isRead ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-white/70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ============================================================ */}
      {/* 3. COMPOSER PESAN (Sticky, Input Nyaman, Penanganan Error)   */}
      {/* ============================================================ */}
      {attachment && (
        <div className="px-4 py-2 bg-[#EDF9F3] border-t border-[#35B98E]/40 flex items-center justify-between text-xs text-emerald-900 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="font-bold truncate">Lampiran: {attachment.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadError && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center gap-2 text-xs text-rose-700 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {sendError && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-700 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{sendError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSendError(null)}
            className="p-1 hover:bg-rose-100 rounded text-rose-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-[#E8E8EA] flex items-end gap-2 shrink-0"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />

        {/* Tombol Lampiran */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSending}
          title="Lampirkan Dokumen atau Gambar"
          className="p-2.5 rounded-xl border border-[#E8E8EA] text-slate-500 hover:text-[#181343] hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#009E75]" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>

        {/* Input Textarea Nyaman */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Tulis pesan (Enter untuk kirim, Shift+Enter untuk baris baru)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-xs text-[#181343] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009E75]/20 focus:border-[#009E75] transition-all resize-none max-h-32 leading-relaxed bg-[#F9F9FB]"
          />
        </div>

        {/* Tombol Kirim Pesan */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={(!inputText.trim() && !attachment) || isSending || isUploading}
          className="bg-[#009E75] hover:bg-[#008764] text-white rounded-xl h-10 px-4 shrink-0 shadow-2xs disabled:opacity-40 cursor-pointer"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
