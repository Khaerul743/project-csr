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

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(150, "Nama maksimal 150 karakter").optional(),
  phone: z.string().max(30, "Nomor telepon maksimal 30 karakter").optional().nullable(),
  position: z.string().max(100, "Jabatan maksimal 100 karakter").optional().nullable(),
  avatarUrl: z.string().optional().nullable().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter").max(100),
    confirmNewPassword: z.string().min(1, "Konfirmasi kata sandi baru wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Konfirmasi kata sandi baru tidak cocok",
    path: ["confirmNewPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
