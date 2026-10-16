"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Camera,
  UploadCloud,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  MessageSquare,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgramReviewResponse } from "@/modules/reviews/review.interface";

interface BeneficiaryReviewViewProps {
  programId: string;
}

const PRESET_ROLES = [
  "Penerima Bantuan Langsung",
  "Warga Sekitar Program",
  "Tokoh Masyarakat / RT / RW",
  "Relawan Lapangan",
  "Pemerintah Desa / Kelurahan",
  "Lainnya",
];

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: {
    text: "Sangat Kurang",
    color: "text-rose-500",
    desc: "Program kurang tepat sasaran atau ada kendala berat",
  },
  2: {
    text: "Kurang Memuaskan",
    color: "text-amber-500",
    desc: "Manfaat terasa minim atau butuh banyak perbaikan",
  },
  3: {
    text: "Cukup Bermanfaat",
    color: "text-yellow-600",
    desc: "Program terlaksana dengan cukup baik",
  },
  4: {
    text: "Sangat Baik & Bermanfaat",
    color: "text-teal-600",
    desc: "Dampak nyata dirasakan oleh penerima manfaat",
  },
  5: {
    text: "Luar Biasa & Sangat Berdampak!",
    color: "text-emerald-600",
    desc: "Program sangat sukses dan membawa perubahan positif nyata",
  },
};

