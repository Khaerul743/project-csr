import { z } from "zod";

export const proposalAspectScoresSchema = z.object({
  strategicAlignment: z
    .number()
    .min(0)
    .max(100)
    .describe("Skor keselarasan strategis terhadap topik, pilar SDG, dan kriteria inisiatif CSR perusahaan (0-100)"),
  budgetFeasibility: z
    .number()
    .min(0)
    .max(100)
    .describe("Skor kewajaran dan rasionalitas usulan anggaran (RAB) terhadap estimasi output di lapangan (0-100)"),
  operationalFeasibility: z
    .number()
    .min(0)
    .max(100)
    .describe("Skor kelayakan teknis jadwal pelaksanaan, tahapan kerja, dan jangkauan target penerima manfaat (0-100)"),
  impactSustainability: z
    .number()
    .min(0)
    .max(100)
    .describe("Skor potensi keberlanjutan dampak sosial/lingkungan setelah periode pendanaan program selesai (0-100)"),
});

export const proposalScreeningSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Skor kelayakan total gabungan proposal terhadap inisiatif CSR (0-100)"),
  aspectScores: proposalAspectScoresSchema
    .describe("Rincian skor per 4 pilar evaluasi"),
  recommendation: z
    .enum([
      "STRONGLY_RECOMMENDED",
      "RECOMMENDED_WITH_REVISION",
      "UNDER_CONSIDERATION",
      "NOT_RECOMMENDED",
    ])
    .describe("Rekomendasi tindakan keputusan bagi Manajemen CSR"),
  recommendationLabel: z
    .string()
    .describe("Label rekomendasi dalam Bahasa Indonesia (contoh: 'Sangat Direkomendasikan', 'Disarankan dengan Revisi', 'Perlu Pertimbangan Khusus', 'Tidak Disarankan')"),
  executiveSummary: z
    .string()
    .describe("Ringkasan evaluasi eksekutif padat dalam 2-3 kalimat tajam untuk pengambil keputusan CSR"),
  keyStrengths: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe("Daftar 2 hingga 4 poin keunggulan utama proposal"),
  potentialRisks: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("Daftar 1 hingga 3 poin risiko teknis/anggaran atau red-flags yang perlu diperhatikan"),
  suggestedRevisionNotes: z
    .string()
    .optional()
    .describe("Draf rekomendasi masukan/catatan revisi konkret jika perusahaan memilih meminta revisi"),
});

export type ProposalAspectScores = z.infer<typeof proposalAspectScoresSchema>;
export type ProposalScreeningResult = z.infer<typeof proposalScreeningSchema>;
