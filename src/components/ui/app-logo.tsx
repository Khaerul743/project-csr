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
  xs: { iconBox: "w-6 h-6", iconImg: 24, fullHeight: "h-5", sub: "text-[9px]" },
  sm: { iconBox: "w-7 h-7", iconImg: 28, fullHeight: "h-6", sub: "text-[10px]" },
  md: { iconBox: "w-9 h-9", iconImg: 36, fullHeight: "h-7", sub: "text-[11px]" },
  lg: { iconBox: "w-11 h-11", iconImg: 44, fullHeight: "h-8 sm:h-9", sub: "text-xs" },
  xl: { iconBox: "w-14 h-14", iconImg: 56, fullHeight: "h-10 sm:h-11", sub: "text-xs sm:text-sm" },
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
    <div className={`flex flex-col justify-center select-none min-w-0 ${className}`}>
      {showText ? (
        <>
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`relative flex items-center shrink-0 transition-transform duration-200 group-hover:scale-[1.02] ${
                theme === "dark" ? "bg-white/95 px-2 py-0.5 rounded-xl" : ""
              } ${iconClassName}`}
            >
              <Image
                src="/images/sipena-logo-full.png"
                alt="SIPENA"
                width={1024}
                height={347}
                className={`${cfg.fullHeight} w-auto object-contain object-left`}
                priority
              />
            </div>

            {badge && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase shrink-0 border ${
                  badgeVariant === "blue"
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
              className={`mt-1 font-medium tracking-tight block ${cfg.sub} ${
                theme === "dark" ? "text-slate-300" : "text-[#102B58]/80"
              } ${
                subtitleLines === 2
                  ? "line-clamp-2 leading-snug break-words"
                  : "truncate"
              }`}
            >
              {resolvedSubtitle}
            </span>
          )}
        </>
      ) : (
        <div
          className={`relative ${cfg.iconBox} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconClassName}`}
        >
          <Image
            src="/images/sipena-feather-logo.png"
            alt="Logo SIPENA"
            width={cfg.iconImg}
            height={cfg.iconImg}
            className="w-full h-full object-contain"
            priority
          />
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
