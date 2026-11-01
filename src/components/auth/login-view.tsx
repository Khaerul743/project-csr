"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export function LoginView() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Silakan lengkapi email dan kata sandi Anda.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "Gagal masuk ke akun. Silakan coba lagi.");
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
    <div className="min-h-screen w-full bg-[#F1F3F7] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* DEKORASI CANVAS LUAR: ABSTRACT FLOWING WAVE LINES (MINIMALIS & ELEGAN)     */}
      {/* ========================================================================= */}
      {/* 1. Pojok Kiri Bawah: Garis Meliuk-Liuk Mengalir (Soft Emerald & Slate) */}
      <div className="absolute -bottom-20 -left-20 sm:-bottom-28 sm:-left-28 w-[520px] h-[520px] sm:w-[640px] sm:h-[640px] pointer-events-none select-none z-0">
        {/* Soft Ambient Diffused Glow Behind Lines */}
        <div className="absolute bottom-16 left-16 w-80 h-80 rounded-full bg-emerald-400/[0.06] blur-[90px]" />
        <div className="absolute bottom-24 left-24 w-72 h-72 rounded-full bg-[#181343]/[0.04] blur-[100px]" />

        <svg
          viewBox="0 0 640 640"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <filter id="wave-soft-glow-left" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="wave-emerald-grad-left" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#34D399" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="wave-slate-grad-left" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.30" />
              <stop offset="65%" stopColor="#60A5FA" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="wave-teal-grad-left" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#14B8A6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Flowing Line 1: Soft Emerald Wave Ribbon */}
          <path
            d="M -40,510 C 140,530 190,360 330,320 C 450,280 520,350 630,290"
            stroke="url(#wave-emerald-grad-left)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-left)"
          />

          {/* Flowing Line 2: Soft Bluish-Slate / Navy Wave Ribbon */}
          <path
            d="M -50,450 C 120,470 170,300 300,260 C 420,220 500,290 610,230"
            stroke="url(#wave-slate-grad-left)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-left)"
          />

          {/* Flowing Line 3: Soft Mint-Teal Fine Accent Wave */}
          <path
            d="M -30,570 C 160,590 220,420 360,370 C 470,330 550,400 650,340"
            stroke="url(#wave-teal-grad-left)"
            strokeWidth="1.75"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-left)"
          />
        </svg>
      </div>

      {/* 2. Pojok Kanan Atas: Garis Meliuk-Liuk Mengalir (Soft Mint & Emerald) */}
      <div className="absolute -top-20 -right-20 sm:-top-28 sm:-right-28 w-[480px] h-[480px] sm:w-[580px] sm:h-[580px] pointer-events-none select-none z-0">
        {/* Soft Ambient Diffused Glow Behind Lines */}
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full bg-[#10B981]/[0.05] blur-[80px]" />
        <div className="absolute top-24 right-24 w-64 h-64 rounded-full bg-[#38BDF8]/[0.03] blur-[90px]" />

        <svg
          viewBox="0 0 580 580"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <filter id="wave-soft-glow-right" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="wave-emerald-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#34D399" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="wave-slate-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.25" />
              <stop offset="65%" stopColor="#60A5FA" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="wave-mint-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.26" />
              <stop offset="65%" stopColor="#059669" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Flowing Line 1: Soft Emerald Wave Ribbon */}
          <path
            d="M 620,80 C 460,50 390,210 260,180 C 140,150 80,70 -30,120"
            stroke="url(#wave-emerald-grad-right)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-right)"
          />

          {/* Flowing Line 2: Soft Pale Bluish-Slate Wave Ribbon */}
          <path
            d="M 630,140 C 470,110 410,260 280,230 C 170,200 100,120 -20,170"
            stroke="url(#wave-slate-grad-right)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-right)"
          />

          {/* Flowing Line 3: Soft Mint Fine Accent Wave */}
          <path
            d="M 610,20 C 440,0 370,150 230,130 C 120,110 60,30 -40,80"
            stroke="url(#wave-mint-grad-right)"
            strokeWidth="1.75"
            strokeLinecap="round"
            filter="url(#wave-soft-glow-right)"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: HORIZONTAL SPLIT CARD (RADIUS 20px, SHADOW ELEGAN)        */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[1020px] bg-white rounded-[20px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] border border-slate-200/90 flex flex-col lg:flex-row my-auto">
        {/* ----------------------------------------------------------------------- */}
        {/* PANEL KIRI: Gradien Halus Deep Navy (#181343 -> #213A62)                */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:w-[46%] xl:w-[45%] bg-gradient-to-br from-[#181343] via-[#1B2956] to-[#213A62] text-white p-8 sm:p-10 lg:p-11 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Dot Grid Accent in Top-Right Corner */}
          <div className="absolute top-6 right-6 pointer-events-none opacity-20">
            <svg width="108" height="90" viewBox="0 0 108 90" fill="none">
              {[0, 1, 2, 3, 4].map((row) =>
                [0, 1, 2, 3, 4, 5].map((col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={9 + col * 18}
                    cy={9 + row * 18}
                    r="1.6"
                    fill="#FFFFFF"
                  />
                ))
              )}
            </svg>
          </div>

          {/* Top Section: Kembali ke Beranda & Logo SIPENA */}
          <div className="relative z-10 space-y-7">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300/80 hover:text-white transition-colors duration-150 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-1 text-emerald-400" />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>

            {/* Logo SIPENA & Tagline */}
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 sm:w-13 sm:h-13 shrink-0 drop-shadow-sm">
                <Image
                  src="/LOGO SIPENA.png"
                  alt="Logo SIPENA"
                  width={52}
                  height={52}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="leading-tight">
                <span
                  className="text-2xl sm:text-[26px] font-black tracking-tight text-white block"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  SIPENA
                </span>
                <span className="text-[10px] font-bold text-slate-300/90 tracking-wider block uppercase mt-0.5">
                  Mencatat Aksi, Mengukur Dampak
                </span>
              </div>
            </div>
          </div>

          {/* Middle Section: Headline & Deskripsi Ringkas Minimalis */}
          <div className="relative z-10 my-8 sm:my-10 space-y-4">
            <h1
              className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-white tracking-tight leading-[1.25]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Kelola Kolaborasi CSR
              <br />
              <span className="text-[#10B981]">
                Secara Efektif
                <br />
                &amp; Akuntabel
              </span>
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-200/85 leading-relaxed font-normal max-w-sm">
              Platform terintegrasi yang menghubungkan perusahaan, mitra pelaksana, dan masyarakat untuk mewujudkan program CSR yang transparan, terukur, dan berdampak nyata.
            </p>
          </div>

          {/* Bottom Section: Footer Institusional Rapi & Terstruktur */}
          <div className="relative z-10 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300/70">
            <span>Sistem Kolaborasi CSR Indonesia</span>
            <span>&copy; 2026 SIPENA</span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PANEL KANAN: Form Login Bersih, Lega, & Proporsional                     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:w-[54%] xl:w-[55%] bg-white p-8 sm:p-10 lg:p-11 xl:p-12 flex flex-col justify-between">
          <div>
            {/* Top Bar: Portal Akses Organisasi Badge */}
            <div className="mb-6 sm:mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] border border-[#BDEBD7] text-[#0A6E51] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#0A6E51]" />
                <span>Portal Akses Organisasi</span>
              </div>
            </div>

            {/* Form Title & Subtitle */}
            <div className="space-y-1.5 mb-6 sm:mb-7">
              <h2
                className="text-2xl sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Masuk ke Akun
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md">
                Gunakan email dan kata sandi Anda untuk mengakses dashboard pengelolaan program CSR.
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5">
              {/* Error Message Box */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm leading-relaxed animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-[#0F172A]"
                >
                  Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="nama@institusi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full h-12 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none transition-all duration-200 focus:border-[#0A6E51] focus:bg-white focus:ring-4 focus:ring-[#0A6E51]/10"
                  />
                </div>
              </div>

              {/* Kata Sandi Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-[#0F172A]"
                  >
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Silakan hubungi administrator institusi Anda atau tim sekretariat SIPENA di support@sipena.id untuk bantuan pemulihan kata sandi."
                      )
                    }
                    className="text-xs font-semibold text-[#0A6E51] hover:text-[#085C43] hover:underline transition-colors cursor-pointer"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full h-12 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none transition-all duration-200 focus:border-[#0A6E51] focus:bg-white focus:ring-4 focus:ring-[#0A6E51]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Masuk ke Akun -> */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#0A6E51] hover:bg-[#085C43] rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider Pemisah "atau" */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute px-3 bg-white text-xs text-slate-400 font-medium">
                  atau
                </span>
              </div>

              {/* Tombol Masuk dengan Google */}
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Autentikasi Single Sign-On (SSO) Google khusus untuk domain institusi terdaftar."
                  )
                }
                className="w-full h-11 inline-flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </button>

              {/* Tautan Belum Memiliki Akun? Daftar Sekarang */}
              <div className="pt-2 text-center">
                <p className="text-xs sm:text-sm text-slate-500">
                  Belum memiliki akun institusi?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-[#0A6E51] hover:text-[#064e3b] transition-colors underline-offset-2 hover:underline cursor-pointer"
                  >
                    Daftar Sekarang
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Card: Security Note */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-4 h-4 text-[#0A6E51] shrink-0" />
              <span>Keamanan akun dilindungi dengan enkripsi dan protokol keamanan terkini.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
