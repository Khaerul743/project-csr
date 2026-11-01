"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Users,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  FileText,
  Send,
  Download,
  Camera,
  Layers,
  HeartHandshake,
  Award,
  CheckCircle2,
  Star,
  SquarePen,
  Clock,
  Compass,
  Briefcase,
  Sparkles,
  Plus,
  Filter,
  Check,
  RotateCcw,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FOCUS_AREA_CONFIG, formatRupiah, formatDate } from "../helpers";
import { PastActivityItem, TeamMemberItem } from "@/modules/partners/partner.interface";
import { EditPartnerProfilePageView, PartnerProfileCategoryTab } from "./EditPartnerProfilePageView";

interface PartnerFullProfileViewProps {
  partner: any;
  programs?: any[];
  collaborations?: any[];
  isLoadingPrograms?: boolean;
  isOwner?: boolean;
  onBack?: () => void;
  onInvitePitch?: () => void;
  onInvitePartner?: () => void;
  onOpenChat?: () => void;
  onProfileUpdated?: (updated: any) => void;
}

// Fallback Logo / Avatar Component
function PartnerAvatar({
  logoUrl,
  name,
}: {
  logoUrl?: string | null;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);

  const initials = useMemo(() => {
    if (!name) return "MP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [name]);

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain p-1"
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#181343] to-emerald-800 text-white flex items-center justify-center font-black text-3xl sm:text-4xl tracking-wider">
      {initials}
    </div>
  );
}

export function PartnerFullProfileView({
  partner,
  programs = [],
  collaborations = [],
  isLoadingPrograms = false,
  isOwner = false,
  onBack,
  onInvitePitch,
  onInvitePartner,
  onOpenChat,
  onProfileUpdated,
}: PartnerFullProfileViewProps) {
  const [currentPartner, setCurrentPartner] = useState(partner);
  const [activeTab, setActiveTab] = useState<"about" | "portfolio" | "legal" | "team">("about");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editCategory, setEditCategory] = useState<PartnerProfileCategoryTab>("info");

  // Filters for Portofolio Tab
  const [programStatusFilter, setProgramStatusFilter] = useState<string>("ALL");
  const [programFocusFilter, setProgramFocusFilter] = useState<string>("ALL");

  // Sync state if prop changes
  React.useEffect(() => {
    setCurrentPartner(partner);
  }, [partner]);

  const p = currentPartner;
  const handleInviteAction = onInvitePartner || onInvitePitch;

  // Parse JSON data for past activities and team members
  const pastActivities: PastActivityItem[] = useMemo(() => {
    if (!p?.pastActivities) return [];
    if (Array.isArray(p.pastActivities)) return p.pastActivities;
    try {
      return JSON.parse(p.pastActivities);
    } catch {
      return [];
    }
  }, [p?.pastActivities]);

  const teamMembers: TeamMemberItem[] = useMemo(() => {
    if (!p?.teamMembers) return [];
    if (Array.isArray(p.teamMembers)) return p.teamMembers;
    try {
      return JSON.parse(p.teamMembers);
    } catch {
      return [];
    }
  }, [p?.teamMembers]);

  // Combined program list from props or partner object
  const programList = useMemo(() => {
    if (programs && programs.length > 0) return programs;
    if (p?.programs && Array.isArray(p.programs)) return p.programs;
    return [];
  }, [programs, p?.programs]);

  // Combined collaborations list
  const collabList = useMemo(() => {
    if (collaborations && collaborations.length > 0) return collaborations;
    if (p?.collaborations && Array.isArray(p.collaborations)) return p.collaborations;
    return [];
  }, [collaborations, p?.collaborations]);

  // Helper to get friendly Indonesian label for focus areas
  const getFocusAreaLabel = (focusKey: string): string => {
    switch (focusKey) {
      case "PENDIDIKAN":
        return "Pendidikan & Literasi";
      case "KESEHATAN":
        return "Kesehatan Masyarakat";
      case "LINGKUNGAN":
        return "Lingkungan & Alam";
      case "PEMBERDAYAAN_EKONOMI":
      case "EKONOMI_UMKM":
        return "Pemberdayaan Ekonomi / UMKM";
      case "INFRASTRUKTUR_SOSIAL":
      case "INFRASTRUKTUR":
        return "Infrastruktur Sosial";
      case "TANGGAP_BENCANA":
        return "Tanggap Kemanusiaan & Bencana";
      case "LAINNYA":
        return "Inisiatif Khusus Lainnya";
      default:
        if (FOCUS_AREA_CONFIG[focusKey as keyof typeof FOCUS_AREA_CONFIG]) {
          return FOCUS_AREA_CONFIG[focusKey as keyof typeof FOCUS_AREA_CONFIG].label;
        }
        return focusKey;
    }
  };

  // Dynamic Focus Area options for filter dropdown
  const focusOptions = useMemo(() => {
    const baseOptions = [
      { value: "ALL", label: "Semua Fokus" },
      { value: "PENDIDIKAN", label: "Pendidikan & Literasi" },
      { value: "KESEHATAN", label: "Kesehatan Masyarakat" },
      { value: "LINGKUNGAN", label: "Lingkungan & Alam" },
      { value: "PEMBERDAYAAN_EKONOMI", label: "Ekonomi & UMKM" },
      { value: "INFRASTRUKTUR_SOSIAL", label: "Infrastruktur Sosial" },
      { value: "TANGGAP_BENCANA", label: "Tanggap Bencana" },
    ];

    const added = new Set(baseOptions.map((o) => o.value));

    programList.forEach((prog: any) => {
      if (prog.focusArea && !added.has(prog.focusArea)) {
        added.add(prog.focusArea);
        baseOptions.push({
          value: prog.focusArea,
          label: getFocusAreaLabel(prog.focusArea),
        });
      }
    });

    if (p?.focusArea && !added.has(p.focusArea)) {
      added.add(p.focusArea);
      baseOptions.push({
        value: p.focusArea,
        label: getFocusAreaLabel(p.focusArea),
      });
    }

    return baseOptions;
  }, [programList, p?.focusArea]);

  // Calculate administrative verification status based on actual legal documents & verification status
  const adminVerification = useMemo(() => {
    const explicitStatus = (p?.verificationStatus || "").toUpperCase();
    const hasLegal = Boolean(p?.legalNumber && String(p.legalNumber).trim().length > 3);
    const hasNpwp = Boolean(p?.npwpNumber && String(p.npwpNumber).trim().length > 3);
    const isSystemActive = p?.status === "ACTIVE" || !p?.status;

    if (explicitStatus === "VERIFIED" || (hasLegal && hasNpwp && isSystemActive)) {
      return {
        status: "VERIFIED" as const,
        label: "Terverifikasi Administratif",
        badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
        iconColor: "text-emerald-600",
        icon: ShieldCheck,
        description: "Dokumen legalitas lembaga (SK Kemenkumham & NPWP) telah terverifikasi sah dalam sistem SIPENA.",
      };
    }

    if (explicitStatus === "PENDING" || hasLegal || hasNpwp) {
      return {
        status: "PENDING" as const,
        label: "Menunggu Verifikasi Administratif",
        badgeBg: "bg-amber-50 border-amber-200 text-amber-800",
        iconColor: "text-amber-600",
        icon: Clock,
        description: "Dokumen legalitas sedang dalam proses peninjauan administratif oleh tim verifikator SIPENA.",
      };
    }

    return {
      status: "UNVERIFIED" as const,
      label: "Belum Terverifikasi Administratif",
      badgeBg: "bg-slate-100 border-slate-200 text-slate-700",
      iconColor: "text-slate-500",
      icon: ShieldAlert,
      description: "Lembaga belum melengkapi dokumen legalitas resmi (SK Kemenkumham & NPWP) untuk verifikasi institusional.",
    };
  }, [p?.verificationStatus, p?.legalNumber, p?.npwpNumber, p?.status]);

  // Calculate profile completeness score for Owner only (differentiated from legal verification)
  const completeness = useMemo(() => {
    let score = 0;
    const missing: string[] = [];

    if (p?.name) score += 10;
    if (p?.tagline) score += 10;
    else missing.push("Tagline / slogan lembaga");

    if (p?.logoUrl) score += 10;
    else missing.push("Logo resmi lembaga");

    if (p?.coverUrl) score += 10;
    else missing.push("Foto sampul lapangan");

    if (p?.focusArea) score += 10;
    else missing.push("Bidang keahlian utama");

    if (p?.description && p.description.length > 30) score += 15;
    else missing.push("Deskripsi visi & misi");

    if (p?.city || p?.province) score += 10;
    else missing.push("Domisili kantor sekretariat");

    if (p?.legalNumber || p?.npwpNumber) score += 10;
    else missing.push("Nomor SK Kemenkumham / NPWP");

    if (pastActivities.length > 0 || programList.length > 0) score += 10;
    else missing.push("Rekam jejak portofolio kegiatan");

    if (teamMembers.length > 0) score += 5;
    else missing.push("Kontak PIC / Tim pengurus");

    return { score: Math.min(100, score), missing };
  }, [p, pastActivities, programList, teamMembers]);

  // Compute live, accurate statistics tailored for NGO partner role
  const realMetrics = useMemo(() => {
    // 1. Kerja Sama Aktif (program with agreed / in progress status)
    const activeProgramsCount = programList.filter(
      (prog: any) => prog.status === "IN_PROGRESS" || prog.status === "PLANNED"
    ).length;

    const activeCollabCount = collabList.filter(
      (col: any) => col.status === "AGREED"
    ).length;

    const activeCooperations = Math.max(activeProgramsCount, activeCollabCount);

    // 2. Program Selesai
    const completedProgramsCount = programList.filter(
      (prog: any) => prog.status === "COMPLETED"
    ).length;

    // 3. Kegiatan Terlaksana
    let activitiesCompleted = 0;
    collabList.forEach((col: any) => {
      activitiesCompleted += Number(col.completedActivitiesCount || 0);
    });

    const totalActivities =
      activitiesCompleted > 0
        ? activitiesCompleted
        : pastActivities.length > 0
        ? pastActivities.length
        : (p?.metrics?.totalActivities || 0);

    // 4. Ulasan & Penilaian Penerima Manfaat
    const fallbackReviews = p?.metrics?.totalReviews || 0;
    const fallbackRating = p?.metrics?.averageRating || 0;

    return {
      activeCooperations,
      completedPrograms: completedProgramsCount > 0 ? completedProgramsCount : (p?.metrics?.completedPrograms || 0),
      totalPrograms: programList.length,
      totalActivities,
      averageRating: fallbackRating,
      totalReviews: fallbackReviews,
    };
  }, [programList, collabList, pastActivities, p?.metrics]);

  // Filtered programs for Tab 2
  const filteredPrograms = useMemo(() => {
    return programList.filter((prog: any) => {
      const matchStatus = programStatusFilter === "ALL" || prog.status === programStatusFilter;
      const matchFocus = programFocusFilter === "ALL" || prog.focusArea === programFocusFilter;
      return matchStatus && matchFocus;
    });
  }, [programList, programStatusFilter, programFocusFilter]);

  const isFilterActive = programStatusFilter !== "ALL" || programFocusFilter !== "ALL";

  const handleResetFilters = () => {
    setProgramStatusFilter("ALL");
    setProgramFocusFilter("ALL");
  };

  const handleSuccessUpdate = (updated: any) => {
    setCurrentPartner(updated);
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  if (isEditingProfile) {
    return (
      <EditPartnerProfilePageView
        partner={currentPartner}
        initialCategory={editCategory}
        onBack={() => setIsEditingProfile(false)}
        onProfileUpdated={(updated) => {
          handleSuccessUpdate(updated);
          setIsEditingProfile(false);
        }}
      />
    );
  }

  if (!p) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm">Data profil lembaga tidak ditemukan.</p>
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
            Kembali
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in">
      {/* Top Navigation Bar (When viewed by company or has onBack) */}
      {onBack && (
        <div className="flex items-center justify-between gap-4 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Sebelumnya</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenChat}
                leftIcon={<Send className="w-3.5 h-3.5 shrink-0" />}
                className="text-xs font-bold"
              >
                Kirim Pesan
              </Button>
            )}
            {handleInviteAction && (
              <Button
                size="sm"
                onClick={handleInviteAction}
                leftIcon={<HeartHandshake className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Undang Bermitra
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Header / LinkedIn-Style Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 overflow-hidden">
          {p.coverUrl ? (
            <img
              src={p.coverUrl}
              alt={p.name}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Building2 className="w-12 h-12 text-slate-700/60 mb-2" />
              <p className="text-xs text-slate-400 font-medium">
                Belum ada foto sampul profil lapangan lembaga
              </p>
            </div>
          )}

          {/* Quick Edit Cover Button if Owner */}
          {isOwner && (
            <button
              type="button"
              onClick={() => {
                setEditCategory("branding");
                setIsEditingProfile(true);
              }}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Ganti Sampul</span>
            </button>
          )}
        </div>

        {/* Profile Info Header Bar */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          {/* Avatar / Logo (Overlapping Banner) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-5">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-2 shadow-xl border-2 border-white overflow-hidden shrink-0">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-3xl sm:text-4xl overflow-hidden shadow-inner">
                  <PartnerAvatar logoUrl={p.logoUrl} name={p.name} />
                </div>
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setEditCategory("branding");
                    setIsEditingProfile(true);
                  }}
                  className="absolute bottom-1 right-1 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Ganti Logo Lembaga"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action Buttons Top-Right */}
            <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-end">
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditCategory("info");
                    setIsEditingProfile(true);
                  }}
                  className="inline-flex items-center gap-2 h-[38px] px-3.5 sm:px-4 rounded-lg bg-white border border-[#E5E7EB] text-[#181343] hover:bg-[#F4F4F6] hover:border-slate-300 transition-colors duration-150 text-xs sm:text-sm font-semibold shadow-2xs shrink-0 cursor-pointer"
                >
                  <SquarePen className="w-4 h-4 text-[#181343] shrink-0" strokeWidth={1.75} />
                  <span>Edit Profil Lembaga</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {onOpenChat && (
                    <Button
                      onClick={onOpenChat}
                      variant="outline"
                      size="sm"
                      leftIcon={<Send className="w-3.5 h-3.5 shrink-0" />}
                      className="text-xs font-bold"
                    >
                      Kirim Pesan
                    </Button>
                  )}
                  {handleInviteAction && (
                    <Button
                      onClick={handleInviteAction}
                      leftIcon={<HeartHandshake className="w-4 h-4 shrink-0" />}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-sm"
                    >
                      Undang Bermitra
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name & Dynamic Administrative Verification Status */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {p.name}
              </h1>

              {/* Administrative Verification Badge (Calculated from actual legal documents) */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-2xs ${adminVerification.badgeBg}`}
                title={adminVerification.description}
              >
                <adminVerification.icon className={`w-4 h-4 ${adminVerification.iconColor}`} />
                <span>{adminVerification.label}</span>
              </div>
            </div>

            {p.tagline ? (
              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug max-w-3xl">
                {p.tagline}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {isOwner
                  ? "Tambahkan slogan atau fokus komitmen sosial lembaga Anda..."
                  : "Organisasi pelaksana program kemitraan sosial dan keberlanjutan masyarakat."}
              </p>
            )}

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs text-slate-500 font-medium">
              {p.focusArea && (
                <span className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  {getFocusAreaLabel(p.focusArea)}
                </span>
              )}

              {p.organizationType && (
                <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  {p.organizationType}
                </span>
              )}

              {(p.city || p.province) && (
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {[p.city, p.province].filter(Boolean).join(", ")}
                </span>
              )}

              {p.foundedYear && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Berdiri {p.foundedYear}
                </span>
              )}

              {p.website && (
                <a
                  href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website Resmi</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              )}

              {p.instagramUrl && (
                <a
                  href={p.instagramUrl.startsWith("http") ? p.instagramUrl : `https://${p.instagramUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-pink-600 hover:text-pink-700 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
              )}

              {p.linkedinUrl && (
                <a
                  href={p.linkedinUrl.startsWith("http") ? p.linkedinUrl : `https://${p.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completeness Bar (Owner Only) */}
        {isOwner && completeness.score < 100 && (
          <div className="mx-6 sm:mx-10 mb-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Persentase Kelengkapan Profil Lembaga
                </span>
              </div>
              <span className="text-xs font-black text-emerald-700">
                {completeness.score}% Lengkap
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tingkat kelengkapan data informasi publik lembaga untuk membangun transparansi di hadapan perusahaan sponsor CSR. Berbeda dengan status verifikasi administratif yang memvalidasi keabsahan dokumen hukum legalitas (SK Kemenkumham & NPWP).
            </p>

            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness.score}%` }}
              />
            </div>

            {completeness.missing.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="text-slate-500 font-medium">Lengkapi atribut profil:</span>
                {completeness.missing.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (item.includes("Logo") || item.includes("sampul") || item.includes("Tagline")) {
                        setEditCategory("branding");
                      } else if (item.includes("keahlian") || item.includes("visi") || item.includes("portofolio")) {
                        setEditCategory("portfolio");
                      } else if (item.includes("SK") || item.includes("NPWP")) {
                        setEditCategory("legal");
                      } else if (item.includes("pengurus") || item.includes("PIC")) {
                        setEditCategory("team");
                      } else {
                        setEditCategory("info");
                      }
                      setIsEditingProfile(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50 transition cursor-pointer"
                  >
                    <span>+ {item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4 Live Impact Highlight Metrics Cards (Layout Identik Profil Perusahaan) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Kerja Sama Aktif */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kerja Sama Aktif
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {realMetrics.activeCooperations} Program
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block truncate">
              {realMetrics.activeCooperations > 0
                ? "Program kemitraan sedang berjalan"
                : "Belum ada kerja sama aktif"}
            </span>
          </div>
        </div>

        {/* Metric 2: Program Selesai */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Program Selesai
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {realMetrics.completedPrograms}
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Dari {realMetrics.totalPrograms} total program terdaftar
            </span>
          </div>
        </div>

        {/* Metric 3: Kegiatan Terlaksana */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kegiatan Terlaksana
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {realMetrics.totalActivities} Aktivitas
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Intervensi lapangan terealisasi
            </span>
          </div>
        </div>

        {/* Metric 4: Umpan Balik Penerima Manfaat */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Umpan Balik Warga
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div>
            {realMetrics.totalReviews > 0 && realMetrics.averageRating > 0 ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {realMetrics.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  Berdasarkan {realMetrics.totalReviews} ulasan masyarakat
                </span>
              </>
            ) : (
              <>
                <span className="text-xl sm:text-2xl font-black text-slate-400 tracking-tight block">
                  —
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  Belum ada ulasan penerima manfaat
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Detail Tabs (Styling Identik Profil Perusahaan) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Tab Headers: 4 Tab requested */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/60 px-6 gap-2 sm:gap-4 overflow-x-auto">
          {/* Tab 1: Profil & Informasi Lembaga */}
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "about"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil & Informasi Lembaga</span>
          </button>

          {/* Tab 2: Portofolio Kegiatan & Kolaborasi */}
          <button
            type="button"
            onClick={() => setActiveTab("portfolio")}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "portfolio"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>
              Portofolio Kegiatan & Kolaborasi ({programList.length + pastActivities.length})
            </span>
          </button>

          {/* Tab 3: Legalitas & Dokumen */}
          <button
            type="button"
            onClick={() => setActiveTab("legal")}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "legal"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Legalitas & Dokumen</span>
          </button>

          {/* Tab 4: Tim & PIC Lembaga */}
          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "team"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tim & PIC Lembaga ({teamMembers.length})</span>
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="p-6 sm:p-8">
          {/* ============================================================ */}
          {/* TAB 1: PROFIL & INFORMASI LEMBAGA */}
          {/* ============================================================ */}
          {activeTab === "about" && (
            <div className="space-y-8 animate-in fade-in">
              {/* Tentang Lembaga & Visi Misi */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Tentang Lembaga & Visi Misi</span>
                  </h3>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditCategory("portfolio");
                        setIsEditingProfile(true);
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Edit Deskripsi
                    </button>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {p.description ||
                      "Lembaga belum mencantumkan deskripsi visi, misi, dan metodologi pendekatan lapangan secara lengkap. Lengkapi informasi ini pada menu Edit Profil Lembaga."}
                  </p>
                </div>
              </div>

              {/* Fokus Bidang & Cakupan Wilayah */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bidang Keahlian */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bidang Keahlian Utama</span>
                  </h4>
                  <div className="space-y-1.5">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {getFocusAreaLabel(p.focusArea || "LAINNYA")}
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Fokus intervensi tematik dan spesialisasi program lapangan yang menjadi keunggulan yayasan dalam kemitraan CSR.
                    </p>
                  </div>
                </div>

                {/* Domisili & Cakupan */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Domisili & Wilayah Operasional</span>
                  </h4>
                  <div className="space-y-1.5">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {[p.city, p.province].filter(Boolean).join(", ") || "Seluruh Indonesia"}
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {p.address ? p.address : "Alamat kantor sekretariat belum dicantumkan secara lengkap."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kontak Resmi & Media Sosial */}
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Kontak Resmi & Sekretariat</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Email */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">Email Resmi</span>
                    <span className="text-xs font-bold text-slate-800 break-all block">
                      {p.email || "Belum dicantumkan"}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">Nomor Telepon</span>
                    <span className="text-xs font-bold text-slate-800 block">
                      {p.phone || "Belum dicantumkan"}
                    </span>
                  </div>

                  {/* Website */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">Website Resmi</span>
                    {p.website ? (
                      <a
                        href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{p.website}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Belum dicantumkan</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ringkasan Profil Singkat */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Identitas Organisasi</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Bentuk Organisasi</span>
                    <span className="font-bold text-slate-800">{p.organizationType || "Yayasan"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tahun Berdiri</span>
                    <span className="font-bold text-slate-800">{p.foundedYear || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Legal</span>
                    <span className="font-bold text-slate-800">
                      {p.legalNumber ? "Tercatat SK Kemenkumham" : "Dalam Proses"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">NPWP Lembaga</span>
                    <span className="font-bold text-slate-800">
                      {p.npwpNumber ? "Terdaftar" : "Belum Dilengkapi"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: PORTOFOLIO KEGIATAN & KOLABORASI */}
          {/* ============================================================ */}
          {activeTab === "portfolio" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">Filter Portofolio</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter */}
                  <select
                    value={programStatusFilter}
                    onChange={(e) => setProgramStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="IN_PROGRESS">Sedang Berjalan</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="PLANNED">Tahap Persiapan</option>
                  </select>

                  {/* Focus Filter */}
                  <select
                    value={programFocusFilter}
                    onChange={(e) => setProgramFocusFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {focusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Reset Filters */}
                  {isFilterActive && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Section 1: Program Kolaborasi Resmi SIPENA */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>Program Kemitraan CSR Terverifikasi ({filteredPrograms.length})</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Berdasarkan MoU dan monitoring aktual
                  </span>
                </div>

                {filteredPrograms.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">
                      {isFilterActive
                        ? "Tidak Ada Program yang Sesuai dengan Filter"
                        : "Belum Ada Program Kemitraan Resmi Terlaksana"}
                    </span>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      {isFilterActive
                        ? "Coba ubah atau reset filter status dan bidang kegiatan untuk melihat program lainnya."
                        : "Program CSR bersama perusahaan sponsor yang telah disepakati akan otomatis tercatat di sini."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPrograms.map((prog: any) => (
                      <div
                        key={prog.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                              {getFocusAreaLabel(prog.focusArea)}
                            </span>
                            <Badge
                              variant={
                                prog.status === "COMPLETED"
                                  ? "emerald"
                                  : prog.status === "IN_PROGRESS"
                                  ? "amber"
                                  : "slate"
                              }
                              size="sm"
                              hasDot
                            >
                              {prog.status === "COMPLETED"
                                ? "Selesai"
                                : prog.status === "IN_PROGRESS"
                                ? "Sedang Berjalan"
                                : "Persiapan"}
                            </Badge>
                          </div>

                          <h5 className="text-sm font-bold text-slate-900 line-clamp-2">
                            {prog.title}
                          </h5>

                          {prog.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {prog.description}
                            </p>
                          )}

                          {/* Sponsor Company Info */}
                          {prog.companyName && (
                            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-800 truncate">
                                Mitra: {prog.companyName}
                              </span>
                            </div>
                          )}

                          {/* Location & Period */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                            {(prog.targetCity || prog.targetProvince) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{[prog.targetCity, prog.targetProvince].filter(Boolean).join(", ")}</span>
                              </span>
                            )}
                            {prog.startDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>
                                  {formatDate(prog.startDate)}
                                  {prog.endDate ? ` – ${formatDate(prog.endDate)}` : ""}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Beneficiaries & Budget info */}
                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-600">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Penerima Manfaat</span>
                            <span className="font-bold text-slate-800">
                              {prog.actualBeneficiaries || prog.targetBeneficiaries || "Dalam pendataan"}
                            </span>
                          </div>
                          {prog.budget && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Alokasi Dana</span>
                              <span className="font-bold text-emerald-700">
                                {formatRupiah(prog.budget)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub-Section 2: Rekam Jejak Portofolio Lapangan (pastActivities) */}
              {pastActivities.length > 0 && (
                <div className="border-t border-slate-200/80 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Rekam Jejak Portofolio Lapangan ({pastActivities.length})</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Inisiatif intervensi sosial yang tercatat dalam rekam jejak lembaga
                      </p>
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditCategory("portfolio");
                          setIsEditingProfile(true);
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Kelola Portofolio
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastActivities.map((act, idx) => (
                      <div
                        key={act.id || idx}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">
                              {act.title}
                            </span>
                            {act.year && (
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                                {act.year}
                              </span>
                            )}
                          </div>

                          {act.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {act.description}
                            </p>
                          )}

                          {act.photoUrl && (
                            <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-100 mt-2">
                              <img
                                src={act.photoUrl}
                                alt={act.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            {act.clientSponsor ? `Mitra: ${act.clientSponsor}` : "Inisiatif Mandiri"}
                          </span>
                          {act.beneficiaries && (
                            <span className="font-semibold text-slate-700">
                              {act.beneficiaries}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: LEGALITAS & DOKUMEN */}
          {/* ============================================================ */}
          {activeTab === "legal" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Informative Guidance Alert */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 text-blue-900 text-xs leading-relaxed flex items-start gap-3.5">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-sm block">Standar Kepatuhan Administratif SIPENA</span>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Pemeriksaan berkas berfokus pada kelengkapan format SK Kemenkumham, NPWP, serta profil kelembagaan untuk menjamin tata kelola yang transparan sebelum kerja sama program CSR dimulai.
                  </p>
                </div>
              </div>

              {/* 4 Legal Credentials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. SK Kemenkumham */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      SK Pengesahan Kemenkumham
                    </span>
                    <Badge
                      variant={p.legalNumber ? "emerald" : "slate"}
                      size="sm"
                      hasDot
                    >
                      {p.legalNumber ? "Tercatat di Sistem" : "Belum Dilengkapi"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-mono font-bold text-slate-900 block truncate">
                      {p.legalNumber || "Nomor SK belum dicantumkan"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Akta Pendirian & Pengesahan Badan Hukum
                    </span>
                  </div>
                </div>

                {/* 2. NPWP Lembaga */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Nomor Pokok Wajib Pajak (NPWP)
                    </span>
                    <Badge
                      variant={p.npwpNumber ? "emerald" : "slate"}
                      size="sm"
                      hasDot
                    >
                      {p.npwpNumber ? "Terdaftar Resmi" : "Belum Dilengkapi"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-mono font-bold text-slate-900 block truncate">
                      {p.npwpNumber || "Nomor NPWP belum dicantumkan"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      NPWP terdaftar atas nama lembaga yayasan
                    </span>
                  </div>
                </div>

                {/* 3. Bentuk Badan Hukum */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Bentuk Badan Hukum
                    </span>
                    <Badge variant="blue" size="sm">
                      {p.organizationType || "Yayasan"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      {p.organizationType || "Yayasan"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Entitas nirlaba pelaksana program sosial
                    </span>
                  </div>
                </div>

                {/* 4. Dokumen Portofolio PDF */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Company Profile Yayasan (PDF)
                    </span>
                    <Badge
                      variant={p.portfolioDocUrl ? "emerald" : "slate"}
                      size="sm"
                      hasDot
                    >
                      {p.portfolioDocUrl ? "Tersedia" : "Belum Diunggah"}
                    </Badge>
                  </div>
                  <div>
                    {p.portfolioDocUrl ? (
                      <a
                        href={p.portfolioDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Unduh / Buka Dokumen Portofolio (PDF)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 block">
                        Berkas company profile PDF belum diunggah
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Dokumen resmi presentasi rekam jejak lembaga
                    </span>
                  </div>
                </div>
              </div>

              {/* Action for Owner */}
              {isOwner && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Perbarui Data Legalitas Organisasi
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pastikan nomor registrasi dan dokumen PDF selalu mutakhir untuk kelancaran kemitraan.
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditCategory("legal");
                      setIsEditingProfile(true);
                    }}
                    className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold shrink-0"
                  >
                    Perbarui Berkas Legalitas
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: TIM & PIC LEMBAGA */}
          {/* ============================================================ */}
          {activeTab === "team" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Pengurus & Tim Pelaksana ({teamMembers.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Struktur kepengurusan dan penanggung jawab operasional program lembaga.
                  </p>
                </div>

                {isOwner && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditCategory("team");
                      setIsEditingProfile(true);
                    }}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
                  >
                    Kelola Pengurus
                  </Button>
                )}
              </div>

              {/* PIC Utama Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Penanggung Jawab Resmi Organisasi (PIC)
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      {teamMembers.length > 0 ? teamMembers[0].name : p.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {teamMembers.length > 0 ? teamMembers[0].role : "Penanggung Jawab Lembaga"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    {p.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.email}</span>
                      </span>
                    )}
                    {p.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid of Team Members */}
              {teamMembers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <span className="text-xs font-bold text-slate-700 block">
                    Belum Ada Tim atau Pengurus yang Ditambahkan
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    {isOwner
                      ? "Tambahkan nama-nama pengurus yayasan Anda untuk meningkatkan transparansi di hadapan sponsor."
                      : "Lembaga belum mencantumkan susunan pengurus organisasi."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {teamMembers.map((member, idx) => {
                    const initials = member.name
                      ? member.name.substring(0, 2).toUpperCase()
                      : "TM";
                    return (
                      <div
                        key={member.id || idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3.5"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 overflow-hidden shrink-0">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-slate-900 truncate">
                            {member.name}
                          </h5>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
