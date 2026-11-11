import { AppLogger } from "@/common/logger/app-logger";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { getOpenAIChatModel } from "../../config/openai.config";
import { needPrioritizationPrompt } from "./need-prioritization.prompt";
import {
  NeedPrioritizationResult,
  needPrioritizationSchema,
  OverlapRiskLevel,
} from "./need-prioritization.schema";
import {
  NeedPrioritizationInput,
  NeedPrioritizationResponse,
  TerritoryDataSnapshot,
} from "../../ai.interface";

const FOCUS_AREA_LABELS: Record<CsrFocusArea, string> = {
  LINGKUNGAN: "Lingkungan & Energi Hijau",
  PENDIDIKAN: "Pendidikan & Vokasi",
  KESEHATAN: "Kesehatan & Sanitasi",
  PEMBERDAYAAN_EKONOMI: "Pemberdayaan Ekonomi & UMKM",
  INFRASTRUKTUR_SOSIAL: "Infrastruktur & Akses Publik",
  TANGGAP_BENCANA: "Tanggap & Mitigasi Bencana",
  LAINNYA: "Sosial Kemasyarakatan Lainnya",
};

const DEFAULT_SDGS_BY_FOCUS: Record<CsrFocusArea, number[]> = {
  LINGKUNGAN: [13, 14, 15, 6],
  PENDIDIKAN: [4, 8, 10],
  KESEHATAN: [3, 6, 2],
  PEMBERDAYAAN_EKONOMI: [1, 8, 10],
  INFRASTRUKTUR_SOSIAL: [9, 11, 6],
  TANGGAP_BENCANA: [11, 13, 1],
  LAINNYA: [10, 17],
};

const SECTOR_PLAYBOOKS: Record<
  CsrFocusArea,
  {
    needTitle: string;
    intervention: string;
    beneficiaries: string;
  }
> = {
  LINGKUNGAN: {
    needTitle: "Pengelolaan Limbah, Air Bersih & Adaptasi Iklim Berbasis Komunitas",
    intervention:
      "Program konservasi terpadu, bank sampah produktif, atau infrastruktur air bersih dengan pembentukan kelompok pengelola warga agar mandiri pasca-program.",
    beneficiaries: "Rumah tangga rentan lingkungan, kelompok tani/nelayan, dan bank sampah lokal",
  },
  PENDIDIKAN: {
    needTitle: "Peningkatan Literasi Digital, Vokasi & Kesiapan Kerja Pemuda Lokal",
    intervention:
      "Pelatihan keterampilan vokasi terapan, penguatan fasilitas belajar sekolah pinggiran, dan beasiswa pendampingan bersama lembaga pendidikan setempat.",
    beneficiaries: "Pelajar sekolah menengah, pemuda usia produktif, dan tenaga pendidik lokal",
  },
  KESEHATAN: {
    needTitle: "Pencegahan Stunting, Sanitasi Layak & Akses Kesehatan Primer",
    intervention:
      "Penguatan posyandu/puskesmas pembantu, edukasi gizi keluarga, dan pembangunan fasilitas sanitasi komunal berbasis RT/desa.",
    beneficiaries: "Ibu hamil, balita rentan gizi, lansia, dan kader kesehatan desa",
  },
  PEMBERDAYAAN_EKONOMI: {
    needTitle: "Peningkatan Nilai Tambah UMKM, Permodalan Produktif & Akses Pasar",
    intervention:
      "Pendampingan standardisasi produk, alat produksi bersama, dan akses pemasaran digital untuk koperasi atau kelompok UMKM perempuan.",
    beneficiaries: "Pelaku UMKM mikro, kelompok perempuan usaha, dan perajin/petani lokal",
  },
  INFRASTRUKTUR_SOSIAL: {
    needTitle: "Pemenuhan Sarana Sanitasi Air Bersih & Fasilitas Publik Desa",
    intervention:
      "Pembangunan atau rehabilitasi sarana air bersih, penerangan jalan desa berbasis surya, dan balai pelatihan masyarakat.",
    beneficiaries: "Masyarakat pedesaan/pesisir dengan keterbatasan akses infrastruktur dasar",
  },
  TANGGAP_BENCANA: {
    needTitle: "Kesiapsiagaan Masyarakat & Mitigasi Risiko Bencana Wilayah",
    intervention:
      "Pembentukan desa tangguh bencana, sistem peringatan dini tingkat warga, dan penyediaan perlengkapan evakuasi komunitas.",
    beneficiaries: "Warga di kawasan rawan banjir/longsor/pesisir dan relawan lokal",
  },
  LAINNYA: {
    needTitle: "Penguatan Inklusi Sosial & Kapasitas Kelembagaan Komunitas",
    intervention:
      "Program pemberdayaan kelompok disabilitas atau komunitas adat melalui kolaborasi lintas sektor yang terukur.",
    beneficiaries: "Kelompok rentan sosial dan komunitas swadaya setempat",
  },
};

