"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Eye,
  RotateCcw,
  RefreshCw,
  Mail,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import {
  CompanyOpportunityInvitationItem,
  OpportunityItem,
} from "../types";
import { FOCUS_AREA_CONFIG, formatDate } from "../helpers";

interface CompanyInvitationsTabProps {
  invitations: CompanyOpportunityInvitationItem[];
  opportunities: OpportunityItem[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onNavigateToPartners: () => void;
  onNavigateToProposals: () => void;
  onReinvitePartner: (invitation: CompanyOpportunityInvitationItem) => void;
}

const INVITATION_STATUS_META: Record<
  CompanyOpportunityInvitationItem["status"],
  {
    label: string;
    variant: "amber" | "emerald" | "slate" | "rose";
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  INVITED: {
    label: "Menunggu Respons",
    variant: "amber",
    Icon: Clock,
  },
  ACCEPTED: {
    label: "Diterima",
    variant: "emerald",
    Icon: CheckCircle2,
  },
  DECLINED: {
    label: "Ditolak",
    variant: "slate",
    Icon: XCircle,
  },
  OVERDUE: {
    label: "Overdue",
    variant: "rose",
    Icon: AlertCircle,
  },
};

function PartnerAvatar({
  logoUrl,
  name,
}: {
  logoUrl?: string | null;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => {
    const clean = (name || "MP").trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  }, [name]);

  if (logoUrl && !hasError) {
    return (
      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-[#E8E8EA] shrink-0 overflow-hidden">
        <img
          src={logoUrl}
          alt={`Logo ${name}`}
          width={44}
          height={44}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="w-11 h-11 rounded-xl bg-[#181343] text-white shrink-0 flex items-center justify-center font-bold text-xs tracking-wide"
    >
      {initials}
    </div>
  );
}

export function CompanyInvitationsTab({
  invitations,
  opportunities,
  isLoading,
  errorMessage,
  onRetry,
  onNavigateToPartners,
  onNavigateToProposals,
  onReinvitePartner,
}: CompanyInvitationsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [opportunityFilter, setOpportunityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedInvitationForMessage, setSelectedInvitationForMessage] =
    useState<CompanyOpportunityInvitationItem | null>(null);

  const stats = useMemo(() => {
    return {
      invited: invitations.filter((i) => i.status === "INVITED").length,
      accepted: invitations.filter((i) => i.status === "ACCEPTED").length,
      declined: invitations.filter((i) => i.status === "DECLINED").length,
      overdue: invitations.filter((i) => i.status === "OVERDUE").length,
    };
  }, [invitations]);

  const filteredInvitations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return invitations.filter((inv) => {
      if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
      if (
        opportunityFilter !== "ALL" &&
        inv.opportunityId !== opportunityFilter
      ) {
        return false;
      }
      if (q) {
        const partnerMatch = (inv.partnerName || "").toLowerCase().includes(q);
        const oppMatch = (inv.opportunityTitle || "").toLowerCase().includes(q);
        const cityMatch = (inv.partnerCity || "").toLowerCase().includes(q);
        if (!partnerMatch && !oppMatch && !cityMatch) return false;
      }
      return true;
    });
  }, [invitations, searchQuery, opportunityFilter, statusFilter]);

  const hasActiveFilter =
    searchQuery.trim() !== "" ||
    opportunityFilter !== "ALL" ||
    statusFilter !== "ALL";

  const resetFilters = () => {
    setSearchQuery("");
    setOpportunityFilter("ALL");
    setStatusFilter("ALL");
  };

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Status Undangan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Menunggu Respons
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-1.5">
            {stats.invited}
          </div>
          <span className="text-xs text-slate-600">
            Undangan aktif dikirim
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Diterima
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 my-1.5">
            {stats.accepted}
          </div>
          <span className="text-xs text-slate-600">
            Siap mengajukan proposal
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Ditolak
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 my-1.5">
            {stats.declined}
          </div>
          <span className="text-xs text-slate-600">
            Mitra berhalangan hadir
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Overdue
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 my-1.5">
            {stats.overdue}
          </div>
          <span className="text-xs text-slate-600">
            Melewati batas respons
          </span>
        </div>
      </div>

      {/* 2. Toolbar Pencarian & Filter */}
      <div className="w-full p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          <div className="relative flex-1 md:flex-[3]">
            <label htmlFor="invitations-search-input" className="sr-only">
              Cari undangan mitra
            </label>
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="invitations-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari undangan berdasarkan nama mitra, kota, atau program CSR..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F9F9FB] text-xs sm:text-sm focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] text-[#181343] placeholder:text-slate-500 transition-colors"
            />
          </div>

          <div className="w-full md:flex-1 md:max-w-xs">
            <label htmlFor="invitations-opportunity-filter" className="sr-only">
              Filter berdasarkan Peluang CSR
            </label>
            <select
              id="invitations-opportunity-filter"
              value={opportunityFilter}
              onChange={(e) => setOpportunityFilter(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#181343] bg-[#F9F9FB] focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] cursor-pointer"
            >
              <option value="ALL">Semua Peluang CSR</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onRetry}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] shrink-0"
            aria-label="Muat ulang daftar undangan"
          >
            <RefreshCw
              aria-hidden="true"
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Filter Status Chips (Minimum tap target >= 44px height) */}
        <div
          role="group"
          aria-label="Filter status undangan"
          className="flex items-center gap-2 overflow-x-auto pb-1 w-full"
        >
          {[
            { id: "ALL", label: "Semua", count: invitations.length },
            { id: "INVITED", label: "Menunggu Respons", count: stats.invited },
            { id: "ACCEPTED", label: "Diterima", count: stats.accepted },
            { id: "DECLINED", label: "Ditolak", count: stats.declined },
            { id: "OVERDUE", label: "Overdue", count: stats.overdue },
          ].map((st) => {
            const isSelected = statusFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setStatusFilter(st.id)}
                className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] ${
                  isSelected
                    ? "bg-[#181343] text-white font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-700"
                  }`}
                >
                  {st.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Konten Daftar Undangan (3 State Lengkap: Error, Loading, Empty) */}
      {errorMessage ? (
        <div
          role="alert"
          className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3"
        >
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <AlertCircle aria-hidden="true" className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-rose-900">
              Gagal Memuat Daftar Undangan
            </h3>
            <p className="text-xs text-rose-800">{errorMessage}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="min-h-[44px] border-rose-300 text-rose-900 hover:bg-rose-100 cursor-pointer"
          >
            Coba Muat Ulang
          </Button>
        </div>
      ) : isLoading ? (
        <div aria-busy="true" aria-label="Memuat daftar undangan mitra">
          <CardGridSkeleton count={3} />
        </div>
      ) : filteredInvitations.length === 0 ? (
        <div className="py-14 px-6 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F9F9FB] text-[#181343] flex items-center justify-center mx-auto border border-[#E8E8EA]">
            <Mail aria-hidden="true" className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-bold text-[#181343] text-base">
              {invitations.length === 0
                ? "Belum Ada Undangan Mitra"
                : "Tidak Ada Undangan yang Sesuai"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {invitations.length === 0
                ? "Anda belum mengirimkan undangan kolaborasi ke organisasi mitra. Buka menu Kurasi Mitra untuk memilih yayasan atau NGO yang relevan."
                : "Tidak ada undangan yang cocok dengan kata kunci atau filter status yang dipilih."}
            </p>
          </div>
          {invitations.length === 0 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onNavigateToPartners}
              className="min-h-[44px] bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Buka Kurasi Mitra
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={!hasActiveFilter}
              className="min-h-[44px] border-[#CBD5E1] text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Reset Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
          {filteredInvitations.map((inv) => {
            const statusMeta = INVITATION_STATUS_META[inv.status];
            const StatusIcon = statusMeta.Icon;
            const focusAreaKey = inv.opportunityFocusArea || inv.partnerFocusArea;
            const focusCfg = focusAreaKey
              ? FOCUS_AREA_CONFIG[focusAreaKey as keyof typeof FOCUS_AREA_CONFIG]
              : null;
            const canReinvite =
              inv.status === "OVERDUE" || inv.status === "DECLINED";

            return (
              <article
                key={inv.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                  inv.status === "OVERDUE"
                    ? "border-rose-200"
                    : "border-[#E8E8EA] hover:border-slate-300"
                }`}
              >
                {/* Header Kartu: Identitas Mitra + Status Tunggal */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <PartnerAvatar
                        logoUrl={inv.partnerLogo}
                        name={inv.partnerName || "Mitra"}
                      />
                      <div className="min-w-0">
                        <h3
                          className="font-bold text-[#181343] text-sm truncate"
                          title={inv.partnerName || "Organisasi Mitra"}
                        >
                          {inv.partnerName || "Organisasi Mitra"}
                        </h3>
                        <p className="flex items-center gap-1 text-xs text-slate-600 mt-0.5 truncate">
                          <MapPin
                            aria-hidden="true"
                            className="w-3.5 h-3.5 text-slate-500 shrink-0"
                          />
                          <span className="truncate">
                            {inv.partnerCity || inv.partnerProvince || "Indonesia"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Badge
                        variant={statusMeta.variant}
                        size="sm"
                        className="inline-flex items-center gap-1 font-bold"
                      >
                        <StatusIcon aria-hidden="true" className="w-3 h-3" />
                        <span>{statusMeta.label}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Program CSR Tujuan */}
                  <div className="space-y-1">
                    {focusCfg && (
                      <span className="inline-block text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {focusCfg.label}
                      </span>
                    )}
                    <h4
                      className="text-sm font-bold text-[#181343] leading-snug line-clamp-2"
                      title={inv.opportunityTitle || "Program CSR"}
                    >
                      {inv.opportunityTitle || "Program CSR"}
                    </h4>
                  </div>
                </div>

                {/* Detail Tanggal & Status Overdue */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E8E8EA] space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-600">Diundang pada</span>
                      <span className="font-semibold text-[#181343]">
                        {formatDate(inv.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Calendar aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Batas Respons</span>
                      </span>
                      <span
                        className={`font-bold ${
                          inv.status === "OVERDUE"
                            ? "text-rose-700"
                            : "text-[#181343]"
                        }`}
                      >
                        {inv.responseDeadline
                          ? formatDate(inv.responseDeadline)
                          : "Tidak dibatasi"}
                      </span>
                    </div>

                    {inv.invitedByName && (
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70 text-[11px]">
                        <span className="text-slate-600 flex items-center gap-1">
                          <UserCheck aria-hidden="true" className="w-3 h-3" />
                          <span>PIC Pengirim</span>
                        </span>
                        <span className="font-medium text-slate-700 truncate max-w-[160px]">
                          {inv.invitedByName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bar Aksi Bawah */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {inv.message ? (
                      <button
                        type="button"
                        onClick={() => setSelectedInvitationForMessage(inv)}
                        className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343]"
                      >
                        <Eye aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Lihat Pesan</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600">
                        Tanpa pesan tambahan
                      </span>
                    )}

                    {canReinvite ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => onReinvitePartner(inv)}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        className="min-h-[40px] bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl cursor-pointer ml-auto"
                      >
                        Undang Ulang
                      </Button>
                    ) : inv.status === "ACCEPTED" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onNavigateToProposals}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="min-h-[40px] border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl cursor-pointer ml-auto"
                      >
                        Cek Proposal
                      </Button>
                    ) : (
                      <span className="text-xs font-medium text-amber-800 ml-auto">
                        Menunggu Mitra
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Pratinjau Surat Undangan */}
      <Modal
        isOpen={!!selectedInvitationForMessage}
        onClose={() => setSelectedInvitationForMessage(null)}
        title="Surat Undangan Kolaborasi"
        description={
          selectedInvitationForMessage
            ? `Dikirim kepada ${selectedInvitationForMessage.partnerName || "Mitra"} untuk program "${selectedInvitationForMessage.opportunityTitle || ""}"`
            : undefined
        }
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            {selectedInvitationForMessage &&
              (selectedInvitationForMessage.status === "OVERDUE" ||
                selectedInvitationForMessage.status === "DECLINED") && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    const target = selectedInvitationForMessage;
                    setSelectedInvitationForMessage(null);
                    onReinvitePartner(target);
                  }}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="min-h-[44px] bg-[#181343] hover:bg-[#25205c] text-white cursor-pointer"
                >
                  Undang Ulang Mitra
                </Button>
              )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedInvitationForMessage(null)}
              className="min-h-[44px] cursor-pointer"
            >
              Tutup
            </Button>
          </div>
        }
      >
        {selectedInvitationForMessage && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-slate-600 block">Status</span>
                <span className="font-bold text-[#181343] mt-0.5 block">
                  {INVITATION_STATUS_META[selectedInvitationForMessage.status].label}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">Dikirim Pada</span>
                <span className="font-bold text-[#181343] mt-0.5 block">
                  {formatDate(selectedInvitationForMessage.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">Batas Respons</span>
                <span
                  className={`font-bold mt-0.5 block ${
                    selectedInvitationForMessage.status === "OVERDUE"
                      ? "text-rose-700"
                      : "text-[#181343]"
                  }`}
                >
                  {selectedInvitationForMessage.responseDeadline
                    ? formatDate(selectedInvitationForMessage.responseDeadline)
                    : "-"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] text-xs sm:text-sm text-[#1A1C1D] whitespace-pre-line leading-relaxed max-h-[360px] overflow-y-auto">
              {selectedInvitationForMessage.message}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

