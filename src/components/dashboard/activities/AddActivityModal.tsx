"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Upload,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileCheck2,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  FileText,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramStageItem } from "./types";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programTitle: string;
  stages?: ProgramStageItem[];
  defaultStageId?: string;
  onSuccess: () => void;
}

export function AddActivityModal({
  isOpen,
  onClose,
  programId,
  programTitle,
  stages = [],
  defaultStageId = "",
  onSuccess,
}: AddActivityModalProps) {
  const [stageId, setStageId] = useState<string>(defaultStageId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [location, setLocation] = useState("");
  const [beneficiariesReached, setBeneficiariesReached] = useState("");
  const [fundsSpent, setFundsSpent] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  // Media URLs array
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultStageId) {
      setStageId(defaultStageId);
    }
  }, [defaultStageId]);

  if (!isOpen) return null;

  const selectedStage = stages.find((s) => s.id === stageId);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mediaUrls.length + files.length > 6) {
      alert("Maksimal 6 foto dokumentasi per log aktivitas");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data?.url) {
            uploadedUrls.push(json.data.url);
          }
        }
      }

      setMediaUrls((prev) => [...prev, ...uploadedUrls]);
    } catch {
      setErrorMessage("Gagal mengunggah foto. Pastikan format JPG/PNG dan ukuran < 5MB.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAddManualUrl = () => {
    if (!manualImageUrl.trim()) return;
    if (mediaUrls.length >= 6) {
      alert("Maksimal 6 foto dokumentasi");
      return;
    }
    setMediaUrls((prev) => [...prev, manualImageUrl.trim()]);
    setManualImageUrl("");
  };

  const handleRemovePhoto = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !activityDate) {
      setErrorMessage("Judul, deskripsi, dan tanggal kegiatan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const payload = {
        stageId: stageId || null,
        title: title.trim(),
        description: description.trim(),
        activityDate,
        location: location.trim() || null,
        beneficiariesReached: beneficiariesReached.trim() || null,
        fundsSpent: fundsSpent ? parseFloat(fundsSpent) : null,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
        documentUrl: documentUrl.trim() || null,
      };

      const res = await fetch(`/api/programs/${programId}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah laporan aktivitas");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setBeneficiariesReached("");
      setFundsSpent("");
      setMediaUrls([]);
      setDocumentUrl("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider block">
              Log Lapangan & Bukti Kegiatan
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Tambah Laporan Progres Kegiatan
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-md">
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Pilihan Tahapan Program (Milestone) */}
          {stages && stages.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-teal-50/40 border border-teal-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  Kaitkan ke Tahap / Milestone Kegiatan
                </label>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-100/80 px-2 py-0.5 rounded-full">
                  Panduan AI Terstruktur
                </span>
              </div>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">-- Tanpa Tahapan Tertentu (Kegiatan Tambahan) --</option>
                {stages.map((st) => (
                  <option key={st.id} value={st.id}>
                    Tahap {st.orderIndex}: {st.title} {st.targetTimeline ? `[${st.targetTimeline}]` : ""}
                  </option>
                ))}
              </select>

              {/* Panduan Bukti Kegiatan untuk Tahap yang Dipilih */}
              {selectedStage && (
                <div className="p-3 rounded-xl bg-white border border-teal-100 text-[11px] space-y-1.5 shadow-2xs">
                  {selectedStage.expectedEvidence && (
                    <div className="flex items-start gap-1.5 text-teal-900">
                      <span className="font-bold text-teal-700 shrink-0">📸 Panduan Bukti:</span>
                      <span className="leading-relaxed">{selectedStage.expectedEvidence}</span>
                    </div>
                  )}
                  {selectedStage.suggestedKpi && (
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <span className="font-bold text-slate-700 shrink-0">🎯 Target KPI:</span>
                      <span className="leading-relaxed">{selectedStage.suggestedKpi}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Judul Kegiatan */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              Judul Kegiatan Lapangan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Penanaman 500 Bibit Mangrove & Edukasi Warga Pesisir"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              required
            />
          </div>

          {/* Grid Tanggal & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Tanggal Pelaksanaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Lokasi Lapangan
              </label>
              <input
                type="text"
                placeholder="Contoh: Desa Muara Gembong, Kab. Bekasi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Grid Penerima Manfaat & Dana Terpakai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                Penerima Manfaat Sesi Ini
              </label>
              <input
                type="text"
                placeholder="Contoh: 150 Warga & 30 Nelayan"
                value={beneficiariesReached}
                onChange={(e) => setBeneficiariesReached(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Dana Terpakai di Sesi Ini (IDR, opsional)
              </label>
              <input
                type="number"
                placeholder="Contoh: 12500000"
                value={fundsSpent}
                onChange={(e) => setFundsSpent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Deskripsi Kegiatan */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              Rangkuman & Catatan Lapangan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Ceritakan proses kegiatan di lapangan, respons warga binaan, kendala teknis (jika ada), dan hasil yang telah dicapai..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
              required
            />
          </div>

          {/* Upload Foto Dokumentasi */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-600" />
                Foto Dokumentasi Lapangan ({mediaUrls.length}/6)
              </label>
              <span className="text-[10px] text-slate-400">Format JPG/PNG, maks 5MB</span>
            </div>

            {/* Thumbnail Grid */}
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={url} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow-xs"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button & Manual URL */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 text-teal-700 font-semibold transition">
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? "Mengunggah..." : "Pilih Foto dari Perangkat"}</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading || mediaUrls.length >= 6}
                />
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                placeholder="Atau tempel link URL foto langsung di sini..."
                value={manualImageUrl}
                onChange={(e) => setManualImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddManualUrl}
                disabled={!manualImageUrl.trim() || mediaUrls.length >= 6}
              >
                Tambah
              </Button>
            </div>
          </div>

          {/* Dokumen Pendukung (BAST / PDF) */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
              Tautan Berkas Berita Acara / Laporan PDF (BAST)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/... atau link berkas PDF pendukung kegiatan"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
            >
              Simpan & Unggah Laporan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
