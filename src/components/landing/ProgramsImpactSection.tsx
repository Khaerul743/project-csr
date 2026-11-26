"use client";

import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface ImpactStory {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  avatarUrl: string;
  initials: string;
  avatarGradient: string;
}

const IMPACT_STORIES: ImpactStory[] = [
  {
    id: "story-1",
    name: "Dra. Maya Puspitasari, M.Si",
    role: "VP Sustainability & Corporate Affairs",
    organization: "PT Mandiri Mineral Tbk",
    quote:
      "Pencatatan termin berbasis nota fisik dan validasi bertahap membuat laporan tahunan CSR kami siap diaudit kapan saja dengan transparansi penuh tanpa keraguan.",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    initials: "MP",
    avatarGradient: "from-[#1765F5] to-[#0A2558]",
  },
  {
    id: "story-2",
    name: "Hendro Wicaksono, S.Hut",
    role: "Direktur Eksekutif",
    organization: "Yayasan Restorasi Pesisir Bahari",
    quote:
      "Pembaruan progres kegiatan lapangan terintegrasi langsung dengan titik koordinat GPS dan foto bukti nota secara real-time. Koordinasi kemitraan menjadi jauh lebih cepat dan terpercaya.",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    initials: "HW",
    avatarGradient: "from-emerald-500 to-teal-700",
  },
  {
    id: "story-3",
    name: "Siti Rahmawati",
    role: "Koordinator Forum Komunitas",
    organization: "Sentra Olahan Pesisir Mandiri",
    quote:
      "Warga penerima manfaat dapat memberikan penilaian langsung via pemindaian QR Code di lokasi kegiatan tanpa perlu login akun. Bantuan tersalurkan transparan dan tepat sasaran.",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
    initials: "SR",
    avatarGradient: "from-amber-500 to-orange-600",
  },
  {
    id: "story-4",
    name: "Ir. Budi Prasetyo, M.T.",
    role: "Head of CSR Governance & Compliance",
    organization: "PT Tirta Mandiri Persada",
    quote:
      "Penyelarasan otomatis ke 17 target SDGs dan pilar ESG mempermudah evaluasi dampak serta kepatuhan tata kelola keberlanjutan perusahaan di setiap periode audit.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
    initials: "BP",
    avatarGradient: "from-indigo-500 to-blue-700",
  },
];

export function ProgramsImpactSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 370; // card width + gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
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

  return (
    <section
      id="bukti-nyata"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#F7FAFF] via-[#F4F8FE] to-[#FFFFFF] relative overflow-hidden border-t border-slate-100/60 scroll-mt-[76px]"
    >
      {/* ========================================================================= */}
      {/* ATMOSPHERIC AURA MESH GRADIENTS (MATCHING REFERENCE DESIGN)               */}
      {/* ========================================================================= */}
      {/* Left Flank Soft Sky-Blue Diffusion */}
      <div className="absolute top-1/4 -left-36 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] bg-gradient-to-tr from-[#D6E6FE]/55 via-[#E2EEFF]/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Right Flank Soft Cyan-Blue Glow */}
      <div className="absolute top-1/3 -right-36 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] bg-gradient-to-bl from-[#C2E4FD]/50 via-[#DBEFFF]/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Ambient Central Luminous Highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/60 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* ========================================================================= */}
        {/* SECTION HEADER: SINGLE LINE "Dipercaya oleh Mitra Kolaborasi"             */}
        {/* ========================================================================= */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-14">
          <ScrollReveal animation="fade-up" delay={20}>
            {/* Main Headline (All in 1 single line on tablet & desktop) */}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold text-[#0A2558] tracking-tight leading-tight mb-4 whitespace-normal sm:whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Dipercaya oleh{" "}
              <span className="text-[#1765F5]">Mitra Kolaborasi</span>
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Umpan balik nyata dari para mitra perusahaan, lembaga pelaksana, hingga penerima manfaat yang bergerak bersama SIPENA dalam tata kelola CSR terukur, transparan, dan berdampak.
            </p>
          </ScrollReveal>
        </div>

        {/* ========================================================================= */}
        {/* TESTIMONIAL CARDS ROW / SLIDER                                            */}
        {/* ========================================================================= */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth py-4 px-2 sm:px-4 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory justify-start"
          >
            {IMPACT_STORIES.map((story) => (
              <div
                key={story.id}
                className="w-[300px] sm:w-[350px] lg:w-[360px] shrink-0 snap-start bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-100 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: User Avatar (Left) + Large Blue Quote Icon (Right) */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    {/* User Avatar Circle */}
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 shadow-xs shrink-0 bg-slate-100">
                      <img
                        src={story.avatarUrl}
                        alt={story.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = "flex";
                          }
                        }}
                      />
                      <div
                        className={`hidden absolute inset-0 bg-gradient-to-br ${story.avatarGradient} text-white items-center justify-center font-bold text-sm`}
                      >
                        {story.initials}
                      </div>
                    </div>

                    {/* Prominent Blue Double Quote Icon */}
                    <svg
                      className="w-9 h-9 text-[#1765F5] shrink-0 opacity-90"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  {/* Author Name */}
                  <h3
                    className="text-lg sm:text-xl font-bold text-[#0A2558] tracking-tight leading-snug"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {story.name}
                  </h3>

                  {/* Role & Company in Subtle Blue */}
                  <p className="text-xs sm:text-[13px] font-semibold text-[#1765F5] mt-1 mb-4">
                    {story.role}, {story.organization}
                  </p>

                  {/* Feedback / Testimonial Quote */}
                  <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed font-normal">
                    {story.quote}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* SLIDER CONTROLS: CLEAN NAVIGATION ARROWS WITHOUT CONFUSING DOT MARKERS   */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-center gap-3 pt-8">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white text-slate-800 hover:text-[#1765F5] hover:border-[#1765F5] flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-2xs active:scale-95"
              aria-label="Ulasan Sebelumnya"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] text-white flex items-center justify-center shadow-md shadow-[#1765F5]/25 hover:brightness-110 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95"
              aria-label="Ulasan Berikutnya"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
