import React from "react";
import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { ValuesSection } from "@/components/landing/ValuesSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { ProgramsImpactSection } from "@/components/landing/ProgramsImpactSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { LandingFooter } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "SIPENA: Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR",
  description:
    "Platform kolaborasi strategis antara perusahaan, yayasan/NGO, dan masyarakat. Pencatatan proposal berbasis AI, pemantauan milestone geolokasi, dan evaluasi dampak ESG.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#181343] selection:bg-[#0875D1] selection:text-white antialiased font-sans">
      {/* Sticky Top Navigation */}
      <LandingNavbar />

      {/* Main Single-Page Content Sections */}
      <main className="flex-1">
        {/* 1. Beranda */}
        <HeroSection />

        {/* 2. Tentang Kami */}
        <AboutSection />

        {/* 3. Nilai Kami */}
        <ValuesSection />

        {/* 4. Fitur Utama */}
        <FeaturesSection />

        {/* 4. Cara Kerja */}
        <WorkflowSection />

        {/* 5. Bukti Nyata */}
        <ProgramsImpactSection />

        {/* 6. Kontak & Kemitraan */}
        <ContactSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
