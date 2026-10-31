"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Camera,
  Layers,
  DollarSign,
  MessageSquare,
  QrCode,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<"ai" | "monitoring" | "finance" | "survey">("ai");

  return (
    <section id="fitur" className="py-20 lg:py-28 bg-[#F9F9FB] relative overflow-hidden border-t border-[#EEEEF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" delay={50}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#C8C5D0]/60">
            <div className="max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full bg-[#181343]/5 text-[#181343] text-xs font-bold tracking-wide uppercase border border-[#181343]/10">
                Fitur Platform
              </span>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#181343] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Dirancang untuk Akurasi Data, Efisiensi Eksekusi, & Integritas Bukti.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#47464F] max-w-md leading-relaxed">
              Setiap fitur dibangun dengan pendekatan tata kelola institusional yang memudahkan pekerjaan operasional mitra di lapangan sekaligus memberikan kepastian data bagi manajemen perusahaan.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Bento Grid (Varied Asymmetrical Layout) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Feature 1: AI Proposal Extractor (Large Hero Bento Card - 7 Cols) */}
          <ScrollReveal animation="fade-right" delay={100} className="md:col-span-7 h-full">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#181343] text-white border border-[#26224C] shadow-lg flex flex-col justify-between relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none transition-transform duration-500 group-hover:scale-110" />

              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Teknologi Gen-AI LangChain + OpenAI</span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-white leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Ekstraksi Otomatis Dokumen Proposal Menjadi Tahapan Kegiatan
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  Tidak perlu lagi menyusun rencana kerja manual dari puluhan halaman berkas PDF. Sistem AI kami membaca ruang lingkup, durasi, dan metodologi, lalu memecahnya menjadi tahapan sekuensial lengkap dengan panduan bukti foto wajib.
                </p>
              </div>

              {/* Visual Interactive Mockup Card */}
              <div className="mt-8 p-4.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 relative z-10">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Hasil Kurasi Tahapan AI
                  </span>
                  <span className="text-[11px] text-emerald-300 font-mono font-bold">
                    4 Tahap Terstruktur
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-emerald-400 font-bold block">Tahap 1: Sosialisasi</span>
                    <span className="text-slate-300 line-clamp-1">Foto rembug warga & daftar hadir</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-teal-300 font-bold block">Tahap 2: Pengadaan Logistik</span>
                    <span className="text-slate-300 line-clamp-1">Surat jalan barang & nota pembelian</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 2: Real-time Field Evidence Journal (5 Cols) */}
          <ScrollReveal animation="fade-left" delay={200} className="md:col-span-5 h-full">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] border border-[#C8C5D0]/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#181343]/5 text-[#181343] flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#181343]" />
                </div>

                <h3
                  className="text-xl sm:text-2xl font-bold text-[#181343]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Jurnal & Bukti Visual Lapangan
                </h3>

                <p className="text-sm text-[#47464F] leading-relaxed">
                  Mitra mengunggah foto progres riil, jumlah warga terjangkau, dan dokumen BAST pada setiap tahapan kegiatan. Perusahaan dapat memverifikasi atau meminta klarifikasi secara langsung.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-[#EEEEF0] flex items-center justify-between text-xs text-[#787680]">
                <span className="flex items-center gap-1 font-semibold text-[#181343]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Anti-Klaim Fiktif
                </span>
                <span>Foto Multi-Slot & Lightbox</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 3: Realisasi Dana Bertahap (4 Cols) */}
          <ScrollReveal animation="fade-up" delay={100} className="md:col-span-4 h-full">
            <div className="p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#C8C5D0]/80 shadow-2xs hover:shadow-md transition-all space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>

                <h3 className="text-lg font-bold text-[#181343]">
                  Realisasi Dana Bertahap & Audit Nota Belanja
                </h3>

                <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
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
            <div className="p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#C8C5D0]/80 shadow-2xs hover:shadow-md transition-all space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-[#181343]/10 text-[#181343] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#181343]" />
                </div>

                <h3 className="text-lg font-bold text-[#181343]">
                  Penyelarasan 17 SDGs & 3 Pilar ESG
                </h3>

                <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
                  Setiap inisiatif dipetakan ke target Tujuan Pembangunan Berkelanjutan (SDGs) dan pilar Environmental, Social, & Governance untuk kebutuhan Sustainability Reporting.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F4F6] text-[11px] text-[#181343] font-semibold flex items-center justify-between mt-4">
                <span>Standar Global</span>
                <span className="text-[#f6ac2f] font-bold">17 SDGs Ready</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 5: Public Beneficiary Review Channel (4 Cols) */}
          <ScrollReveal animation="fade-up" delay={300} className="md:col-span-4 h-full">
            <div className="p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#C8C5D0]/80 shadow-2xs hover:shadow-md transition-all space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-teal-600" />
                </div>

                <h3 className="text-lg font-bold text-[#181343]">
                  Survei Publik Penerima Manfaat Bebas Login
                </h3>

                <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
                  Masyarakat penerima manfaat dapat memberikan ulasan kepuasan dan testimoni langsung melalui QR Code lokasi program, dilengkapi proteksi anti-spam rate limiting.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F4F6] text-[11px] text-[#181343] font-semibold flex items-center justify-between mt-4">
                <span>Akses Warga</span>
                <span className="text-teal-700 font-bold">Via QR Code</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
