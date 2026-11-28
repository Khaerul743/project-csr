"use client";

import React from "react";
import Image from "next/image";

/**
 * Full-width decorative backdrop rendered inside the outer dashboard workspace
 * shell (with `overflow-x-clip`) so the abstract sky-blue/lavender blobs stay flush
 * against the top & right edges without being cropped by inner `max-w-7xl` containers.
 */
export function DashboardHeaderBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute top-0 right-0 w-[300px] sm:w-[440px] lg:w-[560px] h-[200px] sm:h-[225px] lg:h-[245px] z-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 540 230"
        fill="none"
        preserveAspectRatio="xMaxYMin slice"
        className="w-full h-full blur-[1px]"
      >
        <defs>
          <linearGradient id="sipenaHeaderBlobMain" x1="15%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.68" />
            <stop offset="55%" stopColor="#E0E7FF" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.52" />
          </linearGradient>
          <linearGradient id="sipenaHeaderBlobAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0.48" />
          </linearGradient>
        </defs>

        <path
          d="M300 -20C268 25 220 56 208 94C196 132 238 182 320 194C398 205 495 190 560 148V-20H300Z"
          fill="url(#sipenaHeaderBlobMain)"
        />

        <path
          d="M170 -20C155 12 120 52 98 66C78 79 58 67 66 46C74 24 102 -8 115 -20H170Z"
          fill="url(#sipenaHeaderBlobAccent)"
        />

        <circle cx="46" cy="112" r="10.5" fill="url(#sipenaHeaderBlobAccent)" />
      </svg>
    </div>
  );
}

export interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  /** Optional custom transparent PNG icon path inside /public/images */
  iconSrc?: string;
  /** Fallback or Lucide icon when no PNG asset is provided */
  icon?: React.ReactNode;
  /** Right-side primary CTA or action group */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized open-canvas Page Header aligned with SIPENA Design System v2.
 */
export function DashboardPageHeader({
  title,
  description,
  iconSrc,
  icon,
  actions,
  className = "",
}: DashboardPageHeaderProps) {
  return (
    <div
      className={`relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {(iconSrc || icon) && (
          <div className="w-12 h-12 rounded-2xl bg-[#EDF6FF] border border-[#CBE7FD] flex items-center justify-center shrink-0">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt=""
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
              />
            ) : (
              icon
            )}
          </div>
        )}
        <div className="min-w-0">
          <h1
            className="text-xl sm:text-2xl font-extrabold text-[#0A2558] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

