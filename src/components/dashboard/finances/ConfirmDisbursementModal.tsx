"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
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
  const [confirmedNotes, setConfirmedNotes] = useState("");
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#181343] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Penerimaan Dana
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verifikasi bahwa dana termin telah masuk ke rekening yayasan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tranche Card Info */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                {disbursement.trancheName}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatFinanceDate(disbursement.disbursedDate)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Nominal Penyaluran:</span>
              <span className="text-base font-bold text-[#181343] tracking-tight">
                {formatRupiah(disbursement.amount)}
              </span>
            </div>

            {/* Bank details */}
            {(disbursement.bankName || disbursement.bankAccountNumber) && (
              <div className="text-xs text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#181343] shrink-0" />
                  <span className="font-semibold text-slate-900">{disbursement.bankName || "Bank"}</span>
                  {disbursement.bankAccountNumber && (
                    <span className="text-slate-500 font-mono">
                      (No. Rek: {disbursement.bankAccountNumber})
                    </span>
                  )}
                </div>
                {disbursement.bankAccountHolder && (
                  <div className="text-[11px] text-slate-500 pl-5.5 font-medium">
                    a.n {disbursement.bankAccountHolder}
                  </div>
                )}
              </div>
            )}

            {/* Transfer proof image preview */}
            {disbursement.transferProofUrl && (
              <div className="pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-600">
                    Lampiran Slip Transfer dari Perusahaan:
                  </span>
                  <a
                    href={disbursement.transferProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#181343] hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink className="w-3 h-3" /> Buka Foto Asli
                  </a>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white max-h-56 group flex items-center justify-center p-2">
                  <img
                    src={disbursement.transferProofUrl}
                    alt="Slip Transfer"
                    className="w-full h-full object-contain max-h-52 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes by partner */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Catatan Konfirmasi Penerimaan
            </label>
            <textarea
              rows={3}
              value={confirmedNotes}
              onChange={(e) => setConfirmedNotes(e.target.value)}
              placeholder="Tambahkan catatan verifikasi masuknya dana ke rekening atau nomor referensi mutasi bank (opsional)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-colors resize-none"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Perhatian:</strong> Dengan menekan konfirmasi, dana ini resmi tercatat masuk ke kas program dan dapat dipertanggungjawabkan untuk belanja kegiatan lapangan.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4 shrink-0" />}
              className="bg-[#181343] hover:bg-[#25205c] text-white rounded-xl h-10 px-5 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Mengonfirmasi..." : "Konfirmasi Dana Diterima"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
