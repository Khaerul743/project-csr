"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Send,
  UploadCloud,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  HelpCircle,
  Info,
  Check,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpportunityItem } from "./types";
import { FOCUS_AREA_CONFIG, formatRupiah, formatDate } from "./helpers";
import { ProposalOptimizerModal } from "./ProposalOptimizerModal";

export interface SubmitProposalPageViewProps {
  opportunity: OpportunityItem;
  onBack: () => void;
  onSuccess: () => void;
}

export function SubmitProposalPageView({
  opportunity,
  onBack,
  onSuccess,
}: SubmitProposalPageViewProps) {
  // Contextual placeholders based on focus area
  const contextualData = useMemo(() => {
    const area = opportunity.focusArea || "LAINNYA";
    const titleLower = (opportunity.title || "").toLowerCase();

    if (area === "PENDIDIKAN" || titleLower.includes("literasi") || titleLower.includes("sekolah")) {
      return {
        titlePlaceholder: "Contoh: Program Penguatan Literasi Siswa & Pojok Baca Inklusif Pedesaan",
        summaryPlaceholder:
          "Uraikan pendekatan metodologi program, sasaran capaian belajar siswa, pelatihan guru pendamping, dan mekanisme evaluasi keberlanjutan. Rincian tahapan per bulan dan item RAB terlampir lengkap dalam dokumen proposal...",
        beneficiariesPlaceholder: "Contoh: 350 siswa sekolah dasar dan 25 guru pendamping",
        defaultDuration: 6,
      };
    }

    if (area === "KESEHATAN" || titleLower.includes("stunting") || titleLower.includes("gizi")) {
      return {
        titlePlaceholder: "Contoh: Intervensi Gizi Terpadu & Edukasi Sanitasi Pencegahan Stunting",
        summaryPlaceholder:
          "Jelaskan metode pendampingan posyandu, penyaluran pangan lokal bergizi, pemantauan kurva KMS, serta edukasi perilaku hidup bersih dan sehat. Rencana kegiatan operasional dan RAB terlampir di dokumen...",
        beneficiariesPlaceholder: "Contoh: 200 ibu hamil dan balita risiko stunting",
        defaultDuration: 6,
      };
    }

    if (area === "LINGKUNGAN" || titleLower.includes("sampah") || titleLower.includes("pohon")) {
      return {
        titlePlaceholder: "Contoh: Konservasi Sumber Mata Air & Pemberdayaan Bank Sampah Komunitas",
        summaryPlaceholder:
          "Uraikan rencana penanaman bibit pohon endemik, penguatan fasilitas pemilahan sampah organik, pembentukan komite lingkungan desa, serta target kelestarian ekologis yang dijabarkan dalam dokumen proposal...",
        beneficiariesPlaceholder: "Contoh: 300 kepala keluarga di 2 desa penyangga mata air",
        defaultDuration: 6,
      };
    }

    // Default general
    return {
      titlePlaceholder: "Contoh: Program Pengembangan Kapasitas Komunitas & Pemberdayaan Berkelanjutan",
      summaryPlaceholder:
        "Jelaskan latar belakang program, metodologi implementasi lapangan, rencana pelibatan penerima manfaat, serta strategi evaluasi dampak keberlanjutan sesuai dokumen proposal dan RAB terlampir...",
      beneficiariesPlaceholder: "Contoh: 250 kepala keluarga dan pemuda desa",
      defaultDuration: 6,
    };
  }, [opportunity]);

  // Section 1 States: Basic Information
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [durationMonths, setDurationMonths] = useState<number | "">(contextualData.defaultDuration);
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("");

  // Section 2 States: Budget (Total Proposed)
  const [proposedBudget, setProposedBudget] = useState("");

  // Section 3 States: Formal Document Upload (Mandatory)
  const [documentUrl, setDocumentUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    format: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);

  // Parse numeric budget
  const numericBudget = useMemo(() => {
    const parsed = parseFloat(proposedBudget.replace(/[^\d]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }, [proposedBudget]);

  // Company budget comparison
  const companyBudget = opportunity.estimatedBudget ? parseFloat(opportunity.estimatedBudget) : 0;
  const isBudgetExceeding = companyBudget > 0 && numericBudget > companyBudget;
  const budgetDifference = numericBudget - companyBudget;

  // Real-time completeness calculation
  const completenessDetails = useMemo(() => {
    const checks = [
      { id: "title", label: "Judul Proposal CSR", completed: title.trim().length >= 5 },
      { id: "summary", label: "Ringkasan Teknis & Metodologi", completed: summary.trim().length >= 10 },
      { id: "budget", label: "Total Anggaran yang Diajukan", completed: numericBudget > 0 },
      { id: "duration", label: "Estimasi Durasi Pelaksanaan", completed: typeof durationMonths === "number" && durationMonths > 0 },
      { id: "beneficiaries", label: "Target Penerima Manfaat", completed: targetBeneficiaries.trim().length >= 3 },
      { id: "document", label: "Dokumen Proposal & RAB (Wajib)", completed: Boolean(documentUrl.trim()) },
    ];

    const completedCount = checks.filter((c) => c.completed).length;
    const totalCount = checks.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return {
      checks,
      completedCount,
      totalCount,
      percentage,
      isAllComplete: completedCount === totalCount,
    };
  }, [title, summary, numericBudget, durationMonths, targetBeneficiaries, documentUrl]);

  // Document Upload Handler
  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    // Max 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("Ukuran file melebihi batas maksimum 15MB.");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowed = ["pdf", "doc", "docx", "xls", "xlsx"];
    if (!allowed.includes(ext)) {
      setUploadError("Format berkas tidak didukung. Harap unggah berkas PDF, DOC, DOCX, XLS, atau XLSX.");
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Harap masuk kembali.");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/proposal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah dokumen proposal.");
      }

      setDocumentUrl(json.data.url);
      setUploadedFile({
        name: json.data.originalName || file.name,
        size: file.size,
        format: ext.toUpperCase(),
      });
    } catch (err: any) {
      setUploadError(err.message || "Terjadi kendala saat mengunggah dokumen.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setDocumentUrl("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Pre-submission validation
  const handleOpenConfirmation = () => {
    setErrorMessage(null);

    if (!title.trim() || title.trim().length < 5) {
      setErrorMessage("Judul proposal wajib diisi minimal 5 karakter.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!summary.trim() || summary.trim().length < 10) {
      setErrorMessage("Ringkasan teknis dan metodologi wajib diisi minimal 10 karakter.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (numericBudget <= 0) {
      setErrorMessage("Total anggaran yang diajukan harus lebih dari Rp 0.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!durationMonths || Number(durationMonths) <= 0) {
      setErrorMessage("Estimasi durasi pelaksanaan harus lebih dari 0 bulan.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!targetBeneficiaries.trim()) {
      setErrorMessage("Target penerima manfaat wajib diisi.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!documentUrl.trim()) {
      setErrorMessage(
        "Dokumen proposal formal dan RAB wajib dilampirkan sebagai rujukan utama kegiatan dan anggaran."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setShowConfirmModal(true);
  };

  // Submit Proposal Execution
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Harap masuk kembali.");

      const payload = {
        opportunityId: opportunity.id,
        title: title.trim(),
        summary: summary.trim(),
        proposedBudget: numericBudget,
        durationMonths: durationMonths ? Number(durationMonths) : null,
        targetBeneficiaries: targetBeneficiaries.trim() || null,
        documentUrl: documentUrl.trim(),
      };

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengirimkan proposal.");
      }

      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat mengirimkan proposal.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusConfig = FOCUS_AREA_CONFIG[opportunity.focusArea] || {
    label: opportunity.focusArea,
    variant: "slate" as const,
  };

  const isDirty = Boolean(
    title.trim() ||
    summary.trim() ||
    proposedBudget.trim() ||
    targetBeneficiaries.trim() ||
    uploadedFile ||
    documentUrl.trim()
  );

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "Formulir proposal telah diisi sebagian. Apakah Anda yakin ingin membatalkan pengajuan dan meninggalkan formulir ini? Perubahan yang belum dikirim akan hilang."
      );
      if (!confirmLeave) return;
    }
    onBack();
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. Header Halaman Formulir (Clean, Minimalis, Putih) */}
      <div className="pb-3 border-b border-[#E8E8EA] bg-white p-5 sm:p-6 rounded-2xl shadow-2xs space-y-2">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#181343] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Peluang</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ajukan Proposal CSR
            </h1>
            <p className="text-xs sm:text-sm text-[#787680] mt-0.5">
              Sampaikan usulan inisiatif program, estimasi total anggaran, dan dokumen proposal formal untuk peluang CSR terpilih.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs text-[#787680] hidden md:inline">Target Inisiatif:</span>
            <Badge variant={focusConfig.variant} size="sm">
              {focusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Error Banner jika ada */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-900">Perhatian Sebelum Mengirim:</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2. Dua Kolom Layout Desktop (Area Formulir ~70% & Sidebar Ringkasan ~30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Formulir Utama (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* ========================================================================= */}
          {/* SECTION 1: INFORMASI USULAN PROGRAM */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-[#E8E8EA] flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#181343]">
                    Informasi Usulan Program
                  </h2>
                  <p className="text-xs text-[#787680]">
                    Judul inisiatif, ringkasan pendekatan metodologi, sasaran penerima, dan durasi pelaksanaan.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Judul Proposal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Judul Proposal Inisiatif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={contextualData.titlePlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                />
                <p className="text-[11px] text-[#787680]">
                  Gunakan judul yang spesifik, solutif, dan merepresentasikan dampak nyata inisiatif bagi masyarakat sasaran.
                </p>
              </div>

              {/* Ringkasan Teknis & Metodologi Pelaksanaan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-semibold text-slate-800">
                    Ringkasan Teknis & Pendekatan Metodologi <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOptimizerModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Optimalkan dengan AI</span>
                  </button>
                </div>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  placeholder={contextualData.summaryPlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white resize-y min-h-[110px]"
                />
                <p className="text-[11px] text-[#787680]">
                  Jelaskan garis besar pendekatan metodologi, pelibatan masyarakat, dan strategi keberlanjutan. Rincian aktivitas per bulan tidak perlu diketik ulang di sini karena sudah tercantum dalam dokumen proposal.
                </p>
              </div>

              {/* Grid 2 Kolom: Durasi & Target Penerima Manfaat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Durasi Pelaksanaan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Estimasi Durasi Pelaksanaan (Bulan) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={36}
                      value={durationMonths}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : "";
                        setDurationMonths(val);
                      }}
                      placeholder="6"
                      className="w-full pl-3.5 pr-16 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      Bulan
                    </span>
                  </div>
                  <p className="text-[11px] text-[#787680]">
                    Pagu durasi target perusahaan:{" "}
                    <strong>
                      {opportunity.startDate && opportunity.endDate
                        ? `${formatDate(opportunity.startDate)} - ${formatDate(opportunity.endDate)}`
                        : "Fleksibel"}
                    </strong>
                  </p>
                </div>

                {/* Target Penerima Manfaat */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Target Penerima Manfaat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetBeneficiaries}
                    onChange={(e) => setTargetBeneficiaries(e.target.value)}
                    placeholder={contextualData.beneficiariesPlaceholder}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                  />
                  <p className="text-[11px] text-[#787680]">
                    Jumlah dan profil kelompok sasaran (contoh: 200 keluarga, 50 guru).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: TOTAL ANGGARAN YANG DIAJUKAN */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-[#E8E8EA] flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#181343]">
                    Total Anggaran yang Diajukan
                  </h2>
                  <p className="text-xs text-[#787680]">
                    Tentukan total pagu dana usulan program berdasarkan dokumen Rencana Anggaran Biaya (RAB) lembaga Anda.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Total Anggaran Proposal (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={proposedBudget}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^\d]/g, "");
                      setProposedBudget(clean);
                    }}
                    placeholder="Contoh: 75000000"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                  />
                </div>
                {numericBudget > 0 && (
                  <p className="text-xs font-bold text-teal-700">
                    Terbaca: {formatRupiah(numericBudget)}
                  </p>
                )}
              </div>

              {/* Komparasi Anggaran Perusahaan & Advisory Indicator */}
              <div className="p-4 rounded-xl border bg-slate-50/60 border-slate-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500">Estimasi Pagu Anggaran Perusahaan:</span>
                  <span className="font-bold text-slate-900">
                    {opportunity.estimatedBudget ? formatRupiah(opportunity.estimatedBudget) : "Sesuai Pengajuan"}
                  </span>
                </div>

                {numericBudget > 0 && companyBudget > 0 && (
                  <div className="pt-2 border-t border-slate-200/60">
                    {isBudgetExceeding ? (
                      <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200/80">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Anggaran Melebihi Pagu Estimasi Perusahaan</p>
                          <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                            Total anggaran yang diajukan lebih tinggi sebesar <strong>{formatRupiah(budgetDifference)}</strong> dari estimasi perusahaan. Proposal tetap dapat diajukan dan akan menjadi bahan pertimbangan pada tahap negosiasi kesepakatan.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">
                          Usulan anggaran berada di dalam rentang pagu estimasi perusahaan.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#787680] bg-white p-3 rounded-xl border border-slate-100">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Rincian pengeluaran per komponen biaya tidak perlu diinput tabel manual di sini, melainkan dilampirkan dalam berkas Dokumen Proposal / RAB formal di bawah.
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: DOKUMEN PROPOSAL / TOR & RAB (WAJIB) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-[#E8E8EA] flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#181343] flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-[#181343]">
                      Dokumen Proposal / TOR & Dokumen RAB
                    </h2>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Wajib Dilampirkan
                    </span>
                  </div>
                  <p className="text-xs text-[#787680]">
                    Unggah berkas proposal formal lengkap yang memuat rancangan kegiatan dan anggaran biaya terperinci.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Informative Notice Box */}
              <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200/80 text-teal-900 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-teal-950">Rujukan Tunggal Rencana Pelaksanaan & RAB</p>
                  <p className="text-[11px] text-teal-800 leading-relaxed">
                    Dokumen ini adalah satu-satunya sumber rujukan kegiatan dan rincian RAB yang akan ditinjau oleh pihak perusahaan. Setelah proposal disetujui, isi rencana kegiatan dalam dokumen ini akan ditransformasikan menjadi tahapan milestone monitoring yang disepakati bersama.
                  </p>
                </div>
              </div>

              {/* Mode Toggle: Berkas atau URL Eksternal */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                    uploadMode === "file"
                      ? "bg-[#181343] text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-[#E8E8EA]"
                  }`}
                >
                  Unggah Berkas (PDF/DOCX/XLSX)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                    uploadMode === "url"
                      ? "bg-[#181343] text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-[#E8E8EA]"
                  }`}
                >
                  Tautan Cloud (Google Drive / URL)
                </button>
              </div>

              {uploadMode === "file" ? (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!uploadedFile && !documentUrl ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E8E8EA] hover:border-[#181343] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-[#E8E8EA] flex items-center justify-center mx-auto text-[#181343] group-hover:scale-105 transition-transform">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <div className="mt-3">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                          {isUploading ? "Mengunggah berkas proposal..." : "Klik untuk pilih berkas proposal & RAB"}
                        </span>
                        <span className="text-[11px] text-[#787680] mt-1 block">
                          Format didukung: PDF, DOCX, XLSX, XLS (Maksimal 15MB)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
                          <FileCheck2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {uploadedFile?.name || documentUrl.split("/").pop()}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {uploadedFile?.size
                              ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Berkas Terlampir`
                              : "Dokumen proposal terunggah"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {documentUrl && (
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-[#181343] hover:bg-slate-50 rounded-xl transition"
                            title="Buka Dokumen"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Hapus berkas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Tautan Dokumen Cloud (Google Drive / OneDrive / Dropbox) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={documentUrl}
                      onChange={(e) => setDocumentUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                    />
                    {documentUrl && (
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#181343]"
                        title="Uji Tautan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-[#787680]">
                    Pastikan hak akses tautan disetel menjadi <strong>"Dapat dilihat oleh siapa saja yang memiliki link"</strong> agar dapat diakses oleh tim peninjau perusahaan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Sidebar Ringkasan & Checklist Kelengkapan (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5 sticky top-20">
          {/* 1. Ringkasan Peluang CSR Sasaran */}
          <div className="bg-white rounded-2xl border border-[#E8E8EA] shadow-2xs p-5 space-y-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ringkasan Peluang Target
            </span>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm leading-snug">
                {opportunity.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">{opportunity.companyName || "Perusahaan Penyelenggara"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E8EA] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#787680]">Fokus Bidang:</span>
                <Badge variant={focusConfig.variant} size="sm">
                  {focusConfig.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#787680]">Lokasi Sasaran:</span>
                <span className="font-medium text-slate-900 truncate max-w-[160px] text-right">
                  {[opportunity.targetCity, opportunity.targetProvince].filter(Boolean).join(", ") || "Seluruh Wilayah"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#787680]">Pagu Anggaran:</span>
                <span className="font-bold text-teal-700">
                  {opportunity.estimatedBudget ? formatRupiah(opportunity.estimatedBudget) : "Sesuai Usulan"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#787680]">Batas Pengajuan:</span>
                <span className="font-medium text-slate-900">
                  {opportunity.deadline ? formatDate(opportunity.deadline) : "Terbuka"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Indikator Kelengkapan Formulir Proposal (0-100%) */}
          <div className="bg-white rounded-2xl border border-[#E8E8EA] shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Kelengkapan Formulir
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  completenessDetails.isAllComplete
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {completenessDetails.percentage}% Lengkap
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  completenessDetails.isAllComplete ? "bg-emerald-500" : "bg-[#181343]"
                }`}
                style={{ width: `${completenessDetails.percentage}%` }}
              />
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 pt-1 text-xs">
              {completenessDetails.checks.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      item.completed
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 border border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className={item.completed ? "font-medium text-slate-900" : "text-slate-500"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Alur Kerja Sama Selanjutnya (Next Steps Info) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
              Tahapan Setelah Mengajukan
            </span>
            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#181343] shrink-0">1.</span>
                <span><strong>Peninjauan Proposal:</strong> Tim CSR meninjau kesesuaian substansi proposal dan dokumen formal yang diajukan.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#181343] shrink-0">2.</span>
                <span><strong>Finalisasi Rencana:</strong> Setelah disetujui, rencana kegiatan dari dokumen disusun menjadi milestone bersama (dapat dibantu AI) dan dikonfirmasi lembaga Anda.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#181343] shrink-0">3.</span>
                <span><strong>MoU & Monitoring:</strong> Kesepakatan MoU disahkan dan milestone langsung menjadi tahapan monitoring lapangan tanpa input ulang.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sticky Action Bar di Bagian Bawah */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-sm border border-[#E8E8EA] p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCancel}
            className="text-xs font-semibold text-slate-700 hover:bg-slate-50 border-[#E8E8EA] rounded-xl cursor-pointer"
          >
            Batal & Kembali
          </Button>

          <div className="hidden sm:block text-xs text-[#787680]">
            Total Usulan Anggaran:{" "}
            <strong className="text-slate-900 font-bold">
              {numericBudget > 0 ? formatRupiah(numericBudget) : "Belum diisi"}
            </strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setShowOptimizerModal(true)}
            disabled={isSubmitting || isUploading}
            className="w-full sm:w-auto border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Optimalkan dengan AI</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOpenConfirmation}
            disabled={isSubmitting || isUploading}
            className="w-full sm:w-auto bg-[#181343] hover:bg-[#26224C] text-white text-xs sm:text-sm font-semibold rounded-xl px-6 py-2.5 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengirim Proposal...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Proposal CSR</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal Konfirmasi Pengiriman Proposal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E8E8EA] p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#181343]">
                Konfirmasi Pengajuan Proposal CSR
              </h3>
              <p className="text-xs text-[#787680] leading-relaxed">
                Proposal inisiatif Anda akan dikirimkan kepada tim CSR <strong>{opportunity.companyName || "Perusahaan"}</strong> untuk ditinjau.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Judul Proposal:</span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-[240px]">
                  {title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Anggaran:</span>
                <span className="font-bold text-teal-700">{formatRupiah(numericBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durasi Pelaksanaan:</span>
                <span className="font-semibold text-slate-900">{durationMonths} Bulan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dokumen Lampiran:</span>
                <span className="font-semibold text-teal-800 truncate max-w-[220px]">
                  {uploadedFile?.name || "Dokumen Formal Terlampir"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Setelah proposal disetujui secara substansi, rencana kegiatan dalam dokumen proposal akan disusun bersama menjadi milestone terstruktur sebelum pengesahan MoU.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                className="text-xs rounded-xl"
              >
                Kembali Periksa
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold rounded-xl px-5"
              >
                {isSubmitting ? "Mengirim..." : "Ya, Kirim Proposal Sekarang"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal AI Proposal Optimizer */}
      <ProposalOptimizerModal
        isOpen={showOptimizerModal}
        onClose={() => setShowOptimizerModal(false)}
        opportunityId={opportunity.id}
        opportunityTitle={opportunity.title}
        proposalData={{
          title,
          summary,
          proposedBudget: numericBudget,
          durationMonths,
          targetBeneficiaries,
          documentUrl,
        }}
        onApplySuggestedSummary={(newSummary) => {
          setSummary(newSummary);
        }}
      />
    </div>
  );
}
