"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Building2,
  Palette,
  Award,
  ShieldCheck,
  ArrowLeft,
  Camera,
  Upload,
  X,
  Check,
  AlertCircle,
  FileText,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Trash2,
  ExternalLink,
  Plus,
  Sparkles,
  RefreshCw,
  Lock,
  CheckCircle2,
  Info,
  ChevronRight,
  Users,
  Compass,
  FileCheck,
  HeartHandshake,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { INDONESIAN_REGIONS } from "@/components/dashboard/company/opportunities/indonesian-regions";
import { PastActivityItem, TeamMemberItem } from "@/modules/partners/partner.interface";
import { FOCUS_AREA_CONFIG } from "../helpers";

export type PartnerProfileCategoryTab = "info" | "branding" | "portfolio" | "legal" | "team";

interface EditPartnerProfilePageViewProps {
  partner: any;
  initialCategory?: PartnerProfileCategoryTab;
  onBack: () => void;
  onProfileUpdated: (updated: any) => void;
}

const ORGANIZATION_TYPES = [
  "Yayasan",
  "Perkumpulan",
  "Lembaga Swadaya Masyarakat (LSM)",
  "Komunitas Terdaftar",
  "Lembaga Amil Zakat / Wakaf",
  "Lainnya",
];

const NGO_FOCUS_AREAS = [
  { id: "PENDIDIKAN", label: "Pendidikan & Literasi", desc: "Beasiswa, literasi, sarana belajar & pelatihan guru" },
  { id: "LINGKUNGAN", label: "Lingkungan & Alam", desc: "Reforestasi, konservasi keanekaragaman hayati & energi bersih" },
  { id: "KESEHATAN", label: "Kesehatan Masyarakat", desc: "Intervensi stunting, nutrisi, posyandu & sanitasi air bersih" },
  { id: "PEMBERDAYAAN_EKONOMI", label: "Ekonomi & UMKM", desc: "Pelatihan vokasi, inkubasi wirausaha desa & pendampingan UMKM" },
  { id: "INFRASTRUKTUR_SOSIAL", label: "Infrastruktur Sosial", desc: "Sarana publik pedesaan, jembatan, air bersih & MCK warga" },
  { id: "TANGGAP_BENCANA", label: "Tanggap Kemanusiaan & Bencana", desc: "Bantuan darurat logistik, hunian sementara & trauma healing" },
  { id: "LAINNYA", label: "Inisiatif Khusus Lainnya", desc: "Program inklusi disabilitas, perlindungan anak & seni budaya" },
];

