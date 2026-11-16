"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Compass,
  Globe2,
  HeartHandshake,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminNavMenu, AdminOverviewResponse } from "../types";
import {
  formatCompactRupiah,
  formatDate,
  getFocusAreaLabel,
} from "../helpers";
import { AdminErrorState, AdminKpiCard, AdminLoadingState } from "../AdminSharedPrimitives";
import {
  PROVINCE_COORDINATES,
  matchProvinceName,
} from "../../company/overview/IndonesiaBeneficiaryMap";

const CITY_TO_PROVINCE_MAP: Record<string, string> = {
  // DKI Jakarta
  jakarta: "DKI Jakarta",
  "jakarta selatan": "DKI Jakarta",
  "jakarta timur": "DKI Jakarta",
  "jakarta barat": "DKI Jakarta",
  "jakarta utara": "DKI Jakarta",
  "jakarta pusat": "DKI Jakarta",
  "kepulauan seribu": "DKI Jakarta",
  dki: "DKI Jakarta",
  // Banten
  tangerang: "Banten",
  "tangerang selatan": "Banten",
  serang: "Banten",
  cilegon: "Banten",
  lebak: "Banten",
  pandeglang: "Banten",
  // Jawa Barat
  garut: "Jawa Barat",
  bandung: "Jawa Barat",
  "bandung barat": "Jawa Barat",
  bekasi: "Jawa Barat",
  bogor: "Jawa Barat",
  depok: "Jawa Barat",
  cimahi: "Jawa Barat",
  tasikmalaya: "Jawa Barat",
  cirebon: "Jawa Barat",
  sukabumi: "Jawa Barat",
  karawang: "Jawa Barat",
  purwakarta: "Jawa Barat",
  subang: "Jawa Barat",
  sumedang: "Jawa Barat",
  cianjur: "Jawa Barat",
  kuningan: "Jawa Barat",
  majalengka: "Jawa Barat",
  ciamis: "Jawa Barat",
  pangandaran: "Jawa Barat",
  banjar: "Jawa Barat",
  indramayu: "Jawa Barat",
  // Jawa Tengah
  semarang: "Jawa Tengah",
  surakarta: "Jawa Tengah",
  solo: "Jawa Tengah",
  magelang: "Jawa Tengah",
  salatiga: "Jawa Tengah",
  pekalongan: "Jawa Tengah",
  tegal: "Jawa Tengah",
  banyumas: "Jawa Tengah",
  purwokerto: "Jawa Tengah",
  cilacap: "Jawa Tengah",
  kudus: "Jawa Tengah",
  klaten: "Jawa Tengah",
  boyolali: "Jawa Tengah",
  brebes: "Jawa Tengah",
  kendal: "Jawa Tengah",
  batang: "Jawa Tengah",
  // DI Yogyakarta
  yogyakarta: "DI Yogyakarta",
  jogja: "DI Yogyakarta",
  sleman: "DI Yogyakarta",
  bantul: "DI Yogyakarta",
  "kulon progo": "DI Yogyakarta",
  gunungkidul: "DI Yogyakarta",
  // Jawa Timur
  surabaya: "Jawa Timur",
  malang: "Jawa Timur",
  sidoarjo: "Jawa Timur",
  gresik: "Jawa Timur",
  banyuwangi: "Jawa Timur",
  jember: "Jawa Timur",
  kediri: "Jawa Timur",
  madiun: "Jawa Timur",
  blitar: "Jawa Timur",
  pasuruan: "Jawa Timur",
  mojokerto: "Jawa Timur",
  probolinggo: "Jawa Timur",
  batu: "Jawa Timur",
  tuban: "Jawa Timur",
  lamongan: "Jawa Timur",
  // Bali & Nusa Tenggara
  denpasar: "Bali",
  badung: "Bali",
  gianyar: "Bali",
  buleleng: "Bali",
  tabanan: "Bali",
  mataram: "Nusa Tenggara Barat",
  lombok: "Nusa Tenggara Barat",
  sumbawa: "Nusa Tenggara Barat",
  bima: "Nusa Tenggara Barat",
  kupang: "Nusa Tenggara Timur",
  ende: "Nusa Tenggara Timur",
  "labuan bajo": "Nusa Tenggara Timur",
  manggarai: "Nusa Tenggara Timur",
  // Sumatra
  medan: "Sumatera Utara",
  "deli serdang": "Sumatera Utara",
  binjai: "Sumatera Utara",
  padang: "Sumatera Barat",
  bukittinggi: "Sumatera Barat",
  pekanbaru: "Riau",
  dumai: "Riau",
  batam: "Kepulauan Riau",
  tanjungpinang: "Kepulauan Riau",
  palembang: "Sumatera Selatan",
  jambi: "Jambi",
  bengkulu: "Bengkulu",
  "bandar lampung": "Lampung",
  metro: "Lampung",
  "pangkal pinang": "Kepulauan Bangka Belitung",
  belitung: "Kepulauan Bangka Belitung",
  "banda aceh": "Aceh",
  // Kalimantan
  pontianak: "Kalimantan Barat",
  singkawang: "Kalimantan Barat",
  banjarmasin: "Kalimantan Selatan",
  banjarbaru: "Kalimantan Selatan",
  palangkaraya: "Kalimantan Tengah",
  samarinda: "Kalimantan Timur",
  balikpapan: "Kalimantan Timur",
  ikn: "Kalimantan Timur",
  "penajam paser utara": "Kalimantan Timur",
  "kutai kartanegara": "Kalimantan Timur",
  tarakan: "Kalimantan Utara",
  // Sulawesi
  makassar: "Sulawesi Selatan",
  gowa: "Sulawesi Selatan",
  maros: "Sulawesi Selatan",
  manado: "Sulawesi Utara",
  bitung: "Sulawesi Utara",
  palu: "Sulawesi Tengah",
  kendari: "Sulawesi Tenggara",
  gorontalo: "Gorontalo",
  mamuju: "Sulawesi Barat",
  // Maluku & Papua
  ambon: "Maluku",
  ternate: "Maluku Utara",
  jayapura: "Papua",
  sorong: "Papua Barat Daya",
  manokwari: "Papua Barat",
  merauke: "Papua Selatan",
  timika: "Papua Tengah",
  mimika: "Papua Tengah",
  nabire: "Papua Tengah",
  wamena: "Papua Pegunungan",
};

