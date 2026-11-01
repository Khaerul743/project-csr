"use client";

import React, { useMemo, useState, useRef } from "react";
import {
  TrendingUp,
  Activity,
  HeartHandshake,
  Users,
  Plus,
  Eye,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  PieChart as PieChartIcon,
  BarChart2,
  Filter,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Layers,
  Building2,
  ExternalLink,
  Target,
  ArrowUpRight,
  FolderOpen,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SoftDataGrid } from "@/components/ui/soft-data-grid";
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
import {
  ALL_17_SDGS,
  getProgramSdgs,
  parseBeneficiariesCount,
} from "../../analytics/helpers";
import { IndonesiaBeneficiaryMap } from "./IndonesiaBeneficiaryMap";

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

const MONTH_NAMES = [
  { num: 1, key: "01", name: "Januari", short: "Jan" },
  { num: 2, key: "02", name: "Februari", short: "Feb" },
  { num: 3, key: "03", name: "Maret", short: "Mar" },
  { num: 4, key: "04", name: "April", short: "Apr" },
  { num: 5, key: "05", name: "Mei", short: "Mei" },
  { num: 6, key: "06", name: "Juni", short: "Jun" },
  { num: 7, key: "07", name: "Juli", short: "Jul" },
  { num: 8, key: "08", name: "Agustus", short: "Agu" },
  { num: 9, key: "09", name: "September", short: "Sep" },
  { num: 10, key: "10", name: "Oktober", short: "Okt" },
  { num: 11, key: "11", name: "November", short: "Nov" },
  { num: 12, key: "12", name: "Desember", short: "Des" },
];

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
  // Drill-down table ref for smooth scrolling
  const drillDownTableRef = useRef<HTMLDivElement>(null);

  // Active Interactive Analytics Filters
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>("ALL");
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedSdgFilter, setSelectedSdgFilter] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Budget Trend View Mode: 'annual' | 'monthly'
  const [budgetTrendMode, setBudgetTrendMode] = useState<"annual" | "monthly">("annual");

  // Chart hover states
  const [hoveredYear, setHoveredYear] = useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Table expanded row state for program detail
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);

  // Compact Rupiah helper (e.g. Rp 1,5 Miliar, Rp 750 Juta)
  const formatCompact = (val: number) => {
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(1)} M`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(0)} Jt`;
    }
    return formatRupiah(val);
  };

  // 1. Available Years Discovery (dynamically derived from data)
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    programs.forEach((p) => {
      const dateStr = p.startDate || p.createdAt;
      if (dateStr) {
        const y = new Date(dateStr).getFullYear();
        if (!isNaN(y)) yearsSet.add(y.toString());
      }
    });
    collaborations.forEach((c) => {
      const dateStr = c.startDate || c.agreedAt || c.createdAt;
      if (dateStr) {
        const y = new Date(dateStr).getFullYear();
        if (!isNaN(y)) yearsSet.add(y.toString());
      }
    });
    opportunities.forEach((o) => {
      if (o.createdAt) {
        const y = new Date(o.createdAt).getFullYear();
        if (!isNaN(y)) yearsSet.add(y.toString());
      }
    });

    // Ensure current year is included
    const currentYear = new Date().getFullYear().toString();
    yearsSet.add(currentYear);

    return Array.from(yearsSet).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  }, [programs, collaborations, opportunities]);

  // Selected Year for Monthly Mode (default to selectedYear if not "ALL", or latest available year)
  const [monthlyYear, setMonthlyYear] = useState<string>(() => {
    return availableYears[0] || new Date().getFullYear().toString();
  });

  // Keep monthlyYear in sync if selectedYear changes to a specific year
  React.useEffect(() => {
    if (selectedYear !== "ALL") {
      setMonthlyYear(selectedYear);
    }
  }, [selectedYear]);

  // 2A. Scope Programs Data (Filtered by global scopes: Year, Month, Focus Area, Province - WITHOUT filtering by selectedStatus)
  const scopePrograms = useMemo(() => {
    return programs.filter((p) => {
      // Filter Tahun
      if (selectedYear !== "ALL") {
        const dateStr = p.startDate || p.createdAt;
        const progYear = dateStr ? new Date(dateStr).getFullYear().toString() : "";
        if (progYear !== selectedYear) return false;
      }
      // Filter Bulan (jika pengguna mengklik batang bulan)
      if (selectedMonth !== null) {
        const dateStr = p.startDate || p.createdAt;
        const progMonth = dateStr ? new Date(dateStr).getMonth() + 1 : null;
        if (progMonth !== selectedMonth) return false;
      }
      // Filter Bidang Fokus
      if (selectedFocusArea !== "ALL" && p.focusArea !== selectedFocusArea) {
        return false;
      }
      // Filter Provinsi (dari peta)
      if (selectedProvince) {
        const prov = p.targetProvince || "";
        if (
          !prov.toLowerCase().includes(selectedProvince.toLowerCase()) &&
          !selectedProvince.toLowerCase().includes(prov.toLowerCase())
        ) {
          return false;
        }
      }
      return true;
    });
  }, [programs, selectedYear, selectedMonth, selectedFocusArea, selectedProvince]);

  // 2B. Filtered Programs Data (scopePrograms filtered by selectedStatus for drill-down table & KPIs)
  const filteredPrograms = useMemo(() => {
    if (selectedStatus === "ALL") return scopePrograms;
    return scopePrograms.filter((p) => p.status === selectedStatus);
  }, [scopePrograms, selectedStatus]);

  // Auto-reset selectedStatus if there are no programs with that status in the current global scope
  React.useEffect(() => {
    if (selectedStatus !== "ALL") {
      const hasMatchingPrograms = scopePrograms.some((p) => p.status === selectedStatus);
      if (!hasMatchingPrograms) {
        setSelectedStatus("ALL");
      }
    }
  }, [scopePrograms, selectedStatus]);

  // 3. Dynamic Executive KPIs (Strict Business Logic & Mathematical Consistency)
  const kpiData = useMemo(() => {
    // Total Allocated Budget from official agreed programs
    const allocated = filteredPrograms.reduce(
      (sum, p) => sum + (parseFloat(p.budget) || 0),
      0
    );

    // Fallback to metrics agreed budget if all programs are 0 but agreed collaborations exist
    const finalAllocated =
      allocated > 0
        ? allocated
        : selectedYear === "ALL" && selectedStatus === "ALL" && selectedFocusArea === "ALL" && !selectedProvince && selectedMonth === null
        ? metrics.totalProgramBudget || metrics.totalAgreedBudget || 0
        : allocated;

    // Total Realized / Spent Budget
    const spent = filteredPrograms.reduce(
      (sum, p) => sum + (parseFloat(p.spentBudget || "0") || 0),
      0
    );
    const finalSpent =
      spent > 0
        ? spent
        : selectedYear === "ALL" && selectedStatus === "ALL" && selectedFocusArea === "ALL" && !selectedProvince && selectedMonth === null
        ? metrics.totalSpentBudget || 0
        : spent;

    // Absorption Rate: Uses exact same denominator with 1 decimal place (e.g. 22.2%)
    const rate =
      finalAllocated > 0
        ? Math.round((finalSpent / finalAllocated) * 1000) / 10
        : 0;

    // Programs breakdown
    const runningCount = filteredPrograms.filter((p) => p.status === "IN_PROGRESS").length;
    const completedCount = filteredPrograms.filter((p) => p.status === "COMPLETED").length;
    const plannedCount = filteredPrograms.filter((p) => p.status === "PLANNED").length;

    // Unique Collaborating Partners (counted uniquely, no duplicates)
    const uniquePartners = new Set<string>();
    filteredPrograms.forEach((p) => {
      const partnerKey = p.partnerId || p.partnerName;
      if (partnerKey) uniquePartners.add(partnerKey);
    });

    // Also include agreed collaborations if no narrow program filter is active
    if (selectedStatus === "ALL" && selectedFocusArea === "ALL" && !selectedProvince && selectedMonth === null) {
      collaborations.forEach((c) => {
        if (c.status === "AGREED") {
          const partnerKey = c.partnerId || c.partnerName;
          if (partnerKey) uniquePartners.add(partnerKey);
        }
      });
    }

    return {
      totalAllocated: finalAllocated,
      totalSpent: finalSpent,
      absorptionRate: rate,
      totalPrograms: filteredPrograms.length,
      runningCount,
      completedCount,
      plannedCount,
      uniquePartnersCount: uniquePartners.size,
    };
  }, [
    filteredPrograms,
    collaborations,
    metrics,
    selectedYear,
    selectedMonth,
    selectedStatus,
    selectedFocusArea,
    selectedProvince,
  ]);

  // 4A. Annual Budget Trend Data (Mode Tahunan)
  const annualTrendData = useMemo(() => {
    const years = [...availableYears].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const data = years.map((yr) => {
      let allocated = 0;
      let spent = 0;
      let count = 0;

      programs.forEach((p) => {
        const dateStr = p.startDate || p.createdAt;
        const progYear = dateStr ? new Date(dateStr).getFullYear().toString() : "";
        if (progYear === yr) {
          allocated += parseFloat(p.budget) || 0;
          spent += parseFloat(p.spentBudget || "0") || 0;
          count += 1;
        }
      });

      // If program data for the year is 0, also check agreed collaborations
      if (allocated === 0) {
        collaborations.forEach((c) => {
          if (c.status === "AGREED") {
            const dateStr = c.startDate || c.agreedAt || c.createdAt;
            const collabYear = dateStr ? new Date(dateStr).getFullYear().toString() : "";
            if (collabYear === yr) {
              allocated += parseFloat(c.finalBudget || c.proposedBudget || "0") || 0;
            }
          }
        });
      }

      const absorption = allocated > 0 ? Math.round((spent / allocated) * 1000) / 10 : 0;

      return {
        year: yr,
        allocated,
        spent,
        count,
        absorption,
        isSelected: selectedYear === yr,
      };
    });

    const maxVal = Math.max(...data.map((d) => Math.max(d.allocated, d.spent)), 1);

    return { data, maxVal };
  }, [availableYears, programs, collaborations, selectedYear]);

  // 4B. Monthly Budget Trend Data (Mode Bulanan)
  const monthlyTrendData = useMemo(() => {
    const months = MONTH_NAMES.map((m) => {
      let allocated = 0;
      let spent = 0;
      let count = 0;
      let hasData = false;

      programs.forEach((p) => {
        // Alokasi tercatat berdasarkan tanggal mulai/pembuatan program pada tahun & bulan ini
        const pStart = p.startDate ? new Date(p.startDate) : p.createdAt ? new Date(p.createdAt) : null;
        if (pStart && pStart.getFullYear().toString() === monthlyYear && pStart.getMonth() + 1 === m.num) {
          allocated += parseFloat(p.budget) || 0;
          count += 1;
          hasData = true;
        }

        // Realisasi dana tercatat berdasarkan tanggal pelaporan/verifikasi atau periode program
        const repDate = p.lastReportDate ? new Date(p.lastReportDate) : p.updatedAt ? new Date(p.updatedAt) : null;
        const spentVal = parseFloat(p.spentBudget || "0") || 0;
        if (spentVal > 0) {
          if (repDate && repDate.getFullYear().toString() === monthlyYear && repDate.getMonth() + 1 === m.num) {
            spent += spentVal;
            hasData = true;
          } else if (!repDate && pStart && pStart.getFullYear().toString() === monthlyYear && pStart.getMonth() + 1 === m.num) {
            spent += spentVal;
            hasData = true;
          }
        }
      });

      const absorption = allocated > 0 ? Math.round((spent / allocated) * 1000) / 10 : 0;

      return {
        ...m,
        allocated,
        spent,
        count,
        absorption,
        hasData,
        isSelected: selectedMonth === m.num,
      };
    });

    const maxVal = Math.max(...months.map((d) => Math.max(d.allocated, d.spent)), 1);
    const totalYearAllocated = months.reduce((acc, curr) => acc + curr.allocated, 0);
    const totalYearSpent = months.reduce((acc, curr) => acc + curr.spent, 0);

    return { months, maxVal, totalYearAllocated, totalYearSpent };
  }, [programs, monthlyYear, selectedMonth]);

  // 5. Program Status Distribution (Modern Donut & Harmonious Legenda - Baseline from scopePrograms!)
  const statusDistribution = useMemo(() => {
    const total = scopePrograms.length;
    const inProgress = scopePrograms.filter((p) => p.status === "IN_PROGRESS").length;
    const planned = scopePrograms.filter((p) => p.status === "PLANNED").length;
    const completed = scopePrograms.filter((p) => p.status === "COMPLETED").length;

    const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    const plannedPct = total > 0 ? Math.round((planned / total) * 100) : 0;
    const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return [
      {
        key: "IN_PROGRESS",
        label: "Sedang Berjalan",
        count: inProgress,
        percentage: inProgressPct,
        color: "#009E75", // Emerald
        dotColor: "bg-[#009E75]",
        lightBg: "bg-emerald-50",
        borderColor: "border-emerald-200",
        textColor: "text-emerald-800",
      },
      {
        key: "PLANNED",
        label: "Persiapan",
        count: planned,
        percentage: plannedPct,
        color: "#3B82F6", // Blue / Soft Indigo
        dotColor: "bg-[#3B82F6]",
        lightBg: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-800",
      },
      {
        key: "COMPLETED",
        label: "Selesai",
        count: completed,
        percentage: completedPct,
        color: "#181343", // Deep Navy
        dotColor: "bg-[#181343]",
        lightBg: "bg-[#181343]/5",
        borderColor: "border-[#181343]/20",
        textColor: "text-[#181343]",
      },
    ];
  }, [scopePrograms]);

  // Operational Follow-Up Priorities (Actual data from Program Monitoring)
  const followUpPriorities = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      description: string;
      count: number;
      badgeLabel: string;
      icon: React.ComponentType<{ className?: string }>;
      onClick: () => void;
    }> = [];
    const now = new Date();

    // 1. Laporan Menunggu Verifikasi
    let pendingReportsTotal = 0;
    programs.forEach((p) => {
      if (typeof p.pendingVerificationCount === "number" && p.pendingVerificationCount > 0) {
        pendingReportsTotal += p.pendingVerificationCount;
      } else if (p.lastReportStatus === "SUBMITTED") {
        pendingReportsTotal += 1;
      }
    });

    if (pendingReportsTotal > 0) {
      items.push({
        id: "pending-verification",
        title: "Laporan Menunggu Verifikasi",
        description: `${pendingReportsTotal} laporan kegiatan mitra perlu peninjauan`,
        count: pendingReportsTotal,
        badgeLabel: `${pendingReportsTotal} Laporan`,
        icon: Clock,
        onClick: () => onNavigateMenu("programs"),
      });
    }

    // 2. Aktivitas Melewati Jadwal
    const overduePrograms = programs.filter((p) => {
      if (p.status !== "IN_PROGRESS" && p.status !== "PLANNED") return false;
      if (!p.nextActivityDate) return false;
      const actDate = new Date(p.nextActivityDate);
      return !isNaN(actDate.getTime()) && actDate.getTime() < now.getTime();
    });

    if (overduePrograms.length > 0) {
      items.push({
        id: "overdue-activities",
        title: "Aktivitas Melewati Jadwal",
        description: `${overduePrograms.length} program melewati target tanggal rencana`,
        count: overduePrograms.length,
        badgeLabel: `${overduePrograms.length} Tertunda`,
        icon: AlertTriangle,
        onClick: () => onNavigateMenu("programs"),
      });
    }

    // 3. Program Mendekati Tenggat Waktu (dalam 30 hari ke depan & belum 100% selesai)
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const nearDeadlinePrograms = programs.filter((p) => {
      if (p.status !== "IN_PROGRESS") return false;
      if (!p.endDate) return false;
      const endDate = new Date(p.endDate);
      if (isNaN(endDate.getTime())) return false;
      const diff = endDate.getTime() - now.getTime();
      const progress = p.activityProgressPercent ?? 0;
      return diff > 0 && diff <= THIRTY_DAYS_MS && progress < 100;
    });

    if (nearDeadlinePrograms.length > 0) {
      items.push({
        id: "near-deadline",
        title: "Program Mendekati Tenggat",
        description: `${nearDeadlinePrograms.length} program mendekati tanggal akhir penyelesaian`,
        count: nearDeadlinePrograms.length,
        badgeLabel: `${nearDeadlinePrograms.length} Program`,
        icon: AlertCircle,
        onClick: () => onNavigateMenu("programs"),
      });
    }

    return items.slice(0, 3);
  }, [programs, onNavigateMenu]);

  // Handler for selecting status (zero-count status cannot be selected)
  const handleSelectStatus = (statusKey: string) => {
    const item = statusDistribution.find((s) => s.key === statusKey);
    if (!item || item.count === 0) return; // Non-clickable if count is 0
    setSelectedStatus((prev) => (prev === statusKey ? "ALL" : statusKey));
  };

  // Donut Chart Slices (Handles single 100% slice, multi-slice, and empty state cleanly)
  const donutConfig = useMemo(() => {
    const total = statusDistribution.reduce((sum, item) => sum + item.count, 0);
    const activeSlices = statusDistribution.filter((s) => s.count > 0);

    if (total === 0) {
      return { type: "empty" as const, total: 0, slices: [] };
    }

    // Single 100% slice condition
    if (activeSlices.length === 1) {
      return {
        type: "single" as const,
        total,
        singleSlice: activeSlices[0],
        slices: [],
      };
    }

    // Multi-slice calculation using SVG Annulus paths
    let cumulativeAngle = 0;
    const rOuter = 42;
    const rInner = 28;

    const slices = activeSlices.map((item) => {
      const fraction = item.count / total;
      const angle = fraction * 360;

      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = 50 + rOuter * Math.cos(startRad);
      const y1 = 50 + rOuter * Math.sin(startRad);
      const x2 = 50 + rOuter * Math.cos(endRad);
      const y2 = 50 + rOuter * Math.sin(endRad);
      const x3 = 50 + rInner * Math.cos(endRad);
      const y3 = 50 + rInner * Math.sin(endRad);
      const x4 = 50 + rInner * Math.cos(startRad);
      const y4 = 50 + rInner * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      return {
        key: item.key,
        color: item.color,
        path: pathData,
        percentage: item.percentage,
        label: item.label,
      };
    });

    return { type: "multi" as const, total, slices };
  }, [statusDistribution]);

  // 6. Komposisi Program CSR (Compact Thematic Category Distribution)
  const categoryDistribution = useMemo(() => {
    const totalProgs = filteredPrograms.length;
    const groupMap: Record<string, { count: number; totalBudget: number }> = {};

    filteredPrograms.forEach((prog) => {
      const area = prog.focusArea || "LAINNYA";
      const budget = parseFloat(prog.budget) || 0;
      if (!groupMap[area]) {
        groupMap[area] = { count: 0, totalBudget: 0 };
      }
      groupMap[area].count += 1;
      groupMap[area].totalBudget += budget;
    });

    const totalOverallBudget = Object.values(groupMap).reduce(
      (acc, curr) => acc + curr.totalBudget,
      0
    );

    return Object.entries(groupMap)
      .map(([area, data]) => {
        const cfg =
          FOCUS_AREA_CONFIG[area as keyof typeof FOCUS_AREA_CONFIG] || {
            label: area,
            variant: "slate",
          };
        const programShare = totalProgs > 0 ? Math.round((data.count / totalProgs) * 100) : 0;
        const budgetShare = totalOverallBudget > 0 ? Math.round((data.totalBudget / totalOverallBudget) * 100) : 0;

        return {
          key: area,
          label: cfg.label,
          count: data.count,
          totalBudget: data.totalBudget,
          programShare,
          budgetShare,
          color: FOCUS_COLORS[area] || "#64748B",
        };
      })
      .sort((a, b) => b.count - a.count || b.totalBudget - a.totalBudget);
  }, [filteredPrograms]);

  // Check if any filter is active
  const hasActiveFilters =
    selectedYear !== "ALL" ||
    selectedMonth !== null ||
    selectedStatus !== "ALL" ||
    selectedFocusArea !== "ALL" ||
    selectedProvince !== null;

  // Reset all filters handler
  const handleResetFilters = () => {
    setSelectedYear("ALL");
    setSelectedMonth(null);
    setSelectedStatus("ALL");
    setSelectedFocusArea("ALL");
    setSelectedProvince(null);
  };

  // Scroll to drill-down table
  const scrollToDrillDown = () => {
    if (drillDownTableRef.current) {
      drillDownTableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* Eksperimen Visual Opsi 3: Soft Data Grid Background & Atmospheric Glow */}
      <SoftDataGrid variant="page" />

      <div className="relative z-10 space-y-8">
        {/* ============================================================ */}
        {/* BAGIAN 1 — HEADER & FILTER ANALISIS                          */}
        {/* ============================================================ */}
      <div className="space-y-5">
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
                Live BI Hub
              </span>
            </div>
            <p className="text-xs text-[#787680] leading-relaxed">
              Pantau kinerja program, tren anggaran, kolaborasi mitra, dan persebaran manfaat CSR dalam satu dashboard.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <Button
              variant="primary"
              size="md"
              onClick={onOpenCreateOpportunity}
              leftIcon={<Plus className="w-4 h-4" />}
              className="px-5 py-2.5 cursor-pointer"
            >
              Buat Peluang CSR
            </Button>
          </div>
        </div>

        {/* Dynamic Analytics Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#181343]">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filter Analisis Portofolio</span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors self-start lg:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filter 1: Tahun Pelaporan */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
                Tahun Pelaporan
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedMonth(null);
                }}
                className="w-full text-xs font-semibold bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-2 text-[#181343] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="ALL">Semua Tahun Pelaporan</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Status Pelaksanaan Program */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
                Status Program
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "ALL") {
                    setSelectedStatus("ALL");
                  } else {
                    const item = statusDistribution.find((s) => s.key === val);
                    if (item && item.count > 0) {
                      setSelectedStatus(val);
                    }
                  }
                }}
                className="w-full text-xs font-semibold bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-2 text-[#181343] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="ALL">Semua Status Pelaksanaan</option>
                {statusDistribution.map((st) => (
                  <option
                    key={st.key}
                    value={st.key}
                    disabled={st.count === 0}
                  >
                    {st.label} ({st.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Bidang Fokus CSR */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
                Bidang Fokus CSR
              </label>
              <select
                value={selectedFocusArea}
                onChange={(e) => setSelectedFocusArea(e.target.value)}
                className="w-full text-xs font-semibold bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-2 text-[#181343] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="ALL">Semua Bidang Fokus</option>
                <option value="LINGKUNGAN">Lingkungan Hidup</option>
                <option value="PENDIDIKAN">Pendidikan</option>
                <option value="KESEHATAN">Kesehatan</option>
                <option value="PEMBERDAYAAN_EKONOMI">Pemberdayaan Ekonomi</option>
                <option value="INFRASTRUKTUR_SOSIAL">Infrastruktur Sosial</option>
                <option value="TANGGAP_BENCANA">Tanggap Bencana</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-[#F4F4F6] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#787680] font-medium">Filter Aktif:</span>
              {selectedYear !== "ALL" && (
                <span className="px-2.5 py-1 rounded-xl bg-[#F0EFF8] text-[#181343] border border-[#CBC8DB] font-semibold text-[11px] inline-flex items-center gap-1">
                  Tahun: {selectedYear}
                </span>
              )}
              {selectedMonth !== null && (
                <span className="px-2.5 py-1 rounded-xl bg-[#F0EFF8] text-[#181343] border border-[#CBC8DB] font-semibold text-[11px] inline-flex items-center gap-1">
                  Bulan: {MONTH_NAMES.find((m) => m.num === selectedMonth)?.name || selectedMonth}
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(null)}
                    className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedStatus !== "ALL" && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px] inline-flex items-center gap-1">
                  Status:{" "}
                  {selectedStatus === "IN_PROGRESS"
                    ? "Sedang Berjalan"
                    : selectedStatus === "PLANNED"
                    ? "Persiapan"
                    : "Selesai"}
                </span>
              )}
              {selectedFocusArea !== "ALL" && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px] inline-flex items-center gap-1">
                  Bidang: {FOCUS_AREA_CONFIG[selectedFocusArea as keyof typeof FOCUS_AREA_CONFIG]?.label || selectedFocusArea}
                </span>
              )}
              {selectedProvince && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px] inline-flex items-center gap-1">
                  Provinsi: {selectedProvince}
                </span>
              )}
              <span className="text-[#787680] text-[11px] ml-auto">
                Menampilkan <b>{filteredPrograms.length}</b> dari {programs.length} total program
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BAGIAN 2 — EXECUTIVE KPI (4 CARDS)                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Anggaran CSR */}
        <div
          onClick={scrollToDrillDown}
          className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Total Anggaran CSR
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#181343] tracking-tight">
              {formatCompact(kpiData.totalAllocated)}
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 flex items-center justify-between text-xs">
            <span className="text-[#787680]">Alokasi Resmi Program</span>
            <span className="font-semibold text-emerald-600 group-hover:underline flex items-center gap-0.5">
              Rincian <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Realisasi Anggaran */}
        <div
          onClick={scrollToDrillDown}
          className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Realisasi Anggaran
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#181343] tracking-tight">
              {formatCompact(kpiData.totalSpent)}
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#787680]">Efektivitas Serapan</span>
              <span className="font-bold text-emerald-600">
                {kpiData.absorptionRate}%
              </span>
            </div>
            <div className="w-full bg-[#EEEEF0] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(kpiData.absorptionRate, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Program CSR */}
        <div
          onClick={scrollToDrillDown}
          className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Program CSR
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#181343] tracking-tight">
              {kpiData.totalPrograms}
              <span className="text-xs font-normal text-[#787680] ml-1.5">Program</span>
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 flex items-center justify-between text-xs">
            <span className="text-[#787680]">
              {kpiData.runningCount} Berjalan • {kpiData.completedCount} Selesai
            </span>
            <span className="font-semibold text-blue-600 group-hover:underline flex items-center gap-0.5">
              Lihat <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Mitra Berkolaborasi */}
        <div
          onClick={scrollToDrillDown}
          className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-purple-400/60 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Mitra Berkolaborasi
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#181343] tracking-tight">
              {kpiData.uniquePartnersCount}
              <span className="text-xs font-normal text-[#787680] ml-1.5">Organisasi</span>
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 flex items-center justify-between text-xs">
            <span className="text-[#787680]">Mitra Resmi Berkontrak</span>
            <span className="font-semibold text-purple-600 group-hover:underline flex items-center gap-0.5">
              Daftar <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BAGIAN 3 — ANALISIS KINERJA                                   */}
      {/* Tren Anggaran CSR (Tahunan | Bulanan) & Distribusi Status     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Tren Anggaran CSR (Grouped Bar Chart with Tahunan/Bulanan) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E8EA] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#181343]" />
                  <h3 className="text-base font-bold text-[#181343]">
                    Tren Anggaran CSR
                  </h3>
                </div>
                <p className="text-xs text-[#787680]">
                  {budgetTrendMode === "annual"
                    ? "Perbandingan alokasi komitmen vs realisasi dana per tahun"
                    : `Realisasi dan alokasi anggaran bulanan periode ${monthlyYear}`}
                </p>
              </div>

              {/* Controls: Segmented Control (Tahunan | Bulanan) & Year Picker */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {/* Year Selector for Monthly Mode */}
                {budgetTrendMode === "monthly" && (
                  <select
                    value={monthlyYear}
                    onChange={(e) => {
                      setMonthlyYear(e.target.value);
                      setSelectedMonth(null);
                    }}
                    className="text-xs font-bold bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-2.5 py-1.5 text-[#181343] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Tahun {yr}
                      </option>
                    ))}
                  </select>
                )}

                {/* Segmented Control */}
                <div className="inline-flex items-center bg-[#F4F4F6] p-1 rounded-xl border border-[#E8E8EA]">
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetTrendMode("annual");
                      setSelectedMonth(null);
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      budgetTrendMode === "annual"
                        ? "bg-white text-[#181343] shadow-xs"
                        : "text-[#787680] hover:text-[#181343]"
                    }`}
                  >
                    Tahunan
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetTrendMode("monthly")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      budgetTrendMode === "monthly"
                        ? "bg-white text-[#181343] shadow-xs"
                        : "text-[#787680] hover:text-[#181343]"
                    }`}
                  >
                    Bulanan
                  </button>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between pb-3 text-xs border-b border-[#F4F4F6]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#181343]" />
                  <span className="text-[#47464F] font-semibold">Alokasi Anggaran</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#009E75]" />
                  <span className="text-[#47464F] font-semibold">Realisasi Dana</span>
                </div>
              </div>

              {budgetTrendMode === "monthly" && selectedMonth !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedMonth(null)}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Tampilkan Semua Bulan
                </button>
              )}
            </div>

            {/* VISUALISASI MODE TAHUNAN */}
            {budgetTrendMode === "annual" && (
              <div className="pt-4 pb-2">
                {annualTrendData.data.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[#787680]">
                    Belum ada data anggaran tahunan untuk ditampilkan.
                  </div>
                ) : (
                  <div>
                    <div className="h-56 flex items-end justify-around gap-6 sm:gap-10 px-4 border-b border-[#E8E8EA]">
                      {annualTrendData.data.map((item) => {
                        const allocatedHeight =
                          annualTrendData.maxVal > 0
                            ? Math.max(12, Math.round((item.allocated / annualTrendData.maxVal) * 100))
                            : 8;
                        const spentHeight =
                          annualTrendData.maxVal > 0
                            ? Math.max(12, Math.round((item.spent / annualTrendData.maxVal) * 100))
                            : 8;

                        const isHovered = hoveredYear === item.year;
                        const isSelected = selectedYear === item.year;

                        return (
                          <div
                            key={item.year}
                            className={`flex flex-col items-center flex-1 max-w-[140px] group cursor-pointer transition-all ${
                              selectedYear !== "ALL" && !isSelected ? "opacity-40" : "opacity-100"
                            }`}
                            onMouseEnter={() => setHoveredYear(item.year)}
                            onMouseLeave={() => setHoveredYear(null)}
                            onClick={() => {
                              setSelectedYear(selectedYear === item.year ? "ALL" : item.year);
                            }}
                          >
                            {/* Hover Tooltip */}
                            <div
                              className={`mb-2 px-2.5 py-1.5 rounded-xl bg-[#181343] text-white text-[11px] shadow-lg transition-all duration-200 pointer-events-none text-center ${
                                isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 hidden sm:block"
                              }`}
                            >
                              <div className="font-bold">Tahun {item.year}</div>
                              <div className="text-slate-300">
                                Alokasi: {formatRupiah(item.allocated)}
                              </div>
                              <div className="text-emerald-400">
                                Realisasi: {formatRupiah(item.spent)} ({item.absorption}%)
                              </div>
                              <div className="text-slate-400 text-[10px]">
                                {item.count} Program Tercatat
                              </div>
                            </div>

                            {/* Bars Container */}
                            <div className="w-full flex items-end justify-center gap-2 h-44">
                              {/* Alokasi Bar (Deep Navy) */}
                              <div
                                className="w-1/2 max-w-[32px] bg-[#181343] rounded-t-lg transition-all duration-500 group-hover:brightness-125 relative flex items-center justify-center shadow-xs"
                                style={{ height: `${allocatedHeight}%` }}
                                title={`Alokasi ${item.year}: ${formatRupiah(item.allocated)}`}
                              />

                              {/* Realisasi Bar (Emerald) */}
                              <div
                                className="w-1/2 max-w-[32px] bg-[#009E75] rounded-t-lg transition-all duration-500 group-hover:brightness-110 relative flex items-center justify-center shadow-xs"
                                style={{ height: `${spentHeight}%` }}
                                title={`Realisasi ${item.year}: ${formatRupiah(item.spent)}`}
                              />
                            </div>

                            {/* Year Label */}
                            <div className="pt-2 text-center">
                              <span
                                className={`text-xs font-bold transition-colors ${
                                  isSelected
                                    ? "text-emerald-600 underline"
                                    : "text-[#181343] group-hover:text-emerald-600"
                                }`}
                              >
                                {item.year}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3 flex items-center justify-between text-xs text-[#787680]">
                      <span>Klik batang tahun untuk memfilter seluruh dashboard</span>
                      {selectedYear !== "ALL" && (
                        <span className="font-semibold text-emerald-600">
                          Tahun {selectedYear} aktif
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VISUALISASI MODE BULANAN */}
            {budgetTrendMode === "monthly" && (
              <div className="pt-4 pb-2">
                <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 px-1 border-b border-[#E8E8EA] overflow-x-auto">
                  {monthlyTrendData.months.map((m) => {
                    const allocatedHeight =
                      monthlyTrendData.maxVal > 0 && m.allocated > 0
                        ? Math.max(12, Math.round((m.allocated / monthlyTrendData.maxVal) * 100))
                        : 0;
                    const spentHeight =
                      monthlyTrendData.maxVal > 0 && m.spent > 0
                        ? Math.max(12, Math.round((m.spent / monthlyTrendData.maxVal) * 100))
                        : 0;

                    const isHovered = hoveredMonth === m.num;
                    const isSelected = selectedMonth === m.num;

                    return (
                      <div
                        key={m.num}
                        className={`flex flex-col items-center flex-1 min-w-[28px] max-w-[50px] group cursor-pointer transition-all ${
                          selectedMonth !== null && !isSelected ? "opacity-35" : "opacity-100"
                        }`}
                        onMouseEnter={() => setHoveredMonth(m.num)}
                        onMouseLeave={() => setHoveredMonth(null)}
                        onClick={() => {
                          setSelectedMonth(selectedMonth === m.num ? null : m.num);
                        }}
                      >
                        {/* Hover Tooltip Popup */}
                        <div
                          className={`mb-2 px-2.5 py-1.5 rounded-xl bg-[#181343] text-white text-[11px] shadow-lg transition-all duration-200 pointer-events-none text-center whitespace-nowrap z-20 ${
                            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 hidden sm:block"
                          }`}
                        >
                          <div className="font-bold">{m.name} {monthlyYear}</div>
                          {m.hasData ? (
                            <>
                              <div className="text-slate-300">
                                Alokasi: {formatRupiah(m.allocated)}
                              </div>
                              <div className="text-emerald-400">
                                Realisasi: {formatRupiah(m.spent)} ({m.absorption}%)
                              </div>
                              <div className="text-slate-400 text-[10px]">
                                {m.count} Program Periode Ini
                              </div>
                            </>
                          ) : (
                            <div className="text-slate-400 text-[10px] italic">
                              Tidak ada alokasi/transaksi tercatat
                            </div>
                          )}
                        </div>

                        {/* Bars Container */}
                        <div className="w-full flex items-end justify-center gap-1 h-44">
                          {m.hasData ? (
                            <>
                              {/* Alokasi Bar */}
                              <div
                                className="w-1/2 max-w-[14px] bg-[#181343] rounded-t-md transition-all duration-500 group-hover:brightness-125"
                                style={{ height: `${allocatedHeight}%` }}
                                title={`${m.name}: Alokasi ${formatRupiah(m.allocated)}`}
                              />
                              {/* Realisasi Bar */}
                              <div
                                className="w-1/2 max-w-[14px] bg-[#009E75] rounded-t-md transition-all duration-500 group-hover:brightness-110"
                                style={{ height: `${spentHeight}%` }}
                                title={`${m.name}: Realisasi ${formatRupiah(m.spent)}`}
                              />
                            </>
                          ) : (
                            /* Baseline subtle indicator for month without recorded transaction */
                            <div className="w-full h-1.5 bg-[#E8E8EA] rounded-full group-hover:bg-slate-300 transition-colors" />
                          )}
                        </div>

                        {/* Month Label */}
                        <div className="pt-2 text-center">
                          <span
                            className={`text-[11px] font-bold transition-colors ${
                              isSelected
                                ? "text-emerald-600 underline font-extrabold"
                                : "text-[#787680] group-hover:text-[#181343]"
                            }`}
                          >
                            {m.short}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 flex items-center justify-between text-xs text-[#787680]">
                  <span>Klik batang bulan untuk melihat rincian program terkait</span>
                  <span className="font-medium text-[#181343]">
                    Total Realisasi {monthlyYear}: <b className="text-emerald-600">{formatCompact(monthlyTrendData.totalYearSpent)}</b>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#F4F4F6] mt-5 flex items-center justify-between text-xs text-[#787680]">
            <span>Realisasi bulanan dihitung berdasarkan tanggal laporan capaian dan alokasi resmi program</span>
            <button
              type="button"
              onClick={scrollToDrillDown}
              className="font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Detail Program Terkait</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Distribusi Status Program CSR (Donut Modern & Prioritas Tindak Lanjut) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E8EA] shadow-2xs space-y-5">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#181343]" />
              <h3 className="text-base font-bold text-[#181343]">
                Distribusi Status Program CSR
              </h3>
            </div>
            <p className="text-xs text-[#787680]">
              Progres pelaksanaan program dalam portofolio aktif
            </p>
          </div>

          {/* Donut & Legenda Layout: Donut di Kiri, Legenda di Kanan */}
          <div className="flex flex-col sm:flex-row items-center gap-6 py-1">
            {/* SVG Donut Chart Modern */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-36 h-36 transform -rotate-90">
                {donutConfig.type === "empty" && (
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke="#E8E8EA"
                    strokeWidth="14"
                  />
                )}

                {donutConfig.type === "single" && donutConfig.singleSlice && (
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={donutConfig.singleSlice.color}
                    strokeWidth="14"
                    className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                    onClick={() => {
                      handleSelectStatus(donutConfig.singleSlice!.key);
                    }}
                  />
                )}

                {donutConfig.type === "multi" &&
                  donutConfig.slices.map((slice) => (
                    <path
                      key={slice.key}
                      d={slice.path}
                      fill={slice.color}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                      onClick={() => {
                        handleSelectStatus(slice.key);
                      }}
                    />
                  ))}
              </svg>

              {/* Angka Total Program di Tengah Donut (Selalu menampilkan total baseline) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-[#787680] tracking-wider">
                  Total
                </span>
                <span className="text-xl font-extrabold text-[#181343] leading-none my-0.5">
                  {donutConfig.total}
                </span>
                <span className="text-[10px] text-[#787680] font-medium">Program</span>
              </div>
            </div>

            {/* Legenda Status di Sebelah Kanan */}
            <div className="flex-1 w-full space-y-2">
              {statusDistribution.map((st) => {
                const isSelected = selectedStatus === st.key;
                const isZero = st.count === 0;

                return (
                  <div
                    key={st.key}
                    onClick={() => {
                      if (!isZero) {
                        handleSelectStatus(st.key);
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isZero
                        ? "bg-[#F9F9FB]/60 border-[#E8E8EA] opacity-50 cursor-default select-none"
                        : isSelected
                        ? `${st.lightBg} ${st.borderColor} ring-2 ring-emerald-500/40 shadow-xs cursor-pointer`
                        : "bg-[#F9F9FB] border-[#E8E8EA] hover:bg-white hover:border-slate-300 cursor-pointer"
                    }`}
                    title={
                      isZero
                        ? `Tidak ada program dengan status ${st.label}`
                        : isSelected
                        ? `Klik untuk menghapus filter ${st.label}`
                        : `Klik untuk melihat ${st.count} program ${st.label}`
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.dotColor} ${
                          isZero ? "opacity-40" : ""
                        }`}
                      />
                      <span
                        className={`text-xs font-bold ${
                          isZero ? "text-[#787680]" : "text-[#181343]"
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold ${
                          isZero ? "text-[#787680]" : "text-[#181343]"
                        }`}
                      >
                        {st.count}
                      </span>
                      <span className="text-[11px] font-bold text-[#787680] w-9 text-right">
                        {st.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prioritas Tindak Lanjut (Ditampilkan HANYA jika ada item tindak lanjut) */}
          {followUpPriorities.length > 0 && (
            <div className="pt-4 border-t border-[#F4F4F6] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                  Prioritas Tindak Lanjut
                </span>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                  Perlu Perhatian
                </span>
              </div>

              <div className="space-y-1.5">
                {followUpPriorities.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={item.onClick}
                      className="p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] hover:bg-amber-50/50 hover:border-amber-300 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                          <IconComponent className="w-3.5 h-3.5 text-amber-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#181343] group-hover:text-amber-800 transition-colors truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#787680] truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md">
                          {item.badgeLabel}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer: Filter Active Indicator */}
          {selectedStatus !== "ALL" && (
            <div className="pt-3 border-t border-[#F4F4F6] flex items-center justify-between text-xs text-[#787680]">
              <span className="font-semibold text-emerald-700">
                Filter aktif: {statusDistribution.find((s) => s.key === selectedStatus)?.label}
              </span>
              <button
                type="button"
                onClick={() => setSelectedStatus("ALL")}
                className="text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Hapus filter status
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BAGIAN 4 — KOMPOSISI PROGRAM CSR                              */}
      {/* Sebaran Tematik Pendukung Tanpa Duplikasi SDGs/ESG           */}
      {/* ============================================================ */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E8EA] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#181343]" />
              <h3 className="text-base font-bold text-[#181343]">
                Komposisi Program CSR
              </h3>
            </div>
            <p className="text-xs text-[#787680]">
              Sebaran program dan ringkasan anggaran berdasarkan kategori tematik pelaksanaan
            </p>
          </div>
          <span className="text-xs font-semibold text-[#787680] self-start sm:self-auto">
            {categoryDistribution.length} Kategori Tematik Tercatat
          </span>
        </div>

        {categoryDistribution.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#787680]">
            Belum ada data program pada kategori tematik untuk filter yang dipilih.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryDistribution.map((item) => {
              const isSelected = selectedFocusArea === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => {
                    setSelectedFocusArea(selectedFocusArea === item.key ? "ALL" : item.key);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-500/30 shadow-xs"
                      : "bg-[#F9F9FB] border-[#E8E8EA] hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-bold text-[#181343] truncate">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-[#181343]">
                        {item.count} Program
                      </span>
                      <span className="text-[11px] font-bold text-[#787680]">
                        ({item.programShare}%)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Compact Bar */}
                  <div className="w-full bg-[#EEEEF0] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.programShare}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#787680]">
                    <span>Alokasi: <b className="text-[#181343]">{formatCompact(item.totalBudget)}</b></span>
                    <span className="font-semibold text-emerald-600">
                      {isSelected ? "Filter Aktif" : "Klik untuk rincian"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* BAGIAN 5 — ANALISIS GEOGRAFIS (PETA PERSEBARAN & SDGS)       */}
      {/* ============================================================ */}
      <IndonesiaBeneficiaryMap
        programs={filteredPrograms}
        selectedSdgFilter={selectedSdgFilter}
        onSelectSdgFilter={(sdgId) => setSelectedSdgFilter(sdgId)}
        selectedProvince={selectedProvince}
        onSelectProvince={(prov) => setSelectedProvince(prov)}
        onNavigateToProgramDetail={() => onNavigateMenu("programs")}
      />

      {/* ============================================================ */}
      {/* BAGIAN 6 — PENELUSURAN DATA: RINCIAN PROGRAM & MITRA TERKAIT */}
      {/* Tabel Luas, Lega, Bebas Terpotong, dengan Expandable Detail   */}
      {/* ============================================================ */}
      <div
        ref={drillDownTableRef}
        className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E8EA] shadow-2xs space-y-5 w-full"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#181343]" />
              <h3 className="text-base sm:text-lg font-bold text-[#181343]">
                Rincian Program &amp; Mitra Terkait
              </h3>
            </div>
            <p className="text-xs text-[#787680]">
              Daftar operasional pelaksanaan program CSR, mitra pelaksana, lokasi, alokasi anggaran, dan realisasi dana.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
              >
                Reset Filter
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateMenu("programs")}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 text-emerald-600" />}
              className="text-xs font-bold text-[#181343] border-[#E8E8EA] hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"
            >
              Lihat di Pelaksanaan Program
            </Button>
          </div>
        </div>

        {/* Drill-down Program Table (Spacious, Legible, Full Width) */}
        {filteredPrograms.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#F9F9FB] border border-dashed border-[#C8C5D0] text-center space-y-3">
            <Info className="w-8 h-8 text-[#787680] mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#181343]">
                Tidak ada program yang memenuhi kriteria filter saat ini.
              </p>
              <p className="text-xs text-[#787680]">
                Coba ubah pilihan tahun, status, bidang tematik, atau klik tombol di bawah untuk menampilkan semua program.
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs"
              >
                Reset Semua Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl border border-[#E8E8EA]">
            <table className="w-full text-left text-sm border-collapse min-w-[850px]">
              <thead className="bg-[#F9F9FB] border-b border-[#E8E8EA] text-[#787680] font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5 w-[30%]">Program CSR &amp; Bidang</th>
                  <th className="py-3.5 px-5 w-[20%]">Mitra Pelaksana</th>
                  <th className="py-3.5 px-5 w-[15%]">Lokasi</th>
                  <th className="py-3.5 px-5 w-[12%]">Status Program</th>
                  <th className="py-3.5 px-5 w-[11%] text-right">Alokasi Anggaran</th>
                  <th className="py-3.5 px-5 w-[12%] text-right">Realisasi Dana</th>
                  <th className="py-3.5 px-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F6]">
                {filteredPrograms.map((prog) => {
                  const focus =
                    FOCUS_AREA_CONFIG[prog.focusArea as keyof typeof FOCUS_AREA_CONFIG] || {
                      label: prog.focusArea,
                      variant: "slate" as const,
                    };

                  // Status Bahasa Indonesia yang rapi
                  const statusDisplay =
                    prog.status === "IN_PROGRESS"
                      ? { label: "Sedang Berjalan", variant: "emerald" as const }
                      : prog.status === "PLANNED"
                      ? { label: "Persiapan", variant: "blue" as const }
                      : prog.status === "COMPLETED"
                      ? { label: "Selesai", variant: "slate" as const }
                      : STATUS_CONFIG[prog.status as keyof typeof STATUS_CONFIG] || {
                          label: prog.status,
                          variant: "emerald" as const,
                        };

                  const alloc = parseFloat(prog.budget) || 0;
                  const spent = parseFloat(prog.spentBudget || "0") || 0;
                  const progAbsorption =
                    alloc > 0 ? Math.round((spent / alloc) * 1000) / 10 : 0;

                  const progSdgs = getProgramSdgs({
                    id: prog.id,
                    title: prog.title,
                    description: prog.description || prog.opportunityDescription || "",
                    focusArea: prog.focusArea,
                    status: prog.status,
                    budget: prog.budget,
                  });

                  const isExpanded = expandedProgramId === prog.id;

                  const targetBen = parseBeneficiariesCount(prog.targetBeneficiaries);
                  const actualBen = parseBeneficiariesCount(prog.actualBeneficiaries);

                  return (
                    <React.Fragment key={prog.id}>
                      <tr
                        className={`hover:bg-emerald-50/30 transition-colors cursor-pointer ${
                          isExpanded ? "bg-emerald-50/40" : ""
                        }`}
                        onClick={() =>
                          setExpandedProgramId(isExpanded ? null : prog.id)
                        }
                      >
                        {/* Kolom 1: Program & Bidang */}
                        <td className="py-4 px-5">
                          <div className="space-y-1.5">
                            <p className="font-bold text-[#181343] line-clamp-2 leading-snug">
                              {prog.title}
                            </p>
                            <Badge variant={focus.variant} size="sm">
                              {focus.label}
                            </Badge>
                          </div>
                        </td>

                        {/* Kolom 2: Mitra Pelaksana (Nama tidak terpotong) */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#181343]/10 text-[#181343] font-bold text-xs flex items-center justify-center shrink-0">
                              {prog.partnerName ? prog.partnerName.charAt(0) : "M"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#181343] leading-snug">
                                {prog.partnerName || "Mitra Pelaksana"}
                              </p>
                              <p className="text-xs text-[#787680]">
                                {prog.partnerCity || "Kota Mitra"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Kolom 3: Lokasi */}
                        <td className="py-4 px-5 text-[#47464F]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-semibold leading-snug">
                              {prog.targetCity
                                ? `${prog.targetCity}, ${prog.targetProvince || ""}`
                                : prog.targetProvince || "Nasional"}
                            </span>
                          </div>
                        </td>

                        {/* Kolom 4: Status Program */}
                        <td className="py-4 px-5">
                          <Badge variant={statusDisplay.variant} size="sm" hasDot>
                            {statusDisplay.label}
                          </Badge>
                        </td>

                        {/* Kolom 5: Alokasi Anggaran */}
                        <td className="py-4 px-5 text-right font-bold text-[#181343]">
                          {formatRupiah(alloc)}
                        </td>

                        {/* Kolom 6: Realisasi Anggaran */}
                        <td className="py-4 px-5 text-right">
                          <div className="space-y-0.5">
                            <p className="font-bold text-emerald-600">
                              {formatRupiah(spent)}
                            </p>
                            <p className="text-[11px] text-[#787680]">
                              {progAbsorption}% serapan
                            </p>
                          </div>
                        </td>

                        {/* Kolom 7: Aksi */}
                        <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedProgramId(isExpanded ? null : prog.id)}
                              className="text-xs font-semibold text-[#181343] hover:text-emerald-700 border-[#E8E8EA] hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer px-2.5 py-1"
                            >
                              <span>{isExpanded ? "Tutup" : "Detail"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 ml-1" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 ml-1" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Detail Panel Row (SDGs, Penerima Manfaat, Periode, Action) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-[#E8E8EA]">
                          <td colSpan={7} className="p-5 sm:p-6">
                            <div className="bg-white rounded-2xl p-5 border border-[#E8E8EA] shadow-xs space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4F4F6] pb-3">
                                <div>
                                  <h4 className="text-sm font-bold text-[#181343]">
                                    Detail Indikator &amp; Dampak Program
                                  </h4>
                                  <p className="text-xs text-[#787680]">
                                    Penerima manfaat terverifikasi, sasaran SDGs, dan linimasa operasional
                                  </p>
                                </div>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => onNavigateMenu("programs")}
                                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                                  className="text-xs self-start sm:self-auto cursor-pointer"
                                >
                                  Buka Halaman Monitoring Program
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                                {/* Penerima Manfaat (Membedakan Target vs Realisasi secara tegas) */}
                                <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-1.5">
                                  <span className="text-[11px] uppercase font-bold text-[#787680] tracking-wider block">
                                    Penerima Manfaat
                                  </span>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-[#47464F]">Target Rencana:</span>
                                      <span className="font-bold text-[#181343]">
                                        {targetBen > 0 ? `${targetBen.toLocaleString("id-ID")} Jiwa` : "-"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-[#47464F]">Realisasi Capaian:</span>
                                      <span className="font-bold text-emerald-600">
                                        {actualBen > 0
                                          ? `${actualBen.toLocaleString("id-ID")} Jiwa`
                                          : "Belum ada laporan"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Sasaran Kontribusi SDGs */}
                                <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-1.5">
                                  <span className="text-[11px] uppercase font-bold text-[#787680] tracking-wider block">
                                    Sasaran SDGs Terkait
                                  </span>
                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {progSdgs.length === 0 ? (
                                      <span className="text-xs text-[#787680] italic">
                                        Tidak ada SDG yang terpetakan
                                      </span>
                                    ) : (
                                      progSdgs.map((sdgId) => {
                                        const sdgInfo = ALL_17_SDGS.find((s) => s.id === sdgId);
                                        return (
                                          <span
                                            key={sdgId}
                                            className="px-2 py-0.5 rounded-md text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                                            style={{
                                              backgroundColor: sdgInfo?.color || "#10B981",
                                            }}
                                            title={sdgInfo?.name}
                                          >
                                            <span>SDG {sdgId}</span>
                                            <span className="hidden sm:inline font-normal text-white/90">
                                              - {sdgInfo?.name || ""}
                                            </span>
                                          </span>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>

                                {/* Periode Pelaksanaan & PIC */}
                                <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-1.5">
                                  <span className="text-[11px] uppercase font-bold text-[#787680] tracking-wider block">
                                    Periode Pelaksanaan
                                  </span>
                                  <div className="space-y-1 text-xs text-[#47464F]">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>
                                        {formatDate(prog.startDate)} s/d {formatDate(prog.endDate)}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-[#787680] truncate">
                                      Mitra: {prog.partnerName} ({prog.partnerCity || "Indonesia"})
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* BAGIAN 7 — INFORMASI PENDUKUNG                                */}
      {/* Peluang CSR Terkini                                          */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#181343]">
                Peluang CSR Terkini
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Inisiatif Terbuka
              </span>
            </div>
            <p className="text-xs text-[#787680]">
              Inisiatif peluang CSR yang telah dipublikasikan dan siap menerima proposal kolaborasi mitra
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMenu("opportunities")}
            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#181343]" />}
            className="text-xs font-semibold text-[#181343] cursor-pointer"
          >
            Lihat Semua Peluang CSR ({opportunities.length})
          </Button>
        </div>

        {opportunities.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-dashed border-[#C8C5D0] text-center space-y-3">
            <p className="text-xs text-[#787680]">
              Belum ada inisiatif peluang CSR yang dibuat oleh perusahaan Anda.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateOpportunity}
              leftIcon={<Plus className="w-4 h-4" />}
              className="text-xs cursor-pointer"
            >
              Buat Peluang CSR Baru
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.slice(0, 3).map((opp) => {
              const focus = FOCUS_AREA_CONFIG[opp.focusArea] || {
                label: opp.focusArea,
                variant: "slate" as const,
              };
              const isDraft = opp.status === "DRAFT";
              const statusCfg = isDraft
                ? { label: "Draf Internal", variant: "slate" as const }
                : STATUS_CONFIG[opp.status] || {
                    label: opp.status,
                    variant: "emerald" as const,
                  };

              return (
                <div
                  key={opp.id}
                  className="rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Visual Banner or Safe Fallback */}
                    {opp.bannerUrl ? (
                      <div className="relative h-32 overflow-hidden bg-slate-900">
                        <img
                          src={opp.bannerUrl}
                          alt={opp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                          <Badge
                            variant={statusCfg.variant}
                            size="sm"
                            hasDot={!isDraft}
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
                    ) : (
                      <div className="p-4 bg-[#F9F9FB] border-b border-[#E8E8EA] flex items-center justify-between gap-2">
                        <Badge
                          variant={statusCfg.variant}
                          size="sm"
                          hasDot={!isDraft}
                        >
                          {statusCfg.label}
                        </Badge>
                        <Badge variant={focus.variant} size="sm">
                          {focus.label}
                        </Badge>
                      </div>
                    )}

                    <div className="p-4 space-y-2.5">
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
                          <span className="font-medium truncate max-w-[150px]">
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

                  {/* Clean Single Action Button */}
                  <div className="p-4 pt-0">
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
    </div>
  );
}
