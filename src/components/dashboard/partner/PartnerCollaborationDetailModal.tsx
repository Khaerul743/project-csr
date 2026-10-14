"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck2,
  Building2,
  Calendar,
  DollarSign,
  Users,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Check,
  FileText,
  MapPin,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerCollaborationItem } from "./types";
import {
  COLLABORATION_STATUS_CONFIG,
  FOCUS_AREA_CONFIG,
  formatRupiah,
  formatDate,
} from "./helpers";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";

interface PartnerCollaborationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboration: PartnerCollaborationItem | null;
  onSuccess: () => void;
  onOpenChat?: (collaborationId: string) => void;
}

export function PartnerCollaborationDetailModal({
  isOpen,
  onClose,
  collaboration,
  onSuccess,
  onOpenChat,
}: PartnerCollaborationDetailModalProps) {
  const [partnerNote, setPartnerNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  if (!isOpen || !collaboration) return null;

  const statusConfig =
    COLLABORATION_STATUS_CONFIG[collaboration.status] || {
      label: collaboration.status,
      variant: "slate" as const,
    };

  const focusConfig = collaboration.opportunityFocusArea
    ? FOCUS_AREA_CONFIG[collaboration.opportunityFocusArea as CsrFocusArea]
    : null;

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerNote.trim()) return;

    setIsSubmittingNote(true);
    setNoteError(null);
    setNoteSuccess(false);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      // Gabungkan atau perbarui catatan
      const currentNotes = collaboration.notes ? `${collaboration.notes}\n\n` : "";
      const updatedNotes = `${currentNotes}[Respon Mitra]: ${partnerNote.trim()}`;

      const res = await fetch(`/api/collaborations/${collaboration.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: updatedNotes,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal memperbarui catatan negosiasi");
      }

      setNoteSuccess(true);
      setPartnerNote("");
      onSuccess();
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (err: any) {
      setNoteError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-700 text-base overflow-hidden shrink-0">
              {collaboration.companyLogo ? (
                <img
                  src={collaboration.companyLogo}
                  alt={collaboration.companyName || "Perusahaan"}
                  className="w-full h-full object-cover"
                />
              ) : (
                (collaboration.companyName || "C").substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {collaboration.companyName || "Perusahaan Sponsor"}
                </h3>
                <Badge variant={statusConfig.variant} size="sm" hasDot>
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                {collaboration.companyCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {collaboration.companyCity}
                  </span>
                )}
                {collaboration.companyEmail && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {collaboration.companyEmail}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Alert Banner */}
          {collaboration.status === "AGREED" ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-950 text-sm">
                  Kontrak MoU Telah Resmi Disahkan
                </p>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">
                  Perjanjian kerja sama ini telah disahkan oleh kedua belah pihak. Program CSR telah diinisialisasi dan siap untuk dieksekusi di lapangan sesuai jadwal.
                </p>
                {collaboration.agreedAt && (
                  <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                    Disahkan pada: {formatDate(collaboration.agreedAt)}
                  </p>
                )}
              </div>
            </div>
          ) : collaboration.status === "NEGOTIATION" ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950 text-sm">
                  Tahap Negosiasi & Finalisasi Dokumen MoU
                </p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Proposal Anda telah diterima. Saat ini pihak perusahaan sedang menyepakati rincian anggaran final, durasi pelaksanaan, serta menyiapkan dokumen MoU legal.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950 text-sm">Kolaborasi Dibatalkan</p>
                <p className="mt-0.5 text-rose-800 leading-relaxed">
                  Kesepakatan kerja sama ini telah dihentikan atau dibatalkan oleh pihak perusahaan.
                </p>
              </div>
            </div>
          )}

          {/* Program & Proposal Reference */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Inisiatif CSR Sponsor
              </span>
              {focusConfig && (
                <Badge variant={focusConfig.variant} size="sm">
                  {focusConfig.label}
                </Badge>
              )}
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">
              {collaboration.opportunityTitle || "Inisiatif CSR"}
            </h4>
            <div className="pt-2 border-t border-slate-200/60 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Judul Proposal Anda:</span>
              <p className="text-xs font-bold text-slate-800">
                {collaboration.proposalTitle || "Proposal Program CSR"}
              </p>
              {collaboration.proposalSummary && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {collaboration.proposalSummary}
                </p>
              )}
            </div>
          </div>

          {/* Agreed Terms & Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold text-slate-500">Anggaran Disepakati</span>
              </div>
              <div className="text-base font-extrabold text-emerald-600">
                {formatRupiah(collaboration.finalBudget || collaboration.proposedBudget)}
              </div>
              {collaboration.finalBudget &&
                collaboration.proposedBudget &&
                collaboration.finalBudget !== collaboration.proposedBudget && (
                  <span className="text-[10px] text-slate-400 block line-through">
                    Usulan awal: {formatRupiah(collaboration.proposedBudget)}
                  </span>
                )}
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-semibold text-slate-500">Jadwal Pelaksanaan</span>
              </div>
              <div className="text-xs font-bold text-slate-800 leading-snug">
                {collaboration.startDate && collaboration.endDate
                  ? `${formatDate(collaboration.startDate)} - ${formatDate(collaboration.endDate)}`
                  : "Belum ditentukan"}
              </div>
              <span className="text-[10px] text-slate-400 block">Linimasa program</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[11px] font-semibold text-slate-500">Target Manfaat</span>
              </div>
              <div className="text-xs font-bold text-slate-800 truncate">
                {collaboration.targetBeneficiaries || "-"}
              </div>
              <span className="text-[10px] text-slate-400 block">Penerima dampak</span>
            </div>
          </div>

          {/* Legal MoU Document Box */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Dokumen Surat Perjanjian Kerja Sama (MoU)
                </h5>
              </div>
              {collaboration.mouDocumentUrl ? (
                <Badge variant="emerald" size="sm">
                  Tersedia
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  Menunggu Dokumen
                </Badge>
              )}
            </div>

            {collaboration.mouDocumentUrl ? (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    Berkas Kontrak Legal MoU Terlampir
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Dokumen perjanjian resmi telah diunggah oleh pihak perusahaan. Klik tombol di samping untuk membaca dan mengunduh berkas.
                  </p>
                </div>
                <a
                  href={collaboration.mouDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  Buka Dokumen MoU
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">
                  Dokumen MoU belum diunggah oleh pihak perusahaan.
                </p>
                <p className="text-[11px] text-slate-400">
                  Setelah dokumen kerja sama diunggah dan ditandatangani, tautan dokumen digital akan otomatis tersedia di sini.
                </p>
              </div>
            )}
          </div>

          {/* Notes & Negotiation Thread */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-3">
            <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Catatan & Klausul Kesepakatan
            </h5>

            {collaboration.notes ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                {collaboration.notes}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Belum ada catatan khusus yang dilampirkan untuk kesepakatan ini.
              </p>
            )}

            {/* Quick response note if still in negotiation */}
            {collaboration.status === "NEGOTIATION" && (
              <form onSubmit={handleSendNote} className="pt-2 space-y-2 border-t border-slate-100">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Kirim Catatan Tambahan / Respon Koordinasi ke Perusahaan:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partnerNote}
                    onChange={(e) => setPartnerNote(e.target.value)}
                    placeholder="Tuliskan respon atau pertanyaan terkait klausul/jadwal..."
                    disabled={isSubmittingNote}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmittingNote || !partnerNote.trim()}
                    leftIcon={isSubmittingNote ? undefined : <Send className="w-3.5 h-3.5" />}
                    className="shrink-0 bg-teal-600 hover:bg-teal-700 text-xs"
                  >
                    {isSubmittingNote ? "Mengirim..." : "Kirim"}
                  </Button>
                </div>

                {noteSuccess && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Catatan Anda berhasil disimpan dan ditambahkan!
                  </p>
                )}
                {noteError && (
                  <p className="text-[11px] text-rose-600 font-medium">{noteError}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenChat && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100 text-xs"
                onClick={() => {
                  onClose();
                  onOpenChat(collaboration.id);
                }}
                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              >
                Buka Chat Negosiasi
              </Button>
            )}
            <span className="text-[11px] text-slate-400">
              ID Kontrak: {collaboration.id.substring(0, 8)}...
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
