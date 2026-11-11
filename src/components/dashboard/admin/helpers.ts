import { CsrFocusArea } from "@/db/schema/csr-focus-areas";

export const ENTITY_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "emerald" | "amber" | "rose" | "slate" }
> = {
  ACTIVE: { label: "Aktif", variant: "emerald" },
  INACTIVE: { label: "Nonaktif", variant: "slate" },
  SUSPENDED: { label: "Ditangguhkan", variant: "rose" },
};

export const USER_ROLE_CONFIG: Record<
  string,
  { label: string; variant: "navy" | "emerald" | "purple" | "amber" | "slate" | "blue" }
> = {
  SUPER_ADMIN: { label: "Super Admin", variant: "navy" },
  MANAGEMENT: { label: "Management", variant: "emerald" },
  CSR_ADMIN: { label: "CSR Admin", variant: "blue" },
  PARTNER_ADMIN: { label: "Mitra NGO", variant: "purple" },
  STAGING: { label: "Belum Onboarding", variant: "amber" },
};

export const PROGRAM_STATUS_LABELS: Record<
  string,
  { label: string; variant: "blue" | "amber" | "emerald" | "slate" | "rose" }
> = {
  PLANNED: { label: "Persiapan", variant: "blue" },
  IN_PROGRESS: { label: "Berjalan", variant: "amber" },
  COMPLETED: { label: "Selesai", variant: "emerald" },
  ON_HOLD: { label: "Ditunda", variant: "amber" },
  CANCELLED: { label: "Dibatalkan", variant: "rose" },
};

export const OPPORTUNITY_STATUS_LABELS: Record<
  string,
  { label: string; variant: "blue" | "amber" | "emerald" | "slate" | "rose" }
> = {
  DRAFT: { label: "Draf", variant: "slate" },
  OPEN: { label: "Terbuka", variant: "emerald" },
  IN_REVIEW: { label: "Dalam Tinjauan", variant: "amber" },
  CLOSED: { label: "Ditutup", variant: "rose" },
};

export const PROPOSAL_STATUS_LABELS: Record<
  string,
  { label: string; variant: "blue" | "amber" | "emerald" | "slate" | "rose" }
> = {
  SUBMITTED: { label: "Terkirim", variant: "blue" },
  UNDER_REVIEW: { label: "Ditinjau", variant: "amber" },
  REVISION_REQUESTED: { label: "Perlu Revisi", variant: "amber" },
  ACCEPTED: { label: "Disetujui", variant: "emerald" },
  REJECTED: { label: "Ditolak", variant: "rose" },
  WITHDRAWN: { label: "Ditarik", variant: "slate" },
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  VERIFY_COMPANY: "Verifikasi Perusahaan",
  REVOKE_COMPANY_VERIFICATION: "Cabut Verifikasi Perusahaan",
  UPDATE_COMPANY_STATUS: "Ubah Status Perusahaan",
  VERIFY_PARTNER: "Verifikasi Mitra NGO",
  REVOKE_PARTNER_VERIFICATION: "Cabut Verifikasi Mitra NGO",
  UPDATE_PARTNER_STATUS: "Ubah Status Mitra NGO",
  CREATE_SUPER_ADMIN: "Buat Akun Super Admin",
  SUSPEND_USER: "Tangguhkan Pengguna",
  UPDATE_USER_STATUS: "Ubah Status Pengguna",
  FORCE_CLOSE_OPPORTUNITY: "Tutup Paksa Peluang CSR",
  REOPEN_OPPORTUNITY: "Buka Kembali Peluang CSR",
};

export const AUDIT_TARGET_LABELS: Record<string, string> = {
  COMPANY: "Perusahaan",
  PARTNER: "Mitra NGO",
  USER: "Pengguna",
  OPPORTUNITY: "Peluang CSR",
  PROGRAM: "Program",
  SYSTEM: "Sistem",
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  BAHAN_DAN_MATERIAL: "Bahan & Material",
  LOGISTIK_DAN_TRANSPORTASI: "Logistik & Transportasi",
  HONOR_DAN_FASILITATOR: "Honor & Fasilitator",
  SEWA_ALAT_DAN_TEMPAT: "Sewa Alat & Tempat",
  KONSUMSI_KEGIATAN: "Konsumsi Kegiatan",
  DOKUMENTASI_DAN_PUBLIKASI: "Dokumentasi & Publikasi",
  OPERASIONAL_LAINNYA: "Operasional Lainnya",
};

export const FOCUS_AREA_LABELS: Record<CsrFocusArea, string> = {
  LINGKUNGAN: "Lingkungan & Energi Hijau",
  PENDIDIKAN: "Pendidikan & Literasi",
  KESEHATAN: "Kesehatan Masyarakat",
  PEMBERDAYAAN_EKONOMI: "Pemberdayaan Ekonomi & UMKM",
  INFRASTRUKTUR_SOSIAL: "Infrastruktur Sosial",
  TANGGAP_BENCANA: "Tanggap Bencana",
  LAINNYA: "Inisiatif Lainnya",
};

export function formatRupiah(value: number | string | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : Number(value ?? 0);
  if (Number.isNaN(num)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatCompactRupiah(value: number | string | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : Number(value ?? 0);
  if (Number.isNaN(num) || num === 0) return "Rp0";
  if (num >= 1_000_000_000) {
    return `Rp${(num / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (num >= 1_000_000) {
    return `Rp${(num / 1_000_000).toFixed(1).replace(".", ",")} Jt`;
  }
  return formatRupiah(num);
}

export function formatDate(dateVal: string | Date | null | undefined): string {
  if (!dateVal) return "-";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateVal: string | Date | null | undefined): string {
  if (!dateVal) return "-";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getFocusAreaLabel(area: string): string {
  return FOCUS_AREA_LABELS[area as CsrFocusArea] || area;
}
