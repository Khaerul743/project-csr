"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpportunityItem, OpportunityInvitationItem } from "./types";
import { FOCUS_AREA_CONFIG, STATUS_CONFIG, formatRupiah, formatDate } from "./helpers";

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

  useEffect(() => {
    if (isOpen && opportunity) {
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
          // silent fallback
        } finally {
          setIsLoadingInvites(false);
        }
      };

      fetchInvitations();
    }
  }, [isOpen, opportunity]);

  if (!opportunity) return null;

  const focusConfig = FOCUS_AREA_CONFIG[opportunity.focusArea] || {
    label: opportunity.focusArea,
    variant: "emerald" as const,
  };

  const statusConfig = STATUS_CONFIG[opportunity.status] || {
    label: opportunity.status,
    variant: "emerald" as const,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rincian Peluang CSR (Opportunity)"
      description="Informasi lengkap inisiatif, status penyerapan proposal, dan mitra yang telah diundang."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Banner Image */}
        {opportunity.bannerUrl && (
          <div className="relative w-full aspect-video max-h-60 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900">
            <img
              src={opportunity.bannerUrl}
              alt={opportunity.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant} size="md" hasDot>
              {statusConfig.label}
            </Badge>
            <Badge variant={focusConfig.variant} size="md">
              {focusConfig.label}
            </Badge>
          </div>
          <span className="text-xs text-slate-400">
            Dibuat: {formatDate(opportunity.createdAt)}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 leading-snug">
            {opportunity.title}
          </h3>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Estimasi Anggaran
            </span>
            <span className="text-sm font-bold text-emerald-700 mt-0.5 block truncate">
              {formatRupiah(opportunity.estimatedBudget)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Lokasi Target
            </span>
            <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
              {opportunity.targetCity || opportunity.targetProvince
                ? `${opportunity.targetCity || ""}${
                    opportunity.targetCity && opportunity.targetProvince ? ", " : ""
                  }${opportunity.targetProvince || ""}`
                : "Nasional"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Batas Proposal
            </span>
            <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
              {formatDate(opportunity.deadline)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Periode Program
            </span>
            <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
              {opportunity.startDate ? formatDate(opportunity.startDate) : "TBD"} -{" "}
              {opportunity.endDate ? formatDate(opportunity.endDate) : "TBD"}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Deskripsi Program & Ruang Lingkup
          </h4>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {opportunity.description}
          </div>
        </div>

        {/* Invited Partners Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
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
              >
                Undang Mitra Lainnya
              </Button>
            )}
          </div>

          {isLoadingInvites ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Memuat daftar mitra yang diundang...
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                Belum ada mitra yang diundang langsung untuk inisiatif ini.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Gunakan tab "Kurasi Mitra" untuk menemukan NGO dan mengirim undangan pitch.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-slate-800 block truncate">
                      {inv.partner?.name || "Mitra"}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {inv.partner?.city} • Diundang pada {formatDate(inv.createdAt)}
                    </span>
                    {inv.message && (
                      <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
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
                        Menunggu Respon
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              onClose();
              onEdit(opportunity);
            }}
          >
            Edit Inisiatif
          </Button>

          <Button variant="secondary" size="md" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
