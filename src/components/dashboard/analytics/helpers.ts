import { CsrFocusArea, csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import {
  ProgramAnalyticsData,
  OverallEsgMetrics,
  EsgPillarSummary,
  FocusAreaDistribution,
} from "./types";

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
    color: "#059669", // emerald-600
    badgeVariant: "emerald",
    sdgs: ["SDG 13: Aksi Iklim", "SDG 15: Ekosistem Daratan", "SDG 14: Ekosistem Laut"],
  },
  PENDIDIKAN: {
    label: "Pendidikan & Literasi",
    pillar: "SOCIAL",
    color: "#2563eb", // blue-600
    badgeVariant: "blue",
    sdgs: ["SDG 4: Pendidikan Berkualitas", "SDG 10: Berkurangnya Kesenjangan"],
  },
  KESEHATAN: {
    label: "Kesehatan Masyarakat",
    pillar: "SOCIAL",
    color: "#e11d48", // rose-600
    badgeVariant: "rose",
    sdgs: ["SDG 3: Kehidupan Sehat & Sejahtera", "SDG 6: Air Bersih & Sanitasi"],
  },
  PEMBERDAYAAN_EKONOMI: {
    label: "Pemberdayaan Ekonomi / UMKM",
    pillar: "SOCIAL",
    color: "#d97706", // amber-600
    badgeVariant: "amber",
    sdgs: ["SDG 8: Pekerjaan Layak & Pertumbuhan Ekonomi", "SDG 1: Tanpa Kemiskinan"],
  },
  INFRASTRUKTUR_SOSIAL: {
    label: "Infrastruktur Sosial",
    pillar: "SOCIAL",
    color: "#9333ea", // purple-600
    badgeVariant: "purple",
    sdgs: ["SDG 9: Industri & Infrastruktur", "SDG 11: Kota & Komunitas Berkelanjutan"],
  },
  TANGGAP_BENCANA: {
    label: "Tanggap Kemanusiaan & Bencana",
    pillar: "SOCIAL",
    color: "#ea580c", // orange-600
    badgeVariant: "rose",
    sdgs: ["SDG 11: Ketangguhan Komunitas", "SDG 2: Tanpa Kelaparan"],
  },
  LAINNYA: {
    label: "Inisiatif Lainnya",
    pillar: "SOCIAL",
    color: "#475569", // slate-600
    badgeVariant: "slate",
    sdgs: ["SDG 17: Kemitraan untuk Mencapai Tujuan"],
  },
};

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
 * Ekstraksi angka kasar dari string penerima manfaat (misal: "1.500 Petani" -> 1500)
 */
