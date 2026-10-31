import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface AppLogoProps {
  /** Size variant for the logo icon */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Whether to show the brand name & subtitle */
  showText?: boolean;
  /** Color theme for text (light bg vs dark bg) */
  theme?: "light" | "dark";
  /** Custom subtitle text below brand name */
  subtitle?: string;
  /** Custom additional class name for the wrapper */
  className?: string;
  /** Optional custom icon class name */
  iconClassName?: string;
  /** Optional href to make it a clickable link */
  href?: string;
}

const SIZE_MAP = {
  xs: { box: "w-7 h-7", img: 28, text: "text-sm", sub: "text-[9px]" },
  sm: { box: "w-8 h-8", img: 32, text: "text-base", sub: "text-[10px]" },
  md: { box: "w-10 h-10", img: 40, text: "text-lg", sub: "text-[11px]" },
  lg: { box: "w-12 h-12", img: 48, text: "text-xl", sub: "text-xs" },
  xl: { box: "w-16 h-16", img: 64, text: "text-2xl", sub: "text-sm" },
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = "md",
  showText = true,
  theme = "light",
  subtitle,
  className = "",
  iconClassName = "",
  href,
}) => {
  const cfg = SIZE_MAP[size];

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Logo Icon Container */}
      <div
        className={`relative ${cfg.box} rounded-xl p-0.5 bg-white shadow-2xs ring-1 ring-slate-900/5 overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconClassName}`}
      >
        <Image
          src="/LOGO SIPENA.png"
          alt="Logo SIPENA"
          width={cfg.img}
          height={cfg.img}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="min-w-0 leading-tight">
          <span
            className={`font-extrabold tracking-tight block truncate ${cfg.text} ${
              theme === "dark" ? "text-white" : "text-[#181343]"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            SIPENA
          </span>
          {subtitle !== undefined ? (
            <span
              className={`font-medium block truncate ${cfg.sub} ${
                theme === "dark" ? "text-slate-300" : "text-[#787680]"
              }`}
            >
              {subtitle}
            </span>
          ) : (
            <span
              className={`font-semibold tracking-normal block truncate ${cfg.sub} ${
                theme === "dark" ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              Mencatat Aksi, Mengukur Dampak
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
};

