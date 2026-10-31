"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  FileText,
  DollarSign,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { opportunityStatusEnum, OpportunityStatus } from "@/db/schema/opportunities";
import { csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import { OpportunityItem } from "../types";
import {
  FOCUS_AREA_CONFIG,
  STATUS_CONFIG,
  formatRupiah,
  formatDate,
} from "../helpers";

interface OpportunitiesManagementViewProps {
  opportunities: OpportunityItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (opp: OpportunityItem) => void;
  onOpenDetailModal: (opp: OpportunityItem) => void;
  onDeleteOpportunity: (oppId: string, oppTitle: string) => void;
}

export function OpportunitiesManagementView({
  opportunities,
  isLoading,
  onRefresh,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDetailModal,
  onDeleteOpportunity,
}: OpportunitiesManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [focusFilter, setFocusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "budget-high" | "deadline">("newest");

  // Format compact
  const formatCompact = (val: number) => {
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(1)} Miliar`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(0)} Juta`;
    }
    return formatRupiah(val);
  };

  // BI Metrics for Opportunities
  const oppMetrics = useMemo(() => {
    const list = Array.isArray(opportunities) ? opportunities : [];
    const totalCount = list.length;
    const openCount = list.filter((o) => o?.status === "OPEN").length;
    const draftCount = list.filter((o) => o?.status === "DRAFT").length;
    const totalBudget = list.reduce((acc, curr) => {
      const num = curr?.estimatedBudget ? parseFloat(curr.estimatedBudget) : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    const avgBudget = totalCount > 0 ? Math.round(totalBudget / totalCount) : 0;

    return {
      totalCount,
      openCount,
      draftCount,
      totalBudget,
      avgBudget,
    };
  }, [opportunities]);

  // Filter & Sort Logic
  const filteredAndSortedOpportunities = useMemo(() => {
    const list = Array.isArray(opportunities) ? [...opportunities] : [];

    return list
      .filter((opp) => {
        if (!opp) return false;

        const matchSearch =
          opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opp.targetCity && opp.targetCity.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (opp.targetProvince && opp.targetProvince.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchStatus = statusFilter === "ALL" || opp.status === statusFilter;
        const matchFocus = focusFilter === "ALL" || opp.focusArea === focusFilter;

        return matchSearch && matchStatus && matchFocus;
      })
      .sort((a, b) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. BI Metric Strip for Opportunities (Executive Insights) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Total Inisiatif Dibuat
          </span>
          <div className="text-2xl font-extrabold text-[#181343] mt-1">
            {oppMetrics.totalCount}
          </div>
          <span className="text-[11px] text-[#787680] mt-0.5 block">
            {oppMetrics.openCount} publik, {oppMetrics.draftCount} draf
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Total Nilai Peluang
          </span>
          <div className="text-2xl font-extrabold text-[#181343] mt-1 truncate">
            {formatCompact(oppMetrics.totalBudget)}
          </div>
          <span className="text-[11px] text-[#787680] mt-0.5 block">
            Komitmen anggaran terbuka
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Rata-rata per Program
          </span>
          <div className="text-2xl font-extrabold text-[#181343] mt-1 truncate">
            {formatCompact(oppMetrics.avgBudget)}
          </div>
          <span className="text-[11px] text-[#787680] mt-0.5 block">
            Skala alokasi inisiatif
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Status Publikasi
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{oppMetrics.openCount} Aktif</span>
          </div>
          <span className="text-[11px] text-[#787680] mt-0.5 block">
            Siap diajukan proposal mitra
          </span>
        </div>
      </div>

      {/* 2. Search, Filter, Sort & Action Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#787680] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari inisiatif, kata kunci, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors focus:bg-white focus:border-[#181343]/40 focus:ring-2 focus:ring-[#181343]/8 text-[#1A1C1D] placeholder:text-[#C8C5D0]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-semibold text-[#787680]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent text-[#1A1C1D] font-medium outline-none cursor-pointer"
            >
              <option value="ALL">Semua</option>
              {opportunityStatusEnum.map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st]?.label || st}
                </option>
              ))}
            </select>
          </div>

          {/* Focus Area Filter */}
          <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-semibold text-[#787680]">Bidang:</span>
            <select
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value)}
              className="text-xs bg-transparent text-[#1A1C1D] font-medium outline-none cursor-pointer max-w-[130px] truncate"
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
          <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#787680]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent text-[#1A1C1D] font-medium outline-none cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="budget-high">Anggaran Tertinggi</option>
              <option value="deadline">Batas Waktu Terdekat</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            title="Muat ulang data"
            className="p-2.5 rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] hover:bg-white text-[#787680] hover:text-[#181343] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Single Authoritative CTA for Creating Opportunity */}
          <Button
            variant="accent"
            size="sm"
            onClick={onOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs py-2 px-3.5 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <span>Buka Peluang Baru</span>
          </Button>
        </div>
      </div>

      {/* 3. Opportunity Card Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#787680] space-y-3">
          <div className="w-7 h-7 border-2 border-[#181343] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Memuat daftar inisiatif peluang CSR...</p>
        </div>
      ) : filteredAndSortedOpportunities.length === 0 ? (
        <div className="py-16 px-6 rounded-3xl bg-white border border-dashed border-[#C8C5D0] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#181343]/5 text-[#181343] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#181343]">
            {searchQuery || statusFilter !== "ALL" || focusFilter !== "ALL"
              ? "Tidak Ada Peluang yang Sesuai Filter"
              : "Belum Ada Peluang Inisiatif Dibuat"}
          </h4>
          <p className="text-xs text-[#787680] max-w-sm mx-auto leading-relaxed">
            {searchQuery || statusFilter !== "ALL" || focusFilter !== "ALL"
              ? "Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat daftar lengkap."
              : "Inisiasi program CSR baru perusahaan Anda untuk mulai menerima proposal dan terhubung dengan mitra pelaksana bereputasi."}
          </p>
          {!(searchQuery || statusFilter !== "ALL" || focusFilter !== "ALL") && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-[#181343] text-white font-bold rounded-xl text-xs cursor-pointer mt-2"
            >
              Inisiasi Peluang Sekarang
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

            return (
              <div
                key={opp.id}
                className="rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {opp.bannerUrl && (
                    <div className="relative h-40 overflow-hidden bg-slate-900">
                      <img
                        src={opp.bannerUrl}
                        alt={opp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <Badge
                          variant={statusCfg.variant}
                          size="sm"
                          hasDot
                          className="bg-white/95 backdrop-blur-xs shadow-2xs"
                        >
                          {statusCfg.label}
                        </Badge>
                        <Badge
                          variant={focus.variant}
                          size="sm"
                          className="bg-white/95 backdrop-blur-xs shadow-2xs"
                        >
                          {focus.label}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    {!opp.bannerUrl && (
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant={statusCfg.variant}
                          size="sm"
                          hasDot
                        >
                          {statusCfg.label}
                        </Badge>
                        <Badge variant={focus.variant} size="sm">
                          {focus.label}
                        </Badge>
                      </div>
                    )}

                    <div>
                      <h3 className="text-base font-bold text-[#181343] group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-[#787680] line-clamp-2 leading-relaxed mt-1.5">
                        {opp.description}
                      </p>
                    </div>

                    {/* Metadata Strip */}
                    <div className="pt-2 border-t border-[#F4F4F6] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[#47464F]">
                        <span className="text-[#787680]">Estimasi Anggaran:</span>
                        <span className="font-extrabold text-emerald-600">
                          {formatRupiah(opp.estimatedBudget)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#47464F]">
                        <span className="text-[#787680]">Wilayah Sasaran:</span>
                        <span className="font-medium truncate max-w-[160px]">
                          {opp.targetCity || opp.targetProvince || "Nasional"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#47464F]">
                        <span className="text-[#787680]">Batas Proposal:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{formatDate(opp.deadline)}</span>
                          {daysLeft !== null && daysLeft >= 0 && daysLeft <= 14 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Sisa {daysLeft} hr
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Non-redundant Action Row */}
                <div className="p-5 pt-0 border-t border-[#F4F4F6] mt-2 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenDetailModal(opp)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs font-bold text-[#181343] hover:text-emerald-700 border-[#E8E8EA] hover:border-emerald-400 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                  >
                    Detail Inisiatif
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(opp)}
                      title="Edit inisiatif"
                      className="p-2 rounded-xl text-[#787680] hover:text-[#181343] hover:bg-[#F4F4F6] transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteOpportunity(opp.id, opp.title)}
                      title="Hapus inisiatif"
                      className="p-2 rounded-xl text-[#787680] hover:text-[#BA1A1A] hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
