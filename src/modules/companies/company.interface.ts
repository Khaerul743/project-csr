import { Company } from "@/db/schema/companies";
import { SafeUser } from "@/modules/auth/auth.interface";

export interface CreateCompanyDTO {
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

export interface UpdateCompanyDTO {
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
