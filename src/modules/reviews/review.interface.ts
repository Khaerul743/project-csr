import { ProgramReview } from "@/db/schema/program-reviews";

export interface ProgramReviewWithProgram extends ProgramReview {
  programTitle?: string | null;
  companyName?: string | null;
  partnerName?: string | null;
}

export interface CreateReviewDTO {
  reviewerName: string;
  reviewerRole: string;
  reviewerCity?: string | null;
  rating: number;
  comment: string;
  photoUrl?: string | null;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ProgramReviewSummary {
  id: string;
  title: string;
  description: string | null;
  focusArea: string;
  targetCity: string | null;
  targetProvince: string | null;
  companyName: string | null;
  companyLogo: string | null;
  partnerName: string | null;
  partnerLogo: string | null;
  status: string;
  sentimentAnalysis?: string | null;
  sentimentAnalyzedAt?: Date | string | null;
}

export interface ProgramReviewResponse {
  program: ProgramReviewSummary;
  stats: ReviewStats;
  reviews: ProgramReview[];
}

export interface SectorSentimentItem {
  focusArea: string;
  focusAreaLabel: string;
  programCount: number;
  totalReviews: number;
  averageRating: number;
  netSentimentScore: number;
  positiveCount: number;
  neutralCount: number;
  criticalCount: number;
  positivePercentage: number;
  neutralPercentage: number;
  criticalPercentage: number;
}

export interface CompanySentimentSummary {
  totalReviews: number;
  averageRating: number;
  netSentimentScore: number;
  positivePercentage: number;
  neutralPercentage: number;
  criticalPercentage: number;
  overallSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  analyzedProgramsCount: number;
  totalProgramsCount: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ProgramSentimentScorecardItem {
  id: string;
  title: string;
  focusArea: string;
  targetCity: string | null;
  targetProvince: string | null;
  partnerName: string | null;
  status: string;
  totalReviews: number;
  averageRating: number;
  netSentimentScore: number;
  overallSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  sentimentAnalyzedAt: string | null;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}

export interface EnrichedBeneficiaryReviewItem extends ProgramReview {
  programTitle: string;
  partnerName: string | null;
  targetCity: string | null;
}

export interface CompanyBeneficiarySentimentOverviewResponse {
  summary: CompanySentimentSummary;
  executiveSummary: string;
  aggregatedHighlights: string[];
  aggregatedConcerns: string[];
  aggregatedRecommendations: string[];
  programs: ProgramSentimentScorecardItem[];
  recentReviews: EnrichedBeneficiaryReviewItem[];
  sectorComparison: SectorSentimentItem[];
}

