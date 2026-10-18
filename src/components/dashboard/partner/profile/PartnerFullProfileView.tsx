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
  HeartHandshake,
  Sparkles,
  Send,
  Download,
  Award,
  Image as ImageIcon,
  Camera,
  X,
  Share2,
  Clock,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FOCUS_AREA_CONFIG, formatDate } from "../helpers";
import { PastActivityItem, TeamMemberItem } from "@/modules/partners/partner.interface";
import { EditPartnerProfileModal } from "./EditPartnerProfileModal";

interface PartnerFullProfileViewProps {
  partner: any;
  isOwner?: boolean;
  onBack?: () => void;
  onInvitePitch?: () => void;
  onOpenChat?: () => void;
  onProfileUpdated?: (updated: any) => void;
}

export function PartnerFullProfileView({
  partner,
  isOwner = false,
  onBack,
  onInvitePitch,
  onOpenChat,
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

  // Calculate profile completeness score
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
    else missing.push("Rekam jejak kegiatan masa lalu");

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
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in">
      {/* Top Navigation Bar (If viewed by Company or has onBack) */}
      {onBack && (
        <div className="flex items-center justify-between gap-4 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Kurasi Mitra</span>
          </button>

          <div className="flex items-center gap-2.5">
            {onOpenChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenChat}
                className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Kirim Pesan
              </Button>
            )}
            {onInvitePitch && (
              <Button
                variant="primary"
                size="sm"
                onClick={onInvitePitch}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="text-xs font-bold shadow-xs"
              >
                Undang Pitch Program CSR
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Profile Card (LinkedIn Header Style) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden relative">
        {/* Cover Banner */}
        <div className="h-56 sm:h-72 w-full bg-gradient-to-r from-teal-900 via-slate-800 to-emerald-950 relative overflow-hidden">
          {p.coverUrl ? (
            <img
              src={p.coverUrl}
              alt={`Banner ${p.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-teal-200/30">
              <Building2 className="w-24 h-24 opacity-30" />
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
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-1.5 shadow-xl border-2 border-white overflow-hidden shrink-0">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center font-black text-3xl sm:text-4xl overflow-hidden shadow-inner">
                  {p.logoUrl ? (
                    <img
                      src={p.logoUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    p.name.substring(0, 2).toUpperCase()
                  )}
                </div>
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-1 right-1 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
                  title="Ubah Logo Lembaga"
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
                  className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profil Lembaga
                </Button>
              ) : (
                <div className="flex items-center gap-2.5">
                  {onOpenChat && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOpenChat}
                      className="text-xs font-bold border-slate-300 text-slate-700"
                    >
                      Kirim Pesan
                    </Button>
                  )}
                  {onInvitePitch && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onInvitePitch}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      Undang Pitch
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Identity & Headline */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {p.name}
              </h1>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Mitra Terverifikasi</span>
              </div>
              {focusConfig && (
                <Badge variant={focusConfig.variant} size="sm">
                  {focusConfig.label}
                </Badge>
              )}
            </div>

            {/* Tagline / Headline */}
            <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug max-w-3xl">
              {p.tagline || "Organisasi pelaksana program kemitraan sosial dan keberlanjutan masyarakat."}
            </p>

            {/* Meta Attributes Row */}
            <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-slate-500 font-medium">
              {p.organizationType && (
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {p.organizationType}
                </span>
              )}

              {(p.city || p.province) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {p.city ? `${p.city}, ${p.province || "Indonesia"}` : p.province}
                </span>
              )}

              {p.foundedYear && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Berdiri sejak {p.foundedYear}
                </span>
              )}

              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-teal-700 hover:underline font-semibold"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Kunjungi Website</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            {/* Socials Link Row */}
            {(p.instagramUrl || p.linkedinUrl || p.youtubeUrl) && (
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Media Sosial:
                </span>
                {p.instagramUrl && (
                  <a
                    href={p.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 hover:text-pink-600 font-semibold transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {p.linkedinUrl && (
                  <a
                    href={p.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 hover:text-blue-600 font-semibold transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
                {p.youtubeUrl && (
                  <a
                    href={p.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 hover:text-red-600 font-semibold transition-colors"
                  >
                    YouTube
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Completeness Bar (Owner Only) */}
        {isOwner && completeness.score < 100 && (
          <div className="mx-6 sm:mx-10 mb-6 p-4 bg-gradient-to-r from-teal-50/80 to-emerald-50/50 rounded-2xl border border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900 pr-4">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Tingkat Kelengkapan Profil Lembaga
                </span>
                <span>{completeness.score}% Selesai</span>
              </div>
              <div className="w-full h-2 bg-teal-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${completeness.score}%` }}
                />
              </div>
              {completeness.missing.length > 0 && (
                <p className="text-[11px] text-teal-700">
                  Lengkapi: <strong>{completeness.missing.slice(0, 2).join(", ")}</strong> untuk meyakinkan perusahaan sponsor.
                </p>
              )}
            </div>

            <Button
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shrink-0"
            >
              Lengkapi Sekarang
            </Button>
          </div>
        )}

        {/* Metrics Highlight Strip */}
        <div className="border-t border-slate-100 bg-slate-50/60 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 text-center py-4">
          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Program Selesai
            </span>
            <strong className="text-xl font-extrabold text-slate-900">
              {p.metrics?.completedPrograms ?? 0}
            </strong>
          </div>

          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Suara Kepuasan Warga
            </span>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <strong className="text-xl font-extrabold text-slate-900">
                {p.metrics?.averageRating ? p.metrics.averageRating.toFixed(1) : "5.0"}
              </strong>
              <span className="text-[11px] text-slate-400">/ 5.0</span>
            </div>
          </div>

          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Kegiatan & Proyek
            </span>
            <strong className="text-xl font-extrabold text-slate-900">
              {(p.metrics?.totalPrograms || 0) + pastActivities.length}
            </strong>
          </div>

          <div className="p-2 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pengalaman Lembaga
            </span>
            <strong className="text-xl font-extrabold text-slate-900">
              {p.foundedYear ? `${new Date().getFullYear() - p.foundedYear} Thn` : "Aktif"}
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 px-2 overflow-x-auto">
        {[
          { id: "overview", label: "Tentang Kami & Visi Misi" },
          { id: "activities", label: `Rekam Jejak & Portofolio (${pastActivities.length})` },
          { id: "legal", label: "Legalitas & Berkas Resmi" },
          { id: "team", label: `Tim Pengurus (${teamMembers.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "border-teal-600 text-teal-700 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & ABOUT US */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-extrabold">Tentang Organisasi & Visi Misi</h3>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                {p.description ||
                  "Lembaga ini belum menambahkan deskripsi naratif mengenai visi, misi, dan latar belakang kiprah sosialnya."}
              </div>

              {/* Download Company Profile Document Button */}
              {p.portfolioDocUrl && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      Dokumen Profil & Portofolio Resmi (PDF)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Disahkan oleh pengurus lembaga untuk kebutuhan kemitraan CSR
                    </p>
                  </div>
                  <a
                    href={p.portfolioDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Dokumen
                  </a>
                </div>
              )}
            </div>

            {/* Past Activities Preview in Overview */}
            {pastActivities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Portofolio Kegiatan Terkini
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("activities")}
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    Lihat Semua ({pastActivities.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pastActivities.slice(0, 2).map((act, i) => (
                    <div
                      key={act.id || i}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-slate-200 transition-colors"
                    >
                      {act.photoUrl && (
                        <img
                          src={act.photoUrl}
                          alt={act.title}
                          className="w-full h-32 object-cover rounded-xl mb-2"
                        />
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-teal-700">Tahun {act.year}</span>
                        {act.beneficiaries && <span>{act.beneficiaries}</span>}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info Card */}
          <div className="space-y-6">
            {/* Kontak & Sekretariat */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Informasi Kontak & Sekretariat
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Alamat Kantor</span>
                    <span className="text-slate-600 leading-relaxed">
                      {p.address || "-"}
                      {p.city && <>, {p.city}</>}
                      {p.province && <>, {p.province}</>}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Email Resmi</span>
                    <span className="text-slate-600 select-all">{p.email || "-"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Telepon / Hotline</span>
                    <span className="text-slate-600">{p.phone || "-"}</span>
                  </div>
                </div>

                {p.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block">Website</span>
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 hover:underline break-all"
                      >
                        {p.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Legalitas Ringkas */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Kepatuhan & Legalitas
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    No. SK Kemenkumham / Izin
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {p.legalNumber || "Belum dicantumkan"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    NPWP Lembaga
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {p.npwpNumber || "Belum dicantumkan"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAST ACTIVITIES & PORTFOLIO */}
      {activeTab === "activities" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Rekam Jejak & Pengalaman Program Lapangan
              </h3>
              <p className="text-xs text-slate-500">
                Riwayat inisiatif sosial dan kegiatan CSR yang pernah sukses dilaksanakan oleh lembaga ini
              </p>
            </div>

            {isOwner && (
              <Button
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
              >
                + Tambah Kegiatan
              </Button>
            )}
          </div>

          {pastActivities.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">
                Belum Ada Riwayat Kegiatan yang Ditampilkan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isOwner
                  ? "Cantumkan pengalaman kegiatan CSR masa lalu Anda untuk memperkuat portofolio lembaga."
                  : "Lembaga ini belum menambahkan riwayat portofolio kegiatan masa lalu."}
              </p>
              {isOwner && (
                <Button
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-teal-600 text-white text-xs font-bold"
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
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-teal-200 transition-all flex flex-col sm:flex-row items-start gap-5"
                >
                  {act.photoUrl ? (
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(act.photoUrl || null)}
                      className="w-full sm:w-44 h-32 rounded-xl overflow-hidden border border-slate-200 shrink-0 group relative"
                    >
                      <img
                        src={act.photoUrl}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                        Lihat Foto
                      </div>
                    </button>
                  ) : (
                    <div className="w-full sm:w-44 h-32 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {act.title}
                      </h4>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-100/80 text-teal-800">
                        Tahun {act.year}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {act.clientSponsor && (
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          Sponsor: {act.clientSponsor}
                        </span>
                      )}
                      {act.beneficiaries && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Penerima: {act.beneficiaries}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3.5 rounded-xl border border-slate-100">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LEGALITY & FORMAL COMPLIANCE */}
      {activeTab === "legal" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Dokumen Legalitas & Kepatuhan Organisasi
            </h3>
            <p className="text-xs text-slate-500">
              Bukti verifikasi formal yang membuktikan keabsahan lembaga di hadapan hukum Republik Indonesia
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">
                Nomor SK Kemenkumham / Izin Operasional
              </span>
              <strong className="text-sm font-mono text-slate-900 block">
                {p.legalNumber || "Belum didaftarkan"}
              </strong>
              <p className="text-[11px] text-slate-500">
                Sebagai dasar legalitas formal perkumpulan atau yayasan nirlaba
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">
                Nomor Pokok Wajib Pajak (NPWP) Lembaga
              </span>
              <strong className="text-sm font-mono text-slate-900 block">
                {p.npwpNumber || "Belum didaftarkan"}
              </strong>
              <p className="text-[11px] text-slate-500">
                Kepatuhan perpajakan dan pelaporan keuangan institusional
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">
                Status Akun di Platform
              </span>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <strong className="text-sm font-bold text-emerald-700">Aktif & Terverifikasi</strong>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">
                Berkas Company Profile / Laporan Tahunan
              </span>
              {p.portfolioDocUrl ? (
                <a
                  href={p.portfolioDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline pt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Dokumen Legal (PDF)
                </a>
              ) : (
                <span className="text-xs text-slate-400 block pt-1">Belum ada dokumen diunggah</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEAM MEMBERS */}
      {activeTab === "team" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Tim Pengurus Inti & Penanggung Jawab
              </h3>
              <p className="text-xs text-slate-500">
                Pimpinan dan koordinator yang bertanggung jawab atas eksekusi program di lapangan
              </p>
            </div>

            {isOwner && (
              <Button
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
              >
                + Tambah Pengurus
              </Button>
            )}
          </div>

          {teamMembers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">
                Belum Ada Anggota Tim yang Ditampilkan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isOwner
                  ? "Kenalkan pimpinan lembaga dan manajer program Anda untuk membangun rasa percaya mitra sponsor."
                  : "Lembaga ini belum mencantumkan susunan tim pengurus inti."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teamMembers.map((member, index) => (
                <div
                  key={member.id || index}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
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
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {member.name}
                    </h4>
                    <p className="text-xs text-teal-700 font-semibold truncate mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
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
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-all"
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
