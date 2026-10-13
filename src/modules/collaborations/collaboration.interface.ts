import { Collaboration, CollaborationStatus } from "@/db/schema/collaborations";

export interface UpdateCollaborationDTO {
  finalBudget?: number | string | null;
  targetBeneficiaries?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  mouDocumentUrl?: string | null;
  notes?: string | null;
  status?: CollaborationStatus;
}

export interface CollaborationListQuery {
  page?: number;
  limit?: number;
  status?: CollaborationStatus;
  search?: string;
}

export interface CollaborationWithDetails extends Collaboration {
  opportunityTitle?: string | null;
  opportunityFocusArea?: string | null;
  opportunityTargetCity?: string | null;
  proposalTitle?: string | null;
  proposalSummary?: string | null;
  proposedBudget?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  companyCity?: string | null;
  companyEmail?: string | null;
  partnerName?: string | null;
  partnerLogo?: string | null;
  partnerCity?: string | null;
  partnerEmail?: string | null;
  partnerFocusArea?: string | null;
}
