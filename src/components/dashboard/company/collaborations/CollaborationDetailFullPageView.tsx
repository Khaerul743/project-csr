"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Users,
  MapPin,
  FileUp,
  FileCheck2,
  ExternalLink,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Layers,
  MessageSquare,
  Loader2,
  ShieldCheck,
  Send,
  X,
  Activity,
  RotateCcw,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyCollaborationItem } from "../types";
import { formatRupiah, formatDate } from "../helpers";
import { cleanProposalText } from "../proposals/ReviewProposalPageView";
import {
  parseCollaborationPlan,
  serializeCollaborationPlan,
  PlanMilestoneItem,
  MilestonePlanStatus,
} from "../../common/collaboration-plan";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";

interface CollaborationDetailFullPageViewProps {
  collaboration: CompanyCollaborationItem;
  onBack: () => void;
  onSuccess: () => void;
  onOpenChat?: (collaborationId: string) => void;
  onNavigateToMonitoring?: (programId?: string) => void;
}

const FORM_STEPS = [
  { id: 1, label: "Klausul & Parameter", shortDesc: "Anggaran, sasaran & jadwal program" },
  { id: 2, label: "Rencana & Milestone", shortDesc: "Tahapan kerja, KPI & proyeksi dampak" },
  { id: 3, label: "Dokumen & Pengesahan", shortDesc: "Legalitas MoU & status akhir" },
];

const INPUT_BASE_CLASS =
  "w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium disabled:opacity-75 disabled:cursor-not-allowed";

function PartnerAvatarLogo({ logoUrl, name }: { logoUrl?: string | null; name: string }) {
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
        className="w-12 h-12 rounded-2xl object-cover border border-[#E8E8EA] shrink-0"
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-2xl bg-[#181343] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
      {initials}
    </div>
  );
}

