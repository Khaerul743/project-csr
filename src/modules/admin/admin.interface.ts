import { UserRole, UserStatus } from "@/db/schema/users";
import { Company, CompanyStatus } from "@/db/schema/companies";
import { Partner, PartnerStatus } from "@/db/schema/partners";
import { Opportunity, OpportunityStatus } from "@/db/schema/opportunities";
import { Proposal, ProposalStatus } from "@/db/schema/proposals";
import { Program, ProgramStatus } from "@/db/schema/programs";
import { ProgramStage } from "@/db/schema/program-stages";
import { ProgramReview } from "@/db/schema/program-reviews";
import { AdminAuditTargetType } from "@/db/schema/admin-audit-logs";
import { ProgramFinancialSummary } from "@/modules/finances/finance.interface";
import { ActivityWithDetails } from "@/modules/activities/activity.interface";

export interface AdminPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminCompaniesQuery extends AdminPaginationQuery {
  status?: CompanyStatus;
  isVerified?: boolean;
}

export interface AdminPartnersQuery extends AdminPaginationQuery {
  status?: PartnerStatus;
  focusArea?: string;
  isVerified?: boolean;
}

export interface AdminUsersQuery extends AdminPaginationQuery {
  role?: UserRole;
  status?: UserStatus;
}

export interface AdminOpportunitiesQuery extends AdminPaginationQuery {
  status?: OpportunityStatus;
  focusArea?: string;
}

export interface AdminProposalsQuery extends AdminPaginationQuery {
  status?: ProposalStatus;
}

export interface AdminProgramsQuery extends AdminPaginationQuery {
  status?: ProgramStatus;
  focusArea?: string;
}

export interface AdminAuditLogsQuery {
  page?: number;
  limit?: number;
  targetType?: AdminAuditTargetType;
  search?: string;
}

export interface UpdateTenantStatusDTO {
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  isVerified?: boolean;
  verificationNotes?: string | null;
  reason?: string | null;
}

export interface UpdateUserStatusDTO {
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  reason?: string | null;
}

export interface CreateSuperAdminDTO {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  position?: string | null;
}

export interface ModerateOpportunityDTO {
  status: "CLOSED" | "OPEN";
  reason: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminOverviewMonthlyTrend {
  monthKey: string;
  label: string;
  newCompanies: number;
  newPartners: number;
  newUsers: number;
  newPrograms: number;
}

export interface AdminFocusAreaDistribution {
  focusArea: string;
  programCount: number;
  committedBudget: number;
  spentBudget: number;
}

export interface AdminOverviewResponse {
  kpis: {
    totalCompanies: number;
    verifiedCompanies: number;
    activeCompanies: number;
    suspendedCompanies: number;
    totalPartners: number;
    verifiedPartners: number;
    activePartners: number;
    suspendedPartners: number;
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    stagingUsers: number;
    superAdmins: number;
    totalOpportunities: number;
    openOpportunities: number;
    totalProposals: number;
    acceptedProposals: number;
    totalCollaborations: number;
    agreedCollaborations: number;
    totalPrograms: number;
    plannedPrograms: number;
    inProgressPrograms: number;
    completedPrograms: number;
    onHoldPrograms: number;
    cancelledPrograms: number;
    totalCommittedBudget: number;
    totalDisbursedFunds: number;
    totalVerifiedExpenses: number;
    totalSpentBudget: number;
    totalReviews: number;
    averageRating: number;
  };
  monthlyTrends: AdminOverviewMonthlyTrend[];
  focusAreaDistribution: AdminFocusAreaDistribution[];
  conversionFunnel: {
    openOpportunities: number;
    submittedProposals: number;
    agreedCollaborations: number;
    activeOrCompletedPrograms: number;
  };
  escalationQueue: {
    unverifiedCompanies: Array<{
      id: string;
      name: string;
      city: string | null;
      industry: string | null;
      status: CompanyStatus;
      createdAt: Date;
    }>;
    unverifiedPartners: Array<{
      id: string;
      name: string;
      city: string | null;
      focusArea: string;
      status: PartnerStatus;
      createdAt: Date;
    }>;
    flaggedPrograms: Array<{
      id: string;
      title: string;
      status: ProgramStatus;
      companyName: string | null;
      partnerName: string | null;
      updatedAt: Date;
    }>;
    lowRatedPrograms: Array<{
      id: string;
      title: string;
      avgRating: number;
      reviewCount: number;
      companyName: string | null;
      partnerName: string | null;
    }>;
  };
}

export interface AdminCompanyListItem extends Company {
  membersCount: number;
  opportunitiesCount: number;
  programsCount: number;
}

export interface AdminCompanyDetail extends AdminCompanyListItem {
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    position: string | null;
    createdAt: Date;
  }>;
  opportunities: Opportunity[];
  programs: Array<{
    id: string;
    title: string;
    focusArea: string;
    status: ProgramStatus;
    budget: string;
    spentBudget: string | null;
    partnerName: string | null;
    createdAt: Date;
  }>;
}

