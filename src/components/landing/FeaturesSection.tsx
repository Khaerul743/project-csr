"use client";

import React from "react";
import {
  Sparkles,
  Camera,
  Layers,
  DollarSign,
  QrCode,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FeaturesSection() {
  return (
    <section id="fitur" className="py-20 lg:py-28 bg-[#F9F9FB] relative overflow-hidden border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" delay={50}>
          <div className="pb-12 sm:pb-14 border-b border-[#E5E7EB] space-y-4">
            <div>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#181343]/5 text-[#181343] text-xs font-bold tracking-wide uppercase border border-[#181343]/10">
                Fitur Tata Kelola
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column (Headline ~55%) */}
              <div className="lg:col-span-7">
                <h2
                  className="text-2xl sm:text-3xl lg:text-[38px] font-extrabold tracking-tight text-[#181343] leading-[1.25]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Instrumen Digital untuk Pengelolaan CSR yang Terukur &amp; Kredibel
                </h2>
              </div>

              {/* Right Column (Description ~45%) */}
              <div className="lg:col-span-5">
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  Fitur SIPENA dirancang untuk menyederhanakan alur kerja administratif, memperkuat integritas data lapangan, dan memenuhi standar audit keberlanjutan.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature Bento Grid (Varied Asymmetrical Layout) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Feature 1: AI Proposal Extractor (Large Hero Bento Card - 7 Cols) */}
          <ScrollReveal animation="fade-right" delay={100} className="md:col-span-7 h-full">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#181343] text-white border border-[#26224C] shadow-lg flex flex-col justify-between relative overflow-hidden group h-full">
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ekstraksi Otomatis PDF &amp; RAB Proposal</span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-white leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Konversi Dokumen Usulan Menjadi Milestone Terjadwal
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  Membedah dokumen proposal tebal menjadi tahapan kegiatan sekuensial lengkap dengan panduan bukti verifikasi wajib, alokasi anggaran per pos, dan target indikator pencapaian.
                </p>
              </div>

              {/* Visual Interactive Mockup Card */}
              <div className="mt-8 p-4.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 relative z-10">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Struktur Tahapan Program
                  </span>
                  <span className="text-[11px] text-emerald-300 font-mono font-bold">
                    4 Milestone Tervalidasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-emerald-400 font-bold block">Tahap 1: Sosialisasi &amp; Asesmen</span>
                    <span className="text-slate-300 line-clamp-1">Foto rembug warga &amp; daftar hadir</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-teal-300 font-bold block">Tahap 2: Pengadaan &amp; Distribusi</span>
                    <span className="text-slate-300 line-clamp-1">Surat jalan logistik &amp; nota belanja fisik</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 2: Real-time Field Evidence Journal (5 Cols) */}
          <ScrollReveal animation="fade-left" delay={200} className="md:col-span-5 h-full">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#181343]/5 text-[#181343] flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#181343]" />
                </div>

                <h3
                  className="text-xl sm:text-2xl font-bold text-[#181343]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Jurnal &amp; Bukti Visual Lapangan
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Mitra mengunggah foto progres riil, data warga terjangkau, dan dokumen BAST pada setiap tahapan kegiatan. Perusahaan dapat memverifikasi atau meminta klarifikasi secara langsung.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-[#181343]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Anti-Klaim Fiktif
                </span>
                <span>Foto Multi-Slot &amp; Koordinat GPS</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 3: Realisasi Dana Bertahap (4 Cols) */}
          <ScrollReveal animation="fade-up" delay={100} className="md:col-span-4 h-full">
            <div className="p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>

                <h3 className="text-lg font-bold text-[#181343]">
                  Realisasi Dana Bertahap &amp; Audit Nota
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Anggaran program disalurkan per termin. Mitra wajib mengunggah nota kwitansi fisik sebelum termin berikutnya dicairkan, menjamin serapan dana 100% akuntabel.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F4F6] text-[11px] font-mono text-[#181343] font-semibold flex items-center justify-between mt-4">
                <span>Termin Penyaluran</span>
                <span className="text-emerald-700">Verifikasi Per Nota</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 4: Pemetaan Otomatis SDGs & ESG (4 Cols) */}
          <ScrollReveal animation="fade-up" delay={200} className="md:col-span-4 h-full">
            <div className="p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-[#181343]/10 text-[#181343] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#181343]" />
                </div>

                <h3 className="text-lg font-bold text-[#181343]">
                  Penyelarasan 17 SDGs &amp; 3 Pilar ESG
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Setiap inisiatif dipetakan ke target Tujuan Pembangunan Berkelanjutan (SDGs) dan pilar Environmental, Social, &amp; Governance untuk kebutuhan pelaporan keberlanjutan dan evaluasi dampak ESG.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F4F6] text-[11px] text-[#181343] font-semibold flex items-center justify-between mt-4">
                <span>Pilar Keberlanjutan</span>
                <span className="text-emerald-700 font-bold">17 SDGs &amp; Pilar ESG</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 5: Public Beneficiary Review Channel (4 Cols) */}
          <ScrollReveal animation="fade-up" delay={300} className="md:col-span-4 h-full">
            <div className="p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-teal-600" />
                </div>

                <h3 className="text-lg font-bold text-[#181343]">
                  Survei Penerima Manfaat Tanpa Hambatan
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Masyarakat penerima manfaat dapat memberikan penilaian kepuasan langsung melalui QR Code di lokasi kegiatan tanpa kewajiban registrasi akun.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F4F6] text-[11px] text-[#181343] font-semibold flex items-center justify-between mt-4">
                <span>Akses Warga</span>
                <span className="text-teal-700 font-bold">Pemindaian QR Bebas Login</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
