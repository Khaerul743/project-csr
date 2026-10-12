"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  MapPin,
  Calendar,
  AlertCircle,
  Tag,
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

  const [isLoading, setIsLoading] = useState(false);
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
    }
  }, [opportunity]);

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
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold ring-2 ring-emerald-500/20"
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
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
