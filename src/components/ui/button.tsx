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
    // Standard SIPENA Button Base: 500-600 font weight, 10-12px (rounded-xl) radius, smooth transitions
    const baseStyles =
      "inline-flex flex-row items-center justify-center font-medium transition-all duration-150 outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer whitespace-nowrap";

    // Standardized SIPENA Button System:
    // 1. Primary: Solid Navy (#181343, hover: #26224C, text white)
    // 2. Secondary/Outline: White background, Navy text (#181343), Border #CBC8DB, hover: #F4F3FA
    // 3. Filter: White background, Border #E1E4EB, text #181343. Active: #F0EFF8 with #CBC8DB border
    // 4. Destructive: White/transparent, Red text (#D9385F), Border #FECDD3, hover: #FFF1F2
    // 5. Destructive-Solid: Solid Red (#D9385F, text white) for high-stakes dialog confirmation
    // 6. Ghost: Transparent background, Navy text (#181343), hover: #F4F3FA
    const variantStyles: Record<string, string> = {
      primary:
        "bg-[#181343] text-white hover:bg-[#26224C] active:bg-[#110D30] border border-transparent shadow-2xs hover:shadow-xs focus:ring-[#181343]/30 font-semibold",
      accent:
        "bg-[#181343] text-white hover:bg-[#26224C] active:bg-[#110D30] border border-transparent shadow-2xs hover:shadow-xs focus:ring-[#181343]/30 font-semibold",
      secondary:
        "bg-white text-[#181343] border border-[#CBC8DB] hover:bg-[#F4F3FA] active:bg-[#ECEAF5] shadow-2xs focus:ring-[#181343]/20 font-medium",
      outline:
        "bg-white text-[#181343] border border-[#CBC8DB] hover:bg-[#F4F3FA] active:bg-[#ECEAF5] shadow-2xs focus:ring-[#181343]/20 font-medium",
      filter: isActive
        ? "bg-[#F0EFF8] text-[#181343] border border-[#CBC8DB] shadow-2xs font-semibold focus:ring-[#181343]/20"
        : "bg-white text-[#181343] border border-[#E1E4EB] hover:bg-[#F8F8FB] active:bg-[#F0EFF8] shadow-2xs focus:ring-[#181343]/20 font-medium",
      ghost:
        "bg-transparent text-[#181343] hover:bg-[#F4F3FA] active:bg-[#ECEAF5] border border-transparent focus:ring-[#181343]/20 font-medium",
      destructive:
        "bg-white text-[#D9385F] border border-[#FECDD3] hover:bg-[#FFF1F2] active:bg-[#FFE4E6] shadow-2xs focus:ring-[#D9385F]/20 font-medium",
      danger:
        "bg-white text-[#D9385F] border border-[#FECDD3] hover:bg-[#FFF1F2] active:bg-[#FFE4E6] shadow-2xs focus:ring-[#D9385F]/20 font-medium",
      "destructive-solid":
        "bg-[#D9385F] text-white hover:bg-[#BE224A] active:bg-[#9F173C] border border-transparent shadow-2xs hover:shadow-xs focus:ring-[#D9385F]/30 font-semibold",
      "translucent-white":
        "bg-[rgba(255,255,255,0.12)] text-white border border-[rgba(255,255,255,0.40)] hover:bg-[rgba(255,255,255,0.20)] active:bg-[rgba(255,255,255,0.26)] hover:border-[rgba(255,255,255,0.55)] shadow-2xs backdrop-blur-md focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-transparent outline-none font-semibold",
      glass:
        "bg-[rgba(255,255,255,0.12)] text-white border border-[rgba(255,255,255,0.40)] hover:bg-[rgba(255,255,255,0.20)] active:bg-[rgba(255,255,255,0.26)] hover:border-[rgba(255,255,255,0.55)] shadow-2xs backdrop-blur-md focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-transparent outline-none font-semibold",
    };

    // Standardized Consistent Sizes: 10-12px radius (rounded-xl)
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
