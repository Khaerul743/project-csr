"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Star,
  Users,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  SquarePen,
  ArrowLeft,
  ExternalLink,
  FileText,
  Sparkles,
  Send,
  Download,
  Award,
  Briefcase,
  Camera,
  Layers,
  HeartHandshake,
  DollarSign,
  TrendingUp,
  Filter,
  Check,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, FOCUS_AREA_CONFIG } from "../helpers";
import { CsrLeaderItem, CompanyDetailedProfile } from "@/modules/companies/company.interface";
import { EditCompanyProfilePageView, ProfileCategoryTab } from "./EditCompanyProfilePageView";

interface CompanyFullProfileViewProps {
  company: CompanyDetailedProfile | any;
  programs?: any[];
  collaborations?: any[];
  isLoadingPrograms?: boolean;
  isOwner?: boolean;
  onBack?: () => void;
  onOpenChat?: () => void;
  onApplyOpportunity?: (opp: any) => void;
  onProfileUpdated?: (updated: CompanyDetailedProfile) => void;
}

export function CompanyFullProfileView({
  company,
  programs = [],
  collaborations = [],
  isLoadingPrograms = false,
  isOwner = false,
  onBack,
  onOpenChat,
  onApplyOpportunity,
  onProfileUpdated,
}: CompanyFullProfileViewProps) {
  const [currentCompany, setCurrentCompany] = useState(company);
  const [activeTab, setActiveTab] = useState<"about" | "programs" | "legal" | "leaders">("about");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editCategory, setEditCategory] = useState<ProfileCategoryTab>("info");

  // Filters for Portofolio Program CSR
  const [programStatusFilter, setProgramStatusFilter] = useState<string>("ALL");
  const [programFocusFilter, setProgramFocusFilter] = useState<string>("ALL");

  // Sync state if prop changes
  React.useEffect(() => {
    setCurrentCompany(company);
  }, [company]);

  const c = currentCompany;

  // Parse CSR Leaders from JSON or Array
  const csrLeaders: CsrLeaderItem[] = useMemo(() => {
    if (!c?.csrLeaders) return [];
    if (Array.isArray(c.csrLeaders)) return c.csrLeaders;
    try {
      return JSON.parse(c.csrLeaders);
    } catch {
      return [];
    }
  }, [c?.csrLeaders]);

  // Combined program list from props or company object
  const programList = useMemo(() => {
    if (programs && programs.length > 0) return programs;
    if (c?.programs && Array.isArray(c.programs)) return c.programs;
    return [];
  }, [programs, c?.programs]);

  // Combined collaborations list
  const collabList = useMemo(() => {
    if (collaborations && collaborations.length > 0) return collaborations;
    if (c?.collaborations && Array.isArray(c.collaborations)) return c.collaborations;
    return [];
  }, [collaborations, c?.collaborations]);

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
        return "Inisiatif Lainnya";
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
    ];

    const added = new Set(baseOptions.map((o) => o.value));

    // Dynamically include other categories based on available program data
    programList.forEach((p: any) => {
      if (p.focusArea && !added.has(p.focusArea)) {
        added.add(p.focusArea);
        baseOptions.push({
          value: p.focusArea,
          label: getFocusAreaLabel(p.focusArea),
        });
      }
    });

    return baseOptions;
  }, [programList]);

  // Calculate administrative verification status based on actual legal documents & verification flags
  const adminVerification = useMemo(() => {
    const explicitStatus = (c?.verificationStatus || "").toUpperCase();
    const hasNib = Boolean(c?.nibNumber && c.nibNumber.trim().length > 3);
    const hasNpwp = Boolean(c?.npwpNumber && c.npwpNumber.trim().length > 3);
    const isSystemActive = c?.status === "ACTIVE" || !c?.status;

    if (explicitStatus === "VERIFIED" || (hasNib && hasNpwp && isSystemActive)) {
      return {
        status: "VERIFIED" as const,
        label: "Terverifikasi Administratif",
        badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
        iconColor: "text-emerald-600",
        icon: ShieldCheck,
        description: "Dokumen legalitas badan usaha (NIB & NPWP) telah terverifikasi sah dalam sistem SIPENA.",
      };
    }

    if (explicitStatus === "PENDING" || hasNib || hasNpwp) {
      return {
        status: "PENDING" as const,
        label: "Menunggu Verifikasi Legalitas",
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
      description: "Perusahaan belum melengkapi dokumen legalitas resmi (NIB & NPWP) untuk verifikasi institusional.",
    };
  }, [c?.verificationStatus, c?.nibNumber, c?.npwpNumber, c?.status]);

  // Calculate profile completeness (measures public information completion, distinct from legal verification)
  const completeness = useMemo(() => {
    let score = 0;
    const missing: string[] = [];

    if (c?.name) score += 10;
    if (c?.tagline) score += 15;
    else missing.push("Tagline keberlanjutan");

    if (c?.logoUrl) score += 10;
    else missing.push("Logo resmi perusahaan");

    if (c?.coverUrl) score += 15;
    else missing.push("Foto sampul profil");

    if (c?.industry) score += 10;
    else missing.push("Sektor industri");

    if (c?.csrVision && c.csrVision.length > 30) score += 15;
    else missing.push("Visi & komitmen ESG / CSR");

    if (c?.nibNumber || c?.npwpNumber) score += 10;
    else missing.push("Nomor NIB / NPWP");

    if (c?.sustainabilityReportUrl) score += 10;
    else missing.push("Laporan Keberlanjutan (PDF)");

    if (csrLeaders.length > 0) score += 5;
    else missing.push("Kontak PIC / Tim CSR");

    return { score: Math.min(100, score), missing };
  }, [c, csrLeaders]);

  // Fallback backend metrics
  const fallbackMetrics = c?.metrics || {
    totalDisbursedBudget: 0,
    totalAllocatedBudget: 0,
    completedPrograms: 0,
    totalPrograms: 0,
    totalOpportunities: 0,
    totalPartnersEngaged: 0,
    averageRating: 0,
    totalReviews: 0,
  };

  // Compute live, accurate statistics from real data
  const realMetrics = useMemo(() => {
    if (programList.length > 0) {
      const totalAllocated = programList.reduce((acc: number, p: any) => acc + Number(p.budget || 0), 0);
      const totalRealized = programList.reduce((acc: number, p: any) => acc + Number(p.spentBudget || 0), 0);
      const completed = programList.filter((p: any) => p.status === "COMPLETED").length;

      // Calculate distinct partner organizations that actually collaborate
      const activeCollabPartners = collabList
        .filter((col: any) => col.status === "AGREED" || col.status === "ACTIVE")
        .map((col: any) => col.partnerId)
        .filter(Boolean);

      const activeProgramPartners = programList
        .filter((p: any) => p.status === "IN_PROGRESS" || p.status === "COMPLETED")
        .map((p: any) => p.partnerId)
        .filter(Boolean);

      const uniquePartners = new Set([...activeCollabPartners, ...activeProgramPartners]);
      const partnersCount = uniquePartners.size > 0 ? uniquePartners.size : (fallbackMetrics.totalPartnersEngaged || 0);

      return {
        totalRealizedBudget: totalRealized,
        totalAllocatedBudget: totalAllocated,
        completedPrograms: completed,
        totalPrograms: programList.length,
        totalPartnersEngaged: partnersCount,
        averageRating: fallbackMetrics.averageRating || 0,
        totalReviews: fallbackMetrics.totalReviews || 0,
      };
    }

    return {
      totalRealizedBudget: fallbackMetrics.totalDisbursedBudget || 0,
      totalAllocatedBudget: fallbackMetrics.totalAllocatedBudget || 0,
      completedPrograms: fallbackMetrics.completedPrograms || 0,
      totalPrograms: fallbackMetrics.totalPrograms || 0,
      totalPartnersEngaged: fallbackMetrics.totalPartnersEngaged || 0,
      averageRating: fallbackMetrics.averageRating || 0,
      totalReviews: fallbackMetrics.totalReviews || 0,
    };
  }, [programList, collabList, fallbackMetrics]);

  // Filtered programs for Tab 2
  const filteredPrograms = useMemo(() => {
    return programList.filter((p: any) => {
      const matchStatus = programStatusFilter === "ALL" || p.status === programStatusFilter;
      const matchFocus = programFocusFilter === "ALL" || p.focusArea === programFocusFilter;
      return matchStatus && matchFocus;
    });
  }, [programList, programStatusFilter, programFocusFilter]);

  // Filter activity status
  const isFilterActive = programStatusFilter !== "ALL" || programFocusFilter !== "ALL";

  // Reset filter handler
  const handleResetFilters = () => {
    setProgramStatusFilter("ALL");
    setProgramFocusFilter("ALL");
  };

  // Dynamic Empty State calculation according to business specifications
  const emptyStateContent = useMemo(() => {
    const isAllStatus = programStatusFilter === "ALL";
    const isAllFocus = programFocusFilter === "ALL";
    const isPlanned = programStatusFilter === "PLANNED";
    const isProgress = programStatusFilter === "IN_PROGRESS";
    const isCompleted = programStatusFilter === "COMPLETED";

    const currentFocusOption = focusOptions.find((o) => o.value === programFocusFilter);
    const focusLabel = currentFocusOption ? currentFocusOption.label : getFocusAreaLabel(programFocusFilter);

    // 1. Semua Status + Semua Fokus
    if (isAllStatus && isAllFocus) {
      return {
        title: "Belum Ada Program CSR",
        description: "Program CSR perusahaan akan ditampilkan di sini setelah tersedia.",
      };
    }

    // 2. Persiapan + Semua Fokus
    if (isPlanned && isAllFocus) {
      return {
        title: "Belum Ada Program dalam Tahap Persiapan",
        description: "Program yang telah disepakati dan sedang dipersiapkan akan ditampilkan di sini.",
      };
    }

    // 3. Sedang Berjalan + Semua Fokus
    if (isProgress && isAllFocus) {
      return {
        title: "Belum Ada Program yang Sedang Berjalan",
        description: "Program yang sedang dilaksanakan akan muncul di sini.",
      };
    }

    // 4. Selesai + Semua Fokus
    if (isCompleted && isAllFocus) {
      return {
        title: "Belum Ada Program yang Selesai",
        description: "Program yang telah menyelesaikan tahap pelaksanaan akan ditampilkan di sini.",
      };
    }

    // 5. Semua Status + Fokus Tertentu
    if (isAllStatus && !isAllFocus) {
      return {
        title: `Belum Ada Program ${focusLabel}`,
        description: "Belum tersedia program CSR dalam bidang ini. Coba pilih fokus lainnya.",
      };
    }

    // 6. Persiapan + Fokus Tertentu
    if (isPlanned && !isAllFocus) {
      return {
        title: `Belum Ada Program ${focusLabel} dalam Tahap Persiapan`,
        description: "Belum tersedia program persiapan dalam bidang ini. Coba sesuaikan filter untuk melihat program lainnya.",
      };
    }

    // 7. Sedang Berjalan + Fokus Tertentu
    if (isProgress && !isAllFocus) {
      return {
        title: `Belum Ada Program ${focusLabel} yang Sedang Berjalan`,
        description: "Belum tersedia program aktif dalam bidang ini. Coba sesuaikan filter untuk melihat program lainnya.",
      };
    }

    // 8. Selesai + Fokus Tertentu
    if (isCompleted && !isAllFocus) {
      return {
        title: `Belum Ada Program ${focusLabel} yang Selesai`,
        description: "Belum tersedia program selesai dalam bidang ini. Coba sesuaikan filter untuk melihat program lainnya.",
      };
    }

    // Fallback
    return {
      title: `Belum Ada Program ${focusLabel}`,
      description: "Belum tersedia program yang sesuai dengan filter yang dipilih. Coba sesuaikan filter lainnya.",
    };
  }, [programStatusFilter, programFocusFilter, focusOptions]);

  const openOpportunities = c?.openOpportunities || [];

  const handleSuccessUpdate = (updated: any) => {
    setCurrentCompany(updated);
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  if (isEditingProfile) {
    return (
      <EditCompanyProfilePageView
        company={currentCompany}
        initialCategory={editCategory}
        onBack={() => setIsEditingProfile(false)}
        onProfileUpdated={(updated) => {
          handleSuccessUpdate(updated);
          setIsEditingProfile(false);
        }}
      />
    );
  }

  if (!c) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm">Data profil perusahaan tidak ditemukan.</p>
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
      {/* Top Navigation Bar (When viewed by partner or has onBack) */}
      {onBack && (
        <div className="flex items-center justify-between gap-4 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
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
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="text-xs font-bold"
              >
                Kirim Pesan
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-40 sm:h-52 w-full bg-gradient-to-r from-[#181343] via-slate-900 to-[#064E3B] overflow-hidden">
          {c.coverUrl ? (
            <img
              src={c.coverUrl}
              alt={c.name}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300/80 p-6 text-center">
              <Building2 className="w-10 h-10 text-white/30 mb-1.5" />
              <p className="text-xs text-white/60 font-medium">
                Belum ada foto sampul profil perusahaan
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
              <div
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center font-black text-2xl sm:text-3xl ${
                  c.logoUrl ? "bg-white" : "bg-[#181343] text-white"
                }`}
              >
                {c.logoUrl ? (
                  <img
                    src={c.logoUrl}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  c.name?.substring(0, 2).toUpperCase() || "CP"
                )}
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setEditCategory("branding");
                    setIsEditingProfile(true);
                  }}
                  className="absolute bottom-1 right-1 p-2 bg-[#059669] hover:bg-[#047857] text-white rounded-full shadow-md transition-transform active:scale-95 cursor-pointer"
                  title="Ganti Logo Perusahaan"
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
                  <span>Edit Profil Perusahaan</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {onOpenChat && (
                    <Button
                      variant="primary"
                      onClick={onOpenChat}
                      leftIcon={<Send className="w-4 h-4 shrink-0" />}
                      className="text-xs px-5 py-2.5"
                    >
                      Kirim Pesan
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
                {c.name}
              </h1>
              
              {/* Administrative Verification Badge (Calculated from actual data) */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-2xs ${adminVerification.badgeBg}`}
                title={adminVerification.description}
              >
                <adminVerification.icon className={`w-4 h-4 ${adminVerification.iconColor}`} />
                <span>{adminVerification.label}</span>
              </div>
            </div>

            {c.tagline ? (
              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug max-w-3xl">
                {c.tagline}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {isOwner
                  ? "Tambahkan slogan atau fokus komitmen keberlanjutan perusahaan Anda..."
                  : "Perusahaan Penyelenggara Program CSR & Keberlanjutan."}
              </p>
            )}

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs text-slate-500 font-medium">
              {c.industry && (
                <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  {c.industry}
                </span>
              )}

              {c.companySize && (
                <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {c.companySize}
                </span>
              )}

              {(c.city || c.province) && (
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {[c.city, c.province].filter(Boolean).join(", ")}
                </span>
              )}

              {c.foundedYear && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Berdiri {c.foundedYear}
                </span>
              )}

              {c.website && (
                <a
                  href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website Resmi</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              )}

              {c.linkedinUrl && (
                <a
                  href={c.linkedinUrl}
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
              Lengkapi informasi publik perusahaan untuk membangun transparansi di hadapan mitra CSR (terpisah dari validasi dokumen legal NIB &amp; NPWP).
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
                      } else if (item.includes("ESG") || item.includes("CSR")) {
                        setEditCategory("csr");
                      } else if (item.includes("NIB") || item.includes("Laporan")) {
                        setEditCategory("legal");
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
              Realisasi Anggaran CSR
            </span>
            <DollarSign className="w-4 h-4 text-[#059669] shrink-0" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#181343] tracking-tight block tabular-nums">
              {formatRupiah(realMetrics.totalRealizedBudget)}
            </span>
            <span
              className="text-[11px] text-slate-400 font-medium mt-0.5 block truncate"
              title={
                realMetrics.totalAllocatedBudget > 0
                  ? `Alokasi Anggaran: ${formatRupiah(realMetrics.totalAllocatedBudget)}`
                  : "Pengeluaran dana program terealisasi"
              }
            >
              {realMetrics.totalAllocatedBudget > 0
                ? `Alokasi: ${formatRupiah(realMetrics.totalAllocatedBudget)}`
                : "Dana program terealisasi"}
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
              Dari {realMetrics.totalPrograms} total program terkelola
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Mitra Berkolaborasi
            </span>
            <HeartHandshake className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#181343] tracking-tight block tabular-nums">
              {realMetrics.totalPartnersEngaged} Mitra
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              {realMetrics.totalPartnersEngaged > 0
                ? "Organisasi mitra pelaksana resmi"
                : "Belum ada kemitraan aktif"}
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
          aria-label="Detail profil perusahaan"
        >
          {[
            { id: "about" as const, label: "Profil & Informasi", icon: Building2 },
            { id: "programs" as const, label: "Portofolio Program CSR", count: programList.length, icon: Layers },
            { id: "legal" as const, label: "Legalitas & Dokumen", icon: ShieldCheck },
            { id: "leaders" as const, label: "Tim Pengelola CSR", count: csrLeaders.length, icon: Users },
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
            {/* TAB 1: PROFIL & INFORMASI PERUSAHAAN */}
            {activeTab === "about" && (
              <div className="space-y-8 animate-in fade-in duration-150">
                {/* Visi & Komitmen ESG */}
                {c.csrVision && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#059669] text-xs font-bold">
                      <Award className="w-4 h-4 text-[#059669]" />
                      <span>Visi &amp; Komitmen Keberlanjutan (ESG Vision)</span>
                    </div>
                    <p className="text-sm sm:text-base text-[#181343] leading-relaxed font-medium">
                      &ldquo;{c.csrVision}&rdquo;
                    </p>
                  </div>
                )}

                {/* Deskripsi Profil */}
                <div className="space-y-2.5">
                  <h3 className="text-base font-bold text-[#181343]">
                    Profil Perusahaan &amp; Latar Belakang
                  </h3>
                  {c.description ? (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {c.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Belum ada narasi profil perusahaan yang ditambahkan.
                    </p>
                  )}
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
                        {c.email || "-"}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Telepon
                      </span>
                      <span className="font-bold text-[#181343] block">
                        {c.phone || "-"}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> Kantor Pusat
                      </span>
                      <span className="font-bold text-[#181343] block truncate">
                        {c.address ? `${c.address}, ${c.city || ""}` : [c.city, c.province].filter(Boolean).join(", ") || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* TAB 2: PORTOFOLIO PROGRAM CSR (Filter & Dynamic Empty State) */}
          {activeTab === "programs" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Portofolio Pelaksanaan Program CSR
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daftar program CSR yang terencana, aktif berjalan, dan telah selesai, mencakup kontribusi pilar SDGs/ESG.
                  </p>
                </div>

                {/* Filter Controls: Status Program & Fokus Program (Setara Dimensi & Alignment) */}
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
                      <option value="PLANNED">Persiapan</option>
                      <option value="IN_PROGRESS">Sedang Berjalan</option>
                      <option value="COMPLETED">Selesai</option>
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
                </div>
              </div>

              {/* Program Cards List / Loading State / Dynamic Empty State */}
              {isLoadingPrograms ? (
                <div className="py-14 text-center rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                  <p className="text-xs font-medium text-slate-500">Memuat data portofolio program CSR...</p>
                </div>
              ) : filteredPrograms.length === 0 ? (
                /* Dynamic Empty State Container */
                <div className="py-12 sm:py-14 px-6 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                  <Layers className="w-9 h-9 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-[#181343]">
                      {emptyStateContent.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      {emptyStateContent.description}
                    </p>
                  </div>

                  {/* Reset Filter Button: Only shown if at least one filter is active */}
                  {isFilterActive && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white border border-[#E5E7EB] text-[#181343] hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#181343]" />
                        <span>Reset Filter</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPrograms.map((program: any) => {
                    const focusConfig = FOCUS_AREA_CONFIG[program.focusArea as keyof typeof FOCUS_AREA_CONFIG] || {
                      label: getFocusAreaLabel(program.focusArea),
                      variant: "slate" as const,
                    };

                    const statusBadgeConfig = (() => {
                      switch (program.status) {
                        case "COMPLETED":
                          return { label: "Selesai", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
                        case "IN_PROGRESS":
                          return { label: "Sedang Berjalan", bg: "bg-blue-50 text-blue-800 border-blue-200" };
                        case "PLANNED":
                          return { label: "Persiapan", bg: "bg-amber-50 text-amber-800 border-amber-200" };
                        case "ON_HOLD":
                          return { label: "Ditunda", bg: "bg-slate-100 text-slate-700 border-slate-200" };
                        default:
                          return { label: program.status, bg: "bg-slate-100 text-slate-700 border-slate-200" };
                      }
                    })();

                    return (
                      <div
                        key={program.id}
                        className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Top Badges: Focus Area (SDGs/ESG) & Status */}
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

                          {/* Title */}
                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                            {program.title}
                          </h4>

                          {/* Description */}
                          {program.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {program.description}
                            </p>
                          )}

                          {/* Partner name if collaborating */}
                          {program.partnerName && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 p-2 rounded-xl">
                              <HeartHandshake className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span className="truncate">Mitra: <strong>{program.partnerName}</strong></span>
                            </div>
                          )}

                          {/* Financial Realization vs Allocation */}
                          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">Realisasi Anggaran:</span>
                              <span className="font-bold text-emerald-700">
                                {formatRupiah(program.spentBudget || 0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 font-medium">Alokasi Total:</span>
                              <span className="font-semibold text-slate-700">
                                {formatRupiah(program.budget)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Location & Beneficiaries */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {[program.targetCity, program.targetProvince].filter(Boolean).join(", ") || "Lokasi belum ditentukan"}
                          </span>

                          {(program.actualBeneficiaries || program.targetBeneficiaries) && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {program.actualBeneficiaries || program.targetBeneficiaries} Penerima
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Peluang Kolaborasi Terbuka (Hanya tampil pada profil publik bagi calon mitra / NGO, bukan pada portofolio internal perusahaan) */}
              {!isOwner && openOpportunities.length > 0 && (
                <div className="pt-8 border-t border-slate-100 space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Peluang Kolaborasi yang Sedang Dibuka ({openOpportunities.length})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Inisiatif CSR terbuka yang dapat diajukan proposal oleh calon mitra pelaksana.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {openOpportunities.map((opp: any) => {
                      const focusConfig = FOCUS_AREA_CONFIG[opp.focusArea as keyof typeof FOCUS_AREA_CONFIG] || {
                        label: getFocusAreaLabel(opp.focusArea),
                        variant: "slate" as const,
                      };

                      return (
                        <div
                          key={opp.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant={focusConfig.variant} size="sm">
                                {focusConfig.label}
                              </Badge>
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                {opp.budget && parseFloat(opp.budget) > 0 ? formatRupiah(opp.budget) : "Menyesuaikan Proposal"}
                              </span>
                            </div>

                            <h5 className="font-extrabold text-slate-900 text-sm leading-snug">
                              {opp.title}
                            </h5>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {opp.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {[opp.city, opp.province].filter(Boolean).join(", ") || "Lokasi belum ditentukan"}
                            </span>

                            {onApplyOpportunity && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => onApplyOpportunity(opp)}
                                className="text-xs font-semibold py-1 px-3"
                              >
                                Ajukan Proposal
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                {/* NIB Card */}
                <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      Nomor Induk Berusaha (NIB OSS)
                    </span>
                    <Badge variant={c.nibNumber ? "emerald" : "slate"} size="sm">
                      {c.nibNumber ? "Terdaftar" : "Belum Ada"}
                    </Badge>
                  </div>
                  <span className="text-base font-extrabold text-[#181343] block font-mono">
                    {c.nibNumber || "Belum dicantumkan"}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Dokumen legalitas berusaha resmi Republik Indonesia.
                  </p>
                </div>

                {/* NPWP Card */}
                <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      NPWP Perusahaan
                    </span>
                    <Badge variant={c.npwpNumber ? "blue" : "slate"} size="sm">
                      {c.npwpNumber ? "Wajib Pajak" : "Belum Ada"}
                    </Badge>
                  </div>
                  <span className="text-base font-extrabold text-[#181343] block font-mono">
                    {c.npwpNumber || "Belum dicantumkan"}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Nomor Pokok Wajib Pajak badan hukum terdaftar.
                  </p>
                </div>
              </div>

              {/* Sustainability Report Download Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F9F9FB] border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200/70 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#181343] text-sm sm:text-base">
                      Laporan Keberlanjutan &amp; Dampak ESG (Sustainability Report)
                    </h4>
                    <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                      Laporan resmi tahunan yang memuat rekam jejak dampak sosial, tata kelola lingkungan, dan transparansi penyaluran dana program CSR.
                    </p>
                  </div>
                </div>

                {c.sustainabilityReportUrl ? (
                  <a
                    href={c.sustainabilityReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white font-semibold text-xs transition-all shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Laporan (PDF)</span>
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 italic shrink-0">
                    Laporan belum diunggah
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TIM PENGELOLA CSR */}
          {activeTab === "leaders" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Tim Pengelola &amp; Penanggung Jawab CSR
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Penanggung jawab inisiatif kemitraan dan koordinasi teknis program CSR perusahaan.
                  </p>
                </div>
              </div>

              {csrLeaders.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9F9FB]">
                  <Users className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#181343]">
                    Belum ada kontak tim pengelola yang dicantumkan
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {isOwner
                      ? "Tambahkan kontak person atau pimpinan CSR perusahaan Anda agar mitra pelaksana dapat berkomunikasi secara langsung."
                      : "Perusahaan belum mencantumkan PIC tim CSR publik."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {csrLeaders.map((leader, idx) => (
                    <div
                      key={leader.id || idx}
                      className="p-5 rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#059669]/50 transition-colors space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#181343] text-white flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                          {leader.photoUrl ? (
                            <img
                              src={leader.photoUrl}
                              alt={leader.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            leader.name?.substring(0, 1).toUpperCase() || "P"
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-[#181343] text-sm truncate">
                            {leader.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-[#059669] block truncate">
                            {leader.role}
                          </span>
                        </div>
                      </div>

                      {(leader.email || leader.phone) && (
                        <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                          {leader.email && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{leader.email}</span>
                            </div>
                          )}
                          {leader.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{leader.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
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
