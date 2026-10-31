"use client";

import React from "react";
import {
  LayoutDashboard,
  FileText,
  HeartHandshake,
  Users,
  Inbox,
  FileCheck2,
  Building2,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  Activity,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppLogo } from "@/components/ui/app-logo";

export type CompanyNavMenu =
  | "overview"
  | "opportunities"
  | "partners"
  | "proposals"
  | "collaborations"
  | "conversations"
  | "programs"
  | "analytics"
  | "team"
  | "profile";

interface NavItem {
  id: CompanyNavMenu;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  organizationName?: string;
  activeMenu: CompanyNavMenu;
  onSelectMenu: (menu: CompanyNavMenu) => void;
  counts?: {
    opportunities?: number;
    partners?: number;
    team?: number;
    proposals?: number;
    collaborations?: number;
    programs?: number;
  };
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export function Sidebar({
  user,
  organizationName,
  activeMenu,
  onSelectMenu,
  counts,
  isOpenMobile,
  onCloseMobile,
  onLogout,
}: SidebarProps) {
  const isManagement = user.role === "MANAGEMENT";

  const navigationSections: NavSection[] = [
    {
      title: "UTAMA",
      items: [
        {
          id: "overview" as CompanyNavMenu,
          label: "Ringkasan",
          icon: LayoutDashboard,
        },
        {
          id: "opportunities" as CompanyNavMenu,
          label: "Peluang CSR",
          icon: FileText,
          count: counts?.opportunities,
        },
      ],
    },
    {
      title: "KOLABORASI & MITRA",
      items: [
        {
          id: "partners" as CompanyNavMenu,
          label: "Kurasi Mitra",
          icon: HeartHandshake,
          count: counts?.partners,
        },
        {
          id: "proposals" as CompanyNavMenu,
          label: "Proposal Masuk",
          icon: Inbox,
          count: counts?.proposals,
        },
        {
          id: "collaborations" as CompanyNavMenu,
          label: "Kolaborasi & MoU",
          icon: FileCheck2,
          count: counts?.collaborations,
        },
        ...(!isManagement
          ? [
              {
                id: "conversations" as CompanyNavMenu,
                label: "Pesan & Negosiasi",
                icon: MessageSquare,
              },
            ]
          : []),
      ],
    },
    {
      title: "PELAKSANAAN & DAMPAK",
      items: [
        {
          id: "programs" as CompanyNavMenu,
          label: "Pelaksanaan Program",
          icon: Activity,
          count: counts?.programs,
        },
        {
          id: "analytics" as CompanyNavMenu,
          label: "Laporan & Dampak ESG",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "ORGANISASI",
      items: [
        {
          id: "team" as CompanyNavMenu,
          label: "Anggota Tim",
          icon: Users,
          count: counts?.team,
        },
        {
          id: "profile" as CompanyNavMenu,
          label: "Profil Perusahaan",
          icon: Building2,
        },
      ],
    },
  ];

  const handleItemClick = (id: CompanyNavMenu) => {
    onSelectMenu(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#120E33] text-slate-200 border-r border-[#26224C] select-none">
      {/* 1. Header & Brand */}
      <div className="p-5 border-b border-[#26224C]/80 flex items-center justify-between">
        <AppLogo
          size="md"
          theme="dark"
          subtitle={organizationName || "Workspace Perusahaan"}
        />

        {/* Close button on mobile */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#26224C]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </span>

            <div className="space-y-1 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-white/12 text-white shadow-xs border-l-3 border-emerald-500 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/6"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-emerald-400" : "text-slate-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? "bg-emerald-600 text-white"
                              : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}

                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-[#26224C] text-slate-300 border border-white/10">
                          {item.badge}
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

      {/* 3. Footer: User Profile & Logout */}
      <div className="p-4 border-t border-[#26224C] bg-[#0E0B28] space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#181343] border border-white/15 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                {user.email}
              </span>
            </div>
          </div>

          <Badge
            variant={isManagement ? "navy" : "emerald"}
            size="sm"
            className="shrink-0 text-[10px] bg-white/10 text-white border-white/20"
          >
            {user.role}
          </Badge>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky fixed on left) */}
      <aside className="hidden lg:block w-64 xl:w-72 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
