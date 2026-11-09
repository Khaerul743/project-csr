import { AppLogger } from "@/common/logger/app-logger";
import { getOpenAIChatModel } from "../../config/openai.config";
import { sentimentAnalysisPrompt } from "./sentiment-analyzer.prompt";
import {
  programSentimentAnalysisSchema,
  ProgramSentimentAnalysisResult,
  ThematicCluster,
  ReviewSentimentClassification,
} from "./sentiment-analyzer.schema";
import {
  ProgramSentimentAnalysisInput,
  ProgramSentimentAnalysisResponse,
} from "../../ai.interface";

export class SentimentAnalyzerService {
  private readonly logger = new AppLogger("SentimentAnalyzerService");

  /**
   * Menganalisis sentimen, kepuasan, dan aspirasi masyarakat dari ulasan program CSR.
   * Menggunakan LangChain OpenAI gpt-4o-mini dengan fallback heuristik matematis.
   */
  async analyzeProgramSentiment(
    input: ProgramSentimentAnalysisInput
  ): Promise<ProgramSentimentAnalysisResponse> {
    this.logger.info(
      `Memulai analisis sentimen untuk program: "${input.programTitle}" (${input.reviews.length} ulasan)`
    );

    // Jika belum ada ulasan sama sekali
    if (!input.reviews || input.reviews.length === 0) {
      return this.generateEmptySentimentResponse(input);
    }

    const model = getOpenAIChatModel("gpt-4o-mini", 0.2);

    if (!model) {
      this.logger.info("OpenAI model tidak aktif atau tidak terkonfigurasi. Menggunakan heuristik rule-based.");
      return this.generateHeuristicSentiment(input);
    }

    try {
      // 1. Format teks ulasan untuk konteks LLM
      const formattedReviews = input.reviews
        .map((r, idx) => {
          const dateStr = r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "-";
          return `[Ulasan #${idx + 1} | ID: ${r.id}]
- Penilai: ${r.reviewerName || "Warga"} (${r.reviewerRole || "Penerima Manfaat"}${r.reviewerCity ? `, ${r.reviewerCity}` : ""})
- Rating: ${r.rating} / 5 Bintang | Tanggal: ${dateStr}
- Komentar: "${r.comment.trim()}"`;
        })
        .join("\n\n");

      const sumRating = input.reviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = Number((sumRating / input.reviews.length).toFixed(1));

      // 2. Siapkan prompt & structured model
      const structuredModel = model.withStructuredOutput(programSentimentAnalysisSchema);
      const promptValue = await sentimentAnalysisPrompt.format({
        programTitle: input.programTitle,
        focusArea: input.focusArea || "Umum",
        targetCity: input.targetCity || "Indonesia",
        partnerName: input.partnerName || "Mitra Pelaksana",
        totalReviews: input.reviews.length,
        averageRating: avgRating,
        reviewsText: formattedReviews,
      });

      this.logger.info("Mengirimkan ulasan warga ke OpenAI untuk ekstraksi sentimen terstruktur...");
      const aiResult: ProgramSentimentAnalysisResult = await structuredModel.invoke(promptValue);

      this.logger.info(
        `Analisis AI sukses: NSS = ${aiResult.netSentimentScore}, Sentimen = ${aiResult.overallSentiment}`
      );

      return {
        ...aiResult,
        totalReviewsAnalyzed: input.reviews.length,
        averageRating: avgRating,
        analyzedAt: new Date().toISOString(),
        source: "AI_OPENAI",
      };
    } catch (error: any) {
      this.logger.error(`Gagal menjalankan AI sentiment analysis via OpenAI: ${error.message}. Beralih ke fallback heuristik.`);
      return this.generateHeuristicSentiment(input);
    }
  }

