"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Search,
  Download,
  AlertCircle,
  Coins,
  MapPin,
  HeartHandshake,
  Star,
  RefreshCw,
  Eye,
  LayoutGrid,
  Table2,
  Info,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartnerItem, CompanyProgramItem, CompanyProfile } from "../types";
import { FOCUS_AREA_CONFIG, formatRupiah } from "../helpers";
import { parseBeneficiariesCount } from "../../analytics/helpers";
import { CompanyPartnerEvaluationsResponse } from "@/modules/companies/company.interface";

interface PartnerPerformanceEvaluationViewProps {
  programs: CompanyProgramItem[];
  partners: PartnerItem[];
  company: CompanyProfile | null;
  onViewPartnerDetail: (partner: PartnerItem) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export interface PartnerEvaluationData {
  partner: PartnerItem;
  programsCount: number;
  totalBudget: number;
  totalSpent: number;
  completedProgramsCount: number;
  inProgressProgramsCount: number;
  totalBeneficiaries: number;
  costPerBeneficiary: number;
  // Skor pilar
  fieldReportingScore: number; // Pilar 1 (35%)
  financialIntegrityScore: number; // Pilar 2 (30%)
  satisfactionScore: number; // Pilar 3 (25%)
  governanceScore: number; // Pilar 4 (10%)
  overallScore: number; // Total 0 - 100
  tier: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4";
  tierLabel: string;
  tierBadgeVariant: "emerald" | "blue" | "amber" | "rose";
  tierRecommendation: string;
}

function PartnerScoreAvatar({
  logoUrl,
  name,
}: {
  logoUrl?: string | null;
  name: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 shrink-0">
        <img
          src={logoUrl}
          alt={name}
          width={44}
          height={44}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-full bg-[#181343] text-white flex items-center justify-center font-bold text-sm shrink-0">
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
}

export function PartnerPerformanceEvaluationView({
  programs,
  partners,
  company,
  onViewPartnerDetail,
  onRefresh,
  isLoading = false,
}: PartnerPerformanceEvaluationViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [focusFilter, setFocusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"score-desc" | "budget-desc" | "programs-desc" | "score-asc">("score-desc");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showMethodology, setShowMethodology] = useState(false);

  // State sinkronisasi data dari backend API
  const [serverData, setServerData] = useState<CompanyPartnerEvaluationsResponse | null>(null);
  const [isFetchingServer, setIsFetchingServer] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadPartnerEvaluations = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const res = await fetch("/api/companies/current/partner-evaluations", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.message || "Gagal memuat evaluasi kinerja mitra.");
    }
    const json = await res.json();
    return json.success && json.data ? (json.data as CompanyPartnerEvaluationsResponse) : null;
  }, []);

  useEffect(() => {
    let active = true;
    loadPartnerEvaluations()
      .then((data) => {
        if (!active) return;
        setFetchError(null);
        if (data) setServerData(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setFetchError(
          err instanceof Error ? err.message : "Gagal menyinkronkan data evaluasi terbaru."
        );
      });
    return () => {
      active = false;
    };
  }, [loadPartnerEvaluations]);

  const handleRefresh = async () => {
    if (onRefresh) onRefresh();
    try {
      setIsFetchingServer(true);
      setFetchError(null);
      const data = await loadPartnerEvaluations();
      if (data) setServerData(data);
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error ? err.message : "Gagal menyinkronkan data evaluasi terbaru."
      );
    } finally {
      setIsFetchingServer(false);
    }
  };

