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
  { label: "Program & Dampak", href: "#program-dampak" },
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
      const yOffset = -76;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setActiveSection(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#FFFFFF]/95 backdrop-blur-md shadow-xs border-b border-[#C8C5D0]/60"
          : "bg-[#FFFFFF] border-b border-[#EEEEF0]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="#beranda"
          onClick={(e) => handleNavClick(e, "#beranda")}
          className="flex items-center gap-3 select-none group focus:outline-hidden"
        >
          <div className="relative w-11 h-11 rounded-xl p-0.5 bg-white shadow-2xs border border-[#C8C5D0]/60 overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/LOGO SIPENA.png"
              alt="Logo SIPENA"
              width={44}
              height={44}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span
                className="text-xl font-extrabold tracking-tight text-[#181343]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                SIPENA
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#181343]/5 text-[#181343] text-[10px] font-bold tracking-wide uppercase border border-[#181343]/10">
                Tata Kelola CSR
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#47464F] block tracking-tight">
              Sistem Tata Kelola & Kolaborasi CSR
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_ITEMS.map((item) => {
            const id = item.href.replace("#", "");
            const isActive = activeSection === id;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative px-3.5 py-2 rounded-lg text-[13px] transition-all duration-200 ${
                  isActive
                    ? "text-emerald-700 font-bold"
                    : "text-[#47464F] hover:text-[#181343] font-medium hover:bg-[#F4F4F6]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-emerald-600 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Desktop CTA Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-[#181343] hover:bg-[#F4F4F6] px-3.5"
            >
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="accent"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs font-bold rounded-xl shadow-xs px-4"
            >
              Mulai Kolaborasi
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center lg:hidden gap-2">
          <Link href="/login" className="sm:hidden">
            <Button variant="outline" size="sm" className="text-xs px-2.5 py-1.5">
              Masuk
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-[#181343] hover:bg-[#F4F4F6] transition-colors focus:outline-hidden"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-[#C8C5D0] bg-[#FFFFFF] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const id = item.href.replace("#", "");
              const isActive = activeSection === id;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    isActive
                      ? "text-[#181343] font-bold bg-[#181343]/8"
                      : "text-[#47464F] hover:bg-[#F4F4F6] hover:text-[#181343]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#EEEEF0] flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full"
            >
              <Button
                variant="outline"
                size="md"
                className="w-full justify-center text-xs font-bold"
              >
                Masuk ke Akun Institusi
              </Button>
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full"
            >
              <Button
                variant="accent"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full justify-center text-xs font-bold"
              >
                Daftar Institusi Baru
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
