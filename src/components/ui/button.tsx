"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "filter"
    | "ghost"
    | "destructive"
    | "danger"
    | "destructive-solid"
    | "translucent-white"
    | "glass"
    | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isActive?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      isActive = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex flex-row items-center justify-center font-medium transition-all duration-150 outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer whitespace-nowrap active:scale-[0.97]";

    // Standardized SIPENA Design System v2 Button System:
    // 1. Primary: Vibrant Landing Page Blue Gradient (#1D6CE0 -> #1765F5 -> #1748D5) with white text
    // 2. Secondary/Outline: White surface, Deep Navy text (#0A2558), Border #CBE7FD, hover #EDF6FF
    // 3. Filter: White background, Border #DBEAFE, text #0A2558. Active: #EDF6FF with #1765F5/40 border
    // 4. Destructive: White/transparent, Red text (#D9385F), Border #FECDD3, hover #FFF1F2
    // 5. Destructive-Solid: Solid Red (#D9385F, text white) for high-stakes dialog confirmation
    // 6. Ghost: Transparent background, Deep Navy text (#0A2558), hover #EDF6FF
    const variantStyles: Record<string, string> = {
      primary:
        "bg-gradient-to-r from-[#1D6CE0] via-[#1765F5] to-[#1748D5] text-white hover:brightness-105 border border-transparent shadow-sm shadow-[#1765F5]/20 focus:ring-[#1765F5]/40 font-semibold",
      accent:
        "bg-gradient-to-r from-[#1D6CE0] via-[#1765F5] to-[#1748D5] text-white hover:brightness-105 border border-transparent shadow-sm shadow-[#1765F5]/20 focus:ring-[#1765F5]/40 font-semibold",
      secondary:
        "bg-white text-[#0A2558] border border-[#CBE7FD] hover:bg-[#EDF6FF] hover:border-[#93C5FD] active:bg-[#DBEAFE] shadow-2xs focus:ring-[#1765F5]/25 font-semibold",
      outline:
        "bg-white text-[#0A2558] border border-[#CBE7FD] hover:bg-[#EDF6FF] hover:border-[#93C5FD] active:bg-[#DBEAFE] shadow-2xs focus:ring-[#1765F5]/25 font-semibold",
      filter: isActive
        ? "bg-[#EDF6FF] text-[#0A2558] border border-[#1765F5]/40 shadow-2xs font-semibold focus:ring-[#1765F5]/25"
        : "bg-white text-[#0A2558] border border-[#DBEAFE] hover:bg-[#F4F9FF] hover:border-[#93C5FD] active:bg-[#EDF6FF] shadow-2xs focus:ring-[#1765F5]/20 font-medium",
      ghost:
        "bg-transparent text-[#0A2558] hover:bg-[#EDF6FF] active:bg-[#DBEAFE] border border-transparent focus:ring-[#1765F5]/20 font-medium",
      destructive:
        "bg-white text-[#D9385F] border border-[#FECDD3] hover:bg-[#FFF1F2] hover:border-rose-300 hover:shadow-[0_0_16px_rgba(217,56,95,0.20)] active:bg-[#FFE4E6] shadow-2xs focus:ring-[#D9385F]/20 font-medium",
      danger:
        "bg-white text-[#D9385F] border border-[#FECDD3] hover:bg-[#FFF1F2] hover:border-rose-300 hover:shadow-[0_0_16px_rgba(217,56,95,0.20)] active:bg-[#FFE4E6] shadow-2xs focus:ring-[#D9385F]/20 font-medium",
      "destructive-solid":
        "bg-[#D9385F] text-white hover:bg-[#BE224A] hover:shadow-[0_0_20px_rgba(217,56,95,0.30)] active:bg-[#9F173C] border border-transparent shadow-2xs focus:ring-[#D9385F]/30 font-semibold",
      "translucent-white":
        "bg-[rgba(255,255,255,0.12)] text-white border border-[rgba(255,255,255,0.40)] hover:bg-[rgba(255,255,255,0.20)] hover:shadow-[0_0_16px_rgba(255,255,255,0.35)] active:bg-[rgba(255,255,255,0.26)] hover:border-[rgba(255,255,255,0.55)] shadow-2xs backdrop-blur-md focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-transparent outline-none font-semibold",
      glass:
        "bg-[rgba(255,255,255,0.12)] text-white border border-[rgba(255,255,255,0.40)] hover:bg-[rgba(255,255,255,0.20)] hover:shadow-[0_0_16px_rgba(255,255,255,0.35)] active:bg-[rgba(255,255,255,0.26)] hover:border-[rgba(255,255,255,0.55)] shadow-2xs backdrop-blur-md focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-transparent outline-none font-semibold",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-2 rounded-xl gap-1.5",
      md: "text-xs sm:text-sm px-4.5 py-2.5 rounded-xl gap-2",
      lg: "text-sm sm:text-base px-6 py-3 rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {!isLoading && leftIcon && (
          <span className="inline-flex items-center justify-center shrink-0 leading-none">
            {leftIcon}
          </span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex items-center justify-center shrink-0 leading-none">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
