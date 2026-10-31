"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  MapPin,
  Calendar,
  AlertCircle,
  Tag,
  ImageIcon,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { opportunityStatusEnum, OpportunityStatus } from "@/db/schema/opportunities";
import { FOCUS_AREA_CONFIG, STATUS_CONFIG, formatRupiah } from "./helpers";
import { OpportunityItem } from "./types";

interface EditOpportunityModalProps {
  isOpen: boolean;
  opportunity: OpportunityItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

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
    }
  }, [opportunity]);

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
        throw new Error(json.message || "Gagal mengunggah thumbnail");
      }

      setBannerUrl(json.data.url);
    } catch (err: any) {
      setUploadError(err.message || "Terjadi kesalahan saat mengunggah thumbnail");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Judul opportunity wajib diisi.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Deskripsi inisiatif wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const budgetNum = estimatedBudget
        ? parseFloat(estimatedBudget.replace(/[^\d]/g, ""))
        : undefined;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        focusArea,
        targetCity: targetCity.trim() || undefined,
        targetProvince: targetProvince.trim() || undefined,
        estimatedBudget: budgetNum,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        deadline: deadline || undefined,
        bannerUrl: bannerUrl || null,
        status,
      };

      const res = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui opportunity");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!opportunity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Peluang Inisiatif CSR"
      description={`Perbarui detail inisiatif: ${opportunity.title}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Judul Inisiatif / Opportunity *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Thumbnail Upload */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Thumbnail / Banner Inisiatif
            </label>
            <span className="text-[11px] text-slate-400">
              Opsional • Disimpan di folder lokal
            </span>
          </div>

          {uploadError && (
            <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
          )}

          {bannerUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900 aspect-video max-h-52 w-full">
              <img
                src={bannerUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold cursor-pointer shadow-sm transition-all flex items-center gap-1.5">
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
                  className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-50/60 hover:bg-emerald-50/30 flex flex-col items-center justify-center gap-2 group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
              {isUploadingImage ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-600">
                    Mengunggah thumbnail ke server...
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">
                      Pilih atau Unggah Thumbnail dari Komputer
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Format PNG, JPG, WEBP • Ukuran maksimal 5MB
                    </span>
                  </div>
                </>
              )}
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Bidang Fokus CSR *
            </label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value as CsrFocusArea)}
              className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            >
              {csrFocusAreaEnum.map((area) => (
                <option key={area} value={area}>
                  {FOCUS_AREA_CONFIG[area]?.label || area}
                </option>
              ))}
            </select>
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
                estimatedBudget
                  ? `Format: ${formatRupiah(estimatedBudget)}`
                  : "Kosongkan jika fleksibel"
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Kota / Kabupaten"
            value={targetCity}
            onChange={(e) => setTargetCity(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Target Provinsi"
            value={targetProvince}
            onChange={(e) => setTargetProvince(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Batas Proposal"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Mulai Program"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Selesai Program"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>

        <Textarea
          label="Deskripsi & Ruang Lingkup Inisiatif *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />

        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5 pt-1">
          <label className="text-xs font-semibold text-slate-700">
            Status Inisiatif
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {opportunityStatusEnum.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  status === st
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium"
                } text-xs`}
              >
                {STATUS_CONFIG[st]?.label || st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="md"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
