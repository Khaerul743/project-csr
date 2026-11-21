"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Building2,
  ChevronRight,
  Filter,
  Compass,
  X,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyProgramItem, OpportunityItem, PartnerItem } from "../types";
import type { ActiveDataLayer } from "./IndonesiaRealLeafletMap";
import { ALL_17_SDGS, getProgramSdgs, parseBeneficiariesCount, formatRupiah } from "../../analytics/helpers";

const IndonesiaRealLeafletMap = dynamic(
  () => import("./IndonesiaRealLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] sm:h-[500px] rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2.5 border border-[#E8E8EA]">
        <div className="w-8 h-8 border-3 border-[#181343] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-600">Memuat Peta Geografis Indonesia...</span>
      </div>
    ),
  }
);

export interface ProvinceCoordinate {
  x: number;
  y: number;
  island: string;
}

export interface ProvinceInsightMetric {
  province: string;
  count: number;
  actual: number;
}

export const PROVINCE_COORDINATES: Record<string, ProvinceCoordinate> = {
  // Sumatra
  "Aceh": { x: 75, y: 75, island: "Sumatra" },
  "Sumatera Utara": { x: 110, y: 115, island: "Sumatra" },
  "Sumatera Barat": { x: 135, y: 195, island: "Sumatra" },
  "Riau": { x: 165, y: 155, island: "Sumatra" },
  "Kepulauan Riau": { x: 215, y: 130, island: "Sumatra" },
  "Jambi": { x: 185, y: 215, island: "Sumatra" },
  "Sumatera Selatan": { x: 220, y: 255, island: "Sumatra" },
  "Bengkulu": { x: 165, y: 255, island: "Sumatra" },
  "Lampung": { x: 240, y: 295, island: "Sumatra" },
  "Kepulauan Bangka Belitung": { x: 260, y: 220, island: "Sumatra" },

  // Jawa
  "DKI Jakarta": { x: 295, y: 325, island: "Jawa" },
  "Banten": { x: 270, y: 330, island: "Jawa" },
  "Jawa Barat": { x: 320, y: 338, island: "Jawa" },
  "Jawa Tengah": { x: 375, y: 340, island: "Jawa" },
  "DI Yogyakarta": { x: 375, y: 360, island: "Jawa" },
  "Jawa Timur": { x: 440, y: 345, island: "Jawa" },

  // Bali & Nusa Tenggara
  "Bali": { x: 485, y: 355, island: "Bali & Nusa Tenggara" },
  "Nusa Tenggara Barat": { x: 530, y: 355, island: "Bali & Nusa Tenggara" },
  "Nusa Tenggara Timur": { x: 620, y: 360, island: "Bali & Nusa Tenggara" },

  // Kalimantan
  "Kalimantan Barat": { x: 320, y: 190, island: "Kalimantan" },
  "Kalimantan Tengah": { x: 385, y: 210, island: "Kalimantan" },
  "Kalimantan Selatan": { x: 425, y: 250, island: "Kalimantan" },
  "Kalimantan Timur": { x: 460, y: 175, island: "Kalimantan" },
  "Kalimantan Utara": { x: 465, y: 110, island: "Kalimantan" },

  // Sulawesi
  "Sulawesi Utara": { x: 595, y: 115, island: "Sulawesi" },
  "Gorontalo": { x: 555, y: 135, island: "Sulawesi" },
  "Sulawesi Tengah": { x: 525, y: 185, island: "Sulawesi" },
  "Sulawesi Barat": { x: 495, y: 220, island: "Sulawesi" },
  "Sulawesi Selatan": { x: 505, y: 270, island: "Sulawesi" },
  "Sulawesi Tenggara": { x: 560, y: 260, island: "Sulawesi" },

  // Maluku
  "Maluku Utara": { x: 655, y: 145, island: "Maluku" },
  "Maluku": { x: 690, y: 250, island: "Maluku" },

  // Papua
  "Papua Barat": { x: 745, y: 185, island: "Papua" },
  "Papua Barat Daya": { x: 715, y: 180, island: "Papua" },
  "Papua": { x: 885, y: 205, island: "Papua" },
  "Papua Tengah": { x: 800, y: 235, island: "Papua" },
  "Papua Pegunungan": { x: 855, y: 245, island: "Papua" },
  "Papua Selatan": { x: 880, y: 320, island: "Papua" },
};

