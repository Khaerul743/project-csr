import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate";
  size?: "sm" | "md";
  hasDot?: boolean;
}

export function Badge({
  children,
  variant = "emerald",
  size = "md",
  hasDot = false,
  className = "",
  ...props
}: BadgeProps) {
  const variantStyles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    blue: "bg-blue-50 text-blue-700 border-blue-200/80",
    rose: "bg-rose-50 text-rose-700 border-rose-200/80",
    amber: "bg-amber-50 text-amber-700 border-amber-200/80",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200/80",
  };

  const dotColors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    slate: "bg-slate-500",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {hasDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
