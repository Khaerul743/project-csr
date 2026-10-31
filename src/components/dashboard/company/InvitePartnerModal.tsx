"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Mail,
  AlertCircle,
  CheckCircle2,
  Building2,
  Send,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerItem, OpportunityItem } from "./types";
import { FOCUS_AREA_CONFIG } from "./helpers";

interface InvitePartnerModalProps {
  isOpen: boolean;
  partner: PartnerItem | null;
  opportunities: OpportunityItem[];
  onClose: () => void;
  onSuccess: () => void;
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

  // Filter only OPEN or IN_REVIEW opportunities
  const eligibleOpportunities = (Array.isArray(opportunities) ? opportunities : []).filter(
    (o) => o?.status === "OPEN" || o?.status === "IN_REVIEW"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    setErrorMessage(null);

    const oppId = selectedOpportunityId || eligibleOpportunities[0]?.id;
    if (!oppId) {
      setErrorMessage("Silakan pilih inisiatif opportunity terlebih dahulu.");
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
        throw new Error(json.message || "Gagal mengirim undangan ke mitra");
      }

      setIsSuccess(true);
      setTimeout(() => {
        handleReset();
        onSuccess();
      }, 1500);
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
    onClose();
  };

  if (!partner) return null;

  const partnerFocus = FOCUS_AREA_CONFIG[partner.focusArea] || {
    label: partner.focusArea,
    variant: "emerald" as const,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Undang Mitra Pelaksana (Pitch Invite)"
      description="Kirimkan undangan resmi agar mitra mengajukan proposal untuk program CSR perusahaan Anda."
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900">
            Undangan Berhasil Terkirim!
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Mitra <strong>{partner.name}</strong> akan menerima notifikasi undangan pitch ini di ruang kerja mereka.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mitra Info Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#181343] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {partner.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {partner.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={partnerFocus.variant} size="sm">
                  {partnerFocus.label}
                </Badge>
                {partner.city && (
                  <span className="text-[11px] text-slate-400 truncate">
                    {partner.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Select Opportunity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Pilih Inisiatif CSR Perusahaan *
            </label>
            {eligibleOpportunities.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Perusahaan Anda belum memiliki inisiatif aktif (status OPEN). Silakan buat opportunity terlebih dahulu.
              </div>
            ) : (
              <select
                value={selectedOpportunityId || eligibleOpportunities[0]?.id}
                onChange={(e) => setSelectedOpportunityId(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                required
              >
                {eligibleOpportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Custom Message */}
          <Textarea
            label="Pesan Khusus untuk Mitra (Opsional)"
            placeholder="Contoh: Halo Yayasan, kami terkesan dengan pengalaman Anda di bidang konservasi pesisir dan ingin mengundang Anda untuk berkolaborasi dalam program ini..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleReset}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="md"
              isLoading={isLoading}
              disabled={eligibleOpportunities.length === 0}
              leftIcon={<Send className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 px-5 cursor-pointer"
            >
              Kirim Undangan
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
