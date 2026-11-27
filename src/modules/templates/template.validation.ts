import { z } from "zod";
import { templateCategoryEnum } from "@/db/schema/company-templates";

export const createTemplateSchema = z.object({
  category: z.enum(templateCategoryEnum).optional().default("PARTNER_INVITATION"),
  title: z
    .string()
    .trim()
    .min(3, "Judul template minimal 3 karakter")
    .max(120, "Judul template maksimal 120 karakter"),
  content: z
    .string()
    .trim()
    .min(10, "Isi pesan template minimal 10 karakter")
    .max(2000, "Isi pesan template maksimal 2000 karakter"),
  isDefault: z.boolean().optional().default(false),
});

export const updateTemplateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul template minimal 3 karakter")
    .max(120, "Judul template maksimal 120 karakter")
    .optional(),
  content: z
    .string()
    .trim()
    .min(10, "Isi pesan template minimal 10 karakter")
    .max(2000, "Isi pesan template maksimal 2000 karakter")
    .optional(),
  isDefault: z.boolean().optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

