import { Program, ProgramStatus } from "@/db/schema/programs";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";

export interface ProgramWithDetails extends Program {
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

export interface UpdateProgramDTO {
  title?: string;
  description?: string | null;
  focusArea?: CsrFocusArea;
  budget?: string | number;
  spentBudget?: string | number;
  targetBeneficiaries?: string | null;
  actualBeneficiaries?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  status?: ProgramStatus;
}

export interface ProgramListQuery {
  page?: number;
  limit?: number;
  status?: ProgramStatus;
  focusArea?: CsrFocusArea;
  search?: string;
}

export interface ProgramMetricsSummary {
  totalPrograms: number;
  plannedCount: number;
  inProgressCount: number;
  completedCount: number;
  onHoldCount: number;
  totalBudget: number;
  totalSpentBudget: number;
  absorptionRate: number; // percentage (spent / budget * 100)
}
