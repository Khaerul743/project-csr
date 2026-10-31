"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Globe2,
  FileCheck2,
  ArrowUpRight,
  ChevronRight,
  Heart,
  ExternalLink,
} from "lucide-react";

export function LandingFooter() {
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      const top = element.offsetTop - 76;
      window.scrollTo({
        top: top >= 0 ? top : 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="bg-[#181343] text-white border-t border-white/10 relative overflow-hidden">
      {/* Subtle architectural grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(#FFFFFF 1px, transparent 1px), radial-gradient(#FFFFFF 1px, #181343 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      />

      {/* Main Footer Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand Column (Col 1-5) */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="#beranda" onClick={(e) => scrollToSection(e, "#beranda")} className="inline-flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center">
                <Image
                  src="/LOGO SIPENA.png"
                  alt="Logo SIPENA"
                  width={38}
                  height={38}
                  className="object-contain"
                />
              </div>
              <div>
                <span
                  className="text-2xl font-extrabold tracking-tight text-white leading-none block"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  SIPENA
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 tracking-wide block mt-1">
                  Mencatat Aksi, Mengukur Dampak
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR (SIPENA) adalah platform tata kelola terintegrasi yang menghubungkan korporasi, yayasan pelaksana, dan komunitas publik berbasis akuntabilitas, pembuktian lapangan terverifikasi, dan metrik keberlanjutan ESG.
            </p>

            {/* Compliance & Standards Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>POJK 51 Selaras</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                <span>17 SDGs Framework</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>ISO 26000 CSR</span>
              </div>
            </div>
          </div>

          {/* Quick Nav (Col 6-7) */}
          <div className="lg:col-span-2 space-y-4">
            <h4
              className="text-xs font-bold uppercase tracking-wider text-slate-400"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a
                  href="#beranda"
                  onClick={(e) => scrollToSection(e, "#beranda")}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                  <span>Beranda</span>
                </a>
              </li>
              <li>
                <a
                  href="#tentang-kami"
                  onClick={(e) => scrollToSection(e, "#tentang-kami")}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                  <span>Tentang Kami</span>
                </a>
              </li>
              <li>
                <a
                  href="#fitur"
                  onClick={(e) => scrollToSection(e, "#fitur")}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                  <span>Fitur Utama</span>
                </a>
              </li>
              <li>
                <a
                  href="#cara-kerja"
                  onClick={(e) => scrollToSection(e, "#cara-kerja")}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                  <span>Cara Kerja</span>
                </a>
              </li>
              <li>
                <a
                  href="#program-dampak"
                  onClick={(e) => scrollToSection(e, "#program-dampak")}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                  <span>Program & Dampak</span>
                </a>
              </li>
              <li>
                <a
                  href="#testimoni"
                  onClick={(e) => scrollToSection(e, "#testimoni")}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                  <span>Testimoni Ekosistem</span>
                </a>
              </li>
              <li>
                <a
                  href="#kontak"
                  onClick={(e) => scrollToSection(e, "#kontak")}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                  <span>Kontak & Kemitraan</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Portal Access (Col 8-9) */}
          <div className="lg:col-span-2 space-y-4">
            <h4
              className="text-xs font-bold uppercase tracking-wider text-slate-400"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Akses Portal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  <span>Masuk Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  <span>Registrasi Perusahaan</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  <span>Registrasi Yayasan / NGO</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/programs"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  <span>Eksplorasi Proposal</span>
                </Link>
              </li>
              <li>
                <a
                  href="mailto:kemitraan@sipena.id"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  <span>Permintaan Audit ESG</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Institutional Integrity & Legal Column (Col 10-12) */}
          <div className="lg:col-span-3 space-y-4">
            <h4
              className="text-xs font-bold uppercase tracking-wider text-slate-400"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Integritas & Akuntabilitas
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Whistleblowing & Tata Kelola
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                SIPENA mengadopsi standar zero-tolerance terhadap manipulasi anggaran dan laporan palsu. Seluruh bukti foto dan nota diaudit secara terdesentralisasi.
              </p>
              <div className="pt-1">
                <a
                  href="mailto:integritas@sipena.id"
                  className="text-[11px] font-semibold text-emerald-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Laporkan Indikasi Pelanggaran</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>
              &copy; 2026 SIPENA. Hak Cipta Dilindungi Undang-Undang.
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-400">
              Sistem Informasi Pengelolaan & Evaluasi Nilai Aksi CSR
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <a
              href="#beranda"
              onClick={(e) => scrollToSection(e, "#beranda")}
              className="hover:text-slate-200 transition-colors"
            >
              Privasi & Keamanan Data
            </a>
            <span>•</span>
            <a
              href="#beranda"
              onClick={(e) => scrollToSection(e, "#beranda")}
              className="hover:text-slate-200 transition-colors"
            >
              Pedoman Kepatuhan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
