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
  Edit3,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, FOCUS_AREA_CONFIG } from "../helpers";
import { CsrLeaderItem, CompanyDetailedProfile } from "@/modules/companies/company.interface";
import { EditCompanyProfileModal } from "./EditCompanyProfileModal";

interface CompanyFullProfileViewProps {
  company: CompanyDetailedProfile | any;
  isOwner?: boolean;
  onBack?: () => void;
  onOpenChat?: () => void;
  onApplyOpportunity?: (opp: any) => void;
  onProfileUpdated?: (updated: CompanyDetailedProfile) => void;
}

export function CompanyFullProfileView({
  company,
  isOwner = false,
  onBack,
  onOpenChat,
  onApplyOpportunity,
  onProfileUpdated,
}: CompanyFullProfileViewProps) {
  const [currentCompany, setCurrentCompany] = useState(company);
  const [activeTab, setActiveTab] = useState<"about" | "opportunities" | "legal" | "leaders">("about");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sync state if prop changes
  React.useEffect(() => {
    setCurrentCompany(company);
  }, [company]);

  const c = currentCompany;

  // Parse CSR Leaders from JSON
  const csrLeaders: CsrLeaderItem[] = useMemo(() => {
    if (!c?.csrLeaders) return [];
    if (Array.isArray(c.csrLeaders)) return c.csrLeaders;
    try {
      return JSON.parse(c.csrLeaders);
    } catch {
      return [];
    }
  }, [c?.csrLeaders]);

  // Calculate profile completeness (for owner)
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

  const handleSuccessUpdate = (updated: any) => {
    setCurrentCompany(updated);
    if (onProfileUpdated) onProfileUpdated(updated);
  };

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

  const metrics = c.metrics || {
    totalDisbursedBudget: 0,
    completedPrograms: 0,
    totalPrograms: 0,
    totalOpportunities: 0,
    totalPartnersEngaged: 0,
    averageRating: 0,
    totalReviews: 0,
  };

  const openOpportunities = c.openOpportunities || [];

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

      {/* Main Header / LinkedIn-Style Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 overflow-hidden">
          {c.coverUrl ? (
            <img
              src={c.coverUrl}
              alt={c.name}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Building2 className="w-12 h-12 text-slate-700/60 mb-2" />
              <p className="text-xs text-slate-400 font-medium">
                Belum ada foto sampul profil perusahaan
              </p>
            </div>
          )}

          {/* Quick Edit Cover Button if Owner */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
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
                  {c.logoUrl ? (
                    <img
                      src={c.logoUrl}
                      alt={c.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    c.name.substring(0, 2).toUpperCase()
                  )}
                </div>
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-1 right-1 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
                  title="Ubah Logo Perusahaan"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action Buttons Top-Right */}
            <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-end">
              {isOwner ? (
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profil Perusahaan</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {onOpenChat && (
                    <Button
                      onClick={onOpenChat}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Kirim Pesan</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name & Tagline */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {c.name}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Perusahaan Terverifikasi</span>
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
          <div className="mx-6 sm:mx-10 mb-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Kelengkapan Profil Korporat
                </span>
              </div>
              <span className="text-xs font-black text-emerald-700">
                {completeness.score}% Selesai
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness.score}%` }}
              />
            </div>

            {completeness.missing.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="text-slate-500 font-medium">Tingkatkan kredibilitas dengan melengkapi:</span>
                {completeness.missing.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50 transition"
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
        {/* Metric 1: Realisasi Dana CSR */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Realisasi Dana CSR
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {formatRupiah(metrics.totalDisbursedBudget)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Teralokasi dalam program aktif & selesai
            </span>
          </div>
        </div>

        {/* Metric 2: Program Selesai */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Program CSR Selesai
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {metrics.completedPrograms}
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Dari total {metrics.totalPrograms} program terlaksana
            </span>
          </div>
        </div>

        {/* Metric 3: Mitra NGO Digandeng */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mitra NGO Digandeng
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {metrics.totalPartnersEngaged} Mitra
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Yayasan & komunitas pelaksana
            </span>
          </div>
        </div>

        {/* Metric 4: Indeks Kepuasan Warga */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kepuasan Warga
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : "Baru"}
              </span>
              {metrics.averageRating > 0 && (
                <span className="text-xs font-bold text-slate-400">/ 5.0</span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Berdasarkan {metrics.totalReviews} ulasan masyarakat
            </span>
          </div>
        </div>
      </div>

      {/* Profile Detail Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/60 px-6 gap-2 sm:gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "about"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tentang & Komitmen ESG</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("opportunities")}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "opportunities"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Inisiatif CSR Aktif ({openOpportunities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("legal")}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "legal"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Legalitas & Berkas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leaders")}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "leaders"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tim & PIC Keberlanjutan ({csrLeaders.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-10">
          {/* TAB 1: TENTANG & KOMITMEN ESG */}
          {activeTab === "about" && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* Visi & Komitmen ESG */}
              {c.csrVision && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase tracking-wider">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Visi & Komitmen Keberlanjutan (ESG Vision)</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                    "{c.csrVision}"
                  </p>
                </div>
              )}

              {/* Deskripsi Profil */}
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  Profil Perusahaan & Latar Belakang
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
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
                  Informasi Domisili & Kontak Resmi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Resmi
                    </span>
                    <span className="font-bold text-slate-800 block truncate">
                      {c.email || "-"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Telepon
                    </span>
                    <span className="font-bold text-slate-800 block">
                      {c.phone || "-"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Kantor Pusat
                    </span>
                    <span className="font-bold text-slate-800 block truncate">
                      {c.address ? `${c.address}, ${c.city || ""}` : [c.city, c.province].filter(Boolean).join(", ") || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INISIATIF & PELUANG CSR AKTIF */}
          {activeTab === "opportunities" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Peluang Kolaborasi yang Sedang Terbuka
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mitra pelaksana / NGO dapat mengajukan proposal kemitraan langsung untuk program berikut.
                  </p>
                </div>
              </div>

              {openOpportunities.length === 0 ? (
                <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">
                    Belum ada inisiatif CSR yang sedang dibuka saat ini
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Perusahaan ini belum membuka peluang baru atau program sebelumnya sedang dalam tahap evaluasi.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openOpportunities.map((opp: any) => {
                    const focusConfig = FOCUS_AREA_CONFIG[opp.focusArea as keyof typeof FOCUS_AREA_CONFIG] || {
                      label: opp.focusArea,
                      variant: "slate" as const,
                    };

                    return (
                      <div
                        key={opp.id}
                        className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant={focusConfig.variant} size="sm">
                              {focusConfig.label}
                            </Badge>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                              {formatRupiah(opp.budget)}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                            {opp.title}
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {opp.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {opp.city || opp.province || "Nasional"}
                          </span>

                          {!isOwner && onApplyOpportunity && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => onApplyOpportunity(opp)}
                              className="text-xs font-bold py-1 px-3 bg-emerald-600 hover:bg-emerald-700"
                            >
                              Ajukan Proposal
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEGALITAS & LAPORAN KEBERLANJUTAN */}
          {activeTab === "legal" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NIB Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Nomor Induk Berusaha (NIB OSS)
                    </span>
                    <Badge variant="emerald" size="sm">
                      Terdaftar
                    </Badge>
                  </div>
                  <span className="text-base font-extrabold text-slate-900 block font-mono">
                    {c.nibNumber || "Belum dicantumkan"}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Dokumen legalitas berusaha resmi Republik Indonesia.
                  </p>
                </div>

                {/* NPWP Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      NPWP Perusahaan
                    </span>
                    <Badge variant="blue" size="sm">
                      Wajib Pajak
                    </Badge>
                  </div>
                  <span className="text-base font-extrabold text-slate-900 block font-mono">
                    {c.npwpNumber || "Belum dicantumkan"}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Nomor Pokok Wajib Pajak badan hukum terdaftar.
                  </p>
                </div>
              </div>

              {/* Sustainability Report Download Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Laporan Keberlanjutan & Dampak ESG (Sustainability Report)
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all shrink-0"
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

          {/* TAB 4: TIM & PIC KEBERLANJUTAN */}
          {activeTab === "leaders" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Tim Penggerak Keberlanjutan & PIC CSR
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Penanggung jawab inisiatif kemitraan dan koordinasi teknis program CSR.
                  </p>
                </div>
              </div>

              {csrLeaders.length === 0 ? (
                <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">
                    Belum ada kontak PIC yang dicantumkan
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    {isOwner
                      ? "Tambahkan kontak person atau pimpinan CSR perusahaan Anda agar mitra dapat berkomunikasi secara langsung."
                      : "Perusahaan belum mencantumkan PIC publik."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {csrLeaders.map((leader, idx) => (
                    <div
                      key={leader.id || idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-sm">
                          {leader.photoUrl ? (
                            <img
                              src={leader.photoUrl}
                              alt={leader.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            leader.name.substring(0, 1).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">
                            {leader.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-emerald-700 block truncate">
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

      {/* Edit Modal (Owner Only) */}
      {isOwner && (
        <EditCompanyProfileModal
          isOpen={isEditModalOpen}
          company={currentCompany}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleSuccessUpdate}
        />
      )}
    </div>
  );
}
