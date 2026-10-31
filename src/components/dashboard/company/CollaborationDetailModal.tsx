"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileCheck2,
  DollarSign,
  Calendar,
  Users,
  Building2,
  HeartHandshake,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Sparkles,
  Check,
  Ban,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyCollaborationItem } from "./types";
import { COLLABORATION_STATUS_CONFIG, formatRupiah, formatDate } from "./helpers";

interface CollaborationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboration: CompanyCollaborationItem | null;
  onSuccess: () => void;
  onOpenChat?: (collaborationId: string) => void;
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
    }
  }, [collaboration]);

  if (!isOpen || !collaboration) return null;

  const statusCfg = COLLABORATION_STATUS_CONFIG[collaboration.status] || {
    label: collaboration.status,
    variant: "slate" as const,
  };

  const isAgreed = collaboration.status === "AGREED";
  const isCancelled = collaboration.status === "CANCELLED";

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setFinalBudget(raw);
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
        throw new Error(json.message || "Gagal memperbarui kolaborasi");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-850 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Ruang Kontrak & MoU Kolaborasi</h2>
                <Badge variant={statusCfg.variant} size="sm" hasDot>
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-300">
                Inisiasi Kemitraan Tanggal {formatDate(collaboration.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Both Parties Profile Banner */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Company Side */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Pihak Perusahaan Sponsor
              </span>
              <h4 className="font-extrabold text-slate-900 truncate">
                {collaboration.companyName || "Perusahaan CSR"}
              </h4>
              <span className="text-slate-500 block truncate">{collaboration.companyEmail || "-"}</span>
            </div>
          </div>

          {/* Partner Side */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Pihak Mitra Pelaksana
              </span>
              <h4 className="font-extrabold text-slate-900 truncate">
                {collaboration.partnerName || "Mitra Pelaksana"}
              </h4>
              <span className="text-slate-500 block truncate">{collaboration.partnerCity || "-"}</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Info Status Banner */}
          {isAgreed ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kesepakatan MoU Telah Disahkan! (AGREED)</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Kemitraan ini telah sah pada {formatDate(collaboration.agreedAt || collaboration.updatedAt)}. Program telah otomatis diinisiasi pada sistem eksekusi program.
              </p>
            </div>
          ) : isCancelled ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-950 text-xs">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>Kolaborasi Dibatalkan</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Kesepakatan kemitraan ini telah dibatalkan oleh para pihak selama proses negosiasi.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Fase Negosiasi & Penyusunan Kontrak Kerja Sama (MoU)</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Sesuaikan anggaran final, tanggal pelaksanaan program, dan cantumkan tautan naskah perjanjian kerja sama (MoU/PKS). Klik <strong>"Sahkan Kesepakatan (MoU Agreed)"</strong> untuk meresmikan proyek.
              </p>
            </div>
          )}

          {/* Inisiatif & Proposal Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Inisiatif & Proposal Terpilih
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {collaboration.proposalTitle || collaboration.opportunityTitle}
                </h4>
                <span className="text-xs text-slate-500">
                  Target Program: {collaboration.opportunityTitle}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">Usulan Awal Mitra</span>
                <span className="text-xs font-bold text-slate-700">
                  {formatRupiah(collaboration.proposedBudget)}
                </span>
              </div>
            </div>
          </div>

          {/* Editable Parameters */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Detail Klausul & Anggaran Kesepakatan
            </span>

            {/* Final Budget & Beneficiaries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Anggaran Final Disepakati (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    disabled={isAgreed || isCancelled}
                    value={finalBudget ? Number(finalBudget).toLocaleString("id-ID") : ""}
                    onChange={handleBudgetChange}
                    placeholder="0"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-slate-900 disabled:bg-slate-100"
                  />
                </div>
                {finalBudget && (
                  <span className="text-[11px] text-teal-600 font-semibold mt-1 block">
                    {formatRupiah(finalBudget)}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Penerima Manfaat
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    disabled={isAgreed || isCancelled}
                    value={targetBeneficiaries}
                    onChange={(e) => setTargetBeneficiaries(e.target.value)}
                    placeholder="Contoh: 150 KK Nelayan & 50 Pemuda Desa"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal Mulai Kegiatan
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    disabled={isAgreed || isCancelled}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal Selesai Program
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    disabled={isAgreed || isCancelled}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* MoU Document URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tautan Berkas MoU / PKS Resmi (URL Dokumen Cloud / PDF)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    disabled={isAgreed || isCancelled}
                    value={mouDocumentUrl}
                    onChange={(e) => setMouDocumentUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/mou-signed.pdf"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:bg-slate-100"
                  />
                </div>
                {mouDocumentUrl && (
                  <a
                    href={mouDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
                  >
                    <span>Buka</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Catatan Kesepakatan & Klausul */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Negosiasi / Ketentuan Khusus
              </label>
              <textarea
                rows={3}
                disabled={isAgreed || isCancelled}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan catatan khusus terkait termin pembayaran, mekanisme pelaporan berkala, atau penanggung jawab operasional di lapangan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            {onOpenChat && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100 text-xs"
                onClick={() => {
                  onClose();
                  onOpenChat(collaboration.id);
                }}
                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              >
                Buka Chat Negosiasi
              </Button>
            )}

            {!isAgreed && !isCancelled && (
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                onClick={() => handleSubmit("CANCELLED")}
                leftIcon={<Ban className="w-3.5 h-3.5" />}
              >
                Batalkan Kolaborasi
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
              {isAgreed || isCancelled ? "Tutup" : "Batal"}
            </Button>

            {!isAgreed && !isCancelled && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("NEGOTIATION")}
                  className="text-slate-700 border-slate-300"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Draf Negosiasi"}
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  onClick={() => handleSubmit("AGREED")}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  {isSubmitting ? "Mengesahkan..." : "Sahkan MoU (Agreed)"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
