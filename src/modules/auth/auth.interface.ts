import { User, UserRole, UserStatus } from "@/db/schema/users";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  companyId?: string | null;
  partnerId?: string | null;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export type SafeUser = Omit<User, "password">;

export interface AuthResponseData {
  user: SafeUser;
  accessToken: string;
}
