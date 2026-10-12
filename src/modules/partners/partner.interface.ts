import { Partner } from "@/db/schema/partners";
import { SafeUser } from "@/modules/auth/auth.interface";

export interface CreatePartnerDTO {
  name: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  website?: string | null;
  logoUrl?: string | null;
}

export interface UpdatePartnerDTO {
  name?: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  website?: string | null;
  logoUrl?: string | null;
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
