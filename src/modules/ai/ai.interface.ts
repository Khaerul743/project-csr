import { ProposalScreeningResult } from "./services/proposal-screener/proposal-screener.schema";

export interface ProposalMilestoneInput {
  title: string;
  summary: string;
  focusArea?: string | null;
  durationMonths?: number | null;
  targetBeneficiaries?: string | null;
  budget?: string | number | null;
  documentUrl?: string | null;
}

export interface ExtractedStageItem {
  orderIndex: number;
  title: string;
  description: string;
  targetTimeline: string;
  expectedEvidence: string;
  suggestedKpi?: string;
}

export interface MilestoneExtractionResponse {
  summaryRationale: string;
  stages: ExtractedStageItem[];
  source: "AI_OPENAI" | "HEURISTIC_FALLBACK";
}

export interface ProposalScreeningInput {
  opportunityTitle: string;
  opportunityDescription: string;
  opportunityFocusArea?: string | null;
  opportunityTargetBeneficiaries?: string | null;
  opportunityEstimatedBudget?: string | number | null;
  opportunityLocation?: string | null;
  proposalTitle: string;
  partnerName: string;
  partnerFocusArea?: string | null;
  proposedBudget: string | number;
  durationMonths?: number | null;
  proposalTargetBeneficiaries?: string | null;
  proposalSummary: string;
  documentUrl?: string | null;
}

export interface ProposalScreeningResponse extends ProposalScreeningResult {
  source: "AI_OPENAI" | "HEURISTIC_FALLBACK";
}
