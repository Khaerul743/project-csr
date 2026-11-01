"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Sparkles,
  RefreshCw,
  Copy,
  TrendingUp,
  Layers,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyProposalItem } from "./types";
import { PROPOSAL_STATUS_CONFIG, FOCUS_AREA_CONFIG, formatRupiah, formatDate } from "./helpers";


function PartnerModalLogo({ logoUrl, name }: { logoUrl?: string | null; name: string }) {
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
        className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-2xl bg-[#181343] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
      {initials}
    </div>
  );
}

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

  // AI Screening states
  const [isScreeningAi, setIsScreeningAi] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isCopiedNotes, setIsCopiedNotes] = useState(false);

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

      // Load parsed AI result if available
      if (proposal.aiScreeningResult) {
        try {
          setAiResult(JSON.parse(proposal.aiScreeningResult));
        } catch {
          setAiResult(null);
        }
      } else {
        setAiResult(null);
      }
    }
  }, [proposal]);

  const handleRunAiScreening = async () => {
    if (!proposal) return;
    setIsScreeningAi(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login telah berakhir");

      const res = await fetch(`/api/proposals/${proposal.id}/ai-screen`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal melakukan evaluasi AI");
      }

      setAiResult(json.data.screeningResult);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menjalankan evaluasi AI untuk proposal ini");
    } finally {
      setIsScreeningAi(false);
    }
  };

  const handleApplyAiFeedback = () => {
    if (!aiResult?.suggestedRevisionNotes) return;
    setFeedback((prev) =>
      prev ? `${prev}\n\n${aiResult.suggestedRevisionNotes}` : aiResult.suggestedRevisionNotes
    );
    setDecisionStatus("REVISION_REQUESTED");
    setIsCopiedNotes(true);
    setTimeout(() => setIsCopiedNotes(false), 2000);
  };

  // Parse structured proposal content if available
  const { overviewText, activities, budgetItems } = useMemo(() => {
    let overview = proposal?.summary || "";
    let acts: any[] = [];
    let bItems: any[] = [];

    if (proposal?.summary) {
      try {
        const parsed = JSON.parse(proposal.summary);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.overview === "string") overview = parsed.overview;
          if (Array.isArray(parsed.activities)) acts = parsed.activities;
          if (Array.isArray(parsed.budgetItems)) bItems = parsed.budgetItems;
        }
      } catch {
        // Plain text fallback
      }
    }

    return { overviewText: overview, activities: acts, budgetItems: bItems };
  }, [proposal?.summary]);

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
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
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
            <span className="text-base font-extrabold text-[#181343]">
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
              <Building2 className="w-4 h-4 text-[#181343]" />
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
              {overviewText}
            </div>
          </div>

          {/* Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#181343]" />
                <span>Estimasi Durasi</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {proposal.durationMonths ? `${proposal.durationMonths} Bulan Pelaksanaan` : "Fleksibel"}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Users className="w-3.5 h-3.5 text-[#181343]" />
                <span>Target Penerima Manfaat</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {proposal.targetBeneficiaries || "Masyarakat Umum"}
              </p>
            </div>
          </div>

          {/* Rencana Kegiatan & Milestone Terstruktur */}
          {activities.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Rencana Kegiatan & Milestone ({activities.length} Tahapan)
                </span>
                <span className="text-[10px] font-semibold text-[#181343] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Akan Dikonversi ke Monitoring
                </span>
              </div>

              <div className="space-y-2.5">
                {activities.map((act: any, idx: number) => (
                  <div
                    key={act.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">{act.title}</h5>
                      </div>
                      {act.targetTimeline && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                          {act.targetTimeline}
                        </span>
                      )}
                    </div>
                    {act.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {act.description}
                      </p>
                    )}
                    {(act.suggestedKpi || act.expectedEvidence) && (
                      <div className="pl-7 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {act.suggestedKpi && (
                          <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                            <span className="text-slate-400 font-medium block text-[10px]">Target Output / KPI</span>
                            <span className="text-slate-700 font-semibold">{act.suggestedKpi}</span>
                          </div>
                        )}
                        {act.expectedEvidence && (
                          <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                            <span className="text-slate-400 font-medium block text-[10px]">Bukti Pelaksanaan</span>
                            <span className="text-teal-700 font-semibold">{act.expectedEvidence}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rencana Anggaran Biaya (RAB) Terstruktur */}
          {budgetItems.length > 0 && (
            <div className="space-y-3 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Rencana Anggaran Biaya (RAB) Terstruktur
              </span>
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Komponen Biaya</th>
                        <th className="py-2.5 px-2 text-center w-16">Vol</th>
                        <th className="py-2.5 px-2 text-center w-16">Satuan</th>
                        <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {budgetItems.map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-medium text-slate-900">{item.itemName}</td>
                          <td className="py-2 px-2 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-2 px-2 text-center text-slate-600">{item.unit}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatRupiah(item.unitPrice)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{formatRupiah(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right text-xs">
                          Total Anggaran Proposal:
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#181343] text-xs font-black">
                          {formatRupiah(proposal.proposedBudget)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tautan Dokumen Pendukung */}
          {proposal.documentUrl && (() => {
            const isLocalUpload = proposal.documentUrl.startsWith("/uploads/");
            const fileName = isLocalUpload
              ? proposal.documentUrl.split("/").pop()
              : proposal.documentUrl;

            return (
              <div className="p-4 rounded-2xl bg-[#181343]/5 border border-[#181343]/15 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#181343]/10 text-[#181343] flex items-center justify-center shrink-0 border border-[#181343]/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#181343] truncate">
                        Dokumen Proposal &amp; TOR Mitra
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#181343]/10 text-[#181343]">
                        {isLocalUpload ? "Berkas Server" : "Cloud Link"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                      {fileName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={proposal.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#181343] text-white text-xs font-bold hover:bg-[#26224C] transition flex items-center gap-1.5 shadow-xs"
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

          {/* ============================================================ */}
          {/* PANEL ANALISIS CERDAS AI (SIPENA PROPOSAL SCREENER) */}
          {/* ============================================================ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">
                  Evaluasi Cerdas AI (Sipena Proposal Screener)
                </h4>
              </div>
              {aiResult && (
                <button
                  type="button"
                  onClick={handleRunAiScreening}
                  disabled={isScreeningAi}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isScreeningAi ? "animate-spin" : ""}`} />
                  <span>{isScreeningAi ? "Menganalisis..." : "Analisis Ulang AI"}</span>
                </button>
              )}
            </div>

            {aiResult ? (
              <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-[#181343] text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-5">
                {/* Header Skor & Rekomendasi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Rekomendasi Keputusan AI
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          aiResult.overallScore >= 85
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : aiResult.overallScore >= 70
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : aiResult.overallScore >= 55
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {aiResult.recommendationLabel || aiResult.recommendation}
                      </span>
                      {proposal.aiScreenedAt && (
                        <span className="text-[11px] text-slate-400">
                          • Dianalisis {formatDate(proposal.aiScreenedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                        Total Skor AI
                      </span>
                      <div className="text-2xl font-black tracking-tight text-emerald-400">
                        {aiResult.overallScore}
                        <span className="text-xs font-bold text-slate-400">/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Pilar Evaluasi (Radar / Progress Bar Breakdown) */}
                {aiResult.aspectScores && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Rincian 4 Pilar Kelayakan
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* 1. Keselarasan Strategis */}
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">Keselarasan Strategis</span>
                          <span className="font-extrabold text-emerald-400">
                            {aiResult.aspectScores.strategicAlignment}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${aiResult.aspectScores.strategicAlignment}%` }}
                          />
                        </div>
                      </div>

                      {/* 2. Kewajaran Anggaran */}
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">Kewajaran RAB</span>
                          <span className="font-extrabold text-amber-400">
                            {aiResult.aspectScores.budgetFeasibility}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${aiResult.aspectScores.budgetFeasibility}%` }}
                          />
                        </div>
                      </div>

                      {/* 3. Kelayakan Operasional */}
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">Kelayakan Operasi</span>
                          <span className="font-extrabold text-blue-400">
                            {aiResult.aspectScores.operationalFeasibility}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${aiResult.aspectScores.operationalFeasibility}%` }}
                          />
                        </div>
                      </div>

                      {/* 4. Keberlanjutan Dampak */}
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">Keberlanjutan ESG</span>
                          <span className="font-extrabold text-purple-400">
                            {aiResult.aspectScores.impactSustainability}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${aiResult.aspectScores.impactSustainability}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Executive Summary */}
                {aiResult.executiveSummary && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ringkasan Eksekutif AI
                    </span>
                    <p className="italic text-slate-300">"{aiResult.executiveSummary}"</p>
                  </div>
                )}

                {/* Strengths & Potential Risks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Keunggulan */}
                  {aiResult.keyStrengths && aiResult.keyStrengths.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Keunggulan Utama Proposal</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {aiResult.keyStrengths.map((str: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span className="leading-snug">{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risiko / Catatan Kritis */}
                  {aiResult.potentialRisks && aiResult.potentialRisks.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>Potensi Risiko & Catatan Evaluasi</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {aiResult.potentialRisks.map((risk: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-rose-400 font-bold">•</span>
                            <span className="leading-snug">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Tombol Salin Masukan Revisi ke Textarea */}
                {aiResult.suggestedRevisionNotes && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-bold text-amber-300 block">
                        Rekomendasi Masukan Revisi AI untuk Mitra:
                      </span>
                      <p className="text-slate-300 line-clamp-1 italic text-[11px]">
                        "{aiResult.suggestedRevisionNotes}"
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyAiFeedback}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none shrink-0 text-xs shadow-xs"
                      leftIcon={isCopiedNotes ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    >
                      {isCopiedNotes ? "Tersalin ke Form!" : "Terapkan ke Catatan Revisi"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-[#181343] p-5 rounded-3xl border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1 min-w-0 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h5 className="font-extrabold text-xs text-white">
                      Proposal Belum Dievaluasi AI
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 max-w-md">
                    Gunakan algoritma AI Screener untuk mengaudit kesesuaian pilar inisiatif, kewajaran RAB, dan mendeteksi potensi risiko secara otomatis.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleRunAiScreening}
                  disabled={isScreeningAi}
                  isLoading={isScreeningAi}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0 text-xs shadow-md"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Jalankan Analisis Cerdas AI
                </Button>
              </div>
            )}
          </div>

          {/* FORM EVALUASI & KEPUTUSAN ATAU STATUS DETAIL */}
          {isAlreadyAccepted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Proposal Telah Disetujui</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Proposal ini telah disetujui dan telah dialihkan ke tahap penyusunan kesepakatan kolaborasi kerja sama CSR.
              </p>
              {proposal.feedback && (
                <div className="pt-2 border-t border-emerald-200/60 mt-2">
                  <span className="font-semibold text-emerald-950 block mb-0.5">Catatan Persetujuan:</span>
                  <p className="text-emerald-900 italic">"{proposal.feedback}"</p>
                </div>
              )}
            </div>
          ) : proposal.status === "REJECTED" ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Proposal Tidak Disetujui</span>
              </div>
              <p className="text-rose-800 leading-relaxed">
                Proposal ini telah dievaluasi dan belum memenuhi kriteria inisiatif CSR yang dibutuhkan perusahaan.
              </p>
              {proposal.feedback && (
                <div className="pt-2 border-t border-rose-200/60 mt-2">
                  <span className="font-semibold text-rose-950 block mb-0.5">Alasan Keputusan:</span>
                  <p className="text-rose-900 italic">"{proposal.feedback}"</p>
                </div>
              )}
            </div>
          ) : isWithdrawn ? (
            <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-xs italic">
              Proposal ini telah ditarik oleh pihak mitra, sehingga tidak dapat dievaluasi lebih lanjut.
            </div>
          ) : (
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
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Catatan ini akan dapat dibaca langsung oleh mitra pada dashboard mereka.
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Tutup
          </Button>

          {!isWithdrawn && !isAlreadyAccepted && proposal.status !== "REJECTED" && (
            <Button
              type="submit"
              form="review-form"
              size="md"
              disabled={isSubmitting}
              variant={decisionStatus === "REJECTED" ? "destructive-solid" : "primary"}
              className="text-xs sm:text-sm font-semibold"
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
