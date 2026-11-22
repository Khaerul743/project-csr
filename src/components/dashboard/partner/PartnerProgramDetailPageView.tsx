"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Activity,
  Calendar,
  Users,
  Building2,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Sparkles,
  Check,
  FileText,
  Wallet,
  MessageSquare,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Sprout,
  GraduationCap,
  ShieldAlert,
  Layers,
  TrendingUp,
  HeartPulse,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerProgramItem } from "./types";
import {
  PROGRAM_STATUS_CONFIG,
  FOCUS_AREA_CONFIG,
  formatRupiah,
  formatDate,
  formatCurrencyInput,
  parseCurrencyInput,
  cleanProposalText,
} from "./helpers";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { ProgramStatus } from "@/db/schema/programs";
import { ActivityTimeline } from "../activities/ActivityTimeline";
import { BeneficiaryReviewsTab } from "../reviews/BeneficiaryReviewsTab";
import { ProgramFinancesTab } from "../finances/ProgramFinancesTab";
import { EsgSustainabilityReportTab } from "../company/programs/EsgSustainabilityReportTab";
import { CompanyProgramItem } from "../company/types";

function getProgramCategoryVisual(focusArea: string | undefined | null) {
  switch (focusArea) {
    case "LINGKUNGAN":
    case "LINGKUNGAN_HIDUP":
      return {
        label: "Lingkungan & Alam",
        icon: Sprout,
        thumbnailBg: "bg-emerald-50/70 border border-emerald-100",
        iconColor: "text-emerald-700",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
      };
    case "PENDIDIKAN":
      return {
        label: "Pendidikan",
        icon: GraduationCap,
        thumbnailBg: "bg-indigo-50/70 border border-indigo-100",
        iconColor: "text-indigo-700",
        badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200/70",
      };
    case "KESEHATAN":
      return {
        label: "Kesehatan",
        icon: HeartPulse,
        thumbnailBg: "bg-rose-50/70 border border-rose-100",
        iconColor: "text-rose-700",
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-200/70",
      };
    case "PEMBERDAYAAN_EKONOMI":
      return {
        label: "Pemberdayaan Ekonomi",
        icon: TrendingUp,
        thumbnailBg: "bg-amber-50/70 border border-amber-100",
        iconColor: "text-amber-700",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200/70",
      };
    case "INFRASTRUKTUR_SOSIAL":
      return {
        label: "Infrastruktur Sosial",
        icon: Building2,
        thumbnailBg: "bg-sky-50/70 border border-sky-100",
        iconColor: "text-sky-700",
        badgeClass: "bg-sky-50 text-sky-700 border border-sky-200/70",
      };
    case "TANGGAP_BENCANA":
      return {
        label: "Tanggap Bencana",
        icon: ShieldAlert,
        thumbnailBg: "bg-orange-50/70 border border-orange-100",
        iconColor: "text-orange-700",
        badgeClass: "bg-orange-50 text-orange-700 border border-orange-200/70",
      };
    default:
      return {
        label: "Inisiatif Umum",
        icon: Layers,
        thumbnailBg: "bg-slate-50 border border-slate-200/80",
        iconColor: "text-slate-700",
        badgeClass: "bg-slate-50 text-slate-700 border border-slate-200/70",
      };
  }
}

function cleanProgramDescription(desc?: string | null, title?: string): string {
  if (!desc) return "";
  let cleaned = desc.trim();
  cleaned = cleaned.replace(/^Program\s*["'][^"']+["']\s*(?:adalah|dirancang untuk|merupakan)?\s*/i, "Dirancang untuk ");
  if (title) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\interface PartnerProgramDetailPageViewProps {");
    cleaned = cleaned.replace(new RegExp(`^["']?${escaped}["']?\\s*(?:adalah|dirancang untuk|merupakan)?\\s*`, "i"), "Dirancang untuk ");
  }
  return cleaned;
}

