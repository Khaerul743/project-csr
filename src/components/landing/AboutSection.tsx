"use client";

import React from "react";
import {
  Building2,
  Users2,
  HeartHandshake,
  CheckCircle2,
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
              Menjembatani Niat Baik Perusahaan dengan Realitas Kebutuhan Masyarakat.
            </h2>

            <p className="text-base sm:text-lg text-[#47464F] leading-relaxed">
              Selama bertahun-tahun, inisiatif CSR sering kali terhambat oleh laporan yang bersifat seremonial, data yang tercecer, dan minimnya transparansi bukti lapangan. SIPENA hadir untuk merevolusi ekosistem tersebut.
            </p>
          </div>
        </ScrollReveal>

        {/* Problem vs Solution Narrative Comparison */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card Masalah Klasik */}
          <ScrollReveal animation="fade-right" delay={150} className="h-full">
            <div className="p-8 sm:p-10 rounded-2xl bg-[#F4F4F6] border border-[#C8C5D0]/60 space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#BA1A1A]/10 text-[#BA1A1A] flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3
                  className="text-xl sm:text-2xl font-bold text-[#181343]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Tantangan Tata Kelola CSR Tradisional
                </h3>
                <p className="text-sm text-[#47464F] leading-relaxed">
                  Banyak program sosial terhenti pada penyerahan simbolis tanpa evaluasi jangka panjang, menyulitkan tim kepatuhan dan manajemen dalam mengukur laba sosial investasi (*Social Return on Investment*).
                </p>
              </div>

              <ul className="space-y-3 pt-4 border-t border-[#C8C5D0]/50 text-sm text-[#47464F]">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A] mt-2 shrink-0" />
                  <span>Dokumen proposal manual berbelit dan sulit didekonstruksi menjadi rencana kerja operasional lapangan.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A] mt-2 shrink-0" />
                  <span>Foto kegiatan diunggah acak tanpa verifikasi geolokasi atau kejelasan tahapan yang telah dilalui.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A] mt-2 shrink-0" />
                  <span>Klaim dampak ESG sering bersifat perkiraan tanpa validasi langsung dari warga penerima manfaat.</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>

          {/* Card Pendekatan SIPENA */}
          <ScrollReveal animation="fade-left" delay={250} className="h-full">
            <div className="p-8 sm:p-10 rounded-2xl bg-[#181343] text-white border border-[#26224C] space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3
                  className="text-xl sm:text-2xl font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Pendekatan SIPENA: Purpose-Driven System
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Platform berbasis akuntabilitas penuh yang mengotomasi kurasi proposal dengan AI, mengunci keabsahan bukti lapangan, dan memastikan setiap rupiah berbuah dampak terukur.
                </p>
              </div>

              <ul className="space-y-3 pt-4 border-t border-white/10 text-sm text-slate-200 relative z-10">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Dekonstruksi Cerdas (AI):</strong> AI mengekstrak proposal PDF menjadi tahapan kerja, alokasi anggaran, dan target KPI yang terstruktur rapi.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pencairan Kas Faktual:</strong> Dana dicairkan bertahap berdasarkan pemenuhan berkas foto GPS dan nota belanja yang diaudit.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Survei Kepuasan Publik:</strong> Warga menilai dampak nyata program secara langsung melalui tautan dan QR code publik tanpa login.</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>

        {/* 3 Strategic Pillars Cards */}
        <div className="mt-16 sm:mt-20">
          <ScrollReveal animation="fade-up" delay={50}>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3
                className="text-2xl sm:text-3xl font-extrabold text-[#181343]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Tiga Nilai Fondasi Institusional
              </h3>
              <p className="text-sm text-[#47464F] mt-2">
                Prinsip yang kami tanamkan pada setiap alur transaksi data dan kemitraan di SIPENA.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer staggerDelay={140} baseDelay={100} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#FFFFFF] border border-[#C8C5D0]/80 shadow-2xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold">
                01
              </div>
              <h4 className="text-base font-bold text-[#181343]">
                Integritas & Akuntabilitas Finansial
              </h4>
              <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
                Penyaluran dana dibagi dalam termin terukur yang hanya dapat dicairkan setelah bukti penggunaan belanja fisik dan nota resmi divalidasi oleh perusahaan sponsor.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FFFFFF] border border-[#C8C5D0]/80 shadow-2xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                02
              </div>
              <h4 className="text-base font-bold text-[#181343]">
                Kemitraan Setara & Berdaya
              </h4>
              <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
                Yayasan dan komunitas lokal diposisikan sebagai mitra strategis dengan portofolio terverifikasi, memungkinkan mereka membangun rekam jejak profesional di mata korporasi.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FFFFFF] border border-[#C8C5D0]/80 shadow-2xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold">
                03
              </div>
              <h4 className="text-base font-bold text-[#181343]">
                Pengukuran Dampak Nyata (ESG & SDGs)
              </h4>
              <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
                Setiap rupiah dan aksi sosial ditransformasikan menjadi indikator capaian SDG 1–17 dan pilar ESG yang siap diaudit serta dicantumkan dalam Laporan Keberlanjutan tahunan.
              </p>
            </div>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
