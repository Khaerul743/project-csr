"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  BarChart3,
  TrendingUp,
  Leaf,
  Users,
  ShieldCheck,
  Download,
  Printer,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Filter,
  ArrowUpRight,
  Search,
  X,
  Globe,
  Layers,
  ArrowUpDown,
  RotateCcw,
  Check,
  Info,
  ChevronRight,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ProgramAnalyticsData,
  SdgGoal,
  SdgContributionStats,
  EsgPillarCode,
} from "./types";
import {
  ALL_17_SDGS,
  getProgramSdgs,
  getProgramEsgPillars,
  computeSdgEsgAnalytics,
  exportSdgEsgCsv,
  formatRupiah,
  formatCompactRupiah,
  formatDate,
} from "./helpers";

interface EsgAnalyticsViewProps {
  role: "COMPANY" | "PARTNER";
  company?: any;
  organizationName?: string;
  programs: ProgramAnalyticsData[] | any[];
  onOpenProgramDetail?: (prog: ProgramAnalyticsData | any) => void;
  onExportReport?: (data: any) => void;
}

export function EsgAnalyticsView({
  role,
  company,
  organizationName,
  programs = [],
  onOpenProgramDetail,
  onExportReport,
}: EsgAnalyticsViewProps) {
  // Safe program list
  const safePrograms: ProgramAnalyticsData[] = useMemo(() => {
    if (!Array.isArray(programs)) return [];
    return programs;
  }, [programs]);

  // Available program years derived from actual program start/end dates
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    safePrograms.forEach((p) => {
      if (p.startDate) {
        const y = new Date(p.startDate).getFullYear();
        if (!isNaN(y)) yearsSet.add(String(y));
      }
      if (p.endDate) {
        const y = new Date(p.endDate).getFullYear();
        if (!isNaN(y)) yearsSet.add(String(y));
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [safePrograms]);

  // Filter States
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedSdg, setSelectedSdg] = useState<string>("ALL");
  const [selectedPillar, setSelectedPillar] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sort & Display options for 17 SDGs chart
  const [sdgSortOrder, setSdgSortOrder] = useState<"MOST_CONTRIBUTED" | "SDG_NUMBER">("MOST_CONTRIBUTED");
  const [sdgDisplayFilter, setSdgDisplayFilter] = useState<"ALL" | "COVERED" | "UNCOVERED">("ALL");

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Reference for scrolling to program details
  const programTableRef = useRef<HTMLDivElement>(null);

  // Check if any filter is active
  const isAnyFilterActive =
    selectedYear !== "ALL" ||
    selectedSdg !== "ALL" ||
    selectedPillar !== "ALL" ||
    selectedStatus !== "ALL" ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedYear("ALL");
    setSelectedSdg("ALL");
    setSelectedPillar("ALL");
    setSelectedStatus("ALL");
    setSearchQuery("");
  };

  // Filtered Programs based on active criteria
  const filteredPrograms = useMemo(() => {
    return safePrograms.filter((p) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (p.title || "").toLowerCase().includes(q);
        const matchPartner = (p.partnerName || "").toLowerCase().includes(q);
        const matchCompany = (p.companyName || "").toLowerCase().includes(q);
        const matchCity = (p.targetCity || "").toLowerCase().includes(q);
        const matchProv = (p.targetProvince || "").toLowerCase().includes(q);
        if (!matchTitle && !matchPartner && !matchCompany && !matchCity && !matchProv) {
          return false;
        }
      }

      // 2. Year Filter
      if (selectedYear !== "ALL") {
        const startY = p.startDate ? new Date(p.startDate).getFullYear() : null;
        const endY = p.endDate ? new Date(p.endDate).getFullYear() : null;
        const targetY = parseInt(selectedYear, 10);
        const matchYear = startY === targetY || endY === targetY;
        if (!matchYear) return false;
      }

      // 3. Status Filter
      if (selectedStatus !== "ALL") {
        if ((p.status || "").toUpperCase() !== selectedStatus.toUpperCase()) {
          return false;
        }
      }

      // 4. SDG Filter
      if (selectedSdg !== "ALL") {
        const targetSdgId = parseInt(selectedSdg, 10);
        const progSdgs = getProgramSdgs(p);
        if (!progSdgs.includes(targetSdgId)) {
          return false;
        }
      }

      // 5. Pillar Filter
      if (selectedPillar !== "ALL") {
        const progPillars = getProgramEsgPillars(p);
        if (!progPillars.includes(selectedPillar as EsgPillarCode)) {
          return false;
        }
      }

      return true;
    });
  }, [safePrograms, searchQuery, selectedYear, selectedStatus, selectedSdg, selectedPillar]);

  // Compute Analytics based on filtered programs
  const { sdgDistributions, esgPillars, kpis, gapAnalysis } = useMemo(() => {
    return computeSdgEsgAnalytics(filteredPrograms);
  }, [filteredPrograms]);

  // Sorted and filtered 17 SDGs list for the visualization bar chart
  const displayedSdgDistributions = useMemo(() => {
    let list = [...sdgDistributions];

    // Filter by coverage
    if (sdgDisplayFilter === "COVERED") {
      list = list.filter((item) => item.isCovered);
    } else if (sdgDisplayFilter === "UNCOVERED") {
      list = list.filter((item) => !item.isCovered);
    }

    // Sort
    if (sdgSortOrder === "MOST_CONTRIBUTED") {
      list.sort((a, b) => {
        if (b.programCount !== a.programCount) {
          return b.programCount - a.programCount;
        }
        return a.sdg.id - b.sdg.id;
      });
    } else {
      list.sort((a, b) => a.sdg.id - b.sdg.id);
    }

    return list;
  }, [sdgDistributions, sdgSortOrder, sdgDisplayFilter]);

  // Maximum program count for relative bar scaling
  const maxSdgCount = useMemo(() => {
    const counts = sdgDistributions.map((s) => s.programCount);
    return Math.max(...counts, 1);
  }, [sdgDistributions]);

  // Handler when user clicks on an SDG in the chart
  const handleSelectSdg = (sdgId: number) => {
    if (selectedSdg === String(sdgId)) {
      setSelectedSdg("ALL");
    } else {
      setSelectedSdg(String(sdgId));
      // Scroll smoothly down to the program list table
      setTimeout(() => {
        programTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  // Handler when user clicks a pillar filter from the ESG cards
  const handleSelectPillar = (pillarCode: EsgPillarCode) => {
    if (selectedPillar === pillarCode) {
      setSelectedPillar("ALL");
    } else {
      setSelectedPillar(pillarCode);
      setTimeout(() => {
        programTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayName = organizationName || company?.name || "Organisasi Anda";

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. HEADER BANNER: IDENTITAS HALAMAN */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#181343] via-[#1a1c4b] to-[#0A6E51] text-white shadow-xl relative overflow-hidden">
        {/* Soft decorative background glows */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/15 text-xs font-semibold backdrop-blur-md">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kerangka Keberlanjutan 17 SDGs & 3 Pilar ESG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Analisis Kontribusi SDGs & ESG
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            Jelajahi kontribusi program CSR terhadap tujuan pembangunan berkelanjutan dan pilar ESG untuk mengidentifikasi capaian serta kesenjangan prioritas program bagi {displayName}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSdgEsgCsv(filteredPrograms, displayName)}
            leftIcon={<Download className="w-4 h-4" />}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs backdrop-blur-md font-bold rounded-xl h-10 px-4"
          >
            Ekspor Data (CSV)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPrintModalOpen(true)}
            leftIcon={<Printer className="w-4 h-4" />}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 rounded-xl h-10 px-4 cursor-pointer"
          >
            Cetak Ringkasan Eksekutif
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER & INTERAKTIVITAS BAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama program, mitra pelaksana, atau lokasi kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tahun */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] cursor-pointer"
            >
              <option value="ALL">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>

            {/* Filter SDG */}
            <select
              value={selectedSdg}
              onChange={(e) => setSelectedSdg(e.target.value)}
              className="h-10 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 px-3 max-w-[190px] truncate focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] cursor-pointer"
            >
              <option value="ALL">Semua Kategori SDG</option>
              {ALL_17_SDGS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.code}: {g.name}
                </option>
              ))}
            </select>

            {/* Filter Pilar ESG */}
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="h-10 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] cursor-pointer"
            >
              <option value="ALL">Semua Pilar ESG</option>
              <option value="E">Pilar E (Environmental)</option>
              <option value="S">Pilar S (Social)</option>
              <option value="G">Pilar G (Governance)</option>
            </select>

            {/* Filter Status Program */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 px-3 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="PLANNED">Persiapan (Planned)</option>
              <option value="IN_PROGRESS">Sedang Berjalan</option>
              <option value="COMPLETED">Selesai (Completed)</option>
              <option value="ON_HOLD">Ditunda (On Hold)</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>

            {/* Reset Button */}
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset seluruh filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Indicators */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400 font-medium">Filter aktif:</span>
            {selectedYear !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                Tahun {selectedYear}
                <button type="button" onClick={() => setSelectedYear("ALL")}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              </span>
            )}
            {selectedSdg !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                SDG {selectedSdg}
                <button type="button" onClick={() => setSelectedSdg("ALL")}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              </span>
            )}
            {selectedPillar !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                Pilar {selectedPillar}
                <button type="button" onClick={() => setSelectedPillar("ALL")}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              </span>
            )}
            {selectedStatus !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                Status: {selectedStatus}
                <button type="button" onClick={() => setSelectedStatus("ALL")}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                Kata kunci: &ldquo;{searchQuery}&rdquo;
                <button type="button" onClick={() => setSearchQuery("")}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              </span>
            )}
            <span className="text-slate-400 font-medium ml-auto">
              Menampilkan {filteredPrograms.length} dari {safePrograms.length} program
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. RINGKASAN KHUSUS SDGS & ESG (4 RELEVANT KPI CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: SDGs Tercakup */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/90 rounded-2xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                SDGs Tercakup
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {kpis.coveredSdgsCount}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 17 Sasaran</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-400">Tingkat Cakupan:</span>
              <span className="font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200/60">
                {kpis.coveredPercentage}% Terpenuhi
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: SDGs Belum Tercakup */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/90 rounded-2xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                SDGs Belum Tercakup
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">
                {kpis.uncoveredSdgsCount}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 17 Sasaran</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-400">Peluang Sasaran Baru:</span>
              <span className="font-semibold text-slate-600">
                {17 - kpis.coveredSdgsCount} Kategori Terbuka
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: SDG Paling Banyak Didukung */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/90 rounded-2xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                SDG Terbanyak Didukung
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            {kpis.topSdg ? (
              <>
                <div className="text-lg font-black text-slate-900 truncate" title={`${kpis.topSdg.sdg.code}: ${kpis.topSdg.sdg.name}`}>
                  {kpis.topSdg.sdg.code} • {kpis.topSdg.sdg.name}
                </div>
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-400">Total Program:</span>
                  <span className="font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded-md border border-blue-200/60">
                    {kpis.topSdg.programCount} Program ({kpis.topSdg.percentage}%)
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-bold text-slate-400 italic">Belum Ada Data</div>
                <div className="text-[11px] text-slate-400">Belum ada program CSR aktif</div>
              </>
            )}
          </CardContent>
        </Card>

        {/* KPI 4: Pilar ESG Dominan */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/90 rounded-2xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pilar ESG Dominan
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            {kpis.dominantPillar ? (
              <>
                <div className="text-lg font-black text-slate-900 truncate">
                  Pilar {kpis.dominantPillar.pillar} • {kpis.dominantPillar.name}
                </div>
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-400">Frekuensi Pilar:</span>
                  <span className="font-bold text-purple-700 px-2 py-0.5 bg-purple-50 rounded-md border border-purple-200/60">
                    {kpis.dominantPillar.programCount} Program ({kpis.dominantPillar.percentage}%)
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-bold text-slate-400 italic">Belum Ada Data</div>
                <div className="text-[11px] text-slate-400">Belum ada klasifikasi pilar</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 4. DISTRIBUSI KONTRIBUSI 17 SDGS (VISUALISASI UTAMA HALAMAN) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Section Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Distribusi Kontribusi 17 SDGs
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Visualisasi Utama
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Pemetaan interaktif kontribusi program terhadap 17 sasaran pembangunan global PBB. Klik pada salah satu baris SDG untuk meninjau rincian program terkait di bawah.
            </p>
          </div>

          {/* Interactive Chart Options */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Filter Status Coverage */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setSdgDisplayFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sdgDisplayFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
                }`}
              >
                Semua (17)
              </button>
              <button
                type="button"
                onClick={() => setSdgDisplayFilter("COVERED")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sdgDisplayFilter === "COVERED" ? "bg-white text-emerald-800 shadow-2xs" : "hover:text-slate-900"
                }`}
              >
                Tercakup ({kpis.coveredSdgsCount})
              </button>
              <button
                type="button"
                onClick={() => setSdgDisplayFilter("UNCOVERED")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sdgDisplayFilter === "UNCOVERED" ? "bg-white text-amber-800 shadow-2xs" : "hover:text-slate-900"
                }`}
              >
                Belum Ada ({kpis.uncoveredSdgsCount})
              </button>
            </div>

            {/* Sort Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setSdgSortOrder((prev) =>
                  prev === "MOST_CONTRIBUTED" ? "SDG_NUMBER" : "MOST_CONTRIBUTED"
                )
              }
              leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
              className="text-xs font-bold rounded-xl border-slate-200 h-9 px-3 cursor-pointer"
            >
              {sdgSortOrder === "MOST_CONTRIBUTED"
                ? "Urutan Terbanyak"
                : "Urutan SDG 1–17"}
            </Button>
          </div>
        </div>

        {/* 17 SDGs Horizontal Bar Chart */}
        <div className="space-y-3 pt-1">
          {displayedSdgDistributions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">Tidak ada kategori SDG yang cocok dengan filter tampilan.</p>
            </div>
          ) : (
            displayedSdgDistributions.map((item) => {
              const isSelected = selectedSdg === String(item.sdg.id);
              const relativeWidth =
                item.programCount > 0
                  ? Math.max(12, Math.round((item.programCount / maxSdgCount) * 100))
                  : 0;

              return (
                <div
                  key={item.sdg.id}
                  onClick={() => handleSelectSdg(item.sdg.id)}
                  className={`group p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#181343] bg-slate-50/90 ring-2 ring-[#181343]/10 shadow-xs"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                    {/* SDG Identifier & Title */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* SDG Official Number Badge */}
                      <div
                        className="w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: item.sdg.color }}
                      >
                        {item.sdg.id}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                            {item.sdg.code}: {item.sdg.name}
                          </h4>
                          {/* ESG Pillars tags */}
                          <div className="flex items-center gap-1 shrink-0">
                            {item.sdg.esgPillars.map((p) => (
                              <span
                                key={p}
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  p === "E"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : p === "S"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {item.sdg.nameEn}
                        </span>
                      </div>
                    </div>

                    {/* Program Stats & Coverage Status */}
                    <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                      {item.isCovered ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            {item.programCount} Program
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            {item.percentage}% Portofolio
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          0 Program (Belum Tercakup)
                        </span>
                      )}

                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-transform ${
                          isSelected ? "rotate-90 text-[#181343]" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Horizontal Bar Graphic */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    {item.isCovered ? (
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-2xs"
                        style={{
                          width: `${relativeWidth}%`,
                          backgroundColor: item.sdg.color,
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-200/50" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Calculation Method Info Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Metode Perhitungan & Penyelarasan:</strong> Satu program CSR dapat berkontribusi secara holistik pada beberapa SDGs secara bersamaan (misal program air bersih mendukung SDG 6 dan SDG 3). Akumulasi kontribusi dihitung berdasarkan pemetaan sasaran intervensi program, sehingga total frekuensi kontribusi pada grafik dapat melampaui jumlah program unik.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PENGELOMPOKAN KE TIGA PILAR ESG (3 CARDS) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Pengelompokan ke Tiga Pilar ESG
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Portofolio program CSR dikelompokkan secara objektif mengikuti klasifikasi keterkaitan SDGs pada pilar Environmental, Social, dan Governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {esgPillars.map((p) => {
            const isPillarActive = selectedPillar === p.pillar;

            return (
              <div
                key={p.pillar}
                className={`p-6 rounded-3xl bg-white border transition-all space-y-4 relative overflow-hidden flex flex-col justify-between ${
                  isPillarActive
                    ? "border-[#181343] ring-2 ring-[#181343]/15 shadow-md"
                    : "border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300"
                }`}
              >
                {/* Accent top stripe */}
                <div
                  className={`w-full h-1.5 absolute left-0 top-0 ${
                    p.pillar === "E"
                      ? "bg-emerald-600"
                      : p.pillar === "S"
                      ? "bg-blue-600"
                      : "bg-purple-600"
                  }`}
                />

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          p.pillar === "E"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.pillar === "S"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {p.pillar === "E" ? (
                          <Leaf className="w-4 h-4" />
                        ) : p.pillar === "S" ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Pilar {p.pillar}
                        </span>
                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {p.name}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl border ${p.badgeClass}`}
                    >
                      {p.percentage}% Program
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                    {p.subtitle}
                  </p>

                  {/* Program stats bar */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Program Terkait:</span>
                      <span className="font-black text-slate-900">{p.programCount} Program</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Fokus Kontribusi:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={p.focusSummary}>
                        {p.focusSummary}
                      </span>
                    </div>
                  </div>

                  {/* Connected SDGs Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      SDGs Terhubung ({p.linkedSdgs.length} Sasaran):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {p.linkedSdgs.map((sdgId) => {
                        const sdgInfo = ALL_17_SDGS.find((g) => g.id === sdgId);
                        return (
                          <button
                            key={sdgId}
                            type="button"
                            onClick={() => handleSelectSdg(sdgId)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                            style={{ backgroundColor: sdgInfo?.color || "#475569" }}
                            title={`${sdgInfo?.code}: ${sdgInfo?.name}`}
                          >
                            <span>SDG {sdgId}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Filter Action Button */}
                <div className="pt-2">
                  <Button
                    type="button"
                    variant={isPillarActive ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleSelectPillar(p.pillar)}
                    className={`w-full text-xs font-bold rounded-xl h-9 cursor-pointer ${
                      isPillarActive
                        ? "bg-[#181343] text-white hover:bg-[#211a5b]"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isPillarActive ? `Hapus Filter Pilar ${p.pillar}` : `Lihat Program Pilar ${p.pillar}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. ANALISIS KESENJANGAN KONTRIBUSI SDGS (STRATEGIC GAP ANALYSIS) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Analisis Kesenjangan & Wawasan Sasaran SDGs
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Tinjauan berbasis data aktual untuk membantu perusahaan mempertimbangkan prioritas program CSR, mengidentifikasi capaian, serta memetakan peluang diversifikasi dampak.
          </p>
        </div>

        {/* 4 Strategic Gap Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: SDGs Paling Banyak Didukung */}
          <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                Fokus Utama Tercakup
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                SDGs Paling Banyak Didukung
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kategori sasaran dengan dukungan program CSR tertinggi:
              </p>
            </div>

            <div className="space-y-2">
              {gapAnalysis.topSupportedSdgs.length > 0 ? (
                gapAnalysis.topSupportedSdgs.map((item) => (
                  <div
                    key={item.sdg.id}
                    onClick={() => handleSelectSdg(item.sdg.id)}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-blue-100 shadow-2xs hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">
                      {item.sdg.code}: {item.sdg.name}
                    </span>
                    <span className="font-extrabold text-blue-700 shrink-0">
                      {item.programCount} Program
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Belum ada program</span>
              )}
            </div>
          </div>

          {/* Card 2: SDGs Masih Sedikit Kontribusi */}
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Inisiatif Rintisan
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                SDGs Sedikit Kontribusi
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sasaran yang telah tersentuh namun frekuensinya masih minimal:
              </p>
            </div>

            <div className="space-y-2">
              {gapAnalysis.leastCoveredSdgs.length > 0 ? (
                gapAnalysis.leastCoveredSdgs.map((item) => (
                  <div
                    key={item.sdg.id}
                    onClick={() => handleSelectSdg(item.sdg.id)}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-amber-100 shadow-2xs hover:border-amber-300 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">
                      {item.sdg.code}: {item.sdg.name}
                    </span>
                    <span className="font-extrabold text-amber-700 shrink-0">
                      {item.programCount} Program
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Belum ada data</span>
              )}
            </div>
          </div>

          {/* Card 3: SDGs Belum Tercakup */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Ruang Diversifikasi
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                SDGs Belum Tercakup
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Terdapat <strong>{gapAnalysis.uncoveredSdgs.length} sasaran</strong> tanpa alokasi program saat ini.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {gapAnalysis.uncoveredSdgs.map((item) => (
                  <span
                    key={item.sdg.id}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600"
                  >
                    SDG {item.sdg.id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Distribusi Pilar ESG */}
          <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                Keseimbangan Pilar
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                Distribusi 3 Pilar ESG
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Proporsi keterkaitan pilar pada keseluruhan portofolio:
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-800">Environmental (E):</span>
                <span className="font-bold text-slate-900">{gapAnalysis.pillarDistribution.environmental} Program</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-800">Social (S):</span>
                <span className="font-bold text-slate-900">{gapAnalysis.pillarDistribution.social} Program</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-800">Governance (G):</span>
                <span className="font-bold text-slate-900">{gapAnalysis.pillarDistribution.governance} Program</span>
              </div>
            </div>
          </div>
        </div>

        {/* Objective Strategic Consideration Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-950 font-bold">Catatan Pertimbangan Strategis:</strong> SDGs dengan jumlah kontribusi yang sedikit atau belum tercakup sama sekali bukan secara otomatis menandakan kebutuhan masyarakat paling mendesak di sektor tersebut. Jadikan hasil analisis kesenjangan ini sebagai bahan pertimbangan bersama data kajian kebutuhan wilayah (needs assessment) dan peta prioritas strategis CSR jangka menengah perusahaan Anda.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. RINCIAN PROGRAM TERKAIT SDGS & PILAR ESG (DRILLDOWN TABLE) */}
      {/* ========================================================================= */}
      <div
        ref={programTableRef}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Rincian Program Terkait SDGs & Pilar ESG
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar program CSR yang memenuhi kriteria filter dengan rincian keterkaitan sasaran SDGs dan pilar keberlanjutan.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {filteredPrograms.length} Program Ditemukan
          </div>
        </div>

        {/* Table of Filtered Programs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Nama Program & Lokasi</th>
                <th className="pb-3 font-bold">{role === "COMPANY" ? "Mitra Pelaksana" : "Perusahaan Sponsor"}</th>
                <th className="pb-3 font-bold">Keterkaitan SDGs</th>
                <th className="pb-3 font-bold">Pilar ESG</th>
                <th className="pb-3 font-bold">Anggaran Disepakati</th>
                <th className="pb-3 font-bold">Status</th>
                {onOpenProgramDetail && <th className="pb-3 font-bold text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">
                      Tidak Ada Program yang Cocok dengan Filter
                    </p>
                    <p className="text-xs text-slate-400">
                      Silakan sesuaikan kriteria pencarian atau klik reset filter.
                    </p>
                    {isAnyFilterActive && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        className="mt-2 text-xs font-bold"
                      >
                        Reset Filter
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((prog) => {
                  const sdgIds = getProgramSdgs(prog);
                  const pillars = getProgramEsgPillars(prog);

                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Program Title & Location */}
                      <td className="py-3.5 pr-3 max-w-[240px]">
                        <div className="font-bold text-slate-900 leading-snug truncate" title={prog.title}>
                          {prog.title}
                        </div>
                        {(prog.targetCity || prog.targetProvince) && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {[prog.targetCity, prog.targetProvince].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </td>

                      {/* Partner / Sponsor */}
                      <td className="py-3.5 pr-3 text-slate-700 font-semibold max-w-[160px] truncate">
                        {role === "COMPANY"
                          ? prog.partnerName || "Mitra Pelaksana"
                          : prog.companyName || "Perusahaan Donor"}
                      </td>

                      {/* Linked SDGs */}
                      <td className="py-3.5 pr-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {sdgIds.map((id) => {
                            const sdgInfo = ALL_17_SDGS.find((g) => g.id === id);
                            return (
                              <span
                                key={id}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shadow-2xs"
                                style={{ backgroundColor: sdgInfo?.color || "#475569" }}
                                title={`${sdgInfo?.code}: ${sdgInfo?.name}`}
                              >
                                SDG {id}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* ESG Pillars */}
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-1">
                          {pillars.map((pil) => (
                            <span
                              key={pil}
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                pil === "E"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : pil === "S"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-purple-100 text-purple-800 border border-purple-200"
                              }`}
                            >
                              Pilar {pil}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-3.5 pr-3 font-semibold text-slate-800">
                        {formatRupiah(prog.budget)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 pr-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                            prog.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : prog.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {prog.status === "COMPLETED"
                            ? "Selesai"
                            : prog.status === "IN_PROGRESS"
                            ? "Sedang Berjalan"
                            : prog.status === "PLANNED"
                            ? "Persiapan"
                            : prog.status}
                        </span>
                      </td>

                      {/* Action */}
                      {onOpenProgramDetail && (
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenProgramDetail(prog)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Detail</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. MODAL PRATINJAU CETAK LAPORAN ANALISIS SDGS & ESG */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Pratinjau Dokumen Analisis Kontribusi SDGs & ESG
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body (Printable Area) */}
            <div id="printable-esg-report" className="space-y-6 p-4 border border-slate-100 rounded-2xl bg-white text-slate-900 text-xs">
              {/* Kop Laporan Resmi */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 block">
                  Platform Kolaborasi Kemitraan CSR & Pelaporan Dampak Keberlanjutan Indonesia
                </span>
                <h2 className="text-xl font-black tracking-tight text-slate-950">
                  LAPORAN ANALISIS KONTRIBUSI SDGS & PILAR ESG
                </h2>
                <p className="text-xs text-slate-600">
                  Entitas Pelapor: <strong>{displayName}</strong> • Tanggal Dokumen: {formatDate(new Date().toISOString())}
                </p>
              </div>

              {/* Ringkasan Eksekutif */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                  1. Ringkasan Kinerja Sasaran Pembangunan Berkelanjutan (SDGs)
                </h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">SDGs Tercakup</span>
                    <span className="font-black text-lg text-emerald-700">{kpis.coveredSdgsCount} / 17</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">SDGs Belum Ada</span>
                    <span className="font-black text-lg text-amber-600">{kpis.uncoveredSdgsCount} / 17</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">SDG Terbanyak</span>
                    <span className="font-bold text-xs text-blue-700 truncate block">
                      {kpis.topSdg ? `${kpis.topSdg.sdg.code} (${kpis.topSdg.programCount})` : "-"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Pilar Dominan</span>
                    <span className="font-bold text-xs text-purple-700 truncate block">
                      {kpis.dominantPillar ? `Pilar ${kpis.dominantPillar.pillar}` : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rincian 17 SDGs */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                  2. Distribusi Kontribusi 17 SDGs
                </h4>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold text-slate-700">
                      <th className="py-1">Sasaran SDG</th>
                      <th className="py-1">Pilar ESG</th>
                      <th className="py-1">Jumlah Program</th>
                      <th className="py-1">Persentase</th>
                      <th className="py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ALL_17_SDGS.map((sdg) => {
                      const stat = sdgDistributions.find((d) => d.sdg.id === sdg.id);
                      const count = stat ? stat.programCount : 0;
                      const pct = stat ? stat.percentage : 0;
                      return (
                        <tr key={sdg.id}>
                          <td className="py-1 font-semibold">
                            {sdg.code}: {sdg.name}
                          </td>
                          <td className="py-1">{sdg.esgPillars.join(", ")}</td>
                          <td className="py-1 font-bold">{count} Program</td>
                          <td className="py-1">{pct}%</td>
                          <td className="py-1">
                            {count > 0 ? (
                              <span className="text-emerald-700 font-bold">Tercakup</span>
                            ) : (
                              <span className="text-slate-400">Belum Tercakup</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Analisis Kesenjangan */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">3. Analisis Kesenjangan Strategis</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Berdasarkan pemetaan saat ini, program CSR terkonsentrasi pada pilar {kpis.dominantPillar?.name || "Sosial"}. Kesenjangan pada sasaran yang belum tercakup disajikan sebagai bahan pertimbangan strategis bersama data kajian kebutuhan wilayah dampingan untuk penyusunan prioritas program CSR berikutnya.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPrintModalOpen(false)}
                className="font-bold text-xs"
              >
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                Cetak Dokumen Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
