"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Target,
  Users2,
  Activity,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface BenefitPoint {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const BENEFIT_POINTS: BenefitPoint[] = [
  {
    id: 1,
    title: "Pemetaan Kebutuhan yang Lebih Akurat",
    description:
      "Mengidentifikasi prioritas wilayah agar program CSR lebih tepat sasaran berdasarkan data riil masyarakat.",
    icon: Target,
    iconBg: "bg-[#1765F5]/10",
    iconColor: "text-[#1765F5]",
  },
  {
    id: 2,
    title: "Kolaborasi yang Lebih Terarah",
    description:
      "Mempermudah perusahaan menemukan mitra pelaksana dan yayasan yang memiliki rekam jejak terverifikasi.",
    icon: Users2,
    iconBg: "bg-[#0875D1]/10",
    iconColor: "text-[#0875D1]",
  },
  {
    id: 3,
    title: "Pemantauan Program yang Terstruktur",
    description:
      "Mengelola alur pelaksanaan, alokasi anggaran berkala, dan dokumentasi lapangan dalam satu platform digital.",
    icon: Activity,
    iconBg: "bg-[#059669]/10",
    iconColor: "text-[#059669]",
  },
  {
    id: 4,
    title: "Evaluasi Dampak yang Lebih Jelas",
    description:
      "Menyajikan analisis capaian program dan metrik keberlanjutan untuk mendukung pengambilan keputusan strategis.",
    icon: Award,
    iconBg: "bg-[#7561E7]/10",
    iconColor: "text-[#5141CD]",
  },
];

export function AboutSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Function to smoothly scroll a card to the vertical center of the container
  const scrollToCard = useCallback((index: number) => {
    const card = cardRefs.current[index];
    const container = containerRef.current;
    if (!card || !container) return;

    const cardCenter = card.offsetTop + card.clientHeight / 2;
    const targetScrollTop = cardCenter - container.clientHeight / 2;

    container.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
    setActiveIndex(index);
  }, []);

  // Update active index based on scroll position
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerCenter = container.scrollTop + container.clientHeight / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const cardCenter = card.offsetTop + card.clientHeight / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    setActiveIndex(closestIndex);
  };

  // Center the initial card on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCard(0);
    }, 150);
    return () => clearTimeout(timer);
  }, [scrollToCard]);

  return (
    <section
      id="tentang-kami"
      className="pt-14 pb-16 sm:pt-18 sm:pb-20 lg:pt-20 lg:pb-24 bg-white relative overflow-hidden scroll-mt-[76px]"
    >
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(#102B58 1px, transparent 1px), radial-gradient(#102B58 1px, #FFFFFF 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* ========================================================================= */}
        {/* 2-COLUMN LAYOUT: Title & Narrative (Left) + Vertical Scroll Cards (Right) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN: Section Title, Subtitle & Narrative Description            */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
            <ScrollReveal animation="fade-up" delay={40}>
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1765F5]/10 border border-[#1765F5]/20 text-[#1765F5] text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1765F5]" />
                <span>Tentang SIPENA</span>
              </div>

              {/* Main Headline */}
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#102B58] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Menjembatani Niat Baik Perusahaan dengan Realitas Kebutuhan Masyarakat
              </h2>

              {/* Short Supporting Paragraph */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mt-3">
                Menentukan kebutuhan masyarakat, membangun kemitraan yang tepat, dan mengevaluasi dampak program CSR bukanlah proses yang sederhana. SIPENA hadir untuk membantu menghubungkan seluruh tahapan tersebut dalam satu platform terintegrasi.
              </p>

              {/* Trust Badge */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F0F7FF] border border-[#D6EAFF] text-xs font-semibold text-[#102B58]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Platform Tata Kelola CSR Berbasis AI &amp; Akuntabilitas Terukur</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: Seamless Floating Vertical Scroll Reel with Blur Mask     */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 relative">
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
              {/* Seamless Viewport (No outer border box, seamlessly floating) */}
              <div className="flex-1 min-w-0 relative overflow-hidden py-1">
                {/* TOP WHITE BLUR & GRADIENT FOG OVERLAY */}
                <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white via-white/80 to-transparent backdrop-blur-[2px] pointer-events-none z-20" />

                {/* BOTTOM WHITE BLUR & GRADIENT FOG OVERLAY */}
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent backdrop-blur-[2px] pointer-events-none z-20" />

                {/* Scrollable Container */}
                <div
                  ref={containerRef}
                  onScroll={handleScroll}
                  className="h-[360px] sm:h-[400px] overflow-y-auto scrollbar-none snap-y snap-mandatory px-1 sm:px-3 relative z-10"
                  style={{
                    paddingTop: "140px",
                    paddingBottom: "140px",
                  }}
                >
                  <div className="space-y-4">
                    {BENEFIT_POINTS.map((point, idx) => {
                      const Icon = point.icon;
                      const isActive = idx === activeIndex;

                      return (
                        <div
                          key={point.id}
                          ref={(el) => {
                            cardRefs.current[idx] = el;
                          }}
                          onClick={() => scrollToCard(idx)}
                          className={`snap-center transition-all duration-300 rounded-2xl cursor-pointer p-4 sm:p-5 flex items-start gap-4 border ${
                            isActive
                              ? "bg-white border-[#1765F5]/45 shadow-xl shadow-[#1765F5]/10 scale-100 opacity-100 ring-2 ring-[#1765F5]/15 z-10"
                              : "bg-[#F8FBFF]/70 hover:bg-[#F8FBFF] border-[#E2EDFA] scale-[0.96] opacity-35 blur-[0.6px] hover:opacity-60 z-0"
                          }`}
                        >
                          {/* Circular Badge Icon */}
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${point.iconBg} ${point.iconColor} flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 ${
                              isActive ? "scale-105 ring-2 ring-white" : ""
                            }`}
                          >
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>

                          {/* Title & Description */}
                          <div className="space-y-1">
                            <h3
                              className={`text-sm sm:text-base font-bold transition-colors ${
                                isActive ? "text-[#102B58]" : "text-slate-500"
                              }`}
                            >
                              {point.title}
                            </h3>
                            <p
                              className={`text-xs sm:text-sm leading-relaxed font-normal transition-colors ${
                                isActive ? "text-slate-600" : "text-slate-400"
                              }`}
                            >
                              {point.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Vertical Navigation Controls on the Right (Panah Atas Bawah) */}
              <div className="flex flex-col items-center gap-2.5 sm:gap-3 shrink-0 z-30 select-none">
                {/* Panah Atas (Selalu Tombol Putih) */}
                <button
                  type="button"
                  onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-slate-200 bg-white text-slate-700 hover:text-[#1765F5] hover:border-[#1765F5] hover:bg-[#F0F7FF] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-35 disabled:pointer-events-none disabled:cursor-not-allowed"
                  aria-label="Poin Sebelumnya (Ke Atas)"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.2]" />
                </button>

                {/* Panah Bawah (Selalu Tombol Biru) */}
                <button
                  type="button"
                  onClick={() => scrollToCard(Math.min(BENEFIT_POINTS.length - 1, activeIndex + 1))}
                  disabled={activeIndex === BENEFIT_POINTS.length - 1}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] text-white flex items-center justify-center shadow-md shadow-[#1765F5]/25 hover:brightness-110 transition-all active:scale-95 cursor-pointer disabled:opacity-35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:shadow-none"
                  aria-label="Poin Berikutnya (Ke Bawah)"
                >
                  <ArrowDown className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
