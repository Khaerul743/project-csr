import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { OpportunityStatus } from "@/db/schema/opportunities";
import { ProposalStatus } from "@/db/schema/proposals";
import { OpportunityInvitationStatus } from "@/db/schema/opportunity-invitations";

export type PartnerNavMenu =
  | "overview"
  | "explore"
  | "invitations"
  | "proposals"
  | "collaborations"
  | "programs"
  | "analytics"
  | "profile";

export interface PartnerProfile {
  id: string;
  name: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  focusArea: CsrFocusArea;
  status: string;
  createdAt: string;
}

export interface OpportunityItem {
  id: string;
  companyId: string;
  title: string;
  description: string;
  focusArea: CsrFocusArea;
  targetCity?: string | null;
  targetProvince?: string | null;
  estimatedBudget?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  deadline?: string | null;
  bannerUrl?: string | null;
  status: OpportunityStatus;
  companyName?: string | null;
  companyLogo?: string | null;
  companyCity?: string | null;
  totalProposals?: number;
  totalInvited?: number;
  createdAt: string;
}

export interface ProposalItem {
  id: string;
  opportunityId: string;
  partnerId: string;
  submittedBy: string;
  title: string;
  summary: string;
  proposedBudget: string;
  durationMonths?: number | null;
  targetBeneficiaries?: string | null;
  documentUrl?: string | null;
  status: ProposalStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  feedback?: string | null;
  createdAt: string;
  opportunityTitle?: string | null;
  opportunityStatus?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  submittedByName?: string | null;
  reviewedByName?: string | null;
}

export interface PartnerOpportunityInvitationItem {
  id: string;
  opportunityId: string;
  companyId: string;
  partnerId: string;
  invitedBy: string;
  message?: string | null;
  status: OpportunityInvitationStatus;
  createdAt: string;
  opportunityTitle?: string | null;
  opportunityDescription?: string | null;
  opportunityStatus?: string | null;
  opportunityFocusArea?: string | null;
  opportunityBudget?: string | null;
  opportunityDeadline?: string | null;
  opportunityBanner?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  companyCity?: string | null;
  invitedByName?: string | null;
}

export interface PartnerCollaborationItem {
  id: string;
  opportunityId: string;
  proposalId: string;
  companyId: string;
  partnerId: string;
  finalBudget?: string | null;
  targetBeneficiaries?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  mouDocumentUrl?: string | null;
  notes?: string | null;
  status: "NEGOTIATION" | "AGREED" | "CANCELLED";
  agreedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface PartnerProgramItem {
  id: string;
  collaborationId: string;
  opportunityId: string;
  companyId: string;
  partnerId: string;
  title: string;
  description?: string | null;
  focusArea: string;
  budget: string;
  spentBudget?: string | null;
  targetBeneficiaries?: string | null;
  actualBeneficiaries?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  opportunityTitle?: string | null;
  opportunityDescription?: string | null;
  collaborationFinalBudget?: string | null;
  collaborationMouUrl?: string | null;
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