import { INDONESIAN_REGIONS } from "../opportunities/indonesian-regions";

export function matchProvinceName(
  provName?: string | null,
  cityName?: string | null
): string | null {
  if (provName) {
    const clean = provName.trim().toLowerCase();
    for (const p of Object.keys(PROVINCE_COORDINATES)) {
      if (
        p.toLowerCase() === clean ||
        clean.includes(p.toLowerCase()) ||
        p.toLowerCase().includes(clean)
      ) {
        return p;
      }
    }
  }

  if (cityName) {
    const cleanCity = cityName.trim().toLowerCase().replace(/^(kab\.|kabupaten|kota)\s+/i, "");
    for (const region of INDONESIAN_REGIONS) {
      const matchCity = region.cities.some((c) => {
        const cClean = c.toLowerCase().replace(/^(kab\.|kabupaten|kota)\s+/i, "");
        return (
          cClean === cleanCity ||
          cClean.includes(cleanCity) ||
          cleanCity.includes(cClean)
        );
      });
      if (matchCity) {
        return matchProvinceName(region.name);
      }
    }
  }

  return null;
}

export interface IndonesiaBeneficiaryMapProps {
  programs: CompanyProgramItem[];
  opportunities?: OpportunityItem[];
  partners?: PartnerItem[];
  selectedSdgFilter: string;
  onSelectSdgFilter: (sdgId: string) => void;
  onSelectProvince: (provName: string | null) => void;
  selectedProvince: string | null;
  onNavigateToProgramDetail?: (prog: CompanyProgramItem) => void;
  onNavigateToOpportunityDetail?: (opp: OpportunityItem) => void;
  onOpenCreateOpportunity?: (provinceName?: string) => void;
}

