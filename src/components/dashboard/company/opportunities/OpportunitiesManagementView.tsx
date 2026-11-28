"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  ArrowUpDown,
  Sparkles,
  Layers,
  Globe2,
  FileEdit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { DashboardPageHeader } from "../../common/DashboardPageHeader";
import { opportunityStatusEnum } from "@/db/schema/opportunities";
import { csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import { OpportunityItem } from "../types";
import {
  FOCUS_AREA_CONFIG,
  STATUS_CONFIG,
  formatRupiah,
  formatDate,
} from "../helpers";
import { ALL_17_SDGS, getProgramSdgs } from "@/components/dashboard/analytics/helpers";
import { SdgGoal } from "@/components/dashboard/analytics/types";

interface OpportunitiesManagementViewProps {
  opportunities: OpportunityItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCreateModal?: () => void;
  onOpenEditModal?: (opp: OpportunityItem) => void;
  onOpenDetailModal: (opp: OpportunityItem) => void;
  onDeleteOpportunity?: (oppId: string, oppTitle: string) => void;
  isManagement?: boolean;
}

function OpportunityCover({
  bannerUrl,
  title,
  focusLabel,
  statusLabel,
  statusVariant,
  focusVariant,
}: {
  bannerUrl?: string | null;
  title: string;
  focusLabel: string;
  statusLabel: string;
  statusVariant: any;
  focusVariant: any;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#F4F9FF] border-b border-[#DBEAFE]">
      {bannerUrl && !hasError ? (
        <>
          <img
            src={bannerUrl}
            alt={title}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2558]/40 via-transparent to-transparent pointer-events-none" />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#EDF6FF] via-[#F4F9FF] to-[#DBEAFE]/70 flex flex-col items-center justify-center p-4 text-center select-none">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#CBE7FD] shadow-2xs text-[#1765F5] flex items-center justify-center mb-1.5">
            <Sparkles className="w-5 h-5 text-[#1765F5]" />
          </div>
          <span className="text-[11px] font-bold text-[#0A2558] tracking-tight">{focusLabel}</span>
        </div>
      )}

      {/* Floating Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        <Badge
          variant={statusVariant}
          size="sm"
          hasDot
          className="bg-white/95 backdrop-blur-xs shadow-2xs font-bold"
        >
          {statusLabel}
        </Badge>
        <Badge
          variant={focusVariant}
          size="sm"
          className="bg-white/95 backdrop-blur-xs shadow-2xs font-semibold"
        >
          {focusLabel}
        </Badge>
      </div>
    </div>
  );
}

export function OpportunitiesManagementView({
  opportunities,
  isLoading,
  onRefresh,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDetailModal,
  onDeleteOpportunity,
  isManagement = false,
}: OpportunitiesManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [focusFilter, setFocusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "budget-high" | "deadline">("newest");

  // Compact metrics (Total, Terbuka, Draf)
  const oppMetrics = useMemo(() => {
    const list = Array.isArray(opportunities) ? opportunities : [];
    const totalCount = list.length;
    const openCount = list.filter((o) => o?.status === "OPEN").length;
    const draftCount = list.filter((o) => o?.status === "DRAFT").length;
    return { totalCount, openCount, draftCount };
  }, [opportunities]);

  // Filter & Sort Logic
  const filteredAndSortedOpportunities = useMemo(() => {
    const list = Array.isArray(opportunities) ? [...opportunities] : [];

    return list
      .filter((opp) => {
        if (!opp) return false;

        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          (opp.title && opp.title.toLowerCase().includes(q)) ||
          (opp.description && opp.description.toLowerCase().includes(q)) ||
          (opp.targetCity && opp.targetCity.toLowerCase().includes(q)) ||
          (opp.targetProvince && opp.targetProvince.toLowerCase().includes(q));

        const matchStatus = statusFilter === "ALL" || opp.status === statusFilter;
        const matchFocus = focusFilter === "ALL" || opp.focusArea === focusFilter;

        return matchSearch && matchStatus && matchFocus;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        }
        if (sortBy === "budget-high") {
          const budgetA = a.estimatedBudget ? parseFloat(a.estimatedBudget) : 0;
          const budgetB = b.estimatedBudget ? parseFloat(b.estimatedBudget) : 0;
          return budgetB - budgetA;
        }
        if (sortBy === "deadline") {
          const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return dateA - dateB;
        }
        // default "newest"
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [opportunities, searchQuery, statusFilter, focusFilter, sortBy]);

  // Calculate days remaining helper
  const getDaysRemaining = (deadlineStr: string | null | undefined) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper to extract SDGs for an opportunity
  const getOpportunitySdgs = (opp: OpportunityItem): SdgGoal[] => {
    const ids = getProgramSdgs({
      id: opp.id,
      title: opp.title,
      description: opp.description,
      focusArea: opp.focusArea,
      status: "PLANNED",
      budget: opp.estimatedBudget || "0",
    });
    return ids
      .map((id) => ALL_17_SDGS.find((s) => s.id === id))
      .filter((s): s is SdgGoal => !!s);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      {/* 1. Open Canvas Page Header + Satu Tombol Utama */}
      <DashboardPageHeader
        title={isManagement ? "Katalog Peluang CSR" : "Kelola Peluang CSR"}
        description={
          isManagement
            ? "Tinjau daftar peluang inisiatif CSR yang dibuka oleh tim operasional perusahaan untuk kolaborasi mitra."
            : "Rencanakan dan kelola peluang kerja sama CSR berdasarkan kebutuhan masyarakat."
        }
        iconSrc="/images/opportunities/opportunities-header-icon.png"
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {isManagement && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#EDF6FF] text-[#0A2558] border border-[#CBE7FD] tracking-wide">
                Akses Tinjauan (Read-Only)
              </span>
            )}
            {!isManagement && onOpenCreateModal && (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1D6CE0] via-[#1765F5] to-[#1748D5] hover:brightness-105 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#1765F5]/20 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] focus-visible:ring-offset-2"
              >
                <Plus aria-hidden="true" className="w-4 h-4" />
                <span>Buat Peluang CSR</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. Informasi Status Compact (Read-Only, Seragam Palet Biru) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <div className="p-5 rounded-3xl bg-white border border-[#DBEAFE] shadow-xs flex items-start justify-between gap-3 cursor-default">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-600 block">
              Total Peluang
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0A2558] tabular-nums">
              {oppMetrics.totalCount}
            </div>
            <span className="text-xs text-slate-600 block">
              Seluruh inisiatif CSR terdaftar
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#EDF6FF] border border-[#CBE7FD] text-[#1765F5] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#DBEAFE] shadow-xs flex items-start justify-between gap-3 cursor-default">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-600 block">
              Peluang Terbuka
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1765F5] tabular-nums">
              {oppMetrics.openCount}
            </div>
            <span className="text-xs text-slate-600 block">
              Aktif menerima pengajuan mitra
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#EDF6FF] border border-[#CBE7FD] text-[#1765F5] flex items-center justify-center shrink-0">
            <Globe2 className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#DBEAFE] shadow-xs flex items-start justify-between gap-3 cursor-default">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-600 block">
              Draf Internal
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0A2558] tabular-nums">
              {oppMetrics.draftCount}
            </div>
            <span className="text-xs text-slate-600 block">
              Rencana inisiatif yang disiapkan
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F4F9FF] border border-[#DBEAFE] text-[#0A2558] flex items-center justify-center shrink-0">
            <FileEdit className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar Pencarian & Filter Selebar Area Konten */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DBEAFE] shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama peluang, kata kunci, atau lokasi sasaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[40px] text-xs sm:text-sm bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl pl-10 pr-4 py-2 outline-none transition-all focus:bg-white focus:border-[#1765F5] focus:ring-2 focus:ring-[#1765F5]/15 text-[#0A2558] placeholder:text-slate-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="min-h-[40px] flex items-center gap-1.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl px-3 py-1.5 focus-within:border-[#1765F5] focus-within:ring-2 focus-within:ring-[#1765F5]/15">
            <span className="text-[11px] font-semibold text-slate-600">Status:</span>
            <select
              aria-label="Filter status peluang"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent text-[#0A2558] font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              {opportunityStatusEnum.map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st]?.label || st}
                </option>
              ))}
            </select>
          </div>

          {/* Focus Area Filter */}
          <div className="min-h-[40px] flex items-center gap-1.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl px-3 py-1.5 focus-within:border-[#1765F5] focus-within:ring-2 focus-within:ring-[#1765F5]/15">
            <span className="text-[11px] font-semibold text-slate-600">Bidang CSR:</span>
            <select
              aria-label="Filter bidang fokus peluang"
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value)}
              className="text-xs bg-transparent text-[#0A2558] font-semibold outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="ALL">Semua Bidang</option>
              {csrFocusAreaEnum.map((area) => (
                <option key={area} value={area}>
                  {FOCUS_AREA_CONFIG[area]?.label || area}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="min-h-[40px] flex items-center gap-1.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl px-3 py-1.5 focus-within:border-[#1765F5] focus-within:ring-2 focus-within:ring-[#1765F5]/15">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#1765F5]" />
            <select
              aria-label="Urutkan peluang"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent text-[#0A2558] font-semibold outline-none cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="budget-high">Anggaran Tertinggi</option>
              <option value="deadline">Batas Waktu Terdekat</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            title="Muat ulang data"
            aria-label="Muat ulang data peluang"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] hover:bg-[#EDF6FF] text-slate-600 hover:text-[#1765F5] transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Grid Card Peluang CSR */}
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : filteredAndSortedOpportunities.length === 0 ? (
        <div className="py-12 px-6 rounded-3xl bg-white border border-[#DBEAFE] shadow-xs text-center space-y-4">
          <div className="mx-auto w-[148px] h-[120px] flex items-center justify-center">
            <Image
              src="/images/opportunities/opportunities-empty-state.png"
              alt="Belum ada peluang CSR"
              width={148}
              height={120}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-base font-bold text-[#0A2558]">
              {searchQuery || statusFilter !== "ALL" || focusFilter !== "ALL"
                ? "Tidak Ada Peluang yang Sesuai Filter"
                : "Belum Ada Peluang CSR Dibuat"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {searchQuery || statusFilter !== "ALL" || focusFilter !== "ALL"
                ? "Coba sesuaikan kata kunci pencarian atau ubah filter untuk menampilkan peluang."
                : isManagement
                  ? "Belum ada peluang inisiatif kerja sama CSR yang dibuka oleh tim operasional perusahaan Anda."
                  : "Rencanakan peluang kerja sama CSR baru perusahaan Anda agar calon mitra dapat mengajukan inisiatif solutif."}
            </p>
          </div>
          {!isManagement && onOpenCreateModal && !(searchQuery || statusFilter !== "ALL" || focusFilter !== "ALL") && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
              className="rounded-full min-h-[44px] px-5 text-xs font-semibold cursor-pointer mt-2"
            >
              Buat Peluang CSR
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {filteredAndSortedOpportunities.map((opp) => {
            const focus = FOCUS_AREA_CONFIG[opp.focusArea] || {
              label: opp.focusArea,
              variant: "slate" as const,
            };
            const statusCfg =
              opp.status === "OPEN"
                ? { label: "Buka Proposal", variant: "blue" as const }
                : STATUS_CONFIG[opp.status] || {
                    label: opp.status,
                    variant: "navy" as const,
                  };

            const daysLeft = getDaysRemaining(opp.deadline);
            const sdgs = getOpportunitySdgs(opp);

            return (
              <div
                key={opp.id}
                className="rounded-3xl bg-white border border-[#DBEAFE] hover:border-[#93C5FD] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Cover Header */}
                  <OpportunityCover
                    bannerUrl={opp.bannerUrl}
                    title={opp.title}
                    focusLabel={focus.label}
                    statusLabel={statusCfg.label}
                    statusVariant={statusCfg.variant}
                    focusVariant={focus.variant}
                  />

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    {/* Judul Peluang */}
                    <div>
                      <h3 className="text-base font-bold text-[#0A2558] group-hover:text-[#1765F5] transition-colors line-clamp-2 leading-snug">
                        {opp.title}
                      </h3>
                    </div>

                    {/* Wilayah Sasaran (Di Atas SDG) */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#1765F5] shrink-0" />
                        <span
                          className="font-medium truncate"
                          title={[opp.targetCity, opp.targetProvince].filter(Boolean).join(", ") || "Wilayah belum ditentukan"}
                        >
                          {[opp.targetCity, opp.targetProvince].filter(Boolean).join(", ") || "Wilayah belum ditentukan"}
                        </span>
                      </div>
                      {opp.stats?.proposalsCount !== undefined && opp.stats.proposalsCount > 0 && (
                        <span className="text-[10px] font-bold text-[#1765F5] bg-[#EDF6FF] border border-[#CBE7FD] px-2 py-0.5 rounded-full shrink-0">
                          {opp.stats.proposalsCount} Proposal
                        </span>
                      )}
                    </div>

                    {/* SDGs Chips (Sejajar 1 Baris, Hanya Nomor/Kode SDG) */}
                    {sdgs.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-hidden flex-nowrap pt-0.5">
                        {sdgs.slice(0, 4).map((sdg) => (
                          <span
                            key={sdg.id}
                            className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0"
                            style={{
                              backgroundColor: sdg.color + "14",
                              borderColor: sdg.color + "40",
                              color: sdg.color,
                            }}
                            title={`${sdg.code}: ${sdg.name}`}
                          >
                            {sdg.code}
                          </span>
                        ))}
                        {sdgs.length > 4 && (
                          <span
                            className="text-[10px] font-semibold text-slate-600 bg-[#EDF6FF] px-1.5 py-0.5 rounded shrink-0"
                            title={sdgs.slice(4).map((s) => `${s.code}: ${s.name}`).join(", ")}
                          >
                            +{sdgs.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata Strip Bersih (2 Kolom Sejajar: Estimasi Anggaran & Batas Pengajuan) */}
                    <div className="pt-2.5 border-t border-[#EDF6FF] text-xs">
                      <div className="grid grid-cols-2 gap-2 items-end">
                        <div className="min-w-0">
                          <span className="text-[11px] text-slate-600 block font-medium">Estimasi Anggaran</span>
                          <span className="text-sm font-extrabold text-[#1765F5] block truncate mt-0.5 tabular-nums">
                            {opp.estimatedBudget && parseFloat(opp.estimatedBudget) > 0
                              ? formatRupiah(opp.estimatedBudget)
                              : "Fleksibel"}
                          </span>
                        </div>

                        <div className="text-right min-w-0">
                          <span className="text-[11px] text-slate-600 block font-medium">Batas Pengajuan</span>
                          <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <span className="font-semibold text-[#0A2558] truncate">
                              {opp.deadline ? formatDate(opp.deadline) : "Terbuka"}
                            </span>
                            {daysLeft !== null && daysLeft >= 0 && daysLeft <= 14 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                Sisa {daysLeft} hr
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="p-5 pt-3 border-t border-[#EDF6FF] flex items-center justify-between gap-2">
                  {isManagement ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDetailModal(opp)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="w-full text-xs font-bold rounded-full cursor-pointer"
                    >
                      Lihat Rincian Peluang
                    </Button>
                  ) : !isManagement && opp.status === "DRAFT" && onOpenEditModal ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onOpenEditModal(opp)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                      className="flex-1 text-xs font-bold rounded-full cursor-pointer"
                    >
                      Lanjutkan Draf
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDetailModal(opp)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="flex-1 text-xs font-bold rounded-full cursor-pointer"
                    >
                      Lihat Detail Peluang
                    </Button>
                  )}

                  {!isManagement && (
                    <div className="flex items-center gap-1">
                      {opp.status === "DRAFT" ? (
                        <button
                          type="button"
                          onClick={() => onOpenDetailModal(opp)}
                          title="Lihat Pratinjau Draf"
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-500 hover:text-[#1765F5] hover:bg-[#EDF6FF] transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : onOpenEditModal ? (
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(opp)}
                          title="Edit Peluang"
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-500 hover:text-[#1765F5] hover:bg-[#EDF6FF] transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      ) : null}

                      {onDeleteOpportunity && (
                        <button
                          type="button"
                          onClick={() => onDeleteOpportunity(opp.id, opp.title)}
                          title="Hapus Peluang"
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