  // Komputasi Skor Evaluasi untuk Seluruh Mitra (Fallback Client-side)
  const clientEvaluations: PartnerEvaluationData[] = useMemo(() => {
    return partners.map((partner) => {
      // Temukan seluruh program yang dijalankan mitra ini bersama perusahaan
      const partnerProgs = programs.filter(
        (p) => p.partnerId === partner.id || (p.partnerName && p.partnerName.toLowerCase() === partner.name.toLowerCase())
      );

      let totalBudget = 0;
      let totalSpent = 0;
      let totalBeneficiaries = 0;
      let totalActivities = 0;
      let completedActivities = 0;
      let pendingVerif = 0;
      let completedProgs = 0;
      let inProgressProgs = 0;

      partnerProgs.forEach((prog) => {
        const b = parseFloat(prog.budget || "0") || 0;
        const s = parseFloat(prog.spentBudget || "0") || 0;
        totalBudget += b;
        totalSpent += s;

        const ben = parseBeneficiariesCount(prog.actualBeneficiaries || prog.targetBeneficiaries);
        totalBeneficiaries += ben;

        if (prog.status === "COMPLETED") completedProgs += 1;
        if (prog.status === "IN_PROGRESS") inProgressProgs += 1;

        const actTotal = prog.totalActivitiesCount || 0;
        const actComp = prog.completedActivitiesCount || 0;
        const actVerif = prog.pendingVerificationCount || 0;

        totalActivities += actTotal;
        completedActivities += actComp;
        pendingVerif += actVerif;
      });

      // 1. Pilar Kualitas Pelaporan Lapangan (Bobot 35%)
      let fieldReportingScore = 80;
      if (totalActivities > 0) {
        const completionRatio = completedActivities / totalActivities;
        const verifBonus = pendingVerif === 0 ? 10 : 0;
        fieldReportingScore = Math.min(100, Math.round(completionRatio * 90 + verifBonus));
      } else if (partnerProgs.length > 0) {
        fieldReportingScore = completedProgs > 0 ? 88 : 82;
      }

      // 2. Pilar Integritas Finansial & Kuitansi (Bobot 30%)
      let financialIntegrityScore = 82;
      if (totalBudget > 0) {
        const absorption = totalSpent / totalBudget;
        // Serapan sehat antara 50% hingga 100%
        if (absorption >= 0.7 && absorption <= 1.0) {
          financialIntegrityScore = 94;
        } else if (absorption >= 0.4) {
          financialIntegrityScore = 86;
        } else {
          financialIntegrityScore = 74;
        }
      }

      // 3. Pilar Kepuasan Warga Penerima Manfaat (Bobot 25%)
      // Nilai rata-rata kepuasan diestimasi dari rekam jejak program yang sukses
      let satisfactionScore = 85;
      if (completedProgs > 0) {
        satisfactionScore = 92;
      } else if (inProgressProgs > 0) {
        satisfactionScore = 86;
      }

      // 4. Pilar Tata Kelola & Legalitas Institusi (Bobot 10%)
      let governanceScore = 70;
      if (partner.legalNumber) governanceScore += 15;
      if (partner.npwpNumber) governanceScore += 15;
      governanceScore = Math.min(100, governanceScore);

      // Hitung Total Skor Terbobot (0 - 100)
      const overallScore = Math.round(
        fieldReportingScore * 0.35 +
          financialIntegrityScore * 0.30 +
          satisfactionScore * 0.25 +
          governanceScore * 0.10
      );

      // Klasifikasi Tier Rekomendasi
      let tier: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4" = "TIER_2";
      let tierLabel = "Mitra Teruji";
      let tierBadgeVariant: "emerald" | "blue" | "amber" | "rose" = "blue";
      let tierRecommendation = "Kinerja baik dan memenuhi standar operasional reguler.";

      if (overallScore >= 88) {
        tier = "TIER_1";
        tierLabel = "Mitra Unggulan (Top Tier)";
        tierBadgeVariant = "emerald";
        tierRecommendation = "Sangat direkomendasikan untuk program strategis dan kerja sama multi-tahun.";
      } else if (overallScore >= 75) {
        tier = "TIER_2";
        tierLabel = "Mitra Teruji (Reliable)";
        tierBadgeVariant = "blue";
        tierRecommendation = "Memenuhi kriteria akuntabilitas dengan rekam jejak kerja sama yang stabil.";
      } else if (overallScore >= 60) {
        tier = "TIER_3";
        tierLabel = "Perlu Pendampingan";
        tierBadgeVariant = "amber";
        tierRecommendation = "Memerlukan supervisi tim operasional pada pelaporan kuitansi dan linimasa.";
      } else {
        tier = "TIER_4";
        tierLabel = "Perhatian Khusus (High Risk)";
        tierBadgeVariant = "rose";
        tierRecommendation = "Evaluasi menyeluruh disarankan sebelum menyepakati termin kerja sama baru.";
      }

      const costPerBeneficiary =
        totalBeneficiaries > 0 && totalSpent > 0 ? Math.round(totalSpent / totalBeneficiaries) : 0;

      return {
        partner,
        programsCount: partnerProgs.length,
        totalBudget,
        totalSpent,
        completedProgramsCount: completedProgs,
        inProgressProgramsCount: inProgressProgs,
        totalBeneficiaries,
        costPerBeneficiary,
        fieldReportingScore,
        financialIntegrityScore,
        satisfactionScore,
        governanceScore,
        overallScore,
        tier,
        tierLabel,
        tierBadgeVariant,
        tierRecommendation,
      };
    });
  }, [partners, programs]);

