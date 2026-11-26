"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FileText,
  Camera,
  Coins,
  Sprout,
  QrCode,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface FeatureCardItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: FeatureCardItem[] = [
  {
    icon: FileText,
    title: "Ekstraksi Proposal & RAB",
    description: "Ekstraksi usulan dan RAB menjadi milestone siap verifikasi.",
  },
  {
    icon: Camera,
    title: "Jurnal & Bukti Lapangan",
    description: "Validasi progres real-time dengan foto dan koordinat GPS.",
  },
  {
    icon: Coins,
    title: "Realisasi Dana Bertahap",
    description: "Pencairan bertahap berbasis verifikasi nota kwitansi fisik.",
  },
  {
    icon: Sprout,
    title: "Penyelarasan SDGs & ESG",
    description: "Pemetaan inisiatif ke 17 target SDGs dan 3 pilar ESG.",
  },
  {
    icon: QrCode,
    title: "Survei Responden Bebas Login",
    description: "Penilaian kepuasan warga langsung via pemindaian QR Code.",
  },
  {
    icon: ShieldCheck,
    title: "Laporan Siap Audit",
    description: "Konsolidasi rekam jejak dan serapan anggaran siap diaudit.",
  },
];

export function FeaturesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability);
    return () => {
      el.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 250; // card width + gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScrollability, 300);
  };

  const handleScrollEvent = () => {
    checkScrollability();
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setActiveSlide(0);
      return;
    }
    const ratio = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    const index = Math.round(ratio * (FEATURES.length - 1));
    setActiveSlide(index);
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const targetScroll = (index / (FEATURES.length - 1)) * maxScroll;
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
    setActiveSlide(index);
    setTimeout(checkScrollability, 300);
  };

  return (
    <section
      id="fitur"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#FFFFFF] via-[#F6F9FE] to-[#F8FAFF] relative overflow-hidden scroll-mt-[76px]"
    >
      {/* ========================================================================= */}
      {/* ATMOSPHERIC AURA MESH GRADIENTS (MATCHING REFERENCE DESIGN)               */}
      {/* ========================================================================= */}
      {/* Left Flank Soft Lilac-Blue Aura */}
      <div className="absolute top-1/4 -left-36 w-[550px] sm:w-[680px] h-[550px] sm:h-[680px] bg-gradient-to-tr from-[#DCE7FE]/60 via-[#E4ECFF]/45 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Right Flank Powder-Sky Blue Glow */}
      <div className="absolute top-1/3 -right-36 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] bg-gradient-to-bl from-[#CBE7FD]/55 via-[#DBEFFF]/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Ambient Central Luminous Highlight */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-white/70 rounded-full blur-2xl pointer-events-none" />

      {/* Standard Container: Aligned with sections above (max-w-7xl mx-auto px-6 sm:px-8 lg:px-12) */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          {/* ========================================================================= */}
          {/* 1. LEFT COLUMN: ALIGNED IDENTICALLY TO SECTIONS ABOVE (~35% WIDTH)        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <ScrollReveal animation="fade-right" delay={30}>
              {/* Eyebrow Label Capsule */}
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#2B4FB1]/10 border border-[#2B4FB1]/20 text-[#2B4FB1] text-xs font-bold uppercase tracking-wider mb-2">
                <span>FITUR UTAMA SIPENA</span>
              </div>

              {/* Main Headline (Clean 2-line structure) */}
              <h2
                className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#0A2558] tracking-tight leading-[1.18]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Mengapa Memilih<br />SIPENA?
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-[14.5px] text-slate-600 leading-relaxed max-w-[320px]">
                Instrumen digital terpadu untuk tata kelola program CSR yang terukur, transparan, dan berdampak nyata bagi seluruh pemangku kepentingan.
              </p>

              {/* Slider Arrow Navigation Buttons [<-] [->] */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  disabled={!canScrollLeft}
                  className="w-11 h-11 rounded-full border-2 border-slate-200 bg-white text-slate-800 hover:text-[#1765F5] hover:border-[#1765F5] flex items-center justify-center shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-35 disabled:pointer-events-none disabled:cursor-not-allowed"
                  aria-label="Fitur Sebelumnya"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  disabled={!canScrollRight}
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] text-white flex items-center justify-center shadow-md shadow-[#1765F5]/30 hover:brightness-110 transition-all cursor-pointer active:scale-95 disabled:opacity-35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:shadow-none"
                  aria-label="Fitur Berikutnya"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* ========================================================================= */}
          {/* 2. RIGHT COLUMN: BALANCED CAROUSEL IN COLUMN (~65% WIDTH)                 */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 relative min-w-0">
            {/* Gradient Ribbon (Matched to Signature Button Gradient from-[#43A5FF] via-[#1765F5] to-[#1748D5]) */}
            <div className="absolute top-0 left-0 right-0 h-32 sm:h-36 bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] rounded-2xl pointer-events-none -z-0 shadow-lg shadow-[#1765F5]/20" />

            {/* Scrollable Cards Container (Spacious padding so Card 1 is not cramped against left corner) */}
            <div
              ref={scrollRef}
              onScroll={handleScrollEvent}
              className="relative z-10 flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pt-7 sm:pt-8 pb-5 pl-8 sm:pl-10 pr-6 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="relative w-[215px] sm:w-[225px] h-[245px] sm:h-[255px] shrink-0 bg-white rounded-2xl border border-slate-100/90 shadow-lg shadow-[#1765F5]/8 hover:shadow-xl hover:shadow-[#1765F5]/18 transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center justify-center p-4 sm:p-5 text-center group"
                  >
                    {/* Circular Icon Container */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F4FD] border border-[#1765F5]/15 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-[#1765F5] transition-all duration-300 shadow-2xs">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#1765F5] group-hover:text-white transition-colors duration-300 stroke-[1.8]" />
                    </div>

                    {/* Feature Title (Title Case, Bold Navy) */}
                    <h3
                      className="text-xs sm:text-[13px] font-bold text-[#0A2558] group-hover:text-[#1765F5] transition-colors tracking-tight leading-snug mb-2 px-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.title}
                    </h3>

                    {/* Feature Description (Fits completely in 2 lines, never clipped!) */}
                    <p className="text-[10.5px] sm:text-[11px] text-slate-600 leading-relaxed px-1">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Slider Position Indicator (Gambar 3 style) */}
            <div className="flex items-center justify-center gap-1.5 pt-3">
              {FEATURES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToSlide(i)}
                  className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${activeSlide === i
                    ? "w-7 bg-[#1765F5]"
                    : "w-2.5 bg-slate-200 hover:bg-slate-300"
                    }`}
                  aria-label={`Lihat fitur ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
