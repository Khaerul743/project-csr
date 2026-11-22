"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  FileCheck2,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Camera,
  Activity,
  Maximize2,
  Sparkles,
  Layers,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  History,
  Check,
  Eye,
  X,
  FileText,
  Lock,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ProgramActivityItem,
  ACTIVITY_STATUS_CONFIG,
  ProgramStageItem,
  STAGE_STATUS_CONFIG,
  cleanStageTitle,
} from "./types";
import { formatDate, formatRupiah } from "../analytics/helpers";
import { AddActivityModal } from "./AddActivityModal";
import { VerifyActivityModal } from "./VerifyActivityModal";
import { PhotoLightboxModal } from "./PhotoLightboxModal";
import { AiMilestonesModal } from "./AiMilestonesModal";
import { Modal } from "@/components/ui/modal";
import { DisburseFundModal } from "../finances/DisburseFundModal";
import { ProgramFinancialSummary, ProgramDisbursementItem } from "../finances/types";

interface ActivityTimelineProps {
  programId: string;
  programTitle: string;
  role: "COMPANY" | "PARTNER";
  isManagement?: boolean;
  collaborationId?: string | null;
  onOpenChat?: (collabId?: string | null) => void;
  onNavigateToFinances?: () => void;
  onActivityChanged?: () => void;
}

interface GroupedActivityItem {
  primary: ProgramActivityItem;
  history: ProgramActivityItem[];
}

