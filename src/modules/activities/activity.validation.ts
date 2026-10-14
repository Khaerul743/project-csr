import { z } from "zod";

export const createActivitySchema = z.object({
  title: z.string().min(3, "Judul kegiatan minimal 3 karakter").max(255),
  description: z.string().min(10, "Deskripsi kegiatan minimal 10 karakter"),
  activityDate: z.string().min(1, "Tanggal kegiatan harus diisi"),
  location: z.string().max(255).optional().nullable(),
  beneficiariesReached: z.string().max(100).optional().nullable(),
  fundsSpent: z.union([z.string(), z.number()]).optional().nullable(),
  mediaUrls: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  documentUrl: z.string().max(500).optional().nullable(),
});

export const reviewActivitySchema = z.object({
  status: z.enum(["VERIFIED", "REVISION_REQUESTED"]),
  companyFeedback: z.string().max(2000, "Catatan feedback maksimal 2000 karakter").optional().nullable(),
});

export const updateActivitySchema = z.object({
  title: z.string().min(3, "Judul kegiatan minimal 3 karakter").max(255).optional(),
  description: z.string().min(10, "Deskripsi kegiatan minimal 10 karakter").optional(),
  activityDate: z.string().optional(),
  location: z.string().max(255).optional().nullable(),
  beneficiariesReached: z.string().max(100).optional().nullable(),
  fundsSpent: z.union([z.string(), z.number()]).optional().nullable(),
  mediaUrls: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  documentUrl: z.string().max(500).optional().nullable(),
});
