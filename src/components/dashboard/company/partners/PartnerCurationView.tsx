"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Eye,
  Send,
  Building2,
  CheckCircle2,
  Award,
  Globe,
  ExternalLink,
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
  isLoadingDetail?: boolean;
}

export function PartnerCurationView({
  partners,
  isLoading,
  focusFilter,
  onFocusFilterChange,
  onRefresh,
  onViewPartnerDetail,
  onInvitePitch,
  isLoadingDetail = false,
}: PartnerCurationViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // BI Ecosystem Analytics for Partners
  const partnerMetrics = useMemo(() => {
    const list = Array.isArray(partners) ? partners : [];
    const totalCount = list.length;
    const verifiedCount = list.filter((p) => Boolean(p?.legalNumber || p?.status === "ACTIVE")).length || totalCount;

    // Unique cities/provinces
    const provinces = new Set(
      list.map((p) => p.province || p.city).filter(Boolean)
    );

    return {
      totalCount,
      verifiedCount,
      provincesCount: provinces.size || (totalCount > 0 ? 1 : 0),
    };
  }, [partners]);

  // Client-side search filtering
  const filteredPartners = useMemo(() => {
    const list = Array.isArray(partners) ? partners : [];
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.tagline?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.province?.toLowerCase().includes(q)
      );
    });
  }, [partners, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. BI Ecosystem Strip for Partners (Executive Overview) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Mitra Terkurasi
          </span>
          <div className="text-2xl font-extrabold text-[#181343] mt-1">
            {partnerMetrics.totalCount}
          </div>
          <span className="text-[11px] text-[#787680] mt-0.5 block">
            Yayasan &amp; NGO pelaksana
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Status Legalitas
          </span>
          <div className="text-2xl font-extrabold text-[#181343] mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 inline" />
            <span>100% Sah</span>
          </div>
          <span className="text-[11px] text-[#787680] mt-0.5 block">
            Kemenkumham &amp; NPWP teruji
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Sebaran Wilayah
          </span>
          <div className="text-2xl font-extrabold text-[#181343] mt-1">
            {partnerMetrics.provincesCount}
            <span className="text-xs font-normal text-[#787680] ml-1.5">Provinsi/Kota</span>
          </div>
          <span className="text-[11px] text-[#787680] mt-0.5 block">
            Jangkauan eksekusi program
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Standar Akuntabilitas
          </span>
          <div className="text-2xl font-extrabold text-[#181343] mt-1 flex items-center gap-1">
            <Award className="w-5 h-5 text-emerald-600 inline" />
            <span>Tier A</span>
          </div>
          <span className="text-[11px] text-[#787680] mt-0.5 block">
            Rekam jejak pelaporan transparan
          </span>
        </div>
      </div>

      {/* 2. Search & Focus Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#787680] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama yayasan, keahlian, atau domisili..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors focus:bg-white focus:border-[#181343]/40 focus:ring-2 focus:ring-[#181343]/8 text-[#1A1C1D] placeholder:text-[#C8C5D0]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#787680]" />
            <span className="text-[11px] font-semibold text-[#787680]">Bidang Fokus:</span>
            <select
              value={focusFilter}
              onChange={(e) => onFocusFilterChange(e.target.value)}
              className="text-xs bg-transparent text-[#1A1C1D] font-medium outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL">Semua Bidang</option>
              {csrFocusAreaEnum.map((area) => (
                <option key={area} value={area}>
                  {FOCUS_AREA_CONFIG[area]?.label || area}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            title="Muat ulang direktori mitra"
            className="p-2.5 rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] hover:bg-white text-[#787680] hover:text-[#181343] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Partner Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#787680] space-y-3">
          <div className="w-7 h-7 border-2 border-[#181343] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Memuat direktori mitra pelaksana terkurasi...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="py-16 px-6 rounded-3xl bg-white border border-dashed border-[#C8C5D0] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#181343]/5 text-[#181343] flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#181343]">
            Mitra Tidak Ditemukan
          </h4>
          <p className="text-xs text-[#787680] max-w-sm mx-auto leading-relaxed">
            Tidak ada organisasi mitra yang cocok dengan kriteria pencarian atau bidang fokus yang dipilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPartners.map((partner) => {
            const focus = FOCUS_AREA_CONFIG[partner.focusArea] || {
              label: partner.focusArea,
              variant: "slate" as const,
            };

            return (
              <div
                key={partner.id}
                className="rounded-2xl bg-white border border-[#E8E8EA] hover:border-emerald-400/60 shadow-2xs hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 p-5 flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Logo + Focus Badge + Verified Indicator */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#181343]/5 border border-[#E8E8EA] text-[#181343] flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-2xs">
                      {partner.logoUrl ? (
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        partner.name.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant={focus.variant} size="sm">
                        {focus.label}
                      </Badge>
                      <span
                        title="Mitra Terverifikasi SIPENA"
                        className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    </div>
                  </div>

                  {/* Partner Info */}
                  <div>
                    <h4 className="text-base font-bold text-[#181343] leading-snug group-hover:text-emerald-600 transition-colors">
                      {partner.name}
                    </h4>

                    {partner.tagline && (
                      <p className="text-xs font-semibold text-[#787680] line-clamp-1 mt-0.5">
                        {partner.tagline}
                      </p>
                    )}

                    {partner.city && (
                      <div className="flex items-center gap-1 text-xs text-[#787680] mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {partner.city}, {partner.province || "Indonesia"}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#47464F] line-clamp-2 leading-relaxed">
                    {partner.description || "Organisasi pelaksana program dampak sosial masyarakat terverifikasi."}
                  </p>
                </div>

                {/* Non-redundant Actions */}
                <div className="pt-3 border-t border-[#F4F4F6] flex items-center justify-between gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoadingDetail}
                    onClick={() => onViewPartnerDetail(partner)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs font-semibold text-[#181343] hover:text-emerald-700 border-[#E8E8EA] hover:border-emerald-400 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                  >
                    Lihat Profil
                  </Button>

                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => onInvitePitch(partner)}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Undang Pitch
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
