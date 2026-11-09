import { ReviewRepository } from "./review.repository";
import { ProgramRepository } from "../programs/program.repository";
import {
  CreateReviewDTO,
  ProgramReviewResponse,
  CompanyBeneficiarySentimentOverviewResponse,
  ProgramSentimentScorecardItem,
  EnrichedBeneficiaryReviewItem,
  SectorSentimentItem,
} from "./review.interface";
import { ProgramReview } from "@/db/schema/program-reviews";
import {
  NotFoundError,
  BadRequestError,
  ForBiddenError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { sentimentAnalyzerService } from "../ai/services/sentiment-analysis";
import { ProgramSentimentAnalysisResponse } from "../ai/ai.interface";

export class ReviewService {
  private readonly logger = new AppLogger("ReviewService");

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly programRepository: ProgramRepository
  ) {}

  async getProgramReviewsWithStats(programId: string): Promise<ProgramReviewResponse> {
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }

    const [stats, reviews] = await Promise.all([
      this.reviewRepository.getStatsByProgramId(programId),
      this.reviewRepository.findByProgramId(programId),
    ]);

    return {
      program: {
        id: program.id,
        title: program.title,
        description: program.description,
        focusArea: program.focusArea,
        targetCity: program.targetCity,
        targetProvince: program.targetProvince,
        companyName: program.companyName ?? null,
        companyLogo: program.companyLogo ?? null,
        partnerName: program.partnerName ?? null,
        partnerLogo: program.partnerLogo ?? null,
        status: program.status,
        sentimentAnalysis: program.sentimentAnalysis ?? null,
        sentimentAnalyzedAt: program.sentimentAnalyzedAt ?? null,
      },
      stats,
      reviews,
    };
  }

  async createReview(
    programId: string,
    input: CreateReviewDTO,
    clientMeta: { ipAddress?: string; userAgent?: string }
  ): Promise<ProgramReview> {
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }

    // Program status guard: only IN_PROGRESS or COMPLETED programs can receive public reviews
    if (program.status === "PLANNED") {
      throw new BadRequestError(
        "Program ini masih dalam tahap persiapan/perencanaan. Ulasan dan survei kepuasan akan dibuka saat program mulai berjalan di lapangan."
      );
    }

    if (program.status === "CANCELLED") {
      throw new BadRequestError("Program ini berstatus dibatalkan dan tidak menerima ulasan.");
    }

    // Anti-spam rate limiting by IP (2 minutes window)
    if (clientMeta.ipAddress && clientMeta.ipAddress !== "unknown") {
      const recent = await this.reviewRepository.findRecentByIp(
        programId,
        clientMeta.ipAddress,
        2
      );
      if (recent) {
        throw new BadRequestError(
          "Anda baru saja mengirimkan ulasan untuk program ini. Mohon tunggu beberapa menit sebelum mengirimkan ulasan lainnya."
        );
      }
    }

    // 1. Analisis sentimen secara real-time saat ulasan masuk
    const sentiment = await sentimentAnalyzerService.classifySingleReview(
      input.rating,
      input.comment,
      program.title
    );

    const createdReview = await this.reviewRepository.create({
      programId,
      reviewerName: input.reviewerName.trim(),
      reviewerRole: input.reviewerRole.trim(),
      reviewerCity: input.reviewerCity?.trim() || null,
      rating: input.rating,
      comment: input.comment.trim(),
      sentiment,
      photoUrl: input.photoUrl?.trim() || null,
      ipAddress: clientMeta.ipAddress || null,
      userAgent: clientMeta.userAgent ? clientMeta.userAgent.slice(0, 255) : null,
    });

    // 2. Pemutakhiran otomatis ringkasan sentimen program di latar belakang (non-blocking)
    this.refreshProgramSentimentInBackground(programId).catch((err) => {
      this.logger.warn(`Latar belakang pemutakhiran sentimen program: ${err.message}`);
    });

    return createdReview;
  }

  /**
   * Memutakhirkan sintesis sentimen eksekutif program secara otomatis di background (non-blocking)
   */
  async refreshProgramSentimentInBackground(programId: string): Promise<void> {
    try {
      const program = await this.programRepository.findById(programId);
      if (!program) return;

      const reviews = await this.reviewRepository.findByProgramId(programId);
      if (reviews.length === 0) return;

      const analysis = await sentimentAnalyzerService.analyzeProgramSentiment({
        programId: program.id,
        programTitle: program.title,
        focusArea: program.focusArea,
        targetCity: program.targetCity || undefined,
        partnerName: undefined,
        reviews: reviews.map((r) => ({
          id: r.id,
          reviewerName: r.reviewerName,
          reviewerRole: r.reviewerRole,
          reviewerCity: r.reviewerCity,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
      });

      await this.reviewRepository.saveProgramSentimentAnalysis(
        programId,
        JSON.stringify(analysis)
      );
    } catch (err: any) {
      this.logger.warn(`Gagal refresh sentimen background untuk program ${programId}: ${err.message}`);
    }
  }

  /**
   * Menjalankan analisis sentimen AI pada ulasan masyarakat untuk satu program spesifik
   * dan menyimpannya secara permanen ke database MySQL.
   */
  async analyzeProgramSentiment(
    programId: string,
    authUser: { sub: string; companyId?: string | null; role: string }
  ): Promise<ProgramSentimentAnalysisResponse> {
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }

    if (authUser.companyId && program.companyId !== authUser.companyId) {
      throw new ForBiddenError("Anda tidak memiliki hak akses ke data program ini.");
    }

    const reviews = await this.reviewRepository.findByProgramId(programId);

    this.logger.info(`Menjalankan AI sentiment analysis untuk program ${programId} (${reviews.length} ulasan)`);

    const analysis = await sentimentAnalyzerService.analyzeProgramSentiment({
      programId: program.id,
      programTitle: program.title,
      focusArea: program.focusArea,
      targetCity: program.targetCity,
      partnerName: program.partnerName,
      reviews: reviews.map((r) => ({
        id: r.id,
        reviewerName: r.reviewerName,
        reviewerRole: r.reviewerRole,
        reviewerCity: r.reviewerCity,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    });

    // 1. Simpan hasil analisis komprehensif ke tabel programs
    await this.reviewRepository.saveProgramSentimentAnalysis(
      programId,
      JSON.stringify(analysis)
    );

    // 2. Perbarui kolom sentiment individual pada tabel program_reviews
    for (const item of analysis.classifiedReviews) {
      await this.reviewRepository.updateReviewSentiment(item.reviewId, item.sentiment);
    }

    this.logger.info(`Analisis sentimen berhasil disimpan ke database untuk program ${programId}`);
    return analysis;
  }

  /**
   * Mengambil ringkasan intelijen sentimen warga untuk seluruh program perusahaan (Company-wide Overview)
   */
  async getCompanyBeneficiarySentimentOverview(
    companyId: string | null
  ): Promise<CompanyBeneficiarySentimentOverviewResponse> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi perusahaan.");
    }

    const { companyPrograms, reviews } =
      await this.reviewRepository.getCompanyProgramsAndReviews(companyId);

    const totalReviews = reviews.length;
    let sumRating = 0;
    let positiveCount = 0;
    let neutralCount = 0;
    let criticalCount = 0;

    const ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    const programMap = new Map<string, { title: string; partnerName: string | null; targetCity: string | null }>();
    for (const cp of companyPrograms) {
      programMap.set(cp.program.id, {
        title: cp.program.title,
        partnerName: cp.partnerName || null,
        targetCity: cp.program.targetCity || null,
      });
    }

    const enrichedReviews: EnrichedBeneficiaryReviewItem[] = [];

    reviews.forEach((r) => {
      sumRating += r.rating;
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;

      const progInfo = programMap.get(r.programId);

      // Sentimen dari kolom database, atau fallback dari rating bintang
      let s = r.sentiment;
      if (!s) {
        if (r.rating >= 4) s = "POSITIVE";
        else if (r.rating <= 2) s = "NEGATIVE";
        else s = "NEUTRAL";
      }

      if (s === "POSITIVE") positiveCount += 1;
      else if (s === "NEGATIVE") criticalCount += 1;
      else neutralCount += 1;

      enrichedReviews.push({
        ...r,
        sentiment: s,
        programTitle: progInfo?.title || "Program CSR",
        partnerName: progInfo?.partnerName || null,
        targetCity: progInfo?.targetCity || null,
      });
    });

    const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;
    const positivePercentage = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
    const criticalPercentage = totalReviews > 0 ? Math.round((criticalCount / totalReviews) * 100) : 0;
    const neutralPercentage = totalReviews > 0 ? Math.max(0, 100 - positivePercentage - criticalPercentage) : 0;
    const netSentimentScore = positivePercentage - criticalPercentage;

    let overallSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
    if (netSentimentScore >= 25) overallSentiment = "POSITIVE";
    else if (netSentimentScore <= -25) overallSentiment = "NEGATIVE";

    let analyzedProgramsCount = 0;
    const programScorecards: ProgramSentimentScorecardItem[] = [];
    const allHighlights: string[] = [];
    const allConcerns: string[] = [];
    const allRecommendations: string[] = [];

    for (const cp of companyPrograms) {
      const p = cp.program;
      const progReviews = reviews.filter((r) => r.programId === p.id);
      const progTotalReviews = progReviews.length;
      const progAvgRating =
        progTotalReviews > 0
          ? Number((progReviews.reduce((sum, r) => sum + r.rating, 0) / progTotalReviews).toFixed(1))
          : 0;

      let storedAnalysis: any = null;
      if (p.sentimentAnalysis) {
        try {
          storedAnalysis = JSON.parse(p.sentimentAnalysis);
          analyzedProgramsCount += 1;
          if (Array.isArray(storedAnalysis.highlights)) allHighlights.push(...storedAnalysis.highlights);
          if (Array.isArray(storedAnalysis.concerns)) allConcerns.push(...storedAnalysis.concerns);
          if (Array.isArray(storedAnalysis.recommendations)) allRecommendations.push(...storedAnalysis.recommendations);
        } catch {
          storedAnalysis = null;
        }
      }

      const progNss = storedAnalysis
        ? storedAnalysis.netSentimentScore
        : progTotalReviews > 0
        ? Math.round(
            ((progReviews.filter((r) => r.rating >= 4).length -
              progReviews.filter((r) => r.rating <= 2).length) /
              progTotalReviews) *
              100
          )
        : 0;

      let progOverall: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
      if (progNss >= 25) progOverall = "POSITIVE";
      else if (progNss <= -25) progOverall = "NEGATIVE";

      programScorecards.push({
        id: p.id,
        title: p.title,
        focusArea: p.focusArea,
        targetCity: p.targetCity,
        targetProvince: p.targetProvince,
        partnerName: cp.partnerName,
        status: p.status,
        totalReviews: progTotalReviews,
        averageRating: progAvgRating,
        netSentimentScore: progNss,
        overallSentiment: storedAnalysis ? storedAnalysis.overallSentiment : progOverall,
        sentimentAnalyzedAt: p.sentimentAnalyzedAt ? p.sentimentAnalyzedAt.toISOString() : null,
        highlights: storedAnalysis?.highlights || [
          `Mendapat respon kepuasan dengan rata-rata rating ${progAvgRating} / 5.0 bintang.`,
        ],
        concerns: storedAnalysis?.concerns || (progReviews.some((r) => r.rating <= 2)
          ? ["Terdapat ulasan warga bernada kritis yang membutuhkan perhatian tindak lanjut."]
          : ["Belum teridentifikasi keluhan kritis yang menonjol."]),
        recommendations: storedAnalysis?.recommendations || [
          "Jalankan analisis AI mendalam untuk mengekstrak aspirasi spesifik penerima manfaat.",
        ],
      });
    }

    programScorecards.sort((a, b) => b.totalReviews - a.totalReviews);

    // Filter duplikat agregasi
    const uniqueHighlights = Array.from(new Set(allHighlights)).slice(0, 4);
    const uniqueConcerns = Array.from(new Set(allConcerns)).slice(0, 4);
    const uniqueRecommendations = Array.from(new Set(allRecommendations)).slice(0, 4);

    if (uniqueHighlights.length === 0 && totalReviews > 0) {
      uniqueHighlights.push(`Tingkat kepuasan masyarakat positif mencapai ${positivePercentage}% dari total ${totalReviews} ulasan warga.`);
      uniqueHighlights.push(`Rata-rata rating kepuasan kumulatif berada pada angka ${averageRating} dari 5.0 bintang.`);
    }

    if (uniqueConcerns.length === 0 && totalReviews > 0) {
      if (criticalPercentage > 0) {
        uniqueConcerns.push(`Terdapat ${criticalPercentage}% ulasan warga bernada kritis yang memerlukan peninjauan operasional mitra.`);
      } else {
        uniqueConcerns.push("Tidak ada keluhan warga yang menonjol dari seluruh program yang dievaluasi.");
      }
    }

    if (uniqueRecommendations.length === 0) {
      uniqueRecommendations.push("Gunakan QR Code survei lapangan secara konsisten pada setiap kegiatan fisik program CSR.");
      uniqueRecommendations.push("Lakukan audit rutin terhadap program dengan ulasan kritis guna menjaga reputasi ESG korporat.");
    }

    // Agregasi Komparasi Sentimen per Sektor CSR
    const FOCUS_AREA_LABELS: Record<string, string> = {
      LINGKUNGAN: "Lingkungan & Alam",
      PENDIDIKAN: "Pendidikan & Literasi",
      KESEHATAN: "Kesehatan Masyarakat",
      PEMBERDAYAAN_EKONOMI: "Pemberdayaan Ekonomi / UMKM",
      INFRASTRUKTUR_SOSIAL: "Infrastruktur Sosial",
      TANGGAP_BENCANA: "Tanggap Kemanusiaan & Bencana",
      LAINNYA: "Inisiatif Lainnya",
    };

    const sectorMap = new Map<
      string,
      {
        focusArea: string;
        focusAreaLabel: string;
        programCount: number;
        totalReviews: number;
        sumRating: number;
        positiveCount: number;
        neutralCount: number;
        criticalCount: number;
      }
    >();

    // Inisialisasi semua bidang fokus dari program yang dimiliki perusahaan
    for (const cp of companyPrograms) {
      const fa = cp.program.focusArea;
      if (!sectorMap.has(fa)) {
        sectorMap.set(fa, {
          focusArea: fa,
          focusAreaLabel: FOCUS_AREA_LABELS[fa] || fa,
          programCount: 0,
          totalReviews: 0,
          sumRating: 0,
          positiveCount: 0,
          neutralCount: 0,
          criticalCount: 0,
        });
      }
      sectorMap.get(fa)!.programCount += 1;
    }

    // Akumulasi ulasan pada masing-masing sektor
    for (const r of enrichedReviews) {
      const p = companyPrograms.find((cp) => cp.program.id === r.programId)?.program;
      if (!p) continue;
      const sector = sectorMap.get(p.focusArea);
      if (sector) {
        sector.totalReviews += 1;
        sector.sumRating += r.rating;
        if (r.sentiment === "POSITIVE") sector.positiveCount += 1;
        else if (r.sentiment === "NEGATIVE") sector.criticalCount += 1;
        else sector.neutralCount += 1;
      }
    }

    const sectorComparison: SectorSentimentItem[] = Array.from(sectorMap.values()).map((s) => {
      const posPct = s.totalReviews > 0 ? Math.round((s.positiveCount / s.totalReviews) * 100) : 0;
      const critPct = s.totalReviews > 0 ? Math.round((s.criticalCount / s.totalReviews) * 100) : 0;
      const neuPct = s.totalReviews > 0 ? Math.max(0, 100 - posPct - critPct) : 0;
      const nss = posPct - critPct;
      const avg = s.totalReviews > 0 ? Number((s.sumRating / s.totalReviews).toFixed(1)) : 0;

      return {
        focusArea: s.focusArea,
        focusAreaLabel: s.focusAreaLabel,
        programCount: s.programCount,
        totalReviews: s.totalReviews,
        averageRating: avg,
        netSentimentScore: nss,
        positiveCount: s.positiveCount,
        neutralCount: s.neutralCount,
        criticalCount: s.criticalCount,
        positivePercentage: posPct,
        neutralPercentage: neuPct,
        criticalPercentage: critPct,
      };
    });

    sectorComparison.sort((a, b) => b.totalReviews - a.totalReviews || b.programCount - a.programCount);

    const executiveSummary =
      totalReviews > 0
        ? `Secara keseluruhan, sentimen masyarakat terhadap portofolio program CSR perusahaan berada pada status ${overallSentiment} dengan Net Sentiment Score sebesar ${netSentimentScore >= 0 ? "+" : ""}${netSentimentScore}. Dari ${totalReviews} ulasan penerima manfaat yang terekam di lapangan, ${positivePercentage}% menyatakan puas dan terbantu, ${neutralPercentage}% bersifat netral/informatif, serta ${criticalPercentage}% memberikan catatan masukan kritis.`
        : "Belum ada ulasan masyarakat yang terekam pada portofolio program CSR perusahaan Anda. Bagikan QR Code survei publik di lokasi pelaksanaan program untuk mulai mengumpulkan suara penerima manfaat.";

    return {
      summary: {
        totalReviews,
        averageRating,
        netSentimentScore,
        positivePercentage,
        neutralPercentage,
        criticalPercentage,
        overallSentiment,
        analyzedProgramsCount,
        totalProgramsCount: companyPrograms.length,
        ratingDistribution,
      },
      executiveSummary,
      aggregatedHighlights: uniqueHighlights,
      aggregatedConcerns: uniqueConcerns,
      aggregatedRecommendations: uniqueRecommendations,
      programs: programScorecards,
      recentReviews: enrichedReviews.slice(0, 50),
      sectorComparison,
    };
  }
}
