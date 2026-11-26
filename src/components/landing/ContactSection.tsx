"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  Globe,
  MessageSquare,
  Share2,
  ArrowUpRight,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function ContactSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institutionType: "company",
    topic: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Demo request state
  const [demoEmail, setDemoEmail] = useState("");
  const [demoRequested, setDemoRequested] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      institutionType: "company",
      topic: "",
      message: "",
    });
    setIsSubmitted(false);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoEmail) return;
    setDemoRequested(true);
  };

  return (
    <section id="kontak" className="relative scroll-mt-[76px] bg-[#F9F9FB]">
      {/* ========================================================================= */}
      {/* 1. TOP BLUE BANNER                                                        */}
      {/* ========================================================================= */}
      <div className="relative bg-gradient-to-br from-[#0A2558] via-[#103EAE] to-[#1765F5] pt-16 sm:pt-20 lg:pt-24 pb-36 sm:pb-44 lg:pb-48 text-center text-white px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle geometric dot grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(#FFFFFF 1px, transparent 1px), radial-gradient(#FFFFFF 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            backgroundPosition: "0 0, 14px 14px",
          }}
        />

        {/* Ambient radial glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#43A5FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-[#1748D5]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-3 z-10">
          <ScrollReveal animation="fade-up" delay={20}>
            {/* Main Headline */}
            <h2
              className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Hubungi Kami
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm lg:text-base text-blue-100/90 leading-relaxed max-w-2xl mx-auto pt-1 font-normal">
              SIPENA siap memberikan solusi dan asistensi kemitraan CSR yang terukur, transparan, dan akuntabel sesuai kebutuhan organisasi Anda.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TWO SEPARATE FLOATING CARDS (HUBUNGI KAMI & KIRIM PESAN)               */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 lg:-mt-32 relative z-20">
        <ScrollReveal animation="fade-up" delay={40}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* ----------------------------------------------------------------- */}
            {/* CARD 1: HUBUNGI KAMI (SEPARATE INDEPENDENT CARD, 4 COLS)          */}
            {/* ----------------------------------------------------------------- */}
            <div className="lg:col-span-4 bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div>
                  <h3
                    className="text-xl sm:text-2xl font-bold text-[#0A2558] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Hubungi Kami
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Layanan informasi kemitraan dan asistensi tata kelola CSR nasional.
                  </p>
                </div>

                {/* Contact Items with Refined Font Sizes & Comfortable Spacing */}
                <div className="space-y-6 sm:space-y-7 pt-1 pb-2">
                  {/* Item 1: Surel Resmi */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#1765F5] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1765F5]/25">
                      <Mail className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-[10px] sm:text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        Surel Resmi Kemitraan
                      </h4>
                      <a
                        href="mailto:sipena.csr@gmail.com"
                        className="hover:text-[#1765F5] transition-colors font-semibold text-xs sm:text-[13px] text-[#0A2558] block leading-snug"
                      >
                        sipena.csr@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Item 2: Hotline */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#1765F5] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1765F5]/25">
                      <Phone className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-[10px] sm:text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        Hotline &amp; Pusat Bantuan
                      </h4>
                      <a
                        href="tel:+622152998800"
                        className="hover:text-[#1765F5] transition-colors font-semibold text-xs sm:text-[13px] text-[#0A2558] block leading-snug"
                      >
                        +62 (21) 5299-8800
                      </a>
                    </div>
                  </div>

                  {/* Item 3: Jam Layanan */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#1765F5] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1765F5]/25">
                      <Clock className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-[10px] sm:text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        Jam Layanan Operasional
                      </h4>
                      <p className="font-semibold text-xs sm:text-[13px] text-[#0A2558] leading-snug">
                        <span className="whitespace-nowrap">Senin - Jumat,</span>{" "}
                        <span className="whitespace-nowrap">08.30 - 17.30 WIB</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media & Channels */}
              <div className="pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold text-[#0A2558] mb-3">
                  Follow our social media
                </h5>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#1765F5] hover:bg-[#1249C0] text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
                    </svg>
                  </a>
                  <a
                    href="https://wa.me/6281198701234"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#1765F5] hover:bg-[#1249C0] text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105"
                    aria-label="WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="#beranda"
                    className="w-8 h-8 rounded-full bg-[#1765F5] hover:bg-[#1249C0] text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105"
                    aria-label="Website"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="mailto:sipena.csr@gmail.com"
                    className="w-8 h-8 rounded-full bg-[#1765F5] hover:bg-[#1249C0] text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105"
                    aria-label="Email"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* CARD 2: KIRIM PESAN (SEPARATE INDEPENDENT CARD, 8 COLS)           */}
            {/* ----------------------------------------------------------------- */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-6 sm:p-8 lg:p-10 space-y-5">
              <div>
                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-[#0A2558] tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Kirim Pesan
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-relaxed">
                  Lengkapi rincian profil institusi Anda di bawah ini untuk memulai dialog resmi.
                </p>
              </div>

              {isSubmitted ? (
                <div className="py-12 px-6 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-950">
                    Pesan Anda Berhasil Terkirim
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                    Terima kasih atas inisiatif kolaborasi Anda. Tim sekretariat SIPENA akan meninjau dan merespons pesan Anda maksimal dalam 1x24 jam kerja.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-[#1765F5] hover:underline cursor-pointer"
                    >
                      Kirim Pesan Lainnya
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Nama Lengkap Narahubung & Email Institusi Resmi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Nama Lengkap Narahubung <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Budi Santoso, S.T."
                        className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1765F5] focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Email Institusi Resmi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="nama@perusahaan.com"
                        className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1765F5] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: Nomor Telepon / WhatsApp & Tipe Institusi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+62 812-xxxx-xxxx"
                        className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1765F5] focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Tipe Institusi <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.institutionType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            institutionType: e.target.value,
                          })
                        }
                        className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1765F5] focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="company">Perusahaan Korporasi / Donor CSR</option>
                        <option value="ngo">Yayasan / Lembaga Pelaksana (NGO)</option>
                        <option value="community">Komunitas / Penerima Manfaat</option>
                        <option value="academic">Pemerintah / Akademisi / Auditor</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Fokus Kebutuhan Kolaborasi */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Fokus Kebutuhan Kolaborasi <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                      className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1765F5] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">Pilih kebutuhan Anda</option>
                      <option value="proposal">Perencanaan &amp; Kurasi Usulan Proposal AI</option>
                      <option value="monitoring">Validasi Jurnal &amp; Pelacakan Lapangan GPS</option>
                      <option value="disbursement">Realisasi Anggaran &amp; Verifikasi Nota Fisik</option>
                      <option value="audit-esg">Penyelarasan SDGs &amp; Penilaian Dampak ESG</option>
                      <option value="partnership">Kemitraan Strategis &amp; Integrasi Multi-Stakeholder</option>
                    </select>
                  </div>

                  {/* Row 4: Deskripsi Kebutuhan atau Pesan */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Deskripsi Kebutuhan atau Pesan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tuliskan gambaran program, wilayah, atau kebutuhan kolaborasi Anda..."
                      className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1765F5] focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] hover:brightness-105 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#1765F5]/30 hover:shadow-lg hover:shadow-[#1765F5]/45 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Mengirim pesan...</span>
                      ) : (
                        <>
                          <span>Kirim Pesan</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Privacy Note */}
                  <p className="text-[11px] text-center text-slate-400 pt-1">
                    Semua informasi bersifat rahasia dan hanya digunakan untuk keperluan komunikasi resmi.
                  </p>
                </form>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* 3. COMPACT DEMO REQUEST BANNER (MATCHING IMAGE 2 CONTENT)                 */}
        {/* ========================================================================= */}
        <div className="mt-8 sm:mt-10 w-full">
          <ScrollReveal animation="fade-up" delay={60}>
            <div className="relative bg-gradient-to-br from-[#0A2558] via-[#103EAE] to-[#1765F5] rounded-3xl p-6 sm:p-8 lg:p-10 text-center text-white shadow-2xl shadow-[#0A2558]/25 overflow-hidden">
              {/* Subtle geometric dot grid texture */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(#FFFFFF 1px, transparent 1px), radial-gradient(#FFFFFF 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                  backgroundPosition: "0 0, 14px 14px",
                }}
              />

              {/* Ambient radial glows */}
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#43A5FF]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#1748D5]/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-xl mx-auto space-y-2.5">
                {/* Capsule Tag */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold uppercase tracking-wider text-white">
                  <MessageSquare className="w-3 h-3 text-cyan-300" />
                  <span>DEMO LANGSUNG SISTEM</span>
                </div>

                {/* Headline (Matching Image 2) */}
                <h3
                  className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Butuh Demo Langsung Sistem?
                </h3>

                {/* Subtitle (Matching Image 2) */}
                <p className="text-xs sm:text-[13px] text-blue-100/90 leading-relaxed max-w-lg mx-auto">
                  Jadwalkan sesi walk-through 30 menit bersama tim implementasi kami untuk melihat alur kerja dan fitur pengelolaan CSR di SIPENA.
                </p>

                {/* Email Input Bar / Action Button */}
                {demoRequested ? (
                  <div className="pt-2 text-xs font-semibold text-cyan-200 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Terima kasih! Tim kami akan menghubungi Anda untuk konfirmasi jadwal sesi walk-through.</span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleDemoSubmit}
                    className="pt-2 max-w-md mx-auto"
                  >
                    <div className="flex items-center bg-white rounded-full p-1.5 shadow-md border border-white/20">
                      <input
                        type="email"
                        required
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        placeholder="Masukkan alamat email resmi Anda"
                        className="w-full bg-transparent px-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none rounded-full"
                      />
                      <button
                        type="submit"
                        className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] hover:brightness-105 text-white text-xs sm:text-sm font-bold shadow-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Minta Demo</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* Quick Mailto Link */}
                <div className="pt-1">
                  <a
                    href="mailto:sipena.csr@gmail.com?subject=Permintaan%20Demo%20Sistem%20SIPENA"
                    className="text-[11px] text-cyan-200/90 hover:text-white underline underline-offset-4 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Atau Kirim Permintaan Demo via Email</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Spacing before wavy footer */}
      <div className="pb-16 sm:pb-20" />
    </section>
  );
}
