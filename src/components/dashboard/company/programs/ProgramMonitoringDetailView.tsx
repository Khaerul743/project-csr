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
  Sparkles,
  Check,
  Percent,
  Camera,
  FileText,
  Star,
  Wallet,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyProgramItem } from "../types";
import {
  PROGRAM_STATUS_CONFIG,
  FOCUS_AREA_CONFIG,
  formatRupiah,
  formatDate,
} from "../helpers";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { ProgramStatus } from "@/db/schema/programs";
import { ActivityTimeline } from "../../activities/ActivityTimeline";
import { BeneficiaryReviewsTab } from "../../reviews/BeneficiaryReviewsTab";
import { ProgramFinancesTab } from "../../finances/ProgramFinancesTab";

interface ProgramMonitoringDetailViewProps {
  program: CompanyProgramItem;
  onBack: () => void;
  onProgramUpdated?: () => void;
  onOpenChat?: (collabId?: string | null) => void;
  isManagement?: boolean;
}

export function ProgramMonitoringDetailView({
  program: initialProgram,
  onBack,
  onProgramUpdated,
  onOpenChat,
  isManagement = false,
}: ProgramMonitoringDetailViewProps) {
  const [currentProgram, setCurrentProgram] = useState<CompanyProgramItem>(initialProgram);
  const [activeTab, setActiveTab] = useState<"activities" | "finances" | "reviews" | "settings">("activities");
  
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
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialProgram]);

  const program = currentProgram;

  const statusConfig = PROGRAM_STATUS_CONFIG[program.status] || {
    label: program.status,
    variant: "slate" as const,
  };

  const focusConfig = program.focusArea
    ? FOCUS_AREA_CONFIG[program.focusArea as CsrFocusArea]
    : null;

  const totalBudgetNum = parseFloat(program.budget || "0") || 1;
  const currentSpentNum = parseFloat(spentBudget || "0") || 0;
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
          spentBudget: spentBudget ? parseFloat(spentBudget) : 0,
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
      {/* 1. Top Navigation & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E8EA]">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs font-bold text-[#181343] hover:text-emerald-700 border-[#E8E8EA] hover:border-emerald-300 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
          >
            Kembali ke Daftar Program
          </Button>
          <span className="text-[#C8C5D0] hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#787680]">
            <span>Pelaksanaan Program</span>
            <span>/</span>
            <span className="font-semibold text-[#181343] truncate max-w-xs">{program.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {program.collaborationMouUrl && (
            <a
              href={program.collaborationMouUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#181343] hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-[#E8E8EA] hover:border-emerald-300 px-3 py-1.5 rounded-xl shadow-2xs transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Dokumen MoU</span>
              <ExternalLink className="w-3 h-3 text-[#787680]" />
            </a>
          )}

          {!isManagement && onOpenChat && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChat(program.collaborationId)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5 text-teal-600" />}
              className="text-xs font-bold text-teal-800 bg-teal-50/70 hover:bg-teal-100 border-teal-200/80 rounded-xl cursor-pointer"
            >
              Pesan Mitra
            </Button>
          )}

          <Badge variant={statusConfig.variant} size="md" hasDot className="shadow-2xs">
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* 2. Hero Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100/80 flex items-center justify-center font-bold text-teal-700 text-lg overflow-hidden shrink-0 shadow-2xs">
              {program.partnerLogo ? (
                <img
                  src={program.partnerLogo}
                  alt={program.partnerName || "Mitra"}
                  className="w-full h-full object-cover"
                />
              ) : (
                (program.partnerName || "M").substring(0, 2).toUpperCase()
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {focusConfig && (
                  <Badge variant={focusConfig.variant} size="sm">
                    {focusConfig.label}
                  </Badge>
                )}
                {program.targetCity && (
                  <span className="text-xs text-[#787680] flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {program.targetCity}
                  </span>
                )}
                <span className="text-xs text-[#787680] flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#181343]" />
                  {program.startDate && program.endDate
                    ? `${formatDate(program.startDate)} s/d ${formatDate(program.endDate)}`
                    : "Periode Pelaksanaan"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#181343] tracking-tight leading-snug">
                {program.title}
              </h2>

              <div className="flex items-center gap-2 text-xs text-[#787680]">
                <span className="font-semibold text-[#181343] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  {program.partnerName || "Mitra Pelaksana"}
                </span>
                {program.opportunityTitle && (
                  <>
                    <span>•</span>
                    <span className="truncate">Inisiatif Asal: <strong className="text-[#181343]">{program.opportunityTitle}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {program.description && (
          <div className="pt-4 border-t border-[#F4F4F6]">
            <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
              {program.description}
            </p>
          </div>
        )}
      </div>

      {/* 3. Executive KPI Dashboard Bar (4 Metric Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Serapan Anggaran */}
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
              {formatRupiah(currentSpentNum)}
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#787680]">Pagu: {formatRupiah(program.budget)}</span>
              <span className="font-bold text-emerald-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#EEEEF0] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Penerima Manfaat */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-teal-400/60 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Penerima Manfaat
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4 text-teal-600" />
              </div>
            </div>
            <div className="text-base font-extrabold text-[#181343] line-clamp-2 min-h-[32px]">
              {program.actualBeneficiaries || (
                <span className="text-xs font-normal text-[#787680] italic">Belum dilaporkan</span>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 flex items-center justify-between text-xs">
            <span className="text-[#787680]">Target Kesepakatan MoU:</span>
            <span className="font-bold text-[#181343] truncate max-w-[120px]">
              {program.targetBeneficiaries || "-"}
            </span>
          </div>
        </div>

        {/* KPI 3: Siklus Status */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-[#181343]/30 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Status Siklus Pelaksanaan
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#181343] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4 text-[#181343]" />
              </div>
            </div>
            <div className="pt-1">
              <Badge variant={statusConfig.variant} size="md" hasDot>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 flex items-center justify-between text-xs text-[#787680]">
            <span>Pembaruan:</span>
            <span className="font-semibold text-[#181343]">{formatDate(program.updatedAt)}</span>
          </div>
        </div>

        {/* KPI 4: Tata Kelola MoU */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/40 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                Legalitas &amp; Dokumen MoU
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-sm font-extrabold text-[#181343]">
              {program.collaborationMouUrl ? "Telah Ditandatangani" : "Dalam Pengesahan"}
            </div>
          </div>
          <div className="pt-3 border-t border-[#F4F4F6] mt-3 flex items-center justify-between text-xs">
            <span className="text-[#787680]">Kepatuhan Audit:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Terverifikasi
            </span>
          </div>
        </div>
      </div>

      {/* 4. Full-Width Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
        {/* Navigation Bar */}
        <div className="px-6 border-b border-[#E8E8EA] flex items-center gap-2 sm:gap-6 bg-[#FBFBFC] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("activities")}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "activities"
                ? "border-emerald-600 text-emerald-700 font-extrabold"
                : "border-transparent text-[#787680] hover:text-[#181343]"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Log &amp; Timeline Bukti Lapangan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("finances")}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "finances"
                ? "border-emerald-600 text-emerald-700 font-extrabold"
                : "border-transparent text-[#787680] hover:text-[#181343]"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Realisasi Dana &amp; Audit Keuangan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "reviews"
                ? "border-emerald-600 text-emerald-700 font-extrabold"
                : "border-transparent text-[#787680] hover:text-[#181343]"
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Suara &amp; Ulasan Penerima Manfaat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "settings"
                ? "border-emerald-600 text-emerald-700 font-extrabold"
                : "border-transparent text-[#787680] hover:text-[#181343]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Parameter &amp; Evaluasi Status</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8">
          {activeTab === "activities" && (
            <ActivityTimeline
              programId={program.id}
              programTitle={program.title}
              role="COMPANY"
              onActivityChanged={onProgramUpdated}
            />
          )}

          {activeTab === "finances" && (
            <ProgramFinancesTab
              programId={program.id}
              programTitle={program.title}
              agreedBudget={program.budget || "0"}
              role="COMPANY"
              onFinancesUpdated={onProgramUpdated}
            />
          )}

          {activeTab === "reviews" && (
            <BeneficiaryReviewsTab
              programId={program.id}
              programTitle={program.title}
            />
          )}

          {activeTab === "settings" && (
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
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-1 ring-emerald-600"
                              : "border-[#E8E8EA] bg-white text-[#47464F] hover:border-emerald-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold">{cfg.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <span className="text-[10px] text-[#787680]">
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
                        type="number"
                        value={spentBudget}
                        onChange={(e) => setSpentBudget(e.target.value)}
                        placeholder="0"
                        min="0"
                        max={totalBudgetNum}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E8EA] text-xs font-bold text-[#181343] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
                    Catatan Evaluasi &amp; Perkembangan Monitoring Lapangan
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Tuliskan catatan perkembangan kegiatan lapangan, kepatuhan jadwal, tantangan yang dihadapi, atau rekomendasi perbaikan..."
                    className="w-full p-4 rounded-2xl border border-[#E8E8EA] text-xs text-[#181343] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed resize-none transition-all"
                  />
                </div>

                {/* Submit Row */}
                <div className="pt-4 border-t border-[#E8E8EA] flex items-center justify-between">
                  <span className="text-xs text-[#787680] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600" />
                    Pembaruan ini akan otomatis tersinkronisasi pada laporan ESG eksekutif.
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                    leftIcon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs py-2.5 px-5 cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    {isSubmitting ? "Menyimpan Pembaruan..." : "Simpan Pembaruan Program"}
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
