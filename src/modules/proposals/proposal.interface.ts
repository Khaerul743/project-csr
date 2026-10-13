import { Proposal, ProposalStatus } from "@/db/schema/proposals";
import { Opportunity } from "@/db/schema/opportunities";
import { Partner } from "@/db/schema/partners";
import { User } from "@/db/schema/users";

export interface CreateProposalDTO {
  opportunityId: string;
  title: string;
  summary: string;
  proposedBudget: number | string;
  durationMonths?: number | null;
  targetBeneficiaries?: string | null;
  documentUrl?: string | null;
}

export interface ReviewProposalDTO {
  status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  feedback?: string | null;
}

export interface ProposalListQuery {
  page?: number;
  limit?: number;
  opportunityId?: string;
  status?: ProposalStatus;
  search?: string;
}

export interface ProposalWithDetails extends Proposal {
  opportunityTitle?: string | null;
  opportunityStatus?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  partnerName?: string | null;
  partnerEmail?: string | null;
  partnerCity?: string | null;
  partnerFocusArea?: string | null;
  partnerLogo?: string | null;
  submittedByName?: string | null;
  reviewedByName?: string | null;
}
