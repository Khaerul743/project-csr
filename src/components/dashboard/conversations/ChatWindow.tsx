"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Building2,
  HeartHandshake,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ConversationListItem,
  MessageWithSender,
  COLLABORATION_STATUS_CONFIG,
} from "./types";
import { formatRupiah, formatDate } from "../analytics/helpers";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 text-center text-slate-400">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Paperclip className="w-8 h-8 opacity-40 rotate-45" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-1">
          Pilih Percakapan untuk Memulai Diskusi
        </h3>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          Pilih salah satu mitra atau inisiatif program di panel sebelah kiri untuk
          bernegosiasi perihal anggaran, linimasa kegiatan, dan penandatanganan MoU.
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
  const targetRoleTitle =
    userRole === "CSR_ADMIN" ? "Mitra Pelaksana Kegiatan" : "Perusahaan Sponsor";

  const statusCfg =
    COLLABORATION_STATUS_CONFIG[activeConversation.collaborationStatus] || {
      label: activeConversation.collaborationStatus,
      variant: "slate" as const,
    };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 10MB");
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
      setUploadError(err.message || "Gagal mengunggah berkas");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachment) || isSending) return;

    const textToSend = inputText.trim();
    const currentAttachment = attachment;

    setInputText("");
    setAttachment(null);
    setUploadError(null);

    await onSendMessage(
      textToSend || "Melampirkan dokumen:",
      currentAttachment?.url || null,
      currentAttachment?.name || null
    );
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
    <div className="flex-1 flex flex-col h-full bg-slate-50/30 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b border-slate-200/90 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden">
            {targetLogo ? (
              <img
                src={targetLogo}
                alt={targetName}
                className="w-full h-full object-cover"
              />
            ) : (
              targetName.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 truncate">
                {targetName}
              </h2>
              <Badge variant={statusCfg.variant} size="sm">
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-xs text-teal-800 font-semibold truncate">
              {activeConversation.opportunityTitle}
            </p>
          </div>
        </div>

        {/* Quick Context Bar */}
        <div className="flex items-center gap-3 shrink-0">
          {activeConversation.finalBudget && (
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-slate-400 block font-medium">
                Pagu Disepakati
              </span>
              <span className="text-xs font-extrabold text-emerald-700">
                {formatRupiah(activeConversation.finalBudget)}
              </span>
            </div>
          )}

          {onViewCollaborationDetails && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onViewCollaborationDetails(activeConversation.collaborationId)
              }
              className="text-xs border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Rincian MoU
            </Button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            <span className="text-xs font-semibold">Memuat riwayat pesan...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 space-y-2 text-slate-400 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              Mulai Komunikasi & Negosiasi
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Ruang diskusi ini khusus antara PIC CSR Perusahaan dan Mitra Pelaksana.
              Anda dapat mendiskusikan anggaran, rincian teknis, dan melampirkan berkas MoU.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const isImageAttachment =
              msg.attachmentUrl &&
              /\.(jpg|jpeg|png|webp|gif)$/i.test(msg.attachmentUrl);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {/* Sender info if from other party */}
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-700">
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 font-semibold uppercase">
                      {msg.senderRole === "CSR_ADMIN"
                        ? "CSR Perusahaan"
                        : "Mitra Pelaksana"}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3.5 shadow-2xs space-y-2 ${
                    isMe
                      ? "bg-gradient-to-br from-teal-700 to-emerald-800 text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                  }`}
                >
                  <p className="text-xs leading-relaxed whitespace-pre-wrap break-words font-medium">
                    {msg.content}
                  </p>

                  {/* Attachment Preview */}
                  {msg.attachmentUrl && (
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                        isMe
                          ? "bg-teal-900/40 border-teal-500/30 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      {isImageAttachment ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/10">
                          <img
                            src={msg.attachmentUrl}
                            alt="Lampiran"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isMe ? "bg-teal-800 text-teal-200" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
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
                              ? "text-teal-200 hover:text-white"
                              : "text-teal-700 hover:text-teal-900"
                          }`}
                        >
                          Buka / Unduh Berkas
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Message Footer: Time & Status */}
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] ${
                      isMe ? "text-teal-200/80" : "text-slate-400"
                    }`}
                  >
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isMe && (
                      msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-teal-300" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Bar */}
      {attachment && (
        <div className="px-4 py-2 bg-teal-50 border-t border-teal-200 flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="font-bold truncate">Lampiran: {attachment.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="p-1 hover:bg-teal-100 rounded-lg text-teal-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadError && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-200/90 flex items-end gap-2 shrink-0"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSending}
          title="Lampirkan Dokumen atau Gambar"
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 shrink-0"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Tulis pesan negosiasi (Enter untuk kirim, Shift+Enter untuk baris baru)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none max-h-32 leading-relaxed"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={(!inputText.trim() && !attachment) || isSending || isUploading}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-4 shrink-0 shadow-xs"
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
