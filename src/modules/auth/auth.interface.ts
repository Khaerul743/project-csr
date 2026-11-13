import { User } from "@/db/schema/users";

export interface RegisterDTO {
  name: string;
  username?: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export type SafeUser = Omit<User, "password">;

export interface UpdateProfileDTO {
  name?: string;
  phone?: string | null;
  position?: string | null;
  avatarUrl?: string | null;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponseData {
  user: SafeUser;
  accessToken: string;
}
