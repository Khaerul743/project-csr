"use client";

import React, { useMemo, useState, useRef } from "react";
import Image from "next/image";
import {
  TrendingUp,
  Activity,
  HeartHandshake,
  Plus,
  Eye,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";
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
  onOpenCreateOpportunity?: (provinceName?: string) => void;
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
  const isManagement = user.role === "MANAGEMENT";

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
  // Tabbed deep-dive section below main charts (prevents vertical section wall)
  const [detailTab, setDetailTab] = useState<"programs" | "geography" | "opportunities">("programs");

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

  // 4C. Skala Y-Axis Dinamis dengan Gridline Horizontal & Satuan Rupiah Proporsional
  const chartYScale = useMemo(() => {
    const activeMax = budgetTrendMode === "annual" ? annualTrendData.maxVal : monthlyTrendData.maxVal;
    let max = Math.max(activeMax, 10_000_000);
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const fraction = max / magnitude;
    let multiplier = 1;
    if (fraction <= 1.25) multiplier = 1.25;
    else if (fraction <= 2) multiplier = 2;
    else if (fraction <= 2.5) multiplier = 2.5;
    else if (fraction <= 5) multiplier = 5;
    else multiplier = 10;

    const cleanMax = multiplier * magnitude;
    const ticks = [
      cleanMax,
      cleanMax * 0.75,
      cleanMax * 0.5,
      cleanMax * 0.25,
      0,
    ];

    return { max: cleanMax, ticks };
  }, [budgetTrendMode, annualTrendData.maxVal, monthlyTrendData.maxVal]);

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
        color: "#10B981",
        dotColor: "bg-[#10B981]",
        lightBg: "bg-[#ECFDF5]",
        borderColor: "border-emerald-200",
        textColor: "text-[#065F46]",
      },
      {
        key: "PLANNED",
        label: "Persiapan",
        count: planned,
        percentage: plannedPct,
        color: "#F59E0B",
        dotColor: "bg-[#F59E0B]",
        lightBg: "bg-[#FFFBEB]",
        borderColor: "border-amber-200",
        textColor: "text-[#B45309]",
      },
      {
        key: "COMPLETED",
        label: "Selesai",
        count: completed,
        percentage: completedPct,
        color: "#2563EB",
        dotColor: "bg-[#2563EB]",
        lightBg: "bg-[#EFF6FF]",
        borderColor: "border-blue-200",
        textColor: "text-[#1D4ED8]",
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
      urgency: "amber" | "red";
      icon: React.ComponentType<{ className?: string }>;
      onClick: () => void;
    }> = [];
    const now = new Date();

    // 1. Laporan Menunggu Verifikasi (Urgensi Sedang: Amber)
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
        title: isManagement
          ? "Laporan dalam Antrean Verifikasi"
          : "Laporan Menunggu Verifikasi",
        description: isManagement
          ? `${pendingReportsTotal} laporan kegiatan mitra menunggu verifikasi tim CSR`
          : `${pendingReportsTotal} laporan kegiatan mitra perlu peninjauan`,
        count: pendingReportsTotal,
        badgeLabel: `${pendingReportsTotal} Laporan`,
        urgency: "amber",
        icon: Clock,
        onClick: () => onNavigateMenu("programs"),
      });
    }

    // 2. Aktivitas Melewati Jadwal (Urgensi Tinggi: Merah)
    const overduePrograms = programs.filter((p) => {
      if (p.status !== "IN_PROGRESS" && p.status !== "PLANNED") return false;
      if (!p.nextActivityDate) return false;
      const actDate = new Date(p.nextActivityDate);
      return !isNaN(actDate.getTime()) && actDate.getTime() < now.getTime();
    });

    if (overduePrograms.length > 0) {
      items.push({
        id: "overdue-activities",
        title: isManagement
          ? "Program Melewati Target Jadwal"
          : "Aktivitas Melewati Jadwal",
        description: `${overduePrograms.length} program melewati target tanggal rencana`,
        count: overduePrograms.length,
        badgeLabel: `${overduePrograms.length} Tertunda`,
        urgency: "red",
        icon: AlertTriangle,
        onClick: () => onNavigateMenu("programs"),
      });
    }

    // 3. Program Mendekati Tenggat Waktu (Urgensi Sedang: Amber)
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
        urgency: "amber",
        icon: AlertCircle,
        onClick: () => onNavigateMenu("programs"),
      });
    }

    return items.slice(0, 3);
  }, [programs, isManagement, onNavigateMenu]);

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

  const currentDateString = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* 0. Executive Breakout Hero Banner Container (Wrapper Utama position: relative & overflow: visible) */}
      <div className="relative pt-10 sm:pt-12 lg:pt-14 overflow-visible w-full mt-1 sm:mt-2">
        {/* Layer 1: Kotak Background Banner (overflow: hidden agar gedung & dekorasi mengikuti rounded corners) */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1067A9] via-[#0E60A1] to-[#0D5B99] text-white border border-[#2B7CBD]/40 shadow-sm overflow-hidden min-h-[175px] sm:min-h-[185px] lg:min-h-[195px] flex items-center">
          {/* Latar Belakang Gedung Perusahaan & Pepohonan di Sisi Kanan Banner */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[55%] md:w-[48%] pointer-events-none select-none overflow-hidden opacity-30 sm:opacity-35 mix-blend-luminosity">
            <Image
              src="/images/overview/executive-banner-building.jpg"
              alt=""
              fill
              priority
              className="object-cover object-right"
              sizes="(max-width: 1024px) 50vw, 480px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1067A9] via-[#0E60A1]/85 to-transparent" />
          </div>

          {/* Gelombang Dekoratif & Efek Ambient Glow Halus */}
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"
          />

          {/* Konten Teks & Tombol di Sisi Kiri */}
          <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7 lg:py-8 max-w-[66%] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white tracking-tight leading-tight">
                Halo,{" "}
                <span className="font-extrabold text-white">
                  {user.name || "Manajemen"}
                </span>{" "}
                <span className="inline-block" role="img" aria-label="Melambai">
                  👋
                </span>
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/15 text-white/95 border border-white/20 backdrop-blur-xs">
                {currentDateString}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              {isManagement
                ? "Semoga hari Anda produktif! Pantau alokasi pagu, efektivitas serapan anggaran, dan akuntabilitas dampak program CSR perusahaan Anda hari ini."
                : "Semoga hari Anda produktif! Kelola inisiatif CSR, tinjau pengajuan proposal, dan pantau kemitraan program berkelanjutan lembaga Anda."}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateMenu("programs")}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white hover:bg-blue-50 active:scale-[0.99] text-[#0E60A1] text-xs font-bold shadow-xs transition-all cursor-pointer group"
              >
                <span>Lihat Detail Portofolio Program</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0E60A1] transition-transform group-hover:translate-x-0.5" />
              </button>
              {!isManagement && onOpenCreateOpportunity && (
                <button
                  type="button"
                  onClick={() => onOpenCreateOpportunity()}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Plus aria-hidden="true" className="w-3.5 h-3.5 text-white" />
                  <span>Buat Peluang CSR</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Layer 2: Ilustrasi Karakter Breakout / Overflowing (Lapisan Paling Depan di Kanan, menempel di dasar banner) */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-3 sm:right-6 lg:right-8 z-20 pointer-events-none select-none leading-none"
        >
          <Image
            src="/images/overview/executive-management-breakout.png"
            alt="Ilustrasi Manajemen Perusahaan"
            width={737}
            height={751}
            priority
            className="w-[165px] sm:w-[185px] md:w-[205px] lg:w-[225px] xl:w-[240px] h-auto block align-bottom"
            style={{ display: "block", verticalAlign: "bottom" }}
          />
        </div>
      </div>

      {/* 1. Ringkasan 4 KPI Utama (Left Accent Border 3.5px & Soft Tinted Background Seragam) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
        {/* KPI 1: Total Pagu CSR (Left Accent Border Biru #2563EB) */}
        <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#D9E8F9] border-l-[3.5px] border-l-[#2563EB] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-full min-h-[142px] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Total Pagu CSR</span>
            <div className="w-9 h-9 rounded-full bg-blue-50/90 border border-blue-200/60 text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-[28px] font-black text-[#0A2558] tabular-nums tracking-tight leading-none">
              {formatCompact(kpiData.totalAllocated)}
            </div>
            <p className="text-xs text-slate-500 pt-1 truncate">
              Alokasi resmi dari {kpiData.totalPrograms} program
            </p>
          </div>
        </div>

        {/* KPI 2: Realisasi Anggaran (Left Accent Border Hijau #059669) */}
        <div className="p-5 rounded-2xl bg-[#F8FDFB] border border-[#D1F4E4] border-l-[3.5px] border-l-[#059669] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-full min-h-[142px] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Realisasi Anggaran</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50/90 border border-emerald-200/60 text-[#059669] flex items-center justify-center shrink-0 shadow-2xs">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-[28px] font-black text-[#065F46] tabular-nums tracking-tight truncate leading-none">
                {formatCompact(kpiData.totalSpent)}
              </span>
              <span className="text-xs font-bold text-[#065F46] bg-emerald-100/90 border border-emerald-200/80 px-2 py-0.5 rounded-full tabular-nums shrink-0">
                {kpiData.absorptionRate}%
              </span>
            </div>
            <div className="space-y-1 pt-0.5">
              <div className="w-full h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#059669] to-[#10B981] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, kpiData.absorptionRate))}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 truncate">
                Serapan terverifikasi terhadap pagu
              </p>
            </div>
          </div>
        </div>

        {/* KPI 3: Program Berjalan (Left Accent Border Biru #2563EB) */}
        <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#D9E8F9] border-l-[3.5px] border-l-[#2563EB] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-full min-h-[142px] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Program Berjalan</span>
            <div className="w-9 h-9 rounded-full bg-blue-50/90 border border-blue-200/60 text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-[34px] font-black text-[#0A2558] tabular-nums tracking-tight leading-none">
                {kpiData.runningCount}
              </span>
              <span className="text-xs font-semibold text-slate-400 tabular-nums">
                / {kpiData.totalPrograms} program
              </span>
            </div>
            <p className="text-xs text-slate-500 pt-1 truncate">
              {kpiData.completedCount} program telah selesai
            </p>
          </div>
        </div>

        {/* KPI 4: Mitra Berkontrak (Left Accent Border Hijau #059669) */}
        <div className="p-5 rounded-2xl bg-[#F8FDFB] border border-[#D1F4E4] border-l-[3.5px] border-l-[#059669] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-full min-h-[142px] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Mitra Berkontrak</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50/90 border border-emerald-200/60 text-[#059669] flex items-center justify-center shrink-0 shadow-2xs">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-[34px] font-black text-[#065F46] tabular-nums tracking-tight leading-none">
              {kpiData.uniquePartnersCount}
            </div>
            <p className="text-xs text-slate-500 pt-1 truncate">
              Lembaga pelaksana program aktif
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Filter Segaris */}
      <div className="bg-white rounded-xl border border-[#DBEAFE] px-4 py-2.5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter tahun pelaporan"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedMonth(null);
            }}
            className="h-9 px-3 py-1.5 rounded-lg border border-[#DBEAFE] hover:border-[#93C5FD] text-xs font-medium text-[#0A2558] bg-white hover:bg-[#F8FBFF] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1765F5] focus:border-[#1765F5] transition-colors"
          >
            <option value="ALL">Semua Tahun</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Tahun {yr}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter status program"
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
            className="h-9 px-3 py-1.5 rounded-lg border border-[#DBEAFE] hover:border-[#93C5FD] text-xs font-medium text-[#0A2558] bg-white hover:bg-[#F8FBFF] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1765F5] focus:border-[#1765F5] transition-colors"
          >
            <option value="ALL">Semua Status</option>
            {statusDistribution.map((st) => (
              <option key={st.key} value={st.key} disabled={st.count === 0}>
                {st.label} ({st.count})
              </option>
            ))}
          </select>

          <select
            aria-label="Filter bidang fokus CSR"
            value={selectedFocusArea}
            onChange={(e) => setSelectedFocusArea(e.target.value)}
            className="h-9 px-3 py-1.5 rounded-lg border border-[#DBEAFE] hover:border-[#93C5FD] text-xs font-medium text-[#0A2558] bg-white hover:bg-[#F8FBFF] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1765F5] focus:border-[#1765F5] transition-colors"
          >
            <option value="ALL">Semua Bidang</option>
            <option value="LINGKUNGAN">Lingkungan Hidup</option>
            <option value="PENDIDIKAN">Pendidikan</option>
            <option value="KESEHATAN">Kesehatan</option>
            <option value="PEMBERDAYAAN_EKONOMI">Pemberdayaan Ekonomi</option>
            <option value="INFRASTRUKTUR_SOSIAL">Infrastruktur Sosial</option>
            <option value="TANGGAP_BENCANA">Tanggap Bencana</option>
            <option value="LAINNYA">Lainnya</option>
          </select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-rose-600" />}
              className="h-9 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer rounded-lg px-3"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {hasActiveFilters && <span className="font-semibold text-[#0A2558]">Filter aktif:</span>}
          {selectedYear !== "ALL" && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#EDF6FF] border border-[#CBE7FD] font-semibold text-[#0A2558] text-[11px]">
              Tahun {selectedYear}
            </span>
          )}
          {selectedMonth !== null && (
            <button
              type="button"
              onClick={() => setSelectedMonth(null)}
              className="px-2.5 py-0.5 rounded-full bg-[#EDF6FF] border border-[#CBE7FD] font-semibold text-[#0A2558] text-[11px] hover:border-rose-300 hover:text-rose-700 cursor-pointer"
            >
              Bulan: {MONTH_NAMES.find((m) => m.num === selectedMonth)?.name || selectedMonth} ×
            </button>
          )}
          {selectedStatus !== "ALL" && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-emerald-200 font-semibold text-[#065F46] text-[11px]">
              {selectedStatus === "IN_PROGRESS"
                ? "Sedang Berjalan"
                : selectedStatus === "PLANNED"
                  ? "Persiapan"
                  : "Selesai"}
            </span>
          )}
          {selectedFocusArea !== "ALL" && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#EDF6FF] border border-[#CBE7FD] font-semibold text-[#0A2558] text-[11px]">
              {FOCUS_AREA_CONFIG[selectedFocusArea as keyof typeof FOCUS_AREA_CONFIG]?.label || selectedFocusArea}
            </span>
          )}
          {selectedProvince && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#EDF6FF] border border-[#CBE7FD] font-semibold text-[#0A2558] text-[11px]">
              {selectedProvince}
            </span>
          )}
          <span className="text-[11px] font-semibold text-slate-600 tabular-nums lg:ml-2">
            {filteredPrograms.length} dari {programs.length} program
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BAGIAN 3: ANALISIS ANGGARAN & STATUS PROGRAM                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (7 cols): Tren Anggaran CSR */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#DBEAFE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-[#0A2558]">
                  Tren Alokasi vs Realisasi
                </h2>
                <p className="text-xs text-slate-600">
                  {budgetTrendMode === "annual"
                    ? "Perbandingan komitmen anggaran terhadap dana terealisasi"
                    : `Realisasi anggaran bulanan periode ${monthlyYear}`}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {budgetTrendMode === "monthly" && (
                  <select
                    aria-label="Pilih tahun tren bulanan"
                    value={monthlyYear}
                    onChange={(e) => {
                      setMonthlyYear(e.target.value);
                      setSelectedMonth(null);
                    }}
                    className="h-9 text-xs font-medium bg-white hover:bg-[#F8FBFF] border border-[#DBEAFE] hover:border-[#93C5FD] rounded-lg px-3 py-1.5 text-[#0A2558] focus:outline-none focus:ring-1 focus:ring-[#1765F5] focus:border-[#1765F5] cursor-pointer transition-colors"
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Tahun {yr}
                      </option>
                    ))}
                  </select>
                )}

                <div className="inline-flex items-center bg-[#F4F9FF] p-1 rounded-full border border-[#DBEAFE]">
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetTrendMode("annual");
                      setSelectedMonth(null);
                    }}
                    className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${budgetTrendMode === "annual"
                      ? "bg-gradient-to-r from-[#1A60B0] via-[#10519B] to-[#073E8A] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0A2558]"
                      }`}
                  >
                    Tahunan
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetTrendMode("monthly")}
                    className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${budgetTrendMode === "monthly"
                      ? "bg-gradient-to-r from-[#1A60B0] via-[#10519B] to-[#073E8A] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0A2558]"
                      }`}
                  >
                    Bulanan
                  </button>
                </div>
              </div>
            </div>

            {/* Minimalist Legend */}
            <div className="flex items-center justify-between pb-3 text-xs border-b border-[#EDF6FF]">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
                  <span className="text-slate-700 font-medium">Alokasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
                  <span className="text-slate-700 font-medium">Realisasi</span>
                </div>
              </div>

              {budgetTrendMode === "monthly" && selectedMonth !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedMonth(null)}
                  className="text-[#1765F5] font-semibold hover:underline cursor-pointer"
                >
                  Tampilkan Semua Bulan
                </button>
              )}
            </div>

            {/* VISUALISASI GRAFIK MODERN DENGAN SUMBU Y & GRIDLINE */}
            <div className="pt-4">
              <div className="flex items-stretch gap-2 sm:gap-3">
                {/* Sumbu Y: Skala Nominal Rupiah */}
                <div className="w-14 sm:w-16 shrink-0 flex flex-col justify-between items-end pb-7 pr-1 text-[11px] font-semibold text-slate-500 select-none tabular-nums h-56">
                  {chartYScale.ticks.map((tick, i) => (
                    <span key={i} className="leading-none text-right">
                      {formatCompact(tick)}
                    </span>
                  ))}
                </div>

                {/* Area Plot Batang & Gridline Horizontal */}
                <div className="relative flex-1 min-w-0 h-56">
                  {/* Gridline Horizontal Halus */}
                  <div className="absolute inset-0 pb-7 flex flex-col justify-between pointer-events-none">
                    {chartYScale.ticks.map((_, i) => (
                      <div
                        key={i}
                        className={`w-full border-b ${
                          i === chartYScale.ticks.length - 1
                            ? "border-slate-200"
                            : "border-slate-100/80"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Mode Tahunan */}
                  {budgetTrendMode === "annual" && (
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      {annualTrendData.data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-slate-600">
                          Belum ada data anggaran tahunan untuk ditampilkan.
                        </div>
                      ) : (
                        <>
                          <div
                            className={`h-48 flex items-end ${
                              annualTrendData.data.length === 1
                                ? "justify-center"
                                : "justify-around gap-4 sm:gap-8"
                            } px-2 sm:px-4`}
                          >
                            <div
                              className={`flex items-end ${
                                annualTrendData.data.length === 1
                                  ? "justify-center max-w-[220px] w-full"
                                  : "justify-around w-full"
                              }`}
                            >
                              {annualTrendData.data.map((item) => {
                                const allocatedHeight =
                                  chartYScale.max > 0 && item.allocated > 0
                                    ? Math.min(
                                        100,
                                        Math.max(
                                          6,
                                          Math.round((item.allocated / chartYScale.max) * 100)
                                        )
                                      )
                                    : 0;
                                const spentHeight =
                                  chartYScale.max > 0 && item.spent > 0
                                    ? Math.min(
                                        100,
                                        Math.max(
                                          6,
                                          Math.round((item.spent / chartYScale.max) * 100)
                                        )
                                      )
                                    : 0;

                                const isHovered = hoveredYear === item.year;
                                const isSelected = selectedYear === item.year;

                                return (
                                  <div
                                    key={item.year}
                                    className={`relative flex flex-col items-center group cursor-pointer transition-all ${
                                      annualTrendData.data.length === 1
                                        ? "w-full"
                                        : "flex-1 max-w-[130px]"
                                    } ${
                                      selectedYear !== "ALL" && !isSelected
                                        ? "opacity-35"
                                        : "opacity-100"
                                    }`}
                                    onMouseEnter={() => setHoveredYear(item.year)}
                                    onMouseLeave={() => setHoveredYear(null)}
                                    onClick={() => {
                                      setSelectedYear(
                                        selectedYear === item.year ? "ALL" : item.year
                                      );
                                    }}
                                  >
                                    {/* Tooltip Interaktif Saat Hover */}
                                    {isHovered && (
                                      <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-[#0A2558]/95 backdrop-blur-xs text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl border border-white/10 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                                        <div className="font-bold text-white border-b border-white/10 pb-1 mb-1.5 flex items-center justify-between gap-3">
                                          <span>Tahun {item.year}</span>
                                          <span className="text-[10px] font-normal text-slate-300">
                                            {item.count} program
                                          </span>
                                        </div>
                                        <div className="space-y-1 text-[11px]">
                                          <div className="flex items-center justify-between gap-4">
                                            <span className="flex items-center gap-1.5 text-sky-200">
                                              <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                                              Alokasi
                                            </span>
                                            <span className="font-semibold tabular-nums">
                                              {formatRupiah(item.allocated)}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between gap-4">
                                            <span className="flex items-center gap-1.5 text-emerald-200">
                                              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                                              Realisasi
                                            </span>
                                            <span className="font-semibold tabular-nums">
                                              {formatRupiah(item.spent)}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10 text-[10px] text-slate-300">
                                            <span>Tingkat Serapan</span>
                                            <span className="font-bold text-emerald-300 tabular-nums">
                                              {item.absorption}%
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Pasangan Batang Alokasi & Realisasi */}
                                    <div className="w-full flex items-end justify-center gap-2 sm:gap-3 h-44">
                                      <div
                                        className="w-10 sm:w-12 max-w-[44px] bg-gradient-to-t from-[#1D4ED8] to-[#38BDF8] rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-2xs"
                                        style={{ height: `${allocatedHeight}%` }}
                                        title={`Alokasi ${item.year}: ${formatRupiah(item.allocated)}`}
                                      />
                                      <div
                                        className="w-10 sm:w-12 max-w-[44px] bg-gradient-to-t from-[#059669] to-[#34D399] rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-2xs"
                                        style={{ height: `${spentHeight}%` }}
                                        title={`Realisasi ${item.year}: ${formatRupiah(item.spent)}`}
                                      />
                                    </div>

                                    {/* Label Tahun */}
                                    <div className="h-7 pt-2 text-center">
                                      <span
                                        className={`text-xs font-bold tabular-nums transition-colors ${
                                          isSelected
                                            ? "text-[#059669] underline font-extrabold"
                                            : "text-[#0A2558] group-hover:text-[#2563EB]"
                                        }`}
                                      >
                                        {item.year}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Mode Bulanan */}
                  {budgetTrendMode === "monthly" && (
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="h-48 flex items-end justify-between gap-1 sm:gap-1.5 px-0.5">
                        {monthlyTrendData.months.map((m) => {
                          const allocatedHeight =
                            chartYScale.max > 0 && m.allocated > 0
                              ? Math.min(
                                  100,
                                  Math.max(
                                    6,
                                    Math.round((m.allocated / chartYScale.max) * 100)
                                  )
                                )
                              : 0;
                          const spentHeight =
                            chartYScale.max > 0 && m.spent > 0
                              ? Math.min(
                                  100,
                                  Math.max(
                                    6,
                                    Math.round((m.spent / chartYScale.max) * 100)
                                  )
                                )
                              : 0;

                          const isHovered = hoveredMonth === m.num;
                          const isSelected = selectedMonth === m.num;

                          return (
                            <div
                              key={m.num}
                              className={`relative flex flex-col items-center flex-1 min-w-[20px] max-w-[44px] group cursor-pointer transition-all ${
                                selectedMonth !== null && !isSelected
                                  ? "opacity-35"
                                  : "opacity-100"
                              }`}
                              onMouseEnter={() => setHoveredMonth(m.num)}
                              onMouseLeave={() => setHoveredMonth(null)}
                              onClick={() => {
                                setSelectedMonth(
                                  selectedMonth === m.num ? null : m.num
                                );
                              }}
                            >
                              {/* Tooltip Interaktif Mode Bulanan */}
                              {isHovered && (
                                <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-[#0A2558]/95 backdrop-blur-xs text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl border border-white/10 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                                  <div className="font-bold text-white border-b border-white/10 pb-1 mb-1.5">
                                    {m.name} {monthlyYear}
                                  </div>
                                  {m.hasData ? (
                                    <div className="space-y-1 text-[11px]">
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="flex items-center gap-1.5 text-sky-200">
                                          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                                          Alokasi
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                          {formatRupiah(m.allocated)}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="flex items-center gap-1.5 text-emerald-200">
                                          <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                                          Realisasi
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                          {formatRupiah(m.spent)}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10 text-[10px] text-slate-300">
                                        <span>Tingkat Serapan</span>
                                        <span className="font-bold text-emerald-300 tabular-nums">
                                          {m.absorption}%
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-slate-300 text-[10px]">
                                      Belum ada realisasi pada bulan ini
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Batang Alokasi & Realisasi Bulanan */}
                              <div className="w-full flex items-end justify-center gap-1 h-44">
                                {m.hasData ? (
                                  <>
                                    <div
                                      className="w-1/2 max-w-[14px] bg-gradient-to-t from-[#1D4ED8] to-[#38BDF8] rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-2xs"
                                      style={{ height: `${allocatedHeight}%` }}
                                      title={`${m.name}: Alokasi ${formatRupiah(m.allocated)}`}
                                    />
                                    <div
                                      className="w-1/2 max-w-[14px] bg-gradient-to-t from-[#059669] to-[#34D399] rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-2xs"
                                      style={{ height: `${spentHeight}%` }}
                                      title={`${m.name}: Realisasi ${formatRupiah(m.spent)}`}
                                    />
                                  </>
                                ) : (
                                  <div className="w-full h-1 bg-slate-100 rounded-full group-hover:bg-[#DBEAFE] transition-colors" />
                                )}
                              </div>

                              {/* Label Singkatan Bulan */}
                              <div className="h-7 pt-2 text-center">
                                <span
                                  className={`text-[11px] font-semibold transition-colors ${
                                    isSelected
                                      ? "text-[#059669] underline font-bold"
                                      : "text-slate-600 group-hover:text-[#2563EB]"
                                  }`}
                                >
                                  {m.short}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Keterangan Footer Grafik */}
              <div className="pt-3 flex items-center justify-between text-xs text-slate-600">
                <span>
                  {budgetTrendMode === "monthly"
                    ? "Klik bulan untuk memfilter rincian program"
                    : "Klik tahun untuk memfilter rincian portofolio"}
                </span>
                <span className="font-medium text-[#0A2558] tabular-nums">
                  Total Realisasi {monthlyYear}:{" "}
                  <strong className="text-[#047857]">
                    {formatCompact(monthlyTrendData.totalYearSpent)}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Distribusi Status & Perhatian Eksekutif */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl sm:rounded-3xl border border-[#DBEAFE] shadow-2xs flex flex-col justify-between gap-5">
          <div className="space-y-5">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#0A2558]">
                Status Program CSR
              </h2>
              <p className="text-xs text-slate-600">
                Proporsi tahap pelaksanaan portofolio saat ini
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Donut Chart */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
                  {donutConfig.type === "empty" && (
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#E2E8F0" strokeWidth="13" />
                  )}

                  {donutConfig.type === "single" && donutConfig.singleSlice && (
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={donutConfig.singleSlice.color}
                      strokeWidth="13"
                      className="transition-opacity duration-200 hover:opacity-85 cursor-pointer"
                      onClick={() => handleSelectStatus(donutConfig.singleSlice!.key)}
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
                        className="transition-opacity duration-200 hover:opacity-85 cursor-pointer"
                        onClick={() => handleSelectStatus(slice.key)}
                      />
                    ))}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-extrabold text-[#0A2558] leading-none tabular-nums">
                    {donutConfig.total}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium mt-0.5">Program</span>
                </div>
              </div>

              {/* Status Indicators List (Biru: Selesai, Amber: Persiapan, Hijau: Berjalan) */}
              <div className="flex-1 w-full divide-y divide-[#EDF6FF]">
                {statusDistribution.map((st) => {
                  const isSelected = selectedStatus === st.key;
                  const isZero = st.count === 0;

                  return (
                    <button
                      type="button"
                      key={st.key}
                      disabled={isZero}
                      onClick={() => handleSelectStatus(st.key)}
                      className={`w-full py-2.5 px-2.5 flex items-center justify-between text-left transition-colors rounded-xl ${
                        isZero
                          ? "opacity-45 cursor-not-allowed"
                          : isSelected
                            ? `${st.lightBg} ${st.textColor} cursor-pointer font-bold`
                            : "hover:bg-[#F4F9FF] cursor-pointer"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.dotColor}`} />
                        <span className="text-xs font-semibold text-[#0A2558]">{st.label}</span>
                      </span>
                      <span className="flex items-center gap-2.5 tabular-nums">
                        <span className="text-xs font-bold text-[#0A2558]">{st.count}</span>
                        <span className="text-xs text-slate-600 w-9 text-right">{st.percentage}%</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Perhatian Eksekutif (Pengawasan Portofolio: Amber/Red Berdasarkan Urgensi) */}
          {followUpPriorities.length > 0 && (
            <div className="pt-4 border-t border-[#EDF6FF] space-y-2.5">
              <span className="text-xs font-bold text-[#0A2558] block">
                {isManagement ? "Perhatian Eksekutif" : "Prioritas Tindak Lanjut"}
              </span>
              <div className="space-y-2.5">
                {followUpPriorities.map((item) => {
                  const IconComponent = item.icon;
                  const isRed = item.urgency === "red";

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full p-3 rounded-2xl border transition-colors flex items-start justify-between gap-3 text-left cursor-pointer group ${
                        isRed
                          ? "bg-[#FFF5F5] border-rose-200/70 hover:bg-rose-50"
                          : "bg-[#FFFDF5] border-amber-200/70 hover:bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isRed
                              ? "bg-rose-100/90 text-rose-700"
                              : "bg-amber-100/90 text-amber-700"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-bold ${
                              isRed ? "text-rose-950" : "text-[#0A2558]"
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 tabular-nums self-center border ${
                          isRed
                            ? "text-rose-900 bg-white border-rose-200"
                            : "text-amber-900 bg-white border-amber-200"
                        }`}
                      >
                        {item.badgeLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BAGIAN 4: PENJELAJAH PORTOFOLIO TERPADU (TAB SWITCHER)        */}
      {/* ============================================================ */}
      <div ref={drillDownTableRef} className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div
            className="flex items-center gap-2.5 shrink-0 whitespace-nowrap overflow-x-auto max-w-full"
            role="tablist"
            aria-label="Tampilan detail portofolio"
          >
            {[
              { id: "programs" as const, label: "Program & Mitra", count: filteredPrograms.length },
              { id: "geography" as const, label: "Wilayah & Bidang Fokus", count: categoryDistribution.length },
              { id: "opportunities" as const, label: "Katalog Peluang", count: opportunities.length },
            ].map((tab) => {
              const isSelected = detailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setDetailTab(tab.id)}
                  className={`inline-flex items-center gap-2 shrink-0 whitespace-nowrap h-9 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#10519B] ${isSelected
                    ? "bg-gradient-to-r from-[#1A60B0] via-[#10519B] to-[#073E8A] text-white border-transparent shadow-xs font-semibold"
                    : "bg-white text-[#0A2558] border-[#DBEAFE] hover:bg-[#F8FBFF]"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${isSelected ? "bg-white/20 text-white" : "bg-[#EDF6FF] text-[#0A2558]"
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onNavigateMenu(detailTab === "opportunities" ? "opportunities" : "programs")
            }
            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#1765F5]" />}
            className="text-xs font-semibold rounded-lg h-9 px-3.5 cursor-pointer self-start sm:self-auto"
          >
            {detailTab === "opportunities"
              ? "Lihat Semua Peluang"
              : isManagement
                ? "Buka Pengawasan Program"
                : "Lihat Semua Program"}
          </Button>
        </div>

        {/* TAB 1: PROGRAM & MITRA (Ringkas, 5 Kolom Utama, Ekspansi Detail Opsional) */}
        {detailTab === "programs" && (
          <>
            {filteredPrograms.length === 0 ? (
              <div className="py-10 px-6 rounded-3xl bg-white border border-[#DBEAFE] shadow-xs text-center space-y-4">
                <div className="mx-auto w-[140px] h-[116px] flex items-center justify-center">
                  <Image
                    src="/images/overview/overview-empty-state.png"
                    alt="Tidak ada data program"
                    width={140}
                    height={116}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <p className="text-sm font-bold text-[#0A2558]">
                    Tidak ada program pada filter saat ini
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ubah filter tahun, status, atau bidang fokus untuk melihat daftar program CSR perusahaan.
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    className="text-xs font-semibold rounded-full cursor-pointer"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-3xl bg-white border border-[#DBEAFE] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                    <thead>
                      <tr className="border-b border-[#073E8A]/30 text-white font-semibold bg-[#10519B]">
                        <th className="py-3.5 px-5 w-[34%]">Program CSR</th>
                        <th className="py-3.5 px-4 w-[24%]">Mitra Pelaksana</th>
                        <th className="py-3.5 px-4 w-[14%]">Status</th>
                        <th className="py-3.5 px-4 w-[18%] text-right">Realisasi / Pagu</th>
                        <th className="py-3.5 px-5 w-[10%] text-right">Rincian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF6FF]">
                      {filteredPrograms.map((prog) => {
                        const focus =
                          FOCUS_AREA_CONFIG[prog.focusArea as keyof typeof FOCUS_AREA_CONFIG] || {
                            label: prog.focusArea,
                            variant: "slate" as const,
                          };

                        const statusDisplay =
                          prog.status === "IN_PROGRESS"
                            ? { label: "Sedang Berjalan", variant: "emerald" as const }
                            : prog.status === "PLANNED"
                              ? { label: "Persiapan", variant: "blue" as const }
                              : prog.status === "COMPLETED"
                                ? { label: "Selesai", variant: "navy" as const }
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
                              className={`hover:bg-[#F4F9FF]/70 transition-colors cursor-pointer ${isExpanded ? "bg-[#EDF6FF]/50" : ""
                                }`}
                              onClick={() =>
                                setExpandedProgramId(isExpanded ? null : prog.id)
                              }
                            >
                              <td className="py-4 px-5">
                                <p className="font-bold text-[#0A2558] text-[13px] line-clamp-1">
                                  {prog.title}
                                </p>
                                <p className="text-[11px] text-slate-600 mt-0.5">
                                  {focus.label} &middot;{" "}
                                  {prog.targetCity || prog.targetProvince || "Nasional"}
                                </p>
                              </td>

                              <td className="py-4 px-4">
                                <p className="font-semibold text-[#0A2558]">
                                  {prog.partnerName || "Mitra Pelaksana"}
                                </p>
                                <p className="text-[11px] text-slate-600">
                                  {prog.partnerCity || "Indonesia"}
                                </p>
                              </td>

                              <td className="py-4 px-4">
                                <Badge variant={statusDisplay.variant} size="sm" hasDot>
                                  {statusDisplay.label}
                                </Badge>
                              </td>

                              <td className="py-4 px-4 text-right tabular-nums">
                                <p className="font-bold text-[#047857]">
                                  {formatCompact(spent)}{" "}
                                  <span className="text-slate-600 font-medium">
                                    / {formatCompact(alloc)}
                                  </span>
                                </p>
                                <p className="text-[11px] text-slate-600">
                                  {progAbsorption}% terserap
                                </p>
                              </td>

                              <td
                                className="py-4 px-5 text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedProgramId(isExpanded ? null : prog.id)
                                  }
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A2558] hover:text-[#1765F5] cursor-pointer px-2 py-1 rounded-lg hover:bg-[#EDF6FF]"
                                >
                                  <span>{isExpanded ? "Tutup" : "Detail"}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-[#F8FBFF] border-b border-[#DBEAFE]">
                                <td colSpan={5} className="p-5">
                                  <div className="bg-white rounded-2xl p-5 border border-[#DBEAFE] space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDF6FF] pb-3">
                                      <div>
                                        <h4 className="text-sm font-bold text-[#0A2558]">
                                          Indikator &amp; Dampak Program
                                        </h4>
                                        <p className="text-xs text-slate-600">
                                          Alokasi resmi {formatRupiah(alloc)} &middot; Realisasi {formatRupiah(spent)}
                                        </p>
                                      </div>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => onNavigateMenu("programs")}
                                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                                        className="text-xs rounded-full self-start sm:self-auto cursor-pointer"
                                      >
                                        {isManagement
                                          ? "Buka Pengawasan Program"
                                          : "Buka Monitoring Program"}
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-slate-600 block">
                                          Penerima Manfaat
                                        </span>
                                        <p className="text-xs text-[#0A2558]">
                                          Target:{" "}
                                          <strong className="tabular-nums">
                                            {targetBen > 0 ? `${targetBen.toLocaleString("id-ID")} Jiwa` : "-"}
                                          </strong>
                                        </p>
                                        <p className="text-xs text-[#047857] font-semibold">
                                          Realisasi:{" "}
                                          <strong className="tabular-nums">
                                            {actualBen > 0
                                              ? `${actualBen.toLocaleString("id-ID")} Jiwa`
                                              : "Belum dilaporkan"}
                                          </strong>
                                        </p>
                                      </div>

                                      <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-slate-600 block">
                                          Sasaran SDGs Terkait
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {progSdgs.length === 0 ? (
                                            <span className="text-xs text-slate-600">
                                              Belum dipetakan
                                            </span>
                                          ) : (
                                            progSdgs.map((sdgId) => {
                                              const sdgInfo = ALL_17_SDGS.find((s) => s.id === sdgId);
                                              return (
                                                <span
                                                  key={sdgId}
                                                  className="px-2 py-0.5 rounded-md text-white text-[10px] font-bold"
                                                  style={{
                                                    backgroundColor: sdgInfo?.color || "#047857",
                                                  }}
                                                  title={sdgInfo?.name}
                                                >
                                                  SDG {sdgId}
                                                </span>
                                              );
                                            })
                                          )}
                                        </div>
                                      </div>

                                      <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-slate-600 block">
                                          Periode Pelaksanaan
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs text-[#0A2558] font-medium">
                                          <Calendar className="w-3.5 h-3.5 text-[#1765F5]" />
                                          <span>
                                            {formatDate(prog.startDate)} s/d {formatDate(prog.endDate)}
                                          </span>
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
              </div>
            )}
          </>
        )}

        {/* TAB 2: SEBARAN WILAYAH & BIDANG FOKUS */}
        {detailTab === "geography" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#DBEAFE] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#0A2558]">
                    Sebaran Bidang Fokus CSR
                  </h3>
                  <p className="text-xs text-slate-600">
                    Klik salah satu kategori tematik untuk memfilter seluruh dashboard
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#0A2558] bg-[#EDF6FF] border border-[#CBE7FD] px-3 py-1 rounded-full self-start sm:self-auto">
                  {categoryDistribution.length} Kategori Aktif
                </span>
              </div>

              {categoryDistribution.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-600">
                  Belum ada data kategori tematik untuk filter yang dipilih.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {categoryDistribution.map((item) => {
                    const isSelected = selectedFocusArea === item.key;
                    return (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() =>
                          setSelectedFocusArea(selectedFocusArea === item.key ? "ALL" : item.key)
                        }
                        className={`p-3 rounded-2xl text-left transition-all space-y-2 cursor-pointer border ${isSelected
                          ? "bg-[#EDF6FF] border-[#1765F5] ring-1 ring-[#1765F5]/20"
                          : "bg-transparent border-transparent hover:bg-[#F4F9FF] hover:border-[#CBE7FD]"
                          }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-bold text-[#0A2558]">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.label}
                          </span>
                          <span className="tabular-nums text-slate-600">
                            <strong className="text-[#0A2558]">{item.count} Program</strong> &middot;{" "}
                            {formatCompact(item.totalBudget)} ({item.programShare}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.programShare}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <IndonesiaBeneficiaryMap
              programs={filteredPrograms}
              opportunities={opportunities}
              partners={partners}
              selectedSdgFilter={selectedSdgFilter}
              onSelectSdgFilter={(sdgId) => setSelectedSdgFilter(sdgId)}
              selectedProvince={selectedProvince}
              onSelectProvince={(prov) => setSelectedProvince(prov)}
              onNavigateToProgramDetail={() => onNavigateMenu("programs")}
              onNavigateToOpportunityDetail={(opp) => {
                if (onSelectOpportunityDetail) {
                  onSelectOpportunityDetail(opp);
                } else {
                  onNavigateMenu("opportunities");
                }
              }}
              onOpenCreateOpportunity={onOpenCreateOpportunity}
            />
          </div>
        )}

        {/* TAB 3: KATALOG PELUANG TERKINI */}
        {detailTab === "opportunities" && (
          <>
            {opportunities.length === 0 ? (
              <div className="py-10 px-6 rounded-3xl bg-white border border-[#DBEAFE] shadow-xs text-center space-y-4">
                <div className="mx-auto w-[140px] h-[116px] flex items-center justify-center">
                  <Image
                    src="/images/overview/overview-empty-state.png"
                    alt="Belum ada peluang CSR"
                    width={140}
                    height={116}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <p className="text-sm font-bold text-[#0A2558]">
                    Belum Ada Peluang CSR Terpublikasi
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mulai publikasikan inisiatif program perusahaan agar mitra pelaksana dapat mengajukan proposal kolaborasi.
                  </p>
                </div>
                {!isManagement && onOpenCreateOpportunity && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenCreateOpportunity()}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="text-xs rounded-full cursor-pointer"
                  >
                    Buat Peluang CSR Baru
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.slice(0, 6).map((opp) => {
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
                      className="rounded-3xl bg-white border border-[#DBEAFE] hover:border-[#93C5FD] shadow-xs transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        {opp.bannerUrl ? (
                          <div className="h-36 overflow-hidden bg-[#EDF6FF] border-b border-[#DBEAFE]">
                            <img
                              src={opp.bannerUrl}
                              alt={opp.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        ) : null}

                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant={statusCfg.variant} size="sm" hasDot={!isDraft}>
                              {statusCfg.label}
                            </Badge>
                            <span className="text-[11px] font-medium text-slate-600">
                              {focus.label}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-[#0A2558] line-clamp-2 leading-snug">
                            {opp.title}
                          </h3>

                          <div className="pt-2.5 border-t border-[#EDF6FF] flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[11px] text-slate-600 block">Alokasi</span>
                              <span className="font-bold text-[#047857] tabular-nums">
                                {formatCompact(parseFloat(opp.estimatedBudget || "0") || 0)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-slate-600 block">Lokasi</span>
                              <span className="font-medium text-[#0A2558] flex items-center gap-1 justify-end">
                                <MapPin className="w-3 h-3 text-[#1765F5]" />
                                {opp.targetCity || opp.targetProvince || "Nasional"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectOpportunityDetail(opp)}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-[#1765F5]" />}
                          className="w-full text-xs font-semibold rounded-full cursor-pointer"
                        >
                          Buka Detail
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
