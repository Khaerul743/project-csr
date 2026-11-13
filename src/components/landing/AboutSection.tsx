"use client";

import React from "react";
import {
  Building2,
  Users2,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Target,
  Sparkles,
} from "lucide-react";
import { ScrollReveal, StaggerContainer } from "@/components/ui/scroll-reveal";

export function AboutSection() {
  return (
    <section id="tentang-kami" className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" delay={50}>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181343]/5 text-[#181343] text-xs font-bold tracking-wide uppercase border border-[#181343]/10">
              <span>Tentang SIPENA</span>
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#181343] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Menjembatani Niat Baik Perusahaan dengan Realitas Kebutuhan Masyarakat
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Menentukan kebutuhan masyarakat, membangun kemitraan yang tepat, dan mengevaluasi dampak program CSR bukanlah proses yang sederhana. SIPENA hadir untuk membantu menghubungkan seluruh tahapan tersebut dalam satu platform terintegrasi.
            </p>
          </div>
        </ScrollReveal>

        {/* Problem vs Solution Narrative Comparison */}
        <div className="mt-10 sm:mt-14 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card Tantangan Pengelolaan CSR */}
          <ScrollReveal animation="fade-right" delay={150} className="h-full">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#F9F9FB] border border-[#E5E7EB] flex flex-col justify-between h-full shadow-2xs">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FDE8E8] flex items-center justify-center text-[#E02424] mb-4 sm:mb-5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold text-[#181343]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Tantangan Tata Kelola CSR
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">
                  Pengelolaan program sosial konvensional sering terkendala proses manual yang memperbesar risiko ketidaksesuaian sasaran dan keterlambatan pelaporan.
                </p>
              </div>

              <div className="my-5 sm:my-6 h-px bg-[#E5E7EB]" />

              <div className="space-y-4 sm:space-y-5">
                <div>
                  <h4 className="text-[15px] font-bold text-[#181343]">
                    Prioritas Kebutuhan Terfragmentasi
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1">
                    Ketiadaan data kebutuhan wilayah terpusat membuat program CSR kerap tumpang tindih dan kurang menyentuh sasaran yang paling mendesak.
                  </p>
                </div>

                <div>
                  <h4 className="text-[15px] font-bold text-[#181343]">
                    Standardisasi Proposal &amp; RAB
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1">
                    Format rencana anggaran biaya dari mitra pelaksana yang beragam menyulitkan due diligence dan kepatuhan audit internal perusahaan.
                  </p>
                </div>

                <div>
                  <h4 className="text-[15px] font-bold text-[#181343]">
                    Verifikasi Bukti Lapangan &amp; LPJ
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1">
                    Rekapitulasi nota belanja fisik dan foto kegiatan sering tercecer, menyulitkan penyusunan Laporan Keberlanjutan dan evaluasi akuntabilitas program.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card Pendekatan SIPENA */}
          <ScrollReveal animation="fade-left" delay={250} className="h-full">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#181343] text-white border border-[#26224C] flex flex-col justify-between h-full shadow-lg">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0F382C] flex items-center justify-center text-[#34D399] mb-4 sm:mb-5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Solusi Tata Kelola SIPENA
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mt-2">
                  SIPENA mengintegrasikan seluruh siklus kemitraan CSR dalam alur digital terstruktur yang transparan dan dapat diaudit setiap saat.
                </p>
              </div>

              <div className="my-5 sm:my-6 h-px bg-white/10" />

              <div className="space-y-4 sm:space-y-5">
                <div>
                  <h4 className="text-[15px] font-bold text-white">
                    Pemetaan Prioritas Berbasis Data
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mt-1">
                    Menganalisis indikator kebutuhan wilayah untuk mengarahkan alokasi program ke sektor dan kelompok sasaran yang paling tepat.
                  </p>
                </div>

                <div>
                  <h4 className="text-[15px] font-bold text-white">
                    Standardisasi Rencana Anggaran &amp; Milestone
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mt-1">
                    Ekstraksi otomatis ruang lingkup kegiatan dari berkas proposal menjadi tahapan terstruktur dengan rincian biaya yang transparan.
                  </p>
                </div>

                <div>
                  <h4 className="text-[15px] font-bold text-white">
                    Audit Realisasi Bertahap &amp; Kepatuhan ESG
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mt-1">
                    Penyaluran dana berbasis verifikasi nota fisik per termin, pemantauan foto berkoordinat, dan pemetaan otomatis ke 17 SDGs.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ASA: Fondasi di Balik Setiap Aksi */}
        <div className="mt-16 sm:mt-20 max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up" delay={50}>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide uppercase border border-emerald-200/80">
                <span>Nilai Utama SIPENA</span>
              </div>
              <h3
                className="text-2xl sm:text-3xl font-extrabold text-[#181343]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ASA: Fondasi di Balik Setiap Aksi
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Tiga nilai yang menjadi landasan SIPENA dalam mewujudkan pengelolaan CSR yang lebih terarah, kolaboratif, dan akuntabel.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer staggerDelay={140} baseDelay={100} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Arah */}
            <div className="p-7 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all flex flex-col justify-start space-y-4 group h-full">
              <div
                className="w-12 h-12 rounded-2xl bg-[#181343] text-white flex items-center justify-center font-extrabold text-2xl shadow-xs group-hover:bg-emerald-600 transition-colors duration-200"
                style={{ fontFamily: "var(--font-display)" }}
              >
                A
              </div>
              <div className="space-y-2">
                <h4
                  className="text-lg sm:text-xl font-bold text-[#181343]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Arah
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menentukan prioritas program CSR berdasarkan kebutuhan masyarakat, kondisi wilayah, dan informasi yang relevan untuk mendukung perencanaan tepat sasaran.
                </p>
              </div>
            </div>

            {/* Card 2: Sinergi */}
            <div className="p-7 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all flex flex-col justify-start space-y-4 group h-full">
              <div
                className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-xs group-hover:bg-[#181343] transition-colors duration-200"
                style={{ fontFamily: "var(--font-display)" }}
              >
                S
              </div>
              <div className="space-y-2">
                <h4
                  className="text-lg sm:text-xl font-bold text-[#181343]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Sinergi
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menghubungkan perusahaan dengan NGO, yayasan, dan komunitas untuk membangun kemitraan serta koordinasi program CSR yang lebih efektif.
                </p>
              </div>
            </div>

            {/* Card 3: Akuntabilitas */}
            <div className="p-7 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all flex flex-col justify-start space-y-4 group h-full">
              <div
                className="w-12 h-12 rounded-2xl bg-[#181343] text-white flex items-center justify-center font-extrabold text-2xl shadow-xs group-hover:bg-emerald-600 transition-colors duration-200"
                style={{ fontFamily: "var(--font-display)" }}
              >
                A
              </div>
              <div className="space-y-2">
                <h4
                  className="text-lg sm:text-xl font-bold text-[#181343]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Akuntabilitas
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mendukung transparansi melalui pencatatan kegiatan lapangan, monitoring realisasi anggaran berkala, serta evaluasi hasil dan dampak program CSR secara menyeluruh.
                </p>
              </div>
            </div>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
