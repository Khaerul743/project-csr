import { z } from "zod";
import { userRoleEnum } from "@/db/schema/users";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(150),
    email: z.string().email("Invalid email format").max(255),
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
    role: z.enum(userRoleEnum).optional(),
    companyId: z.string().uuid("Invalid company ID format").nullable().optional(),
    partnerId: z.string().uuid("Invalid partner ID format").nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.companyId && data.partnerId) {
        return false;
      }
      return true;
    },
    {
      message: "User cannot be linked to both company and partner simultaneously",
      path: ["partnerId"],
    }
  );

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
