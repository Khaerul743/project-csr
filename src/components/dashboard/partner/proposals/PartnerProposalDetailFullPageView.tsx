"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Users,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquareQuote,
  Download,
  Edit3,
  FileCheck2,
  Clock,
  Layers,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalItem } from "../types";
import { PROPOSAL_STATUS_CONFIG, formatRupiah, formatDate } from "../helpers";
import { EditProposalModal } from "../EditProposalModal";

function cleanProposalTitle(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/(?:\.\s*|\s+)?Proposal_CSR_[A-Za-z0-9_.]+(?:\.\.\.)?/gi, "")
    .trim();
}

function cleanProposalOverview(desc?: string | null, title?: string): string {
  if (!desc) return "";
  let cleaned = desc.trim();
  cleaned = cleaned.replace(/^Program\s*["'][^"']+["']\s*(?:adalah|dirancang untuk|merupakan)?\s*/i, "Dirancang untuk ");
  if (title) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`^["']?${escaped}["']?\\s*(?:adalah|dirancang untuk|merupakan)?\\s*`, "i"), "Dirancang untuk ");
  }
  return cleaned;
}

interface PartnerProposalDetailFullPageViewProps {
  proposal: ProposalItem;
  onBack: () => void;
  onSuccess: () => void;
  onNavigateToCollaborations?: () => void;
}

