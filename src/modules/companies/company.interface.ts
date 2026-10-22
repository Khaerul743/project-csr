import { Company } from "@/db/schema/companies";
import { SafeUser } from "@/modules/auth/auth.interface";

export interface CsrLeaderItem {
  id?: string;
  name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
}

export interface CompanyMetrics {
  totalDisbursedBudget: number;
  completedPrograms: number;
  totalPrograms: number;
  totalOpportunities: number;
  totalPartnersEngaged: number;
  averageRating: number;
  totalReviews: number;
}

export interface CompanyDetailedProfile extends Company {
  members?: any[];
  metrics?: CompanyMetrics;
  openOpportunities?: any[];
}

export interface CreateCompanyDTO {
  name: string;
  tagline?: string | null;
  description?: string | null;
  csrVision?: string | null;
  industry?: string | null;
  companySize?: string | null;
  foundedYear?: number | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  nibNumber?: string | null;
  npwpNumber?: string | null;
  sustainabilityReportUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  csrLeaders?: CsrLeaderItem[] | string | null;
}

export interface UpdateCompanyDTO {
  name?: string;
  tagline?: string | null;
  description?: string | null;
  csrVision?: string | null;
  industry?: string | null;
  companySize?: string | null;
  foundedYear?: number | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  nibNumber?: string | null;
  npwpNumber?: string | null;
  sustainabilityReportUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  csrLeaders?: CsrLeaderItem[] | string | null;
}

export interface CompanyResponseData {
  company: Company;
  user: SafeUser;
  accessToken: string;
}

export interface CompanyListQuery {
  page?: number;
  limit?: number;
  search?: string;
}
