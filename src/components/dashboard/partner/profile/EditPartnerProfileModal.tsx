"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Building2,
  Camera,
  MapPin,
  Globe,
  Mail,
  Phone,
  FileText,
  Calendar,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { FOCUS_AREA_CONFIG } from "../helpers";
import { PastActivityItem, TeamMemberItem } from "@/modules/partners/partner.interface";

interface EditPartnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: any;
  onSuccess: (updated: any) => void;
}

const ORGANIZATION_TYPES = [
  "Yayasan (Foundation)",
  "Lembaga Swadaya Masyarakat (NGO / LSM)",
  "Perkumpulan Berbadan Hukum",
  "Komunitas Sosial Masyarakat",
  "Koperasi Sosial",
  "Lembaga Riset / Akademisi",
  "Lainnya",
];

export function EditPartnerProfileModal({
  isOpen,
  onClose,
  partner,
  onSuccess,
}: EditPartnerProfileModalProps) {
  const [activeTab, setActiveTab] = useState<
    "branding" | "contact" | "legal" | "activities" | "team"
  >("branding");

  // Form states
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [organizationType, setOrganizationType] = useState(ORGANIZATION_TYPES[0]);
  const [foundedYear, setFoundedYear] = useState<number | string>("");
  const [focusArea, setFocusArea] = useState<CsrFocusArea>("LAINNYA");

  // Visuals
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  // Contacts & Socials
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [website, setWebsite] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Legal & Documents
  const [legalNumber, setLegalNumber] = useState("");
  const [npwpNumber, setNpwpNumber] = useState("");
  const [portfolioDocUrl, setPortfolioDocUrl] = useState("");

  // Past Activities
  const [pastActivities, setPastActivities] = useState<PastActivityItem[]>([]);
  // Team Members
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);

  // Upload loaders
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (partner) {
      setName(partner.name || "");
      setTagline(partner.tagline || "");
      setDescription(partner.description || "");
      setOrganizationType(partner.organizationType || ORGANIZATION_TYPES[0]);
      setFoundedYear(partner.foundedYear || "");
      setFocusArea(partner.focusArea || "LAINNYA");

      setLogoUrl(partner.logoUrl || "");
      setCoverUrl(partner.coverUrl || "");

      setEmail(partner.email || "");
      setPhone(partner.phone || "");
      setAddress(partner.address || "");
      setCity(partner.city || "");
      setProvince(partner.province || "");
      setWebsite(partner.website || "");
      setInstagramUrl(partner.instagramUrl || "");
      setLinkedinUrl(partner.linkedinUrl || "");
      setYoutubeUrl(partner.youtubeUrl || "");

      setLegalNumber(partner.legalNumber || "");
      setNpwpNumber(partner.npwpNumber || "");
      setPortfolioDocUrl(partner.portfolioDocUrl || "");

      // Parse JSON for activities & team
      if (partner.pastActivities) {
        if (typeof partner.pastActivities === "string") {
          try {
            setPastActivities(JSON.parse(partner.pastActivities));
          } catch {
            setPastActivities([]);
          }
        } else if (Array.isArray(partner.pastActivities)) {
          setPastActivities(partner.pastActivities);
        }
      } else {
        setPastActivities([]);
      }

      if (partner.teamMembers) {
        if (typeof partner.teamMembers === "string") {
          try {
            setTeamMembers(JSON.parse(partner.teamMembers));
          } catch {
            setTeamMembers([]);
          }
        } else if (Array.isArray(partner.teamMembers)) {
          setTeamMembers(partner.teamMembers);
        }
      } else {
        setTeamMembers([]);
      }

      setErrorMessage(null);
    }
  }, [partner, isOpen]);

  if (!isOpen) return null;

  // Upload helper for Logo / Cover
  const handleUploadImage = async (
    file: File,
    type: "logo" | "cover" | "activity",
    activityIndex?: number
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (type === "logo") setIsUploadingLogo(true);
      if (type === "cover") setIsUploadingCover(true);

      const res = await fetch("/api/upload/review", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengunggah gambar");

      const uploadedUrl = json.data.url;
      if (type === "logo") setLogoUrl(uploadedUrl);
      if (type === "cover") setCoverUrl(uploadedUrl);
      if (type === "activity" && typeof activityIndex === "number") {
        setPastActivities((prev) =>
          prev.map((act, i) => (i === activityIndex ? { ...act, photoUrl: uploadedUrl } : act))
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah foto");
    } finally {
      setIsUploadingLogo(false);
      setIsUploadingCover(false);
    }
  };

  // Past Activities Handlers
  const handleAddActivity = () => {
    const newAct: PastActivityItem = {
      id: crypto.randomUUID(),
      title: "",
      year: new Date().getFullYear(),
      clientSponsor: "",
      beneficiaries: "",
      description: "",
      photoUrl: null,
    };
    setPastActivities([...pastActivities, newAct]);
  };

  const handleUpdateActivity = (index: number, key: keyof PastActivityItem, value: any) => {
    setPastActivities((prev) =>
      prev.map((act, i) => (i === index ? { ...act, [key]: value } : act))
    );
  };

  const handleRemoveActivity = (index: number) => {
    setPastActivities((prev) => prev.filter((_, i) => i !== index));
  };

  // Team Members Handlers
  const handleAddTeamMember = () => {
    const newMember: TeamMemberItem = {
      id: crypto.randomUUID(),
      name: "",
      role: "",
      photoUrl: null,
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const handleUpdateTeamMember = (index: number, key: keyof TeamMemberItem, value: any) => {
    setTeamMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [key]: value } : m))
    );
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login Anda telah berakhir");

      const payload = {
        name: name.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        organizationType: organizationType || null,
        foundedYear: foundedYear ? Number(foundedYear) : null,
        focusArea,
        logoUrl: logoUrl.trim() || null,
        coverUrl: coverUrl.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        website: website.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
        youtubeUrl: youtubeUrl.trim() || null,
        legalNumber: legalNumber.trim() || null,
        npwpNumber: npwpNumber.trim() || null,
        portfolioDocUrl: portfolioDocUrl.trim() || null,
        pastActivities,
        teamMembers,
      };

      const res = await fetch("/api/partners/current", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui profil lembaga");
      }

      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Lengkapi & Edit Profil Lembaga (LinkedIn Style)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Profil yang lengkap meningkatkan kredibilitas dan peluang lolos kurasi oleh perusahaan sponsor CSR
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-6 bg-slate-50/30 overflow-x-auto">
          {[
            { id: "branding", label: "Branding & Visual" },
            { id: "contact", label: "Narasi & Kontak" },
            { id: "legal", label: "Legalitas & Berkas" },
            { id: "activities", label: `Rekam Jejak (${pastActivities.length})` },
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: BRANDING & VISUAL */}
          {activeTab === "branding" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Cover Banner Upload Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Foto Sampul / Banner Lapangan (Ukuran Disarankan 1200x350 px)
                </label>
                <div className="relative w-full h-44 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-800 overflow-hidden border border-slate-200 flex items-center justify-center group">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Banner Lembaga"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-teal-200/60 p-4">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
                      <span className="text-xs">Belum ada foto sampul lembaga</span>
                    </div>
                  )}

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadImage(f, "cover");
                    }}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingCover}
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    {isUploadingCover ? "Mengunggah..." : "Ubah Foto Sampul"}
                  </Button>
                </div>
              </div>

              {/* Logo Upload Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Logo Resmi Lembaga / Avatar
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Lembaga"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-black text-teal-700">
                        {name ? name.substring(0, 2).toUpperCase() : "M"}
                      </span>
                    )}
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadImage(f, "logo");
                    }}
                    className="hidden"
                  />

                  <div className="space-y-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="text-xs font-bold text-slate-700"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1 text-teal-600" />
                      {isUploadingLogo ? "Mengunggah..." : "Unggah Logo"}
                    </Button>
                    <p className="text-[11px] text-slate-400">
                      Format JPG, PNG atau WEBP, maks. 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Nama Resmi Lembaga / Yayasan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Yayasan Bahari Lestari Nusantara"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Tagline / Headline Slogan Organisasi
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Contoh: Memberdayakan 2.000+ Nelayan Pesisir Melalui Inisiatif Konservasi Berkelanjutan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Slogan ringkas yang langsung tampil di bawah nama lembaga pada kartu kurasi
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Bentuk / Tipe Organisasi
                  </label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                  >
                    {ORGANIZATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tahun Berdiri</label>
                  <input
                    type="number"
                    min={1950}
                    max={new Date().getFullYear()}
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    placeholder="Contoh: 2018"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Bidang Fokus Utama CSR <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value as CsrFocusArea)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                  >
                    {csrFocusAreaEnum.map((area) => (
                      <option key={area} value={area}>
                        {FOCUS_AREA_CONFIG[area]?.label || area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NARASI & KONTAK */}
          {activeTab === "contact" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Deskripsi Lengkap, Visi & Misi Lembaga
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan latar belakang berdirinya lembaga, visi, misi, nilai kerja, dan dampak sosial yang ingin dicapai..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Resmi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kontak@yayasan.org"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nomor Telepon / Hotline</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Alamat Kantor / Sekretariat</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. Bahari No. 12, Kelurahan ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Surabaya"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Provinsi</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Jawa Timur"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Tautan Media Sosial & Website */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Tautan Media & Jejaring Sosial
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Website Resmi</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yayasanbahari.org"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Instagram</label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/yayasanbahari"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">LinkedIn Lembaga</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/yayasanbahari"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Kanal YouTube</label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@yayasanbahari"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEGALITAS & BERKAS */}
          {activeTab === "legal" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 bg-teal-50 border border-teal-200/80 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <p className="text-xs text-teal-800 leading-relaxed">
                  Data legalitas dan berkas profil lembaga menjadi indikator utama perusahaan CSR untuk melakukan verifikasi *due-diligence* dan uji kepatuhan legal sebelum menyetujui pendanaan proposal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nomor SK Kemenkumham / Izin Dinsos
                  </label>
                  <input
                    type="text"
                    value={legalNumber}
                    onChange={(e) => setLegalNumber(e.target.value)}
                    placeholder="Contoh: AHU-0012345.AH.01.04.Tahun 2018"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nomor NPWP Lembaga</label>
                  <input
                    type="text"
                    value={npwpNumber}
                    onChange={(e) => setNpwpNumber(e.target.value)}
                    placeholder="Contoh: 01.234.567.8-901.000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Tautan Dokumen Company Profile / Laporan Tahunan (PDF)
                  </label>
                  <input
                    type="url"
                    value={portfolioDocUrl}
                    onChange={(e) => setPortfolioDocUrl(e.target.value)}
                    placeholder="https://drive.google.com/... atau tautan file PDF publik"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    Tautan Google Drive atau link PDF berkas ringkasan tahunan lembaga yang dapat diunduh oleh perusahaan sponsor
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REKAM JEJAK KEGIATAN (PAST ACTIVITIES) */}
          {activeTab === "activities" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Daftar Pengalaman & Portofolio Program CSR Masa Lalu
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tambahkan riwayat program yang pernah sukses dieksekusi oleh lembaga Anda
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddActivity}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tambah Kegiatan
                </Button>
              </div>

              {pastActivities.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Belum ada portofolio kegiatan yang ditambahkan
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Klik tombol "Tambah Kegiatan" di atas untuk mencantumkan pengalaman program lapangan lembaga Anda.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastActivities.map((act, index) => (
                    <div
                      key={act.id || index}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-black text-teal-800">
                          Kegiatan #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveActivity(index)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-600">
                            Nama / Judul Kegiatan *
                          </label>
                          <input
                            type="text"
                            required
                            value={act.title}
                            onChange={(e) =>
                              handleUpdateActivity(index, "title", e.target.value)
                            }
                            placeholder="Contoh: Restorasi 5.000 Mangrove Pesisir Utara"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">
                            Tahun Pelaksanaan *
                          </label>
                          <input
                            type="text"
                            required
                            value={act.year}
                            onChange={(e) =>
                              handleUpdateActivity(index, "year", e.target.value)
                            }
                            placeholder="2025"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-600">
                            Mitra Sponsor / Klien (Opsional)
                          </label>
                          <input
                            type="text"
                            value={act.clientSponsor || ""}
                            onChange={(e) =>
                              handleUpdateActivity(index, "clientSponsor", e.target.value)
                            }
                            placeholder="Contoh: PT Sumber Energi Nusantara / Mandiri"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">
                            Penerima Manfaat
                          </label>
                          <input
                            type="text"
                            value={act.beneficiaries || ""}
                            onChange={(e) =>
                              handleUpdateActivity(index, "beneficiaries", e.target.value)
                            }
                            placeholder="Contoh: 150 KK Nelayan"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-3">
                          <label className="text-[11px] font-bold text-slate-600">
                            Deskripsi Singkat & Capaian Dampak *
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={act.description}
                            onChange={(e) =>
                              handleUpdateActivity(index, "description", e.target.value)
                            }
                            placeholder="Jelaskan ringkas bentuk intervensi lapangan dan hasil nyatanya..."
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none leading-relaxed"
                          />
                        </div>

                        {/* Photo URL / Upload */}
                        <div className="space-y-1 sm:col-span-3">
                          <label className="text-[11px] font-bold text-slate-600">
                            Foto Dokumentasi Kegiatan (URL atau Unggah)
                          </label>
                          <div className="flex items-center gap-3">
                            {act.photoUrl ? (
                              <img
                                src={act.photoUrl}
                                alt="Dokumentasi"
                                className="w-14 h-10 object-cover rounded-lg border border-slate-200"
                              />
                            ) : null}
                            <input
                              type="text"
                              value={act.photoUrl || ""}
                              onChange={(e) =>
                                handleUpdateActivity(index, "photoUrl", e.target.value)
                              }
                              placeholder="URL foto dokumentasi..."
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                            />
                            <label className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer shrink-0">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleUploadImage(f, "activity", index);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TIM PENGURUS INTI (TEAM MEMBERS) */}
          {activeTab === "team" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Tim Pengurus Inti & Penanggung Jawab
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kenalkan pengurus utama lembaga Anda agar perusahaan mengetahui profil tim di balik layar
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTeamMember}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tambah Anggota
                </Button>
              </div>

              {teamMembers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Belum ada pengurus yang dicantumkan
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Tambahkan Ketua Yayasan, Direktur Program, atau Koordinator Lapangan.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teamMembers.map((member, index) => (
                    <div
                      key={member.id || index}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-teal-800">
                          Anggota #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(index)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">
                            Nama Lengkap *
                          </label>
                          <input
                            type="text"
                            required
                            value={member.name}
                            onChange={(e) =>
                              handleUpdateTeamMember(index, "name", e.target.value)
                            }
                            placeholder="Contoh: Dr. Ir. Budi Santoso"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">
                            Jabatan / Peran *
                          </label>
                          <input
                            type="text"
                            required
                            value={member.role}
                            onChange={(e) =>
                              handleUpdateTeamMember(index, "role", e.target.value)
                            }
                            placeholder="Contoh: Ketua Yayasan / Manajer Program"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">
                            Foto Profil (Opsional URL)
                          </label>
                          <input
                            type="text"
                            value={member.photoUrl || ""}
                            onChange={(e) =>
                              handleUpdateTeamMember(index, "photoUrl", e.target.value)
                            }
                            placeholder="https://..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold text-slate-600"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingLogo || isUploadingCover}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  Menyimpan Perubahan...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Simpan Profil Lengkap
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
