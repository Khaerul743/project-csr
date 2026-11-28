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
  Clock,
  Check,
  Percent,
  FileText,
  Wallet,
  TrendingUp,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Sprout,
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  Layers,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyProgramItem } from "../types";
import {
  PROGRAM_STATUS_CONFIG,
  FOCUS_AREA_CONFIG,
  formatRupiah,
  formatDate,
  formatCurrencyInput,
  parseCurrencyInput,
} from "../helpers";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { ProgramStatus } from "@/db/schema/programs";
import { ActivityTimeline } from "../../activities/ActivityTimeline";
import { BeneficiaryReviewsTab } from "../../reviews/BeneficiaryReviewsTab";
import { ProgramFinancesTab } from "../../finances/ProgramFinancesTab";
import { EsgSustainabilityReportTab } from "./EsgSustainabilityReportTab";

function getProgramCategoryVisual(focusArea: string | undefined | null) {
  switch (focusArea) {
    case "LINGKUNGAN":
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

interface ProgramMonitoringDetailViewProps {
  program: CompanyProgramItem;
  onBack: () => void;
  onProgramUpdated?: () => void;
  onOpenChat?: (collabId?: string | null) => void;
  isManagement?: boolean;
  initialTab?: "activities" | "finances" | "reviews" | "esg-report" | "settings";
}

export function ProgramMonitoringDetailView({
  program: initialProgram,
  onBack,
  onProgramUpdated,
  onOpenChat,
  isManagement = false,
  initialTab,
}: ProgramMonitoringDetailViewProps) {
  const [currentProgram, setCurrentProgram] = useState<CompanyProgramItem>(initialProgram);
  const [activeTab, setActiveTab] = useState<
    "activities" | "finances" | "reviews" | "esg-report" | "settings"
  >(initialTab || "activities");
  const [partnerLogoError, setPartnerLogoError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Status & Progress update form state
  const [status, setStatus] = useState<ProgramStatus>(initialProgram.status);
  const [spentBudget, setSpentBudget] = useState(
    initialProgram.spentBudget ? String(parseFloat(initialProgram.spentBudget)) : "0"
  );
  const [actualBeneficiaries, setActualBeneficiaries] = useState(initialProgram.actualBeneficiaries || "");
  const [description, setDescription] = useState(initialProgram.description || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync if prop changes
  useEffect(() => {
    setCurrentProgram(initialProgram);
    setStatus(initialProgram.status);
    setSpentBudget(initialProgram.spentBudget ? String(parseFloat(initialProgram.spentBudget)) : "0");
    setActualBeneficiaries(initialProgram.actualBeneficiaries || "");
    setDescription(initialProgram.description || "");
    setPartnerLogoError(false);
    setIsDescriptionExpanded(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialProgram]);

  const program = currentProgram;

  const statusConfig = PROGRAM_STATUS_CONFIG[program.status] || {
    label: program.status,
    variant: "slate" as const,
  };

  const categoryConfig = getProgramCategoryVisual(program.focusArea);
  const CategoryIcon = categoryConfig.icon;

  const focusConfig = program.focusArea
    ? FOCUS_AREA_CONFIG[program.focusArea as CsrFocusArea]
    : null;

  const totalBudgetNum = parseFloat(program.budget || "0") || 1;
  const currentSpentNum = parseCurrencyInput(spentBudget);
  const progressPercent = Math.min(100, Math.round((currentSpentNum / totalBudgetNum) * 100));

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isManagement) return;
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
        throw new Error(json.message || "Gagal memperbarui status program");
      }

      setSuccessMsg("Pembaruan status dan progres program berhasil disimpan!");

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
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan pembaruan");
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
            className="text-xs font-bold text-[#0A2558] hover:text-[#10519B] border-[#E5E7EB] hover:border-blue-300 hover:bg-blue-50/60 rounded-xl transition-all cursor-pointer shadow-2xs"
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
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          {/* Sisi Kiri: Foto/Logo Mitra & Info Program */}
          <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
            {/* Foto/Logo Profil Mitra Pelaksana */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden transition-transform hover:scale-105">
              {program.partnerLogo && !partnerLogoError ? (
                <img
                  src={program.partnerLogo}
                  alt={program.partnerName || "Mitra Pelaksana"}
                  onError={() => setPartnerLogoError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-2 text-center select-none">
                  <Building2 className="w-8 h-8 sm:w-9 sm:h-9 text-[#0A2558]/60 mb-0.5" />
                  <span className="text-[11px] font-black text-[#0A2558] tracking-wider uppercase truncate max-w-full px-1">
                    {(program.partnerName || "MP").substring(0, 3)}
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
                className="text-lg sm:text-xl md:text-2xl font-bold text-[#0A2558] tracking-tight leading-snug max-w-2xl sm:max-w-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {program.title}
              </h1>

              {/* Meta: Mitra & MoU Status */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                <div className="flex items-center gap-1.5 font-bold text-[#0A2558]">
                  <Landmark className="w-3.5 h-3.5 text-slate-500" />
                  <span>{program.partnerName || "Mitra Pelaksana"}</span>
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
              {program.description}
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
                    <span>Lihat Metodologi &amp; Deskripsi Lengkap</span>
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
        <div className="p-5 rounded-2xl bg-[#F0F5FC] border border-[#D0E2F7] border-b-[3px] border-b-[#2563EB] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Progres Aktivitas Proposal
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-100/80 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4 text-[#2563EB]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#0A2558] tracking-tight">
              {program.activityProgressPercent ?? 0}%
            </div>
          </div>
          <div className="pt-3 border-t border-blue-100/70 mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tahapan Proposal Selesai</span>
              <span className="font-bold text-[#0A2558]">
                {program.completedActivitiesCount ?? 0} / {program.totalActivitiesCount ?? 0}
              </span>
            </div>
            <div className="w-full bg-blue-100/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#1D4ED8] to-[#38BDF8] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(program.activityProgressPercent ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Realisasi Dana */}
        <div className="p-5 rounded-2xl bg-[#F0F8F5] border border-[#CCE9DD] border-b-[3px] border-b-[#10B981] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Realisasi Dana
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-[#10B981] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4 text-[#10B981]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#065F46] tracking-tight truncate">
              {formatRupiah(currentSpentNum)}
            </div>
          </div>
          <div className="pt-3 border-t border-emerald-100/70 mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate">Pagu: {formatRupiah(program.budget)}</span>
              <span className="font-bold text-[#065F46] shrink-0">{progressPercent}%</span>
            </div>
            <div className="w-full bg-emerald-100/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#059669] to-[#34D399] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Laporan Menunggu Verifikasi */}
        <div className="p-5 rounded-2xl bg-[#FFFDF5] border border-[#FDE68A] border-b-[3px] border-b-[#F59E0B] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Laporan Menunggu Verifikasi
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-100/80 text-[#D97706] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4 text-[#D97706]" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 tracking-tight">
              {program.pendingVerificationCount ?? 0}
            </div>
          </div>
          <div className="pt-3 border-t border-amber-100/70 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status Verifikasi:</span>
            <span
              className={`font-bold ${(program.pendingVerificationCount ?? 0) > 0
                ? "text-amber-700"
                : "text-slate-700"
                }`}
            >
              {(program.pendingVerificationCount ?? 0) > 0
                ? `${program.pendingVerificationCount} Perlu Pemeriksaan`
                : "Semua Tertib"}
            </span>
          </div>
        </div>

        {/* KPI 4: Penerima Manfaat Aktual */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] border-b-[3px] border-b-[#10B981] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Penerima Manfaat Aktual
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-[#10B981] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4 text-[#10B981]" />
              </div>
            </div>
            <div className="text-base font-black text-[#0A2558] line-clamp-2 min-h-[32px] flex items-center">
              {program.actualBeneficiaries || (
                <span className="text-xs font-normal text-slate-400 italic">Belum dilaporkan</span>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target Kesepakatan:</span>
            <span className="font-bold text-[#0A2558] truncate max-w-[140px]">
              {program.targetBeneficiaries || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. FULL-WIDTH TABS NAVIGATION                                */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Navigation Bar */}
        <div className="px-6 border-b border-[#E5E7EB] flex items-center gap-4 sm:gap-7 bg-[#F9F9FB] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("activities")}
            className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "activities"
                ? "border-[#10519B] text-[#10519B] font-extrabold"
                : "border-transparent text-slate-500 hover:text-[#10519B]"
            }`}
          >
            Log &amp; Timeline Bukti Lapangan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("finances")}
            className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "finances"
                ? "border-[#10519B] text-[#10519B] font-extrabold"
                : "border-transparent text-slate-500 hover:text-[#10519B]"
            }`}
          >
            Realisasi Dana &amp; Audit Keuangan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "reviews"
                ? "border-[#10519B] text-[#10519B] font-extrabold"
                : "border-transparent text-slate-500 hover:text-[#10519B]"
            }`}
          >
            Suara &amp; Ulasan Penerima Manfaat
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("esg-report")}
            className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "esg-report"
                ? "border-[#10519B] text-[#10519B] font-extrabold"
                : "border-transparent text-slate-500 hover:text-[#10519B]"
            }`}
          >
            Laporan Keberlanjutan &amp; ESG (AI)
          </button>

          {!isManagement && (
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`py-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                activeTab === "settings"
                  ? "border-[#10519B] text-[#10519B] font-extrabold"
                  : "border-transparent text-slate-500 hover:text-[#10519B]"
              }`}
            >
              Parameter &amp; Evaluasi Status
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-7">
          {activeTab === "activities" && (
            <ActivityTimeline
              programId={program.id}
              programTitle={program.title}
              role="COMPANY"
              isManagement={isManagement}
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
              role="COMPANY"
              isManagement={isManagement}
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
              program={program}
              onProgramUpdated={onProgramUpdated}
              isManagement={isManagement}
            />
          )}

          {activeTab === "settings" && !isManagement && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#181343]">
                  Evaluasi &amp; Pembaruan Status Pelaksanaan Program
                </h3>
                <p className="text-xs text-[#787680]">
                  Perbarui status siklus program, input capaian riil penerima manfaat, dan simpan catatan evaluasi berkala untuk pengawasan manajemen.
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
                    Tahapan Siklus Pelaksanaan Program
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
                            ? "border-[#181343] bg-[#181343]/5 text-[#181343] shadow-xs ring-1 ring-[#181343]"
                            : "border-[#E5E7EB] bg-white text-[#47464F] hover:border-slate-300"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold">{cfg.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#181343]" />}
                          </div>
                          <span className="text-[10px] text-[#5B5966]">
                            {st === "PLANNED" && "Persiapan awal program"}
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E8EA] text-xs font-bold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343] transition-all"
                      />
                    </div>
                    <span className="text-[11px] text-[#787680] block">
                      Pagu kesepakatan MoU: <strong>{formatRupiah(program.budget)}</strong>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#181343] block">
                      Realisasi Penerima Manfaat Riil
                    </label>
                    <input
                      type="text"
                      value={actualBeneficiaries}
                      onChange={(e) => setActualBeneficiaries(e.target.value)}
                      placeholder="Contoh: 150 KK Petani & 40 Anak Sekolah Dasar"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8EA] text-xs text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343] transition-all"
                    />
                    <span className="text-[11px] text-[#787680] block">
                      Target kesepakatan: <strong>{program.targetBeneficiaries || "-"}</strong>
                    </span>
                  </div>
                </div>

                {/* Description & Evaluation Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#181343] block">
                    Catatan Evaluasi &amp; Perkembangan Monitoring Lapangan
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Tuliskan catatan perkembangan kegiatan lapangan, kepatuhan jadwal, tantangan yang dihadapi, atau rekomendasi perbaikan..."
                    className="w-full p-4 rounded-2xl border border-[#E8E8EA] text-xs text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343] leading-relaxed resize-none transition-all"
                  />
                </div>

                {/* Submit Row */}
                <div className="pt-4 border-t border-[#E8E8EA] flex items-center justify-between">
                  <span className="text-xs text-[#787680] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#181343]" />
                    Pembaruan ini akan otomatis tersinkronisasi pada laporan ESG eksekutif.
                  </span>
                  {!isManagement && (
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSubmitting}
                      leftIcon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      className="text-xs py-2.5 px-5 cursor-pointer font-semibold"
                    >
                      {isSubmitting ? "Menyimpan Pembaruan..." : "Simpan Pembaruan Program"}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