export function EditPartnerProfilePageView({
  partner,
  initialCategory = "info",
  onBack,
  onProfileUpdated,
}: EditPartnerProfilePageViewProps) {
  const [activeCategory, setActiveCategory] = useState<PartnerProfileCategoryTab>(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  // File Upload states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingPortfolioDoc, setIsUploadingPortfolioDoc] = useState(false);
  const [uploadingActivityIndex, setUploadingActivityIndex] = useState<number | null>(null);
  const [uploadingTeamIndex, setUploadingTeamIndex] = useState<number | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const portfolioDocInputRef = useRef<HTMLInputElement>(null);
  const activityPhotoInputRef = useRef<HTMLInputElement>(null);
  const teamPhotoInputRef = useRef<HTMLInputElement>(null);

  // Form Fields State
  const [name, setName] = useState(partner?.name || "");
  const [tagline, setTagline] = useState(partner?.tagline || "");
  const [description, setDescription] = useState(partner?.description || "");
  const [organizationType, setOrganizationType] = useState(partner?.organizationType || ORGANIZATION_TYPES[0]);
  const [foundedYear, setFoundedYear] = useState<string | number>(partner?.foundedYear || "");
  const [focusArea, setFocusArea] = useState(partner?.focusArea || "LAINNYA");

  const [email, setEmail] = useState(partner?.email || "");
  const [phone, setPhone] = useState(partner?.phone || "");
  const [address, setAddress] = useState(partner?.address || "");
  const [city, setCity] = useState(partner?.city || "");
  const [province, setProvince] = useState(partner?.province || "");
  const [website, setWebsite] = useState(partner?.website || "");
  const [instagramUrl, setInstagramUrl] = useState(partner?.instagramUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(partner?.linkedinUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(partner?.youtubeUrl || "");

  const [logoUrl, setLogoUrl] = useState(partner?.logoUrl || "");
  const [coverUrl, setCoverUrl] = useState(partner?.coverUrl || "");
  const [legalNumber, setLegalNumber] = useState(partner?.legalNumber || "");
  const [npwpNumber, setNpwpNumber] = useState(partner?.npwpNumber || "");
  const [portfolioDocUrl, setPortfolioDocUrl] = useState(partner?.portfolioDocUrl || "");

  // Past Activities State
  const [pastActivities, setPastActivities] = useState<PastActivityItem[]>(() => {
    if (!partner?.pastActivities) return [];
    if (Array.isArray(partner.pastActivities)) return partner.pastActivities;
    try {
      return JSON.parse(partner.pastActivities);
    } catch {
      return [];
    }
  });

  // Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>(() => {
    if (!partner?.teamMembers) return [];
    if (Array.isArray(partner.teamMembers)) return partner.teamMembers;
    try {
      return JSON.parse(partner.teamMembers);
    } catch {
      return [];
    }
  });

  // Available provinces list
  const provinceOptions = useMemo(() => {
    return INDONESIAN_REGIONS.map((p) => p.name);
  }, []);

  // Available cities based on selected province
  const cityOptions = useMemo(() => {
    if (!province) return [];
    const found = INDONESIAN_REGIONS.find((p) => p.name.toLowerCase() === province.toLowerCase());
    return found ? found.cities : [];
  }, [province]);

  const handleProvinceChange = (prov: string) => {
    setProvince(prov);
    setCity("");
  };

  // Target activity/team member for file upload
  const [activeActivityUploadIdx, setActiveActivityUploadIdx] = useState<number | null>(null);
  const [activeTeamUploadIdx, setActiveTeamUploadIdx] = useState<number | null>(null);

  // Initial Snapshot for detecting dirty changes
  const [initialSnapshot, setInitialSnapshot] = useState("");
  useEffect(() => {
    const snap = JSON.stringify({
      name: partner?.name || "",
      tagline: partner?.tagline || "",
      description: partner?.description || "",
      organizationType: partner?.organizationType || ORGANIZATION_TYPES[0],
      foundedYear: partner?.foundedYear || "",
      focusArea: partner?.focusArea || "LAINNYA",
      email: partner?.email || "",
      phone: partner?.phone || "",
      address: partner?.address || "",
      city: partner?.city || "",
      province: partner?.province || "",
      website: partner?.website || "",
      instagramUrl: partner?.instagramUrl || "",
      linkedinUrl: partner?.linkedinUrl || "",
      youtubeUrl: partner?.youtubeUrl || "",
      logoUrl: partner?.logoUrl || "",
      coverUrl: partner?.coverUrl || "",
      legalNumber: partner?.legalNumber || "",
      npwpNumber: partner?.npwpNumber || "",
      portfolioDocUrl: partner?.portfolioDocUrl || "",
      pastActivities: partner?.pastActivities || [],
      teamMembers: partner?.teamMembers || [],
    });
    setInitialSnapshot(snap);
  }, [partner]);

  const currentSnapshot = JSON.stringify({
    name,
    tagline,
    description,
    organizationType,
    foundedYear,
    focusArea,
    email,
    phone,
    address,
    city,
    province,
    website,
    instagramUrl,
    linkedinUrl,
    youtubeUrl,
    logoUrl,
    coverUrl,
    legalNumber,
    npwpNumber,
    portfolioDocUrl,
    pastActivities,
    teamMembers,
  });

  const isDirty = initialSnapshot !== "" && initialSnapshot !== currentSnapshot;

  const handleAttemptBack = () => {
    if (isDirty) {
      setIsDiscardModalOpen(true);
    } else {
      onBack();
    }
  };

  // Upload helper using /api/upload
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Gagal mengunggah berkas");
    }

    return json.data.url;
  };

  // Upload Logo
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Format file logo harus berupa gambar (JPG, PNG, atau WEBP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Ukuran logo maksimal 2MB.");
      return;
    }

    setIsUploadingLogo(true);
    setErrorMessage(null);
    try {
      const url = await uploadFile(file, "partner-logos");
      setLogoUrl(url);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah logo.");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // Upload Cover Banner
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Format file sampul harus berupa gambar (JPG, PNG, atau WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran foto sampul maksimal 5MB.");
      return;
    }

    setIsUploadingCover(true);
    setErrorMessage(null);
    try {
      const url = await uploadFile(file, "partner-covers");
      setCoverUrl(url);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah foto sampul.");
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Upload Portfolio Document PDF
  const handlePortfolioDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMessage("Dokumen portofolio/profil harus dalam format dokumen PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran dokumen PDF maksimal 10MB.");
      return;
    }

    setIsUploadingPortfolioDoc(true);
    setErrorMessage(null);
    try {
      const url = await uploadFile(file, "partner-documents");
      setPortfolioDocUrl(url);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah berkas portofolio PDF.");
    } finally {
      setIsUploadingPortfolioDoc(false);
      if (portfolioDocInputRef.current) portfolioDocInputRef.current.value = "";
    }
  };

  // Upload Activity Photo
  const handleActivityPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeActivityUploadIdx === null) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Foto dokumentasi harus berupa gambar.");
      return;
    }

    setUploadingActivityIndex(activeActivityUploadIdx);
    setErrorMessage(null);
    try {
      const url = await uploadFile(file, "partner-activities");
      setPastActivities((prev) =>
        prev.map((act, i) => (i === activeActivityUploadIdx ? { ...act, photoUrl: url } : act))
      );
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah foto kegiatan.");
    } finally {
      setUploadingActivityIndex(null);
      setActiveActivityUploadIdx(null);
      if (activityPhotoInputRef.current) activityPhotoInputRef.current.value = "";
    }
  };

  // Upload Team Member Photo
  const handleTeamPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeTeamUploadIdx === null) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Foto pengurus harus berupa gambar.");
      return;
    }

    setUploadingTeamIndex(activeTeamUploadIdx);
    setErrorMessage(null);
    try {
      const url = await uploadFile(file, "partner-team");
      setTeamMembers((prev) =>
        prev.map((tm, i) => (i === activeTeamUploadIdx ? { ...tm, photoUrl: url } : tm))
      );
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah foto pengurus.");
    } finally {
      setUploadingTeamIndex(null);
      setActiveTeamUploadIdx(null);
      if (teamPhotoInputRef.current) teamPhotoInputRef.current.value = "";
    }
  };

  // Past Activities CRUD
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
    setPastActivities((prev) => [...prev, newAct]);
  };

  const handleUpdateActivity = (index: number, key: keyof PastActivityItem, val: any) => {
    setPastActivities((prev) =>
      prev.map((act, i) => (i === index ? { ...act, [key]: val } : act))
    );
  };

  const handleRemoveActivity = (index: number) => {
    setPastActivities((prev) => prev.filter((_, i) => i !== index));
  };

  // Team Members CRUD
  const handleAddTeamMember = () => {
    const newMember: TeamMemberItem = {
      id: crypto.randomUUID(),
      name: "",
      role: "",
      photoUrl: null,
    };
    setTeamMembers((prev) => [...prev, newMember]);
  };

  const handleUpdateTeamMember = (index: number, key: keyof TeamMemberItem, val: any) => {
    setTeamMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [key]: val } : m))
    );
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  };

  // Save changes via PATCH /api/partners/current
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nama resmi lembaga wajib diisi.");
      setActiveCategory("info");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        name: name.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        organizationType: organizationType || null,
        foundedYear: foundedYear ? parseInt(String(foundedYear), 10) : null,
        focusArea,
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        website: website.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
        youtubeUrl: youtubeUrl.trim() || null,
        logoUrl: logoUrl.trim() || null,
        coverUrl: coverUrl.trim() || null,
        legalNumber: legalNumber.trim() || null,
        npwpNumber: npwpNumber.trim() || null,
        portfolioDocUrl: portfolioDocUrl.trim() || null,
        pastActivities: pastActivities.filter((act) => act.title.trim() !== ""),
        teamMembers: teamMembers.filter((m) => m.name.trim() !== ""),
      };

      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/partners/current", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui profil lembaga.");
      }

      setSuccessMessage("Profil lembaga berhasil diperbarui secara menyeluruh!");
      onProfileUpdated(json.data);

      setTimeout(() => {
        onBack();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan profil lembaga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto pb-28 space-y-6 animate-in fade-in duration-200">
      {/* Hidden File Inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleLogoFileChange}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleCoverFileChange}
      />
      <input
        ref={portfolioDocInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePortfolioDocFileChange}
      />
      <input
        ref={activityPhotoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleActivityPhotoFileChange}
      />
      <input
        ref={teamPhotoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleTeamPhotoFileChange}
      />

      {/* Top Header & Breadcrumb Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleAttemptBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#181343] transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Profil Lembaga</span>
          </button>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pengaturan & Edit Profil Lembaga
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Perbarui identitas resmi, visual branding, bidang keahlian, legalitas SK/NPWP, serta rekam jejak portofolio organisasi Anda.
          </p>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={legalNumber && npwpNumber ? "emerald" : "amber"}
            size="md"
            className="px-3 py-1 font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-current" />
            <span>
              {legalNumber && npwpNumber
                ? "Dokumen Legalitas Lengkap"
                : "Menunggu Kelengkapan Berkas"}
            </span>
          </Badge>
        </div>
      </div>

      {/* Alert Banners (Error or Success) */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Gagal Menyimpan:</span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Berhasil:</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Category Navigation (Sticky) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-2 space-y-1">
            {/* Category 1: Informasi Lembaga */}
            <button
              type="button"
              onClick={() => setActiveCategory("info")}
              className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                activeCategory === "info"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  activeCategory === "info" ? "bg-white/10 text-white" : "bg-slate-100 text-[#181343]"
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold block leading-tight">
                  Informasi Lembaga
                </span>
                <span
                  className={`text-[11px] block mt-0.5 truncate ${
                    activeCategory === "info" ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  Nama resmi, bentuk & kontak
                </span>
              </div>
            </button>

            {/* Category 2: Branding & Visual */}
            <button
              type="button"
              onClick={() => setActiveCategory("branding")}
              className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                activeCategory === "branding"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  activeCategory === "branding" ? "bg-white/10 text-white" : "bg-slate-100 text-emerald-700"
                }`}
              >
                <Palette className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold block leading-tight">
                  Branding & Tampilan
                </span>
                <span
                  className={`text-[11px] block mt-0.5 truncate ${
                    activeCategory === "branding" ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  Logo resmi, foto sampul & tagline
                </span>
              </div>
            </button>

            {/* Category 3: Fokus & Rekam Jejak */}
            <button
              type="button"
              onClick={() => setActiveCategory("portfolio")}
              className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                activeCategory === "portfolio"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  activeCategory === "portfolio" ? "bg-white/10 text-white" : "bg-slate-100 text-teal-700"
                }`}
              >
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold block leading-tight">
                  Fokus & Rekam Jejak
                </span>
                <span
                  className={`text-[11px] block mt-0.5 truncate ${
                    activeCategory === "portfolio" ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  Bidang keahlian & portofolio kegiatan
                </span>
              </div>
            </button>

            {/* Category 4: Legalitas & Kepatuhan */}
            <button
              type="button"
              onClick={() => setActiveCategory("legal")}
              className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                activeCategory === "legal"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  activeCategory === "legal" ? "bg-white/10 text-white" : "bg-slate-100 text-blue-700"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold block leading-tight">
                  Legalitas & Dokumen
                </span>
                <span
                  className={`text-[11px] block mt-0.5 truncate ${
                    activeCategory === "legal" ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  SK Kemenkumham, NPWP & profil PDF
                </span>
              </div>
            </button>

            {/* Category 5: Tim & PIC Lembaga */}
            <button
              type="button"
              onClick={() => setActiveCategory("team")}
              className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                activeCategory === "team"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  activeCategory === "team" ? "bg-white/10 text-white" : "bg-slate-100 text-purple-700"
                }`}
              >
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold block leading-tight">
                  Tim & PIC Lembaga
                </span>
                <span
                  className={`text-[11px] block mt-0.5 truncate ${
                    activeCategory === "team" ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  Pengurus organisasi & koordinator
                </span>
              </div>
            </button>
          </div>

          {/* Quick Help Card */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Verifikasi Berkas SIPENA</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Kelengkapan profil dan dokumen administratif mempercepat proses kurasi oleh perusahaan sponsor sebelum penandatanganan MoU program CSR.
            </p>
          </div>
        </div>

        {/* Right Column: Form Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: INFORMASI LEMBAGA & KONTAK */}
          {activeCategory === "info" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Identitas Resmi Organisasi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informasi nama lembaga, bentuk hukum, serta alamat sekretariat operasional.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lembaga */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Nama Resmi Lembaga / Yayasan <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">Sesuai akta pendirian</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Yayasan Peduli Negeri Sejahtera"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Bentuk Organisasi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Bentuk Badan Hukum
                  </label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    {ORGANIZATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tahun Berdiri */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Tahun Berdiri
                  </label>
                  <input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    placeholder="Contoh: 2018"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Sub-Header Kontak */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Kontak & Domisili Sekretariat
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Saluran komunikasi yang dapat dihubungi oleh perusahaan sponsor CSR.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Resmi Organisasi</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kontak@yayasan.org"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nomor Telepon / WhatsApp</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812-3456-7890"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Alamat Sekretariat */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Alamat Kantor / Sekretariat</span>
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Jl. Bahari No. 12, Kelurahan Melati, Kecamatan ..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-relaxed"
                    />
                  </div>

                  {/* Provinsi */}
                  <SearchableSelect
                    label="Provinsi Domisili"
                    placeholder="Pilih Provinsi..."
                    value={province}
                    onChange={handleProvinceChange}
                    options={provinceOptions}
                    helperText="Pilih provinsi domisili sekretariat"
                  />

                  {/* Kota / Kabupaten */}
                  <SearchableSelect
                    label="Kota / Kabupaten"
                    placeholder="Pilih Kota / Kabupaten..."
                    value={city}
                    onChange={setCity}
                    options={cityOptions}
                    disabled={!province}
                    helperText="Pilih kota/kabupaten domisili"
                  />

                  {/* Website */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Website Resmi</span>
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yayasan.org"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Akun Instagram (URL / Handle)</label>
                    <input
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/yayasanpeduli"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Profil LinkedIn</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/yayasan"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kanal YouTube (Dokumentasi)</label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@yayasan"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: BRANDING & TAMPILAN */}
          {activeCategory === "branding" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Visual Branding & Identitas Tampilan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah logo resmi dan banner lapangan untuk membangun impresi profesional di hadapan mitra sponsor.
                </p>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Slogan / Tagline Lembaga</span>
                  <span className="text-[10px] text-slate-400 font-normal">Maksimal 255 karakter</span>
                </label>
                <input
                  type="text"
                  maxLength={255}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Contoh: Mengabdi untuk Masa Depan Pendidikan dan Kesejahteraan Masyarakat Marjinal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Logo Upload Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Logo Resmi Lembaga
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Lembaga"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#181343] to-emerald-800 text-white flex items-center justify-center font-black text-2xl">
                        {name ? name.substring(0, 2).toUpperCase() : "LG"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <span className="text-xs text-slate-600 block">
                      Disarankan menggunakan gambar rasio 1:1 format PNG atau JPG transparan (maksimal 2MB).
                    </span>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isUploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        leftIcon={
                          isUploadingLogo ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        {isUploadingLogo ? "Mengunggah..." : logoUrl ? "Ganti Logo" : "Unggah Logo"}
                      </Button>
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Banner Upload Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Foto Sampul / Banner Lapangan
                </label>
                <div className="space-y-3">
                  <div className="h-44 sm:h-52 w-full rounded-2xl bg-slate-900 overflow-hidden relative border border-slate-200">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt="Foto Sampul"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#181343] via-[#1F195A] to-[#0A4D3C] flex flex-col items-center justify-center text-white/50 p-4 text-center">
                        <Building2 className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs">Belum ada foto sampul profil lapangan</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Format lanskap (16:9), maksimal 5MB (JPG, PNG, atau WEBP).</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isUploadingCover}
                        onClick={() => coverInputRef.current?.click()}
                        leftIcon={
                          isUploadingCover ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Camera className="w-3.5 h-3.5" />
                          )
                        }
                        className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold"
                      >
                        {isUploadingCover ? "Mengunggah..." : coverUrl ? "Ganti Sampul" : "Unggah Sampul"}
                      </Button>
                      {coverUrl && (
                        <button
                          type="button"
                          onClick={() => setCoverUrl("")}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: FOKUS & REKAM JEJAK PORTOFOLIO */}
          {activeCategory === "portfolio" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Fokus Bidang & Rekam Jejak Lapangan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan spesialisasi program lembaga dan cantumkan pengalaman intervensi sosial yang telah berhasil dilaksanakan.
                </p>
              </div>

              {/* Fokus Bidang Keahlian */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Pilih Bidang Keahlian Utama
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {NGO_FOCUS_AREAS.map((area) => (
                    <div
                      key={area.id}
                      onClick={() => setFocusArea(area.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        focusArea === area.id
                          ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          focusArea === area.id
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {focusArea === area.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {area.label}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                          {area.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deskripsi & Visi-Misi Lembaga */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Deskripsi, Visi, Misi & Metodologi Kerja</span>
                  <span className="text-[10px] text-slate-400 font-normal">Minimal 30 karakter</span>
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan sejarah berdirinya yayasan, visi, misi, fokus komunitas binaan, serta metodologi pendekatan lapangan yang digunakan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-relaxed"
                />
              </div>

              {/* Rekam Jejak Portofolio Lapangan (pastActivities) */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Rekam Jejak Portofolio Kegiatan Lapangan ({pastActivities.length})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Cantumkan inisiatif nyata yang telah berhasil diselesaikan oleh tim lembaga Anda.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddActivity}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
                  >
                    Tambah Portofolio
                  </Button>
                </div>

                {pastActivities.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">
                      Belum Ada Portofolio Kegiatan
                    </span>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Klik tombol "Tambah Portofolio" di atas untuk mencantumkan pengalaman keberhasilan program Anda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastActivities.map((act, index) => (
                      <div
                        key={act.id || index}
                        className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
                          <span className="text-xs font-extrabold text-[#181343] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            Kegiatan #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(index)}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Judul Kegiatan */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">
                              Judul Kegiatan / Program <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={act.title}
                              onChange={(e) => handleUpdateActivity(index, "title", e.target.value)}
                              placeholder="Contoh: Program Air Bersih Desa Sindang"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          {/* Tahun Pelaksanaan */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">
                              Tahun Pelaksanaan
                            </label>
                            <input
                              type="text"
                              value={act.year}
                              onChange={(e) => handleUpdateActivity(index, "year", e.target.value)}
                              placeholder="Contoh: 2023"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          {/* Klien / Mitra Sponsor */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">
                              Mitra Sponsor / Klien CSR
                            </label>
                            <input
                              type="text"
                              value={act.clientSponsor || ""}
                              onChange={(e) => handleUpdateActivity(index, "clientSponsor", e.target.value)}
                              placeholder="Contoh: PT Telkom Indonesia"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          {/* Penerima Manfaat */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">
                              Target / Jumlah Penerima Manfaat
                            </label>
                            <input
                              type="text"
                              value={act.beneficiaries || ""}
                              onChange={(e) => handleUpdateActivity(index, "beneficiaries", e.target.value)}
                              placeholder="Contoh: 450 KK / 1.800 Jiwa Warga Pesisir"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          {/* Deskripsi Intervensi */}
                          <div className="sm:col-span-3 space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">
                              Ringkasan Intervensi & Dampak Nyata
                            </label>
                            <textarea
                              rows={2}
                              value={act.description}
                              onChange={(e) => handleUpdateActivity(index, "description", e.target.value)}
                              placeholder="Jelaskan ringkas bentuk intervensi lapangan dan capaian nyatanya..."
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                            />
                          </div>

                          {/* Foto Dokumentasi */}
                          <div className="sm:col-span-3 space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">
                              Foto Dokumentasi Kegiatan
                            </label>
                            <div className="flex items-center gap-3">
                              {act.photoUrl ? (
                                <img
                                  src={act.photoUrl}
                                  alt="Dokumentasi"
                                  className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                                />
                              ) : null}
                              <Button
                                type="button"
                                size="sm"
                                disabled={uploadingActivityIndex === index}
                                onClick={() => {
                                  setActiveActivityUploadIdx(index);
                                  activityPhotoInputRef.current?.click();
                                }}
                                leftIcon={
                                  uploadingActivityIndex === index ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Camera className="w-3.5 h-3.5" />
                                  )
                                }
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                              >
                                {uploadingActivityIndex === index
                                  ? "Mengunggah..."
                                  : act.photoUrl
                                  ? "Ganti Foto"
                                  : "Unggah Foto Dokumentasi"}
                              </Button>
                              {act.photoUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateActivity(index, "photoUrl", null)}
                                  className="text-xs text-rose-500 hover:underline"
                                >
                                  Hapus Foto
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: LEGALITAS & DOKUMEN */}
          {activeCategory === "legal" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Legalitas & Kepatuhan Administratif
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lengkapi nomor registrasi hukum dan berkas profil yayasan untuk validasi verifikasi administratif di SIPENA.
                </p>
              </div>

              {/* Informative Alert */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Pemeriksaan Administratif Berkas</span>
                  <span className="text-[11px] text-blue-800 block">
                    SIPENA melakukan verifikasi administratif terhadap keabsahan format nomor SK Kemenkumham dan NPWP. Proses ini bertujuan menjamin kepatuhan tata kelola tanpa mengubah ketentuan hukum resmi yang berlaku.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nomor SK Kemenkumham */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Nomor SK Pengesahan Kemenkumham</span>
                    <span className="text-[10px] text-slate-400 font-normal">Akta Pendirian</span>
                  </label>
                  <input
                    type="text"
                    value={legalNumber}
                    onChange={(e) => setLegalNumber(e.target.value)}
                    placeholder="Contoh: AHU-0012345.AH.01.04.Tahun 2019"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Cantumkan nomor SK Pengesahan Badan Hukum dari Kementerian Hukum dan HAM.
                  </span>
                </div>

                {/* Nomor NPWP Lembaga */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Nomor Pokok Wajib Pajak (NPWP)</span>
                    <span className="text-[10px] text-slate-400 font-normal">NPWP Lembaga</span>
                  </label>
                  <input
                    type="text"
                    value={npwpNumber}
                    onChange={(e) => setNpwpNumber(e.target.value)}
                    placeholder="Contoh: 01.234.567.8-901.000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Gunakan NPWP terdaftar atas nama lembaga/yayasan, bukan perorangan.
                  </span>
                </div>
              </div>

              {/* Upload Berkas Portofolio / Profil Lembaga PDF */}
              <div className="border-t border-slate-100 pt-6 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Dokumen Portofolio & Company Profile Yayasan (PDF)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Unggah dokumen company profile atau portofolio resmi (PDF) agar perusahaan sponsor dapat meninjau rekam jejak secara lengkap.
                  </p>
                </div>

                {portfolioDocUrl ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          Dokumen_Portofolio_Lembaga.pdf
                        </span>
                        <a
                          href={portfolioDocUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Buka Berkas PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isUploadingPortfolioDoc}
                        onClick={() => portfolioDocInputRef.current?.click()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                      >
                        Ganti PDF
                      </Button>
                      <button
                        type="button"
                        onClick={() => setPortfolioDocUrl("")}
                        className="text-xs text-rose-600 hover:text-rose-800 p-1.5"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => portfolioDocInputRef.current?.click()}
                    className="py-10 px-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20 text-center space-y-2 cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                      {isUploadingPortfolioDoc ? (
                        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                      ) : (
                        <Upload className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        {isUploadingPortfolioDoc ? "Mengunggah Dokumen PDF..." : "Pilih atau Seret Dokumen PDF Portofolio"}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Format PDF resmi. Ukuran berkas maksimal 10MB.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: TIM & PIC LEMBAGA */}
          {activeCategory === "team" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Pengurus & Tim Pelaksana Lembaga ({teamMembers.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cantumkan struktur pengurus inti, penanggung jawab program, dan koordinator lapangan.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTeamMember}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
                >
                  Tambah Pengurus
                </Button>
              </div>

              {teamMembers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-slate-700 block">
                    Belum Ada Tim / Pengurus yang Dicantumkan
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Klik tombol "Tambah Pengurus" untuk menambahkan PIC utama atau anggota pengurus yayasan Anda.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div
                      key={member.id || index}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
                        <span className="text-xs font-extrabold text-[#181343]">
                          Anggota #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(index)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Member Photo */}
                        <div className="sm:col-span-3 flex flex-col items-center sm:items-start gap-2">
                          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center shrink-0">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            disabled={uploadingTeamIndex === index}
                            onClick={() => {
                              setActiveTeamUploadIdx(index);
                              teamPhotoInputRef.current?.click();
                            }}
                            className="text-[11px] py-1 h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800"
                          >
                            {uploadingTeamIndex === index ? "..." : member.photoUrl ? "Ganti" : "Foto"}
                          </Button>
                        </div>

                        {/* Name & Role Inputs */}
                        <div className="sm:col-span-9 space-y-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">
                              Nama Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => handleUpdateTeamMember(index, "name", e.target.value)}
                              placeholder="Contoh: Dr. Budi Santoso, M.Si"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">
                              Jabatan / Peran di Organisasi <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => handleUpdateTeamMember(index, "role", e.target.value)}
                              placeholder="Contoh: Direktur Eksekutif / Koordinator Lapangan"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STICKY BOTTOM ACTION BAR */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 sm:px-8 shadow-lg">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Change status */}
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Ada perubahan yang belum disimpan</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Semua data telah sinkron</span>
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAttemptBack}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-lg bg-white border border-[#E5E7EB] text-[#181343] hover:bg-slate-50 transition-colors text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
              variant="primary" className="h-10 px-6 rounded-xl text-xs sm:text-sm cursor-pointer"
            >
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      {isDiscardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Buang Perubahan Profil?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anda memiliki beberapa perubahan informasi yang belum disimpan. Jika keluar sekarang, seluruh perubahan tersebut akan hilang.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDiscardModalOpen(false)}
                className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Tetap di Halaman Ini
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDiscardModalOpen(false);
                  onBack();
                }}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Ya, Buang Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