export function IndonesiaBeneficiaryMap({
  programs,
  opportunities = [],
  partners = [],
  selectedSdgFilter,
  onSelectSdgFilter,
  onSelectProvince,
  selectedProvince,
  onNavigateToProgramDetail,
  onNavigateToOpportunityDetail,
  onOpenCreateOpportunity,
}: IndonesiaBeneficiaryMapProps) {
  const [activeLayer, setActiveLayer] = useState<ActiveDataLayer>("PROGRAM");

  // Filter programs based on selected SDGs filter on the map
  const activePrograms = useMemo(() => {
    return programs.filter((p) => {
      if (selectedSdgFilter === "ALL") return true;
      const sdgNum = parseInt(selectedSdgFilter, 10);
      const progSdgs = getProgramSdgs({
        id: p.id,
        title: p.title,
        description: p.description || p.opportunityDescription || "",
        focusArea: p.focusArea,
        status: p.status,
        budget: p.budget,
      });
      return progSdgs.includes(sdgNum);
    });
  }, [programs, selectedSdgFilter]);

  // Filter opportunities to only OPEN ones that haven't been completed into running programs
  const openOpportunities = useMemo(() => {
    const closedProgramOppIds = new Set(
      programs
        .filter((p) => p.status === "COMPLETED" || p.status === "IN_PROGRESS")
        .map((p) => p.opportunityId)
        .filter(Boolean)
    );

    return opportunities.filter(
      (o) => o.status !== "CLOSED" && !closedProgramOppIds.has(o.id)
    );
  }, [opportunities, programs]);

  // Aggregate program & beneficiary data per province
  const regionalData = useMemo(() => {
    const map = new Map<
      string,
      {
        province: string;
        cities: Set<string>;
        programsCount: number;
        targetBeneficiaries: number;
        actualBeneficiaries: number;
        hasActualData: boolean;
        partners: Set<string>;
        sdgs: Set<number>;
        programsList: CompanyProgramItem[];
        coord: ProvinceCoordinate;
      }
    >();

    activePrograms.forEach((p) => {
      const prov = matchProvinceName(p.targetProvince, p.targetCity || p.partnerCity) || "Jawa Barat"; // default fallback if unassigned
      const coord = PROVINCE_COORDINATES[prov] || { x: 320, y: 338, island: "Jawa" };

      if (!map.has(prov)) {
        map.set(prov, {
          province: prov,
          cities: new Set<string>(),
          programsCount: 0,
          targetBeneficiaries: 0,
          actualBeneficiaries: 0,
          hasActualData: false,
          partners: new Set<string>(),
          sdgs: new Set<number>(),
          programsList: [],
          coord,
        });
      }

      const item = map.get(prov)!;
      item.programsCount += 1;
      item.programsList.push(p);

      if (p.targetCity) item.cities.add(p.targetCity);
      if (p.partnerName) item.partners.add(p.partnerName);

      const targetNum = parseBeneficiariesCount(p.targetBeneficiaries);
      const actualNum = parseBeneficiariesCount(p.actualBeneficiaries);

      item.targetBeneficiaries += targetNum;
      if (actualNum > 0) {
        item.actualBeneficiaries += actualNum;
        item.hasActualData = true;
      }

      const progSdgs = getProgramSdgs({
        id: p.id,
        title: p.title,
        description: p.description || p.opportunityDescription || "",
        focusArea: p.focusArea,
        status: p.status,
        budget: p.budget,
      });
      progSdgs.forEach((id) => item.sdgs.add(id));
    });

    return map;
  }, [activePrograms]);

  // Insights calculation: Highest, Lowest, Unreached
  const insights = useMemo(() => {
    let totalTarget = 0;
    let totalActual = 0;
    let highest: ProvinceInsightMetric | null = null;
    let lowest: ProvinceInsightMetric | null = null;

    for (const [prov, val] of Array.from(regionalData.entries())) {
      totalTarget += val.targetBeneficiaries;
      totalActual += val.actualBeneficiaries;

      const metric = val.actualBeneficiaries > 0 ? val.actualBeneficiaries : val.targetBeneficiaries;

      if (!highest || metric > (highest.actual > 0 ? highest.actual : highest.count)) {
        highest = { province: prov, count: val.targetBeneficiaries, actual: val.actualBeneficiaries };
      }
      if (!lowest || metric < (lowest.actual > 0 ? lowest.actual : lowest.count)) {
        lowest = { province: prov, count: val.targetBeneficiaries, actual: val.actualBeneficiaries };
      }
    }

    const coveredProvincesCount = regionalData.size;
    const totalNationalProvinces = 38;
    const unreachedCount = Math.max(0, totalNationalProvinces - coveredProvincesCount);

    return {
      totalTarget,
      totalActual,
      highest,
      lowest,
      coveredProvincesCount,
      unreachedCount,
      totalNationalProvinces,
    };
  }, [regionalData]);

  const highestRegion = insights.highest;
  const lowestRegion = insights.lowest;

  // Comprehensive active province info (includes programs, opportunities, and partners)
  const activeProvinceInfo = useMemo(() => {
    if (!selectedProvince) return null;
    const existing = regionalData.get(selectedProvince);

    const oppsInProv = openOpportunities.filter((o) => {
      const match = matchProvinceName(o.targetProvince, o.targetCity);
      return match === selectedProvince;
    });

    const partnersInProv = partners.filter((pt) => {
      const match = matchProvinceName(pt.province, pt.city);
      return match === selectedProvince;
    });

    const island =
      existing?.coord.island ||
      PROVINCE_COORDINATES[selectedProvince]?.island ||
      "Indonesia";

    return {
      province: selectedProvince,
      island,
      hasPrograms: !!(existing && existing.programsCount > 0),
      programsCount: existing ? existing.programsCount : 0,
      programsList: existing ? existing.programsList : [],
      targetBeneficiaries: existing ? existing.targetBeneficiaries : 0,
      actualBeneficiaries: existing ? existing.actualBeneficiaries : 0,
      cities: existing ? existing.cities : new Set<string>(),
      opportunities: oppsInProv,
      partners: partnersInProv,
    };
  }, [selectedProvince, regionalData, openOpportunities, partners]);

  return (
    <div className="bg-white rounded-3xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
      {/* Map Header & Toolbar */}
      <div className="p-5 sm:p-6 pb-4 border-b border-[#F4F4F6] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[#181343] shrink-0">
              <MapPin className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#181343] tracking-tight">
                Peta Geografis &amp; Persebaran Program CSR
              </h3>
              <p className="text-xs text-slate-500">
                Distribusi wilayah program aktif, peluang inisiatif, dan mitra pelaksana di seluruh Indonesia.
              </p>
            </div>
          </div>
        </div>

        {/* SDGs Filter Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <label htmlFor="sdg-filter-select" className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Sasaran SDGs:</span>
          </label>
          <select
            id="sdg-filter-select"
            value={selectedSdgFilter}
            onChange={(e) => onSelectSdgFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#181343] shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#181343] cursor-pointer"
          >
            <option value="ALL">Semua Sasaran SDGs</option>
            {ALL_17_SDGS.map((sdg) => (
              <option key={sdg.id} value={sdg.id.toString()}>
                {sdg.code}: {sdg.name}
              </option>
            ))}
          </select>

          {selectedSdgFilter !== "ALL" && (
            <button
              type="button"
              onClick={() => onSelectSdgFilter("ALL")}
              className="text-[11px] font-semibold text-slate-600 hover:text-[#181343] underline px-1 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Map Body: Interactive Leaflet Map + Side Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        {/* Left/Center: Real Geographic Leaflet Map */}
        <div
          className={`${
            activeProvinceInfo ? "lg:col-span-8" : "lg:col-span-12"
          } p-4 sm:p-6 transition-all`}
        >
          <IndonesiaRealLeafletMap
            programs={activePrograms}
            opportunities={openOpportunities}
            partners={partners}
            selectedProvince={selectedProvince}
            isDetailOpen={Boolean(activeProvinceInfo)}
            activeLayer={activeLayer}
            onActiveLayerChange={setActiveLayer}
            onSelectProvince={onSelectProvince}
            onNavigateToProgramDetail={onNavigateToProgramDetail}
            onNavigateToOpportunityDetail={onNavigateToOpportunityDetail}
            onOpenCreateOpportunity={onOpenCreateOpportunity}
          />
        </div>

        {/* Right Column: Selected Region Detail Panel */}
        {activeProvinceInfo && (
          <div className="lg:col-span-4 p-5 sm:p-6 bg-[#F9F9FB] border-t lg:border-t-0 lg:border-l border-[#E8E8EA] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {activeLayer === "PROGRAM"
                    ? `Program CSR • ${activeProvinceInfo.island}`
                    : activeLayer === "OPPORTUNITY"
                    ? `Peluang Terbuka • ${activeProvinceInfo.island}`
                    : `Mitra Lokal • ${activeProvinceInfo.island}`}
                </span>
                <h4 className="text-base font-bold text-[#181343] mt-0.5">
                  {activeProvinceInfo.province}
                </h4>
                {activeProvinceInfo.cities.size > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {Array.from(activeProvinceInfo.cities).join(", ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onSelectProvince(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                title="Tutup panel wilayah"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. LAYER: PROGRAM */}
            {activeLayer === "PROGRAM" && (
              <div className="space-y-3.5">
                {activeProvinceInfo.hasPrograms ? (
                  <>
                    {/* Target vs Realisasi Beneficiaries Box */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
                      <span className="text-xs font-bold text-slate-800 block">
                        Capaian Penerima Manfaat:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                            Target Program
                          </span>
                          <span className="text-sm font-bold text-slate-800 block mt-0.5">
                            {activeProvinceInfo.targetBeneficiaries > 0
                              ? `${activeProvinceInfo.targetBeneficiaries.toLocaleString("id-ID")} Jiwa`
                              : "Belum Ditetapkan"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                          <span className="text-[10px] uppercase font-semibold text-emerald-700 block">
                            Realisasi Dilaporkan
                          </span>
                          <span className="text-sm font-bold text-emerald-800 block mt-0.5">
                            {activeProvinceInfo.actualBeneficiaries > 0
                              ? `${activeProvinceInfo.actualBeneficiaries.toLocaleString("id-ID")} Jiwa`
                              : "Belum Ada Realisasi"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Program List in Region */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#181343]">
                          Program Berjalan ({activeProvinceInfo.programsCount})
                        </span>
                      </div>

                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 text-xs">
                        {activeProvinceInfo.programsList.map((prog) => (
                          <div
                            key={prog.id}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-[#181343] text-xs line-clamp-2 leading-snug">
                                {prog.title}
                              </span>
                              <Badge
                                variant={
                                  prog.status === "COMPLETED"
                                    ? "blue"
                                    : prog.status === "IN_PROGRESS"
                                    ? "emerald"
                                    : "amber"
                                }
                                size="sm"
                                hasDot
                              >
                                {prog.status === "COMPLETED"
                                  ? "Selesai"
                                  : prog.status === "IN_PROGRESS"
                                  ? "Berjalan"
                                  : "Persiapan"}
                              </Badge>
                            </div>

                            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">
                                  Mitra Pelaksana
                                </span>
                                <span className="font-semibold text-slate-800 line-clamp-1 block mt-0.5">
                                  {prog.partnerName || "Mitra CSR"}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">
                                  Pagu Komitmen
                                </span>
                                <span className="font-extrabold text-emerald-700 block mt-0.5">
                                  {formatRupiah(prog.budget)}
                                </span>
                              </div>
                            </div>

                            {onNavigateToProgramDetail && (
                              <button
                                type="button"
                                onClick={() => onNavigateToProgramDetail(prog)}
                                className="w-full mt-1 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-[#181343] hover:text-white border border-slate-200/80 text-[11px] font-semibold text-[#181343] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <span>Lihat Rincian Program</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                      <MapPin className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#181343] block">
                        Belum Ada Program Berjalan
                      </span>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Perusahaan belum menjalankan inisiatif program CSR di wilayah{" "}
                        <strong>{activeProvinceInfo.province}</strong>.
                      </p>
                    </div>

                    {onOpenCreateOpportunity && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onOpenCreateOpportunity(activeProvinceInfo.province)}
                        leftIcon={<Plus className="w-4 h-4" />}
                        className="w-full text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
                      >
                        Buka Peluang CSR di Wilayah Ini
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. LAYER: OPPORTUNITY */}
            {activeLayer === "OPPORTUNITY" && (
              <div className="space-y-3.5">
                {activeProvinceInfo.opportunities.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#181343]">
                        Peluang Terbuka ({activeProvinceInfo.opportunities.length})
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
                      {activeProvinceInfo.opportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-[#181343] text-xs line-clamp-2 leading-snug">
                              {opp.title}
                            </span>
                            <Badge variant="blue" size="sm" hasDot>
                              Buka
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                              {opp.focusArea.replace(/_/g, " ")}
                            </span>
                            {opp.stats && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700">
                                {opp.stats.proposalsCount} Proposal Masuk
                              </span>
                            )}
                          </div>

                          {opp.estimatedBudget && (
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
                                Pagu Estimasi
                              </span>
                              <span className="font-extrabold text-[#181343]">
                                {formatRupiah(opp.estimatedBudget)}
                              </span>
                            </div>
                          )}

                          {onNavigateToOpportunityDetail && (
                            <button
                              type="button"
                              onClick={() => onNavigateToOpportunityDetail(opp)}
                              className="w-full mt-1 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-[#181343] hover:text-white border border-slate-200/80 text-[11px] font-semibold text-[#181343] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <span>Lihat Detail Peluang</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {onOpenCreateOpportunity && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenCreateOpportunity(activeProvinceInfo.province)}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="w-full text-xs font-semibold py-2.5 rounded-xl border-slate-300 hover:border-[#181343] hover:bg-slate-50 text-[#181343] shadow-2xs cursor-pointer mt-1"
                      >
                        Tambah Peluang Baru di {activeProvinceInfo.province}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                      <Compass className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#181343] block">
                        Belum Ada Peluang Terbuka
                      </span>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Belum ada inisiatif peluang CSR yang sedang dibuka untuk wilayah{" "}
                        <strong>{activeProvinceInfo.province}</strong>.
                      </p>
                    </div>

                    {onOpenCreateOpportunity && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onOpenCreateOpportunity(activeProvinceInfo.province)}
                        leftIcon={<Plus className="w-4 h-4" />}
                        className="w-full text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
                      >
                        Buka Peluang CSR di Wilayah Ini
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. LAYER: PARTNER */}
            {activeLayer === "PARTNER" && (
              <div className="space-y-3.5">
                {activeProvinceInfo.partners.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#181343]">
                        Mitra Terverifikasi ({activeProvinceInfo.partners.length})
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
                      {activeProvinceInfo.partners.map((pt) => (
                        <div
                          key={pt.id}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-[#181343] text-xs line-clamp-1">
                              {pt.name}
                            </span>
                            <Badge variant="emerald" size="sm" hasDot>
                              Terverifikasi
                            </Badge>
                          </div>

                          {pt.tagline && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                              "{pt.tagline}"
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{pt.city || activeProvinceInfo.province}</span>
                            {pt.organizationType && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">
                                {pt.organizationType}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                      <Building2 className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#181343] block">
                        Belum Ada Mitra Terdaftar
                      </span>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Belum ada organisasi mitra pelaksana CSR terverifikasi yang berbasis di wilayah{" "}
                        <strong>{activeProvinceInfo.province}</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Insights: Ringkasan Cakupan Wilayah (Seragam & Anti-Slop) */}
      <div className="p-5 sm:p-6 bg-[#F9F9FB] border-t border-[#E8E8EA] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Metric 1: Total Beneficiaries */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] space-y-1">
          <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider block">
            Total Penerima Manfaat
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#181343] tabular-nums">
            {insights.totalActual > 0
              ? `${insights.totalActual.toLocaleString("id-ID")} Jiwa`
              : insights.totalTarget > 0
              ? `${insights.totalTarget.toLocaleString("id-ID")} Jiwa`
              : "Belum Ada Data"}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {insights.totalActual > 0
              ? `Realisasi dari target ${insights.totalTarget.toLocaleString("id-ID")} jiwa`
              : "Menunggu laporan pelaksanaan lapangan"}
          </span>
        </div>

        {/* Metric 2: Wilayah Jangkauan Tertinggi */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] space-y-1">
          <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider block">
            Wilayah Jangkauan Terbesar
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-[#181343] truncate">
            {highestRegion ? highestRegion.province : "Belum Ada Program"}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {highestRegion
              ? highestRegion.actual > 0
                ? `${highestRegion.actual.toLocaleString("id-ID")} jiwa terealisasi`
                : `${highestRegion.count.toLocaleString("id-ID")} jiwa ditargetkan`
              : "-"}
          </span>
        </div>

        {/* Metric 3: Wilayah Jangkauan Terendah (Di antara yang tercakup) */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] space-y-1">
          <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider block">
            Wilayah Jangkauan Terendah
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-[#181343] truncate">
            {lowestRegion ? lowestRegion.province : "Belum Ada Program"}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {lowestRegion
              ? lowestRegion.actual > 0
                ? `${lowestRegion.actual.toLocaleString("id-ID")} jiwa terealisasi`
                : `${lowestRegion.count.toLocaleString("id-ID")} jiwa ditargetkan`
              : "-"}
          </span>
        </div>

        {/* Metric 4: Provinsi Belum Tercakup */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] space-y-1">
          <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider block">
            Cakupan Wilayah Nasional
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#181343] tabular-nums">
            {insights.coveredProvincesCount} / {insights.totalNationalProvinces}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {insights.unreachedCount} provinsi belum tercakup program
          </span>
        </div>
      </div>
    </div>
  );
}