  // Gunakan data backend server-authoritative jika sudah dimuat
  const evaluations: PartnerEvaluationData[] = useMemo(() => {
    if (serverData && serverData.evaluations && serverData.evaluations.length > 0) {
      return serverData.evaluations.map((item) => ({
        partner: {
          id: item.partner.id,
          name: item.partner.name,
          organizationType: item.partner.organizationType ?? "Mitra Pelaksana",
          city: item.partner.city ?? "",
          province: item.partner.province ?? "",
          logoUrl: item.partner.logoUrl ?? null,
          status: item.partner.status ?? "",
          focusArea: item.partner.focusArea as PartnerItem["focusArea"],
          createdAt: "",
        },
        programsCount: item.programsCount,
        totalBudget: item.totalBudget,
        totalSpent: item.totalSpent,
        completedProgramsCount: item.completedProgramsCount,
        inProgressProgramsCount: item.inProgressProgramsCount,
        totalBeneficiaries: item.totalBeneficiaries,
        costPerBeneficiary: item.costPerBeneficiary,
        fieldReportingScore: item.fieldReportingScore,
        financialIntegrityScore: item.financialIntegrityScore,
        satisfactionScore: item.satisfactionScore,
        governanceScore: item.governanceScore,
        overallScore: item.overallScore,
        tier: item.tier,
        tierLabel: item.tierLabel,
        tierBadgeVariant: item.tierBadgeVariant,
        tierRecommendation: item.tierRecommendation,
      }));
    }
    return clientEvaluations;
  }, [serverData, clientEvaluations]);

  // Statistik Agregasi Portofolio Mitra
  const portfolioStats = useMemo(() => {
    const totalPartners = evaluations.length;
    if (totalPartners === 0) {
      return {
        totalPartners: 0,
        avgScore: 0,
        tier1Count: 0,
        tier1Percent: 0,
        tier2Count: 0,
        tier3Count: 0,
        tier4Count: 0,
        totalManagedBudget: 0,
      };
    }

    let sumScore = 0;
    let tier1Count = 0;
    let tier2Count = 0;
    let tier3Count = 0;
    let tier4Count = 0;
    let totalManagedBudget = 0;

    evaluations.forEach((item) => {
      sumScore += item.overallScore;
      totalManagedBudget += item.totalBudget;
      if (item.tier === "TIER_1") tier1Count += 1;
      if (item.tier === "TIER_2") tier2Count += 1;
      if (item.tier === "TIER_3") tier3Count += 1;
      if (item.tier === "TIER_4") tier4Count += 1;
    });

    const avgScore = Math.round(sumScore / totalPartners);
    const tier1Percent = Math.round((tier1Count / totalPartners) * 100);

    return {
      totalPartners,
      avgScore,
      tier1Count,
      tier1Percent,
      tier2Count,
      tier3Count,
      tier4Count,
      totalManagedBudget,
    };
  }, [evaluations]);

