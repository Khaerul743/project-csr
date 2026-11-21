"use client";

import React, { useState } from "react";
import {
  X,
  Coins,
  Upload,
  Calendar,
  Building2,
  CreditCard,
  User,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatCurrencyInput, parseCurrencyInput } from "../company/helpers";

interface DisburseFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  nextTrancheNumber: number;
  remainingBudget: number;
  onSuccess: () => void;
}

const COMMON_BANKS = [
  "Bank Mandiri",
  "Bank Central Asia (BCA)",
  "Bank Rakyat Indonesia (BRI)",
  "Bank Negara Indonesia (BNI)",
  "Bank Syariah Indonesia (BSI)",
  "Bank CIMB Niaga",
  "Bank Danamon",
  "Bank Permata",
];

export function DisburseFundModal({
  isOpen,
  onClose,
  programId,
  nextTrancheNumber,
  remainingBudget,
  onSuccess,
}: DisburseFundModalProps) {
  const [trancheName, setTrancheName] = useState(
    `Termin ${nextTrancheNumber} (Penyaluran Tahap ${nextTrancheNumber})`
  );
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("Bank Mandiri");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [disbursedDate, setDisbursedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [transferProofUrl, setTransferProofUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentAmtNum = parseCurrencyInput(amount);
  const isOverBudget = remainingBudget <= 0 || (currentAmtNum > 0 && currentAmtNum > remainingBudget);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

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

      if (!res.ok) {
        throw new Error("Gagal mengunggah bukti transfer");
      }

      const json = await res.json();
      if (json.data?.url) {
        setTransferProofUrl(json.data.url);
      }
    } catch {
      setErrorMessage("Gagal mengunggah foto. Pastikan format JPG/PNG dan ukuran < 5MB.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const amt = parseCurrencyInput(amount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMessage("Nominal dana penyaluran harus lebih besar dari 0");
      return;
    }

    // STRICT GUARDRAIL: Dana penyaluran tidak boleh melebihi pagu anggaran
    if (remainingBudget <= 0) {
      setErrorMessage(
        "Total pagu anggaran program telah disalurkan seluruhnya. Tidak dapat menyalurkan dana melebihi anggaran yang telah disepakati diawal."
      );
      return;
    }

    if (amt > remainingBudget) {
      setErrorMessage(
        `Nominal penyaluran (${formatRupiah(amt)}) melebihi sisa pagu anggaran yang dapat disalurkan (${formatRupiah(remainingBudget)}).`
      );
      return;
    }

    if (!transferProofUrl) {
      setErrorMessage("Mohon sertakan bukti/slip transfer pencairan dana");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login telah berakhir");

      const res = await fetch(`/api/programs/${programId}/disbursements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trancheNumber: nextTrancheNumber,
          trancheName,
          amount: amt,
          bankName,
          bankAccountNumber: bankAccountNumber || null,
          bankAccountHolder: bankAccountHolder || null,
          disbursedDate,
          transferProofUrl,
          notes: notes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyalurkan dana termin");
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#181343] text-white flex items-center justify-center shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Penyaluran Dana Termin CSR
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Kirimkan dana bertahap untuk dikonfirmasi oleh mitra pelaksana
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Zero Remaining Budget Warning */}
          {remainingBudget <= 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Pagu Anggaran Telah Disalurkan Seluruhnya</span>
                <span>
                  Total dana CSR yang disepakati diawal telah disalurkan 100%. Tidak ada alokasi pagu tersisa untuk pencairan termin baru.
                </span>
              </div>
            </div>
          )}

          {/* Sisa pagu notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Sisa Pagu yang Dapat Disalurkan:</span>
            <span className={`font-bold ${remainingBudget <= 0 ? "text-slate-400" : "text-[#181343]"}`}>
              {formatRupiah(remainingBudget)}
            </span>
          </div>

          {/* Tranche Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Nama Termin / Tahap Penyaluran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={trancheName}
              onChange={(e) => setTrancheName(e.target.value)}
              placeholder="Contoh: Termin 1 (DP Persiapan 40%)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-colors"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Nominal Transfer (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  value={formatCurrencyInput(amount)}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^\d]/g, "");
                    setAmount(clean);
                  }}
                  placeholder="0"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-bold transition-colors focus:outline-none focus:ring-2 ${
                    isOverBudget && currentAmtNum > 0
                      ? "border-rose-400 text-rose-700 bg-rose-50/30 focus:ring-rose-500/20 focus:border-rose-500"
                      : "border-slate-200 text-slate-900 focus:ring-[#181343]/15 focus:border-[#181343]"
                  }`}
                />
              </div>

              {/* Over-budget warning */}
              {isOverBudget && currentAmtNum > 0 && remainingBudget > 0 && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Melebihi sisa pagu yang dapat disalurkan ({formatRupiah(remainingBudget)})
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Tanggal Penyaluran <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={disbursedDate}
                  onChange={(e) => setDisbursedDate(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#181343]" />
              Rekening Tujuan Transfer Mitra
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Nama Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-colors bg-white cursor-pointer"
                >
                  {COMMON_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="Bank Lainnya">Bank Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Nomor Rekening
                </label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Contoh: 1234567890"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-colors bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Nama Pemilik Rekening
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Contoh: Yayasan Bina Lingkungan Nusantara"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-colors bg-white"
                />
              </div>
            </div>
          </div>

          {/* Transfer Proof Upload */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Slip / Bukti Transfer Rekening <span className="text-rose-500">*</span>
            </label>

            {transferProofUrl ? (
              <div className="relative rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                    <img
                      src={transferProofUrl}
                      alt="Bukti Transfer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-900 block truncate">
                      Bukti transfer berhasil terlampir
                    </span>
                    <a
                      href={transferProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#181343] hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      Lihat Foto Asli
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTransferProofUrl("")}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus Bukti"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-[#181343] hover:bg-slate-50/60 cursor-pointer transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-[#181343] group-hover:bg-[#181343]/10 transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-700 block">
                    {isUploading ? "Mengunggah bukti..." : "Unggah Foto / Screenshot Slip Transfer"}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Format PNG, JPG, JPEG (Maks. 5MB)</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Catatan Penyaluran (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan pesan atau instruksi untuk mitra terkait termin ini..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-colors resize-none"
            />
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
              disabled={
                isSubmitting ||
                isUploading ||
                remainingBudget <= 0 ||
                (currentAmtNum > 0 && isOverBudget)
              }
              className="bg-[#181343] hover:bg-[#25205c] text-white rounded-xl h-10 px-5 text-xs font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Memproses..." : "Salurkan Dana Termin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
