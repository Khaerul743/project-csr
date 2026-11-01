"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  MapPin,
  Calendar,
  Users,
  UserPlus,
  Sparkles,
  Edit,
  Tag,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpportunityItem, OpportunityInvitationItem } from "./types";
import { FOCUS_AREA_CONFIG, STATUS_CONFIG, formatRupiah, formatDate } from "./helpers";
import { ALL_17_SDGS, getProgramSdgs } from "@/components/dashboard/analytics/helpers";
import { SdgGoal } from "@/components/dashboard/analytics/types";

interface OpportunityDetailModalProps {
  isOpen: boolean;
  opportunity: OpportunityItem | null;
  onClose: () => void;
  onEdit: (opportunity: OpportunityItem) => void;
  onInvitePartner: (opportunity: OpportunityItem) => void;
}

export function OpportunityDetailModal({
  isOpen,
  opportunity,
  onClose,
  onEdit,
  onInvitePartner,
}: OpportunityDetailModalProps) {
  const [invitations, setInvitations] = useState<OpportunityInvitationItem[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    if (isOpen && opportunity) {
      setHasImgError(false);
      const fetchInvitations = async () => {
        setIsLoadingInvites(true);
        try {
          const token = localStorage.getItem("accessToken");
          const res = await fetch(`/api/opportunities/${opportunity.id}/invite`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            setInvitations(json.data || []);
          }
        } catch {
          // silently handle
        } finally {
          setIsLoadingInvites(false);
        }
      };

      fetchInvitations();
    }
  }, [isOpen, opportunity]);

  // Compute SDGs and ESG pillars
  const sdgs = useMemo(() => {
    if (!opportunity) return [];
    const ids = getProgramSdgs({
      id: opportunity.id,
      title: opportunity.title,
      description: opportunity.description,
      focusArea: opportunity.focusArea,
      status: "PLANNED",
      budget: opportunity.estimatedBudget || "0",
    });
    return ids
      .map((id) => ALL_17_SDGS.find((s) => s.id === id))
      .filter((s): s is SdgGoal => !!s);
  }, [opportunity]);

  const mappedEsgPillars = useMemo(() => {
    const pillars = {
      E: [] as SdgGoal[],
      S: [] as SdgGoal[],
      G: [] as SdgGoal[],
    };
    sdgs.forEach((goal) => {
      goal.esgPillars.forEach((p: string) => {
        if (p === "E" && !pillars.E.some((x) => x.id === goal.id)) pillars.E.push(goal);
        if (p === "S" && !pillars.S.some((x) => x.id === goal.id)) pillars.S.push(goal);
        if (p === "G" && !pillars.G.some((x) => x.id === goal.id)) pillars.G.push(goal);
      });
    });
    return pillars;
  }, [sdgs]);

  if (!isOpen || !opportunity) return null;

  const focusConfig = FOCUS_AREA_CONFIG[opportunity.focusArea] || {
    label: opportunity.focusArea,
    variant: "slate" as const,
  };

  const statusConfig = STATUS_CONFIG[opportunity.status] || {
    label: opportunity.status,
    variant: "navy" as const,
  };

  // Clean description removing raw JSON or tags
  const cleanDescription = opportunity.description
    ? opportunity.description.replace(/\n\n\[Klasifikasi SDGs:.*?\]/g, "").trim()
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Peluang CSR"
      description="Informasi lengkap inisiatif kerja sama, klasifikasi SDGs–ESG, dan status pengajuan mitra."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Banner Cover with Fallback */}
        {opportunity.bannerUrl && !hasImgError ? (
          <div className="relative w-full aspect-video max-h-56 rounded-2xl overflow-hidden border border-[#E8E8EA] shadow-2xs bg-slate-900">
            <img
              src={opportunity.bannerUrl}
              alt={opportunity.title}
              onError={() => setHasImgError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
          </div>
        ) : null}

        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E8EA]">
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant} size="md" hasDot>
              {statusConfig.label}
            </Badge>
            <Badge variant={focusConfig.variant} size="md">
              {focusConfig.label}
            </Badge>
          </div>
          <span className="text-xs text-[#787680]">
            Dibuat: {formatDate(opportunity.createdAt)}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-[#181343] leading-snug">
            {opportunity.title}
          </h3>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA]">
            <span className="text-[11px] font-semibold text-[#787680] block">
              Estimasi Anggaran
            </span>
            <span className="text-sm font-bold text-[#009E75] mt-0.5 block truncate">
              {opportunity.estimatedBudget && parseFloat(opportunity.estimatedBudget) > 0
                ? formatRupiah(opportunity.estimatedBudget)
                : "Belum Ditentukan"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA]">
            <span className="text-[11px] font-semibold text-[#787680] block">
              Lokasi Sasaran
            </span>
            <span
              className="text-sm font-bold text-[#181343] mt-0.5 block truncate"
              title={[opportunity.targetCity, opportunity.targetProvince].filter(Boolean).join(", ") || "Belum ditentukan"}
            >
              {[opportunity.targetCity, opportunity.targetProvince].filter(Boolean).join(", ") || "Belum ditentukan"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA]">
            <span className="text-[11px] font-semibold text-[#787680] block">
              Batas Proposal
            </span>
            <span className="text-sm font-bold text-[#181343] mt-0.5 block truncate">
              {opportunity.deadline ? formatDate(opportunity.deadline) : "Belum Ditentukan"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA]">
            <span className="text-[11px] font-semibold text-[#787680] block">
              Periode Pelaksanaan
            </span>
            <span className="text-sm font-bold text-[#181343] mt-0.5 block truncate">
              {opportunity.startDate && opportunity.endDate
                ? `${formatDate(opportunity.startDate)} s/d ${formatDate(opportunity.endDate)}`
                : "Sesuai Jadwal"}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
            Deskripsi Program &amp; Ruang Lingkup
          </h4>
          <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {cleanDescription || "Tidak ada rincian deskripsi tambahan."}
          </div>
        </div>

        {/* SDGs & ESG Classification */}
        {sdgs.length > 0 && (
          <div className="p-4 rounded-xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181343] uppercase tracking-wider block">
                Klasifikasi SDGs &amp; Pemetaan Pilar ESG
              </span>
              <span className="text-[11px] font-semibold text-[#787680]">
                {sdgs.length} Sasaran Terhubung
              </span>
            </div>

            {/* SDGs Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {sdgs.map((sdg) => (
                <span
                  key={sdg.id}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border"
                  style={{
                    backgroundColor: sdg.color + "14",
                    borderColor: sdg.color + "40",
                    color: sdg.color,
                  }}
                  title={sdg.description}
                >
                  <span>{sdg.code}</span>
                  <span className="font-medium text-slate-700">{sdg.name}</span>
                </span>
              ))}
            </div>

            {/* Mapped ESG Pillars */}
            <div className="p-3 rounded-lg bg-[#F9F9FB] border border-[#E8E8EA] grid grid-cols-3 gap-2 text-center text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  🌿 Lingkungan (E)
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {mappedEsgPillars.E.length > 0 ? `${mappedEsgPillars.E.length} Sasaran` : "—"}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">
                  👥 Sosial (S)
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {mappedEsgPillars.S.length > 0 ? `${mappedEsgPillars.S.length} Sasaran` : "—"}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-purple-800 uppercase block">
                  🏛️ Tata Kelola (G)
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {mappedEsgPillars.G.length > 0 ? `${mappedEsgPillars.G.length} Sasaran` : "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Invited Partners Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#181343]" />
              <h4 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                Mitra yang Diundang ({invitations.length})
              </h4>
            </div>

            {opportunity.status === "OPEN" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onInvitePartner(opportunity);
                }}
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                className="text-xs font-semibold text-[#181343] border-[#E8E8EA] rounded-xl hover:bg-slate-50"
              >
                Undang Mitra
              </Button>
            )}
          </div>

          {isLoadingInvites ? (
            <div className="p-4 text-center text-xs text-[#787680]">
              Memuat daftar mitra yang diundang...
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#F9F9FB] border border-dashed border-[#E8E8EA] text-center">
              <p className="text-xs text-slate-600 font-medium">
                Belum ada mitra yang diundang langsung untuk inisiatif ini.
              </p>
              <p className="text-[11px] text-[#787680] mt-0.5">
                Gunakan tab "Direktori &amp; Seleksi Mitra CSR" untuk menemukan NGO dan mengirim undangan pitch.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E8EA] border border-[#E8E8EA] rounded-xl overflow-hidden bg-white">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-[#181343] block truncate">
                      {inv.partner?.name || "Mitra"}
                    </span>
                    <span className="text-[11px] text-[#787680] block">
                      {inv.partner?.city} • Diundang pada {formatDate(inv.createdAt)}
                    </span>
                    {inv.message && (
                      <p className="text-[11px] text-slate-600 italic mt-1 bg-[#F9F9FB] p-2 rounded-lg border border-[#E8E8EA]">
                        "{inv.message}"
                      </p>
                    )}
                  </div>
                  <div>
                    {inv.status === "ACCEPTED" ? (
                      <Badge variant="emerald" size="sm" hasDot>
                        Menerima
                      </Badge>
                    ) : inv.status === "DECLINED" ? (
                      <Badge variant="rose" size="sm" hasDot>
                        Menolak
                      </Badge>
                    ) : (
                      <Badge variant="amber" size="sm" hasDot>
                        Menunggu Respons
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E8EA]">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              onClose();
              onEdit(opportunity);
            }}
            leftIcon={<Edit className="w-3.5 h-3.5" />}
            className="rounded-xl border-[#E8E8EA] text-slate-700 text-xs font-semibold"
          >
            Edit Peluang
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl px-5"
          >
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
