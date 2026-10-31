import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#F4F4F6]">
      {/* Layered background — soft radial gradient wash for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(24,19,67,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(217,56,95,0.03) 0%, transparent 60%)",
        }}
      />

      {/* Full-height flex wrapper */}
      <div className="relative z-10 flex flex-col items-center w-full px-5 py-10 sm:py-16">
        {/* Back link — sits above the card, left-aligned to card width */}
        <div className="w-full max-w-[420px] mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#787680] hover:text-[#181343] transition-colors duration-200 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Main Card */}
        <div
          className="w-full max-w-[420px] bg-white rounded-2xl border border-[#E8E8EA] overflow-hidden"
          style={{
            boxShadow:
              "0 1px 2px rgba(24,19,67,0.04), 0 4px 12px rgba(24,19,67,0.04), 0 12px 32px rgba(24,19,67,0.03)",
          }}
        >
          {/* Card Header — Logo & Title Zone */}
          <div className="pt-8 pb-1 px-8 sm:pt-10 sm:px-10">
            {/* Logo lockup */}
            <div className="flex flex-col items-center text-center mb-6">
              <Link
                href="/"
                className="inline-flex flex-col items-center gap-3 group focus:outline-hidden select-none"
              >
                <div
                  className="relative w-[56px] h-[56px] rounded-2xl overflow-hidden flex items-center justify-center shrink-0 bg-white border border-[#E8E8EA] transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-md"
                  style={{
                    boxShadow:
                      "0 1px 3px rgba(24,19,67,0.06), 0 2px 8px rgba(24,19,67,0.04)",
                  }}
                >
                  <Image
                    src="/LOGO SIPENA.png"
                    alt="Logo SIPENA"
                    width={48}
                    height={48}
                    className="w-[42px] h-[42px] object-contain"
                    priority
                  />
                </div>

                <div className="leading-tight">
                  <span
                    className="text-[22px] font-extrabold tracking-tight text-[#181343] block"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    SIPENA
                  </span>
                  <span className="text-[11px] font-medium text-[#787680] block mt-0.5 tracking-wide uppercase">
                    Tata Kelola &amp; Kolaborasi CSR
                  </span>
                </div>
              </Link>
            </div>

            {/* Title & subtitle */}
            <div className="text-center">
              <h1
                className="text-[20px] sm:text-[22px] font-bold tracking-tight text-[#1A1C1D]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </h1>
              <p className="text-[13px] text-[#787680] mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-8 sm:mx-10 mt-5 mb-6 h-px bg-[#EEEEF0]" />

          {/* Form Content */}
          <div className="px-8 sm:px-10 pb-6">{children}</div>

          {/* Footer — Switch between Login/Register */}
          <div className="border-t border-[#F4F4F6] bg-[#FAFAFE] px-8 sm:px-10 py-4">
            <p className="text-[13px] text-[#787680] text-center">
              {footerText}{" "}
              <Link
                href={footerActionHref}
                className="font-semibold text-[#181343] hover:text-emerald-600 transition-colors duration-200"
              >
                {footerActionText}
              </Link>
            </p>
          </div>
        </div>

        {/* Institutional footer */}
        <div className="mt-8 text-center space-y-0.5">
          <p className="text-[11px] text-[#C8C5D0]">
            &copy; 2026 SIPENA — Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi
            CSR
          </p>
          <p className="text-[11px] text-[#C8C5D0]">
            Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </div>
    </div>
  );
}
