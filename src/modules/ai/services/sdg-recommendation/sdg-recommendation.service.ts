import { AppLogger } from "@/common/logger/app-logger";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { getOpenAIChatModel } from "../../config/openai.config";
import { sdgRecommendationPrompt } from "./sdg-recommendation.prompt";
import {
  sdgRecommendationOutputSchema,
  SdgRecommendationRequestDTO,
  SdgRecommendationResponse,
  SdgRecommendationResult,
} from "./sdg-recommendation.schema";

const SDG_METADATA: Record<number, { code: string; name: string }> = {
  1: { code: "SDG 1", name: "Tanpa Kemiskinan" },
  2: { code: "SDG 2", name: "Tanpa Kelaparan" },
  3: { code: "SDG 3", name: "Kehidupan Sehat & Sejahtera" },
  4: { code: "SDG 4", name: "Pendidikan Berkualitas" },
  5: { code: "SDG 5", name: "Kesetaraan Gender" },
  6: { code: "SDG 6", name: "Air Bersih & Sanitasi Layak" },
  7: { code: "SDG 7", name: "Energi Bersih & Terjangkau" },
  8: { code: "SDG 8", name: "Pekerjaan Layak & Pertumbuhan Ekonomi" },
  9: { code: "SDG 9", name: "Industri, Inovasi & Infrastruktur" },
  10: { code: "SDG 10", name: "Berkurangnya Kesenjangan" },
  11: { code: "SDG 11", name: "Kota & Permukiman Berkelanjutan" },
  12: { code: "SDG 12", name: "Konsumsi & Produksi Berkelanjutan" },
  13: { code: "SDG 13", name: "Penanganan Perubahan Iklim" },
  14: { code: "SDG 14", name: "Ekosistem Laut" },
  15: { code: "SDG 15", name: "Ekosistem Darat" },
  16: { code: "SDG 16", name: "Perdamaian, Keadilan & Kelembagaan yang Kuat" },
  17: { code: "SDG 17", name: "Kemitraan untuk Mencapai Tujuan" },
};

export class SdgRecommendationService {
  private readonly logger = new AppLogger("SdgRecommendationService");

