"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Activity,
  DollarSign,
  Calendar,
  Users,
  Building2,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Clock,
  Sparkles,
  Check,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyProgramItem } from "./types";
import {
  PROGRAM_STATUS_CONFIG,
  FOCUS_AREA_CONFIG,
  formatRupiah,
  formatDate,
} from "./helpers";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { ProgramStatus } from "@/db/schema/programs";

interface ProgramDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: CompanyProgramItem | null;
  onSuccess: () => void;
}

export function ProgramDetailModal({
  isOpen,
  onClose,
  program,
  onSuccess,
}: ProgramDetailModalProps) {
  const [status, setStatus] = useState<ProgramStatus>("PLANNED");
  const [spentBudget, setSpentBudget] = useState("");
  const [actualBeneficiaries, setActualBeneficiaries] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (program) {
      setStatus(program.status);
      setSpentBudget(program.spentBudget ? String(parseFloat(program.spentBudget)) : "0");
      setActualBeneficiaries(program.actualBeneficiaries || "");
      setDescription(program.description || "");
      setErrorMsg(null);
    }
  }, [program]);

  if (!isOpen || !program) return null;

  const statusConfig =
    PROGRAM_STATUS_CONFIG[program.status] || {
      label: program.status,
      variant: "slate" as const,
    };

  const focusConfig = program.focusArea
    ? FOCUS_AREA_CONFIG[program.focusArea as CsrFocusArea]
    : null;

  const totalBudgetNum = parseFloat(program.budget || "0") || 1;
  const currentSpentNum = parseFloat(spentBudget || "0") || 0;
  const progressPercent = Math.min(100, Math.round((currentSpentNum / totalBudgetNum) * 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      const res = await fetch(`/api/programs/${program.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          spentBudget: spentBudget ? parseFloat(spentBudget) : 0,
          actualBeneficiaries: actualBeneficiaries.trim() || null,
          description: description.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui status program");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan pembaruan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-700 text-base overflow-hidden shrink-0">
              {program.partnerLogo ? (
                <img
                  src={program.partnerLogo}
                  alt={program.partnerName || "Mitra"}
                  className="w-full h-full object-cover"
                />
              ) : (
                (program.partnerName || "M").substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {program.title}
                </h3>
                <Badge variant={statusConfig.variant} size="sm" hasDot>
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="font-semibold text-slate-700">
                  Mitra: {program.partnerName || "Mitra Pelaksana"}
                </span>
                {program.targetCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {program.targetCity}
                  </span>
                )}
                {focusConfig && (
                  <Badge variant={focusConfig.variant} size="sm">
                    {focusConfig.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Progress Serapan Anggaran Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                Realisasi Serapan Anggaran CSR
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                {progressPercent}% Terserap
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Dana Terealisasi</span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    {formatRupiah(currentSpentNum)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total Pagu Anggaran</span>
                  <span className="text-sm font-bold text-slate-200">
                    {formatRupiah(program.budget)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Program Information Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Jadwal Pelaksanaan
              </span>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {program.startDate && program.endDate
                  ? `${formatDate(program.startDate)} - ${formatDate(program.endDate)}`
                  : "Belum ditentukan"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Target Manfaat
              </span>
              <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                {program.targetBeneficiaries || "-"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Dokumen Legal MoU
              </span>
              {program.collaborationMouUrl ? (
                <a
                  href={program.collaborationMouUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                >
                  <FileCheck2 className="w-3.5 h-3.5" /> Buka MoU
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Belum terlampir</span>
              )}
            </div>
          </div>

          {/* Form Pembaruan Progres */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Pembaruan Progres & Realisasi Lapangan
            </h4>

            {/* Status Program Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Status Pelaksanaan Program
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(["PLANNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"] as ProgramStatus[]).map((st) => {
                  const cfg = PROGRAM_STATUS_CONFIG[st];
                  const isSelected = status === st;
                  return (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setStatus(st)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-teal-600 bg-teal-50 text-teal-800 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span>{cfg.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spent Budget & Actual Beneficiaries Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Realisasi Dana CSR yang Terserap (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={spentBudget}
                    onChange={(e) => setSpentBudget(e.target.value)}
                    placeholder="0"
                    min="0"
                    max={totalBudgetNum}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Pagu maksimal: {formatRupiah(program.budget)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Realisasi Penerima Manfaat Aktual
                </label>
                <input
                  type="text"
                  value={actualBeneficiaries}
                  onChange={(e) => setActualBeneficiaries(e.target.value)}
                  placeholder="Contoh: 120 KK Nelayan & 40 Anak Sekolah"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Target awal: {program.targetBeneficiaries || "-"}
                </span>
              </div>
            </div>

            {/* Progress Notes / Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Catatan / Ringkasan Pelaksanaan Lapangan
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Catatan mengenai perkembangan kegiatan, tantangan di lapangan, atau milestone yang telah diselesaikan..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Pembaruan Program"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
