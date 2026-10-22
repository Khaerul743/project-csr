import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { OpportunityStatus } from "@/db/schema/opportunities";

export const FOCUS_AREA_CONFIG: Record<
  CsrFocusArea,
  { label: string; variant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate" }
> = {
  LINGKUNGAN: { label: "Lingkungan & Alam", variant: "emerald" },
  PENDIDIKAN: { label: "Pendidikan & Literasi", variant: "blue" },
  KESEHATAN: { label: "Kesehatan Masyarakat", variant: "rose" },
  PEMBERDAYAAN_EKONOMI: { label: "Pemberdayaan Ekonomi / UMKM", variant: "amber" },
  INFRASTRUKTUR_SOSIAL: { label: "Infrastruktur Sosial", variant: "purple" },
  TANGGAP_BENCANA: { label: "Tanggap Kemanusiaan & Bencana", variant: "rose" },
  LAINNYA: { label: "Inisiatif Lainnya", variant: "slate" },
};

export const STATUS_CONFIG: Record<
  OpportunityStatus,
  { label: string; variant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate" }
> = {
  OPEN: { label: "Buka Proposal", variant: "emerald" },
  DRAFT: { label: "Draf Internal", variant: "slate" },
  IN_REVIEW: { label: "Sedang Ditinjau", variant: "amber" },
  CLOSED: { label: "Selesai / Tutup", variant: "rose" },
};

export const PROPOSAL_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate" }
> = {
  SUBMITTED: { label: "Perlu Ditinjau", variant: "blue" },
  UNDER_REVIEW: { label: "Dalam Tinjauan", variant: "amber" },
  REVISION_REQUESTED: { label: "Diminta Revisi", variant: "amber" },
  ACCEPTED: { label: "Disetujui", variant: "emerald" },
  REJECTED: { label: "Ditolak", variant: "rose" },
  WITHDRAWN: { label: "Ditarik Mitra", variant: "slate" },
};

export const COLLABORATION_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate" }
> = {
  NEGOTIATION: { label: "Tahap Negosiasi", variant: "amber" },
  AGREED: { label: "MoU Disepakati", variant: "emerald" },
  CANCELLED: { label: "Dibatalkan", variant: "rose" },
};

export const PROGRAM_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate" }
> = {
  PLANNED: { label: "Direncanakan", variant: "blue" },
  IN_PROGRESS: { label: "Sedang Berjalan", variant: "amber" },
  COMPLETED: { label: "Selesai", variant: "emerald" },
  ON_HOLD: { label: "Ditunda Sementara", variant: "slate" },
  CANCELLED: { label: "Dibatalkan", variant: "rose" },
};



export function formatRupiah(val: number | string | null | undefined): string {
  if (val === undefined || val === null || val === "") return "Rp 0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(val: string | null | undefined): string {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}
