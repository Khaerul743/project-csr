"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/ui/app-logo";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Sebelah Kiri: Logo SIPENA, Wordmark & Tagline Resmi */}
        <AppLogo
          size="md"
          theme="light"
          subtitle="Petakan Kebutuhan, Pantau Perubahan"
        />

        {/* Sebelah Kanan: Inisial/Avatar, Nama Pengguna, dan Tombol Keluar */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-[#181343] flex items-center justify-center font-bold text-xs select-none">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs sm:text-[13px] font-semibold text-slate-800 block leading-tight">
                {user.name}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
            className="text-xs font-medium text-slate-700 border-slate-200 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 rounded-xl h-8.5 px-3 cursor-pointer"
            title="Keluar dari akun"
          >
            <span>Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
