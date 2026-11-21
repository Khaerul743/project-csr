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
} from "./helpers";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { ProgramStatus } from "@/db/schema/programs";
import { ActivityTimeline } from "../activities/ActivityTimeline";
import { BeneficiaryReviewsTab } from "../reviews/BeneficiaryReviewsTab";
import { ProgramFinancesTab } from "../finances/ProgramFinancesTab";
import { EsgSustainabilityReportTab } from "../company/programs/EsgSustainabilityReportTab";
import { CompanyProgramItem } from "../company/types";

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
      {/* 1. TOP NAVIGATION ROW                                        */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E8EA]">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="min-h-[44px] text-xs font-bold text-[#181343] hover:text-[#009E75] border-[#E8E8EA] hover:border-emerald-300 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
          >
            Kembali ke Daftar Program
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {program.collaborationMouUrl && (
            <a
              href={program.collaborationMouUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-bold text-[#181343] hover:text-[#009E75] bg-white hover:bg-emerald-50 border border-[#E8E8EA] hover:border-emerald-300 px-3.5 py-2 rounded-xl shadow-2xs transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Dokumen MoU</span>
              <ExternalLink className="w-3 h-3 text-[#787680]" />
            </a>
          )}

          {onOpenChat && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChat(program.collaborationId)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5 text-teal-600" />}
              className="min-h-[44px] text-xs font-bold text-teal-800 bg-teal-50/70 hover:bg-teal-100 border-teal-200/80 rounded-xl cursor-pointer"
            >
              Pesan Perusahaan
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("esg-report")}
            leftIcon={<FileText className="w-3.5 h-3.5 text-emerald-600" />}
            className="min-h-[44px] text-xs font-bold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border-emerald-300 rounded-xl cursor-pointer shadow-2xs"
          >
            Laporan ESG
          </Button>

          <Badge variant={statusConfig.variant} size="md" hasDot className="shadow-2xs">
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PROGRAM IDENTITY BANNER                                   */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0">
            {/* Logo Perusahaan Sponsor dengan graceful fallback initial */}
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100/80 flex items-center justify-center font-black text-teal-800 text-lg overflow-hidden shrink-0 shadow-2xs">
              {program.companyLogo && !companyLogoError ? (
                <img
                  src={program.companyLogo}
                  alt={program.companyName || "Perusahaan"}
                  onError={() => setCompanyLogoError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                (program.companyName || "CP").substring(0, 2).toUpperCase()
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {focusConfig && (
                  <Badge variant={focusConfig.variant} size="sm">
                    {focusConfig.label}
                  </Badge>
                )}
                <span className="text-xs text-[#787680] flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {program.targetCity
                    ? `${program.targetCity}${program.targetProvince ? `, ${program.targetProvince}` : ""}`
                    : "Wilayah Sasaran"}
                </span>
                <span className="text-xs text-[#787680] flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#181343]" />
                  {program.startDate && program.endDate
                    ? `${formatDate(program.startDate)} s/d ${formatDate(program.endDate)}`
                    : "Periode Pelaksanaan"}
                </span>
              </div>

              {/* Main Heading: Nama Program */}
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight leading-snug"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {program.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#787680]">
                <span className="font-semibold text-[#181343] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  Sponsor: {program.companyName || "Perusahaan Donor"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-emerald-700">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                  {program.collaborationMouUrl ? "MoU Telah Disepakati" : "MoU Dalam Pengesahan"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Deskripsi Program (Maksimal 2-3 baris dengan Opsi Lihat Selengkapnya) */}
        {program.description && (
          <div className="pt-3 border-t border-[#F4F4F6] text-xs sm:text-sm text-[#47464F] leading-relaxed">
            <p className={isDescriptionExpanded ? "whitespace-pre-line" : "line-clamp-2 sm:line-clamp-3"}>
              {cleanProgramDescription(program.description, program.title)}
            </p>
            {program.description.length > 140 && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs font-bold text-[#009E75] hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
              >
                {isDescriptionExpanded ? (
                  <>
                    <span>Ciutkan Deskripsi</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Lihat Selengkapnya</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. EMPAT KPI MONITORING HORIZONTAL (SERAGAM & TENANG)       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Progres Aktivitas */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Progres Aktivitas
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Activity className="w-4 h-4 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#181343] tracking-tight tabular-nums">
              {program.activityProgressPercent ?? 0}%
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tahapan Selesai</span>
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
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Realisasi Dana
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#181343] tracking-tight truncate tabular-nums">
              {formatRupiah(currentSpentNum)}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 space-y-1.5">
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

        {/* KPI 3: Status Laporan Lapangan */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Status Laporan Lapangan
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#181343] tracking-tight flex items-baseline gap-1.5 tabular-nums">
              <span>{program.pendingVerificationCount ?? 0}</span>
              <span className="text-sm font-semibold text-slate-500">Laporan</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status Verifikasi:</span>
            <span className="font-bold text-[#181343]">
              {(program.pendingVerificationCount ?? 0) > 0
                ? "Menunggu Verifikasi"
                : "Semua Tertib"}
            </span>
          </div>
        </div>

        {/* KPI 4: Penerima Manfaat Aktual */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Penerima Manfaat Aktual
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Users className="w-4 h-4 text-slate-700" />
              </div>
            </div>
            <div className="text-base font-bold text-[#181343] line-clamp-2 min-h-[32px]">
              {program.actualBeneficiaries || (
                <span className="text-xs font-normal text-slate-400">Belum dilaporkan</span>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target Kesepakatan:</span>
            <span className="font-bold text-[#181343] truncate max-w-[130px]">
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