export function parseBeneficiariesCount(text: string | null | undefined): number {
  if (!text) return 0;
  // cari angka pertama termasuk titik/koma ribuan
  const cleaned = text.replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

export function computeEsgAnalytics(programs: ProgramAnalyticsData[]): {
  overall: OverallEsgMetrics;
  pillars: EsgPillarSummary[];
  focusDistributions: FocusAreaDistribution[];
} {
  const totalPrograms = programs.length;
  const inProgressPrograms = programs.filter((p) => p.status === "IN_PROGRESS").length;
  const completedPrograms = programs.filter((p) => p.status === "COMPLETED").length;

  let totalAllocatedBudget = 0;
  let totalSpentBudget = 0;
  let totalBeneficiaries = 0;

  // Akumulator per bidang
  const focusMap: Record<
    string,
    { allocated: number; spent: number; count: number; beneficiaries: number }
  > = {};

  csrFocusAreaEnum.forEach((fa) => {
    focusMap[fa] = { allocated: 0, spent: 0, count: 0, beneficiaries: 0 };
  });

  programs.forEach((prog) => {
    const b = prog.budget ? parseFloat(prog.budget) : 0;
    const s = prog.spentBudget ? parseFloat(prog.spentBudget) : 0;
    const ben = parseBeneficiariesCount(prog.actualBeneficiaries || prog.targetBeneficiaries);

    const safeB = isNaN(b) ? 0 : b;
    const safeS = isNaN(s) ? 0 : s;

    totalAllocatedBudget += safeB;
    totalSpentBudget += safeS;
    totalBeneficiaries += ben;

    const faKey = prog.focusArea as CsrFocusArea;
    if (focusMap[faKey]) {
      focusMap[faKey].allocated += safeB;
      focusMap[faKey].spent += safeS;
      focusMap[faKey].count += 1;
      focusMap[faKey].beneficiaries += ben;
    }
  });

  const overallAbsorptionRate =
    totalAllocatedBudget > 0
      ? Math.round((totalSpentBudget / totalAllocatedBudget) * 100)
      : 0;

  // Breakdown Pillars
  let envAllocated = 0;
  let envSpent = 0;
  let envCount = 0;
  let envBeneficiaries = 0;

  let socAllocated = 0;
  let socSpent = 0;
  let socCount = 0;
  let socBeneficiaries = 0;

  csrFocusAreaEnum.forEach((fa) => {
    const data = focusMap[fa];
    const details = FOCUS_AREA_DETAILS[fa];
    if (details.pillar === "ENVIRONMENT") {
      envAllocated += data.allocated;
      envSpent += data.spent;
      envCount += data.count;
      envBeneficiaries += data.beneficiaries;
    } else {
      socAllocated += data.allocated;
      socSpent += data.spent;
      socCount += data.count;
      socBeneficiaries += data.beneficiaries;
    }
  });

  // Governance Pillar dihitung dari akuntabilitas & kepatuhan program
  // (misal alokasi transparansi MoU & audit monitoring 5-10% dari portofolio atau 100% kepatuhan kontrak)
  const govScore = totalPrograms > 0
    ? Math.min(100, Math.round(((completedPrograms + inProgressPrograms) / totalPrograms) * 80 + 20))
    : 100;

  const pillars: EsgPillarSummary[] = [
    {
      pillar: "ENVIRONMENT",
      title: "Environmental (Lingkungan)",
      subtitle: "Konservasi alam, restorasi mangrove, transisi energi & pengelolaan limbah",
      allocatedBudget: envAllocated,
      spentBudget: envSpent,
      programCount: envCount,
      percentageOfBudget:
        totalAllocatedBudget > 0 ? Math.round((envAllocated / totalAllocatedBudget) * 100) : 0,
      beneficiaries: envBeneficiaries,
      sdgTags: ["SDG 13 (Iklim)", "SDG 14 (Laut)", "SDG 15 (Daratan)"],
      color: "emerald",
    },
    {
      pillar: "SOCIAL",
      title: "Social (Pemberdayaan Masyarakat)",
      subtitle: "Pendidikan, kesehatan komunitas, UMKM lokal, dan infrastruktur sosial",
      allocatedBudget: socAllocated,
      spentBudget: socSpent,
      programCount: socCount,
      percentageOfBudget:
        totalAllocatedBudget > 0 ? Math.round((socAllocated / totalAllocatedBudget) * 100) : 0,
      beneficiaries: socBeneficiaries,
      sdgTags: ["SDG 1 (Kemiskinan)", "SDG 3 (Kesehatan)", "SDG 4 (Pendidikan)", "SDG 8 (UMKM)"],
      color: "blue",
    },
    {
      pillar: "GOVERNANCE",
      title: "Governance (Kepatuhan & Tata Kelola)",
      subtitle: "Legalitas MoU, transparansi serapan dana berkala, dan verifikasi mitra pelaksana",
      allocatedBudget: totalAllocatedBudget,
      spentBudget: totalSpentBudget,
      programCount: totalPrograms,
      percentageOfBudget: 100,
      beneficiaries: totalBeneficiaries,
      sdgTags: ["SDG 16 (Tata Kelola Baik)", "SDG 17 (Kemitraan Menyeluruh)"],
      color: "purple",
    },
  ];

  // Focus Distributions list
  const focusDistributions: FocusAreaDistribution[] = csrFocusAreaEnum.map((fa) => {
    const item = focusMap[fa];
    const details = FOCUS_AREA_DETAILS[fa];
    const absorption =
      item.allocated > 0 ? Math.round((item.spent / item.allocated) * 100) : 0;
    const pctOfTotal =
      totalAllocatedBudget > 0 ? Math.round((item.allocated / totalAllocatedBudget) * 100) : 0;

    return {
      focusArea: fa,
      label: details.label,
      allocatedBudget: item.allocated,
      spentBudget: item.spent,
      absorptionRate: absorption,
      programCount: item.count,
      percentageOfBudget: pctOfTotal,
      color: details.color,
      badgeVariant: details.badgeVariant,
    };
  });

  return {
    overall: {
      totalPrograms,
      inProgressPrograms,
      completedPrograms,
      totalAllocatedBudget,
      totalSpentBudget,
      overallAbsorptionRate,
      totalBeneficiaries,
      transparencyScore: govScore,
      environmentalBudget: envAllocated,
      socialBudget: socAllocated,
      governanceBudget: totalAllocatedBudget,
    },
    pillars,
    focusDistributions,
  };
}

/**
 * Generate CSV file dan trigger download langsung di browser
 */
export function exportProgramsCsv(programs: ProgramAnalyticsData[], organizationName?: string) {
  const headers = [
    "No",
    "Judul Program CSR",
    "Bidang Fokus",
    "Pilar ESG",
    "Perusahaan Sponsor",
    "Mitra Pelaksana",
    "Kota / Wilayah",
    "Status Pelaksanaan",
    "Anggaran MoU (IDR)",
    "Realisasi Serapan (IDR)",
    "% Serapan",
    "Capaian Penerima Manfaat",
    "Periode Mulai",
    "Periode Selesai",
  ];

  const rows = programs.map((p, index) => {
    const details = FOCUS_AREA_DETAILS[p.focusArea as CsrFocusArea] || {
      label: p.focusArea,
      pillar: "SOCIAL",
    };
    const b = p.budget ? parseFloat(p.budget) : 0;
    const s = p.spentBudget ? parseFloat(p.spentBudget) : 0;
    const rate = b > 0 ? Math.round((s / b) * 100) : 0;

    return [
      String(index + 1),
      `"${(p.title || "").replace(/"/g, '""')}"`,
      `"${details.label}"`,
      `"${details.pillar}"`,
      `"${(p.companyName || "").replace(/"/g, '""')}"`,
      `"${(p.partnerName || "").replace(/"/g, '""')}"`,
      `"${(p.targetCity || "").replace(/"/g, '""')}"`,
      `"${p.status}"`,
      String(b),
      String(s),
      `${rate}%`,
      `"${(p.actualBeneficiaries || p.targetBeneficiaries || "-").replace(/"/g, '""')}"`,
      `"${formatDate(p.startDate)}"`,
      `"${formatDate(p.endDate)}"`,
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `Laporan_ESG_CSR_${(organizationName || "Portofolio").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
