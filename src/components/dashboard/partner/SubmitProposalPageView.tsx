"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  ArrowLeft,
  Building2,
  FileText,
  Send,
  UploadCloud,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Check,
  Sparkles,
  FileCheck2,
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
  // Konteks formulir spesifik berdasarkan bidang fokus
  const contextualData = useMemo(() => {
    const area = opportunity.focusArea || "LAINNYA";
    const titleLower = (opportunity.title || "").toLowerCase();

    if (area === "PENDIDIKAN" || titleLower.includes("literasi") || titleLower.includes("sekolah")) {
      return {
        titlePlaceholder: "Contoh: Penguatan Literasi Siswa & Pojok Baca Inklusif Pedesaan",
        summaryPlaceholder:
          "Uraikan pendekatan teknis, metodologi pendampingan, sasaran capaian siswa, serta mekanisme evaluasi keberlanjutan program...",
        beneficiariesPlaceholder: "Contoh: 350 siswa sekolah dasar dan 25 guru pendamping",
        defaultDuration: 6,
      };
    }

    if (area === "KESEHATAN" || titleLower.includes("stunting") || titleLower.includes("gizi")) {
      return {
        titlePlaceholder: "Contoh: Intervensi Gizi Terpadu & Edukasi Sanitasi Pencegahan Stunting",
        summaryPlaceholder:
          "Jelaskan metode pendampingan posyandu, penyaluran pangan lokal bergizi, pemantauan kurva KMS, serta edukasi PHBS...",
        beneficiariesPlaceholder: "Contoh: 200 ibu hamil dan balita risiko stunting",
        defaultDuration: 6,
      };
    }

    if (area === "LINGKUNGAN" || titleLower.includes("sampah") || titleLower.includes("pohon")) {
      return {
        titlePlaceholder: "Contoh: Konservasi Sumber Mata Air & Pemberdayaan Bank Sampah Komunitas",
        summaryPlaceholder:
          "Uraikan rencana penanaman bibit pohon endemik, penguatan fasilitas pemilahan sampah, dan pelibatan kelompok warga...",
        beneficiariesPlaceholder: "Contoh: 300 kepala keluarga di 2 desa penyangga",
        defaultDuration: 6,
      };
    }

    return {
      titlePlaceholder: "Contoh: Program Pengembangan Kapasitas Komunitas & Pemberdayaan Berkelanjutan",
      summaryPlaceholder:
        "Jelaskan latar belakang program, metodologi implementasi lapangan, pelibatan kelompok sasaran, serta strategi kesinambungan dampak...",
      beneficiariesPlaceholder: "Contoh: 250 kepala keluarga dan pemuda desa",
      defaultDuration: 6,
    };
  }, [opportunity]);

  // State Formulir
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [durationMonths, setDurationMonths] = useState<number | "">(contextualData.defaultDuration);
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");

  // Berkas Lampiran Formal (Wajib)
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

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);

  // Parse Anggaran
  const numericBudget = useMemo(() => {
    const parsed = parseFloat(proposedBudget.replace(/[^\d]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }, [proposedBudget]);

  // Perbandingan dengan Pagu Perusahaan
  const companyBudget = opportunity.estimatedBudget ? parseFloat(opportunity.estimatedBudget) : 0;
  const isBudgetExceeding = companyBudget > 0 && numericBudget > companyBudget;
  const budgetDifference = numericBudget - companyBudget;

  // Real-time Indikator Kelengkapan Formulir
  const completenessDetails = useMemo(() => {
    const checks = [
      { id: "title", label: "Judul Proposal Inisiatif", completed: title.trim().length >= 5 },
      { id: "summary", label: "Ringkasan Teknis & Metodologi", completed: summary.trim().length >= 10 },
      { id: "budget", label: "Total Anggaran yang Diajukan", completed: numericBudget > 0 },
      { id: "duration", label: "Estimasi Durasi Pelaksanaan", completed: typeof durationMonths === "number" && durationMonths > 0 },
      { id: "beneficiaries", label: "Target Penerima Manfaat", completed: targetBeneficiaries.trim().length >= 3 },
      { id: "document", label: "Dokumen Proposal & RAB Terlampir", completed: Boolean(documentUrl.trim()) },
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

  // Unggah Berkas Proposal
  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("Ukuran berkas melebihi batas maksimal 15MB.");
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

  // Validasi Sebelum Konfirmasi
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

  // Eksekusi Pengiriman Proposal
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
        "Formulir proposal telah diisi sebagian. Apakah Anda yakin ingin membatalkan pengajuan? Perubahan yang belum dikirim akan hilang."
      );
      if (!confirmLeave) return;
    }
    onBack();
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-150 pb-20">
      {/* 1. Header Halaman (Bersih, Ramping, Bebas Kotak Bertumpuk) */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#181343] transition cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Detail Peluang</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ajukan Proposal Inisiatif CSR
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Pengajuan usulan untuk inisiatif <span className="font-semibold text-slate-800">{opportunity.title}</span> oleh{" "}
              <span className="font-semibold text-slate-800">{opportunity.companyName || "Perusahaan Penyelenggara"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Badge variant={focusConfig.variant} size="md">
              {focusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Error Alert jika validasi gagal */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-rose-900">Periksa Kelengkapan Formulir:</p>
            <p className="text-xs text-rose-700 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2. Dua Kolom: Kolom Kiri Formulir (65%) & Kolom Kanan Ringkasan (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* KOLOM KIRI (lg:col-span-8): FORMULIR UTAMA USULAN                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* BAGIAN 1: INFORMASI USULAN PROGRAM */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2
                className="text-base sm:text-lg font-bold text-[#181343]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Informasi Usulan Program
              </h2>
            </div>

            <div className="space-y-4">
              {/* Judul Proposal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Judul Proposal Inisiatif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul proposal inisiatif"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                />
              </div>

              {/* Ringkasan Teknis & Metodologi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-semibold text-slate-800">
                    Ringkasan Teknis &amp; Metodologi Pelaksanaan <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOptimizerModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#009E75] hover:text-emerald-800 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bantuan AI</span>
                  </button>
                </div>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  placeholder="Uraikan garis besar metodologi intervensi, sasaran capaian, dan keberlanjutan program..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white resize-y min-h-[110px]"
                />
              </div>

              {/* Grid 2 Kolom: Durasi & Target Penerima Manfaat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Durasi Pelaksanaan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Estimasi Durasi Pelaksanaan <span className="text-rose-500">*</span>
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
                      className="w-full pl-3.5 pr-16 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      Bulan
                    </span>
                  </div>
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
                    placeholder="Contoh: 250 kepala keluarga / 50 guru"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN 2: TOTAL ANGGARAN YANG DIAJUKAN */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2
                className="text-base sm:text-lg font-bold text-[#181343]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Rencana Anggaran Biaya (RAB)
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Total Anggaran Proposal (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={proposedBudget}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^\d]/g, "");
                      setProposedBudget(clean);
                    }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[#E5E7EB] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                  />
                </div>
                {numericBudget > 0 && (
                  <p className="text-xs font-semibold text-[#009E75]">
                    Nominal Terbaca: {formatRupiah(numericBudget)}
                  </p>
                )}
              </div>

              {/* Komparasi Anggaran dengan Pagu Perusahaan */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Estimasi Pagu Indikatif:</span>
                  <span className="font-bold text-slate-900">
                    {opportunity.estimatedBudget ? formatRupiah(opportunity.estimatedBudget) : "Sesuai Pengajuan"}
                  </span>
                </div>

                {numericBudget > 0 && companyBudget > 0 && (
                  <div className="pt-2 border-t border-slate-200/60">
                    {isBudgetExceeding ? (
                      <div className="flex items-start gap-2 text-xs text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Anggaran Melebihi Pagu Indikatif</span>
                          <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                            Total anggaran yang diajukan lebih tinggi sebesar {formatRupiah(budgetDifference)} dari estimasi awal. Usulan tetap dapat diajukan dan akan menjadi bahan telaah pada tahap klarifikasi RAB.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Usulan anggaran berada di dalam rentang pagu indikatif perusahaan.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BAGIAN 3: DOKUMEN PROPOSAL & RAB (WAJIB) */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h2
                className="text-base sm:text-lg font-bold text-[#181343]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Dokumen Proposal &amp; Rincian RAB
              </h2>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                Wajib
              </span>
            </div>

            <div className="space-y-4">
              {/* Toggle Mode Unggah: Berkas vs Tautan */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer ${
                    uploadMode === "file"
                      ? "bg-[#181343] text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-[#E5E7EB]"
                  }`}
                >
                  Unggah Berkas (PDF / DOCX / XLSX)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer ${
                    uploadMode === "url"
                      ? "bg-[#181343] text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-[#E5E7EB]"
                  }`}
                >
                  Tautan Dokumen Cloud
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
                      className="border-2 border-dashed border-[#E5E7EB] hover:border-[#181343] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#181343] group-hover:scale-105 transition-transform">
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#009E75]" />
                        ) : (
                          <UploadCloud className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="mt-2.5 space-y-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 block">
                          {isUploading ? "Mengunggah berkas proposal..." : "Klik untuk memilih berkas proposal & RAB"}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Format didukung: PDF, DOCX, XLSX, XLS (Maksimal 15MB)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#009E75] flex items-center justify-center shrink-0 border border-emerald-200">
                          <FileCheck2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {uploadedFile?.name || documentUrl.split("/").pop()}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {uploadedFile?.size
                              ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB - Berkas Terlampir`
                              : "Dokumen proposal terunggah"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {documentUrl && (
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-[#181343] hover:bg-white rounded-lg transition"
                            title="Buka Dokumen"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus berkas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5">
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
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                    />
                    {documentUrl && (
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#181343]"
                        title="Buka Tautan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN (lg:col-span-4): SIDEBAR RINGKASAN & KELENGKAPAN BERKAS       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          {/* 1. Ringkasan Peluang CSR Sasaran */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs space-y-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Inisiatif CSR Sasaran
            </span>

            <div className="space-y-1.5">
              <h3 className="font-bold text-[#181343] text-sm leading-snug">
                {opportunity.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{opportunity.companyName || "Perusahaan Penyelenggara"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bidang Fokus:</span>
                <Badge variant={focusConfig.variant} size="sm">
                  {focusConfig.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Wilayah Sasaran:</span>
                <span className="font-medium text-slate-800 truncate max-w-[170px] text-right">
                  {[opportunity.targetCity, opportunity.targetProvince].filter(Boolean).join(", ") || "Fleksibel"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pagu Indikatif:</span>
                <span className="font-semibold text-[#009E75]">
                  {opportunity.estimatedBudget ? formatRupiah(opportunity.estimatedBudget) : "Sesuai Usulan"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Batas Waktu:</span>
                <span className="font-medium text-slate-800">
                  {opportunity.deadline ? formatDate(opportunity.deadline) : "Terbuka"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Indikator Kelengkapan Formulir Proposal */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Kelengkapan Isian
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                  completenessDetails.isAllComplete
                    ? "bg-emerald-50 text-[#009E75] border border-emerald-200"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {completenessDetails.completedCount} dari {completenessDetails.totalCount} Terisi
              </span>
            </div>

            {/* Progress bar tipis & elegan */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  completenessDetails.isAllComplete ? "bg-[#009E75]" : "bg-[#181343]"
                }`}
                style={{ width: `${completenessDetails.percentage}%` }}
              />
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 pt-1 text-xs">
              {completenessDetails.checks.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      item.completed
                        ? "bg-[#009E75] text-white"
                        : "border border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-2 h-2" />
                  </div>
                  <span className={item.completed ? "font-medium text-slate-800" : "text-slate-500"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sticky Action Bar di Bagian Bawah */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-sm border border-[#E5E7EB] p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="text-xs font-semibold text-slate-700 hover:bg-slate-50 border-[#E5E7EB] rounded-xl cursor-pointer"
          >
            Batal
          </Button>

          <div className="hidden sm:block text-xs text-slate-500">
            Total Usulan Anggaran:{" "}
            <strong className="text-slate-900 font-bold">
              {numericBudget > 0 ? formatRupiah(numericBudget) : "Belum diisi"}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenConfirmation}
            disabled={isSubmitting || isUploading}
            className="w-full sm:w-auto bg-[#181343] hover:bg-[#26224C] text-white font-semibold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mengirim Proposal...</span>
              </>
            ) : (
              <>
                <span>Kirim Proposal Sekarang</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal Konfirmasi Pengiriman Proposal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#181343] border border-slate-200/80 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#181343]">
                Konfirmasi Pengajuan Proposal CSR
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Proposal inisiatif Anda akan dikirimkan kepada tim CSR <strong>{opportunity.companyName || "Perusahaan"}</strong> untuk dievaluasi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Judul Proposal:</span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-[240px]">
                  {title}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Total Anggaran:</span>
                <span className="font-bold text-[#009E75]">{formatRupiah(numericBudget)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Durasi Pelaksanaan:</span>
                <span className="font-semibold text-slate-900">{durationMonths} Bulan</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Dokumen Lampiran:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                  {uploadedFile?.name || "Dokumen Formal Terlampir"}
                </span>
              </div>
            </div>

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
                {isSubmitting ? "Mengirim..." : "Ya, Kirim Proposal"}
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
