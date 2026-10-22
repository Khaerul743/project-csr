import {
  ProgramDisbursement,
  DisbursementStatus,
} from "@/db/schema/program-disbursements";
import {
  ProgramExpense,
  ExpenseCategory,
  ExpenseVerificationStatus,
} from "@/db/schema/program-expenses";
import { ProgramFinancialSummary } from "@/modules/finances/finance.interface";

export type {
  DisbursementStatus,
  ExpenseCategory,
  ExpenseVerificationStatus,
  ProgramFinancialSummary,
};

export type ProgramDisbursementItem = ProgramDisbursement & {
  confirmedByName?: string | null;
};

export type ProgramExpenseItem = ProgramExpense & {
  verifiedByName?: string | null;
};

export interface ProgramFinancesData {
  summary: ProgramFinancialSummary;
  disbursements: ProgramDisbursementItem[];
  expenses: ProgramExpenseItem[];
}

export const DISBURSEMENT_STATUS_CONFIG: Record<
  DisbursementStatus,
  { label: string; variant: "amber" | "emerald" | "rose" | "slate" }
> = {
  PENDING: { label: "Menunggu Konfirmasi Mitra", variant: "amber" },
  CONFIRMED: { label: "Telah Diterima Kas Mitra", variant: "emerald" },
  REJECTED: { label: "Ditolak / Belum Masuk Rekening", variant: "rose" },
};

export const EXPENSE_CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: string; variant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate" }
> = {
  BAHAN_DAN_MATERIAL: { label: "Bahan & Material Fisik", icon: "Boxes", variant: "emerald" },
  LOGISTIK_DAN_TRANSPORTASI: { label: "Logistik & Transportasi", icon: "Truck", variant: "blue" },
  HONOR_DAN_FASILITATOR: { label: "Honor & Fasilitator Ahli", icon: "Users", variant: "purple" },
  SEWA_ALAT_DAN_TEMPAT: { label: "Sewa Peralatan & Lokasi", icon: "Building", variant: "amber" },
  KONSUMSI_KEGIATAN: { label: "Konsumsi & Akomodasi", icon: "Coffee", variant: "rose" },
  DOKUMENTASI_DAN_PUBLIKASI: { label: "Dokumentasi & Publikasi", icon: "Camera", variant: "emerald" },
  OPERASIONAL_LAINNYA: { label: "Operasional Lainnya", icon: "Receipt", variant: "slate" },
};

export const EXPENSE_VERIFICATION_CONFIG: Record<
  ExpenseVerificationStatus,
  { label: string; variant: "amber" | "emerald" | "rose" | "slate" }
> = {
  PENDING: { label: "Menunggu Verifikasi Perusahaan", variant: "amber" },
  VERIFIED: { label: "Nota Terverifikasi Sah", variant: "emerald" },
  REJECTED: { label: "Perlu Revisi / Ditolak", variant: "rose" },
};

export function formatFinanceDate(val: Date | string | null | undefined): string {
  if (!val) return "-";
  const dateObj = typeof val === "string" ? new Date(val) : val;
  if (isNaN(dateObj.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateObj);
}

