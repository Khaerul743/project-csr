"use client";

import React from "react";
import {
  LayoutDashboard,
  Compass,
  FileText,
  HeartHandshake,
  Inbox,
  Building2,
  LogOut,
  X,
  Activity,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppLogo } from "@/components/ui/app-logo";
import { PartnerNavMenu } from "./types";

interface NavItem {
  id: PartnerNavMenu;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface PartnerSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  organizationName?: string;
  activeMenu: PartnerNavMenu;
  onSelectMenu: (menu: PartnerNavMenu) => void;
  counts?: {
    invitations?: number;
    proposals?: number;
    programs?: number;
  };
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export function PartnerSidebar({
  user,
  organizationName,
  activeMenu,
  onSelectMenu,
  counts,
  isOpenMobile,
  onCloseMobile,
  onLogout,
}: PartnerSidebarProps) {
  const navigationSections: NavSection[] = [
    {
      title: "UTAMA",
      items: [
        {
          id: "overview",
          label: "Ringkasan",
          icon: LayoutDashboard,
        },
        {
          id: "explore",
          label: "Eksplorasi Peluang",
          icon: Compass,
        },
      ],
    },
    {
      title: "KEMITRAAN & PENGAJUAN",
      items: [
        {
          id: "invitations",
          label: "Undangan Masuk",
          icon: Inbox,
          count: counts?.invitations,
        },
        {
          id: "proposals",
          label: "Proposal Saya",
          icon: FileText,
        },
        {
          id: "collaborations",
          label: "Kolaborasi Aktif",
          icon: HeartHandshake,
        },
        {
          id: "conversations",
          label: "Pesan & Negosiasi",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: "PELAKSANAAN & DAMPAK",
      items: [
        {
          id: "programs",
          label: "Pelaksanaan Program",
          icon: Activity,
        },
        {
          id: "analytics",
          label: "Laporan & Dampak ESG",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "ORGANISASI",
      items: [
        {
          id: "profile",
          label: "Profil Lembaga",
          icon: Building2,
        },
      ],
    },
  ];

  const handleItemClick = (id: PartnerNavMenu) => {
    onSelectMenu(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-[#181343] border-r border-[#E5E7EB] select-none">
      {/* 1. Header & Brand */}
      <div className="h-[72px] px-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <AppLogo
          size="md"
          theme="light"
          subtitle={organizationName || "Mitra Pelaksana"}
        />

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-[#181343] hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Badge Organisasi Mitra */}
      <div className="px-5 py-2.5 bg-[#F4F4F6] border-b border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#181343] font-medium">Workspace Mitra</span>
        </div>
        <Badge variant="emerald" size="sm" className="font-bold">
          NGO / Mitra
        </Badge>
      </div>

      {/* 3. Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </h3>
            <div className="space-y-1 pt-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? "bg-[#181343] text-white shadow-xs font-bold"
                        : "text-[#181343] hover:bg-[#F4F4F6] hover:text-[#181343]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-[#787680] group-hover:text-[#181343]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold leading-none shrink-0 transition-colors ${
                            isActive
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

      {/* 4. Footer User Info & Logout */}
      <div className="p-4 border-t border-[#E5E7EB] bg-white space-y-3">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F4F4F6] border border-[#E5E7EB] mb-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#181343] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#181343] truncate leading-tight">{user.name}</p>
            <p className="text-[11px] text-[#787680] truncate mt-0.5">{user.email}</p>
          </div>
          <Badge variant="purple" size="sm" className="shrink-0 text-[10px] font-bold">
            Mitra
          </Badge>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#787680] hover:text-rose-600 hover:bg-rose-50/80 transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed left, width 64 = 256px) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
