"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ProgramExpenseItem,
  EXPENSE_CATEGORY_CONFIG,
  ExpenseCategory,
  formatFinanceDate,
} from "./types";
import { formatRupiah } from "../company/helpers";

interface VerifyExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  expense: ProgramExpenseItem | null;
  onSuccess: () => void;
}

export function VerifyExpenseModal({
  isOpen,
  onClose,
  programId,
  expense,
  onSuccess,
}: VerifyExpenseModalProps) {
  const [verificationStatus, setVerificationStatus] = useState<"VERIFIED" | "REJECTED">("VERIFIED");
  const [verificationNotes, setVerificationNotes] = useState(
    "Nota sah dan stempel toko terverifikasi sesuai alokasi kegiatan."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !expense) return null;

  const catConfig = EXPENSE_CATEGORY_CONFIG[expense.category as ExpenseCategory] || {
    label: expense.category,
    variant: "slate" as const,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      const res = await fetch(
        `/api/programs/${programId}/expenses/${expense.id}/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            verificationStatus,
            verificationNotes: verificationNotes || null,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memverifikasi nota pengeluaran");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Verifikasi Bukti Pengeluaran & Nota
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pemeriksaan bukti fisik nota untuk validasi akuntabilitas anggaran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Expense Detail Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant={catConfig.variant} size="sm">
                {catConfig.label}
              </Badge>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatFinanceDate(expense.expenseDate)}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900">{expense.title}</h4>

            {expense.description && (
              <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
                {expense.description}
              </p>
            )}

            <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Nominal Nota:</span>
              <span className="text-base font-extrabold text-teal-700">
                {formatRupiah(expense.amount)}
              </span>
            </div>

            {/* Receipt Image Preview */}
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                Foto Nota / Kwitansi Fisik:
              </span>
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 group">
                <img
                  src={expense.receiptUrl}
                  alt="Nota Pengeluaran"
                  className="w-full h-full object-contain max-h-56 mx-auto"
                />
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity"
                >
                  <ExternalLink className="w-4 h-4" /> Buka Foto Asli Resolusi Penuh
                </a>
              </div>
            </div>
          </div>

          {/* Verification Decision */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Keputusan Verifikasi Perusahaan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setVerificationStatus("VERIFIED");
                  setVerificationNotes(
                    "Nota sah dan stempel toko terverifikasi sesuai alokasi kegiatan."
                  );
                }}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  verificationStatus === "VERIFIED"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Setujui (Valid & Sah)
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationStatus("REJECTED");
                  setVerificationNotes(
                    "Foto nota buram atau nominal tidak sesuai kwitansi. Mohon unggah ulang foto yang jelas."
                  );
                }}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  verificationStatus === "REJECTED"
                    ? "border-rose-600 bg-rose-50 text-rose-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                Tolak / Minta Revisi
              </button>
            </div>
          </div>

          {/* Verification Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Hasil Verifikasi (dapat dibaca mitra)
            </label>
            <textarea
              rows={2}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Berikan alasan atau catatan hasil pemeriksaan nota..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
              className={
                verificationStatus === "VERIFIED"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  : "bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              }
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Verifikasi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
