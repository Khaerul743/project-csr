import { z } from "zod";
import { csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import { proposalStatusEnum } from "@/db/schema/proposals";
import { programStatusEnum } from "@/db/schema/programs";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Pesan tidak boleh kosong"),
});

export type ChatMessageDTO = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "Minimal ada 1 pesan"),
  context: z
    .object({
      currentPage: z.string().optional(),
      selectedOpportunityId: z.string().optional(),
      selectedProgramId: z.string().optional(),
    })
    .optional(),
});

export type ChatRequestDTO = z.infer<typeof chatRequestSchema>;

// Tool input schemas
export const searchOpportunitiesInputSchema = z.object({
  focusArea: z
    .enum(csrFocusAreaEnum)
    .optional()
    .describe("Fokus area CSR (contoh: LINGKUNGAN, PENDIDIKAN, KESEHATAN, PEMBERDAYAAN_EKONOMI, dll)"),
  location: z
    .string()
    .optional()
    .describe("Nama kota atau provinsi target (contoh: Jawa Barat, Surabaya, Bandung)"),
  minBudget: z
    .number()
    .optional()
    .describe("Batas minimal estimasi anggaran dalam Rupiah"),
  maxBudget: z
    .number()
    .optional()
    .describe("Batas maksimal estimasi anggaran dalam Rupiah"),
  keyword: z
    .string()
    .optional()
    .describe("Kata kunci pencarian pada judul atau deskripsi peluang CSR"),
});

export const getOpportunityDetailInputSchema = z.object({
  opportunityId: z.string().describe("ID dari peluang CSR yang ingin dilihat detail lengkapnya"),
});

export const getMyProposalsInputSchema = z.object({
  status: z
    .enum(proposalStatusEnum)
    .optional()
    .describe("Filter status proposal (SUBMITTED, UNDER_REVIEW, REVISION_REQUESTED, ACCEPTED, REJECTED)"),
});

export const getProposalDetailInputSchema = z.object({
  proposalId: z.string().describe("ID proposal yang ingin diinspeksi detail, feedback revisi, atau skor AI-nya"),
});

export const getMyProgramsOverviewInputSchema = z.object({
  status: z
    .enum(programStatusEnum)
    .optional()
    .describe("Filter status program (PLANNED, IN_PROGRESS, COMPLETED)"),
});

export const getProgramMilestonesProgressInputSchema = z.object({
  programId: z.string().describe("ID program CSR yang ingin dilihat progres tahapan aktivitas dan keuangannya"),
});

export const getCsrSdgsBenchmarkInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe("Topik CSR atau target SDG yang ingin dicari panduannya (contoh: 'SDG 13', 'Pendidikan', 'Stunting')"),
});
