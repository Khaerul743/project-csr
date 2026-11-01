"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AlertTriangle,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CsrLeaderItem, CompanyDetailedProfile } from "@/modules/companies/company.interface";

export type ProfileCategoryTab = "info" | "branding" | "csr" | "legal";

interface EditCompanyProfilePageViewProps {
  company: CompanyDetailedProfile | any;
  initialCategory?: ProfileCategoryTab;
  onBack: () => void;
  onProfileUpdated: (updated: CompanyDetailedProfile) => void;
}

const INDUSTRY_OPTIONS = [
  "Energi, Minyak & Gas",
  "Pertambangan & Mineral",
  "Perbankan & Jasa Keuangan",
  "Teknologi & Telekomunikasi",
  "Manufaktur & Otomotif",
  "FMCG, Makanan & Minuman",
  "Kesehatan & Farmasi",
  "Agrikultur & Perkebunan",
  "Konstruksi, Real Estate & Infrastruktur",
  "Transportasi, Logistik & Maritim",
  "Ritel & E-Commerce",
  "Pendidikan & Pelatihan",
  "Konglomerasi & Investasi",
  "Lainnya",
];

const COMPANY_SIZE_OPTIONS = [
  "1-50 Karyawan (Startup / UKM)",
  "51-200 Karyawan (Menengah)",
  "201-1.000 Karyawan (Korporasi)",
  "1.000+ Karyawan (Enterprise / Multinasional)",
];

const CSR_FOCUS_PILLARS = [
  { id: "PENDIDIKAN", label: "Pendidikan & Literasi", desc: "Beasiswa, sarana sekolah & literasi digital" },
  { id: "LINGKUNGAN", label: "Lingkungan & Alam", desc: "Reforestasi, konservasi hayati & energi bersih" },
  { id: "KESEHATAN", label: "Kesehatan Masyarakat", desc: "Pencegahan stunting, gizi & posyandu warga" },
  { id: "PEMBERDAYAAN_EKONOMI", label: "Ekonomi & UMKM", desc: "Inkubasi wirausaha, pelatihan & kemandirian binaan" },
  { id: "INFRASTRUKTUR_SOSIAL", label: "Infrastruktur Sosial", desc: "Air bersih, jembatan desa & fasilitas publik" },
  { id: "TANGGAP_BENCANA", label: "Tanggap Bencana", desc: "Bantuan darurat kemanusiaan & rehabilitasi bencana" },
];

