"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Calendar,
  MapPin,
  Users,
  Coins,
  FileCheck2,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Layers,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramStageItem, cleanStageTitle } from "./types";
import { formatCurrencyInput, parseCurrencyInput } from "../analytics/helpers";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programTitle: string;
  stages?: ProgramStageItem[];
  defaultStageId?: string;
  hasConfirmedDisbursement?: boolean;
  remainingPartnerBalance?: number;
  onSuccess: () => void;
}

export function AddActivityModal({
  isOpen,
  onClose,
  programId,
  programTitle,
  stages = [],
  defaultStageId = "",
  hasConfirmedDisbursement = true,
  remainingPartnerBalance,
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

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (defaultStageId) {
      setStageId(defaultStageId);
      const st = stages.find((s) => s.id === defaultStageId);
      if (st && !title) {
        setTitle(cleanStageTitle(st.title));
      }
    }
  }, [defaultStageId, stages]);

  const handleStageChange = (newStageId: string) => {
    setStageId(newStageId);
    const st = stages.find((s) => s.id === newStageId);
    if (st && (!title || stages.some((s) => s.title === title || cleanStageTitle(s.title) === title))) {
      setTitle(cleanStageTitle(st.title));
    }
  };

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
      setErrorMessage("Gagal mengunggah foto. Pastikan format berkas JPG, PNG, atau WEBP dan ukuran di bawah 5MB.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !activityDate) {
      setErrorMessage("Judul, deskripsi kegiatan, dan tanggal pelaksanaan wajib diisi.");
      return;
    }

    if (!hasConfirmedDisbursement) {
      setErrorMessage("Pencairan dana termin awal (Termin 1) diperlukan sebelum laporan kegiatan dapat disimpan.");
      return;
    }

    if (
      remainingPartnerBalance !== undefined &&
      fundsSpent &&
      parseCurrencyInput(fundsSpent) > remainingPartnerBalance
    ) {
      const formattedBalance = "Rp " + Math.round(remainingPartnerBalance).toLocaleString("id-ID");
      setErrorMessage(`Nominal dana terpakai melebihi sisa kas mitra (${formattedBalance})`);
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
        fundsSpent: fundsSpent ? parseCurrencyInput(fundsSpent) : null,
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

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Modal Container: Diperluas ke max-w-5xl dengan layout lega dan proporsional */}
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl my-4 sm:my-8 flex flex-col max-h-[94vh] overflow-hidden border border-slate-200/80">
        {/* Header */}
        <div className="flex items-start justify-between p-6 sm:px-8 pb-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#181343] uppercase tracking-wider block">
              Log Lapangan &amp; Bukti Kegiatan
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#181343] tracking-tight">
              Tambah Laporan Progres Kegiatan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 truncate max-w-2xl">
              Program: <span className="font-semibold text-slate-700">{programTitle}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:px-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!hasConfirmedDisbursement && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-800 shadow-2xs">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Pencairan dana termin awal (Termin 1) diperlukan sebelum laporan kegiatan dapat disimpan.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Kolom Kiri: Detail Informasi & Catatan (7 Kolom Lega) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Pilihan Tahapan Program (Milestone) */}
              {stages && stages.length > 0 && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-2 text-xs sm:text-sm">
                    <Layers className="w-4 h-4 text-[#181343]" />
                    Kaitkan ke Tahap Kegiatan
                  </label>
                  <select
                    value={stageId}
                    onChange={(e) => handleStageChange(e.target.value)}
                    className="w-full px-4 h-11 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] text-xs sm:text-sm transition"
                  >
                    <option value="">(Tanpa Tahapan Tertentu / Kegiatan Tambahan)</option>
                    {stages.map((st) => (
                      <option key={st.id} value={st.id}>
                        Tahap {st.orderIndex}: {cleanStageTitle(st.title)} {st.targetTimeline ? `[${st.targetTimeline}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Judul Kegiatan */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs sm:text-sm">
                  Judul Kegiatan Lapangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Penanaman 500 Bibit Mangrove &amp; Edukasi Warga Pesisir"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 h-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 transition"
                  required
                />
              </div>

              {/* Grid Tanggal & Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Calendar className="w-4 h-4 text-[#181343]" />
                    Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full px-4 h-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] text-xs sm:text-sm font-medium text-slate-800 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 text-[#181343]" />
                    Lokasi Lapangan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Desa Muara Gembong, Kab. Bekasi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 h-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition"
                  />
                </div>
              </div>

              {/* Penerima Manfaat Sesi Ini */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Users className="w-4 h-4 text-[#181343]" />
                  Penerima Manfaat Sesi Ini
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 150 Warga &amp; 30 Nelayan Pesisir"
                  value={beneficiariesReached}
                  onChange={(e) => setBeneficiariesReached(e.target.value)}
                  className="w-full px-4 h-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition"
                />
              </div>

              {/* Dana Terpakai di Sesi Ini (Dedicated Full-Width Row, Bebas Patah Kata & Tidak Terpotong) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-2 text-xs sm:text-sm">
                    <Coins className="w-4 h-4 text-[#181343] shrink-0" />
                    <span>Dana Terpakai di Sesi Ini</span>
                    <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
                  </label>
                  {remainingPartnerBalance !== undefined && (
                    <div className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg self-start sm:self-auto shrink-0">
                      Sisa Kas Mitra: <strong className="text-slate-900">Rp {Math.round(remainingPartnerBalance).toLocaleString("id-ID")}</strong>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 select-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0"
                    value={formatCurrencyInput(fundsSpent)}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^\d]/g, "");
                      setFundsSpent(clean);
                    }}
                    className="w-full pl-11 pr-4 h-11 sm:h-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] text-sm font-semibold text-slate-800 placeholder:text-slate-300 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Kosongkan jika kegiatan ini tidak menggunakan anggaran kas mitra secara langsung.
                </p>
                {remainingPartnerBalance !== undefined && fundsSpent && parseCurrencyInput(fundsSpent) > remainingPartnerBalance && (
                  <p className="text-xs font-semibold text-rose-600">
                    Nominal melebihi sisa kas mitra saat ini (Rp {Math.round(remainingPartnerBalance).toLocaleString("id-ID")})
                  </p>
                )}
              </div>

              {/* Deskripsi Kegiatan */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs sm:text-sm">
                  Rangkuman &amp; Catatan Lapangan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Ceritakan proses kegiatan di lapangan, respons warga binaan, kendala teknis (jika ada), dan hasil yang telah dicapai..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed resize-none transition"
                  required
                />
              </div>
            </div>

            {/* Kolom Kanan: Panduan Bukti & Lampiran Dokumentasi (5 Kolom) */}
            <div className="lg:col-span-5 space-y-5 flex flex-col">
              {/* Panduan Bukti Tahap yang Dipilih */}
              {selectedStage && (selectedStage.expectedEvidence || selectedStage.suggestedKpi) && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm space-y-2.5">
                  <span className="text-xs font-bold text-[#181343] block uppercase tracking-wide">
                    Indikator Tahap {selectedStage.orderIndex}:
                  </span>
                  {selectedStage.expectedEvidence && (
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 block mb-0.5">Panduan Bukti:</strong>
                      {selectedStage.expectedEvidence}
                    </div>
                  )}
                  {selectedStage.suggestedKpi && (
                    <div className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60">
                      <strong className="text-slate-800 block mb-0.5">Target Capaian:</strong>
                      {selectedStage.suggestedKpi}
                    </div>
                  )}
                </div>
              )}

              {/* Upload Foto Dokumentasi */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-2 text-xs sm:text-sm">
                    <ImageIcon className="w-4 h-4 text-[#181343]" />
                    Foto Dokumentasi ({mediaUrls.length}/6)
                  </label>
                  <span className="text-[11px] text-slate-400">JPG, PNG, maks. 5MB</span>
                </div>

                {/* Dropzone / Upload Button */}
                {mediaUrls.length < 6 && (
                  <label className="block cursor-pointer">
                    <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#181343] bg-slate-50/50 hover:bg-slate-50 transition text-center group">
                      <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#181343] transition mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-[#181343] transition">
                        {isUploading ? "Mengunggah foto..." : "Pilih atau Seret Foto ke Sini"}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Maksimal 6 foto dokumentasi kegiatan
                      </span>
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
                )}

                {/* Thumbnail Preview Grid */}
                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs">
                        <img src={url} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow-xs hover:bg-rose-700 cursor-pointer"
                          title="Hapus Foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dokumen Pendukung (BAST / PDF) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs sm:text-sm">
                  <FileCheck2 className="w-4 h-4 text-[#181343]" />
                  Tautan Berita Acara / Laporan PDF (BAST)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... atau tautan berkas pendukung"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full px-4 h-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition"
                />
                <p className="text-[11px] text-slate-400">
                  Opsional. Berkas tanda tangan berita acara serah terima atau dokumen pendukung.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer (Always Visible) */}
        <div className="p-4 sm:px-8 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            onClick={(e) => {
              const form = (e.currentTarget.closest(".bg-white") as HTMLElement)?.querySelector("form");
              if (form) form.requestSubmit();
            }}
            disabled={
              isSubmitting ||
              !hasConfirmedDisbursement ||
              (remainingPartnerBalance !== undefined &&
                !!fundsSpent &&
                parseCurrencyInput(fundsSpent) > remainingPartnerBalance)
            }
          >
            Simpan Laporan Kegiatan
          </Button>
        </div>
      </div>
    </div>
  );
}
