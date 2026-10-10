import React from "react";
import Link from "next/link";
import { Sparkles, Building2, Users2, BarChart3, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerActionText: string;
  footerActionHref: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerActionText,
  footerActionHref,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50">
      {/* Sisi Kiri: Branding Showcase & Nilai Tambah Platform (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Glow effect dekoratif di background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">
              CSR Impact Hub
            </span>
            <span className="text-xs text-emerald-400 font-medium tracking-wide">
              KOLABORASI & KEMITRAAN ESG
            </span>
          </div>
        </div>

        {/* Hero Narrative & Fitur Utama */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <Badge variant="emerald" className="mb-4 bg-emerald-950/60 text-emerald-300 border-emerald-500/30">
            Inisiatif Dampak Nyata
          </Badge>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Jembatan Kemitraan Strategis untuk Proyek CSR Berkelanjutan.
          </h1>

          <p className="text-slate-300 text-sm xl:text-base leading-relaxed mb-8">
            Hubungkan perusahaan dan mitra terverifikasi untuk menciptakan, mendanai, dan mengeksekusi program CSR yang akuntabel dan selaras dengan target SDG.
          </p>

          {/* 3 Value Pillars */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Bagi Perusahaan</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Rilis proyek CSR, alokasikan anggaran, dan temukan mitra lapangan yang kredibel.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <Users2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Bagi Mitra & Yayasan</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Akses peluang inisiatif CSR, ajukan proposal, dan wujudkan visi komunitas Anda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Pelaporan Dampak ESG</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Pantau penerima manfaat dan metrik capaian sosial dengan standar akuntabilitas tinggi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Security assurance */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 pt-6 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Platform terverifikasi dan aman untuk tata kelola kemitraan korporasi.</span>
        </div>
      </div>

      {/* Sisi Kanan: Form Card Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Mobile Header Branding */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 block leading-tight">
              CSR Impact Hub
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold tracking-wide">
              KOLABORASI & KEMITRAAN ESG
            </span>
          </div>
        </div>

        {/* Card Form Container */}
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Form Content Slot */}
          {children}

          {/* Footer Switcher Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              {footerText}{" "}
              <Link
                href={footerActionHref}
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                {footerActionText}
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 text-center text-xs text-slate-400">
          &copy; 2026 CSR Impact Hub. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </div>
  );
}
