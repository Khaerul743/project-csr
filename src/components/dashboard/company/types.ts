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
  tagline?: string | null;
  description?: string | null;
  csrVision?: string | null;
  industry?: string | null;
  companySize?: string | null;
  foundedYear?: number | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  nibNumber?: string | null;
  npwpNumber?: string | null;
  sustainabilityReportUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  csrLeaders?: any;
  status: string;
  members?: CompanyMember[];
  metrics?: any;
  openOpportunities?: any[];
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
  tagline?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  organizationType?: string | null;
  foundedYear?: number | null;
  legalNumber?: string | null;
  npwpNumber?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  portfolioDocUrl?: string | null;
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

export interface CompanyCollaborationItem {
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

export interface CompanyProgramItem {
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


