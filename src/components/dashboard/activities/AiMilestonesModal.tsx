"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Layers,
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
import { cleanStageTitle } from "./types";

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
        throw new Error(json.message || "Gagal mengekstrak tahapan dari proposal");
      }

      const data = json.data;
      setRationale(data.summaryRationale || null);
      setStages(
        (data.stages || []).map((s: any, idx: number) => ({
          orderIndex: s.orderIndex || idx + 1,
          title: cleanStageTitle(s.title) || `Kegiatan ${idx + 1}`,
          description: s.description || "",
          targetTimeline: s.targetTimeline || "",
          expectedEvidence: s.expectedEvidence || "",
          suggestedKpi: s.suggestedKpi || "",
        }))
      );
      setHasGenerated(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses ekstraksi tahapan");
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
        title: `Kegiatan Lanjutan ${prev.length + 1}`,
        description: "",
        targetTimeline: `Bulan ke-${prev.length + 1}`,
        expectedEvidence: "Foto dokumentasi pelaksanaan kegiatan dan berita acara",
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
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto border border-slate-200/80">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[#181343] text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#181343]" />
                Ekstraksi Cerdas Proposal
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#181343]">
              Ekstraksi Tahapan &amp; Milestone Kegiatan
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-xl">
              Program: <span className="font-semibold text-slate-700">{programTitle}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Belum Diekstrak (Tampilan Awal) */}
        {!hasGenerated && !isLoading && (
          <div className="text-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#181343] border border-slate-200 shadow-2xs flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7 text-[#181343]" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h4 className="text-base font-bold text-slate-900">
                Penyusunan Struktur Tahapan Pelaksanaan Lapangan
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sistem akan menganalisis isi dokumen proposal yang disepakati bersama mitra, mengidentifikasi ruang lingkup kegiatan, metodologi, dan linimasa waktu, lalu menyusun tahapan kerja terstruktur beserta indikator capaian dan panduan bukti foto yang relevan.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleGenerate}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="font-semibold shadow-xs"
            >
              Mulai Ekstraksi Tahapan Proposal
            </Button>
          </div>
        )}

        {/* Status Loading Saat Analisis */}
        {isLoading && (
          <div className="text-center py-16 px-6 border border-slate-200/80 rounded-2xl bg-slate-50/50 space-y-4">
            <div className="relative w-14 h-14 mx-auto">
              <div className="absolute inset-0 rounded-full border-3 border-slate-200 border-t-[#181343] animate-spin" />
              <Cpu className="w-6 h-6 text-[#181343] absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Sedang Menganalisis Dokumen Proposal...
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Membaca isi proposal, mengidentifikasi linimasa pelaksanaan, serta merumuskan indikator keberhasilan dan panduan bukti lapangan.
              </p>
            </div>
          </div>
        )}

        {/* Hasil Ekstraksi & Form Pengeditan Tahapan */}
        {hasGenerated && !isLoading && (
          <div className="space-y-6">
            {/* Ringkasan Analisis Dokumen Proposal */}
            {rationale && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[#181343]">
                  <Lightbulb className="w-4 h-4 text-[#181343]" />
                  Ringkasan Analisis Dokumen Proposal:
                </div>
                <p className="text-slate-600 leading-relaxed">{rationale}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#181343]" />
                  Daftar Tahapan Kegiatan ({stages.length} Tahap)
                </h4>
                <p className="text-xs text-slate-500">
                  Tinjau dan sesuaikan nama tahapan, linimasa, serta indikator sebelum diterapkan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Ekstrak Ulang
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddStage}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Tambah Tahap
                </Button>
              </div>
            </div>

            {/* Daftar Tahapan */}
            <div className="space-y-4">
              {stages.map((st, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-[#181343]/40 transition-all space-y-3.5 relative shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1">
                      <span className="w-7 h-7 rounded-lg bg-[#181343] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) =>
                          handleUpdateStage(idx, "title", e.target.value)
                        }
                        className="text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#181343] focus:bg-white focus:outline-none px-1.5 py-0.5 rounded transition w-full"
                        placeholder="Nama tahapan kegiatan"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={st.targetTimeline}
                          onChange={(e) =>
                            handleUpdateStage(idx, "targetTimeline", e.target.value)
                          }
                          className="w-24 text-xs bg-transparent focus:outline-none font-medium text-slate-800"
                          placeholder="Linimasa"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus tahapan ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Deskripsi Kegiatan */}
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
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:border-[#181343] focus:ring-1 focus:ring-[#181343]/15 focus:outline-none transition leading-relaxed"
                      placeholder="Uraian langkah dan rencana aktivitas pada tahap ini..."
                    />
                  </div>

                  {/* Panduan Bukti & KPI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-[#181343] text-xs">
                        <FileCheck2 className="w-3.5 h-3.5 text-[#181343]" />
                        Panduan Bukti Lapangan:
                      </div>
                      <input
                        type="text"
                        value={st.expectedEvidence}
                        onChange={(e) =>
                          handleUpdateStage(idx, "expectedEvidence", e.target.value)
                        }
                        className="w-full text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#181343]"
                        placeholder="Contoh: Foto koordinasi, presensi warga..."
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#181343]" />
                        Indikator Keberhasilan (KPI):
                      </div>
                      <input
                        type="text"
                        value={st.suggestedKpi}
                        onChange={(e) =>
                          handleUpdateStage(idx, "suggestedKpi", e.target.value)
                        }
                        className="w-full text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#181343]"
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
                type="button"
                variant="outline"
                size="md"
                onClick={onClose}
                disabled={isSaving}
                className="text-xs"
              >
                Batal
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="text-xs font-semibold"
              >
                Terapkan &amp; Simpan Tahapan ({stages.length})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
