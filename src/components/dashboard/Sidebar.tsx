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
  Activity,
  BarChart3,
  MessageSquare,
  Sparkles,
  Wallet,
  Award,
  MessageSquareHeart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppLogo } from "@/components/ui/app-logo";

export type CompanyNavMenu =
  | "overview"
  | "chat"
  | "opportunities"
  | "partners"
  | "proposals"
  | "collaborations"
  | "conversations"
  | "programs"
  | "finances"
  | "partner-performance"
  | "sentiment"
  | "analytics"
  | "team"
  | "profile";

interface NavItem {
  id: CompanyNavMenu;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    phone?: string | null;
    position?: string | null;
  };
  organizationName?: string;
  activeMenu: CompanyNavMenu;
  onSelectMenu: (menu: CompanyNavMenu) => void;
  counts?: {
    proposals?: number;
    programs?: number;
  };
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
}

import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";

export function Sidebar({
  user,
  organizationName,
  activeMenu,
  onSelectMenu,
  counts,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  onOpenProfile,
}: SidebarProps) {
  const isManagement = user.role === "MANAGEMENT";
  const aiEnabled = isAiFeatureEnabled();

  const navigationSections: NavSection[] = isManagement
    ? [
        {
          title: "PENGAWASAN EKSEKUTIF",
          items: [
            {
              id: "overview" as CompanyNavMenu,
              label: "Ringkasan",
              icon: LayoutDashboard,
            },
            {
              id: "programs" as CompanyNavMenu,
              label: "Pengawasan Program",
              icon: Activity,
              count: counts?.programs,
            },
            {
              id: "finances" as CompanyNavMenu,
              label: "Pengawasan Anggaran",
              icon: Wallet,
            },
            {
              id: "partner-performance" as CompanyNavMenu,
              label: "Kinerja Mitra",
              icon: Award,
            },
            {
              id: "sentiment" as CompanyNavMenu,
              label: "Suara Warga & Sentimen",
              icon: MessageSquareHeart,
            },
            {
              id: "analytics" as CompanyNavMenu,
              label: "Laporan & Dampak ESG",
              icon: BarChart3,
            },
          ],
        },
        {
          title: "INISIATIF & MITRA",
          items: [
            {
              id: "opportunities" as CompanyNavMenu,
              label: "Katalog Peluang CSR",
              icon: FileText,
            },
            {
              id: "partners" as CompanyNavMenu,
              label: "Direktori Mitra",
              icon: HeartHandshake,
            },
          ],
        },
        ...(aiEnabled
          ? [
              {
                title: "KONSULTASI STRATEGIS",
                items: [
                  {
                    id: "chat" as CompanyNavMenu,
                    label: "AI CSR Advisor",
                    icon: Sparkles,
                  },
                ],
              },
            ]
          : []),
        {
          title: "TATA KELOLA KORPORAT",
          items: [
            {
              id: "team" as CompanyNavMenu,
              label: "Anggota Tim",
              icon: Users,
            },
            {
              id: "profile" as CompanyNavMenu,
              label: "Profil Perusahaan",
              icon: Building2,
            },
          ],
        },
      ]
    : [
        {
          title: "UTAMA",
          items: [
            {
              id: "overview" as CompanyNavMenu,
              label: "Ringkasan",
              icon: LayoutDashboard,
            },
            ...(aiEnabled
              ? [
                  {
                    id: "chat" as CompanyNavMenu,
                    label: "AI CSR Advisor",
                    icon: Sparkles,
                  },
                ]
              : []),
            {
              id: "opportunities" as CompanyNavMenu,
              label: "Peluang CSR",
              icon: FileText,
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
            },
            {
              id: "proposals" as CompanyNavMenu,
              label: "Kelola Proposal",
              icon: Inbox,
              count: counts?.proposals,
            },
            {
              id: "collaborations" as CompanyNavMenu,
              label: "Kolaborasi & MoU",
              icon: FileCheck2,
            },
            {
              id: "conversations" as CompanyNavMenu,
              label: "Pesan & Negosiasi",
              icon: MessageSquare,
            },
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
              id: "finances" as CompanyNavMenu,
              label: "Pengawasan Anggaran",
              icon: Wallet,
            },
            {
              id: "partner-performance" as CompanyNavMenu,
              label: "Kinerja Mitra",
              icon: Award,
            },
            {
              id: "sentiment" as CompanyNavMenu,
              label: "Suara Warga & Sentimen",
              icon: MessageSquareHeart,
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
    <div className="flex flex-col h-full bg-white text-[#181343] border-r border-[#E5E7EB] select-none">
      {/* 1. Header & Brand - Tepat h-[72px], Nama Perusahaan di bawah SIPENA dengan Truncate (...) */}
      <div className="h-[72px] px-5 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
        <AppLogo
          size="md"
          theme="light"
          subtitle={organizationName || "Workspace Perusahaan"}
          className="min-w-0 flex-1"
        />

        {/* Close button on mobile */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-[#181343] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 pb-8 space-y-6">
        {navigationSections.map((section) => (
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
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 bg-white">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
