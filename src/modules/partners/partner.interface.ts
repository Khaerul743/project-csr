import { Partner } from "@/db/schema/partners";
import { SafeUser } from "@/modules/auth/auth.interface";

export interface PastActivityItem {
  id?: string;
  title: string;
  year: number | string;
  clientSponsor?: string | null;
  beneficiaries?: string | null;
  description: string;
  photoUrl?: string | null;
}

export interface TeamMemberItem {
  id?: string;
  name: string;
  role: string;
  photoUrl?: string | null;
}

export interface CreatePartnerDTO {
  name: string;
  tagline?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  organizationType?: string | null;
  foundedYear?: number | null;
  legalNumber?: string | null;
  npwpNumber?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  portfolioDocUrl?: string | null;
  pastActivities?: PastActivityItem[] | string | null;
  teamMembers?: TeamMemberItem[] | string | null;
  focusArea?: any;
}

export interface UpdatePartnerDTO {
  name?: string;
  tagline?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  organizationType?: string | null;
  foundedYear?: number | null;
  legalNumber?: string | null;
  npwpNumber?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  portfolioDocUrl?: string | null;
  pastActivities?: PastActivityItem[] | string | null;
  teamMembers?: TeamMemberItem[] | string | null;
  focusArea?: any;
}

export interface PartnerMetrics {
  completedPrograms: number;
  totalPrograms: number;
  averageRating: number;
  totalReviews: number;
}

export interface PartnerDetailedProfile extends Partner {
  metrics?: PartnerMetrics;
}

export interface PartnerResponseData {
  partner: Partner;
  user: SafeUser;
  accessToken: string;
}

export interface PartnerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  focusArea?: string;
}
