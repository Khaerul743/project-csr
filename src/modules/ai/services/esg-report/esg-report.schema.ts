import { z } from "zod";

export const esgReportSchema = z.object({
  executiveSummary: z
    .string()
    .describe(
      "Ringkasan formal capaian dan dampak program secara menyeluruh untuk pimpinan eksekutif korporat / sustainability report"
    ),
  programHighlight: z
    .string()
    .describe(
      "Poin keberhasilan paling menonjol atau nilai pembeda utama dari inisiatif CSR ini"
    ),

  esgBreakdown: z.object({
    environmentalImpact: z
      .string()
      .describe(
        "Dampak nyata terhadap kelestarian lingkungan hidup, pengurangan emisi/limbah, konservasi alam, atau efisiensi sumber daya"
      ),
    socialImpact: z
      .string()
      .describe(
        "Dampak nyata terhadap peningkatan kesejahteraan, kesehatan, pendidikan, atau pemberdayaan sosial ekonomi masyarakat penerima manfaat"
      ),
    governanceTransparency: z
      .string()
      .describe(
        "Tata kelola, transparansi realisasi anggaran, integritas pelaporan belanja, dan kepatuhan akuntabilitas kemitraan"
      ),
  }),

  primarySdg: z.object({
    goalNumber: z
      .number()
      .int()
      .min(1)
      .max(17)
      .describe("Nomor target SDG utama (1 sampai 17)"),
    goalTitle: z
      .string()
      .describe(
        "Nama resmi target SDG utama (misal: 'SDG 4: Pendidikan Berkualitas' atau 'SDG 13: Penanganan Perubahan Iklim')"
      ),
    alignmentRationale: z
      .string()
      .describe(
        "Ulasan komprehensif bagaimana program dan aktivitas lapangan berkontribusi langsung pada target SDG tersebut"
      ),
  }),

  secondarySdgs: z
    .array(
      z.object({
        goalNumber: z.number().int().min(1).max(17),
        goalTitle: z.string(),
        description: z.string(),
      })
    )
    .describe("Daftar 1-3 SDG sekunder yang turut terdampak secara positif"),

  metrics: z.object({
    beneficiariesReached: z
      .number()
      .describe("Estimasi atau jumlah riil jiwa penerima manfaat langsung"),
    budgetEfficiencyRating: z
      .enum(["EXCELLENT", "GOOD", "MODERATE", "NEEDS_IMPROVEMENT"])
      .describe("Penilaian efisiensi penggunaan anggaran terhadap capaian lapangan"),
    costPerBeneficiaryFormatted: z
      .string()
      .describe(
        "Estimasi biaya per penerima manfaat terformat dalam Rupiah, contoh 'Rp 125.000 / jiwa'"
      ),
    beneficiarySatisfactionScore: z
      .number()
      .min(0)
      .max(100)
      .describe("Indeks kepuasan penerima manfaat dalam skala 0 - 100 berdasarkan ulasan warga"),
    overallEsgScore: z
      .number()
      .min(0)
      .max(100)
      .describe("Skor performa ESG terpadu program dalam skala 0 - 100"),
  }),

  successStory: z.object({
    headline: z.string().describe("Judul kisah inspiratif atau human interest story"),
    narrative: z
      .string()
      .describe(
        "Narasi cerita perubahan kondisi penerima manfaat sebelum dan sesudah program terlaksana"
      ),
    beneficiaryQuote: z
      .string()
      .describe("Kutipan apresiasi atau testimoni dari penerima manfaat/masyarakat"),
  }),

  challengesFaced: z
    .array(z.string())
    .describe("Daftar 2-4 tantangan operasional atau kendala yang dihadapi di lapangan"),
  futureRecommendations: z
    .array(z.string())
    .describe(
      "Daftar 2-4 rekomendasi strategis bagi perusahaan sponsor untuk keberlanjutan atau inisiatif lanjutan di masa depan"
    ),
});

export type EsgReportResult = z.infer<typeof esgReportSchema>;
