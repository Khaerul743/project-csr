"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Building2,
  Send,
  MapPin,
  AlertCircle,
  Coins,
  ShieldCheck,
  Clock,
  Layers,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
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

// Fallback Logo Component with error handling
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
    <div className="w-12 h-12 rounded-2xl bg-[#181343] text-white shrink-0 flex items-center justify-center font-bold text-sm tracking-wide shadow-2xs">
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

  // 3. Resolve partner's actual expertise label (avoid generic "Inisiatif Lainnya")
  // ALWAYS called before any conditional return to strictly obey the Rules of Hooks
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
    // If LAINNYA, prefer organizationType if available or "Kemitraan Sosial"
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
        // Fallback: server will still reject duplicate via 409
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

  // Safe early exit AFTER all React Hooks have been declared
  if (!partner) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Undang Bermitra CSR"
      description="Pilih peluang program CSR yang relevan untuk mengundang mitra mengajukan proposal kolaborasi."
      maxWidth="lg"
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
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-0.5">
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

          {/* 1. Informasi Calon Mitra */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <PartnerLogo logoUrl={partner.logoUrl} name={partner.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                  Calon Mitra Pelaksana
                </span>
                <Badge variant={partnerExpertise.variant as any} size="sm">
                  {partnerExpertise.label}
                </Badge>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#181343] truncate mt-0.5">
                {partner.name}
              </h4>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#787680] mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Domisili Mitra: {partner.city ? `${partner.city}, ${partner.province || "Indonesia"}` : partner.province || "Indonesia"}
                  </span>
                </span>
                {partner.legalNumber && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dokumen SK Tercatat</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Pemilihan Peluang CSR */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#181343] block">
              Pilih Peluang Program CSR Perusahaan *
            </label>
            {eligibleOpportunities.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-semibold">Belum ada Peluang CSR yang aktif (Status OPEN / IN_REVIEW).</p>
                <p className="text-[11px] text-amber-700">
                  Silakan buat peluang CSR baru terlebih dahulu di menu &quot;Peluang CSR&quot; sebelum mengundang mitra.
                </p>
              </div>
            ) : (
              <select
                value={selectedOpportunityId || eligibleOpportunities[0]?.id}
                onChange={(e) => setSelectedOpportunityId(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-slate-800 cursor-pointer font-medium"
                required
              >
                {eligibleOpportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} — {opp.status === "OPEN" ? "Terbuka" : "Ditinjau"} ({opp.focusArea})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ringkasan Peluang Terpilih */}
          {activeOpportunity && (
            <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider">
                  Ringkasan Peluang Terpilih
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  {activeOpportunity.status === "OPEN" ? "Status: Terbuka" : "Status: Dalam Tinjauan"}
                </span>
              </div>
              <h5 className="text-xs sm:text-sm font-bold text-[#181343]">
                {activeOpportunity.title}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#787680] pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    Lokasi Program: {activeOpportunity.targetCity || "Seluruh Wilayah Sasaran"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-[#181343]">
                    Anggaran: {activeOpportunity.estimatedBudget ? formatRupiah(activeOpportunity.estimatedBudget) : "Menyesuaikan Proposal"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Pesan Tambahan (Opsional) */}
          <Textarea
            label="Pesan Tambahan untuk Calon Mitra (Opsional)"
            placeholder="Tuliskan pesan singkat atau informasi tambahan untuk calon mitra..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="text-xs"
          />

          {/* 4. Informasi Alur Kemitraan (Subtle Info Box) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-[#787680] leading-relaxed">
            <span className="font-semibold text-[#181343]">Alur Kemitraan:</span> Mitra dapat menerima atau menolak undangan. Jika menerima, mitra dapat mengajukan proposal dan RAB untuk ditinjau perusahaan.
          </div>

          {/* 5. Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E8EA]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleReset}
              disabled={isLoading}
              className="text-xs rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={eligibleOpportunities.length === 0 || isAlreadyInvited || isCheckingDuplicate}
              leftIcon={<Send className="w-4 h-4" />}
              className="px-5 cursor-pointer text-xs"
            >
              {isCheckingDuplicate
                ? "Memeriksa..."
                : isAlreadyInvited
                ? "Sudah Diundang"
                : "Kirim Undangan Kemitraan"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
