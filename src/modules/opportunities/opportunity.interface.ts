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
  responseDeadline?: string | null;
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

export interface CompanyOpportunityInvitation extends OpportunityInvitation {
  opportunityTitle?: string | null;
  opportunityFocusArea?: string | null;
  opportunityStatus?: string | null;
  opportunityTargetCity?: string | null;
  opportunityTargetProvince?: string | null;
  opportunityBudget?: string | null;
  opportunityDeadline?: string | null;
  partnerName?: string | null;
  partnerLogo?: string | null;
  partnerCity?: string | null;
  partnerProvince?: string | null;
  partnerFocusArea?: string | null;
  partnerOrganizationType?: string | null;
  partnerEmail?: string | null;
  invitedByName?: string | null;
  invitedByPosition?: string | null;
}

export interface OverdueInvitationTransitionResult {
  invitationId: string;
  companyId: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string | null;
  companyName: string;
  programName: string;
  focusArea: string;
  targetCity: string | null;
  targetProvince: string | null;
  invitedByName: string | null;
  invitedByPosition: string | null;
  responseDeadline: Date;
}

export interface NeedPrioritizationRequestDTO {
  targetProvince: string;
  targetCity: string;
  focusArea?: CsrFocusArea | null;
  title?: string | null;
  description?: string | null;
  estimatedBudget?: string | number | null;
  fieldContextNotes?: string | null;
  excludeOpportunityId?: string | null;
}


