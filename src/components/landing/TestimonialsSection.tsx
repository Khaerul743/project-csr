"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Quote,
  CheckCircle2,
  Building2,
  HeartHandshake,
  Users2,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { ScrollReveal, StaggerContainer } from "@/components/ui/scroll-reveal";

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  organization: string;
  category: "perusahaan" | "ngo" | "komunitas";
  categoryLabel: string;
  quote: string;
  highlightMetric: string;
  metricLabel: string;
  initials: string;
  verifiedLabel: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "corp",
    name: "Dra. Maya Puspitasari, M.Si",
    role: "VP Sustainability & Corporate Affairs",
    organization: "PT Mandiri Mineral Nusantara Tbk",
    category: "perusahaan",
    categoryLabel: "Kemitraan Korporasi",
    quote:
      "SIPENA membantu kami mengelola program CSR secara lebih terarah. Pencatatan kegiatan dan pelaporan realisasi yang terpusat memudahkan pemantauan mitra serta evaluasi capaian program bersama.",
    highlightMetric: "Terarah",
    metricLabel: "Penyelarasan prioritas dan pelaporan kemitraan CSR",
    initials: "MP",
    verifiedLabel: "Mitra Korporasi",
  },
  {
    id: "ngo",
    name: "Hendro Wicaksono, S.Hut",
    role: "Direktur Eksekutif",
    organization: "Yayasan Restorasi Mangrove Nusantara",
    category: "ngo",
    categoryLabel: "Mitra Pelaksana Lapangan",
    quote:
      "Pengelolaan proposal dan koordinasi kerja sama menjadi jauh lebih tertata. Kami dapat memperbarui progres kegiatan lapangan dan melaporkan penggunaan anggaran secara berkala dengan jelas.",
    highlightMetric: "Kolaboratif",
    metricLabel: "Pembaruan progres lapangan dan penggunaan anggaran",
    initials: "HW",
    verifiedLabel: "Lembaga Pelaksana",
  },
  {
    id: "community",
    name: "Siti Rahmawati",
    role: "Koordinator Forum Pemberdayaan UMKM Pesisir",
    organization: "Sentra Olahan Ikan Asin Mandiri",
    category: "komunitas",
    categoryLabel: "Penerima Manfaat",
    quote:
      "Masyarakat dapat langsung menyampaikan penilaian dan umpan balik kegiatan melalui pemindaian QR Code di lokasi. Prosesnya mudah tanpa perlu registrasi, sehingga suara kami didengar dengan baik.",
    highlightMetric: "Responsif",
    metricLabel: "Umpan balik langsung via tautan & QR Code",
    initials: "SR",
    verifiedLabel: "Penerima Manfaat",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const active = TESTIMONIALS[activeIndex];

  return (
    <section
      id="testimoni"
      className="py-20 lg:py-28 bg-[#FFFFFF] border-t border-[#E5E7EB] relative overflow-hidden"
    >
      {/* Background architectural pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #181343 1px, transparent 1px), linear-gradient(to bottom, #181343 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" delay={50}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181343]/5 border border-[#181343]/10 text-[#181343] text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Suara Kolaborasi Terpercaya</span>
              </div>
              <h2
                className="text-2xl sm:text-4xl font-extrabold text-[#181343] tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Dampak Nyata yang Dirasakan Oleh{" "}
                <span className="text-emerald-600">Seluruh Ekosistem</span>
              </h2>
              <p className="mt-3 text-base text-[#26224C]/80 leading-relaxed">
                Dengarkan langsung pengalaman dari korporasi donor, yayasan pelaksana di garis depan, serta komunitas penerima manfaat yang terhubung secara transparan.
              </p>
            </div>

            {/* Quick tab selector for the 3 ecosystem voices */}
            <div className="inline-flex p-1 rounded-xl bg-[#F4F4F6] border border-[#E5E7EB] self-start md:self-auto">
              {TESTIMONIALS.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${activeIndex === idx
                      ? "bg-[#181343] text-white shadow-sm"
                      : "text-[#26224C]/70 hover:text-[#181343] hover:bg-white/60"
                    }`}
                >
                  {t.categoryLabel}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Featured Hero Testimonial Box */}
        <ScrollReveal animation="zoom-in" delay={120}>
          <div className="bg-linear-to-br from-[#F9F9FB] to-[#F4F4F6] border border-[#C8C5D0]/60 rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xs">
            <div className="absolute top-6 right-8 text-[#181343]/5 pointer-events-none">
              <Quote className="w-28 h-28 sm:w-36 sm:h-36" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative">
              {/* Left Column: Quote & Story */}
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-[#E5E7EB] text-xs font-semibold text-[#181343]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>{active.categoryLabel}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    {active.verifiedLabel}
                  </span>
                </div>

                <blockquote className="text-lg sm:text-2xl font-medium text-[#181343] leading-relaxed italic min-h-[5.5rem] sm:min-h-[7rem] lg:min-h-[8rem] flex items-center">
                  &ldquo;{active.quote}&rdquo;
                </blockquote>

                <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#181343] text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-emerald-500/30">
                      {active.initials}
                    </div>
                    <div>
                      <h4
                        className="font-bold text-[#181343] text-base"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {active.name}
                      </h4>
                      <p className="text-xs text-[#26224C]/70">
                        {active.role} &mdash;{" "}
                        <span className="font-semibold text-[#181343]">
                          {active.organization}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex(
                          (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
                        )
                      }
                      className="p-2 rounded-lg bg-white border border-[#E5E7EB] text-[#181343] hover:bg-[#F4F4F6] transition-colors cursor-pointer"
                      aria-label="Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-[#26224C]/60 px-2">
                      {activeIndex + 1} / {TESTIMONIALS.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length)
                      }
                      className="p-2 rounded-lg bg-white border border-[#E5E7EB] text-[#181343] hover:bg-[#F4F4F6] transition-colors cursor-pointer"
                      aria-label="Selanjutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Key Quantitative Proof Card */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Fokus Pendekatan (Simulasi)</span>
                  </div>
                  <div
                    className="text-3xl sm:text-4xl font-extrabold text-[#181343] tracking-tight mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {active.highlightMetric}
                  </div>
                  <p className="text-xs text-[#26224C]/80 leading-relaxed font-medium">
                    {active.metricLabel}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#F4F4F6] space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#26224C]/70">
                    <span>Dokumentasi Program</span>
                    <span className="font-semibold text-emerald-700">Terpusat</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#26224C]/70">
                    <span>Pemetaan SDGs/ESG</span>
                    <span className="font-semibold text-[#181343]">Sesuai Program</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#26224C]/70">
                    <span>Monitoring Pelaksanaan</span>
                    <span className="font-semibold text-[#181343]">Progres & Laporan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 3 Secondary Snapshot Cards Below */}
        <StaggerContainer
          staggerDelay={120}
          baseDelay={100}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={t.id}
              onClick={() => setActiveIndex(idx)}
              className={`rounded-2xl p-6 transition-all duration-200 cursor-pointer border h-full ${activeIndex === idx
                  ? "bg-white border-[#181343] shadow-md ring-1 ring-[#181343]"
                  : "bg-[#F9F9FB] border-[#E5E7EB] hover:bg-white hover:border-[#C8C5D0]"
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F4F4F6] text-[#181343]">
                  {t.categoryLabel}
                </span>
                <span className="text-xs font-bold text-emerald-600">{t.highlightMetric}</span>
              </div>
              <p className="text-xs text-[#26224C]/80 line-clamp-2 italic mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-[#E5E7EB]">
                <div className="w-8 h-8 rounded-full bg-[#181343] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#181343] truncate">{t.name}</div>
                  <div className="text-[11px] text-[#26224C]/70 truncate">{t.organization}</div>
                </div>
              </div>
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
