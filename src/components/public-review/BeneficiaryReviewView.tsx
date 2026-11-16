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
  X,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Calendar,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    color: "text-rose-600",
    desc: "Program kurang tepat sasaran atau ada kendala berat di lapangan",
  },
  2: {
    text: "Kurang Memuaskan",
    color: "text-amber-600",
    desc: "Manfaat terasa minim dan membutuhkan banyak perbaikan",
  },
  3: {
    text: "Cukup Bermanfaat",
    color: "text-yellow-600",
    desc: "Program terlaksana dengan cukup baik dan memberikan manfaat pokok",
  },
  4: {
    text: "Baik & Bermanfaat",
    color: "text-emerald-600",
    desc: "Dampak positif dirasakan langsung oleh masyarakat",
  },
  5: {
    text: "Sangat Baik & Berdampak",
    color: "text-emerald-700",
    desc: "Pelaksanaan program prima dan membawa dampak nyata yang berkelanjutan",
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

    const finalRole =
      reviewerRole === "Lainnya" && customRole.trim()
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
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Pola titik latar khas SIPENA */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(24, 19, 67, 0.12) 1.25px, transparent 1.25px), radial-gradient(rgba(24, 19, 67, 0.08) 1.25px, transparent 1.25px)",
            backgroundSize: "32px 32px",
            backgroundPosition: "0 0, 16px 16px",
          }}
        />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-8 h-8 border-3 border-[#181343] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">
            Memuat formulir survei masyarakat...
          </p>
        </div>
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Pola titik latar khas SIPENA */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(24, 19, 67, 0.12) 1.25px, transparent 1.25px), radial-gradient(rgba(24, 19, 67, 0.08) 1.25px, transparent 1.25px)",
            backgroundSize: "32px 32px",
            backgroundPosition: "0 0, 16px 16px",
          }}
        />
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200/90 text-center shadow-xs relative z-10">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#181343] mb-2">Program Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mb-6">{fetchError}</p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-[#181343] hover:bg-[#120e33] text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer"
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
    <div className="min-h-screen bg-[#F9F9FB] text-[#181343] pb-20 font-sans relative overflow-hidden">
      {/* Fixed Background Canvas: tetap diam/fixed di viewport saat halaman di-scroll */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      >
        {/* Pola titik latar khas halaman auth SIPENA (login & register) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(24, 19, 67, 0.12) 1.25px, transparent 1.25px), radial-gradient(rgba(24, 19, 67, 0.08) 1.25px, transparent 1.25px)",
            backgroundSize: "32px 32px",
            backgroundPosition: "0 0, 16px 16px",
          }}
        />

        {/* Ambient glow mint & ice-blue sesuai token globals.css SIPENA */}
        <div className="absolute -top-24 -right-16 w-[480px] h-[480px] rounded-full bg-[#EDF5FA] blur-[90px] opacity-90" />
        <div className="absolute top-1/3 -left-20 w-[480px] h-[480px] rounded-full bg-[#EAF8F4] blur-[90px] opacity-90" />
        <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] rounded-full bg-[#EDF5FA] blur-[100px] opacity-80" />

        {/* Aksen garis gelombang halus khas SIPENA pada sudut kanan atas */}
        <div className="absolute -top-10 -right-10 w-[380px] sm:w-[500px] select-none opacity-80">
          <svg
            viewBox="0 0 700 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block transform rotate-180"
          >
            <defs>
              <linearGradient
                id="sipena-rev-hill-back"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#181343" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient
                id="sipena-rev-hill-mid"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#059669" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#181343" stopOpacity="0.06" />
              </linearGradient>
              <linearGradient
                id="sipena-rev-wave-stroke"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
                <stop offset="55%" stopColor="#181343" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            <path
              d="M0 150C120 90 250 130 375 180C495 228 595 215 700 250V280H0V150Z"
              fill="url(#sipena-rev-hill-back)"
            />
            <path
              d="M0 198C115 162 245 198 365 232C480 264 585 250 700 280H0V198Z"
              fill="url(#sipena-rev-hill-mid)"
            />
            <path
              d="M-20 175C120 112 255 152 380 202C500 248 600 232 710 268"
              stroke="url(#sipena-rev-wave-stroke)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M-20 220C115 182 240 218 360 250C475 280 580 266 690 288"
              stroke="#181343"
              strokeOpacity="0.2"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="148" cy="138" r="5" fill="#059669" fillOpacity="0.4" />
            <circle cx="298" cy="176" r="4" fill="#181343" fillOpacity="0.3" />
            <circle cx="445" cy="222" r="4.5" fill="#10B981" fillOpacity="0.4" />
          </svg>
        </div>

        {/* Aksen garis gelombang halus khas SIPENA pada sudut kiri bawah */}
        <div className="absolute bottom-0 left-0 w-[420px] sm:w-[620px] select-none">
          <svg
            viewBox="0 0 700 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
          >
            <defs>
              <linearGradient
                id="sipena-rev-hill-back-bottom"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#181343" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient
                id="sipena-rev-hill-mid-bottom"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#059669" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#181343" stopOpacity="0.06" />
              </linearGradient>
              <linearGradient
                id="sipena-rev-wave-stroke-bottom"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
                <stop offset="55%" stopColor="#181343" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            <path
              d="M0 150C120 90 250 130 375 180C495 228 595 215 700 250V280H0V150Z"
              fill="url(#sipena-rev-hill-back-bottom)"
            />
            <path
              d="M0 198C115 162 245 198 365 232C480 264 585 250 700 280H0V198Z"
              fill="url(#sipena-rev-hill-mid-bottom)"
            />
            <path
              d="M-20 175C120 112 255 152 380 202C500 248 600 232 710 268"
              stroke="url(#sipena-rev-wave-stroke-bottom)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M-20 220C115 182 240 218 360 250C475 280 580 266 690 288"
              stroke="#181343"
              strokeOpacity="0.2"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="148" cy="138" r="5" fill="#059669" fillOpacity="0.4" />
            <circle cx="298" cy="176" r="4" fill="#181343" fillOpacity="0.3" />
            <circle cx="445" cy="222" r="4.5" fill="#10B981" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Top Hero Section */}
      <div className="pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 rounded-full border border-emerald-200/80 mb-4 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">
              SIPENA • Portal Aspirasi &amp; Penilaian Masyarakat
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#181343] max-w-2xl leading-tight">
            Suara &amp; Penilaian Masyarakat
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-2.5 leading-relaxed">
            Sampaikan pengalaman dan manfaat riil yang Anda rasakan dari program CSR ini. 
            Aspirasi Anda dicatat secara transparan untuk evaluasi pelaksanaan kegiatan di lapangan.
          </p>

          {/* Program Card in Hero - Format Penuh Warna Biru Sesuai Referensi Pengguna */}
          <div
            className="mt-8 w-full bg-[#181343] border border-white/10 rounded-3xl p-6 sm:p-8 text-left shadow-lg text-white relative overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1.5 flex-1 pr-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  PROGRAM CSR
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  {program.title.replace(/[\u2013\u2014]/g, "-")}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap pt-1">
                  {program.targetCity && (
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {program.targetCity}
                      {program.targetProvince ? `, ${program.targetProvince}` : ""}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase">
                    {program.focusArea}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 self-start sm:self-center">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border inline-flex items-center gap-1.5 ${
                    program.status === "COMPLETED"
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                      : program.status === "IN_PROGRESS"
                      ? "bg-teal-950/80 text-teal-300 border-teal-500/40"
                      : "bg-amber-950/80 text-amber-300 border-amber-500/40"
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

            {/* Stakeholders Banner - 2 Kolom Sejajar Sesuai Referensi Pengguna */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 text-xs">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden text-xs shadow-2xs">
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
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    PERUSAHAAN SPONSOR
                  </span>
                  <strong className="text-white font-bold text-sm truncate block">
                    {program.companyName || "Perusahaan Mitra"}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="w-11 h-11 rounded-full bg-white border border-white/20 flex items-center justify-center font-bold text-[#181343] shrink-0 overflow-hidden text-xs shadow-2xs">
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
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    MITRA PELAKSANA LAPANGAN
                  </span>
                  <strong className="text-white font-bold text-sm truncate block">
                    {program.partnerName || "Mitra Lapangan"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 space-y-6 relative z-10">
        {/* Guard for PLANNED or CANCELLED programs */}
        {!isAvailableForReview ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#181343]">
              Formulir Survei Belum Dibuka
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Program ini masih dalam tahap persiapan atau perencanaan. Pengisian survei dan ulasan
              kepuasan masyarakat akan aktif secara otomatis saat kegiatan lapangan mulai dilaksanakan.
            </p>
          </div>
        ) : isSubmitted ? (
          /* Submission Success State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-2xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#181343]">
                Terima Kasih Atas Ulasan &amp; Aspirasi Anda
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
                className="text-xs font-bold border-slate-300 text-slate-700 cursor-pointer"
              >
                Kirim Ulasan Lain
              </Button>
              <a
                href="#reviews-feed"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold bg-[#181343] hover:bg-[#120e33] text-white shadow-xs transition-all cursor-pointer"
              >
                Lihat Suara Warga Lainnya
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Review Submission Form */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10">
            <div className="border-b border-slate-100 pb-5 mb-8">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Formulir Penilaian Masyarakat
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#181343]">
                Bagikan Kesan &amp; Kepuasan Anda
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hanya butuh 1-2 menit. Identitas Anda dapat berupa nama lengkap atau nama panggilan/inisial warga.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Star Rating Picker */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Bagaimana Penilaian Kualitas Program Ini? <span className="text-rose-500">*</span>
                </label>
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Stars */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-none transition-colors cursor-pointer"
                        aria-label={`Beri nilai ${star} dari 5 bintang`}
                      >
                        <Star
                          className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                            star <= activeStar
                              ? "text-amber-400 fill-amber-400 drop-shadow-2xs"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Rating Description */}
                  <div className="text-center sm:text-right">
                    <span className={`text-base font-bold ${currentRatingInfo.color}`}>
                      Skor {activeStar} / 5 : {currentRatingInfo.text}
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
                  <label htmlFor="reviewer-name" className="text-xs font-bold text-slate-700 block">
                    Nama / Inisial Anda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reviewer-name"
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Contoh: Pak Budi Santoso / Ibu Siti"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181343]/20 focus:border-[#181343] transition-all"
                  />
                  <p className="text-[11px] text-slate-400">
                    Boleh mencantumkan inisial jika ingin lebih privat
                  </p>
                </div>

                {/* City / Location */}
                <div className="space-y-1.5">
                  <label htmlFor="reviewer-city" className="text-xs font-bold text-slate-700 block">
                    Desa / Kelurahan / Kota (Opsional)
                  </label>
                  <input
                    id="reviewer-city"
                    type="text"
                    value={reviewerCity}
                    onChange={(e) => setReviewerCity(e.target.value)}
                    placeholder="Contoh: Kel. Sukamaju, Karawang"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181343]/20 focus:border-[#181343] transition-all"
                  />
                </div>
              </div>

              {/* Reviewer Role Dropdown */}
              <div className="space-y-1.5">
                <label
                  htmlFor="reviewer-role"
                  className="text-xs font-bold text-slate-700 block"
                >
                  Peran / Kaitan Anda dengan Program Ini <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="reviewer-role"
                    required
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181343]/20 focus:border-[#181343] transition-all cursor-pointer"
                  >
                    {PRESET_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {reviewerRole === "Lainnya" && (
                  <div className="pt-1 animate-in fade-in duration-200">
                    <input
                      type="text"
                      required
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Sebutkan peran atau kaitan spesifik Anda..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181343]/20 focus:border-[#181343] transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Testimonial / Feedback Text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="review-comment" className="text-xs font-bold text-slate-700 block">
                    Testimoni &amp; Masukan Anda <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {comment.length}/1500 karakter (min. 10)
                  </span>
                </div>
                <textarea
                  id="review-comment"
                  required
                  rows={4}
                  minLength={10}
                  maxLength={1500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan apa dampak yang Anda rasakan, manfaat langsung dari bantuan/kegiatan ini, serta saran perbaikan untuk masa depan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#181343]/20 focus:border-[#181343] leading-relaxed transition-all resize-y min-h-[90px]"
                />
              </div>

              {/* Optional Photo Attachment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Foto Bukti Penerima Manfaat / Dokumentasi Lapangan (Opsional)
                </label>

                {photoUrl ? (
                  <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                    <img
                      src={photoUrl}
                      alt="Foto bukti ulasan"
                      className="w-40 h-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      className="absolute top-2 right-2 p-1.5 bg-[#181343]/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                      aria-label="Hapus foto lampiran"
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
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 hover:bg-white text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer transition-all ${
                        isUploadingPhoto ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {isUploadingPhoto ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-[#181343] border-t-transparent rounded-full animate-spin" />
                          <span>Mengunggah Foto...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-slate-600" />
                          <span>Unggah Foto Bukti (Maks. 5MB)</span>
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
                  className="w-full bg-[#181343] hover:bg-[#120e33] text-white font-bold text-sm py-4 rounded-xl shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan Ulasan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Kirim Penilaian &amp; Ulasan Saya</span>
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aspirasi diteruskan secara objektif dan transparan ke evaluasi program.</span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Public Feed of Existing Reviews */}
        <div id="reviews-feed" className="mt-12 space-y-6">
          <div className="flex items-center justify-between text-[#181343] border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold">
                Suara Warga &amp; Penerima Manfaat Lainnya ({reviews.length})
              </h3>
            </div>
            {stats.totalReviews > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/80 text-xs font-bold text-amber-800">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>Rata-rata: {stats.averageRating.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200/90 rounded-3xl text-slate-500 shadow-2xs">
              <p className="text-xs">
                Jadilah warga pertama yang memberikan ulasan dan masukan untuk program ini!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#181343] text-xs shrink-0">
                        {rev.reviewerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#181343]">
                          {rev.reviewerName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="text-slate-600 font-semibold">{rev.reviewerRole}</span>
                          {rev.reviewerCity && <span>• {rev.reviewerCity}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200/60 text-xs font-bold text-amber-700 shrink-0">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    "{rev.comment}"
                  </p>

                  {rev.photoUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewPhoto(rev.photoUrl)}
                        className="group relative inline-block rounded-xl overflow-hidden border border-slate-200 cursor-pointer"
                      >
                        <img
                          src={rev.photoUrl}
                          alt="Foto bukti ulasan masyarakat"
                          className="w-24 h-16 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-[#181343]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-all cursor-pointer"
              aria-label="Tutup pratinjau foto"
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
