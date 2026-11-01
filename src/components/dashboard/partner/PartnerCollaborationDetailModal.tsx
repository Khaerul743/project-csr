"use client";

import React, { useState, useMemo } from "react";
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
  Layers,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  HelpCircle,
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
import {
  parseCollaborationPlan,
  serializeCollaborationPlan,
  PlanMilestoneItem,
  MilestonePlanStatus,
} from "../common/collaboration-plan";

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

  // Revision / Confirmation States
  const [isConfirmingPlan, setIsConfirmingPlan] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [planActionMessage, setPlanActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen || !collaboration) return null;

  const statusConfig =
    COLLABORATION_STATUS_CONFIG[collaboration.status] || {
      label: collaboration.status,
      variant: "slate" as const,
    };

  const focusConfig = collaboration.opportunityFocusArea
    ? FOCUS_AREA_CONFIG[collaboration.opportunityFocusArea as CsrFocusArea]
    : null;

  // Parse structured plan from notes
  const plan = parseCollaborationPlan(collaboration.notes);
  const milestones = plan.milestones || [];
  const planStatus: MilestonePlanStatus = plan.milestonePlanStatus || "DRAFT";

  // Partner Approves / Confirms the Milestones
  const handleConfirmMilestones = async () => {
    setIsConfirmingPlan(true);
    setPlanActionMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Harap login kembali.");

      const updatedPlan = serializeCollaborationPlan({
        ...plan,
        milestonePlanStatus: "CONFIRMED_BY_PARTNER",
        partnerFeedback: "",
        lastUpdatedBy: "PARTNER",
        lastUpdatedAt: new Date().toISOString(),
      });

      const res = await fetch(`/api/collaborations/${collaboration.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: updatedPlan,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal mengonfirmasi rencana milestone");
      }

      setPlanActionMessage({
        type: "success",
        text: "Terima kasih! Rencana milestone telah berhasil Anda konfirmasi. Rencana ini akan resmi diaktivasi ke modul monitoring saat MoU disahkan.",
      });
      setShowRevisionForm(false);
      onSuccess();
    } catch (err: any) {
      setPlanActionMessage({
        type: "error",
        text: err.message || "Terjadi kesalahan saat mengonfirmasi rencana.",
      });
    } finally {
      setIsConfirmingPlan(false);
    }
  };

  // Partner Requests Adjustment / Revision
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFeedback.trim()) {
      alert("Harap tuliskan catatan koreksi atau penyesuaian yang diinginkan.");
      return;
    }

    setIsConfirmingPlan(true);
    setPlanActionMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Harap login kembali.");

      const updatedPlan = serializeCollaborationPlan({
        ...plan,
        milestonePlanStatus: "REVISION_REQUESTED",
        partnerFeedback: revisionFeedback.trim(),
        lastUpdatedBy: "PARTNER",
        lastUpdatedAt: new Date().toISOString(),
      });

      const res = await fetch(`/api/collaborations/${collaboration.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: updatedPlan,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal mengirimkan catatan koreksi");
      }

      setPlanActionMessage({
        type: "success",
        text: "Catatan penyesuaian rencana milestone telah berhasil dikirimkan kepada tim CSR Admin.",
      });
      setShowRevisionForm(false);
      setRevisionFeedback("");
      onSuccess();
    } catch (err: any) {
      setPlanActionMessage({
        type: "error",
        text: err.message || "Terjadi kesalahan saat mengirim catatan koreksi.",
      });
    } finally {
      setIsConfirmingPlan(false);
    }
  };

  // Regular Note submit handler
  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerNote.trim()) return;

    setIsSubmittingNote(true);
    setNoteError(null);
    setNoteSuccess(false);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      // Update text notes inside serialized plan
      const currentText = plan.textNotes ? `${plan.textNotes}\n\n` : "";
      const updatedText = `${currentText}[Respon Mitra]: ${partnerNote.trim()}`;

      const updatedPlan = serializeCollaborationPlan({
        ...plan,
        textNotes: updatedText,
        lastUpdatedBy: "PARTNER",
        lastUpdatedAt: new Date().toISOString(),
      });

      const res = await fetch(`/api/collaborations/${collaboration.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: updatedPlan,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-700 text-base overflow-hidden shrink-0 shadow-2xs">
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
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
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
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Status Alert Banner */}
          {collaboration.status === "AGREED" ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-950 text-sm">
                  Kontrak MoU Telah Resmi Disahkan
                </p>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">
                  Perjanjian kerja sama ini telah disahkan oleh kedua belah pihak. Seluruh tahapan milestone yang telah disepakati otomatis aktif sebagai daftar monitoring di modul <strong>Pelaksanaan Program</strong>. Lembaga Anda tidak perlu menginput ulang kegiatan.
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
                  Tahap Negosiasi &amp; Finalisasi Rencana Pelaksanaan
                </p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Proposal Anda telah disetujui. Saat ini kedua belah pihak menyepakati nilai anggaran final, jadwal, serta meninjau rincian tahapan milestone yang diekstraksi dari dokumen proposal sebelum pengesahan MoU legal.
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

          {/* Feedback / Action Messages */}
          {planActionMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                planActionMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              {planActionMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <p className="font-medium leading-relaxed">{planActionMessage.text}</p>
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
              {collaboration.proposalDocumentUrl && (
                <div className="pt-1">
                  <a
                    href={collaboration.proposalDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 underline underline-offset-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat Berkas Proposal &amp; RAB yang Diajukan</span>
                  </a>
                </div>
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
                <Users className="w-3.5 h-3.5 text-[#181343]" />
                <span className="text-[11px] font-semibold text-slate-500">Penerima Manfaat</span>
              </div>
              <div className="text-xs font-bold text-slate-800 truncate">
                {collaboration.targetBeneficiaries || "-"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#181343]" />
                <span className="text-[11px] font-semibold text-slate-500">Rentang Jadwal</span>
              </div>
              <div className="text-xs font-bold text-slate-800">
                {collaboration.startDate && collaboration.endDate
                  ? `${formatDate(collaboration.startDate)} - ${formatDate(collaboration.endDate)}`
                  : "Menunggu Jadwal Legal"}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION: TINJAUAN RENCANA PELAKSANAAN & MILESTONES */}
          {/* ======================================================== */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8EA]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#181343]">
                    Tinjauan Rencana Pelaksanaan &amp; Milestone Monitoring
                  </h4>
                </div>
                <p className="text-[11px] text-[#787680]">
                  Rencana kegiatan yang diekstraksi dari dokumen proposal Anda. Konfirmasi kesesuaian tahapan sebelum disahkan menjadi kewajiban monitoring.
                </p>
              </div>

              <div>
                {planStatus === "CONFIRMED_BY_PARTNER" ? (
                  <Badge variant="emerald" size="sm" hasDot>
                    Telah Anda Setujui
                  </Badge>
                ) : planStatus === "PENDING_PARTNER_CONFIRMATION" ? (
                  <Badge variant="amber" size="sm" hasDot>
                    Perlu Konfirmasi Anda
                  </Badge>
                ) : planStatus === "REVISION_REQUESTED" ? (
                  <Badge variant="rose" size="sm" hasDot>
                    Menunggu Koreksi CSR
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    Draf Disusun CSR
                  </Badge>
                )}
              </div>
            </div>

            {/* Banner Status Konfirmasi Rencana */}
            {planStatus === "PENDING_PARTNER_CONFIRMATION" && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950">
                      Konfirmasi Kesepakatan Tahapan Pelaksanaan
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      CSR Admin telah menyusun draf tahapan milestone di bawah ini berdasarkan dokumen proposal Anda. Silakan tinjau jadwal, target output, dan bukti pelaksanaan. Jika sudah sesuai, klik tombol konfirmasi di bawah.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isConfirmingPlan}
                    onClick={handleConfirmMilestones}
                    className="text-xs font-semibold px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isConfirmingPlan ? "Memproses..." : "Setujui & Konfirmasi Milestone"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isConfirmingPlan}
                    onClick={() => setShowRevisionForm(!showRevisionForm)}
                    className="text-xs font-semibold"
                  >
                    {showRevisionForm ? "Tutup Form Koreksi" : "Minta Penyesuaian / Koreksi"}
                  </Button>
                </div>

                {/* Form Input Koreksi / Revisi */}
                {showRevisionForm && (
                  <form onSubmit={handleSubmitRevision} className="pt-2 space-y-2">
                    <label className="block text-[11px] font-bold text-amber-950">
                      Uraikan Catatan Koreksi atau Penyesuaian yang Diperlukan:
                    </label>
                    <textarea
                      rows={3}
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      placeholder="Contoh: Jadwal pelaksanaan tahap 2 perlu digeser ke bulan ke-3 karena menyesuaikan musim tanam lokal..."
                      className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 placeholder:text-slate-400"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isConfirmingPlan}
                        className="text-xs px-4"
                      >
                        {isConfirmingPlan ? "Mengirim..." : "Kirim Catatan Koreksi"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {planStatus === "CONFIRMED_BY_PARTNER" && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">Rencana Milestone Telah Disepakati</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    Lembaga Anda telah menyetujui tahapan milestone ini. Begitu MoU/PKS resmi disahkan oleh perusahaan, seluruh tahapan ini otomatis aktif di modul Pelaksanaan Program &amp; Monitoring tanpa perlu input ulang.
                  </p>
                </div>
              </div>
            )}

            {planStatus === "REVISION_REQUESTED" && plan.partnerFeedback && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>Catatan Koreksi Anda Telah Dikirimkan ke CSR Admin:</span>
                </div>
                <p className="italic bg-white/80 p-2.5 rounded-lg border border-amber-200/80 leading-relaxed">
                  "{plan.partnerFeedback}"
                </p>
                <p className="text-[11px] text-amber-800">
                  CSR Admin sedang meninjau dan menyesuaikan daftar milestone sesuai masukan Anda.
                </p>
              </div>
            )}

            {planStatus === "DRAFT" && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Pihak CSR Admin sedang menelaah dokumen proposal Anda untuk menyusun draf tahapan milestone. Anda akan diberi tahu untuk meninjau dan mengonfirmasi begitu draf siap.
                </span>
              </div>
            )}

            {/* Daftar Milestone Cards */}
            {milestones.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[#E8E8EA] text-center space-y-1 bg-slate-50/40">
                <Layers className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">
                  Belum ada daftar milestone yang dirilis oleh CSR Admin
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    className="p-3.5 rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#181343] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-[#181343]">{st.title}</h5>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Jadwal Pelaksanaan:{" "}
                            <strong className="text-slate-700">{st.targetTimeline || "-"}</strong>
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E8E8EA] text-slate-600">
                        {st.source === "AI_GENERATED" ? "Draf AI Dokumen" : "Disusun Manual"}
                      </span>
                    </div>

                    {st.description && (
                      <p className="text-slate-600 leading-relaxed pl-8">
                        {st.description}
                      </p>
                    )}

                    <div className="pl-8 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {st.suggestedKpi && (
                        <div className="bg-white p-2 rounded-lg border border-[#E8E8EA]">
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            Target Output / KPI
                          </span>
                          <span className="text-slate-700 font-medium">{st.suggestedKpi}</span>
                        </div>
                      )}
                      {st.expectedEvidence && (
                        <div className="bg-white p-2 rounded-lg border border-[#E8E8EA]">
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            Bukti Pelaksanaan (Expected Evidence)
                          </span>
                          <span className="text-teal-700 font-medium">{st.expectedEvidence}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dokumen MoU Legal */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Dokumen Kesepakatan (MoU/PKS)
            </span>
            {collaboration.mouDocumentUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">
                    {collaboration.mouDocumentUrl.split("/").pop() || "Dokumen-MoU.pdf"}
                  </span>
                </div>
                <a
                  href={collaboration.mouDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>Unduh Dokumen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-xs italic">
                Dokumen MoU resmi sedang disiapkan oleh pihak legal perusahaan.
              </div>
            )}
          </div>

          {/* Chat / Catatan Negosiasi Cepat */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Catatan Negosiasi Kemitraan
            </span>

            {plan.textNotes && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {plan.textNotes}
              </div>
            )}

            {collaboration.status === "NEGOTIATION" && (
              <form onSubmit={handleSendNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={partnerNote}
                  onChange={(e) => setPartnerNote(e.target.value)}
                  placeholder="Kirim catatan atau klarifikasi terkait MoU dan rencana pelaksanaan..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <div className="flex items-center justify-between">
                  {noteSuccess && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Catatan terkirim
                    </span>
                  )}
                  {noteError && (
                    <span className="text-xs text-rose-600 font-semibold">{noteError}</span>
                  )}
                  <div className="ml-auto">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSubmittingNote || !partnerNote.trim()}
                      className="text-xs rounded-xl"
                    >
                      {isSubmittingNote ? "Mengirim..." : "Kirim Catatan"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            {onOpenChat && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenChat(collaboration.id);
                }}
                className="text-xs rounded-xl flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Pusat Pesan Negosiasi</span>
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs rounded-xl px-5"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
