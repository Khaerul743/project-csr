"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Coins,
  MapPin,
  Clock,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileCheck,
  HeartHandshake,
  Star,
  RefreshCw,
  Building2,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartnerItem, CompanyProgramItem, CompanyProfile } from "../types";
import { FOCUS_AREA_CONFIG, formatRupiah, formatDate } from "../helpers";
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

  // State sinkronisasi data dari backend API
  const [serverData, setServerData] = useState<CompanyPartnerEvaluationsResponse | null>(null);
  const [isFetchingServer, setIsFetchingServer] = useState(false);

  const fetchPartnerEvaluations = useCallback(async () => {
    try {
      setIsFetchingServer(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const res = await fetch("/api/companies/current/partner-evaluations", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setServerData(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal memuat evaluasi mitra dari backend:", err);
    } finally {
      setIsFetchingServer(false);
    }
  }, []);

  useEffect(() => {
    fetchPartnerEvaluations();
  }, [fetchPartnerEvaluations]);

  const handleRefresh = async () => {
    if (onRefresh) onRefresh();
    await fetchPartnerEvaluations();
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
          status: item.partner.status as any,
          focusArea: item.partner.focusArea as any,
        } as PartnerItem,
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      {/* 1. Header Identitas & Aksi Eksekutif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#181343] tracking-tight">
              Evaluasi Kinerja &amp; Indeks Akuntabilitas Mitra
            </h2>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 tracking-wide uppercase">
              Audit Portofolio Eksekutif
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pengukuran objektif keandalan mitra pelaksana CSR berbasis disiplin laporan lapangan, kepatuhan kuitansi, dan kepuasan penerima manfaat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isFetchingServer}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading || isFetchingServer ? "animate-spin" : ""}`} />}
            className="text-xs font-semibold cursor-pointer"
          >
            Segarkan Data
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5 text-emerald-700" />}
            className="text-xs font-semibold text-[#181343] hover:bg-slate-50 border-slate-200 cursor-pointer"
          >
            Ekspor Rekap Mitra (CSV)
          </Button>
        </div>
      </div>

      {/* 2. 4 Kartu KPI Portofolio Mitra Eksekutif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* KPI 1: Total Mitra */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Lembaga Mitra
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight">
              {portfolioStats.totalPartners}
            </div>
            <p className="text-xs text-slate-500">
              NGO / Yayasan terakreditasi di platform
            </p>
          </div>
        </div>

        {/* KPI 2: Rata-rata Skor Akuntabilitas */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Indeks Akuntabilitas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#009E75] tracking-tight">
              {portfolioStats.avgScore}
              <span className="text-xs font-bold text-slate-400">/100</span>
            </div>
            <p className="text-xs text-slate-500">
              Rata-rata kepatuhan portofolio
            </p>
          </div>
        </div>

        {/* KPI 3: Rasio Mitra Unggulan (Tier 1) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Mitra Tier 1 (Unggulan)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight">
              {portfolioStats.tier1Percent}%
              <span className="text-xs font-bold text-slate-400 ml-1.5">
                ({portfolioStats.tier1Count} Mitra)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Skor akuntabilitas di atas 88
            </p>
          </div>
        </div>

        {/* KPI 4: Total Pagu Dikelola */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Pagu Dikelola Mitra
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold text-[#181343] tracking-tight truncate">
              {formatRupiah(portfolioStats.totalManagedBudget)}
            </div>
            <p className="text-xs text-slate-500">
              Total alokasi program aktif &amp; tuntas
            </p>
          </div>
        </div>
      </div>

      {/* 3. Panel Distribusi Kuadran Kinerja (Performance Tier Breakdown) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#181343]">
              Distribusi Klasifikasi Kinerja Kemitraan (Executive Tiering)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pembagian mitra ke dalam 4 kuadran akuntabilitas untuk rekomendasi alokasi CSR
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600">
            Formula: 35% Lapangan &bull; 30% Finansial &bull; 25% Warga &bull; 10% Legalitas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Tier 1 Card */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950">
                Tier 1: Mitra Unggulan
              </span>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                {portfolioStats.tier1Count} Lembaga
              </span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
              Skor $\ge$ 88. Kepatuhan sangat tinggi, prioritas kerja sama strategis &amp; program multi-tahun.
            </p>
          </div>

          {/* Tier 2 Card */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-950">
                Tier 2: Mitra Teruji
              </span>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-900">
                {portfolioStats.tier2Count} Lembaga
              </span>
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
              Skor 75–87. Kinerja stabil dan memenuhi standar operasional program CSR reguler.
            </p>
          </div>

          {/* Tier 3 Card */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950">
                Tier 3: Perlu Pendampingan
              </span>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                {portfolioStats.tier3Count} Lembaga
              </span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
              Skor 60–74. Terdapat revisi berulang pada laporan kegiatan atau kelengkapan kuitansi.
            </p>
          </div>

          {/* Tier 4 Card */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-950">
                Tier 4: Perhatian Khusus
              </span>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-900">
                {portfolioStats.tier4Count} Lembaga
              </span>
            </div>
            <p className="text-[11px] text-rose-900 leading-relaxed font-medium">
              Skor &lt; 60. Rekomendasi penahanan termin baru dan audit mendalam sebelum MoU lanjutan.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Papan Peringkat Kinerja Mitra & Kartu Evaluasi */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        {/* Toolbar Pencarian & Filter */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#181343]">
              Papan Peringkat &amp; Scorecard Akuntabilitas Mitra
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredEvaluations.length} dari {partners.length} mitra terdaftar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama lembaga / kota..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#181343] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#181343]/10"
              />
            </div>

            {/* Filter Tier */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#181343] bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="ALL">Semua Tier Kinerja</option>
              <option value="TIER_1">Tier 1: Mitra Unggulan</option>
              <option value="TIER_2">Tier 2: Mitra Teruji</option>
              <option value="TIER_3">Tier 3: Perlu Pendampingan</option>
              <option value="TIER_4">Tier 4: Perhatian Khusus</option>
            </select>

            {/* Filter Fokus Area */}
            <select
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#181343] bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="ALL">Semua Fokus Bidang</option>
              {Object.keys(FOCUS_AREA_CONFIG).map((key) => (
                <option key={key} value={key}>
                  {FOCUS_AREA_CONFIG[key as keyof typeof FOCUS_AREA_CONFIG].label}
                </option>
              ))}
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#181343] bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="score-desc">Skor Tertinggi</option>
              <option value="score-asc">Skor Terendah</option>
              <option value="budget-desc">Pagu Terbesar</option>
              <option value="programs-desc">Program Terbanyak</option>
            </select>
          </div>
        </div>

        {/* Grid Scorecards Mitra */}
        {filteredEvaluations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            Tidak ada lembaga mitra yang memenuhi filter kriteria saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvaluations.map((item, idx) => {
              const focusConf =
                FOCUS_AREA_CONFIG[item.partner.focusArea as keyof typeof FOCUS_AREA_CONFIG] || {
                  label: item.partner.focusArea,
                  variant: "slate",
                };

              return (
                <div
                  key={item.partner.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Kartu: Peringkat, Logo, Nama, dan Skor */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar / Logo */}
                        <div className="w-11 h-11 rounded-xl bg-[#181343] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                          {item.partner.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-400">
                              #{idx + 1}
                            </span>
                            <h4 className="font-extrabold text-sm text-[#181343] truncate">
                              {item.partner.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                            <span>{item.partner.organizationType || "Yayasan"}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {item.partner.city || "Nasional"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Skor Lingkaran & Badge Tier */}
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-sm font-black text-[#181343]">
                            {item.overallScore}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Predikat & Rekomendasi Eksekutif */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={item.tierBadgeVariant as any} size="sm">
                        {item.tierLabel}
                      </Badge>
                      <Badge variant={focusConf.variant as any} size="sm">
                        {focusConf.label}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-normal bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <strong>Catatan Pengawasan:</strong> {item.tierRecommendation}
                    </p>

                    {/* 3 Mini Bar Capaian Pilar */}
                    <div className="space-y-2 pt-1 text-xs">
                      {/* Pilar 1: Lapangan */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Disiplin Laporan Lapangan (35%)</span>
                          <span className="font-bold text-slate-900">{item.fieldReportingScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${item.fieldReportingScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Pilar 2: Finansial */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Integritas Audit Kuitansi (30%)</span>
                          <span className="font-bold text-slate-900">{item.financialIntegrityScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${item.financialIntegrityScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Pilar 3: Kepuasan Warga */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Rating Kepuasan Warga (25%)</span>
                          <span className="font-bold text-slate-900">{item.satisfactionScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full"
                            style={{ width: `${item.satisfactionScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mini Data Ringkasan Finansial */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Program</span>
                        <span className="font-black text-slate-900 text-xs">
                          {item.programsCount} Inisiatif
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Pagu Dikelola</span>
                        <span className="font-black text-slate-900 text-xs truncate block">
                          {formatRupiah(item.totalBudget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Penerima</span>
                        <span className="font-black text-emerald-700 text-xs">
                          {item.totalBeneficiaries.toLocaleString("id-ID")} Jiwa
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPartnerDetail(item.partner)}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-slate-600" />}
                      className="w-full text-xs font-semibold text-[#181343] hover:bg-slate-50 cursor-pointer shadow-2xs"
                    >
                      Lihat Portofolio &amp; Legalitas Mitra
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Tabel Komparasi Efisiensi per Mitra */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#181343]">
            Tabel Komparasi Efisiensi &amp; Rekam Jejak Belanja per Mitra
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Komparasi efisiensi biaya per jiwa penerima manfaat dan kepatuhan realisasi dana CSR
          </p>
        </div>

        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="py-3 px-4">Lembaga Mitra</th>
                <th className="py-3 px-4">Fokus Bidang</th>
                <th className="py-3 px-4 text-center">Skor Akuntabilitas</th>
                <th className="py-3 px-4 text-right">Pagu Dikelola</th>
                <th className="py-3 px-4 text-right">Realisasi Belanja</th>
                <th className="py-3 px-4 text-right">Biaya / Jiwa</th>
                <th className="py-3 px-4 text-center">Klasifikasi Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    Tidak ada data mitra yang tersedia.
                  </td>
                </tr>
              ) : (
                filteredEvaluations.map((item) => (
                  <tr key={item.partner.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 min-w-[180px]">
                      <p className="font-extrabold text-slate-900">{item.partner.name}</p>
                      <p className="text-[11px] text-slate-500">{item.partner.city || "Nasional"}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {item.partner.focusArea || "-"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                        {item.overallScore} / 100
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-[#181343]">
                      {formatRupiah(item.totalBudget)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-[#009E75]">
                      {formatRupiah(item.totalSpent)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {item.costPerBeneficiary > 0 ? formatRupiah(item.costPerBeneficiary) : "Rp 0"}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={item.tierBadgeVariant as any} size="sm">
                        {item.tierLabel}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}