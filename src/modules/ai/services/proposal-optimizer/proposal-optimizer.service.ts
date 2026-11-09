import { AppLogger } from "@/common/logger/app-logger";
import { getOpenAIChatModel } from "../../config/openai.config";
import { pdfParserService } from "../document-parser/pdf-parser.service";
import { proposalOptimizationPrompt } from "./proposal-optimizer.prompt";
import {
  proposalOptimizationSchema,
  ProposalOptimizationResult,
} from "./proposal-optimizer.schema";

export interface ProposalOptimizationInput {
  opportunityTitle: string;
  opportunityDescription?: string | null;
  opportunityFocusArea?: string | null;
  opportunityEstimatedBudget?: string | number | null;
  opportunityLocation?: string | null;
  opportunityTargetBeneficiaries?: string | null;
  partnerName: string;
  partnerFocusArea?: string | null;
  partnerCity?: string | null;
  proposalTitle: string;
  proposalSummary: string;
  proposedBudget: string | number;
  durationMonths?: number | null;
  proposalTargetBeneficiaries?: string | null;
  companyFeedback?: string | null;
  documentUrl?: string | null;
}

export interface ProposalOptimizationResponse extends ProposalOptimizationResult {
  source: "AI_OPENAI" | "HEURISTIC_FALLBACK";
  optimizedAt: string;
}

export class ProposalOptimizerService {
  private readonly logger = new AppLogger("ProposalOptimizerService");

