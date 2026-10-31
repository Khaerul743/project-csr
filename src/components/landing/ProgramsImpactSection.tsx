"use client";

import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingUp,
  TreePine,
  GraduationCap,
  Droplets,
  Coins,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, StaggerContainer } from "@/components/ui/scroll-reveal";

interface ProgramItem {
  id: string;
  category: "LINGKUNGAN" | "PENDIDIKAN" | "KESEHATAN" | "EKONOMI";
  categoryLabel: string;
  title: string;
  partnerName: string;
  companyName: string;
  location: string;
  sdgTag: string;
  sdgColor: string;
  impactMetrics: string;
  status: "Sedang Berjalan" | "Selesai Diverifikasi";
  statusVariant: "navy" | "emerald";
  description: string;
}

const SAMPLE_PROGRAMS: ProgramItem[] = [
  {
    id: "prog-1",
    category: "LINGKUNGAN",
    categoryLabel: "Lingkungan Hidup",
    title: "Restorasi Ekosistem & Penanaman 10.000 Bibit Mangrove",
    partnerName: "Yayasan Pesisir Lestari Bahari",
    companyName: "PT Energi Nusantara Sejahtera",
    location: "Kec. Muara Gembong, Kab. Bekasi",
    sdgTag: "SDG 13 · Penanganan Perubahan Iklim",
    sdgColor: "bg-[#3F7E44]/15 text-[#3F7E44] border-[#3F7E44]/30",
    impactMetrics: "120 Keluarga Nelayan & 4 Ha Lahan Pesisir",
    status: "Sedang Berjalan",
    statusVariant: "navy",
    description: "Rehabilitasi garis pantai dari abrasi ekstrem disertai pembibitan lokal dan edukasi penjagaan tambak hijau bersama kelompok nelayan binaan.",
  },
  {
    id: "prog-2",
    category: "PENDIDIKAN",
    categoryLabel: "Pendidikan & Literasi",
    title: "Digitalisasi Laboratorium Vokasi & Akses Internet Desa 3T",
    partnerName: "Lembaga Bina Generasi Unggul",
    companyName: "PT Telekomunikasi Mandiri Persada",
    location: "Kab. Lebak, Banten",
    sdgTag: "SDG 4 · Pendidikan Berkualitas",
    sdgColor: "bg-[#C5192D]/15 text-[#C5192D] border-[#C5192D]/30",
    impactMetrics: "450 Siswa & 24 Guru Vokasi",
    status: "Selesai Diverifikasi",
    statusVariant: "emerald",
    description: "Pengadaan 30 unit perangkat komputer, instalasi jaringan satelit internet mandiri, serta pembekalan kompetensi kecakapan digital guru daerah pelosok.",
  },
  {
    id: "prog-3",
    category: "KESEHATAN",
    categoryLabel: "Kesehatan & Sanitasi",
    title: "Pembangunan Sumur Bor Air Bersih & Sanitasi Higienis Warga",
    partnerName: "Yayasan Air Sehat Komunitas",
    companyName: "PT Manufaktur Baja Cemerlang",
    location: "Kab. Gunungkidul, D.I. Yogyakarta",
    sdgTag: "SDG 6 · Air Bersih & Sanitasi Layak",
    sdgColor: "bg-[#26BDE2]/15 text-[#007D99] border-[#26BDE2]/30",
    impactMetrics: "850 Jiwa Warga Terdampak Kekeringan",
    status: "Selesai Diverifikasi",
    statusVariant: "emerald",
    description: "Pengeboran geolistrik sedalam 90 meter, pembangunan tandon air komunal 5.000 liter, dan instalasi pipa langsung ke pemukiman warga.",
  },
  {
    id: "prog-4",
    category: "EKONOMI",
    categoryLabel: "Pemberdayaan UMKM",
    title: "Inkubasi Usaha Olahan Pesisir & Pengemasan Produk Bersih",
    partnerName: "Koperasi Pemberdayaan Pesisir Mandiri",
    companyName: "Bank Finansial Inklusi Terpadu",
    location: "Kab. Banyuwangi, Jawa Timur",
    sdgTag: "SDG 8 · Pekerjaan Layak & Pertumbuhan Ekonomi",
    sdgColor: "bg-[#A21942]/15 text-[#A21942] border-[#A21942]/30",
    impactMetrics: "60 Ibu Rumah Tangga & Pelaku Usaha Mikro",
    status: "Sedang Berjalan",
    statusVariant: "navy",
    description: "Pelatihan higienitas pengemasan vakum hasil tangkapan laut, perizinan P-IRT resmi, serta akses pemasaran rantai pasok ritel modern.",
  },
];

