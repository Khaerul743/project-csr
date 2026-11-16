"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Calendar,
  Users,
  Building2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Download,
  RotateCcw,
  Layers,
  Mail,
  MapPin,
  ShieldCheck,
  Target,
  SlidersHorizontal,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyProposalItem } from "../types";
import {
  PROPOSAL_STATUS_CONFIG,
  FOCUS_AREA_CONFIG,
  formatRupiah,
  formatDate,
} from "../helpers";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";

interface ReviewProposalPageViewProps {
  proposal: CompanyProposalItem;
  onBack: () => void;
  onSuccess: () => void;
  onNavigateToCollaboration?: (collabId?: string) => void;
}

export function cleanProposalText(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/(?:\.\s*|\s+)?Proposal_CSR_[A-Za-z0-9_.]+(?:\.\.\.)?/gi, "")
    .trim();
}

export function ReviewProposalPageView({
  proposal: initialProposal,
  onBack,
  onSuccess,
  onNavigateToCollaboration,
}: ReviewProposalPageViewProps) {
  const aiEnabled = isAiFeatureEnabled();
  const [currentProposal, setCurrentProposal] = useState<CompanyProposalItem>(initialProposal);
  const [decisionStatus, setDecisionStatus] = useState<
    "UNDER_REVIEW" | "REVISION_REQUESTED" | "ACCEPTED" | "REJECTED"
  >("ACCEPTED");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Screening states
  const [isScreeningAi, setIsScreeningAi] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isCopiedNotes, setIsCopiedNotes] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Active section tab (strictly separated)
  const [activeTab, setActiveTab] = useState<"dossier" | "documents" | "evaluation">("dossier");

  useEffect(() => {
    setCurrentProposal(initialProposal);
    if (initialProposal.status === "UNDER_REVIEW") {
      setDecisionStatus("ACCEPTED");
    } else if (initialProposal.status === "SUBMITTED") {
      setDecisionStatus("ACCEPTED");
    } else {
      setDecisionStatus(initialProposal.status as any);
    }
    setFeedback(initialProposal.feedback || "");
    setErrorMsg(null);
    setSuccessMsg(null);
    setLogoError(false);

    if (initialProposal.aiScreeningResult) {
      try {
        setAiResult(JSON.parse(initialProposal.aiScreeningResult));
      } catch {
        setAiResult(null);
      }
    } else {
      setAiResult(null);
    }
  }, [initialProposal]);

  const proposal = currentProposal;

  // Parse proposal summary narrative text
  const overviewText = useMemo(() => {
    let overview = proposal.summary || "";

    if (proposal.summary) {
      try {
        const parsed = JSON.parse(proposal.summary);
        if (parsed && typeof parsed === "object" && typeof parsed.overview === "string") {
          overview = parsed.overview;
        }
      } catch {
        // Plain text fallback
      }
    }

    return cleanProposalText(overview);
  }, [proposal.summary]);

  const cleanTitle = useMemo(() => {
    return cleanProposalText(proposal.title) || proposal.title;
  }, [proposal.title]);

  const overviewParagraphs = useMemo(() => {
    if (!overviewText) return [];
    return overviewText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [overviewText]);

  const partnerInitials = useMemo(() => {
    const name = proposal.partnerName || "Mitra";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }, [proposal.partnerName]);

  const handleRunAiScreening = async () => {
    setIsScreeningAi(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login telah berakhir");

      const res = await fetch(`/api/proposals/${proposal.id}/ai-screen`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal melakukan skrining kriteria proposal");
      }

      setAiResult(json.data.screeningResult);
      setCurrentProposal((prev) => ({
        ...prev,
        aiScore: json.data.screeningResult.overallScore,
        aiScreeningResult: JSON.stringify(json.data.screeningResult),
        aiScreenedAt: new Date().toISOString(),
      }));
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menjalankan skrining kriteria untuk proposal ini");
    } finally {
      setIsScreeningAi(false);
    }
  };

  const handleApplyAiFeedback = () => {
    if (!aiResult?.suggestedRevisionNotes) return;
    setFeedback((prev) =>
      prev ? `${prev}\n\n${aiResult.suggestedRevisionNotes}` : aiResult.suggestedRevisionNotes
    );
    setDecisionStatus("REVISION_REQUESTED");
    setIsCopiedNotes(true);
    setTimeout(() => setIsCopiedNotes(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (decisionStatus === "REVISION_REQUESTED" && (!feedback.trim() || feedback.trim().length < 5)) {
      setErrorMsg("Mohon sertakan catatan umpan balik atau poin revisi untuk mitra minimal 5 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login telah berakhir");

      const res = await fetch(`/api/proposals/${proposal.id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: decisionStatus,
          feedback: feedback.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui status proposal");
      }

      setSuccessMsg("Keputusan peninjauan berhasil disimpan.");
      setCurrentProposal((prev) => ({
        ...prev,
        status: decisionStatus,
        feedback: feedback.trim() || null,
        reviewedAt: new Date().toISOString(),
      }));
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses keputusan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadge = useMemo(() => {
    switch (proposal.status) {
      case "SUBMITTED":
        return {
          label: "Menunggu Tinjauan",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          dot: "bg-blue-600",
        };
      case "UNDER_REVIEW":
        return {
          label: "Dalam Tinjauan",
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
          dot: "bg-purple-600",
        };
      case "REVISION_REQUESTED":
        return {
          label: "Perlu Revisi",
          bg: "bg-amber-50",
          text: "text-amber-800",
          border: "border-amber-200",
          dot: "bg-amber-600",
        };
      case "ACCEPTED":
        return {
          label: "Disetujui",
          bg: "bg-emerald-50",
          text: "text-emerald-800",
          border: "border-emerald-200",
          dot: "bg-emerald-600",
        };
      case "REJECTED":
        return {
          label: "Ditolak",
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200",
          dot: "bg-rose-600",
        };
      case "WITHDRAWN":
        return {
          label: "Ditarik",
          bg: "bg-slate-100",
          text: "text-slate-700",
          border: "border-slate-200",
          dot: "bg-slate-500",
        };
      default:
        return {
          label: proposal.status,
          bg: "bg-slate-100",
          text: "text-slate-700",
          border: "border-slate-200",
          dot: "bg-slate-500",
        };
    }
  }, [proposal.status]);

  const isAlreadyAccepted = proposal.status === "ACCEPTED";
  const isWithdrawn = proposal.status === "WITHDRAWN";

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP BAR NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 w-full">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs font-semibold text-[#181343] hover:text-[#047857] border-[#E8E8EA] hover:border-slate-300 hover:bg-slate-50 rounded-xl transition cursor-pointer"
          >
            Kembali ke Kelola Proposal
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {proposal.documentUrl && (
            <a
              href={proposal.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#181343] hover:text-emerald-800 bg-white hover:bg-slate-50 border border-[#E8E8EA] px-3.5 py-1.5 rounded-xl transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Dokumen Proposal</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
            <span>{statusBadge.label}</span>
          </span>
        </div>
      </div>

      {/* 2. PROPOSAL HERO BANNER */}
      <div className="bg-white rounded-2xl border border-[#E8E8EA] p-6 sm:p-7 space-y-4">
        {proposal.opportunityTitle && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="w-4 h-4 text-[#181343]" />
            <span className="font-medium">Peluang CSR:</span>
            <span className="font-semibold text-[#181343]">{proposal.opportunityTitle}</span>
          </div>
        )}

        <h1
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#181343] tracking-tight leading-snug"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {cleanTitle}
        </h1>

        {/* Clean Meta Row (Human, Non-Slop) */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Mitra:</span>
            <strong className="text-slate-900 font-semibold">{proposal.partnerName || "Mitra Pelaksana"}</strong>
            {proposal.partnerCity && <span className="text-slate-400">• {proposal.partnerCity}</span>}
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Diajukan {formatDate(proposal.createdAt)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{proposal.durationMonths ? `${proposal.durationMonths} Bulan Pelaksanaan` : "Jadwal Fleksibel"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Sasaran: {proposal.targetBeneficiaries || "Masyarakat Umum"}</span>
          </div>
        </div>
      </div>

      {/* 3. CLEAN UNDERLINE TABS (Human-Crafted, Non-Slop) */}
      <div className="border-b border-[#E8E8EA] flex items-center gap-8 text-sm">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "dossier"}
          onClick={() => setActiveTab("dossier")}
          className={`pb-3 font-semibold transition-colors relative cursor-pointer ${
            activeTab === "dossier"
              ? "text-[#181343] font-bold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Ringkasan Proposal</span>
          {activeTab === "dossier" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#181343] rounded-full" />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "documents"}
          onClick={() => setActiveTab("documents")}
          className={`pb-3 font-semibold transition-colors relative cursor-pointer flex items-center gap-2 ${
            activeTab === "documents"
              ? "text-[#181343] font-bold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Dokumen Lampiran</span>
          {activeTab === "documents" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#181343] rounded-full" />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "evaluation"}
          onClick={() => setActiveTab("evaluation")}
          className={`pb-3 font-semibold transition-colors relative cursor-pointer flex items-center gap-2 ${
            activeTab === "evaluation"
              ? "text-[#181343] font-bold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Riwayat Peninjauan</span>
          {(proposal.reviewedAt || proposal.feedback) && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          )}
          {activeTab === "evaluation" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#181343] rounded-full" />
          )}
        </button>
      </div>

      {/* 4. MAIN TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* LEFT COLUMN: PROPOSAL CONTENT DOSSIER (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: Ringkasan Proposal */}
          {activeTab === "dossier" && (
            <div className="bg-white rounded-2xl border border-[#E8E8EA] p-6 sm:p-7 space-y-5 animate-in fade-in duration-150">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#181343]">
                  Latar Belakang &amp; Metodologi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uraian pendekatan teknis pelaksanaan program CSR yang diajukan oleh mitra
                </p>
              </div>

              {overviewParagraphs.length > 0 ? (
                <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
                  {overviewParagraphs.map((para, idx) => (
                    <p
                      key={idx}
                      className={idx === 0 ? "text-slate-900 font-medium text-base" : ""}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Belum ada ringkasan naratif teknis yang disertakan pada proposal ini.
                </p>
              )}
            </div>
          )}

          {/* TAB 2: Dokumen Lampiran */}
          {activeTab === "documents" && (
            <div className="bg-white rounded-2xl border border-[#E8E8EA] p-6 sm:p-7 space-y-5 animate-in fade-in duration-150">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#181343]">
                  Dokumen Proposal Resmi &amp; Lampiran
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Berkas pendukung yang dilampirkan oleh mitra saat pengajuan proposal
                </p>
              </div>

              {proposal.documentUrl ? (() => {
                const isLocalUpload = proposal.documentUrl.startsWith("/uploads/");
                const fileName = isLocalUpload
                  ? proposal.documentUrl.split("/").pop()
                  : proposal.documentUrl;

                return (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-white text-[#181343] flex items-center justify-center shrink-0 border border-slate-200">
                        <FileText className="w-5 h-5 text-[#181343]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-[#181343] block truncate">
                          {fileName || "Dokumen_Proposal_CSR.pdf"}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{isLocalUpload ? "Berkas Sistem" : "Tautan Eksternal"}</span>
                          <span>• Terlampir saat pengajuan</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={proposal.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-[#181343] text-white text-xs font-semibold hover:bg-[#26224C] transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span>{isLocalUpload ? "Unduh Dokumen" : "Buka Tautan Dokumen"}</span>
                      {isLocalUpload ? (
                        <Download className="w-3.5 h-3.5" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                    </a>
                  </div>
                );
              })() : (
                <div className="py-12 text-center space-y-2 text-sm text-slate-500">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Tidak ada berkas dokumen tambahan yang diunggah untuk proposal ini.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Riwayat Peninjauan */}
          {activeTab === "evaluation" && (
            <div className="bg-white rounded-2xl border border-[#E8E8EA] p-6 sm:p-7 space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Riwayat Peninjauan Proposal
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Catatan evaluasi, arahan revisi, dan keputusan resmi dari tim peninjau
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                  <span>{statusBadge.label}</span>
                </span>
              </div>

              {proposal.reviewedAt || proposal.feedback ? (
                <div className="space-y-4">
                  {/* Kartu Catatan Evaluasi Resmi (Human, No Stripes) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#181343] text-white flex items-center justify-center font-bold text-xs">
                          {(proposal.reviewedByName || "Admin").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {proposal.reviewedByName || "Admin Tim CSR"}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Evaluator Internal Perusahaan
                          </span>
                        </div>
                      </div>

                      {proposal.reviewedAt && (
                        <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                          {formatDate(proposal.reviewedAt)}
                        </span>
                      )}
                    </div>

                    {proposal.feedback ? (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <span className="text-xs font-semibold text-slate-600 block">
                          Catatan &amp; Arahan untuk Mitra:
                        </span>
                        <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 leading-relaxed font-normal">
                          "{proposal.feedback}"
                        </div>
                        <span className="text-xs text-slate-400 block pt-0.5">
                          Catatan ini dapat dibaca oleh pihak mitra pada portal proposal mereka.
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Proposal ini telah diperbarui statusnya tanpa catatan tambahan.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-[#181343]">
                    Belum Ada Catatan Evaluasi Sebelumnya
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Proposal ini belum memiliki catatan tinjauan sebelumnya. Gunakan form keputusan di panel sebelah kanan untuk memberikan keputusan dan umpan balik pertama.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EXECUTIVE REVIEW & DECISION CENTER (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* CARD 1: PROFIL MITRA & USULAN ANGGARAN (Clean, Cohesive) */}
          <div className="bg-white rounded-2xl border border-[#E8E8EA] p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {proposal.partnerLogo && !logoError ? (
                  <img
                    src={proposal.partnerLogo}
                    alt={proposal.partnerName || "Logo"}
                    onError={() => setLogoError(true)}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#181343] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {partnerInitials}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Mitra Pelaksana
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {proposal.partnerName || "Mitra Pelaksana"}
                  </h4>
                  {proposal.partnerCity && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{proposal.partnerCity}</span>
                    </div>
                  )}
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Terverifikasi</span>
              </span>
            </div>

            {proposal.partnerEmail && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{proposal.partnerEmail}</span>
              </div>
            )}

            {/* Financial Stat Callout (Clean, Light, High Contrast) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs text-slate-500 font-medium block">
                Total Usulan Anggaran
              </span>
              <div className="text-2xl font-black tracking-tight text-[#181343]">
                {formatRupiah(proposal.proposedBudget)}
              </div>
              <span className="text-[11px] text-slate-500 block">
                Alokasi dana yang diajukan oleh mitra untuk program ini
              </span>
            </div>
          </div>

          {/* CARD 2: SKRINING KRITERIA PROPOSAL (No Dark Purple Glow Slop) */}
          <div className="bg-white rounded-2xl border border-[#E8E8EA] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#181343]" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Skrining Kriteria Proposal
                </h4>
              </div>

              {aiResult && aiEnabled && (
                <button
                  type="button"
                  onClick={handleRunAiScreening}
                  disabled={isScreeningAi}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isScreeningAi ? "animate-spin" : ""}`} />
                  <span>{isScreeningAi ? "Memeriksa..." : "Perbarui Skrining"}</span>
                </button>
              )}
            </div>

            {aiResult ? (
              <div className="space-y-4">
                {/* Skor & Rekomendasi */}
                <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Hasil Skrining
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                        aiResult.overallScore >= 80
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : aiResult.overallScore >= 65
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      {aiResult.recommendationLabel || aiResult.recommendation}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Skor Kelayakan
                    </span>
                    <div className="text-xl font-black text-[#181343]">
                      {aiResult.overallScore}
                      <span className="text-xs font-medium text-slate-400">/100</span>
                    </div>
                  </div>
                </div>

                {/* 4 Pilar Kriteria Penilaian */}
                {aiResult.aspectScores && (
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-slate-600 block">
                      Penilaian 4 Pilar Kriteria:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Keselarasan</span>
                          <span className="font-bold text-[#181343]">
                            {aiResult.aspectScores.strategicAlignment}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${aiResult.aspectScores.strategicAlignment}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Kewajaran Biaya</span>
                          <span className="font-bold text-[#181343]">
                            {aiResult.aspectScores.budgetFeasibility}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${aiResult.aspectScores.budgetFeasibility}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Operasional</span>
                          <span className="font-bold text-[#181343]">
                            {aiResult.aspectScores.operationalFeasibility}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${aiResult.aspectScores.operationalFeasibility}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Dampak ESG</span>
                          <span className="font-bold text-[#181343]">
                            {aiResult.aspectScores.impactSustainability}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${aiResult.aspectScores.impactSustainability}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ringkasan Kesimpulan */}
                {aiResult.executiveSummary && (
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    "{aiResult.executiveSummary}"
                  </p>
                )}

                {/* Keunggulan & Catatan Risiko */}
                <div className="space-y-2 text-xs">
                  {aiResult.keyStrengths && aiResult.keyStrengths.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                      <span className="font-bold text-emerald-800 block text-xs">
                        Poin Keunggulan:
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {aiResult.keyStrengths.map((str: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResult.potentialRisks && aiResult.potentialRisks.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                      <span className="font-bold text-amber-900 block text-xs">
                        Catatan Evaluasi:
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {aiResult.potentialRisks.map((risk: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Tombol Salin ke Catatan */}
                {aiResult.suggestedRevisionNotes && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyAiFeedback}
                    className="w-full text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50 cursor-pointer"
                    leftIcon={isCopiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {isCopiedNotes ? "Tersalin ke Form Keputusan" : "Salin Saran ke Catatan Revisi"}
                  </Button>
                )}
              </div>
            ) : !aiEnabled ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                Fitur skrining otomatis dinonaktifkan pada pengaturan sistem.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lakukan skrining otomatis untuk memeriksa kesesuaian pilar program, kewajaran anggaran, dan catatan pelaksanaan.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRunAiScreening}
                  disabled={isScreeningAi}
                  isLoading={isScreeningAi}
                  className="w-full text-xs font-bold text-[#181343] border-slate-300 hover:bg-slate-50 cursor-pointer"
                  leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-[#181343]" />}
                >
                  Jalankan Skrining Kriteria
                </Button>
              </div>
            )}
          </div>

          {/* CARD 3: FORM KEPUTUSAN PENINJAUAN */}
          <div className="bg-white rounded-2xl border border-[#E8E8EA] p-5 sm:p-6 space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#181343]">
                Keputusan Peninjauan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan hasil peninjauan kelayakan proposal ini
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <p className="font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <p className="font-medium leading-relaxed">{successMsg}</p>
              </div>
            )}

            {isAlreadyAccepted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Proposal Telah Disetujui</span>
                </div>
                <p className="text-emerald-800 leading-relaxed text-xs">
                  Proposal ini telah disetujui dan dialihkan ke tahap penyusunan nota kesepakatan kolaborasi kerja sama CSR.
                </p>
                {proposal.feedback && (
                  <div className="pt-2 border-t border-emerald-200/60">
                    <span className="font-semibold text-emerald-950 block mb-0.5">Catatan Persetujuan:</span>
                    <p className="text-emerald-900 italic">"{proposal.feedback}"</p>
                  </div>
                )}

                {onNavigateToCollaboration && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigateToCollaboration()}
                    className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Buka Halaman Kelola MoU
                  </Button>
                )}
              </div>
            ) : proposal.status === "REJECTED" ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Proposal Tidak Disetujui</span>
                </div>
                <p className="text-rose-800 leading-relaxed text-xs">
                  Proposal ini belum memenuhi kriteria inisiatif CSR yang dibutuhkan.
                </p>
                {proposal.feedback && (
                  <div className="pt-2 border-t border-rose-200/60 mt-2">
                    <span className="font-semibold text-rose-950 block mb-0.5">Alasan Keputusan:</span>
                    <p className="text-rose-900 italic">"{proposal.feedback}"</p>
                  </div>
                )}
              </div>
            ) : isWithdrawn ? (
              <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-xs italic">
                Proposal ini telah ditarik oleh pihak mitra, sehingga tidak dapat ditinjau lebih lanjut.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Pilih Keputusan <span className="text-rose-500">*</span>
                  </span>

                  {/* Clean Decision Radio List (Calm, Non-Rainbow) */}
                  <div className="space-y-1.5 text-xs">
                    {/* Option 1: ACCEPTED */}
                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        decisionStatus === "ACCEPTED"
                          ? "border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${decisionStatus === "ACCEPTED" ? "text-emerald-600" : "text-slate-400"}`} />
                        <span>Setujui Proposal</span>
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={decisionStatus === "ACCEPTED"}
                        onChange={() => setDecisionStatus("ACCEPTED")}
                        className="text-emerald-600"
                      />
                    </label>

                    {/* Option 2: UNDER_REVIEW */}
                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        decisionStatus === "UNDER_REVIEW"
                          ? "border-purple-600 bg-purple-50/40 text-purple-950 font-bold"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${decisionStatus === "UNDER_REVIEW" ? "text-purple-600" : "text-slate-400"}`} />
                        <span>Dalam Tinjauan Lanjutan</span>
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={decisionStatus === "UNDER_REVIEW"}
                        onChange={() => setDecisionStatus("UNDER_REVIEW")}
                        className="text-purple-600"
                      />
                    </label>

                    {/* Option 3: REVISION_REQUESTED */}
                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        decisionStatus === "REVISION_REQUESTED"
                          ? "border-amber-600 bg-amber-50/40 text-amber-950 font-bold"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw className={`w-4 h-4 ${decisionStatus === "REVISION_REQUESTED" ? "text-amber-600" : "text-slate-400"}`} />
                        <span>Minta Revisi Proposal</span>
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={decisionStatus === "REVISION_REQUESTED"}
                        onChange={() => setDecisionStatus("REVISION_REQUESTED")}
                        className="text-amber-600"
                      />
                    </label>

                    {/* Option 4: REJECTED */}
                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        decisionStatus === "REJECTED"
                          ? "border-rose-600 bg-rose-50/40 text-rose-950 font-bold"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className={`w-4 h-4 ${decisionStatus === "REJECTED" ? "text-rose-600" : "text-slate-400"}`} />
                        <span>Tolak Proposal</span>
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={decisionStatus === "REJECTED"}
                        onChange={() => setDecisionStatus("REJECTED")}
                        className="text-rose-600"
                      />
                    </label>
                  </div>
                </div>

                {/* Textarea Feedback */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Catatan untuk Mitra{" "}
                    {decisionStatus === "REVISION_REQUESTED" && (
                      <span className="text-rose-500 font-normal">* (Wajib diisi untuk permintaan revisi)</span>
                    )}
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      decisionStatus === "REVISION_REQUESTED"
                        ? "Tuliskan poin-poin yang perlu disesuaikan oleh mitra..."
                        : "Tuliskan catatan pertimbangan atau arahan pelaksanaan..."
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] text-slate-900 placeholder:text-slate-400 leading-relaxed"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Catatan ini akan dapat dilihat langsung oleh mitra pada dashboard mereka.
                  </span>
                </div>

                <Button
                  type="submit"
                  size="md"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  variant={decisionStatus === "REJECTED" ? "destructive-solid" : "primary"}
                  className="w-full font-bold text-xs sm:text-sm py-2.5 cursor-pointer"
                  leftIcon={
                    decisionStatus === "REVISION_REQUESTED" ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : decisionStatus === "REJECTED" ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )
                  }
                >
                  {isSubmitting
                    ? "Menyimpan Keputusan..."
                    : decisionStatus === "ACCEPTED"
                    ? "Setujui & Buat Kolaborasi"
                    : decisionStatus === "REJECTED"
                    ? "Tolak Proposal Ini"
                    : decisionStatus === "REVISION_REQUESTED"
                    ? "Kirim Permintaan Revisi"
                    : "Tandai Dalam Tinjauan"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
