"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Save,
  MapPin,
  Calendar,
  AlertCircle,
  ImageIcon,
  Upload,
  X,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { opportunityStatusEnum, OpportunityStatus } from "@/db/schema/opportunities";
import { FOCUS_AREA_CONFIG, STATUS_CONFIG, formatRupiah } from "./helpers";
import { OpportunityItem } from "./types";
import { ALL_17_SDGS, getProgramSdgs } from "@/components/dashboard/analytics/helpers";
import { SdgGoal } from "@/components/dashboard/analytics/types";

interface EditOpportunityModalProps {
  isOpen: boolean;
  opportunity: OpportunityItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_SDGS_BY_FOCUS: Record<CsrFocusArea, number[]> = {
  LINGKUNGAN: [13, 14, 15, 17],
  PENDIDIKAN: [4, 8, 10, 17],
  KESEHATAN: [3, 2, 6, 17],
  PEMBERDAYAAN_EKONOMI: [1, 8, 10, 17],
  INFRASTRUKTUR_SOSIAL: [9, 11, 6, 17],
  TANGGAP_BENCANA: [11, 1, 3, 17],
  LAINNYA: [10, 17],
};

export function EditOpportunityModal({
  isOpen,
  opportunity,
  onClose,
  onSuccess,
}: EditOpportunityModalProps) {
  const [title, setTitle] = useState("");
  const [focusArea, setFocusArea] = useState<CsrFocusArea>("LINGKUNGAN");
  const [estimatedBudget, setEstimatedBudget] = useState<string>("");
  const [targetCity, setTargetCity] = useState("");
  const [targetProvince, setTargetProvince] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<OpportunityStatus>("OPEN");
  const [bannerUrl, setBannerUrl] = useState<string>("");

  // AI Need Prioritization & SDGs states
  const [isAiNeedOpen, setIsAiNeedOpen] = useState(false);
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([17]);
  const [isSdgsOpen, setIsSdgsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (opportunity) {
      setTitle(opportunity.title || "");
      setFocusArea(opportunity.focusArea || "LINGKUNGAN");
      setEstimatedBudget(
        opportunity.estimatedBudget
          ? String(Math.round(parseFloat(opportunity.estimatedBudget)))
          : ""
      );
      setTargetCity(opportunity.targetCity || "");
      setTargetProvince(opportunity.targetProvince || "");
      setStartDate(
        opportunity.startDate
          ? new Date(opportunity.startDate).toISOString().split("T")[0]
          : ""
      );
      setEndDate(
        opportunity.endDate
          ? new Date(opportunity.endDate).toISOString().split("T")[0]
          : ""
      );
      setDeadline(
        opportunity.deadline
          ? new Date(opportunity.deadline).toISOString().split("T")[0]
          : ""
      );
      setDescription(opportunity.description || "");
      setStatus(opportunity.status || "OPEN");
      setBannerUrl(opportunity.bannerUrl || "");
      setUploadError(null);
      setErrorMessage(null);

      // Parse SDGs from existing opportunity
      const initialSdgs = getProgramSdgs({
        id: opportunity.id,
        title: opportunity.title,
        description: opportunity.description,
        focusArea: opportunity.focusArea,
        status: "PLANNED",
        budget: opportunity.estimatedBudget || "0",
      });
      setSelectedSdgs(initialSdgs.length > 0 ? initialSdgs : DEFAULT_SDGS_BY_FOCUS[opportunity.focusArea] || [17]);
    }
  }, [opportunity]);