export function PartnerProposalDetailFullPageView({
  proposal,
  onBack,
  onSuccess,
  onNavigateToCollaborations,
}: PartnerProposalDetailFullPageViewProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Parse structured proposal content if available
  const { overviewText, activities, budgetItems } = useMemo(() => {
    let overview = proposal?.summary || "";
    let acts: any[] = [];
    let bItems: any[] = [];

    if (proposal?.summary) {
      try {
        const parsed = JSON.parse(proposal.summary);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.overview === "string") overview = parsed.overview;
          if (Array.isArray(parsed.activities)) acts = parsed.activities;
          if (Array.isArray(parsed.budgetItems)) bItems = parsed.budgetItems;
        }
      } catch {
        // Plain text fallback
      }
    }

    return { overviewText: overview, activities: acts, budgetItems: bItems };
  }, [proposal?.summary]);

  const statusConfig = PROPOSAL_STATUS_CONFIG[proposal.status] || {
    label: proposal.status,
    variant: "slate" as const,
  };

  const canEdit =
    proposal.status === "SUBMITTED" ||
    proposal.status === "UNDER_REVIEW" ||
    proposal.status === "REVISION_REQUESTED";

  const canWithdraw =
    proposal.status === "SUBMITTED" ||
    proposal.status === "UNDER_REVIEW" ||
    proposal.status === "REVISION_REQUESTED";

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Silakan masuk kembali.");

      const res = await fetch(`/api/proposals/${proposal.id}/withdraw`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menarik proposal");
      }

      onSuccess();
      onBack();
    } catch (err: any) {
      setWithdrawError(err.message || "Terjadi kesalahan saat menarik proposal");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* ============================================================ */}
      {/* 1. TOP NAVIGATION & ACTION ROW                                */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs font-bold text-[#181343] hover:text-[#009E75] border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 cursor-pointer shadow-2xs"
          >
            Kembali ke Daftar Proposal
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant={statusConfig.variant} size="md" hasDot className="shadow-2xs">
            {statusConfig.label}
          </Badge>

          {proposal.status === "ACCEPTED" && onNavigateToCollaborations && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onNavigateToCollaborations}
              leftIcon={<FileCheck2 className="w-4 h-4" />}
              className="text-xs font-semibold bg-[#181343] hover:bg-[#25205c] text-white rounded-xl px-4 py-2 cursor-pointer shadow-2xs"
            >
              Lihat Kolaborasi &amp; MoU
            </Button>
          )}

          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-3.5 py-2 cursor-pointer shadow-2xs"
            >
              {proposal.status === "REVISION_REQUESTED" ? "Revisi Proposal" : "Ubah Isi Proposal"}
            </Button>
          )}

          {canWithdraw && !showConfirmWithdraw && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmWithdraw(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl px-3.5 py-2 cursor-pointer shadow-2xs"
            >
              Tarik Proposal
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CONFIRM WITHDRAW ALERT (JIKA DIPILIH)                     */}
      {/* ============================================================ */}
      {showConfirmWithdraw && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-950">Konfirmasi Penarikan Pengajuan Proposal</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Apakah lembaga Anda yakin ingin membatalkan dan menarik proposal ini? Tindakan ini akan menghentikan proses evaluasi seleksi oleh perusahaan mitra.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmWithdraw(false)}
              disabled={isWithdrawing}
              className="text-xs font-semibold text-slate-700 hover:bg-white"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="text-xs font-semibold px-4 py-2 rounded-xl"
            >
              {isWithdrawing ? "Menarik..." : "Ya, Tarik Proposal"}
            </Button>
          </div>
        </div>
      )}

      {withdrawError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{withdrawError}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. HERO IDENTITY BANNER                                      */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {/* Inisial Sponsor */}
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#181343] text-base shrink-0 shadow-2xs">
              {(proposal.companyName || "PT").substring(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {proposal.companyName || "Perusahaan Pengelola CSR"}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Diajukan pada {formatDate(proposal.createdAt)}
                </span>
                {proposal.opportunityTitle && (
                  <>
                    <span className="text-slate-300">&bull;</span>
                    <span className="truncate max-w-sm">
                      Inisiatif Sasaran: <strong className="text-slate-800 font-semibold">{proposal.opportunityTitle}</strong>
                    </span>
                  </>
                )}
              </div>

              {/* Judul Proposal Utama */}
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight leading-snug"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {cleanProposalTitle(proposal.title)}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. STATUS FEEDBACK ALERT (JIKA DISETUJUI / REVISI / DITOLAK)  */}
      {/* ============================================================ */}
      {proposal.status === "ACCEPTED" && (
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Proposal Disetujui: Program Masuk Tahap Kolaborasi Resmi</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Perusahaan telah menerima proposal inisiatif ini. Kolaborasi resmi telah terbentuk dan siap difinalisasi klausul kesepakatan serta penandatanganan dokumen MoU legal.
            </p>
          </div>
          {onNavigateToCollaborations && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onNavigateToCollaborations}
              leftIcon={<FileCheck2 className="w-4 h-4" />}
              className="text-xs font-semibold bg-[#181343] hover:bg-[#25205c] text-white rounded-xl px-4 py-2 shrink-0 cursor-pointer shadow-xs"
            >
              Buka Kesepakatan &amp; MoU
            </Button>
          )}
        </div>
      )}

      {proposal.status === "REVISION_REQUESTED" && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Perusahaan Meminta Penyesuaian / Revisi Proposal</span>
            </div>
            <Badge variant="amber" size="sm">
              Perlu Revisi
            </Badge>
          </div>

          {proposal.feedback && (
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed italic">
              "{proposal.feedback}"
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-amber-800 leading-relaxed">
              Silakan perbarui dokumen proposal, penyesuaian anggaran, atau rincian milestone sesuai masukan di atas.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="text-xs font-semibold bg-[#181343] hover:bg-[#25205c] text-white rounded-xl px-4 py-2 shrink-0 cursor-pointer"
            >
              Revisi Proposal Sekarang
            </Button>
          </div>
        </div>
      )}

      {proposal.status === "REJECTED" && (
        <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-rose-950 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Proposal Belum Dapat Diterima</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            Proposal ini belum dapat disetujui oleh pihak perusahaan sponsor pada siklus inisiatif saat ini.
          </p>
        </div>
      )}

      {proposal.status !== "REVISION_REQUESTED" && proposal.feedback && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-700">
            <MessageSquareQuote className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Catatan / Feedback dari Perusahaan:</span>
          </div>
          <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200/60 leading-relaxed italic">
            "{proposal.feedback}"
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. EMPAT PARAMETER KUNCI PROPOSAL (SERAGAM & BERSIH)         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Item 1: Anggaran Diajukan */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">
              Anggaran yang Diajukan
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#181343] tracking-tight tabular-nums">
              {formatRupiah(proposal.proposedBudget)}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Pagu usulan lembaga mitra
          </div>
        </div>

        {/* Item 2: Estimasi Durasi */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">
              Estimasi Durasi
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#181343] tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
              <span>{proposal.durationMonths ? `${proposal.durationMonths} Bulan` : "Fleksibel"}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Target waktu pelaksanaan
          </div>
        </div>

        {/* Item 3: Target Penerima Manfaat */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">
              Target Sasaran
            </span>
            <div className="text-sm font-bold text-slate-800 line-clamp-2 min-h-[32px] flex items-start gap-1.5 pt-0.5">
              <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{proposal.targetBeneficiaries || "Belum ditentukan"}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Penerima manfaat langsung
          </div>
        </div>

        {/* Item 4: Dokumen Proposal */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">
              Dokumen Proposal
            </span>
            <div className="min-h-[32px] flex items-center pt-0.5">
              {proposal.documentUrl ? (
                <a
                  href={proposal.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009E75] hover:text-emerald-800 hover:underline"
                >
                  <FileCheck2 className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[150px]">
                    {proposal.documentUrl.startsWith("/uploads/")
                      ? proposal.documentUrl.split("/").pop()
                      : "Berkas Lampiran"}
                  </span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Tidak ada berkas</span>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Format PDF atau berkas resmi
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. RINGKASAN TEKNIS & METODOLOGI                             */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
        <div className="space-y-0.5 pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-[#181343]">
            Ringkasan Teknis &amp; Metodologi Pelaksanaan
          </h3>
          <p className="text-xs text-slate-500">
            Deskripsi pendekatan operasional dan strategi penyaluran manfaat yang diajukan.
          </p>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-1">
          {cleanProposalOverview(overviewText, proposal.title) || (
            <span className="text-slate-400 italic">Tidak ada deskripsi teknis khusus yang dilampirkan.</span>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. RENCANA KEGIATAN & MILESTONE TERSTRUKTUR (JIKA ADA)        */}
      {/* ============================================================ */}
      {activities.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-[#181343]">
                Rencana Kegiatan &amp; Milestone Pelaksanaan
              </h3>
              <p className="text-xs text-slate-500">
                Tahapan kerja terstruktur yang menjadi acuan target pelaksanaan dan bukti lapangan.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto tabular-nums">
              {activities.length} Tahapan Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {activities.map((act: any, idx: number) => (
              <div
                key={act.id || idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#181343] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#181343] truncate">
                      {act.title}
                    </h4>
                  </div>
                  {act.targetTimeline && (
                    <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                      {act.targetTimeline}
                    </span>
                  )}
                </div>

                {act.description && (
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    {act.description}
                  </p>
                )}

                {(act.suggestedKpi || act.expectedEvidence) && (
                  <div className="pl-8 pt-1 grid grid-cols-1 gap-2 text-xs">
                    {act.suggestedKpi && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-slate-400 font-medium block text-[10px]">Target Output / KPI:</span>
                        <span className="text-slate-700 font-semibold">{act.suggestedKpi}</span>
                      </div>
                    )}
                    {act.expectedEvidence && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-slate-400 font-medium block text-[10px]">Bukti Pelaksanaan yang Diharapkan:</span>
                        <span className="text-slate-800 font-semibold">{act.expectedEvidence}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. RENCANA ANGGARAN BIAYA (RAB) TERSTRUKTUR (JIKA ADA)        */}
      {/* ============================================================ */}
      {budgetItems.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
          <div className="space-y-0.5 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#181343]">
              Rencana Anggaran Biaya (RAB) Terperinci
            </h3>
            <p className="text-xs text-slate-500">
              Rincian alokasi biaya per komponen pelaksanaan inisiatif program.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Komponen Biaya</th>
                    <th className="py-3 px-3 text-center w-20">Volume</th>
                    <th className="py-3 px-3 text-center w-24">Satuan</th>
                    <th className="py-3 px-4 text-right">Harga Satuan</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budgetItems.map((item: any, idx: number) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{item.itemName}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600 tabular-nums">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600 tabular-nums">{formatRupiah(item.unitPrice)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums">{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right text-xs">
                      Total Anggaran Proposal:
                    </td>
                    <td className="py-3 px-4 text-right text-[#009E75] text-sm tabular-nums">
                      {formatRupiah(proposal.proposedBudget)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. MODAL EDIT PROPOSAL                                       */}
      {/* ============================================================ */}
      <EditProposalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        proposal={proposal}
        onSuccess={() => {
          setIsEditModalOpen(false);
          onSuccess();
          onBack();
        }}
      />
    </div>
  );
}
