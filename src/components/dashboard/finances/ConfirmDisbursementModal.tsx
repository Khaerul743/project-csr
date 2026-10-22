"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramDisbursementItem, formatFinanceDate } from "./types";
import { formatRupiah } from "../company/helpers";

interface ConfirmDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  disbursement: ProgramDisbursementItem | null;
  onSuccess: () => void;
}

export function ConfirmDisbursementModal({
  isOpen,
  onClose,
  programId,
  disbursement,
  onSuccess,
}: ConfirmDisbursementModalProps) {
  const [confirmedNotes, setConfirmedNotes] = useState(
    "Dana telah diterima di rekening operasional dan siap digunakan sesuai rencana kegiatan."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !disbursement) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      const res = await fetch(
        `/api/programs/${programId}/disbursements/${disbursement.id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            confirmedNotes: confirmedNotes || null,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengonfirmasi penerimaan dana");
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
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Konfirmasi Penerimaan Dana
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verifikasi bahwa dana termin telah masuk ke rekening yayasan
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

          {/* Tranche Card Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {disbursement.trancheName}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {formatFinanceDate(disbursement.disbursedDate)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Nominal Penyaluran:</span>
              <span className="text-base font-extrabold text-emerald-600">
                {formatRupiah(disbursement.amount)}
              </span>
            </div>

            {/* Bank details */}
            {(disbursement.bankName || disbursement.bankAccountNumber) && (
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{disbursement.bankName || "Bank"}</span>
                  {disbursement.bankAccountNumber && (
                    <span className="text-slate-400">
                      - No. Rek: {disbursement.bankAccountNumber}
                    </span>
                  )}
                </div>
                {disbursement.bankAccountHolder && (
                  <div className="text-[11px] text-slate-500 pl-5.5">
                    a.n {disbursement.bankAccountHolder}
                  </div>
                )}
              </div>
            )}

            {/* Transfer proof image preview */}
            {disbursement.transferProofUrl && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Lampiran Slip Transfer dari Perusahaan:
                </span>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 group">
                  <img
                    src={disbursement.transferProofUrl}
                    alt="Slip Transfer"
                    className="w-full h-full object-contain max-h-48 mx-auto"
                  />
                  <a
                    href={disbursement.transferProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" /> Buka Gambar Asli
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Notes by partner */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Konfirmasi Penerimaan
            </label>
            <textarea
              rows={3}
              value={confirmedNotes}
              onChange={(e) => setConfirmedNotes(e.target.value)}
              placeholder="Tuliskan catatan verifikasi masuknya dana ke rekening..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
            <span className="font-bold">Perhatian:</span> Dengan menekan tombol konfirmasi, dana ini secara resmi tercatat masuk ke dalam kas kelolaan program mitra dan dapat segera dipertanggungjawabkan melalui pencatatan pengeluaran dan nota kegiatan.
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
              className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Mengonfirmasi..." : "Konfirmasi Dana Diterima"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
