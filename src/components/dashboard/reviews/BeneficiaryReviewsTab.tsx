"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Users,
  QrCode,
  MapPin,
  Calendar,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgramReviewResponse } from "@/modules/reviews/review.interface";
import { ProgramReview } from "@/db/schema/program-reviews";
import { ShareReviewModal } from "./ShareReviewModal";

interface BeneficiaryReviewsTabProps {
  programId: string;
  programTitle: string;
}

export function BeneficiaryReviewsTab({
  programId,
  programTitle,
}: BeneficiaryReviewsTabProps) {
  const [data, setData] = useState<ProgramReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | "ALL">("ALL");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/programs/${programId}/reviews`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memuat ulasan");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat ulasan masyarakat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [programId]);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Memuat ulasan masyarakat & penilaian...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-100 my-4">
        <p className="text-sm font-semibold text-rose-700 mb-3">{error || "Data tidak tersedia"}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchReviews}
          className="text-xs font-bold border-rose-200 text-rose-700"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  const { stats, reviews } = data;

  const filteredReviews =
    selectedRating === "ALL"
      ? reviews
      : reviews.filter((r) => r.rating === selectedRating);

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Card */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl shadow-xl relative overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Average Rating Score */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-slate-700/60 pb-6 md:pb-0 md:pr-6">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Indeks Kepuasan Masyarakat
            </span>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-5xl font-black tracking-tight text-white">
                {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-lg text-slate-400 font-semibold">/ 5.0</span>
            </div>
            {/* Stars */}
            <div className="flex items-center gap-1 my-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(stats.averageRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Berdasarkan <strong className="text-white font-bold">{stats.totalReviews}</strong> suara
              masyarakat & penerima manfaat
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="md:col-span-5 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-7 font-bold text-slate-300 flex items-center justify-end gap-0.5">
                    {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-700/70 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-medium text-slate-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action Button: QR Code Share */}
          <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center">
            <Button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs py-5 px-4 rounded-2xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Bagikan Survei & QR
            </Button>
            <p className="text-[11px] text-slate-400 mt-2 text-center md:text-right">
              Cetak QR Code untuk banner atau bagikan tautan kepada warga
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Feed Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <h4 className="text-sm font-bold text-slate-900">
            Daftar Ulasan & Masukan Lapangan ({filteredReviews.length})
          </h4>
        </div>

        {/* Rating Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedRating("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedRating === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({stats.totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                selectedRating === star
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{star}</span>
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] opacity-80">
                ({stats.ratingDistribution[star as 1 | 2 | 3 | 4 | 5] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h5 className="text-sm font-bold text-slate-800 mb-1">
            Belum Ada Ulasan Pada Kategori Ini
          </h5>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Bagikan tautan survei publik atau cetak QR Code agar masyarakat dapat memberikan ulasan langsung tanpa perlu membuat akun.
          </p>
          <Button
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5" />
            Buka QR Code Survei
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all space-y-3"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                    {review.reviewerName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-sm font-bold text-slate-900">
                        {review.reviewerName}
                      </h5>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/80">
                        {review.reviewerRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-0.5">
                      {review.reviewerCity && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {review.reviewerCity}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200/70 rounded-xl shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-amber-700">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              {/* Comment text */}
              <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                "{review.comment}"
              </p>

              {/* Attached Photo */}
              {review.photoUrl && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewPhoto(review.photoUrl)}
                    className="group relative inline-block rounded-xl overflow-hidden border border-slate-200 hover:border-teal-400 transition-colors shadow-sm"
                  >
                    <img
                      src={review.photoUrl}
                      alt="Foto bukti kegiatan penerima manfaat"
                      className="w-28 h-20 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Lihat Foto
                    </div>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      <ShareReviewModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        programId={programId}
        programTitle={programTitle}
      />

      {/* Photo Lightbox Preview */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto}
              alt="Foto ulasan masyarakat"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
