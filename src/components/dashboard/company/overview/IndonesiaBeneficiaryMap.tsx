"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  Info,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyProgramItem } from "../types";
import { ALL_17_SDGS, getProgramSdgs, parseBeneficiariesCount, formatRupiah } from "../../analytics/helpers";

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

export function matchProvinceName(provName?: string | null): string | null {
  if (!provName) return null;
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
  return null;
}

interface IndonesiaBeneficiaryMapProps {
  programs: CompanyProgramItem[];
  selectedSdgFilter: string;
  onSelectSdgFilter: (sdgId: string) => void;
  onSelectProvince: (provName: string | null) => void;
  selectedProvince: string | null;
  onNavigateToProgramDetail?: (prog: CompanyProgramItem) => void;
}

export function IndonesiaBeneficiaryMap({
  programs,
  selectedSdgFilter,
  onSelectSdgFilter,
  onSelectProvince,
  selectedProvince,
  onNavigateToProgramDetail,
}: IndonesiaBeneficiaryMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

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
      const prov = matchProvinceName(p.targetProvince) || "Jawa Barat"; // default fallback if unassigned
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

  // Selected region details
  const activeRegionDetail = useMemo(() => {
    if (!selectedProvince) return null;
    return regionalData.get(selectedProvince) || null;
  }, [selectedProvince, regionalData]);

  return (
    <div className="bg-white rounded-3xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
      {/* Map Header & Toolbar */}
      <div className="p-5 sm:p-6 pb-4 border-b border-[#F4F4F6] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#181343] tracking-tight">
                Peta Persebaran Penerima Manfaat CSR
              </h3>
              <p className="text-xs text-[#787680]">
                Pantau cakupan geografis program, capaian penerima manfaat riil, dan integrasi SDGs per wilayah.
              </p>
            </div>
          </div>
        </div>

        {/* SDGs Filter Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Filter SDGs:
          </span>
          <select
            value={selectedSdgFilter}
            onChange={(e) => onSelectSdgFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]/10 cursor-pointer"
          >
            <option value="ALL">Semua Sasaran SDGs</option>
            {ALL_17_SDGS.map((sdg) => (
              <option key={sdg.id} value={sdg.id.toString()}>
                {sdg.code} — {sdg.name}
              </option>
            ))}
          </select>

          {selectedSdgFilter !== "ALL" && (
            <button
              type="button"
              onClick={() => onSelectSdgFilter("ALL")}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline px-1"
            >
              Reset SDG
            </button>
          )}
        </div>
      </div>

      {/* Main Map Body: Canvas + Side Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        {/* Left/Center: Interactive SVG Map (8 or 12 cols depending on active selection) */}
        <div className={`${activeRegionDetail ? "lg:col-span-8" : "lg:col-span-12"} p-4 sm:p-6 flex flex-col justify-between transition-all`}>
          {/* SVG Map Container */}
          <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-50/70 to-slate-100/40 border border-[#E8E8EA] p-2 sm:p-4 overflow-hidden">
            {/* Subtle Longitude & Latitude Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="geo-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="3 3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#geo-grid)" />
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

              {/* Active Region Highlights & Interactive Marker Pins */}
              {Array.from(regionalData.entries()).map(([prov, data]) => {
                const isSelected = selectedProvince === prov;
                const isHovered = hoveredProvince === prov;
                const hasActual = data.actualBeneficiaries > 0;

                // Scale pin size based on program count (6px to 10px)
                const pinRadius = Math.min(11, 7 + data.programsCount);

                return (
                  <g
                    key={prov}
                    className="cursor-pointer group"
                    onClick={() => {
                      if (selectedProvince === prov) {
                        onSelectProvince(null);
                      } else {
                        onSelectProvince(prov);
                      }
                    }}
                    onMouseEnter={() => setHoveredProvince(prov)}
                    onMouseLeave={() => setHoveredProvince(null)}
                  >
                    {/* Pulsing Radar Ring */}
                    <circle
                      cx={data.coord.x}
                      cy={data.coord.y}
                      r={pinRadius + 7}
                      className={isSelected ? "fill-emerald-400/30 animate-pulse" : "fill-emerald-500/15"}
                    />

                    {/* Active Pin Circle */}
                    <circle
                      cx={data.coord.x}
                      cy={data.coord.y}
                      r={pinRadius}
                      className={`transition-all duration-200 ${
                        isSelected
                          ? "fill-[#181343] stroke-white stroke-2 drop-shadow-md scale-110"
                          : isHovered
                          ? "fill-emerald-600 stroke-white stroke-2 drop-shadow-sm scale-110"
                          : "fill-[#009E75] stroke-white stroke-2"
                      }`}
                    />

                    {/* Badge number inside pin */}
                    <text
                      x={data.coord.x}
                      y={data.coord.y + 3}
                      textAnchor="middle"
                      className="fill-white font-extrabold text-[9px] pointer-events-none select-none"
                    >
                      {data.programsCount}
                    </text>

                    {/* Province Name Tag */}
                    <text
                      x={data.coord.x}
                      y={data.coord.y + pinRadius + 11}
                      textAnchor="middle"
                      className={`text-[9.5px] font-bold transition-colors pointer-events-none select-none ${
                        isSelected
                          ? "fill-[#181343] font-black"
                          : isHovered
                          ? "fill-emerald-800 font-extrabold"
                          : "fill-slate-700"
                      }`}
                    >
                      {prov}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend Floating on Bottom Left */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-[#E8E8EA] shadow-2xs text-[11px] space-y-1.5 hidden sm:block">
              <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">
                Indikator Peta:
              </span>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#009E75] border border-white" />
                <span>Wilayah Program Aktif</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#181343] border border-white" />
                <span>Wilayah Terpilih</span>
              </div>
            </div>

            {/* Instruction Badge Floating on Top Right */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E8E8EA] text-[10px] font-semibold text-slate-600 hidden sm:flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Klik marker wilayah untuk melihat detail</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Region Detail Panel (If region is clicked) */}
        {activeRegionDetail && (
          <div className="lg:col-span-4 p-5 sm:p-6 bg-[#F9F9FB] border-t lg:border-t-0 lg:border-l border-[#E8E8EA] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Wilayah Terpilih ({activeRegionDetail.coord.island})
                </span>
                <h4 className="text-base font-bold text-[#181343] mt-0.5">
                  {activeRegionDetail.province}
                </h4>
                {activeRegionDetail.cities.size > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {Array.from(activeRegionDetail.cities).join(", ")}
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

            {/* Target vs Realisasi Beneficiaries Box */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E8E8EA] space-y-2.5">
              <span className="text-xs font-bold text-slate-800 block">
                Capaian Penerima Manfaat:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Target Program
                  </span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">
                    {activeRegionDetail.targetBeneficiaries > 0
                      ? `${activeRegionDetail.targetBeneficiaries.toLocaleString("id-ID")} Jiwa`
                      : "Belum Ditetapkan"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] uppercase font-semibold text-emerald-700 block">
                    Realisasi Dilaporkan
                  </span>
                  <span className="text-sm font-bold text-emerald-800 block mt-0.5">
                    {activeRegionDetail.actualBeneficiaries > 0
                      ? `${activeRegionDetail.actualBeneficiaries.toLocaleString("id-ID")} Jiwa`
                      : "Belum Ada Data Realisasi"}
                  </span>
                </div>
              </div>
            </div>

            {/* Program List in Region */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#181343] block">
                Program Berjalan di Wilayah Ini ({activeRegionDetail.programsCount}):
              </span>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
                {activeRegionDetail.programsList.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-3 rounded-xl bg-white border border-[#E8E8EA] space-y-1.5 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-[#181343] line-clamp-1 leading-snug">
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
                      >
                        {prog.status === "COMPLETED"
                          ? "Selesai"
                          : prog.status === "IN_PROGRESS"
                          ? "Berjalan"
                          : "Persiapan"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Mitra: <strong className="text-slate-700">{prog.partnerName || "Mitra CSR"}</strong></span>
                      <span className="font-semibold text-emerald-700">{formatRupiah(prog.budget)}</span>
                    </div>

                    {onNavigateToProgramDetail && (
                      <button
                        type="button"
                        onClick={() => onNavigateToProgramDetail(prog)}
                        className="text-[11px] font-bold text-[#181343] hover:text-emerald-700 flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Lihat Detail Program</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Insights: Ringkasan Cakupan Wilayah (Insight Cakupan Sesuai Arahan Dosen) */}
      <div className="p-5 sm:p-6 bg-[#F9F9FB] border-t border-[#E8E8EA] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Metric 1: Total Beneficiaries */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
            Total Penerima Manfaat
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-[#181343]">
            {insights.totalActual > 0
              ? `${insights.totalActual.toLocaleString("id-ID")} Jiwa (Realisasi)`
              : insights.totalTarget > 0
              ? `${insights.totalTarget.toLocaleString("id-ID")} Jiwa (Target)`
              : "Belum Ada Data"}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {insights.totalActual > 0
              ? `Dari ${insights.totalTarget.toLocaleString("id-ID")} jiwa target awal`
              : "Menunggu laporan pelaksanaan lapangan"}
          </span>
        </div>

        {/* Metric 2: Wilayah Jangkauan Tertinggi */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] space-y-1">
          <span className="text-[11px] uppercase font-bold text-emerald-700 tracking-wider block">
            Wilayah Jangkauan Terbesar
          </span>
          <div className="text-sm sm:text-base font-extrabold text-slate-800 truncate">
            {highestRegion ? highestRegion.province : "Belum Ada Program"}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {highestRegion
              ? highestRegion.actual > 0
                ? `${highestRegion.actual.toLocaleString("id-ID")} jiwa terealisasi`
                : `${highestRegion.count.toLocaleString("id-ID")} jiwa ditargetkan`
              : "-"}
          </span>
        </div>

        {/* Metric 3: Wilayah Jangkauan Terendah (Di antara yang tercakup) */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] space-y-1">
          <span className="text-[11px] uppercase font-bold text-amber-700 tracking-wider block">
            Wilayah Jangkauan Terendah
          </span>
          <div className="text-sm sm:text-base font-extrabold text-slate-800 truncate">
            {lowestRegion ? lowestRegion.province : "Belum Ada Program"}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {lowestRegion
              ? lowestRegion.actual > 0
                ? `${lowestRegion.actual.toLocaleString("id-ID")} jiwa terealisasi`
                : `${lowestRegion.count.toLocaleString("id-ID")} jiwa ditargetkan`
              : "-"}
          </span>
        </div>

        {/* Metric 4: Provinsi Belum Tercakup */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8EA] space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
            Cakupan Wilayah Nasional
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-[#181343]">
            {insights.coveredProvincesCount} dari {insights.totalNationalProvinces}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {insights.unreachedCount} provinsi belum tercakup program
          </span>
        </div>
      </div>
    </div>
  );
}
