import { z } from "zod";
import { csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import { opportunityStatusEnum } from "@/db/schema/opportunities";

export const createOpportunitySchema = z.object({
  title: z
    .string()
    .min(3, "Judul opportunity minimal 3 karakter")
    .max(255, "Judul opportunity maksimal 255 karakter"),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter"),
  focusArea: z.enum(csrFocusAreaEnum, {
    message: "Bidang fokus CSR tidak valid",
  }),
  targetCity: z.string().max(100).optional().nullable(),
  targetProvince: z.string().max(100).optional().nullable(),
  estimatedBudget: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return null;
      return typeof val === "number" ? val.toString() : val;
    }),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  bannerUrl: z.string().url("URL banner tidak valid").optional().nullable().or(z.literal("")),
  status: z.enum(opportunityStatusEnum).optional().default("OPEN"),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const invitePartnerSchema = z.object({
  partnerId: z.string().uuid("ID Mitra tidak valid"),
  message: z.string().max(1000).optional().nullable(),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type InvitePartnerInput = z.infer<typeof invitePartnerSchema>;
