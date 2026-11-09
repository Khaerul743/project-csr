import { z } from "zod";

export const thematicClusterSchema = z.object({
  tag: z.string().describe("Tag topik pendek (misal: AksesAirBersih, KualitasBibit, KetepatanWaktu, SosialisasiWarga)"),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).describe("Sentimen dominan dari topik ini"),
  mentionsCount: z.number().describe("Estimasi frekuensi penyebutan topik"),
  description: z.string().describe("Penjelasan singkat konteks aspirasi warga mengenai topik ini"),
});

export const reviewSentimentClassificationSchema = z.object({
  reviewId: z.string().describe("ID ulasan"),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).describe("Klasifikasi sentimen ulasan"),
  confidenceScore: z.number().min(0).max(1).describe("Tingkat keyakinan model antara 0 hingga 1"),
  reasoning: z.string().optional().describe("Alasan singkat klasifikasi"),
});

export const programSentimentAnalysisSchema = z.object({
  overallSentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).describe("Sentimen keseluruhan program"),
  netSentimentScore: z.number().min(-100).max(100).describe("Net Sentiment Score (% Positif dikurangi % Kritis, rentang -100 s.d +100)"),
  positivePercentage: z.number().min(0).max(100).describe("Persentase ulasan bernada positif"),
  neutralPercentage: z.number().min(0).max(100).describe("Persentase ulasan bernada netral atau informatif"),
  criticalPercentage: z.number().min(0).max(100).describe("Persentase ulasan bernada kritis atau keluhan"),
  executiveSummary: z.string().describe("Ringkasan eksekutif 2-3 paragraf mengenai suara dan sentimen masyarakat terhadap program CSR"),
  highlights: z.array(z.string()).describe("3 hingga 5 poin utama aspek program yang sangat diapresiasi oleh warga"),
  concerns: z.array(z.string()).describe("2 hingga 4 poin keluhan, kendala teknis, atau area perbaikan yang diutarakan warga"),
  recommendations: z.array(z.string()).describe("3 hingga 4 rekomendasi strategis konkret bagi perusahaan sponsor dan mitra pelaksana"),
  themes: z.array(thematicClusterSchema).describe("Daftar 3 hingga 6 kluster topik atau aspirasi kunci yang diekstrak dari komentar"),
  classifiedReviews: z.array(reviewSentimentClassificationSchema).describe("Klasifikasi sentimen spesifik untuk setiap ID ulasan yang dianalisis"),
});

export type ThematicCluster = z.infer<typeof thematicClusterSchema>;
export type ReviewSentimentClassification = z.infer<typeof reviewSentimentClassificationSchema>;
export type ProgramSentimentAnalysisResult = z.infer<typeof programSentimentAnalysisSchema>;

