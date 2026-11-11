import { z } from "zod";

export const updateTenantStatusSchema = z
  .object({
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
    isVerified: z.boolean().optional(),
    verificationNotes: z.string().max(1000).optional().nullable(),
    reason: z.string().max(500).optional().nullable(),
  })
  .refine((data) => data.status !== undefined || data.isVerified !== undefined, {
    message: "Minimal salah satu dari status atau status verifikasi harus diperbarui",
  })
  .refine(
    (data) => {
      if (data.status === "SUSPENDED") {
        const text = (data.reason || data.verificationNotes || "").trim();
        return text.length >= 5;
      }
      return true;
    },
    {
      message: "Alasan penangguhan (SUSPENDED) wajib diisi minimal 5 karakter",
      path: ["reason"],
    }
  );

export const updateUserStatusSchema = z
  .object({
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
    reason: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.status === "SUSPENDED") {
        return (data.reason || "").trim().length >= 5;
      }
      return true;
    },
    {
      message: "Alasan penangguhan akun wajib diisi minimal 5 karakter",
      path: ["reason"],
    }
  );

export const createSuperAdminSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(150, "Nama maksimal 150 karakter"),
  email: z.string().email("Format email tidak valid").max(255),
  password: z
    .string()
    .min(8, "Kata sandi Super Admin minimal 8 karakter")
    .max(100, "Kata sandi maksimal 100 karakter"),
  phone: z.string().max(30, "Nomor telepon maksimal 30 karakter").optional().nullable(),
  position: z.string().max(100, "Jabatan maksimal 100 karakter").optional().nullable(),
});

export const moderateOpportunitySchema = z.object({
  status: z.enum(["CLOSED", "OPEN"]),
  reason: z.string().min(5, "Alasan moderasi minimal 5 karakter").max(500),
});