export function ActivityTimeline({
  programId,
  programTitle,
  role,
  isManagement = false,
  collaborationId,
  onOpenChat,
  onNavigateToFinances,
  onActivityChanged,
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ProgramActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stages state
  const [stages, setStages] = useState<ProgramStageItem[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState(true);
  const [selectedStageFilter, setSelectedStageFilter] = useState<string | null>(null);
  const [activeStageForAdd, setActiveStageForAdd] = useState<string | undefined>(undefined);

  // Expandable description state for log cards
  const [expandedActivityIds, setExpandedActivityIds] = useState<Set<string>>(new Set());
  const [expandedAuditTrailIds, setExpandedAuditTrailIds] = useState<Set<string>>(new Set());

  // Detail Modal State
  const [selectedActivityForDetail, setSelectedActivityForDetail] =
    useState<ProgramActivityItem | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [selectedActivityForVerify, setSelectedActivityForVerify] =
    useState<ProgramActivityItem | null>(null);

  // Financial State for Tranche Prerequisite Guard
  const [financialSummary, setFinancialSummary] = useState<ProgramFinancialSummary | null>(null);
  const [disbursements, setDisbursements] = useState<ProgramDisbursementItem[]>([]);
  const [isLoadingFinances, setIsLoadingFinances] = useState(true);

  // Lightbox state
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedActivityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAuditTrail = (id: string) => {
    setExpandedAuditTrailIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/programs/${programId}/activities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        setActivities(list);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStages = async () => {
    setIsLoadingStages(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/programs/${programId}/stages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        setStages(list);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingStages(false);
    }
  };

  const fetchFinances = async () => {
    setIsLoadingFinances(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/programs/${programId}/finances`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.summary) {
          setFinancialSummary(json.data.summary);
        }
        if (Array.isArray(json.data?.disbursements)) {
          setDisbursements(json.data.disbursements);
        }
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingFinances(false);
    }
  };

  useEffect(() => {
    if (programId) {
      fetchActivities();
      fetchStages();
      fetchFinances();
    }
  }, [programId]);

  const handleOpenLightbox = (photos: string[], index: number, title: string) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setIsLightboxOpen(true);
  };

  const handleUpdateStageStatus = async (
    stageId: string,
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    if (!hasConfirmedDisbursement && (newStatus === "IN_PROGRESS" || newStatus === "COMPLETED")) {
      alert(
        "Tahapan pelaksanaan belum dapat dimulai atau diselesaikan karena dana termin awal (Termin 1) belum dicairkan oleh perusahaan ke rekening kas mitra."
      );
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/programs/${programId}/stages/${stageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchStages();
        if (onActivityChanged) onActivityChanged();
      } else {
        const errJson = await res.json();
        alert(errJson.message || "Gagal memperbarui status tahapan");
      }
    } catch {
      // silent fallback
    }
  };

  const handleContactCompany = () => {
    if (onOpenChat) {
      onOpenChat(collaborationId);
    } else {
      window.dispatchEvent(
        new CustomEvent("sipena:open-chat", {
          detail: { collaborationId: collaborationId || undefined },
        })
      );
    }
  };

  const handleNavigateToFinances = () => {
    if (onNavigateToFinances) {
      onNavigateToFinances();
    } else {
      window.dispatchEvent(
        new CustomEvent("sipena:navigate-program-tab", {
          detail: { tab: "finances", programId },
        })
      );
    }
  };

  const handleDeleteActivity = async (activityId: string, title: string) => {
    if (!confirm(`Hapus laporan aktivitas "${title}"?`)) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(
        `/api/programs/${programId}/activities/${activityId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        fetchActivities();
        fetchStages();
        if (onActivityChanged) onActivityChanged();
      } else {
        const json = await res.json();
        alert(json.message || "Gagal menghapus aktivitas");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus aktivitas");
    }
  };

  const parsePhotos = (mediaUrlsStr?: string | null): string[] => {
    if (!mediaUrlsStr) return [];
    try {
      const parsed = JSON.parse(mediaUrlsStr);
      if (Array.isArray(parsed)) return parsed;
      return [mediaUrlsStr];
    } catch {
      if (mediaUrlsStr.startsWith("http") || mediaUrlsStr.startsWith("/")) {
        return [mediaUrlsStr];
      }
      return [];
    }
  };

  const completedStagesCount = stages.filter((s) => s.status === "COMPLETED").length;
  const progressPercent =
    stages.length > 0 ? Math.round((completedStagesCount / stages.length) * 100) : 0;

  // Hitung jumlah aktivitas umum / belum terhubung ke stage
  const unassignedActivitiesCount = useMemo(() => {
    return activities.filter((act) => !act.stageId).length;
  }, [activities]);

  // Filter aktivitas berdasarkan stage terpilih
  const filteredActivities = useMemo(() => {
    if (!selectedStageFilter) return activities;
    if (selectedStageFilter === "UNASSIGNED") {
      return activities.filter((act) => !act.stageId);
    }
    return activities.filter((act) => act.stageId === selectedStageFilter);
  }, [activities, selectedStageFilter]);

  // Deduplikasi & Pengelompokan Riwayat Pengajuan (Requirement 7)
  // Menampilkan 1 card utama dengan status terkini dan melampirkan riwayat pengajuan/audit trail
  const groupedActivities: GroupedActivityItem[] = useMemo(() => {
    const groups: { [key: string]: ProgramActivityItem[] } = {};

    filteredActivities.forEach((act) => {
      // Normalisasi kunci kesamaan: judul yang mirip/sama dan tanggal yang sama
      const dateKey = act.activityDate ? act.activityDate.substring(0, 10) : "nodate";
      const normTitle = act.title.trim().toLowerCase().replace(/\s+/g, " ");
      const groupKey = `${normTitle}_${dateKey}`;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(act);
    });

    return Object.values(groups).map((list) => {
      // Urutkan: dahulukan VERIFIED, lalu created_at terbaru
      const sorted = [...list].sort((a, b) => {
        if (a.status === "VERIFIED" && b.status !== "VERIFIED") return -1;
        if (b.status === "VERIFIED" && a.status !== "VERIFIED") return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return {
        primary: sorted[0],
        history: sorted.slice(1),
      };
    });
  }, [filteredActivities]);

  const selectedStage = stages.find((s) => s.id === selectedStageFilter);

  // Prasyarat Pencairan Termin Awal
  const hasConfirmedDisbursement =
    !isLoadingFinances && (financialSummary?.totalConfirmedReceived || 0) > 0;
  const hasPendingDisbursement =
    !isLoadingFinances && (financialSummary?.totalPendingConfirmation || 0) > 0;
  const nextTrancheNumber = disbursements.length + 1;
  const remainingBudgetToDisburse = financialSummary
    ? Math.max(0, financialSummary.agreedBudget - financialSummary.totalDisbursed)
    : 0;
  const remainingPartnerBalance = financialSummary?.remainingPartnerBalance || 0;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TAMPILAN LAPORAN MILESTONE: ROADMAP HORIZONTAL + KARTU LAPANGAN LEGA      */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* 1. Header Bagian Milestone & Tombol Aksi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#181343]">
                Tahapan Pelaksanaan &amp; Log Bukti Lapangan
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
                {activities.length} Laporan Tercatat
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {selectedStage
                ? `Menampilkan laporan bukti khusus untuk: Tahap ${selectedStage.orderIndex} (${cleanStageTitle(selectedStage.title)})`
                : selectedStageFilter === "UNASSIGNED"
                ? "Menampilkan laporan umum yang belum terhubung ke tahapan milestone"
                : "Dokumentasi tahapan kerja, serapan dana, dan bukti pertanggungjawaban lapangan mitra."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
              leftIcon={<Layers className="w-3.5 h-3.5 text-slate-500" />}
              className="text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Atur Tahapan
            </Button>

            {role === "PARTNER" && (
              <Button
                variant={hasConfirmedDisbursement ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  if (!hasConfirmedDisbursement) {
                    alert(
                      hasPendingDisbursement
                        ? "Penyaluran dana termin dari perusahaan sedang menunggu konfirmasi penerimaan rekening di kas mitra. Buka tab Realisasi Dana & Keuangan untuk mengonfirmasi penerimaan dana terlebih dahulu."
                        : "Pelaksanaan tahapan dan pelaporan kegiatan lapangan belum dapat dimulai karena perusahaan belum mencairkan dana termin awal (Termin 1). Pastikan dana termin awal telah disalurkan dan dikonfirmasi."
                    );
                    return;
                  }
                  setActiveStageForAdd(
                    selectedStageFilter && selectedStageFilter !== "UNASSIGNED"
                      ? selectedStageFilter
                      : undefined
                  );
                  setIsAddModalOpen(true);
                }}
                disabled={!hasConfirmedDisbursement}
                leftIcon={
                  hasConfirmedDisbursement ? (
                    <Plus className="w-4 h-4" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )
                }
                className={`text-xs font-semibold rounded-xl shadow-xs transition-all ${
                  hasConfirmedDisbursement
                    ? "bg-[#181343] hover:bg-[#25205c] text-white cursor-pointer"
                    : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-80"
                }`}
                title={
                  !hasConfirmedDisbursement
                    ? "Menunggu pencairan dana termin awal dari perusahaan"
                    : "Tambah Laporan Bukti Lapangan"
                }
              >
                Tambah Laporan
              </Button>
            )}
          </div>
        </div>

        {/* Notifikasi Status Pencairan Termin Awal (Kontras Kuning & Proporsional) */}
        {!isLoadingFinances && !hasConfirmedDisbursement && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-4.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-amber-950">
                    {hasPendingDisbursement
                      ? "Dana Termin Menunggu Konfirmasi Rekening Kas Mitra"
                      : "Menunggu Pencairan Termin 1 dari Perusahaan"}
                  </h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                    Prasyarat Tahapan
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  {hasPendingDisbursement
                    ? role === "PARTNER"
                      ? "Pencairan dana telah diproses oleh perusahaan. Konfirmasi penerimaan di tab Keuangan agar kas operasional aktif."
                      : "Pencairan dana telah dikirimkan ke mitra dan sedang menunggu konfirmasi penerimaan rekening."
                    : role === "PARTNER"
                    ? "Pelaporan kegiatan lapangan akan aktif setelah Termin 1 disalurkan oleh perusahaan ke rekening kas program."
                    : "Salurkan dana termin awal (Termin 1) agar mitra pelaksana dapat memulai kegiatan lapangan."}
                </p>
              </div>
            </div>

            {hasPendingDisbursement ? (
              role === "COMPANY" && !isManagement ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleContactCompany}
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  className="bg-[#181343] hover:bg-[#25205c] text-white rounded-xl text-xs font-bold h-9 px-4 shrink-0 whitespace-nowrap cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  Hubungi Mitra
                </Button>
              ) : role === "PARTNER" ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleNavigateToFinances}
                  leftIcon={<Wallet className="w-3.5 h-3.5" />}
                  className="bg-[#181343] hover:bg-[#25205c] text-white rounded-xl text-xs font-bold h-9 px-4 shrink-0 whitespace-nowrap cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  Konfirmasi Realisasi Dana
                </Button>
              ) : (
                <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-lg border border-amber-300/80 shrink-0 self-start sm:self-auto">
                  Menunggu Konfirmasi Rekening
                </span>
              )
            ) : role === "COMPANY" && !isManagement ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsDisburseModalOpen(true)}
                leftIcon={<Coins className="w-4 h-4" />}
                className="bg-[#181343] hover:bg-[#25205c] text-white rounded-xl text-xs font-bold h-9 px-4 shrink-0 whitespace-nowrap cursor-pointer shadow-xs self-start sm:self-auto"
              >
                Salurkan Termin 1
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleContactCompany}
                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                className="bg-[#181343] hover:bg-[#25205c] text-white rounded-xl text-xs font-bold h-9 px-4 shrink-0 whitespace-nowrap cursor-pointer shadow-xs self-start sm:self-auto"
              >
                Hubungi Perusahaan
              </Button>
            )}
          </div>
        )}

        {/* 2. Bar Filter & Ringkasan Progres Milestone (Kompak Dropdown) */}
        {stages.length > 0 && (
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            {/* Sisi Kiri: Progres Pelaksanaan */}
            <div className="flex items-center gap-3 text-xs flex-wrap sm:flex-nowrap">
              <span className="text-slate-500 font-medium whitespace-nowrap">
                Progres Pelaksanaan:
              </span>
              <span className="font-bold text-[#181343] tabular-nums whitespace-nowrap">
                {completedStagesCount} dari {stages.length} Tahap Selesai ({progressPercent}%)
              </span>
              <div className="w-24 sm:w-36 bg-slate-100 rounded-full h-1.5 overflow-hidden shrink-0">
                <div
                  className="bg-[#181343] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Sisi Kanan: Filter Dropdown Tahapan */}
            <div className="flex items-center gap-2.5 self-start md:self-auto w-full md:w-auto">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                Filter Tahapan:
              </span>
              <div className="relative flex-1 md:w-72">
                <select
                  value={selectedStageFilter || "ALL"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "ALL") setSelectedStageFilter(null);
                    else setSelectedStageFilter(val);
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#181343] focus:border-[#181343] cursor-pointer shadow-2xs transition appearance-none"
                >
                  <option value="ALL">
                    Semua Tahap ({activities.length} Laporan)
                  </option>
                  {stages.map((st) => (
                    <option key={st.id} value={st.id}>
                      Tahap {st.orderIndex}: {cleanStageTitle(st.title)} ({st.activityCount || 0} Laporan)
                    </option>
                  ))}
                  {unassignedActivitiesCount > 0 && (
                    <option value="UNASSIGNED">
                      Laporan Umum ({unassignedActivitiesCount} Laporan)
                    </option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* 3. Daftar Laporan Milestone Lapangan (Full Width & Bernafas) */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200/80 space-y-2.5">
              <Activity className="w-5 h-5 animate-spin mx-auto text-[#181343]" />
              <span>Memuat data log aktivitas lapangan...</span>
            </div>
          ) : groupedActivities.length === 0 ? (
            <div className="p-10 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6 text-slate-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-[#181343]">
                  {selectedStage
                    ? `Belum Ada Laporan untuk Tahap ${selectedStage.orderIndex} (${cleanStageTitle(selectedStage.title)})`
                    : "Belum Ada Laporan Kegiatan"}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {!hasConfirmedDisbursement
                    ? "Dokumentasi kegiatan akan aktif setelah dana termin awal (Termin 1) disalurkan."
                    : role === "PARTNER"
                    ? "Mulai laporkan jalannya kegiatan lapangan dengan mengunggah narasi progres, target penerima manfaat, dan foto dokumentasi."
                    : "Mitra pelaksana belum menambahkan laporan kegiatan lapangan untuk tahapan ini."}
                </p>
              </div>
              {role === "PARTNER" && (
                <Button
                  variant={hasConfirmedDisbursement ? "primary" : "outline"}
                  size="sm"
                  disabled={!hasConfirmedDisbursement}
                  onClick={() => {
                    if (!hasConfirmedDisbursement) return;
                    setActiveStageForAdd(
                      selectedStageFilter && selectedStageFilter !== "UNASSIGNED"
                        ? selectedStageFilter
                        : undefined
                    );
                    setIsAddModalOpen(true);
                  }}
                  leftIcon={
                    hasConfirmedDisbursement ? (
                      <Plus className="w-4 h-4" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )
                  }
                  className={`text-xs font-semibold rounded-xl px-4 py-2 shadow-xs transition-all ${
                    hasConfirmedDisbursement
                      ? "bg-[#181343] hover:bg-[#25205c] text-white cursor-pointer"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80"
                  }`}
                >
                  {hasConfirmedDisbursement ? "Unggah Bukti Lapangan" : "Menunggu Pencairan Dana"}
                </Button>
              )}
            </div>
          ) : (
            groupedActivities.map(({ primary: act, history }) => {
              const photos = parsePhotos(act.mediaUrls);
              const numFunds = act.fundsSpent ? parseFloat(act.fundsSpent) : 0;
              const isExpanded = expandedActivityIds.has(act.id);
              const isAuditTrailExpanded = expandedAuditTrailIds.has(act.id);

              return (
                <div
                  key={act.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all space-y-4"
                >
                  {/* Baris Atas: Status Verifikasi, Metadata Tanggal & Aksi Cepat */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Verifikasi */}
                      {act.status === "VERIFIED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Terverifikasi
                        </span>
                      ) : act.status === "REVISION_REQUESTED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Perlu Perbaikan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Menunggu Verifikasi
                        </span>
                      )}

                      {/* Tag Tahap Singkat (Tanpa Duplikasi Judul) */}
                      {act.stageOrderIndex ? (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80">
                          Tahap {act.stageOrderIndex}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                          Laporan Umum
                        </span>
                      )}

                      <span className="text-slate-500 flex items-center gap-1.5 text-xs font-medium bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(act.activityDate)}
                      </span>

                      <span className="text-slate-300 hidden md:inline">•</span>

                      <span className="text-xs text-slate-500">
                        Oleh <strong className="text-slate-800 font-semibold">{act.submitterName || "Mitra Pelaksana"}</strong>
                        <span className="text-slate-400 text-[11px] ml-1">(Diunggah {formatDate(act.createdAt)})</span>
                      </span>
                    </div>

                    {/* Aksi Kanan */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedActivityForDetail(act)}
                        leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                        className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200 rounded-xl px-3.5 py-2 cursor-pointer shadow-2xs"
                      >
                        Lihat Detail
                      </Button>

                      {role === "COMPANY" && !isManagement && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedActivityForVerify(act)}
                          leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-white" />}
                          className="text-xs font-bold bg-[#181343] hover:bg-indigo-950 text-white rounded-xl px-4 py-2 cursor-pointer shadow-2xs"
                        >
                          {act.status === "VERIFIED" ? "Perbarui Verifikasi" : "Verifikasi & Evaluasi"}
                        </Button>
                      )}

                      {role === "PARTNER" && act.status !== "VERIFIED" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteActivity(act.id, act.title)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Laporan Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Isi Konten Laporan: Full-Width Narasi */}
                  <div className="space-y-2">
                    <h4 className="text-base sm:text-lg font-extrabold text-[#181343] leading-snug">
                      {cleanStageTitle(act.title) || act.title}
                    </h4>

                    {act.description && (
                      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <p className={isExpanded ? "whitespace-pre-line" : "line-clamp-2 sm:line-clamp-3"}>
                          {act.description}
                        </p>
                        {act.description.length > 140 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(act.id)}
                            className="text-xs font-bold text-[#009E75] hover:underline mt-1 cursor-pointer inline-flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                <span>Ciutkan deskripsi</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Lihat selengkapnya</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Galeri Dokumentasi Foto (Opsi A: Horizontal, Proporsional, Lebih Jelas) */}
                  {photos.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-slate-400" />
                          <span>Dokumentasi Kegiatan ({photos.length} Foto)</span>
                        </span>
                        <span className="text-[11px] text-slate-400">Klik foto untuk memperbesar</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {photos.slice(0, 4).map((url, idx) => {
                          const isLastSlot = idx === 3 && photos.length > 4;
                          return (
                            <div
                              key={idx}
                              onClick={() => handleOpenLightbox(photos, idx, act.title)}
                              className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                            >
                              <img
                                src={url}
                                alt={`Dokumentasi ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                <span className="text-white text-[11px] font-medium flex items-center gap-1">
                                  <Maximize2 className="w-3.5 h-3.5 drop-shadow-xs" />
                                  <span>Perbesar</span>
                                </span>
                              </div>

                              {isLastSlot && (
                                <div className="absolute inset-0 bg-[#181343]/80 group-hover:bg-[#181343]/70 transition-colors flex flex-col items-center justify-center text-white">
                                  <span className="text-base font-extrabold">+{photos.length - 3} Foto</span>
                                  <span className="text-[10px] text-slate-300">Lihat Semua</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Catatan Feedback CSR Admin jika ada */}
                  {act.companyFeedback && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                        <span>Catatan Evaluasi Verifikator:</span>
                        {act.verifierName && (
                          <span className="text-[11px] text-amber-800 font-normal">
                            ({act.verifierName})
                          </span>
                        )}
                      </div>
                      <p className="text-amber-900 leading-relaxed italic pl-5">
                        "{act.companyFeedback}"
                      </p>
                    </div>
                  )}

                                {/* Baris Parameter & Micro-Stats (Bottom Bar: Rapi, Terstruktur & Terpadu) */}
                                {(act.beneficiariesReached || numFunds > 0 || act.documentUrl) && (
                                  <div className="pt-3 border-t border-slate-100">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                                      {act.beneficiariesReached && (
                                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                                          <Users className="w-4 h-4 text-slate-500 shrink-0" />
                                          <span>Penerima: <strong className="text-[#181343] font-bold">{act.beneficiariesReached}</strong></span>
                                        </div>
                                      )}
                                      {numFunds > 0 && (
                                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                                          <Wallet className="w-4 h-4 text-slate-500 shrink-0" />
                                          <span>Dana Termin: <strong className="text-[#181343] font-bold">{formatRupiah(act.fundsSpent)}</strong></span>
                                        </div>
                                      )}
                                      {act.documentUrl && (
                                        <a
                                          href={act.documentUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 hover:text-[#181343] transition-colors sm:ml-auto"
                                        >
                                          <FileCheck2 className="w-4 h-4 text-slate-500 shrink-0" />
                                          <span className="font-bold">Unduh Berkas BAST</span>
                                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Indikator Riwayat Versi / Audit Trail */}
                                {history.length > 0 && (
                                  <div className="pt-2 border-t border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => toggleAuditTrail(act.id)}
                                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                      <History className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{history.length} Riwayat Pengajuan / Versi Terdahulu</span>
                                      {isAuditTrailExpanded ? (
                                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                      ) : (
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                      )}
                                    </button>

                      {isAuditTrailExpanded && (
                        <div className="mt-2.5 space-y-2 pl-4 border-l-2 border-slate-200">
                          {history.map((hist) => (
                            <div
                              key={hist.id}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-700">
                                  Versi diajukan {formatDate(hist.createdAt)}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                                  {hist.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {hist.description}
                              </p>
                            </div>
                          ))}
                                          </div>
                      )}
                    </div>
                  )}
                </div>
                            );
                          })
          )}
                        </div>
                      </div>

      {/* ========================================================================= */}
                    {/* MODAL: DETAIL LENGKAP LAPORAN (Requirement 5)                             */}
                    {/* ========================================================================= */}
                    {selectedActivityForDetail && (
                      <Modal
                        isOpen={Boolean(selectedActivityForDetail)}
                        onClose={() => setSelectedActivityForDetail(null)}
                        title="Detail Laporan Kegiatan Lapangan"
                        description={`Dokumentasi pelaksanaan untuk: ${selectedActivityForDetail.title}`}
                        maxWidth="lg"
                      >
                        <div className="space-y-5 py-2">
                          {/* Header info */}
                          <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#181343]">
                                {selectedActivityForDetail.title}
                              </span>

                              {selectedActivityForDetail.status === "VERIFIED" ? (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#EDF9F3] text-[#009E75] border border-[#35B98E]">
                                  Terverifikasi
                                </span>
                              ) : selectedActivityForDetail.status === "REVISION_REQUESTED" ? (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                  Perlu Perbaikan
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                  Menunggu Verifikasi
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#787680]">
                              <span>Tanggal: {formatDate(selectedActivityForDetail.activityDate)}</span>
                              {selectedActivityForDetail.location && (
                                <span>Lokasi: {selectedActivityForDetail.location}</span>
                              )}
                              <span>Pelapor: {selectedActivityForDetail.submitterName || "Mitra"}</span>
                              {selectedActivityForDetail.stageTitle && (
                                <span>
                                  Tahapan: Tahap {selectedActivityForDetail.stageOrderIndex} ({cleanStageTitle(selectedActivityForDetail.stageTitle)})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Narasi Penuh */}
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-[#181343] block">
                              Deskripsi Lengkap Kegiatan:
                            </span>
                            <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed whitespace-pre-line p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
                              {selectedActivityForDetail.description}
                            </p>
                          </div>

                          {/* Capaian & Anggaran */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-xs">
                              <span className="text-[11px] font-semibold text-[#787680] block">
                                Penerima Manfaat:
                              </span>
                              <span className="font-bold text-[#181343] text-sm mt-0.5 block">
                                {selectedActivityForDetail.beneficiariesReached || "-"}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-xs">
                              <span className="text-[11px] font-semibold text-[#787680] block">
                                Realisasi Dana:
                              </span>
                              <span className="font-bold text-[#009E75] text-sm mt-0.5 block">
                                {formatRupiah(selectedActivityForDetail.fundsSpent)}
                              </span>
                            </div>
                          </div>

                          {/* Galeri Lengkap */}
                          {parsePhotos(selectedActivityForDetail.mediaUrls).length > 0 && (
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-[#181343] block">
                                Dokumentasi Foto ({parsePhotos(selectedActivityForDetail.mediaUrls).length} Foto):
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {parsePhotos(selectedActivityForDetail.mediaUrls).map((url, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() =>
                                      handleOpenLightbox(
                                        parsePhotos(selectedActivityForDetail.mediaUrls),
                                        idx,
                                        selectedActivityForDetail.title
                                      )
                                    }
                                    className="relative h-24 rounded-xl overflow-hidden border border-[#E8E8EA] cursor-pointer group shadow-2xs hover:shadow-xs transition"
                                  >
                                    <img
                                      src={url}
                                      alt={`Dokumentasi ${idx + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                    />
                                    <div className="absolute inset-0 bg-[#181343]/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                      <Maximize2 className="w-4 h-4" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Berkas BAST */}
                          {selectedActivityForDetail.documentUrl && (
                            <div className="p-3 rounded-xl bg-[#EDF9F3] border border-[#35B98E]/40 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                                <span>Lampiran Dokumen BAST / Legalitas Terlampir</span>
                              </div>
                              <a
                                href={selectedActivityForDetail.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded-lg bg-white border border-[#35B98E] text-emerald-700 font-bold hover:bg-emerald-50 transition flex items-center gap-1.5"
                              >
                                <span>Buka Berkas</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}

                          {/* Catatan Feedback */}
                          {selectedActivityForDetail.companyFeedback && (
                            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                              <span className="font-bold text-amber-900 block">
                                Catatan Evaluasi Verifikator ({selectedActivityForDetail.verifierName || "CSR Admin"}):
                              </span>
                              <p className="text-slate-700 italic">
                                "{selectedActivityForDetail.companyFeedback}"
                              </p>
                            </div>
                          )}

                          {/* Close Button */}
                          <div className="pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="md"
                              onClick={() => setSelectedActivityForDetail(null)}
                              className="w-full font-bold"
                            >
                              Tutup Detail
                            </Button>
                          </div>
                        </div>
                      </Modal>
                    )}

                    {/* --- Modals Tambah, Verifikasi, Lightbox, AI, Penyaluran --- */}
                    <AddActivityModal
                      isOpen={isAddModalOpen}
                      onClose={() => {
                        setIsAddModalOpen(false);
                        setActiveStageForAdd(undefined);
                      }}
                      programId={programId}
                      programTitle={programTitle}
                      stages={stages}
                      defaultStageId={activeStageForAdd}
                      hasConfirmedDisbursement={hasConfirmedDisbursement}
                      remainingPartnerBalance={remainingPartnerBalance}
                      onSuccess={() => {
                        fetchActivities();
                        fetchStages();
                        fetchFinances();
                        if (onActivityChanged) onActivityChanged();
                      }}
                    />

                    {role === "COMPANY" && (
                      <DisburseFundModal
                        isOpen={isDisburseModalOpen}
                        onClose={() => setIsDisburseModalOpen(false)}
                        programId={programId}
                        nextTrancheNumber={nextTrancheNumber}
                        remainingBudget={remainingBudgetToDisburse}
                        onSuccess={() => {
                          fetchFinances();
                          fetchActivities();
                          fetchStages();
                          if (onActivityChanged) onActivityChanged();
                        }}
                      />
                    )}

                    <VerifyActivityModal
                      isOpen={Boolean(selectedActivityForVerify)}
                      activity={selectedActivityForVerify}
                      onClose={() => setSelectedActivityForVerify(null)}
                      onSuccess={() => {
                        fetchActivities();
                        fetchStages();
                        if (onActivityChanged) onActivityChanged();
                      }}
                    />

                    <PhotoLightboxModal
                      isOpen={isLightboxOpen}
                      onClose={() => setIsLightboxOpen(false)}
                      photos={lightboxPhotos}
                      initialIndex={lightboxIndex}
                      title={lightboxTitle}
                    />

                    <AiMilestonesModal
                      isOpen={isAiModalOpen}
                      onClose={() => setIsAiModalOpen(false)}
                      programId={programId}
                      programTitle={programTitle}
                      onSuccess={() => {
                        fetchStages();
                        if (onActivityChanged) onActivityChanged();
                      }}
                    />
                  </div>
                  );
}
