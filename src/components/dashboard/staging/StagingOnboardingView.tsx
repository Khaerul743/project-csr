"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  HeartHandshake,
  ArrowRight,
  Compass,
  Users,
  BarChart3,
  Search,
  Send,
  ClipboardCheck,
  Mail,
  RefreshCw,
  Bell,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  FileText,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyRegisterModal } from "./CompanyRegisterModal";
import { PartnerRegisterModal } from "./PartnerRegisterModal";

interface StagingOnboardingViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onRoleUpdated: (updatedUser: any) => void;
}

export function StagingOnboardingView({
  user,
  onRoleUpdated,
}: StagingOnboardingViewProps) {
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isRoleGuideOpen, setIsRoleGuideOpen] = useState(false);

  // Undangan Tim Pending
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState<{
    type: "info" | "success" | "error";
    message: string;
  } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  const fetchPendingInvitations = async (manualCheck = false) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (manualCheck) {
      setIsLoadingInvitations(true);
      setCheckFeedback(null);
    }

    try {
      const res = await fetch("/api/invitations/my-pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data || [];
        setPendingInvitations(items);
        if (manualCheck) {
          if (items.length === 0) {
            setCheckFeedback({
              type: "info",
              message:
                "Belum ada undangan tim baru yang ditujukan ke alamat email " +
                user.email +
                ".",
            });
          } else {
            setCheckFeedback({
              type: "success",
              message: `Ditemukan ${items.length} undangan tim aktif untuk akun Anda.`,
            });
          }
        }
      } else {
        if (manualCheck) {
          setCheckFeedback({
            type: "error",
            message: "Gagal memeriksa daftar undangan dari server.",
          });
        }
      }
    } catch {
      if (manualCheck) {
        setCheckFeedback({
          type: "error",
          message: "Koneksi bermasalah saat memeriksa undangan. Silakan coba kembali.",
        });
      }
    } finally {
      if (manualCheck) {
        setIsLoadingInvitations(false);
      }
    }
  };

  useEffect(() => {
    fetchPendingInvitations(false);
  }, []);

  const handleAcceptInvitation = async (invitationId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setProcessingId(invitationId);
    setInvitationError(null);

    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invitationId }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menerima undangan tim");
      }

      if (json.data?.accessToken) {
        localStorage.setItem("accessToken", json.data.accessToken);
        document.cookie = `token=${json.data.accessToken}; path=/; max-age=86400`;
      }
      if (json.data?.user) {
        localStorage.setItem("user", JSON.stringify(json.data.user));
      }

      onRoleUpdated(json.data.user);
    } catch (err: any) {
      setInvitationError(err.message || "Terjadi kendala saat menerima undangan.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setProcessingId(invitationId);
    setInvitationError(null);

    try {
      const res = await fetch("/api/invitations/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invitationId }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menolak undangan tim");
      }

      await fetchPendingInvitations(false);
    } catch (err: any) {
      setInvitationError(err.message || "Terjadi kendala saat menolak undangan.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/60 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ======================================================================= */}
        {/* 1. ONBOARDING ORIENTATION & HEADER                                      */}
        {/* ======================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Langkah Awal: Pemilihan Peran Akun</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tentukan Peran Organisasi Anda di SIPENA
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Selamat datang, <strong className="text-slate-800">{user.name}</strong>. Pilih
            jalur organisasi yang ingin Anda kelola untuk mengaktifkan fitur dan ruang
            kerja kolaborasi yang sesuai dengan kebutuhan operasional Anda.
          </p>
        </div>

        {/* ======================================================================= */}
        {/* 2. BANNER UNDANGAN TIM PENDING (JIKA TERSEDIA)                          */}
        {/* ======================================================================= */}
        {pendingInvitations.length > 0 && (
          <div className="space-y-3">
            {invitationError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{invitationError}</span>
              </div>
            )}

            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-600" />
                      Undangan Bergabung
                    </span>
                    <Badge variant="navy" size="sm">
                      Peran: {inv.role}
                    </Badge>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Bergabung dengan {inv.companyName || "Organisasi Terdaftar"}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {inv.invitedByName ? `${inv.invitedByName} dari ` : ""}
                    <strong className="text-slate-800">
                      {inv.companyName || "Perusahaan"}
                    </strong>{" "}
                    mengundang Anda untuk bergabung ke dalam tim sebagai{" "}
                    <strong className="text-slate-800">{inv.role}</strong>. Dengan
                    menerima undangan ini, akun Anda otomatis terhubung ke organisasi
                    tersebut.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingId === inv.id}
                    onClick={() => handleRejectInvitation(inv.id)}
                    className="text-xs text-slate-700 hover:text-rose-700 hover:bg-rose-50 border-slate-200 cursor-pointer min-h-[40px]"
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Tolak
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={processingId === inv.id}
                    onClick={() => handleAcceptInvitation(inv.id)}
                    className="text-xs font-bold px-4 cursor-pointer min-h-[40px]"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Terima &amp; Masuk Workspace
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================================= */}
        {/* 3. DUA JALUR UTAMA (PERUSAHAAN SPONSOR VS MITRA PELAKSANA)              */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* ------------------------------------------------------------------- */}
          {/* CARD 1: PERUSAHAAN SPONSOR                                          */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between h-full">
            <div className="space-y-6">
              {/* Header Card */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                    Jalur Korporat
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Akses: MANAGEMENT
                  </span>
                </div>
              </div>

              {/* Title & Deskripsi */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Perusahaan Sponsor CSR
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Dirancang untuk korporasi, BUMN, atau perusahaan swasta yang
                  mengalokasikan anggaran sosial, mempublikasikan inisiatif, dan
                  memantau kepatuhan indikator keberlanjutan (ESG).
                </p>
              </div>

              {/* Fitur Utama */}
              <div className="pt-4 border-t border-slate-100 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Publikasi Peluang Inisiatif
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Buka program pendanaan dengan pagu anggaran dan kriteria sasaran.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Seleksi &amp; Skrining Proposal
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tinjau proposal mitra, audit kewajaran RAB, dan tetapkan keputusan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Kontrak MoU &amp; Kesepakatan
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Finalisasi jadwal tahapan kegiatan dan pengesahan berkas resmi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Monitoring &amp; Pelaporan ESG
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Pantau serapan dana riil dan hasilkan laporan akuntabilitas serta dampak ESG.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCompanyModalOpen(true)}
                className="w-full text-xs sm:text-sm font-bold min-h-[44px] rounded-xl cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Daftarkan Profil Perusahaan
              </Button>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* CARD 2: MITRA PELAKSANA / NGO                                       */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#181343]/50 transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between h-full">
            <div className="space-y-6">
              {/* Header Card */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#181343] shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                    Jalur Lembaga Mitra
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Akses: PARTNER_ADMIN
                  </span>
                </div>
              </div>

              {/* Title & Deskripsi */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Lembaga Mitra Pelaksana
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Dirancang untuk yayasan, Lembaga Swadaya Masyarakat (LSM/NGO), atau
                  organisasi kemasyarakatan yang memiliki keahlian eksekusi kegiatan di
                  lapangan.
                </p>
              </div>

              {/* Fitur Utama */}
              <div className="pt-4 border-t border-slate-100 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#181343] flex items-center justify-center shrink-0 mt-0.5">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Eksplorasi Inisiatif Terbuka
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Cari peluang pendanaan CSR yang relevan dengan fokus keahlian Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#181343] flex items-center justify-center shrink-0 mt-0.5">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Pengajuan Proposal &amp; RAB
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Kembangkan usulan program digital lengkap dengan rencana anggaran.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#181343] flex items-center justify-center shrink-0 mt-0.5">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Laporan Kemajuan Lapangan
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Dokumentasikan aktivitas fisik, bukti foto kegiatan, dan kwitansi dana.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#181343] flex items-center justify-center shrink-0 mt-0.5">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Survei Penerima Manfaat
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Kumpulkan ulasan langsung dari masyarakat lapangan melalui kode QR.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsPartnerModalOpen(true)}
                className="w-full text-xs sm:text-sm font-bold min-h-[44px] rounded-xl cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Daftarkan Lembaga Mitra
              </Button>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. PANDUAN PERBANDINGAN PERAN (ACCORDION / HELPER)                       */}
        {/* ======================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsRoleGuideOpen(!isRoleGuideOpen)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Panduan Perbandingan Peran Organisasi
                </h3>
                <p className="text-xs text-slate-500">
                  Klik untuk melihat ringkasan perbedaan wewenang dan hak akses masing-masing jalur.
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isRoleGuideOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isRoleGuideOpen && (
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/40 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 space-y-2.5 h-full">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Perusahaan Sponsor</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc pl-4 leading-relaxed">
                    <li>Sebagai pihak pendana dan inisiator program sosial CSR.</li>
                    <li>Menyetujui atau menolak proposal kegiatan dari mitra.</li>
                    <li>Memvalidasi bukti transfer dan termin penyaluran dana.</li>
                    <li>Menerima ringkasan laporan dampak ESG untuk stakeholder.</li>
                  </ul>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 space-y-2.5 h-full">
                  <div className="flex items-center gap-2 text-[#181343] font-bold">
                    <HeartHandshake className="w-4 h-4 text-[#181343] shrink-0" />
                    <span>Lembaga Mitra Pelaksana</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc pl-4 leading-relaxed">
                    <li>Sebagai pelaksana teknis kegiatan langsung di lapangan.</li>
                    <li>Menyusun jadwal kerja, target penerima, dan rincian RAB.</li>
                    <li>Mengunggah bukti kuitansi belanja riil dan dokumen BAST.</li>
                    <li>Mengelola survei kepuasan warga penerima manfaat program.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* 5. PEMERIKSAAN UNDANGAN TIM REKAN KERJA                                  */}
        {/* ======================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Sudah Memiliki Undangan dari Rekan Kerja?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Jika rekan kerja telah mendaftarkan profil organisasi Anda, mintalah
                administrator untuk mengirimkan undangan tim ke alamat email:{" "}
                <span className="font-semibold text-slate-800">{user.email}</span>.
              </p>
              {checkFeedback && (
                <div
                  className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    checkFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : checkFeedback.type === "error"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {checkFeedback.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : checkFeedback.type === "error" ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span>{checkFeedback.message}</span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              isLoading={isLoadingInvitations}
              onClick={() => fetchPendingInvitations(true)}
              leftIcon={
                <RefreshCw
                  className={`w-3.5 h-3.5 text-slate-600 ${
                    isLoadingInvitations ? "animate-spin" : ""
                  }`}
                />
              }
              className="text-xs font-semibold text-slate-800 border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer min-h-[40px] px-4"
            >
              Periksa Undangan Masuk
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL PENDAFTARAN PROFIL ORGANISASI                                   */}
      {/* ========================================================================= */}
      <CompanyRegisterModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={onRoleUpdated}
      />

      <PartnerRegisterModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSuccess={onRoleUpdated}
      />
    </div>
  );
}
