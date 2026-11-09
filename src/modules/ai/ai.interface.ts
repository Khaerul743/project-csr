import { ProposalScreeningResult } from "./services/proposal-screener/proposal-screener.schema";
import { EsgReportResult } from "./services/esg-report/esg-report.schema";


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

export interface ProgramStageSummaryItem {
  title: string;
  orderIndex: number;
  status?: string;
  targetTimeline?: string | null;
}

export interface ProgramActivitySummaryItem {
  title: string;
  activityDate?: string | Date | null;
  beneficiariesCount?: number | null;
  status: string;
  location?: string | null;
  description?: string | null;
}

export interface ProgramReviewSummaryItem {
  reviewerName?: string | null;
  rating: number;
  reviewText?: string | null;
  createdAt?: string | Date | null;
}

export interface EsgReportInput {
  programTitle: string;
  description?: string | null;
  focusArea: string;
  location: string;
  timeline: string;
  status: string;
  companyName: string;
  companyIndustry?: string | null;
  partnerName: string;
  budget: string | number;
  spentBudget: string | number;
  targetBeneficiaries?: string | null;
  actualBeneficiaries?: string | null;
  verifiedExpensesCount?: number;
  stages?: ProgramStageSummaryItem[];
  activities?: ProgramActivitySummaryItem[];
  reviews?: ProgramReviewSummaryItem[];
}

export interface EsgReportResponse extends EsgReportResult {
  source: "AI_OPENAI" | "HEURISTIC_FALLBACK";
}

export interface BeneficiaryReviewItemForAi {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerCity?: string | null;
  rating: number;
  comment: string;
  createdAt?: string | Date | null;
}

export interface ProgramSentimentAnalysisInput {
  programId: string;
  programTitle: string;
  focusArea: string;
  targetCity?: string | null;
  partnerName?: string | null;
  reviews: BeneficiaryReviewItemForAi[];
}

export interface ProgramSentimentAnalysisResponse {
  overallSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  netSentimentScore: number;
  positivePercentage: number;
  neutralPercentage: number;
  criticalPercentage: number;
  totalReviewsAnalyzed: number;
  averageRating: number;
  executiveSummary: string;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
  themes: Array<{
    tag: string;
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    mentionsCount: number;
    description: string;
  }>;
  classifiedReviews: Array<{
    reviewId: string;
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    confidenceScore: number;
    reasoning?: string;
  }>;
  analyzedAt: string;
  source: "AI_OPENAI" | "HEURISTIC_FALLBACK";
}


