import { AppLogger } from "@/common/logger/app-logger";
import { getOpenAIChatModel } from "../../config/openai.config";
import { impactPredictionPrompt } from "./impact-prediction.prompt";
import {
  impactPredictionSchema,
  ImpactPredictionResult,
} from "./impact-prediction.schema";
import {
  ImpactPredictionInput,
  ImpactPredictionResponse,
} from "../../ai.interface";

export class ImpactPredictionService {
  private readonly logger = new AppLogger("ImpactPredictionService");

  /**
   * Memperkirakan potensi hasil dan dampak program berdasarkan tujuan,
   * kondisi wilayah, target penerima manfaat, anggaran final, serta indikator keberhasilan.
   */
  async predictImpact(
    input: ImpactPredictionInput
  ): Promise<ImpactPredictionResponse> {
    this.logger.info(
      `Memulai AI Impact Prediction untuk kolaborasi: "${input.proposalTitle}" (${input.focusArea}) di ${input.targetCity || "Nasional"}`
    );

    const model = getOpenAIChatModel("gpt-4o-mini", 0.2);

    if (!model) {
      this.logger.info("OpenAI model tidak aktif. Menggunakan fallback analisis deterministik.");
      return this.generateHeuristicPrediction(input);
    }

    try {
      const formatCurrency = (val: string | number | null | undefined) => {
        if (!val) return "Rp 0";
        const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.]/g, ""));
        return isNaN(num) ? String(val) : `Rp ${num.toLocaleString("id-ID")}`;
      };

      const timelineText =
        input.startDate && input.endDate
          ? `${new Date(input.startDate).toLocaleDateString("id-ID")} s.d. ${new Date(input.endDate).toLocaleDateString("id-ID")}`
          : "Jadwal Fleksibel (Dalam Penyusunan)";

      const milestonesText =
        input.milestones && input.milestones.length > 0
          ? input.milestones
              .map((m, idx) => `${idx + 1}. ${m.title}${m.targetTimeline ? ` (${m.targetTimeline})` : ""}${m.description ? `: ${m.description}` : ""}`)
              .join("\n")
          : "(Tahapan operasional akan dikonversi dari rencana kegiatan proposal)";

      const locationText = [input.targetCity, input.targetProvince].filter(Boolean).join(", ") || "Indonesia (Nasional)";

      const existingContext = `Terdapat ${input.existingProgramsCountInRegion ?? 0} program CSR tercatat di wilayah ini (${input.existingProgramsInSectorCount ?? 0} di bidang ${input.focusArea}).`;

      const promptVariables = {
        opportunityTitle: input.opportunityTitle || "Inisiatif CSR",
        focusArea: input.focusArea || "Umum",
        targetLocation: locationText,
        opportunityDescription: input.opportunityDescription || "Penyaluran program dampak sosial",
        proposalTitle: input.proposalTitle || "Usulan Program Kemitraan",
        partnerName: input.partnerName || "Mitra Pelaksana",
        finalBudget: formatCurrency(input.finalBudget),
        targetBeneficiaries: input.targetBeneficiaries || "Masyarakat Umum",
        timeline: timelineText,
        durationMonths: input.durationMonths ? `${input.durationMonths}` : "3",
        methodologySummary: `${input.methodologySummary || "-"}\n\nRencana Tahapan Milestone:\n${milestonesText}`,
        existingProgramsContext: existingContext,
      };

      const structuredModel = model.withStructuredOutput(impactPredictionSchema);
      const promptValue = await impactPredictionPrompt.format(promptVariables);

      this.logger.info("Mengirimkan parameter kesepakatan program ke OpenAI untuk prediksi dampak...");
      const aiResult: ImpactPredictionResult = await structuredModel.invoke(promptValue);

      this.logger.info(
        `Prediksi AI sukses: Skor Dampak = ${aiResult.overallImpactScore}, Level = ${aiResult.impactLevel}`
      );

      return {
        ...aiResult,
        source: "AI_OPENAI",
        predictedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`Gagal memprediksi dampak via OpenAI: ${error.message}. Beralih ke fallback heuristik.`);
      return this.generateHeuristicPrediction(input);
    }
  }

  /**
   * Fallback cerdas berbasis aturan matematis, anggaran, dan wilayah jika OpenAI API tidak tersedia.
   */
  private generateHeuristicPrediction(
    input: ImpactPredictionInput
  ): ImpactPredictionResponse {
    const budgetNum =
      typeof input.finalBudget === "number"
        ? input.finalBudget
        : Number(String(input.finalBudget).replace(/[^\d.]/g, "")) || 50000000;

    const beneficiariesStr = input.targetBeneficiaries || "100 Penerima Manfaat";
    const city = input.targetCity || "Wilayah Sasaran";
    const focus = input.focusArea || "Pemberdayaan";

    // Hitung skor estimasi dampak berbasis kelengkapan data
    let score = 82;
    if (budgetNum >= 100000000) score += 5;
    if (input.milestones && input.milestones.length >= 3) score += 5;
    if (score > 94) score = 94;

    const impactLevel = score >= 80 ? "TINGGI" : score >= 60 ? "MODERAT" : "TERBATAS";
    const impactLevelLabel =
      impactLevel === "TINGGI"
        ? "Dampak Signifikan"
        : impactLevel === "MODERAT"
        ? "Dampak Terarah"
        : "Dampak Terbatas";

    return {
      overallImpactScore: score,
      impactLevel,
      impactLevelLabel,
      executiveSummary: `Program berpotensi memberikan dampak sosial ${impactLevel.toLowerCase()} di ${city} dengan estimasi capaian langsung pada target sasaran serta rasio serapan biaya yang memadai.`,
      projectedOutputs: [
        {
          metric: "Penerima Manfaat Langsung",
          estimate: beneficiariesStr,
          unit: "Penerima",
        },
        {
          metric: "Cakupan Intervensi Lapangan",
          estimate: `100% target wilayah ${city}`,
          unit: "Wilayah",
        },
        {
          metric: "Efisiensi Pagu Dana",
          estimate: `Rp ${(budgetNum).toLocaleString("id-ID")}`,
          unit: "Total Budget",
        },
      ],
      projectedOutcomes: [
        {
          aspect: focus === "LINGKUNGAN" ? "LINGKUNGAN" : focus === "PEMBERDAYAAN_EKONOMI" ? "EKONOMI" : "SOSIAL",
          highlight: `Peningkatan kapasitas dan taraf kemandirian penerima manfaat pasca pelaksanaan kegiatan.`,
        },
        {
          aspect: "SOSIAL",
          highlight: `Terbangunnya sinergi kelembagaan lokal antara mitra penggerak dan perwakilan komunitas masyarakat di ${city}.`,
        },
      ],
      keySuccessIndicators: [
        {
          indicator: "Tingkat Partisipasi & Kehadiran Sasaran",
          target: "Minimal 85% dari total target penerima manfaat",
          verification: "Daftar absensi, form serah terima bantuan, dan dokumentasi foto",
        },
        {
          indicator: "Penyelesaian Tahapan Milestone Lapangan",
          target: "100% tahapan terselesaikan sesuai linimasa kesepakatan",
          verification: "Laporan kemajuan berkala mitra dan bukti pengeluaran",
        },
        {
          indicator: "Tingkat Kepuasan Warga Penerima Manfaat",
          target: "Rata-rata rating kepuasan minimal 4.0 / 5.0 bintang",
          verification: "Survei ulasan publik masyarakat berbasis QR Code di lokasi",
        },
      ],
      regionalRisks: [
        {
          risk: `Kendala aksesibilitas teknis dan koordinasi awal dengan perangkat lingkungan setempat di ${city}.`,
          mitigation: `Melakukan sosialisasi awal bersama tokoh warga dan menetapkan PIC lapangan dari mitra pelaksana.`,
        },
      ],
      recommendation: "READY_TO_SIGN",
      recommendationLabel: "Siap Disahkan",
      recommendationNotes: "Parameter kesepakatan rasional dan terstruktur. Disarankan menyertakan 3 indikator KPI di atas ke dalam klausul monitoring MoU.",
      source: "HEURISTIC_FALLBACK",
      predictedAt: new Date().toISOString(),
    };
  }
}

export const impactPredictionService = new ImpactPredictionService();

