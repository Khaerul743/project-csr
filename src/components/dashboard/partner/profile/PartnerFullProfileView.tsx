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
  Edit3,
  ArrowLeft,
  ExternalLink,
  FileText,
  Send,
  Download,
  Image as ImageIcon,
  Camera,
  X,
  Clock,
  Compass,
  AlertCircle,
  FileCheck,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FOCUS_AREA_CONFIG } from "../helpers";
import { PastActivityItem, TeamMemberItem } from "@/modules/partners/partner.interface";
import { EditPartnerProfileModal } from "./EditPartnerProfileModal";

interface PartnerFullProfileViewProps {
  partner: any;
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
    <div className="w-full h-full bg-[#181343] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl tracking-wider">
      {initials}
    </div>
  );
}

export function PartnerFullProfileView({
  partner,
  isOwner = false,
  onBack,
  onInvitePitch,
  onInvitePartner,
  onProfileUpdated,
}: PartnerFullProfileViewProps) {
  const [currentPartner, setCurrentPartner] = useState(partner);
  const [activeTab, setActiveTab] = useState<
    "overview" | "activities" | "legal" | "team"
  >("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Sync when prop changes
  React.useEffect(() => {
    setCurrentPartner(partner);
  }, [partner]);

  const p = currentPartner;
  const focusConfig = p?.focusArea ? FOCUS_AREA_CONFIG[p.focusArea as keyof typeof FOCUS_AREA_CONFIG] : null;

  // Single unified invite action
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

  // Actual Administrative Check Status
  const hasLegal = Boolean(p?.legalNumber && String(p.legalNumber).trim());
  const hasNpwp = Boolean(p?.npwpNumber && String(p.npwpNumber).trim());

  // Calculate profile completeness score for Owner only
  const completeness = useMemo(() => {
    let score = 0;
    const missing: string[] = [];

    if (p?.name) score += 10;
    if (p?.tagline) score += 15;
    else missing.push("Tagline / slogan lembaga");

    if (p?.logoUrl) score += 10;
    else missing.push("Logo resmi");

    if (p?.coverUrl) score += 15;
    else missing.push("Foto sampul lapangan");

    if (p?.description && p.description.length > 30) score += 15;
    else missing.push("Deskripsi visi & misi");

    if (p?.legalNumber || p?.npwpNumber) score += 15;
    else missing.push("Nomor SK Kemenkumham / NPWP");

    if (pastActivities.length > 0) score += 15;
    else missing.push("Rekam jejak kegiatan portofolio");

    if (teamMembers.length > 0) score += 5;

    return { score: Math.min(100, score), missing };
  }, [p, pastActivities, teamMembers]);

  const handleSuccessUpdate = (updated: any) => {
    setCurrentPartner(updated);
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  if (!p) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm">Data profil mitra tidak ditemukan.</p>
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
            Kembali
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* 1. Top Navigation Bar (Kembali ke Direktori Mitra) */}
      {onBack && (
        <div className="flex items-center justify-between gap-4 bg-white p-3 px-5 rounded-2xl border border-[#E8E8EA] shadow-2xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#181343] hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Direktori Mitra</span>
          </button>
        </div>
      )}

      {/* 2. Main Profile Card (Header, Avatar, Identity & Stats) */}
      <div className="bg-white rounded-3xl border border-[#E8E8EA] shadow-2xs overflow-hidden relative">
        {/* Cover Banner (Proportional height with subtle navy-emerald gradient fallback) */}
        <div className="h-40 sm:h-48 w-full bg-gradient-to-r from-[#181343] via-[#1F195A] to-[#0A4D3C] relative overflow-hidden">
          {p.coverUrl ? (
            <img
              src={p.coverUrl}
              alt={`Banner ${p.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Building2 className="w-28 h-28 text-white" />
            </div>
          )}

          {/* Quick Edit Cover Button if Owner */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-4 right-4 p-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Ganti Sampul</span>
            </button>
          )}
        </div>

        {/* Profile Info Header Bar */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          {/* Avatar / Logo (Overlapping Banner) & Single Main Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1 shadow-md border-2 border-white overflow-hidden shrink-0">
                <div className="w-full h-full rounded-xl overflow-hidden">
                  <PartnerAvatar logoUrl={p.logoUrl} name={p.name} />
                </div>
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-1 right-1 p-1.5 bg-[#181343] hover:bg-emerald-600 text-white rounded-full shadow-md transition-colors cursor-pointer"
                  title="Ubah Logo Lembaga"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Single Primary Action Button */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto w-full sm:w-auto justify-end">
              {isOwner ? (
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-[#181343] hover:bg-[#25205c] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profil Lembaga
                </Button>
              ) : handleInviteAction ? (
                <Button
                  variant="accent"
                  size="md"
                  onClick={handleInviteAction}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Undang Bermitra
                </Button>
              ) : null}
            </div>
          </div>

          {/* Identity & Headline */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight">
                {p.name}
              </h1>

              {/* Status Pemeriksaan Dokumen Administratif (Bukan klaim akreditasi) */}
              {hasLegal && hasNpwp ? (
                <span
                  title="Nomor SK Kemenkumham dan NPWP telah dicantumkan"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dokumen Administratif Lengkap</span>
                </span>
              ) : hasLegal || hasNpwp ? (
                <span
                  title="Sebagian berkas administratif telah dicantumkan"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80"
                >
                  <FileCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>Dokumen Sebagian Tercatat</span>
                </span>
              ) : (
                <span
                  title="Berkas administratif dalam pemeriksaan / belum dilengkapi"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dokumen Dalam Pemeriksaan</span>
                </span>
              )}

              {/* Bidang Keahlian Utama */}
              {focusConfig && (
                <Badge variant={focusConfig.variant} size="sm">
                  {focusConfig.label}
                </Badge>
              )}
            </div>

            {/* Tagline / Deskripsi Singkat */}
            <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed max-w-3xl">
              {p.tagline || "Organisasi pelaksana program kemitraan sosial dan keberlanjutan masyarakat."}
            </p>

            {/* Meta Attributes Row */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#787680] font-medium">
              {(p.city || p.province) && (
                <span className="flex items-center gap-1 text-[#181343] font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{p.city ? `${p.city}, ${p.province || "Indonesia"}` : p.province}</span>
                </span>
              )}

              {p.organizationType && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.organizationType}</span>
                </span>
              )}

              {p.foundedYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Berdiri sejak {p.foundedYear}</span>
                </span>
              )}

              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Website Resmi</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completeness Bar (Owner Only) */}
        {isOwner && completeness.score < 100 && (
          <div className="mx-6 sm:mx-8 mb-5 p-4 bg-slate-50 rounded-2xl border border-[#E8E8EA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#181343] pr-4">
                <span>Kelengkapan Profil Lembaga</span>
                <span className="text-emerald-700">{completeness.score}% Lengkap</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${completeness.score}%` }}
                />
              </div>
              {completeness.missing.length > 0 && (
                <p className="text-[11px] text-[#787680]">
                  Lengkapi: <strong className="text-slate-700">{completeness.missing.slice(0, 2).join(", ")}</strong> untuk memudahkan penilaian oleh perusahaan sponsor.
                </p>
              )}
            </div>

            <Button
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold shrink-0 rounded-xl"
            >
              Lengkapi Sekarang
            </Button>
          </div>
        )}

        {/* 3. Objective Metrics Strip (Hanya data aktual yang membantu penilaian) */}
        <div className="border-t border-[#E8E8EA] bg-[#F9F9FB] grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#E8E8EA] text-center py-3.5">
          {/* Metrik 1: Program Portofolio */}
          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-[#787680] uppercase tracking-wider block">
              Program Portofolio
            </span>
            <strong className="text-xl font-bold text-[#181343]">
              {pastActivities.length}
            </strong>
            <span className="text-[10px] text-[#787680] block">Riwayat kegiatan tercatat</span>
          </div>

          {/* Metrik 2: Kerja Sama Selesai */}
          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-[#787680] uppercase tracking-wider block">
              Kerja Sama Selesai
            </span>
            <strong className="text-xl font-bold text-[#181343]">
              {p.metrics?.completedPrograms ?? 0}
            </strong>
            <span className="text-[10px] text-[#787680] block">Program via SIPENA</span>
          </div>

          {/* Metrik 3: Bidang Keahlian */}
          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-[#787680] uppercase tracking-wider block">
              Bidang Keahlian
            </span>
            <strong className="text-sm sm:text-base font-bold text-[#181343] truncate block px-2 mt-1">
              {focusConfig?.label || p.focusArea}
            </strong>
            <span className="text-[10px] text-[#787680] block">Fokus inisiatif utama</span>
          </div>

          {/* Metrik 4: Status Kelengkapan Dokumen */}
          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-[#787680] uppercase tracking-wider block">
              Status Administratif
            </span>
            <strong className={`text-sm sm:text-base font-bold block mt-1 ${hasLegal && hasNpwp ? "text-emerald-700" : hasLegal || hasNpwp ? "text-sky-700" : "text-slate-600"}`}>
              {hasLegal && hasNpwp ? "Dokumen Lengkap" : hasLegal || hasNpwp ? "Sebagian Tercatat" : "Dalam Proses"}
            </strong>
            <span className="text-[10px] text-[#787680] block">
              {hasLegal && hasNpwp ? "SK & NPWP terdaftar" : hasLegal || hasNpwp ? "SK / NPWP terdaftar" : "Belum dilengkapi"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Tabs Navigation (4 Tab sesuai arahan) */}
      <div className="flex items-center gap-2 border-b border-[#E8E8EA] px-1 overflow-x-auto">
        {[
          { id: "overview", label: "Tentang Organisasi" },
          { id: "activities", label: `Rekam Jejak & Portofolio (${pastActivities.length})` },
          { id: "legal", label: "Legalitas & Dokumen" },
          { id: "team", label: `Tim Pengurus (${teamMembers.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-[#181343] text-[#181343] font-bold"
                : "border-transparent text-[#787680] hover:text-[#181343]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TENTANG ORGANISASI */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deskripsi & Visi Misi */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E8EA] shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-[#181343]">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold">Tentang Organisasi</h3>
              </div>

              <div className="text-xs sm:text-sm text-[#47464F] leading-relaxed whitespace-pre-line space-y-3 font-normal">
                {p.description ||
                  "Lembaga ini belum menambahkan deskripsi naratif mengenai visi, misi, dan latar belakang kiprah sosialnya."}
              </div>

              {/* Unduh Berkas Profil / Company Profile jika tersedia */}
              {p.portfolioDocUrl && (
                <div className="pt-4 border-t border-[#F4F4F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#181343] block">
                      Dokumen Profil &amp; Portofolio Lembaga (PDF)
                    </span>
                    <p className="text-[11px] text-[#787680]">
                      Disahkan oleh pengurus organisasi untuk referensi kemitraan CSR.
                    </p>
                  </div>
                  <a
                    href={p.portfolioDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#181343] text-xs font-semibold border border-[#E8E8EA] transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Unduh Dokumen
                  </a>
                </div>
              )}
            </div>

            {/* Preview Portofolio Terkini di Tab Tentang */}
            {pastActivities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E8EA] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#181343]">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-base font-bold">Portofolio Kegiatan Terkini</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("activities")}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Lihat Semua ({pastActivities.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pastActivities.slice(0, 2).map((act, i) => (
                    <div
                      key={act.id || i}
                      className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-2 hover:border-slate-300 transition-colors"
                    >
                      {act.photoUrl && (
                        <img
                          src={act.photoUrl}
                          alt={act.title}
                          className="w-full h-32 object-cover rounded-xl mb-2"
                        />
                      )}
                      <div className="flex items-center justify-between text-[11px] text-[#787680]">
                        <span className="font-bold text-emerald-700">Tahun {act.year}</span>
                        {act.beneficiaries && <span>{act.beneficiaries}</span>}
                      </div>
                      <h4 className="text-xs font-bold text-[#181343] line-clamp-1">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-[#47464F] line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Informasi Domisili & Kontak Resmi */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E8EA] shadow-2xs space-y-4">
              <h4 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                Informasi Domisili &amp; Kontak Resmi
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#181343] block">Alamat Sekretariat</span>
                    <span className="text-[#47464F] leading-relaxed">
                      {p.address || "-"}
                      {p.city && <>, {p.city}</>}
                      {p.province && <>, {p.province}</>}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#181343] block">Email Resmi</span>
                    <span className="text-[#47464F] select-all">{p.email || "-"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#181343] block">Telepon / Hotline</span>
                    <span className="text-[#47464F]">{p.phone || "-"}</span>
                  </div>
                </div>

                {p.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#181343] block">Website</span>
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline break-all font-medium"
                      >
                        {p.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links jika ada */}
              {(p.instagramUrl || p.linkedinUrl || p.youtubeUrl) && (
                <div className="pt-3 border-t border-[#F4F4F6] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
                    Kanal Media Sosial
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {p.instagramUrl && (
                      <a
                        href={p.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-[#E8E8EA] text-slate-700 hover:text-emerald-700 transition-colors"
                      >
                        Instagram
                      </a>
                    )}
                    {p.linkedinUrl && (
                      <a
                        href={p.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-[#E8E8EA] text-slate-700 hover:text-emerald-700 transition-colors"
                      >
                        LinkedIn
                      </a>
                    )}
                    {p.youtubeUrl && (
                      <a
                        href={p.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-[#E8E8EA] text-slate-700 hover:text-emerald-700 transition-colors"
                      >
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ringkasan Legalitas Cepat */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E8EA] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                  Ringkasan Dokumen
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab("legal")}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Detail →
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-[#E8E8EA]">
                  <span className="text-[10px] uppercase font-bold text-[#787680] block">
                    No. SK Kemenkumham / Izin
                  </span>
                  <span className="font-mono font-bold text-[#181343] text-xs">
                    {p.legalNumber || "Belum dicantumkan"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-[#E8E8EA]">
                  <span className="text-[10px] uppercase font-bold text-[#787680] block">
                    NPWP Lembaga
                  </span>
                  <span className="font-mono font-bold text-[#181343] text-xs">
                    {p.npwpNumber || "Belum dicantumkan"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REKAM JEJAK & PORTOFOLIO */}
      {activeTab === "activities" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E8EA] shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Rekam Jejak &amp; Portofolio Program Lapangan
              </h3>
              <p className="text-xs text-[#787680] mt-0.5">
                Riwayat inisiatif sosial dan kegiatan CSR yang pernah dilaksanakan oleh organisasi.
              </p>
            </div>

            {isOwner && (
              <Button
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl self-start sm:self-auto cursor-pointer"
              >
                + Tambah Program Portofolio
              </Button>
            )}
          </div>

          {pastActivities.length === 0 ? (
            /* Natural Empty State */
            <div className="p-12 text-center rounded-3xl bg-[#F9F9FB] border border-dashed border-[#C8C5D0] space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-[#181343]">
                Belum Ada Riwayat Program yang Tercatat
              </h4>
              <p className="text-xs text-[#787680] max-w-sm mx-auto leading-relaxed">
                {isOwner
                  ? "Cantumkan pengalaman kegiatan CSR masa lalu organisasi Anda untuk memperkuat portofolio kemitraan."
                  : "Organisasi ini belum menambahkan daftar program atau kegiatan terdahulu ke dalam portofolio profil."}
              </p>
              {isOwner && (
                <Button
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl mt-2 cursor-pointer"
                >
                  Tambah Kegiatan Sekarang
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {pastActivities.map((act, index) => (
                <div
                  key={act.id || index}
                  className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start gap-5"
                >
                  {act.photoUrl ? (
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(act.photoUrl || null)}
                      className="w-full sm:w-44 h-32 rounded-xl overflow-hidden border border-slate-200 shrink-0 group relative cursor-pointer"
                    >
                      <img
                        src={act.photoUrl}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-[#181343]/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                        Lihat Foto
                      </div>
                    </button>
                  ) : (
                    <div className="w-full sm:w-44 h-32 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-[#181343]">
                        {act.title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                        Tahun {act.year}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#787680]">
                      {act.clientSponsor && (
                        <span className="flex items-center gap-1 font-semibold text-[#181343]">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mitra Sponsor: {act.clientSponsor}</span>
                        </span>
                      )}
                      {act.beneficiaries && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Penerima: {act.beneficiaries}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#47464F] leading-relaxed font-normal bg-white p-3.5 rounded-xl border border-[#E8E8EA]">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LEGALITAS & DOKUMEN */}
      {activeTab === "legal" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E8EA] shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-[#181343]">
              Legalitas &amp; Dokumen Administratif
            </h3>
            <p className="text-xs text-[#787680] mt-0.5">
              Daftar kelengkapan berkas resmi dan nomor izin operasional organisasi pelaksana.
            </p>
          </div>

          {/* Disclaimer Transparansi Pemeriksaan Dokumen */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block text-amber-950">Catatan Peninjauan Administratif SIPENA:</strong>
              <p className="leading-relaxed text-amber-800">
                Pemeriksaan dokumen oleh SIPENA merupakan peninjauan administratif kelengkapan berkas legalitas yang diunggah oleh organisasi. Peninjauan ini bukan merupakan bentuk sertifikasi resmi, akreditasi lembaga, atau jaminan mutlak atas kredibilitas dan keberhasilan pelaksanaan program. Perusahaan disarankan melakukan konfirmasi atau uji kelayakan (due diligence) mandiri sesuai kebijakan tata kelola CSR masing-masing.
              </p>
            </div>
          </div>

          {/* Grid Dokumen Administratif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Dokumen 1: SK Kemenkumham */}
            <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-[#787680] block">
                Nomor SK Kemenkumham / Izin Operasional
              </span>
              <strong className="text-sm font-mono text-[#181343] block">
                {p.legalNumber || "Belum didaftarkan"}
              </strong>
              <p className="text-[11px] text-[#787680]">
                {p.legalNumber ? "Dasar legalitas formal perkumpulan atau yayasan nirlaba." : "Lembaga belum mencantumkan nomor SK resmi."}
              </p>
            </div>

            {/* Dokumen 2: NPWP Lembaga */}
            <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-[#787680] block">
                Nomor Pokok Wajib Pajak (NPWP) Lembaga
              </span>
              <strong className="text-sm font-mono text-[#181343] block">
                {p.npwpNumber || "Belum didaftarkan"}
              </strong>
              <p className="text-[11px] text-[#787680]">
                {p.npwpNumber ? "Kepatuhan perpajakan dan pelaporan institusional." : "Lembaga belum mencantumkan NPWP resmi."}
              </p>
            </div>

            {/* Dokumen 3: Status Akun di Platform */}
            <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-[#787680] block">
                Status Akun di Platform SIPENA
              </span>
              <div className="flex items-center gap-1.5 pt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${hasLegal && hasNpwp ? "bg-emerald-500" : hasLegal || hasNpwp ? "bg-sky-500" : "bg-slate-400"}`} />
                <strong className="text-sm font-bold text-[#181343]">
                  {hasLegal && hasNpwp
                    ? "Aktif — Dokumen Lengkap"
                    : hasLegal || hasNpwp
                    ? "Aktif — Sebagian Tercatat"
                    : "Aktif — Dalam Pemeriksaan"}
                </strong>
              </div>
              <p className="text-[11px] text-[#787680]">
                Terdaftar dalam ekosistem kemitraan CSR SIPENA.
              </p>
            </div>

            {/* Dokumen 4: Berkas Company Profile / Laporan Tahunan */}
            <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-[#787680] block">
                Berkas Company Profile / Laporan Tahunan
              </span>
              {p.portfolioDocUrl ? (
                <a
                  href={p.portfolioDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh Dokumen Legal (PDF)</span>
                </a>
              ) : (
                <span className="text-xs text-[#787680] block pt-1">Belum ada dokumen diunggah</span>
              )}
              <p className="text-[11px] text-[#787680]">
                Dapat diakses oleh pihak yang berwenang untuk keperluan due diligence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TIM PENGURUS */}
      {activeTab === "team" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E8EA] shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Tim Pengurus Inti &amp; Penanggung Jawab
              </h3>
              <p className="text-xs text-[#787680] mt-0.5">
                Susunan pimpinan dan PIC yang bertanggung jawab atas pelaksanaan operasional organisasi.
              </p>
            </div>

            {isOwner && (
              <Button
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl self-start sm:self-auto cursor-pointer"
              >
                + Tambah Pengurus
              </Button>
            )}
          </div>

          {teamMembers.length === 0 ? (
            /* Natural Empty State */
            <div className="p-12 text-center rounded-3xl bg-[#F9F9FB] border border-dashed border-[#C8C5D0] space-y-2">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-[#181343]">
                Belum Ada Anggota Tim yang Ditampilkan
              </h4>
              <p className="text-xs text-[#787680] max-w-sm mx-auto leading-relaxed">
                {isOwner
                  ? "Kenalkan pimpinan lembaga dan manajer program Anda untuk membangun transparansi kemitraan."
                  : "Organisasi ini belum mencantumkan susunan tim pengurus inti."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teamMembers.map((member, index) => (
                <div
                  key={member.id || index}
                  className="p-5 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] hover:border-slate-300 transition-colors flex items-center gap-4"
                >
                  <div className="w-13 h-13 rounded-2xl bg-[#181343] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      member.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[#181343] truncate">
                      {member.name}
                    </h4>
                    <p className="text-xs text-emerald-700 font-semibold truncate mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal for Owner */}
      {isOwner && (
        <EditPartnerProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          partner={p}
          onSuccess={handleSuccessUpdate}
        />
      )}

      {/* Photo Lightbox */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto}
              alt="Preview Dokumentasi"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
