"use client";

import React from "react";
import {
  Building2,
  Users2,
  HeartHandshake,
  FileText,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Camera,
  TrendingUp,
  Star,
  ShieldCheck,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface WorkflowStep {
  num: string;
  title: string;
  description: string;
}

const STEPS: WorkflowStep[] = [
  {
    num: "01",
    title: "Perencanaan Program",
    description:
      "Perusahaan memetakan prioritas wilayah dan membuka peluang inisiatif CSR terarah.",
  },
  {
    num: "02",
    title: "Kemitraan & Persetujuan",
    description:
      "Mitra menyusun usulan proposal kegiatan dan menyepakati perjanjian kemitraan resmi.",
  },
  {
    num: "03",
    title: "Pelaksanaan & Monitoring",
    description:
      "Pelaksanaan lapangan dipantau secara berkala melalui dokumentasi dan serapan dana.",
  },
  {
    num: "04",
    title: "Evaluasi & Dampak",
    description:
      "Penerima manfaat memberikan penilaian langsung untuk laporan akhir siap audit.",
  },
];

export function WorkflowSection() {
  return (
    <section
      id="cara-kerja"
      className="min-h-[calc(100vh-4.5rem)] lg:min-h-[calc(100dvh-4.5rem)] flex flex-col justify-center py-10 sm:py-12 lg:py-14 bg-gradient-to-b from-[#F8FAFF] via-[#F4F8FE] to-[#F7FAFF] relative overflow-hidden scroll-mt-[72px]"
    >
      {/* ========================================================================= */}
      {/* ATMOSPHERIC AURA MESH GRADIENTS (MATCHING REFERENCE DESIGN)               */}
      {/* ========================================================================= */}
      {/* Right Flank Soft Sky-Blue Diffusion */}
      <div className="absolute top-1/4 -right-40 w-[600px] sm:w-[750px] h-[600px] sm:h-[750px] bg-gradient-to-bl from-[#C8E5FD]/55 via-[#DCEFFF]/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Left Flank Soft Powder-Indigo Diffusion */}
      <div className="absolute bottom-1/4 -left-40 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] bg-gradient-to-tr from-[#DDD8FE]/35 via-[#E2ECFF]/50 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Ambient Central Luminous Highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/60 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* ========================================================================= */}
        {/* 1. SECTION HEADER (CLEAN & CENTERED, NO '//' ACCENT)                      */}
        {/* ========================================================================= */}
        <ScrollReveal animation="fade-up" delay={30}>
          <div className="max-w-3xl mx-auto text-center space-y-2.5">
            <div className="text-xs font-bold tracking-widest text-[#1765F5] uppercase">
              Alur Interaksi &amp; Siklus Program
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#0A2558] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Empat Langkah Menuju <br className="hidden sm:block" />
              <span className="text-[#1765F5]">Program CSR yang Akuntabel</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto mt-1.5">
              Dari pembukaan inisiatif hingga verifikasi dampak akhir, setiap tahapan terintegrasi secara transparan dan mudah dipantau.
            </p>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* 2. 4-STEP ILLUSTRATED MOCKUP FLOW (CLEAN, UNIFIED, EXACT REFERENCE LOOK)  */}
        {/* ========================================================================= */}
        <div className="mt-14 sm:mt-16 lg:mt-20 relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-6 xl:gap-8 relative">
            {STEPS.map((st, idx) => (
              <ScrollReveal
                key={st.num}
                animation="fade-up"
                delay={60 + idx * 60}
                className="flex flex-col items-center text-center group relative"
              >
                {/* Wavy Dotted SVG Connector to next card (Desktop only, for items 0, 1, 2) */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute -right-5 xl:-right-7 top-[72px] -translate-y-1/2 w-10 xl:w-14 h-6 z-20 pointer-events-none text-sky-400">
                    <svg
                      viewBox="0 0 60 20"
                      fill="none"
                      className="w-full h-full"
                    >
                      <path
                        d="M 2 10 C 16 0, 24 20, 38 10 C 45 4, 52 16, 58 10"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeDasharray="4 4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Illustrated Mockup Card Container with Soft Atmospheric Blue Glow */}
                <div className="relative mb-6">
                  {/* Atmospheric Radial Blue Glow Behind Card (Exact Reference Look) */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#38BDF8]/25 via-[#1765F5]/18 to-transparent rounded-3xl blur-2xl -z-10 scale-95 transition-all duration-300 group-hover:scale-115 group-hover:from-[#38BDF8]/35 group-hover:via-[#1765F5]/25 pointer-events-none" />

                  {/* STEP 1 MOCKUP: Perencanaan Program */}
                  {idx === 0 && (
                    <div className="relative w-48 sm:w-52 h-36 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 flex flex-col justify-between p-3.5 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                      {/* Floating Top Badge */}
                      <div className="absolute -top-3.5 right-4 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#43A5FF] to-[#1765F5] text-white text-[10px] font-bold shadow-md shadow-[#1765F5]/25 flex items-center gap-1 select-none">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inisiasi</span>
                      </div>

                      {/* Header: Company Avatar + Placeholder Bars */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1765F5] shrink-0">
                          <Building2 className="w-4.5 h-4.5" />
                        </div>
                        <div className="space-y-1 text-left">
                          <div className="w-20 h-2.5 bg-slate-200 rounded-full" />
                          <div className="w-14 h-2 bg-slate-100 rounded-full" />
                        </div>
                      </div>

                      {/* Middle: Target Milestone Pill */}
                      <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600">Milestone 1</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1765F5]">Siap Review</span>
                      </div>

                      {/* Bottom: Budget Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                          <span>Alokasi RAB</span>
                          <span className="text-[#0A2558] font-bold">100% Valid</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-gradient-to-r from-[#43A5FF] to-[#1765F5] rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 MOCKUP: Kemitraan & Persetujuan */}
                  {idx === 1 && (
                    <div className="relative w-48 sm:w-52 h-36 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 flex flex-col justify-between p-3.5 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                      {/* Floating Top Avatars: Company & Partner */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 select-none">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Building2 className="w-3 h-3" />
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-[#1765F5] text-white flex items-center justify-center shadow-xs">
                          <Users2 className="w-3 h-3" />
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-sky-400 text-white flex items-center justify-center shadow-xs">
                          <HeartHandshake className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Top Badge: Verified Check */}
                      <div className="flex justify-between items-center select-none pt-0.5">
                        <span className="text-[10.5px] font-black text-[#0A2558]">MoU Kerja Sama</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Disepakati</span>
                        </span>
                      </div>

                      {/* Middle: MoU Document Lines */}
                      <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-2 space-y-1.5 text-left">
                        <div className="w-full h-2 bg-slate-200 rounded-full" />
                        <div className="w-4/5 h-1.5 bg-slate-100 rounded-full" />
                      </div>

                      {/* Bottom: Approval CTA Bar */}
                      <div className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs select-none">
                        <span>PKS Terverifikasi</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  )}

                  {/* STEP 3 MOCKUP: Pelaksanaan & Monitoring */}
                  {idx === 2 && (
                    <div className="relative w-48 sm:w-52 h-36 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 flex flex-col justify-between p-3.5 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                      {/* Floating Top Badge: Geo-tagging */}
                      <div className="absolute -top-3.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs text-[9px] font-bold flex items-center gap-1 select-none">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>Live GPS</span>
                      </div>

                      {/* Header: Field Camera + Real-time Tag */}
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-[#1765F5] shrink-0">
                          <Camera className="w-4.5 h-4.5" />
                        </div>
                        <div className="space-y-0.5 min-w-0 text-left">
                          <span className="text-[10px] font-bold text-[#0A2558] block truncate">Log Lapangan</span>
                          <div className="flex items-center gap-1 text-[8.5px] text-emerald-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Foto &amp; Titik Valid</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Realisasi Dana Status */}
                      <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                        <span className="text-[9.5px] font-bold text-slate-600">Realisasi Dana</span>
                        <span className="text-[9.5px] font-extrabold text-[#1765F5]">Termin 2 / 3</span>
                      </div>

                      {/* Bottom: Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-gradient-to-r from-[#43A5FF] to-[#1765F5] rounded-full" />
                      </div>
                    </div>
                  )}

                  {/* STEP 4 MOCKUP: Evaluasi & Dampak */}
                  {idx === 3 && (
                    <div className="relative w-48 sm:w-52 h-36 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 flex flex-col justify-between p-3.5 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                      {/* Floating Top-Left Badge: TrendingUp */}
                      <div className="absolute -top-3.5 left-3 px-2 py-0.5 rounded-xl bg-white border border-slate-200/80 text-[#1765F5] shadow-xs text-[9px] font-bold flex items-center gap-1 select-none">
                        <TrendingUp className="w-3 h-3 text-[#1765F5]" />
                        <span>Dampak</span>
                      </div>

                      {/* Floating Top-Right Badge: 100% Audit */}
                      <div className="absolute -top-3.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#43A5FF] to-[#1765F5] text-white shadow-xs text-[9px] font-bold select-none">
                        <span>100% Audit</span>
                      </div>

                      {/* Header: Analytics Bar Chart */}
                      <div className="flex items-end justify-between px-3 pt-3 h-14 gap-2.5">
                        <div className="w-1/4 h-6 bg-blue-100 rounded-t-sm" />
                        <div className="w-1/4 h-9 bg-blue-200 rounded-t-sm" />
                        <div className="w-1/4 h-11 bg-gradient-to-t from-[#1765F5] to-[#43A5FF] rounded-t-sm" />
                        <div className="w-1/4 h-14 bg-gradient-to-t from-[#0A2558] to-[#1765F5] rounded-t-sm" />
                      </div>

                      {/* Bottom: Beneficiary Rating & Audit Pill */}
                      <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-100 rounded-lg px-2 py-1 text-[9px] font-bold text-emerald-700">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Siap Audit</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>4.9</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step Title (Title Case, Bold Navy) */}
                <h3
                  className="text-base sm:text-lg font-bold text-[#0A2558] mb-1.5 leading-snug group-hover:text-[#1765F5] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {st.title}
                </h3>

                {/* Step Description (Unified Narrative, Balanced 2 Lines) */}
                <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-[225px] sm:max-w-[245px] mx-auto min-h-[38px] sm:min-h-[42px]">
                  {st.description}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
