"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
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
    topic: "",
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
      topic: "",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <section
      id="kontak"
      className="pt-6 pb-20 sm:pt-8 sm:pb-24 lg:pt-10 lg:pb-32 bg-[#F9F9FB] border-t border-[#E5E7EB] relative overflow-hidden scroll-mt-[76px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
        {/* Header */}
        <ScrollReveal animation="fade-up" delay={50}>
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#181343]/5 border border-[#181343]/10 text-[#181343] text-xs font-semibold mb-3.5 sm:mb-4">
              <span>Kemitraan &amp; Konsultasi Tata Kelola</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#181343] tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Mulai Transformasi Dampak CSR <br className="hidden sm:block" />
              <span className="text-emerald-600 whitespace-nowrap">Organisasi Anda</span>
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Diskusikan kebutuhan kolaborasi, integrasi sistem, atau konsultasi akuntabilitas program CSR organisasi Anda bersama tim sekretariat SIPENA.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Institutional Contact Details & Direct Help */}
          <ScrollReveal animation="fade-right" delay={100} className="lg:col-span-5 space-y-6">
            <div className="bg-[#181343] text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-md">
              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Sekretariat &amp; Hub Kemitraan SIPENA
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-8">
                Pusat layanan informasi kemitraan, verifikasi kelembagaan, serta asistensi teknis platform tata kelola CSR nasional.
              </p>

              <div className="space-y-6 text-sm">
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
                      Hotline &amp; Pusat Bantuan
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
                      Senin - Jumat, 08.30 - 17.30 WIB
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
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Jadwalkan sesi walk-through 30 menit bersama tim implementasi kami untuk melihat alur kerja dan fitur pengelolaan CSR di SIPENA.
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
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5E7EB] shadow-xs">
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
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Terima kasih atas inisiatif kolaborasi Anda. Tim Sekretariat Kemitraan SIPENA akan meninjau kebutuhan organisasi Anda dan menghubungi melalui kontak yang dicantumkan dalam 1x24 jam kerja.
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
                      Formulir Kemitraan &amp; Penjajakan CSR
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Lengkapi rincian profil organisasi Anda di bawah ini untuk memulai dialog resmi.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                        Nama Lengkap Narahubung <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso, S.T."
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#181343] placeholder-slate-400 focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                        Email Organisasi Resmi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nama@perusahaan.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#181343] placeholder-slate-400 focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50"
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
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#181343] placeholder-slate-400 focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                        Tipe Organisasi <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.institutionType}
                        onChange={(e) =>
                          setFormData({ ...formData, institutionType: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#181343] focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50 cursor-pointer"
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
                      Fokus Kebutuhan Kolaborasi <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                      className={`w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50 cursor-pointer ${!formData.topic ? "text-slate-400" : "text-[#181343]"
                        }`}
                    >
                      <option value="" disabled>
                        Pilih kebutuhan Anda
                      </option>
                      <option value="demo">Informasi Umum &amp; Demo SIPENA</option>
                      <option value="account">Pendaftaran &amp; Akses Akun Organisasi</option>
                      <option value="partnership">Kemitraan &amp; Peluang Kerja Sama CSR</option>
                      <option value="management">Pengelolaan &amp; Evaluasi Program CSR</option>
                      <option value="other">Pertanyaan atau Bantuan Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181343] uppercase tracking-wider mb-1.5">
                      Deskripsi Kebutuhan atau Pesan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tuliskan latar belakang inisiatif CSR Anda, cakupan wilayah, target penerima manfaat, atau ekspektasi kolaborasi bersama SIPENA..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#181343] placeholder-slate-400 focus:outline-none focus:border-[#181343] focus:ring-1 focus:ring-[#181343] transition-all bg-[#F9F9FB]/50"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[11px] text-slate-500 text-center sm:text-left">
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
