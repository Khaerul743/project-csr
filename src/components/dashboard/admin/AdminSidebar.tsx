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
import { Badge } from "@/components/ui/badge";
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
      title: "Utama",
      items: [
        {
          id: "overview",
          label: "Ringkasan Platform",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Ekosistem & Pengguna",
      items: [
        {
          id: "companies",
          label: "Perusahaan Sponsor",
          icon: Building2,
          count: counts?.unverifiedCompanies,
        },
        {
          id: "partners",
          label: "Mitra Pelaksana (NGO)",
          icon: HeartHandshake,
          count: counts?.unverifiedPartners,
        },
        {
          id: "users",
          label: "Pengguna Sistem",
          icon: Users,
        },
      ],
    },
    {
      title: "Pengawasan & Moderasi",
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
      title: "Sistem & Tata Kelola",
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
    <div className="flex flex-col h-full bg-white text-[#181343] border-r border-slate-200">
      {/* Header & Brand */}
      <div className="h-[72px] px-5 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <AppLogo size="md" theme="light" subtitle="Platform Oversight" />
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Tutup Menu Navigasi"
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-[#181343] hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav aria-label="Menu Super Admin" className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h2 className="px-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] ${
                      isActive
                        ? "bg-[#181343] text-white font-bold"
                        : "text-[#181343] hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-slate-600"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </span>

                    <span className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`min-w-[20px] h-[20px] px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-bold leading-none ${
                            isActive
                              ? "bg-emerald-500 text-white"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer User Profile & Logout */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenProfile}
          disabled={!onOpenProfile}
          className="w-full min-h-[44px] text-left flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-[#181343] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user.name ? user.name.charAt(0).toUpperCase() : "A")
              )}
            </span>
            <span className="min-w-0 block">
              <span className="text-xs font-bold text-[#181343] block truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-600 block truncate">
                {user.position || user.email}
              </span>
            </span>
          </span>
          <Badge variant="navy" size="sm" className="shrink-0 text-[10px]">
            Super Admin
          </Badge>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 xl:w-72 z-30">
        {sidebarContent}
      </aside>

      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/50 transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

