export interface ProgramActivityItem {
  id: string;
  programId: string;
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
