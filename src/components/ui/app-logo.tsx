import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface AppLogoProps {
  /** Size variant for the logo */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Whether to show the integrated SIPENA wordmark or feather emblem only */
  showText?: boolean;
  /** Whether to show subtitle below the brand logo. Default: true */
  showSubtitle?: boolean;
  /** Color theme for surrounding surface (light bg vs dark bg) */
  theme?: "light" | "dark";
  /** Custom subtitle text below brand logo */
  subtitle?: string;
  /** Custom additional class name for the wrapper */
  className?: string;
  /** Optional custom icon class name */
  iconClassName?: string;
  /** Optional href to make it a clickable link */
  href?: string;
  /** Max lines for subtitle: 1 (single line truncate) or 2 (wrap up to 2 lines cleanly). Default: 1 */
  subtitleLines?: 1 | 2;
  /** Optional role/workspace badge next to SIPENA (e.g. "MITRA", "KORPORASI") */
  badge?: string;
  /** Badge color variant (default: blue) */
  badgeVariant?: "emerald" | "blue" | "purple";
}

const SIZE_MAP = {
  xs: { emblemH: "h-6", wordmarkH: "h-3.5", sub: "text-[9px]" },
  sm: { emblemH: "h-7", wordmarkH: "h-4", sub: "text-[10px]" },
  md: { emblemH: "h-9", wordmarkH: "h-[19px]", sub: "text-[11px]" },
  lg: { emblemH: "h-10", wordmarkH: "h-5", sub: "text-xs" },
  xl: { emblemH: "h-12", wordmarkH: "h-6", sub: "text-xs sm:text-sm" },
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = "md",
  showText = true,
  showSubtitle = true,
  theme = "light",
  subtitle,
  className = "",
  iconClassName = "",
  href,
  subtitleLines = 1,
  badge,
  badgeVariant = "blue",
}) => {
  const cfg = SIZE_MAP[size];
  const resolvedSubtitle =
    subtitle !== undefined
      ? subtitle
      : "Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR";

  const content = (
    <div className={`flex items-center gap-2.5 select-none min-w-0 ${className}`}>
      {/* 1. Logo Sendiri di Paling Kiri */}
      <div
        className={`relative ${cfg.emblemH} w-auto aspect-[146/260] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconClassName}`}
      >
        <Image
          src="/images/sipena-emblem-clean.png"
          alt="Logo SIPENA"
          width={146}
          height={260}
          className="h-full w-auto object-contain"
          priority
        />
      </div>

      {/* 2. Di Sebelah Kanan: SIPENA di Atas Sejajar dengan Nama PT di Bawah */}
      {showText && (
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`relative flex items-center shrink-0 transition-transform duration-200 group-hover:scale-[1.02] ${theme === "dark" ? "bg-white/95 px-1.5 py-0.5 rounded-lg" : ""
                }`}
            >
              <Image
                src="/images/sipena-wordmark-clean.png"
                alt="SIPENA"
                width={743}
                height={225}
                className={`${cfg.wordmarkH} w-auto object-contain object-left`}
                priority
              />
            </div>

            {badge && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase shrink-0 border ${badgeVariant === "blue"
                    ? "bg-[#EDF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                    : badgeVariant === "purple"
                      ? "bg-purple-50 text-purple-800 border-purple-200"
                      : "bg-[#ECFDF5] text-[#065F46] border-emerald-200"
                  }`}
              >
                {badge}
              </span>
            )}
          </div>

          {showSubtitle && resolvedSubtitle && (
            <span
              title={resolvedSubtitle}
              className={`mt-0.5 font-medium tracking-tight block ${cfg.sub} ${theme === "dark" ? "text-slate-300" : "text-[#102B58]/80"
                } ${subtitleLines === 2
                  ? "line-clamp-2 leading-snug break-words"
                  : "truncate"
                }`}
            >
              {resolvedSubtitle}
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
