import { z } from "zod";
import { csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";

export const sdgRecommendationRequestSchema = z.object({
  title: z.string().min(1, "Judul inisiatif program harus diisi"),
  focusArea: z.enum(csrFocusAreaEnum),
  description: z.string().optional().nullable(),
  targetProvince: z.string().optional().nullable(),
  targetCity: z.string().optional().nullable(),
});

export type SdgRecommendationRequestDTO = z.infer<typeof sdgRecommendationRequestSchema>;

export const singleSdgRationaleSchema = z.object({
  sdgId: z.number().int().min(1).max(17).describe("Nomor SDG (1-17)"),
  sdgCode: z.string().describe("Kode SDG resmi (contoh: 'SDG 4')"),
  relevanceScore: z.number().min(0).max(100).describe("Estimasi persentase relevansi keselarasan (0-100)"),
  reason: z.string().describe("Alasan konkret padat 1 kalimat mengapa program ini selaras dengan sasaran SDG ini"),
});

export const singleSdgProbabilitySchema = z.object({
  sdgId: z.number().int().min(1).max(17).describe("Nomor sasaran SDG (1-17)"),
  percentage: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Persentase probabilitas atau tingkat kedekatan relevansi sasaran SDG ini terhadap judul dan deskripsi inisiatif (0-100%)"
    ),
});

export type SingleSdgProbability = z.infer<typeof singleSdgProbabilitySchema>;

export const sdgRecommendationOutputSchema = z.object({
  recommendedSdgs: z
    .array(z.number().int().min(1).max(17))
    .min(1)
    .max(4)
    .describe("Daftar nomor SDG yang paling relevan (1 sampai maksimal 4 sasaran utama)"),
  primarySdg: z
    .number()
    .int()
    .min(1)
    .max(17)
    .describe("SDG utama yang paling mendominasi dampak dari inisiatif ini"),
  conciseRationale: z
    .string()
    .describe(
      "Rangkuman padat 1-2 kalimat yang menjelaskan mengapa program CSR ini langsung berkontribusi pada sasaran SDGs tersebut. Hindari kalimat bertele-tele."
    ),
  breakdown: z
    .array(singleSdgRationaleSchema)
    .min(1)
    .max(4)
    .describe("Rincian sasaran per SDG terpilih"),
  probabilities: z
    .array(singleSdgProbabilitySchema)
    .describe(
      "Distribusi probabilitas / persentase kedekatan untuk seluruh 17 sasaran SDG (SDG 1 sampai 17). Menunjukkan seberapa dekat inisiatif program dengan masing-masing SDG."
    ),
});

export type SdgRecommendationResult = z.infer<typeof sdgRecommendationOutputSchema>;

export interface SdgRecommendationResponse extends SdgRecommendationResult {
  source: "AI_OPENAI" | "HEURISTIC_FALLBACK";
  analyzedAt: string;
  probabilityMap: Record<number, number>;
}

