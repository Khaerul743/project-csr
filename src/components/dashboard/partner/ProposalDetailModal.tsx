"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Users,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalItem } from "./types";
import { PROPOSAL_STATUS_CONFIG, formatRupiah, formatDate } from "./helpers";

interface ProposalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalItem | null;
  onSuccess: () => void;
}

export function ProposalDetailModal({
  isOpen,
  onClose,
  proposal,
  onSuccess,
}: ProposalDetailModalProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);

  if (!isOpen || !proposal) return null;

  const statusConfig = PROPOSAL_STATUS_CONFIG[proposal.status] || {
    label: proposal.status,
    variant: "slate" as const,
  };

  const canWithdraw = proposal.status === "SUBMITTED" || proposal.status === "UNDER_REVIEW";

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      const res = await fetch(`/api/proposals/${proposal.id}/withdraw`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menarik proposal");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setWithdrawError(err.message || "Terjadi kesalahan saat menarik proposal");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-850 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Detail Pengajuan Proposal</h2>
                <Badge variant={statusConfig.variant} size="sm" hasDot>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-300">
                Diajukan pada {formatDate(proposal.createdAt)}
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

        {/* Opportunity Context Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block">
              Inisiatif Target
            </span>
            <h4 className="font-bold text-slate-900 text-sm">{proposal.opportunityTitle || "Peluang CSR"}</h4>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{proposal.companyName || "Perusahaan CSR"}</span>
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] text-slate-400 block font-medium">Anggaran yang Diajukan</span>
            <span className="text-base font-extrabold text-teal-600">
              {formatRupiah(proposal.proposedBudget)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Status Feedback Alert if any */}
          {proposal.status === "ACCEPTED" && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Proposal Disetujui! Proyek Masuk Tahap Kolaborasi</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Perusahaan telah menerima tawaran inisiatif ini. Kolaborasi resmi telah dibentuk dan tim perusahaan akan segera berkoordinasi untuk penandatanganan kesepakatan (MoU/Perjanjian Kerja Sama).
              </p>
            </div>
          )}

          {proposal.status === "REJECTED" && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Proposal Belum Diterima</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Mohon maaf, proposal ini belum dapat disetujui oleh pihak perusahaan pada siklus inisiatif kali ini.
              </p>
            </div>
          )}

          {proposal.feedback && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <MessageSquareQuote className="w-4 h-4 text-teal-600" />
                <span>Catatan / Feedback dari Perusahaan:</span>
              </div>
              <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100">
                "{proposal.feedback}"
              </p>
            </div>
          )}

          {/* Judul & Ringkasan */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Judul Proposal
            </span>
            <h3 className="text-base font-extrabold text-slate-900">{proposal.title}</h3>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ringkasan Teknis & Metodologi
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line text-xs">
              {proposal.summary}
            </div>
          </div>

          {/* Key Parameters Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Estimasi Durasi</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {proposal.durationMonths ? `${proposal.durationMonths} Bulan` : "Fleksibel"}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Target Penerima Manfaat</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {proposal.targetBeneficiaries || "-"}
              </p>
            </div>
          </div>

          {/* Document URL */}
          {proposal.documentUrl && (
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-teal-900 block truncate">
                    Dokumen Proposal Lengkap
                  </span>
                  <span className="text-[11px] text-teal-700 block truncate">
                    {proposal.documentUrl}
                  </span>
                </div>
              </div>

              <a
                href={proposal.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Buka Berkas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Withdraw Error if any */}
          {withdrawError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{withdrawError}</span>
            </div>
          )}

          {/* Confirm Withdraw Box */}
          {showConfirmWithdraw && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold">Konfirmasi Penarikan Proposal</h5>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Apakah Anda yakin ingin menarik kembali proposal ini? Tindakan ini akan membatalkan proses evaluasi oleh perusahaan.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmWithdraw(false)}
                  disabled={isWithdrawing}
                >
                  Batal
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? "Menarik..." : "Ya, Tarik Proposal"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            {canWithdraw && !showConfirmWithdraw && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmWithdraw(true)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Tarik Proposal
              </Button>
            )}
          </div>

          <Button variant="ghost" size="md" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
