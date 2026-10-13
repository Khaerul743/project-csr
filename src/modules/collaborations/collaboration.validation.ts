import { z } from "zod";
import { collaborationStatusEnum } from "@/db/schema/collaborations";

export const updateCollaborationSchema = z.object({
  finalBudget: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === "number") return val.toString();
      const cleaned = val.replace(/[^\d.]/g, "");
      return cleaned || "0";
    })
    .refine((val) => parseFloat(val) > 0, "Anggaran final harus lebih dari 0")
    .optional()
    .nullable(),
  targetBeneficiaries: z.string().max(255).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  mouDocumentUrl: z.string().optional().nullable().or(z.literal("")),
  notes: z.string().max(3000).optional().nullable(),
  status: z.enum(collaborationStatusEnum, {
    message: "Status kolaborasi harus NEGOTIATION, AGREED, atau CANCELLED",
  }).optional(),
});

export type UpdateCollaborationInput = z.infer<typeof updateCollaborationSchema>;
