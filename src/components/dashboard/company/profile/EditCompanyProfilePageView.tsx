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
  RefreshCw,
  Lock,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { INDONESIAN_REGIONS } from "../opportunities/indonesian-regions";
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

const CATEGORY_TABS: { id: ProfileCategoryTab; label: string; icon: React.ElementType }[] = [
  { id: "info", label: "Informasi & Kontak", icon: Building2 },
  { id: "branding", label: "Branding & Visual", icon: Palette },
  { id: "csr", label: "Komitmen CSR", icon: Award },
  { id: "legal", label: "Legalitas & Berkas", icon: ShieldCheck },
];

const INPUT_BASE_CLASS =
  "w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium";

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
    return ["PENDIDIKAN", "LINGKUNGAN", "PEMBERDAYAAN_EKONOMI"];
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

  const handleAttemptBack = () => {
    if (isDirty) {
      setIsDiscardModalOpen(true);
    } else {
      onBack();
    }
  };

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

  const togglePillar = (pillarId: string) => {
    setSelectedPillars((prev) =>
      prev.includes(pillarId) ? prev.filter((p) => p !== pillarId) : [...prev, pillarId]
    );
  };

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

      if (isLegalChanged) {
        updatedCompany.verificationStatus = "PENDING";
      }

      setSuccessMessage(
        isLegalChanged
          ? "Profil berhasil diperbarui. Perubahan dokumen legalitas telah dikirimkan ke tim verifikator SIPENA untuk peninjauan ulang administratif."
          : "Profil perusahaan berhasil diperbarui."
      );

      onProfileUpdated(updatedCompany);

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
    <div className="max-w-4xl mx-auto pb-28 space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleAttemptBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#181343] transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Profil Perusahaan</span>
          </button>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pengaturan & Edit Profil Perusahaan
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Perbarui identitas resmi, visual branding, komitmen ESG, dan berkas kepatuhan legalitas organisasi Anda.
          </p>
        </div>

        {/* Verification Status Badge */}
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
            className="text-rose-500 hover:text-rose-800 cursor-pointer"
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

      {/* Top Pill Tabs Navigation (Standardized with Profile Views) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#181343] text-white shadow-xs"
                  : "bg-white text-[#47464F] border border-[#E5E7EB] hover:text-[#181343] hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INFORMASI PERUSAHAAN & KONTAK */}
      {/* ========================================================================= */}
      {activeCategory === "info" && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-150">
          {/* Bagian 1: Identitas Pokok */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Identitas Pokok Perusahaan
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Nama resmi badan usaha, sektor industri usaha utama, dan tahun pendirian.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Nama Perusahaan */}
              <div>
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5">
                  Nama Resmi Perusahaan <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PT Sumber Daya Berkelanjutan Tbk"
                  className={INPUT_BASE_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sektor Industri */}
                <div>
                  <label className="text-[13px] font-semibold text-[#181343] block mb-1.5">
                    Sektor Industri
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className={INPUT_BASE_CLASS}
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
                  <label className="text-[13px] font-semibold text-[#181343] block mb-1.5">
                    Skala / Jumlah Karyawan
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className={INPUT_BASE_CLASS}
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
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5">
                  Tahun Berdiri
                </label>
                <input
                  type="number"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="Contoh: 2008"
                  min={1800}
                  max={2100}
                  className={INPUT_BASE_CLASS}
                />
              </div>

              {/* Deskripsi Perusahaan */}
              <div>
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5">
                  Profil & Narasi Latar Belakang Perusahaan
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan sejarah singkat, cakupan operasional, dan nilai-nilai fundamental perusahaan yang mendasari inisiatif sosial Anda..."
                  className="w-full p-3.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[#181343] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#181343] focus:ring-2 focus:ring-[#181343]/15 transition-all outline-none leading-relaxed"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Panjang karakter disarankan: 150 - 1.000 kata.
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Bagian 2: Domisili & Kantor Pusat */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Domisili & Kantor Pusat
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Lokasi alamat operasional kantor pusat perusahaan.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SearchableSelect
                  label="Provinsi Kantor Pusat"
                  placeholder="Pilih Provinsi..."
                  value={province}
                  onChange={handleProvinceChange}
                  options={provinceOptions}
                  helperText="Pilih provinsi domisili kantor pusat"
                />

                <SearchableSelect
                  label="Kota / Kabupaten"
                  placeholder={province ? "Pilih Kota / Kabupaten..." : "Pilih Provinsi terlebih dahulu"}
                  value={city}
                  onChange={setCity}
                  options={cityOptions}
                  disabled={!province}
                  helperText="Pilih kota/kabupaten kantor pusat"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5">
                  Alamat Kantor Lengkap
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Gedung Menara Mandiri Lt. 18, Jl. Jend. Sudirman Kav. 54-55..."
                  className="w-full p-3.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[#181343] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#181343] focus:ring-2 focus:ring-[#181343]/15 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Bagian 3: Kontak & Saluran Komunikasi Resmi */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Kontak & Tautan Resmi
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Saluran komunikasi yang dapat dihubungi oleh calon mitra dan publik.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Email Resmi Organisasi</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="csr@perusahaan.co.id"
                  className={INPUT_BASE_CLASS}
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Nomor Telepon Kantor</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="021-5290xxxx"
                  className={INPUT_BASE_CLASS}
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Website Resmi</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.perusahaan.co.id"
                  className={INPUT_BASE_CLASS}
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Profil LinkedIn Perusahaan</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className={INPUT_BASE_CLASS}
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
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-150">
          {/* Tagline Slogan */}
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Tagline & Slogan Keberlanjutan
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pernyataan identitas singkat yang muncul tepat di bawah nama perusahaan.
              </p>
            </div>

            <div>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Contoh: Menghubungkan Energi, Memberdayakan Masyarakat dan Masa Depan"
                className={INPUT_BASE_CLASS}
              />
              <span className="text-[11px] text-[#64748B] mt-1.5 block">
                Disarankan maksimal 120 karakter agar ringkas dan mudah diingat.
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Logo Resmi Upload (Circular Avatar) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Logo Resmi Perusahaan
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Unggah gambar logo resmi untuk ditampilkan pada profil, proposal, dan sertifikat kemitraan.
              </p>
            </div>

            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoFileChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              {/* Logo Preview (Circular) */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden p-2 shadow-sm">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Perusahaan"
                      className="w-full h-full object-contain rounded-full"
                    />
                  ) : (
                    <div className="text-center text-slate-400 p-2">
                      <Building2 className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] font-semibold block">Belum ada logo</span>
                    </div>
                  )}
                </div>

                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center text-white backdrop-blur-2xs">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="text-[10px] mt-1 font-semibold">Mengunggah...</span>
                  </div>
                )}
              </div>

              {/* Upload Controls & Requirements */}
              <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
                <span className="font-bold text-[#181343] text-sm block">
                  Foto Logo Profil
                </span>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  Format yang didukung: PNG (latar transparan disarankan), JPG, atau WEBP. Ukuran maksimal 2MB. Resolusi proporsional 1:1 (minimal 400x400 piksel).
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                    className="font-semibold text-xs h-9 px-4 rounded-xl border-[#CBD5E1] hover:bg-slate-100 cursor-pointer"
                  >
                    {logoUrl ? "Ganti Logo" : "Unggah Logo"}
                  </Button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Logo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Cover Banner Upload */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Foto Sampul Profil (Cover Banner)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Banner visual di bagian atas halaman profil perusahaan yang merefleksikan kegiatan lapangan.
              </p>
            </div>

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
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-300">
                    Belum ada foto sampul profil yang diunggah
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Resolusi ideal: 1920 x 480 piksel
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

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-[#47464F] leading-relaxed">
              <strong>Saran Visual:</strong> Gunakan foto aktivitas nyata CSR di lapangan (kegiatan penanaman pohon, pelatihan UMKM warga, atau peresmian sarana) dengan pencahayaan baik dan rasio horizontal lebar.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KOMITMEN CSR */}
      {/* ========================================================================= */}
      {activeCategory === "csr" && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-150">
          {/* Visi ESG & Komitmen */}
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Visi Keberlanjutan & Komitmen ESG
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pernyataan arah kebijakan CSR dan kontribusi terhadap tujuan pembangunan berkelanjutan (SDGs).
              </p>
            </div>

            <div>
              <textarea
                rows={4}
                value={csrVision}
                onChange={(e) => setCsrVision(e.target.value)}
                placeholder="Contoh: Kami berkomitmen mengintegrasikan prinsip Environmental, Social, and Governance (ESG) dalam seluruh rantai nilai bisnis, berfokus pada kemandirian ekonomi masyarakat sekitar dan perlindungan ekosistem alami..."
                className="w-full p-3.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[#181343] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#181343] focus:ring-2 focus:ring-[#181343]/15 transition-all outline-none leading-relaxed"
              />
              <span className="text-[11px] text-[#64748B] mt-1.5 block">
                Visi ini akan ditampilkan secara menonjol pada tab profil publik perusahaan.
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Pilar Prioritas CSR */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Pilar Prioritas Program CSR Organisasi
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
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
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "border-[#181343] bg-[#F4F3FA]"
                        : "border-[#E5E7EB] bg-white hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected
                          ? "bg-[#181343] border-[#181343] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-[#181343]">
                        {pillar.label}
                      </h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Tim Pengelola & PIC CSR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#181343]">
                  Tim Pengelola & Penanggung Jawab (PIC) CSR
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Kontak person perwakilan perusahaan untuk koordinasi teknis dengan mitra pelaksana.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLeader}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="font-semibold text-xs rounded-xl border-[#CBD5E1] hover:bg-slate-50 cursor-pointer"
              >
                Tambah PIC
              </Button>
            </div>

            {csrLeaders.length === 0 ? (
              <div className="py-8 text-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
                <p className="text-xs text-[#64748B] font-medium">
                  Belum ada kontak PIC yang dicantumkan.
                </p>
                <button
                  type="button"
                  onClick={handleAddLeader}
                  className="text-xs font-semibold text-[#047857] hover:underline cursor-pointer"
                >
                  + Tambah Kontak PIC Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {csrLeaders.map((leader, idx) => (
                  <div
                    key={leader.id || idx}
                    className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#181343]">
                        Kontak PIC #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLeader(idx)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-[#181343] block mb-1">
                          Nama Lengkap & Gelar
                        </label>
                        <input
                          type="text"
                          value={leader.name}
                          onChange={(e) => handleUpdateLeader(idx, "name", e.target.value)}
                          placeholder="Nama PIC"
                          className={INPUT_BASE_CLASS}
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#181343] block mb-1">
                          Jabatan / Peran
                        </label>
                        <input
                          type="text"
                          value={leader.role}
                          onChange={(e) => handleUpdateLeader(idx, "role", e.target.value)}
                          placeholder="Head of CSR / Manager Keberlanjutan"
                          className={INPUT_BASE_CLASS}
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#181343] block mb-1">
                          Email Kerja
                        </label>
                        <input
                          type="email"
                          value={leader.email || ""}
                          onChange={(e) => handleUpdateLeader(idx, "email", e.target.value)}
                          placeholder="pic@perusahaan.co.id"
                          className={INPUT_BASE_CLASS}
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#181343] block mb-1">
                          Nomor Telepon / WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={leader.phone || ""}
                          onChange={(e) => handleUpdateLeader(idx, "phone", e.target.value)}
                          placeholder="0812xxxxxxxx"
                          className={INPUT_BASE_CLASS}
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
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-150">
          {/* Notice Box: Re-verification Warning */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Kepatuhan Verifikasi Administratif SIPENA</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800">
              Untuk menjaga integritas dan akuntabilitas platform, setiap perubahan nomor NIB, NPWP, atau dokumen laporan legalitas resmi akan secara otomatis mengubah status verifikasi administratif organisasi menjadi <strong>Menunggu Verifikasi Legalitas</strong>. Tim verifikator SIPENA akan meninjau ulang keabsahan berkas sebelum menerbitkan status <em>Terverifikasi Administratif</em>.
            </p>
          </div>

          {/* NIB & NPWP Card */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Nomor Legalitas & Wajib Pajak Badan Usaha
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Data legalitas badan usaha resmi Republik Indonesia yang terdaftar di OSS dan Ditjen Pajak.
              </p>
            </div>

            <div className="space-y-4 pt-1 text-xs sm:text-sm">
              {/* NIB */}
              <div>
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5 flex items-center justify-between">
                  <span>Nomor Induk Berusaha (NIB OSS)</span>
                  <span className="text-[11px] font-normal text-[#64748B]">13 digit nomor resmi</span>
                </label>
                <input
                  type="text"
                  value={nibNumber}
                  onChange={(e) => setNibNumber(e.target.value)}
                  placeholder="Contoh: 9120304859201"
                  className={INPUT_BASE_CLASS}
                />
              </div>

              {/* NPWP */}
              <div>
                <label className="text-[13px] font-semibold text-[#181343] block mb-1.5 flex items-center justify-between">
                  <span>NPWP Badan Usaha</span>
                  <span className="text-[11px] font-normal text-[#64748B]">Nomor Pokok Wajib Pajak</span>
                </label>
                <input
                  type="text"
                  value={npwpNumber}
                  onChange={(e) => setNpwpNumber(e.target.value)}
                  placeholder="Contoh: 01.234.567.8-012.000"
                  className={INPUT_BASE_CLASS}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Laporan Keberlanjutan PDF */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#181343]">
                Laporan Keberlanjutan Resmi (Sustainability Report PDF)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Laporan tahunan resmi yang memuat rekam jejak dampak sosial, tata kelola lingkungan, dan transparansi penyaluran dana CSR.
              </p>
            </div>

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
                    <span className="font-bold text-xs sm:text-sm text-[#181343] block truncate">
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
                    className="text-xs text-rose-600 hover:text-rose-800 p-1.5 cursor-pointer"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => reportInputRef.current?.click()}
                className="py-10 px-6 rounded-2xl border-2 border-dashed border-[#E2E8F0] hover:border-emerald-400 bg-[#F8FAFC] hover:bg-emerald-50/20 text-center space-y-2 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                  {isUploadingReport ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                  ) : (
                    <Upload className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#181343] block">
                    {isUploadingReport ? "Mengunggah Dokumen PDF..." : "Pilih atau Unggah Dokumen PDF Laporan"}
                  </span>
                  <span className="text-xs text-[#64748B] mt-0.5 block">
                    Format PDF resmi. Ukuran berkas maksimal 10MB.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STICKY BOTTOM ACTION BAR */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 sm:px-8 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Change status */}
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Ada perubahan yang belum disimpan</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
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
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[#181343] hover:bg-slate-50 transition-colors text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-[#181343] hover:bg-[#211B58] text-white transition-all text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
              <h3 className="text-lg font-bold text-[#181343]">
                Batalkan Perubahan Profil?
              </h3>
              <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
                Ada perubahan informasi yang belum Anda simpan. Jika Anda keluar sekarang, seluruh perubahan tersebut tidak akan tersimpan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDiscardModalOpen(false)}
                className="h-9 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[#47464F] hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Lanjutkan Mengedit
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDiscardModalOpen(false);
                  onBack();
                }}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors"
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
