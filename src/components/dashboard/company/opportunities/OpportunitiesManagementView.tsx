"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  FileText,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#F9F9FB] border-b border-[#E8E8EA]">
      {bannerUrl && !hasError ? (
        <>
          <img
            src={bannerUrl}
            alt={title}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-50 via-[#F9F9FB] to-slate-200/50 flex flex-col items-center justify-center p-4 text-center select-none">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E8EA] shadow-2xs text-[#181343] flex items-center justify-center mb-1">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] font-bold text-[#181343] tracking-tight">{focusLabel}</span>
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
      {/* 1. Header Identitas & Satu Tombol Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isManagement ? "Katalog Peluang CSR" : "Kelola Peluang CSR"}
            </h1>
            {isManagement && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 tracking-wide uppercase">
                Akses Tinjauan (Read-Only)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {isManagement
              ? "Tinjau daftar peluang inisiatif CSR yang dibuka oleh tim operasional perusahaan untuk kolaborasi mitra."
              : "Rencanakan dan kelola peluang kerja sama CSR berdasarkan kebutuhan masyarakat."}
          </p>
        </div>

        {/* Tombol Buat Peluang CSR (Khusus CSR_ADMIN) */}
        {!isManagement && onOpenCreateModal && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#181343] hover:bg-[#25205c] text-white font-bold rounded-xl text-xs sm:text-sm py-2.5 px-4 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
          >
            Buat Peluang CSR
          </Button>
        )}
      </div>

      {/* 2. Informasi Status Compact (Read-Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs flex flex-col justify-between cursor-default">
          <span className="text-xs font-semibold text-slate-600 block">
            Total Peluang
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-1">
            {oppMetrics.totalCount}
          </div>
          <span className="text-xs text-[#787680] block">
            Seluruh inisiatif CSR terdaftar
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs flex flex-col justify-between cursor-default">
          <span className="text-xs font-semibold text-slate-600 block">
            Peluang Terbuka
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#009E75] my-1">
            {oppMetrics.openCount}
          </div>
          <span className="text-xs text-[#787680] block">
            Aktif menerima pengajuan mitra
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs flex flex-col justify-between cursor-default">
          <span className="text-xs font-semibold text-slate-600 block">
            Draf
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-1">
            {oppMetrics.draftCount}
          </div>
          <span className="text-xs text-[#787680] block">
            Rencana inisiatif internal
          </span>
        </div>
      </div>

      {/* 3. Toolbar Pencarian & Filter Selebar Area Konten */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#787680] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama peluang, kata kunci, atau lokasi sasaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors focus:bg-white focus:border-[#181343]/30 focus:ring-2 focus:ring-[#181343]/10 text-[#181343] placeholder:text-[#9A98A6]"
          />
        </div>

        {/* Filter Controls (Tanpa Tombol Duplikat) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-2">
            <span className="text-[11px] font-semibold text-[#787680]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent text-[#181343] font-semibold outline-none cursor-pointer"
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
          <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-2">
            <span className="text-[11px] font-semibold text-[#787680]">Bidang CSR:</span>
            <select
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value)}
              className="text-xs bg-transparent text-[#181343] font-semibold outline-none cursor-pointer max-w-[140px] truncate"
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
          <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#787680]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent text-[#181343] font-semibold outline-none cursor-pointer"
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
            className="p-2.5 rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] hover:bg-white text-[#787680] hover:text-[#181343] transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Grid Card Peluang CSR */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#787680] space-y-3 bg-white rounded-2xl border border-[#E8E8EA]">
          <div className="w-7 h-7 border-2 border-[#181343] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Memuat daftar peluang CSR...</p>
        </div>
      ) : filteredAndSortedOpportunities.length === 0 ? (
        <div className="py-16 px-6 rounded-2xl bg-white border border-dashed border-[#E8E8EA] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] text-[#181343] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#181343]">
            {searchQuery || statusFilter !== "ALL" || focusFilter !== "ALL"
              ? "Tidak Ada Peluang yang Sesuai Filter"
              : "Belum Ada Peluang CSR Dibuat"}
          </h4>
          <p className="text-xs text-[#787680] max-w-sm mx-auto leading-relaxed">
            {searchQuery || statusFilter !== "ALL" || focusFilter !== "ALL"
              ? "Coba sesuaikan kata kunci pencarian atau ubah filter untuk menampilkan peluang."
              : isManagement
                ? "Belum ada peluang inisiatif kerja sama CSR yang dibuka oleh tim operasional perusahaan Anda."
                : "Rencanakan peluang kerja sama CSR baru perusahaan Anda agar calon mitra dapat mengajukan inisiatif solutif."}
          </p>
          {!isManagement && onOpenCreateModal && !(searchQuery || statusFilter !== "ALL" || focusFilter !== "ALL") && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-[#181343] hover:bg-[#25205c] text-white font-bold rounded-xl text-xs cursor-pointer mt-2"
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
            const statusCfg = STATUS_CONFIG[opp.status] || {
              label: opp.status,
              variant: "navy" as const,
            };

            const daysLeft = getDaysRemaining(opp.deadline);
            const sdgs = getOpportunitySdgs(opp);

            return (
              <div
                key={opp.id}
                className="rounded-2xl bg-white border border-[#E8E8EA] hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between overflow-hidden group"
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
                    <div>
                      <h3 className="text-base font-bold text-[#181343] group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-[#787680] line-clamp-2 leading-relaxed mt-1.5">
                        {opp.description}
                      </p>
                    </div>

                    {/* SDGs Chips */}
                    {sdgs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {sdgs.slice(0, 3).map((sdg) => (
                          <span
                            key={sdg.id}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0"
                            style={{
                              backgroundColor: sdg.color + "14",
                              borderColor: sdg.color + "40",
                              color: sdg.color,
                            }}
                            title={`${sdg.code}: ${sdg.name}`}
                          >
                            <span>{sdg.code}</span>
                            <span className="font-medium truncate max-w-[100px] hidden sm:inline">
                              {sdg.name}
                            </span>
                          </span>
                        ))}
                        {sdgs.length > 3 && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            +{sdgs.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata Strip */}
                    <div className="pt-2 border-t border-[#F4F4F6] space-y-2 text-xs">
                      {/* Estimasi Anggaran (Tidak menampilkan Rp 0) */}
                      <div className="flex items-center justify-between text-[#47464F]">
                        <span className="text-[#787680]">Estimasi Anggaran:</span>
                        <span className="font-extrabold text-[#009E75]">
                          {opp.estimatedBudget && parseFloat(opp.estimatedBudget) > 0
                            ? formatRupiah(opp.estimatedBudget)
                            : "Belum Ditentukan"}
                        </span>
                      </div>

                      {/* Wilayah Sasaran */}
                      <div className="flex items-center justify-between text-[#47464F]">
                        <span className="text-[#787680]">Wilayah Sasaran:</span>
                        <span
                          className="font-medium text-slate-800 truncate max-w-[160px]"
                          title={[opp.targetCity, opp.targetProvince].filter(Boolean).join(", ") || "Belum ditentukan"}
                        >
                          {[opp.targetCity, opp.targetProvince].filter(Boolean).join(", ") || "Belum ditentukan"}
                        </span>
                      </div>

                      {/* Status Pengajuan / Respons Mitra */}
                      <div className="flex items-center justify-between text-[#47464F]">
                        <span className="text-[#787680]">Status Pengajuan:</span>
                        <span className="font-semibold text-slate-800">
                          {opp.status === "DRAFT"
                            ? "Draf Internal"
                            : opp.status === "CLOSED"
                            ? "Peluang Ditutup"
                            : opp.stats?.proposalsCount && opp.stats.proposalsCount > 0
                            ? `${opp.stats.proposalsCount} Proposal Masuk`
                            : "Menunggu Pengajuan Mitra"}
                        </span>
                      </div>

                      {/* Batas Pengajuan */}
                      <div className="flex items-center justify-between text-[#47464F]">
                        <span className="text-[#787680]">Batas Pengajuan:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-800">
                            {opp.deadline ? formatDate(opp.deadline) : "Belum ditentukan"}
                          </span>
                          {daysLeft !== null && daysLeft >= 0 && daysLeft <= 14 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Sisa {daysLeft} hr
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="p-5 pt-0 border-t border-[#F4F4F6] mt-2 flex items-center justify-between gap-2">
                  {isManagement ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDetailModal(opp)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="w-full text-xs font-bold text-[#181343] hover:text-[#181343] hover:bg-slate-50 border-[#E8E8EA] rounded-xl shadow-2xs cursor-pointer"
                    >
                      Lihat Rincian Peluang
                    </Button>
                  ) : !isManagement && opp.status === "DRAFT" && onOpenEditModal ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onOpenEditModal(opp)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                      className="flex-1 text-xs font-bold bg-[#181343] hover:bg-[#25205c] text-white rounded-xl shadow-2xs cursor-pointer"
                    >
                      Lanjutkan Draf
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDetailModal(opp)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="flex-1 text-xs font-bold text-[#181343] hover:text-[#181343] hover:bg-slate-50 border-[#E8E8EA] rounded-xl shadow-2xs cursor-pointer"
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
                          className="p-2 rounded-xl text-[#787680] hover:text-[#181343] hover:bg-[#F4F4F6] transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : onOpenEditModal ? (
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(opp)}
                          title="Edit Peluang"
                          className="p-2 rounded-xl text-[#787680] hover:text-[#181343] hover:bg-[#F4F4F6] transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      ) : null}

                      {onDeleteOpportunity && (
                        <button
                          type="button"
                          onClick={() => onDeleteOpportunity(opp.id, opp.title)}
                          title="Hapus Peluang"
                          className="p-2 rounded-xl text-[#787680] hover:text-[#BA1A1A] hover:bg-rose-50 transition-colors cursor-pointer"
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
