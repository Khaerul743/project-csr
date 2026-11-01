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
    <div className="min-h-screen w-full bg-[#F1F3F7] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* DEKORASI CANVAS LUAR: ABSTRACT FLOWING WAVE LINES (MINIMAL & ELEGAN)      */}
      {/* ========================================================================= */}
      {/* 1. Pojok Kiri Bawah: Garis Meliuk-Liuk Mengalir (Soft Emerald & Slate) */}
      <div className="absolute -bottom-20 -left-20 sm:-bottom-28 sm:-left-28 w-[520px] h-[520px] sm:w-[640px] sm:h-[640px] pointer-events-none select-none z-0">
        <div className="absolute bottom-16 left-16 w-80 h-80 rounded-full bg-emerald-400/[0.05] blur-[90px]" />
        <div className="absolute bottom-24 left-24 w-72 h-72 rounded-full bg-[#181343]/[0.03] blur-[100px]" />

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
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#34D399" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="wave-slate-grad-left-reg" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.26" />
              <stop offset="65%" stopColor="#60A5FA" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="wave-teal-grad-left-reg" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.26" />
              <stop offset="70%" stopColor="#14B8A6" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Flowing Line 1: Soft Emerald Wave Ribbon */}
          <path
            d="M -40,510 C 140,530 190,360 330,320 C 450,280 520,350 630,290"
            stroke="url(#wave-emerald-grad-left-reg)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-left-reg)"
          />

          {/* Flowing Line 2: Soft Bluish-Slate / Navy Wave Ribbon */}
          <path
            d="M -50,450 C 120,470 170,300 300,260 C 420,220 500,290 610,230"
            stroke="url(#wave-slate-grad-left-reg)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-left-reg)"
          />

          {/* Flowing Line 3: Soft Mint-Teal Fine Accent Wave */}
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
      <div className="absolute -top-20 -right-20 sm:-top-28 sm:-right-28 w-[480px] h-[480px] sm:w-[580px] sm:h-[580px] pointer-events-none select-none z-0">
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
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.30" />
              <stop offset="60%" stopColor="#34D399" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="wave-slate-grad-right-reg" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.22" />
              <stop offset="65%" stopColor="#60A5FA" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="wave-mint-grad-right-reg" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.24" />
              <stop offset="65%" stopColor="#059669" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Flowing Line 1: Soft Emerald Wave Ribbon */}
          <path
            d="M 620,80 C 460,50 390,210 260,180 C 140,150 80,70 -30,120"
            stroke="url(#wave-emerald-grad-right-reg)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-right-reg)"
          />

          {/* Flowing Line 2: Soft Pale Bluish-Slate Wave Ribbon */}
          <path
            d="M 630,140 C 470,110 410,260 280,230 C 170,200 100,120 -20,170"
            stroke="url(#wave-slate-grad-right-reg)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-right-reg)"
          />

          {/* Flowing Line 3: Soft Mint Fine Accent Wave */}
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
      {/* CARD UTAMA: HORIZONTAL BESAR (1200-1280px, TINGGI PROPORSIONAL, 2 KOLOM)  */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[1240px] xl:max-w-[1280px] bg-white rounded-[24px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12),0_0_1px_1px_rgba(15,23,42,0.04)] border border-slate-200/90 flex flex-col lg:flex-row my-auto">
        {/* ======================================================================= */}
        {/* PANEL KIRI: AREA BRANDING SIPENA + ILUSTRASI TRANSPARAN UTUH            */}
        {/* Proporsi Desktop: 52% Kiri, Background Gradient Navy-Blue Elegan        */}
        {/* Deep Navy #0B1435, Navy #14244B, Subtle Blue #18346B                     */}
        {/* ======================================================================= */}
        <div className="w-full lg:w-[52%] relative bg-[linear-gradient(160deg,#0B1435_0%,#14244B_55%,#18346B_100%)] flex flex-col justify-between overflow-hidden">
          {/* Elemen Dekoratif 1: Dot Pattern Ringan di Pojok Kanan Atas */}
          <div className="absolute top-6 right-6 pointer-events-none opacity-20 z-0">
            <svg width="84" height="64" viewBox="0 0 84 64" fill="none">
              {[0, 1, 2, 3].map((row) =>
                [0, 1, 2, 3, 4].map((col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={8 + col * 17}
                    cy={8 + row * 16}
                    r="1.5"
                    fill="#FFFFFF"
                  />
                ))
              )}
            </svg>
          </div>

          {/* Elemen Dekoratif 2: Pencahayaan Biru Halus pada Bagian Bawah & Kanan */}
          <div className="absolute -bottom-12 -right-12 w-96 h-96 rounded-full bg-[#18346B]/50 blur-[90px] pointer-events-none z-0" />
          <div className="absolute bottom-16 left-6 w-80 h-80 rounded-full bg-[#14244B]/40 blur-[80px] pointer-events-none z-0" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-400/[0.04] blur-[100px] pointer-events-none z-0" />

          {/* ------------------------------------------------------------------- */}
          {/* KONTEN ATAS & TENGAH: LOGO + TAGLINE + HEADLINE + DESKRIPSI        */}
          {/* ------------------------------------------------------------------- */}
          <div className="relative z-10 p-6 sm:p-8 lg:p-10 xl:p-12 pb-0 space-y-5">
            {/* 1. Logo SIPENA di Kiri Atas & Tombol Kecil "Kembali ke Beranda" */}
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-3 group select-none">
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                  <Image
                    src="/LOGO SIPENA.png"
                    alt="Logo SIPENA"
                    width={44}
                    height={44}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span
                    className="text-xl font-black text-white tracking-tight leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    SIPENA
                  </span>
                  {/* Tagline di Bawah Logo */}
                  <span className="text-[11px] font-semibold text-emerald-400 tracking-wide mt-0.5">
                    Petakan Kebutuhan, Pantau Perubahan
                  </span>
                </div>
              </Link>

              {/* Tombol Kecil "Kembali ke Beranda" di Kanan Atas */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white backdrop-blur-md text-xs font-semibold transition-all border border-white/15 group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>

            {/* Headline & Deskripsi */}
            <div className="space-y-2.5 max-w-lg pt-1">
              <h2
                className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-white tracking-tight leading-[1.2]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bangun Kolaborasi CSR yang Lebih Terarah
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
                Daftarkan akun untuk mengelola program CSR dan membangun kolaborasi bersama mitra dalam satu platform yang terintegrasi.
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* ILUSTRASI PANEL KIRI: PNG TRANSPARAN TERBARU SEBAGAI VISUAL UTAMA  */}
          {/* Memenuhi sebagian besar lebar panel, menempel di batas bawah        */}
          {/* ------------------------------------------------------------------- */}
          <div className="relative z-10 w-full flex-1 min-h-[320px] sm:min-h-[380px] lg:min-h-[430px] xl:min-h-[470px] flex items-end justify-center px-4 sm:px-6 lg:px-8 pt-3 pb-0 mt-3 sm:mt-4">
            <div className="relative w-full h-full max-w-[640px] min-h-[300px] flex items-end justify-center">
              <Image
                src="/images/register-illustration.png"
                alt="Ilustrasi Kolaborasi CSR SIPENA"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain object-bottom select-none pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* PANEL KANAN: FORM REGISTRASI BERSIH, MODERN, & PROFESIONAL              */}
        {/* Proporsi Desktop: 48% Kanan, Kontainer Form Putih Lega & Konsisten      */}
        {/* ======================================================================= */}
        <div className="w-full lg:w-[48%] bg-white p-7 sm:p-9 lg:p-11 xl:p-12 flex flex-col justify-between">
          <div>
            {/* 1. Badge Kecil di Atas */}
            <div className="mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] border border-[#BDEBD7] text-[#0A6E51] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Registrasi Akun Baru</span>
              </div>
            </div>

            {/* 2. Judul Utama & Deskripsi */}
            <div className="space-y-1 mb-3.5">
              <h1
                className="text-2xl sm:text-[28px] font-black text-[#181343] tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bergabung dengan SIPENA
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md">
                Buat akun untuk mulai mengelola program CSR dan membangun kolaborasi bersama mitra.
              </p>
            </div>

            {/* 3. Info Box Lembut Berwarna Hijau Muda */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#ECFDF5] border border-emerald-200/90 flex items-start gap-2.5 text-xs text-[#065F46] leading-relaxed mb-5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#0A6E51] shrink-0 mt-0.5" />
              <span>
                Setelah mendaftar, Anda dapat melengkapi profil organisasi untuk mengajukan verifikasi administratif.
              </span>
            </div>

            {/* 4. Formulir Registrasi */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Pesan Kesalahan Validasi / Error API */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm leading-relaxed animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Field 1: Nama Pengguna */}
              <div className="space-y-1">
                <label
                  htmlFor="register-username"
                  className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
                >
                  Nama Pengguna <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="register-username"
                    type="text"
                    required
                    placeholder="contoh: budi_santoso"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full h-11 sm:h-12 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-[#E2E8F0] rounded-xl outline-none transition-all duration-200 focus:border-[#181343] focus:ring-4 focus:ring-[#181343]/10"
                  />
                </div>
              </div>

              {/* Field 2: Email Resmi Institusi */}
              <div className="space-y-1">
                <label
                  htmlFor="register-email"
                  className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
                >
                  Email Resmi Institusi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    required
                    placeholder="nama@organisasi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full h-11 sm:h-12 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-[#E2E8F0] rounded-xl outline-none transition-all duration-200 focus:border-[#181343] focus:ring-4 focus:ring-[#181343]/10"
                  />
                </div>
              </div>

              {/* Field 3: Kata Sandi */}
              <div className="space-y-1">
                <label
                  htmlFor="register-password"
                  className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
                >
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full h-11 sm:h-12 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-[#E2E8F0] rounded-xl outline-none transition-all duration-200 focus:border-[#181343] focus:ring-4 focus:ring-[#181343]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 4: Konfirmasi Kata Sandi */}
              <div className="space-y-1">
                <label
                  htmlFor="register-confirm-password"
                  className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
                >
                  Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Ulangi kata sandi Anda"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full h-11 sm:h-12 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-[#E2E8F0] rounded-xl outline-none transition-all duration-200 focus:border-[#181343] focus:ring-4 focus:ring-[#181343]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                    aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol CTA Utama: Buat Akun (Full width, Solid Navy SIPENA) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 sm:h-12 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#181343] hover:bg-[#251f5e] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Buat Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider Sederhana dengan Teks "atau" */}
              <div className="relative my-3 sm:my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-semibold text-[11px]">atau</span>
                </div>
              </div>

              {/* Tombol Alternatif Outline: Daftar dengan Google */}
              <button
                type="button"
                onClick={() => alert("Fitur pendaftaran melalui Google SSO akan segera tersedia.")}
                className="w-full h-11 inline-flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:border-slate-300 cursor-pointer"
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

              {/* Footer Kecil: Sudah Memiliki Akun? Masuk ke Akun */}
              <div className="pt-2 text-center">
                <p className="text-xs sm:text-sm text-slate-500">
                  Sudah memiliki akun?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-[#181343] hover:text-[#0A6E51] transition-colors underline underline-offset-2 cursor-pointer"
                  >
                    Masuk ke Akun
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Card: Security Note */}
          <div className="mt-5 pt-3.5 border-t border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Data pendaftaran dilindungi protokol keamanan terenkripsi.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