  /**
   * Menganalisis draf proposal mitra dan menghasilkan rekomendasi penyempurnaan adaptif.
   * Mendukung mode pengajuan proposal baru maupun mode perbaikan proposal berdasarkan catatan evaluasi perusahaan.
   */
  async optimizeProposal(
    input: ProposalOptimizationInput
  ): Promise<ProposalOptimizationResponse> {
    this.logger.info(
      `Memulai optimasi proposal: "${input.proposalTitle}" terhadap inisiatif: "${input.opportunityTitle}" [Mode Feedback: ${
        input.companyFeedback ? "ADA CATATAN PERUSAHAAN" : "PROPOSAL BARU"
      }]`
    );

    // 1. Ekstrak teks lampiran PDF jika tersedia
    let pdfExcerpts = "(Tidak ada dokumen PDF terlampir atau berkas berupa tautan eksternal)";
    if (input.documentUrl) {
      try {
        const text = await pdfParserService.extractRelevantText(input.documentUrl);
        if (text && text.trim().length > 0) {
          pdfExcerpts = text.slice(0, 16000);
          this.logger.info(`Berhasil mengekstrak teks PDF proposal sepanjang ${text.length} karakter`);
        }
      } catch (err: any) {
        this.logger.warn(`Gagal membaca PDF proposal: ${err.message}. Melanjutkan dengan draf formulir.`);
      }
    }

    // 2. Format nominal mata uang
    const formatCurrency = (val: string | number | null | undefined) => {
      if (!val) return "Tidak ditentukan";
      const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.]/g, ""));
      return isNaN(num) ? String(val) : `Rp ${num.toLocaleString("id-ID")}`;
    };

    const companyFeedbackSection = input.companyFeedback?.trim()
      ? `CATATAN DARI PERUSAHAAN:\n"${input.companyFeedback.trim()}"`
      : "(Tidak ada catatan evaluasi dari perusahaan, ini adalah pengajuan proposal baru / pre-check mandiri mitra).";

    const promptVariables = {
      opportunityTitle: input.opportunityTitle,
      opportunityFocusArea: input.opportunityFocusArea || "Umum",
      opportunityTargetBeneficiaries: input.opportunityTargetBeneficiaries || "Masyarakat Umum",
      opportunityEstimatedBudget: formatCurrency(input.opportunityEstimatedBudget),
      opportunityLocation: input.opportunityLocation || "Nasional / Fleksibel",
      opportunityDescription: input.opportunityDescription || "Tidak ada deskripsi rinci dari perusahaan.",
      partnerName: input.partnerName,
      partnerFocusArea: input.partnerFocusArea || "Umum",
      partnerCity: input.partnerCity || "Indonesia",
      companyFeedbackSection,
      proposalTitle: input.proposalTitle,
      proposedBudget: formatCurrency(input.proposedBudget),
      durationMonths: input.durationMonths ? `${input.durationMonths}` : "3",
      proposalTargetBeneficiaries: input.proposalTargetBeneficiaries || "Masyarakat Umum",
      proposalSummary: input.proposalSummary || "-",
      pdfExcerpts,
    };

    // 3. Panggil model OpenAI via LangChain withStructuredOutput
    const model = getOpenAIChatModel("gpt-4o-mini", 0.2);

    if (model) {
      try {
        this.logger.info("Mengirimkan permintaan optimasi proposal ke OpenAI gpt-4o-mini via LangChain...");
        const structuredLlm = model.withStructuredOutput(proposalOptimizationSchema);
        const formattedMessages = await proposalOptimizationPrompt.formatMessages(promptVariables);
        const result = (await structuredLlm.invoke(formattedMessages)) as ProposalOptimizationResult;

        this.logger.info(
          `AI optimization berhasil! Skor Kesiapan: ${result.readinessScore}/100 [Level: ${result.alignmentLevel}]`
        );

        return {
          ...result,
          source: "AI_OPENAI",
          optimizedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        this.logger.error(
          `Kendala OpenAI API saat optimasi proposal: ${error.message}. Mengaktifkan fallback heuristik cerdas.`
        );
      }
    } else {
      this.logger.warn("OpenAI API Key belum terkonfigurasi. Menggunakan optimizer heuristik cerdas.");
    }

    // 4. Fallback Cerdas (Heuristic Optimizer)
    return this.generateHeuristicFallback(input);
  }

  /**
   * Logika fallback heuristik cerdas berbasis kalkulasi rasio anggaran dan analisis semantik kata kunci.
   */
  private generateHeuristicFallback(
    input: ProposalOptimizationInput
  ): ProposalOptimizationResponse {
    const parseBudget = (val: any) => {
      if (!val) return 0;
      const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^\d.]/g, ""));
      return isNaN(num) ? 0 : num;
    };

    const estBudget = parseBudget(input.opportunityEstimatedBudget);
    const propBudget = parseBudget(input.proposedBudget);
    const summaryLength = (input.proposalSummary || "").trim().length;
    const hasFeedback = Boolean(input.companyFeedback && input.companyFeedback.trim().length > 3);

    let readinessScore = 75;
    let alignmentLevel: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";

    // 1. Evaluasi Anggaran
    let budgetAdvice = "Nominal usulan anggaran berada pada rentang yang wajar terhadap lingkup program.";
    if (estBudget > 0 && propBudget > 0) {
      const budgetRatio = propBudget / estBudget;
      if (budgetRatio > 1.25) {
        readinessScore -= 20;
        alignmentLevel = "LOW";
        budgetAdvice = `Perhatian: Anggaran yang diajukan (Rp ${propBudget.toLocaleString("id-ID")}) melebihi estimasi pagu perusahaan (Rp ${estBudget.toLocaleString("id-ID")}) sekitar ${Math.round((budgetRatio - 1) * 100)}%. Disarankan melakukan efisiensi pos biaya operasional.`;
      } else if (budgetRatio <= 1.0) {
        readinessScore += 10;
        alignmentLevel = "HIGH";
        budgetAdvice = `Sangat Baik: Anggaran yang diajukan (Rp ${propBudget.toLocaleString("id-ID")}) berada di dalam batas pagu perusahaan (Rp ${estBudget.toLocaleString("id-ID")}).`;
      }
    }

    // 2. Evaluasi Kedalaman Ringkasan
    if (summaryLength < 100) {
      readinessScore -= 15;
    } else if (summaryLength > 300) {
      readinessScore += 5;
    }

    readinessScore = Math.max(30, Math.min(95, readinessScore));

    // 3. Analisis Feedback Perusahaan jika ada
    let feedbackAnalysisResult: any = undefined;
    if (hasFeedback) {
      const fbText = input.companyFeedback!.toLowerCase();
      const concerns: string[] = [];
      const actions: string[] = [];

      if (fbText.includes("anggaran") || fbText.includes("biaya") || fbText.includes("rab") || fbText.includes("mahal")) {
        concerns.push("Perusahaan menyoroti efisiensi anggaran dan transparansi rincian Rencana Anggaran Biaya (RAB).");
        actions.push("Lakukan penyesuaian pos biaya operasional atau lampirkan justifikasi harga satuan yang lebih terperinci.");
      }
      if (fbText.includes("jadwal") || fbText.includes("timeline") || fbText.includes("durasi") || fbText.includes("waktu")) {
        concerns.push("Terdapat keraguan terkait jadwal pelaksanaan dan milestones kegiatan di lapangan.");
        actions.push("Uraikan linimasa mingguan atau bulanan secara lebih terukur dengan indikator keberhasilan tiap fase.");
      }
      if (fbText.includes("sasaran") || fbText.includes("penerima") || fbText.includes("warga") || fbText.includes("target")) {
        concerns.push("Kriteria atau jumlah target penerima manfaat dinilai kurang spesifik.");
        actions.push("Jelaskan kriteria inklusi penerima manfaat dan mekanisme verifikasi data warga di lokasi sasaran.");
      }
      if (concerns.length === 0) {
        concerns.push("Perusahaan meminta penyelarasan ulang beberapa poin teknis pada metodologi program.");
        actions.push("Perbarui bagian narasi ringkasan metodologi untuk menjawab catatan reviewer perusahaan secara tegas.");
      }

      feedbackAnalysisResult = {
        keyConcerns: concerns,
        suggestedActions: actions,
      };
    }

    // 4. Area Perbaikan
    const improvementAreas: any[] = [
      {
        aspect: "NARASI_METODOLOGI",
        currentObservation: summaryLength < 150
          ? "Penjelasan alur kerja dan metodologi lapangan masih terlalu singkat sehingga kurang meyakinkan evaluator."
          : "Metodologi telah memuat dasar rencana, namun perlu penekanan lebih kuat pada tahapan keberlanjutan pasca-program.",
        recommendation: "Uraikan 3 pilar: (1) Sosialisasi & Assesmen, (2) Pelaksanaan Inti, dan (3) Monitoring & Serah Terima Hasil ke Komunitas.",
      },
      {
        aspect: "ANGGARAN_BIAYA",
        currentObservation: budgetAdvice,
        recommendation: "Pastikan persentase biaya langsung program (direct impact) mencapai minimal 70% dari total anggaran yang diajukan.",
      },
      {
        aspect: "TARGET_PENERIMA",
        currentObservation: input.proposalTargetBeneficiaries
          ? `Target saat ini: "${input.proposalTargetBeneficiaries}".`
          : "Target penerima manfaat belum dirinci secara spesifik.",
        recommendation: "Sertakan angka kuantitatif estimasi warga terdampak beserta profil sasaran (misal: petani kecil, keluarga pra-sejahtera, atau pelajar).",
      },
    ];

    // 5. Draf Teks Ringkasan Metodologi yang Disempurnakan
    const suggestedSummaryDraft = `Program "${input.proposalTitle}" dirancang untuk menjawab tantangan strategis di wilayah ${input.opportunityLocation || "sasaran"} melalui pendekatan partisipatif bersama komunitas lokal. 

Metodologi Pelaksanaan:
1. Tahap Persiapan: Sosialisasi program, pendataan dan verifikasi penerima manfaat (${input.proposalTargetBeneficiaries || "masyarakat lokal"}), serta koordinasi dengan pemangku kepentingan setempat.
2. Tahap Eksekusi: Penyaluran intervensi program secara terstruktur sesuai standar mutu dan tata kelola transparansi kemitraan.
3. Tahap Monitoring & Keberlanjutan: Evaluasi kepuasan penerima manfaat, audit berkala, dan pembentukan mekanisme pemeliharaan mandiri oleh masyarakat.

Dengan alokasi anggaran yang efisien sebesar Rp ${propBudget > 0 ? propBudget.toLocaleString("id-ID") : "yang diajukan"} dan durasi ${input.durationMonths || 3} bulan, inisiatif ini dirancang untuk memberikan dampak sosial terukur yang selaras dengan komitmen ESG perusahaan sponsor.`;

    const preSubmissionChecklist: any[] = [
      {
        item: "Kesesuaian Anggaran dengan Plafon Inisiatif",
        status: propBudget <= estBudget && estBudget > 0 ? "READY" : "ACTION_REQUIRED",
        notes: propBudget <= estBudget && estBudget > 0 ? "Anggaran berada di bawah atau sama dengan plafon." : "Periksa kembali agar anggaran tidak melampaui plafon.",
      },
      {
        item: "Ketajaman Narasi Solusi & Metodologi",
        status: summaryLength >= 150 ? "READY" : "ACTION_REQUIRED",
        notes: summaryLength >= 150 ? "Penjelasan teknis sudah cukup komprehensif." : "Disarankan memperkaya penjelasan ringkasan teknis.",
      },
      {
        item: "Penyelesaian Seluruh Catatan Evaluasi Perusahaan",
        status: hasFeedback ? "ACTION_REQUIRED" : "READY",
        notes: hasFeedback ? "Pastikan setiap poin keberatan perusahaan telah dijawab di proposal revisi." : "Tidak ada catatan khusus, siap diajukan.",
      },
      {
        item: "Kelengkapan Dokumen Pendukung & Legalitas",
        status: input.documentUrl ? "READY" : "RECOMMENDED",
        notes: input.documentUrl ? "Dokumen proposal telah terlampir." : "Melampirkan proposal PDF resmi akan meningkatkan kredibilitas.",
      },
    ];

    const overallAssessment = hasFeedback
      ? `Proposal memiliki potensi baik namun memerlukan penyesuaian terfokus pada poin catatan perusahaan. Menindaklanjuti feedback reviewer secara eksplisit akan meningkatkan peluang persetujuan revisi ini secara signifikan.`
      : `Draf proposal menunjukkan keselarasan yang baik dengan inisiatif perusahaan. Menyempurnakan rincian metodologi dan target dampak kuantitatif akan memaksimalkan daya saing proposal di hadapan evaluator.`;

    return {
      readinessScore,
      alignmentLevel,
      overallAssessment,
      feedbackAnalysis: feedbackAnalysisResult,
      strengths: [
        "Inisiatif relevan dengan pilar fokus yang dicari perusahaan sponsor.",
        "Komitmen durasi pelaksanaan realistis terhadap ruang lingkup kegiatan lapangan.",
        "Lembaga memiliki identitas dan rekam jejak pada sektor inisiatif terkait.",
      ],
      improvementAreas,
      suggestedSummaryDraft,
      suggestedBudgetAdvice: budgetAdvice,
      preSubmissionChecklist,
      source: "HEURISTIC_FALLBACK",
      optimizedAt: new Date().toISOString(),
    };
  }
}

export const proposalOptimizerService = new ProposalOptimizerService();