export function EditCompanyProfilePageView({
  company,
  initialCategory = "info",
  onBack,
  onProfileUpdated,
}: EditCompanyProfilePageViewProps) {
  const [activeCategory, setActiveCategory] = useState<ProfileCategoryTab>(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  // File Upload states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);

  // Form Fields State
  const [name, setName] = useState(company?.name || "");
  const [tagline, setTagline] = useState(company?.tagline || "");
  const [description, setDescription] = useState(company?.description || "");
  const [csrVision, setCsrVision] = useState(company?.csrVision || "");
  const [industry, setIndustry] = useState(company?.industry || "");
  const [companySize, setCompanySize] = useState(company?.companySize || "");
  const [foundedYear, setFoundedYear] = useState<string | number>(company?.foundedYear || "");
  const [email, setEmail] = useState(company?.email || "");
  const [phone, setPhone] = useState(company?.phone || "");
  const [address, setAddress] = useState(company?.address || "");
  const [city, setCity] = useState(company?.city || "");
  const [province, setProvince] = useState(company?.province || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [linkedinUrl, setLinkedinUrl] = useState(company?.linkedinUrl || "");
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl || "");
  const [coverUrl, setCoverUrl] = useState(company?.coverUrl || "");
  const [nibNumber, setNibNumber] = useState(company?.nibNumber || "");
  const [npwpNumber, setNpwpNumber] = useState(company?.npwpNumber || "");
  const [sustainabilityReportUrl, setSustainabilityReportUrl] = useState(company?.sustainabilityReportUrl || "");

  // CSR Leaders / PICs
  const [csrLeaders, setCsrLeaders] = useState<CsrLeaderItem[]>(() => {
    if (!company?.csrLeaders) return [];
    if (Array.isArray(company.csrLeaders)) return company.csrLeaders;
    try {
      return JSON.parse(company.csrLeaders);
    } catch {
      return [];
    }
  });

  // Selected CSR Pillars
  const [selectedPillars, setSelectedPillars] = useState<string[]>(() => {
    // If company has focus areas or infer from vision/industry
    return ["PENDIDIKAN", "LINGKUNGAN", "PEMBERDAYAAN_EKONOMI"];
  });

  // Track initial state for dirty detection
  const initialState = useRef({
    name: company?.name || "",
    tagline: company?.tagline || "",
    description: company?.description || "",
    csrVision: company?.csrVision || "",
    industry: company?.industry || "",
    companySize: company?.companySize || "",
    foundedYear: company?.foundedYear || "",
    email: company?.email || "",
    phone: company?.phone || "",
    address: company?.address || "",
    city: company?.city || "",
    province: company?.province || "",
    website: company?.website || "",
    linkedinUrl: company?.linkedinUrl || "",
    logoUrl: company?.logoUrl || "",
    coverUrl: company?.coverUrl || "",
    nibNumber: company?.nibNumber || "",
    npwpNumber: company?.npwpNumber || "",
    sustainabilityReportUrl: company?.sustainabilityReportUrl || "",
  });

  const isDirty =
    name !== initialState.current.name ||
    tagline !== initialState.current.tagline ||
    description !== initialState.current.description ||
    csrVision !== initialState.current.csrVision ||
    industry !== initialState.current.industry ||
    companySize !== initialState.current.companySize ||
    String(foundedYear) !== String(initialState.current.foundedYear) ||
    email !== initialState.current.email ||
    phone !== initialState.current.phone ||
    address !== initialState.current.address ||
    city !== initialState.current.city ||
    province !== initialState.current.province ||
    website !== initialState.current.website ||
    linkedinUrl !== initialState.current.linkedinUrl ||
    logoUrl !== initialState.current.logoUrl ||
    coverUrl !== initialState.current.coverUrl ||
    nibNumber !== initialState.current.nibNumber ||
    npwpNumber !== initialState.current.npwpNumber ||
    sustainabilityReportUrl !== initialState.current.sustainabilityReportUrl;

  const isLegalChanged =
    nibNumber !== (company?.nibNumber || "") ||
    npwpNumber !== (company?.npwpNumber || "") ||
    sustainabilityReportUrl !== (company?.sustainabilityReportUrl || "");

  // Safe Back button handler with unsaved confirmation
  const handleAttemptBack = () => {
    if (isDirty) {
      setIsDiscardModalOpen(true);
    } else {
      onBack();
    }
  };

  // Generic File Upload Handler
  const uploadFile = async (file: File, folder: "logos" | "covers" | "reports"): Promise<string> => {
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
      const url = await uploadFile(file, "logos");
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
      const url = await uploadFile(file, "covers");
      setCoverUrl(url);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah foto sampul.");
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Upload Sustainability Report PDF
  const handleReportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMessage("Laporan keberlanjutan harus dalam format dokumen PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran laporan maksimal 10MB.");
      return;
    }

    setIsUploadingReport(true);
    setErrorMessage(null);
    try {
      const url = await uploadFile(file, "reports");
      setSustainabilityReportUrl(url);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah dokumen PDF.");
    } finally {
      setIsUploadingReport(false);
      if (reportInputRef.current) reportInputRef.current.value = "";
    }
  };

  // Leaders / PIC helper
  const handleAddLeader = () => {
    setCsrLeaders((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", role: "Koordinator Program CSR", email: "", phone: "" },
    ]);
  };

  const handleUpdateLeader = (index: number, field: keyof CsrLeaderItem, val: string) => {
    setCsrLeaders((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveLeader = (index: number) => {
    setCsrLeaders((prev) => prev.filter((_, i) => i !== index));
  };

  // Pillar toggle
  const togglePillar = (pillarId: string) => {
    setSelectedPillars((prev) =>
      prev.includes(pillarId) ? prev.filter((p) => p !== pillarId) : [...prev, pillarId]
    );
  };

  // Save changes
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nama resmi perusahaan wajib diisi.");
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
        csrVision: csrVision.trim() || null,
        industry: industry || null,
        companySize: companySize || null,
        foundedYear: foundedYear ? parseInt(String(foundedYear), 10) : null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        website: website.trim() || null,
        logoUrl: logoUrl || null,
        coverUrl: coverUrl || null,
        nibNumber: nibNumber.trim() || null,
        npwpNumber: npwpNumber.trim() || null,
        sustainabilityReportUrl: sustainabilityReportUrl || null,
        linkedinUrl: linkedinUrl.trim() || null,
        csrLeaders: csrLeaders.filter((l) => l.name.trim() !== ""),
      };

      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/companies/current", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui profil perusahaan");
      }

      const updatedCompany = json.data;

      // If legal documents changed, ensure verification reflects pending status
      if (isLegalChanged) {
        updatedCompany.verificationStatus = "PENDING";
      }

      setSuccessMessage(
        isLegalChanged
          ? "Profil berhasil diperbarui. Perubahan dokumen legalitas telah dikirimkan ke tim verifikator SIPENA untuk peninjauan ulang administratif."
          : "Profil perusahaan berhasil diperbarui."
      );

      onProfileUpdated(updatedCompany);

      // Brief delay to allow feedback before returning to profile
      setTimeout(() => {
        onBack();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto pb-28 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleAttemptBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#181343] transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Profil Perusahaan</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengaturan & Edit Profil Perusahaan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Perbarui identitas resmi, visual branding, komitmen ESG, dan berkas kepatuhan legalitas organisasi Anda.
          </p>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={company?.nibNumber && company?.npwpNumber ? "emerald" : "amber"}
            size="md"
            className="px-3 py-1 font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-current" />
            <span>
              {company?.nibNumber && company?.npwpNumber
                ? "Terverifikasi Administratif"
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
            className="text-rose-500 hover:text-rose-800"
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
            {/* Category 1: Informasi Perusahaan */}
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
                  Informasi Perusahaan
                </span>
                <span
                  className={`text-[11px] block mt-0.5 truncate ${
                    activeCategory === "info" ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  Nama resmi, deskripsi & kontak
                </span>
              </div>
            </button>

            {/* Category 2: Branding & Tampilan */}
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

            {/* Category 3: Komitmen CSR */}
            <button
              type="button"
              onClick={() => setActiveCategory("csr")}
              className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                activeCategory === "csr"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  activeCategory === "csr" ? "bg-white/10 text-white" : "bg-slate-100 text-teal-700"
                }`}
              >
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold block leading-tight">
                  Komitmen CSR
                </span>
                <span
                  className={`text-[11px] block mt-0.5 truncate ${
                    activeCategory === "csr" ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  Visi ESG & pilar dampak sosial
                </span>
              </div>
            </button>

            {/* Category 4: Legalitas & Dokumen */}
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
                  NIB, NPWP & Laporan Keberlanjutan
                </span>
              </div>
            </button>
          </div>

          {/* Quick Informational Card on Sidebar */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kredibilitas Profil</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Profil institusi yang lengkap dengan logo beresolusi tinggi, narasi komitmen ESG, dan nomor legalitas resmi mendapatkan tingkat respons kemitraan 3x lebih tinggi dari mitra pelaksana SIPENA.
            </p>
          </div>
        </div>

        {/* Right Column: Form Editing Panels */}
        <div className="lg:col-span-8 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: INFORMASI PERUSAHAAN */}
          {/* ========================================================================= */}
          {activeCategory === "info" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Card 1.1: Identitas Pokok */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Identitas Pokok Perusahaan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nama resmi badan usaha, sektor industri usaha utama, dan tahun pendirian.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Nama Perusahaan */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">
                      Nama Resmi Perusahaan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: PT Sumber Daya Berkelanjutan Tbk"
                      className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sektor Industri */}
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">
                        Sektor Industri
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all cursor-pointer"
                      >
                        <option value="">Pilih Sektor Industri</option>
                        {INDUSTRY_OPTIONS.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Skala Perusahaan */}
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">
                        Skala / Jumlah Karyawan
                      </label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all cursor-pointer"
                      >
                        <option value="">Pilih Skala Perusahaan</option>
                        {COMPANY_SIZE_OPTIONS.map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tahun Berdiri */}
                  <div className="sm:w-1/2">
                    <label className="font-bold text-slate-800 block mb-1.5">
                      Tahun Berdiri
                    </label>
                    <input
                      type="number"
                      value={foundedYear}
                      onChange={(e) => setFoundedYear(e.target.value)}
                      placeholder="Contoh: 2008"
                      min={1800}
                      max={2100}
                      className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                    />
                  </div>

                  {/* Deskripsi Perusahaan */}
                  <div className="pt-2">
                    <label className="font-bold text-slate-800 block mb-1.5">
                      Profil & Narasi Latar Belakang Perusahaan
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ceritakan sejarah singkat, cakupan operasional, dan nilai-nilai fundamental perusahaan yang mendasari inisiatif sosial Anda..."
                      className="w-full p-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all leading-relaxed"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Panjang karakter disarankan: 150 - 1.000 kata.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 1.2: Domisili & Kantor Pusat */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Domisili & Kantor Pusat
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lokasi alamat operasional kantor pusat perusahaan.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">
                        Kota / Kabupaten
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Contoh: Jakarta Selatan"
                        className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">
                        Provinsi
                      </label>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="Contoh: DKI Jakarta"
                        className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">
                      Alamat Kantor Lengkap
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Gedung Menara Mandiri Lt. 18, Jl. Jend. Sudirman Kav. 54-55..."
                      className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Card 1.3: Kontak & Saluran Komunikasi Resmi */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Kontak & Tautan Resmi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saluran komunikasi yang dapat dihubungi oleh calon mitra dan publik.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Resmi Organisasi</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="csr@perusahaan.co.id"
                      className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nomor Telepon Kantor</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="021-5290xxxx"
                      className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Website Resmi</span>
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.perusahaan.co.id"
                      className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Profil LinkedIn Perusahaan</span>
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BRANDING & TAMPILAN */}
          {/* ========================================================================= */}
          {activeCategory === "branding" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Tagline Slogan */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Tagline & Slogan Keberlanjutan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pernyataan identitas singkat yang muncul tepat di bawah nama perusahaan.
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Contoh: Menghubungkan Energi, Memberdayakan Masyarakat dan Masa Depan"
                    className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                  />
                  <span className="text-[11px] text-slate-400 mt-1.5 block">
                    Disarankan maksimal 120 karakter agar ringkas dan mudah diingat.
                  </span>
                </div>
              </div>

              {/* Logo Resmi Upload */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Logo Resmi Perusahaan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unggah file gambar logo resmi untuk ditampilkan pada profil, proposal, dan sertifikat kemitraan.
                  </p>
                </div>

                {/* Hidden input */}
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Logo Preview Frame */}
                  <div className="relative group shrink-0">
                    <div className="w-32 h-32 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-2 shadow-xs">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo Perusahaan"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-400 p-2">
                          <Building2 className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          <span className="text-[10px] font-semibold block">Belum ada logo</span>
                        </div>
                      )}
                    </div>

                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white backdrop-blur-2xs">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="text-[10px] mt-1 font-semibold">Mengunggah...</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & Requirements */}
                  <div className="space-y-3 text-xs flex-1 text-center sm:text-left">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 text-sm block">
                        File Gambar Logo
                      </span>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Format yang didukung: PNG (latar transparan disarankan), JPG, atau WEBP. Ukuran maksimal 2MB. Resolusi proporsional 1:1 (minimal 400x400 piksel).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                        className="font-bold text-xs h-9 px-4 rounded-lg border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        {logoUrl ? "Ganti Logo" : "Unggah Logo"}
                      </Button>

                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Logo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Banner Upload */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Foto Sampul Profil (Cover Banner)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Banner visual di bagian atas halaman profil perusahaan. Memberikan kesan institusional dan merefleksikan kegiatan lapangan.
                  </p>
                </div>

                {/* Hidden input */}
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                {/* Cover Preview Box (16:5 ratio) */}
                <div className="relative w-full h-44 sm:h-56 rounded-2xl border border-slate-200 overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Cover Banner"
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="text-center text-slate-400 p-6">
                      <Camera className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-500" />
                      <p className="text-xs font-semibold text-slate-300">
                        Belum ada foto sampul profil yang diunggah
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Resolusi ideal: 1920 × 480 piksel
                      </p>
                    </div>
                  )}

                  {isUploadingCover && (
                    <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white backdrop-blur-xs">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-bold mt-2">Mengunggah Foto Sampul...</span>
                    </div>
                  )}

                  {/* Action Overlay */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{coverUrl ? "Ganti Foto Sampul" : "Unggah Sampul"}</span>
                    </button>

                    {coverUrl && (
                      <button
                        type="button"
                        onClick={() => setCoverUrl("")}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-white text-rose-600 backdrop-blur-md text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 leading-relaxed">
                  💡 <strong>Saran Visual:</strong> Gunakan foto aktivitas nyata CSR di lapangan (kegiatan penanaman pohon, pelatihan UMKM warga, atau peresmian program) dengan pencahayaan yang baik dan orientasi horizontal lebar.
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: KOMITMEN CSR */}
          {/* ========================================================================= */}
          {activeCategory === "csr" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Visi ESG & Komitmen */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Visi Keberlanjutan & Komitmen ESG
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pernyataan arah kebijakan CSR dan kontribusi terhadap tujuan pembangunan berkelanjutan (SDGs).
                  </p>
                </div>

                <div>
                  <textarea
                    rows={5}
                    value={csrVision}
                    onChange={(e) => setCsrVision(e.target.value)}
                    placeholder="Contoh: Kami berkomitmen mengintegrasikan prinsip Environmental, Social, and Governance (ESG) dalam seluruh rantai nilai bisnis, berfokus pada kemandirian ekonomi masyarakat sekitar dan perlindungan ekosistem alami..."
                    className="w-full p-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all leading-relaxed"
                  />
                  <span className="text-[11px] text-slate-400 mt-1.5 block">
                    Visi ini akan ditampilkan secara menonjol pada tab "Profil & Informasi Perusahaan".
                  </span>
                </div>
              </div>

              {/* Pilar Prioritas CSR */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Pilar Prioritas Program CSR Organisasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih bidang fokus yang menjadi target utama alokasi dana dan inisiatif program perusahaan Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {CSR_FOCUS_PILLARS.map((pillar) => {
                    const isSelected = selectedPillars.includes(pillar.id);
                    return (
                      <div
                        key={pillar.id}
                        onClick={() => togglePillar(pillar.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/50 shadow-2xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                            {pillar.label}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {pillar.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tim Pengelola & PIC CSR */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Tim Pengelola & Penanggung Jawab (PIC) CSR
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kontak person perwakilan perusahaan untuk koordinasi teknis dengan mitra pelaksana.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLeader}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="font-bold text-xs rounded-lg border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    Tambah PIC
                  </Button>
                </div>

                {csrLeaders.length === 0 ? (
                  <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
                    <p className="text-xs text-slate-500 font-medium">
                      Belum ada kontak PIC yang dicantumkan.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddLeader}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      + Tambah Kontak PIC Pertama
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {csrLeaders.map((leader, idx) => (
                      <div
                        key={leader.id || idx}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">
                            PIC #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLeader(idx)}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Nama Lengkap & Gelar
                            </label>
                            <input
                              type="text"
                              value={leader.name}
                              onChange={(e) => handleUpdateLeader(idx, "name", e.target.value)}
                              placeholder="Nama PIC"
                              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Jabatan / Peran
                            </label>
                            <input
                              type="text"
                              value={leader.role}
                              onChange={(e) => handleUpdateLeader(idx, "role", e.target.value)}
                              placeholder="Head of CSR / Manager Keberlanjutan"
                              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Email Kerja
                            </label>
                            <input
                              type="email"
                              value={leader.email || ""}
                              onChange={(e) => handleUpdateLeader(idx, "email", e.target.value)}
                              placeholder="pic@perusahaan.co.id"
                              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Nomor Telepon / WhatsApp
                            </label>
                            <input
                              type="tel"
                              value={leader.phone || ""}
                              onChange={(e) => handleUpdateLeader(idx, "phone", e.target.value)}
                              placeholder="0812xxxxxxxx"
                              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-900"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: LEGALITAS & DOKUMEN */}
          {/* ========================================================================= */}
          {activeCategory === "legal" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Notice Box: Re-verification Warning */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Kepatuhan Verifikasi Administratif SIPENA</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-800">
                  Untuk menjaga integritas dan akuntabilitas platform, setiap perubahan nomor NIB, NPWP, atau dokumen laporan legalitas resmi akan secara otomatis mengubah status verifikasi administratif organisasi menjadi <strong>"Menunggu Verifikasi Legalitas"</strong>. Tim verifikator SIPENA akan meninjau ulang keabsahan berkas sebelum menerbitkan status <em>Terverifikasi Administratif</em>.
                </p>
              </div>

              {/* NIB & NPWP Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Nomor Legalitas & Wajib Pajak Badan Usaha
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data legalitas badan usaha resmi Republik Indonesia yang terdaftar di OSS dan Ditjen Pajak.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* NIB */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                      <span>Nomor Induk Berusaha (NIB OSS)</span>
                      <span className="text-[11px] font-normal text-slate-400">13 digit nomor resmi</span>
                    </label>
                    <input
                      type="text"
                      value={nibNumber}
                      onChange={(e) => setNibNumber(e.target.value)}
                      placeholder="Contoh: 9120304859201"
                      className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                    />
                  </div>

                  {/* NPWP */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                      <span>NPWP Badan Usaha</span>
                      <span className="text-[11px] font-normal text-slate-400">Nomor Pokok Wajib Pajak</span>
                    </label>
                    <input
                      type="text"
                      value={npwpNumber}
                      onChange={(e) => setNpwpNumber(e.target.value)}
                      placeholder="Contoh: 01.234.567.8-012.000"
                      className="w-full h-11 px-4 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Laporan Keberlanjutan PDF Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Laporan Keberlanjutan Resmi (Sustainability Report PDF)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Laporan tahunan resmi yang memuat rekam jejak dampak sosial, tata kelola lingkungan, dan transparansi penyaluran dana CSR.
                  </p>
                </div>

                {/* Hidden input */}
                <input
                  type="file"
                  ref={reportInputRef}
                  onChange={handleReportFileChange}
                  accept="application/pdf"
                  className="hidden"
                />

                {sustainabilityReportUrl ? (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 block truncate">
                          Dokumen Laporan Keberlanjutan (PDF)
                        </span>
                        <a
                          href={sustainabilityReportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <span>Buka / Pratinjau Dokumen</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => reportInputRef.current?.click()}
                        disabled={isUploadingReport}
                        className="text-xs h-8 px-3 rounded-lg"
                      >
                        Ganti PDF
                      </Button>
                      <button
                        type="button"
                        onClick={() => setSustainabilityReportUrl("")}
                        className="text-xs text-rose-600 hover:text-rose-800 p-1.5"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => reportInputRef.current?.click()}
                    className="py-10 px-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20 text-center space-y-2 cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                      {isUploadingReport ? (
                        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                      ) : (
                        <Upload className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        {isUploadingReport ? "Mengunggah Dokumen PDF..." : "Pilih atau Seret Dokumen PDF Laporan"}
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

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="h-10 px-6 rounded-lg bg-[#181343] hover:bg-[#211B58] text-white transition-all text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL (LEAVING WITH UNSAVED CHANGES) */}
      {/* ========================================================================= */}
      {isDiscardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                Batalkan Perubahan Profil?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ada perubahan informasi yang belum Anda simpan. Jika Anda keluar sekarang, seluruh perubahan tersebut tidak akan tersimpan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDiscardModalOpen(false)}
                className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Lanjutkan Mengedit
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDiscardModalOpen(false);
                  onBack();
                }}
                className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Buang Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

