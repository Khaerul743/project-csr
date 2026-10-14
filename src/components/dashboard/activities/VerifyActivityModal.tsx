"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Building2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramActivityItem } from "./types";
import { formatDate } from "../analytics/helpers";

interface VerifyActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ProgramActivityItem | null;
  onSuccess: () => void;
}

export function VerifyActivityModal({
  isOpen,
  onClose,
  activity,
  onSuccess,
}: VerifyActivityModalProps) {
  const [status, setStatus] = useState<"VERIFIED" | "REVISION_REQUESTED">("VERIFIED");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activity) {
      setStatus(activity.status === "REVISION_REQUESTED" ? "REVISION_REQUESTED" : "VERIFIED");
      setFeedback(activity.companyFeedback || "");
      setErrorMessage(null);
    }
  }, [activity]);

  if (!isOpen || !activity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(
        `/api/programs/${activity.programId}/activities/${activity.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            companyFeedback: feedback.trim() || null,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memverifikasi aktivitas");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses verifikasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Audit & Verifikasi Lapangan
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              Verifikasi Laporan Kegiatan Mitra
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activity Summary Context Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
            {activity.title}
          </h4>
          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(activity.activityDate)}
            </span>
            {activity.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activity.location}
              </span>
            )}
            {activity.submitterName && (
              <span className="text-slate-600">
                Oleh: <strong className="text-slate-800">{activity.submitterName}</strong>
              </span>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Decision Status Options */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">
              Keputusan Verifikasi Perusahaan:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("VERIFIED")}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  status === "VERIFIED"
                    ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      status === "VERIFIED" ? "text-emerald-600" : "text-slate-300"
                    }`}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Disetujui
                  </span>
                </div>
                <div>
                  <div className="font-extrabold text-sm">Verifikasi & Sahkan</div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    Bukti kegiatan valid dan sesuai rencana program
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus("REVISION_REQUESTED")}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  status === "REVISION_REQUESTED"
                    ? "bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20 text-rose-950 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <AlertCircle
                    className={`w-5 h-5 ${
                      status === "REVISION_REQUESTED" ? "text-rose-600" : "text-slate-300"
                    }`}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                    Perlu Revisi
                  </span>
                </div>
                <div>
                  <div className="font-extrabold text-sm">Minta Tambahan Info</div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    Perlu lampiran foto yang lebih jelas atau perbaikan berkas
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Catatan / Feedback */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Catatan Apresiasi & Feedback untuk Mitra (Opsional):
            </label>
            <textarea
              rows={3}
              placeholder={
                status === "VERIFIED"
                  ? "Bagus sekali tim! Dokumentasi penanaman mangrove sangat rapi dan sesuai target."
                  : "Mohon lampirkan foto berita acara serah terima (BAST) yang telah ditandatangani kepala desa."
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
              className={
                status === "VERIFIED"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              }
            >
              Simpan Hasil Verifikasi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
