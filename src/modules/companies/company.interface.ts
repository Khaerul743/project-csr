import { Company } from "@/db/schema/companies";
import { SafeUser } from "@/modules/auth/auth.interface";

export interface CsrLeaderItem {
  id?: string;
  name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
}

export interface CompanyMetrics {
  totalDisbursedBudget: number;
  totalAllocatedBudget?: number;
  completedPrograms: number;
  totalPrograms: number;
  totalOpportunities: number;
  totalPartnersEngaged: number;
  averageRating: number;
  totalReviews: number;
}

export interface CompanyDetailedProfile extends Company {
  members?: any[];
  metrics?: CompanyMetrics;
  openOpportunities?: any[];
  programs?: any[];
}

export interface CreateCompanyDTO {
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
  csrLeaders?: CsrLeaderItem[] | string | null;
}

export interface UpdateCompanyDTO {
  name?: string;
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
  csrLeaders?: CsrLeaderItem[] | string | null;
}

export interface CompanyResponseData {
  company: Company;
  user: SafeUser;
  accessToken: string;
}

export interface CompanyListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CompanyFinancialSummary {
  totalBudget: number;
  totalSpent: number;
  unspentBudget: number;
  absorptionRate: number;
  totalBeneficiaries: number;
  avgCostPerBeneficiary: number;
  totalPrograms: number;
  completedPrograms: number;
  inProgressPrograms: number;
}

export interface SectorFinancialBreakdown {
  focusArea: string;
  totalBudget: number;
  totalSpent: number;
  absorptionRate: number;
  programsCount: number;
  percentageOfTotalBudget: number;
}

export interface FinancialEarlyWarning {
  id: string;
  programId: string;
  programTitle: string;
  type: "slow_absorption" | "near_ceiling";
  title: string;
  description: string;
  absorptionRate: number;
  budget: number;
  spent: number;
}

export interface FinancialOversightProgramItem {
  id: string;
  title: string;
  focusArea: string;
  status: string;
  budget: number;
  spentBudget: number;
  absorptionRate: number;
  partnerId: string;
  partnerName: string;
  partnerLogo?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  targetBeneficiaries?: string | null;
  actualBeneficiaries?: string | null;
  beneficiariesCount: number;
  costPerBeneficiary: number;
  disbursementsCount: number;
  totalDisbursed: number;
  expensesCount: number;
  verifiedExpensesCount: number;
  pendingExpensesCount: number;
}

export interface CompanyFinancialOversightResponse {
  summary: CompanyFinancialSummary;
  sectors: SectorFinancialBreakdown[];
  alerts: FinancialEarlyWarning[];
  programs: FinancialOversightProgramItem[];
}

export interface PartnerPillarScores {
  fieldReportingScore: number;
  financialIntegrityScore: number;
  satisfactionScore: number;
  governanceScore: number;
}

export interface PartnerEvaluationItem {
  partnerId: string;
  name: string;
  organizationType: string | null;
  city: string | null;
  province: string | null;
  logoUrl: string | null;
  verificationStatus: string;
  focusArea: string;
  programsCount: number;
  completedProgramsCount: number;
  inProgressProgramsCount: number;
  totalBudget: number;
  totalSpent: number;
  totalBeneficiaries: number;
  costPerBeneficiary: number;
  fieldReportingScore: number;
  financialIntegrityScore: number;
  satisfactionScore: number;
  governanceScore: number;
  overallScore: number;
  tier: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4";
  tierLabel: string;
  tierBadgeVariant: "emerald" | "blue" | "amber" | "rose";
  tierRecommendation: string;
  partner: {
    id: string;
    name: string;
    organizationType?: string | null;
    city?: string | null;
    province?: string | null;
    logoUrl?: string | null;
    status: string;
    focusArea: string;
  };
}

export interface CompanyPartnerEvaluationsResponse {
  evaluations: PartnerEvaluationItem[];
  summary: {
    totalPartners: number;
    tier1Count: number;
    tier2Count: number;
    tier3Count: number;
    tier4Count: number;
    averageScore: number;
  };
}

