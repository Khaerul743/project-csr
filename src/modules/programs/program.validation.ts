import { z } from "zod";
import { programStatusEnum } from "@/db/schema/programs";
import { csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";

export const updateProgramSchema = z.object({
  title: z.string().min(3, "Judul program minimal 3 karakter").max(255).optional(),
  description: z.string().optional(),
  focusArea: z.enum(csrFocusAreaEnum).optional(),
  budget: z.union([z.string(), z.number()]).optional(),
  spentBudget: z.union([z.string(), z.number()]).optional(),
  targetBeneficiaries: z.string().max(255).optional().nullable(),
  actualBeneficiaries: z.string().max(255).optional().nullable(),
  targetCity: z.string().max(100).optional().nullable(),
  targetProvince: z.string().max(100).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(programStatusEnum).optional(),
});
