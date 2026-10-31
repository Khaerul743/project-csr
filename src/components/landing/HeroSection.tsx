"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Users2,
  ChevronRight,
  Maximize2,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function HeroSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch(() => { });
    }
  }, []);

  return (
    <section
      id="beranda"
      className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-[#FFFFFF]"
    >
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(#181343 1px, transparent 1px), radial-gradient(#181343 1px, #FFFFFF 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* SIDE-BY-SIDE TWO COLUMN LAYOUT: Text Column (Left) + Video Column (Right) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-14 items-center">

          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN: Headings, Value Proposition & Actions                      */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-7">

            {/* Top Eyebrow Badge */}
            <ScrollReveal animation="fade-up" delay={20}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-2xs text-[#181343] text-xs font-semibold">
                <span className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                </span>
                <span className="text-[11px] sm:text-xs font-bold tracking-tight text-[#181343] uppercase">
                  TERVERIFIKASI POJK 51/2017 & KERANGKA KERJA 17 SDGS NASIONAL
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5 shrink-0" />
              </div>
            </ScrollReveal>

            {/* Main Headline */}
            <ScrollReveal animation="fade-up" delay={80}>
              <h1
                className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-extrabold tracking-tight text-[#181343] leading-[1.2] lg:leading-[1.22]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Transformasi Tata Kelola CSR:{" "}
                <span className="text-emerald-600 block sm:inline">
                  Mencatat Bukti Nyata,
                </span>{" "}
                <span className="text-[#181343]">
                  Mengukur Dampak Teruji.
                </span>
              </h1>
            </ScrollReveal>

            {/* Dual Action CTAs */}
            <ScrollReveal animation="fade-up" delay={140}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full sm:w-auto text-xs sm:text-sm font-bold bg-[#181343] hover:bg-[#26224C] text-white rounded-xl shadow-xs px-6 py-3 cursor-pointer"
                  >
                    Jelajahi Portal Terpadu
                  </Button>
                </Link>

                <a
                  href="#cara-kerja"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("cara-kerja");
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.pageYOffset - 76;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#C8C5D0] hover:border-[#181343] text-xs sm:text-sm font-bold text-[#181343] shadow-2xs hover:bg-[#F9F9FB] transition-all cursor-pointer group"
                >
                  <span>Pelajari Cara Kerja</span>
                  <ChevronRight className="w-4 h-4 text-[#787680] group-hover:text-[#181343] group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
            </ScrollReveal>

            {/* Quick Key Guarantees */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="pt-5 border-t border-[#E5E7EB] flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-[#787680] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tanpa Klaim Semu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Geolokasi GPS Teruji</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#181343]" />
                  <span>Pencairan Bertahap Faktual</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: Video Showcase & Floating Impact Badges                   */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center">
            <ScrollReveal animation="zoom-in" delay={80} duration={900} className="w-full flex items-center justify-center">
              {/* Visual Container Stage */}
              <div className="relative w-full max-w-[420px] lg:max-w-[460px] xl:max-w-[500px] aspect-square flex items-center justify-center">

                {/* Central Globe Video Stage (Seamless & Borderless Integration) */}
                <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
                  <video
                    ref={videoRef}
                    src="/globe.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover pointer-events-none mix-blend-multiply scale-100 transition-transform duration-700"
                  />
                </div>

                {/* =================================================================== */}
                {/* FLOATING IMPACT CARDS & SDG BADGES                                  */}
                {/* =================================================================== */}

                {/* 1. Top-Right Floating Card: Dampak Nyata */}
                <div className="absolute top-3 right-0 sm:top-5 sm:-right-2 z-20 bg-white/95 backdrop-blur-md border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 shadow-md flex items-center gap-2.5 hover:shadow-lg transition-shadow">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="text-[11px] font-bold text-[#181343] block">
                      Dampak Nyata
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      SROI 3.8x Terukur
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#C8C5D0]" />
                </div>

                {/* 2. Floating Photo Thumbnail: Indonesian Students & SDG 4 */}
                <div className="absolute top-1/4 -left-3 sm:-left-5 z-20 flex items-center gap-2">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg shrink-0">
                    <Image
                      src="/images/csr-education.jpg"
                      alt="Pendidikan Anak Sekolah Pesisir"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[#C5192D] text-white font-bold text-[10px] flex items-center justify-center shadow-md shrink-0">
                    4
                  </div>
                </div>

                {/* 3. Floating Photo Thumbnail: Mangrove Planting & SDG 13 */}
                <div className="absolute -bottom-2 right-6 sm:bottom-1 sm:right-10 z-20 flex items-center gap-2">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg shrink-0">
                    <Image
                      src="/images/csr-mangrove.jpg"
                      alt="Restorasi Mangrove dan Iklim"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[#3F7E44] text-white font-bold text-[10px] flex items-center justify-center shadow-md shrink-0">
                    13
                  </div>
                </div>

                {/* 4. Bottom-Left Floating Card: Masyarakat Tervalidasi */}
                <div className="absolute bottom-5 left-0 sm:bottom-6 sm:-left-2 z-20 bg-white/95 backdrop-blur-md border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 shadow-md flex items-center gap-2.5 hover:shadow-lg transition-shadow">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                    <Users2 className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="text-[11px] font-bold text-[#181343] block">
                      Masyarakat Tervalidasi
                    </span>
                    <span className="text-[10px] text-[#47464F]">
                      Survei QR & Respon Warga
                    </span>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL-SIZE INTERACTIVE VIDEO MODAL                                         */}
      {/* ========================================================================= */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#181343] border border-white/20 rounded-3xl overflow-hidden shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="h-14 px-6 bg-[#110D30] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  SIPENA — Showcase Video Animasi & Live Demo Platform
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Tutup Video Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Display */}
            <div className="relative aspect-video w-full bg-[#0D0A26] flex items-center justify-center overflow-hidden">
              <video
                src="/globe.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />

              {/* Interactive Platform Live Simulation Feed */}
              <div className="relative z-10 w-full h-full p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Milestone Extractor & Real-Time Geospatial</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    Live Demo Active
                  </span>
                </div>

                {/* 3 Step Live Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-auto">
                  <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Tahap 1 · AI Extractor
                    </span>
                    <h5 className="text-xs font-bold text-white mt-1">
                      Dekonstruksi Dokumen PDF
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Ekstraksi 4 milestone kegiatan dan rincian alokasi anggaran otomatis.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                    <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                      Tahap 2 · Lapangan
                    </span>
                    <h5 className="text-xs font-bold text-white mt-1">
                      Validasi Foto & GPS
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Pencatatan koordinat titik tanam mangrove dan daftar presensi warga.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">
                      Tahap 3 · Kepatuhan ESG
                    </span>
                    <h5 className="text-xs font-bold text-white mt-1">
                      Audit Realisasi Kas
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Verifikasi nota penyedia & pelaporan POJK 51 siap unduh.
                    </p>
                  </div>
                </div>

                {/* Bottom Status */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-mono">Ready for .mp4 looping video file source</span>
                  <Link href="/register" onClick={() => setIsVideoModalOpen(false)}>
                    <Button variant="accent" size="sm" className="text-xs font-bold">
                      Daftar Akun Kemitraan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
