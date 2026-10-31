import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
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
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#181343] text-white hover:bg-[#26224C] active:bg-[#110D30] shadow-xs hover:shadow focus:ring-emerald-500/30",
      accent:
        "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs hover:shadow focus:ring-emerald-500/30",
      secondary:
        "bg-[#26224C] text-white hover:bg-[#181343] active:bg-[#110D30] shadow-xs focus:ring-emerald-500/30",
      outline:
        "bg-white border border-[#C8C5D0] text-[#181343] hover:bg-[#F4F4F6] hover:border-[#787680] active:bg-[#EEEEF0] focus:ring-emerald-500/20",
      ghost:
        "bg-transparent text-[#181343] hover:bg-[#EEEEF0] active:bg-[#E2E2E4] focus:ring-emerald-500/20",
      danger:
        "bg-[#BA1A1A] text-white hover:bg-[#93000A] active:bg-[#680004] shadow-xs focus:ring-[#BA1A1A]/30",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-2 rounded-lg gap-1.5",
      md: "text-sm px-4.5 py-2.5 rounded-lg gap-2",
      lg: "text-base px-6 py-3.5 rounded-lg gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
