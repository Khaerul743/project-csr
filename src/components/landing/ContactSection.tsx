"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function ContactSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institutionType: "company",
    topic: "partnership",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      institutionType: "company",
      topic: "partnership",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <section
      id="kontak"
      className="py-20 lg:py-28 bg-[#F9F9FB] border-t border-[#E5E7EB] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <ScrollReveal animation="fade-up" delay={50}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181343]/5 border border-[#181343]/10 text-[#181343] text-xs font-semibold mb-3">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kemitraan & Konsultasi Tata Kelola</span>
            </div>
            <h2
              className="text-2xl sm:text-4xl font-extrabold text-[#181343] tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Mulai Transformasi Dampak CSR{" "}
              <span className="text-emerald-600">Institusi Anda.</span>
            </h2>
            <p className="mt-3 text-base text-[#26224C]/80 leading-relaxed">
              Apakah Anda mewakili korporasi, yayasan pelaksana program, atau lembaga publik? Diskusikan kebutuhan kolaborasi, integrasi sistem, atau konsultasi akuntabilitas program Anda bersama tim SIPENA.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Institutional Contact Details & Direct Help */}
          <ScrollReveal animation="fade-right" delay={100} className="lg:col-span-5 space-y-6">
            <div className="bg-[#181343] text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-md">
              {/* Subtle visual accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Sekretariat & Hub Kemitraan SIPENA
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-8">
                Pusat layanan informasi kemitraan, verifikasi kelembagaan, serta asistensi teknis platform tata kelola CSR nasional.
              </p>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Alamat Kantor Operasional
                    </h4>
                    <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                      Gedung Pusat Tata Kelola Berkelanjutan, Lantai 8<br />
                      Kawasan Sudirman Central Business District (SCBD)<br />
                      Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Surel Resmi Kemitraan
                    </h4>
                    <p className="text-slate-200 text-xs sm:text-sm font-mono">
                      kemitraan@sipena.id
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Respon tim sekretariat maksimal 1x24 jam kerja
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Hotline & Pusat Bantuan
                    </h4>
                    <p className="text-slate-200 text-xs sm:text-sm font-semibold">
                      +62 (21) 5299-8800
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      WhatsApp Kemitraan: +62 811-9870-1234
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-300 mb-1">
                      Jam Layanan Operasional
                    </h4>
                    <p className="text-slate-200 text-xs sm:text-sm">
                      Senin &ndash; Jumat, 08.30 &ndash; 17.30 WIB
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Compliance Assurance */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-tight">
                  Kerahasiaan data kemitraan dilindungi protokol kepatuhan UU PDP No. 27/2022 dan enkripsi tingkat enterprise.
                </p>
              </div>
            </div>

            {/* Quick Consultation Badge Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#181343] text-sm">
                  Butuh Demo Langsung Sistem?
                </h4>
              </div>
              <p className="text-xs text-[#26224C]/80 leading-relaxed mb-4">
                Jadwalkan sesi walk-through 30 menit bersama konsultan implementasi kami untuk melihat cara kerja kurasi AI dan dashboard kepatuhan ESG.
              </p>
              <a
                href="mailto:kemitraan@sipena.id?subject=Permintaan%20Demo%20Sistem%20SIPENA"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#181343] hover:text-emerald-600 transition-colors"
              >
                <span>Kirim Permintaan Demo via Email</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </ScrollReveal>

          {/* Right Column: Institutional Inquiry Form */}
          <ScrollReveal animation="fade-left" delay={200} className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#C8C5D0]/60 shadow-xs">
              {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3
                  className="text-2xl font-bold text-[#181343]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Pesan Kemitraan Berhasil Dikirim
                </h3>
                <p className="text-sm text-[#26224C]/80 max-w-md mx-auto leading-relaxed">
                  Terima kasih atas inisiatif kolaborasi Anda. Tim Sekretariat Kemitraan SIPENA akan meninjau kebutuhan institusi Anda dan menghubungi melalui kontak yang dicantumkan dalam 1x24 jam kerja.
                </p>
                <div className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="cursor-pointer"
                  >
                    Kirim Pesan Lainnya
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3
                    className="text-xl font-bold text-[#181343]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Formulir Kemitraan & Penjajakan CSR
                  </h3>
                  <p className="text-xs text-[#26224C]/70 mt-1">
                    Lengkapi rincian profil institusi Anda di bawah ini untuk memulai dialog resmi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                      Nama Lengkap Narahubung *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso, S.T."
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#C8C5D0] text-sm text-[#181343] placeholder-[#26224C]/40 focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                      Email Institusi Resmi *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama@perusahaan.com / nama@yayasan.org"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#C8C5D0] text-sm text-[#181343] placeholder-[#26224C]/40 focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+62 812-xxxx-xxxx"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#C8C5D0] text-sm text-[#181343] placeholder-[#26224C]/40 focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                      Tipe Institusi *
                    </label>
                    <select
                      value={formData.institutionType}
                      onChange={(e) =>
                        setFormData({ ...formData, institutionType: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#C8C5D0] text-sm text-[#181343] focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50 cursor-pointer"
                    >
                      <option value="company">Perusahaan Korporasi / Donor CSR</option>
                      <option value="ngo">Yayasan / Lembaga Swadaya Masyarakat</option>
                      <option value="government">Instansi Pemerintah / BUMN</option>
                      <option value="academic">Universitas / Lembaga Riset</option>
                      <option value="other">Komunitas Publik Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                    Fokus Kebutuhan Kolaborasi *
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#C8C5D0] text-sm text-[#181343] focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50 cursor-pointer"
                  >
                    <option value="partnership">Implementasi Platform & Akun Mitra</option>
                    <option value="ai-curation">Konsultasi Kurasi Proposal Berbasis AI</option>
                    <option value="audit-esg">Audit Lapangan & Pelaporan Kepatuhan ESG/SDGs</option>
                    <option value="integration">Integrasi API & Sistem Keuangan Internal</option>
                    <option value="other">Pertanyaan Umum Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                    Deskripsi Kebutuhan atau Pesan *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan latar belakang inisiatif CSR Anda, cakupan wilayah, target penerima manfaat, atau ekspektasi kolaborasi bersama SIPENA..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#C8C5D0] text-sm text-[#181343] placeholder-[#26224C]/40 focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-[11px] text-[#26224C]/60 text-center sm:text-left">
                    Semua informasi bersifat rahasia dan hanya digunakan untuk keperluan komunikasi resmi.
                  </span>
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    disabled={isSubmitting}
                    rightIcon={<Send className="w-4 h-4" />}
                    className="w-full sm:w-auto shrink-0 shadow-sm hover:shadow cursor-pointer"
                  >
                    {isSubmitting ? "Mengirimkan..." : "Kirim Formulir"}
                  </Button>
                </div>
              </form>
            )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
