import { z } from "zod";

export const impactOutputMetricSchema = z.object({
  metric: z.string().describe("Nama metrik capaian fisik atau penerima (misal: 'Penerima Manfaat Langsung', 'Fasilitas Sanitasi')"),
  estimate: z.string().describe("Estimasi kuantitatif terukur (misal: '250 KK (±1.000 jiwa)', '5 Unit Pompa Air')"),
  unit: z.string().describe("Satuan ukuran (misal: 'KK', 'Orang', 'Unit', 'Hektar')"),
});

export const impactOutcomeSchema = z.object({
  aspect: z.enum(["SOSIAL", "EKONOMI", "LINGKUNGAN"]).describe("Aspek pilar dampak"),
  highlight: z.string().describe("Satu kalimat ringkas proyeksi perubahan positif jangka menengah di komunitas"),
});

export const keySuccessIndicatorSchema = z.object({
  indicator: z.string().describe("Nama indikator keberhasilan (KPI) yang terukur"),
  target: z.string().describe("Target konkret yang harus dicapai"),
  verification: z.string().describe("Metode atau bukti verifikasi lapangan"),
});

export const regionalRiskSchema = z.object({
  risk: z.string().describe("Tantangan atau risiko spesifik terkait kondisi wilayah/geografis"),
  mitigation: z.string().describe("Tindakan mitigasi konkret untuk klausul kesepakatan"),
});

export const impactPredictionSchema = z.object({
  overallImpactScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Skor estimasi dampak keseluruhan program (0 - 100)"),
  impactLevel: z
    .enum(["TINGGI", "MODERAT", "TERBATAS"])
    .describe("Kategori dampak utama"),
  impactLevelLabel: z
    .string()
    .describe("Label dampak dalam Bahasa Indonesia (contoh: 'Dampak Signifikan', 'Dampak Terarah', 'Dampak Terbatas')"),
  executiveSummary: z
    .string()
    .describe("Rangkuman eksekutif padat dalam 1-2 kalimat tajam sebelum penandatanganan MoU"),
  projectedOutputs: z
    .array(impactOutputMetricSchema)
    .min(2)
    .max(4)
    .describe("2-4 metrik hasil/output langsung terpenting"),
  projectedOutcomes: z
    .array(impactOutcomeSchema)
    .min(2)
    .max(3)
    .describe("2-3 poin perubahan dampak berkelanjutan"),
  keySuccessIndicators: z
    .array(keySuccessIndicatorSchema)
    .min(2)
    .max(4)
    .describe("2-4 indikator keberhasilan utama (KPI) untuk monitoring kesepakatan"),
  regionalRisks: z
    .array(regionalRiskSchema)
    .min(1)
    .max(2)
    .describe("1-2 risiko spesifik kondisi wilayah beserta mitigasinya"),
  recommendation: z
    .enum(["READY_TO_SIGN", "NEED_CONDITIONS", "RECONSIDER"])
    .describe("Rekomendasi persetujuan akhir"),
  recommendationLabel: z
    .string()
    .describe("Label status rekomendasi ('Siap Disahkan', 'Disahkan dengan Catatan', 'Perlu Peninjauan')"),
  recommendationNotes: z
    .string()
    .describe("Catatan singkat pertimbangan bagi direksi/manajemen"),
});

export type ImpactPredictionResult = z.infer<typeof impactPredictionSchema>;

