"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  DollarSign,
  Calendar,
  Users,
  Building2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MessageSquareQuote,
  ShieldCheck,
  Send,
  HeartHandshake,
  Check,
  Download,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyProposalItem } from "./types";
import { PROPOSAL_STATUS_CONFIG, FOCUS_AREA_CONFIG, formatRupiah, formatDate } from "./helpers";

interface ReviewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: CompanyProposalItem | null;
  onSuccess: () => void;
}

export function ReviewProposalModal({
  isOpen,
  onClose,
  proposal,
  onSuccess,
}: ReviewProposalModalProps) {
  const [decisionStatus, setDecisionStatus] = useState<
    "UNDER_REVIEW" | "REVISION_REQUESTED" | "ACCEPTED" | "REJECTED"
  >("ACCEPTED");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (proposal) {
      if (proposal.status === "UNDER_REVIEW") {
        setDecisionStatus("ACCEPTED");
      } else if (proposal.status === "SUBMITTED") {
        setDecisionStatus("ACCEPTED");
      } else {
        setDecisionStatus(proposal.status as any);
      }
      setFeedback(proposal.feedback || "");
      setErrorMsg(null);
    }
  }, [proposal]);

  if (!isOpen || !proposal) return null;

  const currentStatusCfg = PROPOSAL_STATUS_CONFIG[proposal.status] || {
    label: proposal.status,
    variant: "slate" as const,
  };

  const isAlreadyAccepted = proposal.status === "ACCEPTED";
  const isWithdrawn = proposal.status === "WITHDRAWN";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (decisionStatus === "REVISION_REQUESTED" && (!feedback.trim() || feedback.trim().length < 5)) {
      setErrorMsg("Mohon sertakan catatan umpan balik / poin revisi untuk mitra minimal 5 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login telah berakhir");

      const res = await fetch(`/api/proposals/${proposal.id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: decisionStatus,
          feedback: feedback.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui status proposal");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses evaluasi");
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Evaluasi Proposal Mitra</h2>
                <Badge variant={currentStatusCfg.variant} size="sm" hasDot>
                  {currentStatusCfg.label}
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

        {/* Sub Header: Mitra Profile & Opportunity Info */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {proposal.partnerLogo ? (
              <img
                src={proposal.partnerLogo}
                alt={proposal.partnerName || "Logo"}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 border border-teal-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Mitra Pengaju
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm truncate">
                {proposal.partnerName || "Mitra Pelaksana"}
              </h4>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                {proposal.partnerCity && <span>{proposal.partnerCity}</span>}
                {proposal.partnerEmail && <span>• {proposal.partnerEmail}</span>}
              </div>
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-400 block font-medium">Usulan Anggaran</span>
            <span className="text-base font-extrabold text-emerald-600">
              {formatRupiah(proposal.proposedBudget)}
            </span>
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

          {/* Target Inisiatif Opportunity */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-500">Inisiatif CSR:</span>
              <span className="font-bold text-slate-900">{proposal.opportunityTitle}</span>
            </div>
          </div>

          {/* Judul & Ringkasan Teknis Proposal */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Judul Proposal Kegiatan
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-snug">
              {proposal.title}
            </h3>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ringkasan Teknis & Metodologi Pelaksanaan
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line text-xs">
              {proposal.summary}
            </div>
          </div>

          {/* Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Estimasi Durasi</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {proposal.durationMonths ? `${proposal.durationMonths} Bulan Pelaksanaan` : "Fleksibel"}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Target Penerima Manfaat</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {proposal.targetBeneficiaries || "Masyarakat Umum"}
              </p>
            </div>
          </div>

          {/* Tautan Dokumen Pendukung */}
          {proposal.documentUrl && (() => {
            const isLocalUpload = proposal.documentUrl.startsWith("/uploads/");
            const fileName = isLocalUpload
              ? proposal.documentUrl.split("/").pop()
              : proposal.documentUrl;

            return (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-600/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-950 truncate">
                        Dokumen Proposal & TOR Mitra
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800">
                        {isLocalUpload ? "Berkas Server" : "Cloud Link"}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 block truncate mt-0.5">
                      {fileName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={proposal.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{isLocalUpload ? "Lihat / Unduh" : "Buka Tautan"}</span>
                    {isLocalUpload ? (
                      <Download className="w-3.5 h-3.5" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5" />
                    )}
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Previous Review Feedback info if already reviewed */}
          {proposal.reviewedAt && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Terakhir dievaluasi pada {formatDate(proposal.reviewedAt)} oleh{" "}
                  {proposal.reviewedByName || "Admin CSR"}
                </span>
              </div>
              {proposal.feedback && (
                <p className="text-slate-700 italic pt-1">
                  "{proposal.feedback}"
                </p>
              )}
            </div>
          )}

          {/* FORM EVALUASI & KEPUTUSAN */}
          {!isWithdrawn ? (
            <form id="review-form" onSubmit={handleSubmit} className="pt-4 border-t border-slate-100 space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Keputusan Evaluasi Perusahaan <span className="text-rose-500">*</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Pilihan 1: ACCEPTED */}
                  <label
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-1.5 ${
                      decisionStatus === "ACCEPTED"
                        ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Setujui</span>
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={decisionStatus === "ACCEPTED"}
                        onChange={() => setDecisionStatus("ACCEPTED")}
                        className="text-emerald-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Membentuk kontrak kolaborasi tahap Negosiasi
                    </span>
                  </label>

                  {/* Pilihan 2: UNDER_REVIEW */}
                  <label
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-1.5 ${
                      decisionStatus === "UNDER_REVIEW"
                        ? "border-blue-500 bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Dalam Tinjauan</span>
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={decisionStatus === "UNDER_REVIEW"}
                        onChange={() => setDecisionStatus("UNDER_REVIEW")}
                        className="text-blue-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Mengkaji kelayakan bersama tim internal
                    </span>
                  </label>

                  {/* Pilihan 3: REVISION_REQUESTED */}
                  <label
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-1.5 ${
                      decisionStatus === "REVISION_REQUESTED"
                        ? "border-amber-500 bg-amber-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                        <span>Minta Revisi</span>
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={decisionStatus === "REVISION_REQUESTED"}
                        onChange={() => setDecisionStatus("REVISION_REQUESTED")}
                        className="text-amber-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Minta mitra menyesuaikan proposal / anggaran
                    </span>
                  </label>

                  {/* Pilihan 4: REJECTED */}
                  <label
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-1.5 ${
                      decisionStatus === "REJECTED"
                        ? "border-rose-500 bg-rose-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Tolak</span>
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={decisionStatus === "REJECTED"}
                        onChange={() => setDecisionStatus("REJECTED")}
                        className="text-rose-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Belum sesuai kriteria inisiatif CSR
                    </span>
                  </label>
                </div>
              </div>

              {/* Catatan / Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan Evaluasi & Umpan Balik kepada Mitra{" "}
                  {decisionStatus === "REVISION_REQUESTED" && (
                    <span className="text-rose-500">* (Wajib diisi untuk permintaan revisi)</span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    decisionStatus === "REVISION_REQUESTED"
                      ? "Tuliskan poin-poin yang perlu diperbaiki atau disesuaikan oleh mitra (misal: penyesuaian rincian anggaran, revisi timeline, dokumen pendukung)..."
                      : "Berikan catatan penilaian, apresiasi, atau poin penyesuaian yang perlu didiskusikan..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Catatan ini akan dapat dibaca langsung oleh mitra pada dashboard mereka.
                </span>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-xs italic">
              Proposal ini telah ditarik oleh pihak mitra, sehingga tidak dapat dievaluasi lebih lanjut.
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Tutup
          </Button>

          {!isWithdrawn && (
            <Button
              type="submit"
              form="review-form"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className={
                decisionStatus === "ACCEPTED"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  : decisionStatus === "REJECTED"
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                  : decisionStatus === "REVISION_REQUESTED"
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              }
              leftIcon={
                decisionStatus === "REVISION_REQUESTED" ? (
                  <RotateCcw className="w-4 h-4" />
                ) : decisionStatus === "REJECTED" ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )
              }
            >
              {isSubmitting
                ? "Menyimpan..."
                : decisionStatus === "ACCEPTED"
                ? "Setujui & Buat Kolaborasi"
                : decisionStatus === "REJECTED"
                ? "Tolak Proposal Ini"
                : decisionStatus === "REVISION_REQUESTED"
                ? "Kirim Permintaan Revisi"
                : "Tandai Dalam Tinjauan"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
