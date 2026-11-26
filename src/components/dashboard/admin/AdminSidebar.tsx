"use client";

import React, { useEffect } from "react";
import {
  Activity,
  Building2,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  MessageSquareHeart,
  ScrollText,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { AppLogo } from "@/components/ui/app-logo";
import { AdminNavMenu } from "./types";

interface AdminNavItem {
  id: AdminNavMenu;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

interface AdminSidebarProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    phone?: string | null;
    position?: string | null;
  };
  activeMenu: AdminNavMenu;
  onSelectMenu: (menu: AdminNavMenu) => void;
  counts?: {
    unverifiedCompanies?: number;
    unverifiedPartners?: number;
    flaggedPrograms?: number;
  };
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
}

export function AdminSidebar({
  user,
  activeMenu,
  onSelectMenu,
  counts,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  onOpenProfile,
}: AdminSidebarProps) {
  useEffect(() => {
    if (!isOpenMobile) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpenMobile, onCloseMobile]);

  const sections: AdminNavSection[] = [
    {
      title: "UTAMA",
      items: [
        {
          id: "overview",
          label: "Ringkasan Platform",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "EKOSISTEM & PENGGUNA",
      items: [
        {
          id: "companies",
          label: "Perusahaan Sponsor",
          icon: Building2,
        },
        {
          id: "partners",
          label: "Mitra Pelaksana (NGO)",
          icon: HeartHandshake,
        },
        {
          id: "users",
          label: "Pengguna Sistem",
          icon: Users,
        },
      ],
    },
    {
      title: "PENGAWASAN & MODERASI",
      items: [
        {
          id: "moderation",
          label: "Moderasi Peluang & Proposal",
          icon: ShieldAlert,
        },
        {
          id: "programs",
          label: "Pengawasan Program & Dana",
          icon: Activity,
          count: counts?.flaggedPrograms,
        },
        {
          id: "impact",
          label: "Suara Warga & Dampak ESG",
          icon: MessageSquareHeart,
        },
      ],
    },
    {
      title: "SISTEM & TATA KELOLA",
      items: [
        {
          id: "system",
          label: "Sistem, AI & Log Audit",
          icon: ScrollText,
        },
      ],
    },
  ];

  const handleItemClick = (id: AdminNavMenu) => {
    onSelectMenu(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-[#181343] border-r border-[#E5E7EB] select-none">
      {/* Header & Brand */}
      <div className="h-[72px] px-5 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
        <AppLogo size="md" theme="light" subtitle="Platform Oversight" className="min-w-0 flex-1" />
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Tutup Menu"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-[#181343] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 pb-8 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </span>

            <div className="space-y-1 pt-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group ${isActive
                      ? "bg-[#181343] text-white shadow-xs font-bold"
                      : "text-[#181343] hover:bg-[#F4F4F6] hover:text-[#181343]"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-[#787680] group-hover:text-[#181343]"
                          }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold leading-none shrink-0 transition-colors ${isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#ECEAF8] text-[#181343] border border-[#D8D2F2]"
                            }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Logout di Sudut Kiri Bawah */}
      <div className="px-3.5 py-2.5 border-t border-[#E5E7EB] bg-white shrink-0">
        <button
          type="button"
          onClick={onLogout}
          className="group w-full h-11 pl-1 pr-4 rounded-full bg-transparent hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-150 cursor-pointer flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
          title="Keluar dari akun"
        >
          <div className="w-9 h-9 rounded-full bg-[#2B2D31] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{user.name ? user.name.trim().charAt(0).toUpperCase() : "U"}</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 ml-5 shrink-0">
            <LogOut
              className="w-4 h-4 text-[#181343] group-hover:text-rose-600 transition-colors shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-[#181343] group-hover:text-rose-700 transition-colors whitespace-nowrap">
              Keluar dari akun
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebarContent}
      </aside>

      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