  const toggleSdg = (id: number) => {
    setSelectedSdgs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].sort((a, b) => a - b)
    );
  };

  // Mapped ESG Pillars
  const mappedEsgPillars = useMemo(() => {
    const pillars = {
      E: [] as SdgGoal[],
      S: [] as SdgGoal[],
      G: [] as SdgGoal[],
    };
    selectedSdgs.forEach((id) => {
      const goal = ALL_17_SDGS.find((g) => g.id === id);
      if (goal) {
        goal.esgPillars.forEach((p) => {
          if (p === "E" && !pillars.E.some((x) => x.id === id)) pillars.E.push(goal);
          if (p === "S" && !pillars.S.some((x) => x.id === id)) pillars.S.push(goal);
          if (p === "G" && !pillars.G.some((x) => x.id === id)) pillars.G.push(goal);
        });
      }
    });
    return pillars;
  }, [selectedSdgs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file gambar maksimal 5MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah gambar");
      }

      setBannerUrl(json.data.url);
    } catch (err: any) {
      setUploadError(err.message || "Terjadi kesalahan saat mengunggah gambar");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Judul peluang CSR wajib diisi.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Deskripsi inisiatif peluang wajib diisi.");
      return;
    }

    // Validation: deadline cannot be in the past when status is OPEN
    if (status === "OPEN" && deadline) {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        setErrorMessage("Batas waktu pengajuan proposal tidak boleh mendahului tanggal hari ini.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const rawBudget = estimatedBudget ? parseFloat(estimatedBudget.replace(/[^\d]/g, "")) : 0;
      const budgetNum = rawBudget > 0 ? rawBudget : undefined;

      // Clean and format description with SDGs tags
      const sdgLabels = selectedSdgs
        .map((id) => {
          const s = ALL_17_SDGS.find((g) => g.id === id);
          return s ? `${s.code} (${s.name})` : `SDG ${id}`;
        })
        .join(", ");

      const baseDesc = description.replace(/\n\n\[Klasifikasi SDGs:.*?\]/g, "").trim();
      const payloadDesc =
        selectedSdgs.length > 0 ? `${baseDesc}\n\n[Klasifikasi SDGs: ${sdgLabels}]` : baseDesc;

      const payload = {
        title: title.trim(),
        description: payloadDesc,
        focusArea,
        targetCity: targetCity.trim() || undefined,
        targetProvince: targetProvince.trim() || undefined,
        estimatedBudget: budgetNum,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        deadline: deadline || undefined,
        bannerUrl: bannerUrl || undefined,
        status,
      };

      const res = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui peluang CSR");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !opportunity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Peluang CSR"
      description="Perbarui informasi inisiatif peluang, wilayah sasaran, dan klasifikasi SDGs–ESG."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Title */}
        <Input
          label="Nama / Judul Peluang CSR *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Focus Area & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Bidang Fokus CSR *
            </label>
            <div className="relative">
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value as CsrFocusArea)}
                className="w-full text-sm bg-white border border-[#E8E8EA] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#181343]/30 focus:ring-2 focus:ring-[#181343]/10 text-slate-800 cursor-pointer"
              >
                {csrFocusAreaEnum.map((area) => (
                  <option key={area} value={area}>
                    {FOCUS_AREA_CONFIG[area]?.label || area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Estimasi Total Anggaran (IDR)
            </label>
            <Input
              placeholder="Contoh: 150000000"
              type="number"
              min="0"
              step="1000000"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              helperText={
                estimatedBudget && parseFloat(estimatedBudget) > 0
                  ? `Format: ${formatRupiah(estimatedBudget)}`
                  : "Kosongkan jika anggaran fleksibel / belum dipastikan"
              }
            />
          </div>
        </div>

        {/* Location Target */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Kota / Kabupaten"
            value={targetCity}
            onChange={(e) => setTargetCity(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
          />
          <Input
            label="Target Provinsi"
            value={targetProvince}
            onChange={(e) => setTargetProvince(e.target.value)}
          />
        </div>

        {/* ============================================================ */}
        {/* AI Need Prioritization Assistant */}
        {/* ============================================================ */}
        <div className="p-4 rounded-xl bg-slate-50 border border-[#E8E8EA] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#181343] block">
                  Analisis Kebutuhan Wilayah (AI Need Prioritization)
                </span>
                <span className="text-[11px] text-[#787680]">
                  Rekomendasi prioritas berbasis data kajian wilayah sasaran
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiNeedOpen(!isAiNeedOpen)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>{isAiNeedOpen ? "Tutup" : "Tinjau Analisis"}</span>
              {isAiNeedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isAiNeedOpen && (
            <div className="pt-2 space-y-3 text-xs border-t border-slate-200/80 animate-in fade-in duration-200">
              <div className="p-3 rounded-lg bg-white border border-[#E8E8EA] space-y-2 text-slate-700 leading-relaxed">
                <div className="font-semibold text-[#181343] flex items-center gap-1.5">
                  <span>Prioritas Sektor {FOCUS_AREA_CONFIG[focusArea]?.label}:</span>
                  <span className="text-emerald-700">{targetCity ? `${targetCity}, ${targetProvince || ""}` : "Wilayah Terpilih"}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Data inisiatif terdaftar mengindikasikan perlunya kesinambungan program bersama mitra lokal yang memiliki rekam jejak terverifikasi.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200/60">
                    <strong className="text-slate-800 block">Fokus Kebutuhan:</strong>
                    Pemberdayaan sasaran penerima manfaat langsung &amp; akuntabilitas dampak.
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200/60">
                    <strong className="text-slate-800 block">Rekomendasi Program:</strong>
                    Pelatihan terarah, sarana penunjang, dan pelaporan berkala berstandar ESG.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-[10px] text-slate-500 italic bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Catatan: Hasil analisis prioritas kebutuhan disusun sebagai pendukung pertimbangan strategis CSR perusahaan, bukan keputusan otomatis sistem.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* Integrasi SDGs & Pemetaan Otomatis Pilar ESG */}
        {/* ============================================================ */}
        <div className="p-4 rounded-xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#181343] block">
                Sasaran SDGs &amp; Pemetaan ESG
              </span>
              <span className="text-[11px] text-[#787680]">
                Pilih sasaran pembangunan berkelanjutan yang relevan dengan inisiatif
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSdgsOpen(!isSdgsOpen)}
              className="text-xs text-slate-600 hover:text-[#181343] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>{selectedSdgs.length} Terpilih</span>
              {isSdgsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Selected SDGs Quick Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedSdgs.map((id) => {
              const goal = ALL_17_SDGS.find((g) => g.id === id);
              if (!goal) return null;
              return (
                <span
                  key={goal.id}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: goal.color + "15",
                    borderColor: goal.color + "40",
                    color: goal.color,
                  }}
                >
                  <span>{goal.code}</span>
                  <span className="font-medium truncate max-w-[120px]">{goal.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleSdg(goal.id)}
                    className="ml-0.5 hover:opacity-75"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>

          {/* Expandable 17 SDGs Picker */}
          {isSdgsOpen && (
            <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Pilih dari 17 Sasaran SDGs:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                {ALL_17_SDGS.map((sdg) => {
                  const isChecked = selectedSdgs.includes(sdg.id);
                  return (
                    <button
                      key={sdg.id}
                      type="button"
                      onClick={() => toggleSdg(sdg.id)}
                      className={`p-2 rounded-lg text-left text-[11px] transition border flex items-center gap-1.5 ${
                        isChecked
                          ? "bg-slate-900 text-white border-slate-900 font-bold"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sdg.color }}
                      />
                      <span className="truncate">{sdg.code}: {sdg.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mapped ESG Pillars Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                🌿 Lingkungan (E)
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {mappedEsgPillars.E.length} Sasaran
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">
                👥 Sosial (S)
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {mappedEsgPillars.S.length} Sasaran
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">
                🏛️ Tata Kelola (G)
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {mappedEsgPillars.G.length} Sasaran
              </span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Batas Proposal"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />
          <Input
            label="Mulai Program"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />
          <Input
            label="Selesai Program"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Deskripsi & Ruang Lingkup Inisiatif *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />

        {/* Banner Upload */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Gambar Sampul / Banner Peluang
            </label>
            <span className="text-[11px] text-slate-400">
              Opsional • Format JPG/PNG maks 5MB
            </span>
          </div>

          {uploadError && (
            <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
          )}

          {bannerUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-[#E8E8EA] group aspect-video max-h-48 w-full bg-slate-100">
              <img
                src={bannerUrl}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-semibold cursor-pointer shadow-sm transition flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ganti Gambar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setBannerUrl("")}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#E8E8EA] hover:border-slate-400 rounded-xl p-4 text-center cursor-pointer transition bg-[#F9F9FB] hover:bg-white flex flex-col items-center justify-center gap-1.5 group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
              {isUploadingImage ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                  <span className="text-xs font-semibold text-slate-600">
                    Mengunggah gambar...
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E8EA] text-slate-600 flex items-center justify-center shadow-2xs">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Unggah Gambar Sampul
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      JPG, PNG, atau WEBP • Maksimal 5MB
                    </span>
                  </div>
                </>
              )}
            </label>
          )}
        </div>

        {/* Status Option */}
        <div className="flex flex-col gap-1.5 pt-1">
          <label className="text-xs font-semibold text-slate-700">
            Status Peluang
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {opportunityStatusEnum.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  status === st
                    ? "border-[#181343] bg-slate-50 text-[#181343] font-bold ring-2 ring-[#181343]/10"
                    : "border-[#E8E8EA] bg-white hover:bg-slate-50 text-slate-600 font-medium"
                } text-xs`}
              >
                {STATUS_CONFIG[st]?.label || st}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E8EA]">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border-[#E8E8EA] text-slate-700"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-[#181343] hover:bg-[#25205c] text-white font-bold rounded-xl px-5 cursor-pointer shadow-2xs"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
