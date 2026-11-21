"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  Calendar,
  Coins,
  Users,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  FileText,
  MapPin,
  Mail,
  MessageSquare,
  Layers,
  RotateCcw,
  ShieldCheck,
  Activity,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerCollaborationItem } from "../types";
import {
  COLLABORATION_STATUS_CONFIG,
  formatRupiah,
  formatDate,
} from "../helpers";
import {
  parseCollaborationPlan,
  serializeCollaborationPlan,
  MilestonePlanStatus,
} from "../../common/collaboration-plan";

function cleanProposalTitle(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/(?:\.\s*|\s+)?Proposal_CSR_[A-Za-z0-9_.]+(?:\.\.\.)?/gi, "")
    .trim();
}

interface PartnerCollaborationDetailFullPageViewProps {
  collaboration: PartnerCollaborationItem;
  onBack: () => void;
  onSuccess: () => void;
  onOpenChat?: (collaborationId: string) => void;
  onNavigateToPrograms?: () => void;
}

const FORM_STEPS = [
  { id: 1, label: "Klausul & Parameter", shortDesc: "Anggaran, sasaran & jadwal program" },
  { id: 2, label: "Rencana & Milestone", shortDesc: "Tahapan kegiatan & konfirmasi mitra" },
  { id: 3, label: "Dokumen & Pengesahan", shortDesc: "Legalitas MoU & status akhir" },
];

