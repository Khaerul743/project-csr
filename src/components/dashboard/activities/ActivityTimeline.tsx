"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ProgramActivityItem,
  ACTIVITY_STATUS_CONFIG,
  ProgramStageItem,
  STAGE_STATUS_CONFIG,
} from "./types";
import { formatDate, formatRupiah } from "../analytics/helpers";
import { AddActivityModal } from "./AddActivityModal";
import { VerifyActivityModal } from "./VerifyActivityModal";
import { PhotoLightboxModal } from "./PhotoLightboxModal";
import { AiMilestonesModal } from "./AiMilestonesModal";
import { Modal } from "@/components/ui/modal";

interface ActivityTimelineProps {
  programId: string;
  programTitle: string;
  role: "COMPANY" | "PARTNER";
  isManagement?: boolean;
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
  const [selectedActivityForVerify, setSelectedActivityForVerify] =
    useState<ProgramActivityItem | null>(null);

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

  useEffect(() => {
    if (programId) {
      fetchActivities();
      fetchStages();
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
      }
    } catch {
      // silent fallback
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

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* SPLIT-VIEW: TIMELINE TAHAPAN (35%) + JURNAL & LOG BUKTI LAPANGAN (65%)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* KOLOM KIRI (35% -> 5 Cols Desktop): TIMELINE TAHAPAN PROPOSAL             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E8EA] shadow-2xs space-y-4">
          {/* Header Timeline */}
          <div className="space-y-2 pb-3 border-b border-[#F4F4F6]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#181343] text-white flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-[#181343]">
                  Tahapan Pelaksanaan
                </h4>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAiModalOpen(true)}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
                className="text-[11px] h-7 px-2.5 rounded-lg border-slate-200 text-slate-700"
              >
                Kelola AI
              </Button>
            </div>

            <p className="text-xs text-[#787680]">
              Tahapan bersumber dari proposal yang disetujui sebagai acuan bukti lapangan.
            </p>

