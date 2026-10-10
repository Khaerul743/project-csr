import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(150)
      .optional(),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(150)
      .optional(),
    email: z.string().email("Invalid email format").max(255),
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
  })
  .refine((data) => Boolean(data.username || data.name), {
    message: "Username is required",
    path: ["username"],
  })
  .transform((data) => ({
    name: (data.username ?? data.name)!,
    email: data.email,
    password: data.password,
  }));

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
