"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  FileCheck2,
  Calendar,
  Users,
  Building2,
  HeartHandshake,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  MessageSquare,
  Check,
  Ban,
  MapPin,
  FileUp,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyCollaborationItem } from "./types";
import { formatRupiah, formatDate } from "./helpers";

interface CollaborationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboration: CompanyCollaborationItem | null;
  onSuccess: () => void;
  onOpenChat?: (collaborationId: string) => void;
}

function ModalPartnerLogo({ logoUrl, name }: { logoUrl?: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => {
    if (!name) return "MP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }, [name]);

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="w-10 h-10 rounded-xl object-cover border border-[#E8E8EA] shrink-0"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-[#181343] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
      {initials}
    </div>
  );
}

export function CollaborationDetailModal({
  isOpen,
  onClose,
  collaboration,
  onSuccess,
  onOpenChat,
}: CollaborationDetailModalProps) {
  const [finalBudget, setFinalBudget] = useState("");
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mouDocumentUrl, setMouDocumentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"NEGOTIATION" | "AGREED" | "CANCELLED">("NEGOTIATION");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (collaboration) {
      setFinalBudget(collaboration.finalBudget ? String(parseFloat(collaboration.finalBudget)) : "");
      setTargetBeneficiaries(collaboration.targetBeneficiaries || "");
      setStartDate(collaboration.startDate ? collaboration.startDate.substring(0, 10) : "");
      setEndDate(collaboration.endDate ? collaboration.endDate.substring(0, 10) : "");
      setMouDocumentUrl(collaboration.mouDocumentUrl || "");
      setNotes(collaboration.notes || "");
      setStatus(collaboration.status);
      setErrorMsg(null);
      setIsEditingUrl(false);
    }
  }, [collaboration]);

  if (!isOpen || !collaboration) return null;

  const isAgreed = collaboration.status === "AGREED";
  const isCancelled = collaboration.status === "CANCELLED";
  const isNegotiation = collaboration.status === "NEGOTIATION";

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setFinalBudget(raw);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah berkas MoU");
      }

      if (json.data?.url) {
        setMouDocumentUrl(json.data.url);
        setIsEditingUrl(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunggah dokumen. Pastikan ukuran file < 10MB.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (targetStatus?: "NEGOTIATION" | "AGREED" | "CANCELLED") => {
    setErrorMsg(null);
    const chosenStatus = targetStatus || status;

    const budgetNum = parseFloat(finalBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setErrorMsg("Anggaran final kesepakatan harus lebih dari Rp 0");
      return;
    }

    if (chosenStatus === "AGREED" && !mouDocumentUrl.trim()) {
      if (!confirm("Tautan dokumen MoU/PKS masih kosong. Apakah Anda ingin tetap mengesahkan kolaborasi ini sekarang?")) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      const res = await fetch(`/api/collaborations/${collaboration.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          finalBudget: budgetNum,
          targetBeneficiaries: targetBeneficiaries.trim() || null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          mouDocumentUrl: mouDocumentUrl.trim() || null,
          notes: notes.trim() || null,
          status: chosenStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui kesepakatan");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memperbarui kesepakatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-[92vw] max-w-[1080px] bg-white rounded-2xl shadow-2xl border border-[#E8E8EA] flex flex-col max-h-[90vh] overflow-hidden">
        {/* ============================================================ */}
        {/* 1. Header Minimalis Putih */}
        {/* ============================================================ */}
        <div className="px-6 py-4 sm:py-5 border-b border-[#E8E8EA] flex items-center justify-between bg-white shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-[#181343] tracking-tight">
                Detail Kesepakatan &amp; MoU
              </h2>
              {isAgreed ? (
                <Badge variant="emerald" size="sm">
                  MoU Disepakati
                </Badge>
              ) : isNegotiation ? (
                <Badge variant="amber" size="sm">
                  Tahap Negosiasi
                </Badge>
              ) : (
                <Badge variant="rose" size="sm">
                  Dibatalkan
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#787680]">
              Kelola informasi dan dokumen kesepakatan kerja sama CSR.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* 2. Scrollable Body: Layout Dua Kolom */}
        {/* ============================================================ */}
        <div className="p-6 sm:p-7 overflow-y-auto overflow-x-hidden flex-1 space-y-6 text-sm bg-white">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ======================================================== */}
            {/* KOLOM KIRI (~65%): Informasi Kesepakatan Program */}
            {/* ======================================================== */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              {/* Snapshot Program & Inisiatif */}
              <div className="p-4 sm:p-4.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#787680] block">
                  Program CSR &amp; Inisiatif Terkait
                </span>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#181343] leading-snug">
                      {collaboration.proposalTitle || collaboration.opportunityTitle || "Program Kemitraan CSR"}
                    </h3>
                    <div className="text-xs text-[#787680]">
                      Peluang CSR:{" "}
                      <span className="font-semibold text-slate-700">
                        {collaboration.opportunityTitle || "Inisiatif CSR"}
                      </span>
                    </div>
                  </div>

                  {collaboration.proposedBudget && (
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[11px] text-[#787680] block">Usulan Awal Mitra</span>
                      <span className="text-xs font-bold text-slate-700">
                        {formatRupiah(collaboration.proposedBudget)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid Field Kesepakatan (2 Kolom) */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#181343]">
                  Klausul &amp; Parameter Program
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 1: Nilai Anggaran Disepakati */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nilai Anggaran Disepakati <span className="text-rose-500">*</span>
                    </label>
                    {isAgreed || isCancelled ? (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-0.5">
                        <div className="text-base font-extrabold text-[#009E75]">
                          {formatRupiah(finalBudget || collaboration.finalBudget || "0")}
                        </div>
                        {collaboration.proposedBudget &&
                          finalBudget &&
                          parseFloat(finalBudget) !== parseFloat(collaboration.proposedBudget) && (
                            <span className="text-[10px] text-slate-400 block line-through">
                              Usulan Awal: {formatRupiah(collaboration.proposedBudget)}
                            </span>
                          )}
                      </div>
                    ) : (
                      <div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                          <input
                            type="text"
                            value={finalBudget ? Number(finalBudget).toLocaleString("id-ID") : ""}
                            onChange={handleBudgetChange}
                            placeholder="0"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-sm focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 font-bold text-[#181343] placeholder:text-slate-300"
                          />
                        </div>
                        {finalBudget && (
                          <span className="text-[11px] text-[#009E75] font-semibold mt-1 block">
                            {formatRupiah(finalBudget)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Field 2: Target Penerima Manfaat */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Penerima Manfaat
                    </label>
                    {isAgreed || isCancelled ? (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] min-h-[46px] flex items-center">
                        <div className="text-xs font-semibold text-[#181343]">
                          {targetBeneficiaries || "-"}
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={targetBeneficiaries}
                          onChange={(e) => setTargetBeneficiaries(e.target.value)}
                          placeholder="Contoh: 150 KK Nelayan & 50 Pemuda Desa"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343] placeholder:text-slate-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Field 3: Tanggal Mulai Program */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tanggal Mulai Program
                    </label>
                    {isAgreed || isCancelled ? (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] min-h-[46px] flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-[#181343]">
                          {startDate ? formatDate(startDate) : "Belum Ditentukan"}
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Field 4: Tanggal Selesai Program */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tanggal Selesai Program
                    </label>
                    {isAgreed || isCancelled ? (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] min-h-[46px] flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-[#181343]">
                          {endDate ? formatDate(endDate) : "Belum Ditentukan"}
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Field 5: Catatan Negosiasi & Klausul Khusus */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Catatan Negosiasi &amp; Ketentuan Khusus
                  </label>
                  {isAgreed || isCancelled ? (
                    notes && notes.trim() ? (
                      <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-xs text-slate-700 leading-relaxed italic">
                        "{notes}"
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-xs text-slate-400 italic">
                        Tidak ada catatan atau klausul khusus yang dicantumkan.
                      </div>
                    )
                  ) : (
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tuliskan catatan khusus terkait termin pembayaran, mekanisme pelaporan berkala, atau PIC operasional di lapangan..."
                      className="w-full p-3.5 rounded-xl border border-[#E8E8EA] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343] placeholder:text-slate-400 leading-relaxed"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* KOLOM KANAN (~35%): Para Pihak, Dokumen & Kesiapan */}
            {/* ======================================================== */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              {/* Card 1: Para Pihak Kemitraan */}
              <div className="p-4 rounded-xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#787680] block">
                  Para Pihak Kerja Sama
                </span>

                <div className="space-y-2.5">
                  {/* Perusahaan Sponsor */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA]">
                    <div className="w-9 h-9 rounded-xl bg-[#181343]/10 text-[#181343] flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[#787680] uppercase font-semibold block">
                        Perusahaan Sponsor
                      </span>
                      <h4 className="font-bold text-[#181343] text-xs truncate">
                        {collaboration.companyName || "Perusahaan CSR"}
                      </h4>
                      {collaboration.companyEmail && (
                        <span className="text-[11px] text-slate-500 block truncate">
                          {collaboration.companyEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mitra Pelaksana */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA]">
                    <ModalPartnerLogo logoUrl={collaboration.partnerLogo} name={collaboration.partnerName || "Mitra"} />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[#787680] uppercase font-semibold block">
                        Mitra Pelaksana
                      </span>
                      <h4 className="font-bold text-[#181343] text-xs truncate">
                        {collaboration.partnerName || "Mitra Pelaksana"}
                      </h4>
                      {collaboration.partnerCity && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {collaboration.partnerCity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Dokumen MoU / Perjanjian Kerja Sama */}
              <div className="p-4 rounded-xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#787680]">
                    Dokumen MoU / PKS
                  </span>
                  {isAgreed ? (
                    <Badge variant="emerald" size="sm">
                      Telah Disepakati
                    </Badge>
                  ) : mouDocumentUrl ? (
                    <Badge variant="amber" size="sm">
                      Dalam Proses
                    </Badge>
                  ) : (
                    <Badge variant="slate" size="sm">
                      Belum Diunggah
                    </Badge>
                  )}
                </div>

                {/* Kondisi Jika Dokumen Tersedia dan Bukan Sedang Ganti URL */}
                {mouDocumentUrl && !isEditingUrl ? (
                  <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#009E75] flex items-center justify-center shrink-0 mt-0.5">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#181343] block">
                          Naskah Dokumen MoU / PKS
                        </span>
                        <span className="text-[10px] text-[#787680] block truncate">
                          Dokumen Perjanjian Kerja Sama
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={mouDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-lg bg-[#181343] hover:bg-[#25205c] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat Dokumen</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>

                      {!isAgreed && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => setIsEditingUrl(true)}
                          className="py-2 px-2.5 rounded-lg border border-[#E8E8EA] hover:bg-slate-100 text-xs text-slate-600 transition"
                          title="Perbarui Tautan Dokumen"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Form Input / Upload Dokumen */
                  <div className="space-y-2">
                    {isAgreed || isCancelled ? (
                      <div className="p-3.5 text-center rounded-xl bg-[#F9F9FB] border border-dashed border-[#E8E8EA] text-xs text-[#787680]">
                        Dokumen MoU Belum Tersedia
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="url"
                            value={mouDocumentUrl}
                            onChange={(e) => setMouDocumentUrl(e.target.value)}
                            placeholder="Tautan URL berkas (Google Drive / PDF)..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8E8EA] text-xs text-[#181343] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#181343]/10"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-1.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-600 flex items-center justify-center gap-1.5 cursor-pointer transition">
                            <FileUp className="w-3.5 h-3.5 text-slate-500" />
                            <span>{isUploading ? "Mengunggah..." : "Unggah Berkas PDF"}</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              disabled={isUploading}
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>

                          {isEditingUrl && (
                            <button
                              type="button"
                              onClick={() => setIsEditingUrl(false)}
                              className="py-1.5 px-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-100"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Card 3: Linimasa & Status Kesiapan */}
              <div className="p-4 rounded-xl bg-white border border-[#E8E8EA] shadow-2xs space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#787680] block">
                  Linimasa &amp; Kesiapan Kerja Sama
                </span>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-[#787680]">Dibuat:</span>
                    <span className="font-semibold text-slate-800">{formatDate(collaboration.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#787680]">Disepakati:</span>
                    <span className="font-semibold text-slate-800">
                      {collaboration.agreedAt ? formatDate(collaboration.agreedAt) : "Belum Disahkan"}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  {isAgreed ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 leading-relaxed font-medium">
                      Kesepakatan MoU telah disetujui para pihak. Program siap dipantau pada modul Monitoring.
                    </div>
                  ) : isNegotiation ? (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed font-medium">
                      Tahap pembahasan butir kesepakatan dan penyusunan naskah MoU bersama mitra pelaksana.
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-[11px] text-rose-800 leading-relaxed font-medium">
                      Kerja sama ini telah dibatalkan.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. Sticky Footer Modal */}
        {/* ============================================================ */}
        <div className="px-6 py-3.5 sm:py-4 border-t border-[#E8E8EA] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenChat && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-[#E8E8EA] text-slate-700 hover:bg-slate-50 rounded-xl"
                onClick={() => {
                  onClose();
                  onOpenChat(collaboration.id);
                }}
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-slate-500" />}
              >
                Chat Negosiasi
              </Button>
            )}

            {!isAgreed && !isCancelled && (
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs rounded-xl"
                onClick={() => handleSubmit("CANCELLED")}
                leftIcon={<Ban className="w-3.5 h-3.5" />}
              >
                Batalkan Kolaborasi
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {isAgreed || isCancelled ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onClose}
                className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl px-5 py-2.5 cursor-pointer shadow-2xs"
              >
                Tutup
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-xs text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Batal
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("NEGOTIATION")}
                  className="text-xs font-semibold text-slate-700 border-[#E8E8EA] hover:bg-slate-50 rounded-xl"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#009E75] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 shadow-2xs cursor-pointer"
                  onClick={() => handleSubmit("AGREED")}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  {isSubmitting ? "Mengesahkan..." : "Sahkan & Sepakati MoU"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
