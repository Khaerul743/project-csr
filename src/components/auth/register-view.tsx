"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
  BarChart3,
  Loader2,
} from "lucide-react";

export function RegisterView() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Silakan lengkapi seluruh kolom formulir pendaftaran.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.details && Array.isArray(result.details)) {
          const detailMessages = result.details
            .map((d: { message: string }) => d.message)
            .join(", ");
          setErrorMessage(detailMessages || result.message);
        } else {
          setErrorMessage(
            result.message || "Gagal mendaftarkan akun. Silakan coba lagi."
          );
        }
        return;
      }

      // Simpan token ke localStorage & cookie browser
      if (result.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        document.cookie = `token=${result.data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }

      // Navigasi ke halaman dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan atau server tidak merespon.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F1F3F7] flex flex-col items-center justify-center p-3 sm:p-5 lg:p-7 relative overflow-hidden select-none font-sans">
      {/* ========================================================================= */}
      {/* DEKORASI CANVAS LUAR: ABSTRACT FLOWING WAVE LINES (SAMA SEPERTI LOGIN)     */}
      {/* ========================================================================= */}
      {/* 1. Pojok Kiri Bawah: Garis Meliuk-Liuk Mengalir (Soft Emerald & Slate) */}
      <div className="absolute -bottom-20 -left-20 sm:-bottom-28 sm:-left-28 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] pointer-events-none select-none z-0">
        <div className="absolute bottom-16 left-16 w-80 h-80 rounded-full bg-emerald-400/[0.06] blur-[90px]" />
        <div className="absolute bottom-24 left-24 w-72 h-72 rounded-full bg-[#181343]/[0.04] blur-[100px]" />

        <svg
          viewBox="0 0 640 640"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <filter id="wave-soft-glow-left-reg" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="wave-emerald-grad-left-reg" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#34D399" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="wave-slate-grad-left-reg" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.30" />
              <stop offset="65%" stopColor="#60A5FA" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="wave-teal-grad-left-reg" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#14B8A6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          <path
            d="M -40,510 C 140,530 190,360 330,320 C 450,280 520,350 630,290"
            stroke="url(#wave-emerald-grad-left-reg)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-left-reg)"
          />
          <path
            d="M -50,450 C 120,470 170,300 300,260 C 420,220 500,290 610,230"
            stroke="url(#wave-slate-grad-left-reg)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-left-reg)"
          />
          <path
            d="M -30,570 C 160,590 220,420 360,370 C 470,330 550,400 650,340"
            stroke="url(#wave-teal-grad-left-reg)"
            strokeWidth="1.75"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-left-reg)"
          />
        </svg>
      </div>

      {/* 2. Pojok Kanan Atas: Garis Meliuk-Liuk Mengalir (Soft Mint & Emerald) */}
      <div className="absolute -top-20 -right-20 sm:-top-28 sm:-right-28 w-[460px] h-[460px] sm:w-[560px] sm:h-[560px] pointer-events-none select-none z-0">
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full bg-[#10B981]/[0.05] blur-[80px]" />
        <div className="absolute top-24 right-24 w-64 h-64 rounded-full bg-[#38BDF8]/[0.03] blur-[90px]" />

        <svg
          viewBox="0 0 580 580"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <filter id="wave-soft-glow-right-reg" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="wave-emerald-grad-right-reg" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#34D399" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="wave-slate-grad-right-reg" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.25" />
              <stop offset="65%" stopColor="#60A5FA" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="wave-mint-grad-right-reg" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.26" />
              <stop offset="65%" stopColor="#059669" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          <path
            d="M 620,80 C 460,50 390,210 260,180 C 140,150 80,70 -30,120"
            stroke="url(#wave-emerald-grad-right-reg)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-right-reg)"
          />
          <path
            d="M 630,140 C 470,110 410,260 280,230 C 170,200 100,120 -20,170"
            stroke="url(#wave-slate-grad-right-reg)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-right-reg)"
          />
          <path
            d="M 610,20 C 440,0 370,150 230,130 C 120,110 60,30 -40,80"
            stroke="url(#wave-mint-grad-right-reg)"
            strokeWidth="1.75"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-right-reg)"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: COMPACT HORIZONTAL SPLIT CARD (960-980px, TINGGI SEIMBANG) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[980px] bg-white rounded-[20px] overflow-hidden shadow-[0_24px_50px_-12px_rgba(15,23,42,0.16),0_10px_24px_-6px_rgba(15,23,42,0.08)] border border-slate-200/90 flex flex-col lg:flex-row my-auto">
        {/* ======================================================================= */}
        {/* PANEL KIRI: BRANDING & VALUE PROPOSITION (45% DESKTOP)                  */}
        {/* Deep Navy #181343 -> Navy-Blue #1B2956 -> Blue #213A62 (Identik Login)             */}
        {/* ======================================================================= */}
        <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#181343] via-[#1B2956] to-[#213A62] text-white p-6 sm:p-8 lg:p-9 xl:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Dot Grid Accent in Top-Right Corner */}
          <div className="absolute top-5 right-5 pointer-events-none opacity-20 z-0">
            <svg width="84" height="68" viewBox="0 0 84 68" fill="none">
              {[0, 1, 2, 3].map((row) =>
                [0, 1, 2, 3, 4].map((col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={8 + col * 17}
                    cy={8 + row * 17}
                    r="1.6"
                    fill="#FFFFFF"
                  />
                ))
              )}
            </svg>
          </div>

          {/* Soft Abstract Wave Dekoratif di Bawah Panel Kiri (Subtle CSS/SVG Murni) */}
          <div className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none overflow-hidden z-0 opacity-20">
            <svg
              viewBox="0 0 500 160"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <defs>
                <linearGradient id="panel-wave-refined-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.06" />
                </linearGradient>
                <linearGradient id="panel-wave-refined-2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#1E293B" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <path
                d="M 0,80 C 130,130 260,30 500,75 L 500,160 L 0,160 Z"
                fill="url(#panel-wave-refined-1)"
              />
              <path
                d="M 0,105 C 160,55 310,125 500,95 L 500,160 L 0,160 Z"
                fill="url(#panel-wave-refined-2)"
              />
            </svg>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* KONTEN KIRI: BRANDING + HEADLINE + 3 KEUNGGULAN (PROPORSI BESAR)    */}
          {/* ------------------------------------------------------------------- */}
          <div className="relative z-10 flex flex-col justify-between">
            {/* 1. Kembali ke Beranda & Logo SIPENA */}
            <div className="space-y-4">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300/90 hover:text-white transition-colors duration-150 group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-1 text-emerald-400" />
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>

              {/* Logo SIPENA & Wordmark & Tagline Resmi Baru */}
              <div className="flex items-center gap-3.5 pt-0.5">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 drop-shadow-sm">
                  <Image
                    src="/LOGO SIPENA.png"
                    alt="Logo SIPENA"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div className="leading-tight">
                  <span
                    className="text-2xl sm:text-[25px] font-black tracking-tight text-white block"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    SIPENA
                  </span>
                  <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-300/90 tracking-widest block uppercase mt-0.5">
                    PETAKAN KEBUTUHAN, PANTAU PERUBAHAN
                  </span>
                </div>
              </div>
            </div>

            {/* Headline Utama & Deskripsi: Diperbesar & Proporsional */}
            <div className="mt-5 sm:mt-6">
              <h1
                className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[36px] font-extrabold text-white tracking-tight leading-[1.18]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Mulai Kolaborasi CSR
                <br />
                Lebih Terarah
                <br />
                <span className="text-[#10B981]">Bersama SIPENA</span>
              </h1>
              <p className="text-[13.5px] sm:text-[14px] text-slate-200/90 leading-relaxed font-normal mt-3.5 sm:mt-4 max-w-sm">
                Hubungkan perusahaan, mitra pelaksana, dan masyarakat untuk menciptakan dampak sosial yang transparan, terukur, dan berkelanjutan.
              </p>
            </div>

            {/* Tiga Keunggulan SIPENA: Wrapper Rounded Square 44x44px, Ikon 20-22px */}
            <div className="mt-7 sm:mt-8 space-y-5 sm:space-y-6">
              {/* 1. Kolaborasi Lebih Luas */}
              <div className="flex items-start gap-3.5">
                <div className="w-[44px] h-[44px] rounded-[12px] bg-white/[0.08] border border-white/15 text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[14px] sm:text-[15px] font-semibold text-white leading-tight">
                    Kolaborasi Lebih Luas
                  </h4>
                  <p className="text-[12.5px] sm:text-[13px] text-slate-300/85 leading-relaxed font-normal">
                    Terhubung dengan berbagai pemangku kepentingan CSR di seluruh Indonesia.
                  </p>
                </div>
              </div>

              {/* 2. Dampak yang Terukur */}
              <div className="flex items-start gap-3.5">
                <div className="w-[44px] h-[44px] rounded-[12px] bg-white/[0.08] border border-white/15 text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <BarChart3 className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[14px] sm:text-[15px] font-semibold text-white leading-tight">
                    Dampak yang Terukur
                  </h4>
                  <p className="text-[12.5px] sm:text-[13px] text-slate-300/85 leading-relaxed font-normal">
                    Kelola program dan pantau dampaknya secara transparan dan real-time.
                  </p>
                </div>
              </div>

              {/* 3. Aman & Terpercaya */}
              <div className="flex items-start gap-3.5">
                <div className="w-[44px] h-[44px] rounded-[12px] bg-white/[0.08] border border-white/15 text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[14px] sm:text-[15px] font-semibold text-white leading-tight">
                    Aman &amp; Terpercaya
                  </h4>
                  <p className="text-[12.5px] sm:text-[13px] text-slate-300/85 leading-relaxed font-normal">
                    Data terlindungi dengan standar keamanan enterprise dan protokol enkripsi terkini.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Panel Kiri (Kompak & Rapi di Bawah) */}
          <div className="relative z-10 pt-4 mt-6 sm:mt-8 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300/70">
            <span>Sistem Kolaborasi CSR Indonesia</span>
            <span>&copy; 2026 SIPENA</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* PANEL KANAN: FORM REGISTRASI BERSIH, MODERN, & PROPORSIONAL (55%)       */}
        {/* ======================================================================= */}
        <div className="w-full lg:w-[55%] bg-white p-6 sm:p-7 lg:p-8 flex flex-col justify-between">
          <div>
            {/* 1. Badge Pendaftaran Akun Organisasi */}
            <div className="mb-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F8F2] border border-[#BDEBD7] text-[#0A6E51] text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A6E51]" />
                <span>Pendaftaran Akun Organisasi</span>
              </div>
            </div>

            {/* 2. Judul Utama Baru: Daftarkan Organisasi Anda */}
            <div className="space-y-0.5 mb-2.5">
              <h2
                className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-snug"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Daftarkan Organisasi Anda
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Buat akun institusi Anda untuk mulai mengelola, berkolaborasi, dan mengukur program CSR secara terintegrasi.
              </p>
            </div>

            {/* 3. Information Banner Sesuai Referensi (Ringkas & Bersih) */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#ECFDF5] border border-emerald-200/80 flex items-start gap-2 mb-3.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-[#065F46] leading-relaxed font-normal">
                Setelah mendaftar, Anda dapat melengkapi profil organisasi untuk mengajukan verifikasi administratif.
              </p>
            </div>

            {/* 4. Formulir Registrasi (Jarak Antar-Field Padat & Proporsional) */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Alert Error */}
              {errorMessage && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Field 1: Nama Pengguna */}
              <div className="space-y-1">
                <label
                  htmlFor="register-username"
                  className="block text-[11.5px] font-medium text-slate-700"
                >
                  Nama Pengguna <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="register-username"
                    type="text"
                    required
                    placeholder="Masukkan nama pengguna"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full h-10 pl-9.5 pr-3.5 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 bg-[#EEF2F6] border border-slate-200/90 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-[#0A6E51] focus:ring-2 focus:ring-[#0A6E51]/15 font-normal"
                  />
                </div>
              </div>

              {/* Field 2: Email Resmi Institusi */}
              <div className="space-y-1">
                <label
                  htmlFor="register-email"
                  className="block text-[11.5px] font-medium text-slate-700"
                >
                  Email Resmi Institusi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    required
                    placeholder="csr@perusahaan.co.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full h-10 pl-9.5 pr-3.5 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 bg-[#EEF2F6] border border-slate-200/90 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-[#0A6E51] focus:ring-2 focus:ring-[#0A6E51]/15 font-normal"
                  />
                </div>
              </div>

              {/* Field 3: Kata Sandi */}
              <div className="space-y-1">
                <label
                  htmlFor="register-password"
                  className="block text-[11.5px] font-medium text-slate-700"
                >
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full h-10 pl-9.5 pr-9 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 bg-[#EEF2F6] border border-slate-200/90 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-[#0A6E51] focus:ring-2 focus:ring-[#0A6E51]/15 font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-400 pt-0.5 font-normal">
                  Minimal 8 karakter, dengan kombinasi huruf, angka, dan simbol.
                </p>
              </div>

              {/* Field 4: Konfirmasi Kata Sandi */}
              <div className="space-y-1">
                <label
                  htmlFor="register-confirm-password"
                  className="block text-[11.5px] font-medium text-slate-700"
                >
                  Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Ulangi kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full h-10 pl-9.5 pr-9 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 bg-[#EEF2F6] border border-slate-200/90 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-[#0A6E51] focus:ring-2 focus:ring-[#0A6E51]/15 font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Tombol CTA Utama: Daftar Akun -> (Solid Emerald Green SIPENA) */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10.5 sm:h-11 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-white bg-[#0A6E51] hover:bg-[#085C43] active:bg-[#064B37] rounded-xl transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider Horizontal "atau" */}
              <div className="relative my-2.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2.5 text-slate-400 font-medium text-[11px]">atau</span>
                </div>
              </div>

              {/* Tombol Alternatif Outline: Daftar dengan Google */}
              <button
                type="button"
                onClick={() => alert("Fitur pendaftaran melalui Google SSO akan segera tersedia.")}
                className="w-full h-10 inline-flex items-center justify-center gap-2.5 text-xs sm:text-[13px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:border-slate-300 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Daftar dengan Google</span>
              </button>

              {/* Link Masuk ke Akun */}
              <div className="pt-1.5 text-center">
                <p className="text-xs text-slate-500 font-normal">
                  Sudah memiliki akun?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors hover:underline cursor-pointer"
                  >
                    Masuk ke Akun
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Card: Security Note */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10.5px] text-slate-500 text-center font-normal">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Pendaftaran Anda aman dan terlindungi dengan enkripsi dan protokol keamanan terkini.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
