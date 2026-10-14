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
  Sparkles,
  X,
  ChevronRight,
  ShieldCheck,
  Activity,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PartnerNavMenu } from "./types";

interface NavItem {
  id: PartnerNavMenu;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
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
    opportunities?: number;
    invitations?: number;
    proposals?: number;
    collaborations?: number;
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
          count: counts?.opportunities,
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
          count: counts?.proposals,
        },
        {
          id: "collaborations",
          label: "Kolaborasi Aktif",
          icon: HeartHandshake,
          count: counts?.collaborations,
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
          count: counts?.programs,
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
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 select-none">
      {/* 1. Header & Brand */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-white text-base tracking-tight block truncate">
              CSR Impact Hub
            </span>
            <span className="text-[11px] text-teal-400 font-semibold block truncate">
              {organizationName || "Mitra Pelaksana"}
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Badge Organisasi Mitra */}
      <div className="px-5 py-3 bg-slate-850/60 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Workspace Mitra</span>
        </div>
        <Badge variant="purple" size="sm">
          NGO / Mitra
        </Badge>
      </div>

      {/* 3. Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </h3>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-800 text-teal-400 group-hover:bg-slate-700"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                      {item.badge && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform opacity-0 group-hover:opacity-100 ${
                          isActive ? "opacity-100 text-white" : "text-slate-500"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer User Info & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/90">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-850/70 border border-slate-800 mb-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-sm shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all border border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed left, width 64 = 256px) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
