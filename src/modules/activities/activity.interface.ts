import { ProgramActivity, ActivityStatus } from "@/db/schema/program-activities";

export interface ActivityWithDetails extends ProgramActivity {
  submitterName?: string | null;
  submitterRole?: string | null;
  verifierName?: string | null;
  programTitle?: string | null;
  stageTitle?: string | null;
  stageOrderIndex?: number | null;
}

export interface CreateActivityDTO {
  stageId?: string | null;
  title: string;
  description: string;
  activityDate: string | Date;
  location?: string | null;
  beneficiariesReached?: string | null;
  fundsSpent?: string | number | null;
  mediaUrls?: string[] | string | null;
  documentUrl?: string | null;
}

export interface ReviewActivityDTO {
  status: "VERIFIED" | "REVISION_REQUESTED";
  companyFeedback?: string | null;
}

export interface UpdateActivityDTO {
  stageId?: string | null;
  title?: string;
  description?: string;
  activityDate?: string | Date;
  location?: string | null;
  beneficiariesReached?: string | null;
  fundsSpent?: string | number | null;
  mediaUrls?: string[] | string | null;
  documentUrl?: string | null;
}