  /**
   * Menganalisis sentimen untuk satu ulasan individu secara real-time saat ulasan masuk dari warga.
   * Cepat, hemat token, dan memiliki fallback heuristik instan agar proses input warga tetap responsif.
   */
  async classifySingleReview(
    rating: number,
    comment: string,
    programTitle?: string
  ): Promise<"POSITIVE" | "NEUTRAL" | "NEGATIVE"> {
    const trimmed = (comment || "").trim().toLowerCase();

    // 1. Kamus kata kunci bahasa Indonesia untuk sentimen warga CSR
    const positiveKeywords = [
      "bagus", "terima kasih", "alhamdulillah", "membantu", "mantap", "puas",
      "sukses", "hebat", "bermanfaat", "senang", "berkah", "terbantu", "top", "keren"
    ];
    const negativeKeywords = [
      "kurang", "lambat", "rusak", "kecewa", "sayang", "buruk", "sulit",
      "telat", "tidak merata", "masalah", "perbaiki", "parah", "rugi"
    ];

    const hasPos = positiveKeywords.some((w) => trimmed.includes(w));
    const hasNeg = negativeKeywords.some((w) => trimmed.includes(w));

    // Aturan heuristik awal berdasarkan rating & kata kunci
    let heuristicSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
    if (rating >= 4 || (hasPos && !hasNeg)) {
      heuristicSentiment = "POSITIVE";
    } else if (rating <= 2 || (hasNeg && !hasPos)) {
      heuristicSentiment = "NEGATIVE";
    }

    const model = getOpenAIChatModel("gpt-4o-mini", 0);
    // Jika model tidak aktif atau komentar sangat pendek, gunakan heuristik instan
    if (!model || trimmed.length < 5) {
      return heuristicSentiment;
    }

    try {
      // Panggil OpenAI dengan timeout maksimal 3 detik agar respons warga tidak tertahan
      const classificationPromise = model.invoke([
        {
          role: "system",
          content:
            "Kamu adalah analis sentimen evaluasi program CSR. Klasifikasikan ulasan warga hanya dengan salah satu kata ini: POSITIVE, NEUTRAL, atau NEGATIVE. Balas HANYA dengan kata tersebut tanpa tanda baca atau teks lain.",
        },
        {
          role: "user",
          content: `Program: ${programTitle || "Program CSR"}\nRating: ${rating}/5 Bintang\nKomentar: "${comment}"\nKlasifikasi:`,
        },
      ]);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout analisis real-time")), 3000)
      );

      const response: any = await Promise.race([classificationPromise, timeoutPromise]);
      const resultText = (typeof response?.content === "string" ? response.content : "")
        .trim()
        .toUpperCase();

      if (resultText.includes("POSITIVE")) return "POSITIVE";
      if (resultText.includes("NEGATIVE")) return "NEGATIVE";
      if (resultText.includes("NEUTRAL")) return "NEUTRAL";

      return heuristicSentiment;
    } catch (err: any) {
      this.logger.warn(`Klasifikasi sentimen real-time menggunakan heuristik fallback: ${err.message}`);
      return heuristicSentiment;
    }
  }

  /**
   * Menghasilkan respon standar saat belum ada ulasan warga sama sekali.
   */
  private generateEmptySentimentResponse(
    input: ProgramSentimentAnalysisInput
  ): ProgramSentimentAnalysisResponse {
    return {
      overallSentiment: "NEUTRAL",
      netSentimentScore: 0,
      positivePercentage: 0,
      neutralPercentage: 0,
      criticalPercentage: 0,
      totalReviewsAnalyzed: 0,
      averageRating: 0,
      executiveSummary: `Belum ada ulasan atau survei masyarakat yang terekam untuk program "${input.programTitle}". Silakan bagikan QR Code survei lapangan kepada warga penerima manfaat untuk mulai mengumpulkan data sentimen.`,
      highlights: ["Belum ada data ulasan warga yang masuk."],
      concerns: ["Belum ada keluhan atau masukan warga."],
      recommendations: [
        "Cetak banner atau selebaran QR Code survei lapangan untuk ditempatkan di lokasi kegiatan.",
        "Minta relawan mitra pelaksana mengajak masyarakat mengisi kuesioner singkat usai penyaluran bantuan.",
      ],
      themes: [],
      classifiedReviews: [],
      analyzedAt: new Date().toISOString(),
      source: "HEURISTIC_FALLBACK",
    };
  }

  /**
   * Fallback rule-based analysis berbasis rating bintang dan kamus kata kunci bahasa Indonesia.
   */
  private generateHeuristicSentiment(
    input: ProgramSentimentAnalysisInput
  ): ProgramSentimentAnalysisResponse {
    const reviews = input.reviews;
    const total = reviews.length;

    let positiveCount = 0;
    let neutralCount = 0;
    let criticalCount = 0;
    let sumRating = 0;

    const positiveKeywords = ["bagus", "terima kasih", "alhamdulillah", "membantu", "mantap", "puas", "sukses", "hebat", "bermanfaat", "senang", "berkah"];
    const negativeKeywords = ["kurang", "lambat", "rusak", "kecewa", "sayang", "buruk", "sulit", "telat", "tidak merata", "masalah", "perbaiki"];

    const classifiedReviews: ReviewSentimentClassification[] = [];

    reviews.forEach((r) => {
      sumRating += r.rating;
      const text = r.comment.toLowerCase();

      let isPosWord = positiveKeywords.some((w) => text.includes(w));
      let isNegWord = negativeKeywords.some((w) => text.includes(w));

      let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
      let confidence = 0.85;

      if (r.rating >= 4 || (isPosWord && !isNegWord)) {
        sentiment = "POSITIVE";
        positiveCount += 1;
      } else if (r.rating <= 2 || (isNegWord && !isPosWord)) {
        sentiment = "NEGATIVE";
        criticalCount += 1;
      } else {
        sentiment = "NEUTRAL";
        neutralCount += 1;
      }

      classifiedReviews.push({
        reviewId: r.id,
        sentiment,
        confidenceScore: confidence,
        reasoning: `Klasifikasi berbasis rating ${r.rating} bintang dan analisis kata kunci.`,
      });
    });

    const positivePercentage = Math.round((positiveCount / total) * 100);
    const criticalPercentage = Math.round((criticalCount / total) * 100);
    const neutralPercentage = Math.max(0, 100 - positivePercentage - criticalPercentage);
    const netSentimentScore = positivePercentage - criticalPercentage;
    const averageRating = Number((sumRating / total).toFixed(1));

    let overallSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
    if (netSentimentScore >= 25) overallSentiment = "POSITIVE";
    else if (netSentimentScore <= -25) overallSentiment = "NEGATIVE";

    // Kluster tema heuristik
    const themes: ThematicCluster[] = [
      {
        tag: "ManfaatLangsung",
        sentiment: positivePercentage >= 60 ? "POSITIVE" : "NEUTRAL",
        mentionsCount: Math.max(1, Math.round(total * 0.7)),
        description: "Apresiasi warga terkait dampak langsung sarana atau bantuan yang diterima komunitas.",
      },
      {
        tag: "KetepatanSasaran",
        sentiment: criticalPercentage > 20 ? "NEGATIVE" : "POSITIVE",
        mentionsCount: Math.max(1, Math.round(total * 0.4)),
        description: "Catatan warga mengenai distribusi penerima manfaat dan sosialisasi di tingkat RT/RW.",
      },
    ];

    const highlights: string[] = [
      `Sebanyak ${positivePercentage}% warga menyampaikan respon positif dan mengapresiasi kebermanfaatan kegiatan.`,
      `Rata-rata rating kepuasan mencapai ${averageRating} dari 5.0 bintang.`,
      `Masyarakat merasa inisiatif CSR di bidang ${input.focusArea || "sosial"} ini relevan dengan kebutuhan desa.`,
    ];

    const concerns: string[] = [];
    if (criticalPercentage > 0) {
      concerns.push(`Terdapat ${criticalPercentage}% warga yang memberikan masukan perbaikan atau keluhan teknis.`);
      concerns.push("Perlunya koordinasi lapangan yang lebih intensif antara perwakilan mitra dan tokoh warga.");
    } else {
      concerns.push("Belum teridentifikasi keluhan operasional yang signifikan dari kuesioner yang masuk.");
    }

    const recommendations: string[] = [
      "Pertahankan komunikasi berkala dan sosialisasi sebelum eksekusi tahapan program berikutnya.",
      "Lakukan verifikasi berkala terhadap saran perbaikan warga untuk memastikan sarana tetap terpelihara.",
      "Tingkatkan partisipasi warga lain dengan mendistribusikan link kuesioner ke grup komunikasi komunitas.",
    ];

    const executiveSummary = `Berdasarkan analisis terhadap ${total} ulasan masyarakat untuk program "${input.programTitle}", sentimen keseluruhan berada pada kategori ${overallSentiment} dengan Net Sentiment Score sebesar ${netSentimentScore >= 0 ? "+" : ""}${netSentimentScore}. Mayoritas warga (${positivePercentage}%) memberikan apresiasi tinggi terhadap manfaat yang dirasakan secara langsung di ${input.targetCity || "lokasi kegiatan"}. Evaluasi berkala direkomendasikan guna menindaklanjuti masukan konstruktif warga demi keberlanjutan program jangka panjang.`;

    return {
      overallSentiment,
      netSentimentScore,
      positivePercentage,
      neutralPercentage,
      criticalPercentage,
      totalReviewsAnalyzed: total,
      averageRating,
      executiveSummary,
      highlights,
      concerns,
      recommendations,
      themes,
      classifiedReviews,
      analyzedAt: new Date().toISOString(),
      source: "HEURISTIC_FALLBACK",
    };
  }
}

export const sentimentAnalyzerService = new SentimentAnalyzerService();

