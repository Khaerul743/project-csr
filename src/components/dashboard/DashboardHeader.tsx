"use client";

import React from "react";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar: () => void;
  rightAction?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  onOpenMobileSidebar,
  rightAction,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-400 hidden sm:block truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      {rightAction && (
        <div className="flex items-center gap-3 shrink-0">
          {rightAction}
        </div>
      )}
    </header>
  );
}
