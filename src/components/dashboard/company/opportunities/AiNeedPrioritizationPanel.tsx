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
  Info,
  Layers,
  Loader2,
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
    label: "Konteks Makro Wilayah",
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
    label: "Wilayah Baru (Cold Start)",
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
  const [fieldContextNotes, setFieldContextNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [result, setResult] = useState<NeedPrioritizationResponse | null>(null);
  const [lastAnalyzedKey, setLastAnalyzedKey] = useState<string>("");

  const currentLocationReady = Boolean(targetProvince.trim() && targetCity.trim());
  const currentKey = `${targetProvince}|${targetCity}|${focusArea}`;
  const isStale = Boolean(result && lastAnalyzedKey && lastAnalyzedKey !== currentKey);

  useEffect(() => {
    if (!appliedNotice) return;
    const timer = window.setTimeout(() => setAppliedNotice(null), 4000);
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
        err?.message || "Terjadi kendala saat menjalankan AI Need Prioritization."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyWithFeedback = (payload: {
    focusArea?: CsrFocusArea;
    sdgs?: number[];
    descriptionSnippet?: string;
    feedbackMessage: string;
  }) => {
    onApplyRecommendation(payload);
    setAppliedNotice(payload.feedbackMessage);
  };

  const riskBadgeStyle =
    result?.overlapAssessment.riskLevel === "HIGH"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : result?.overlapAssessment.riskLevel === "MEDIUM"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-emerald-50 text-emerald-800 border-emerald-200";

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#181343]">
              AI Need Prioritization &amp; Deteksi Tumpang Tindih Wilayah
            </h4>
            <p className="text-xs text-slate-700">
              Analisis program CSR eksisting, suara warga, kesiapan mitra lokal, dan prioritas kebutuhan wilayah.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="min-h-[44px] px-3 py-2 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-xs font-semibold text-emerald-800 inline-flex items-center justify-center gap-1.5 self-start sm:self-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
        >
          <span>{isOpen ? "Sembunyikan Panel" : "Buka Panel AI"}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="pt-3 border-t border-emerald-200/80 space-y-4">
          {/* Input Konteks Lapangan Opsional + Tombol Pemicu */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ai-need-field-context"
                className="text-xs font-bold text-[#181343]"
              >
                Catatan Kondisi / Survei Awal Lapangan (Opsional)
              </label>
              <textarea
                id="ai-need-field-context"
                rows={2}
                value={fieldContextNotes}
                onChange={(e) => setFieldContextNotes(e.target.value)}
                placeholder="Contoh: Kawasan pesisir sering terdampak banjir rob, pelaku UMKM pengolah ikan kekurangan sarana sanitasi dan rantai dingin..."
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343] resize-y"
              />
              <span className="text-xs text-slate-600">
                Tambahkan temuan spesifik dari lapangan jika ada agar dipadukan dengan database program SIPENA.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-700">
                {currentLocationReady ? (
                  <span>
                    Target analisis:{" "}
                    <strong className="text-[#181343]">
                      {targetCity}, {targetProvince}
                    </strong>{" "}
                    (Fokus:{" "}
                    <strong className="text-[#181343]">
                      {FOCUS_AREA_CONFIG[focusArea]?.label || focusArea}
                    </strong>
                    )
                  </span>
                ) : (
                  <span className="text-amber-800 font-medium">
                    Pilih Provinsi dan Kota/Kabupaten sasaran di atas untuk mengaktifkan analisis AI.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !currentLocationReady}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#181343] hover:bg-[#26224C] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Menganalisis Wilayah...</span>
                  </>
                ) : result ? (
                  <>
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span>Analisis Ulang Wilayah</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>Analisis Prioritas Wilayah (AI)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
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
              className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
              <span>{appliedNotice}</span>
            </div>
          )}

          {/* Loading Skeleton */}
          {isAnalyzing && (
            <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#181343] mx-auto" aria-hidden="true" />
              <p className="text-xs font-bold text-[#181343]">
                Memeriksa data program CSR, peluang aktif, ulasan warga, dan mitra di {targetCity}...
              </p>
              <p className="text-xs text-slate-600">
                Proses ini memetakan potensi tumpang tindih sektor sekaligus merumuskan prioritas kebutuhan.
              </p>
            </div>
          )}

          {/* Stale Notice */}
          {!isAnalyzing && isStale && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Lokasi sasaran atau bidang fokus di form telah berubah sejak analisis terakhir. Jalankan{" "}
                  <strong>Analisis Ulang Wilayah</strong> agar hasil sesuai pilihan terbaru.
                </span>
              </div>
            </div>
          )}

          {/* Empty State before running */}
          {!isAnalyzing && !result && !errorMessage && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 text-center space-y-1.5">
              <Compass className="w-6 h-6 text-emerald-700 mx-auto" aria-hidden="true" />
              <p className="text-xs font-bold text-[#181343]">
                Siap Memetakan Prioritas &amp; Risiko Tumpang Tindih Wilayah
              </p>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                Klik tombol <strong>Analisis Prioritas Wilayah (AI)</strong> untuk melihat apakah sektor yang Anda pilih sudah padat di wilayah tersebut, membaca celah suara warga, serta mendapat rekomendasi intervensi terprioritas.
              </p>
            </div>
          )}

          {/* Analysis Results */}
          {!isAnalyzing && result && (
            <div className="space-y-4">
              {/* Source & Coverage Header + DB Snapshot Grid */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#181343]">
                      Hasil Analisis: {result.regionalSnapshot.targetCity}, {result.regionalSnapshot.targetProvince}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                        COVERAGE_META[result.regionalSnapshot.dataCoverage].className
                      }`}
                    >
                      {COVERAGE_META[result.regionalSnapshot.dataCoverage].label}
                    </span>
                  </div>
                  <Badge
                    variant={result.source === "AI_OPENAI" ? "emerald" : "slate"}
                    size="sm"
                  >
                    {result.source === "AI_OPENAI"
                      ? "Analisis LLM (OpenAI GPT)"
                      : "Analisis Heuristik Data SIPENA"}
                  </Badge>
                </div>

                {/* Snapshot KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-600 block">
                      Program Wilayah (Kota / Prov)
                    </span>
                    <span className="text-sm font-bold text-[#181343] mt-0.5 block">
                      {result.regionalSnapshot.programsInCity} / {result.regionalSnapshot.programsInProvince}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-600 block">
                      Peluang Sedang Dibuka
                    </span>
                    <span className="text-sm font-bold text-[#181343] mt-0.5 block">
                      {result.regionalSnapshot.openOpportunitiesInRegion} peluang
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-600 block">
                      Suara Warga Wilayah
                    </span>
                    <span className="text-sm font-bold text-[#181343] mt-0.5 block">
                      {result.regionalSnapshot.totalReviewsInRegion > 0
                        ? `${result.regionalSnapshot.averageRatingInRegion}/5 (${result.regionalSnapshot.totalReviewsInRegion} ulasan)`
                        : "Belum ada ulasan"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-600 block">
                      Mitra Lokal Aktif
                    </span>
                    <span className="text-sm font-bold text-[#181343] mt-0.5 block">
                      {result.regionalSnapshot.localPartnersReady} NGO ({result.regionalSnapshot.verifiedPartnersReady} verif.)
                    </span>
                  </div>
                </div>

                {/* Cold Start Explicit Alert */}
                {result.regionalSnapshot.dataCoverage === "COLD_START" && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      Wilayah ini belum memiliki riwayat program atau survei warga di database SIPENA. Rekomendasi disusun sebagai panduan awal strategis yang perlu dikonfirmasi lewat asesmen lapangan lokal.
                    </span>
                  </div>
                )}
              </div>

              {/* Overlap Assessment Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#181343]" aria-hidden="true" />
                    <h5 className="text-xs font-bold text-[#181343]">
                      Analisis Risiko Tumpang Tindih Sektor
                    </h5>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${riskBadgeStyle}`}>
                    {result.overlapAssessment.riskLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {result.overlapAssessment.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-[#181343] block">
                      Sektor Sudah Terisi / Padat:
                    </span>
                    {result.overlapAssessment.crowdedFocusAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.overlapAssessment.crowdedFocusAreas.map((area) => (
                          <span
                            key={`crowd-${area}`}
                            className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold"
                          >
                            {FOCUS_AREA_CONFIG[area]?.label || area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-600">
                        Belum ada sektor yang mengalami kejenuhan tinggi.
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-[#181343] block">
                      Sektor Minim Intervensi (Celah Prioritas):
                    </span>
                    {result.overlapAssessment.underservedFocusAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.overlapAssessment.underservedFocusAreas.map((area) => (
                          <span
                            key={`gap-${area}`}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold"
                          >
                            {FOCUS_AREA_CONFIG[area]?.label || area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-600">
                        Distribusi sektor relatif merata; fokuskan pada diferensiasi kecamatan/sasaran.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Kondisi & Potensi Wilayah */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
                <h5 className="font-bold text-[#181343]">
                  Kondisi, Potensi Wilayah &amp; Celah Kebutuhan Masyarakat
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-semibold text-[#181343] block">
                      Kondisi &amp; Potensi Ekosistem:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {result.regionalPotentialSummary.conditionsAndPotential}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-semibold text-[#181343] block">
                      Kebutuhan Belum Terpenuhi:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {result.regionalPotentialSummary.socialNeedsGap}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Basis analisis: {result.regionalPotentialSummary.basisNote}
                </p>
              </div>

              {/* Top 3 Priority Needs */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#181343]">
                    Peringkat Prioritas Kebutuhan Masyarakat ({result.priorityNeeds.length})
                  </h5>
                </div>

                <div className="space-y-3">
                  {result.priorityNeeds.map((item) => {
                    const urgency = URGENCY_BADGE[item.urgencyLevel] || URGENCY_BADGE.MODERATE;
                    const basis = EVIDENCE_BADGE[item.evidenceBasis] || EVIDENCE_BADGE.PLATFORM_DATA;
                    return (
                      <article
                        key={`priority-${item.rank}-${item.focusArea}`}
                        className="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="w-6 h-6 rounded-md bg-[#181343] text-white text-xs font-bold inline-flex items-center justify-center">
                                #{item.rank}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${urgency.className}`}
                              >
                                {urgency.label}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${basis.className}`}
                              >
                                {basis.label}
                              </span>
                            </div>
                            <h6 className="text-xs sm:text-sm font-bold text-[#181343] pt-0.5">
                              {item.needTitle}
                            </h6>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-[#181343] shrink-0 self-start">
                            {FOCUS_AREA_CONFIG[item.focusArea]?.label || item.focusArea}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">{item.rationale}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="font-semibold text-[#181343] flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                              Rekomendasi Intervensi:
                            </span>
                            <p className="text-slate-700 mt-1 leading-relaxed">
                              {item.recommendedIntervention}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="font-semibold text-[#181343] flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#181343]" aria-hidden="true" />
                              Sasaran Penerima Manfaat:
                            </span>
                            <p className="text-slate-700 mt-1 leading-relaxed">
                              {item.suggestedBeneficiaries}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-700">
                            <span className="font-semibold text-slate-600">SDGs Terkait:</span>
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
                              applyWithFeedback({
                                focusArea: item.focusArea,
                                sdgs: item.suggestedSdgs,
                                descriptionSnippet: `Prioritas Wilayah (${result.regionalSnapshot.targetCity} - ${item.needTitle}): ${item.recommendedIntervention} Sasaran penerima manfaat difokuskan kepada ${item.suggestedBeneficiaries.toLowerCase()}.`,
                                feedbackMessage: `Prioritas #${item.rank} (${FOCUS_AREA_CONFIG[item.focusArea]?.label || item.focusArea}) beserta SDGs & draf deskripsi berhasil diterapkan ke form.`,
                              })
                            }
                            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-emerald-700 bg-white hover:bg-emerald-50 text-xs font-semibold text-emerald-800 inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Terapkan Prioritas #{item.rank} ke Form</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Actionable Form Suggestions Footer */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#181343] block">
                    Saran Diferensiasi &amp; Draf Deskripsi Form
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {result.formSuggestions.differentiationTip}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {result.formSuggestions.draftDescriptionSnippet}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      applyWithFeedback({
                        descriptionSnippet: result.formSuggestions.draftDescriptionSnippet,
                        feedbackMessage: "Draf paragraf prioritas berhasil ditambahkan ke kolom deskripsi.",
                      })
                    }
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                  >
                    + Sisipkan Draf ke Deskripsi
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyWithFeedback({
                        focusArea: result.formSuggestions.recommendedFocusArea,
                        sdgs: result.formSuggestions.recommendedSdgs,
                        descriptionSnippet: result.formSuggestions.draftDescriptionSnippet,
                        feedbackMessage: `Fokus (${FOCUS_AREA_CONFIG[result.formSuggestions.recommendedFocusArea]?.label}), SDGs rekomendasi, dan draf deskripsi berhasil diterapkan ke form.`,
                      })
                    }
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                  >
                    Terapkan Semua Rekomendasi Terbaik
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Decision Support Disclaimer */}
          <div className="flex items-start gap-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Pemberitahuan:</strong> AI Need Prioritization disusun sebagai pendukung pertimbangan strategis CSR perusahaan (decision support) berdasarkan data program SIPENA dan konteks wilayah, bukan ketetapan otomatis sistem.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
