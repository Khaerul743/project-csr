"use client";

import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { FOCUS_AREA_CONFIG, formatRupiah } from "./helpers";

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOpportunityModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateOpportunityModalProps) {
  const [title, setTitle] = useState("");
  const [focusArea, setFocusArea] = useState<CsrFocusArea>("LINGKUNGAN");
  const [estimatedBudget, setEstimatedBudget] = useState<string>("");
  const [targetCity, setTargetCity] = useState("");
  const [targetProvince, setTargetProvince] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"OPEN" | "DRAFT">("OPEN");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        status,
      };

      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal membuat opportunity");
      }

      handleReset();
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setFocusArea("LINGKUNGAN");
    setEstimatedBudget("");
    setTargetCity("");
    setTargetProvince("");
    setStartDate("");
    setEndDate("");
    setDeadline("");
    setDescription("");
    setStatus("OPEN");
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Buka Peluang Inisiatif CSR Baru"
      description="Publikasikan rencana program CSR Anda agar mitra pelaksana (NGO/Yayasan) dapat mengajukan proposal kolaborasi."
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
          label="Judul Inisiatif / Opportunity *"
          placeholder="Contoh: Restorasi Terumbu Karang & Pemberdayaan Nelayan Pesisir 2026"
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
                className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
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
                estimatedBudget
                  ? `Format: ${formatRupiah(estimatedBudget)}`
                  : "Kosongkan jika anggaran fleksibel / belum dipastikan"
              }
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Kota / Kabupaten"
            placeholder="Contoh: Semarang"
            value={targetCity}
            onChange={(e) => setTargetCity(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Target Provinsi"
            placeholder="Contoh: Jawa Tengah"
            value={targetProvince}
            onChange={(e) => setTargetProvince(e.target.value)}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Batas Proposal"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
            helperText="Batas akhir submisi proposal"
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

        {/* Description */}
        <Textarea
          label="Deskripsi & Ruang Lingkup Inisiatif *"
          placeholder="Jelaskan latar belakang program, target penerima manfaat, tujuan keberlanjutan ESG, dan kualifikasi mitra yang dicari..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />

        {/* Status Option */}
        <div className="flex flex-col gap-1.5 pt-1">
          <label className="text-xs font-semibold text-slate-700">
            Status Publikasi
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus("OPEN")}
              className={`p-3 rounded-xl border text-left transition-all ${
                status === "OPEN"
                  ? "border-emerald-500 bg-emerald-50/50 text-slate-900 ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Publikasikan Sekarang (OPEN)</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Langsung tampil di katalog publik dan siap menerima proposal mitra
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatus("DRAFT")}
              className={`p-3 rounded-xl border text-left transition-all ${
                status === "DRAFT"
                  ? "border-slate-500 bg-slate-100 text-slate-900 ring-2 ring-slate-400/20"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <Tag className="w-3.5 h-3.5 text-slate-600" />
                <span>Simpan Sebagai Draf (DRAFT)</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Hanya terlihat oleh tim internal perusahaan Anda
              </span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleReset}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {status === "OPEN" ? "Buka & Publikasikan" : "Simpan Draf"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
