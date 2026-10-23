import { z } from "zod";
import { stageStatusEnum, stageSourceEnum } from "@/db/schema/program-stages";

export const stageItemInputSchema = z.object({
  orderIndex: z.number().int().min(1).default(1),
  title: z.string().min(2, "Judul tahapan minimal 2 karakter").max(255),
  description: z.string().optional().nullable(),
  targetTimeline: z.string().max(100).optional().nullable(),
  expectedEvidence: z.string().optional().nullable(),
  suggestedKpi: z.string().max(255).optional().nullable(),
  status: z.enum(stageStatusEnum).optional().default("PENDING"),
  source: z.enum(stageSourceEnum).optional().default("AI_GENERATED"),
});

export const saveStagesSchema = z.object({
  replaceExisting: z.boolean().optional().default(true),
  stages: z.array(stageItemInputSchema).min(1, "Minimal 1 tahapan kegiatan harus disediakan"),
});

export const updateStageSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().optional().nullable(),
  targetTimeline: z.string().max(100).optional().nullable(),
  expectedEvidence: z.string().optional().nullable(),
  suggestedKpi: z.string().max(255).optional().nullable(),
  status: z.enum(stageStatusEnum).optional(),
  orderIndex: z.number().int().min(1).optional(),
});

export type StageItemInput = z.infer<typeof stageItemInputSchema>;
export type SaveStagesDTO = z.infer<typeof saveStagesSchema>;
export type UpdateStageDTO = z.infer<typeof updateStageSchema>;