interface PartnerProgramDetailPageViewProps {
  program: PartnerProgramItem;
  onBack: () => void;
  onProgramUpdated?: () => void;
  onOpenChat?: (collabId?: string | null) => void;
  initialTab?: "activities" | "finances" | "reviews" | "esg-report" | "settings";
}

export function PartnerProgramDetailPageView({
  program: initialProgram,
  onBack,
  onProgramUpdated,
  onOpenChat,
  initialTab,
}: PartnerProgramDetailPageViewProps) {
  const [currentProgram, setCurrentProgram] = useState<PartnerProgramItem>(initialProgram);
  const [activeTab, setActiveTab] = useState<
    "activities" | "finances" | "reviews" | "esg-report" | "settings"
  >(initialTab || "activities");
  const [companyLogoError, setCompanyLogoError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Status & Progress update form state
  const [status, setStatus] = useState<ProgramStatus>(initialProgram.status);
  const [spentBudget, setSpentBudget] = useState(
    initialProgram.spentBudget ? String(parseFloat(initialProgram.spentBudget)) : "0"
  );
  const [actualBeneficiaries, setActualBeneficiaries] = useState(
    initialProgram.actualBeneficiaries || ""
  );
  const [description, setDescription] = useState(initialProgram.description || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync if prop changes
  useEffect(() => {
    setCurrentProgram(initialProgram);
    setStatus(initialProgram.status);
    setSpentBudget(
      initialProgram.spentBudget ? String(parseFloat(initialProgram.spentBudget)) : "0"
    );
    setActualBeneficiaries(initialProgram.actualBeneficiaries || "");
    setDescription(initialProgram.description || "");
    setCompanyLogoError(false);
    setIsDescriptionExpanded(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialProgram]);

  useEffect(() => {
    const handleNavigateTabEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: string }>;
      if (customEvent.detail?.tab === "finances") {
        setActiveTab("finances");
      }
    };
    window.addEventListener("sipena:navigate-program-tab", handleNavigateTabEvent);
    return () => window.removeEventListener("sipena:navigate-program-tab", handleNavigateTabEvent);
  }, []);

  const program = currentProgram;

  const statusConfig = PROGRAM_STATUS_CONFIG[program.status] || {
    label: program.status,
    variant: "slate" as const,
  };

  const focusConfig = program.focusArea
    ? FOCUS_AREA_CONFIG[program.focusArea as CsrFocusArea]
    : null;

  const categoryConfig = getProgramCategoryVisual(program.focusArea);
  const CategoryIcon = categoryConfig.icon;

  const totalBudgetNum = parseFloat(program.budget || "0") || 1;
  const currentSpentNum = parseCurrencyInput(spentBudget);
  const progressPercent = Math.min(100, Math.round((currentSpentNum / totalBudgetNum) * 100));

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Silakan login kembali.");

      const res = await fetch(`/api/programs/${program.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          spentBudget: parseCurrencyInput(spentBudget),
          actualBeneficiaries: actualBeneficiaries.trim() || null,
          description: description.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui status pelaksanaan program");
      }

      setSuccessMsg("Laporan kemajuan dan status pelaksanaan program berhasil disimpan!");

      // Update local state
      setCurrentProgram((prev) => ({
        ...prev,
        status,
        spentBudget: String(spentBudget),
        actualBeneficiaries: actualBeneficiaries.trim() || null,
        description: description.trim() || null,
        updatedAt: new Date().toISOString(),
      }));

      if (onProgramUpdated) {
        onProgramUpdated();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan pembaruan program");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* 1. TOP NAVIGATION ROW (Kembali & Status Pelaksanaan)         */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs font-bold text-[#181343] hover:text-[#047857] border-[#E5E7EB] hover:border-emerald-300 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Kembali ke Daftar Program
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant={statusConfig.variant} size="md" hasDot className="shadow-2xs">
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PROGRAM IDENTITY BANNER (Sesuai Referensi Visual)        */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          {/* Sisi Kiri: Foto/Logo Perusahaan Sponsor & Info Program */}
          <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
            {/* Foto/Logo Profil Perusahaan Sponsor */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200/90 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden transition-transform hover:scale-105">
              {program.companyLogo && !companyLogoError ? (
                <img
                  src={program.companyLogo}
                  alt={program.companyName || "Perusahaan Donor"}
                  onError={() => setCompanyLogoError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-2 text-center select-none">
                  <Building2 className="w-8 h-8 sm:w-9 sm:h-9 text-[#181343]/60 mb-0.5" />
                  <span className="text-[11px] font-black text-[#181343] tracking-wider uppercase truncate max-w-full px-1">
                    {(program.companyName || "CP").substring(0, 3)}
                  </span>
                </div>
              )}
            </div>

            {/* Info Block */}
            <div className="space-y-2 flex-1 min-w-0">
              {/* Badges & Meta Pill Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg">
                  <CategoryIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{categoryConfig.label}</span>
                </span>

                <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {program.targetCity
                    ? `${program.targetCity}${program.targetProvince ? `, ${program.targetProvince}` : ""}`
                    : "Wilayah Sasaran"}
                </span>

                <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {program.startDate && program.endDate
                    ? `${formatDate(program.startDate)} s/d ${formatDate(program.endDate)}`
                    : program.startDate
                    ? `Mulai ${formatDate(program.startDate)}`
                    : "Periode Pelaksanaan"}
                </span>
              </div>

              {/* Main Heading: Nama Program */}
              <h1
                className="text-lg sm:text-xl md:text-2xl font-bold text-[#181343] tracking-tight leading-snug max-w-2xl sm:max-w-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {cleanProposalText(program.title)}
              </h1>

              {/* Meta: Perusahaan Sponsor & MoU Status */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                <div className="flex items-center gap-1.5 font-bold text-[#181343]">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{program.companyName || "Perusahaan Sponsor"}</span>
                </div>

                <span className="text-slate-300">•</span>

                <span
                  className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-md ${
                    program.collaborationMouUrl
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200/80"
                      : "text-amber-700 bg-amber-50 border border-amber-200/80"
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>{program.collaborationMouUrl ? "MoU Telah Disepakati" : "MoU Dalam Pengesahan"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Berkas MoU jika tersedia */}
          {program.collaborationMouUrl && (
            <div className="flex flex-row md:flex-col items-center sm:items-stretch gap-2.5 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <a
                href={program.collaborationMouUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#181343] hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Berkas MoU</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          )}
        </div>

        {/* Ringkasan Deskripsi Program (Maksimal 2-3 baris dengan Opsi Lihat Selengkapnya) */}
        {program.description && (
          <div className="pt-3.5 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
            <p className={isDescriptionExpanded ? "whitespace-pre-line" : "line-clamp-2"}>
              {cleanProgramDescription(program.description, program.title)}
            </p>

            {program.opportunityTitle && isDescriptionExpanded && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="text-slate-400 font-medium">Inisiatif Asal Proposal:</span>
                <strong className="text-slate-700">{program.opportunityTitle}</strong>
              </div>
            )}

            {program.description.length > 120 && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs font-bold text-[#181343] hover:text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                {isDescriptionExpanded ? (
                  <>
                    <span>Ciutkan Deskripsi</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Lihat Metodologi & Deskripsi Lengkap</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. EMPAT KPI MONITORING HORIZONTAL (Ukuran Sama, 1 Baris)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Progres Aktivitas Proposal */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#181343]/30 shadow-2xs transition-all flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Progres Aktivitas Proposal
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 text-[#181343] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4 text-[#181343]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#181343] tracking-tight tabular-nums">
              {program.activityProgressPercent ?? 0}%
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tahapan Proposal Selesai</span>
              <span className="font-bold text-[#181343] tabular-nums">
                {program.completedActivitiesCount ?? 0} / {program.totalActivitiesCount ?? 0}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#181343] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(program.activityProgressPercent ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Realisasi Dana */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#181343]/30 shadow-2xs transition-all flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Realisasi Dana
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 text-[#181343] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4 text-[#181343]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#181343] tracking-tight truncate tabular-nums">
              {formatRupiah(currentSpentNum)}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate">Pagu: {formatRupiah(program.budget)}</span>
              <span className="font-bold text-[#181343] shrink-0 tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#181343] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Laporan Menunggu Verifikasi */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#181343]/30 shadow-2xs transition-all flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Laporan Menunggu Verifikasi
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 text-[#181343] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4 text-[#181343]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#181343] tracking-tight tabular-nums">
              {program.pendingVerificationCount ?? 0}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status Verifikasi:</span>
            <span
              className={`font-bold ${(program.pendingVerificationCount ?? 0) > 0
                ? "text-amber-700"
                : "text-[#181343]"
                }`}
            >
              {(program.pendingVerificationCount ?? 0) > 0
                ? `${program.pendingVerificationCount} Perlu Pemeriksaan`
                : "Semua Tertib"}
            </span>
          </div>
        </div>

        {/* KPI 4: Penerima Manfaat Aktual */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#181343]/30 shadow-2xs transition-all flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Penerima Manfaat Aktual
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 text-[#181343] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4 text-[#181343]" />
              </div>
            </div>
            <div className="text-base font-black text-[#181343] line-clamp-2 min-h-[32px] flex items-center">
              {program.actualBeneficiaries || (
                <span className="text-xs font-normal text-slate-400 italic">Belum dilaporkan</span>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target Kesepakatan:</span>
            <span className="font-bold text-[#181343] truncate max-w-[140px]">
              {program.targetBeneficiaries || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. FULL-WIDTH TABS NAVIGATION                                */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
        {/* Navigation Bar (Seragam dengan role CSR Admin: tanpa ikon, border active navy) */}
        <div className="px-6 border-b border-[#E8E8EA] flex items-center gap-4 sm:gap-7 bg-[#F9F9FB] overflow-x-auto scrollbar-none select-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("activities")}
            className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "activities"
                ? "border-[#181343] text-[#181343] font-extrabold"
                : "border-transparent text-slate-500 hover:text-[#181343]"
            }`}
          >
            Log &amp; Timeline Bukti Lapangan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("finances")}
            className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "finances"
                ? "border-[#181343] text-[#181343] font-extrabold"
                : "border-transparent text-slate-500 hover:text-[#181343]"
            }`}
          >
            Realisasi Dana &amp; Audit Keuangan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "reviews"
                ? "border-[#181343] text-[#181343] font-extrabold"
                : "border-transparent text-slate-500 hover:text-[#181343]"
            }`}
          >
            Suara &amp; Ulasan Penerima Manfaat
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("esg-report")}
            className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "esg-report"
                ? "border-[#181343] text-[#181343] font-extrabold"
                : "border-transparent text-slate-500 hover:text-[#181343]"
            }`}
          >
            Laporan Keberlanjutan &amp; ESG (AI)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "settings"
                ? "border-[#181343] text-[#181343] font-extrabold"
                : "border-transparent text-slate-500 hover:text-[#181343]"
            }`}
          >
            Parameter &amp; Evaluasi Status
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-7">
          {activeTab === "activities" && (
            <ActivityTimeline
              programId={program.id}
              programTitle={program.title}
              role="PARTNER"
              collaborationId={program.collaborationId}
              onOpenChat={onOpenChat}
              onNavigateToFinances={() => setActiveTab("finances")}
              onActivityChanged={onProgramUpdated}
            />
          )}

          {activeTab === "finances" && (
            <ProgramFinancesTab
              programId={program.id}
              programTitle={program.title}
              agreedBudget={program.budget || "0"}
              role="PARTNER"
              onFinancesUpdated={onProgramUpdated}
            />
          )}

          {activeTab === "reviews" && (
            <BeneficiaryReviewsTab
              programId={program.id}
              programTitle={program.title}
            />
          )}

          {activeTab === "esg-report" && (
            <EsgSustainabilityReportTab
              program={program as unknown as CompanyProgramItem}
              onProgramUpdated={onProgramUpdated}
            />
          )}

          {activeTab === "settings" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#181343]">
                  Laporan Kemajuan &amp; Evaluasi Lapangan Mitra
                </h3>
                <p className="text-xs text-[#787680]">
                  Perbarui status siklus pelaksanaan di lapangan, laporkan serapan anggaran riil, dan kirimkan catatan kemajuan berkala kepada perusahaan donor.
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateStatus} className="space-y-6">
                {/* Status Selection Cards */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-[#181343] block">
                    Tahapan Siklus Pelaksanaan di Lapangan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {(["PLANNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"] as ProgramStatus[]).map((st) => {
                      const cfg = PROGRAM_STATUS_CONFIG[st];
                      const isSelected = status === st;
                      return (
                        <button
                          type="button"
                          key={st}
                          onClick={() => setStatus(st)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                            ? "border-[#009E75] bg-emerald-50/80 text-emerald-950 shadow-xs ring-1 ring-[#009E75]"
                            : "border-[#E8E8EA] bg-white text-[#47464F] hover:border-emerald-300"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold">{cfg.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#009E75]" />}
                          </div>
                          <span className="text-[10px] text-[#787680]">
                            {st === "PLANNED" && "Persiapan awal kegiatan"}
                            {st === "IN_PROGRESS" && "Aktif berjalan di lapangan"}
                            {st === "COMPLETED" && "Selesai & laporan tuntas"}
                            {st === "ON_HOLD" && "Ditunda sementara"}
                            {st === "CANCELLED" && "Dibatalkan pelaksanaan"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Two Column Metric Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#181343] block">
                      Realisasi Serapan Anggaran Lapangan (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#787680]">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={formatCurrencyInput(spentBudget)}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^\d]/g, "");
                          setSpentBudget(clean);
                        }}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E8EA] text-xs font-bold text-[#181343] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <span className="text-[11px] text-[#787680] block">
                      Pagu kesepakatan MoU: <strong>{formatRupiah(program.budget)}</strong>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#181343] block">
                      Realisasi Penerima Manfaat Terjangkau
                    </label>
                    <input
                      type="text"
                      value={actualBeneficiaries}
                      onChange={(e) => setActualBeneficiaries(e.target.value)}
                      placeholder="Contoh: 150 KK Petani & 40 Anak Sekolah Dasar"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8EA] text-xs text-[#181343] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <span className="text-[11px] text-[#787680] block">
                      Target kesepakatan: <strong>{program.targetBeneficiaries || "-"}</strong>
                    </span>
                  </div>
                </div>

                {/* Description & Evaluation Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#181343] block">
                    Catatan Progres Lapangan &amp; Milestone Terbaru
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Tuliskan capaian kegiatan lapangan, milestone yang telah diselesaikan, tantangan, atau rekomendasi perbaikan..."
                    className="w-full p-4 rounded-2xl border border-[#E8E8EA] text-xs text-[#181343] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed resize-none transition-all"
                  />
                </div>

                {/* Submit Row */}
                <div className="pt-4 border-t border-[#E8E8EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-[#787680] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    Laporan ini akan otomatis tersinkronisasi dan dapat ditinjau oleh perusahaan donor.
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                    leftIcon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    className="min-h-[44px] text-xs py-2.5 px-5 cursor-pointer font-semibold self-end sm:self-auto"
                  >
                    {isSubmitting ? "Menyimpan Laporan..." : "Kirim Laporan Progres"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

