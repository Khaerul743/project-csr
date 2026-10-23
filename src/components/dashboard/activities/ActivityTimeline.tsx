"use client";

import React, { useState, useEffect } from "react";
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
  Image as ImageIcon,
  Camera,
  Activity,
  Maximize2,
  Sparkles,
  Layers,
  ChevronRight,
  Clock,
  Filter,
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

interface ActivityTimelineProps {
  programId: string;
  programTitle: string;
  role: "COMPANY" | "PARTNER";
  onActivityChanged?: () => void;
}

export function ActivityTimeline({
  programId,
  programTitle,
  role,
  onActivityChanged,
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ProgramActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stages state
  const [stages, setStages] = useState<ProgramStageItem[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState(true);
  const [selectedStageFilter, setSelectedStageFilter] = useState<string | null>(null);
  const [activeStageForAdd, setActiveStageForAdd] = useState<string | undefined>(undefined);

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

  const filteredActivities = selectedStageFilter
    ? selectedStageFilter === "UNASSIGNED"
      ? activities.filter((act) => !act.stageId)
      : activities.filter((act) => act.stageId === selectedStageFilter)
    : activities;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. SEKSI TAHAPAN & MILESTONE TERSTRUKTUR DENGAN AI                        */}
      {/* ========================================================================= */}
      {isLoadingStages ? (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-400 flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 animate-spin text-teal-600" />
          Memuat tahapan pelaksanaan kegiatan...
        </div>
      ) : stages.length === 0 ? (
        /* Standout Callout Banner when no stages exist yet */
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-teal-500/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                LangChain AI Proposal Extractor (gpt-4o-mini)
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Strukturkan Rencana Lapangan dari Proposal Mitra
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Belum ada tahapan terstruktur. Gunakan AI untuk mengekstrak metodologi & linimasa proposal menjadi tahapan kegiatan berurutan lengkap dengan rekomendasi bukti foto yang harus dikumpulkan mitra.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAiModalOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-linear-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all shrink-0"
            >
              Generate Tahapan dengan AI
            </Button>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      ) : (
        /* Structured Stages Milestones Tracker Bar */
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          {/* Tracker Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Tahapan & Milestone Pelaksanaan Lapangan
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {completedStagesCount} dari {stages.length} Selesai ({progressPercent}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-9">
                Tahapan terstruktur diekstrak dari rencana kerja proposal untuk memastikan bukti kegiatan terkumpul lengkap.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto pl-9 sm:pl-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAiModalOpen(true)}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
                className="text-xs border-slate-200 hover:bg-slate-50 font-medium"
              >
                Kelola / Ekstrak AI
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-teal-500 via-teal-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stages Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {stages.map((st) => {
              const statusCfg = STAGE_STATUS_CONFIG[st.status] || {
                label: st.status,
                variant: "slate",
              };
              const isSelected = selectedStageFilter === st.id;

              return (
                <div
                  key={st.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "border-teal-500 bg-teal-50/30 ring-2 ring-teal-500/20 shadow-xs"
                      : st.status === "COMPLETED"
                      ? "border-emerald-200 bg-emerald-50/20"
                      : st.status === "IN_PROGRESS"
                      ? "border-indigo-200 bg-indigo-50/20"
                      : "border-slate-200/90 bg-slate-50/40 hover:bg-white"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Index + Status Badge */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                        {st.orderIndex}
                      </span>

                      {/* Status Dropdown/Selector */}
                      <select
                        value={st.status}
                        onChange={(e) =>
                          handleUpdateStageStatus(
                            st.id,
                            e.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED"
                          )
                        }
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-hidden"
                      >
                        <option value="PENDING">Belum Dimulai</option>
                        <option value="IN_PROGRESS">Sedang Berjalan</option>
                        <option value="COMPLETED">Tahap Selesai</option>
                      </select>
                    </div>

                    {/* Title */}
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {st.title}
                    </h5>

                    {/* Timeline */}
                    {st.targetTimeline && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{st.targetTimeline}</span>
                      </div>
                    )}

                    {/* Expected Evidence Tip */}
                    {st.expectedEvidence && (
                      <div className="p-2 rounded-xl bg-white/90 border border-slate-100 text-[10px] text-slate-600 space-y-0.5">
                        <span className="font-bold text-teal-700 block">Panduan Bukti:</span>
                        <p className="line-clamp-2 leading-relaxed">{st.expectedEvidence}</p>
                      </div>
                    )}
                  </div>

                  {/* Stage Bottom Row: Activity Count & Filter Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500">
                      {st.activityCount || 0} Bukti
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setSelectedStageFilter((prev) =>
                            prev === st.id ? null : st.id
                          )
                        }
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                          isSelected
                            ? "bg-teal-600 text-white"
                            : "text-teal-700 hover:bg-teal-100/60"
                        }`}
                      >
                        {isSelected ? "Semua Log" : "Filter"}
                      </button>

                      {role === "PARTNER" && (
                        <button
                          onClick={() => {
                            setActiveStageForAdd(st.id);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1 rounded-md text-teal-600 hover:bg-teal-50"
                          title="Tambah bukti untuk tahap ini"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HEADER DAFTAR AKTIVITAS & FILTER                                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">
              Jurnal & Log Bukti Lapangan
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold border border-teal-200/60">
              {filteredActivities.length} {selectedStageFilter ? "Ditampilkan" : "Kegiatan"}
            </span>
            {selectedStageFilter && (
              <button
                onClick={() => setSelectedStageFilter(null)}
                className="text-[11px] text-teal-600 hover:underline font-semibold"
              >
                (Tampilkan Semua)
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi berkala, foto progres riil, dan verifikasi pelaksanaan kegiatan lapangan
          </p>
        </div>

        {role === "PARTNER" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setActiveStageForAdd(undefined);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs shrink-0 shadow-xs"
          >
            Tambah Laporan Kegiatan
          </Button>
        )}
      </div>

      {/* Filter Tabs if stages exist */}
      {stages.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 pr-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter Tahap:
          </span>
          <button
            onClick={() => setSelectedStageFilter(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedStageFilter === null
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({activities.length})
          </button>
          {stages.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStageFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedStageFilter === st.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Tahap {st.orderIndex}</span>
              <span className="opacity-75 text-[10px]">({st.activityCount || 0})</span>
            </button>
          ))}
          <button
            onClick={() => setSelectedStageFilter("UNASSIGNED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedStageFilter === "UNASSIGNED"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Lainnya / Umum
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACTIVITIES TIMELINE FEED                                               */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="p-10 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl">
          <Activity className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
          Memuat data log aktivitas lapangan...
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-50/50 rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              Belum Ada Laporan Aktivitas Lapangan
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {role === "PARTNER"
                ? "Mulai laporkan jalannya kegiatan lapangan dengan mengunggah narasi progres, jumlah warga terjangkau, dan foto dokumentasi."
                : "Mitra pelaksana belum menambahkan laporan kegiatan lapangan untuk program ini."}
            </p>
          </div>
          {role === "PARTNER" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveStageForAdd(selectedStageFilter && selectedStageFilter !== "UNASSIGNED" ? selectedStageFilter : undefined);
                setIsAddModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs mt-2"
            >
              Unggah Laporan Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredActivities.map((act) => {
            const statusConfig = ACTIVITY_STATUS_CONFIG[act.status] || {
              label: act.status,
              variant: "slate" as const,
            };
            const photos = parsePhotos(act.mediaUrls);
            const numFunds = act.fundsSpent ? parseFloat(act.fundsSpent) : 0;

            return (
              <div key={act.id} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                    act.status === "VERIFIED"
                      ? "bg-emerald-600 text-white"
                      : act.status === "REVISION_REQUESTED"
                      ? "bg-rose-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Activity Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4">
                  {/* Card Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusConfig.variant} size="sm" hasDot>
                        {statusConfig.label}
                      </Badge>

                      {/* Stage Badge if assigned */}
                      {act.stageTitle && (
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200/60 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-teal-600" />
                          Tahap {act.stageOrderIndex || ""}: {act.stageTitle}
                        </span>
                      )}

                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {formatDate(act.activityDate)}
                      </span>

                      {act.location && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {act.location}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        Oleh: <strong className="text-slate-700">{act.submitterName || "Mitra Lapangan"}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                      {act.title}
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  {/* Quick Metrics Bar */}
                  {(act.beneficiariesReached || numFunds > 0) && (
                    <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      {act.beneficiariesReached && (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Users className="w-3.5 h-3.5 text-teal-600" />
                          <span>Penerima Manfaat Sesi Ini: <strong>{act.beneficiariesReached}</strong></span>
                        </div>
                      )}
                      {numFunds > 0 && (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dana Terpakai: <strong className="text-emerald-700">{formatRupiah(act.fundsSpent)}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Photo Gallery Grid */}
                  {photos.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Galeri Bukti Foto ({photos.length} Foto):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {photos.slice(0, 4).map((url, idx) => {
                          const isLastSlot = idx === 3 && photos.length > 4;
                          return (
                            <div
                              key={idx}
                              onClick={() => handleOpenLightbox(photos, idx, act.title)}
                              className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group shadow-2xs hover:shadow-md transition-all"
                            >
                              <img
                                src={url}
                                alt={`Dokumentasi ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 className="w-4 h-4 drop-shadow-md" />
                              </div>

                              {isLastSlot && (
                                <div className="absolute inset-0 bg-slate-900/70 text-white font-extrabold text-xs flex items-center justify-center backdrop-blur-2xs">
                                  +{photos.length - 3} Foto
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Document Attachment Link */}
                  {act.documentUrl && (
                    <div className="pt-1">
                      <a
                        href={act.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:border-emerald-300 transition"
                      >
                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        <span>Unduh / Buka Berkas Berita Acara (BAST)</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}

                  {/* Company Feedback Box */}
                  {act.companyFeedback && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                        <span>Catatan Evaluasi Perusahaan Sponsor</span>
                        {act.verifierName && (
                          <span className="text-[10px] text-amber-700 font-normal">
                            (oleh {act.verifierName})
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-5 italic">
                        "{act.companyFeedback}"
                      </p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400">
                      Diunggah pada {formatDate(act.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {role === "COMPANY" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedActivityForVerify(act)}
                          leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                          className="text-xs border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-semibold"
                        >
                          {act.status === "VERIFIED" ? "Ubah Status Verifikasi" : "Verifikasi & Beri Masukan"}
                        </Button>
                      )}

                      {role === "PARTNER" && act.status !== "VERIFIED" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteActivity(act.id, act.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Laporan Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Modals --- */}
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

      <AiMilestonesModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        programId={programId}
        programTitle={programTitle}
        onSuccess={() => {
          fetchStages();
          fetchActivities();
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
        photos={lightboxPhotos}
        initialIndex={lightboxIndex}
        title={lightboxTitle}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}