export function BeneficiaryReviewView({ programId }: BeneficiaryReviewViewProps) {
  const [data, setData] = useState<ProgramReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerRole, setReviewerRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [reviewerCity, setReviewerCity] = useState("");
  const [comment, setComment] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Photo lightbox
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fetchProgramData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/programs/${programId}/reviews`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memuat informasi program");
      }
      setData(json.data);
    } catch (err: any) {
      setFetchError(err.message || "Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramData();
  }, [programId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setPhotoError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/review", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah foto");
      }

      setPhotoUrl(json.data.url);
    } catch (err: any) {
      setPhotoError(err.message || "Gagal mengunggah foto bukti");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const finalRole = reviewerRole === "Lainnya" && customRole.trim()
      ? customRole.trim()
      : reviewerRole;

    try {
      const res = await fetch(`/api/programs/${programId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerName: reviewerName.trim(),
          reviewerRole: finalRole,
          reviewerCity: reviewerCity.trim() || undefined,
          rating,
          comment: comment.trim(),
          photoUrl: photoUrl || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengirimkan ulasan");
      }

      setIsSubmitted(true);
      // Refresh list to include new review
      fetchProgramData();
    } catch (err: any) {
      setSubmitError(err.message || "Terjadi kesalahan saat mengirim ulasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">
            Memuat formulir survei masyarakat...
          </p>
        </div>
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Program Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mb-6">{fetchError}</p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Muat Ulang Halaman
          </Button>
        </div>
      </div>
    );
  }

  const { program, stats, reviews } = data;
  const isAvailableForReview =
    program.status === "IN_PROGRESS" || program.status === "COMPLETED";

  const activeStar = hoverRating || rating;
  const currentRatingInfo = RATING_LABELS[activeStar];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-800 pb-20">
      {/* Top Hero Banner */}
      <div className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-white">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Partnership Logos Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/15 mb-6">
            <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4" />
              Kolaborasi CSR Berdampak
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white max-w-2xl leading-tight">
            Suara & Penilaian Masyarakat
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-3 leading-relaxed">
            Sampaikan pengalaman, kepuasan, dan dampak yang Anda rasakan dari program CSR ini. 
            Partisipasi Anda mewujudkan transparansi dan kemajuan bersama.
          </p>

          {/* Program Card in Hero */}
          <div className="mt-8 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-left shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                  Program CSR
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  {program.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap pt-1">
                  {program.targetCity && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      {program.targetCity}
                      {program.targetProvince ? `, ${program.targetProvince}` : ""}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                    {program.focusArea}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                    program.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                      : program.status === "IN_PROGRESS"
                      ? "bg-teal-500/20 text-teal-300 border-teal-400/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                  }`}
                >
                  {program.status === "COMPLETED"
                    ? "✓ Program Selesai"
                    : program.status === "IN_PROGRESS"
                    ? "● Sedang Berjalan di Lapangan"
                    : "Dalam Perencanaan"}
                </span>
              </div>
            </div>

            {/* Stakeholders Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-teal-300 shrink-0 overflow-hidden">
                  {program.companyLogo ? (
                    <img
                      src={program.companyLogo}
                      alt={program.companyName || "Perusahaan"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (program.companyName || "PT").slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Perusahaan Sponsor
                  </span>
                  <strong className="text-white font-bold text-sm">
                    {program.companyName || "Perusahaan Mitra"}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-teal-300 shrink-0 overflow-hidden">
                  {program.partnerLogo ? (
                    <img
                      src={program.partnerLogo}
                      alt={program.partnerName || "Mitra"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (program.partnerName || "M").slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Mitra Pelaksana Lapangan
                  </span>
                  <strong className="text-white font-bold text-sm">
                    {program.partnerName || "Mitra Lapangan"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Guard for PLANNED or CANCELLED programs */}
        {!isAvailableForReview ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Formulir Survei Belum Dibuka
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Program ini masih dalam tahap persiapan / perencanaan. Pengisian survei dan ulasan
              kepuasan masyarakat akan aktif secara otomatis saat kegiatan lapangan mulai dilaksanakan.
            </p>
          </div>
        ) : isSubmitted ? (
          /* Submission Success State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Terima Kasih Atas Aspirasi & Ulasan Anda!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Ulasan Anda telah berhasil disimpan dan diteruskan secara transparan kepada pihak{" "}
                <strong className="text-slate-800">{program.companyName}</strong> dan{" "}
                <strong className="text-slate-800">{program.partnerName}</strong> untuk menjaga
                kualitas program sosial yang berkelanjutan.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setReviewerName("");
                  setComment("");
                  setPhotoUrl(null);
                }}
                variant="outline"
                className="text-xs font-bold border-slate-300 text-slate-700"
              >
                Kirim Ulasan Lain
              </Button>
              <a
                href="#reviews-feed"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all"
              >
                Lihat Suara Warga Lainnya
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Review Submission Form */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-10">
            <div className="border-b border-slate-100 pb-5 mb-8">
              <div className="flex items-center gap-2 text-teal-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Formulir Penilaian Tanpa Login
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Bagikan Kesan & Kepuasan Anda
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hanya butuh 1-2 menit. Identitas Anda dapat berupa nama lengkap atau inisial warga.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Star Rating Picker */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  1. Bagaimana Penilaian Kualitas Program Ini? <span className="text-rose-500">*</span>
                </label>
                <div className="p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Stars */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                      >
                        <Star
                          className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                            star <= activeStar
                              ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Rating Description */}
                  <div className="text-center sm:text-right">
                    <span className={`text-base font-black ${currentRatingInfo.color}`}>
                      {currentRatingInfo.text}
                    </span>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                      {currentRatingInfo.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Identity & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Reviewer Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nama / Inisial Anda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Contoh: Pak Budi Santoso / Ibu Siti"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400">
                    Boleh mencantumkan inisial jika ingin lebih privat
                  </p>
                </div>

                {/* City / Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Desa / Kelurahan / Kota (Opsional)
                  </label>
                  <input
                    type="text"
                    value={reviewerCity}
                    onChange={(e) => setReviewerCity(e.target.value)}
                    placeholder="Contoh: Kel. Sukamaju, Karawang"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Reviewer Role Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Peran / Kaitan Anda dengan Program Ini <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setReviewerRole(role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        reviewerRole === role
                          ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30 font-bold"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                {reviewerRole === "Lainnya" && (
                  <input
                    type="text"
                    required
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Sebutkan peran Anda..."
                    className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                )}
              </div>

              {/* Testimonial / Feedback Text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Testimoni & Masukan Anda <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {comment.length}/1500 karakter (min. 10)
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  minLength={10}
                  maxLength={1500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan apa dampak yang Anda rasakan, manfaat langsung dari bantuan/kegiatan ini, serta saran perbaikan untuk masa depan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed transition-all"
                />
              </div>

              {/* Optional Photo Attachment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Foto Bukti Penerima Manfaat / Dokumentasi Lapangan (Opsional)
                </label>

                {photoUrl ? (
                  <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img
                      src={photoUrl}
                      alt="Foto bukti ulasan"
                      className="w-40 h-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="review-photo-upload"
                    />
                    <label
                      htmlFor="review-photo-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/50 text-xs font-bold text-slate-600 hover:text-teal-700 cursor-pointer transition-all ${
                        isUploadingPhoto ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {isUploadingPhoto ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                          Mengunggah Foto...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-teal-600" />
                          Unggah Foto Bukti (Maks. 5MB)
                        </>
                      )}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Boleh foto saat menerima bantuan, bibit, pelatihan, atau fasilitas.
                    </span>
                  </div>
                )}
                {photoError && (
                  <p className="text-[11px] font-semibold text-rose-600">{photoError}</p>
                )}
              </div>

              {submitError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingPhoto}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm py-6 rounded-2xl shadow-xl shadow-teal-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan Ulasan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                      Kirim Penilaian & Ulasan Saya
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Transparansi Terverifikasi • Aspirasi Langsung Tersampaikan</span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Public Feed of Existing Reviews */}
        <div id="reviews-feed" className="mt-12 space-y-6">
          <div className="flex items-center justify-between text-white border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-extrabold">
                Suara Warga & Penerima Manfaat Lainnya ({reviews.length})
              </h3>
            </div>
            {stats.totalReviews > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-xs font-bold text-amber-300">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Rata-rata: {stats.averageRating.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-white/5 border border-white/10 rounded-3xl text-slate-400">
              <p className="text-xs">
                Jadilah warga pertama yang memberikan ulasan dan masukan untuk program ini!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center font-extrabold text-teal-700 text-xs shrink-0">
                        {rev.reviewerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {rev.reviewerName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="text-teal-700 font-semibold">{rev.reviewerRole}</span>
                          {rev.reviewerCity && <span>• {rev.reviewerCity}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200/60 text-xs font-black text-amber-700 shrink-0">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl">
                    "{rev.comment}"
                  </p>

                  {rev.photoUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewPhoto(rev.photoUrl)}
                        className="group relative inline-block rounded-xl overflow-hidden border border-slate-200"
                      >
                        <img
                          src={rev.photoUrl}
                          alt="Foto bukti ulasan masyarakat"
                          className="w-24 h-16 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold">
                          Lihat
                        </div>
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 text-right">
                    {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
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