            {/* Progress summary & bar */}
            {stages.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#787680]">Progres Tahapan</span>
                  <span className="text-[#009E75] font-bold">
                    {completedStagesCount} dari {stages.length} Selesai ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EEEEF0] overflow-hidden">
                  <div
                    className="h-full bg-[#009E75] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filter Opsi "Semua Aktivitas" */}
          <button
            type="button"
            onClick={() => setSelectedStageFilter(null)}
            className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              selectedStageFilter === null
                ? "bg-[#181343] border-[#181343] text-white shadow-xs"
                : "bg-[#F9F9FB] border-[#E8E8EA] text-[#181343] hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Semua Aktivitas &amp; Log</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                selectedStageFilter === null
                  ? "bg-white/20 text-white"
                  : "bg-white border border-[#E8E8EA] text-[#787680]"
              }`}
            >
              {activities.length}
            </span>
          </button>

          {/* Timeline Vertikal Tahapan Proposal */}
          {isLoadingStages ? (
            <div className="p-6 text-center text-xs text-[#787680] flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin text-teal-600" />
              <span>Memuat tahapan pelaksanaan...</span>
            </div>
          ) : stages.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-dashed border-[#E8E8EA] text-center space-y-2">
              <Sparkles className="w-6 h-6 text-teal-600 mx-auto" />
              <p className="text-xs font-bold text-[#181343]">
                Belum Ada Tahapan Terstruktur
              </p>
              <p className="text-[11px] text-[#787680] leading-relaxed">
                Strukturkan metodologi proposal menjadi tahapan kegiatan dengan bantuan AI.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAiModalOpen(true)}
                className="text-xs bg-[#181343] text-white"
              >
                Generate Tahapan AI
              </Button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-3.5 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8E8EA]">
              {stages.map((st) => {
                const isSelected = selectedStageFilter === st.id;
                const isCompleted = st.status === "COMPLETED";
                const isInProgress = st.status === "IN_PROGRESS";

                return (
                  <div key={st.id} className="relative group">
                    {/* Node Dot Indicator */}
                    <div
                      className={`absolute -left-6 top-3 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
                        isCompleted
                          ? "bg-[#009E75] border-white text-white shadow-2xs"
                          : isInProgress
                          ? "bg-[#181343] border-white text-white shadow-2xs ring-2 ring-[#181343]/20"
                          : "bg-white border-[#C8C5D0] text-[#787680]"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      ) : (
                        st.orderIndex
                      )}
                    </div>

                    {/* Stage Card */}
                    <div
                      onClick={() => setSelectedStageFilter(isSelected ? null : st.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? "border-[#35B98E] bg-[#EDF9F3] ring-2 ring-[#35B98E]/25 shadow-xs"
                          : isCompleted
                          ? "border-emerald-200/80 bg-white hover:border-[#35B98E]"
                          : isInProgress
                          ? "border-amber-300 bg-white hover:border-amber-400"
                          : "border-[#E8E8EA] bg-[#F9F9FB] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] font-extrabold text-[#787680] uppercase tracking-wider block">
                            Tahap {st.orderIndex}
                          </span>
                          <h5 className="text-xs font-bold text-[#181343] leading-snug line-clamp-2">
                            {st.title}
                          </h5>
                        </div>

                        {/* Status Label Bahasa Indonesia */}
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 border ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isInProgress
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isCompleted
                            ? "Selesai"
                            : isInProgress
                            ? "Berjalan"
                            : "Belum Mulai"}
                        </span>
                      </div>

                      {/* Jadwal Rencana */}
                      {st.targetTimeline && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#787680]">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Rencana: {st.targetTimeline}</span>
                        </div>
                      )}

                      {/* Expected Evidence Tip */}
                      {st.expectedEvidence && (
                        <p className="text-[10px] text-[#787680] line-clamp-2 italic pt-1 border-t border-[#F4F4F6]">
                          Bukti: {st.expectedEvidence}
                        </p>
                      )}

                      {/* Footer: Count Bukti Terkait & Tombol Status */}
                      <div className="pt-1.5 border-t border-[#F4F4F6] flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-teal-800 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-teal-600" />
                          {st.activityCount || 0} bukti log
                        </span>

                        <div className="flex items-center gap-1">
                          {!isManagement ? (
                            <select
                              value={st.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleUpdateStageStatus(
                                  st.id,
                                  e.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED"
                                )
                              }
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-[#E8E8EA] bg-white text-[#181343] focus:outline-none"
                            >
                              <option value="PENDING">Belum Mulai</option>
                              <option value="IN_PROGRESS">Berjalan</option>
                              <option value="COMPLETED">Selesai</option>
                            </select>
                          ) : null}

                          <span
                            className={`text-[11px] font-bold ${
                              isSelected ? "text-[#009E75]" : "text-[#787680]"
                            }`}
                          >
                            {isSelected ? "Terpilih ✓" : "Pilih"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Node Laporan Umum / Belum Terhubung (jika ada) */}
              {unassignedActivitiesCount > 0 && (
                <div className="relative group">
                  <div className="absolute -left-6 top-3 w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                    ?
                  </div>
                  <div
                    onClick={() =>
                      setSelectedStageFilter(
                        selectedStageFilter === "UNASSIGNED" ? null : "UNASSIGNED"
                      )
                    }
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                      selectedStageFilter === "UNASSIGNED"
                        ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-400/20"
                        : "border-[#E8E8EA] bg-[#F9F9FB] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#181343]">
                        Laporan Umum / Belum Terkait
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {unassignedActivitiesCount} Bukti
                      </span>
                    </div>
                    <p className="text-[10px] text-[#787680]">
                      Laporan lapangan yang belum dihubungkan ke milestone tahapan tertentu.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN (65% -> 7 Cols Desktop): JURNAL & LOG BUKTI LAPANGAN          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E8EA] shadow-2xs space-y-4">
          {/* Header Jurnal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F6]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#181343]">
                  Jurnal &amp; Log Bukti Lapangan
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EDF9F3] text-[#009E75]">
                  {groupedActivities.length} Laporan
                </span>
              </div>
              <p className="text-xs text-[#787680]">
                {selectedStage
                  ? `Menampilkan bukti untuk: Tahap ${selectedStage.orderIndex} (${selectedStage.title})`
                  : selectedStageFilter === "UNASSIGNED"
                  ? "Menampilkan laporan umum yang belum terhubung ke tahapan"
                  : "Seluruh dokumentasi kegiatan dan pertanggungjawaban lapangan mitra"}
              </p>
            </div>

            {role === "PARTNER" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveStageForAdd(
                    selectedStageFilter && selectedStageFilter !== "UNASSIGNED"
                      ? selectedStageFilter
                      : undefined
                  );
                  setIsAddModalOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
                className="text-xs font-semibold shrink-0"
              >
                Tambah Laporan
              </Button>
            )}
          </div>

          {/* Activity Cards List */}
          {isLoading ? (
            <div className="p-10 text-center text-xs text-[#787680] bg-[#F9F9FB] rounded-2xl border border-[#E8E8EA] space-y-2">
              <Activity className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
              <span>Memuat data log aktivitas lapangan...</span>
            </div>
          ) : groupedActivities.length === 0 ? (
            <div className="p-8 sm:p-10 text-center bg-[#F9F9FB] rounded-2xl border border-dashed border-[#E8E8EA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E8EA] text-[#787680] flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#181343]">
                  {selectedStage
                    ? `Belum Ada Laporan untuk Tahap ${selectedStage.orderIndex}`
                    : "Belum Ada Laporan Kegiatan"}
                </h4>
                <p className="text-xs text-[#787680] max-w-sm mx-auto">
                  {role === "PARTNER"
                    ? "Mulai laporkan jalannya kegiatan lapangan dengan mengunggah narasi progres, penerima manfaat, dan foto dokumentasi."
                    : "Mitra pelaksana belum menambahkan laporan kegiatan lapangan untuk tahapan ini."}
                </p>
              </div>
              {role === "PARTNER" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveStageForAdd(
                      selectedStageFilter && selectedStageFilter !== "UNASSIGNED"
                        ? selectedStageFilter
                        : undefined
                    );
                    setIsAddModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="text-xs font-semibold"
                >
                  Unggah Bukti Lapangan
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {groupedActivities.map(({ primary: act, history }) => {
                const photos = parsePhotos(act.mediaUrls);
                const numFunds = act.fundsSpent ? parseFloat(act.fundsSpent) : 0;
                const isExpanded = expandedActivityIds.has(act.id);
                const isAuditTrailExpanded = expandedAuditTrailIds.has(act.id);

                return (
                  <div
                    key={act.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] hover:border-slate-300 shadow-2xs transition-all space-y-3"
                  >
                    {/* Header Row: Status, Tanggal, Tahapan & Submitter */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F4F4F6] text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Verifikasi Bahasa Indonesia Baku */}
                        {act.status === "VERIFIED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#EDF9F3] text-[#009E75] border border-[#35B98E]/50">
                            <CheckCircle2 className="w-3 h-3 text-[#009E75]" />
                            Terverifikasi
                          </span>
                        ) : act.status === "REVISION_REQUESTED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Perlu Perbaikan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Verifikasi
                          </span>
                        )}

                        {/* Linked Stage Badge */}
                        {act.stageTitle ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#F4F4F6] text-[#181343] text-[11px] font-bold border border-[#E8E8EA]">
                            Tahap {act.stageOrderIndex}: {act.stageTitle}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#787680] text-[11px] font-medium border border-slate-200">
                            Laporan Umum
                          </span>
                        )}

                        <span className="text-[#787680] flex items-center gap-1 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(act.activityDate)}
                        </span>
                      </div>

                      <span className="text-[11px] text-[#787680]">
                        Oleh <strong className="text-[#181343] font-bold">{act.submitterName || "Mitra Pelaksana"}</strong>
                      </span>
                    </div>

                    {/* Judul & Ringkasan Deskripsi (Maksimal 2-3 baris) */}
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-[#181343] leading-snug">
                        {act.title}
                      </h4>

                      {act.description && (
                        <div className="text-xs text-[#5F5D6B] leading-relaxed">
                          <p className={isExpanded ? "whitespace-pre-line" : "line-clamp-2 sm:line-clamp-3"}>
                            {act.description}
                          </p>
                          {act.description.length > 130 && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(act.id)}
                              className="text-xs font-bold text-[#009E75] hover:underline mt-0.5 cursor-pointer"
                            >
                              {isExpanded ? "Ciutkan deskripsi" : "Lihat selengkapnya"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stat Pills Compact */}
                    {(act.beneficiariesReached || numFunds > 0 || photos.length > 0 || act.documentUrl) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        {act.beneficiariesReached && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F9F9FB] border border-[#E8E8EA] text-[#181343]">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Penerima: <strong>{act.beneficiariesReached}</strong></span>
                          </div>
                        )}
                        {numFunds > 0 && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F9F9FB] border border-[#E8E8EA] text-[#181343]">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Dana: <strong>{formatRupiah(act.fundsSpent)}</strong></span>
                          </div>
                        )}
                        {act.documentUrl && (
                          <a
                            href={act.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F9F9FB] hover:bg-emerald-50 border border-[#E8E8EA] hover:border-emerald-300 text-[#181343] transition"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Berkas BAST</span>
                            <ExternalLink className="w-3 h-3 text-[#787680]" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Galeri Thumbnail Kecil (Uniform 56-64px) */}
                    {photos.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        {photos.slice(0, 3).map((url, idx) => {
                          const isLastSlot = idx === 2 && photos.length > 3;
                          return (
                            <div
                              key={idx}
                              onClick={() => handleOpenLightbox(photos, idx, act.title)}
                              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#E8E8EA] cursor-pointer group shadow-2xs hover:shadow-xs transition-all shrink-0"
                            >
                              <img
                                src={url}
                                alt={`Dokumentasi ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-[#181343]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 className="w-3.5 h-3.5 drop-shadow-xs" />
                              </div>

                              {isLastSlot && (
                                <div className="absolute inset-0 bg-[#181343]/85 text-white font-bold text-[11px] flex items-center justify-center">
                                  +{photos.length - 2}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Catatan Feedback CSR Admin */}
                    {act.companyFeedback && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                          <span>Catatan Evaluasi Verifikator:</span>
                          {act.verifierName && (
                            <span className="text-[11px] text-amber-800 font-normal">
                              ({act.verifierName})
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed italic pl-5">
                          "{act.companyFeedback}"
                        </p>
                      </div>
                    )}

                    {/* Indikator Riwayat Versi / Audit Trail (Requirement 7) */}
                    {history.length > 0 && (
                      <div className="pt-2 border-t border-[#F4F4F6]">
                        <button
                          type="button"
                          onClick={() => toggleAuditTrail(act.id)}
                          className="text-[11px] font-bold text-slate-500 hover:text-[#181343] flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {history.length} Riwayat Pengajuan / Versi Terdahulu
                          </span>
                          {isAuditTrailExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>

                        {isAuditTrailExpanded && (
                          <div className="mt-2 space-y-2 pl-4 border-l-2 border-slate-200">
                            {history.map((hist) => (
                              <div
                                key={hist.id}
                                className="p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-slate-700">
                                    Versi diajukan {formatDate(hist.createdAt)}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                    {hist.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#787680] line-clamp-1">
                                  {hist.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Row: Actions */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#F4F4F6] text-xs">
                      <span className="text-[11px] text-[#787680]">
                        Diunggah {formatDate(act.createdAt)}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Tombol Lihat Detail Laporan (Requirement 5) */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedActivityForDetail(act)}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                          className="text-xs h-7.5 px-3 rounded-lg border-[#E8E8EA] text-[#181343] font-bold cursor-pointer"
                        >
                          Lihat Detail Laporan
                        </Button>

                        {/* Verifikasi oleh Perusahaan */}
                        {role === "COMPANY" && !isManagement && (
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedActivityForVerify(act)}
                            leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />}
                            className="text-xs h-7.5 px-3 rounded-xl cursor-pointer font-semibold"
                          >
                            {act.status === "VERIFIED" ? "Perbarui Verifikasi" : "Verifikasi & Evaluasi"}
                          </Button>
                        )}

                        {role === "PARTNER" && act.status !== "VERIFIED" && (
                          <button
                            type="button"
                            onClick={() => handleDeleteActivity(act.id, act.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Laporan Ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                    Tahapan: Tahap {selectedActivityForDetail.stageOrderIndex} ({selectedActivityForDetail.stageTitle})
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

      {/* --- Modals Tambah, Verifikasi, Lightbox, AI --- */}
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
        onSuccess={() => {
          fetchActivities();
          fetchStages();
          if (onActivityChanged) onActivityChanged();
        }}
      />

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
