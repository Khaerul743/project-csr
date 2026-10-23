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
