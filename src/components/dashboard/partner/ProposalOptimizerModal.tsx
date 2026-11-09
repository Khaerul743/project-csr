"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  DollarSign,
  FileText,
  ShieldCheck,
  CheckSquare,
  Loader2,
  TrendingUp,
  MessageSquareQuote,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalOptimizationResponse } from "@/modules/ai/services/proposal-optimizer";

export interface ProposalOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityTitle: string;
  proposalId?: string | null;
  companyFeedback?: string | null;
  proposalData: {
    title: string;
    summary: string;
    proposedBudget: string | number;
    durationMonths?: number | "";
    targetBeneficiaries?: string;
    documentUrl?: string;
  };
  onApplySuggestedSummary: (newSummary: string) => void;
}

export function ProposalOptimizerModal({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle,
  proposalId,
  companyFeedback,
  proposalData,
  onApplySuggestedSummary,
}: ProposalOptimizerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProposalOptimizationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Fetch optimization analysis
  const runOptimization = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsApplied(false);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login telah berakhir. Harap login kembali.");

      const payload = {
        opportunityId,
        proposalId: proposalId || null,
        title: proposalData.title.trim() || "Draf Usulan Proposal",
        summary: proposalData.summary.trim() || "Ringkasan teknis usulan program.",
        proposedBudget: proposalData.proposedBudget || 0,
        durationMonths:
          typeof proposalData.durationMonths === "number" && proposalData.durationMonths > 0
            ? proposalData.durationMonths
            : null,
        targetBeneficiaries: proposalData.targetBeneficiaries?.trim() || null,
        documentUrl: proposalData.documentUrl?.trim() || null,
      };

      const res = await fetch("/api/proposals/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengoptimalkan proposal.");
      }

      setResult(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses rekomendasi AI.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runOptimization();
    } else {
      setResult(null);
      setErrorMsg(null);
      setIsApplied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    if (!result?.suggestedSummaryDraft) return;
    navigator.clipboard.writeText(result.suggestedSummaryDraft);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleApplySummary = () => {
    if (!result?.suggestedSummaryDraft) return;
    onApplySuggestedSummary(result.suggestedSummaryDraft);
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getAlignmentBadge = (level: string) => {
    switch (level) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Sangat Selaras dengan TOR
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Cukup Selaras (Perlu Penajaman)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Kurang Selaras (Perlu Penyesuaian)
          </span>
        );
    }
  };

  const getAspectLabel = (aspect: string) => {
    switch (aspect) {
      case "NARASI_METODOLOGI":
        return "Narasi & Metodologi Program";
      case "ANGGARAN_BIAYA":
        return "Rasionalitas & Alokasi Anggaran";
      case "TARGET_PENERIMA":
        return "Target Penerima Manfaat";
      case "TIMELINE_DURASI":
        return "Linimasa & Durasi Pelaksanaan";
      case "KESELARASAN_CSR":
        return "Keselarasan Fokus CSR";
      default:
        return aspect;
    }
  };

  const isRevisionMode = Boolean(companyFeedback || proposalId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Dialog */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#181343] via-[#241c61] to-[#181343] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  {isRevisionMode ? "AI Feedback Alignment & Revision Co-Pilot" : "AI Proposal Optimizer"}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-white/10 rounded-full text-slate-200 border border-white/15">
                  Mitra Assistant
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-[340px] sm:max-w-md">
                Inisiatif: {opportunityTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup dialog rekomendasi AI"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Loading State */}
          {isLoading && (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#181343] to-indigo-600 flex items-center justify-center text-white shadow-xl animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center animate-spin">
                  <Loader2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isRevisionMode
                    ? "Menganalisis Catatan Perusahaan & Menyiapkan Solusi Revisi..."
                    : "Menganalisis Kesiapan Proposal & Menghubungkan ke TOR..."}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Model AI sedang membandingkan parameter anggaran, ruang lingkup sasaran, dan narasi teknis proposal Anda...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorMsg && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Gagal Memproses Rekomendasi AI</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">{errorMsg}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={runOptimization}
                className="min-h-[44px] text-xs font-semibold rounded-xl border-rose-300 text-rose-800 hover:bg-rose-100"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Coba Analisis Ulang
              </Button>
            </div>
          )}

          {/* Success Result State */}
          {!isLoading && result && (
            <>
              {/* 1. Score & Alignment Overview Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-extrabold ${getScoreColor(
                        result.readinessScore
                      )}`}
                    >
                      <span className="text-xl leading-none">{result.readinessScore}</span>
                      <span className="text-[10px] font-bold opacity-80">/ 100</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Skor Kesiapan Proposal
                      </span>
                      <div className="mt-0.5">{getAlignmentBadge(result.alignmentLevel)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
                      Engine: {result.source === "AI_OPENAI" ? "OpenAI GPT-4o-mini" : "Heuristic Analyzer"}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed border-t border-slate-200/80 pt-3">
                  <strong className="text-slate-900 block mb-0.5">Ringkasan Evaluasi:</strong>
                  {result.overallAssessment}
                </div>
              </div>

              {/* 2. Revision Feedback Analysis Banner (If in revision mode) */}
              {result.feedbackAnalysis && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                      <MessageSquareQuote className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Hasil Bedah Catatan Evaluasi Perusahaan</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Solusi Perbaikan
                    </span>
                  </div>

                  {companyFeedback && (
                    <div className="p-3 rounded-xl bg-white/70 border border-amber-200/70 text-xs italic text-amber-900">
                      "{companyFeedback}"
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Key Concerns */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                        Poin Keberatan Perusahaan
                      </span>
                      <ul className="space-y-1 text-xs text-amber-900/90">
                        {result.feedbackAnalysis.keyConcerns.map((concern, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold shrink-0">•</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggested Actions */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                        Langkah Solusi Revisi Konkrit
                      </span>
                      <ul className="space-y-1 text-xs text-emerald-950">
                        {result.feedbackAnalysis.suggestedActions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Suggested Summary Draft (Interactive Apply) */}
              <div className="p-5 rounded-2xl bg-white border-2 border-indigo-200/80 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Rekomendasi Draf Ringkasan Proposal yang Lebih Tajam
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Draf narasi yang diformulasikan AI untuk meyakinkan reviewer perusahaan CSR
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopySummary}
                      className="min-h-[44px] text-xs rounded-xl border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                          Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                          Salin Teks
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleApplySummary}
                      className="min-h-[44px] bg-[#181343] hover:bg-[#251e66] text-white text-xs font-semibold rounded-xl px-3.5 cursor-pointer flex items-center gap-1.5"
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          Berhasil Diterapkan ke Formulir!
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                          Gunakan Draf Ini di Form
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-[13px] text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                  {result.suggestedSummaryDraft}
                </div>
              </div>

              {/* 4. Budget Advice */}
              {result.suggestedBudgetAdvice && (
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-teal-900">
                    <DollarSign className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Rekomendasi Alokasi & Efisiensi Anggaran (RAB)</span>
                  </div>
                  <p className="text-xs text-teal-950 leading-relaxed pl-6">
                    {result.suggestedBudgetAdvice}
                  </p>
                </div>
              )}

              {/* 5. Improvement Areas */}
              {result.improvementAreas && result.improvementAreas.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Area Prioritas Peningkatan ({result.improvementAreas.length})
                  </h4>

                  <div className="space-y-2.5">
                    {result.improvementAreas.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900">{getAspectLabel(item.aspect)}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Perlu Perhatian
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p>
                            <strong className="text-slate-800">Kondisi saat ini:</strong>{" "}
                            {item.currentObservation}
                          </p>
                          <p className="text-indigo-950 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                            <strong className="text-indigo-900">Rekomendasi Tindakan:</strong>{" "}
                            {item.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Strengths */}
              {result.strengths && result.strengths.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Poin Kekuatan Proposal ({result.strengths.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.strengths.map((strength, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Pre-submission Checklist */}
              {result.preSubmissionChecklist && result.preSubmissionChecklist.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-slate-700" />
                    Daftar Periksa Sebelum Pengajuan
                  </h4>

                  <div className="space-y-2 text-xs">
                    {result.preSubmissionChecklist.map((checkItem, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 block">
                            {checkItem.item}
                          </span>
                          <span className="text-slate-600 text-[11px] block">
                            {checkItem.notes}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            checkItem.status === "READY"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : checkItem.status === "ACTION_REQUIRED"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {checkItem.status === "READY"
                            ? "Siap"
                            : checkItem.status === "ACTION_REQUIRED"
                            ? "Perlu Tindakan"
                            : "Disarankan"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            {result?.optimizedAt ? `Dianalisis pada ${new Date(result.optimizedAt).toLocaleTimeString("id-ID")}` : ""}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="min-h-[44px] text-xs rounded-xl border-slate-200 cursor-pointer"
            >
              Tutup
            </Button>
            {result?.suggestedSummaryDraft && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleApplySummary}
                className="min-h-[44px] bg-[#181343] hover:bg-[#251e66] text-white text-xs font-semibold rounded-xl px-4 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-amber-300" />
                Terapkan Draf & Lanjutkan Form
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
