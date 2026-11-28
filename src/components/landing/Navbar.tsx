"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang Kami", href: "#tentang-kami" },
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Bukti Nyata", href: "#bukti-nyata" },
  { label: "Kontak", href: "#kontak" },
];

export function LandingNavbar() {
  const [activeSection, setActiveSection] = useState("beranda");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Section spy
      const sectionIds = NAV_ITEMS.map((item) => item.href.replace("#", ""));
      const scrollPosition = window.scrollY + 120;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      const headerEl = document.querySelector("header");
      const navHeight = headerEl ? headerEl.offsetHeight : 80;
      // Subtract (navHeight - 4) to ensure a 4px overlap into the target section
      // This completely guarantees that NO sliver of white background from the previous section shows!
      const yOffset = -(navHeight - 4);
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
    setActiveSection(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${isScrolled
        ? "bg-white/95 backdrop-blur-md shadow-xs border-slate-200/80"
        : "bg-white/80 backdrop-blur-md border-white/60 shadow-2xs"
        }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3 sm:py-3.5 flex items-center justify-between gap-6">
        {/* Brand Logo Lockup */}
        <Link
          href="#beranda"
          onClick={(e) => handleNavClick(e, "#beranda")}
          className="flex items-center gap-2.5 sm:gap-3 select-none group focus:outline-hidden shrink-0"
        >
          {/* Logo Terpadu Bulu Pena & Wordmark SIPENA (Aset Terbaru) */}
          <div className="relative flex items-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/images/sipena-logo-full.png"
              alt="SIPENA"
              width={1024}
              height={347}
              className="h-9 sm:h-10 lg:h-11 w-auto object-contain"
              priority
            />
          </div>

          {/* Tulisan Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR (Garis Rapat ke Logo) */}
          <div className="hidden md:flex items-center pl-2.5 sm:pl-3 border-l border-slate-300">
            <span className="text-[11.5px] xl:text-[12.5px] font-medium text-[#102B58] tracking-tight whitespace-nowrap">
              Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Capsule Center Menu with generous spacing) */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 bg-[#EDF6FF]/70 backdrop-blur-xs px-4 py-1.5 rounded-full border border-black/5 shadow-2xs">
          {NAV_ITEMS.map((item) => {
            const id = item.href.replace("#", "");
            const isActive = activeSection === id;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${isActive
                  ? "bg-gradient-to-r from-[#1A60B0] via-[#10519B] to-[#073E8A] text-white shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-[#102B58] hover:bg-white/60"
                  }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Desktop CTA Action Buttons */}
        <div className="hidden sm:flex items-center gap-3 xl:gap-4 shrink-0 whitespace-nowrap">
          <Link href="/login">
            <button
              type="button"
              className="text-xs sm:text-sm font-bold text-[#102B58] hover:text-[#1765F5] px-4 py-2.5 rounded-full hover:bg-white/70 transition-all cursor-pointer"
            >
              Masuk
            </button>
          </Link>
          <Link href="/register">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#43A5FF] via-[#1765F5] to-[#1748D5] hover:brightness-105 hover:scale-105 px-5 sm:px-6 py-2.5 rounded-full shadow-md shadow-[#1765F5]/30 hover:shadow-lg hover:shadow-[#1765F5]/45 transition-all cursor-pointer"
            >
              <span>Mulai Kolaborasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center lg:hidden gap-2">
          <Link href="/login" className="sm:hidden">
            <button
              type="button"
              className="text-xs font-bold text-[#17233C] px-3 py-1.5"
            >
              Masuk
            </button>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-[#17233C] hover:bg-white/80 transition-colors focus:outline-hidden cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 sm:px-8 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const id = item.href.replace("#", "");
              const isActive = activeSection === id;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-between ${isActive
                    ? "text-[#0875D1] bg-[#DFEBFC]/70 font-extrabold"
                    : "text-slate-600 hover:bg-[#F0F4FC] hover:text-[#17233C]"
                    }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0875D1]" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full"
            >
              <button
                type="button"
                className="w-full py-2.5 rounded-xl border border-[#E0E7F1] text-xs font-bold text-[#17233C] hover:bg-[#F0F4FC]"
              >
                Masuk ke Platform
              </button>
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full"
            >
              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-[#0875D1] text-white text-xs font-bold hover:bg-[#064BA5]"
              >
                Daftar Akun Baru
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