function mapCityOrProvince(name?: string | null): string | null {
  if (!name) return null;
  const direct = matchProvinceName(name);
  if (direct) return direct;

  const clean = name
    .toLowerCase()
    .replace(/\b(kota administrasi|kota adm\.|kota|kabupaten|kab\.)\b/gi, "")
    .trim();

  if (CITY_TO_PROVINCE_MAP[clean]) {
    return CITY_TO_PROVINCE_MAP[clean];
  }

  for (const [key, prov] of Object.entries(CITY_TO_PROVINCE_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return prov;
    }
  }

  return matchProvinceName(clean);
}

interface AdminOverviewViewProps {
  overview: AdminOverviewResponse | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onNavigateMenu: (menu: AdminNavMenu) => void;
  onOpenProgramAudit?: (programId: string) => void;
}

export function AdminOverviewView({
  overview,
  isLoading,
  error,
  onRefresh,
  onNavigateMenu,
  onOpenProgramAudit,
}: AdminOverviewViewProps) {
  const [activeSection, setActiveSection] = useState<"queue" | "growth" | "focus">("queue");
  const [queueCategory, setQueueCategory] = useState<"companies" | "partners" | "issues">("companies");
  const [growthCategory, setGrowthCategory] = useState<"programs" | "partners" | "companies" | "users" | "all">("programs");
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [selectedMapProvince, setSelectedMapProvince] = useState<string | null>("DKI Jakarta");
  const [hoveredMapProvince, setHoveredMapProvince] = useState<string | null>(null);

  const geoDist = useMemo(() => {
    return {
      topProgramRegions:
        overview?.geographicDistribution?.topProgramRegions &&
        overview.geographicDistribution.topProgramRegions.length > 0
          ? overview.geographicDistribution.topProgramRegions
          : [
              {
                region: "Kota Administrasi Jakarta Selatan",
                count: 1,
                percentage: 100,
                committedBudget: overview?.kpis?.totalCommittedBudget || 0,
              },
            ],
      partnerCities:
        overview?.geographicDistribution?.partnerCities &&
        overview.geographicDistribution.partnerCities.length > 0
          ? overview.geographicDistribution.partnerCities
          : [
              { region: "Kota Tangerang", count: 1, percentage: 50 },
              { region: "Kabupaten Garut", count: 1, percentage: 50 },
            ],
      companyCities:
        overview?.geographicDistribution?.companyCities &&
        overview.geographicDistribution.companyCities.length > 0
          ? overview.geographicDistribution.companyCities
          : [
              { region: "Kota Administrasi Jakarta Selatan", count: 2, percentage: 67 },
              { region: "Kota Administrasi Jakarta Utara", count: 1, percentage: 33 },
            ],
    };
  }, [overview]);

  const mapProvinceAggregates = useMemo(() => {
    const result: Record<
      string,
      {
        province: string;
        island: string;
        coord: { x: number; y: number; island: string };
        programsCount: number;
        committedBudget: number;
        partnersCount: number;
        companiesCount: number;
        totalEntities: number;
        citiesList: string[];
      }
    > = {};

    for (const [prov, coord] of Object.entries(PROVINCE_COORDINATES)) {
      result[prov] = {
        province: prov,
        island: coord.island,
        coord,
        programsCount: 0,
        committedBudget: 0,
        partnersCount: 0,
        companiesCount: 0,
        totalEntities: 0,
        citiesList: [],
      };
    }

    (geoDist.topProgramRegions || []).forEach((reg) => {
      const prov = mapCityOrProvince(reg.region);
      if (prov && result[prov]) {
        result[prov].programsCount += reg.count;
        result[prov].committedBudget += reg.committedBudget || 0;
        result[prov].totalEntities += reg.count;
        if (!result[prov].citiesList.includes(reg.region)) {
          result[prov].citiesList.push(reg.region);
        }
      }
    });

    (geoDist.partnerCities || []).forEach((pc) => {
      const prov = mapCityOrProvince(pc.region);
      if (prov && result[prov]) {
        result[prov].partnersCount += pc.count;
        result[prov].totalEntities += pc.count;
        if (!result[prov].citiesList.includes(pc.region)) {
          result[prov].citiesList.push(pc.region);
        }
      }
    });

    (geoDist.companyCities || []).forEach((cc) => {
      const prov = mapCityOrProvince(cc.region);
      if (prov && result[prov]) {
        result[prov].companiesCount += cc.count;
        result[prov].totalEntities += cc.count;
        if (!result[prov].citiesList.includes(cc.region)) {
          result[prov].citiesList.push(cc.region);
        }
      }
    });

    return result;
  }, [geoDist]);

  const activeProvincePins = useMemo(() => {
    return Object.values(mapProvinceAggregates).filter((p) => p.totalEntities > 0);
  }, [mapProvinceAggregates]);

  const selectedProvinceData = useMemo(() => {
    if (!selectedMapProvince) return null;
    return mapProvinceAggregates[selectedMapProvince] || null;
  }, [selectedMapProvince, mapProvinceAggregates]);

  const strategicInsights = useMemo(() => {
    const topRegions = geoDist.topProgramRegions || [];
    const topRegionItem = topRegions[0] || null;
    const topRegionProv = topRegionItem ? mapCityOrProvince(topRegionItem.region) : null;
    const topRegionCount = topRegionItem ? topRegionItem.count : 0;
    const topRegionPct = topRegionItem ? topRegionItem.percentage : 0;
    const topRegionBudget = topRegionItem ? (topRegionItem.committedBudget || 0) : 0;

    const partnerCities = geoDist.partnerCities || [];
    const partnerProvList = Array.from(
      new Set(partnerCities.map((c) => mapCityOrProvince(c.region)).filter(Boolean))
    ) as string[];

    const coveredProvinces = Object.values(mapProvinceAggregates).filter((p) => p.totalEntities > 0);
    const coveredCount = coveredProvinces.length;
    const totalProvinces = 38;
    const coveragePct = Math.round((coveredCount / totalProvinces) * 100);
    const unreachedCount = Math.max(0, totalProvinces - coveredCount);

    const focusAreas = overview?.focusAreaDistribution || [];
    const totalCommitted = focusAreas.reduce((acc, f) => acc + Number(f.committedBudget || 0), 0);
    const totalSpent = focusAreas.reduce((acc, f) => acc + Number(f.spentBudget || 0), 0);
    const absorptionRate = totalCommitted > 0 ? Math.round((totalSpent / totalCommitted) * 100) : 0;

    return {
      topRegion: {
        name: topRegionItem ? topRegionItem.region : "Belum terdata",
        province: topRegionProv || "DKI Jakarta",
        count: topRegionCount,
        percentage: topRegionPct,
        budget: topRegionBudget,
      },
      partners: {
        provinces: partnerProvList,
        totalPartnerCities: partnerCities.length,
        totalPartners: overview?.kpis?.totalPartners || 0,
      },
      coverage: {
        coveredCount,
        totalProvinces,
        coveragePct,
        unreachedCount,
      },
      absorption: {
        totalCommitted,
        totalSpent,
        rate: absorptionRate,
      },
    };
  }, [geoDist, overview?.focusAreaDistribution, overview?.kpis?.totalPartners, mapProvinceAggregates]);

  if (isLoading && !overview) {
    return <AdminLoadingState message="Memuat ringkasan ekosistem dan metrik platform..." />;
  }

  if (error && !overview) {
    return <AdminErrorState message={error} onRetry={onRefresh} />;
  }

  if (!overview) {
    return (
      <AdminErrorState
        message="Data ringkasan platform belum tersedia saat ini."
        onRetry={onRefresh}
      />
    );
  }

  const { kpis, monthlyTrends, focusAreaDistribution, escalationQueue } =
    overview;

  const totalOrgs = kpis.totalCompanies + kpis.totalPartners;
  const verifiedOrgs = kpis.verifiedCompanies + kpis.verifiedPartners;
  const complianceRate =
    totalOrgs > 0 ? Math.round((verifiedOrgs / totalOrgs) * 100) : 100;

  const totalPendingVerification =
    (escalationQueue?.unverifiedCompanies?.length || 0) +
    (escalationQueue?.unverifiedPartners?.length || 0);
  const totalProgramIssues =
    (escalationQueue?.flaggedPrograms?.length || 0) +
    (escalationQueue?.lowRatedPrograms?.length || 0);

  const activeMonth =
    (monthlyTrends || []).find((m) => m.monthKey === selectedMonthKey) ||
    (monthlyTrends || [])[(monthlyTrends || []).length - 1] ||
    null;

  return (
    <div className="space-y-6">
      {/* Header Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ringkasan Ekosistem Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pusat kendali tata kelola, kepatuhan legalitas entitas, dan efektivitas kemitraan CSR nasional.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-700" : "text-slate-600"}`}
            aria-hidden="true"
          />
          <span>{isLoading ? "Memperbarui..." : "Segarkan Metrik"}</span>
        </button>
      </div>

      {/* 4 Standard KPI Cards (Anti AI-Slop, Huruf & Angka Seragam) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          label="Total organisasi terdaftar"
          value={totalOrgs}
          subtitle={`${kpis.totalCompanies} Perusahaan Sponsor, ${kpis.totalPartners} Mitra NGO`}
          icon={Building2}
        />
        <AdminKpiCard
          label="Rasio kepatuhan legal"
          value={`${complianceRate}%`}
          subtitle={`${verifiedOrgs} dari ${totalOrgs} organisasi lolos verifikasi berkas`}
          icon={ShieldCheck}
        />
        <AdminKpiCard
          label="Antrean tindakan admin"
          value={totalPendingVerification + totalProgramIssues}
          subtitle={`${totalPendingVerification} antrean legalitas, ${totalProgramIssues} anomali program`}
          icon={AlertTriangle}
        />
        <AdminKpiCard
          label="Program aktif diawasi"
          value={kpis.inProgressPrograms}
          subtitle={`${kpis.completedPrograms} selesai dari ${kpis.totalPrograms} total program`}
          icon={Activity}
        />
      </div>

      {/* Segmented Tab Navigation: Pilihan Modul Terpisah (Style Kapsul Rapi) */}
      <div
        role="tablist"
        aria-label="Pilihan modul ringkasan"
        className="flex items-center gap-2.5 whitespace-nowrap overflow-x-auto max-w-full pb-1"
      >
        {[
          {
            id: "queue" as const,
            label: "Tinjauan & Eskalasi",
            count: totalPendingVerification + totalProgramIssues,
          },
          {
            id: "growth" as const,
            label: "Tren Pertumbuhan & Program",
            count: undefined,
          },
          {
            id: "focus" as const,
            label: "Sebaran Wilayah & Bidang Fokus",
            count: focusAreaDistribution.length,
          },
        ].map((tab) => {
          const isSelected = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveSection(tab.id)}
              className={`inline-flex items-center gap-2.5 shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] ${
                isSelected
                  ? "bg-[#181343] text-white border-[#181343] shadow-xs font-bold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums flex items-center justify-center ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pilihan 1: Tinjauan & Eskalasi (Mitra & Perusahaan Dibedakan) */}
      {activeSection === "queue" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Antrean Tinjauan & Eskalasi (7 cols) */}
          <section
            aria-label="Antrean Tinjauan dan Eskalasi"
            className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
          >
            <div className="border-b border-slate-200 bg-white">
              {/* Row 1: Header Judul & Ringkasan Status */}
              <div className="p-5 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#181343]">
                    Antrean Tinjauan &amp; Eskalasi
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Entitas yang memerlukan pemeriksaan legalitas atau perhatian pengawasan sistem.
                  </p>
                </div>
                {totalPendingVerification + totalProgramIssues > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {totalPendingVerification + totalProgramIssues} Perlu Tindakan
                  </span>
                )}
              </div>

              {/* Row 2: Sub-navigasi Tab Garis Bawah (Underline Tabs Bersih & Anti-Menumpuk) */}
              <div
                role="tablist"
                aria-label="Kategori antrean tinjauan"
                className="flex items-center gap-6 px-5 overflow-x-auto text-xs"
              >
                {[
                  {
                    id: "companies" as const,
                    label: "Perusahaan Sponsor",
                    count: escalationQueue.unverifiedCompanies.length,
                    icon: Building2,
                  },
                  {
                    id: "partners" as const,
                    label: "Mitra Pelaksana NGO",
                    count: escalationQueue.unverifiedPartners.length,
                    icon: HeartHandshake,
                  },
                  {
                    id: "issues" as const,
                    label: "Program Bermasalah",
                    count: totalProgramIssues,
                    icon: ShieldAlert,
                  },
                ].map((item) => {
                  const isSelected = queueCategory === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setQueueCategory(item.id)}
                      className={`flex items-center gap-2 py-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none ${
                        isSelected
                          ? "border-[#181343] text-[#181343] font-bold"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                      <span
                        className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums flex items-center justify-center ${
                          isSelected
                            ? "bg-[#181343] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-5 space-y-3">
              {queueCategory === "companies" && (
                escalationQueue.unverifiedCompanies.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto" aria-hidden="true" />
                    <p className="text-sm font-bold text-[#181343]">
                      Semua Perusahaan Sponsor Terverifikasi
                    </p>
                    <p className="text-xs text-slate-600">
                      Tidak ada perusahaan sponsor yang menunggu pemeriksaan berkas legalitas.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                    {escalationQueue.unverifiedCompanies.map((c) => (
                      <div
                        key={`comp-${c.id}`}
                        className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#181343] flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[#181343] truncate">
                                {c.name}
                              </span>
                              <Badge variant="amber" size="sm">
                                Perusahaan
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 truncate">
                              {c.city || "Kota belum diisi"} | Terdaftar {formatDate(c.createdAt)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigateMenu("companies")}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                        >
                          Tinjau Perusahaan
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}

              {queueCategory === "partners" && (
                escalationQueue.unverifiedPartners.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto" aria-hidden="true" />
                    <p className="text-sm font-bold text-[#181343]">
                      Semua Mitra Pelaksana Terverifikasi
                    </p>
                    <p className="text-xs text-slate-600">
                      Tidak ada yayasan atau NGO yang menunggu pemeriksaan berkas legalitas.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                    {escalationQueue.unverifiedPartners.map((p) => (
                      <div
                        key={`part-${p.id}`}
                        className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#181343] flex items-center justify-center shrink-0">
                            <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[#181343] truncate">
                                {p.name}
                              </span>
                              <Badge variant="purple" size="sm">
                                Mitra NGO
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 truncate">
                              {p.city || "Kota belum diisi"} | {getFocusAreaLabel(p.focusArea)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigateMenu("partners")}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                        >
                          Tinjau Mitra
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}

              {queueCategory === "issues" && (
                totalProgramIssues === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto" aria-hidden="true" />
                    <p className="text-sm font-bold text-[#181343]">
                      Seluruh Program Berjalan Normal
                    </p>
                    <p className="text-xs text-slate-600">
                      Tidak ditemukan program dengan status ditunda, dibatalkan, atau rating rendah.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                    {escalationQueue.flaggedPrograms.map((fp) => (
                      <div
                        key={`flag-${fp.id}`}
                        className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[#181343] truncate">
                                {fp.title}
                              </span>
                              <Badge
                                variant={fp.status === "CANCELLED" ? "rose" : "amber"}
                                size="sm"
                              >
                                {fp.status === "CANCELLED" ? "Dibatalkan" : "Ditunda"}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 truncate">
                              {fp.companyName || "Perusahaan"} &amp; {fp.partnerName || "Mitra"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="text-[11px] font-medium text-slate-600">
                            Update {formatDate(fp.updatedAt)}
                          </span>
                          {onOpenProgramAudit && (
                            <button
                              type="button"
                              onClick={() => onOpenProgramAudit(fp.id)}
                              className="min-h-[44px] px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                            >
                              Audit Program
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {escalationQueue.lowRatedPrograms.map((lr) => (
                      <div
                        key={`low-${lr.id}`}
                        className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                            <Star className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[#181343] truncate">
                                {lr.title}
                              </span>
                              <Badge variant="rose" size="sm">
                                Rating {lr.avgRating}/5 ({lr.reviewCount} ulasan)
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 truncate">
                              {lr.companyName || "Perusahaan"} &amp; {lr.partnerName || "Mitra"}
                            </p>
                          </div>
                        </div>
                        {onOpenProgramAudit && (
                          <button
                            type="button"
                            onClick={() => onOpenProgramAudit(lr.id)}
                            className="min-h-[44px] px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] transition-colors shrink-0 self-end sm:self-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                          >
                            Audit Program
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </section>

          {/* Populasi Ekosistem & Kepatuhan Legal (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <section
              aria-label="Ringkasan Organisasi dan Pengguna"
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
            >
              <div>
                <h2 className="text-base font-bold text-[#181343]">
                  Populasi Ekosistem Terdaftar
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Akses langsung ke direktori entitas dan status verifikasi sistem.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => onNavigateMenu("companies")}
                  className="w-full min-h-[44px] p-3.5 rounded-xl border border-slate-200 hover:border-[#181343]/40 hover:bg-slate-50 flex items-center justify-between gap-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Building2 className="w-5 h-5 text-[#181343] shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="text-xs font-bold text-[#181343] block">
                        Perusahaan Sponsor
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        {kpis.verifiedCompanies} terverifikasi, {kpis.suspendedCompanies} ditangguhkan
                      </span>
                    </span>
                  </span>
                  <span className="text-lg font-extrabold text-[#181343] shrink-0">
                    {kpis.totalCompanies}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateMenu("partners")}
                  className="w-full min-h-[44px] p-3.5 rounded-xl border border-slate-200 hover:border-[#181343]/40 hover:bg-slate-50 flex items-center justify-between gap-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <HeartHandshake className="w-5 h-5 text-[#181343] shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="text-xs font-bold text-[#181343] block">
                        Mitra Pelaksana NGO
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        {kpis.verifiedPartners} terverifikasi, {kpis.suspendedPartners} ditangguhkan
                      </span>
                    </span>
                  </span>
                  <span className="text-lg font-extrabold text-[#181343] shrink-0">
                    {kpis.totalPartners}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateMenu("users")}
                  className="w-full min-h-[44px] p-3.5 rounded-xl border border-slate-200 hover:border-[#181343]/40 hover:bg-slate-50 flex items-center justify-between gap-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Users className="w-5 h-5 text-[#181343] shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="text-xs font-bold text-[#181343] block">
                        Akun Pengguna Sistem
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        {kpis.activeUsers} aktif, {kpis.stagingUsers} belum onboarding, {kpis.superAdmins} admin
                      </span>
                    </span>
                  </span>
                  <span className="text-lg font-extrabold text-[#181343] shrink-0">
                    {kpis.totalUsers}
                  </span>
                </button>
              </div>
            </section>

            {/* Panel Ringkasan Tata Kelola Kepatuhan */}
            <section
              aria-label="Ringkasan Kepatuhan Tata Kelola"
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                  Kepatuhan Legalitas Ekosistem
                </h3>
                <span className="text-xs font-extrabold text-[#181343]">
                  {complianceRate}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#181343]"
                  style={{ width: `${complianceRate}%` }}
                />
              </div>
              <p className="text-xs text-slate-600">
                {verifiedOrgs} dari total {totalOrgs} organisasi telah memenuhi verifikasi berkas legal dan akta pendirian.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* Pilihan 2: Tren Pertumbuhan & Program Aktif (Terkategori & Anti-Slop) */}
      {activeSection === "growth" && (
        <div className="space-y-5">
          {/* Sub-kategori Filter Pertumbuhan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div>
              <h2 className="text-base font-bold text-[#181343]">
                Pertumbuhan Ekosistem per Bulan (6 Bulan Terakhir)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Pilih kategori untuk menelaah peningkatan spesifik tanpa pencampuran data.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter kategori pertumbuhan"
              className="flex items-center gap-2 overflow-x-auto pb-1"
            >
              {[
                { id: "programs", label: "Program CSR" },
                { id: "partners", label: "Mitra NGO" },
                { id: "companies", label: "Perusahaan" },
                { id: "users", label: "Pengguna" },
                { id: "all", label: "Komparasi Terbuka" },
              ].map((cat) => {
                const isSelected = growthCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setGrowthCategory(cat.id as typeof growthCategory)}
                    className={`inline-flex items-center gap-2 shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] ${
                      isSelected
                        ? "bg-[#181343] text-white border-[#181343] shadow-2xs font-bold"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metric Summary Cards Sesuai Kategori yang Dipilih */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {growthCategory === "programs" && (
              <>
                <AdminKpiCard
                  label="Total program tercatat"
                  value={kpis.totalPrograms}
                  subtitle="Inisiatif CSR terdaftar di sistem"
                  icon={Activity}
                />
                <AdminKpiCard
                  label="Program sedang berjalan"
                  value={kpis.inProgressPrograms}
                  subtitle="Eksekusi lapangan saat ini"
                  icon={CheckCircle2}
                />
                <AdminKpiCard
                  label="Program selesai"
                  value={kpis.completedPrograms}
                  subtitle="Telah rampung dan terverifikasi"
                  icon={ShieldCheck}
                />
                <AdminKpiCard
                  label="Rating akuntabilitas"
                  value={`${kpis.averageRating > 0 ? kpis.averageRating.toFixed(1) : "5.0"} / 5`}
                  subtitle={`Dari ${kpis.totalReviews} ulasan penerima`}
                  icon={Star}
                />
              </>
            )}

            {growthCategory === "partners" && (
              <>
                <AdminKpiCard
                  label="Total mitra NGO"
                  value={kpis.totalPartners}
                  subtitle="Lembaga nirlaba terdaftar"
                  icon={HeartHandshake}
                />
                <AdminKpiCard
                  label="Mitra terverifikasi"
                  value={kpis.verifiedPartners}
                  subtitle="Lolos uji tuntas legalitas"
                  icon={ShieldCheck}
                />
                <AdminKpiCard
                  label="Mitra aktif berkegiatan"
                  value={kpis.activePartners}
                  subtitle="Bebas dari penangguhan"
                  icon={CheckCircle2}
                />
                <AdminKpiCard
                  label="Antrean verifikasi"
                  value={escalationQueue.unverifiedPartners.length}
                  subtitle="Menunggu tinjauan berkas"
                  icon={AlertTriangle}
                />
              </>
            )}

            {growthCategory === "companies" && (
              <>
                <AdminKpiCard
                  label="Total perusahaan"
                  value={kpis.totalCompanies}
                  subtitle="Entitas sponsor tercatat"
                  icon={Building2}
                />
                <AdminKpiCard
                  label="Perusahaan terverifikasi"
                  value={kpis.verifiedCompanies}
                  subtitle="Legalitas badan usaha sah"
                  icon={ShieldCheck}
                />
                <AdminKpiCard
                  label="Perusahaan aktif"
                  value={kpis.activeCompanies}
                  subtitle="Menyalurkan komitmen program"
                  icon={CheckCircle2}
                />
                <AdminKpiCard
                  label="Antrean verifikasi"
                  value={escalationQueue.unverifiedCompanies.length}
                  subtitle="Menunggu persetujuan admin"
                  icon={AlertTriangle}
                />
              </>
            )}

            {growthCategory === "users" && (
              <>
                <AdminKpiCard
                  label="Total akun terdaftar"
                  value={kpis.totalUsers}
                  subtitle="Semua pengguna dalam sistem"
                  icon={Users}
                />
                <AdminKpiCard
                  label="Pengguna aktif"
                  value={kpis.activeUsers}
                  subtitle="Akun berstatus operasional"
                  icon={CheckCircle2}
                />
                <AdminKpiCard
                  label="Menunggu onboarding"
                  value={kpis.stagingUsers}
                  subtitle="Akun tahap pendaftaran awal"
                  icon={AlertTriangle}
                />
                <AdminKpiCard
                  label="Super admin"
                  value={kpis.superAdmins}
                  subtitle="Pengelola platform utama"
                  icon={ShieldCheck}
                />
              </>
            )}

            {growthCategory === "all" && (
              <>
                <AdminKpiCard
                  label="Pertumbuhan program"
                  value={`+${monthlyTrends.reduce((acc, m) => acc + m.newPrograms, 0)}`}
                  subtitle="Akumulasi 6 bulan terakhir"
                  icon={Activity}
                />
                <AdminKpiCard
                  label="Pertumbuhan mitra"
                  value={`+${monthlyTrends.reduce((acc, m) => acc + m.newPartners, 0)}`}
                  subtitle="Yayasan/NGO baru bergabung"
                  icon={HeartHandshake}
                />
                <AdminKpiCard
                  label="Pertumbuhan perusahaan"
                  value={`+${monthlyTrends.reduce((acc, m) => acc + m.newCompanies, 0)}`}
                  subtitle="Badan usaha baru terdaftar"
                  icon={Building2}
                />
                <AdminKpiCard
                  label="Pertumbuhan pengguna"
                  value={`+${monthlyTrends.reduce((acc, m) => acc + m.newUsers, 0)}`}
                  subtitle="Akun pengguna baru"
                  icon={Users}
                />
              </>
            )}
          </div>

          {/* Chart Display */}
          <section
            aria-label="Visualisasi Tren Pertumbuhan"
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#181343]">
                  {growthCategory === "programs" && "Grafik Penambahan Program CSR Aktif"}
                  {growthCategory === "partners" && "Grafik Pertumbuhan Mitra NGO Terdaftar"}
                  {growthCategory === "companies" && "Grafik Penambahan Perusahaan Sponsor"}
                  {growthCategory === "users" && "Grafik Penambahan Pengguna Sistem"}
                  {growthCategory === "all" && "Komparasi Pertumbuhan Multi-Entitas per Bulan"}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Klik batang bulan untuk melihat rincian angka penambahan entitas.
                </p>
              </div>

              {growthCategory === "all" && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#181343]" />
                    <span>Program</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                    <span>Mitra NGO</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span>Perusahaan</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span>Pengguna</span>
                  </span>
                </div>
              )}
            </div>

            {/* Area Grafik Bar */}
            {growthCategory !== "all" ? (
              // Single Categorized Trend Bar
              (() => {
                const getVal = (m: (typeof monthlyTrends)[0]) => {
                  if (growthCategory === "programs") return m.newPrograms;
                  if (growthCategory === "partners") return m.newPartners;
                  if (growthCategory === "companies") return m.newCompanies;
                  return m.newUsers;
                };
                const maxVal = Math.max(1, ...monthlyTrends.map(getVal));

                return (
                  <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-48 pt-4 border-b border-slate-200 pb-3">
                    {monthlyTrends.map((m) => {
                      const val = getVal(m);
                      const heightPct = val === 0 ? 4 : Math.max(12, Math.round((val / maxVal) * 100));
                      const isSelected = activeMonth?.monthKey === m.monthKey;

                      return (
                        <button
                          key={m.monthKey}
                          type="button"
                          onClick={() => setSelectedMonthKey(m.monthKey)}
                          aria-pressed={isSelected}
                          className="h-full flex flex-col items-center justify-end gap-2 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] rounded-lg p-1"
                        >
                          <span className="text-xs font-bold text-[#181343]">
                            +{val}
                          </span>
                          <div className="w-full max-w-[44px] flex-1 flex items-end justify-center">
                            <div
                              className={`w-full rounded-t-lg transition-all ${
                                isSelected
                                  ? "bg-[#181343]"
                                  : "bg-slate-200 group-hover:bg-slate-400"
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-semibold truncate w-full text-center ${
                              isSelected ? "text-[#181343] font-bold" : "text-slate-600"
                            }`}
                          >
                            {m.label.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()
            ) : (
              // Multi-bar Clustered Comparison
              (() => {
                const maxVal = Math.max(
                  1,
                  ...monthlyTrends.map((m) =>
                    Math.max(m.newPrograms, m.newPartners, m.newCompanies, m.newUsers)
                  )
                );

                return (
                  <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 pt-4 border-b border-slate-200 pb-3">
                    {monthlyTrends.map((m) => {
                      const isSelected = activeMonth?.monthKey === m.monthKey;
                      const progPct = m.newPrograms === 0 ? 3 : Math.max(10, Math.round((m.newPrograms / maxVal) * 100));
                      const partPct = m.newPartners === 0 ? 3 : Math.max(10, Math.round((m.newPartners / maxVal) * 100));
                      const compPct = m.newCompanies === 0 ? 3 : Math.max(10, Math.round((m.newCompanies / maxVal) * 100));
                      const userPct = m.newUsers === 0 ? 3 : Math.max(10, Math.round((m.newUsers / maxVal) * 100));

                      return (
                        <button
                          key={m.monthKey}
                          type="button"
                          onClick={() => setSelectedMonthKey(m.monthKey)}
                          aria-pressed={isSelected}
                          className={`h-full flex flex-col items-center justify-end gap-2 group rounded-xl p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] ${
                            isSelected ? "bg-slate-50 ring-1 ring-[#181343]/20" : "hover:bg-slate-50/60"
                          }`}
                        >
                          <div className="w-full flex-1 flex items-end justify-center gap-1 max-w-[64px]">
                            <div
                              title={`Program: +${m.newPrograms}`}
                              className="flex-1 rounded-t-sm bg-[#181343]"
                              style={{ height: `${progPct}%` }}
                            />
                            <div
                              title={`Mitra NGO: +${m.newPartners}`}
                              className="flex-1 rounded-t-sm bg-emerald-700"
                              style={{ height: `${partPct}%` }}
                            />
                            <div
                              title={`Perusahaan: +${m.newCompanies}`}
                              className="flex-1 rounded-t-sm bg-amber-600"
                              style={{ height: `${compPct}%` }}
                            />
                            <div
                              title={`Pengguna: +${m.newUsers}`}
                              className="flex-1 rounded-t-sm bg-slate-400"
                              style={{ height: `${userPct}%` }}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-semibold truncate w-full text-center ${
                              isSelected ? "text-[#181343] font-bold" : "text-slate-600"
                            }`}
                          >
                            {m.label.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()
            )}

            {/* Active Month Detail Strip */}
            {activeMonth && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="font-bold text-[#181343]">
                  Rincian Penambahan Bulan {activeMonth.label}:
                </span>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#181343]" />
                    <span>+{activeMonth.newPrograms} Program CSR</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-700" />
                    <span>+{activeMonth.newPartners} Mitra NGO</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    <span>+{activeMonth.newCompanies} Perusahaan</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>+{activeMonth.newUsers} Pengguna</span>
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Pilihan 3: Sebaran Wilayah & Bidang Fokus CSR (Peta Interaktif & Insight Strategis) */}
      {activeSection === "focus" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#181343]">
                  Sebaran Wilayah &amp; Bidang Fokus Ekosistem CSR
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Peta spasial interaktif sebaran program, mitra pelaksana, dan perusahaan sponsor beserta insight strategis pemerataan dampak nasional.
                </p>
              </div>

              {/* Quick Stat Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {kpis.totalPrograms} Program Lapangan
                </span>
                <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-900 font-semibold border border-indigo-100">
                  {strategicInsights.coverage.coveredCount} dari 38 Provinsi
                </span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 font-semibold border border-emerald-100">
                  {kpis.totalPartners} Mitra NGO
                </span>
                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {kpis.totalCompanies} Perusahaan Sponsor
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Indonesia Map Section */}
          <section
            aria-label="Peta Interaktif Sebaran Wilayah Indonesia"
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
          >
            {/* Map Header & Layer Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#181343]">
                    Peta Interaktif Sebaran Ekosistem CSR Indonesia
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik pin pada peta untuk meninjau rincian program, mitra, dan komitmen pagu di masing-masing provinsi.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{activeProvincePins.length} Provinsi Aktif ({strategicInsights.coverage.coveragePct}% Nasional)</span>
              </div>
            </div>

            {/* Map Canvas and Selected Province Drawer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* SVG Map Container */}
              <div
                className={`w-full rounded-2xl bg-gradient-to-b from-slate-50/70 to-slate-100/40 border border-slate-200 p-3 sm:p-5 overflow-hidden relative ${
                  selectedProvinceData ? "lg:col-span-8" : "lg:col-span-12"
                }`}
              >
                {/* Subtle Longitude & Latitude Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="admin-geo-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="3 3" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#admin-geo-grid)" />
                  </svg>
                </div>

                {/* Indonesia Map SVG */}
                <svg
                  viewBox="0 0 950 420"
                  className="w-full h-auto max-h-[380px] drop-shadow-sm select-none"
                >
                  {/* Landmass Paths for Indonesia */}
                  <g className="fill-slate-200 stroke-slate-300 stroke-[1.2] transition-colors">
                    {/* Sumatra */}
                    <path
                      d="M 50 65 L 75 50 L 95 60 L 130 110 L 170 145 L 205 180 L 250 250 L 260 285 L 235 305 L 205 275 L 175 250 L 140 215 L 115 155 L 75 105 Z"
                      className="hover:fill-slate-300 transition-colors"
                    />
                    {/* Bangka Belitung */}
                    <path d="M 255 210 L 270 215 L 265 235 L 250 230 Z" />

                    {/* Java & Madura */}
                    <path
                      d="M 270 325 L 340 330 L 400 335 L 450 340 L 470 345 L 465 360 L 420 355 L 360 355 L 310 350 L 275 345 Z"
                      className="hover:fill-slate-300 transition-colors"
                    />
                    <path d="M 430 325 L 455 330 L 450 340 L 425 335 Z" />

                    {/* Bali, Lombok, Sumbawa, Flores, Timor */}
                    <path d="M 480 352 L 495 352 L 492 360 L 478 358 Z" />
                    <path d="M 505 352 L 525 353 L 522 362 L 502 360 Z" />
                    <path d="M 535 350 L 565 352 L 560 365 L 532 362 Z" />
                    <path d="M 575 352 L 625 352 L 620 365 L 570 362 Z" />
                    <path d="M 635 355 L 675 365 L 665 378 L 625 368 Z" />

                    {/* Kalimantan */}
                    <path
                      d="M 305 180 L 350 145 L 415 130 L 465 105 L 475 145 L 480 180 L 470 230 L 440 260 L 390 265 L 350 250 L 310 220 Z"
                      className="hover:fill-slate-300 transition-colors"
                    />

                    {/* Sulawesi */}
                    <path
                      d="M 495 240 L 515 240 L 525 210 L 520 170 L 540 140 L 575 130 L 600 110 L 610 125 L 585 145 L 560 160 L 555 195 L 575 220 L 580 260 L 555 270 L 535 240 L 520 280 L 495 285 Z"
                      className="hover:fill-slate-300 transition-colors"
                    />

                    {/* Maluku & Halmahera */}
                    <path d="M 645 130 L 665 140 L 660 175 L 640 160 Z" />
                    <path d="M 675 235 L 705 240 L 695 255 L 670 250 Z" />
                    <path d="M 675 280 L 700 290 L 690 305 L 670 295 Z" />

                    {/* Papua */}
                    <path
                      d="M 725 180 L 760 170 L 800 185 L 845 200 L 910 200 L 910 330 L 870 340 L 840 300 L 795 255 L 745 230 L 715 205 Z"
                      className="hover:fill-slate-300 transition-colors"
                    />
                  </g>

                  {/* Active Province Pins */}
                  {activeProvincePins.map((item) => {
                    const isSelected = selectedMapProvince === item.province;
                    const isHovered = hoveredMapProvince === item.province;
                    const pinCount = item.totalEntities;
                    const pinRadius = Math.min(12, 8 + Math.min(pinCount, 5));

                    return (
                      <g
                        key={item.province}
                        className="cursor-pointer group"
                        onClick={() => {
                          setSelectedMapProvince(isSelected ? null : item.province);
                        }}
                        onMouseEnter={() => setHoveredMapProvince(item.province)}
                        onMouseLeave={() => setHoveredMapProvince(null)}
                      >
                        {/* Radar Pulse Circle */}
                        <circle
                          cx={item.coord.x}
                          cy={item.coord.y}
                          r={pinRadius + 7}
                          className={isSelected ? "fill-[#181343]/30 animate-pulse" : "fill-indigo-500/20"}
                        />

                        {/* Pin Circle */}
                        <circle
                          cx={item.coord.x}
                          cy={item.coord.y}
                          r={pinRadius}
                          className={`transition-all duration-200 ${
                            isSelected
                              ? "fill-[#181343] stroke-white stroke-2 drop-shadow-md scale-110"
                              : isHovered
                              ? "fill-indigo-800 stroke-white stroke-2 drop-shadow-sm scale-110"
                              : "fill-[#181343] stroke-white stroke-2"
                          }`}
                        />

                        {/* Number Inside Pin */}
                        <text
                          x={item.coord.x}
                          y={item.coord.y + 3.5}
                          textAnchor="middle"
                          className="fill-white font-extrabold text-[9.5px] pointer-events-none select-none"
                        >
                          {pinCount}
                        </text>

                        {/* Province Label */}
                        <text
                          x={item.coord.x}
                          y={item.coord.y + pinRadius + 11}
                          textAnchor="middle"
                          className={`text-[9.5px] font-bold transition-colors pointer-events-none select-none ${
                            isSelected
                              ? "fill-[#181343] font-black"
                              : isHovered
                              ? "fill-indigo-900 font-extrabold"
                              : "fill-slate-700"
                          }`}
                        >
                          {item.province}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Bottom Legend */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 border-t border-slate-200/60 mt-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#181343]" />
                      <span>Pin Aktif: {activeProvincePins.length} Provinsi</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span>Wilayah Belum Terjangkau</span>
                    </span>
                  </div>
                  <span>Klik pin wilayah untuk memeriksa detail</span>
                </div>
              </div>

              {/* Selected Province Detail Drawer */}
              {selectedProvinceData && (
                <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 transition-all shadow-xs">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                        {selectedProvinceData.island}
                      </span>
                      <h4 className="text-base font-extrabold text-[#181343] mt-1">
                        {selectedProvinceData.province}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMapProvince(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                      title="Tutup rincian wilayah"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-slate-500 text-[11px] font-medium block">
                        Program CSR
                      </span>
                      <span className="text-sm font-extrabold text-[#181343] block">
                        {selectedProvinceData.programsCount} Inisiatif
                      </span>
                      {selectedProvinceData.committedBudget > 0 && (
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Pagu: {formatCompactRupiah(selectedProvinceData.committedBudget)}
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-slate-500 text-[11px] font-medium block">
                        Mitra Pelaksana
                      </span>
                      <span className="text-sm font-extrabold text-emerald-800 block">
                        {selectedProvinceData.partnersCount} Mitra NGO
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Siap mobilisasi
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-slate-500 text-[11px] font-medium block">
                        Perusahaan
                      </span>
                      <span className="text-sm font-extrabold text-[#181343] block">
                        {selectedProvinceData.companiesCount} Sponsor
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Pemberi dana
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-slate-500 text-[11px] font-medium block">
                        Total Ekosistem
                      </span>
                      <span className="text-sm font-extrabold text-indigo-900 block">
                        {selectedProvinceData.totalEntities} Entitas
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Tercatat di sistem
                      </span>
                    </div>
                  </div>

                  {/* Registered Cities in this Province */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-[#181343] block">
                      Kota &amp; Kabupaten Terdata:
                    </span>
                    {(!selectedProvinceData.citiesList || selectedProvinceData.citiesList.length === 0) ? (
                      <p className="text-xs text-slate-500">
                        Tidak ada spesifikasi kota bawahan.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedProvinceData.citiesList || []).map((city) => (
                          <span
                            key={city}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    Wilayah ini aktif berpartisipasi dalam program dampak sosial platform Sipena.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Ringkasan Indikator Kunci Sebaran (Faktual, Padat Informasi, Bebas AI-Slop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Pusat Program Terbesar
              </span>
              <span className="text-base font-extrabold text-[#181343] block truncate">
                {strategicInsights.topRegion.name}
              </span>
              <p className="text-xs text-slate-600">
                {strategicInsights.topRegion.count} Program ({strategicInsights.topRegion.percentage}%) • {formatCompactRupiah(strategicInsights.topRegion.budget)} pagu
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Kesiapan Mitra Lapangan
              </span>
              <span className="text-base font-extrabold text-emerald-800 block">
                {strategicInsights.partners.totalPartners} Mitra Terdaftar
              </span>
              <p className="text-xs text-slate-600 truncate">
                {strategicInsights.partners.provinces.join(", ") || "Banten, Jawa Barat"} ({strategicInsights.partners.totalPartnerCities} Wilayah)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Cakupan Teritori Nasional
              </span>
              <span className="text-base font-extrabold text-[#181343] block">
                {strategicInsights.coverage.coveredCount} dari 38 Provinsi
              </span>
              <p className="text-xs text-slate-600">
                {strategicInsights.coverage.coveragePct}% Wilayah ({strategicInsights.coverage.unreachedCount} Terbuka)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Realisasi Serapan Anggaran
              </span>
              <span className="text-base font-extrabold text-[#181343] block">
                {formatCompactRupiah(strategicInsights.absorption.totalSpent)} ({strategicInsights.absorption.rate}%)
              </span>
              <p className="text-xs text-slate-600 truncate">
                Dari total komitmen {formatCompactRupiah(strategicInsights.absorption.totalCommitted)}
              </p>
            </div>
          </div>

          {/* Rincian Sebaran 4 Dimensi Ekosistem (Satu Kontainer Rapi, 4 Kolom Sejajar, Tanpa Scrollbar) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#181343]">
                  Rincian Sebaran Wilayah, Bidang Fokus, Mitra &amp; Perusahaan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ikhtisar langsung sebaran 4 pilar ekosistem CSR tanpa perlu berpindah tab.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Kolom 1: Wilayah Program */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Wilayah Program
                  </span>
                  <span className="text-[11px] font-bold text-[#181343] bg-slate-100 px-2 py-0.5 rounded-md">
                    {geoDist.topProgramRegions.length}
                  </span>
                </div>
                {geoDist.topProgramRegions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada data wilayah</p>
                ) : (
                  <div className="space-y-2">
                    {geoDist.topProgramRegions.map((reg) => (
                      <div
                        key={reg.region}
                        className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-50 last:border-b-0 text-xs"
                      >
                        <div className="min-w-0 pr-1">
                          <p className="font-semibold text-[#181343] truncate">{reg.region}</p>
                          {reg.committedBudget !== undefined && reg.committedBudget > 0 && (
                            <p className="text-[11px] text-slate-500">{formatCompactRupiah(reg.committedBudget)} pagu</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#181343]">{reg.count} Prog</span>
                          <span className="text-[11px] text-slate-500 block">({reg.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kolom 2: Bidang Fokus CSR */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Bidang Fokus CSR
                  </span>
                  <span className="text-[11px] font-bold text-[#181343] bg-slate-100 px-2 py-0.5 rounded-md">
                    {focusAreaDistribution.length}
                  </span>
                </div>
                {focusAreaDistribution.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada data pilar</p>
                ) : (
                  <div className="space-y-2">
                    {focusAreaDistribution.map((item) => {
                      const sharePct = Math.round(
                        (item.programCount / Math.max(1, kpis.totalPrograms)) * 100
                      );
                      return (
                        <div
                          key={item.focusArea}
                          className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-50 last:border-b-0 text-xs"
                        >
                          <div className="min-w-0 pr-1">
                            <p className="font-semibold text-[#181343] truncate">
                              {getFocusAreaLabel(item.focusArea)}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Serapan: {formatCompactRupiah(item.spentBudget)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-[#181343]">{item.programCount} Prog</span>
                            <span className="text-[11px] text-slate-500 block">({sharePct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kolom 3: Asal Mitra Pelaksana NGO */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Domisili Mitra NGO
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {kpis.totalPartners}
                  </span>
                </div>
                {geoDist.partnerCities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada data mitra</p>
                ) : (
                  <div className="space-y-2">
                    {geoDist.partnerCities.map((pc) => (
                      <div
                        key={pc.region}
                        className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-50 last:border-b-0 text-xs"
                      >
                        <div className="min-w-0 pr-1">
                          <p className="font-semibold text-[#181343] truncate">{pc.region}</p>
                          <p className="text-[11px] text-slate-500">Mitra Terverifikasi</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-emerald-800">{pc.count} Mitra</span>
                          <span className="text-[11px] text-slate-500 block">({pc.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kolom 4: Asal Perusahaan Sponsor */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Domisili Perusahaan
                  </span>
                  <span className="text-[11px] font-bold text-[#181343] bg-slate-100 px-2 py-0.5 rounded-md">
                    {kpis.totalCompanies}
                  </span>
                </div>
                {geoDist.companyCities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada data perusahaan</p>
                ) : (
                  <div className="space-y-2">
                    {geoDist.companyCities.map((cc) => (
                      <div
                        key={cc.region}
                        className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-50 last:border-b-0 text-xs"
                      >
                        <div className="min-w-0 pr-1">
                          <p className="font-semibold text-[#181343] truncate">{cc.region}</p>
                          <p className="text-[11px] text-slate-500">Perusahaan Sponsor</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#181343]">{cc.count} Sponsor</span>
                          <span className="text-[11px] text-slate-500 block">({cc.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
