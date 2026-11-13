"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Send,
  Eye,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  FileText,
  Target,
  Layers,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpportunityItem, ProposalItem } from "./types";
import { FOCUS_AREA_CONFIG, STATUS_CONFIG, PROPOSAL_STATUS_CONFIG, formatRupiah, formatDate } from "./helpers";
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

  // Clean description removing raw metadata tags
  const cleanDescription = useMemo(() => {
    if (!opportunity.description) return "";
    return opportunity.description.replace(/\n\n\[Klasifikasi SDGs:.*?\]/g, "").trim();
  }, [opportunity.description]);

  // Target Location formatting
  const locationLabel = useMemo(() => {
    const parts = [opportunity.targetCity, opportunity.targetProvince].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Nasional / Fleksibel";
  }, [opportunity.targetCity, opportunity.targetProvince]);

  // Program Period formatting
  const periodLabel = useMemo(() => {
    if (opportunity.startDate && opportunity.endDate) {
      return `${formatDate(opportunity.startDate)} s/d ${formatDate(opportunity.endDate)}`;
    }
    if (opportunity.startDate) {
      return `Mulai ${formatDate(opportunity.startDate)}`;
    }
    return "Jadwal Fleksibel / Sesuai Kesepakatan";
  }, [opportunity.startDate, opportunity.endDate]);

  // Deadline formatting & warning
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

  // SDGs extraction: prioritizes tag in description then heuristic mapping
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

  // Mapped ESG pillars from SDGs
  const mappedEsgPillars = useMemo(() => {
    const pillars = {
      E: [] as SdgGoal[],
      S: [] as SdgGoal[],
      G: [] as SdgGoal[],
    };
    sdgs.forEach((goal) => {
      goal.esgPillars.forEach((p: string) => {
        if (p === "E" && !pillars.E.some((x) => x.id === goal.id)) pillars.E.push(goal);
        if (p === "S" && !pillars.S.some((x) => x.id === goal.id)) pillars.S.push(goal);
        if (p === "G" && !pillars.G.some((x) => x.id === goal.id)) pillars.G.push(goal);
      });
    });
    return pillars;
  }, [sdgs]);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. Navigasi Kembali ke Eksplorasi Peluang */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#181343] transition group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Eksplorasi Peluang</span>
        </button>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          ID Peluang: <span className="font-mono text-slate-500">{opportunity.id.slice(0, 8)}...</span>
        </span>
      </div>

      {/* 2. Header Peluang (Clean, Profesional, Tanpa Placeholder Kosong) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        {/* Baris Atas: Informasi Perusahaan Penyelenggara & Status Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            {opportunity.companyLogo ? (
              <img
                src={opportunity.companyLogo}
                alt={opportunity.companyName || "Logo Perusahaan"}
                className="w-11 h-11 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-[#181343] border border-slate-200 flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-5 h-5 text-slate-600" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Perusahaan Penyelenggara CSR
              </span>
              <button
                type="button"
                onClick={() => opportunity.companyId && onViewCompany?.(opportunity.companyId)}
                className="text-sm sm:text-base font-bold text-[#181343] hover:text-[#009E75] transition inline-flex items-center gap-1.5 group truncate"
                title="Buka Profil Publik Perusahaan"
              >
                <span className="truncate">{opportunity.companyName || "Perusahaan Mitra SIPENA"}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#009E75] shrink-0" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusConfig.variant} size="md" hasDot>
              {statusConfig.label}
            </Badge>
            <Badge variant={focusConfig.variant} size="md">
              {focusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Judul Utama Peluang */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#181343] tracking-tight leading-snug">
            {opportunity.title}
          </h1>

          {/* Sub-metrik Cepat (Lokasi, Periode, Tenggat) */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-medium text-slate-700">{locationLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#009E75] shrink-0" />
              <span className="font-medium text-slate-700">{periodLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-medium text-slate-700">
                Batas Pengajuan:{" "}
                <span className={isDeadlineSoon ? "text-amber-700 font-semibold" : ""}>
                  {deadlineLabel}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Banner Cover: Hanya ditampilkan jika URL tersedia dan gambar valid */}
        {opportunity.bannerUrl && !hasImgError && (
          <div className="pt-2">
            <div className="relative w-full max-h-72 rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs bg-slate-900">
              <img
                src={opportunity.bannerUrl}
                alt={opportunity.title}
                onError={() => setHasImgError(true)}
                className="w-full h-52 sm:h-64 lg:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Layout Dua Kolom: Kiri 68% (Informasi Peluang) & Kanan 32% (Sidebar Ringkasan & CTA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* KOLOM KIRI (~68%): INFORMASI LENGKAP PELUANG */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A: GAMBARAN UMUM */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-[#181343]/5 text-[#181343] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#181343]">
                  Gambaran Umum &amp; Latar Belakang
                </h2>
                <p className="text-[11px] text-slate-400">
                  Konteks inisiatif dan tujuan strategis program CSR perusahaan.
                </p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {cleanDescription || "Deskripsi umum dan konteks inisiatif CSR belum disertakan oleh penyelenggara."}
            </div>
          </div>

          {/* SECTION B: TUJUAN & SASARAN PROGRAM */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#181343]">
                  Tujuan &amp; Sasaran Program
                </h2>
                <p className="text-[11px] text-slate-400">
                  Target penerima manfaat dan orientasi keberhasilan yang diharapkan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fokus Tujuan Inisiatif
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-snug">
                  Mewujudkan dampak nyata dan terukur pada sektor {focusConfig.label}.
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menjawab isu prioritas sosial atau lingkungan sesuai strategi keberlanjutan perusahaan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Kelompok Penerima Manfaat
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-snug">
                  Masyarakat sasaran di {locationLabel}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Kriteria kelompok rentan, pelajar, komunitas lokal, atau ekosistem alam yang ditargetkan.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION C: RUANG LINGKUP KEGIATAN */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#009E75] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#181343]">
                  Ruang Lingkup Kegiatan
                </h2>
                <p className="text-[11px] text-slate-400">
                  Bentuk aktivitas, pendekatan kerja, dan cakupan pelaksanaan.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#009E75] mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block">Kemitraan Pelaksana Lapangan</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Perusahaan bermitra dengan lembaga/NGO yang memiliki kapasitas teknis, jaringan komunitas, dan komitmen tata kelola yang baik di bidang {focusConfig.label}.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#009E75] mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block">Fleksibilitas Metodologi Lembaga</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    NGO diberikan kebebasan merancang pendekatan metodologi dan solusi terbaik yang dituangkan ke dalam dokumen proposal formal (TOR) serta rencana anggaran.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#009E75] mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block">Wilayah Intervensi Terarah</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pelaksanaan kegiatan berlokasi di wilayah sasaran {locationLabel} guna memastikan dampak langsung bagi penerima manfaat lokal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION D: FOKUS KEBERLANJUTAN (SDGs & PILAR ESG) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#181343]">
                  Fokus Keberlanjutan (SDGs &amp; ESG)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Klasifikasi target SDGs resmi PBB dan pemetaan pilar Environmental, Social, &amp; Governance.
                </p>
              </div>
            </div>

            {/* Chips SDGs Terhubung */}
            {sdgs.length > 0 ? (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sasaran SDGs Terhubung ({sdgs.length} Kategori)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {sdgs.map((sdg) => (
                    <span
                      key={sdg.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border"
                      style={{
                        backgroundColor: sdg.color + "14",
                        borderColor: sdg.color + "38",
                        color: sdg.color,
                      }}
                      title={sdg.description}
                    >
                      <span className="font-bold">{sdg.code}</span>
                      <span className="text-slate-700 font-medium">{sdg.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Sasaran SDGs spesifik belum dipilih pada peluang ini.
              </p>
            )}

            {/* Mapped ESG Pillars */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pemetaan Pilar ESG Sistem
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    E
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block">Lingkungan</span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {mappedEsgPillars.E.length > 0 ? `${mappedEsgPillars.E.length} SDG terkait` : "Pilar pendukung"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                    S
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block">Sosial</span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {mappedEsgPillars.S.length > 0 ? `${mappedEsgPillars.S.length} SDG terkait` : "Pilar pendukung"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                    G
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block">Tata Kelola</span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {mappedEsgPillars.G.length > 0 ? `${mappedEsgPillars.G.length} SDG terkait` : "Akuntabilitas mitra"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pemetaan ini otomatis terhubung ke modul pelaporan dampak ESG dan monitoring SIPENA.
              </p>
            </div>
          </div>

          {/* SECTION E: KETENTUAN & PERSYARATAN PENGAJUAN */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#181343]">
                  Ketentuan &amp; Persyaratan Pengajuan
                </h2>
                <p className="text-[11px] text-slate-400">
                  Persyaratan administratif, dokumen wajib, dan alur tindak lanjut.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#009E75] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 block">Legalitas Lembaga Aktif</span>
                  <p className="text-xs text-slate-600">
                    Mitra terdaftar secara sah sebagai yayasan, perkumpulan, atau organisasi kemasyarakatan dengan profil administratif yang valid di SIPENA.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#009E75] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 block">Dokumen Wajib: Proposal TOR &amp; RAB</span>
                  <p className="text-xs text-slate-600">
                    NGO mengunggah dokumen proposal/TOR teknis dan file estimasi RAB. NGO tidak perlu menginput ulang rincian aktivitas tabel per bulan secara manual di form pengajuan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#009E75] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 block">Finalisasi Milestone Terstruktur Pasca-Review</span>
                  <p className="text-xs text-slate-600">
                    Penyusunan tahapan monitoring difinalisasi bersama tim CSR perusahaan setelah proposal disetujui substansinya, sebelum penandatanganan MoU dan monitoring diaktifkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN (~32%): SIDEBAR RINGKASAN & SINGLE CTA ACTION */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              {/* Header Sidebar */}
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  Ringkasan Inisiatif
                </span>
                <h3 className="text-base font-bold text-[#181343]">
                  Parameter Peluang
                </h3>
              </div>

              {/* Parameter 1: Estimasi Anggaran Perusahaan */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                <span className="text-xs font-semibold text-slate-500 block">
                  Estimasi Alokasi Anggaran
                </span>
                <div className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight">
                  {opportunity.estimatedBudget && parseFloat(opportunity.estimatedBudget) > 0
                    ? formatRupiah(opportunity.estimatedBudget)
                    : "Sesuai Usulan"}
                </div>
                <span className="text-[11px] text-[#009E75] font-medium block">
                  Pagu indikatif CSR perusahaan
                </span>
              </div>

              {/* Parameter Vertikal Rapi */}
              <div className="space-y-4 pt-1">
                {/* Lokasi */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                      Lokasi Sasaran
                    </span>
                    <span className="text-slate-800 font-bold block truncate">
                      {locationLabel}
                    </span>
                  </div>
                </div>

                {/* Periode */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                      Periode Program
                    </span>
                    <span className="text-slate-800 font-bold block">
                      {periodLabel}
                    </span>
                  </div>
                </div>

                {/* Batas Proposal */}
                <div className="flex items-start gap-3 text-xs">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isDeadlineSoon
                        ? "bg-amber-100 text-amber-800"
                        : isPastDeadline
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                      Batas Akhir Pengajuan
                    </span>
                    <span
                      className={`font-bold block ${
                        isDeadlineSoon
                          ? "text-amber-700"
                          : isPastDeadline
                          ? "text-rose-700"
                          : "text-slate-800"
                      }`}
                    >
                      {deadlineLabel}
                    </span>
                  </div>
                </div>

                {/* Status Penerimaan */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Status Inisiatif</span>
                  <Badge variant={statusConfig.variant} size="sm" hasDot>
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Garis Pemisah */}
              <div className="border-t border-slate-100" />

              {/* SINGLE CTA ACTION */}
              <div>
                {existingProposal ? (
                  /* KONDISI 1: NGO SUDAH MENGAJUKAN PROPOSAL */
                  <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Proposal Telah Diajukan</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Lembaga Anda telah mengirimkan proposal &quot;
                      <span className="font-semibold">{existingProposal.title}</span>&quot; untuk peluang ini.
                    </p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-blue-700 text-[11px]">Status:</span>
                      <Badge
                        variant={
                          PROPOSAL_STATUS_CONFIG[existingProposal.status]?.variant || "blue"
                        }
                        size="sm"
                      >
                        {PROPOSAL_STATUS_CONFIG[existingProposal.status]?.label || existingProposal.status}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      className="w-full text-xs"
                      onClick={() => onViewProposal?.(existingProposal)}
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      Lihat Status Proposal Saya
                    </Button>
                  </div>
                ) : isClosed ? (
                  /* KONDISI 2: PELUANG TELAH DITUTUP */
                  <div className="space-y-2">
                    <Button
                      type="button"
                      disabled
                      className="w-full opacity-60 cursor-not-allowed bg-slate-200 text-slate-600 font-bold"
                    >
                      Penerimaan Proposal Ditutup
                    </Button>
                    <p className="text-[11px] text-slate-400 text-center">
                      Inisiatif CSR ini telah ditutup dan tidak lagi menerima usulan baru.
                    </p>
                  </div>
                ) : canApply ? (
                  /* KONDISI 3: BISA MENGAJUKAN PROPOSAL */
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => onApply(opportunity)}
                    >
                      <span>Ajukan Proposal</span>
                      <Send className="w-4 h-4" />
                    </Button>
                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                      Siapkan dokumen proposal teknis &amp; file rincian RAB sebelum memulai formulir.
                    </p>

                    {/* Catatan Status Verifikasi Organisasi jika pending */}
                    {partnerStatus === "PENDING" && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          Status administratif lembaga Anda masih menunggu verifikasi, namun draf proposal tetap dapat disusun.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* KONDISI LAIN: DRAF ATAU INTERNAL */
                  <div className="space-y-2">
                    <Button
                      type="button"
                      disabled
                      className="w-full opacity-60 cursor-not-allowed bg-slate-200 text-slate-600 font-bold"
                    >
                      Proposal Belum Dibuka
                    </Button>
                    <p className="text-[11px] text-slate-400 text-center">
                      Inisiatif ini sedang dalam persiapan internal perusahaan.
                    </p>
                  </div>
                )}
              </div>

              {/* Sponsoring Company Contact Card */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-600 truncate font-medium">
                    {opportunity.companyName || "Perusahaan Penyelenggara"}
                  </span>
                </div>
                {opportunity.companyId && onViewCompany && (
                  <button
                    type="button"
                    onClick={() => onViewCompany(opportunity.companyId)}
                    className="text-xs font-bold text-[#181343] hover:underline shrink-0"
                  >
                    Profil Publik
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

