"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  Send,
  Eye,
  CheckCircle2,
  ExternalLink,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpportunityItem, ProposalItem } from "./types";
import {
  FOCUS_AREA_CONFIG,
  STATUS_CONFIG,
  PROPOSAL_STATUS_CONFIG,
  formatRupiah,
  formatDate,
} from "./helpers";
import { ALL_17_SDGS, getProgramSdgs } from "@/components/dashboard/analytics/helpers";
import { SdgGoal } from "@/components/dashboard/analytics/types";

export interface PartnerOpportunityDetailPageViewProps {
  opportunity: OpportunityItem;
  existingProposal?: ProposalItem | null;
  partnerStatus?: string;
  onBack: () => void;
  onApply: (opportunity: OpportunityItem) => void;
  onViewProposal?: (proposal: ProposalItem) => void;
  onViewCompany?: (companyId: string) => void;
}

export function PartnerOpportunityDetailPageView({
  opportunity,
  existingProposal,
  partnerStatus,
  onBack,
  onApply,
  onViewProposal,
  onViewCompany,
}: PartnerOpportunityDetailPageViewProps) {
  const [hasImgError, setHasImgError] = useState(false);

  const focusConfig = FOCUS_AREA_CONFIG[opportunity.focusArea] || {
    label: opportunity.focusArea,
    variant: "slate" as const,
  };

  const statusConfig = STATUS_CONFIG[opportunity.status] || {
    label: opportunity.status,
    variant: "slate" as const,
  };

  const isClosed = opportunity.status === "CLOSED";
  const canApply = !isClosed && (opportunity.status === "OPEN" || opportunity.status === "IN_REVIEW");

  // Pembersihan metadata internal dari deskripsi
  const cleanDescription = useMemo(() => {
    if (!opportunity.description) return "";
    return opportunity.description.replace(/\n\n\[Klasifikasi SDGs:.*?\]/g, "").trim();
  }, [opportunity.description]);

  // Format Wilayah Sasaran
  const locationLabel = useMemo(() => {
    const parts = [opportunity.targetCity, opportunity.targetProvince].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Nasional / Fleksibel";
  }, [opportunity.targetCity, opportunity.targetProvince]);

  // Format Periode Pelaksanaan
  const periodLabel = useMemo(() => {
    if (opportunity.startDate && opportunity.endDate) {
      return `${formatDate(opportunity.startDate)} s/d ${formatDate(opportunity.endDate)}`;
    }
    if (opportunity.startDate) {
      return `Mulai ${formatDate(opportunity.startDate)}`;
    }
    return "Jadwal Fleksibel / Sesuai Kesepakatan";
  }, [opportunity.startDate, opportunity.endDate]);

  // Format Tenggat Pengajuan
  const { deadlineLabel, isDeadlineSoon, isPastDeadline } = useMemo(() => {
    if (!opportunity.deadline) {
      return { deadlineLabel: "Tidak Dibatasi", isDeadlineSoon: false, isPastDeadline: false };
    }
    const deadlineDate = new Date(opportunity.deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      deadlineLabel: formatDate(opportunity.deadline),
      isDeadlineSoon: diffDays >= 0 && diffDays <= 7,
      isPastDeadline: diffDays < 0,
    };
  }, [opportunity.deadline]);

  // Ekstraksi Sasaran SDGs Terkait
  const sdgs = useMemo(() => {
    if (!opportunity) return [];
    const match = opportunity.description?.match(/\[Klasifikasi SDGs:\s*([^\]]+)\]/);
    if (match && match[1]) {
      const foundIds: number[] = [];
      ALL_17_SDGS.forEach((s) => {
        if (
          match[1].includes(s.name) ||
          match[1].includes(s.code) ||
          new RegExp(`\\bSDG\\s*${s.id}\\b`, "i").test(match[1])
        ) {
          foundIds.push(s.id);
        }
      });
      if (foundIds.length > 0) {
        return foundIds
          .map((id) => ALL_17_SDGS.find((s) => s.id === id))
          .filter((s): s is SdgGoal => !!s);
      }
    }

    const ids = getProgramSdgs({
      id: opportunity.id,
      title: opportunity.title,
      description: opportunity.description,
      focusArea: opportunity.focusArea,
      status: "PLANNED",
      budget: opportunity.estimatedBudget || "0",
    } as any);

    return ids
      .map((id) => ALL_17_SDGS.find((s) => s.id === id))
      .filter((s): s is SdgGoal => !!s);
  }, [opportunity]);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#181343] transition cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Eksplorasi Peluang</span>
        </button>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          ID Peluang: {opportunity.id.slice(0, 8)}
        </span>
      </div>

      {/* 2. Banner Visual Cover (Hanya jika URL gambar tersedia dan valid) */}
      {opportunity.bannerUrl && !hasImgError && (
        <div className="w-full h-52 sm:h-64 lg:h-72 rounded-2xl overflow-hidden border border-[#E5E7EB] bg-slate-100 shadow-xs">
          <img
            src={opportunity.bannerUrl}
            alt={opportunity.title}
            onError={() => setHasImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 3. Header Peluang (Identitas Penyelenggara & Judul Inisiatif) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            {opportunity.companyLogo ? (
              <img
                src={opportunity.companyLogo}
                alt={opportunity.companyName || "Logo Perusahaan"}
                className="w-12 h-12 rounded-xl object-contain bg-white border border-[#E5E7EB] p-1.5 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-[#181343] border border-[#E5E7EB] flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-6 h-6 text-slate-500" />
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Perusahaan Penyelenggara CSR
              </span>
              <button
                type="button"
                onClick={() => opportunity.companyId && onViewCompany?.(opportunity.companyId)}
                className="text-sm sm:text-base font-bold text-[#181343] hover:text-[#009E75] transition inline-flex items-center gap-1.5 group truncate cursor-pointer"
                title="Buka Profil Publik Perusahaan"
              >
                <span className="truncate">{opportunity.companyName || "Perusahaan Mitra SIPENA"}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#009E75] shrink-0" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={focusConfig.variant} size="md">
              {focusConfig.label}
            </Badge>
            <Badge variant={statusConfig.variant} size="md" hasDot>
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Judul Utama Peluang */}
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight leading-snug"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {opportunity.title}
        </h1>
      </div>

      {/* 4. Layout Dua Kolom: Kiri 65% (Informasi Peluang) & Kanan 35% (Sidebar Ringkasan & CTA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* KOLOM KIRI (lg:col-span-8): DESKRIPSI NYATA & INFORMASI OTENTIK           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bagian 1: Detail & Gambaran Inisiatif */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-50 text-[#181343] border border-slate-200/80 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h2
                className="text-base sm:text-lg font-bold text-[#181343]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Gambaran &amp; Latar Belakang Inisiatif
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
              {cleanDescription || "Deskripsi lengkap inisiatif CSR belum disertakan oleh pihak penyelenggara."}
            </div>
          </div>

          {/* Bagian 2: Sasaran Pembangunan Berkelanjutan (SDGs) */}
          {sdgs.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="space-y-0.5 pb-3 border-b border-slate-100">
                <h2
                  className="text-base sm:text-lg font-bold text-[#181343]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Sasaran Pembangunan Berkelanjutan (SDGs)
                </h2>
                <p className="text-xs text-slate-500">
                  Target prioritas keberlanjutan yang diselaraskan dengan inisiatif CSR ini.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {sdgs.map((sdg) => (
                  <span
                    key={sdg.id}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border"
                    style={{
                      backgroundColor: sdg.color + "12",
                      borderColor: sdg.color + "35",
                      color: sdg.color,
                    }}
                    title={sdg.description}
                  >
                    <span className="font-bold">{sdg.code}</span>
                    <span className="text-slate-800 font-medium">{sdg.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bagian 3: Ketentuan Pengajuan Proposal */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-4">
            <div className="space-y-0.5 pb-3 border-b border-slate-100">
              <h2
                className="text-base sm:text-lg font-bold text-[#181343]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ketentuan Pengajuan Proposal
              </h2>
              <p className="text-xs text-slate-500">
                Pedoman administratif dan dokumen kelengkapan yang perlu dipersiapkan lembaga.
              </p>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#009E75] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 block">Kualifikasi Lembaga Mitra</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Terdaftar secara sah sebagai yayasan, perkumpulan, atau organisasi kemasyarakatan dengan profil administratif aktif di platform SIPENA.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#009E75] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 block">Dokumen Wajib: Proposal Teknis &amp; RAB</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Unggah berkas proposal program (TOR) dan rencana anggaran biaya (RAB) yang mencakup metodologi pelaksanaan, sasaran penerima manfaat, dan jadwal eksekusi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#009E75] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 block">Tahap Evaluasi &amp; Kesepakatan MoU</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Usulan program akan dievaluasi oleh tim CSR perusahaan penyelenggara. Usulan yang disetujui akan dilanjutkan ke tahap finalisasi perjanjian kerja sama resmi (MoU).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN (lg:col-span-4): SIDEBAR RINGKASAN & CTA                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs space-y-4">
              {/* Parameter Ringkas (Anggaran & Spesifikasi) */}
              <div className="space-y-4">
                {/* Estimasi Alokasi Anggaran */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Estimasi Alokasi Anggaran
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#181343] tracking-tight tabular-nums">
                    {opportunity.estimatedBudget && parseFloat(opportunity.estimatedBudget) > 0
                      ? formatRupiah(opportunity.estimatedBudget)
                      : "Sesuai Usulan"}
                  </div>
                  <span className="text-[11px] text-[#009E75] font-semibold block">
                    Pagu indikatif program CSR
                  </span>
                </div>

                {/* Rincian Parameter */}
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium">Wilayah Sasaran</span>
                    <span className="font-semibold text-slate-800 text-right truncate">
                      {locationLabel}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium">Periode Pelaksanaan</span>
                    <span className="font-semibold text-slate-800 text-right truncate">
                      {periodLabel}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium">Batas Waktu Pengajuan</span>
                    <span
                      className={`font-semibold text-right ${
                        isDeadlineSoon
                          ? "text-amber-700"
                          : isPastDeadline
                            ? "text-rose-600"
                            : "text-slate-800"
                      }`}
                    >
                      {deadlineLabel}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium">Status Inisiatif</span>
                    <Badge variant={statusConfig.variant} size="sm" hasDot>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* CTA: Dipindahkan ke bawah setelah Ringkasan & Diperkecil */}
              <div className="pt-1">
                {existingProposal ? (
                  /* KONDISI 1: SUDAH ADA PROPOSAL */
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Proposal Telah Diajukan</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                      &quot;{existingProposal.title}&quot;
                    </p>
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="text-slate-500 font-medium">Status Pengajuan:</span>
                      <Badge
                        variant={PROPOSAL_STATUS_CONFIG[existingProposal.status]?.variant || "blue"}
                        size="sm"
                      >
                        {PROPOSAL_STATUS_CONFIG[existingProposal.status]?.label || existingProposal.status}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold border-blue-200 text-blue-800 hover:bg-blue-50 cursor-pointer py-1.5"
                      onClick={() => onViewProposal?.(existingProposal)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Lihat Status Proposal Saya
                    </Button>
                  </div>
                ) : isClosed ? (
                  /* KONDISI 2: PELUANG TELAH DITUTUP */
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      disabled
                      size="sm"
                      className="w-full opacity-60 cursor-not-allowed bg-slate-100 text-slate-500 font-semibold text-xs py-2 px-3"
                    >
                      Penerimaan Proposal Ditutup
                    </Button>
                    <p className="text-[11px] text-slate-400 text-center">
                      Inisiatif CSR ini telah ditutup dan tidak lagi menerima usulan baru.
                    </p>
                  </div>
                ) : canApply ? (
                  /* KONDISI 3: BISA MENGAJUKAN PROPOSAL */
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="w-full bg-[#181343] hover:bg-[#26224C] text-white font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-2 transition"
                      onClick={() => onApply(opportunity)}
                    >
                      <span>Ajukan Proposal Sekarang</span>
                      <Send className="w-3.5 h-3.5" />
                    </Button>

                    {partnerStatus === "PENDING" && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-800 text-[11px] flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          Lembaga Anda sedang dalam tahap verifikasi, namun draf proposal tetap dapat disusun.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* KONDISI LAIN */
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      disabled
                      size="sm"
                      className="w-full opacity-60 cursor-not-allowed bg-slate-100 text-slate-500 font-semibold text-xs py-2 px-3"
                    >
                      Proposal Belum Dibuka
                    </Button>
                    <p className="text-[11px] text-slate-400 text-center">
                      Inisiatif ini sedang dalam persiapan internal perusahaan.
                    </p>
                  </div>
                )}
              </div>

              {/* Tentang Perusahaan Penyelenggara */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 font-medium truncate">
                    {opportunity.companyName || "Perusahaan Penyelenggara"}
                  </span>
                </div>
                {opportunity.companyId && onViewCompany && (
                  <button
                    type="button"
                    onClick={() => onViewCompany(opportunity.companyId!)}
                    className="font-bold text-[#009E75] hover:text-emerald-800 hover:underline shrink-0 cursor-pointer"
                  >
                    Profil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
