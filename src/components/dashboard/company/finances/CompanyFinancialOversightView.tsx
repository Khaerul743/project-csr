"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Wallet,
  TrendingUp,
  Coins,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  PieChart,
  Layers,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  BarChart3,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyProgramItem, CompanyProfile } from "../types";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import {
  FOCUS_AREA_CONFIG,
  PROGRAM_STATUS_CONFIG,
  formatRupiah,
  formatDate,
} from "../helpers";
import { parseBeneficiariesCount } from "../../analytics/helpers";
import { CompanyFinancialOversightResponse } from "@/modules/companies/company.interface";

interface CompanyFinancialOversightViewProps {
  programs: CompanyProgramItem[];
  company: CompanyProfile | null;
  onSelectProgramFinances: (program: CompanyProgramItem) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function CompanyFinancialOversightView({
  programs,
  company,
  onSelectProgramFinances,
  onRefresh,
  isLoading = false,
}: CompanyFinancialOversightViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [focusFilter, setFocusFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"budget-desc" | "spent-desc" | "rate-asc" | "rate-desc">("budget-desc");

  // State sinkronisasi data dari backend API
  const [serverData, setServerData] = useState<CompanyFinancialOversightResponse | null>(null);
  const [isFetchingServer, setIsFetchingServer] = useState(false);

  const fetchFinancialOversight = useCallback(async () => {
    try {
      setIsFetchingServer(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const res = await fetch("/api/companies/current/financial-oversight", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setServerData(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal memuat pengawasan keuangan dari backend:", err);
    } finally {
      setIsFetchingServer(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialOversight();
  }, [fetchFinancialOversight]);

  const handleRefresh = async () => {
    if (onRefresh) onRefresh();
    await fetchFinancialOversight();
  };

  // Agregasi Finansial Menyeluruh (Fallback Client-side)
  const clientFinancialMetrics = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let totalBeneficiaries = 0;

    programs.forEach((prog) => {
      const budgetNum = parseFloat(prog.budget || "0") || 0;
      const spentNum = parseFloat(prog.spentBudget || "0") || 0;
      totalBudget += budgetNum;
      totalSpent += spentNum;

      const benCount = parseBeneficiariesCount(prog.actualBeneficiaries || prog.targetBeneficiaries);
      totalBeneficiaries += benCount;
    });

    const unspentBudget = Math.max(0, totalBudget - totalSpent);
    const absorptionRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const avgCostPerBeneficiary =
      totalBeneficiaries > 0 && totalSpent > 0 ? Math.round(totalSpent / totalBeneficiaries) : 0;

    return {
      totalBudget,
      totalSpent,
      unspentBudget,
      absorptionRate,
      totalBeneficiaries,
      avgCostPerBeneficiary,
    };
  }, [programs]);

  // Gunakan data backend server-authoritative jika sudah dimuat
  const activeMetrics = useMemo(() => {
    if (serverData?.summary) {
      return serverData.summary;
    }
    return clientFinancialMetrics;
  }, [serverData, clientFinancialMetrics]);

  // Deteksi Program dengan Perhatian Khusus (Early Warning Alerts)
  const financialAlerts = useMemo(() => {
    const alerts: {
      id: string;
      program: CompanyProgramItem;
      type: "slow_absorption" | "near_ceiling";
      title: string;
      description: string;
    }[] = [];

    programs.forEach((prog) => {
      if (prog.status === "IN_PROGRESS") {
        const budget = parseFloat(prog.budget || "0") || 0;
        const spent = parseFloat(prog.spentBudget || "0") || 0;
        const rate = budget > 0 ? (spent / budget) * 100 : 0;

        if (rate < 25 && budget > 0) {
          alerts.push({
            id: `slow-${prog.id}`,
            program: prog,
            type: "slow_absorption",
            title: `Serapan Lambat: ${prog.title}`,
            description: `Program sedang berjalan namun serapan dana baru mencapai ${rate.toFixed(1)}% (${formatRupiah(spent)} dari ${formatRupiah(budget)}).`,
          });
        } else if (rate >= 95 && budget > 0) {
          alerts.push({
            id: `ceiling-${prog.id}`,
            program: prog,
            type: "near_ceiling",
            title: `Mendekati Pagu Maksimal: ${prog.title}`,
            description: `Realisasi anggaran telah mencapai ${rate.toFixed(1)}% (${formatRupiah(spent)} dari ${formatRupiah(budget)}). Periksa kebutuhan penyesuaian termin.`,
          });
        }
      }
    });

    return alerts;
  }, [programs]);

  // Distribusi Alokasi Anggaran per Fokus Area
  const focusDistribution = useMemo(() => {
    const dist: Record<string, { count: number; totalBudget: number; totalSpent: number }> = {};

    programs.forEach((prog) => {
      const area = prog.focusArea || "LAINNYA";
      const budget = parseFloat(prog.budget || "0") || 0;
      const spent = parseFloat(prog.spentBudget || "0") || 0;

      if (!dist[area]) {
        dist[area] = { count: 0, totalBudget: 0, totalSpent: 0 };
      }
      dist[area].count += 1;
      dist[area].totalBudget += budget;
      dist[area].totalSpent += spent;
    });

    return Object.entries(dist).map(([area, data]) => {
      const config =
        (FOCUS_AREA_CONFIG as Record<string, { label: string; variant: string }>)[area] || {
          label: area,
          variant: "slate",
        };
      const percentOfTotal =
        activeMetrics.totalBudget > 0
          ? (data.totalBudget / activeMetrics.totalBudget) * 100
          : 0;
      const absorption =
        data.totalBudget > 0 ? (data.totalSpent / data.totalBudget) * 100 : 0;

      return {
        area,
        label: config.label,
        count: data.count,
        totalBudget: data.totalBudget,
        totalSpent: data.totalSpent,
        percentOfTotal,
        absorption,
        config,
      };
    }).sort((a, b) => b.totalBudget - a.totalBudget);
  }, [programs, activeMetrics.totalBudget]);

  // Filter & Sort Daftar Program Finansial
  const filteredPrograms = useMemo(() => {
    return programs
      .filter((prog) => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          prog.title.toLowerCase().includes(q) ||
          (prog.partnerName && prog.partnerName.toLowerCase().includes(q)) ||
          (prog.targetCity && prog.targetCity.toLowerCase().includes(q));

        const matchFocus = focusFilter === "ALL" || prog.focusArea === focusFilter;
        const matchStatus = statusFilter === "ALL" || prog.status === statusFilter;

        return matchSearch && matchFocus && matchStatus;
      })
      .sort((a, b) => {
        const budgetA = parseFloat(a.budget || "0") || 0;
        const budgetB = parseFloat(b.budget || "0") || 0;
        const spentA = parseFloat(a.spentBudget || "0") || 0;
        const spentB = parseFloat(b.spentBudget || "0") || 0;
        const rateA = budgetA > 0 ? (spentA / budgetA) * 100 : 0;
        const rateB = budgetB > 0 ? (spentB / budgetB) * 100 : 0;

        if (sortBy === "budget-desc") return budgetB - budgetA;
        if (sortBy === "spent-desc") return spentB - spentA;
        if (sortBy === "rate-desc") return rateB - rateA;
        if (sortBy === "rate-asc") return rateA - rateB;
        return 0;
      });
  }, [programs, searchQuery, focusFilter, statusFilter, sortBy]);

  // Ekspor Data Rekap Keuangan ke CSV
  const handleExportCsv = () => {
    const headers = [
      "Nama Program",
      "Mitra Pelaksana",
      "Fokus Area",
      "Lokasi",
      "Pagu Anggaran (Rp)",
      "Realisasi Belanja (Rp)",
      "Sisa Pagu (Rp)",
      "Tingkat Serapan (%)",
      "Status Program",
      "Penerima Manfaat (Jiwa)",
    ];

    const rows = filteredPrograms.map((p) => {
      const budget = parseFloat(p.budget || "0") || 0;
      const spent = parseFloat(p.spentBudget || "0") || 0;
      const unspent = Math.max(0, budget - spent);
      const rate = budget > 0 ? ((spent / budget) * 100).toFixed(2) : "0.00";
      const benCount = parseBeneficiariesCount(p.actualBeneficiaries || p.targetBeneficiaries);

      return [
        `"${p.title.replace(/"/g, '""')}"`,
        `"${(p.partnerName || "Mitra").replace(/"/g, '""')}"`,
        `"${p.focusArea || "-"}"`,
        `"${(p.targetCity || "Nasional").replace(/"/g, '""')}"`,
        budget,
        spent,
        unspent,
        rate,
        `"${p.status}"`,
        benCount,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Rekap_Keuangan_CSR_${company?.name || "Perusahaan"}_${dateStr}.csv`);
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
              <Wallet className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#181343] tracking-tight">
              Pengawasan Anggaran &amp; Keuangan CSR
            </h2>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 tracking-wide uppercase">
              Mode Pengawasan Eksekutif
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Audit agregasi pagu alokasi komitmen, realisasi belanja lapangan, dan rasio efisiensi serapan dana CSR perusahaan secara terpadu.
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
            Ekspor Rekap (CSV)
          </Button>
        </div>
      </div>

      {/* 2. 4 Kartu KPI Keuangan Eksekutif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* KPI 1: Total Pagu Anggaran */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pagu Komitmen
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight truncate">
              {formatRupiah(activeMetrics.totalBudget)}
            </div>
            <p className="text-xs text-slate-500">
              Total dana disepakati ({programs.length} program)
            </p>
          </div>
        </div>

        {/* KPI 2: Realisasi Belanja */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Realisasi Belanja
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#009E75] tracking-tight truncate">
              {formatRupiah(activeMetrics.totalSpent)}
            </div>
            <p className="text-xs text-slate-500">
              Terverifikasi kuitansi belanja lapangan
            </p>
          </div>
        </div>

        {/* KPI 3: Tingkat Serapan Anggaran */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tingkat Serapan
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight">
                {activeMetrics.absorptionRate.toFixed(1)}%
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeMetrics.absorptionRate >= 70
                    ? "bg-emerald-100 text-emerald-800"
                    : activeMetrics.absorptionRate >= 35
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {activeMetrics.absorptionRate >= 70
                  ? "Sangat Baik"
                  : activeMetrics.absorptionRate >= 35
                  ? "Berjalan Normal"
                  : "Perlu Akselerasi"}
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, activeMetrics.absorptionRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Rata-rata Biaya per Penerima */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rata-rata Biaya / Jiwa
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold text-[#181343] tracking-tight truncate">
              {activeMetrics.avgCostPerBeneficiary > 0
                ? formatRupiah(activeMetrics.avgCostPerBeneficiary) + " / jiwa"
                : "Rp 0 / jiwa"}
            </div>
            <p className="text-xs text-slate-500">
              Rasio efisiensi dana per orang
            </p>
          </div>
        </div>
      </div>

      {/* 3. Panel Peringatan Kesehatan Finansial (Early Warning Alerts) */}
      {financialAlerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Peringatan Kesehatan Finansial Program ({financialAlerts.length} Perhatian Khusus)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {financialAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-white border border-amber-200/70 flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-500">
                    Mitra: <strong>{alert.program.partnerName || "Mitra"}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectProgramFinances(alert.program)}
                    className="inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 text-[11px] cursor-pointer"
                  >
                    <span>Audit Program</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Distribusi Pagu Anggaran per Fokus Area CSR */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#181343]">
              Distribusi Pagu Anggaran Berdasarkan Fokus Area CSR
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Komparasi alokasi dana dan serapan riil pada setiap bidang inisiatif
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total {focusDistribution.length} Sektor
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {focusDistribution.map((item) => (
            <div
              key={item.area}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 truncate">
                  {item.label}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                  {item.count} Program
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Pagu:</span>
                  <span className="font-bold text-slate-900">{formatRupiah(item.totalBudget)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Terserap:</span>
                  <span className="font-bold text-emerald-700">{formatRupiah(item.totalSpent)}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Serapan {item.absorption.toFixed(1)}%</span>
                  <span>{item.percentOfTotal.toFixed(1)}% dari total CSR</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, item.absorption)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Tabel Komparasi Finansial Seluruh Program */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        {/* Toolbar Pencarian & Filter */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#181343]">
              Rincian Keuangan per Program Pelaksanaan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredPrograms.length} dari {programs.length} program terdaftar
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
                placeholder="Cari program / mitra..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#181343] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#181343]/10"
              />
            </div>

            {/* Filter Fokus Area */}
            <select
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#181343] bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="ALL">Semua Fokus Area</option>
              {(Object.keys(FOCUS_AREA_CONFIG) as CsrFocusArea[]).map((key) => (
                <option key={key} value={key}>
                  {FOCUS_AREA_CONFIG[key].label}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#181343] bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="IN_PROGRESS">Sedang Berjalan</option>
              <option value="COMPLETED">Selesai</option>
              <option value="PLANNED">Direncanakan</option>
              <option value="ON_HOLD">Ditunda</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#181343] bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="budget-desc">Pagu Terbesar</option>
              <option value="spent-desc">Serapan Terbesar</option>
              <option value="rate-desc">Serapan % Tertinggi</option>
              <option value="rate-asc">Serapan % Terendah</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Finansial */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="py-3 px-4">Program &amp; Mitra</th>
                <th className="py-3 px-4">Fokus &amp; Status</th>
                <th className="py-3 px-4 text-right">Pagu Anggaran</th>
                <th className="py-3 px-4 text-right">Realisasi Belanja</th>
                <th className="py-3 px-4 text-center">Tingkat Serapan</th>
                <th className="py-3 px-4 text-center">Aksi Pengawasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Tidak ditemukan program yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((prog) => {
                  const budget = parseFloat(prog.budget || "0") || 0;
                  const spent = parseFloat(prog.spentBudget || "0") || 0;
                  const rate = budget > 0 ? (spent / budget) * 100 : 0;
                  const statusConf = PROGRAM_STATUS_CONFIG[prog.status] || {
                    label: prog.status,
                    variant: "slate",
                  };
                  const focusConf =
                    (FOCUS_AREA_CONFIG as Record<string, { label: string; variant: string }>)[prog.focusArea] || {
                      label: prog.focusArea,
                      variant: "slate",
                    };

                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Program & Mitra */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <p className="font-extrabold text-slate-900 line-clamp-1">
                          {prog.title}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{prog.partnerName || "Mitra Pelaksana"}</span>
                          <span>&bull;</span>
                          <span>{prog.targetCity || "Nasional"}</span>
                        </p>
                      </td>

                      {/* Fokus & Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant={focusConf.variant as any} size="sm">
                            {focusConf.label}
                          </Badge>
                          <Badge variant={statusConf.variant as any} size="sm" hasDot>
                            {statusConf.label}
                          </Badge>
                        </div>
                      </td>

                      {/* Pagu Anggaran */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#181343]">
                        {formatRupiah(budget)}
                      </td>

                      {/* Realisasi Belanja */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#009E75]">
                        {formatRupiah(spent)}
                      </td>

                      {/* Tingkat Serapan */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1 min-w-[70px]">
                          <span className="font-black text-slate-900 text-xs">
                            {rate.toFixed(1)}%
                          </span>
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, rate)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Aksi Pengawasan */}
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectProgramFinances(prog)}
                          leftIcon={<Wallet className="w-3.5 h-3.5 text-emerald-700" />}
                          className="text-xs font-semibold text-[#181343] hover:bg-emerald-50 hover:border-emerald-200 shadow-2xs cursor-pointer"
                        >
                          Audit Finansial
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
