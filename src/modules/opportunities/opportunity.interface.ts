import { Opportunity, OpportunityStatus } from "@/db/schema/opportunities";
import { OpportunityInvitation } from "@/db/schema/opportunity-invitations";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";

export interface CreateOpportunityDTO {
  title: string;
  description: string;
  focusArea: CsrFocusArea;
  targetCity?: string | null;
  targetProvince?: string | null;
  estimatedBudget?: string | number | null;
  startDate?: string | null;
  endDate?: string | null;
  deadline?: string | null;
  bannerUrl?: string | null;
  status?: OpportunityStatus;
}

export interface UpdateOpportunityDTO {
  title?: string;
  description?: string;
  focusArea?: CsrFocusArea;
  targetCity?: string | null;
  targetProvince?: string | null;
  estimatedBudget?: string | number | null;
  startDate?: string | null;
  endDate?: string | null;
  deadline?: string | null;
  bannerUrl?: string | null;
  status?: OpportunityStatus;
}

export interface InvitePartnerDTO {
  partnerId: string;
  message?: string | null;
}

export interface OpportunityQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  focusArea?: CsrFocusArea;
  targetCity?: string;
  targetProvince?: string;
  status?: OpportunityStatus;
  companyId?: string;
}

export interface OpportunityWithDetails extends Opportunity {
  companyName?: string | null;
  companyLogo?: string | null;
  companyCity?: string | null;
  createdByName?: string | null;
  totalProposals?: number;
  totalInvited?: number;
}

export interface OpportunityInvitationWithDetails extends OpportunityInvitation {
  partnerName?: string | null;
  partnerLogo?: string | null;
  partnerCity?: string | null;
  partnerFocusArea?: string | null;
  invitedByName?: string | null;
}

export interface PartnerOpportunityInvitation extends OpportunityInvitation {
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

