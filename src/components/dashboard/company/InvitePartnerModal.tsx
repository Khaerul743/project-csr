"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Send,
  MapPin,
  AlertCircle,
  Coins,
  ShieldCheck,
  Clock,
  Info,
  ChevronDown,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerItem, OpportunityItem } from "./types";
import { FOCUS_AREA_CONFIG, formatRupiah } from "./helpers";

interface InvitePartnerModalProps {
  isOpen: boolean;
  partner: PartnerItem | null;
  opportunities: OpportunityItem[];
  onClose: () => void;
  onSuccess: () => void;
}

// Fallback Circular Logo Component matching the updated partner profile system
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
      <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
        <img
          src={logoUrl}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-full bg-[#181343] text-white shrink-0 flex items-center justify-center font-bold text-xs tracking-wide">
      {initials}
    </div>
  );
}

export function InvitePartnerModal({
  isOpen,
  partner,
  opportunities,
  onClose,
  onSuccess,
}: InvitePartnerModalProps) {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadyInvited, setIsAlreadyInvited] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // 1. Filter only OPEN or IN_REVIEW opportunities (eligible for inviting partners)
  const eligibleOpportunities = useMemo(() => {
    const list = Array.isArray(opportunities) ? opportunities : [];
    return list.filter((o) => o?.status === "OPEN" || o?.status === "IN_REVIEW");
  }, [opportunities]);

  // 2. Current active opportunity object
  const activeOpportunity = useMemo(() => {
    const targetId = selectedOpportunityId || eligibleOpportunities[0]?.id;
    return eligibleOpportunities.find((o) => o.id === targetId) || null;
  }, [eligibleOpportunities, selectedOpportunityId]);

  // 3. Resolve partner's actual expertise label
  const partnerExpertise = useMemo(() => {
    if (!partner) {
      return {
        label: "Kemitraan CSR",
        variant: "emerald" as const,
      };
    }
    if (partner.focusArea && partner.focusArea !== "LAINNYA") {
      const config = FOCUS_AREA_CONFIG[partner.focusArea as keyof typeof FOCUS_AREA_CONFIG];
      return {
        label: config?.label || partner.focusArea,
        variant: config?.variant || "emerald",
      };
    }
    if (partner.organizationType && partner.organizationType.trim()) {
      return {
        label: partner.organizationType,
        variant: "slate" as const,
      };
    }
    return {
      label: "Kemitraan CSR",
      variant: "emerald" as const,
    };
  }, [partner?.focusArea, partner?.organizationType]);

  // 4. Check whether this partner is already invited to the active opportunity
  useEffect(() => {
    let isMounted = true;
    if (!isOpen || !partner || !activeOpportunity) {
      setIsAlreadyInvited(false);
      return;
    }

    const checkExistingInvitation = async () => {
      setIsCheckingDuplicate(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`/api/opportunities/${activeOpportunity.id}/invite`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok && isMounted) {
          const json = await res.json();
          const list = Array.isArray(json.data) ? json.data : [];
          const exists = list.some(
            (inv: any) =>
              inv.partnerId === partner.id &&
              inv.status !== "DECLINED"
          );
          setIsAlreadyInvited(exists);
        }
      } catch {
        if (isMounted) setIsAlreadyInvited(false);
      } finally {
        if (isMounted) setIsCheckingDuplicate(false);
      }
    };

    checkExistingInvitation();

    return () => {
      isMounted = false;
    };
  }, [isOpen, partner?.id, activeOpportunity?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    setErrorMessage(null);

    const oppId = selectedOpportunityId || eligibleOpportunities[0]?.id;
    if (!oppId) {
      setErrorMessage("Silakan pilih inisiatif peluang CSR terlebih dahulu.");
      return;
    }

    if (isAlreadyInvited) {
      setErrorMessage("Mitra ini sudah memiliki undangan aktif untuk peluang CSR yang dipilih.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/opportunities/${oppId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          partnerId: partner.id,
          message: message.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setIsAlreadyInvited(true);
          throw new Error("Mitra ini sudah memiliki undangan aktif untuk peluang CSR yang dipilih.");
        }
        throw new Error(json.message || "Gagal mengirim undangan kemitraan");
      }

      setIsSuccess(true);
      setTimeout(() => {
        handleReset();
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat mengundang mitra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedOpportunityId("");
    setMessage("");
    setErrorMessage(null);
    setIsSuccess(false);
    setIsAlreadyInvited(false);
    onClose();
  };

  if (!partner) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Undang Bermitra CSR"
      description="Pilih peluang program CSR yang relevan untuk mengundang mitra mengajukan proposal kolaborasi."
      maxWidth="lg"
      footer={
        !isSuccess ? (
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleReset}
              disabled={isLoading}
              className="text-xs rounded-xl cursor-pointer"
            >
              Batal
            </Button>
            <Button
              form="invite-partner-form"
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={eligibleOpportunities.length === 0 || isAlreadyInvited || isCheckingDuplicate}
              leftIcon={<Send className="w-4 h-4" />}
              className="px-5 cursor-pointer text-xs rounded-xl bg-[#181343] hover:bg-[#26224C] text-white"
            >
              {isCheckingDuplicate
                ? "Memeriksa..."
                : isAlreadyInvited
                ? "Sudah Diundang"
                : "Kirim Undangan Kemitraan"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {isSuccess ? (
        /* Success Notification State */
        <div className="py-8 text-center space-y-3.5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-90 duration-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-[#181343]">
              Undangan kemitraan berhasil dikirim.
            </h4>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 mt-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Status: Menunggu Respons Mitra</span>
            </div>
          </div>
          <p className="text-xs text-[#787680] max-w-md mx-auto leading-relaxed">
            Mitra <strong>{partner.name}</strong> dapat menerima atau menolak undangan sebelum melanjutkan pengajuan proposal dan RAB. Anda dapat memantau status tanggapan mitra di dashboard perusahaan.
          </p>
        </div>
      ) : (
        <form id="invite-partner-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Warning if already invited */}
          {isAlreadyInvited && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Undangan Aktif Sudah Ada</span>
                <p className="text-amber-800 leading-relaxed">
                  Mitra ini sudah memiliki undangan aktif untuk peluang CSR yang dipilih. Silakan pilih peluang lain atau tunggu konfirmasi tanggapan dari mitra.
                </p>
              </div>
            </div>
          )}

          {/* 1. Informasi Calon Mitra (Clean Row, Circular Avatar) */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3.5">
            <PartnerLogo logoUrl={partner.logoUrl} name={partner.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-[#181343] truncate">
                  {partner.name}
                </h4>
                <Badge variant={partnerExpertise.variant as any} size="sm">
                  {partnerExpertise.label}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Domisili Mitra: {partner.city ? `${partner.city}, ${partner.province || "Indonesia"}` : partner.province || "Indonesia"}
                  </span>
                </span>
                {partner.legalNumber && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>SK Tercatat</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. Pemilihan Peluang CSR & Meta Strip Terpadu (Anti Box-in-a-Box) */}
          <div className="space-y-2">
            <label htmlFor="invite-opportunity-select" className="text-xs font-semibold text-[#181343] block">
              Pilih Peluang Program CSR Perusahaan <span className="text-rose-500">*</span>
            </label>
            {eligibleOpportunities.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-semibold">Belum ada Peluang CSR yang aktif (Status Terbuka / Ditinjau).</p>
                <p className="text-[11px] text-amber-700">
                  Silakan buat peluang CSR baru terlebih dahulu di menu &quot;Peluang CSR&quot; sebelum mengundang mitra.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <select
                    id="invite-opportunity-select"
                    value={selectedOpportunityId || eligibleOpportunities[0]?.id}
                    onChange={(e) => setSelectedOpportunityId(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#181343] focus:ring-2 focus:ring-[#181343]/10 text-[#181343] cursor-pointer font-medium transition-colors pr-9 appearance-none"
                    required
                  >
                    {eligibleOpportunities.map((opp) => (
                      <option key={opp.id} value={opp.id}>
                        {opp.title} - {opp.status === "OPEN" ? "Terbuka" : "Ditinjau"} ({opp.focusArea})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Detail Peluang Terpilih: Ringkas & Terintegrasi, Bukan Kartu Bertingkat */}
                {activeOpportunity && (
                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-[#64748B] px-1">
                    <div className="inline-flex items-center gap-1.5 font-medium text-[#181343]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{activeOpportunity.status === "OPEN" ? "Peluang Terbuka" : "Dalam Tinjauan"}</span>
                    </div>
                    <span className="text-slate-300">·</span>
                    <div className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{activeOpportunity.targetCity || "Seluruh Sasaran"}</span>
                    </div>
                    <span className="text-slate-300">·</span>
                    <div className="inline-flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-[#181343]">
                        {activeOpportunity.estimatedBudget ? formatRupiah(activeOpportunity.estimatedBudget) : "Menyesuaikan Proposal"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Pesan Tambahan (Opsional) */}
          <div className="space-y-1.5">
            <label htmlFor="invite-partner-message" className="text-xs font-semibold text-[#181343] block">
              Pesan Tambahan untuk Calon Mitra <span className="text-[#64748B] font-normal">(Opsional)</span>
            </label>
            <textarea
              id="invite-partner-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan arahan singkat, fokus kolaborasi, atau jadwal diskusi awal untuk calon mitra..."
              rows={3}
              className="w-full text-xs sm:text-sm bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl p-3 text-[#181343] placeholder:text-slate-400 focus:outline-none focus:border-[#181343] focus:ring-2 focus:ring-[#181343]/10 resize-none transition-colors"
            />
          </div>

          {/* 4. Informasi Alur Kemitraan (Petunjuk Ringkas Bersih) */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-[#47464F] leading-relaxed">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#181343] font-semibold">Alur Kemitraan:</strong> Mitra dapat menerima atau menolak undangan. Jika menerima, mitra dapat mengajukan proposal dan RAB untuk ditinjau perusahaan.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
}
