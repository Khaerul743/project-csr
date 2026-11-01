"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Users,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquareQuote,
  ShieldCheck,
  Download,
  Edit3,
  Layers,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalItem } from "./types";
import { PROPOSAL_STATUS_CONFIG, formatRupiah, formatDate } from "./helpers";
import { EditProposalModal } from "./EditProposalModal";

interface ProposalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalItem | null;
  onSuccess: () => void;
}

export function ProposalDetailModal({
  isOpen,
  onClose,
  proposal,
  onSuccess,
}: ProposalDetailModalProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Parse structured proposal content if available
  const { overviewText, activities, budgetItems } = React.useMemo(() => {
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

  if (!isOpen || !proposal) return null;

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
      if (!token) throw new Error("Sesi login berakhir");

      const res = await fetch(`/api/proposals/${proposal.id}/withdraw`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menarik proposal");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setWithdrawError(err.message || "Terjadi kesalahan saat menarik proposal");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-850 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Detail Pengajuan Proposal</h2>
                <Badge variant={statusConfig.variant} size="sm" hasDot>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-300">
                Diajukan pada {formatDate(proposal.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opportunity Context Banner */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block">
              Inisiatif Target CSR
            </span>
            <h4 className="font-bold text-slate-900 text-sm">{proposal.opportunityTitle}</h4>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{proposal.companyName || "Perusahaan Pengelola"}</span>
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] text-slate-400 block font-medium">Anggaran yang Diajukan</span>
            <span className="text-base font-extrabold text-teal-600">
              {formatRupiah(proposal.proposedBudget)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Status Feedback Alert if any */}
          {proposal.status === "ACCEPTED" && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Proposal Disetujui! Proyek Masuk Tahap Kolaborasi</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Perusahaan telah menerima tawaran inisiatif ini. Kolaborasi resmi telah dibentuk dan tim perusahaan akan segera berkoordinasi untuk penandatanganan kesepakatan (MoU/Perjanjian Kerja Sama).
              </p>
            </div>
          )}

          {proposal.status === "REVISION_REQUESTED" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>Perusahaan Meminta Penyesuaian / Revisi Proposal</span>
                </div>
                <Badge variant="amber" size="sm">
                  Perlu Revisi
                </Badge>
              </div>
              {proposal.feedback && (
                <div className="bg-white/90 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 italic leading-relaxed">
                  "{proposal.feedback}"
                </div>
              )}
              <p className="text-xs text-amber-800 leading-relaxed">
                Silakan sesuaikan isi proposal, anggaran, atau berkas pendukung dengan menekan tombol <strong>"Revisi Proposal Sekarang"</strong> di bawah.
              </p>
            </div>
          )}

          {proposal.status === "REJECTED" && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Proposal Belum Diterima</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Mohon maaf, proposal ini belum dapat disetujui oleh pihak perusahaan pada siklus inisiatif kali ini.
              </p>
            </div>
          )}

          {proposal.status !== "REVISION_REQUESTED" && proposal.feedback && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <MessageSquareQuote className="w-4 h-4 text-teal-600" />
                <span>Catatan / Feedback dari Perusahaan:</span>
              </div>
              <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100">
                "{proposal.feedback}"
              </p>
            </div>
          )}

          {/* Judul & Ringkasan */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Judul Proposal
            </span>
            <h3 className="text-base font-extrabold text-slate-900">{proposal.title}</h3>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ringkasan Teknis & Metodologi
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line text-xs">
              {overviewText}
            </div>
          </div>

          {/* Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Estimasi Durasi</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {proposal.durationMonths ? `${proposal.durationMonths} Bulan` : "Fleksibel"}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Target Penerima Manfaat</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {proposal.targetBeneficiaries || "-"}
              </p>
            </div>
          </div>

          {/* Rencana Kegiatan & Milestone Terstruktur */}
          {activities.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Rencana Kegiatan & Milestone ({activities.length} Tahapan)
                </span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Terintegrasi ke Monitoring
                </span>
              </div>

              <div className="space-y-2.5">
                {activities.map((act: any, idx: number) => (
                  <div
                    key={act.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">{act.title}</h5>
                      </div>
                      {act.targetTimeline && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                          {act.targetTimeline}
                        </span>
                      )}
                    </div>
                    {act.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {act.description}
                      </p>
                    )}
                    {(act.suggestedKpi || act.expectedEvidence) && (
                      <div className="pl-7 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {act.suggestedKpi && (
                          <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                            <span className="text-slate-400 font-medium block text-[10px]">Target Output / KPI</span>
                            <span className="text-slate-700 font-semibold">{act.suggestedKpi}</span>
                          </div>
                        )}
                        {act.expectedEvidence && (
                          <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                            <span className="text-slate-400 font-medium block text-[10px]">Bukti Pelaksanaan</span>
                            <span className="text-teal-700 font-semibold">{act.expectedEvidence}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rencana Anggaran Biaya (RAB) Terstruktur */}
          {budgetItems.length > 0 && (
            <div className="space-y-3 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Rencana Anggaran Biaya (RAB) Terstruktur
              </span>
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Komponen Biaya</th>
                        <th className="py-2.5 px-2 text-center w-16">Vol</th>
                        <th className="py-2.5 px-2 text-center w-16">Satuan</th>
                        <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {budgetItems.map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-medium text-slate-900">{item.itemName}</td>
                          <td className="py-2 px-2 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-2 px-2 text-center text-slate-600">{item.unit}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatRupiah(item.unitPrice)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{formatRupiah(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right text-xs">
                          Total Anggaran Proposal:
                        </td>
                        <td className="py-2.5 px-3 text-right text-teal-700 text-xs">
                          {formatRupiah(proposal.proposedBudget)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Document URL */}
          {proposal.documentUrl && (() => {
            const isLocalUpload = proposal.documentUrl.startsWith("/uploads/");
            const fileName = isLocalUpload
              ? proposal.documentUrl.split("/").pop()
              : proposal.documentUrl;

            return (
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-600/15 text-teal-700 flex items-center justify-center shrink-0 border border-teal-600/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-950 truncate">
                        Dokumen Proposal Lengkap
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-200/60 text-teal-800">
                        {isLocalUpload ? "Berkas Server" : "Cloud Link"}
                      </span>
                    </div>
                    <span className="text-[11px] text-teal-700 block truncate mt-0.5">
                      {fileName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={proposal.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#181343] text-white text-xs font-semibold hover:bg-[#26224C] transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{isLocalUpload ? "Lihat / Unduh" : "Buka Berkas"}</span>
                    {isLocalUpload ? (
                      <Download className="w-3.5 h-3.5" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5" />
                    )}
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Withdraw Error if any */}
          {withdrawError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{withdrawError}</span>
            </div>
          )}

          {/* Confirm Withdraw Box */}
          {showConfirmWithdraw && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold">Konfirmasi Penarikan Proposal</h5>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Apakah Anda yakin ingin menarik kembali proposal ini? Tindakan ini akan membatalkan proses evaluasi oleh perusahaan.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmWithdraw(false)}
                  disabled={isWithdrawing}
                >
                  Batal
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? "Menarik..." : "Ya, Tarik Proposal"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 gap-3">
          <div>
            {canWithdraw && !showConfirmWithdraw && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmWithdraw(true)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Tarik Proposal
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={onClose}>
              Tutup
            </Button>
            {canEdit && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs sm:text-sm font-semibold"
                leftIcon={<Edit3 className="w-4 h-4" />}
              >
                {proposal.status === "REVISION_REQUESTED"
                  ? "Revisi Proposal Sekarang"
                  : "Ubah Isi Proposal"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Edit Proposal */}
      <EditProposalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        proposal={proposal}
        onSuccess={() => {
          setIsEditModalOpen(false);
          onSuccess();
          onClose();
        }}
      />
    </div>
  );
}
