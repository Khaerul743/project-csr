"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FileText,
  Info,
  Layers,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import type { NeedPrioritizationResponse } from "@/modules/ai/ai.interface";
import { FOCUS_AREA_CONFIG } from "../helpers";

export interface AiNeedPrioritizationPanelProps {
  targetProvince: string;
  targetCity: string;
  focusArea: CsrFocusArea;
  title: string;
  description: string;
  estimatedBudget: string;
  excludeOpportunityId?: string | null;
  onApplyRecommendation: (payload: {
    focusArea?: CsrFocusArea;
    sdgs?: number[];
    descriptionSnippet?: string;
    feedbackMessage: string;
  }) => void;
}

const URGENCY_BADGE: Record<
  "CRITICAL" | "HIGH" | "MODERATE",
  { label: string; className: string }
> = {
  CRITICAL: {
    label: "Urgensi Kritis",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  HIGH: {
    label: "Prioritas Tinggi",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  MODERATE: {
    label: "Prioritas Sedang",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const EVIDENCE_BADGE: Record<
  "PLATFORM_DATA" | "RESIDENT_FEEDBACK" | "REGIONAL_CONTEXT",
  { label: string; className: string }
> = {
  PLATFORM_DATA: {
    label: "Data Program SIPENA",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  RESIDENT_FEEDBACK: {
    label: "Suara Warga SIPENA",
    className: "bg-[#181343]/10 text-[#181343] border-[#181343]/20",
  },
  REGIONAL_CONTEXT: {
    label: "Konteks Wilayah",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const COVERAGE_META: Record<
  "RICH_DATA" | "LIMITED_DATA" | "COLD_START",
  { label: string; className: string }
> = {
  RICH_DATA: {
    label: "Cakupan Data Tinggi",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  LIMITED_DATA: {
    label: "Cakupan Data Terbatas",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  COLD_START: {
    label: "Wilayah Baru (Data Awal)",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

export function AiNeedPrioritizationPanel({
  targetProvince,
  targetCity,
  focusArea,
  title,
  description,
  estimatedBudget,
  excludeOpportunityId,
  onApplyRecommendation,
}: AiNeedPrioritizationPanelProps) {
  const aiEnabled = isAiFeatureEnabled();

  const [isOpen, setIsOpen] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [fieldContextNotes, setFieldContextNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [appliedActionId, setAppliedActionId] = useState<string | null>(null);
  const [result, setResult] = useState<NeedPrioritizationResponse | null>(null);
  const [lastAnalyzedKey, setLastAnalyzedKey] = useState<string>("");

  const currentLocationReady = Boolean(targetProvince.trim() && targetCity.trim());
  const currentKey = `${targetProvince}|${targetCity}|${focusArea}`;
  const isStale = Boolean(result && lastAnalyzedKey && lastAnalyzedKey !== currentKey);

  useEffect(() => {
    if (!appliedNotice) return;
    const timer = window.setTimeout(() => setAppliedNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [appliedNotice]);

  if (!aiEnabled) {
    return null;
  }

  const handleAnalyze = async () => {
    if (!currentLocationReady) {
      setErrorMessage("Silakan pilih Provinsi dan Kota/Kabupaten sasaran terlebih dahulu.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAppliedNotice(null);
    setAppliedActionId(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/opportunities/need-prioritization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          targetProvince,
          targetCity,
          focusArea,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          estimatedBudget: estimatedBudget || undefined,
          fieldContextNotes: fieldContextNotes.trim() || undefined,
          excludeOpportunityId: excludeOpportunityId || undefined,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Gagal menganalisis prioritas kebutuhan wilayah.");
      }

      setResult(json.data as NeedPrioritizationResponse);
      setLastAnalyzedKey(currentKey);
      setIsOpen(true);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Terjadi kendala saat menjalankan analisis prioritas wilayah."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyWithFeedback = (
    actionId: string,
    payload: {
      focusArea?: CsrFocusArea;
      sdgs?: number[];
      descriptionSnippet?: string;
      feedbackMessage: string;
    }
  ) => {
    setAppliedActionId(actionId);
    setAppliedNotice(
      "Rekomendasi berhasil diterapkan ke form. Halaman telah diarahkan ke bagian deskripsi inisiatif."
    );
    onApplyRecommendation(payload);
  };

  const riskBadgeStyle =
    result?.overlapAssessment.riskLevel === "HIGH"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : result?.overlapAssessment.riskLevel === "MEDIUM"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-emerald-50 text-emerald-800 border-emerald-200";

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F9FAFB] p-4 sm:p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#181343]" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#181343]">
              Asisten Rekomendasi Wilayah &amp; Prioritas (AI)
            </h4>
            <p className="text-xs text-[#64748B]">
              Analisis kebutuhan masyarakat riil dan cegah tumpang tindih program CSR di lokasi sasaran.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
        >
          <span>{isOpen ? "Sembunyikan Panel" : "Buka Asisten AI"}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="pt-2 border-t border-slate-200 space-y-4">
          {/* Action Trigger Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Sisi Kiri: Informasi Target (Sejajar satu baris) */}
              <div className="min-w-0">
                {currentLocationReady ? (
                  <div className="flex items-center gap-2 text-xs text-slate-700 flex-wrap">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Target Analisis:{" "}
                      <strong className="text-[#181343]">
                        {targetCity}, {targetProvince}
                      </strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                      Fokus:{" "}
                      <strong className="text-[#181343]">
                        {FOCUS_AREA_CONFIG[focusArea]?.label || focusArea}
                      </strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-medium">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Pilih Provinsi dan Kota/Kabupaten sasaran di atas terlebih dahulu untuk memulai analisis.
                    </span>
                  </div>
                )}
              </div>

              {/* Sisi Kanan: Tombol Sejajar (Catatan Lapangan & Tombol Analisis) */}
              <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
                {currentLocationReady && (
                  <button
                    type="button"
                    onClick={() => setShowNotes((prev) => !prev)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      showNotes || fieldContextNotes.trim()
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-[#181343]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {showNotes
                        ? "Tutup Catatan"
                        : fieldContextNotes.trim()
                        ? "Catatan Lapangan Terisi"
                        : "+ Catatan Lapangan"}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !currentLocationReady}
                  className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#181343] hover:bg-[#26224C] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Menganalisis...</span>
                    </>
                  ) : result ? (
                    <>
                      <RefreshCw className="w-4 h-4" aria-hidden="true" />
                      <span>Analisis Ulang</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                      <span>Analisis Wilayah Ini</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Field Notes Box */}
            {showNotes && (
              <div className="space-y-2 pt-2.5 border-t border-slate-100 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="ai-need-field-context"
                    className="text-xs font-semibold text-[#181343]"
                  >
                    Catatan Survei Awal / Kondisi Lapangan (Opsional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNotes(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
                <textarea
                  id="ai-need-field-context"
                  rows={2}
                  value={fieldContextNotes}
                  onChange={(e) => setFieldContextNotes(e.target.value)}
                  placeholder="Contoh: Kawasan pesisir sering banjir rob, pelaku UMKM olahan ikan butuh sanitasi..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] text-xs text-[#181343] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#181343] focus:ring-2 focus:ring-[#181343]/15 transition resize-y"
                />
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-bold">Gagal Menjalankan Analisis</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Notice after Apply */}
          {appliedNotice && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{appliedNotice}</span>
            </div>
          )}

          {/* Loading Skeleton */}
          {isAnalyzing && (
            <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-2 animate-in fade-in">
              <Loader2 className="w-6 h-6 animate-spin text-[#181343] mx-auto" aria-hidden="true" />
              <p className="text-xs font-bold text-[#181343]">
                Memeriksa data program CSR, peluang aktif, dan suara warga di {targetCity}...
              </p>
              <p className="text-xs text-slate-500">
                Menyusun pemetaan tumpang tindih sektor serta rekomendasi intervensi terprioritas.
              </p>
            </div>
          )}

          {/* Stale Notice */}
          {!isAnalyzing && isStale && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                <span>
                  Lokasi atau bidang fokus di formulir telah diperbarui. Klik <strong>Analisis Ulang</strong> untuk menyelaraskan rekomendasi.
                </span>
              </div>
            </div>
          )}

          {/* Empty State before running */}
          {!isAnalyzing && !result && !errorMessage && currentLocationReady && (
            <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300 text-center space-y-1">
              <Compass className="w-5 h-5 text-emerald-600 mx-auto" aria-hidden="true" />
              <p className="text-xs font-semibold text-[#181343]">
                Siap Menganalisis Prioritas Wilayah {targetCity}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol <strong>Analisis Wilayah Ini</strong> untuk memeriksa potensi tumpang tindih sektor dan rekomendasi sasaran program.
              </p>
            </div>
          )}

          {/* Analysis Results View */}
          {!isAnalyzing && result && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* 1. Ringkasan Kejenuhan Sektor & Status Risiko */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#181343]" aria-hidden="true" />
                    <span className="text-xs font-bold text-[#181343]">
                      Status Tumpang Tindih Sektor di {result.regionalSnapshot.targetCity}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${riskBadgeStyle}`}>
                    {result.overlapAssessment.riskLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {result.overlapAssessment.summary}
                </p>

                {/* Sektor Padat vs Celah Kebutuhan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-600 block">
                      Sektor Sudah Terisi / Padat:
                    </span>
                    {result.overlapAssessment.crowdedFocusAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.overlapAssessment.crowdedFocusAreas.map((area) => (
                          <span
                            key={`crowd-${area}`}
                            className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold"
                          >
                            {FOCUS_AREA_CONFIG[area]?.label || area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Belum ada sektor yang jenuh.</span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1">
                    <span className="text-[11px] font-semibold text-emerald-800 block">
                      Sektor Minim Intervensi (Celah Prioritas):
                    </span>
                    {result.overlapAssessment.underservedFocusAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.overlapAssessment.underservedFocusAreas.map((area) => (
                          <span
                            key={`gap-${area}`}
                            className="px-2 py-0.5 rounded bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-[11px] font-semibold"
                          >
                            {FOCUS_AREA_CONFIG[area]?.label || area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Distribusi program relatif merata.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Daftar Rekomendasi Prioritas Utama */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#181343] block">
                    Rekomendasi Prioritas Kebutuhan Masyarakat ({result.priorityNeeds.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Klik tombol untuk langsung menyelaraskan formulir
                  </span>
                </div>

                <div className="space-y-3">
                  {result.priorityNeeds.map((item) => {
                    const urgency = URGENCY_BADGE[item.urgencyLevel] || URGENCY_BADGE.MODERATE;
                    const basis = EVIDENCE_BADGE[item.evidenceBasis] || EVIDENCE_BADGE.PLATFORM_DATA;
                    const actionKey = `priority-${item.rank}`;
                    const isApplied = appliedActionId === actionKey;

                    return (
                      <div
                        key={`priority-${item.rank}-${item.focusArea}`}
                        className={`bg-white rounded-xl border p-4 space-y-3 transition-colors ${
                          isApplied ? "border-emerald-500 bg-emerald-50/20" : "border-slate-200"
                        }`}
                      >
                        {/* Priority Header: Badges row, then Title & Description with balanced spacing */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-[#181343] text-white text-[11px] font-bold inline-flex items-center justify-center">
                                #{item.rank}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${urgency.className}`}>
                                {urgency.label}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${basis.className}`}>
                                {basis.label}
                              </span>
                            </div>

                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold text-[#181343] shrink-0">
                              {FOCUS_AREA_CONFIG[item.focusArea]?.label || item.focusArea}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-0.5">
                            <h5 className="text-[14px] sm:text-[15px] font-bold text-[#181343] leading-snug">
                              {item.needTitle}
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.rationale}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="font-semibold text-[#181343] flex items-center gap-1.5 text-[11px]">
                              <Layers className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                              Saran Intervensi:
                            </span>
                            <p className="text-slate-700 mt-0.5 leading-relaxed text-[11px]">
                              {item.recommendedIntervention}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="font-semibold text-[#181343] flex items-center gap-1.5 text-[11px]">
                              <Users className="w-3.5 h-3.5 text-[#181343]" aria-hidden="true" />
                              Sasaran Penerima:
                            </span>
                            <p className="text-slate-700 mt-0.5 leading-relaxed text-[11px]">
                              {item.suggestedBeneficiaries}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Row: SDGs & Action Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                            <span className="font-semibold">SDGs Terkait:</span>
                            {item.suggestedSdgs.map((sdgId) => (
                              <span
                                key={`p-${item.rank}-sdg-${sdgId}`}
                                className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-[#181343]"
                              >
                                SDG {sdgId}
                              </span>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              applyWithFeedback(actionKey, {
                                focusArea: item.focusArea,
                                sdgs: item.suggestedSdgs,
                                descriptionSnippet: `Prioritas Wilayah (${result.regionalSnapshot.targetCity} - ${item.needTitle}): ${item.recommendedIntervention} Sasaran penerima manfaat difokuskan kepada ${item.suggestedBeneficiaries.toLowerCase()}.`,
                                feedbackMessage: `Prioritas #${item.rank} (${FOCUS_AREA_CONFIG[item.focusArea]?.label || item.focusArea}) beserta SDGs & draf deskripsi berhasil diterapkan.`,
                              })
                            }
                            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                              isApplied
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-[#181343] hover:bg-[#26224C] text-white"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>
                              {isApplied
                                ? `Prioritas #${item.rank} Telah Diterapkan`
                                : `Terapkan Prioritas #${item.rank} ke Form`}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Draf Deskripsi Siap Pakai */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#181343]" />
                    <span className="text-xs font-bold text-[#181343]">
                      Draf Kalimat Rekomendasi untuk Deskripsi
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {result.formSuggestions.differentiationTip}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {result.formSuggestions.draftDescriptionSnippet}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      applyWithFeedback("draft-desc", {
                        descriptionSnippet: result.formSuggestions.draftDescriptionSnippet,
                        feedbackMessage: "Draf paragraf prioritas berhasil disisipkan ke kolom deskripsi.",
                      })
                    }
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      appliedActionId === "draft-desc"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                        : "border-slate-300 bg-white hover:bg-slate-50 text-[#181343]"
                    }`}
                  >
                    {appliedActionId === "draft-desc"
                      ? "✓ Draf Berhasil Disisipkan"
                      : "+ Sisipkan Draf ke Deskripsi"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyWithFeedback("apply-all", {
                        focusArea: result.formSuggestions.recommendedFocusArea,
                        sdgs: result.formSuggestions.recommendedSdgs,
                        descriptionSnippet: result.formSuggestions.draftDescriptionSnippet,
                        feedbackMessage: `Fokus (${FOCUS_AREA_CONFIG[result.formSuggestions.recommendedFocusArea]?.label}), SDGs rekomendasi, dan draf deskripsi berhasil diterapkan.`,
                      })
                    }
                    className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      appliedActionId === "apply-all"
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-700 hover:bg-emerald-800 text-white"
                    }`}
                  >
                    {appliedActionId === "apply-all"
                      ? "✓ Semua Rekomendasi Diterapkan"
                      : "Terapkan Semua Rekomendasi"}
                  </button>
                </div>
              </div>

              {/* 4. Accordion: Detail Data & Konteks Wilayah */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDetails((prev) => !prev)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-[#181343] hover:bg-slate-50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span>
                      {showDetails
                        ? "Sembunyikan Detail Statistik & Potensi Wilayah"
                        : "Lihat Detail Data & Konteks Wilayah (4 Metrik, Potensi Ekosistem)"}
                    </span>
                  </span>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showDetails && (
                  <div className="p-4 pt-1 border-t border-slate-100 space-y-3.5 animate-in fade-in">
                    {/* Snapshot 4 KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 block">Program Wilayah</span>
                        <span className="text-sm font-bold text-[#181343] mt-0.5 block">
                          {result.regionalSnapshot.programsInCity} Kota / {result.regionalSnapshot.programsInProvince} Prov
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 block">Peluang Aktif</span>
                        <span className="text-sm font-bold text-[#181343] mt-0.5 block">
                          {result.regionalSnapshot.openOpportunitiesInRegion} peluang
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 block">Suara Warga</span>
                        <span className="text-sm font-bold text-[#181343] mt-0.5 block">
                          {result.regionalSnapshot.totalReviewsInRegion > 0
                            ? `${result.regionalSnapshot.averageRatingInRegion}/5 (${result.regionalSnapshot.totalReviewsInRegion} ulasan)`
                            : "Belum ada ulasan"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 block">Mitra Lokal Aktif</span>
                        <span className="text-sm font-bold text-[#181343] mt-0.5 block">
                          {result.regionalSnapshot.localPartnersReady} NGO ({result.regionalSnapshot.verifiedPartnersReady} verif)
                        </span>
                      </div>
                    </div>

                    {/* Potensi & Celah Wilayah */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-semibold text-[#181343] block">
                          Kondisi &amp; Potensi Ekosistem:
                        </span>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          {result.regionalPotentialSummary.conditionsAndPotential}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-semibold text-[#181343] block">
                          Kebutuhan Belum Terpenuhi:
                        </span>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          {result.regionalPotentialSummary.socialNeedsGap}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Basis data: {result.regionalPotentialSummary.basisNote}</span>
                      <span className={`px-2 py-0.5 rounded border font-semibold ${COVERAGE_META[result.regionalSnapshot.dataCoverage].className}`}>
                        {COVERAGE_META[result.regionalSnapshot.dataCoverage].label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Decision Support Disclaimer */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Catatan:</strong> Asisten AI dirancang sebagai pendukung pertimbangan strategis perusahaan berbasis data program SIPENA dan kondisi wilayah, bukan ketetapan mutlak sistem.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
