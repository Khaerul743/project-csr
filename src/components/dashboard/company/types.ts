import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { OpportunityStatus } from "@/db/schema/opportunities";

export interface CompanyMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface CompanyProfile {
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
  status: string;
  members?: CompanyMember[];
}

export interface OpportunityItem {
  id: string;
  companyId: string;
  createdBy: string;
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
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    city?: string | null;
    province?: string | null;
  };
  stats?: {
    proposalsCount: number;
    invitationsCount: number;
  };
}

export interface PartnerItem {
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

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  inviterName?: string;
}

export interface OpportunityInvitationItem {
  id: string;
  opportunityId: string;
  partnerId: string;
  invitedBy: string;
  message?: string | null;
  status: "INVITED" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  partner?: {
    id: string;
    name: string;
    email?: string | null;
    city?: string | null;
    focusArea: string;
    logoUrl?: string | null;
  };
}

export interface CompanyProposalItem {
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
  status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  feedback?: string | null;
  createdAt: string;
  opportunityTitle?: string | null;
  opportunityStatus?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  partnerName?: string | null;
  partnerEmail?: string | null;
  partnerCity?: string | null;
  partnerFocusArea?: string | null;
  partnerLogo?: string | null;
  submittedByName?: string | null;
  reviewedByName?: string | null;
}

