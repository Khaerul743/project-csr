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
  Activity,
  CheckCircle2,
  DollarSign,
  Globe,
  FileText,
  Sparkles,
  Filter,
  ArrowUpRight,
  Search,
  X,
  HeartHandshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgramAnalyticsData, OverallEsgMetrics } from "./types";
import {
  computeEsgAnalytics,
  exportProgramsCsv,
  formatRupiah,
  formatCompactRupiah,
  formatDate,
  FOCUS_AREA_DETAILS,
} from "./helpers";
import { CsrFocusArea, csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";

interface EsgAnalyticsViewProps {
  role: "COMPANY" | "PARTNER";
  organizationName?: string;
  programs: ProgramAnalyticsData[];
  onOpenProgramDetail?: (prog: ProgramAnalyticsData) => void;
}

export function EsgAnalyticsView({
  role,
  organizationName,
  programs,
  onOpenProgramDetail,
}: EsgAnalyticsViewProps) {
  // Filter states
  const [selectedFocus, setSelectedFocus] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Compute analytics based on all programs
  const { overall, pillars, focusDistributions } = useMemo(() => {
    return computeEsgAnalytics(programs);
  }, [programs]);

  // Filtered programs for portfolio table
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch =
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.companyName && p.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.partnerName && p.partnerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.targetCity && p.targetCity.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.opportunityTitle && p.opportunityTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchFocus = selectedFocus === "ALL" || p.focusArea === selectedFocus;
      const matchStatus = selectedStatus === "ALL" || p.status === selectedStatus;

      return matchSearch && matchFocus && matchStatus;
    });
  }, [programs, searchQuery, selectedFocus, selectedStatus]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Executive Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-60 h-60 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Executive ESG & Impact Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Laporan & Analitik Kinerja ESG
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ikhtisar komprehensif akuntabilitas dana CSR, keselarasan Tujuan Pembangunan Berkelanjutan (SDGs), serta capaian dampak sosial dan lingkungan untuk {organizationName || "organisasi Anda"}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportProgramsCsv(programs, organizationName)}
            leftIcon={<Download className="w-4 h-4" />}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs backdrop-blur-md"
          >
            Ekspor Data (CSV)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPrintModalOpen(true)}
            leftIcon={<Printer className="w-4 h-4" />}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
          >
            Cetak Ringkasan Eksekutif
          </Button>
        </div>
      </div>

      {/* 2. Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Alokasi */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Alokasi Program
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 truncate">
              {formatCompactRupiah(overall.totalAllocatedBudget)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{overall.totalPrograms} program disetujui</span>
              <span className="font-semibold text-emerald-600">
                {formatRupiah(overall.totalAllocatedBudget)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Realisasi Serapan */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Realisasi Serapan Dana
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 truncate">
              {formatCompactRupiah(overall.totalSpentBudget)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Tingkat Penyerapan</span>
                <span className="font-bold text-indigo-700">{overall.overallAbsorptionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(overall.overallAbsorptionRate, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Penerima Manfaat */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Penerima Manfaat
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {overall.totalBeneficiaries.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-teal-600 font-medium block">
              Individu & komunitas terjangkau
            </span>
          </CardContent>
        </Card>

        {/* Card 4: Kepatuhan & Transparansi ESG */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Indeks Tata Kelola (G)
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-purple-700">
              {overall.transparencyScore}%
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Kontrak MoU Terikat Hukum
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Pilar ESG Trio Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Pilar Keberlanjutan ESG (Environmental, Social, Governance)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelompokan portofolio program berdasarkan pilar standar pelaporan ESG global dan Sustainable Development Goals (SDGs)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pilar E */}
          <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden">
            <div className="w-2 h-full bg-emerald-600 absolute left-0 top-0" />
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Pilar E • Environmental
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 pt-1">
                  Lingkungan & Keanekaragaman Hayati
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                {pillars[0].percentageOfBudget}% Porsi
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {pillars[0].subtitle}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Alokasi Anggaran:</span>
                <span className="font-bold text-slate-900">{formatRupiah(pillars[0].allocatedBudget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Realisasi Serapan:</span>
                <span className="font-bold text-emerald-600">{formatRupiah(pillars[0].spentBudget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Jumlah Program:</span>
                <span className="font-bold text-slate-800">{pillars[0].programCount} Kegiatan</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                SDGs Terkait:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pillars[0].sdgTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pilar S */}
          <div className="p-6 rounded-3xl bg-white border border-blue-200/80 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden">
            <div className="w-2 h-full bg-blue-600 absolute left-0 top-0" />
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Pilar S • Social
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 pt-1">
                  Pemberdayaan & Kesejahteraan Sosial
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {pillars[1].percentageOfBudget}% Porsi
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {pillars[1].subtitle}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Alokasi Anggaran:</span>
                <span className="font-bold text-slate-900">{formatRupiah(pillars[1].allocatedBudget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Realisasi Serapan:</span>
                <span className="font-bold text-blue-600">{formatRupiah(pillars[1].spentBudget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Penerima Manfaat:</span>
                <span className="font-bold text-slate-800">
                  {pillars[1].beneficiaries.toLocaleString("id-ID")} Jiwa
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                SDGs Terkait:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pillars[1].sdgTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pilar G */}
          <div className="p-6 rounded-3xl bg-white border border-purple-200/80 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden">
            <div className="w-2 h-full bg-purple-600 absolute left-0 top-0" />
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                    Pilar G • Governance
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 pt-1">
                  Tata Kelola, Kepatuhan & Transparansi
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                100% Legal
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {pillars[2].subtitle}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Legalitas MoU:</span>
                <span className="font-bold text-emerald-600">Terdaftar & Sah</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Skor Akuntabilitas:</span>
                <span className="font-bold text-purple-700">{overall.transparencyScore}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Audit Serapan:</span>
                <span className="font-bold text-slate-800">Real-time Lapangan</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                SDGs Terkait:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pillars[2].sdgTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Distribusi Anggaran & Serapan per Bidang Fokus CSR */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Distribusi Anggaran & Realisasi per Bidang Fokus CSR
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Komposisi porsi investasi sosial dan efektivitas daya serap dana di setiap pilar tematik program
          </p>
        </div>

        {/* Multi-segment horizontal bar */}
        {overall.totalAllocatedBudget > 0 && (
          <div className="space-y-2">
            <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
              {focusDistributions
                .filter((f) => f.percentageOfBudget > 0)
                .map((f) => (
                  <div
                    key={f.focusArea}
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${f.percentageOfBudget}%`,
                      backgroundColor: f.color,
                    }}
                    title={`${f.label}: ${f.percentageOfBudget}% (${formatRupiah(f.allocatedBudget)})`}
                  />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1">
              {focusDistributions
                .filter((f) => f.percentageOfBudget > 0)
                .map((f) => (
                  <div key={f.focusArea} className="flex items-center gap-1.5 text-slate-600">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className="font-medium">{f.label}</span>
                    <span className="font-bold text-slate-800">({f.percentageOfBudget}%)</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Detailed Grid per Focus Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {focusDistributions.map((item) => (
            <div
              key={item.focusArea}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Badge variant={item.badgeVariant} size="sm">
                  {item.label}
                </Badge>
                <span className="text-xs font-extrabold text-slate-800">
                  {item.programCount} Program
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Alokasi Dana:</span>
                  <span className="font-bold text-slate-900">{formatRupiah(item.allocatedBudget)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Terserap:</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(item.spentBudget)}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Efisiensi Serapan</span>
                  <span className="font-bold text-slate-700">{item.absorptionRate}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(item.absorptionRate, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Tabel Portofolio & Audit Kinerja Program */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Audit Portofolio Program & Kinerja Mitra
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian real-time pelaksanaan, kepatuhan alokasi dana, dan capaian penerima manfaat setiap program
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari program / mitra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedFocus}
              onChange={(e) => setSelectedFocus(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Semua Bidang</option>
              {csrFocusAreaEnum.map((fa) => (
                <option key={fa} value={fa}>
                  {FOCUS_AREA_DETAILS[fa]?.label || fa}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Semua Status</option>
              <option value="PLANNED">PLANNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Program & Inisiatif</th>
                <th className="pb-3 font-semibold">{role === "COMPANY" ? "Mitra Pelaksana" : "Perusahaan Sponsor"}</th>
                <th className="pb-3 font-semibold">Bidang CSR & Pilar</th>
                <th className="pb-3 font-semibold">Anggaran MoU</th>
                <th className="pb-3 font-semibold">Realisasi Serapan</th>
                <th className="pb-3 font-semibold">Penerima Manfaat</th>
                <th className="pb-3 font-semibold">Status</th>
                {onOpenProgramDetail && <th className="pb-3 font-semibold text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data program yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((prog) => {
                  const details = FOCUS_AREA_DETAILS[prog.focusArea as CsrFocusArea] || {
                    label: prog.focusArea,
                    badgeVariant: "slate" as const,
                    pillar: "SOCIAL",
                  };
                  const b = prog.budget ? parseFloat(prog.budget) : 0;
                  const s = prog.spentBudget ? parseFloat(prog.spentBudget) : 0;
                  const rate = b > 0 ? Math.round((s / b) * 100) : 0;

                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pr-3">
                        <div className="font-extrabold text-slate-900 leading-snug">{prog.title}</div>
                        {prog.targetCity && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {prog.targetCity}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-3 text-slate-700 font-semibold">
                        {role === "COMPANY" ? prog.partnerName || "Mitra NGO" : prog.companyName || "Perusahaan Donor"}
                      </td>
                      <td className="py-3.5 pr-3">
                        <div className="space-y-0.5">
                          <Badge variant={details.badgeVariant} size="sm">
                            {details.label}
                          </Badge>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Pilar {details.pillar.charAt(0)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3 font-bold text-slate-900">
                        {formatRupiah(prog.budget)}
                      </td>
                      <td className="py-3.5 pr-3">
                        <div className="space-y-1">
                          <div className="font-bold text-emerald-600">
                            {formatRupiah(prog.spentBudget || "0")}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <div className="w-12 bg-slate-200 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full"
                                style={{ width: `${Math.min(rate, 100)}%` }}
                              />
                            </div>
                            <span>{rate}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3 text-slate-700">
                        {prog.actualBeneficiaries || prog.targetBeneficiaries || "-"}
                      </td>
                      <td className="py-3.5 pr-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            prog.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : prog.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {prog.status}
                        </span>
                      </td>
                      {onOpenProgramDetail && (
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenProgramDetail(prog)}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-0.5"
                          >
                            Detail <ArrowUpRight className="w-3.5 h-3.5" />
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

      {/* 6. Modal Pratinjau Cetak Laporan Eksekutif Resmi */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Pratinjau Laporan Kinerja & Akuntabilitas CSR (ESG Impact Report)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body (Printable Area) */}
            <div id="printable-esg-report" className="space-y-6 p-4 border border-slate-100 rounded-2xl bg-white text-slate-900 text-xs">
              {/* Kop Laporan Resmi */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 block">
                  Platform Kolaborasi ESG & Kemitraan CSR Indonesia
                </span>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
                  LAPORAN AKUNTABILITAS & CAPAIAN DAMPAK ESG
                </h2>
                <p className="text-xs text-slate-600">
                  Organisasi: <span className="font-bold text-slate-900">{organizationName || "Portofolio Inisiatif"}</span> • Periode Cetak:{" "}
                  <span className="font-semibold text-slate-800">{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                </p>
              </div>

              {/* Ringkasan Eksekutif */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Total Alokasi Anggaran</span>
                  <span className="text-sm font-extrabold text-slate-900">{formatRupiah(overall.totalAllocatedBudget)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Realisasi Serapan Dana</span>
                  <span className="text-sm font-extrabold text-emerald-700">{formatRupiah(overall.totalSpentBudget)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Tingkat Penyerapan</span>
                  <span className="text-sm font-extrabold text-indigo-700">{overall.overallAbsorptionRate}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Penerima Manfaat Riil</span>
                  <span className="text-sm font-extrabold text-slate-900">{overall.totalBeneficiaries.toLocaleString("id-ID")} Jiwa</span>
                </div>
              </div>

              {/* Rincian Pilar ESG */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Distribusi Capaian Berdasarkan Pilar ESG:
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                    <span className="font-extrabold text-emerald-800 block">Pilar E (Lingkungan)</span>
                    <span className="text-slate-600 block">Alokasi: {formatRupiah(overall.environmentalBudget)}</span>
                    <span className="text-slate-600 block">Program: {pillars[0].programCount} Kegiatan</span>
                  </div>
                  <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1">
                    <span className="font-extrabold text-blue-800 block">Pilar S (Sosial & Masyarakat)</span>
                    <span className="text-slate-600 block">Alokasi: {formatRupiah(overall.socialBudget)}</span>
                    <span className="text-slate-600 block">Program: {pillars[1].programCount} Kegiatan</span>
                  </div>
                  <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/40 space-y-1">
                    <span className="font-extrabold text-purple-800 block">Pilar G (Tata Kelola / Governance)</span>
                    <span className="text-slate-600 block">Kepatuhan MoU: 100% Sah</span>
                    <span className="text-slate-600 block">Skor: {overall.transparencyScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Tabel Ringkasan Portofolio */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Daftar Portofolio Program CSR ({programs.length} Inisiatif):
                </h4>
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="p-2 font-bold">Judul Program</th>
                      <th className="p-2 font-bold">Bidang CSR</th>
                      <th className="p-2 font-bold">Mitra / Sponsor</th>
                      <th className="p-2 font-bold">Alokasi Anggaran</th>
                      <th className="p-2 font-bold">Realisasi Dana</th>
                      <th className="p-2 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {programs.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2 font-semibold text-slate-900">{p.title}</td>
                        <td className="p-2 text-slate-600">{p.focusArea}</td>
                        <td className="p-2 text-slate-600">{p.partnerName || p.companyName || "-"}</td>
                        <td className="p-2 font-semibold">{formatRupiah(p.budget)}</td>
                        <td className="p-2 font-semibold text-emerald-700">{formatRupiah(p.spentBudget || "0")}</td>
                        <td className="p-2 font-bold">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legal Sign-off Footer */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <div>
                  <span>Dihasilkan secara otomatis oleh sistem CSR Impact Hub</span>
                  <span className="block">Validitas data terverifikasi secara kriptografis & MoU terikat</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">Verifikasi Divisi CSR / Manajemen</span>
                  <span className="block mt-6 border-t border-slate-400 pt-0.5">Penanggung Jawab Program</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPrintModalOpen(false)}
              >
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Cetak / Simpan PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
