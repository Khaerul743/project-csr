"use client";

import React, { useState } from "react";
import {
  X,
  Receipt,
  Upload,
  Calendar,
  AlertCircle,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ExpenseCategory,
  EXPENSE_CATEGORY_CONFIG,
  ProgramDisbursementItem,
  ProgramExpenseItem,
} from "./types";
import { formatRupiah } from "../company/helpers";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  disbursements: ProgramDisbursementItem[];
  expenses?: ProgramExpenseItem[];
  partnerBalance: number;
  onSuccess: () => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  programId,
  disbursements,
  expenses = [],
  partnerBalance,
  onSuccess,
}: AddExpenseModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>("BAHAN_DAN_MATERIAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [disbursementId, setDisbursementId] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmedDisbursements = disbursements.filter((d) => d.status === "CONFIRMED");

  // Hitung akumulasi belanja dan sisa alokasi tiap termin terkonfirmasi
  const trancheAllocations = confirmedDisbursements.map((d) => {
    const spent = (expenses || [])
      .filter((e) => e.disbursementId === d.id)
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const trancheTotal = Number(d.amount || 0);
    const remaining = Math.max(0, trancheTotal - spent);
    return {
      ...d,
      spent,
      remaining,
    };
  });

  const selectedTranche = trancheAllocations.find((t) => t.id === disbursementId);

  const currentAmtNum = parseFloat(amount) || 0;
  const isOverGeneralBalance = currentAmtNum > partnerBalance;
  const isOverTranche = selectedTranche ? currentAmtNum > selectedTranche.remaining : false;

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
        throw new Error("Gagal mengunggah foto nota/kwitansi");
      }

      const json = await res.json();
      if (json.data?.url) {
        setReceiptUrl(json.data.url);
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
      setErrorMessage("Nominal pengeluaran harus lebih besar dari 0");
      return;
    }

    // STRICT GUARDRAIL 1: Sisa saldo kas mitra
    if (partnerBalance <= 0) {
      setErrorMessage(
        "Dana kas program belum tersedia. Konfirmasi penerimaan dana termin terlebih dahulu di rekening sebelum mencatat pengeluaran."
      );
      return;
    }

    if (amt > partnerBalance) {
      setErrorMessage(
        `Nominal belanja (${formatRupiah(amt)}) melebihi sisa kas yang dikelola mitra (${formatRupiah(partnerBalance)}). Silakan sesuaikan nominal atau tunggu pencairan dana termin berikutnya.`
      );
      return;
    }

    // STRICT GUARDRAIL 2: Sisa alokasi termin khusus
    if (selectedTranche && amt > selectedTranche.remaining) {
      setErrorMessage(
        `Nominal belanja (${formatRupiah(amt)}) melebihi sisa alokasi ${selectedTranche.trancheName} (${formatRupiah(selectedTranche.remaining)}).`
      );
      return;
    }

    if (!receiptUrl) {
      setErrorMessage("Wajib menyertakan foto nota / kwitansi / invoice fisik");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login telah berakhir");

      const res = await fetch(`/api/programs/${programId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          disbursementId: disbursementId || null,
          category,
          title,
          description: description || null,
          amount: amt,
          expenseDate,
          receiptUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mencatat pengeluaran");
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
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Laporan Pengeluaran & Bukti Nota
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Catat belanja riil program CSR disertai bukti kwitansi / invoice
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

          {/* Zero Balance Warning Banner */}
          {partnerBalance <= 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Dana Kas Belum Tersedia (Rp 0)</span>
                <span>
                  Mitra belum dapat mencatat pengeluaran karena belum ada dana termin yang dikonfirmasi masuk ke rekening. Silakan konfirmasi penerimaan dana termin terlebih dahulu.
                </span>
              </div>
            </div>
          )}

          {/* Saldo info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Sisa Kas Dikelola Saat Ini:</span>
            <span className={`font-extrabold ${partnerBalance <= 0 ? "text-slate-400" : "text-teal-700"}`}>
              {formatRupiah(partnerBalance)}
            </span>
          </div>

          {/* Category Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Kategori Pos Pengeluaran <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
            >
              {(Object.keys(EXPENSE_CATEGORY_CONFIG) as ExpenseCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {EXPENSE_CATEGORY_CONFIG[cat].label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Uraian / Judul Belanja <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pembelian 5.000 Polybag Bibit Bakau & Pupuk Kompos"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nominal Biaya (Rp) <span className="text-rose-500">*</span>
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
                    isOverGeneralBalance || isOverTranche
                      ? "border-rose-400 text-rose-700 bg-rose-50/30 focus:ring-rose-500/20 focus:border-rose-500"
                      : "border-slate-200 text-slate-800 focus:ring-teal-500/20 focus:border-teal-600"
                  }`}
                />
              </div>

              {/* Over-budget warnings */}
              {isOverGeneralBalance && currentAmtNum > 0 && partnerBalance > 0 && (
                <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Melebihi sisa kas mitra ({formatRupiah(partnerBalance)})
                </p>
              )}
              {isOverTranche && currentAmtNum > 0 && selectedTranche && (
                <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Melebihi alokasi {selectedTranche.trancheName} ({formatRupiah(selectedTranche.remaining)})
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tanggal Nota / Kwitansi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Tranche Link (Optional) */}
          {confirmedDisbursements.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Terkait Dana Termin (Opsional)
              </label>
              <select
                value={disbursementId}
                onChange={(e) => setDisbursementId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
              >
                <option value="">-- Umum / Gabungan Termin --</option>
                {trancheAllocations.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.trancheName} — Sisa: {formatRupiah(t.remaining)} (Pagu: {formatRupiah(t.amount)})
                  </option>
                ))}
              </select>

              {selectedTranche && (
                <div className="mt-1.5 p-2 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-between text-[11px]">
                  <span className="text-teal-700 font-medium">Sisa Alokasi {selectedTranche.trancheName}:</span>
                  <span className="font-bold text-teal-900">{formatRupiah(selectedTranche.remaining)}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Keterangan Rincian / No. Invoice
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Kwitansi Toko Mandiri No. 042/INV/2026, ditandatangani bendahara..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
            />
          </div>

          {/* Receipt Proof Photo */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Foto Bukti Nota / Kwitansi / Struk Fisik <span className="text-rose-500">*</span>
            </label>

            {receiptUrl ? (
              <div className="relative rounded-2xl border border-teal-200 bg-teal-50/30 p-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img
                      src={receiptUrl}
                      alt="Foto Nota"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-teal-800 block truncate">
                      Foto nota/kwitansi terlampir
                    </span>
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-teal-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      Lihat Foto Penuh
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptUrl("")}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Hapus Nota"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 hover:border-teal-500 hover:bg-teal-50/20 cursor-pointer transition-all">
                  <Upload className="w-5 h-5 text-teal-600" />
                  <span className="text-xs font-bold text-slate-700">
                    {isUploading ? "Mengunggah..." : "Unggah Foto Nota / Kwitansi"}
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
                    placeholder="Atau tempel URL gambar nota/kwitansi..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) setReceiptUrl(val);
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) setReceiptUrl(val);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}
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
                partnerBalance <= 0 ||
                (currentAmtNum > 0 && (isOverGeneralBalance || isOverTranche))
              }
              className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan & Laporkan Nota"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
