import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface AppLogoProps {
  /** Size variant for the logo icon */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Whether to show the brand name & subtitle */
  showText?: boolean;
  /** Whether to show subtitle below brand name. Default: true */
  showSubtitle?: boolean;
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
  /** Max lines for subtitle: 1 (single line truncate) or 2 (wrap up to 2 lines cleanly). Default: 1 */
  subtitleLines?: 1 | 2;
  /** Optional role/workspace badge next to SIPENA (e.g. "MITRA", "KORPORASI") */
  badge?: string;
  /** Badge color variant (default: emerald) */
  badgeVariant?: "emerald" | "blue" | "purple";
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
  showSubtitle = true,
  theme = "light",
  subtitle,
  className = "",
  iconClassName = "",
  href,
  subtitleLines = 1,
  badge,
  badgeVariant = "emerald",
}) => {
  const cfg = SIZE_MAP[size];

  const content = (
    <div className={`flex items-center gap-3 select-none min-w-0 ${className}`}>
      {/* Logo Icon Container */}
      <div
        className={`relative ${cfg.box} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconClassName}`}
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
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight block truncate ${cfg.text} ${
                theme === "dark" ? "text-white" : "text-[#181343]"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              SIPENA
            </span>
            {badge && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase shrink-0 border ${
                  badgeVariant === "blue"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : badgeVariant === "purple"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          {showSubtitle && (
            subtitle !== undefined ? (
              <span
                title={subtitle}
                className={`font-medium block ${cfg.sub} ${
                  theme === "dark" ? "text-slate-300" : "text-[#787680]"
                } ${
                  subtitleLines === 2
                    ? "line-clamp-2 leading-snug break-words"
                    : "truncate"
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
                Petakan Kebutuhan, Pantau Perubahan
              </span>
            )
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

