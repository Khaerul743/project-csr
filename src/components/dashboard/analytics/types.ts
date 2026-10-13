import { CsrFocusArea } from "@/db/schema/csr-focus-areas";

export interface ProgramAnalyticsData {
  id: string;
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
  companyName?: string | null;
  partnerName?: string | null;
  opportunityTitle?: string | null;
}

export type EsgPillarType = "ENVIRONMENT" | "SOCIAL" | "GOVERNANCE";

export interface EsgPillarSummary {
  pillar: EsgPillarType;
  title: string;
  subtitle: string;
  allocatedBudget: number;
  spentBudget: number;
  programCount: number;
  percentageOfBudget: number;
  beneficiaries: number;
  sdgTags: string[];
  color: string;
}

export interface FocusAreaDistribution {
  focusArea: CsrFocusArea;
  label: string;
  allocatedBudget: number;
  spentBudget: number;
  absorptionRate: number;
  programCount: number;
  percentageOfBudget: number;
  color: string;
  badgeVariant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate";
}

export interface OverallEsgMetrics {
  totalPrograms: number;
  inProgressPrograms: number;
  completedPrograms: number;
  totalAllocatedBudget: number;
  totalSpentBudget: number;
  overallAbsorptionRate: number;
  totalBeneficiaries: number;
  transparencyScore: number;
  environmentalBudget: number;
  socialBudget: number;
  governanceBudget: number;
}