  /**
   * Menentukan rekomendasi sasaran SDGs secara otomatis berdasarkan
   * Judul Peluang, Bidang Fokus CSR, Deskripsi Ruang Lingkup, dan Wilayah Sasaran.
   */
  async recommend(
    input: SdgRecommendationRequestDTO
  ): Promise<SdgRecommendationResponse> {
    this.logger.info(
      `Memulai rekomendasi SDGs AI untuk: "${input.title}" (${input.focusArea})`
    );

    const model = getOpenAIChatModel("gpt-4o-mini", 0.2);

    if (!model) {
      this.logger.info(
        "OpenAI model tidak aktif. Menggunakan fallback pemetaan heuristik cerdas."
      );
      return this.generateHeuristicRecommendation(input);
    }

    try {
      const locationText =
        [input.targetCity, input.targetProvince].filter(Boolean).join(", ") ||
        "Nasional / Fleksibel";

      const structuredLlm = model.withStructuredOutput(
        sdgRecommendationOutputSchema
      );

      const chain = sdgRecommendationPrompt.pipe(structuredLlm);

      const result = (await chain.invoke({
        title: input.title,
        focusArea: input.focusArea,
        targetLocation: locationText,
        description: input.description?.trim() || "Tidak ada deskripsi rinci.",
      })) as SdgRecommendationResult;

      // Pastikan SDGs hasil rekomendasi unik dan valid antara 1-17
      const validSdgs = Array.from(
        new Set(result.recommendedSdgs.filter((id) => id >= 1 && id <= 17))
      ).slice(0, 4);

      const finalSdgs = validSdgs.length > 0 ? validSdgs : [17];
      const primarySdg = finalSdgs.includes(result.primarySdg)
        ? result.primarySdg
        : finalSdgs[0];

      return {
        recommendedSdgs: finalSdgs,
        primarySdg,
        conciseRationale: result.conciseRationale,
        breakdown: result.breakdown && result.breakdown.length > 0
          ? result.breakdown.filter((b) => finalSdgs.includes(b.sdgId))
          : finalSdgs.map((id) => ({
              sdgId: id,
              sdgCode: SDG_METADATA[id]?.code || `SDG ${id}`,
              relevanceScore: id === primarySdg ? 95 : 85,
              reason: `Selaras dengan inisiatif bidang ${input.focusArea.toLowerCase()} program.`,
            })),
        source: "AI_OPENAI",
        analyzedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      this.logger.warn(
        `Gagal memanggil model AI (${err.message}). Menggunakan fallback heuristik.`
      );
      return this.generateHeuristicRecommendation(input);
    }
  }

  /**
   * Fallback deterministik cerdas berbasis bidang fokus dan deteksi kata kunci.
   */
  private generateHeuristicRecommendation(
    input: SdgRecommendationRequestDTO
  ): SdgRecommendationResponse {
    const textCorpus = `${input.title} ${input.description || ""}`.toLowerCase();
    const sdgSet = new Set<number>();

    // 1. Pemetaan dasar berdasarkan bidang fokus
    switch (input.focusArea) {
      case "LINGKUNGAN":
        sdgSet.add(13); // Iklim
        if (textCorpus.includes("laut") || textCorpus.includes("pantai") || textCorpus.includes("mangrove") || textCorpus.includes("ikan")) {
          sdgSet.add(14); // Laut
        } else if (textCorpus.includes("pohon") || textCorpus.includes("hutan") || textCorpus.includes("tani") || textCorpus.includes("tanah")) {
          sdgSet.add(15); // Darat
        } else if (textCorpus.includes("air") || textCorpus.includes("sanitasi") || textCorpus.includes("sungai")) {
          sdgSet.add(6); // Air Bersih
        } else {
          sdgSet.add(15);
        }
        break;

      case "PENDIDIKAN":
        sdgSet.add(4); // Pendidikan Berkualitas
        if (textCorpus.includes("kerja") || textCorpus.includes("vokasi") || textCorpus.includes("ekonomi") || textCorpus.includes("wirausaha")) {
          sdgSet.add(8);
        } else {
          sdgSet.add(10); // Kesenjangan
        }
        break;

      case "KESEHATAN":
        sdgSet.add(3); // Sehat Sejahtera
        if (textCorpus.includes("stunting") || textCorpus.includes("gizi") || textCorpus.includes("makanan") || textCorpus.includes("lapar")) {
          sdgSet.add(2); // Tanpa Kelaparan
        } else if (textCorpus.includes("air") || textCorpus.includes("mck") || textCorpus.includes("sanitasi")) {
          sdgSet.add(6); // Air Bersih
        } else {
          sdgSet.add(2);
        }
        break;

      case "PEMBERDAYAAN_EKONOMI":
        sdgSet.add(8); // Pekerjaan Layak & UMKM
        sdgSet.add(1); // Tanpa Kemiskinan
        if (textCorpus.includes("perempuan") || textCorpus.includes("ibu") || textCorpus.includes("wanita")) {
          sdgSet.add(5); // Kesetaraan Gender
        }
        break;

      case "INFRASTRUKTUR_SOSIAL":
        sdgSet.add(9); // Industri & Infrastruktur
        sdgSet.add(11); // Kota & Permukiman
        if (textCorpus.includes("air") || textCorpus.includes("sanitasi")) {
          sdgSet.add(6);
        }
        break;

      case "TANGGAP_BENCANA":
        sdgSet.add(11); // Permukiman Tangguh
        sdgSet.add(13); // Aksi Iklim
        sdgSet.add(1); // Perlindungan Warga Rentan
        break;

      case "LAINNYA":
      default:
        sdgSet.add(10);
        sdgSet.add(17);
        break;
    }

    // 2. Deteksi kata kunci lintas bidang
    if (textCorpus.includes("perempuan") || textCorpus.includes("gender")) {
      sdgSet.add(5);
    }
    if (textCorpus.includes("surya") || textCorpus.includes("biogas") || textCorpus.includes("energi")) {
      sdgSet.add(7);
    }
    if (textCorpus.includes("sampah") || textCorpus.includes("plastik") || textCorpus.includes("daur ulang")) {
      sdgSet.add(12);
    }

    const recommendedSdgs = Array.from(sdgSet).slice(0, 4);
    const primarySdg = recommendedSdgs[0] || 17;

    const names = recommendedSdgs
      .map((id) => `${SDG_METADATA[id]?.code} (${SDG_METADATA[id]?.name})`)
      .join(" dan ");

    const conciseRationale = `Inisiatif "${input.title}" berfokus pada pilar ${input.focusArea.toLowerCase()} yang secara langsung mendorong capaian ${names}.`;

    const breakdown = recommendedSdgs.map((id) => ({
      sdgId: id,
      sdgCode: SDG_METADATA[id]?.code || `SDG ${id}`,
      relevanceScore: id === primarySdg ? 90 : 80,
      reason: `Program secara aktif mengintervensi target sasaran ${SDG_METADATA[id]?.name}.`,
    }));

    return {
      recommendedSdgs,
      primarySdg,
      conciseRationale,
      breakdown,
      source: "HEURISTIC_FALLBACK",
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const sdgRecommendationService = new SdgRecommendationService();