export function PartnerCollaborationDetailFullPageView({
  collaboration,
  onBack,
  onSuccess,
  onOpenChat,
  onNavigateToPrograms,
}: PartnerCollaborationDetailFullPageViewProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Note states
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

  const isAgreed = collaboration.status === "AGREED";
  const isNegotiation = collaboration.status === "NEGOTIATION";
  const isCancelled = collaboration.status === "CANCELLED";

  const cleanedTitle = useMemo(() => {
    return cleanProposalTitle(collaboration.proposalTitle) || collaboration.opportunityTitle || "Program Kerja Sama CSR";
  }, [collaboration.proposalTitle, collaboration.opportunityTitle]);

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
        text: "Terima kasih! Rencana milestone telah berhasil Anda konfirmasi. Rencana ini otomatis aktif di modul Pelaksanaan Program saat MoU disahkan.",
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
        text: "Catatan penyesuaian rencana milestone telah berhasil dikirimkan kepada tim CSR sponsor.",
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
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header Identitas Halaman & Navigasi Kembali */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 w-full">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#181343] transition cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kolaborasi Aktif &amp; MoU</span>
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Detail Kesepakatan &amp; MoU
            </h1>

            {isAgreed ? (
              <Badge variant="emerald" size="sm" hasDot>
                MoU Disepakati
              </Badge>
            ) : isNegotiation ? (
              <Badge variant="amber" size="sm" hasDot>
                Tahap Negosiasi
              </Badge>
            ) : (
              <Badge variant="rose" size="sm" hasDot>
                Dibatalkan
              </Badge>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            Tinjau klausul kesepakatan, jadwal pelaksanaan, tahapan milestone, dan dokumen legalitas MoU resmi.
          </p>
        </div>

        {/* Action Header Kanan: Tepat 1 Tombol Utama Sesuai Status agar Bersih & Tidak Numpuk */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {isAgreed ? (
            onNavigateToPrograms && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onNavigateToPrograms}
                leftIcon={<Activity className="w-3.5 h-3.5 text-emerald-400" />}
                className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
              >
                Buka Pelaksanaan Program
              </Button>
            )
          ) : (
            onOpenChat && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChat(collaboration.id)}
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-slate-600" />}
                className="text-xs font-semibold text-slate-700 rounded-xl border-[#E8E8EA] hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                Pusat Pesan Negosiasi
              </Button>
            )
          )}
        </div>
      </div>

      {/* 2. Banner Konteks Kemitraan (Sponsor & Proposal) */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Sisi Kiri: Profil Sponsor & Judul Inisiatif */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-[#E5E7EB] flex items-center justify-center font-bold text-[#181343] text-sm overflow-hidden shrink-0 shadow-2xs">
            {collaboration.companyLogo ? (
              <img
                src={collaboration.companyLogo}
                alt={collaboration.companyName || "Perusahaan"}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              (collaboration.companyName || "C").substring(0, 2).toUpperCase()
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Perusahaan Sponsor:
              </span>
              <span className="font-bold text-[#181343]">
                {collaboration.companyName || "Perusahaan CSR"}
              </span>
              {collaboration.companyCity && (
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <span className="text-slate-300">•</span>
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {collaboration.companyCity}
                </span>
              )}
              {isAgreed && onOpenChat && (
                <button
                  type="button"
                  onClick={() => onOpenChat(collaboration.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#181343] bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded-md transition cursor-pointer ml-1"
                >
                  <MessageSquare className="w-3 h-3 text-slate-500" />
                  <span>Chat Sponsor</span>
                </button>
              )}
            </div>

            <h3
              className="text-sm sm:text-base font-bold text-[#181343] leading-snug line-clamp-2"
              title={cleanedTitle}
            >
              {cleanedTitle}
            </h3>
          </div>
        </div>

        {/* Sisi Kanan: Usulan Pagu Awal & Berkas Rujukan */}
        <div className="flex items-center gap-5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l md:border-[#E8E8EA] md:pl-6">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-400 block">
              Anggaran Disepakati
            </span>
            <span className="text-sm sm:text-base font-bold text-[#009E75] block">
              {formatRupiah(collaboration.finalBudget || collaboration.proposedBudget)}
            </span>
          </div>

          {collaboration.proposalDocumentUrl && (
            <div className="border-l border-[#E8E8EA] pl-5 space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 block">
                Dokumen Rujukan
              </span>
              <a
                href={collaboration.proposalDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#009E75] hover:text-emerald-800 transition py-0.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Berkas Proposal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 3. Stepper Card (Tahapan 1 - 3 Bersih & Terstruktur) */}
      <div className="bg-white rounded-2xl border border-[#E8E8EA] p-3 sm:p-4 shadow-2xs">
        {/* Desktop 3-Step Segments */}
        <div className="hidden sm:grid grid-cols-3 gap-3">
          {FORM_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#181343]/5 border border-[#181343]/20 shadow-2xs"
                    : isCompleted
                    ? "hover:bg-slate-50 border border-[#E8E8EA]/80"
                    : "opacity-60 hover:opacity-100 border border-transparent"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                    isCurrent
                      ? "bg-[#181343] text-white shadow-2xs"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div className="min-w-0">
                  <span
                    className={`text-xs sm:text-sm block truncate ${
                      isCurrent ? "font-bold text-[#181343]" : "font-semibold text-slate-700"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[11px] text-[#64748B] block truncate mt-0.5">
                    {step.shortDesc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Stepper Bar */}
        <div className="sm:hidden space-y-2 px-1 py-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#181343]">
              Langkah {currentStep} dari 3: {FORM_STEPS[currentStep - 1].label}
            </span>
            <span className="text-slate-500 font-semibold">
              {Math.round((currentStep / 3) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#181343] rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Messages */}
      {planActionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in shadow-2xs ${
            planActionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {planActionMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium leading-relaxed">{planActionMessage.text}</span>
        </div>
      )}

      {/* 4. Main Step Form Card (Layout Persis Sesuai Desain Halaman) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-2xs space-y-6">
        {/* ============================================================ */}
        {/* LANGKAH 1: KLAUSUL & PARAMETER PROGRAM */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Tahap dengan Nomor Badge Lingkaran */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs shrink-0 border border-[#181343]/10">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Klausul &amp; Parameter Kesepakatan
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Tinjau rincian nilai anggaran yang disepakati, kelompok penerima manfaat, dan jadwal pelaksanaan kerja sama.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Alert Banner */}
            {isAgreed ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950 text-sm">
                    Kontrak MoU Telah Resmi Disahkan
                  </p>
                  <p className="mt-0.5 text-emerald-800 leading-relaxed">
                    Perjanjian kerja sama ini telah disahkan oleh kedua belah pihak. Seluruh tahapan milestone yang telah disepakati otomatis aktif sebagai daftar pemantauan di modul <strong>Pelaksanaan Program</strong>. Lembaga Anda tidak perlu menginput ulang kegiatan.
                  </p>
                  {collaboration.agreedAt && (
                    <p className="mt-1 text-[11px] text-emerald-700 font-semibold">
                      Disahkan pada: {formatDate(collaboration.agreedAt)}
                    </p>
                  )}
                </div>
              </div>
            ) : isNegotiation ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 text-sm">
                    Tahap Negosiasi &amp; Finalisasi Rencana Pelaksanaan
                  </p>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    Proposal Anda telah disetujui. Saat ini kedua belah pihak sedang memfinalisasi nilai anggaran definitif, jadwal, serta meninjau rincian tahapan milestone sebelum pengesahan MoU legal.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 shadow-2xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-950 text-sm">Kolaborasi Dibatalkan</p>
                  <p className="mt-0.5 text-rose-800 leading-relaxed">
                    Kesepakatan kerja sama ini telah dihentikan atau dibatalkan oleh pihak perusahaan sponsor.
                  </p>
                </div>
              </div>
            )}

            {/* 3 Kartu Parameter Simetris & Rapih */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-600">Anggaran Disepakati</span>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-[#009E75] tracking-tight">
                  {formatRupiah(collaboration.finalBudget || collaboration.proposedBudget)}
                </div>
                {collaboration.finalBudget &&
                  collaboration.proposedBudget &&
                  collaboration.finalBudget !== collaboration.proposedBudget && (
                    <span className="text-[11px] text-slate-400 block line-through">
                      Usulan awal: {formatRupiah(collaboration.proposedBudget)}
                    </span>
                  )}
              </div>

              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Users className="w-4 h-4 text-[#181343]" />
                  <span className="text-xs font-semibold text-slate-600">Penerima Manfaat</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2">
                  {collaboration.targetBeneficiaries || "Belum ditentukan"}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Calendar className="w-4 h-4 text-[#181343]" />
                  <span className="text-xs font-semibold text-slate-600">Rentang Jadwal</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  {collaboration.startDate && collaboration.endDate
                    ? `${formatDate(collaboration.startDate)} s.d. ${formatDate(collaboration.endDate)}`
                    : "Menunggu Jadwal Legal"}
                </div>
              </div>
            </div>

            {/* Catatan Negosiasi Kemitraan & Form Respon Cepat */}
            <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white space-y-4 shadow-2xs">
              <span className="text-xs font-bold text-[#181343] block">
                Catatan Negosiasi Kemitraan
              </span>

              {plan.textNotes ? (
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {plan.textNotes}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum ada catatan khusus yang dicantumkan pada klausul kerja sama ini.
                </p>
              )}

              {isNegotiation && (
                <form onSubmit={handleSendNote} className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">
                    Kirim Catatan atau Tanggapan ke Perusahaan Sponsor:
                  </label>
                  <textarea
                    rows={3}
                    value={partnerNote}
                    onChange={(e) => setPartnerNote(e.target.value)}
                    placeholder="Tuliskan catatan atau tanggapan terkait kesepakatan, termin anggaran, atau jadwal..."
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-xs text-[#181343] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    {noteSuccess && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Catatan berhasil dikirimkan
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
                        className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl px-4 py-2 cursor-pointer"
                      >
                        {isSubmittingNote ? "Mengirim..." : "Kirim Catatan"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* LANGKAH 2: RENCANA & MILESTONE */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Tahap dengan Nomor Badge Lingkaran */}
            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs shrink-0 border border-[#181343]/10">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Tinjauan Rencana Pelaksanaan &amp; Milestone Monitoring
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Rencana tahapan kegiatan yang diekstraksi dari dokumen proposal Anda sebagai dasar pemantauan program.
                  </p>
                </div>
              </div>

              {/* Status Rencana Milestone */}
              <div className="flex items-center gap-2 shrink-0">
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
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950 text-sm">
                      Konfirmasi Kesepakatan Tahapan Pelaksanaan
                    </p>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      CSR Admin telah menyusun draf tahapan milestone di bawah ini berdasarkan dokumen proposal Anda. Silakan tinjau jadwal, target output, dan bukti pelaksanaan. Jika sudah sesuai, klik tombol setujui di bawah.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/60">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isConfirmingPlan}
                    onClick={handleConfirmMilestones}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                    className="border-amber-300 text-amber-900 bg-white hover:bg-amber-100 text-xs font-semibold rounded-xl px-4 py-2 cursor-pointer"
                  >
                    {showRevisionForm ? "Tutup Form Koreksi" : "Minta Penyesuaian / Koreksi"}
                  </Button>
                </div>

                {/* Form Input Koreksi / Revisi */}
                {showRevisionForm && (
                  <form onSubmit={handleSubmitRevision} className="pt-3 space-y-2">
                    <label className="block text-xs font-bold text-amber-950">
                      Uraikan Catatan Koreksi atau Penyesuaian yang Diperlukan:
                    </label>
                    <textarea
                      rows={3}
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      placeholder="Contoh: Jadwal pelaksanaan tahap 2 perlu digeser ke bulan ke-3 karena menyesuaikan musim tanam lokal..."
                      className="w-full p-3 rounded-xl border border-amber-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 placeholder:text-slate-400"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isConfirmingPlan}
                        className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl px-4 py-2 cursor-pointer"
                      >
                        {isConfirmingPlan ? "Mengirim..." : "Kirim Catatan Koreksi"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {planStatus === "CONFIRMED_BY_PARTNER" && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950 text-sm">Rencana Milestone Telah Disepakati</p>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    Lembaga Anda telah menyetujui tahapan milestone ini. Begitu MoU resmi disahkan oleh pihak sponsor, seluruh tahapan ini otomatis aktif di modul Pelaksanaan Program tanpa perlu input ulang.
                  </p>
                </div>
              </div>
            )}

            {planStatus === "REVISION_REQUESTED" && plan.partnerFeedback && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 text-sm">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>Catatan Koreksi Anda Telah Dikirimkan ke Tim Sponsor:</span>
                </div>
                <p className="italic bg-white/80 p-3 rounded-xl border border-amber-200/80 leading-relaxed text-xs">
                  "{plan.partnerFeedback}"
                </p>
                <p className="text-[11px] text-amber-800">
                  CSR Admin sedang meninjau dan menyesuaikan daftar milestone sesuai masukan Anda.
                </p>
              </div>
            )}

            {planStatus === "DRAFT" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center gap-2.5 shadow-2xs">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Pihak CSR Admin sedang menelaah dokumen proposal Anda untuk menyusun draf tahapan milestone. Anda akan diberi tahu untuk meninjau dan mengonfirmasi begitu draf siap.
                </span>
              </div>
            )}

            {/* Daftar Milestone Cards */}
            {milestones.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-[#E8E8EA] text-center space-y-2 bg-slate-50/40">
                <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  Belum ada daftar milestone yang dirilis oleh CSR Admin
                </p>
                <p className="text-xs text-slate-400">
                  Tahapan milestone akan diekstraksi dan disusun oleh tim sponsor dari berkas proposal Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {milestones.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    className="p-4 sm:p-5 rounded-2xl border border-[#E8E8EA] bg-[#F8FAFC] space-y-2.5 text-xs shadow-2xs hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-[#181343] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-sm text-[#181343]">{st.title}</h5>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Jadwal Pelaksanaan:{" "}
                            <strong className="text-slate-700">{st.targetTimeline || "-"}</strong>
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-white border border-[#E8E8EA] text-slate-600">
                        {st.source === "AI_GENERATED" ? "Draf AI Dokumen" : "Disusun Manual"}
                      </span>
                    </div>

                    {st.description && (
                      <p className="text-slate-600 leading-relaxed pl-9 text-xs">
                        {st.description}
                      </p>
                    )}

                    <div className="pl-9 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {st.suggestedKpi && (
                        <div className="bg-white p-3 rounded-xl border border-[#E8E8EA]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Target Output / KPI
                          </span>
                          <span className="text-slate-700 font-medium mt-0.5 block">{st.suggestedKpi}</span>
                        </div>
                      )}
                      {st.expectedEvidence && (
                        <div className="bg-white p-3 rounded-xl border border-[#E8E8EA]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Bukti Pelaksanaan (Expected Evidence)
                          </span>
                          <span className="text-slate-700 font-medium mt-0.5 block">{st.expectedEvidence}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* LANGKAH 3: DOKUMEN & PENGESAHAN */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Tahap dengan Nomor Badge Lingkaran */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs shrink-0 border border-[#181343]/10">
                  3
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Dokumen &amp; Pengesahan MoU
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Akses dokumen perjanjian kerja sama resmi (MoU/PKS) dan status pengesahan dari pihak sponsor.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Kolom 1: Berkas Dokumen MoU Resmi */}
              <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#181343]">
                    Dokumen Perjanjian Kerja Sama (MoU/PKS)
                  </span>
                  {collaboration.mouDocumentUrl ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Tersedia
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Sedang Diproses
                    </span>
                  )}
                </div>

                {collaboration.mouDocumentUrl ? (
                  <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className="w-5 h-5 text-[#009E75] shrink-0" />
                        <span className="text-xs font-semibold text-[#181343] truncate">
                          {collaboration.mouDocumentUrl.split("/").pop() || "Dokumen-MoU-Resmi.pdf"}
                        </span>
                      </div>
                    </div>

                    <a
                      href={collaboration.mouDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl py-2.5 transition shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Dokumen MoU Resmi</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] text-center text-xs text-slate-400 space-y-1">
                    <Clock className="w-5 h-5 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">Dokumen MoU sedang disiapkan</p>
                    <p className="text-[11px] text-slate-400">
                      Pihak legal perusahaan sponsor sedang menyusun berkas resmi perjanjian kerja sama.
                    </p>
                  </div>
                )}
              </div>

              {/* Kolom 2: Dokumen Proposal & Ringkasan Akhir */}
              <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-3.5 shadow-2xs">
                <span className="text-xs font-bold text-[#181343] block">
                  Dokumen Proposal Rujukan &amp; Ringkasan
                </span>

                {collaboration.proposalDocumentUrl ? (
                  <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {collaboration.proposalDocumentUrl.split("/").pop() || "Berkas-Proposal-Anda.pdf"}
                      </span>
                    </div>
                    <a
                      href={collaboration.proposalDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#009E75] hover:text-emerald-800 flex items-center gap-1 shrink-0"
                    >
                      <span>Lihat</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] text-center text-xs text-slate-400">
                    Tidak ada lampiran berkas proposal rujukan.
                  </div>
                )}

                {/* Ringkasan Parameter Akhir */}
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Anggaran Disepakati:</span>
                    <strong className="text-[#009E75] font-bold">
                      {formatRupiah(collaboration.finalBudget || collaboration.proposedBudget)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Jadwal Pelaksanaan:</span>
                    <strong className="text-slate-800 font-semibold">
                      {collaboration.startDate && collaboration.endDate
                        ? `${formatDate(collaboration.startDate)} s.d. ${formatDate(collaboration.endDate)}`
                        : "Menunggu Jadwal Legal"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Total Tahapan Milestone:</span>
                    <strong className="text-[#181343] font-bold">{milestones.length} Tahapan</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Navigasi Aksi Bawah (Footer Form) */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tombol Kiri */}
          <div className="w-full sm:w-auto">
            {currentStep === 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onBack}
                className="w-full sm:w-auto text-xs sm:text-sm font-semibold border-[#E5E7EB] text-[#47464F] hover:bg-slate-50 rounded-xl px-5 py-2.5 cursor-pointer"
              >
                Kembali
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="w-full sm:w-auto text-xs sm:text-sm font-semibold text-[#47464F] hover:text-[#181343] py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            )}
          </div>

          {/* Tombol Kanan */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {currentStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setCurrentStep((prev) => Math.min(3, prev + 1))}
                className="flex-1 sm:flex-initial bg-[#181343] hover:bg-[#25205c] text-white text-xs sm:text-sm font-bold rounded-xl px-6 py-2.5 shadow-2xs cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Langkah Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                {isAgreed && onNavigateToPrograms && (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={onNavigateToPrograms}
                    className="flex-1 sm:flex-initial bg-[#181343] hover:bg-[#25205c] text-white text-xs sm:text-sm font-bold rounded-xl px-6 py-2.5 shadow-2xs cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Buka Pelaksanaan Program</span>
                  </Button>
                )}
                {isNegotiation && onOpenChat && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => onOpenChat(collaboration.id)}
                    className="flex-1 sm:flex-initial border-[#E5E7EB] text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold rounded-xl px-6 py-2.5 cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Pusat Pesan Negosiasi</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
