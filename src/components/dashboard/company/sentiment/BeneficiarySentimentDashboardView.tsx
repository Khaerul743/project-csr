"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  Building2,
  Users,
  MapPin,
  HeartHandshake,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  MessageSquare,
  Clock,
  Layers,
  Calendar,
  Leaf,
  Award,
  AlertCircle,
  PieChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CompanyBeneficiarySentimentOverviewResponse,
  ProgramSentimentScorecardItem,
  EnrichedBeneficiaryReviewItem,
} from "@/modules/reviews/review.interface";
import { CompanyProgramItem, CompanyProfile } from "../types";
import { FOCUS_AREA_CONFIG, formatDate } from "../helpers";

interface BeneficiarySentimentDashboardViewProps {
  company: CompanyProfile | null;
  onSelectProgram?: (programId: string, initialTab?: "reviews" | "activities" | "finances" | "esg-report") => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function BeneficiarySentimentDashboardView({
  company,
  onSelectProgram,
  onRefresh,
  isLoading = false,
}: BeneficiarySentimentDashboardViewProps) {
  const [data, setData] = useState<CompanyBeneficiarySentimentOverviewResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<"ALL" | "POSITIVE" | "NEUTRAL" | "NEGATIVE">("ALL");
  const [selectedFocusFilter, setSelectedFocusFilter] = useState<string>("ALL");

  // 1. Fetch Company-wide Beneficiary Sentiment
  const fetchSentimentOverview = useCallback(async () => {
    try {
      setIsFetching(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const res = await fetch("/api/companies/current/beneficiary-sentiment", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal memuat overview sentimen warga:", err);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchSentimentOverview();
  }, [fetchSentimentOverview]);

  const handleRefreshAll = async () => {
    if (onRefresh) onRefresh();
    await fetchSentimentOverview();
  };

  // 3. Filtered Programs Scorecards
  const filteredPrograms = useMemo(() => {
    if (!data?.programs) return [];
    return data.programs.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.partnerName && p.partnerName.toLowerCase().includes(q)) ||
        (p.targetCity && p.targetCity.toLowerCase().includes(q));

      const matchSentiment =
        selectedSentimentFilter === "ALL" || p.overallSentiment === selectedSentimentFilter;

      const matchFocus =
        selectedFocusFilter === "ALL" || p.focusArea === selectedFocusFilter;

      return matchSearch && matchSentiment && matchFocus;
    });
  }, [data?.programs, searchQuery, selectedSentimentFilter, selectedFocusFilter]);

  // 4. Filtered Recent Reviews
  const filteredReviews = useMemo(() => {
    if (!data?.recentReviews) return [];
    return data.recentReviews.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.reviewerName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.programTitle.toLowerCase().includes(q);

      const matchSentiment =
        selectedSentimentFilter === "ALL" || r.sentiment === selectedSentimentFilter;

      return matchSearch && matchSentiment;
    });
  }, [data?.recentReviews, searchQuery, selectedSentimentFilter]);

  // 5. Export CSV
  const handleExportCsv = () => {
    if (!data?.recentReviews || data.recentReviews.length === 0) return;

    const headers = [
      "Nama Penilai",
      "Peran / Profesi",
      "Kota / Wilayah",
      "Program CSR",
      "Mitra Pelaksana",
      "Rating Bintang",
      "Sentimen AI",
      "Komentar / Aspirasi",
      "Tanggal",
    ];

    const rows = data.recentReviews.map((r) => [
      `"${(r.reviewerName || "Warga").replace(/"/g, '""')}"`,
      `"${(r.reviewerRole || "").replace(/"/g, '""')}"`,
      `"${(r.reviewerCity || r.targetCity || "Indonesia").replace(/"/g, '""')}"`,
      `"${r.programTitle.replace(/"/g, '""')}"`,
      `"${(r.partnerName || "Mitra").replace(/"/g, '""')}"`,
      r.rating,
      `"${r.sentiment || "NEUTRAL"}"`,
      `"${r.comment.replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Intelijen_Sentimen_Warga_${company?.name || "Perusahaan"}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = data?.summary || {
    totalReviews: 0,
    averageRating: 0,
    netSentimentScore: 0,
    positivePercentage: 0,
    neutralPercentage: 0,
    criticalPercentage: 0,
    overallSentiment: "NEUTRAL" as const,
    analyzedProgramsCount: 0,
    totalProgramsCount: 0,
  };

  // Agregasi Rating Bintang (1 s.d 5 Bintang)
  const ratingDistribution = useMemo(() => {
    if (data?.summary?.ratingDistribution) {
      return data.summary.ratingDistribution;
    }
    const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const reviews = data?.recentReviews || [];
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [data]);

  const starSpectrum = useMemo(() => {
    const dist = ratingDistribution;
    const total = summary.totalReviews || 1;
    return [
      {
        star: 5,
        label: "Sangat Puas",
        count: dist[5] || 0,
        percentage: summary.totalReviews > 0 ? Math.round(((dist[5] || 0) / total) * 100) : 0,
        gradient: "bg-emerald-500",
      },
      {
        star: 4,
        label: "Puas",
        count: dist[4] || 0,
        percentage: summary.totalReviews > 0 ? Math.round(((dist[4] || 0) / total) * 100) : 0,
        gradient: "bg-teal-500",
      },
      {
        star: 3,
        label: "Cukup",
        count: dist[3] || 0,
        percentage: summary.totalReviews > 0 ? Math.round(((dist[3] || 0) / total) * 100) : 0,
        gradient: "bg-blue-500",
      },
      {
        star: 2,
        label: "Kurang",
        count: dist[2] || 0,
        percentage: summary.totalReviews > 0 ? Math.round(((dist[2] || 0) / total) * 100) : 0,
        gradient: "bg-amber-500",
      },
      {
        star: 1,
        label: "Kritis",
        count: dist[1] || 0,
        percentage: summary.totalReviews > 0 ? Math.round(((dist[1] || 0) / total) * 100) : 0,
        gradient: "bg-rose-500",
      },
    ];
  }, [ratingDistribution, summary.totalReviews]);

  // Persentase akumulasi ulasan puas (4-5 bintang)
  const highSatisfactionPercentage = useMemo(() => {
    if (summary.totalReviews === 0) return 0;
    const count4and5 = (ratingDistribution[5] || 0) + (ratingDistribution[4] || 0);
    return Math.round((count4and5 / summary.totalReviews) * 100);
  }, [ratingDistribution, summary.totalReviews]);

  // Agregasi Komparasi Sentimen per Sektor CSR
  const sectorComparison = useMemo(() => {
    if (data?.sectorComparison && data.sectorComparison.length > 0) {
      return data.sectorComparison;
    }
    if (!data?.programs || data.programs.length === 0) return [];

    const map = new Map<
      string,
      {
        focusArea: string;
        focusAreaLabel: string;
        programCount: number;
        totalReviews: number;
        sumRating: number;
        positiveCount: number;
        neutralCount: number;
        criticalCount: number;
      }
    >();

    for (const prog of data.programs) {
      const fa = prog.focusArea;
      if (!map.has(fa)) {
        const conf = (FOCUS_AREA_CONFIG as any)[fa];
        map.set(fa, {
          focusArea: fa,
          focusAreaLabel: conf?.label || fa,
          programCount: 0,
          totalReviews: 0,
          sumRating: 0,
          positiveCount: 0,
          neutralCount: 0,
          criticalCount: 0,
        });
      }
      map.get(fa)!.programCount += 1;
    }

    const reviews = data.recentReviews || [];
    for (const r of reviews) {
      const prog = data.programs.find((p) => p.id === r.programId);
      if (!prog) continue;
      const sec = map.get(prog.focusArea);
      if (sec) {
        sec.totalReviews += 1;
        sec.sumRating += r.rating;
        if (r.sentiment === "POSITIVE") sec.positiveCount += 1;
        else if (r.sentiment === "NEGATIVE") sec.criticalCount += 1;
        else sec.neutralCount += 1;
      }
    }

    const result = Array.from(map.values()).map((s) => {
      const posPct = s.totalReviews > 0 ? Math.round((s.positiveCount / s.totalReviews) * 100) : 0;
      const critPct = s.totalReviews > 0 ? Math.round((s.criticalCount / s.totalReviews) * 100) : 0;
      const neuPct = s.totalReviews > 0 ? Math.max(0, 100 - posPct - critPct) : 0;
      const nss = posPct - critPct;
      const avg = s.totalReviews > 0 ? Number((s.sumRating / s.totalReviews).toFixed(1)) : 0;
      return {
        focusArea: s.focusArea,
        focusAreaLabel: s.focusAreaLabel,
        programCount: s.programCount,
        totalReviews: s.totalReviews,
        averageRating: avg,
        netSentimentScore: nss,
        positiveCount: s.positiveCount,
        neutralCount: s.neutralCount,
        criticalCount: s.criticalCount,
        positivePercentage: posPct,
        neutralPercentage: neuPct,
        criticalPercentage: critPct,
      };
    });

    result.sort((a, b) => b.totalReviews - a.totalReviews || b.programCount - a.programCount);
    return result;
  }, [data]);

  // SVG Donut Constants
  const donutRadius = 58;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~364.425
  const posArcLength = (summary.positivePercentage / 100) * donutCircumference;
  const neuArcLength = (summary.neutralPercentage / 100) * donutCircumference;
  const critArcLength = (summary.criticalPercentage / 100) * donutCircumference;

  const getSectorIcon = (focusArea: string) => {
    switch (focusArea) {
      case "LINGKUNGAN":
        return <Leaf className="w-4 h-4 text-emerald-600" />;
      case "PENDIDIKAN":
        return <Award className="w-4 h-4 text-blue-600" />;
      case "KESEHATAN":
        return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      case "PEMBERDAYAAN_EKONOMI":
        return <TrendingUp className="w-4 h-4 text-amber-600" />;
      case "INFRASTRUKTUR_SOSIAL":
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case "TANGGAP_BENCANA":
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  const getSectorBg = (focusArea: string) => {
    switch (focusArea) {
      case "LINGKUNGAN":
        return "bg-emerald-50 border-emerald-100 text-emerald-800";
      case "PENDIDIKAN":
        return "bg-blue-50 border-blue-100 text-blue-800";
      case "KESEHATAN":
        return "bg-rose-50 border-rose-100 text-rose-800";
      case "PEMBERDAYAAN_EKONOMI":
        return "bg-amber-50 border-amber-100 text-amber-800";
      case "INFRASTRUKTUR_SOSIAL":
        return "bg-purple-50 border-purple-100 text-purple-800";
      case "TANGGAP_BENCANA":
        return "bg-rose-50 border-rose-100 text-rose-800";
      default:
        return "bg-slate-100 border-slate-200 text-slate-800";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* 1. Header Ringkas & Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight">
            Sentimen &amp; Kepuasan Warga
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Persepsi dan ulasan langsung penerima manfaat dari program CSR yang berjalan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isLoading || isFetching}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading || isFetching ? "animate-spin" : ""}`} />}
            className="text-xs font-semibold text-slate-700 border-[#E5E7EB] cursor-pointer"
          >
            Segarkan
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!data?.recentReviews || data.recentReviews.length === 0}
            leftIcon={<Download className="w-3.5 h-3.5 text-[#059669]" />}
            className="text-xs font-semibold text-[#181343] hover:bg-slate-50 border-[#E5E7EB] cursor-pointer"
          >
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* 2. 4 Kartu KPI Sentimen yang Lega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Net Sentiment Score</span>
            <TrendingUp className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#059669] tabular-nums">
              {summary.netSentimentScore >= 0 ? `+${summary.netSentimentScore}` : summary.netSentimentScore}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {summary.netSentimentScore >= 30
                ? "Sangat Positif"
                : summary.netSentimentScore >= 0
                ? "Positif"
                : "Perhatian"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {summary.positivePercentage}% positif dibanding {summary.criticalPercentage}% kritis
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Proporsi Positif</span>
            <ThumbsUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-[#181343] tabular-nums">
            {summary.positivePercentage}%
          </div>
          <p className="text-xs text-slate-500">
            {summary.neutralPercentage}% netral &middot; {summary.criticalPercentage}% kritis
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Rating Kepuasan</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#181343] tabular-nums">
              {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "0.0"}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-500">
            Dari {summary.totalReviews} ulasan penerima manfaat
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Cakupan Program</span>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#181343] tabular-nums">
              {summary.analyzedProgramsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              / {summary.totalProgramsCount} program
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Program dengan data feedback komunitas
          </p>
        </div>
      </div>

      {/* 3. Visual Charts & Intelligence */}
      <div className="space-y-4">
        {/* Row 1: 2 Kolom (Donut & NSS Meter + Star Rating Spectrum) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Donut Sentimen & Net Sentiment Meter */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
                    <PieChart className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#181343]">
                    Rasio Sentimen &amp; Net Sentiment Meter
                  </h3>
                </div>
                <Badge variant="emerald" size="sm">
                  {summary.totalReviews} Ulasan Warga
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Proporsi klasifikasi ulasan komunitas dan skor kepuasan bersih kumulatif.
              </p>
            </div>

            {/* Donut & Legend Content */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              {/* SVG Donut Graphic */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                  {/* Background Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    stroke="#F1F5F9"
                    strokeWidth="15"
                    fill="none"
                  />
                  {summary.totalReviews > 0 ? (
                    <>
                      {/* Positif Arc */}
                      <circle
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        stroke="#10B981"
                        strokeWidth="15"
                        strokeLinecap="round"
                        strokeDasharray={`${posArcLength} ${donutCircumference}`}
                        strokeDashoffset="0"
                        fill="none"
                        className="transition-all duration-700 ease-out"
                      />
                      {/* Netral Arc */}
                      <circle
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        stroke="#3B82F6"
                        strokeWidth="15"
                        strokeLinecap="round"
                        strokeDasharray={`${neuArcLength} ${donutCircumference}`}
                        strokeDashoffset={-posArcLength}
                        fill="none"
                        className="transition-all duration-700 ease-out"
                      />
                      {/* Kritis Arc */}
                      <circle
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        stroke="#F43F5E"
                        strokeWidth="15"
                        strokeLinecap="round"
                        strokeDasharray={`${critArcLength} ${donutCircumference}`}
                        strokeDashoffset={-(posArcLength + neuArcLength)}
                        fill="none"
                        className="transition-all duration-700 ease-out"
                      />
                    </>
                  ) : (
                    <circle
                      cx="80"
                      cy="80"
                      r={donutRadius}
                      stroke="#E2E8F0"
                      strokeWidth="15"
                      fill="none"
                    />
                  )}
                </svg>

                {/* Center Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Skor NSS
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight leading-tight">
                    {summary.netSentimentScore >= 0 ? `+${summary.netSentimentScore}` : summary.netSentimentScore}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full mt-0.5 ${
                      summary.netSentimentScore >= 30
                        ? "bg-emerald-100 text-emerald-800"
                        : summary.netSentimentScore >= 0
                        ? "bg-blue-100 text-blue-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {summary.netSentimentScore >= 30
                      ? "Sangat Positif"
                      : summary.netSentimentScore >= 0
                      ? "Cukup Positif"
                      : "Perlu Perhatian"}
                  </span>
                </div>
              </div>

              {/* Legend & Breakdown Details */}
              <div className="flex-1 w-full space-y-2.5">
                {/* Positif */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      Positif (Puas &amp; Terbantu)
                    </span>
                    <span className="font-bold text-emerald-700">{summary.positivePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${summary.positivePercentage}%` }}
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Netral */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      Netral (Informatif &amp; Saran)
                    </span>
                    <span className="font-bold text-blue-700">{summary.neutralPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${summary.neutralPercentage}%` }}
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Kritis */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      Kritis (Keluhan Lapangan)
                    </span>
                    <span className="font-bold text-rose-700">{summary.criticalPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${summary.criticalPercentage}%` }}
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory Caption */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                NSS mengukur selisih sentimen positif terhadap kritik warga (skala -100 s.d +100).
              </span>
            </div>
          </div>

          {/* Chart 2: Distribusi Spektrum Rating Bintang */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#181343]">
                    Distribusi Spektrum Rating Bintang
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Rata-rata {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "0.0"} / 5.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Komposisi evaluasi kuantitatif kepuasan masyarakat dari skala 1 s.d 5 bintang.
              </p>
            </div>

            {/* Top Rating Summary Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-amber-50/50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight">
                  {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "0.0"}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(summary.averageRating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Dari total {summary.totalReviews} ulasan terdata
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                  {highSatisfactionPercentage}% Kepuasan Tinggi
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Rating 4 &amp; 5 Bintang</p>
              </div>
            </div>

            {/* Horizontal Star Breakdown */}
            <div className="space-y-2 py-1">
              {starSpectrum.map(({ star, label, count, percentage, gradient }) => (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center justify-between w-24 shrink-0 font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span>{star}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {label}
                    </span>
                  </div>

                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative shadow-inner">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${gradient}`}
                    />
                  </div>

                  <div className="w-20 text-right shrink-0 text-slate-500 text-[11px]">
                    <span className="font-bold text-[#181343]">{count}</span>{" "}
                    <span className="text-slate-400">({percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Insight */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 truncate">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {highSatisfactionPercentage >= 70
                  ? "Apresiasi warga dominan positif pada inisiatif CSR yang terealisasi."
                  : "Perlu pemantauan intensif pada program yang menerima ulasan kritis."}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Full Width Komparasi Sentimen per Sektor CSR */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#181343]">
                  Komparasi Sentimen per Sektor CSR
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Peta komparasi persepsi penerima manfaat dan skor kepuasan bersih lintas pilar inisiatif program CSR.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge variant="blue" size="sm">
                {sectorComparison.length} Bidang Fokus CSR
              </Badge>
            </div>
          </div>

          {sectorComparison.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Belum ada data sektor CSR yang terhubung dengan program aktif.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {sectorComparison.map((sec) => (
                <div
                  key={sec.focusArea}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-teal-200 transition space-y-3"
                >
                  {/* Sector Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${getSectorBg(sec.focusArea)}`}>
                        {getSectorIcon(sec.focusArea)}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-[#181343] block">
                          {sec.focusAreaLabel}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{sec.programCount} Program</span>
                          <span>•</span>
                          <span>{sec.totalReviews} Ulasan Warga</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {sec.totalReviews > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{sec.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                          sec.totalReviews === 0
                            ? "bg-slate-100 text-slate-500 border-slate-200"
                            : sec.netSentimentScore >= 30
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : sec.netSentimentScore >= 0
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {sec.totalReviews === 0
                          ? "NSS -"
                          : `NSS ${sec.netSentimentScore >= 0 ? `+${sec.netSentimentScore}` : sec.netSentimentScore}`}
                      </span>
                    </div>
                  </div>

                  {/* 3-Segment Horizontal Stacked Bar */}
                  {sec.totalReviews > 0 ? (
                    <div className="space-y-1.5">
                      <div className="w-full bg-slate-200/70 h-3 rounded-full overflow-hidden flex shadow-inner">
                        <div
                          style={{ width: `${sec.positivePercentage}%` }}
                          className="bg-emerald-500 h-full transition-all duration-500"
                          title={`${sec.positivePercentage}% Positif (${sec.positiveCount} ulasan)`}
                        />
                        <div
                          style={{ width: `${sec.neutralPercentage}%` }}
                          className="bg-blue-500 h-full transition-all duration-500"
                          title={`${sec.neutralPercentage}% Netral (${sec.neutralCount} ulasan)`}
                        />
                        <div
                          style={{ width: `${sec.criticalPercentage}%` }}
                          className="bg-rose-500 h-full transition-all duration-500"
                          title={`${sec.criticalPercentage}% Kritis (${sec.criticalCount} ulasan)`}
                        />
                      </div>

                      {/* Stacked Bar Legend */}
                      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>{sec.positivePercentage}% Positif</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span>{sec.neutralPercentage}% Netral</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          <span>{sec.criticalPercentage}% Kritis</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 px-3 rounded-lg bg-slate-100/70 border border-slate-200/50 text-[11px] text-slate-400 italic text-center">
                      Belum ada ulasan masyarakat yang terekam pada pilar ini.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Panel Sintesis Eksekutif & Temuan AI */}
      {data?.executiveSummary && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#181343] via-[#1E1754] to-[#0A2E28] text-white shadow-lg space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-400/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Rangkuman Eksekutif Sentimen Masyarakat
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
              {data.executiveSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 pt-2 border-t border-white/10">
            {/* Kolom 1: Apresiasi Utama */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Hal Paling Diapresiasi</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {data.aggregatedHighlights.length > 0 ? (
                  data.aggregatedHighlights.map((hl, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Belum ada highlight khusus yang terdeteksi.</li>
                )}
              </ul>
            </div>

            {/* Kolom 2: Isu & Keluhan Lapangan */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Isu &amp; Kendala Lapangan</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {data.aggregatedConcerns.length > 0 ? (
                  data.aggregatedConcerns.map((cn, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{cn}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Tidak ada keluhan kritis yang menonjol.</li>
                )}
              </ul>
            </div>

            {/* Kolom 3: Rekomendasi Korporat */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span>Rekomendasi Tindak Lanjut</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {data.aggregatedRecommendations.length > 0 ? (
                  data.aggregatedRecommendations.map((rc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span>{rc}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Rekomendasi otomatis akan dimutakhirkan berkala.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab / Filter Pencarian */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari program, mitra, atau nama warga..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
          />
        </div>

        {/* Filter Sentimen */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Sentimen:</span>
          <button
            onClick={() => setSelectedSentimentFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedSentimentFilter === "ALL"
                ? "bg-[#181343] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedSentimentFilter("POSITIVE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              selectedSentimentFilter === "POSITIVE"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            Positif
          </button>
          <button
            onClick={() => setSelectedSentimentFilter("NEUTRAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedSentimentFilter === "NEUTRAL"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Netral
          </button>
          <button
            onClick={() => setSelectedSentimentFilter("NEGATIVE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              selectedSentimentFilter === "NEGATIVE"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <ThumbsDown className="w-3 h-3" />
            Kritis
          </button>
        </div>
      </div>

      {/* 6. Tabel Scorecard Sentimen Program CSR */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-[#181343]">
              Scorecard Sentimen per Program CSR ({filteredPrograms.length})
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi kepuasan masyarakat dan tingkat sentimen per proyek kemitraan.
            </p>
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">Tidak ada program yang sesuai dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Program CSR &amp; Wilayah</th>
                  <th className="py-3 px-3">Mitra Pelaksana</th>
                  <th className="py-3 px-3 text-center">Ulasan &amp; Rating</th>
                  <th className="py-3 px-3 text-center">Net Sentiment Score</th>
                  <th className="py-3 px-3 text-center">Sentimen Dominan</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrograms.map((prog) => {
                  const focusConfig = (FOCUS_AREA_CONFIG as any)[prog.focusArea] || {
                    label: prog.focusArea,
                    variant: "slate",
                  };

                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <span className="font-bold text-[#181343] line-clamp-1">
                            {prog.title}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Badge variant={focusConfig.variant as any} size="sm">
                              {focusConfig.label}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {prog.targetCity || "Nasional"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {prog.partnerName || "Mitra Lapangan"}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-center gap-1 font-bold text-[#181343]">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{prog.averageRating > 0 ? prog.averageRating.toFixed(1) : "-"}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {prog.totalReviews} ulasan
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`font-extrabold text-xs px-2.5 py-1 rounded-md ${
                            prog.netSentimentScore >= 30
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : prog.netSentimentScore >= 0
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {prog.netSentimentScore >= 0 ? `+${prog.netSentimentScore}` : prog.netSentimentScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            prog.overallSentiment === "POSITIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : prog.overallSentiment === "NEGATIVE"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {prog.overallSentiment === "POSITIVE"
                            ? "Positif"
                            : prog.overallSentiment === "NEGATIVE"
                            ? "Kritis"
                            : "Netral"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {onSelectProgram && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onSelectProgram(prog.id, "reviews")}
                            leftIcon={<ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />}
                            className="text-xs font-semibold text-slate-700 hover:text-teal-700 hover:border-teal-300 cursor-pointer"
                          >
                            Detail Program
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Feed Ulasan Cerdas Masyarakat */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-[#181343]">
              Suara &amp; Aspirasi Warga Lapangan ({filteredReviews.length})
            </h3>
            <p className="text-xs text-slate-500">
              Umpan balik masyarakat yang telah diklasifikasikan oleh sistem analisis sentimen.
            </p>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">Tidak ada ulasan warga yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-teal-200 transition space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-[#181343]">
                        {rev.reviewerName || "Warga Penerima Manfaat"}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {rev.reviewerRole || "Masyarakat"}{" "}
                        {rev.reviewerCity ? `, ${rev.reviewerCity}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          rev.sentiment === "POSITIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : rev.sentiment === "NEGATIVE"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {rev.sentiment === "POSITIVE"
                          ? "Positif"
                          : rev.sentiment === "NEGATIVE"
                          ? "Kritis"
                          : "Netral"}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= rev.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1 font-semibold">
                      {rev.rating}.0
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-700 leading-relaxed italic bg-white/80 p-2.5 rounded-lg border border-slate-200/50">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-medium text-slate-500 truncate max-w-[200px]" title={rev.programTitle}>
                    {rev.programTitle}
                  </span>
                  <span>
                    {rev.createdAt ? formatDate(rev.createdAt.toString()) : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
