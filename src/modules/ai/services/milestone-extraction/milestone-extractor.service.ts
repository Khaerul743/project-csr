import { AppLogger } from "@/common/logger/app-logger";
import { getOpenAIChatModel } from "../../config/openai.config";
import { pdfParserService } from "../document-parser/pdf-parser.service";
import { milestoneExtractionPrompt } from "./milestone-extractor.prompt";
import {
  milestoneExtractionSchema,
  MilestoneExtractionResult,
} from "./milestone-extractor.schema";
import {
  ProposalMilestoneInput,
  MilestoneExtractionResponse,
} from "../../ai.interface";

export class MilestoneExtractorService {
  private readonly logger = new AppLogger("MilestoneExtractorService");

  /**
   * Ekstrak tahapan rencana kegiatan terstruktur dari proposal menggunakan LangChain + OpenAI.
   * Dilengkapi fallback cerdas jika API key tidak tersedia atau terjadi kendala jaringan.
   */
  async extractFromProposal(
    input: ProposalMilestoneInput
  ): Promise<MilestoneExtractionResponse> {
    this.logger.info(`Memulai ekstraksi tahapan kegiatan untuk proposal: "${input.title}"`);

    // 1. Ekstrak petikan teks dari PDF jika dokumen lokal tersedia
    let pdfExcerpts = "(Tidak ada dokumen PDF terlampir atau dokumen berupa tautan URL luar)";
    if (input.documentUrl) {
      try {
        const text = await pdfParserService.extractRelevantText(input.documentUrl);
        if (text && text.trim().length > 0) {
          pdfExcerpts = text;
          this.logger.info(`Berhasil menyertakan teks PDF sepanjang ${text.length} karakter`);
        }
      } catch (err: any) {
        this.logger.warn(`Gagal membaca PDF proposal: ${err.message}. Melanjutkan dengan summary.`);
      }
    }

    // 2. Siapkan parameter format
    const formatBudget = input.budget
      ? typeof input.budget === "number"
        ? `Rp ${input.budget.toLocaleString("id-ID")}`
        : `Rp ${Number(input.budget).toLocaleString("id-ID")}`
      : "Sesuai kesepakatan";

    const promptVariables = {
      title: input.title,
      focusArea: input.focusArea || "Umum",
      durationMonths: input.durationMonths ? `${input.durationMonths}` : "3",
      targetBeneficiaries: input.targetBeneficiaries || "Masyarakat sasaran",
      budget: formatBudget,
      summary: input.summary || "Tidak ada ringkasan teks",
      pdfExcerpts: pdfExcerpts.slice(0, 16000), // Batas aman context window
    };

    // 3. Inisialisasi model OpenAI melalui LangChain
    const model = getOpenAIChatModel("gpt-4o-mini", 0.2);

    if (model) {
      try {
        this.logger.info("Mengirimkan permintaan ke OpenAI gpt-4o-mini via LangChain withStructuredOutput...");
        const structuredLlm = model.withStructuredOutput(milestoneExtractionSchema);

        const formattedMessages = await milestoneExtractionPrompt.formatMessages(promptVariables);
        const result = (await structuredLlm.invoke(formattedMessages)) as MilestoneExtractionResult;

        this.logger.info(
          `Ekstraksi AI berhasil! Menghasilkan ${result.stages.length} tahapan kegiatan terstruktur.`
        );

        return {
          summaryRationale: result.summaryRationale,
          stages: result.stages.map((st, idx) => ({
            orderIndex: st.orderIndex || idx + 1,
            title: st.title,
            description: st.description,
            targetTimeline: st.targetTimeline,
            expectedEvidence: st.expectedEvidence,
            suggestedKpi: st.suggestedKpi,
          })),
          source: "AI_OPENAI",
        };
      } catch (error: any) {
        this.logger.error(
          `Terjadi kesalahan saat memanggil OpenAI API: ${error.message}. Mengaktifkan fallback cerdas.`
        );
      }
    } else {
      this.logger.warn(
        "Model OpenAI tidak aktif (OPENAI_API_KEY belum dipasang). Menggunakan generator heuristik fallback."
      );
    }

    // 4. Fallback Cerdas (Heuristic Extractor) jika OpenAI tidak aktif/error
    return this.generateHeuristicFallback(input);
  }

  /**
   * Fallback cerdas berbasis heuristik yang memecah proposal menjadi tahapan logis
   * agar sistem tidak pernah crash dan selalu menghasilkan preview tahapan yang relevan.
   */
  private generateHeuristicFallback(
    input: ProposalMilestoneInput
  ): MilestoneExtractionResponse {
    const duration = input.durationMonths || 3;
    const title = input.title;
    const beneficiaries = input.targetBeneficiaries || "penerima manfaat";

    const stages = [
      {
        orderIndex: 1,
        title: "Tahap 1: Sosialisasi & Koordinasi Stakeholder Lokal",
        description: `Melakukan koordinasi awal bersama aparat wilayah, pemetaan data warga sasaran (${beneficiaries}), dan pembentukan tim pelaksana di lapangan.`,
        targetTimeline: "Bulan ke-1",
        expectedEvidence: "Foto rembug warga / koordinasi, daftar hadir peserta, dan berita acara kesepakatan pelaksanaan",
        suggestedKpi: "Koordinasi tingkat desa selesai dan data sasaran tervalidasi",
      },
      {
        orderIndex: 2,
        title: `Tahap 2: Pengadaan Logistik & Pembekalan Teknis Pelaksanaan`,
        description: `Persiapan material teknis, pengadaan sarana/prasarana pendukung program ${title}, serta pelatihan dasar bagi fasilitator dan masyarakat.`,
        targetTimeline: duration > 1 ? "Bulan ke-1 - Bulan ke-2" : "Bulan ke-1",
        expectedEvidence: "Foto logistik/alat yang tiba di lokasi, dokumentasi pelatihan/pembekalan, dan tanda terima barang",
        suggestedKpi: "Seluruh kebutuhan logistik siap 100%",
      },
      {
        orderIndex: 3,
        title: `Tahap 3: Implementasi Aksi Utama di Lapangan`,
        description: `Pelaksanaan kegiatan inti dari program ${title} bersama ${beneficiaries} sesuai dengan metodologi yang telah disepakati.`,
        targetTimeline: duration >= 3 ? "Bulan ke-2 - Bulan ke-3" : "Bulan ke-2",
        expectedEvidence: "Foto aksi kegiatan di lapangan bersama masyarakat, video dokumentasi singkat, lembar monitoring harian",
        suggestedKpi: "Target penerima manfaat terjangkau minimal 80%",
      },
      {
        orderIndex: 4,
        title: "Tahap 4: Monitoring Capaian Dampak & Serah Terima Program",
        description: "Evaluasi hasil kegiatan, pengukuran indikator keberhasilan program, penyusunan laporan pertanggungjawaban akhir, dan serah terima manfaat program.",
        targetTimeline: `Bulan ke-${duration}`,
        expectedEvidence: "Foto serah terima program (BAST), testimoni penerima manfaat, laporan akhir dampak",
        suggestedKpi: "Laporan pelaksanaan tuntas dan diverifikasi perusahaan",
      },
    ];

    return {
      summaryRationale: `Tahapan disusun secara berurutan mencakup persiapan sosial, pengadaan teknis, implementasi lapangan, dan monitoring akhir sesuai durasi ${duration} bulan.`,
      stages,
      source: "HEURISTIC_FALLBACK",
    };
  }
}

export const milestoneExtractorService = new MilestoneExtractorService();
