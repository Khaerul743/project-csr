"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Search,
  Bell,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Target,
  FileText,
  Activity,
  Award,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-14 lg:pb-32 bg-gradient-to-b from-[#F8FBFF] via-[#EDF6FF] via-25% via-[#D6EAFF] via-50% to-[#6DB7F5]"
    >
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC SKY & CLOUD LIGHTING (PERFECTION ACCORDING TO SPEC)         */}
      {/* ========================================================================= */}
      {/* Realistic Subtle Cloud Textures on Edges */}
      <div className="absolute inset-0 pointer-events-none select-none -z-10 overflow-hidden">
        {/* Soft Cloud Flanks Layer */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          <Image
            src="/images/hero-sky-bg.jpg"
            alt="Atmospheric Clouds"
            fill
            priority
            className="object-cover object-top"
            quality={95}
          />
        </div>

        {/* Top Airy Clean Luminous Overlay (Almost White Upper Section) */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#F8FBFF] via-[#F8FBFF]/90 via-45% to-transparent pointer-events-none" />

        {/* Saturated Powder & Sky Blue Radial Emphasis around Dashboard Mockup */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[750px] sm:w-[1000px] h-[520px] bg-gradient-to-r from-[#A9D5FF]/40 via-[#6DB7F5]/50 to-[#A9D5FF]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Ambient Organic Light Curves on Left and Right Flanks */}
        <div className="absolute top-28 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-white/60 blur-3xl pointer-events-none" />
        <div className="absolute top-36 -right-24 w-80 sm:w-[420px] h-80 sm:h-[420px] rounded-full bg-white/60 blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO CONTENT: CENTERED HEADLINE, SUBHEAD & DUAL ACTION BUTTONS         */}
      {/* ========================================================================= */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Main Headline (Authoritative Navy, Balanced & Bold) */}
        <ScrollReveal animation="fade-up" delay={40}>
          <h1
            className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-extrabold text-[#102B58] tracking-tight leading-[1.18] max-w-3xl mx-auto pt-1 sm:pt-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Petakan Kebutuhan,
            <span className="block">Pantau Perubahan.</span>
          </h1>
        </ScrollReveal>

        {/* Subheadline (Airy & Legible) */}
        <ScrollReveal animation="fade-up" delay={80}>
          <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm lg:text-[15px] text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
            Satu platform terintegrasi untuk merencanakan, mengelola, dan mengevaluasi program CSR berbasis kebutuhan serta dampak nyata.
          </p>
        </ScrollReveal>

        {/* Dual Action CTAs (Vibrant Blue Gradient + Translucent Light Button) */}
        <ScrollReveal animation="fade-up" delay={120}>
          <div className="mt-6 sm:mt-7.5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5">
            {/* Primary Button: Jelajahi SIPENA (Smooth vibrant gradient #43A5FF -> #1765F5 -> #1748D5) */}
            <Link href="/register">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] hover:brightness-105 hover:scale-105 px-7 sm:px-8 py-3 rounded-full shadow-lg shadow-[#1765F5]/30 hover:shadow-xl hover:shadow-[#1765F5]/50 transition-all cursor-pointer"
              >
                Jelajahi SIPENA
              </button>
            </Link>

            {/* Secondary Button: Masuk ke Platform (Translucent Ice-Blue / White Pill) */}
            <Link href="/login">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-white/85 hover:bg-white backdrop-blur-md text-[#102B58] text-xs sm:text-sm font-bold border border-white/90 shadow-md shadow-slate-200/50 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] shrink-0" />
                <span>Masuk ke Platform</span>
              </button>
            </Link>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* 3. 3D PERSPECTIVE DASHBOARD SHOWCASE (DEVICE FRAME & LIVE PREVIEW)        */}
        {/* ========================================================================= */}
        <ScrollReveal animation="zoom-in" delay={180} duration={800} className="w-full">
          <div className="relative mt-8 sm:mt-10 max-w-5xl mx-auto px-2 sm:px-4 [perspective:1400px]">
            {/* Secondary angled mockup peeking from the left (Depth perspective layer) */}
            <div className="absolute -left-8 sm:-left-14 top-14 w-60 sm:w-72 h-[380px] bg-[#17181C] rounded-[28px] p-2.5 shadow-2xl border border-white/40 hidden md:block opacity-60 -rotate-[8deg] translate-y-8 pointer-events-none select-none z-0">
              <div className="w-full h-full bg-[#F0F4FC] rounded-[20px] p-4 flex flex-col justify-between overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#0875D1]" />
                    <span className="text-xs font-bold text-[#17233C]">SIPENA Mobile</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Verifikasi Cepat</span>
                    <p className="text-xs font-extrabold text-[#059669]">4 Laporan Siap Disetujui</p>
                  </div>
                </div>
                <div className="h-28 bg-white rounded-xl shadow-xs p-2 flex items-end justify-between gap-1">
                  <div className="w-1/4 h-12 bg-slate-200 rounded-t-md" />
                  <div className="w-1/4 h-18 bg-slate-200 rounded-t-md" />
                  <div className="w-1/4 h-24 bg-[#0875D1] rounded-t-md" />
                  <div className="w-1/4 h-14 bg-slate-200 rounded-t-md" />
                </div>
              </div>
            </div>

            {/* Main Primary Tablet/Device Mockup */}
            <div className="relative z-10 bg-[#17181C] rounded-[28px] sm:rounded-[38px] p-2 sm:p-3.5 shadow-2xl shadow-blue-500/25 border border-white/60 ring-1 ring-black/15 overflow-hidden transition-transform duration-500 hover:[transform:rotateX(0deg)] [transform:rotateX(4deg)]">
              {/* Device Frame Camera Sensor */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 sm:w-20 h-1.5 sm:h-2 rounded-full bg-white/10 z-30" />

              {/* Inside Dashboard Screen Canvas */}
              <div className="bg-white rounded-[20px] sm:rounded-[28px] overflow-hidden text-left flex border border-[#E0E7F1]">
                {/* Left Mini-Sidebar */}
                <aside className="w-16 sm:w-48 bg-[#FAFAFC] border-r border-[#E0E7F1] p-3 sm:p-4 hidden sm:flex flex-col justify-between shrink-0 select-none">
                  <div className="space-y-5">
                    {/* Brand */}
                    <div className="flex items-center gap-2 px-1">
                      <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                        <Image
                          src="/images/sipena-feather-logo.png"
                          alt="SIPENA"
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                      <span className="hidden sm:inline font-extrabold text-sm text-[#17233C] tracking-tight">
                        SIPENA
                      </span>
                    </div>

                    {/* Navigation Pills */}
                    <nav className="space-y-1">
                      {[
                        { label: "Overview", icon: LayoutDashboard, active: true },
                        { label: "Peluang CSR", icon: Target, active: false },
                        { label: "Proposal", icon: FileText, active: false },
                        { label: "Monitoring", icon: Activity, active: false },
                        { label: "Laporan ESG", icon: Award, active: false },
                      ].map((menu) => {
                        const Icon = menu.icon;
                        return (
                          <div
                            key={menu.label}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${menu.active
                              ? "bg-[#DFEBFC] text-[#0875D1] shadow-2xs"
                              : "text-slate-500 hover:text-[#17233C] hover:bg-slate-100"
                              }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">{menu.label}</span>
                          </div>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="p-2 bg-[#F0F4FC] rounded-xl text-[11px] text-[#0875D1] font-bold text-center">
                    CSR v2.4
                  </div>
                </aside>

                {/* Dashboard Screen Content Area */}
                <main className="flex-1 bg-[#F0F4FC]/40 p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-hidden">
                  {/* Top Bar Header */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E0E7F1]/80">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        readOnly
                        value="Cari program, wilayah, atau mitra..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#E0E7F1] text-[11px] text-slate-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="relative w-8 h-8 rounded-xl bg-white border border-[#E0E7F1] flex items-center justify-center text-slate-600 shadow-2xs">
                        <Bell className="w-3.5 h-3.5" />
                        <span className="w-2 h-2 rounded-full bg-[#0875D1] absolute top-1.5 right-1.5 ring-2 ring-white" />
                      </div>

                      <div className="flex items-center gap-2 pl-1.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#064BA5] to-[#38A8F2] flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                          SN
                        </div>
                        <div className="hidden lg:block text-left leading-tight">
                          <p className="text-xs font-bold text-[#17233C]">PT Semen Nusantara</p>
                          <p className="text-[10px] text-slate-500">Corporate Sponsor</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Greeting & Quick Notice Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#17233C] tracking-tight">
                        Selamat pagi, Tim CSR!
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Berikut rangkuman kinerja dan evaluasi portofolio CSR Anda hari ini.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3DC] border border-[#FDE68A] text-[#92400E] text-[11px] font-bold self-start sm:self-auto shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                      <span>3 laporan program butuh verifikasi</span>
                    </div>
                  </div>

                  {/* Bento Row: Analytics Bar Chart (Left) + KPI Completion Meter (Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* LEFT CARD (7 cols): Shipment Analytics / CSR Portfolio Analysis */}
                    <div className="md:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-[#E0E7F1] shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-[#17233C] block">
                            Analisis Portofolio CSR
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Realisasi dana per bulan
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F4FC] border border-[#E0E7F1] text-[10px] font-bold text-slate-600">
                          <Calendar className="w-3 h-3 text-[#0875D1]" />
                          <span>Januari - Desember 2024</span>
                        </div>
                      </div>

                      {/* 3 Metric Mini Stats */}
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Total Pagu</span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#17233C]">
                            Rp 1.5 M <span className="text-[10px] text-emerald-600">+8.4%</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Realisasi</span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#059669]">
                            Rp 1.15 M
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Program Aktif</span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#0875D1]">
                            14 Inisiatif
                          </span>
                        </div>
                      </div>

                      {/* Rounded Bar Chart (One vibrant blue bar, others soft grey) */}
                      <div className="pt-2">
                        <div className="h-28 flex items-end justify-between gap-1.5 sm:gap-2 px-1 border-b border-slate-100 pb-1">
                          {[
                            { month: "Jan", h: 35, active: false },
                            { month: "Feb", h: 50, active: false },
                            { month: "Mar", h: 42, active: false },
                            { month: "Apr", h: 65, active: false },
                            { month: "Mei", h: 48, active: false },
                            { month: "Jun", h: 58, active: false },
                            { month: "Jul", h: 70, active: false },
                            { month: "Agu", h: 92, active: true }, // Highlighted Active Bar!
                            { month: "Sep", h: 60, active: false },
                            { month: "Okt", h: 52, active: false },
                            { month: "Nov", h: 45, active: false },
                            { month: "Des", h: 38, active: false },
                          ].map((bar) => (
                            <div key={bar.month} className="flex-1 flex flex-col items-center gap-1 group">
                              <div className="w-full flex items-end justify-center h-24">
                                <div
                                  className={`w-full max-w-[14px] rounded-full transition-all duration-300 ${bar.active
                                    ? "bg-[#0875D1] shadow-sm shadow-[#0875D1]/40 scale-y-105"
                                    : "bg-[#DFE7F1] hover:bg-slate-300"
                                    }`}
                                  style={{ height: `${bar.h}%` }}
                                  title={`${bar.month}: Realisasi program`}
                                />
                              </div>
                              <span
                                className={`text-[9px] font-bold ${bar.active ? "text-[#0875D1]" : "text-slate-500"
                                  }`}
                              >
                                {bar.month}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT CARD (5 cols): Avg Working Time / Indeks Kinerja & Dampak */}
                    <div className="md:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-[#E0E7F1] shadow-2xs space-y-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#17233C]">
                            Indeks Capaian Portofolio
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>

                        {/* Big Metric Display */}
                        <div className="my-2.5">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-[#17233C] tabular-nums">
                              84.6%
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              +3.2%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Tingkat keberhasilan indikator dampak ESG
                          </p>
                        </div>

                        {/* Week Days Indicator Pills */}
                        <div className="flex items-center justify-between gap-1 py-2 border-y border-slate-100">
                          {["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"].map((day, idx) => (
                            <span
                              key={day}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 2 || idx === 3
                                ? "bg-[#0875D1] text-white shadow-2xs"
                                : "bg-[#F0F4FC] text-slate-600"
                                }`}
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Status Item List */}
                      <div className="space-y-1.5 pt-1">
                        {[
                          { title: "Restorasi Mangrove", status: "On Progress (88%)", color: "bg-emerald-500" },
                          { title: "Beasiswa Anak Pesisir", status: "Terverifikasi (100%)", color: "bg-[#0875D1]" },
                          { title: "Sentra UMKM Kopi", status: "Tahap II (64%)", color: "bg-amber-500" },
                        ].map((prog) => (
                          <div
                            key={prog.title}
                            className="flex items-center justify-between p-2 rounded-xl bg-[#F0F4FC]/60 text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${prog.color}`} />
                              <span className="font-bold text-[#17233C] truncate max-w-[110px] sm:max-w-[140px]">
                                {prog.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {prog.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Seamless Full-Width Bottom Gradient Fade into Next Section */}
      <div className="absolute bottom-0 inset-x-0 h-32 sm:h-48 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
    </section>
  );
}
