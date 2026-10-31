"use client";

import React, { useState } from "react";
import {
  Building2,
  Users2,
  HeartHandshake,
  FileCheck2,
  Sparkles,
  DollarSign,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { ScrollReveal, StaggerContainer } from "@/components/ui/scroll-reveal";

type RolePerspective = "company" | "partner" | "community";

export function WorkflowSection() {
  const [role, setRole] = useState<RolePerspective>("company");

  const steps = [
    {
      num: "01",
      title: "Inisiasi Program & Pengajuan",
      companyText: "Perusahaan mempublikasikan inisiatif CSR dengan alokasi anggaran, target kota sasaran, dan pilar ESG yang diinginkan.",
      partnerText: "Yayasan/NGO menemukan peluang kemitraan yang relevan dan mengajukan proposal resmi lengkap dengan dokumen legalitas.",
      communityText: "Kebutuhan mendesak wilayah teridentifikasi melalui pemetaan awal kebutuhan warga setempat.",
      tag: "Fase Awal",
    },
    {
      num: "02",
      title: "Kurasi AI & Finalisasi MoU",
      companyText: "Sistem AI merekomendasikan tahapan kerja logis; perusahaan dan mitra menyepakati nilai MoU dan target capaian.",
      partnerText: "Mitra meninjau draf tahapan hasil ekstraksi AI, menyelaraskan linimasa kerja, dan menandatangani kesepakatan.",
      communityText: "Tokoh masyarakat dilibatkan dalam rembug warga awal penentuan zonasi dan daftar penerima manfaat.",
      tag: "Kesepakatan",
    },
    {
      num: "03",
      title: "Penyaluran Bertahap & Aksi Lapangan",
      companyText: "Pencairan dana dilakukan bertahap per termin berdasarkan verifikasi bukti pemakaian termin sebelumnya.",
      partnerText: "Mitra mengeksekusi kegiatan riil di lapangan dan mengunggah foto progres serta nota belanja fisik secara berkala.",
      communityText: "Masyarakat menerima manfaat langsung (alat, bibit, pelatihan, renovasi sanitasi, atau fasilitas umum).",
      tag: "Eksekusi Riil",
    },
    {
      num: "04",
      title: "Verifikasi, Survei Warga & Laporan Dampak",
      companyText: "Manajemen memvalidasi keabsahan dokumen BAST dan mengunduh laporan dampak ESG untuk Laporan Keberlanjutan.",
      partnerText: "Mitra memperoleh riwayat kinerja terverifikasi dan testimoni resmi dari perusahaan sponsor.",
      communityText: "Warga memindai QR code di lokasi untuk memberikan ulasan kepuasan dan testimoni independen.",
      tag: "Evaluasi & Dampak",
    },
  ];

  return (
    <section id="cara-kerja" className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" delay={50}>
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-[#181343]/5 text-[#181343] text-xs font-bold tracking-wide uppercase border border-[#181343]/10">
              Alur Interaksi & Siklus Program
            </span>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#181343] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Empat Langkah Menuju Program CSR yang Akuntabel.
            </h2>

            <p className="text-sm sm:text-base text-[#47464F] leading-relaxed">
              Dari pembukaan inisiatif hingga verifikasi dampak akhir—setiap pihak memiliki peran transparan yang saling terhubung dalam satu ekosistem.
            </p>
          </div>
        </ScrollReveal>

        {/* Interactive Role Perspective Switcher */}
        <ScrollReveal animation="fade-up" delay={150}>
          <div className="mt-10 flex items-center justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-[#F4F4F6] border border-[#C8C5D0]/60 max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setRole("company")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  role === "company"
                    ? "bg-[#181343] text-white shadow-xs"
                    : "text-[#47464F] hover:text-[#181343]"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Sudut Pandang Perusahaan</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("partner")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  role === "partner"
                    ? "bg-[#181343] text-white shadow-xs"
                    : "text-[#47464F] hover:text-[#181343]"
                }`}
              >
                <Users2 className="w-4 h-4" />
                <span>Sudut Pandang Yayasan / NGO</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("community")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  role === "community"
                    ? "bg-[#181343] text-white shadow-xs"
                    : "text-[#47464F] hover:text-[#181343]"
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Masyarakat Penerima Manfaat</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* 4-Step Progressive Timeline Cards */}
        <StaggerContainer
          staggerDelay={120}
          baseDelay={100}
          className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {steps.map((st, idx) => (
            <div
              key={st.num}
              className="p-6 sm:p-7 rounded-2xl border border-[#C8C5D0]/80 bg-[#FFFFFF] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-[#181343] text-white font-extrabold text-sm flex items-center justify-center">
                    {st.num}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold">
                    {st.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#181343] leading-snug">
                  {st.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
                  {role === "company" && st.companyText}
                  {role === "partner" && st.partnerText}
                  {role === "community" && st.communityText}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EEEEF0] flex items-center justify-between text-[11px] text-[#787680]">
                <span className="font-medium">Tahap {idx + 1} dari 4</span>
                {idx < 3 ? (
                  <ArrowRight className="w-3.5 h-3.5 text-[#181343]/40 group-hover:translate-x-1 transition-transform" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
