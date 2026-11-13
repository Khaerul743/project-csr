"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  TrendingUp,
  Leaf,
  Users,
  ShieldCheck,
  Download,
  Printer,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowUpRight,
  Search,
  X,
  Globe,
  ArrowUpDown,
  RotateCcw,
  Info,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProgramAnalyticsData,
  EsgPillarCode,
} from "./types";
import {
  ALL_17_SDGS,
  getProgramSdgs,
  getProgramEsgPillars,
  computeSdgEsgAnalytics,
  exportSdgEsgCsv,
  formatRupiah,
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
  const [sdgSortOrder, setSdgSortOrder] = useState<"MOST_CONTRIBUTED" | "SDG_NUMBER">("SDG_NUMBER");
  const [sdgDisplayFilter, setSdgDisplayFilter] = useState<"ALL" | "COVERED" | "UNCOVERED">("ALL");

  // Print modal & view tab state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"sdgs" | "pillars" | "programs">("sdgs");

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
      setActiveTab("programs");
    }
  };

  // Handler when user clicks a pillar filter from the ESG cards
  const handleSelectPillar = (pillarCode: EsgPillarCode) => {
    if (selectedPillar === pillarCode) {
      setSelectedPillar("ALL");
    } else {
      setSelectedPillar(pillarCode);
      setActiveTab("programs");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayName = organizationName || company?.name || "Organisasi Anda";

  return (
    <div className="space-y-8 animate-in fade-in duration-200 w-full">
      {/* 1. Header Ringkas & Aksi (Selaras Halaman Kinerja Mitra) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Laporan &amp; Analitik ESG
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Pemetaan kontribusi program terhadap 17 SDGs dan 3 pilar Environmental, Social, Governance bagi {displayName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportSdgEsgCsv(filteredPrograms, displayName)}
            leftIcon={<Download className="w-3.5 h-3.5 text-[#059669]" />}
            className="text-xs font-semibold text-[#181343] border-[#E5E7EB] hover:bg-slate-50 cursor-pointer"
          >
            Ekspor CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPrintModalOpen(true)}
            leftIcon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
            className="text-xs font-semibold text-[#181343] border-[#E5E7EB] hover:bg-slate-50 cursor-pointer"
          >
            Pratinjau Cetak
          </Button>
        </div>
      </div>

      {/* 2. Ringkasan 4 KPI Utama yang Lega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">SDGs Tercakup</span>
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#059669] tabular-nums">
              {kpis.coveredSdgsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ 17 sasaran</span>
          </div>
          <p className="text-xs text-slate-500">
            {kpis.coveredPercentage}% cakupan sasaran global PBB
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Belum Tercakup</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#181343] tabular-nums">
              {kpis.uncoveredSdgsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ 17 sasaran</span>
          </div>
          <p className="text-xs text-slate-500">
            Peluang diversifikasi fokus program
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">SDG Terbanyak</span>
            <Award className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#181343] truncate">
            {kpis.topSdg ? kpis.topSdg.sdg.code : "-"}
          </div>
          <p className="text-xs text-slate-500 truncate" title={kpis.topSdg ? `${kpis.topSdg.sdg.name} (${kpis.topSdg.programCount} program)` : undefined}>
            {kpis.topSdg
              ? `${kpis.topSdg.sdg.name} (${kpis.topSdg.programCount} program)`
              : "Belum ada program aktif"}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Pilar Dominan</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#181343] truncate">
            {kpis.dominantPillar ? `Pilar ${kpis.dominantPillar.pillar}` : "-"}
          </div>
          <p className="text-xs text-slate-500 truncate">
            {kpis.dominantPillar
              ? `${kpis.dominantPillar.name} (${kpis.dominantPillar.percentage}%)`
              : "Belum ada klasifikasi pilar"}
          </p>
        </div>
      </div>

      {/* 3. Toolbar Terpadu: Tab Switcher + Filter Segaris */}
      <div className="space-y-5">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3.5">
          {/* Pill Tabs */}
          <div
            className="flex items-center gap-2 shrink-0 whitespace-nowrap overflow-x-auto max-w-full"
            role="tablist"
            aria-label="Tampilan analitik ESG"
          >
            {[
              { id: "sdgs" as const, label: "Peta 17 SDGs" },
              { id: "pillars" as const, label: "Pilar ESG & Kesenjangan" },
              { id: "programs" as const, label: "Daftar Program", count: filteredPrograms.length },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40 ${
                    isSelected
                      ? "bg-[#181343] text-white border-[#181343]"
                      : "bg-white text-slate-700 border-[#E5E7EB] hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
                        isSelected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search & Filters Inline */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative w-full sm:w-44 lg:w-48 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                aria-label="Cari program, mitra, atau kota"
                placeholder="Cari program atau mitra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs text-[#181343] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/25 focus:border-[#059669]"
              />
            </div>

            <select
              aria-label="Filter tahun"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="shrink-0 px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#181343] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#059669]/25"
            >
              <option value="ALL">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter pilar ESG"
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="shrink-0 max-w-[170px] px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#181343] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#059669]/25"
            >
              <option value="ALL">Semua Pilar</option>
              <option value="E">Pilar E (Environmental)</option>
              <option value="S">Pilar S (Social)</option>
              <option value="G">Pilar G (Governance)</option>
            </select>

            <select
              aria-label="Filter status program"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="shrink-0 px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#181343] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#059669]/25"
            >
              <option value="ALL">Semua Status</option>
              <option value="PLANNED">Persiapan</option>
              <option value="IN_PROGRESS">Sedang Berjalan</option>
              <option value="COMPLETED">Selesai</option>
              <option value="ON_HOLD">Ditunda</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>

            {isAnyFilterActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-rose-600" />}
                className="shrink-0 whitespace-nowrap text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Active Filter Indicator Strip */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-medium">Filter aktif:</span>
            {selectedYear !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedYear("ALL")}
                className="px-2.5 py-0.5 rounded-lg bg-white border border-[#E5E7EB] font-semibold text-[#181343] text-[11px] hover:border-rose-300 cursor-pointer"
              >
                Tahun {selectedYear} ×
              </button>
            )}
            {selectedSdg !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedSdg("ALL")}
                className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800 text-[11px] hover:border-rose-300 cursor-pointer"
              >
                SDG {selectedSdg} ×
              </button>
            )}
            {selectedPillar !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedPillar("ALL")}
                className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800 text-[11px] hover:border-rose-300 cursor-pointer"
              >
                Pilar {selectedPillar} ×
              </button>
            )}
            {selectedStatus !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedStatus("ALL")}
                className="px-2.5 py-0.5 rounded-lg bg-white border border-[#E5E7EB] font-semibold text-[#181343] text-[11px] hover:border-rose-300 cursor-pointer"
              >
                Status: {selectedStatus} ×
              </button>
            )}
            <span className="text-[11px] text-slate-500 ml-auto tabular-nums">
              {filteredPrograms.length} dari {safePrograms.length} program
            </span>
          </div>
        )}

        {/* TAB 1: PETA 17 SDGS (Kompak 2-Kolom Tanpa 17 Kotak Bertumpuk) */}
        {activeTab === "sdgs" && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#181343]">
                  Distribusi Kontribusi 17 SDGs
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Klik salah satu sasaran SDG untuk memfilter dan melihat program terkait.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="inline-flex rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSdgDisplayFilter("ALL")}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      sdgDisplayFilter === "ALL"
                        ? "bg-[#181343] text-white"
                        : "text-slate-600 hover:text-[#181343]"
                    }`}
                  >
                    Semua (17)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSdgDisplayFilter("COVERED")}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      sdgDisplayFilter === "COVERED"
                        ? "bg-[#181343] text-white"
                        : "text-slate-600 hover:text-[#181343]"
                    }`}
                  >
                    Tercakup ({kpis.coveredSdgsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSdgDisplayFilter("UNCOVERED")}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      sdgDisplayFilter === "UNCOVERED"
                        ? "bg-[#181343] text-white"
                        : "text-slate-600 hover:text-[#181343]"
                    }`}
                  >
                    Belum ({kpis.uncoveredSdgsCount})
                  </button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSdgSortOrder((prev) =>
                      prev === "MOST_CONTRIBUTED" ? "SDG_NUMBER" : "MOST_CONTRIBUTED"
                    )
                  }
                  leftIcon={<ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />}
                  className="text-xs font-semibold border-[#E5E7EB] cursor-pointer"
                >
                  {sdgSortOrder === "MOST_CONTRIBUTED" ? "Terbanyak" : "SDG 1-17"}
                </Button>
              </div>
            </div>

            {displayedSdgDistributions.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Globe className="w-7 h-7 mx-auto mb-2 text-slate-400" />
                <p className="text-xs font-medium">Tidak ada kategori SDG pada filter tampilan ini.</p>
              </div>
            ) : (
              (() => {
                const splitIndex = Math.ceil(displayedSdgDistributions.length / 2);
                const sdgColumns = [
                  displayedSdgDistributions.slice(0, splitIndex),
                  displayedSdgDistributions.slice(splitIndex),
                ].filter((col) => col.length > 0);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2.5 items-start">
                    {sdgColumns.map((columnItems, colIdx) => (
                      <div key={colIdx} className="space-y-2.5">
                        {columnItems.map((item) => {
                          const isSelected = selectedSdg === String(item.sdg.id);
                          const relativeWidth =
                            item.programCount > 0
                              ? Math.max(10, Math.round((item.programCount / maxSdgCount) * 100))
                              : 0;

                          return (
                            <button
                              type="button"
                              key={item.sdg.id}
                              onClick={() => handleSelectSdg(item.sdg.id)}
                              className={`w-full p-3 rounded-xl text-left transition-colors cursor-pointer border space-y-2 ${
                                isSelected
                                  ? "bg-emerald-50/70 border-emerald-400"
                                  : "bg-transparent border-transparent hover:bg-slate-50 hover:border-[#E5E7EB]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 tabular-nums"
                                    style={{ backgroundColor: item.sdg.color }}
                                  >
                                    {item.sdg.id}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#181343] truncate">
                                      {item.sdg.code}: {item.sdg.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate">
                                      Pilar {item.sdg.esgPillars.join(", ")}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0 tabular-nums">
                                  {item.isCovered ? (
                                    <span className="text-xs font-bold text-[#181343]">
                                      {item.programCount}{" "}
                                      <span className="text-slate-500 font-medium">
                                        ({item.percentage}%)
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">0 program</span>
                                  )}
                                </div>
                              </div>

                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                {item.isCovered ? (
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${relativeWidth}%`,
                                      backgroundColor: item.sdg.color,
                                    }}
                                  />
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })()
            )}

            <p className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Satu program dapat berkontribusi pada beberapa sasaran SDGs secara bersamaan sesuai fokus intervensi lapangannya.
              </span>
            </p>
          </div>
        )}

        {/* TAB 2: PILAR ESG & ANALISIS KESENJANGAN */}
        {activeTab === "pillars" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {esgPillars.map((p) => {
                const isPillarActive = selectedPillar === p.pillar;

                return (
                  <div
                    key={p.pillar}
                    className={`p-6 rounded-2xl bg-white border transition-colors flex flex-col justify-between gap-5 ${
                      isPillarActive
                        ? "border-[#181343] ring-1 ring-[#181343]"
                        : "border-[#E5E7EB] hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              p.pillar === "E"
                                ? "bg-emerald-50 text-[#059669]"
                                : p.pillar === "S"
                                ? "bg-[#F0EFF8] text-[#181343]"
                                : "bg-slate-100 text-slate-700"
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
                            <span className="text-[11px] font-semibold text-slate-500 block">
                              Pilar {p.pillar}
                            </span>
                            <h3 className="text-base font-bold text-[#181343] leading-tight">
                              {p.name}
                            </h3>
                          </div>
                        </div>

                        <span className="text-sm font-extrabold text-[#181343] tabular-nums">
                          {p.percentage}%
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {p.subtitle}
                      </p>

                      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Program Terkait</span>
                          <span className="font-bold text-[#181343] tabular-nums">
                            {p.programCount} Program
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 shrink-0">Fokus Utama</span>
                          <span className="font-medium text-slate-700 truncate" title={p.focusSummary}>
                            {p.focusSummary}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {p.linkedSdgs.map((sdgId) => {
                          const sdgInfo = ALL_17_SDGS.find((g) => g.id === sdgId);
                          return (
                            <button
                              key={sdgId}
                              type="button"
                              onClick={() => handleSelectSdg(sdgId)}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white hover:opacity-90 cursor-pointer"
                              style={{ backgroundColor: sdgInfo?.color || "#475569" }}
                              title={`${sdgInfo?.code}: ${sdgInfo?.name}`}
                            >
                              SDG {sdgId}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={isPillarActive ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleSelectPillar(p.pillar)}
                      className="w-full text-xs font-semibold cursor-pointer"
                    >
                      {isPillarActive ? `Hapus Filter Pilar ${p.pillar}` : `Lihat Program Pilar ${p.pillar}`}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Analisis Kesenjangan (Clean 4-Col Grid Tanpa Kartu Pastel) */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-[#181343]">
                  Analisis Kesenjangan &amp; Wawasan Strategis
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ringkasan sasaran yang paling terdukung, inisiatif rintisan, dan ruang diversifikasi program.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-3">
                  <div>
                    <span className="text-xs font-bold text-[#181343] block">Paling Banyak Didukung</span>
                    <span className="text-[11px] text-slate-500">Kontribusi tertinggi saat ini</span>
                  </div>
                  <div className="space-y-1.5">
                    {gapAnalysis.topSupportedSdgs.length > 0 ? (
                      gapAnalysis.topSupportedSdgs.map((item) => (
                        <button
                          type="button"
                          key={item.sdg.id}
                          onClick={() => handleSelectSdg(item.sdg.id)}
                          className="w-full flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-[#E5E7EB] hover:border-slate-300 text-left cursor-pointer"
                        >
                          <span className="font-semibold text-[#181343] truncate pr-2">
                            {item.sdg.code}: {item.sdg.name}
                          </span>
                          <span className="font-bold text-[#059669] shrink-0 tabular-nums">
                            {item.programCount}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Belum ada data</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-3">
                  <div>
                    <span className="text-xs font-bold text-[#181343] block">Kontribusi Minimal</span>
                    <span className="text-[11px] text-slate-500">Sasaran dengan frekuensi rendah</span>
                  </div>
                  <div className="space-y-1.5">
                    {gapAnalysis.leastCoveredSdgs.length > 0 ? (
                      gapAnalysis.leastCoveredSdgs.map((item) => (
                        <button
                          type="button"
                          key={item.sdg.id}
                          onClick={() => handleSelectSdg(item.sdg.id)}
                          className="w-full flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-[#E5E7EB] hover:border-slate-300 text-left cursor-pointer"
                        >
                          <span className="font-semibold text-[#181343] truncate pr-2">
                            {item.sdg.code}: {item.sdg.name}
                          </span>
                          <span className="font-bold text-amber-700 shrink-0 tabular-nums">
                            {item.programCount}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Belum ada data</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-3">
                  <div>
                    <span className="text-xs font-bold text-[#181343] block">Belum Tercakup</span>
                    <span className="text-[11px] text-slate-500">
                      {gapAnalysis.uncoveredSdgs.length} sasaran belum teralokasi
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                    {gapAnalysis.uncoveredSdgs.map((item) => (
                      <span
                        key={item.sdg.id}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-slate-600"
                      >
                        SDG {item.sdg.id}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-3">
                  <div>
                    <span className="text-xs font-bold text-[#181343] block">Keseimbangan Pilar</span>
                    <span className="text-[11px] text-slate-500">Distribusi program lintas pilar</span>
                  </div>
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Environmental (E)</span>
                      <span className="font-bold text-[#181343] tabular-nums">
                        {gapAnalysis.pillarDistribution.environmental} Program
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Social (S)</span>
                      <span className="font-bold text-[#181343] tabular-nums">
                        {gapAnalysis.pillarDistribution.social} Program
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Governance (G)</span>
                      <span className="font-bold text-[#181343] tabular-nums">
                        {gapAnalysis.pillarDistribution.governance} Program
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Sasaran SDGs yang belum tercakup dapat dijadikan pertimbangan bersama hasil kajian kebutuhan wilayah untuk penyusunan prioritas CSR berikutnya.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: DAFTAR PROGRAM TERKAIT SDGS & ESG */}
        {activeTab === "programs" && (
          <div ref={programTableRef} className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
            {filteredPrograms.length === 0 ? (
              <div className="py-14 px-6 text-center space-y-3">
                <FileText className="w-7 h-7 mx-auto text-slate-400" />
                <p className="text-sm font-bold text-[#181343]">
                  Tidak ada program yang sesuai dengan filter
                </p>
                <p className="text-xs text-slate-600">
                  Ubah kata kunci pencarian atau pilih reset filter untuk menampilkan semua program.
                </p>
                {isAnyFilterActive && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[780px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-slate-600 font-bold bg-slate-50/70">
                      <th className="py-3.5 px-5">Program &amp; Lokasi</th>
                      <th className="py-3.5 px-4">{role === "COMPANY" ? "Mitra Pelaksana" : "Perusahaan Sponsor"}</th>
                      <th className="py-3.5 px-4">SDGs</th>
                      <th className="py-3.5 px-4">Pilar</th>
                      <th className="py-3.5 px-4 text-right">Pagu</th>
                      <th className="py-3.5 px-4">Status</th>
                      {onOpenProgramDetail && <th className="py-3.5 px-5 text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrograms.map((prog) => {
                      const sdgIds = getProgramSdgs(prog);
                      const pillars = getProgramEsgPillars(prog);

                      return (
                        <tr key={prog.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-5 max-w-[260px]">
                            <p className="font-bold text-[#181343] truncate" title={prog.title}>
                              {prog.title}
                            </p>
                            {(prog.targetCity || prog.targetProvince) && (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                {[prog.targetCity, prog.targetProvince].filter(Boolean).join(", ")}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-slate-700 font-medium max-w-[170px] truncate">
                            {role === "COMPANY"
                              ? prog.partnerName || "Mitra Pelaksana"
                              : prog.companyName || "Perusahaan Donor"}
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {sdgIds.map((id) => {
                                const sdgInfo = ALL_17_SDGS.find((g) => g.id === id);
                                return (
                                  <span
                                    key={id}
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                                    style={{ backgroundColor: sdgInfo?.color || "#475569" }}
                                    title={`${sdgInfo?.code}: ${sdgInfo?.name}`}
                                  >
                                    {id}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              {pillars.map((pil) => (
                                <span
                                  key={pil}
                                  className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#181343]"
                                >
                                  {pil}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-right font-bold text-[#181343] tabular-nums">
                            {formatRupiah(prog.budget)}
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                                prog.status === "COMPLETED"
                                  ? "bg-emerald-50 text-[#047857]"
                                  : prog.status === "IN_PROGRESS"
                                  ? "bg-[#F0EFF8] text-[#181343]"
                                  : "bg-slate-100 text-slate-600"
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

                          {onOpenProgramDetail && (
                            <td className="py-4 px-5 text-right">
                              <button
                                type="button"
                                onClick={() => onOpenProgramDetail(prog)}
                                className="text-xs font-semibold text-[#181343] hover:text-[#059669] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>Detail</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
                className="text-xs font-semibold cursor-pointer"
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
