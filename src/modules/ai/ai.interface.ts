import { ProposalScreeningResult } from "./services/proposal-screener/proposal-screener.schema";
import { EsgReportResult } from "./services/esg-report/esg-report.schema";
import { NeedPrioritizationResult } from "./services/need-prioritization/need-prioritization.schema";
import { ImpactPredictionResult } from "./services/impact-prediction/impact-prediction.schema";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";


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

export * from "./services/proposal-optimizer/proposal-optimizer.service";
export * from "./services/proposal-optimizer/proposal-optimizer.schema";

export type TerritoryDataCoverage = "RICH_DATA" | "LIMITED_DATA" | "COLD_START";

export interface TerritoryProgramAggregateItem {
  focusArea: CsrFocusArea;
  cityProgramsCount: number;
  provinceProgramsCount: number;
  activeOrPlannedCount: number;
  completedCount: number;
  sampleThemes: string[];
  sampleBeneficiaries: string[];
}

export interface TerritoryOpenOpportunityItem {
  id: string;
  title: string;
  focusArea: CsrFocusArea;
  targetCity: string | null;
  targetProvince: string | null;
  status: string;
  isExactCityMatch: boolean;
}

export interface TerritoryReviewSampleItem {
  rating: number;
  comment: string;
  sentiment: string | null;
  reviewerRole: string;
  reviewerCity: string | null;
  programFocusArea: CsrFocusArea;
}

export interface TerritoryPartnerSectorCount {
  focusArea: CsrFocusArea;
  activeCount: number;
  verifiedCount: number;
}

export interface TerritoryDataSnapshot {
  targetProvince: string;
  targetCity: string;
  dataCoverage: TerritoryDataCoverage;
  companyContext: {
    name: string;
    industry: string | null;
    csrVision: string | null;
    ownOpportunitiesCount: number;
    ownProgramsCount: number;
    ownProgramFocusAreas: CsrFocusArea[];
  };
  regionalStats: {
    programsInCity: number;
    programsInProvince: number;
    openOpportunitiesInCity: number;
    openOpportunitiesInProvince: number;
    totalReviewsInProvince: number;
    averageRatingInProvince: number;
    negativeReviewsCount: number;
    positiveReviewsCount: number;
    activePartnersInCity: number;
    activePartnersInProvince: number;
    verifiedPartnersInProvince: number;
  };
  programsBySector: TerritoryProgramAggregateItem[];
  openOpportunities: TerritoryOpenOpportunityItem[];
  reviewSamples: TerritoryReviewSampleItem[];
  activityLocations: Array<{
    locationName: string;
    focusArea: CsrFocusArea;
    title: string;
  }>;
  partnersBySector: TerritoryPartnerSectorCount[];
}

export interface NeedPrioritizationInput {
  targetProvince: string;
  targetCity: string;
  selectedFocusArea?: CsrFocusArea | null;
  draftTitle?: string | null;
  draftDescription?: string | null;
  estimatedBudget?: string | number | null;
  fieldContextNotes?: string | null;
  territoryData: TerritoryDataSnapshot;
}

export interface NeedPrioritizationResponse extends NeedPrioritizationResult {
  regionalSnapshot: {
    targetProvince: string;
    targetCity: string;
    dataCoverage: TerritoryDataCoverage;
    programsInCity: number;
    programsInProvince: number;
    openOpportunitiesInRegion: number;
    totalReviewsInRegion: number;
    averageRatingInRegion: number;
    negativeReviewsCount: number;
    localPartnersReady: number;
    verifiedPartnersReady: number;
  };
  source: "AI_OPENAI" | "HEURISTIC_FALLBACK";
  analyzedAt: string;
}

export interface ImpactPredictionInput {
  opportunityTitle: string;
  focusArea: string;
  targetCity?: string | null;
  targetProvince?: string | null;
  opportunityDescription?: string | null;
  proposalTitle: string;
  partnerName: string;
  finalBudget: string | number;
  targetBeneficiaries: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  durationMonths?: number | null;
  methodologySummary?: string | null;
  milestones?: Array<{
    title: string;
    description?: string | null;
    targetTimeline?: string | null;
  }>;
  existingProgramsCountInRegion?: number;
  existingProgramsInSectorCount?: number;
}

export interface ImpactPredictionResponse extends ImpactPredictionResult {
  source: "AI_OPENAI" | "HEURISTIC_FALLBACK";
  predictedAt: string;
}





