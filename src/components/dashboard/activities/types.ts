export interface ProgramStageItem {
  id: string;
  programId: string;
  orderIndex: number;
  title: string;
  description?: string | null;
  targetTimeline?: string | null;
  expectedEvidence?: string | null;
  suggestedKpi?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  source: "AI_GENERATED" | "MANUAL";
  createdAt?: string;
  updatedAt?: string;
  activityCount?: number;
}

export const STAGE_STATUS_CONFIG: Record<
  "PENDING" | "IN_PROGRESS" | "COMPLETED",
  { label: string; variant: "amber" | "emerald" | "slate" | "indigo" }
> = {
  PENDING: { label: "Belum Dimulai", variant: "slate" },
  IN_PROGRESS: { label: "Sedang Berjalan", variant: "indigo" },
  COMPLETED: { label: "Tahap Selesai", variant: "emerald" },
};

export interface ProgramActivityItem {
  id: string;
  programId: string;
  stageId?: string | null;
  stageTitle?: string | null;
  stageOrderIndex?: number | null;
  submittedBy: string;
  title: string;
  description: string;
  activityDate: string;
  location?: string | null;
  beneficiariesReached?: string | null;
  fundsSpent?: string | null;
  mediaUrls?: string | null; // JSON string array of URLs
  documentUrl?: string | null;
  status: "SUBMITTED" | "VERIFIED" | "REVISION_REQUESTED";
  companyFeedback?: string | null;
  submitterName?: string | null;
  submitterRole?: string | null;
  verifierName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ACTIVITY_STATUS_CONFIG: Record<
  "SUBMITTED" | "VERIFIED" | "REVISION_REQUESTED",
  { label: string; variant: "amber" | "emerald" | "rose" | "slate" }
> = {
  SUBMITTED: { label: "Menunggu Verifikasi", variant: "amber" },
  VERIFIED: { label: "Diverifikasi & Sah", variant: "emerald" },
  REVISION_REQUESTED: { label: "Perlu Revisi", variant: "rose" },
};
