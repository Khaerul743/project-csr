"use client";

import React from "react";
import { Sparkles, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const getBadgeVariant = (role: string) => {
    switch (role) {
      case "MANAGEMENT":
        return "emerald";
      case "CSR_ADMIN":
        return "blue";
      case "PARTNER_ADMIN":
        return "purple";
      case "STAGING":
      default:
        return "amber";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "MANAGEMENT":
        return "Manajemen Perusahaan";
      case "CSR_ADMIN":
        return "CSR Admin";
      case "PARTNER_ADMIN":
        return "Pimpinan Mitra/NGO";
      case "STAGING":
      default:
        return "Tahap Onboarding";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg block leading-none">
              CSR Impact Hub
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:block mt-0.5">
              Platform Kolaborasi Dampak Berkelanjutan
            </span>
          </div>
        </div>

        {/* User Status & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-slate-800 block leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 block leading-none mt-0.5">
                {user.email}
              </span>
            </div>
            <Badge variant={getBadgeVariant(user.role)} size="sm" hasDot className="ml-1">
              {getRoleLabel(user.role)}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            leftIcon={<LogOut className="w-4 h-4 text-slate-500" />}
            className="text-slate-600 hover:text-rose-600 hover:bg-rose-50"
            title="Keluar"
          >
            <span className="hidden md:inline">Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
