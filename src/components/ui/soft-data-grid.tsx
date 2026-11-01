"use client";

import React from "react";

export interface SoftDataGridProps {
  /**
   * 'page': Subtle geometric data grid for off-white page background with soft mint & light-blue atmospheric glow.
   * 'hero': Faint white-blue transparent grid for dark navy / navy-emerald hero gradient banners.
   */
  variant?: "page" | "hero";
  /**
   * Toggle to turn off the grid experiment cleanly if needed. Defaults to true.
   */
  enabled?: boolean;
  /**
   * Control atmospheric radial glow presence.
   */
  glowPosition?: "default" | "minimal" | "none";
  /**
   * Additional custom CSS classes.
   */
  className?: string;
}

/**
 * SoftDataGrid — Eksperimen Visual Opsi 3: Subtle Data-Driven Background SIPENA
 *
 * Karakteristik Visual:
 * - Ukuran sel grid 40px (teratur & proporsional).
 * - Stroke tipis 1px ultra-halus (rgba(24, 19, 67, 0.035) untuk canvas / rgba(255, 255, 255, 0.04) untuk hero).
 * - Radial fade mask: grid lebih halus di tengah konten dan memudar elegan ke tepi canvas.
 * - Soft atmospheric glow: perpaduan halus mint (#EAF8F4) dan light-blue (#EDF5FA) tanpa spotlight kaku.
 * - Non-intrusif: pointer-events: none, z-index 0 di belakang konten utama.
 */
export function SoftDataGrid({
  variant = "page",
  enabled = true,
  glowPosition = "default",
  className = "",
}: SoftDataGridProps) {
  if (!enabled) return null;

  if (variant === "hero") {
    return (
      <div
        className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
        aria-hidden="true"
      >
        {/* Faint white-blue grid on dark navy/gradient hero — corner focused with radial fade */}
        <div
          className="absolute inset-0 opacity-70 sm:opacity-90"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--sipena-grid-line-hero, rgba(255, 255, 255, 0.04)) 1px, transparent 1px),
              linear-gradient(to bottom, var(--sipena-grid-line-hero, rgba(255, 255, 255, 0.04)) 1px, transparent 1px)
            `,
            backgroundSize: "38px 38px",
            WebkitMaskImage:
              "radial-gradient(circle 420px at 95% 5%, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.35) 55%, transparent 85%)",
            maskImage:
              "radial-gradient(circle 420px at 95% 5%, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.35) 55%, transparent 85%)",
          }}
        />
      </div>
    );
  }

  // Variant: 'page' (Global off-white canvas)
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {/* ===================================================================== */}
      {/* 1. SOFT ATMOSPHERIC GLOW WASH (MINT & PALE BLUE)                      */}
      {/* ===================================================================== */}
      {glowPosition !== "none" && (
        <>
          {/* Top-Right Glow: Soft Mint (#EAF8F4) & Light Blue (#EDF5FA) */}
          <div
            className="absolute -top-32 -right-32 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full blur-[80px] sm:blur-[100px] opacity-75"
            style={{
              background:
                "radial-gradient(circle, rgba(234, 248, 244, 0.85) 0%, rgba(237, 245, 250, 0.50) 45%, transparent 75%)",
            }}
          />

          {/* Bottom-Left Glow: Pale Ice Blue (#E8F2F5) & Mint Touch */}
          {glowPosition === "default" && (
            <div
              className="absolute top-[55%] -left-32 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] rounded-full blur-[90px] sm:blur-[110px] opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(232, 242, 245, 0.75) 0%, rgba(234, 248, 244, 0.40) 50%, transparent 75%)",
              }}
            />
          )}

          {/* Subtle Ambient Mid-Field Diffusion */}
          <div
            className="absolute top-[20%] left-[25%] w-[400px] h-[400px] rounded-full blur-[90px] opacity-35"
            style={{
              background:
                "radial-gradient(circle, rgba(237, 245, 250, 0.60) 0%, transparent 70%)",
            }}
          />
        </>
      )}

      {/* ===================================================================== */}
      {/* 2. SOFT GEOMETRIC DATA GRID TEXTURE                                   */}
      {/* ===================================================================== */}
      <div
        className="absolute inset-0 opacity-70 sm:opacity-90"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--sipena-grid-line, rgba(24, 19, 67, 0.035)) 1px, transparent 1px),
            linear-gradient(to bottom, var(--sipena-grid-line, rgba(24, 19, 67, 0.035)) 1px, transparent 1px)
          `,
          backgroundSize:
            "var(--sipena-grid-size, 40px) var(--sipena-grid-size, 40px)",
          // Center content is masked softly (0.12) to maintain clean focus on white cards,
          // while outer canvas margins & empty areas retain clean geometric depth (0.90).
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 75% at 50% 30%, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.45) 55%, rgba(0, 0, 0, 0.90) 100%)",
          maskImage:
            "radial-gradient(ellipse 90% 75% at 50% 30%, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.45) 55%, rgba(0, 0, 0, 0.90) 100%)",
        }}
      />
    </div>
  );
}

