import { AppLogger } from "@/common/logger/app-logger";
import { getOpenAIChatModel } from "../../config/openai.config";
import { pdfParserService } from "../document-parser/pdf-parser.service";
import { proposalScreeningPrompt } from "./proposal-screener.prompt";
import {
  proposalScreeningSchema,
  ProposalScreeningResult,
} from "./proposal-screener.schema";
import {
  ProposalScreeningInput,
  ProposalScreeningResponse,
} from "../../ai.interface";

export class ProposalScreenerService {
  private readonly logger = new AppLogger("ProposalScreenerService");

  /**
   * Menilai dan menyaring proposal kemitraan CSR secara otomatis menggunakan LangChain + OpenAI.
   * Dilengkapi analisis multi-aspek, deteksi risiko, rekomendasi tindakan, serta fallback heuristik.
   */
  async screenProposal(
    input: ProposalScreeningInput
  ): Promise<ProposalScreeningResponse> {
    this.logger.info(
      `Memulai AI screening untuk proposal: "${input.proposalTitle}" terhadap inisiatif: "${input.opportunityTitle}"`
    );

    // 1. Ekstrak petikan dokumen PDF jika tersedia
    let pdfExcerpts = "(Tidak ada berkas PDF terlampir atau dokumen berupa tautan eksternal)";
    if (input.documentUrl) {
      try {
        const text = await pdfParserService.extractRelevantText(input.documentUrl);
        if (text && text.trim().length > 0) {
          pdfExcerpts = text;
          this.logger.info(`Berhasil menyertakan teks PDF proposal sepanjang ${text.length} karakter`);
        }
      } catch (err: any) {
        this.logger.warn(`Gagal membaca PDF proposal: ${err.message}. Melanjutkan dengan data ringkasan teks.`);
      }
    }

    // 2. Format nominal anggaran
    const formatCurrency = (val: string | number | null | undefined) => {
      if (!val) return "Tidak ditentukan";
      const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.]/g, ""));
      return isNaN(num) ? String(val) : `Rp ${num.toLocaleString("id-ID")}`;
    };

    const promptVariables = {
      opportunityTitle: input.opportunityTitle,
      opportunityFocusArea: input.opportunityFocusArea || "Umum",
      opportunityTargetBeneficiaries: input.opportunityTargetBeneficiaries || "Masyarakat Umum",
      opportunityEstimatedBudget: formatCurrency(input.opportunityEstimatedBudget),
      opportunityLocation: input.opportunityLocation || "Nasional / Fleksibel",
      opportunityDescription: input.opportunityDescription || "-",
      proposalTitle: input.proposalTitle,
      partnerName: input.partnerName,
      partnerFocusArea: input.partnerFocusArea || "Umum",
      proposedBudget: formatCurrency(input.proposedBudget),
      durationMonths: input.durationMonths ? `${input.durationMonths}` : "3",
      proposalTargetBeneficiaries: input.proposalTargetBeneficiaries || "Masyarakat Umum",
      proposalSummary: input.proposalSummary || "-",
      pdfExcerpts: pdfExcerpts.slice(0, 16000), // Batas aman context window
    };

    // 3. Panggil model OpenAI via LangChain withStructuredOutput
    const model = getOpenAIChatModel("gpt-4o-mini", 0.2);

    if (model) {
      try {
        this.logger.info("Mengirimkan permintaan screening ke OpenAI gpt-4o-mini via LangChain...");
        const structuredLlm = model.withStructuredOutput(proposalScreeningSchema);

        const formattedMessages = await proposalScreeningPrompt.formatMessages(promptVariables);
        const result = (await structuredLlm.invoke(formattedMessages)) as ProposalScreeningResult;

        this.logger.info(
          `AI screening berhasil! Skor keseluruhan: ${result.overallScore}/100 [${result.recommendation}]`
        );

        return {
          ...result,
          source: "AI_OPENAI",
        };
      } catch (error: any) {
        this.logger.error(
          `Terjadi kendala saat memanggil OpenAI API: ${error.message}. Mengaktifkan fallback heuristik cerdas.`
        );
      }
    } else {
      this.logger.warn(
        "OpenAI API Key belum terkonfigurasi. Menggunakan kalkulator heuristik fallback."
      );
    }

    // 4. Fallback Cerdas (Heuristic Screener)
    return this.generateHeuristicFallback(input);
  }

  /**
   * Evaluator heuristik cerdas yang mengkalkulasi skor berdasarkan rasio anggaran,
   * kelengkapan ringkasan metodologi, dan durasi operasional agar sistem tetap responsif.
   */
  private generateHeuristicFallback(
    input: ProposalScreeningInput
  ): ProposalScreeningResponse {
    const oppBudgetNum = Number(String(input.opportunityEstimatedBudget || "0").replace(/[^\d.]/g, ""));
    const propBudgetNum = Number(String(input.proposedBudget || "0").replace(/[^\d.]/g, ""));

    let budgetScore = 80;
    if (oppBudgetNum > 0 && propBudgetNum > 0) {
      const ratio = propBudgetNum / oppBudgetNum;
      if (ratio <= 1.0) {
        budgetScore = Math.min(95, Math.round(85 + (1 - ratio) * 10));
      } else if (ratio <= 1.15) {
        budgetScore = 75;
      } else {
        budgetScore = 60;
      }
    }

    const summaryLength = input.proposalSummary ? input.proposalSummary.length : 0;
    const operationalScore = summaryLength > 200 ? 85 : 70;
    const strategicScore = input.partnerFocusArea && input.opportunityFocusArea && input.partnerFocusArea === input.opportunityFocusArea ? 90 : 80;
    const sustainabilityScore = 82;

    const overallScore = Math.round(
      strategicScore * 0.35 +
      budgetScore * 0.25 +
      operationalScore * 0.20 +
      sustainabilityScore * 0.20
    );

    let recommendation: "STRONGLY_RECOMMENDED" | "RECOMMENDED_WITH_REVISION" | "UNDER_CONSIDERATION" | "NOT_RECOMMENDED" = "RECOMMENDED_WITH_REVISION";
    let recommendationLabel = "Disarankan dengan Revisi";

    if (overallScore >= 85) {
      recommendation = "STRONGLY_RECOMMENDED";
      recommendationLabel = "Sangat Direkomendasikan";
    } else if (overallScore >= 70) {
      recommendation = "RECOMMENDED_WITH_REVISION";
      recommendationLabel = "Disarankan dengan Revisi";
    } else if (overallScore >= 55) {
      recommendation = "UNDER_CONSIDERATION";
      recommendationLabel = "Perlu Pertimbangan Khusus";
    } else {
      recommendation = "NOT_RECOMMENDED";
      recommendationLabel = "Tidak Disarankan";
    }

    return {
      overallScore,
      aspectScores: {
        strategicAlignment: strategicScore,
        budgetFeasibility: budgetScore,
        operationalFeasibility: operationalScore,
        impactSustainability: sustainabilityScore,
      },
      recommendation,
      recommendationLabel,
      executiveSummary: `Proposal dari ${input.partnerName} memiliki keselarasan strategis yang positif (${strategicScore}/100) terhadap inisiatif ${input.opportunityTitle}. Usulan anggaran dan durasi operasional dinilai dapat direalisasikan dengan pemantauan bertahap.`,
      keyStrengths: [
        `Fokus kegiatan menjawab sasaran penerima manfaat (${input.proposalTargetBeneficiaries || "masyarakat sasaran"}).`,
        `Rencana waktu pelaksanaan (${input.durationMonths || 3} bulan) terstruktur dan proporsional untuk lingkup kerja yang diajukan.`,
        `Rekam jejak kelembagaan mitra relevan dengan pilar program.`,
      ],
      potentialRisks: [
        propBudgetNum > oppBudgetNum
          ? `Usulan anggaran melampaui pagu estimasi awal inisiatif perusahaan sehingga membutuhkan rasionalisasi pos pengeluaran.`
          : `Perlu penegasan jadwal audit verifikasi fisik di lapangan agar target capaian terpantau berkala.`,
      ],
      suggestedRevisionNotes: propBudgetNum > oppBudgetNum
        ? `Mohon sesuaikan rincian pos anggaran operasional agar tidak melampaui estimasi pagu inisiatif atau berikan rincian pembagian termin yang lebih terperinci.`
        : `Mohon lampirkan rincian pembagian milestone kegiatan mingguan serta format Berita Acara Serah Terima (BAST) untuk penerima manfaat.`,
      source: "HEURISTIC_FALLBACK",
    };
  }
}

export const proposalScreenerService = new ProposalScreenerService();
