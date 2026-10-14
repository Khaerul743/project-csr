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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgramActivityItem, ACTIVITY_STATUS_CONFIG } from "./types";
import { formatDate, formatRupiah } from "../analytics/helpers";
import { AddActivityModal } from "./AddActivityModal";
import { VerifyActivityModal } from "./VerifyActivityModal";
import { PhotoLightboxModal } from "./PhotoLightboxModal";

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

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  useEffect(() => {
    if (programId) {
      fetchActivities();
    }
  }, [programId]);

  const handleOpenLightbox = (photos: string[], index: number, title: string) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setIsLightboxOpen(true);
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">
              Jurnal & Log Bukti Lapangan
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold border border-teal-200/60">
              {activities.length} Kegiatan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi berkala, foto progres riil, dan verifikasi pelaksanaan kegiatan lapangan
          </p>
        </div>

        {role === "PARTNER" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs shrink-0 shadow-xs"
          >
            Tambah Laporan Kegiatan
          </Button>
        )}
      </div>

      {/* Activities Timeline Feed */}
      {isLoading ? (
        <div className="p-10 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl">
          <Activity className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
          Memuat data log aktivitas lapangan...
        </div>
      ) : activities.length === 0 ? (
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
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs mt-2"
            >
              Unggah Laporan Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {activities.map((act) => {
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
        onClose={() => setIsAddModalOpen(false)}
        programId={programId}
        programTitle={programTitle}
        onSuccess={() => {
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
