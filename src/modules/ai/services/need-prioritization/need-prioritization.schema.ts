import { z } from "zod";
import { csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";

export const overlapRiskLevelEnum = ["LOW", "MEDIUM", "HIGH"] as const;
export type OverlapRiskLevel = (typeof overlapRiskLevelEnum)[number];

export const needPriorityUrgencyEnum = ["CRITICAL", "HIGH", "MODERATE"] as const;
export type NeedPriorityUrgency = (typeof needPriorityUrgencyEnum)[number];

export const needEvidenceBasisEnum = [
  "PLATFORM_DATA",
  "RESIDENT_FEEDBACK",
  "REGIONAL_CONTEXT",
] as const;
export type NeedEvidenceBasis = (typeof needEvidenceBasisEnum)[number];

export const priorityNeedItemSchema = z.object({
  rank: z
    .number()
    .int()
    .min(1)
    .max(3)
    .describe("Peringkat prioritas kebutuhan (1 = paling mendesak hingga 3)"),
  needTitle: z
    .string()
    .describe("Judul singkat masalah atau kebutuhan prioritas masyarakat di wilayah sasaran"),
  focusArea: z
    .enum(csrFocusAreaEnum)
    .describe("Bidang fokus CSR SIPENA yang paling sesuai untuk menjawab kebutuhan ini"),
  urgencyLevel: z
    .enum(needPriorityUrgencyEnum)
    .describe("Tingkat urgensi kebutuhan: CRITICAL, HIGH, atau MODERATE"),
  rationale: z
    .string()
    .describe(
      "Alasan terukur berbasis celah program di SIPENA, keluhan/ulasan warga (jika ada), catatan lapangan perusahaan, dan konteks potensi wilayah"
    ),
  recommendedIntervention: z
    .string()
    .describe(
      "Bentuk intervensi CSR konkret dan berkelanjutan agar tidak menduplikasi program yang sudah berjalan"
    ),
  suggestedBeneficiaries: z
    .string()
    .describe("Kelompok penerima manfaat utama yang direkomendasikan di lokasi sasaran"),
  suggestedSdgs: z
    .array(z.number().int().min(1).max(17))
    .min(1)
    .max(5)
    .describe("Daftar 1 hingga 5 nomor tujuan SDGs PBB (1-17) yang paling relevan"),
  evidenceBasis: z
    .enum(needEvidenceBasisEnum)
    .describe(
      "Sumber dasar analisis utama: PLATFORM_DATA (fakta program/peluang/NGO SIPENA), RESIDENT_FEEDBACK (suara warga), atau REGIONAL_CONTEXT (profil makro wilayah / catatan lapangan)"
    ),
});

export const needPrioritizationSchema = z.object({
  overlapAssessment: z.object({
    riskLevel: z
      .enum(overlapRiskLevelEnum)
      .describe(
        "Risiko tumpang tindih bidang fokus yang sedang dipilih terhadap program/peluang eksisting di wilayah sasaran"
      ),
    riskLabel: z
      .string()
      .describe(
        "Label ringkas status risiko dalam Bahasa Indonesia (contoh: 'Risiko Tumpang Tindih Rendah', 'Mulai Padat - Perlu Diferensiasi', 'Risiko Tumpang Tindih Tinggi')"
      ),
    summary: z
      .string()
      .describe(
        "Penjelasan 2-3 kalimat mengenai kepadatan sektor di kota/provinsi sasaran dan strategi menghindari duplikasi program"
      ),
    crowdedFocusAreas: z
      .array(z.enum(csrFocusAreaEnum))
      .describe("Bidang fokus CSR yang sudah memiliki cukup banyak program/peluang aktif di wilayah"),
    underservedFocusAreas: z
      .array(z.enum(csrFocusAreaEnum))
      .describe("Bidang fokus CSR yang masih minim atau belum tersentuh di wilayah sasaran"),
  }),
  regionalPotentialSummary: z.object({
    conditionsAndPotential: z
      .string()
      .describe(
        "Ringkasan kondisi sosial-ekonomi dan potensi wilayah sasaran yang relevan untuk intervensi CSR"
      ),
    socialNeedsGap: z
      .string()
      .describe(
        "Identifikasi kebutuhan masyarakat yang masih belum terpenuhi atau perlu penguatan berdasarkan celah program dan suara warga"
      ),
    basisNote: z
      .string()
      .describe(
        "Catatan transparan mengenai basis data analisis (membedakan fakta data SIPENA vs konteks makro wilayah bila histori masih terbatas)"
      ),
  }),
  priorityNeeds: z
    .array(priorityNeedItemSchema)
    .min(2)
    .max(3)
    .describe("Daftar 2 hingga 3 kebutuhan masyarakat paling prioritas secara berurutan"),
  formSuggestions: z.object({
    recommendedFocusArea: z
      .enum(csrFocusAreaEnum)
      .describe("Saran bidang fokus CSR yang paling strategis untuk peluang baru ini"),
    recommendedSdgs: z
      .array(z.number().int().min(1).max(17))
      .min(1)
      .max(6)
      .describe("Rekomendasi 1 hingga 6 nomor SDGs PBB (1-17) untuk dipetakan pada peluang"),
    draftDescriptionSnippet: z
      .string()
      .describe(
        "Draf paragraf ringkas siap pakai (3-5 kalimat) dalam Bahasa Indonesia baku untuk melengkapi deskripsi peluang CSR berdasarkan prioritas wilayah"
      ),
    differentiationTip: z
      .string()
      .describe(
        "Saran pembeda praktis agar peluang baru melengkapi ekosistem CSR setempat alih-alih mengulang program yang sudah ada"
      ),
  }),
});

export type PriorityNeedItem = z.infer<typeof priorityNeedItemSchema>;
export type NeedPrioritizationResult = z.infer<typeof needPrioritizationSchema>;

