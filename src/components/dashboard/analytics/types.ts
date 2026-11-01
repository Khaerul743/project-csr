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
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED" | string;
  companyName?: string | null;
  partnerName?: string | null;
  opportunityTitle?: string | null;
  sdgs?: number[] | string[];
}

export type EsgPillarType = "ENVIRONMENT" | "SOCIAL" | "GOVERNANCE";
export type EsgPillarCode = "E" | "S" | "G";

export interface SdgGoal {
  id: number;
  code: string;
  name: string;
  nameEn: string;
  color: string;
  esgPillars: EsgPillarCode[];
  primaryPillar: EsgPillarCode;
  description: string;
}

export interface SdgContributionStats {
  sdg: SdgGoal;
  programCount: number;
  percentage: number;
  programs: ProgramAnalyticsData[];
  isCovered: boolean;
}

export interface EsgPillarStats {
  pillar: EsgPillarCode;
  name: string;
  fullName: string;
  subtitle: string;
  themeColor: string;
  badgeClass: string;
  programCount: number;
  percentage: number;
  linkedSdgs: number[];
  programs: ProgramAnalyticsData[];
  focusSummary: string;
}

export interface SdgEsgSummaryKpis {
  coveredSdgsCount: number;
  uncoveredSdgsCount: number;
  coveredPercentage: number;
  topSdg: SdgContributionStats | null;
  leastCoveredSdg: SdgContributionStats | null;
  dominantPillar: {
    pillar: EsgPillarCode;
    name: string;
    programCount: number;
    percentage: number;
  } | null;
}

export interface SdgGapAnalysis {
  topSupportedSdgs: SdgContributionStats[];
  leastCoveredSdgs: SdgContributionStats[];
  uncoveredSdgs: SdgContributionStats[];
  pillarDistribution: {
    environmental: number;
    social: number;
    governance: number;
  };
  totalProgramsCount: number;
}

// Retained for backward compatibility
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