  // Filter & Urutkan Mitra
  const filteredEvaluations = useMemo(() => {
    return evaluations
      .filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          item.partner.name.toLowerCase().includes(q) ||
          (item.partner.city && item.partner.city.toLowerCase().includes(q)) ||
          (item.partner.province && item.partner.province.toLowerCase().includes(q));

        const matchTier = tierFilter === "ALL" || item.tier === tierFilter;
        const matchFocus = focusFilter === "ALL" || item.partner.focusArea === focusFilter;

        return matchSearch && matchTier && matchFocus;
      })
      .sort((a, b) => {
        if (sortBy === "score-desc") return b.overallScore - a.overallScore;
        if (sortBy === "score-asc") return a.overallScore - b.overallScore;
        if (sortBy === "budget-desc") return b.totalBudget - a.totalBudget;
        if (sortBy === "programs-desc") return b.programsCount - a.programsCount;
        return 0;
      });
  }, [evaluations, searchQuery, tierFilter, focusFilter, sortBy]);

  // Ekspor Data Evaluasi ke CSV
  const handleExportCsv = () => {
    const headers = [
      "Nama Mitra",
      "Kota/Domisili",
      "Fokus Bidang",
      "Skor Akuntabilitas (0-100)",
      "Predikat Kinerja",
      "Total Program",
      "Pagu Dikelola (Rp)",
      "Realisasi Belanja (Rp)",
      "Jiwa Penerima Manfaat",
      "Skor Pelaporan Lapangan (35%)",
      "Skor Integritas Kuitansi (30%)",
      "Skor Kepuasan Warga (25%)",
      "Skor Legalitas (10%)",
    ];

    const rows = filteredEvaluations.map((item) => {
      return [
        `"${item.partner.name.replace(/"/g, '""')}"`,
        `"${(item.partner.city || "Nasional").replace(/"/g, '""')}"`,
        `"${item.partner.focusArea || "-"}"`,
        item.overallScore,
        `"${item.tierLabel}"`,
        item.programsCount,
        item.totalBudget,
        item.totalSpent,
        item.totalBeneficiaries,
        item.fieldReportingScore,
        item.financialIntegrityScore,
        item.satisfactionScore,
        item.governanceScore,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Evaluasi_Kinerja_Mitra_${company?.name || "Perusahaan"}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = searchQuery.trim() !== "" || tierFilter !== "ALL" || focusFilter !== "ALL";

  const resetFilters = () => {
    setSearchQuery("");
    setTierFilter("ALL");
    setFocusFilter("ALL");
  };

  return (
    <div className="space-y-8 w-full">
      {/* 1. Header Ringkas & Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight">
            Evaluasi Kinerja Mitra
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Indeks akuntabilitas mitra berdasarkan pelaporan lapangan, kepatuhan anggaran, dan ulasan warga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMethodology((prev) => !prev)}
            leftIcon={<Info className="w-3.5 h-3.5 text-slate-600" />}
            className="text-xs font-semibold text-slate-700 border-slate-200 cursor-pointer"
          >
            Bobot Skor
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isFetchingServer}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-600 ${
                  isLoading || isFetchingServer ? "animate-spin" : ""
                }`}
              />
            }
            className="text-xs font-semibold text-slate-700 border-slate-200 cursor-pointer"
          >
            Segarkan
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredEvaluations.length === 0}
            leftIcon={<Download className="w-3.5 h-3.5 text-[#009E75]" />}
            className="text-xs font-semibold text-[#181343] hover:bg-slate-50 border-slate-200 cursor-pointer"
          >
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Collapsible Methodology Reference */}
      {showMethodology && (
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#181343] block">Pelaporan Lapangan (35%)</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ketuntasan log aktivitas serta kecepatan verifikasi bukti kegiatan.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#181343] block">Integritas Finansial (30%)</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kewajaran serapan anggaran dan keabsahan kuitansi belanja riil.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#181343] block">Kepuasan Warga (25%)</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Skor ulasan langsung dari penerima manfaat di lokasi program.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#181343] block">Tata Kelola Legal (10%)</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kelengkapan dokumen legalitas yayasan dan NPWP lembaga.
            </p>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {fetchError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{fetchError} Menampilkan kalkulasi lokal sementara.</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="font-bold underline hover:text-rose-950 shrink-0 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 2. Ringkasan 4 KPI Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8EA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Mitra</span>
            <HeartHandshake className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-[#181343] tabular-nums">
            {portfolioStats.totalPartners}
          </div>
          <p className="text-xs text-slate-500">Lembaga mitra terdaftar</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E8E8EA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Rata-rata Skor</span>
            <ShieldCheck className="w-4 h-4 text-[#009E75]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#009E75] tabular-nums">
              {portfolioStats.avgScore}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ 100</span>
          </div>
          <p className="text-xs text-slate-500">Indeks akuntabilitas portofolio</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E8E8EA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Mitra Unggulan</span>
            <Star className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#181343] tabular-nums">
              {portfolioStats.tier1Percent}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({portfolioStats.tier1Count} lembaga)
            </span>
          </div>
          <p className="text-xs text-slate-500">Tier 1 dengan skor 88+</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E8E8EA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Pagu Dikelola</span>
            <Coins className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#181343] tabular-nums truncate">
            {formatRupiah(portfolioStats.totalManagedBudget)}
          </div>
          <p className="text-xs text-slate-500">Total alokasi program mitra</p>
        </div>
      </div>

      {/* 3. Daftar Kinerja Mitra (Toolbar Terpadu + Kartu / Tabel) */}
      <div className="space-y-5">
        {/* Tier Filter Bar + View Switch */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter Tier Kinerja Mitra">
            {[
              { id: "ALL", label: "Semua Mitra", count: portfolioStats.totalPartners, dot: "bg-slate-400" },
              { id: "TIER_1", label: "Unggulan (88+)", count: portfolioStats.tier1Count, dot: "bg-emerald-500" },
              { id: "TIER_2", label: "Teruji (75-87)", count: portfolioStats.tier2Count, dot: "bg-blue-500" },
              { id: "TIER_3", label: "Pendampingan (60-74)", count: portfolioStats.tier3Count, dot: "bg-amber-500" },
              { id: "TIER_4", label: "Perhatian (<60)", count: portfolioStats.tier4Count, dot: "bg-rose-500" },
            ].map((tab) => {
              const isSelected = tierFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setTierFilter(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009E75]/40 ${
                    isSelected
                      ? "bg-[#181343] text-white border-[#181343]"
                      : "bg-white text-slate-700 border-[#E8E8EA] hover:bg-slate-50"
                  }`}
                >
                  {tab.id !== "ALL" && (
                    <span className={`w-2 h-2 rounded-full ${tab.dot} shrink-0`} />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
                      isSelected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Focus, Sort & View Mode */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:flex-initial min-w-[210px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                aria-label="Cari lembaga mitra atau kota"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mitra atau kota..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8E8EA] bg-white text-xs text-[#181343] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009E75]/25 focus:border-[#009E75]"
              />
            </div>

            <select
              aria-label="Filter fokus bidang"
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E8E8EA] text-xs font-semibold text-[#181343] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#009E75]/25"
            >
              <option value="ALL">Semua Fokus</option>
              {Object.keys(FOCUS_AREA_CONFIG).map((key) => (
                <option key={key} value={key}>
                  {FOCUS_AREA_CONFIG[key as keyof typeof FOCUS_AREA_CONFIG].label}
                </option>
              ))}
            </select>

            <select
              aria-label="Urutkan peringkat mitra"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "score-desc" | "budget-desc" | "programs-desc" | "score-asc"
                )
              }
              className="px-3 py-2 rounded-xl border border-[#E8E8EA] text-xs font-semibold text-[#181343] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#009E75]/25"
            >
              <option value="score-desc">Skor Tertinggi</option>
              <option value="score-asc">Skor Terendah</option>
              <option value="budget-desc">Pagu Terbesar</option>
              <option value="programs-desc">Program Terbanyak</option>
            </select>

            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-[#E8E8EA]">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                aria-pressed={viewMode === "cards"}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009E75]/40 ${
                  viewMode === "cards"
                    ? "bg-[#181343] text-white"
                    : "text-slate-600 hover:text-[#181343]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kartu</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009E75]/40 ${
                  viewMode === "table"
                    ? "bg-[#181343] text-white"
                    : "text-slate-600 hover:text-[#181343]"
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading, Empty, or Filtered Results */}
        {(isLoading || isFetchingServer) && evaluations.length === 0 ? (
          <div className="py-16 rounded-2xl bg-white border border-[#E8E8EA] flex flex-col items-center justify-center gap-3 text-slate-600">
            <RefreshCw className="w-5 h-5 animate-spin text-[#009E75]" />
            <span className="text-xs font-medium">Memuat data evaluasi kinerja mitra...</span>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="py-16 px-6 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
            <HeartHandshake className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-[#181343]">Belum Ada Mitra Terdaftar</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Evaluasi akuntabilitas akan otomatis dihitung setelah mitra bergabung dan menjalankan program CSR bersama perusahaan.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs font-semibold cursor-pointer"
            >
              Segarkan Data
            </Button>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
            <Search className="w-7 h-7 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-[#181343]">Tidak Ada Mitra yang Cocok</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Tidak ditemukan lembaga mitra yang sesuai dengan filter atau kata kunci pencarian saat ini.
            </p>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs font-semibold cursor-pointer"
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvaluations.map((item, idx) => {
              const focusConf =
                FOCUS_AREA_CONFIG[item.partner.focusArea as keyof typeof FOCUS_AREA_CONFIG] || {
                  label: item.partner.focusArea || "Umum",
                  variant: "slate",
                };

              const pillars = [
                { label: "Laporan Lapangan", weight: "35%", value: item.fieldReportingScore, bar: "bg-[#009E75]" },
                { label: "Audit Kuitansi", weight: "30%", value: item.financialIntegrityScore, bar: "bg-blue-600" },
                { label: "Kepuasan Warga", weight: "25%", value: item.satisfactionScore, bar: "bg-indigo-600" },
                { label: "Legalitas", weight: "10%", value: item.governanceScore, bar: "bg-slate-600" },
              ];

              return (
                <div
                  key={item.partner.id}
                  className="p-6 rounded-2xl bg-white border border-[#E8E8EA] hover:border-slate-300 transition-colors flex flex-col justify-between gap-6"
                >
                  {/* Card Top: Identity + Total Score */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <PartnerScoreAvatar
                        logoUrl={item.partner.logoUrl}
                        name={item.partner.name}
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 tabular-nums shrink-0">
                            #{idx + 1}
                          </span>
                          <h3 className="font-bold text-sm sm:text-base text-[#181343] truncate">
                            {item.partner.name}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.partner.city || "Nasional"}
                          </span>
                          <span aria-hidden="true">&middot;</span>
                          <span>{focusConf.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1.5">
                      <div className="inline-flex items-baseline gap-1 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-lg font-extrabold text-[#181343] tabular-nums">
                          {item.overallScore}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">/100</span>
                      </div>
                      <div className="block">
                        <Badge variant={item.tierBadgeVariant} size="sm">
                          {item.tierLabel}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Card Middle: Clean 2x2 Pillar Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 py-4 border-y border-slate-100">
                    {pillars.map((pillar) => (
                      <div key={pillar.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">
                            {pillar.label}{" "}
                            <span className="text-slate-500">({pillar.weight})</span>
                          </span>
                          <span className="font-bold text-[#181343] tabular-nums">
                            {pillar.value}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`${pillar.bar} h-full rounded-full`}
                            style={{ width: `${pillar.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Bottom: 3 Key Figures + Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Program</span>
                        <span className="text-xs font-bold text-[#181343] tabular-nums">
                          {item.programsCount} Inisiatif
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Pagu</span>
                        <span className="text-xs font-bold text-[#181343] tabular-nums truncate block">
                          {formatRupiah(item.totalBudget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Penerima</span>
                        <span className="text-xs font-bold text-[#009E75] tabular-nums">
                          {item.totalBeneficiaries.toLocaleString("id-ID")} Jiwa
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPartnerDetail(item.partner)}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-slate-600" />}
                      className="text-xs font-semibold text-[#181343] border-slate-200 hover:bg-slate-50 shrink-0 cursor-pointer"
                    >
                      Lihat Profil
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View Mode */
          <div className="rounded-2xl bg-white border border-[#E8E8EA] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-[#E8E8EA] text-slate-600 font-bold bg-slate-50/70">
                    <th className="py-3.5 px-5">Lembaga Mitra</th>
                    <th className="py-3.5 px-4">Fokus Bidang</th>
                    <th className="py-3.5 px-4 text-center">Skor</th>
                    <th className="py-3.5 px-4 text-right">Pagu Dikelola</th>
                    <th className="py-3.5 px-4 text-right">Realisasi Belanja</th>
                    <th className="py-3.5 px-4 text-right">Biaya / Jiwa</th>
                    <th className="py-3.5 px-4 text-center">Tier</th>
                    <th className="py-3.5 px-5 text-right">Profil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvaluations.map((item) => {
                    const focusLabel =
                      FOCUS_AREA_CONFIG[item.partner.focusArea as keyof typeof FOCUS_AREA_CONFIG]
                        ?.label ||
                      item.partner.focusArea ||
                      "-";

                    return (
                      <tr key={item.partner.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <PartnerScoreAvatar
                              logoUrl={item.partner.logoUrl}
                              name={item.partner.name}
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-[#181343] truncate">
                                {item.partner.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {item.partner.city || "Nasional"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-700 font-medium">
                          {focusLabel}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-[#181343] bg-slate-100 px-2.5 py-1 rounded-lg tabular-nums">
                            {item.overallScore} / 100
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right font-bold text-[#181343] tabular-nums">
                          {formatRupiah(item.totalBudget)}
                        </td>

                        <td className="py-4 px-4 text-right font-bold text-[#009E75] tabular-nums">
                          {formatRupiah(item.totalSpent)}
                        </td>

                        <td className="py-4 px-4 text-right font-semibold text-slate-700 tabular-nums">
                          {item.costPerBeneficiary > 0 ? formatRupiah(item.costPerBeneficiary) : "Rp 0"}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <Badge variant={item.tierBadgeVariant} size="sm">
                            {item.tierLabel}
                          </Badge>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => onViewPartnerDetail(item.partner)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#181343] hover:text-[#009E75] rounded-md px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009E75]/40 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}