export interface AdminPartnerListItem extends Partner {
  membersCount: number;
  proposalsCount: number;
  programsCount: number;
}

export interface AdminPartnerDetail extends AdminPartnerListItem {
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    position: string | null;
    createdAt: Date;
  }>;
  proposals: Array<{
    id: string;
    title: string;
    status: ProposalStatus;
    proposedBudget: string;
    aiScore: number | null;
    opportunityTitle: string | null;
    companyName: string | null;
    createdAt: Date;
  }>;
  programs: Array<{
    id: string;
    title: string;
    focusArea: string;
    status: ProgramStatus;
    budget: string;
    spentBudget: string | null;
    companyName: string | null;
    createdAt: Date;
  }>;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  phone: string | null;
  position: string | null;
  companyId: string | null;
  partnerId: string | null;
  organizationName: string | null;
  organizationType: "COMPANY" | "PARTNER" | null;
  organizationStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminOpportunityListItem extends Opportunity {
  companyName: string | null;
  companyLogo: string | null;
  companyVerified: boolean;
  proposalsCount: number;
}

export interface AdminProposalListItem extends Proposal {
  opportunityTitle: string | null;
  companyId: string | null;
  companyName: string | null;
  partnerName: string | null;
  partnerCity: string | null;
}

export interface AdminProgramListItem extends Program {
  companyName: string | null;
  companyLogo: string | null;
  partnerName: string | null;
  partnerLogo: string | null;
  opportunityTitle: string | null;
  collaborationMouUrl: string | null;
  totalActivitiesCount: number;
  completedActivitiesCount: number;
  pendingVerificationCount: number;
  activityProgressPercent: number;
  disbursedAmount: number;
  verifiedExpensesAmount: number;
}

export interface AdminProgramAuditDetail {
  program: AdminProgramListItem;
  stages: ProgramStage[];
  activities: ActivityWithDetails[];
  financialSummary: ProgramFinancialSummary;
  disbursements: Array<Record<string, any>>;
  expenses: Array<Record<string, any>>;
  reviews: ProgramReview[];
  reviewStats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    sentimentBreakdown: {
      POSITIVE: number;
      NEUTRAL: number;
      NEGATIVE: number;
    };
  };
}

export interface AdminImpactOverviewResponse {
  summary: {
    totalReviews: number;
    averageRating: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    totalCitiesCovered: number;
    totalProgramsReviewed: number;
  };
  geoDistribution: Array<{
    city: string;
    province: string | null;
    programCount: number;
    totalBudget: number;
    reviewCount: number;
  }>;
  focusAreaImpact: Array<{
    focusArea: string;
    programCount: number;
    totalBudget: number;
    avgRating: number;
    reviewCount: number;
  }>;
  lowRatedOrNegativePrograms: Array<{
    programId: string;
    programTitle: string;
    companyName: string | null;
    partnerName: string | null;
    status: ProgramStatus;
    avgRating: number;
    negativeCount: number;
    totalReviews: number;
  }>;
  recentReviews: Array<
    ProgramReview & {
      programTitle: string | null;
      companyName: string | null;
      partnerName: string | null;
    }
  >;
}

export interface AdminAuditLogItem {
  id: string;
  adminId: string;
  adminName: string | null;
  adminEmail: string | null;
  action: string;
  targetType: AdminAuditTargetType;
  targetId: string;
  targetLabel: string | null;
  previousValue: string | null;
  newValue: string | null;
  reason: string | null;
  createdAt: Date;
}

export interface AdminSystemStatusResponse {
  aiConfig: {
    enabled: boolean;
    model: string;
    openAiConfigured: boolean;
  };
  aiMetrics: {
    screenedProposalsCount: number;
    aiGeneratedStagesCount: number;
    esgReportsGeneratedCount: number;
    sentimentAnalyzedProgramsCount: number;
  };
  auditLogs: PaginatedResult<AdminAuditLogItem>;
}