export function CollaborationDetailFullPageView({
  collaboration,
  onBack,
  onSuccess,
  onOpenChat,
  onNavigateToMonitoring,
}: CollaborationDetailFullPageViewProps) {
  const aiEnabled = isAiFeatureEnabled();
  const [currentStep, setCurrentStep] = useState(1);

  // Form States
  const [finalBudget, setFinalBudget] = useState("");
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [mouDocumentUrl, setMouDocumentUrl] = useState("");
  const [status, setStatus] = useState<string>("NEGOTIATION");

  // Milestone State
  const [milestones, setMilestones] = useState<PlanMilestoneItem[]>([]);
  const [milestonePlanStatus, setMilestonePlanStatus] =
    useState<MilestonePlanStatus>("DRAFT");
  const [partnerFeedback, setPartnerFeedback] = useState<string>("");

  // Milestone Modal State
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneFormTitle, setMilestoneFormTitle] = useState("");
  const [milestoneFormTimeline, setMilestoneFormTimeline] = useState("");
  const [milestoneFormDesc, setMilestoneFormDesc] = useState("");
  const [milestoneFormKpi, setMilestoneFormKpi] = useState("");
  const [milestoneFormEvidence, setMilestoneFormEvidence] = useState("");

  // AI Extraction State
  const [isExtractingAi, setIsExtractingAi] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);

  // AI Impact Prediction State (compact)
  const [isPredictingAi, setIsPredictingAi] = useState(false);
  const [impactResult, setImpactResult] = useState<any | null>(null);
  const [isKpiCopied, setIsKpiCopied] = useState(false);

  // UI & Network States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  // Initial populate
  useEffect(() => {
    if (collaboration) {
      setFinalBudget(
        collaboration.finalBudget
          ? String(collaboration.finalBudget)
          : collaboration.proposedBudget
          ? String(collaboration.proposedBudget)
          : ""
      );
      setTargetBeneficiaries(collaboration.targetBeneficiaries || "");
      setStartDate(
        collaboration.startDate
          ? new Date(collaboration.startDate).toISOString().split("T")[0]
          : ""
      );
      setEndDate(
        collaboration.endDate
          ? new Date(collaboration.endDate).toISOString().split("T")[0]
          : ""
      );
      setMouDocumentUrl(collaboration.mouDocumentUrl || "");
      setStatus(collaboration.status || "NEGOTIATION");

      // Parse structured notes & milestones
      const plan = parseCollaborationPlan(collaboration.notes);
      setNotes(plan.textNotes || "");
      setMilestones(plan.milestones || []);
      setMilestonePlanStatus(plan.milestonePlanStatus || "DRAFT");
      setPartnerFeedback(plan.partnerFeedback || "");

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

  const isAgreed = status === "AGREED";
  const isCancelled = status === "CANCELLED";
  const isNegotiation = status === "NEGOTIATION";

  const cleanedTitle = useMemo(() => {
    const raw =
      collaboration.proposalTitle ||
      collaboration.opportunityTitle ||
      "Program Kemitraan CSR";
    return cleanProposalText(raw) || raw;
  }, [collaboration.proposalTitle, collaboration.opportunityTitle]);

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
        setSuccessMsg("Berkas dokumen MoU berhasil diunggah.");
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
          targetTimeline: st.targetTimeline || `Bulan ${idx + 1}`,
          description: st.description || "",
          suggestedKpi: st.suggestedKpi || "",
          expectedEvidence: st.expectedEvidence || "",
          source: "AI_GENERATED",
        }));

        setMilestones(formatted);
        setMilestonePlanStatus("DRAFT");
        setAiRationale(json.data?.summaryRationale || null);
        setSuccessMsg("Berhasil mengekstrak tahapan milestone dari proposal mitra.");
      } else {
        setErrorMsg("Tidak ada tahapan yang dapat diekstrak dari berkas proposal.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses ekstraksi AI");
    } finally {
      setIsExtractingAi(false);
    }
  };

  // AI Impact Prediction Handler
  const handleRunImpactPrediction = async () => {
    setIsPredictingAi(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      const res = await fetch(`/api/collaborations/${collaboration.id}/impact-prediction`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menjalankan simulasi dampak AI");
      }

      setImpactResult(json.data.prediction);
      setSuccessMsg("Simulasi proyeksi dampak AI berhasil dihitung.");
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menjalankan simulasi dampak");
    } finally {
      setIsPredictingAi(false);
    }
  };

  const handleApplyKpiToNotes = () => {
    if (!impactResult?.keySuccessIndicators) return;
    const textToAdd = impactResult.keySuccessIndicators
      .map((kpi: any) => `- ${kpi.metricName}: ${kpi.targetValue} (${kpi.verificationMethod})`)
      .join("\n");

    setNotes((prev) =>
      prev
        ? `${prev}\n\n[Target KPI Rekomendasi AI]:\n${textToAdd}`
        : `[Target KPI Rekomendasi AI]:\n${textToAdd}`
    );
    setIsKpiCopied(true);
    setTimeout(() => setIsKpiCopied(false), 2500);
  };

  // Milestone CRUD
  const handleOpenAddMilestone = () => {
    setEditingMilestoneId(null);
    setMilestoneFormTitle("");
    setMilestoneFormTimeline("");
    setMilestoneFormDesc("");
    setMilestoneFormKpi("");
    setMilestoneFormEvidence("");
    setIsMilestoneModalOpen(true);
  };

  const handleOpenEditMilestone = (item: PlanMilestoneItem) => {
    setEditingMilestoneId(item.id);
    setMilestoneFormTitle(item.title);
    setMilestoneFormTimeline(item.targetTimeline);
    setMilestoneFormDesc(item.description);
    setMilestoneFormKpi(item.suggestedKpi || "");
    setMilestoneFormEvidence(item.expectedEvidence || "");
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneFormTitle.trim()) return;

    if (editingMilestoneId) {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === editingMilestoneId
            ? {
                ...m,
                title: milestoneFormTitle.trim(),
                targetTimeline: milestoneFormTimeline.trim(),
                description: milestoneFormDesc.trim(),
                suggestedKpi: milestoneFormKpi.trim(),
                expectedEvidence: milestoneFormEvidence.trim(),
              }
            : m
        )
      );
    } else {
      const newItem: PlanMilestoneItem = {
        id: `ms-${Date.now()}`,
        orderIndex: milestones.length + 1,
        title: milestoneFormTitle.trim(),
        targetTimeline: milestoneFormTimeline.trim(),
        description: milestoneFormDesc.trim(),
        suggestedKpi: milestoneFormKpi.trim(),
        expectedEvidence: milestoneFormEvidence.trim(),
        source: "MANUAL",
      };
      setMilestones((prev) => [...prev, newItem]);
    }

    setIsMilestoneModalOpen(false);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) =>
      prev
        .filter((m) => m.id !== id)
        .map((m, idx) => ({ ...m, orderIndex: idx + 1 }))
    );
  };

  const handleSendToPartner = async () => {
    if (milestones.length === 0) {
      setErrorMsg("Mohon buat minimal satu tahapan milestone sebelum mengajukan ke mitra.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir");

      const serializedNotes = serializeCollaborationPlan({
        textNotes: notes,
        milestones,
        milestonePlanStatus: "PENDING_PARTNER_CONFIRMATION",
        partnerFeedback: "",
        lastUpdatedBy: "CSR_ADMIN",
        lastUpdatedAt: new Date().toISOString(),
      });

      const res = await fetch(`/api/collaborations/${collaboration.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: serializedNotes,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal mengajukan milestone ke mitra");
      }

      setMilestonePlanStatus("PENDING_PARTNER_CONFIRMATION");
      setSuccessMsg("Tahapan milestone berhasil diajukan ke mitra untuk dikonfirmasi.");
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mengajukan milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main Submit Handler (Draft vs Agreed vs Cancelled)
  const handleSubmit = async (chosenStatus: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const budgetNum = finalBudget ? Number(finalBudget) : null;
    if (chosenStatus === "AGREED") {
      if (!budgetNum || budgetNum <= 0) {
        setErrorMsg("Nilai anggaran yang disepakati wajib diisi sebelum mengesahkan MoU.");
        return;
      }
      if (!mouDocumentUrl) {
        setErrorMsg("Unggah atau lampirkan berkas dokumen MoU sebelum melakukan pengesahan.");
        return;
      }
    }

    const serializedNotes = serializeCollaborationPlan({
      textNotes: notes,
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

      setStatus(chosenStatus);
      onSuccess();
      if (chosenStatus === "AGREED") {
        setSuccessMsg("MoU berhasil disahkan! Kerja sama aktif dan siap dipantau pada modul Monitoring Program.");
      } else if (chosenStatus === "CANCELLED") {
        setSuccessMsg("Status kerja sama berhasil dibatalkan.");
      } else {
        setSuccessMsg("Draf klausul kesepakatan berhasil disimpan.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memperbarui kesepakatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header Identitas Halaman & Navigasi Kembali (Sesuai Gambar 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 w-full">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#181343] transition cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kelola Kerja Sama &amp; MoU</span>
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
            Finalisasi klausul anggaran, jadwal pelaksanaan, tahapan milestone, dan pengesahan dokumen MoU resmi.
          </p>
        </div>

        {/* Action Header Kanan (Hanya 1 Tombol Kontekstual Sesuai Status agar Tidak Numpuk) */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {isAgreed ? (
            onNavigateToMonitoring && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onNavigateToMonitoring()}
                leftIcon={<Activity className="w-3.5 h-3.5 text-emerald-400" />}
                className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
              >
                Buka Monitoring Program
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
                Chat Negosiasi
              </Button>
            )
          )}
        </div>
      </div>

      {/* 2. Banner Konteks Kemitraan (Disederhanakan & Bersih) */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Sisi Kiri: Profil Mitra & Judul Proposal */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <PartnerAvatarLogo logoUrl={collaboration.partnerLogo} name={collaboration.partnerName || "Mitra"} />
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Mitra Pelaksana:
              </span>
              <span className="font-bold text-[#181343]">
                {collaboration.partnerName || "Mitra CSR"}
              </span>
              {collaboration.partnerCity && (
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <span className="text-slate-300">•</span>
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {collaboration.partnerCity}
                </span>
              )}
              {isAgreed && onOpenChat && (
                <button
                  type="button"
                  onClick={() => onOpenChat(collaboration.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#181343] bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded-md transition cursor-pointer ml-1"
                >
                  <MessageSquare className="w-3 h-3 text-slate-500" />
                  <span>Chat Mitra</span>
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
              Usulan Awal Mitra
            </span>
            <span className="text-sm sm:text-base font-bold text-[#181343] block">
              {collaboration.proposedBudget ? formatRupiah(collaboration.proposedBudget) : "-"}
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

      {/* 3. Stepper Card (Tahapan 1 - 3 seperti Buat Peluang CSR) */}
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
                  className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
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

      {/* Pesan Error / Sukses */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{successMsg}</span>
        </div>
      )}

      {/* 4. Main Step Form Card (Layout, Posisi & Format Persis Seperti Buat Peluang CSR) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-2xs space-y-6">
        {/* ============================================================ */}
        {/* LANGKAH 1: KLAUSUL & PARAMETER PROGRAM */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Tahap dengan Nomor Badge Persis Buat Peluang CSR */}
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
                    Tentukan nilai anggaran yang disepakati, target penerima manfaat, dan rentang tanggal pelaksanaan program.
                  </p>
                </div>
              </div>
            </div>

            {/* Layout Field 2 Kolom Persis Buat Peluang CSR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Field 1: Nilai Anggaran Disepakati */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#181343] block">
                  Nilai Anggaran Disepakati <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    disabled={isAgreed || isCancelled}
                    value={finalBudget ? Number(finalBudget).toLocaleString("id-ID") : ""}
                    onChange={handleBudgetChange}
                    placeholder="Contoh: 30.000.000"
                    className="w-full h-11 pl-11 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-emerald-700 font-semibold">
                    Terbilang: {formatRupiah(finalBudget || "0")}
                  </span>
                  {collaboration.proposedBudget && (
                    <span className="text-slate-400">
                      Usulan awal mitra: <strong className="text-slate-600 font-semibold">{formatRupiah(collaboration.proposedBudget)}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Field 2: Target Sasaran & Penerima Manfaat */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#181343] block">
                  Target Sasaran &amp; Penerima Manfaat
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    disabled={isAgreed || isCancelled}
                    value={targetBeneficiaries}
                    onChange={(e) => setTargetBeneficiaries(e.target.value)}
                    placeholder="Contoh: 30 orang penerima manfaat langsung..."
                    className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <span className="text-[11px] text-[#64748B]">
                  Kelompok masyarakat sasaran utama yang menerima dampak langsung program.
                </span>
              </div>

              {/* Field 3: Tanggal Mulai Pelaksanaan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#181343] block">
                  Tanggal Mulai Pelaksanaan
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    disabled={isAgreed || isCancelled}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Field 4: Tanggal Selesai Pelaksanaan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#181343] block">
                  Tanggal Selesai Pelaksanaan
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    disabled={isAgreed || isCancelled}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Field 5: Catatan Negosiasi & Ketentuan Khusus */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[13px] font-semibold text-[#181343] block">
                Catatan Negosiasi &amp; Ketentuan Khusus
              </label>
              <textarea
                rows={4}
                disabled={isAgreed || isCancelled}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan kesepakatan khusus, mekanisme pencairan termin, atau persyaratan laporan yang disetujui bersama mitra..."
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium leading-relaxed disabled:opacity-75 disabled:cursor-not-allowed"
              />
              <span className="text-[11px] text-[#64748B] block">
                Catatan ini akan tercatat dalam riwayat kesepakatan dan dapat dijadikan lampiran klausul kerja sama.
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* LANGKAH 2: RENCANA & MILESTONE */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Tahap dengan Nomor Badge Persis Buat Peluang CSR */}
            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs shrink-0 border border-[#181343]/10">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Rencana Pelaksanaan &amp; Milestone
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Susun tahapan milestone kegiatan yang disepakati bersama mitra sebagai dasar pemantauan program.
                  </p>
                </div>
              </div>

              {/* Status Milestone */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500 font-medium">Status Tahapan:</span>
                {milestonePlanStatus === "CONFIRMED_BY_PARTNER" ? (
                  <Badge variant="emerald" size="sm" hasDot>
                    Dikonfirmasi Mitra
                  </Badge>
                ) : milestonePlanStatus === "PENDING_PARTNER_CONFIRMATION" ? (
                  <Badge variant="amber" size="sm" hasDot>
                    Menunggu Konfirmasi
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    Draf Internal
                  </Badge>
                )}
              </div>
            </div>

            {partnerFeedback && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                <strong>Catatan dari Mitra:</strong> &quot;{partnerFeedback}&quot;
              </div>
            )}

            {/* Action Bar Pembuatan Milestone */}
            {!isAgreed && !isCancelled && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAddMilestone}
                    disabled={isSubmitting}
                    className="text-xs rounded-xl flex items-center gap-1.5 cursor-pointer text-slate-700 border-[#E5E7EB] hover:bg-slate-50 h-9"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Tahapan Manual</span>
                  </Button>

                  {aiEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExtractWithAi}
                      disabled={isExtractingAi || isSubmitting}
                      className="text-xs bg-white hover:bg-slate-50 text-slate-700 border border-[#E5E7EB] rounded-xl flex items-center gap-1.5 cursor-pointer h-9"
                    >
                      {isExtractingAi ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#009E75]" />
                          <span>Mengekstrak Dokumen Proposal...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#009E75]" />
                          <span>Ekstrak dari Proposal (AI)</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {collaboration.proposalDocumentUrl && (
                  <a
                    href={collaboration.proposalDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#009E75] hover:text-emerald-800 flex items-center gap-1 underline underline-offset-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat Berkas Proposal Mitra</span>
                  </a>
                )}
              </div>
            )}

            {/* AI Summary Rationale jika baru diekstrak */}
            {aiRationale && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-slate-700 text-xs flex items-start gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#009E75] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900">Rangkuman Ekstraksi AI:</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{aiRationale}</p>
                </div>
              </div>
            )}

            {/* Daftar Tahapan Milestone */}
            {milestones.length === 0 ? (
              <div className="py-12 rounded-xl border border-dashed border-[#E5E7EB] text-center space-y-2 bg-[#F8FAFC]">
                <Layers className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-800">
                  Belum Ada Tahapan Milestone
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Tambahkan tahapan kegiatan secara manual atau gunakan tombol bantuan ekstraksi dari proposal di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    className="p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-[#181343] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#181343]">{st.title}</h4>
                          <span className="text-[11px] text-slate-500">
                            Target Waktu: <strong className="text-slate-700 font-semibold">{st.targetTimeline || "-"}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!isAgreed && !isCancelled && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditMilestone(st)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title="Edit Tahapan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMilestone(st.id)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus Tahapan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {st.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pl-9">
                        {st.description}
                      </p>
                    )}

                    {(st.suggestedKpi || st.expectedEvidence) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-9 pt-1 text-xs">
                        {st.suggestedKpi && (
                          <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E5E7EB]">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                              Target Output / KPI
                            </span>
                            <span className="text-slate-700 font-medium text-xs block mt-0.5">{st.suggestedKpi}</span>
                          </div>
                        )}
                        {st.expectedEvidence && (
                          <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E5E7EB]">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                              Bukti Pelaksanaan
                            </span>
                            <span className="text-slate-700 font-medium text-xs block mt-0.5">{st.expectedEvidence}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {!isAgreed && !isCancelled && milestones.length > 0 && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5E7EB]">
                    <span className="text-xs text-slate-500">
                      {milestones.length} tahapan milestone siap diajukan ke mitra.
                    </span>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={handleSendToPartner}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-semibold rounded-xl px-4 cursor-pointer"
                    >
                      Ajukan Milestone ke Mitra
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Insight Dampak AI (Kompak & Bersih) */}
            {aiEnabled && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <div>
                      <h3 className="text-xs font-bold text-[#181343]">
                        Simulasi Potensi Dampak AI
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Analisis proyeksi efektivitas sebelum MoU disahkan.
                      </p>
                    </div>
                  </div>

                  {!isAgreed && !isCancelled && (
                    <button
                      type="button"
                      disabled={isPredictingAi}
                      onClick={handleRunImpactPrediction}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
                    >
                      {isPredictingAi ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Menganalisis...</span>
                        </>
                      ) : impactResult ? (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          <span>Simulasi Ulang</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>Hitung Proyeksi Dampak</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {impactResult && (
                  <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Skor Estimasi Dampak:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        {impactResult.overallImpactScore}/100 ({impactResult.impactLevelLabel || impactResult.impactLevel})
                      </span>
                    </div>

                    {impactResult.keySuccessIndicators && impactResult.keySuccessIndicators.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Indikator Keberhasilan yang Disarankan:
                          </span>
                          {!isAgreed && !isCancelled && (
                            <button
                              type="button"
                              onClick={handleApplyKpiToNotes}
                              className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{isKpiCopied ? "Tersalin!" : "Salin ke Catatan"}</span>
                            </button>
                          )}
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                          {impactResult.keySuccessIndicators.slice(0, 3).map((kpi: any, idx: number) => (
                            <li key={idx}>
                              <strong>{kpi.metricName}:</strong> {kpi.targetValue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* LANGKAH 3: DOKUMEN & PENGESAHAN */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Tahap dengan Nomor Badge Persis Buat Peluang CSR */}
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
                    Kelola berkas perjanjian kerja sama resmi (MoU/PKS) dan sahkan status kerja sama untuk memulai pelaksanaan program.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Kolom 1: Berkas Dokumen MoU Resmi */}
              <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#181343]">
                    Dokumen Perjanjian Kerja Sama (MoU/PKS)
                  </span>
                  {mouDocumentUrl ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Tersedia
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Belum Diunggah
                    </span>
                  )}
                </div>

                {mouDocumentUrl ? (
                  <div className="p-3.5 rounded-lg bg-white border border-[#E5E7EB] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className="w-4 h-4 text-[#009E75] shrink-0" />
                        <span className="text-xs font-semibold text-[#181343] truncate">
                          {mouDocumentUrl.split("/").pop() || "Dokumen-MoU-Resmi.pdf"}
                        </span>
                      </div>
                      <a
                        href={mouDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#009E75] hover:text-emerald-800 flex items-center gap-1 shrink-0"
                      >
                        <span>Buka</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {!isAgreed && !isCancelled && (
                      <div className="pt-2 border-t border-[#E5E7EB] flex justify-end">
                        <button
                          type="button"
                          onClick={() => setMouDocumentUrl("")}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Ganti Berkas Dokumen
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <label className="block p-5 border-2 border-dashed border-[#E5E7EB] hover:border-[#181343] rounded-xl text-center cursor-pointer bg-white transition">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <FileUp className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-[#181343] block">
                        {isUploading ? "Mengunggah berkas..." : "Unggah Berkas MoU Resmi (PDF/DOCX)"}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Maksimal ukuran file 10MB
                      </span>
                    </label>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsEditingUrl(!isEditingUrl)}
                        className="text-[11px] text-slate-500 hover:text-[#181343] underline cursor-pointer"
                      >
                        {isEditingUrl ? "Tutup input URL" : "Atau masukkan tautan dokumen (Google Drive/Cloud)"}
                      </button>
                    </div>

                    {isEditingUrl && (
                      <input
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={mouDocumentUrl}
                        onChange={(e) => setMouDocumentUrl(e.target.value)}
                        className={INPUT_BASE_CLASS}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Kolom 2: Dokumen Proposal Sumber & Ringkasan */}
              <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-3.5">
                <span className="text-xs font-bold text-[#181343] block">
                  Dokumen Proposal &amp; RAB Asli Mitra
                </span>

                {collaboration.proposalDocumentUrl ? (
                  <div className="p-3.5 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {collaboration.proposalDocumentUrl.split("/").pop() || "Berkas-Proposal-Mitra.pdf"}
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
                  <div className="p-3.5 rounded-lg bg-white border border-[#E5E7EB] text-center text-xs text-slate-400">
                    Tidak ada lampiran berkas proposal rujukan.
                  </div>
                )}

                {/* Ringkasan Parameter Akhir */}
                <div className="p-3.5 rounded-lg bg-white border border-[#E5E7EB] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Anggaran Disepakati:</span>
                    <strong className="text-emerald-700 font-bold">
                      {formatRupiah(finalBudget || "0")}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Jadwal Pelaksanaan:</span>
                    <strong className="text-slate-800 font-semibold">
                      {startDate ? formatDate(startDate) : "Belum diatur"}
                      {" s.d. "}
                      {endDate ? formatDate(endDate) : "Belum diatur"}
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

        {/* 5. Navigasi Aksi Bawah (Persis Seperti Gambar 2: Batal di Kiri, Simpan Draf & Lanjut di Kanan) */}
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
                Batal
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

          {/* Tombol Kanan: Simpan Draf selalu ada di semua langkah, tombol Lanjut / Sahkan */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {!isAgreed && !isCancelled && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleSubmit("NEGOTIATION")}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial text-xs sm:text-sm font-semibold border-[#E5E7EB] text-[#47464F] hover:bg-slate-50 rounded-xl px-5 py-2.5 cursor-pointer"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Draf"}
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setCurrentStep((prev) => Math.min(3, prev + 1))}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial bg-[#181343] hover:bg-[#25205c] text-white text-xs sm:text-sm font-bold rounded-xl px-6 py-2.5 shadow-2xs cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Langkah Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                {!isAgreed && !isCancelled && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmit("CANCELLED")}
                    className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200 cursor-pointer"
                  >
                    Batalkan Kesepakatan
                  </button>
                )}
                {!isAgreed && !isCancelled && (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => handleSubmit("AGREED")}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial bg-[#009E75] hover:bg-[#008764] text-white text-xs sm:text-sm font-bold rounded-xl px-6 py-2.5 shadow-2xs cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sahkan &amp; Sepakati MoU</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog Form Tambah / Edit Milestone */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E8E8EA] shadow-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EA] pb-3">
              <h3 className="text-sm font-bold text-[#181343]">
                {editingMilestoneId ? "Edit Tahapan Milestone" : "Tambah Tahapan Milestone Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Judul Tahapan Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Seleksi Peserta & Sosialisasi Lapangan"
                  value={milestoneFormTitle}
                  onChange={(e) => setMilestoneFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Target Waktu Pelaksanaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bulan 1 (Minggu 1-2)"
                  value={milestoneFormTimeline}
                  onChange={(e) => setMilestoneFormTimeline(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  rows={2}
                  placeholder="Uraian singkat rincian kegiatan pada tahapan ini..."
                  value={milestoneFormDesc}
                  onChange={(e) => setMilestoneFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-800">
                    Target Output / KPI
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 60 peserta terpilih"
                    value={milestoneFormKpi}
                    onChange={(e) => setMilestoneFormKpi(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-800">
                    Bukti Pelaksanaan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Berita Acara & Daftar Hadir"
                    value={milestoneFormEvidence}
                    onChange={(e) => setMilestoneFormEvidence(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E8EA] focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E8EA]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="text-xs rounded-xl border-[#E8E8EA] text-slate-700"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl px-4"
                >
                  Simpan Tahapan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
