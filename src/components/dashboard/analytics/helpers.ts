import { CsrFocusArea, csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import {
  ProgramAnalyticsData,
  OverallEsgMetrics,
  EsgPillarSummary,
  FocusAreaDistribution,
  SdgGoal,
  SdgContributionStats,
  EsgPillarStats,
  SdgEsgSummaryKpis,
  SdgGapAnalysis,
  EsgPillarCode,
} from "./types";

/**
 * Katalog 17 Sasaran Pembangunan Berkelanjutan (SDGs) Resmi PBB
 * Warna resmi UN SDG dan pemetaan pilar Environmental (E), Social (S), Governance (G).
 */
export const ALL_17_SDGS: SdgGoal[] = [
  {
    id: 1,
    code: "SDG 1",
    name: "Tanpa Kemiskinan",
    nameEn: "No Poverty",
    color: "#E5243B",
    esgPillars: ["S"],
    primaryPillar: "S",
    description: "Mengentaskan segala bentuk kemiskinan melalui bantuan langsung, perlindungan sosial, dan pemberdayaan ekonomi masyarakat rentan.",
  },
  {
    id: 2,
    code: "SDG 2",
    name: "Tanpa Kelaparan",
    nameEn: "Zero Hunger",
    color: "#DDA63A",
    esgPillars: ["S"],
    primaryPillar: "S",
    description: "Ketahanan pangan, perbaikan gizi masyarakat, pencegahan stunting balita, dan regenerasi pertanian berkelanjutan.",
  },
  {
    id: 3,
    code: "SDG 3",
    name: "Kehidupan Sehat & Sejahtera",
    nameEn: "Good Health and Well-being",
    color: "#4C9F38",
    esgPillars: ["S"],
    primaryPillar: "S",
    description: "Pelayanan kesehatan promotif-preventif, posyandu warga, imunisasi, dan penanganan penyakit menular di komunitas.",
  },
  {
    id: 4,
    code: "SDG 4",
    name: "Pendidikan Berkualitas",
    nameEn: "Quality Education",
    color: "#C5192D",
    esgPillars: ["S"],
    primaryPillar: "S",
    description: "Akses pendidikan inklusif, beasiswa pelajar prasejahtera, literasi digital, renovasi fasilitas belajar, dan pelatihan vokasi.",
  },
  {
    id: 5,
    code: "SDG 5",
    name: "Kesetaraan Gender",
    nameEn: "Gender Equality",
    color: "#FF3A21",
    esgPillars: ["S"],
    primaryPillar: "S",
    description: "Pemberdayaan kelompok perempuan perintis wirausaha, kepemimpinan perempuan di desa, dan perlindungan sosial anak.",
  },
  {
    id: 6,
    code: "SDG 6",
    name: "Air Bersih & Sanitasi Layak",
    nameEn: "Clean Water and Sanitation",
    color: "#26BDE2",
    esgPillars: ["E", "S"],
    primaryPillar: "E",
    description: "Penyediaan fasilitas pipanisasi air bersih warga, MCK komunal higienis, serta konservasi daerah tangkapan mata air alami.",
  },
  {
    id: 7,
    code: "SDG 7",
    name: "Energi Bersih & Terjangkau",
    nameEn: "Affordable and Clean Energy",
    color: "#FCC30B",
    esgPillars: ["E"],
    primaryPillar: "E",
    description: "Pemasangan pembangkit listrik mikrohidro/surya pedesaan, efisiensi energi terbarukan, dan electrifying agriculture ramah lingkungan.",
  },
  {
    id: 8,
    code: "SDG 8",
    name: "Pekerjaan Layak & Pertumbuhan Ekonomi",
    nameEn: "Decent Work and Economic Growth",
    color: "#A21942",
    esgPillars: ["S", "G"],
    primaryPillar: "S",
    description: "Inkubasi wirausaha UMKM binaan, sertifikasi keahlian pemuda produktif, perluasan rantai pasok lokal, dan standar kerja adil.",
  },
  {
    id: 9,
    code: "SDG 9",
    name: "Industri, Inovasi & Infrastruktur",
    nameEn: "Industry, Innovation and Infrastructure",
    color: "#FD6925",
    esgPillars: ["E", "S"],
    primaryPillar: "S",
    description: "Pembangunan jembatan perintis pedesaan, sentra produksi warga, dan adopsi teknologi tepat guna untuk efisiensi komoditas desa.",
  },
  {
    id: 10,
    code: "SDG 10",
    name: "Berkurangnya Kesenjangan",
    nameEn: "Reduced Inequalities",
    color: "#DD1367",
    esgPillars: ["S"],
    primaryPillar: "S",
    description: "Pemerataan pemberdayaan masyarakat di wilayah tertinggal/3T, inklusi penyandang disabilitas, dan keadilan akses sosial.",
  },
  {
    id: 11,
    code: "SDG 11",
    name: "Kota & Komunitas Berkelanjutan",
    nameEn: "Sustainable Cities and Communities",
    color: "#FD9D24",
    esgPillars: ["E", "S"],
    primaryPillar: "S",
    description: "Mitigasi kerentanan permukiman padat, kampung tanggap bencana, ruang terbuka hijau, dan tata kelola sampah berbasis warga.",
  },
  {
    id: 12,
    code: "SDG 12",
    name: "Konsumsi & Produksi Bertanggung Jawab",
    nameEn: "Responsible Consumption & Production",
    color: "#BF8B2E",
    esgPillars: ["E", "G"],
    primaryPillar: "E",
    description: "Program ekonomi sirkular, bank sampah unit binaan, daur ulang limbah anorganik, dan sertifikasi produk ramah lingkungan.",
  },
  {
    id: 13,
    code: "SDG 13",
    name: "Penanganan Perubahan Iklim",
    nameEn: "Climate Action",
    color: "#3F7E44",
    esgPillars: ["E"],
    primaryPillar: "E",
    description: "Penanaman pohon mangrove penahan abrasi, reforestasi hutan kritis, pengurangan emisi karbon, dan edukasi aksi iklim generasi muda.",
  },
  {
    id: 14,
    code: "SDG 14",
    name: "Ekosistem Lautan",
    nameEn: "Life Below Water",
    color: "#0A97D9",
    esgPillars: ["E"],
    primaryPillar: "E",
    description: "Transplantasi terumbu karang, pembersihan sampah pesisir, perlindungan spesies laut langka, dan pemberdayaan nelayan ramah lingkungan.",
  },
  {
    id: 15,
    code: "SDG 15",
    name: "Ekosistem Daratan",
    nameEn: "Life on Land",
    color: "#56C02B",
    esgPillars: ["E"],
    primaryPillar: "E",
    description: "Pelestarian flora & fauna endemik, rehabilitasi lahan gambut/bekas tambang, pencegahan kebakaran hutan, dan agroforestri lestari.",
  },
  {
    id: 16,
    code: "SDG 16",
    name: "Perdamaian, Keadilan & Kelembagaan Kuat",
    nameEn: "Peace, Justice and Strong Institutions",
    color: "#00689D",
    esgPillars: ["G"],
    primaryPillar: "G",
    description: "Tata kelola program yang transparan, integritas audit akuntabilitas dana, pencegahan konflik sosial, dan perlindungan hak warga.",
  },
  {
    id: 17,
    code: "SDG 17",
    name: "Kemitraan untuk Mencapai Tujuan",
    nameEn: "Partnerships for the Goals",
    color: "#19486A",
    esgPillars: ["G", "S"],
    primaryPillar: "G",
    description: "Kolaborasi multi-pihak terikat MoU antara perusahaan, LSM/mitra pelaksana profesional, pemerintah daerah, dan komunitas penerima.",
  },
];

/**
 * Map program to its related SDG numbers (1..17).
 * Checks explicit `program.sdgs` if available; otherwise dynamically maps based on
 * focusArea and program thematic context.
 */
export function getProgramSdgs(program: ProgramAnalyticsData): number[] {
  // If program already has explicit SDG IDs
  if (Array.isArray(program.sdgs) && program.sdgs.length > 0) {
    const parsed = program.sdgs
      .map((item) => {
        if (typeof item === "number") return item;
        const match = String(item).match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
      })
      .filter((id): id is number => id !== null && id >= 1 && id <= 17);

    if (parsed.length > 0) {
      // In SIPENA, every collaborative program with a signed partner MoU also inherently supports SDG 17
      if (!parsed.includes(17)) parsed.push(17);
      return Array.from(new Set(parsed)).sort((a, b) => a - b);
    }
  }

  const sdgSet = new Set<number>();
  const fa = (program.focusArea || "").toUpperCase();
  const text = `${program.title || ""} ${program.description || ""} ${program.opportunityTitle || ""}`.toLowerCase();

  switch (fa) {
    case "LINGKUNGAN":
      sdgSet.add(13); // Aksi Iklim
      sdgSet.add(15); // Ekosistem Daratan
      if (text.includes("laut") || text.includes("pantai") || text.includes("karang") || text.includes("mangrove") || text.includes("pesisir")) {
        sdgSet.add(14); // Ekosistem Laut
      }
      if (text.includes("air") || text.includes("sungai") || text.includes("sanitasi")) {
        sdgSet.add(6); // Air Bersih
      }
      if (text.includes("energi") || text.includes("surya") || text.includes("listrik")) {
        sdgSet.add(7); // Energi Bersih
      }
      if (text.includes("sampah") || text.includes("daur ulang") || text.includes("sirkular")) {
        sdgSet.add(12); // Konsumsi & Produksi Bertanggung Jawab
      }
      break;

    case "PENDIDIKAN":
      sdgSet.add(4); // Pendidikan Berkualitas
      sdgSet.add(10); // Berkurangnya Kesenjangan
      if (text.includes("vokasi") || text.includes("kerja") || text.includes("keterampilan") || text.includes("magang")) {
        sdgSet.add(8); // Pekerjaan Layak
      }
      if (text.includes("perempuan") || text.includes("wanita") || text.includes("gender")) {
        sdgSet.add(5); // Kesetaraan Gender
      }
      break;

    case "KESEHATAN":
      sdgSet.add(3); // Kehidupan Sehat & Sejahtera
      if (text.includes("stunting") || text.includes("gizi") || text.includes("makanan") || text.includes("kelaparan")) {
        sdgSet.add(2); // Tanpa Kelaparan
      }
      if (text.includes("air") || text.includes("mck") || text.includes("sanitasi") || text.includes("bersih")) {
        sdgSet.add(6); // Air Bersih & Sanitasi
      }
      break;

    case "PEMBERDAYAAN_EKONOMI":
    case "EKONOMI_UMKM":
      sdgSet.add(8); // Pekerjaan Layak & Pertumbuhan Ekonomi
      sdgSet.add(1); // Tanpa Kemiskinan
      sdgSet.add(10); // Berkurangnya Kesenjangan
      if (text.includes("perempuan") || text.includes("ibu") || text.includes("wanita")) {
        sdgSet.add(5); // Kesetaraan Gender
      }
      break;

    case "INFRASTRUKTUR_SOSIAL":
    case "INFRASTRUKTUR":
      sdgSet.add(9); // Industri, Inovasi & Infrastruktur
      sdgSet.add(11); // Kota & Komunitas Berkelanjutan
      if (text.includes("air") || text.includes("pipa") || text.includes("sumur")) {
        sdgSet.add(6); // Air Bersih
      }
      break;

    case "TANGGAP_BENCANA":
      sdgSet.add(11); // Ketangguhan Komunitas
      sdgSet.add(2); // Tanpa Kelaparan
      sdgSet.add(1); // Tanpa Kemiskinan
      sdgSet.add(3); // Kesehatan Darurat
      break;

    case "LAINNYA":
    default:
      sdgSet.add(17); // Kemitraan
      sdgSet.add(10); // Pengurangan Kesenjangan
      break;
  }

  // All formal SIPENA collaborative programs executed via partner agreements inherently fulfill SDG 17
  sdgSet.add(17);

  return Array.from(sdgSet).sort((a, b) => a - b);
}

/**
 * Determine the ESG pillars (E, S, G) that a program contributes to based on its mapped SDGs.
 */
export function getProgramEsgPillars(program: ProgramAnalyticsData): EsgPillarCode[] {
  const sdgIds = getProgramSdgs(program);
  const pillarsSet = new Set<EsgPillarCode>();

  sdgIds.forEach((id) => {
    const goal = ALL_17_SDGS.find((g) => g.id === id);
    if (goal) {
      goal.esgPillars.forEach((p) => pillarsSet.add(p));
    }
  });

  // Fallback if none mapped
  if (pillarsSet.size === 0) {
    pillarsSet.add("S");
  }

  return Array.from(pillarsSet);
}

/**
 * Compute thorough SDGs and ESG analytics based on the provided programs array.
 */
export function computeSdgEsgAnalytics(programs: ProgramAnalyticsData[]): {
  sdgDistributions: SdgContributionStats[];
  esgPillars: EsgPillarStats[];
  kpis: SdgEsgSummaryKpis;
  gapAnalysis: SdgGapAnalysis;
} {
  const totalPrograms = programs.length;

  // 1. Calculate SDG distributions for all 17 SDGs
  const sdgMap = new Map<number, ProgramAnalyticsData[]>();
  for (let i = 1; i <= 17; i++) {
    sdgMap.set(i, []);
  }

  programs.forEach((prog) => {
    const sdgIds = getProgramSdgs(prog);
    sdgIds.forEach((id) => {
      const list = sdgMap.get(id);
      if (list) list.push(prog);
    });
  });

  const sdgDistributions: SdgContributionStats[] = ALL_17_SDGS.map((goal) => {
    const linked = sdgMap.get(goal.id) || [];
    const count = linked.length;
    const percentage = totalPrograms > 0 ? Math.round((count / totalPrograms) * 100) : 0;
    return {
      sdg: goal,
      programCount: count,
      percentage,
      programs: linked,
      isCovered: count > 0,
    };
  });

  // 2. Calculate 3 ESG Pillars statistics
  const envPrograms: ProgramAnalyticsData[] = [];
  const socPrograms: ProgramAnalyticsData[] = [];
  const govPrograms: ProgramAnalyticsData[] = [];

  programs.forEach((prog) => {
    const pillars = getProgramEsgPillars(prog);
    if (pillars.includes("E")) envPrograms.push(prog);
    if (pillars.includes("S")) socPrograms.push(prog);
    if (pillars.includes("G")) govPrograms.push(prog);
  });

  const envSdgs = ALL_17_SDGS.filter((g) => g.esgPillars.includes("E")).map((g) => g.id);
  const socSdgs = ALL_17_SDGS.filter((g) => g.esgPillars.includes("S")).map((g) => g.id);
  const govSdgs = ALL_17_SDGS.filter((g) => g.esgPillars.includes("G")).map((g) => g.id);

  const esgPillars: EsgPillarStats[] = [
    {
      pillar: "E",
      name: "Environmental",
      fullName: "Pilar E • Environmental (Lingkungan)",
      subtitle: "Kelestarian lingkungan, penanganan krisis iklim, konservasi keanekaragaman hayati, dan efisiensi sumber daya.",
      themeColor: "emerald",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      programCount: envPrograms.length,
      percentage: totalPrograms > 0 ? Math.round((envPrograms.length / totalPrograms) * 100) : 0,
      linkedSdgs: envSdgs,
      programs: envPrograms,
      focusSummary: "Reforestasi, konservasi mangrove & ekosistem laut, air bersih & sanitasi, dan transisi energi terbarukan.",
    },
    {
      pillar: "S",
      name: "Social",
      fullName: "Pilar S • Social (Sosial & Kemasyarakatan)",
      subtitle: "Pemberdayaan masyarakat inklusif, peningkatan mutu pendidikan, taraf kesehatan, dan kemandirian ekonomi binaan.",
      themeColor: "blue",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
      programCount: socPrograms.length,
      percentage: totalPrograms > 0 ? Math.round((socPrograms.length / totalPrograms) * 100) : 0,
      linkedSdgs: socSdgs,
      programs: socPrograms,
      focusSummary: "Beasiswa & sarana sekolah, posyandu & gizi anak, inkubasi wirausaha UMKM, dan infrastruktur sosial desa.",
    },
    {
      pillar: "G",
      name: "Governance",
      fullName: "Pilar G • Governance (Tata Kelola & Kemitraan)",
      subtitle: "Transparansi pelaksanaan, kepatuhan perjanjian kemitraan (MoU), akuntabilitas laporan, dan kolaborasi multi-pihak.",
      themeColor: "purple",
      badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
      programCount: govPrograms.length,
      percentage: totalPrograms > 0 ? Math.round((govPrograms.length / totalPrograms) * 100) : 0,
      linkedSdgs: govSdgs,
      programs: govPrograms,
      focusSummary: "Kemitraan multi-stakeholder terikat hukum, akuntabilitas audit independen, dan pelaporan dampak berbasis standar ESG.",
    },
  ];

  // 3. Compute 4 Primary KPIs
  const coveredList = sdgDistributions.filter((item) => item.isCovered);
  const uncoveredList = sdgDistributions.filter((item) => !item.isCovered);

  const coveredSdgsCount = coveredList.length;
  const uncoveredSdgsCount = uncoveredList.length;
  const coveredPercentage = Math.round((coveredSdgsCount / 17) * 100);

  // Top SDG
  const sortedByCount = [...coveredList].sort((a, b) => b.programCount - a.programCount);
  const topSdg = sortedByCount.length > 0 ? sortedByCount[0] : null;

  // Least covered among covered
  const sortedAsc = [...coveredList].sort((a, b) => a.programCount - b.programCount);
  const leastCoveredSdg = sortedAsc.length > 0 ? sortedAsc[0] : null;

  // Dominant ESG Pillar
  const sortedPillars = [...esgPillars].sort((a, b) => b.programCount - a.programCount);
  const dominantPillar =
    sortedPillars.length > 0 && sortedPillars[0].programCount > 0
      ? {
          pillar: sortedPillars[0].pillar,
          name: sortedPillars[0].name,
          programCount: sortedPillars[0].programCount,
          percentage: sortedPillars[0].percentage,
        }
      : null;

  const kpis: SdgEsgSummaryKpis = {
    coveredSdgsCount,
    uncoveredSdgsCount,
    coveredPercentage,
    topSdg,
    leastCoveredSdg,
    dominantPillar,
  };

  // 4. Gap Analysis
  const topSupportedSdgs = sortedByCount.slice(0, 3);
  const leastCoveredSdgs = sortedAsc.slice(0, 3);
  const uncoveredSdgs = uncoveredList;

  const gapAnalysis: SdgGapAnalysis = {
    topSupportedSdgs,
    leastCoveredSdgs,
    uncoveredSdgs,
    pillarDistribution: {
      environmental: envPrograms.length,
      social: socPrograms.length,
      governance: govPrograms.length,
    },
    totalProgramsCount: totalPrograms,
  };

  return {
    sdgDistributions,
    esgPillars,
    kpis,
    gapAnalysis,
  };
}

/**
 * Format currency to Rupiah.
 */
export function formatRupiah(val: number | string | null | undefined): string {
  if (val === undefined || val === null || val === "") return "Rp 0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Compact format for large currency values (Jt / M).
 */
export function formatCompactRupiah(val: number | string | null | undefined): string {
  if (val === undefined || val === null || val === "") return "Rp 0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp 0";
  if (num >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
  }
  if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(1)} Jt`;
  }
  return formatRupiah(num);
}

/**
 * Format date string to Indonesian locale.
 */
export function formatDate(val: string | null | undefined): string {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}

/**
 * Extract numeric beneficiaries from string.
 */
export function parseBeneficiariesCount(text: string | null | undefined): number {
  if (!text) return 0;
  const cleaned = text.replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Export SDGs & ESG program data to CSV.
 */
export function exportSdgEsgCsv(programs: ProgramAnalyticsData[], organizationName?: string) {
  const headers = [
    "ID Program",
    "Nama Program CSR",
    "Mitra Pelaksana",
    "Perusahaan Sponsor",
    "Bidang CSR",
    "SDGs Terkait",
    "Pilar ESG Terkait",
    "Status Pelaksanaan",
    "Kota / Kabupaten",
    "Provinsi",
    "Anggaran Disepakati (IDR)",
    "Realisasi Serapan (IDR)",
    "Penerima Manfaat",
    "Tanggal Mulai",
    "Tanggal Selesai",
  ];

  const rows = programs.map((p) => {
    const sdgIds = getProgramSdgs(p);
    const sdgLabels = sdgIds.map((id) => `SDG ${id}`).join("; ");
    const pillars = getProgramEsgPillars(p).join("; ");

    return [
      `"${p.id || ""}"`,
      `"${(p.title || "").replace(/"/g, '""')}"`,
      `"${(p.partnerName || "").replace(/"/g, '""')}"`,
      `"${(p.companyName || "").replace(/"/g, '""')}"`,
      `"${p.focusArea || ""}"`,
      `"${sdgLabels}"`,
      `"${pillars}"`,
      `"${p.status || ""}"`,
      `"${p.targetCity || ""}"`,
      `"${p.targetProvince || ""}"`,
      `"${p.budget || "0"}"`,
      `"${p.spentBudget || "0"}"`,
      `"${p.actualBeneficiaries || p.targetBeneficiaries || ""}"`,
      `"${p.startDate ? formatDate(p.startDate) : ""}"`,
      `"${p.endDate ? formatDate(p.endDate) : ""}"`,
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const dateStr = new Date().toISOString().split("T")[0];
  const safeName = (organizationName || "SIPENA").toLowerCase().replace(/[^a-z0-9]/g, "_");
  link.setAttribute("download", `Analisis_SDGs_ESG_${safeName}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Backward compatibility helper
export function exportProgramsCsv(programs: ProgramAnalyticsData[], organizationName?: string) {
  exportSdgEsgCsv(programs, organizationName);
}

export const FOCUS_AREA_DETAILS: Record<
  CsrFocusArea,
  {
    label: string;
    pillar: "ENVIRONMENT" | "SOCIAL";
    color: string;
    badgeVariant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate";
    sdgs: string[];
  }
> = {
  LINGKUNGAN: {
    label: "Lingkungan & Alam",
    pillar: "ENVIRONMENT",
    color: "#059669",
    badgeVariant: "emerald",
    sdgs: ["SDG 13: Aksi Iklim", "SDG 15: Ekosistem Daratan", "SDG 14: Ekosistem Laut"],
  },
  PENDIDIKAN: {
    label: "Pendidikan & Literasi",
    pillar: "SOCIAL",
    color: "#2563eb",
    badgeVariant: "blue",
    sdgs: ["SDG 4: Pendidikan Berkualitas", "SDG 10: Berkurangnya Kesenjangan"],
  },
  KESEHATAN: {
    label: "Kesehatan Masyarakat",
    pillar: "SOCIAL",
    color: "#e11d48",
    badgeVariant: "rose",
    sdgs: ["SDG 3: Kehidupan Sehat & Sejahtera", "SDG 6: Air Bersih & Sanitasi"],
  },
  PEMBERDAYAAN_EKONOMI: {
    label: "Pemberdayaan Ekonomi / UMKM",
    pillar: "SOCIAL",
    color: "#d97706",
    badgeVariant: "amber",
    sdgs: ["SDG 8: Pekerjaan Layak & Pertumbuhan Ekonomi", "SDG 1: Tanpa Kemiskinan"],
  },
  INFRASTRUKTUR_SOSIAL: {
    label: "Infrastruktur Sosial",
    pillar: "SOCIAL",
    color: "#9333ea",
    badgeVariant: "purple",
    sdgs: ["SDG 9: Industri & Infrastruktur", "SDG 11: Kota & Komunitas Berkelanjutan"],
  },
  TANGGAP_BENCANA: {
    label: "Tanggap Kemanusiaan & Bencana",
    pillar: "SOCIAL",
    color: "#ea580c",
    badgeVariant: "rose",
    sdgs: ["SDG 11: Ketangguhan Komunitas", "SDG 2: Tanpa Kelaparan"],
  },
  LAINNYA: {
    label: "Inisiatif Lainnya",
    pillar: "SOCIAL",
    color: "#475569",
    badgeVariant: "slate",
    sdgs: ["SDG 17: Kemitraan untuk Mencapai Tujuan"],
  },
};

// Backward compatibility legacy compute
export function computeEsgAnalytics(programs: ProgramAnalyticsData[]): {
  overall: OverallEsgMetrics;
  pillars: EsgPillarSummary[];
  focusDistributions: FocusAreaDistribution[];
} {
  const totalPrograms = programs.length;
  let totalAllocatedBudget = 0;
  let totalSpentBudget = 0;
  let totalBeneficiaries = 0;

  programs.forEach((prog) => {
    const b = prog.budget ? parseFloat(prog.budget) : 0;
    const s = prog.spentBudget ? parseFloat(prog.spentBudget) : 0;
    const ben = parseBeneficiariesCount(prog.actualBeneficiaries || prog.targetBeneficiaries);
    totalAllocatedBudget += isNaN(b) ? 0 : b;
    totalSpentBudget += isNaN(s) ? 0 : s;
    totalBeneficiaries += ben;
  });

  const overall: OverallEsgMetrics = {
    totalPrograms,
    inProgressPrograms: programs.filter((p) => p.status === "IN_PROGRESS").length,
    completedPrograms: programs.filter((p) => p.status === "COMPLETED").length,
    totalAllocatedBudget,
    totalSpentBudget,
    overallAbsorptionRate: totalAllocatedBudget > 0 ? Math.round((totalSpentBudget / totalAllocatedBudget) * 100) : 0,
    totalBeneficiaries,
    transparencyScore: 100,
    environmentalBudget: 0,
    socialBudget: 0,
    governanceBudget: 0,
  };

  return {
    overall,
    pillars: [],
    focusDistributions: [],
  };
}
