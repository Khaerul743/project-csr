"use client";

import React, { useState } from "react";
import {
  X,
  DollarSign,
  Upload,
  Calendar,
  Building2,
  CreditCard,
  User,
  AlertCircle,
  FileCheck2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "../company/helpers";

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

  const currentAmtNum = parseFloat(amount) || 0;
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

    const amt = parseFloat(amount);
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
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Penyaluran Dana Termin CSR
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Kirimkan dana bertahap untuk dikonfirmasi oleh mitra pelaksana
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Zero Remaining Budget Warning */}
          {remainingBudget <= 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
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
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Sisa Pagu yang Dapat Disalurkan:</span>
            <span className={`font-extrabold ${remainingBudget <= 0 ? "text-slate-400" : "text-emerald-700"}`}>
              {formatRupiah(remainingBudget)}
            </span>
          </div>

          {/* Tranche Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama Termin / Tahap Penyaluran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={trancheName}
              onChange={(e) => setTrancheName(e.target.value)}
              placeholder="Contoh: Termin 1 (DP Persiapan 40%)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nominal Transfer (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 ${
                    isOverBudget && currentAmtNum > 0
                      ? "border-rose-400 text-rose-700 bg-rose-50/30 focus:ring-rose-500/20 focus:border-rose-500"
                      : "border-slate-200 text-slate-800 focus:ring-emerald-500/20 focus:border-emerald-600"
                  }`}
                />
              </div>

              {/* Over-budget warning */}
              {isOverBudget && currentAmtNum > 0 && remainingBudget > 0 && (
                <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Melebihi sisa pagu yang dapat disalurkan ({formatRupiah(remainingBudget)})
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tanggal Penyaluran <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={disbursedDate}
                  onChange={(e) => setDisbursedDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Rekening Tujuan Transfer Mitra
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Nama Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
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
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Nomor Rekening
                </label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Contoh: 1234567890"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Nama Pemilik Rekening
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Contoh: Yayasan Bina Lingkungan Nusantara"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                />
              </div>
            </div>
          </div>

          {/* Transfer Proof URL / Upload */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Slip / Bukti Transfer Rekening <span className="text-rose-500">*</span>
            </label>

            {transferProofUrl ? (
              <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50/30 p-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img
                      src={transferProofUrl}
                      alt="Bukti Transfer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-emerald-800 block truncate">
                      Bukti transfer terlampir
                    </span>
                    <a
                      href={transferProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      Lihat Foto Asli
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTransferProofUrl("")}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Hapus Bukti"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-all">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">
                    {isUploading ? "Mengunggah..." : "Unggah Foto / Screenshot Slip Transfer"}
                  </span>
                  <span className="text-[11px] text-slate-400">PNG, JPG, JPEG (Maks. 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {/* Option to paste direct image URL */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Atau tempel URL gambar slip bukti transfer..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) setTransferProofUrl(val);
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) setTransferProofUrl(val);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Penyaluran (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan pesan atau instruksi untuk mitra terkait termin ini..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
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
              disabled={
                isSubmitting ||
                isUploading ||
                remainingBudget <= 0 ||
                (currentAmtNum > 0 && isOverBudget)
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Memproses..." : "Salurkan Dana Termin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
