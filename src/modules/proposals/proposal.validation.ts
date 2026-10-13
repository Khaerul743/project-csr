import { z } from "zod";
import { proposalStatusEnum } from "@/db/schema/proposals";

export const createProposalSchema = z.object({
  opportunityId: z.string().uuid("ID Opportunity tidak valid"),
  title: z
    .string()
    .min(3, "Judul proposal minimal 3 karakter")
    .max(255, "Judul proposal maksimal 255 karakter"),
  summary: z
    .string()
    .min(10, "Ringkasan teknis proposal minimal 10 karakter"),
  proposedBudget: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === "number") return val.toString();
      const cleaned = val.replace(/[^\d.]/g, "");
      return cleaned || "0";
    })
    .refine((val) => parseFloat(val) > 0, "Anggaran yang diajukan harus lebih dari 0"),
  durationMonths: z
    .number()
    .int("Durasi harus bilangan bulat bulan")
    .min(1, "Durasi minimal 1 bulan")
    .max(60, "Durasi maksimal 60 bulan")
    .optional()
    .nullable(),
  targetBeneficiaries: z.string().max(255).optional().nullable(),
  documentUrl: z.string().optional().nullable().or(z.literal("")),
});

export const reviewProposalSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "ACCEPTED", "REJECTED"], {
    message: "Status peninjauan harus UNDER_REVIEW, ACCEPTED, atau REJECTED",
  }),
  feedback: z.string().max(2000, "Catatan feedback maksimal 2000 karakter").optional().nullable(),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type ReviewProposalInput = z.infer<typeof reviewProposalSchema>;
