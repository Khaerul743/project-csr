import { User } from "@/db/schema/users";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
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
