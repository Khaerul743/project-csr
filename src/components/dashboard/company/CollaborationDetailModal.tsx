import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  FileCheck2,
  Calendar,
  Users,
  Building2,
  HeartHandshake,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  MessageSquare,
  Check,
  Ban,
  MapPin,
  FileUp,
  RotateCcw,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Info,
  Loader2,
  ShieldCheck,
  Send,
  Copy,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyCollaborationItem } from "./types";
import { formatRupiah, formatDate } from "./helpers";
import {
  parseCollaborationPlan,
  serializeCollaborationPlan,
  PlanMilestoneItem,
  MilestonePlanStatus,
} from "../common/collaboration-plan";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";


interface CollaborationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboration: CompanyCollaborationItem | null;
  onSuccess: () => void;
  onOpenChat?: (collaborationId: string) => void;
}

function ModalPartnerLogo({ logoUrl, name }: { logoUrl?: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => {
    if (!name) return "MP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }, [name]);

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="w-10 h-10 rounded-xl object-cover border border-[#E8E8EA] shrink-0"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-[#181343] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
      {initials}
    </div>
  );
}

export function CollaborationDetailModal({
  isOpen,
  onClose,
  collaboration,
  onSuccess,
  onOpenChat,
}: CollaborationDetailModalProps) {
  const [finalBudget, setFinalBudget] = useState("");
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mouDocumentUrl, setMouDocumentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"NEGOTIATION" | "AGREED" | "CANCELLED">("NEGOTIATION");

  // Milestone Plan States
  const [milestones, setMilestones] = useState<PlanMilestoneItem[]>([]);
  const [milestonePlanStatus, setMilestonePlanStatus] = useState<MilestonePlanStatus>("DRAFT");
  const [partnerFeedback, setPartnerFeedback] = useState<string>("");
  const [isExtractingAi, setIsExtractingAi] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);

  // Edit / Add Milestone Dialog
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<PlanMilestoneItem | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneTimeline, setMilestoneTimeline] = useState("");
  const [milestoneKpi, setMilestoneKpi] = useState("");
  const [milestoneEvidence, setMilestoneEvidence] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // AI Impact Prediction States
  const [isPredictingAi, setIsPredictingAi] = useState(false);
  const [impactResult, setImpactResult] = useState<any>(null);
  const [isKpiCopied, setIsKpiCopied] = useState(false);

  useEffect(() => {
    if (collaboration) {
      setFinalBudget(collaboration.finalBudget ? String(parseFloat(collaboration.finalBudget)) : "");
      setTargetBeneficiaries(collaboration.targetBeneficiaries || "");
      setStartDate(collaboration.startDate ? collaboration.startDate.substring(0, 10) : "");
      setEndDate(collaboration.endDate ? collaboration.endDate.substring(0, 10) : "");
      setMouDocumentUrl(collaboration.mouDocumentUrl || "");
      setStatus(collaboration.status);
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsEditingUrl(false);
      setAiRationale(null);

      // Parse structured collaboration plan from notes
      const plan = parseCollaborationPlan(collaboration.notes);
      setNotes(plan.textNotes || "");
      setMilestones(plan.milestones || []);
      setMilestonePlanStatus(plan.milestonePlanStatus || "DRAFT");
      setPartnerFeedback(plan.partnerFeedback || "");

      // Parse stored AI impact prediction if available
      if (collaboration.impactPrediction) {
        try {
          setImpactResult(JSON.parse(collaboration.impactPrediction));
        } catch {
          setImpactResult(null);
        }
      } else {
        setImpactResult(null);
      }
    }
  }, [collaboration]);

  if (!isOpen || !collaboration) return null;

  const aiEnabled = isAiFeatureEnabled();
  const isAgreed = collaboration.status === "AGREED";
  const isCancelled = collaboration.status === "CANCELLED";
  const isNegotiation = collaboration.status === "NEGOTIATION";

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setFinalBudget(raw);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah berkas MoU");
      }

      if (json.data?.url) {
        setMouDocumentUrl(json.data.url);
        setIsEditingUrl(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunggah dokumen. Pastikan ukuran file < 10MB.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // AI Milestone Extraction Handler
  const handleExtractWithAi = async () => {
    setIsExtractingAi(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      const res = await fetch(`/api/collaborations/${collaboration.id}/extract-milestones`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengekstrak draf milestone menggunakan AI.");
      }

      const extracted = json.data?.stages || [];
      if (extracted.length > 0) {
        const formatted: PlanMilestoneItem[] = extracted.map((st: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          orderIndex: idx + 1,
          title: st.title || `Tahapan ${idx + 1}`,
          description: st.description || "",
          targetTimeline: st.targetTimeline || `Bulan ke-${idx + 1}`,
          suggestedKpi: st.suggestedKpi || "",
          expectedEvidence: st.expectedEvidence || "",
          source: "AI_GENERATED",
        }));

        setMilestones(formatted);
        setMilestonePlanStatus("DRAFT");
        if (json.data?.summaryRationale) {
          setAiRationale(json.data.summaryRationale);
        }
        setSuccessMsg(
          "Draf milestone berhasil diekstraksi dari dokumen proposal. Harap tinjau dan sesuaikan sebelum diajukan ke mitra."
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mengekstrak milestone dengan AI.");
    } finally {
      setIsExtractingAi(false);
    }
  };

  // Open modal to add or edit milestone
  const handleOpenAddMilestone = () => {
    setEditingMilestone(null);
    setMilestoneTitle("");
    setMilestoneDesc("");
    setMilestoneTimeline(`Bulan ke-${milestones.length + 1}`);
    setMilestoneKpi("");
    setMilestoneEvidence("");
    setIsMilestoneModalOpen(true);
  };

  const handleOpenEditMilestone = (item: PlanMilestoneItem) => {
    setEditingMilestone(item);
    setMilestoneTitle(item.title);
    setMilestoneDesc(item.description);
    setMilestoneTimeline(item.targetTimeline);
    setMilestoneKpi(item.suggestedKpi);
    setMilestoneEvidence(item.expectedEvidence);
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestoneItem = () => {
    if (!milestoneTitle.trim()) {
      alert("Judul milestone wajib diisi.");
      return;
    }

    if (editingMilestone) {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === editingMilestone.id
            ? {
                ...m,
                title: milestoneTitle.trim(),
                description: milestoneDesc.trim(),
                targetTimeline: milestoneTimeline.trim(),
                suggestedKpi: milestoneKpi.trim(),
                expectedEvidence: milestoneEvidence.trim(),
              }
            : m
        )
      );
    } else {
      const newItem: PlanMilestoneItem = {
        id: `manual-${Date.now()}`,
        orderIndex: milestones.length + 1,
        title: milestoneTitle.trim(),
        description: milestoneDesc.trim(),
        targetTimeline: milestoneTimeline.trim(),
        suggestedKpi: milestoneKpi.trim(),
        expectedEvidence: milestoneEvidence.trim(),
        source: "MANUAL",
      };
      setMilestones((prev) => [...prev, newItem]);
    }

    setIsMilestoneModalOpen(false);
  };

  const handleDeleteMilestone = (id: string) => {
    if (confirm("Hapus tahapan milestone ini?")) {
      setMilestones((prev) => {
        const filtered = prev.filter((m) => m.id !== id);
        return filtered.map((m, idx) => ({ ...m, orderIndex: idx + 1 }));
      });
    }
  };

  // AI Impact Prediction Handlers
  const handleRunImpactPrediction = async () => {
    if (!collaboration) return;
    setIsPredictingAi(true);
    setErrorMsg(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) throw new Error("Sesi login telah berakhir");

      const res = await fetch(`/api/collaborations/${collaboration.id}/impact-prediction`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memproses simulasi dampak AI");
      }

      setImpactResult(json.data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menjalankan simulasi prediksi dampak AI");
    } finally {
      setIsPredictingAi(false);
    }
  };

  const handleApplyKpiToNotes = () => {
    if (!impactResult?.keySuccessIndicators || impactResult.keySuccessIndicators.length === 0) return;
    const kpiText = impactResult.keySuccessIndicators
      .map((k: any, i: number) => `${i + 1}. ${k.indicator}: Target ${k.target} (Verifikasi: ${k.verification})`)
      .join("\n");

    const header = "Indikator Keberhasilan (Target KPI Rekomendasi AI):";
    setNotes((prev) => (prev ? `${prev}\n\n${header}\n${kpiText}` : `${header}\n${kpiText}`));
    setIsKpiCopied(true);
    setTimeout(() => setIsKpiCopied(false), 2000);
  };

  // Submit to Partner for Confirmation
  const handleSendToPartner = async () => {
    if (milestones.length === 0) {
      setErrorMsg("Harap susun minimal 1 milestone kegiatan sebelum mengajukan konfirmasi ke mitra.");
      return;
    }

    const updatedPlan = serializeCollaborationPlan({
      textNotes: notes.trim(),
      milestones,
      milestonePlanStatus: "PENDING_PARTNER_CONFIRMATION",
      partnerFeedback: "",
      lastUpdatedBy: "CSR_ADMIN",
      lastUpdatedAt: new Date().toISOString(),
    });

    setMilestonePlanStatus("PENDING_PARTNER_CONFIRMATION");
    await handleSubmit("NEGOTIATION", updatedPlan);
    setSuccessMsg("Rencana milestone berhasil diajukan ke mitra pelaksana untuk ditinjau dan dikonfirmasi.");
  };

  // Main Submit Handler (Draft / Negotiation / Agreed)
  const handleSubmit = async (
    targetStatus?: "NEGOTIATION" | "AGREED" | "CANCELLED",
    overrideNotes?: string
  ) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const chosenStatus = targetStatus || status;

    const budgetNum = parseFloat(finalBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setErrorMsg("Anggaran final kesepakatan harus lebih dari Rp 0");
      return;
    }

    if (chosenStatus === "AGREED") {
      if (milestones.length === 0) {
        if (
          !confirm(
            "Belum ada tahapan milestone pelaksanaan yang disusun. Apakah Anda ingin tetap mengesahkan kolaborasi tanpa tahapan monitoring otomatis?"
          )
        ) {
          return;
        }
      } else if (milestonePlanStatus !== "CONFIRMED_BY_PARTNER") {
        if (
          !confirm(
            `Perhatian: Rencana milestone belum dikonfirmasi oleh mitra (status: ${milestonePlanStatus}). Sebaiknya ajukan dan tunggu konfirmasi mitra agar monitoring disepakati bersama. Tetap sahkan sekarang?`
          )
        ) {
          return;
        }
      }

      if (!mouDocumentUrl.trim()) {
        if (!confirm("Tautan dokumen MoU/PKS masih kosong. Apakah Anda ingin tetap mengesahkan kolaborasi ini sekarang?")) {
          return;
        }
      }
    }

    // Prepare serialized notes containing both textNotes and milestones
    const serializedNotes =
      overrideNotes ||
      serializeCollaborationPlan({
        textNotes: notes.trim(),
        milestones,
        milestonePlanStatus,
        partnerFeedback,
        lastUpdatedBy: "CSR_ADMIN",
        lastUpdatedAt: new Date().toISOString(),
      });

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      const res = await fetch(`/api/collaborations/${collaboration.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          finalBudget: budgetNum,
          targetBeneficiaries: targetBeneficiaries.trim() || null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          mouDocumentUrl: mouDocumentUrl.trim() || null,
          notes: serializedNotes,
          status: chosenStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui kesepakatan");
      }

      onSuccess();
      if (chosenStatus === "AGREED") {
        onClose();
      } else {
        setSuccessMsg("Informasi kesepakatan dan draf rencana berhasil disimpan.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memperbarui kesepakatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-[94vw] max-w-[1140px] bg-white rounded-2xl shadow-2xl border border-[#E8E8EA] flex flex-col max-h-[92vh] overflow-hidden">
        {/* ============================================================ */}
        {/* 1. Header Minimalis Putih */}
        {/* ============================================================ */}
        <div className="px-6 py-4 sm:py-5 border-b border-[#E8E8EA] flex items-center justify-between bg-white shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-[#181343] tracking-tight">
                Detail Kesepakatan &amp; MoU
              </h2>
              {isAgreed ? (
                <Badge variant="emerald" size="sm">
                  MoU Disepakati
                </Badge>
              ) : isNegotiation ? (
                <Badge variant="amber" size="sm">
                  Tahap Negosiasi
                </Badge>
              ) : (
                <Badge variant="rose" size="sm">
                  Dibatalkan
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#787680]">
              Kelola klausul kesepakatan, finalisasi tahapan milestone dari proposal, dan sahkan kontrak MoU.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* 2. Scrollable Body: Layout Dua Kolom */}
        {/* ============================================================ */}
        <div className="p-6 sm:p-7 overflow-y-auto overflow-x-hidden flex-1 space-y-6 text-sm bg-white">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <p className="font-medium leading-relaxed">{successMsg}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ======================================================== */}
            {/* KOLOM KIRI (~65%): Parameter Program & Finalisasi Milestone */}
            {/* ======================================================== */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Snapshot Program & Inisiatif */}
              <div className="p-4 sm:p-4.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#787680] block">
                  Program CSR &amp; Inisiatif Terkait
                </span>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#181343] leading-snug">
                      {collaboration.proposalTitle || collaboration.opportunityTitle || "Program Kemitraan CSR"}
                    </h3>
                    <div className="text-xs text-[#787680]">
                      Peluang CSR:{" "}
                      <span className="font-semibold text-slate-700">
                        {collaboration.opportunityTitle || "Inisiatif CSR"}
                      </span>
                    </div>
                  </div>

                  {collaboration.proposedBudget && (
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[11px] text-[#787680] block">Usulan Awal Mitra</span>
                      <span className="text-xs font-bold text-slate-700">
                        {formatRupiah(collaboration.proposedBudget)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid Field Kesepakatan (2 Kolom) */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#181343]">
                  Klausul &amp; Parameter Program
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 1: Nilai Anggaran Disepakati */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nilai Anggaran Disepakati <span className="text-rose-500">*</span>
                    </label>
                    {isAgreed || isCancelled ? (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-0.5">
                        <div className="text-base font-extrabold text-[#009E75]">
                          {formatRupiah(finalBudget || collaboration.finalBudget || "0")}
                        </div>
                        {collaboration.proposedBudget &&
                          finalBudget &&
                          parseFloat(finalBudget) !== parseFloat(collaboration.proposedBudget) && (
                            <span className="text-[10px] text-slate-400 block line-through">
                              Usulan Awal: {formatRupiah(collaboration.proposedBudget)}
                            </span>
                          )}
                      </div>
                    ) : (
                      <div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                          <input
                            type="text"
                            value={finalBudget ? Number(finalBudget).toLocaleString("id-ID") : ""}
                            onChange={handleBudgetChange}
                            placeholder="0"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-sm focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 font-bold text-[#181343] placeholder:text-slate-300"
                          />
                        </div>
                        {finalBudget && (
                          <span className="text-[11px] text-[#009E75] font-semibold mt-1 block">
                            {formatRupiah(finalBudget)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Field 2: Target Penerima Manfaat */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Penerima Manfaat
                    </label>
                    {isAgreed || isCancelled ? (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] min-h-[46px] flex items-center">
                        <div className="text-xs font-semibold text-[#181343]">
                          {targetBeneficiaries || "-"}
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={targetBeneficiaries}
                          onChange={(e) => setTargetBeneficiaries(e.target.value)}
                          placeholder="Contoh: 150 KK Nelayan & 50 Pemuda Desa"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343] placeholder:text-slate-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Field 3: Tanggal Mulai Program */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tanggal Mulai Program
                    </label>
                    {isAgreed || isCancelled ? (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] min-h-[46px] flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-[#181343]">
                          {startDate ? formatDate(startDate) : "Belum Ditentukan"}
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Field 4: Tanggal Selesai Program */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tanggal Selesai Program
                    </label>
                    {isAgreed || isCancelled ? (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] min-h-[46px] flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-[#181343]">
                          {endDate ? formatDate(endDate) : "Belum Ditentukan"}
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Field 5: Catatan Negosiasi & Klausul Khusus */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Catatan Negosiasi &amp; Ketentuan Khusus
                  </label>
                  {isAgreed || isCancelled ? (
                    notes && notes.trim() ? (
                      <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-xs text-slate-700 leading-relaxed italic">
                        "{notes}"
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-xs text-slate-400 italic">
                        Tidak ada catatan atau klausul khusus yang dicantumkan.
                      </div>
                    )
                  ) : (
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tuliskan catatan khusus terkait termin pembayaran, mekanisme pelaporan berkala, atau PIC operasional di lapangan..."
                      className="w-full p-3.5 rounded-xl border border-[#E8E8EA] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343] placeholder:text-slate-400 leading-relaxed"
                    />
                  )}
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION: FINALISASI RENCANA PELAKSANAAN & MILESTONES */}
              {/* ======================================================== */}
              <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8EA]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-[#181343]">
                        Finalisasi Rencana Pelaksanaan &amp; Milestone
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#787680]">
                      Ubah rencana kerja dari dokumen proposal menjadi milestone terstruktur yang disepakati kedua pihak sebelum MoU disahkan.
                    </p>
                  </div>

                  {/* Status Konfirmasi Rencana */}
                  <div>
                    {milestonePlanStatus === "CONFIRMED_BY_PARTNER" ? (
                      <Badge variant="emerald" size="sm" hasDot>
                        Dikonfirmasi Mitra
                      </Badge>
                    ) : milestonePlanStatus === "PENDING_PARTNER_CONFIRMATION" ? (
                      <Badge variant="amber" size="sm" hasDot>
                        Menunggu Mitra
                      </Badge>
                    ) : milestonePlanStatus === "REVISION_REQUESTED" ? (
                      <Badge variant="rose" size="sm" hasDot>
                        Mitra Minta Koreksi
                      </Badge>
                    ) : (
                      <Badge variant="slate" size="sm">
                        Draf Internal
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Status Notice / Feedback Box */}
                {milestonePlanStatus === "REVISION_REQUESTED" && partnerFeedback && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>Catatan Koreksi dari Mitra Pelaksana:</span>
                    </div>
                    <p className="italic bg-white/80 p-2.5 rounded-lg border border-amber-200/80 leading-relaxed">
                      "{partnerFeedback}"
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Silakan perbaiki daftar milestone di bawah, lalu klik <strong>"Ajukan Ulang ke Mitra"</strong>.
                    </p>
                  </div>
                )}

                {milestonePlanStatus === "CONFIRMED_BY_PARTNER" && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Mitra pelaksana telah mengonfirmasi kesesuaian milestone ini. Tahapan ini akan otomatis diaktivasi ke modul monitoring saat MoU disahkan.
                    </span>
                  </div>
                )}

                {milestonePlanStatus === "PENDING_PARTNER_CONFIRMATION" && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Rencana milestone telah diajukan ke mitra pelaksana dan sedang menunggu peninjauan/persetujuan mitra.
                    </span>
                  </div>
                )}

                {/* AI Rationale banner jika ada */}
                {aiRationale && (
                  <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200/70 text-indigo-900 text-xs flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-indigo-950">Draf Ekstraksi AI dari Dokumen Proposal:</span>
                      <p className="text-[11px] text-indigo-800">{aiRationale}</p>
                    </div>
                  </div>
                )}

                {/* Action Bar Pembuatan Milestone (Manual / AI) */}
                {!isAgreed && !isCancelled && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      {aiEnabled && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleExtractWithAi}
                          disabled={isExtractingAi || isSubmitting}
                          className="text-xs bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 border-indigo-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          {isExtractingAi ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Mengekstrak Dokumen...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Bantu Ekstraksi dengan AI</span>
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenAddMilestone}
                        disabled={isSubmitting}
                        className="text-xs rounded-xl flex items-center gap-1.5 cursor-pointer text-slate-700 border-[#E8E8EA]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Manual</span>
                      </Button>
                    </div>

                    {collaboration.proposalDocumentUrl && (
                      <a
                        href={collaboration.proposalDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 underline underline-offset-2"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat Dokumen Proposal Rujukan</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Daftar Milestone Cards */}
                {milestones.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[#E8E8EA] text-center space-y-2 bg-slate-50/40">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Belum ada tahapan milestone yang disusun
                    </p>
                    <p className="text-[11px] text-[#787680] max-w-md mx-auto">
                      Klik <strong>"Bantu Ekstraksi dengan AI"</strong> untuk mengekstrak draf milestone secara otomatis dari dokumen proposal mitra, atau klik <strong>"Tambah Manual"</strong> untuk menyusun sendiri.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((st, idx) => (
                      <div
                        key={st.id || idx}
                        className="p-3.5 rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] hover:border-slate-300 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#181343] text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="text-xs font-bold text-[#181343]">{st.title}</h5>
                              <span className="text-[10px] text-slate-500 font-medium">
                                Jadwal Target: <strong className="text-slate-700">{st.targetTimeline || "-"}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E8E8EA] text-slate-600">
                              {st.source === "AI_GENERATED" ? "Draft AI" : "Manual"}
                            </span>

                            {!isAgreed && !isCancelled && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditMilestone(st)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                                  title="Edit Tahapan"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMilestone(st.id)}
                                  className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Hapus Tahapan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {st.description && (
                          <p className="text-xs text-[#787680] leading-relaxed pl-8">
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

                    {/* Action Bar Konfirmasi Mitra */}
                    {!isAgreed && !isCancelled && milestones.length > 0 && (
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8E8EA]">
                        <p className="text-[11px] text-[#787680]">
                          {milestones.length} tahapan milestone siap diajukan untuk disepakati bersama.
                        </p>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={() => handleSubmit("NEGOTIATION")}
                            className="text-xs rounded-xl"
                          >
                            Simpan Draf Saja
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={handleSendToPartner}
                            className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-semibold rounded-xl px-4 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Ajukan ke Mitra untuk Konfirmasi</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* SECTION: PREDIKSI POTENSI DAMPAK PROGRAM (AI IMPACT PREDICTION) */}
              {/* ======================================================== */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#181343]">
                          Prediksi Potensi Dampak AI
                        </h4>
                        {impactResult && (
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              impactResult.overallImpactScore >= 80
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : impactResult.overallImpactScore >= 60
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            Skor: {impactResult.overallImpactScore}/100 • {impactResult.impactLevelLabel || impactResult.impactLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#787680] truncate">
                        Estimasi hasil terukur dan rekomendasi indikator keberhasilan sebelum pengesahan MoU.
                      </p>
                    </div>
                  </div>

                  {aiEnabled && !isAgreed && !isCancelled && (
                    <Button
                      type="button"
                      variant={impactResult ? "outline" : "primary"}
                      size="sm"
                      disabled={isPredictingAi}
                      onClick={handleRunImpactPrediction}
                      className={`text-xs rounded-xl shrink-0 cursor-pointer ${
                        impactResult
                          ? "border-[#E8E8EA] text-slate-700 hover:bg-slate-50"
                          : "bg-[#181343] hover:bg-[#25205c] text-white font-semibold shadow-2xs"
                      }`}
                      leftIcon={
                        isPredictingAi ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : impactResult ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {isPredictingAi
                        ? "Menganalisis..."
                        : impactResult
                        ? "Simulasi Ulang"
                        : "Simulasikan Dampak AI"}
                    </Button>
                  )}
                </div>

                {impactResult ? (
                  <div className="space-y-3 pt-1">
                    {/* Ringkasan Eksekutif Super Padat (1-2 kalimat) */}
                    {impactResult.executiveSummary && (
                      <p className="text-xs text-slate-700 leading-relaxed bg-[#F9F9FB] p-3 rounded-xl border border-[#E8E8EA]">
                        "{impactResult.executiveSummary}"
                      </p>
                    )}

                    {/* Metrik Capaian Utama (Grid 3 Kolom Ringkas) */}
                    {impactResult.projectedOutputs && impactResult.projectedOutputs.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {impactResult.projectedOutputs.slice(0, 3).map((out: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5"
                          >
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                              {out.metric}
                            </span>
                            <span className="text-xs font-bold text-[#181343] block truncate">
                              {out.estimate}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rekomendasi Indikator Keberhasilan (KPI) */}
                    {impactResult.keySuccessIndicators && impactResult.keySuccessIndicators.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Indikator Keberhasilan (KPI Rekomendasi)
                          </span>
                          {!isAgreed && !isCancelled && (
                            <button
                              type="button"
                              onClick={handleApplyKpiToNotes}
                              className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{isKpiCopied ? "Tersalin ke Catatan!" : "Terapkan ke Catatan MoU"}</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {impactResult.keySuccessIndicators.slice(0, 3).map((kpi: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white border border-[#E8E8EA] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                                <span className="font-semibold text-slate-800 truncate">
                                  {kpi.indicator}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/70 shrink-0">
                                Target: {kpi.target}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Catatan Risiko Wilayah (1 Baris Ringkas) */}
                    {impactResult.regionalRisks && impactResult.regionalRisks.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <div className="min-w-0 leading-relaxed">
                          <span className="font-bold">Perhatian Wilayah: </span>
                          <span>{impactResult.regionalRisks[0].risk} </span>
                          <span className="text-amber-800 font-semibold">
                            (Mitigasi: {impactResult.regionalRisks[0].mitigation})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-xs text-[#787680] flex items-center justify-between gap-3">
                    <p>
                      Jalankan simulasi AI untuk memproyeksikan estimasi capaian hasil, efisiensi pagu, dan indikator keberhasilan (KPI) sebelum mengesahkan kesepakatan MoU.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* KOLOM KANAN (~35%): Para Pihak, Dokumen MoU & Rujukan */}
            {/* ======================================================== */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              {/* Card 1: Para Pihak Kemitraan */}
              <div className="p-4 rounded-xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#787680] block">
                  Para Pihak Kerja Sama
                </span>

                <div className="space-y-2.5">
                  {/* Perusahaan Sponsor */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA]">
                    <div className="w-9 h-9 rounded-xl bg-[#181343]/10 text-[#181343] flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[#787680] uppercase font-semibold block">
                        Perusahaan Sponsor
                      </span>
                      <h4 className="font-bold text-[#181343] text-xs truncate">
                        {collaboration.companyName || "Perusahaan CSR"}
                      </h4>
                      {collaboration.companyEmail && (
                        <span className="text-[11px] text-slate-500 block truncate">
                          {collaboration.companyEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mitra Pelaksana */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA]">
                    <ModalPartnerLogo logoUrl={collaboration.partnerLogo} name={collaboration.partnerName || "Mitra"} />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[#787680] uppercase font-semibold block">
                        Mitra Pelaksana
                      </span>
                      <h4 className="font-bold text-[#181343] text-xs truncate">
                        {collaboration.partnerName || "Mitra Pelaksana"}
                      </h4>
                      {collaboration.partnerCity && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {collaboration.partnerCity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Dokumen MoU / Perjanjian Kerja Sama */}
              <div className="p-4 rounded-xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#787680]">
                    Dokumen MoU / PKS
                  </span>
                  {isAgreed ? (
                    <Badge variant="emerald" size="sm">
                      Telah Disepakati
                    </Badge>
                  ) : mouDocumentUrl ? (
                    <Badge variant="amber" size="sm">
                      Dalam Proses
                    </Badge>
                  ) : (
                    <Badge variant="slate" size="sm">
                      Belum Diunggah
                    </Badge>
                  )}
                </div>

                {mouDocumentUrl ? (
                  <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className="w-4 h-4 text-[#009E75] shrink-0" />
                        <span className="text-xs font-semibold text-[#181343] truncate">
                          {mouDocumentUrl.split("/").pop() || "Dokumen-MoU.pdf"}
                        </span>
                      </div>
                      <a
                        href={mouDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#009E75] hover:text-emerald-700 flex items-center gap-1 shrink-0"
                      >
                        <span>Buka</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {!isAgreed && !isCancelled && (
                      <div className="pt-2 border-t border-[#E8E8EA] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setMouDocumentUrl("")}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Ganti Berkas
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block p-4 border border-dashed border-[#E8E8EA] hover:border-[#181343] rounded-xl text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <FileUp className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-[#181343] block">
                        {isUploading ? "Mengunggah berkas..." : "Unggah Berkas MoU (PDF/DOCX)"}
                      </span>
                      <span className="text-[10px] text-slate-400">Maksimal 10MB</span>
                    </label>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsEditingUrl(!isEditingUrl)}
                        className="text-[11px] text-slate-500 hover:text-[#181343] underline cursor-pointer"
                      >
                        {isEditingUrl ? "Tutup input tautan" : "Atau masukkan tautan dokumen (URL)"}
                      </button>
                    </div>

                    {isEditingUrl && (
                      <div className="pt-1">
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={mouDocumentUrl}
                          onChange={(e) => setMouDocumentUrl(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:outline-none focus:ring-1 focus:ring-[#181343]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card 3: Dokumen Proposal Sumber */}
              {collaboration.proposalDocumentUrl && (
                <div className="p-4 rounded-xl bg-white border border-[#E8E8EA] shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#787680] block">
                    Dokumen Proposal &amp; RAB Mitra
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {collaboration.proposalDocumentUrl.split("/").pop() || "Proposal-Mitra"}
                      </span>
                    </div>
                    <a
                      href={collaboration.proposalDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 shrink-0"
                    >
                      <span>Lihat</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. Sticky Footer Modal */}
        {/* ============================================================ */}
        <div className="px-6 py-3.5 sm:py-4 border-t border-[#E8E8EA] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenChat && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-[#E8E8EA] text-slate-700 hover:bg-slate-50 rounded-xl"
                onClick={() => {
                  onClose();
                  onOpenChat(collaboration.id);
                }}
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-slate-500" />}
              >
                Chat Negosiasi
              </Button>
            )}

            {!isAgreed && !isCancelled && (
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs rounded-xl"
                onClick={() => handleSubmit("CANCELLED")}
                leftIcon={<Ban className="w-3.5 h-3.5" />}
              >
                Batalkan Kolaborasi
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {isAgreed || isCancelled ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onClose}
                className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl px-5 py-2.5 cursor-pointer shadow-2xs"
              >
                Tutup
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-xs text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Batal
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("NEGOTIATION")}
                  className="text-xs font-semibold text-slate-700 border-[#E8E8EA] hover:bg-slate-50 rounded-xl"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Draf Kesepakatan"}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs font-semibold px-4 py-2.5 shadow-2xs cursor-pointer"
                  onClick={() => handleSubmit("AGREED")}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  {isSubmitting ? "Mengesahkan..." : "Sahkan & Sepakati MoU"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog Tambah / Edit Milestone */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E8E8EA] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E8EA]">
              <h4 className="text-sm font-bold text-[#181343]">
                {editingMilestone ? "Edit Tahapan Milestone" : "Tambah Tahapan Milestone Baru"}
              </h4>
              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">
                  Judul Milestone / Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Contoh: Sosialisasi Awal & Pembekalan Kader Posyandu"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Deskripsi Ringkas Kegiatan</label>
                <textarea
                  rows={2}
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Uraikan aksi utama yang akan dilaksanakan di lapangan..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Target Waktu / Timeline</label>
                  <input
                    type="text"
                    value={milestoneTimeline}
                    onChange={(e) => setMilestoneTimeline(e.target.value)}
                    placeholder="Contoh: Bulan ke-1"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Target Output / KPI</label>
                  <input
                    type="text"
                    value={milestoneKpi}
                    onChange={(e) => setMilestoneKpi(e.target.value)}
                    placeholder="Contoh: 50 kader terlatih"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">
                  Bukti Pelaksanaan (Expected Evidence)
                </label>
                <input
                  type="text"
                  value={milestoneEvidence}
                  onChange={(e) => setMilestoneEvidence(e.target.value)}
                  placeholder="Contoh: Daftar absensi kader, foto kegiatan, dan BAST logistik"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:border-[#181343] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8EA]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveMilestoneItem}
                className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-semibold rounded-xl px-4"
              >
                Simpan Tahapan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
