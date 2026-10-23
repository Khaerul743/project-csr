"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  Trash2,
  Plus,
  AlertCircle,
  Clock,
  FileCheck2,
  Lightbulb,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface StageDraft {
  orderIndex: number;
  title: string;
  description: string;
  targetTimeline: string;
  expectedEvidence: string;
  suggestedKpi: string;
}

interface AiMilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programTitle: string;
  onSuccess: () => void;
}

export function AiMilestonesModal({
  isOpen,
  onClose,
  programId,
  programTitle,
  onSuccess,
}: AiMilestonesModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stages, setStages] = useState<StageDraft[]>([]);
  const [rationale, setRationale] = useState<string | null>(null);
  const [extractionSource, setExtractionSource] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/programs/${programId}/stages/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengekstrak tahapan dengan AI");
      }

      const data = json.data;
      setRationale(data.summaryRationale || null);
      setExtractionSource(data.source || "AI_OPENAI");
      setStages(
        (data.stages || []).map((s: any, idx: number) => ({
          orderIndex: s.orderIndex || idx + 1,
          title: s.title || `Tahap ${idx + 1}`,
          description: s.description || "",
          targetTimeline: s.targetTimeline || "",
          expectedEvidence: s.expectedEvidence || "",
          suggestedKpi: s.suggestedKpi || "",
        }))
      );
      setHasGenerated(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses ekstraksi AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStage = (
    index: number,
    field: keyof StageDraft,
    value: string | number
  ) => {
    setStages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddStage = () => {
    setStages((prev) => [
      ...prev,
      {
        orderIndex: prev.length + 1,
        title: `Tahap ${prev.length + 1}: Kegiatan Lanjutan`,
        description: "",
        targetTimeline: `Bulan ke-${prev.length + 1}`,
        expectedEvidence: "Foto dokumentasi pelaksanaan kegiatan & berita acara",
        suggestedKpi: "",
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) {
      alert("Minimal harus ada 1 tahapan kegiatan");
      return;
    }
    setStages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((s, idx) => ({ ...s, orderIndex: idx + 1 }));
    });
  };

  const handleSave = async () => {
    if (stages.length === 0) {
      setErrorMessage("Tidak ada tahapan untuk disimpan");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const payload = {
        replaceExisting: true,
        stages: stages.map((s, idx) => ({
          orderIndex: idx + 1,
          title: s.title.trim(),
          description: s.description.trim() || null,
          targetTimeline: s.targetTimeline.trim() || null,
          expectedEvidence: s.expectedEvidence.trim() || null,
          suggestedKpi: s.suggestedKpi.trim() || null,
          status: "PENDING" as const,
          source: "AI_GENERATED" as const,
        })),
      };

      const res = await fetch(`/api/programs/${programId}/stages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan tahapan kegiatan");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan tahapan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-linear-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 text-teal-700 text-[11px] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                LangChain & OpenAI GPT-4o-mini
              </span>
              {extractionSource && (
                <span className="text-[11px] font-medium text-slate-400">
                  {extractionSource === "AI_OPENAI" ? "• Model Aktif: gpt-4o-mini" : "• Heuristic Fallback"}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Ekstraksi Tahapan & Milestone Kegiatan dari Proposal
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-xl">
              Program: <span className="font-semibold text-slate-700">{programTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Not yet generated state */}
        {!hasGenerated && !isLoading && (
          <div className="text-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8 text-teal-600 animate-pulse" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h4 className="text-base font-bold text-slate-900">
                Otomatisasi Struktur Tahapan Pelaksanaan Lapangan
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sistem AI akan membaca dokumen proposal yang diunggah mitra, menganalisis ruang lingkup kegiatan, metodologi, dan linimasa waktu, lalu menyusun tahapan terstruktur beserta panduan bukti foto yang relevan.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleGenerate}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-linear-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
            >
              Mulai Ekstraksi dengan AI (gpt-4o-mini)
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-16 px-6 border border-slate-200/80 rounded-3xl bg-slate-50/50 space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
              <Cpu className="w-7 h-7 text-teal-600 absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                AI Sedang Menganalisis Proposal...
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Membaca isi proposal & PDF, mengekstrak linimasa, serta merumuskan panduan bukti lapangan terstruktur menggunakan OpenAI gpt-4o-mini.
              </p>
            </div>
          </div>
        )}

        {/* Generated & Edit List State */}
        {hasGenerated && !isLoading && (
          <div className="space-y-6">
            {/* AI Rationale banner */}
            {rationale && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 text-xs text-indigo-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  Rasionalisasi AI terhadap Dokumen Proposal:
                </div>
                <p className="text-indigo-800/90 leading-relaxed">{rationale}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  Daftar Tahapan Kegiatan ({stages.length} Tahap)
                </h4>
                <p className="text-xs text-slate-400">
                  Anda dapat meninjau, mengubah teks, atau menambah tahapan sebelum diterapkan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="text-xs border-slate-200 hover:bg-slate-50"
                >
                  Ekstrak Ulang AI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddStage}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  Tambah Tahap
                </Button>
              </div>
            </div>

            {/* Stages List */}
            <div className="space-y-4">
              {stages.map((st, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-teal-300 transition-all space-y-3.5 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) =>
                          handleUpdateStage(idx, "title", e.target.value)
                        }
                        className="text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden px-1.5 py-0.5 rounded transition w-full sm:w-96"
                        placeholder="Nama tahapan kegiatan"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={st.targetTimeline}
                          onChange={(e) =>
                            handleUpdateStage(idx, "targetTimeline", e.target.value)
                          }
                          className="w-24 text-xs bg-transparent focus:outline-hidden"
                          placeholder="Linimasa"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveStage(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Hapus tahapan ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Deskripsi Kegiatan
                    </label>
                    <textarea
                      rows={2}
                      value={st.description}
                      onChange={(e) =>
                        handleUpdateStage(idx, "description", e.target.value)
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden transition"
                      placeholder="Uraian langkah dan rencana aktivitas pada tahap ini..."
                    />
                  </div>

                  {/* Expected Evidence & KPI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100 text-xs space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-teal-800 text-[11px]">
                        <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                        Panduan Bukti Lapangan Wajib:
                      </div>
                      <input
                        type="text"
                        value={st.expectedEvidence}
                        onChange={(e) =>
                          handleUpdateStage(idx, "expectedEvidence", e.target.value)
                        }
                        className="w-full text-xs bg-white/80 border border-teal-200/60 rounded-lg px-2 py-1 text-slate-700 focus:outline-hidden focus:border-teal-500"
                        placeholder="Contoh: Foto koordinasi, presensi warga..."
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-slate-700 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                        Indikator Keberhasilan (KPI):
                      </div>
                      <input
                        type="text"
                        value={st.suggestedKpi}
                        onChange={(e) =>
                          handleUpdateStage(idx, "suggestedKpi", e.target.value)
                        }
                        className="w-full text-xs bg-white/80 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-hidden focus:border-slate-400"
                        placeholder="Contoh: 100 bibit mangrove tertanam..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                disabled={isSaving}
                className="text-xs"
              >
                Batal
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSave}
                  isLoading={isSaving}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
                >
                  Terapkan & Simpan Tahapan ({stages.length})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
