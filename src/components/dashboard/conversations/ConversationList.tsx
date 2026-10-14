"use client";

import React, { useState } from "react";
import { Search, MessageSquare, Building2, HeartHandshake, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConversationListItem, COLLABORATION_STATUS_CONFIG } from "./types";
import { formatRupiah } from "../analytics/helpers";

interface ConversationListProps {
  conversations: ConversationListItem[];
  selectedId: string | null;
  onSelect: (item: ConversationListItem) => void;
  userRole: "CSR_ADMIN" | "PARTNER_ADMIN";
  isLoading: boolean;
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

  const filtered = conversations.filter((c) => {
    const targetName = userRole === "CSR_ADMIN" ? c.partnerName : c.companyName;
    const matchesSearch =
      targetName.toLowerCase().includes(search.toLowerCase()) ||
      c.opportunityTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.proposalTitle.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || c.collaborationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 w-full md:w-80 lg:w-96 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Pesan & Negosiasi
              </h2>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                {conversations.length} Kemitraan Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              userRole === "CSR_ADMIN"
                ? "Cari mitra atau judul program..."
                : "Cari perusahaan sponsor..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
          {[
            { id: "ALL", label: "Semua" },
            { id: "NEGOTIATION", label: "Negosiasi" },
            { id: "AGREED", label: "Disepakati" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                statusFilter === pill.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 items-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs font-semibold">Tidak ada percakapan ditemukan</p>
            <p className="text-[11px] leading-relaxed">
              Percakapan otomatis terbuka setelah proposal kemitraan disetujui (ACCEPTED).
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
                className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 relative ${
                  isSelected
                    ? "bg-teal-50/70 border-l-4 border-teal-600"
                    : "hover:bg-slate-50 border-l-4 border-transparent"
                }`}
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden mt-0.5">
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

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {targetName}
                    </h3>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {formatMessageTime(item.lastMessageAt)}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-teal-800 truncate mb-1">
                    {item.opportunityTitle}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.lastMessage ? (
                        <span>
                          {item.lastSenderName ? `${item.lastSenderName.split(" ")[0]}: ` : ""}
                          {item.lastMessage}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Belum ada pesan</span>
                      )}
                    </p>

                    {item.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                        {item.unreadCount > 9 ? "9+" : item.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge variant={statusCfg.variant} size="sm">
                      {statusCfg.label}
                    </Badge>
                    {item.finalBudget && (
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        • {formatRupiah(item.finalBudget)}
                      </span>
                    )}
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