export class NeedPrioritizationService {
  private readonly logger = new AppLogger("NeedPrioritizationService");

  async analyze(input: NeedPrioritizationInput): Promise<NeedPrioritizationResponse> {
    const { territoryData } = input;

    this.logger.info(
      `Memulai AI Need Prioritization untuk wilayah ${input.targetCity}, ${input.targetProvince} [Coverage: ${territoryData.dataCoverage}]`
    );

    const model = getOpenAIChatModel("gpt-4o-mini", 0.2);
    const snapshot = this.buildRegionalSnapshot(territoryData);

    if (model) {
      try {
        const structuredLlm = model.withStructuredOutput(needPrioritizationSchema);
        const promptVars = this.buildPromptVariables(input);
        const formattedMessages = await needPrioritizationPrompt.formatMessages(promptVars);
        const result = (await structuredLlm.invoke(formattedMessages)) as NeedPrioritizationResult;

        this.logger.info(
          `AI Need Prioritization berhasil untuk ${input.targetCity}, ${input.targetProvince} [Risk: ${result.overlapAssessment.riskLevel}]`
        );

        return {
          ...result,
          regionalSnapshot: snapshot,
          source: "AI_OPENAI",
          analyzedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        this.logger.error(
          `Gagal memanggil OpenAI untuk Need Prioritization: ${error.message}. Mengaktifkan fallback heuristik berbasis data SIPENA.`
        );
      }
    } else {
      this.logger.warn(
        "OpenAI API Key tidak aktif atau AI dimatikan. Menggunakan analisis heuristik berbasis data SIPENA."
      );
    }

    return this.generateHeuristicFallback(input, snapshot);
  }

  private buildRegionalSnapshot(
    territoryData: TerritoryDataSnapshot
  ): NeedPrioritizationResponse["regionalSnapshot"] {
    const s = territoryData.regionalStats;
    return {
      targetProvince: territoryData.targetProvince,
      targetCity: territoryData.targetCity,
      dataCoverage: territoryData.dataCoverage,
      programsInCity: s.programsInCity,
      programsInProvince: s.programsInProvince,
      openOpportunitiesInRegion: s.openOpportunitiesInProvince,
      totalReviewsInRegion: s.totalReviewsInProvince,
      averageRatingInRegion: s.averageRatingInProvince,
      negativeReviewsCount: s.negativeReviewsCount,
      localPartnersReady: s.activePartnersInProvince,
      verifiedPartnersReady: s.verifiedPartnersInProvince,
    };
  }

  private buildPromptVariables(input: NeedPrioritizationInput) {
    const { territoryData } = input;
    const { companyContext, regionalStats } = territoryData;

    const formatCurrency = (val: string | number | null | undefined) => {
      if (!val) return "Fleksibel / belum ditentukan";
      const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.]/g, ""));
      return isNaN(num) || num <= 0 ? "Fleksibel / belum ditentukan" : `Rp ${num.toLocaleString("id-ID")}`;
    };

    const coverageDescriptionMap = {
      RICH_DATA: `Data historis SIPENA cukup kaya (${regionalStats.programsInProvince} program di provinsi, ${regionalStats.programsInCity} di kota sasaran, ${regionalStats.totalReviewsInProvince} ulasan warga).`,
      LIMITED_DATA: `Data SIPENA tersedia terbatas (${regionalStats.programsInProvince} program di provinsi, ${regionalStats.openOpportunitiesInProvince} peluang aktif, ${regionalStats.activePartnersInProvince} mitra aktif).`,
      COLD_START:
        "Belum ada histori program, peluang, atau ulasan masyarakat di provinsi/kota sasaran pada database SIPENA (wilayah baru).",
    };

    const programsSummary =
      territoryData.programsBySector.length > 0
        ? territoryData.programsBySector
            .map(
              (item) =>
                `- ${FOCUS_AREA_LABELS[item.focusArea] || item.focusArea} (${item.focusArea}): ` +
                `${item.cityProgramsCount} program di kota target, ${item.provinceProgramsCount} total di provinsi ` +
                `(Aktif/Terjadwal: ${item.activeOrPlannedCount}, Selesai: ${item.completedCount}). ` +
                `Tema: ${item.sampleThemes.slice(0, 3).join("; ") || "-"}. ` +
                `Sasaran warga: ${item.sampleBeneficiaries.slice(0, 2).join("; ") || "-"}.`
            )
            .join("\n")
        : "(Belum ada program CSR tercatat di provinsi maupun kota target.)";

    const openOpportunitiesSummary =
      territoryData.openOpportunities.length > 0
        ? territoryData.openOpportunities
            .slice(0, 10)
            .map(
              (opp) =>
                `- [${opp.focusArea}] "${opp.title}" (${opp.targetCity || opp.targetProvince || "Wilayah sama"}, Status: ${opp.status}, Cocok Kota: ${opp.isExactCityMatch ? "Ya" : "Provinsi"})`
            )
            .join("\n")
        : "(Tidak ada peluang CSR OPEN/IN_REVIEW yang sedang dibuka di wilayah sasaran.)";

    const residentFeedbackSummary =
      regionalStats.totalReviewsInProvince > 0
        ? `Total Ulasan: ${regionalStats.totalReviewsInProvince} | Rata-rata Rating: ${regionalStats.averageRatingInProvince}/5 | Positif: ${regionalStats.positiveReviewsCount} | Negatif: ${regionalStats.negativeReviewsCount}.\nSampel Testimoni Warga:\n` +
          territoryData.reviewSamples
            .slice(0, 8)
            .map(
              (r) =>
                `- [${r.programFocusArea}, Rating ${r.rating}/5, Sentimen: ${r.sentiment || "UNCLASSIFIED"}] (${r.reviewerRole}${r.reviewerCity ? `, ${r.reviewerCity}` : ""}): "${r.comment.slice(0, 240)}"`
            )
            .join("\n")
        : "(Belum ada survei/ulasan penerima manfaat tercatat di wilayah sasaran.)";

    const activityLocationsSummary =
      territoryData.activityLocations.length > 0
        ? territoryData.activityLocations
            .slice(0, 8)
            .map((a) => `- [${a.focusArea}] Lokasi: ${a.locationName} (${a.title})`)
            .join("\n")
        : "(Belum ada log lokasi kegiatan spesifik tercatat.)";

    const localPartnersSummary =
      territoryData.partnersBySector.length > 0
        ? `Total Mitra Aktif: ${regionalStats.activePartnersInProvince} (${regionalStats.activePartnersInCity} di kota sasaran, ${regionalStats.verifiedPartnersInProvince} terverifikasi legalitas).\n` +
          territoryData.partnersBySector
            .map(
              (p) =>
                `- ${FOCUS_AREA_LABELS[p.focusArea] || p.focusArea}: ${p.activeCount} mitra aktif (${p.verifiedCount} terverifikasi)`
            )
            .join("\n")
        : "(Belum ada mitra NGO/yayasan terdaftar langsung di provinsi sasaran; perusahaan tetap dapat membuka peluang terbuka nasional.)";

    return {
      companyName: companyContext.name,
      companyIndustry: companyContext.industry || "Tidak disebutkan",
      companyCsrVision: companyContext.csrVision || "Belum dirinci pada profil",
      companyHistorySummary:
        `${companyContext.ownProgramsCount} program berjalan/selesai & ${companyContext.ownOpportunitiesCount} peluang pernah dibuat` +
        (companyContext.ownProgramFocusAreas.length > 0
          ? ` (Fokus dominan: ${companyContext.ownProgramFocusAreas.join(", ")})`
          : ""),
      targetCity: input.targetCity,
      targetProvince: input.targetProvince,
      selectedFocusArea: input.selectedFocusArea
        ? `${FOCUS_AREA_LABELS[input.selectedFocusArea]} (${input.selectedFocusArea})`
        : "Belum ditentukan",
      draftTitle: input.draftTitle?.trim() || "(Belum diisi)",
      estimatedBudget: formatCurrency(input.estimatedBudget),
      fieldContextNotes: input.fieldContextNotes?.trim() || "(Tidak ada catatan survei lapangan tambahan)",
      draftDescription: input.draftDescription?.trim() || "(Belum diisi)",
      dataCoverage: territoryData.dataCoverage,
      coverageDescription: coverageDescriptionMap[territoryData.dataCoverage],
      programsSummary,
      openOpportunitiesSummary,
      residentFeedbackSummary,
      activityLocationsSummary,
      localPartnersSummary,
    };
  }

  private generateHeuristicFallback(
    input: NeedPrioritizationInput,
    snapshot: NeedPrioritizationResponse["regionalSnapshot"]
  ): NeedPrioritizationResponse {
    const { territoryData } = input;
    const selectedFocus: CsrFocusArea = input.selectedFocusArea || "LINGKUNGAN";

    // Hitung kepadatan tiap bidang fokus dari program aktif + peluang terbuka di kota & provinsi
    const densityMap = new Map<CsrFocusArea, number>();
    const activeOpportunitiesMap = new Map<CsrFocusArea, number>();

    csrFocusAreaEnum.forEach((area) => {
      densityMap.set(area, 0);
      activeOpportunitiesMap.set(area, 0);
    });

    territoryData.programsBySector.forEach((p) => {
      const weight = p.cityProgramsCount * 2 + p.activeOrPlannedCount * 1.5 + p.completedCount * 0.5;
      densityMap.set(p.focusArea, (densityMap.get(p.focusArea) || 0) + weight);
    });

    territoryData.openOpportunities.forEach((o) => {
      const weight = o.isExactCityMatch ? 2 : 1;
      densityMap.set(o.focusArea, (densityMap.get(o.focusArea) || 0) + weight);
      activeOpportunitiesMap.set(o.focusArea, (activeOpportunitiesMap.get(o.focusArea) || 0) + 1);
    });

    const coreSectors: CsrFocusArea[] = [
      "LINGKUNGAN",
      "PENDIDIKAN",
      "KESEHATAN",
      "PEMBERDAYAAN_EKONOMI",
      "INFRASTRUKTUR_SOSIAL",
      "TANGGAP_BENCANA",
    ];

    const sortedByGap = [...coreSectors].sort(
      (a, b) => (densityMap.get(a) || 0) - (densityMap.get(b) || 0)
    );
    const crowdedFocusAreas = coreSectors.filter((area) => (densityMap.get(area) || 0) >= 3);
    const underservedFocusAreas = sortedByGap.filter((area) => (densityMap.get(area) || 0) <= 1).slice(0, 4);

    const selectedDensity = densityMap.get(selectedFocus) || 0;
    let riskLevel: OverlapRiskLevel = "LOW";
    let riskLabel = "Risiko Tumpang Tindih Rendah";
    if (selectedDensity >= 4) {
      riskLevel = "HIGH";
      riskLabel = "Risiko Tumpang Tindih Tinggi";
    } else if (selectedDensity >= 2) {
      riskLevel = "MEDIUM";
      riskLabel = "Mulai Padat - Perlu Diferensiasi";
    }

    // Ambil 3 prioritas teratas: jika sektor dipilih masih low-overlap tetap dipertimbangkan, jika padat utamakan underserved
    const topAreas: CsrFocusArea[] = [];
    const fieldNotes = (input.fieldContextNotes || "").toLowerCase();
    const keywordSectors: Array<{ area: CsrFocusArea; keys: string[] }> = [
      { area: "TANGGAP_BENCANA", keys: ["banjir", "bencana", "longsor", "rob", "gempa", "abrasi"] },
      { area: "KESEHATAN", keys: ["stunting", "gizi", "sanitasi", "kesehatan", "klinik", "posyandu"] },
      { area: "LINGKUNGAN", keys: ["sampah", "limbah", "mangrove", "hutan", "air bersih", "iklim"] },
      { area: "PEMBERDAYAAN_EKONOMI", keys: ["umkm", "nelayan", "petani", "koperasi", "ekonomi", "pendapatan"] },
      { area: "PENDIDIKAN", keys: ["sekolah", "literasi", "vokasi", "siswa", "guru", "pelatihan"] },
      { area: "INFRASTRUKTUR_SOSIAL", keys: ["jembatan", "jalan", "sumur", "mck", "fasilitas", "irigasi"] },
    ];

    for (const item of keywordSectors) {
      if (item.keys.some((k) => fieldNotes.includes(k)) && !topAreas.includes(item.area)) {
        topAreas.push(item.area);
      }
    }

    for (const gapArea of sortedByGap) {
      if (topAreas.length >= 3) break;
      if (!topAreas.includes(gapArea)) {
        topAreas.push(gapArea);
      }
    }

    const recommendedFocusArea = topAreas[0] || selectedFocus;
    const hasNegFeedback = territoryData.regionalStats.negativeReviewsCount > 0;
    const evidenceBasis =
      hasNegFeedback
        ? "RESIDENT_FEEDBACK"
        : territoryData.dataCoverage === "COLD_START"
        ? "REGIONAL_CONTEXT"
        : "PLATFORM_DATA";

    const priorityNeeds = topAreas.slice(0, 3).map((area, index) => {
      const pb = SECTOR_PLAYBOOKS[area];
      const sectorPrograms = territoryData.programsBySector.find((p) => p.focusArea === area);
      const cityCount = sectorPrograms?.cityProgramsCount || 0;
      const openCount = activeOpportunitiesMap.get(area) || 0;
      const partnerCount =
        territoryData.partnersBySector.find((p) => p.focusArea === area)?.activeCount || 0;

      const basisText =
        cityCount === 0 && openCount === 0
          ? `Belum ditemukan program berjalan maupun peluang terbuka pada sektor ${FOCUS_AREA_LABELS[area]} di ${input.targetCity} pada data SIPENA.`
          : `Saat ini tercatat ${cityCount} program di kota dan ${openCount} peluang terbuka pada sektor ${FOCUS_AREA_LABELS[area]}, sehingga masih tersedia ruang perluasan sasaran.`;

      const partnerNote =
        partnerCount > 0
          ? ` Tersedia ${partnerCount} mitra lokal aktif di wilayah ini pada fokus terkait.`
          : "";

      return {
        rank: index + 1,
        needTitle: pb.needTitle,
        focusArea: area,
        urgencyLevel: (index === 0 ? "CRITICAL" : index === 1 ? "HIGH" : "MODERATE") as
          | "CRITICAL"
          | "HIGH"
          | "MODERATE",
        rationale: `${basisText}${partnerNote}${input.fieldContextNotes?.trim() && index === 0 ? ` Selaras dengan catatan lapangan perusahaan: "${input.fieldContextNotes.trim().slice(0, 140)}".` : ""}`,
        recommendedIntervention: pb.intervention,
        suggestedBeneficiaries: pb.beneficiaries,
        suggestedSdgs: DEFAULT_SDGS_BY_FOCUS[area] || [10, 17],
        evidenceBasis: (index === 0 ? evidenceBasis : territoryData.dataCoverage === "COLD_START" ? "REGIONAL_CONTEXT" : "PLATFORM_DATA") as
          | "PLATFORM_DATA"
          | "RESIDENT_FEEDBACK"
          | "REGIONAL_CONTEXT",
      };
    });

    const overlapSummary =
      riskLevel === "LOW"
        ? `Pada data SIPENA untuk ${input.targetCity} dan Provinsi ${input.targetProvince}, bidang ${FOCUS_AREA_LABELS[selectedFocus]} masih tergolong sepi inisiatif sehingga peluang tumpang tindih program tergolong rendah.`
        : `Bidang ${FOCUS_AREA_LABELS[selectedFocus]} sudah memiliki ${selectedDensity >= 4 ? "cukup banyak" : "beberapa"} program berjalan atau peluang terbuka di wilayah ${input.targetCity}/${input.targetProvince}. Disarankan memilih lokasi desa/kecamatan spesifik atau mempertimbangkan sektor underserved seperti ${FOCUS_AREA_LABELS[recommendedFocusArea]}.`;

    const basisNote =
      territoryData.dataCoverage === "COLD_START"
        ? `Wilayah ${input.targetCity}, Provinsi ${input.targetProvince} belum memiliki riwayat program maupun ulasan warga di database SIPENA (mode analisis awal). Rekomendasi disusun sebagai panduan terstruktur yang perlu diverifikasi melalui survei lokal.`
        : `Analisis dirangkum dari ${snapshot.programsInProvince} program di provinsi (${snapshot.programsInCity} di kota target), ${snapshot.openOpportunitiesInRegion} peluang terbuka, ${snapshot.totalReviewsInRegion} ulasan warga, serta ${snapshot.localPartnersReady} mitra lokal aktif di SIPENA.`;

    const primaryNeed = priorityNeeds[0];
    const draftDescriptionSnippet = `Inisiatif ini dirancang untuk menjawab kebutuhan prioritas di ${input.targetCity}, Provinsi ${input.targetProvince} pada bidang ${FOCUS_AREA_LABELS[recommendedFocusArea]}. Program difokuskan bagi ${primaryNeed.suggestedBeneficiaries.toLowerCase()} melalui pendekatan ${primaryNeed.recommendedIntervention.charAt(0).toLowerCase() + primaryNeed.recommendedIntervention.slice(1)}${input.fieldContextNotes?.trim() ? ` Pendekatan ini juga memperhatikan konteks lapangan perusahaan (${input.fieldContextNotes.trim().slice(0, 140)}).` : ""}`;

    return {
      overlapAssessment: {
        riskLevel,
        riskLabel,
        summary: overlapSummary,
        crowdedFocusAreas,
        underservedFocusAreas,
      },
      regionalPotentialSummary: {
        conditionsAndPotential: `Wilayah ${input.targetCity}, Provinsi ${input.targetProvince} memiliki potensi kolaborasi masyarakat yang dapat diakselerasi bersama ${snapshot.verifiedPartnersReady > 0 ? `${snapshot.verifiedPartnersReady} mitra NGO terverifikasi` : "mitra pelaksana terverifikasi"} di sektor prioritas daerah.`,
        socialNeedsGap:
          hasNegFeedback && territoryData.reviewSamples[0]
            ? `Dari ${snapshot.totalReviewsInRegion} ulasan penerima manfaat di provinsi ini (rata-rata ${snapshot.averageRatingInRegion}/5), terdapat ${snapshot.negativeReviewsCount} masukan kritis yang menandakan perlunya penguatan kualitas pendampingan dan cakupan wilayah yang belum tersentuh.`
            : underservedFocusAreas.length > 0
            ? `Sektor yang paling minim intervensi di wilayah sasaran saat ini meliputi ${underservedFocusAreas.map((a) => FOCUS_AREA_LABELS[a]).join(", ")}.`
            : "Cakupan program perlu diarahkan ke kelompok warga yang belum terjangkau inisiatif CSR sebelumnya.",
        basisNote,
      },
      priorityNeeds,
      formSuggestions: {
        recommendedFocusArea,
        recommendedSdgs: DEFAULT_SDGS_BY_FOCUS[recommendedFocusArea] || [10, 17],
        draftDescriptionSnippet,
        differentiationTip:
          snapshot.openOpportunitiesInRegion > 0
            ? "Pastikan lokasi kecamatan/desa sasaran dan kelompok penerima manfaat dirinci secara eksplisit dalam TOR agar proposal NGO tidak tumpang tindih dengan peluang lain yang sedang terbuka."
            : "Sertakan target dampak kuantitatif dan mekanisme serah terima aset/pengetahuan kepada komunitas lokal sebagai nilai pembeda utama program.",
      },
      regionalSnapshot: snapshot,
      source: "HEURISTIC_FALLBACK",
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const needPrioritizationService = new NeedPrioritizationService();
