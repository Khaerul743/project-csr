import { z } from "zod";

/**
 * Skema Zod untuk validasi structured output dari LangChain OpenAI
 * dalam modul AI Proposal Optimizer & Reviewer bagi Mitra.
 */
export const proposalOptimizationSchema = z.object({
  readinessScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Skor kesiapan dan kelayakan proposal secara keseluruhan dari skala 0 hingga 100."),
  alignmentLevel: z
    .enum(["HIGH", "MEDIUM", "LOW"])
    .describe("Tingkat keselarasan proposal dengan kriteria dan kebutuhan inisiatif CSR perusahaan."),
  overallAssessment: z
    .string()
    .describe("Ringkasan evaluasi komprehensif mengenai posisi proposal dan potensi kelayakannya."),
  feedbackAnalysis: z
    .object({
      keyConcerns: z
        .array(z.string())
        .describe("Poin-poin keberatan atau ekspektasi utama yang disampaikan reviewer perusahaan."),
      suggestedActions: z
        .array(z.string())
        .describe("Langkah-langkah konkret yang harus dilakukan mitra untuk menjawab feedback tersebut."),
    })
    .optional()
    .describe("Analisis khusus terhadap catatan evaluasi/revisi dari perusahaan (jika ada)."),
  strengths: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("Daftar keunggulan utama proposal yang sudah baik dan perlu dipertahankan."),
  improvementAreas: z
    .array(
      z.object({
        aspect: z.enum([
          "NARASI_METODOLOGI",
          "ANGGARAN_BIAYA",
          "TARGET_PENERIMA",
          "TIMELINE_DURASI",
          "KESELARASAN_CSR",
        ]),
        currentObservation: z
          .string()
          .describe("Kondisi atau kelemahan proposal saat ini pada aspek tersebut."),
        recommendation: z
          .string()
          .describe("Rekomendasi tindakan nyata yang harus diperbaiki oleh mitra."),
      })
    )
    .min(1)
    .max(5)
    .describe("Aspek-aspek krusial yang memerlukan perbaikan beserta rekomendasi solusinya."),
  suggestedSummaryDraft: z
    .string()
    .describe(
      "Draf teks ringkasan teknis dan metodologi yang telah disempurnakan oleh AI secara profesional, persuasif, dan selaras dengan standar korporat CSR."
    ),
  suggestedBudgetAdvice: z
    .string()
    .describe("Saran spesifik mengenai rasionalitas anggaran, efisiensi pos biaya, dan kesesuaian dengan plafon perusahaan."),
  preSubmissionChecklist: z
    .array(
      z.object({
        item: z.string().describe("Poin pemeriksaan sebelum mengirimkan proposal."),
        status: z.enum(["READY", "ACTION_REQUIRED", "RECOMMENDED"]),
        notes: z.string().describe("Keterangan ringkas mengenai status pemeriksaan."),
      })
    )
    .min(3)
    .max(6)
    .describe("Daftar centang kesiapan proposal sebelum diajukan ke pihak perusahaan."),
});

export type ProposalOptimizationResult = z.infer<typeof proposalOptimizationSchema>;

