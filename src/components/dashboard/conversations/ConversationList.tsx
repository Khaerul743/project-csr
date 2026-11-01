"use client";

import React, { useState } from "react";
import { Search, MessageSquare, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConversationListItem, COLLABORATION_STATUS_CONFIG } from "./types";

interface ConversationListProps {
  conversations: ConversationListItem[];
  selectedId: string | null;
  onSelect: (item: ConversationListItem) => void;
  userRole: "CSR_ADMIN" | "PARTNER_ADMIN";
  isLoading: boolean;
}

export function OrganizationAvatar({
  logoUrl,
  name,
  size = "md",
}: {
  logoUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg text-[10px]",
    md: "w-10 h-10 rounded-xl text-xs",
    lg: "w-11 h-11 rounded-2xl text-sm",
  };

  const initials = (name || "SIPENA")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "SP";

  if (!logoUrl || hasError) {
    return (
      <div
        className={`${sizeClasses[size]} bg-teal-50 border border-teal-200/80 text-teal-800 font-bold flex items-center justify-center shrink-0 select-none shadow-2xs`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs`}
    >
      <img
        src={logoUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  userRole,
  isLoading,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = conversations
    .filter((c) => {
      const targetName = userRole === "CSR_ADMIN" ? c.partnerName : c.companyName;
      const matchesSearch =
        targetName.toLowerCase().includes(search.toLowerCase()) ||
        c.opportunityTitle.toLowerCase().includes(search.toLowerCase()) ||
        c.proposalTitle.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || c.collaborationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });

  const countNegosiasi = conversations.filter(
    (c) => c.collaborationStatus === "NEGOTIATION"
  ).length;
  const countDisepakati = conversations.filter(
    (c) => c.collaborationStatus === "AGREED"
  ).length;

  const formatMessageTime = (dateInput: string | Date | null) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex flex-col h-full bg-white w-full">
      {/* Header Panel Kiri */}
      <div className="p-3.5 sm:p-4 border-b border-[#E8E8EA] space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#181343]">
                Pesan &amp; Negosiasi
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {conversations.length} Kemitraan
          </span>
        </div>

        {/* Input Pencarian */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              userRole === "CSR_ADMIN"
                ? "Cari mitra atau program..."
                : "Cari perusahaan sponsor..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8.5 pr-8 py-1.5 rounded-xl border border-[#E8E8EA] text-xs text-[#181343] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009E75]/20 focus:border-[#009E75] transition-all bg-[#F9F9FB]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Status: Semua, Negosiasi, Disepakati */}
        <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto no-scrollbar pt-0.5">
          {[
            { id: "ALL", label: "Semua", count: conversations.length },
            { id: "NEGOTIATION", label: "Negosiasi", count: countNegosiasi },
            { id: "AGREED", label: "Disepakati", count: countDisepakati },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                statusFilter === pill.id
                  ? "bg-[#181343] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  statusFilter === pill.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Percakapan */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F4F4F6]">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">
              Tidak ada percakapan ditemukan
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500 max-w-[200px] mx-auto">
              Percakapan terbuka otomatis untuk proposal kemitraan yang sedang dalam pembahasan.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = selectedId === item.collaborationId;
            const targetName =
              userRole === "CSR_ADMIN" ? item.partnerName : item.companyName;
            const targetLogo =
              userRole === "CSR_ADMIN" ? item.partnerLogo : item.companyLogo;
            const statusCfg =
              COLLABORATION_STATUS_CONFIG[item.collaborationStatus] || {
                label: item.collaborationStatus,
                variant: "slate" as const,
              };

            return (
              <div
                key={item.collaborationId}
                onClick={() => onSelect(item)}
                className={`p-3 sm:p-3.5 cursor-pointer transition-all flex items-start gap-3 relative border-l-4 ${
                  isSelected
                    ? "bg-[#EDF9F3] border-[#009E75]"
                    : "hover:bg-slate-50/80 border-transparent"
                }`}
              >
                {/* Avatar Organisasi dengan Fallback Inisial */}
                <OrganizationAvatar
                  logoUrl={targetLogo}
                  name={targetName}
                  size="md"
                />

                {/* Konten Percakapan */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="text-xs font-bold text-[#181343] truncate">
                      {targetName}
                    </h3>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {formatMessageTime(item.lastMessageAt)}
                    </span>
                  </div>

                  {/* Judul Program CSR Terkait */}
                  <p className="text-[11px] font-semibold text-teal-800 truncate mb-1">
                    {item.opportunityTitle}
                  </p>

                  {/* Cuplikan Pesan Terakhir */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.lastMessage ? (
                        <span>
                          {item.lastSenderName
                            ? `${item.lastSenderName.split(" ")[0]}: `
                            : ""}
                          {item.lastMessage}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Belum ada pesan</span>
                      )}
                    </p>

                    {item.unreadCount > 0 && (
                      <span className="w-4.5 h-4.5 rounded-full bg-[#009E75] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                        {item.unreadCount > 9 ? "9+" : item.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Status Kerja Sama */}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge variant={statusCfg.variant} size="sm">
                      {statusCfg.label}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
