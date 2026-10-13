"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  DollarSign,
  Calendar,
  Users,
  Link2,
  Building2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpportunityItem } from "./types";
import { FOCUS_AREA_CONFIG, formatRupiah, formatDate } from "./helpers";

interface SubmitProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityItem | null;
  onSuccess: () => void;
}

export function SubmitProposalModal({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
}: SubmitProposalModalProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [durationMonths, setDurationMonths] = useState<number | "">(3);
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !opportunity) return null;

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setProposedBudget(raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg("Judul proposal minimal 3 karakter");
      return;
    }
    if (!summary.trim() || summary.trim().length < 10) {
      setErrorMsg("Ringkasan teknis minimal 10 karakter");
      return;
    }
    const budgetNum = parseFloat(proposedBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setErrorMsg("Anggaran yang diajukan harus lebih dari Rp 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Sesi login berakhir. Harap login kembali.");
      }

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          title: title.trim(),
          summary: summary.trim(),
          proposedBudget: budgetNum,
          durationMonths: durationMonths ? Number(durationMonths) : null,
          targetBeneficiaries: targetBeneficiaries.trim() || null,
          documentUrl: documentUrl.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengajukan proposal");
      }

      // Berhasil
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mengirim proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusConfig = FOCUS_AREA_CONFIG[opportunity.focusArea] || {
    label: opportunity.focusArea,
    variant: "slate" as const,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Ajukan Proposal Inisiatif</h2>
              <p className="text-xs text-slate-300">
                Kirim proposal penawaran resmi kepada perusahaan pengelola CSR
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

        {/* Opportunity Context Banner */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Target Inisiatif:</span>
              <Badge variant={focusConfig.variant} size="sm">
                {focusConfig.label}
              </Badge>
            </div>
            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{opportunity.title}</h4>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{opportunity.companyName || "Perusahaan CSR"}</span>
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] text-slate-400 block font-medium">Estimasi Anggaran Perusahaan</span>
            <span className="text-sm font-extrabold text-emerald-600">
              {formatRupiah(opportunity.estimatedBudget)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Judul Proposal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Proposal Inisiatif <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Program Revitalisasi Terumbu Karang Teluk Ambon"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Ringkasan & Metodologi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ringkasan Teknis & Metodologi Pelaksanaan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Jelaskan secara ringkas latar belakang masalah, metode pelaksanaan kegiatan di lapangan, tahap timeline, dan indikator keberhasilan program..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tuliskan minimal 10 karakter ringkasan komprehensif.
            </span>
          </div>

          {/* Anggaran & Durasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Anggaran Diajukan (IDR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  required
                  value={proposedBudget ? Number(proposedBudget).toLocaleString("id-ID") : ""}
                  onChange={handleBudgetChange}
                  placeholder="0"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-slate-900"
                />
              </div>
              {proposedBudget && (
                <span className="text-[11px] text-teal-600 font-semibold mt-1 block">
                  {formatRupiah(proposedBudget)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimasi Durasi (Bulan)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={durationMonths}
                  onChange={(e) =>
                    setDurationMonths(e.target.value ? parseInt(e.target.value, 10) : "")
                  }
                  placeholder="3"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Misal: 3 bulan atau 6 bulan</span>
            </div>
          </div>

          {/* Target Penerima Manfaat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Penerima Manfaat
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={targetBeneficiaries}
                onChange={(e) => setTargetBeneficiaries(e.target.value)}
                placeholder="Contoh: 120 KK Nelayan Pesisir & 50 Pemuda Karang Taruna"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Tautan Dokumen Pendukung */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tautan Dokumen Proposal / TOR (URL Cloud)
            </label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/proposal-full.pdf"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Sertakan tautan Google Drive / Dropbox jika memiliki proposal lengkap berformat PDF.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
              leftIcon={<Send className="w-4 h-4" />}
            >
              {isSubmitting ? "Mengirimkan..." : "Kirimkan Proposal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
