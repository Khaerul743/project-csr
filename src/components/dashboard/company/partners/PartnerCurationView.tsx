"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  HeartHandshake,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Eye,
  Send,
  Building2,
  Briefcase,
  Calendar,
  RotateCcw,
  FileCheck,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import { PartnerItem } from "../types";
import { FOCUS_AREA_CONFIG } from "../helpers";

interface PartnerCurationViewProps {
  partners: PartnerItem[];
  isLoading: boolean;
  focusFilter: string;
  onFocusFilterChange: (focus: string) => void;
  onRefresh: () => void;
  onViewPartnerDetail: (partner: PartnerItem) => void;
  onInvitePitch: (partner: PartnerItem) => void;
  onInvitePartner?: (partner: PartnerItem) => void;
  isLoadingDetail?: boolean;
}

// Fallback Logo Component with Error Handling
function PartnerLogo({
  logoUrl,
  name,
}: {
  logoUrl?: string | null;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);

  const initials = useMemo(() => {
    if (!name) return "MP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [name]);

  if (logoUrl && !hasError) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E8EA] shrink-0 overflow-hidden shadow-2xs flex items-center justify-center p-0.5">
        <img
          src={logoUrl}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-2xl bg-[#181343]/5 border border-[#E8E8EA] text-[#181343] shrink-0 flex items-center justify-center font-bold text-sm tracking-wide shadow-2xs">
      {initials}
    </div>
  );
}

// Helper to safely parse past activities
function getPastActivitiesCount(partner: PartnerItem): number {
  if (!partner.pastActivities) return 0;
  if (Array.isArray(partner.pastActivities)) return partner.pastActivities.length;
  try {
    const parsed = JSON.parse(partner.pastActivities as string);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function PartnerCurationView({
  partners,
  isLoading,
  focusFilter,
  onFocusFilterChange,
  onRefresh,
  onViewPartnerDetail,
  onInvitePitch,
  onInvitePartner,
  isLoadingDetail = false,
}: PartnerCurationViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [docStatusFilter, setDocStatusFilter] = useState<"ALL" | "COMPLETE" | "PARTIAL" | "INCOMPLETE">("ALL");

  // Handler for invite action (supporting both prop names)
  const handleInvite = (partner: PartnerItem) => {
    if (onInvitePartner) {
      onInvitePartner(partner);
    } else {
      onInvitePitch(partner);
    }
  };

  // Distinct regions derived from actual database data
  const availableRegions = useMemo(() => {
    const list = Array.isArray(partners) ? partners : [];
    const regionSet = new Set<string>();
    list.forEach((p) => {
      const region = p.province || p.city;
      if (region && region.trim()) {
        regionSet.add(region.trim());
      }
    });
    return Array.from(regionSet).sort((a, b) => a.localeCompare(b));
  }, [partners]);

  // Check if any filter is active
  const isFiltered = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      focusFilter !== "ALL" ||
      regionFilter !== "ALL" ||
      docStatusFilter !== "ALL"
    );
  }, [searchQuery, focusFilter, regionFilter, docStatusFilter]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setRegionFilter("ALL");
    setDocStatusFilter("ALL");
    onFocusFilterChange("ALL");
  };

  // Interconnected filtering across search, focus area, region, and document check
  const filteredPartners = useMemo(() => {
    const list = Array.isArray(partners) ? partners : [];

    return list.filter((p) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchTagline = p.tagline?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchCity = p.city?.toLowerCase().includes(q);
        const matchProvince = p.province?.toLowerCase().includes(q);
        const matchFocus = FOCUS_AREA_CONFIG[p.focusArea]?.label?.toLowerCase().includes(q);
        if (!matchName && !matchTagline && !matchDesc && !matchCity && !matchProvince && !matchFocus) {
          return false;
        }
      }

      // 2. Focus Area Filter
      if (focusFilter !== "ALL" && p.focusArea !== focusFilter) {
        return false;
      }

      // 3. Region Filter
      if (regionFilter !== "ALL") {
        const matchesRegion =
          (p.province && p.province.toLowerCase() === regionFilter.toLowerCase()) ||
          (p.city && p.city.toLowerCase() === regionFilter.toLowerCase());
        if (!matchesRegion) return false;
      }

      // 4. Document Status Filter
      if (docStatusFilter !== "ALL") {
        const hasLegal = Boolean(p.legalNumber && p.legalNumber.trim());
        const hasNpwp = Boolean(p.npwpNumber && p.npwpNumber.trim());

        if (docStatusFilter === "COMPLETE" && !(hasLegal && hasNpwp)) {
          return false;
        }
        if (docStatusFilter === "PARTIAL" && !((hasLegal || hasNpwp) && !(hasLegal && hasNpwp))) {
          return false;
        }
        if (docStatusFilter === "INCOMPLETE" && (hasLegal || hasNpwp)) {
          return false;
        }
      }

      return true;
    });
  }, [partners, searchQuery, focusFilter, regionFilter, docStatusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Identitas & Deskripsi Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight">
            Direktori &amp; Seleksi Mitra CSR
          </h2>
          <p className="text-xs sm:text-sm text-[#787680] mt-1 leading-relaxed">
            Temukan organisasi pelaksana yang sesuai dengan kebutuhan dan bidang program CSR.
          </p>
        </div>

        {/* Minimal Context Summary & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-[#E8E8EA] text-xs font-semibold text-[#181343]">
            Menampilkan <span className="text-emerald-700 font-bold">{filteredPartners.length}</span> dari {partners.length} Mitra
          </div>
          <button
            type="button"
            onClick={onRefresh}
            title="Segarkan direktori mitra"
            className="p-2 rounded-xl border border-[#E8E8EA] bg-white hover:bg-slate-50 text-[#787680] hover:text-[#181343] transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Search & Connected Filters Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-[#787680] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama mitra, keahlian, atau wilayah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors focus:bg-white focus:border-[#181343]/40 focus:ring-2 focus:ring-[#181343]/8 text-[#1A1C1D] placeholder:text-[#9A98A6]"
            />
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter 1: Bidang Keahlian */}
            <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-[#787680]" />
              <span className="text-[11px] font-semibold text-[#787680] hidden sm:inline">Bidang:</span>
              <select
                value={focusFilter}
                onChange={(e) => onFocusFilterChange(e.target.value)}
                className="text-xs bg-transparent text-[#181343] font-medium outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="ALL">Semua Bidang Keahlian</option>
                {csrFocusAreaEnum.map((area) => (
                  <option key={area} value={area}>
                    {FOCUS_AREA_CONFIG[area]?.label || area}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Wilayah / Domisili */}
            <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-[#787680]" />
              <span className="text-[11px] font-semibold text-[#787680] hidden sm:inline">Wilayah:</span>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="text-xs bg-transparent text-[#181343] font-medium outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="ALL">Semua Wilayah</option>
                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Status Pemeriksaan Dokumen Administratif */}
            <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-2">
              <FileCheck className="w-3.5 h-3.5 text-[#787680]" />
              <span className="text-[11px] font-semibold text-[#787680] hidden sm:inline">Dokumen:</span>
              <select
                value={docStatusFilter}
                onChange={(e) => setDocStatusFilter(e.target.value as any)}
                className="text-xs bg-transparent text-[#181343] font-medium outline-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="ALL">Semua Status Dokumen</option>
                <option value="COMPLETE">Dokumen Lengkap (SK &amp; NPWP)</option>
                <option value="PARTIAL">Sebagian Tercatat</option>
                <option value="INCOMPLETE">Dalam Pemeriksaan / Belum Ada</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl px-2.5 py-2 cursor-pointer transition-colors"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </div>

        {/* Active Filter Indicators */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#787680]">
            <span className="font-medium">Filter aktif:</span>
            {searchQuery.trim() && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Pencarian: &quot;{searchQuery.trim()}&quot;
              </span>
            )}
            {focusFilter !== "ALL" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Bidang: {(FOCUS_AREA_CONFIG as Record<string, { label: string }>)[focusFilter]?.label || focusFilter}
              </span>
            )}
            {regionFilter !== "ALL" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Wilayah: {regionFilter}
              </span>
            )}
            {docStatusFilter !== "ALL" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Status: {docStatusFilter === "COMPLETE" ? "Dokumen Lengkap" : docStatusFilter === "PARTIAL" ? "Sebagian Tercatat" : "Dalam Pemeriksaan"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Partner Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#787680] space-y-3 bg-white rounded-3xl border border-[#E8E8EA]">
          <div className="w-8 h-8 border-2 border-[#181343] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-medium text-slate-600">Memuat direktori mitra pelaksana...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 rounded-3xl bg-white border border-dashed border-[#C8C5D0] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#181343]/5 text-[#181343] flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#181343]">
            Mitra Tidak Ditemukan
          </h4>
          <p className="text-xs text-[#787680] max-w-md mx-auto leading-relaxed">
            Tidak ada organisasi mitra yang cocok dengan filter atau kata kunci pencarian yang dipilih. Coba sesuaikan kata kunci atau bersihkan filter aktif.
          </p>
          {isFiltered && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs font-semibold rounded-xl text-[#181343] border-[#E8E8EA]"
              >
                Reset Semua Filter
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPartners.map((partner) => {
            const focus = FOCUS_AREA_CONFIG[partner.focusArea] || {
              label: partner.focusArea,
              variant: "slate" as const,
            };

            const pastActivitiesCount = getPastActivitiesCount(partner);
            const hasLegal = Boolean(partner.legalNumber && partner.legalNumber.trim());
            const hasNpwp = Boolean(partner.npwpNumber && partner.npwpNumber.trim());

            return (
              <div
                key={partner.id}
                className="rounded-2xl bg-white border border-[#E8E8EA] hover:border-[#181343]/25 shadow-2xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Logo + Focus Area Badge + Administrative Status Indicator */}
                  <div className="flex items-start justify-between gap-3">
                    <PartnerLogo logoUrl={partner.logoUrl} name={partner.name} />

                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={focus.variant} size="sm">
                        {focus.label}
                      </Badge>

                      {/* Actual Document Completeness Indicator */}
                      {hasLegal && hasNpwp ? (
                        <span
                          title="Dokumen Administratif Lengkap (SK Kemenkumham & NPWP tercatat)"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Dokumen Lengkap</span>
                        </span>
                      ) : hasLegal || hasNpwp ? (
                        <span
                          title="Sebagian berkas administratif tercatat"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80"
                        >
                          <FileCheck className="w-3 h-3 text-sky-600" />
                          <span>Sebagian Tercatat</span>
                        </span>
                      ) : (
                        <span
                          title="Dokumen administratif dalam pemeriksaan / belum dilengkapi"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Dalam Pemeriksaan</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Partner Info */}
                  <div>
                    <h4 className="text-base font-bold text-[#181343] leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {partner.name}
                    </h4>

                    {partner.tagline && (
                      <p className="text-xs font-medium text-[#787680] line-clamp-1 mt-0.5">
                        {partner.tagline}
                      </p>
                    )}

                    {/* Domicile / Location */}
                    <div className="flex items-center gap-1.5 text-xs text-[#787680] mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {partner.city
                          ? `${partner.city}, ${partner.province || "Indonesia"}`
                          : partner.province || "Indonesia"}
                      </span>
                    </div>
                  </div>

                  {/* Organization Description (max 2-3 lines) */}
                  <p className="text-xs text-[#47464F] line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {partner.description ||
                      "Organisasi pelaksana program kemitraan sosial dan keberlanjutan masyarakat."}
                  </p>

                  {/* Practical Experience / Portfolio / Profile Meta */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#787680]">
                    {pastActivitiesCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 font-medium text-slate-700">
                        <Briefcase className="w-3 h-3 text-slate-500" />
                        <span>{pastActivitiesCount} Program Riwayat</span>
                      </span>
                    ) : partner.organizationType ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 font-medium text-slate-700">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{partner.organizationType}</span>
                      </span>
                    ) : null}

                    {partner.foundedYear && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 font-medium text-slate-700">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Berdiri {partner.foundedYear}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: Lihat Profil & Undang Bermitra */}
                <div className="pt-3.5 border-t border-[#F4F4F6] flex items-center justify-between gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoadingDetail}
                    onClick={() => onViewPartnerDetail(partner)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs font-semibold text-[#181343] hover:text-emerald-700 border-[#E8E8EA] hover:border-emerald-300 hover:bg-emerald-50/50 rounded-xl transition-all cursor-pointer"
                  >
                    Lihat Profil
                  </Button>

                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleInvite(partner)}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    Undang Bermitra
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
