"use client";

import React from "react";
import {
  X,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpportunityItem } from "./types";
import { FOCUS_AREA_CONFIG, STATUS_CONFIG, formatRupiah, formatDate } from "./helpers";

interface PartnerOpportunityDetailModalProps {
  isOpen: boolean;
  opportunity: OpportunityItem | null;
  onClose: () => void;
  onApply: (opportunity: OpportunityItem) => void;
  onViewCompany?: (companyId: string) => void;
}

export function PartnerOpportunityDetailModal({
  isOpen,
  opportunity,
  onClose,
  onApply,
  onViewCompany,
}: PartnerOpportunityDetailModalProps) {
  if (!isOpen || !opportunity) return null;

  const focusConfig = FOCUS_AREA_CONFIG[opportunity.focusArea] || {
    label: opportunity.focusArea,
    variant: "slate" as const,
  };

  const statusConfig = STATUS_CONFIG[opportunity.status] || {
    label: opportunity.status,
    variant: "slate" as const,
  };

  const canApply = opportunity.status === "OPEN" || opportunity.status === "IN_REVIEW";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner Thumbnail (if available) */}
        {opportunity.bannerUrl && (
          <div className="relative w-full h-48 bg-slate-100 overflow-hidden shrink-0">
            <img
              src={opportunity.bannerUrl}
              alt={opportunity.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
              <Badge variant={focusConfig.variant} size="md">
                {focusConfig.label}
              </Badge>
              <Badge variant={statusConfig.variant} size="md" hasDot>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        )}

        {/* Modal Header if no banner */}
        {!opportunity.bannerUrl && (
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <Badge variant={focusConfig.variant} size="md">
                {focusConfig.label}
              </Badge>
              <Badge variant={statusConfig.variant} size="md" hasDot>
                {statusConfig.label}
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Sponsoring Company */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              {opportunity.companyLogo ? (
                <img
                  src={opportunity.companyLogo}
                  alt={opportunity.companyName || "Logo"}
                  className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20 flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Perusahaan Penyelenggara CSR
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm truncate">
                  {opportunity.companyName || "Perusahaan Mitra"}
                </h4>
              </div>
            </div>

            {onViewCompany && opportunity.companyId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onViewCompany(opportunity.companyId);
                }}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
                className="text-xs font-bold shrink-0 border-slate-200 hover:bg-slate-100"
              >
                Lihat Profil
              </Button>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {opportunity.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Key Parameters Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-700 block">
                Estimasi Alokasi Anggaran
              </span>
              <div className="text-lg font-extrabold text-emerald-900">
                {formatRupiah(opportunity.estimatedBudget)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Lokasi Pelaksanaan
              </span>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  {opportunity.targetCity
                    ? `${opportunity.targetCity}${
                        opportunity.targetProvince ? `, ${opportunity.targetProvince}` : ""
                      }`
                    : "Nasional / Fleksibel"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Jadwal Periode Program
              </span>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  {formatDate(opportunity.startDate)} s/d {formatDate(opportunity.endDate)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
              <span className="text-[11px] font-semibold text-amber-700 block">
                Batas Akhir Pengajuan (Deadline)
              </span>
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{opportunity.deadline ? formatDate(opportunity.deadline) : "Tidak dibatasi"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <Button variant="ghost" size="md" onClick={onClose}>
            Kembali
          </Button>

          {canApply ? (
            <Button
              variant="primary"
              size="md"
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/25"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onApply(opportunity);
              }}
            >
              Ajukan Proposal
            </Button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              Inisiatif ini sedang tidak menerima proposal baru
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
