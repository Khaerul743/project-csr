"use client";

import React from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface AksiItem {
  letter: string;
  title: string;
  description: string;
}

const AKSI_ITEMS: AksiItem[] = [
  {
    letter: "A",
    title: "Akuntabilitas",
    description:
      "Menjaga keterbukaan tata kelola melalui pencatatan tertib, verifikasi bertahap, dan pelaporan siap audit.",
  },
  {
    letter: "K",
    title: "Kolaborasi",
    description:
      "Menghubungkan korporasi, mitra pelaksana, dan komunitas penerima manfaat dalam alur kerja yang terpadu.",
  },
  {
    letter: "S",
    title: "Sasaran Tepat",
    description:
      "Memetakan kebutuhan riil masyarakat agar alokasi program CSR lebih relevan, tepat sasaran, dan berdampak nyata.",
  },
  {
    letter: "I",
    title: "Inovasi",
    description:
      "Memanfaatkan teknologi dan AI untuk mendukung rekomendasi program, evaluasi proposal, serta analisis dampak.",
  },
];

export function ValuesSection() {
  return (
    <section
      id="nilai-kami"
      className="relative overflow-hidden py-10 sm:py-12 lg:py-14 bg-[#091836] text-[#F4F7FC] scroll-mt-[76px]"
    >
      {/* ========================================================================= */}
      {/* 1. COLLABORATION MEETING BACKGROUND PHOTO (USER'S IMAGE)                   */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/images/nilai-aksi-bg.jpg')",
        }}
      />
      {/* Natural Deep Blue Gradient Overlay for the New Image */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#091836]/60 via-[#0B1E48]/40 to-[#071632]/70 pointer-events-none" />

      {/* Subtle Top & Bottom Blends */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#091836] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#071632] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        {/* ========================================================================= */}
        {/* 2. SECTION HEADER: COMPACT VERTICAL SPACING & BOLD HEADLINES              */}
        {/* ========================================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-9 space-y-2">
          <ScrollReveal animation="fade-up" delay={30}>
            {/* Small Eyebrow Label with SIPENA Button Blue Accent & White Text */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1765F5]/20 backdrop-blur-xs border border-[#1765F5]/40 text-white text-xs font-bold uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#43A5FF]" />
              <span>NILAI UTAMA SIPENA</span>
            </div>

            {/* Headline Ditebalkan */}
            <h2
              className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#F4F7FC] tracking-tight leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              AKSI: Fondasi di Balik Setiap Perubahan
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal mt-1.5 max-w-lg mx-auto">
              Empat nilai utama yang menjadi fondasi SIPENA dalam tata kelola program CSR berbasis kebutuhan dan evaluasi dampak nyata.
            </p>
          </ScrollReveal>
        </div>

        {/* ========================================================================= */}
        {/* 3. 4-COLUMN HORIZONTAL ROW (A - K - S - I) WITH SIPENA BLUE ACCENTS       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-12 xl:gap-16 items-start">
          {AKSI_ITEMS.map((item, idx) => (
            <ScrollReveal
              key={item.letter}
              animation="fade-up"
              delay={40 + idx * 30}
              className="h-full relative"
            >
              <div className="flex flex-col items-center text-center px-2 sm:px-3 h-full">
                {/* Pure White Circle (Clean Matte, No Colored Border) */}
                <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-white border border-white/90 shadow-md flex items-center justify-center transition-transform duration-300 hover:scale-105">
                  <span
                    className="bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] bg-clip-text text-transparent font-black text-xl sm:text-2xl leading-none select-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.letter}
                  </span>
                </div>

                {/* Value Name Ditebalkan (Bold) - Spacing Luas dari Circle */}
                <h3
                  className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug mt-6 sm:mt-7"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>

                {/* Description (Langsung di bawah judul, rata dan seimbang) */}
                <p className="text-xs sm:text-[13px] text-slate-200/90 leading-relaxed font-normal mt-3 max-w-[240px] sm:max-w-[260px] mx-auto min-h-[50px] sm:min-h-[54px]">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