export function ProgramsImpactSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredPrograms =
    selectedCategory === "ALL"
      ? SAMPLE_PROGRAMS
      : SAMPLE_PROGRAMS.filter((p) => p.category === selectedCategory);

  return (
    <section id="program-dampak" className="py-20 lg:py-28 bg-[#F4F4F6] relative overflow-hidden border-t border-[#EEEEF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" delay={50}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#C8C5D0]/60">
            <div className="max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full bg-[#181343]/5 text-[#181343] text-xs font-bold tracking-wide uppercase border border-[#181343]/10">
                Program & Dampak Lapangan
              </span>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#181343] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bukti Nyata Kolaborasi Sosial yang Tercatat & Tervalidasi.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#47464F] max-w-md leading-relaxed">
              Menampilkan contoh inisiatif kemitraan yang dikelola dengan mekanisme pemantauan berjenjang, pelaporan nota faktual, dan verifikasi langsung di lapangan.
            </p>
          </div>
        </ScrollReveal>

        {/* Category Filters */}
        <ScrollReveal animation="fade-up" delay={120}>
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "bg-white text-[#47464F] hover:bg-[#EEEEF0] border border-[#C8C5D0]/70"
              }`}
            >
              Semua Program ({SAMPLE_PROGRAMS.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("LINGKUNGAN")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "LINGKUNGAN"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "bg-white text-[#47464F] hover:bg-[#EEEEF0] border border-[#C8C5D0]/70"
              }`}
            >
              <TreePine className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lingkungan Hidup</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("PENDIDIKAN")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "PENDIDIKAN"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "bg-white text-[#47464F] hover:bg-[#EEEEF0] border border-[#C8C5D0]/70"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Pendidikan & Literasi</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("KESEHATAN")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "KESEHATAN"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "bg-white text-[#47464F] hover:bg-[#EEEEF0] border border-[#C8C5D0]/70"
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              <span>Kesehatan & Sanitasi</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("EKONOMI")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "EKONOMI"
                  ? "bg-[#181343] text-white shadow-xs"
                  : "bg-white text-[#47464F] hover:bg-[#EEEEF0] border border-[#C8C5D0]/70"
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>Pemberdayaan UMKM</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Program Cards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrograms.map((prog, pIdx) => (
            <ScrollReveal
              key={prog.id}
              animation="fade-up"
              delay={100 + (pIdx % 2) * 120}
              className="h-full"
            >
              <div
                className="p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#C8C5D0]/80 shadow-2xs hover:shadow-md transition-all space-y-5 flex flex-col justify-between h-full"
              >
                <div className="space-y-3.5">
                  {/* Meta Row: Status & SDG Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border ${prog.sdgColor}`}
                    >
                      {prog.sdgTag}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        prog.statusVariant === "emerald"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-[#181343]/10 text-[#181343] border border-[#181343]/20"
                      }`}
                    >
                      {prog.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#181343] leading-snug">
                    {prog.title}
                  </h3>

                  {/* Narrative description */}
                  <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
                    {prog.description}
                  </p>

                  {/* Sponsoring Companies & NGO Partner */}
                  <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#EEEEF0] text-xs space-y-1.5 text-[#47464F]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#787680]">Mitra Pelaksana:</span>
                      <strong className="text-[#181343]">{prog.partnerName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#787680]">Sponsor Utama:</span>
                      <strong className="text-[#181343]">{prog.companyName}</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Location & Metrics */}
                <div className="pt-4 border-t border-[#EEEEF0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#787680]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{prog.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold text-[#181343]">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>{prog.impactMetrics}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
