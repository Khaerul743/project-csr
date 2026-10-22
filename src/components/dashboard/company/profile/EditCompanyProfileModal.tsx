"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Building2,
  FileText,
  ShieldCheck,
  Users,
  Sparkles,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  ExternalLink,
  Briefcase,
  Layers,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CsrLeaderItem, CompanyDetailedProfile } from "@/modules/companies/company.interface";

interface EditCompanyProfileModalProps {
  isOpen: boolean;
  company: CompanyDetailedProfile | any;
  onClose: () => void;
  onSuccess: (updated: CompanyDetailedProfile) => void;
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

export function EditCompanyProfileModal({
  isOpen,
  company,
  onClose,
  onSuccess,
}: EditCompanyProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"branding" | "identity" | "esg" | "legal" | "leaders">("branding");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [csrVision, setCsrVision] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [foundedYear, setFoundedYear] = useState<string | number>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [nibNumber, setNibNumber] = useState("");
  const [npwpNumber, setNpwpNumber] = useState("");
  const [sustainabilityReportUrl, setSustainabilityReportUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [csrLeaders, setCsrLeaders] = useState<CsrLeaderItem[]>([]);

  useEffect(() => {
    if (company && isOpen) {
      setName(company.name || "");
      setTagline(company.tagline || "");
      setDescription(company.description || "");
      setCsrVision(company.csrVision || "");
      setIndustry(company.industry || "");
      setCompanySize(company.companySize || "");
      setFoundedYear(company.foundedYear ? String(company.foundedYear) : "");
      setEmail(company.email || "");
      setPhone(company.phone || "");
      setAddress(company.address || "");
      setCity(company.city || "");
      setProvince(company.province || "");
      setWebsite(company.website || "");
      setLogoUrl(company.logoUrl || "");
      setCoverUrl(company.coverUrl || "");
      setNibNumber(company.nibNumber || "");
      setNpwpNumber(company.npwpNumber || "");
      setSustainabilityReportUrl(company.sustainabilityReportUrl || "");
      setInstagramUrl(company.instagramUrl || "");
      setLinkedinUrl(company.linkedinUrl || "");

      // Parse CSR leaders from JSON
      if (company.csrLeaders) {
        if (Array.isArray(company.csrLeaders)) {
          setCsrLeaders(company.csrLeaders);
        } else {
          try {
            setCsrLeaders(JSON.parse(company.csrLeaders));
          } catch {
            setCsrLeaders([]);
          }
        }
      } else {
        setCsrLeaders([]);
      }
    }
  }, [company, isOpen]);

  if (!isOpen) return null;

  // Handler for adding a new CSR Leader / PIC
  const handleAddLeader = () => {
    setCsrLeaders((prev) => [
      ...prev,
      {
        id: "pic-" + Date.now(),
        name: "",
        role: "",
        email: "",
        phone: "",
        photoUrl: "",
      },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name,
        tagline: tagline || null,
        description: description || null,
        csrVision: csrVision || null,
        industry: industry || null,
        companySize: companySize || null,
        foundedYear: foundedYear ? parseInt(String(foundedYear), 10) : null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        province: province || null,
        website: website || null,
        logoUrl: logoUrl || null,
        coverUrl: coverUrl || null,
        nibNumber: nibNumber || null,
        npwpNumber: npwpNumber || null,
        sustainabilityReportUrl: sustainabilityReportUrl || null,
        instagramUrl: instagramUrl || null,
        linkedinUrl: linkedinUrl || null,
        csrLeaders: csrLeaders.filter((l) => l.name.trim() !== ""),
      };

      const res = await fetch("/api/companies/current", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui profil perusahaan");
      }

      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Kelola Profil Perusahaan</h3>
              <p className="text-xs text-slate-400">
                Lengkapi identitas korporat, visi ESG, dan legalitas untuk membangun kepercayaan mitra CSR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-6 gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("branding")}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "branding"
                ? "border-emerald-600 text-emerald-700 bg-white/60"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Visual & Branding</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "identity"
                ? "border-emerald-600 text-emerald-700 bg-white/60"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Identitas & Industri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("esg")}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "esg"
                ? "border-emerald-600 text-emerald-700 bg-white/60"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Komitmen ESG & Visi CSR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("legal")}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "legal"
                ? "border-emerald-600 text-emerald-700 bg-white/60"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Legalitas & Berkas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leaders")}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "leaders"
                ? "border-emerald-600 text-emerald-700 bg-white/60"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tim & PIC CSR ({csrLeaders.length})</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: BRANDING & VISUAL */}
          {activeTab === "branding" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">Branding Visual Bergengsi</p>
                  <p className="text-emerald-700 mt-0.5">
                    Banner sampul dan logo resmi akan tampil menonjol pada profil perusahaan ala LinkedIn dan kartu sponsor inisiatif CSR Anda.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Nama Resmi Perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: PT Sumber Energi Lestari Tbk"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Slogan / Tagline Keberlanjutan (One-Liner)
                  </label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Contoh: Mengakselerasi Transisi Energi Bersih & Kemakmuran Masyarakat Pesisir"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ringkasan fokus dampak perusahaan yang muncul tepat di bawah nama perusahaan.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      URL Logo Perusahaan
                    </label>
                    <Input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://.../logo.png"
                    />
                    {logoUrl && (
                      <div className="mt-2 w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-white p-1">
                        <img src={logoUrl} alt="Preview Logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      URL Foto Sampul (Cover Banner)
                    </label>
                    <Input
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://.../cover.jpg"
                    />
                    {coverUrl && (
                      <div className="mt-2 h-16 w-full rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                        <img src={coverUrl} alt="Preview Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITAS & INDUSTRI */}
          {activeTab === "identity" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Sektor Industri Korporat
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="">-- Pilih Sektor Industri --</option>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Skala Perusahaan
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="">-- Pilih Skala Perusahaan --</option>
                    {COMPANY_SIZE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Tahun Berdiri
                  </label>
                  <Input
                    type="number"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    placeholder="Contoh: 2005"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Website Resmi
                  </label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://sumberenergi.co.id"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Email Resmi Perusahaan
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="csr@perusahaan.co.id"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Nomor Telepon Kantor
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 21 5551234"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Kota Domisili Kantor Pusat
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Jakarta Selatan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Provinsi
                  </label>
                  <Input
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="DKI Jakarta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Alamat Lengkap Kantor Pusat
                </label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Gedung Energy Tower Lantai 18, Jl. Jend. Sudirman Kav. 52-53"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Tautan LinkedIn Perusahaan
                  </label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/company/nama-perusahaan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Tautan Instagram Resmi
                  </label>
                  <Input
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/perusahaan_official"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KOMITMEN ESG & VISI CSR */}
          {activeTab === "esg" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Visi & Komitmen Keberlanjutan (ESG / CSR Vision)
                </label>
                <Textarea
                  value={csrVision}
                  onChange={(e) => setCsrVision(e.target.value)}
                  placeholder="Jelaskan apa yang menjadi arah komitmen keberlanjutan perusahaan, target Net Zero, pemberdayaan masyarakat adat, atau kontribusi terhadap Sustainable Development Goals (SDGs)..."
                  rows={4}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Bagian ini sangat diperhatikan oleh mitra/NGO untuk mencocokkan filosofi program mereka dengan tujuan korporat.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Tentang Perusahaan (Profil Umum & Rekam Jejak)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan sejarah singkat perusahaan, lini bisnis utama, dan dedikasi perusahaan dalam membangun Indonesia..."
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* TAB 4: LEGALITAS & BERKAS */}
          {activeTab === "legal" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Verifikasi Akuntabilitas Korporat</span>
                  <span className="text-amber-800 mt-0.5 block">
                    Menyediakan NIB, NPWP, dan Laporan Keberlanjutan resmi meningkatkan kepercayaan mitra hingga 95% untuk mengajukan proposal berkualitas tinggi.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Nomor Induk Berusaha (NIB OSS)
                  </label>
                  <Input
                    value={nibNumber}
                    onChange={(e) => setNibNumber(e.target.value)}
                    placeholder="Contoh: 9120001234567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Nomor Pokok Wajib Pajak (NPWP Perusahaan)
                  </label>
                  <Input
                    value={npwpNumber}
                    onChange={(e) => setNpwpNumber(e.target.value)}
                    placeholder="Contoh: 01.234.567.8-012.000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Tautan Unduh Laporan Keberlanjutan (PDF Sustainability Report / Annual Report)
                </label>
                <Input
                  value={sustainabilityReportUrl}
                  onChange={(e) => setSustainabilityReportUrl(e.target.value)}
                  placeholder="https://sumberenergi.co.id/reports/sustainability-report-2025.pdf"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tautan berkas PDF publik yang dapat diakses langsung oleh mitra pelaksana untuk membaca laporan dampak audit sebelumnya.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: TIM & PIC KEBERLANJUTAN */}
          {activeTab === "leaders" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Tim Keberlanjutan & Kontak PIC</h4>
                  <p className="text-xs text-slate-500">
                    Daftar penanggung jawab divisi CSR / Sustainability yang dapat dihubungi mitra.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddLeader}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  Tambah PIC
                </Button>
              </div>

              {csrLeaders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Belum ada tim / PIC yang didaftarkan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Klik tombol "Tambah PIC" untuk menampilkan kontak person resmi divisi CSR perusahaan Anda.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {csrLeaders.map((leader, idx) => (
                    <div
                      key={leader.id || idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          PIC #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLeader(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus PIC"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            value={leader.name}
                            onChange={(e) => handleUpdateLeader(idx, "name", e.target.value)}
                            placeholder="Contoh: Rian Anggoro, S.T., M.M."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Jabatan <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            value={leader.role}
                            onChange={(e) => handleUpdateLeader(idx, "role", e.target.value)}
                            placeholder="Contoh: Head of Corporate Sustainability"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Email PIC
                          </label>
                          <Input
                            type="email"
                            value={leader.email || ""}
                            onChange={(e) => handleUpdateLeader(idx, "email", e.target.value)}
                            placeholder="rian.anggoro@perusahaan.co.id"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            URL Foto Profil PIC
                          </label>
                          <Input
                            value={leader.photoUrl || ""}
                            onChange={(e) => handleUpdateLeader(idx, "photoUrl", e.target.value)}
                            placeholder="https://.../foto-rian.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
