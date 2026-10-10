import { UserRole } from "@/db/schema/users";

export interface JwtUserPayload {
  sub: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  partnerId: string | null;
}
