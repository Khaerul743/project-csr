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
  ChevronDown,
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
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#181343] to-emerald-800 text-white flex items-center justify-center font-black text-3xl sm:text-4xl tracking-wider select-none">
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
        <div className="flex items-center justify-between gap-4 bg-white p-3.5 px-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
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
                className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold"
              >
                Undang Bermitra
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-40 sm:h-52 w-full bg-gradient-to-r from-[#181343] via-slate-900 to-[#064E3B] overflow-hidden">
          {p.coverUrl ? (
            <img
              src={p.coverUrl}
              alt={p.name}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300/80 p-6 text-center">
              <Building2 className="w-10 h-10 text-white/30 mb-1.5" />
              <p className="text-xs text-white/60 font-medium">
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
              className="absolute top-4 right-4 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Ganti Sampul</span>
            </button>
          )}
        </div>

        {/* Profile Info Header Bar */}
        <div className="px-6 sm:px-8 pb-7 pt-0 relative">
          {/* Avatar / Logo (Overlapping Banner) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white shadow-md overflow-hidden shrink-0 flex items-center justify-center font-black text-2xl sm:text-3xl">
                <PartnerAvatar logoUrl={p.logoUrl} name={p.name} />
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setEditCategory("branding");
                    setIsEditingProfile(true);
                  }}
                  className="absolute bottom-1 right-1 p-2 bg-[#059669] hover:bg-[#047857] text-white rounded-full shadow-md transition-transform active:scale-95 cursor-pointer"
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
                  className="inline-flex items-center gap-2 h-[38px] px-4 rounded-xl bg-white border border-[#E5E7EB] text-[#181343] hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150 text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
                >
                  <SquarePen className="w-4 h-4 text-[#181343] shrink-0" strokeWidth={1.75} />
                  <span>Edit Profil Lembaga</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {onOpenChat && (
                    <Button
                      variant="outline"
                      onClick={onOpenChat}
                      leftIcon={<Send className="w-4 h-4 shrink-0" />}
                      className="text-xs px-4 py-2"
                    >
                      Kirim Pesan
                    </Button>
                  )}
                  {handleInviteAction && (
                    <Button
                      variant="primary"
                      onClick={handleInviteAction}
                      leftIcon={<HeartHandshake className="w-4 h-4 shrink-0" />}
                      className="text-xs px-5 py-2.5 bg-[#059669] hover:bg-[#047857]"
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

              {/* Administrative Verification Badge */}
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
              {p.organizationType && (
                <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  {p.organizationType}
                </span>
              )}

              {p.focusArea && (
                <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  {getFocusAreaLabel(p.focusArea)}
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
          <div className="mx-6 sm:mx-8 mb-6 p-4 sm:p-5 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#059669]" />
                <span className="text-xs font-bold text-[#181343]">
                  Kelengkapan Profil Organisasi
                </span>
              </div>
              <span className="text-xs font-bold text-[#059669] tabular-nums">
                {completeness.score}% Lengkap
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Lengkapi data profil lembaga Anda untuk mempercepat proses kurasi dan meningkatkan kepercayaan perusahaan mitra CSR.
            </p>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#059669] h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness.score}%` }}
              />
            </div>

            {completeness.missing.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                <span className="text-slate-500 font-medium">Lengkapi:</span>
                {completeness.missing.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (item.includes("Logo") || item.includes("sampul") || item.includes("Tagline")) {
                        setEditCategory("branding");
                      } else if (item.includes("SK") || item.includes("NPWP")) {
                        setEditCategory("legal");
                      } else if (item.includes("Portofolio") || item.includes("kegiatan")) {
                        setEditCategory("portfolio");
                      } else if (item.includes("PIC") || item.includes("pengurus")) {
                        setEditCategory("team");
                      } else {
                        setEditCategory("info");
                      }
                      setIsEditingProfile(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-[#E5E7EB] text-[#059669] font-semibold hover:border-[#059669] hover:bg-emerald-50 transition cursor-pointer"
                  >
                    <span>+ {item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4 Live Impact Highlight Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Kerja Sama Aktif
            </span>
            <HeartHandshake className="w-4 h-4 text-[#059669] shrink-0" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#181343] tracking-tight block tabular-nums">
              {realMetrics.activeCooperations} Program
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block truncate">
              {realMetrics.activeCooperations > 0
                ? "Program kemitraan aktif berjalan"
                : "Belum ada kerja sama aktif"}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Program Selesai
            </span>
            <Award className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#181343] tracking-tight block tabular-nums">
              {realMetrics.completedPrograms}
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Dari {realMetrics.totalPrograms} total program terdaftar
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Kegiatan Terlaksana
            </span>
            <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#181343] tracking-tight block tabular-nums">
              {realMetrics.totalActivities} Aktivitas
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Intervensi lapangan terealisasi
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Penilaian Penerima Manfaat
            </span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          </div>
          <div>
            {realMetrics.totalReviews > 0 && realMetrics.averageRating > 0 ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-[#181343] tracking-tight tabular-nums">
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
                  -
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  Belum ada evaluasi penerima manfaat
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Detail Pill Tabs & Clean Card Body */}
      <div className="space-y-5">
        <div
          className="flex items-center gap-2 overflow-x-auto max-w-full pb-1"
          role="tablist"
          aria-label="Detail profil mitra"
        >
          {[
            { id: "about" as const, label: "Profil & Informasi", icon: Building2 },
            { id: "portfolio" as const, label: "Portofolio Program & Kegiatan", count: programList.length + pastActivities.length, icon: Layers },
            { id: "legal" as const, label: "Legalitas & Dokumen", icon: ShieldCheck },
            { id: "team" as const, label: "Tim & Pengurus", count: teamMembers.length, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40 ${
                  isSelected
                    ? "bg-[#181343] text-white border-[#181343]"
                    : "bg-white text-slate-700 border-[#E5E7EB] hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
                      isSelected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          {/* Tab Body */}
          <div className="p-6 sm:p-8">
            {/* TAB 1: PROFIL & INFORMASI LEMBAGA */}
            {activeTab === "about" && (
              <div className="space-y-8 animate-in fade-in duration-150">
                {/* Visi & Komitmen Kelembagaan */}
                {p.tagline && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#059669] text-xs font-bold">
                      <Award className="w-4 h-4 text-[#059669]" />
                      <span>Visi &amp; Komitmen Kelembagaan</span>
                    </div>
                    <p className="text-sm sm:text-base text-[#181343] leading-relaxed font-medium">
                      &ldquo;{p.tagline}&rdquo;
                    </p>
                  </div>
                )}

                {/* Deskripsi Profil */}
                <div className="space-y-2.5">
                  <h3 className="text-base font-bold text-[#181343]">
                    Profil Lembaga &amp; Latar Belakang
                  </h3>
                  {p.description ? (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {p.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Belum ada narasi profil lembaga yang ditambahkan.
                    </p>
                  )}
                </div>

                {/* Fokus Spesialisasi & Identitas Organisasi */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-[#181343]">
                    Fokus Spesialisasi &amp; Identitas Organisasi
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-slate-400" /> Bidang Keahlian
                      </span>
                      <span className="font-bold text-[#181343] block truncate">
                        {getFocusAreaLabel(p.focusArea || "LAINNYA")}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> Bentuk Lembaga
                      </span>
                      <span className="font-bold text-[#181343] block">
                        {p.organizationType || "Yayasan"}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tahun Berdiri
                      </span>
                      <span className="font-bold text-[#181343] block">
                        {p.foundedYear ? `Tahun ${p.foundedYear}` : "-"}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> Wilayah Kerja
                      </span>
                      <span className="font-bold text-[#181343] block truncate">
                        {[p.city, p.province].filter(Boolean).join(", ") || "Seluruh Indonesia"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detail Kontak & Domisili Resmi */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-[#181343] mb-4">
                    Informasi Domisili &amp; Kontak Resmi
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Resmi
                      </span>
                      <span className="font-bold text-[#181343] block truncate">
                        {p.email || "-"}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Telepon
                      </span>
                      <span className="font-bold text-[#181343] block">
                        {p.phone || "-"}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> Kantor Sekretariat
                      </span>
                      <span className="font-bold text-[#181343] block truncate">
                        {p.address ? `${p.address}, ${p.city || ""}` : [p.city, p.province].filter(Boolean).join(", ") || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PORTOFOLIO KEGIATAN & KOLABORASI */}
            {activeTab === "portfolio" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Portofolio Program &amp; Rekam Jejak
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar program kolaborasi kemitraan dan rekam jejak kegiatan lapangan lembaga.
                    </p>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    {/* Status Program Filter */}
                    <div className="relative flex-1 sm:w-48 sm:flex-initial">
                      <select
                        value={programStatusFilter}
                        onChange={(e) => setProgramStatusFilter(e.target.value)}
                        aria-label="Filter Status Program"
                        className="w-full h-[38px] pl-3.5 pr-9 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="IN_PROGRESS">Sedang Berjalan</option>
                        <option value="COMPLETED">Selesai</option>
                        <option value="PLANNED">Persiapan</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Fokus Program Filter */}
                    <div className="relative flex-1 sm:w-48 sm:flex-initial">
                      <select
                        value={programFocusFilter}
                        onChange={(e) => setProgramFocusFilter(e.target.value)}
                        aria-label="Filter Fokus Program"
                        className="w-full h-[38px] pl-3.5 pr-9 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer truncate"
                      >
                        {focusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {isFilterActive && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="h-[38px] px-3 inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Section 1: Program Kemitraan CSR Terverifikasi */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-[#059669]" />
                      <span>Program Kemitraan CSR Terverifikasi ({filteredPrograms.length})</span>
                    </h4>
                    <span className="text-xs text-slate-400">
                      Berdasarkan MoU dan monitoring aktual
                    </span>
                  </div>

                  {filteredPrograms.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9F9FB] space-y-2">
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
                      {filteredPrograms.map((prog: any) => {
                        const focusConfig = FOCUS_AREA_CONFIG[prog.focusArea as keyof typeof FOCUS_AREA_CONFIG] || FOCUS_AREA_CONFIG.LAINNYA;
                        const statusBadgeConfig = (() => {
                          switch (prog.status) {
                            case "COMPLETED":
                              return { label: "Selesai", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
                            case "IN_PROGRESS":
                              return { label: "Sedang Berjalan", bg: "bg-blue-50 text-blue-800 border-blue-200" };
                            case "PLANNED":
                              return { label: "Persiapan", bg: "bg-amber-50 text-amber-800 border-amber-200" };
                            default:
                              return { label: prog.status, bg: "bg-slate-100 text-slate-700 border-slate-200" };
                          }
                        })();

                        return (
                          <div
                            key={prog.id}
                            className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <Badge variant={focusConfig.variant} size="sm">
                                  {focusConfig.label}
                                </Badge>
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeConfig.bg}`}
                                >
                                  {statusBadgeConfig.label}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                                {prog.title}
                              </h4>

                              {prog.description && (
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {prog.description}
                                </p>
                              )}

                              {prog.companyName && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 p-2 rounded-xl">
                                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span className="truncate">Sponsor: <strong>{prog.companyName}</strong></span>
                                </div>
                              )}

                              {prog.budget && (
                                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1 text-xs">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500 font-medium">Alokasi Anggaran:</span>
                                    <span className="font-bold text-emerald-700">
                                      {formatRupiah(prog.budget)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                              <span className="flex items-center gap-1 text-[11px]">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {[prog.targetCity, prog.targetProvince].filter(Boolean).join(", ") || "Lokasi belum ditentukan"}
                              </span>

                              {(prog.actualBeneficiaries || prog.targetBeneficiaries) && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  {prog.actualBeneficiaries || prog.targetBeneficiaries} Penerima
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sub-Section 2: Rekam Jejak Portofolio Lapangan */}
                {pastActivities.length > 0 && (
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#059669]" />
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
                          className="text-xs text-[#059669] hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                        >
                          Kelola Portofolio
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastActivities.map((act, idx) => (
                        <div
                          key={act.id || idx}
                          className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1">
                                {act.title}
                              </h4>
                              {act.year && (
                                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md shrink-0">
                                  {act.year}
                                </span>
                              )}
                            </div>

                            {act.description && (
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {act.description}
                              </p>
                            )}

                            {act.photoUrl && (
                              <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-100">
                                <img
                                  src={act.photoUrl}
                                  alt={act.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="text-[11px]">
                              {act.clientSponsor ? `Mitra: ${act.clientSponsor}` : "Inisiatif Mandiri"}
                            </span>
                            {act.beneficiaries && (
                              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
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

            {/* TAB 3: LEGALITAS & DOKUMEN */}
            {activeTab === "legal" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Administrative Verification Banner */}
                <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${adminVerification.badgeBg}`}>
                  <adminVerification.icon className={`w-5 h-5 shrink-0 mt-0.5 ${adminVerification.iconColor}`} />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm">
                      Status Verifikasi Administratif: {adminVerification.label}
                    </h4>
                    <p className="text-xs leading-relaxed opacity-90">
                      {adminVerification.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SK Kemenkumham */}
                  <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#059669]" />
                        SK Pengesahan Kemenkumham
                      </span>
                      <Badge variant={p.legalNumber ? "emerald" : "slate"} size="sm">
                        {p.legalNumber ? "Tercatat di Sistem" : "Belum Ada"}
                      </Badge>
                    </div>
                    <span className="text-base font-extrabold text-[#181343] block font-mono">
                      {p.legalNumber || "Belum dicantumkan"}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Akta Pendirian &amp; Pengesahan Badan Hukum Republik Indonesia.
                    </p>
                  </div>

                  {/* NPWP Lembaga */}
                  <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Nomor Pokok Wajib Pajak (NPWP)
                      </span>
                      <Badge variant={p.npwpNumber ? "blue" : "slate"} size="sm">
                        {p.npwpNumber ? "Wajib Pajak" : "Belum Ada"}
                      </Badge>
                    </div>
                    <span className="text-base font-extrabold text-[#181343] block font-mono">
                      {p.npwpNumber || "Belum dicantumkan"}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      NPWP terdaftar resmi atas nama entitas lembaga.
                    </p>
                  </div>

                  {/* Bentuk Badan Hukum */}
                  <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        Bentuk Badan Hukum
                      </span>
                      <Badge variant="purple" size="sm">
                        {p.organizationType || "Yayasan"}
                      </Badge>
                    </div>
                    <span className="text-base font-extrabold text-[#181343] block">
                      {p.organizationType || "Yayasan"}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Entitas nirlaba resmi pelaksana program pemberdayaan sosial.
                    </p>
                  </div>

                  {/* Company Profile PDF */}
                  <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-[#059669]" />
                        Company Profile Lembaga (PDF)
                      </span>
                      <Badge variant={p.portfolioDocUrl ? "emerald" : "slate"} size="sm">
                        {p.portfolioDocUrl ? "Tersedia" : "Belum Diunggah"}
                      </Badge>
                    </div>
                    {p.portfolioDocUrl ? (
                      <a
                        href={p.portfolioDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline pt-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Berkas Portofolio (PDF)</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 block pt-1 italic">
                        Berkas profil PDF belum diunggah
                      </span>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Dokumen presentasi resmi kapasitas dan rekam jejak organisasi.
                    </p>
                  </div>
                </div>

                {/* Owner Update Action Bar */}
                {isOwner && (
                  <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#181343] block">
                        Perbarui Data Legalitas Organisasi
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pastikan nomor registrasi dan dokumen kelengkapan selalu mutakhir untuk kelancaran kemitraan.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditCategory("legal");
                        setIsEditingProfile(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Perbarui Berkas Legalitas</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: TIM & PENGURUS */}
            {activeTab === "team" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#181343]">
                      Tim Pengurus &amp; Penanggung Jawab Lembaga
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Penanggung jawab kelembagaan dan susunan tim operasional pelaksanaan program di lapangan.
                    </p>
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditCategory("team");
                        setIsEditingProfile(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#181343] hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Kelola Pengurus</span>
                    </button>
                  )}
                </div>

                {teamMembers.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9F9FB]">
                    <Users className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#181343]">
                      Belum ada kontak tim pengurus yang dicantumkan
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      {isOwner
                        ? "Tambahkan nama-nama pengurus atau tim teknis lembaga Anda agar mitra perusahaan dapat berkomunikasi secara langsung."
                        : "Lembaga belum mencantumkan susunan pengurus publik."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {teamMembers.map((member, idx) => {
                      const memberAny = member as any;
                      return (
                        <div
                          key={member.id || idx}
                          className="p-5 rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#059669]/50 transition-colors space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[#181343] text-white flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                              {member.photoUrl ? (
                                <img
                                  src={member.photoUrl}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                member.name?.substring(0, 1).toUpperCase() || "P"
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-[#181343] text-sm truncate">
                                {member.name}
                              </h4>
                              <span className="text-[11px] font-semibold text-[#059669] block truncate">
                                {member.role}
                              </span>
                            </div>
                          </div>

                          {(memberAny.email || memberAny.phone) && (
                            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                              {memberAny.email && (
                                <div className="flex items-center gap-1.5 truncate">
                                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{memberAny.email}</span>
                                </div>
                              )}
                              {memberAny.phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{memberAny.phone}</span>
                                </div>
                              )}
                            </div>
                          )}
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
    </div>
  );
}
