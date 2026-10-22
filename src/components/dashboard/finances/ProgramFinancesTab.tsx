"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Wallet,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ExternalLink,
  ShieldCheck,
  XCircle,
  Eye,
  ArrowRight,
  FileText,
  CreditCard,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ProgramFinancesData,
  ProgramDisbursementItem,
  ProgramExpenseItem,
  DISBURSEMENT_STATUS_CONFIG,
  EXPENSE_CATEGORY_CONFIG,
  EXPENSE_VERIFICATION_CONFIG,
  ExpenseCategory,
  formatFinanceDate,
} from "./types";
import { formatRupiah } from "../company/helpers";
import { DisburseFundModal } from "./DisburseFundModal";
import { ConfirmDisbursementModal } from "./ConfirmDisbursementModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { VerifyExpenseModal } from "./VerifyExpenseModal";

interface ProgramFinancesTabProps {
  programId: string;
  programTitle: string;
  agreedBudget: number | string;
  role: "COMPANY" | "PARTNER";
  onFinancesUpdated?: () => void;
}

export function ProgramFinancesTab({
  programId,
  programTitle,
  agreedBudget,
  role,
  onFinancesUpdated,
}: ProgramFinancesTabProps) {
  const [data, setData] = useState<ProgramFinancesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active sub-section
  const [subSection, setSubSection] = useState<"disbursements" | "expenses">("disbursements");

  // Modals
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [confirmDisbursementItem, setConfirmDisbursementItem] =
    useState<ProgramDisbursementItem | null>(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [verifyExpenseItem, setVerifyExpenseItem] = useState<ProgramExpenseItem | null>(null);

  // Photo preview modal state
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [previewPhotoTitle, setPreviewPhotoTitle] = useState<string>("");

  const fetchFinances = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/programs/${programId}/finances`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data keuangan program");
      }

      const json = await res.json();
      setData(json.data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan memuat data keuangan");
    } finally {
      setIsLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    if (programId) {
      fetchFinances();
    }
  }, [programId, fetchFinances]);

  const handleActionSuccess = () => {
    fetchFinances();
    if (onFinancesUpdated) {
      onFinancesUpdated();
    }
  };

  const summary = data?.summary || {
    agreedBudget: Number(agreedBudget) || 0,
    totalDisbursed: 0,
    totalConfirmedReceived: 0,
    totalPendingConfirmation: 0,
    totalExpensesReported: 0,
    totalExpensesVerified: 0,
    remainingPartnerBalance: 0,
    unreleasedBudget: Number(agreedBudget) || 0,
    absorptionRate: 0,
  };

  const disbursements = data?.disbursements || [];
  const expenses = data?.expenses || [];

  const nextTrancheNumber = disbursements.length + 1;
  const disbursementPercent =
    summary.agreedBudget > 0
      ? Math.min(100, Math.round((summary.totalConfirmedReceived / summary.agreedBudget) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Financial Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Pagu Anggaran */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pagu Disepakati</span>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {formatRupiah(summary.agreedBudget)}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Total komitmen CSR final
          </p>
        </div>

        {/* Card 2: Dana Telah Masuk Kas Mitra */}
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-teal-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Diterima Kas Mitra</span>
            <Wallet className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-lg font-black text-teal-900 truncate">
            {formatRupiah(summary.totalConfirmedReceived)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-teal-700 font-medium">
            <span>{disbursementPercent}% terealisasi</span>
            {summary.totalPendingConfirmation > 0 && (
              <span className="text-amber-700 font-bold">
                +{formatRupiah(summary.totalPendingConfirmation)} proses
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Serapan Pengeluaran & Nota */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Serapan Biaya</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-emerald-900 truncate">
            {formatRupiah(summary.totalExpensesReported)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            {summary.absorptionRate}% terserap dari pagu
          </p>
        </div>

        {/* Card 4: Sisa Kas di Tangan Mitra */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-teal-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sisa Saldo Kas</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-black text-white truncate">
            {formatRupiah(summary.remainingPartnerBalance)}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Kas aktif dipegang mitra
          </p>
        </div>
      </div>

      {/* Progress Bars Deck */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-700">
            Akuntabilitas Siklus Dana CSR:
          </span>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              Penyaluran Kas: {disbursementPercent}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Serapan Nota: {summary.absorptionRate}%
            </span>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
          <div
            className="h-full bg-teal-500 transition-all duration-500"
            style={{ width: `${Math.min(disbursementPercent, 100)}%` }}
            title={`Penyaluran Dana: ${disbursementPercent}%`}
          />
        </div>
      </div>

      {/* Sub-Section Switcher & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubSection("disbursements")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              subSection === "disbursements"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Dana Termin ({disbursements.length})
          </button>

          <button
            type="button"
            onClick={() => setSubSection("expenses")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              subSection === "expenses"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Pengeluaran & Nota ({expenses.length})
          </button>
        </div>

        {/* Action Button depending on Role */}
        <div>
          {role === "COMPANY" && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsDisburseModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Salurkan Dana Termin Baru
            </Button>
          )}

          {role === "PARTNER" && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Catat Pengeluaran & Nota
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Memuat data realisasi keuangan...</span>
        </div>
      ) : subSection === "disbursements" ? (
        /* SECTION 1: DISBURSEMENTS (PENYALURAN TERMIN) */
        <div className="space-y-3">
          {disbursements.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">
                Belum ada penyaluran dana termin
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                {role === "COMPANY"
                  ? "Salurkan dana tahap pertama (DP) beserta bukti transfer agar dapat segera digunakan oleh mitra."
                  : "Menunggu perusahaan mencairkan dana termin pertama ke rekening yayasan/mitra."}
              </p>
              {role === "COMPANY" && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsDisburseModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Salurkan Termin 1
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {disbursements.map((d) => {
                const statusCfg =
                  DISBURSEMENT_STATUS_CONFIG[d.status] || {
                    label: d.status,
                    variant: "slate" as const,
                  };

                return (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center font-extrabold text-teal-700 text-xs shrink-0">
                          T{d.trancheNumber || 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900">
                            {d.trancheName}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatFinanceDate(d.disbursedDate)}
                            </span>
                            {d.bankName && (
                              <span>• {d.bankName} {d.bankAccountNumber ? `(${d.bankAccountNumber})` : ""}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-700 block">
                            {formatRupiah(d.amount)}
                          </span>
                          <Badge variant={statusCfg.variant} size="sm" hasDot>
                            {statusCfg.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes or Info */}
                    {d.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-700">Pesan:</span> {d.notes}
                      </p>
                    )}

                    {/* Confirmation status details */}
                    {d.status === "CONFIRMED" && (
                      <div className="text-[11px] text-teal-800 bg-teal-50/70 p-2.5 rounded-xl border border-teal-100 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">
                            Terkonfirmasi Masuk Kas Mitra pada {formatFinanceDate(d.confirmedAt)}
                          </span>
                          {d.confirmedNotes && (
                            <p className="text-teal-700 mt-0.5">{d.confirmedNotes}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer Actions: Proof photo & Confirm button */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        {d.transferProofUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewPhotoUrl(d.transferProofUrl || "");
                              setPreviewPhotoTitle(`Slip Transfer: ${d.trancheName}`);
                            }}
                            className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lihat Slip Transfer
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Tanpa lampiran slip transfer
                          </span>
                        )}
                      </div>

                      {/* Partner action: Confirm receipt if PENDING */}
                      {d.status === "PENDING" && role === "PARTNER" && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setConfirmDisbursementItem(d)}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5 py-1 h-8"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Konfirmasi Terima Dana
                        </Button>
                      )}

                      {/* Company indicator when pending */}
                      {d.status === "PENDING" && role === "COMPANY" && (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 font-medium">
                          Menunggu mitra cek rekening & konfirmasi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* SECTION 2: EXPENSES & RECEIPTS (SERAPAN & NOTA) */
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">
                Belum ada nota pengeluaran tercatat
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                {role === "PARTNER"
                  ? "Catat setiap pembelanjaan operasional, material, honor fasilitator, atau logistik kegiatan dengan melampirkan foto nota fisik."
                  : "Mitra pelaksana belum mengunggah laporan kwitansi / nota belanja program ini."}
              </p>
              {role === "PARTNER" && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddExpenseModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Catat Pengeluaran Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((exp) => {
                const catCfg =
                  EXPENSE_CATEGORY_CONFIG[exp.category as ExpenseCategory] || {
                    label: exp.category,
                    variant: "slate" as const,
                  };

                const verCfg =
                  EXPENSE_VERIFICATION_CONFIG[exp.verificationStatus] || {
                    label: exp.verificationStatus,
                    variant: "slate" as const,
                  };

                return (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant={catCfg.variant} size="sm">
                            {catCfg.label}
                          </Badge>
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatFinanceDate(exp.expenseDate)}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900">
                          {exp.title}
                        </h4>
                        {exp.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {exp.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-slate-900 block">
                          {formatRupiah(exp.amount)}
                        </span>
                        <Badge variant={verCfg.variant} size="sm" hasDot>
                          {verCfg.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Verification result details */}
                    {exp.verificationNotes && (
                      <div
                        className={`text-[11px] p-2.5 rounded-xl border flex items-start gap-2 ${
                          exp.verificationStatus === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                            : "bg-rose-50 text-rose-800 border-rose-100"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">
                            Catatan Tim Verifikasi Perusahaan:
                          </span>
                          <p className="mt-0.5">{exp.verificationNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Footer: Receipt photo preview & Verify button for company */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        {exp.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewPhotoUrl(exp.receiptUrl);
                              setPreviewPhotoTitle(`Nota: ${exp.title}`);
                            }}
                            className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" /> Buka Foto Nota / Kwitansi
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Tanpa lampiran nota
                          </span>
                        )}
                      </div>

                      {/* Company action: Verify if PENDING */}
                      {role === "COMPANY" && exp.verificationStatus === "PENDING" && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setVerifyExpenseItem(exp)}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5 py-1 h-8"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verifikasi Nota
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Disburse Fund Modal (Company) */}
      <DisburseFundModal
        isOpen={isDisburseModalOpen}
        onClose={() => setIsDisburseModalOpen(false)}
        programId={programId}
        nextTrancheNumber={nextTrancheNumber}
        remainingBudget={summary.unreleasedBudget}
        onSuccess={handleActionSuccess}
      />

      {/* MODAL 2: Confirm Disbursement Modal (Partner) */}
      <ConfirmDisbursementModal
        isOpen={!!confirmDisbursementItem}
        onClose={() => setConfirmDisbursementItem(null)}
        programId={programId}
        disbursement={confirmDisbursementItem}
        onSuccess={handleActionSuccess}
      />

      {/* MODAL 3: Add Expense Modal (Partner) */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        programId={programId}
        disbursements={disbursements}
        expenses={expenses}
        partnerBalance={summary.remainingPartnerBalance}
        onSuccess={handleActionSuccess}
      />

      {/* MODAL 4: Verify Expense Modal (Company) */}
      <VerifyExpenseModal
        isOpen={!!verifyExpenseItem}
        onClose={() => setVerifyExpenseItem(null)}
        programId={programId}
        expense={verifyExpenseItem}
        onSuccess={handleActionSuccess}
      />

      {/* MODAL 5: Photo Lightbox Preview */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="text-xs font-extrabold text-slate-800 truncate">
                {previewPhotoTitle}
              </h4>
              <div className="flex items-center gap-2">
                <a
                  href={previewPhotoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                  title="Buka tab baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-900/10">
              <img
                src={previewPhotoUrl}
                alt={previewPhotoTitle}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
