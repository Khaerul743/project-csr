"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  TrendingUp,
  HeartHandshake,
  FileText,
  Users,
  Inbox,
  FileCheck2,
  Activity,
  ArrowRight,
  Plus,
  Eye,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  PieChart as PieChartIcon,
  BarChart2,
  Layers,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyNavMenu } from "../../Sidebar";
import {
  CompanyProfile,
  OpportunityItem,
  PartnerItem,
  CompanyProposalItem,
  CompanyCollaborationItem,
  CompanyProgramItem,
} from "../types";
import {
  FOCUS_AREA_CONFIG,
  STATUS_CONFIG,
  formatRupiah,
  formatDate,
} from "../helpers";
import { parseBeneficiariesCount } from "../../analytics/helpers";

interface ExecutiveOverviewViewProps {
  company: CompanyProfile | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  opportunities: OpportunityItem[];
  partners: PartnerItem[];
  proposals: CompanyProposalItem[];
  collaborations: CompanyCollaborationItem[];
  programs: CompanyProgramItem[];
  metrics: {
    totalOpps: number;
    activeOpps: number;
    totalBudget: number;
    membersCount: number;
    pendingInvitesCount: number;
    submittedProposalsCount: number;
    underReviewProposalsCount: number;
    acceptedProposalsCount: number;
    totalProposalBudget: number;
    negotiatingCollabsCount: number;
    agreedCollabsCount: number;
    totalAgreedBudget: number;
    totalProgramsCount: number;
    inProgressProgramsCount: number;
    completedProgramsCount: number;
    totalProgramBudget: number;
    totalSpentBudget: number;
    budgetAbsorptionRate: number;
  };
  onNavigateMenu: (menu: CompanyNavMenu) => void;
  onOpenCreateOpportunity: () => void;
  onSelectOpportunityDetail: (opp: OpportunityItem) => void;
}

const FOCUS_COLORS: Record<string, string> = {
  LINGKUNGAN: "#10B981",
  PENDIDIKAN: "#3B82F6",
  KESEHATAN: "#EC4899",
  PEMBERDAYAAN_EKONOMI: "#F59E0B",
  INFRASTRUKTUR_SOSIAL: "#8B5CF6",
  TANGGAP_BENCANA: "#EF4444",
  LAINNYA: "#64748B",
};

