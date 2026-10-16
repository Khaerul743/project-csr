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
}

export interface ProgramReviewResponse {
  program: ProgramReviewSummary;
  stats: ReviewStats;
  reviews: ProgramReview[];
}
