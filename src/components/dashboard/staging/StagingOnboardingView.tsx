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

  // Undangan Pending
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);
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
            setCheckFeedback("Tidak ada undangan pending baru untuk akun Anda saat ini.");
          } else {
            setCheckFeedback(`Ditemukan ${items.length} undangan tim untuk Anda.`);
          }
        }
      }
    } catch {
      if (manualCheck) {
        setCheckFeedback("Gagal memeriksa undangan. Silakan coba beberapa saat lagi.");
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
        throw new Error(json.message || "Gagal menerima undangan");
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
      setInvitationError(err.message || "Terjadi kesalahan saat menerima undangan");
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
        throw new Error(json.message || "Gagal menolak undangan");
      }

      await fetchPendingInvitations(false);
    } catch (err: any) {
      setInvitationError(err.message || "Terjadi kesalahan saat menolak undangan");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-full bg-[#F8F9FC] relative overflow-hidden select-none py-8 sm:py-12 px-4 sm:px-6">
      {/* ========================================================================= */}
      {/* DEKORASI CANVAS LUAR: ABSTRACT FLOWING WAVE LINES & AMBIENT GLOW           */}
      {/* ========================================================================= */}
      <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] pointer-events-none select-none z-0">
        <div className="absolute bottom-12 left-12 w-64 h-64 rounded-full bg-emerald-400/[0.04] blur-[80px]" />
        <div className="absolute bottom-20 left-20 w-60 h-60 rounded-full bg-[#181343]/[0.03] blur-[90px]" />
        <svg viewBox="0 0 500 500" fill="none" className="w-full h-full opacity-40">
          <path
            d="M -30,420 C 110,440 150,290 270,260 C 370,230 430,290 520,240"
            stroke="#10B981"
            strokeWidth="1.75"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />
          <path
            d="M -40,370 C 90,390 130,240 240,210 C 340,180 410,240 500,190"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeOpacity="0.20"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute -top-16 -right-16 w-[420px] h-[420px] pointer-events-none select-none z-0">
        <div className="absolute top-12 right-12 w-60 h-60 rounded-full bg-[#10B981]/[0.03] blur-[70px]" />
        <div className="absolute top-20 right-20 w-52 h-52 rounded-full bg-[#38BDF8]/[0.02] blur-[80px]" />
        <svg viewBox="0 0 500 500" fill="none" className="w-full h-full opacity-35">
          <path
            d="M 520,70 C 390,40 330,170 220,150 C 120,120 70,60 -20,100"
            stroke="#10B981"
            strokeWidth="1.75"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* CONTAINER UTAMA ONBOARDING (MAX WIDTH 1020px)                              */}
      {/* ========================================================================= */}
      <div className="max-w-[1020px] mx-auto space-y-7 sm:space-y-8 relative z-10">
        {/* ======================================================================= */}
        {/* 1. WELCOME SECTION (CENTERED & COMPACT)                                  */}
        {/* ======================================================================= */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold tracking-wider uppercase">
            <span>PENGATURAN AWAL AKUN</span>
          </div>

          <h1
            className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pilih Jenis Organisasi Anda
          </h1>

          <p className="text-xs sm:text-[14px] text-slate-500 leading-relaxed font-normal max-w-xl mx-auto">
            Pilih jenis organisasi yang akan Anda kelola untuk melanjutkan pengaturan profil dan mulai menggunakan SIPENA.
          </p>
        </div>

        {/* ======================================================================= */}
        {/* 2. BANNER UNDANGAN TIM AKTIF (JIKA TERSEDIA)                            */}
        {/* ======================================================================= */}
        {pendingInvitations.length > 0 && (
          <div className="space-y-3">
            {invitationError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{invitationError}</span>
              </div>
            )}

            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#CBC8DB] shadow-[0_8px_24px_-4px_rgba(24,19,67,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1.5">
                      <Bell className="w-3 h-3 text-emerald-600" />
                      Undangan Tim
                    </span>
                    <Badge variant="blue" size="sm">
                      Peran: {inv.role}
                    </Badge>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#181343] tracking-tight">
                    Bergabung dengan {inv.companyName || "Perusahaan Mitra"}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {inv.invitedByName ? `${inv.invitedByName} dari ` : ""}
                    <strong>{inv.companyName || "Perusahaan"}</strong> mengundang Anda untuk bergabung ke dalam tim CSR sebagai <strong>{inv.role}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingId === inv.id}
                    onClick={() => handleRejectInvitation(inv.id)}
                    className="text-xs text-slate-700 hover:text-rose-600 hover:bg-rose-50 border-slate-200"
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Tolak
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={processingId === inv.id}
                    onClick={() => handleAcceptInvitation(inv.id)}
                    className="text-xs font-semibold px-4"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Terima Undangan &amp; Masuk
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================================= */}
        {/* 3. DUA CARD PILIHAN UTAMA (PERUSAHAAN & MITRA/NGO) — SEJAJAR & SETARA     */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-stretch">
          {/* ------------------------------------------------------------------- */}
          {/* CARD 1 — PERUSAHAAN                                                 */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_12px_28px_-6px_rgba(24,19,67,0.08),0_6px_12px_-4px_rgba(24,19,67,0.04)] hover:shadow-[0_20px_38px_-8px_rgba(24,19,67,0.12),0_10px_16px_-6px_rgba(24,19,67,0.06)] hover:border-[#181343]/30 hover:-translate-y-0.5 transition-all duration-200 p-7 sm:p-8 flex flex-col justify-between h-full group">
            <div className="space-y-5">
              {/* Top Row: Ikon Gedung dalam Rounded Square + Badge Kecil */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10.5px] font-semibold tracking-wider uppercase">
                  PERUSAHAAN
                </span>
              </div>

              {/* Heading & Deskripsi */}
              <div>
                <h2
                  className="text-xl font-bold text-slate-900 tracking-tight leading-snug group-hover:text-[#181343] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Kelola CSR Perusahaan
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 leading-relaxed font-normal">
                  Untuk perusahaan yang ingin merencanakan program CSR, berkolaborasi dengan mitra, dan mengevaluasi dampak kegiatan.
                </p>
              </div>

              {/* Tiga Keunggulan Perusahaan */}
              <div className="pt-4 border-t border-slate-100 space-y-3.5">
                {/* 1. Kelola Peluang CSR */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-tight">
                      Kelola Peluang CSR
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
                      Rencanakan dan publikasikan peluang kolaborasi.
                    </p>
                  </div>
                </div>

                {/* 2. Bangun Kemitraan */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-tight">
                      Bangun Kemitraan
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
                      Tinjau proposal dan kelola kerja sama dengan NGO.
                    </p>
                  </div>
                </div>

                {/* 3. Pantau & Evaluasi Dampak */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-tight">
                      Pantau &amp; Evaluasi Dampak
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
                      Monitor pelaksanaan program serta kontribusi SDGs dan ESG.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Aksi Bawah: Lanjutkan sebagai Perusahaan (Solid Navy) */}
            <div className="pt-6">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCompanyModalOpen(true)}
                className="w-full h-11 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Lanjutkan sebagai Perusahaan
              </Button>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* CARD 2 — MITRA / NGO                                                */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_12px_28px_-6px_rgba(24,19,67,0.08),0_6px_12px_-4px_rgba(24,19,67,0.04)] hover:shadow-[0_20px_38px_-8px_rgba(24,19,67,0.12),0_10px_16px_-6px_rgba(24,19,67,0.06)] hover:border-[#181343]/30 hover:-translate-y-0.5 transition-all duration-200 p-7 sm:p-8 flex flex-col justify-between h-full group">
            <div className="space-y-5">
              {/* Top Row: Ikon Handshake dalam Rounded Square + Badge Kecil */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60 text-[10.5px] font-semibold tracking-wider uppercase">
                  MITRA PELAKSANA
                </span>
              </div>

              {/* Heading & Deskripsi */}
              <div>
                <h2
                  className="text-xl font-bold text-slate-900 tracking-tight leading-snug group-hover:text-[#181343] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Kelola Aktivitas Lembaga
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 leading-relaxed font-normal">
                  Untuk yayasan, NGO, atau komunitas pelaksana yang ingin menemukan peluang CSR dan membangun kemitraan bersama perusahaan.
                </p>
              </div>

              {/* Tiga Keunggulan Mitra / NGO */}
              <div className="pt-4 border-t border-slate-100 space-y-3.5">
                {/* 1. Temukan Peluang CSR */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-tight">
                      Temukan Peluang CSR
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
                      Jelajahi inisiatif perusahaan yang menerima proposal.
                    </p>
                  </div>
                </div>

                {/* 2. Ajukan Proposal */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-tight">
                      Ajukan Proposal
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
                      Kembangkan usulan program dan kelola pengajuan.
                    </p>
                  </div>
                </div>

                {/* 3. Laporkan Pelaksanaan */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-tight">
                      Laporkan Pelaksanaan
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
                      Dokumentasikan kegiatan, progres, dan capaian program.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Aksi Bawah: Lanjutkan sebagai Mitra (Solid Navy Identik) */}
            <div className="pt-6">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsPartnerModalOpen(true)}
                className="w-full h-11 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Lanjutkan sebagai Mitra
              </Button>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. SECTION UNDANGAN TIM (COMPACT HORIZONTAL INFO CARD)                  */}
        {/* ======================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_8px_22px_-4px_rgba(24,19,67,0.06),0_4px_10px_-2px_rgba(24,19,67,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#181343] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Mail className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                Sudah Mendapat Undangan Organisasi?
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed font-normal max-w-2xl">
                Jika Anda diundang untuk bergabung dengan tim perusahaan atau lembaga yang sudah terdaftar, Anda tidak perlu membuat organisasi baru.
              </p>
              {checkFeedback && (
                <p className="text-[11px] font-medium text-emerald-700 mt-1 animate-in fade-in">
                  {checkFeedback}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              isLoading={isLoadingInvitations}
              onClick={() => fetchPendingInvitations(true)}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoadingInvitations ? "animate-spin" : ""}`} />}
              className="text-xs font-semibold text-[#181343] border-slate-200 hover:bg-slate-50 rounded-xl whitespace-nowrap cursor-pointer h-9 px-3.5"
            >
              Periksa Undangan
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL FORMULIR PENDAFTARAN DETAIL PERUSAHAAN / MITRA                   */}
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