export function ExecutiveOverviewView({
  company,
  user,
  opportunities,
  partners,
  proposals,
  collaborations,
  programs,
  metrics,
  onNavigateMenu,
  onOpenCreateOpportunity,
  onSelectOpportunityDetail,
}: ExecutiveOverviewViewProps) {
  const [activeChartTab, setActiveChartTab] = useState<"focus" | "pipeline">("focus");

  // Format compact Rupiah for charts & KPI cards (e.g. Rp 1,2 M, Rp 450 Jt)
  const formatCompact = (val: number) => {
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(1)} Miliar`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(0)} Juta`;
    }
    return formatRupiah(val);
  };

  // BI Data: Focus Area Budget Distribution
  const focusDistribution = useMemo(() => {
    const oppList = Array.isArray(opportunities) ? opportunities : [];
    const groupMap: Record<string, { count: number; totalBudget: number }> = {};

    oppList.forEach((opp) => {
      const area = opp?.focusArea || "LAINNYA";
      const budget = opp?.estimatedBudget ? parseFloat(opp.estimatedBudget) : 0;
      if (!groupMap[area]) {
        groupMap[area] = { count: 0, totalBudget: 0 };
      }
      groupMap[area].count += 1;
      groupMap[area].totalBudget += isNaN(budget) ? 0 : budget;
    });

    const totalOverall = Object.values(groupMap).reduce((acc, curr) => acc + curr.totalBudget, 0);

    return Object.entries(groupMap).map(([area, data]) => {
      const cfg = FOCUS_AREA_CONFIG[area as keyof typeof FOCUS_AREA_CONFIG] || {
        label: area,
        variant: "slate",
      };
      const percentage = totalOverall > 0 ? Math.round((data.totalBudget / totalOverall) * 100) : 0;
      return {
        key: area,
        label: cfg.label,
        count: data.count,
        totalBudget: data.totalBudget,
        percentage,
        color: FOCUS_COLORS[area] || "#64748B",
      };
    }).sort((a, b) => b.totalBudget - a.totalBudget);
  }, [opportunities]);

  // BI Data: Pipeline Funnel Conversion
  const pipelineFunnel = useMemo(() => {
    const totalOpps = opportunities.length;
    const totalProps = proposals.length;
    const agreedMoU = collaborations.filter((c) => c.status === "AGREED").length;
    const runningProg = programs.filter((p) => p.status === "IN_PROGRESS" || p.status === "COMPLETED").length;

    return [
      {
        stage: "Peluang Dibuka",
        count: totalOpps,
        subtext: "Inisiatif CSR publik",
        color: "bg-[#059669]",
        textColor: "text-[#059669]",
        budget: metrics.totalBudget,
        percent: 100,
      },
      {
        stage: "Proposal Masuk",
        count: totalProps,
        subtext: "Diajukan mitra pelaksana",
        color: "bg-[#059669]",
        textColor: "text-[#059669]",
        budget: metrics.totalProposalBudget,
        percent: totalOpps > 0 ? Math.min(100, Math.round((totalProps / totalOpps) * 100)) : 0,
      },
      {
        stage: "MoU Disepakati",
        count: agreedMoU,
        subtext: "Kontrak resmi legalitas",
        color: "bg-[#f6ac2f]",
        textColor: "text-[#f6ac2f]",
        budget: metrics.totalAgreedBudget,
        percent: totalProps > 0 ? Math.min(100, Math.round((agreedMoU / totalProps) * 100)) : 0,
      },
      {
        stage: "Eksekusi Program",
        count: runningProg,
        subtext: "Realisasi lapangan",
        color: "bg-[#f6ac2f]",
        textColor: "text-[#f6ac2f]",
        budget: metrics.totalProgramBudget,
        percent: agreedMoU > 0 ? Math.min(100, Math.round((runningProg / agreedMoU) * 100)) : 0,
      },
    ];
  }, [opportunities, proposals, collaborations, programs, metrics]);

  // SVG Donut Path Calculator
  const svgDonutSlices = useMemo(() => {
    let cumulativeAngle = 0;
    const total = focusDistribution.reduce((sum, item) => sum + item.totalBudget, 0);

    if (total === 0) {
      return [{
        key: "empty",
        color: "#E2E8F0",
        path: "M 50 10 A 40 40 0 1 1 49.99 10",
      }];
    }

    return focusDistribution.map((item) => {
      const fraction = item.totalBudget / total;
      const angle = fraction * 360;

      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        key: item.key,
        color: item.color,
        path: pathData,
        percentage: item.percentage,
        label: item.label,
      };
    });
  }, [focusDistribution]);

  // Menghitung total penerima manfaat dampak sosial (jiwa)
  const totalBeneficiaries = useMemo(() => {
    let total = 0;
    const progList = Array.isArray(programs) ? programs : [];
    if (progList.length > 0) {
      progList.forEach((prog) => {
        const actual = parseBeneficiariesCount(prog.actualBeneficiaries);
        const target = parseBeneficiariesCount(prog.targetBeneficiaries);
        total += actual > 0 ? actual : target;
      });
    }
    // Jika belum ada program terealisasi, hitung dari target kolaborasi yang disepakati atau proposal diterima
    if (total === 0) {
      const collabList = Array.isArray(collaborations) ? collaborations : [];
      collabList.forEach((c) => {
        total += parseBeneficiariesCount(c.targetBeneficiaries);
      });
    }
    if (total === 0) {
      const propList = Array.isArray(proposals) ? proposals : [];
      propList.forEach((prop) => {
        total += parseBeneficiariesCount(prop.targetBeneficiaries);
      });
    }
    return total;
  }, [programs, collaborations, proposals]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Executive Overview Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#181343]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ringkasan Manajemen &amp; Inisiatif CSR
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Hub
            </span>
          </div>
          <p className="text-xs text-[#787680] leading-relaxed">
            {company?.name ? `${company.name} • ` : ""}Pantau alokasi dana CSR, evaluasi daya serap program, dan koordinasikan mitra pelaksana strategis.
          </p>
        </div>

        {/* Action Button: Inisiasi Peluang Baru */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <Button
            variant="accent"
            size="md"
            onClick={onOpenCreateOpportunity}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-600/25 px-5 py-2.5 cursor-pointer active:scale-95 transition-all focus:ring-2 focus:ring-emerald-500/30"
          >
            Inisiasi Peluang Baru
          </Button>
        </div>
      </div>

      {/* 2. Top Executive BI KPI Cards (4 Metric Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Komitmen Alokasi Anggaran */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Total Komitmen Anggaran
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#181343] tracking-tight">
              {formatCompact(metrics.totalBudget)}
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {metrics.activeOpps} Peluang Terbuka
            </span>
            <span className="font-semibold text-[#181343]">{metrics.totalOpps} Total Inisiatif</span>
          </div>
        </div>

        {/* KPI 2: Realisasi Serapan Lapangan */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Realisasi Serapan Dana
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#181343] tracking-tight">
              {formatCompact(metrics.totalSpentBudget)}
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#787680]">Efektivitas Serapan</span>
              <span className="font-bold text-emerald-600">{metrics.budgetAbsorptionRate}%</span>
            </div>
            <div className="w-full bg-[#EEEEF0] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics.budgetAbsorptionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Mitra Pelaksana Terkurasi */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Mitra Pelaksana Terkurasi
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#181343] tracking-tight">
              {partners.length}
              <span className="text-xs font-normal text-[#787680] ml-1.5">Organisasi</span>
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 flex items-center justify-between text-xs">
            <span className="text-[#787680]">MoU Berjalan</span>
            <span className="font-semibold text-[#181343]">{metrics.agreedCollabsCount} Kemitraan</span>
          </div>
        </div>

        {/* KPI 4: Total Penerima Manfaat Dampak Sosial */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Total Penerima Manfaat
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#181343] tracking-tight">
              {totalBeneficiaries.toLocaleString("id-ID")}
              <span className="text-xs font-normal text-[#787680] ml-1.5">Jiwa</span>
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 flex items-center justify-between text-xs">
            <span className="text-[#787680]">Dampak Lapangan</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {programs.length > 0 ? `${programs.length} Program Aktif` : "Komunitas Sasaran"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Actionable Executive Resolution Center (Unified Alert Bar, Non-redundant) */}
      {(metrics.submittedProposalsCount > 0 || metrics.negotiatingCollabsCount > 0) && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-white to-white border border-emerald-200/80 border-l-4 border-l-emerald-500 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#181343]">
                  Item Memerlukan Keputusan Manajemen
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                  Perlu Tindakan
                </span>
              </div>
              <p className="text-xs text-[#47464F] leading-relaxed">
                {metrics.submittedProposalsCount > 0 && `${metrics.submittedProposalsCount} proposal baru menunggu evaluasi kelayakan. `}
                {metrics.negotiatingCollabsCount > 0 && `${metrics.negotiatingCollabsCount} kontrak MoU menunggu verifikasi kesepakatan.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            {metrics.submittedProposalsCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateMenu("proposals")}
                className="text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
              >
                Evaluasi Proposal ({metrics.submittedProposalsCount})
              </Button>
            )}
            {metrics.negotiatingCollabsCount > 0 && (
              <Button
                variant="accent"
                size="sm"
                onClick={() => onNavigateMenu("collaborations")}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-600/20 cursor-pointer"
              >
                Tinjau Kontrak MoU ({metrics.negotiatingCollabsCount})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 4. Business Intelligence (BI) Analytics Suite for Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Alokasi Bidang Fokus (Donut + Breakdown) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E8EA] shadow-2xs flex flex-col justify-between">
          <div className="space-y-1 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#181343]" />
                <h3 className="text-base font-bold text-[#181343]">
                  Portofolio Alokasi per Bidang Fokus CSR
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#787680]">
                {focusDistribution.length} Bidang Tematik
              </span>
            </div>
            <p className="text-xs text-[#787680]">
              Komposisi pembagian anggaran CSR berdasarkan tema pembangunan berkelanjutan
            </p>
          </div>

          {focusDistribution.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#787680] space-y-2">
              <p>Belum ada data alokasi program untuk divisualisasikan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
              {/* SVG Donut Illustration */}
              <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                <svg viewBox="0 0 100 100" className="w-44 h-44 transform -rotate-90">
                  {svgDonutSlices.map((slice, i) => (
                    <path
                      key={slice.key}
                      d={slice.path}
                      fill={slice.color}
                      className="transition-all duration-300 hover:opacity-85"
                    />
                  ))}
                  {/* Inner cut-out circle */}
                  <circle cx="50" cy="50" r="28" fill="#FFFFFF" />
                </svg>

                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-[#787680] tracking-wider">
                    Total
                  </span>
                  <span className="text-xs font-extrabold text-[#181343] leading-tight">
                    {formatCompact(metrics.totalBudget)}
                  </span>
                </div>
              </div>

              {/* Legend & Breakdown Bars */}
              <div className="md:col-span-7 space-y-3">
                {focusDistribution.slice(0, 5).map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-[#1A1C1D] truncate">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-[#181343]">
                          {formatCompact(item.totalBudget)}
                        </span>
                        <span className="text-[11px] font-bold text-[#787680] w-9 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Distribution Bar */}
                    <div className="w-full bg-[#EEEEF0] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#F4F4F6] mt-5 flex items-center justify-between text-xs text-[#787680]">
            <span>Selaras dengan sasaran ESG &amp; SDGs Nasional</span>
            <button
              type="button"
              onClick={() => onNavigateMenu("analytics")}
              className="font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Laporan ESG Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Pipeline Konversi Program (BI Funnel) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E8EA] shadow-2xs flex flex-col justify-between">
          <div className="space-y-1 mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#181343]" />
              <h3 className="text-base font-bold text-[#181343]">
                Pipeline Konversi Inisiatif
              </h3>
            </div>
            <p className="text-xs text-[#787680]">
              Progres alur kerja dari inisiatif terbuka hingga pelaksanaan
            </p>
          </div>

          {/* Funnel Steps */}
          <div className="space-y-4">
            {pipelineFunnel.map((step, idx) => (
              <div
                key={step.stage}
                className="p-3.5 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-2 hover:bg-[#F4F4F6] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#181343]/10 text-[#181343] font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#181343]">
                      {step.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold ${step.textColor}`}>
                      {step.count}
                    </span>
                    <span className="text-[11px] text-[#787680]">
                      ({formatCompact(step.budget)})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#EEEEF0] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${step.color}`}
                    style={{
                      width: `${step.count > 0 ? Math.max(12, Math.min(100, step.percent)) : 4}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#F4F4F6] mt-5 flex items-center justify-between text-xs text-[#787680]">
            <span>Kelancaran eksekusi kemitraan</span>
            <button
              type="button"
              onClick={() => onNavigateMenu("programs")}
              className="font-semibold text-[#181343] hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Pantau Program Lapangan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Inisiatif Peluang Terkini (Clean, Editorial, Non-redundant) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#181343]">
                Peluang CSR Terkini
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Program Aktif
              </span>
            </div>
            <p className="text-xs text-[#787680] mt-0.5">
              Program inisiatif yang sedang aktif dan siap menerima proposal kemitraan
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMenu("opportunities")}
            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-emerald-600" />}
            className="text-xs font-semibold text-[#181343] hover:text-emerald-700 border-[#C8C5D0] hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"
          >
            Lihat Semua ({opportunities.length})
          </Button>
        </div>

        {opportunities.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-dashed border-[#C8C5D0] text-center space-y-3">
            <p className="text-xs text-[#787680]">
              Belum ada inisiatif opportunity yang dibuat oleh perusahaan Anda.
            </p>
            <Button
              variant="accent"
              size="sm"
              onClick={onOpenCreateOpportunity}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Inisiasi Peluang Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.slice(0, 3).map((opp) => {
              const focus = FOCUS_AREA_CONFIG[opp.focusArea] || {
                label: opp.focusArea,
                variant: "slate" as const,
              };
              const statusCfg = STATUS_CONFIG[opp.status] || {
                label: opp.status,
                variant: "emerald" as const,
              };

              return (
                <div
                  key={opp.id}
                  className="rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {opp.bannerUrl && (
                      <div className="relative h-36 overflow-hidden bg-slate-900">
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

                      <h4 className="text-sm font-bold text-[#181343] group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                        {opp.title}
                      </h4>

                      <div className="pt-2 border-t border-[#F4F4F6] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[#47464F]">
                          <span className="text-[#787680]">Anggaran:</span>
                          <span className="font-extrabold text-emerald-600">
                            {formatRupiah(opp.estimatedBudget)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#47464F]">
                          <span className="text-[#787680]">Lokasi:</span>
                          <span className="font-medium truncate max-w-[160px]">
                            {opp.targetCity || opp.targetProvince || "Nasional"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#47464F]">
                          <span className="text-[#787680]">Batas Proposal:</span>
                          <span className="font-medium">
                            {formatDate(opp.deadline)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Single Clean Action Button */}
                  <div className="p-5 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectOpportunityDetail(opp)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="w-full text-xs font-bold text-[#181343] hover:text-emerald-700 border-[#E8E8EA] hover:border-emerald-400 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                    >
                      Buka Detail Inisiatif
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
