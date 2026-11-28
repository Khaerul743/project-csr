"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  ChevronRight,
  Bell,
  HelpCircle,
  CheckCircle2,
  Clock,
  FileText,
  Activity,
  CheckCheck,
  X,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Mail,
  FileCheck2,
  Info,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserProfileData } from "./UserProfileModal";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "proposal" | "program" | "collab" | "system";
  actionMenu?: string;
  isRead?: boolean;
}

export interface DashboardHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  onOpenMobileSidebar: () => void;
  rightAction?: React.ReactNode;
  onNavigateMenu?: (menu: string) => void;
  organizationName?: string;
  user?: UserProfileData;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  notifications?: NotificationItem[];
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Proposal Baru Masuk",
    description: "Yayasan Lentera Bangsa mengajukan proposal untuk program Reboisasi Hutan Mangrove.",
    time: "2 jam yang lalu",
    type: "proposal",
    actionMenu: "proposals",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "Laporan Aktivitas Butuh Verifikasi",
    description: "Mitra pelaksana mengunggah bukti realisasi penyaluran beasiswa termin I.",
    time: "5 jam yang lalu",
    type: "program",
    actionMenu: "programs",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "Kesepakatan MoU Siap Ditandatangani",
    description: "Dokumen kesepakatan final untuk program Sanitasi Air Bersih telah diterbitkan.",
    time: "1 hari yang lalu",
    type: "collab",
    actionMenu: "collaborations",
    isRead: false,
  },
];

export function DashboardHeader({
  breadcrumbs,
  title,
  onOpenMobileSidebar,
  rightAction,
  onNavigateMenu,
  user,
  onOpenProfile,
  onLogout,
  notifications: customNotifications,
}: DashboardHeaderProps) {
  // Popover States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<"flow" | "verification" | "monitoring" | "support">("flow");

  // Notifications State
  const roleDefaultNotifications = React.useMemo(() => {
    if (user?.role === "MANAGEMENT") {
      return DEFAULT_NOTIFICATIONS.filter(
        (n) => n.actionMenu !== "proposals" && n.actionMenu !== "collaborations"
      ).map((n) =>
        n.id === "notif-2"
          ? {
              ...n,
              title: "Pemantauan Laporan Aktivitas",
              description:
                "Mitra pelaksana mengunggah bukti realisasi kegiatan yang sedang ditinjau tim CSR.",
            }
          : n
      );
    }
    return DEFAULT_NOTIFICATIONS;
  }, [user?.role]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    customNotifications !== undefined ? customNotifications : roleDefaultNotifications
  );

  useEffect(() => {
    if (customNotifications !== undefined) {
      setNotifications(customNotifications);
    } else {
      setNotifications(roleDefaultNotifications);
    }
  }, [customNotifications, roleDefaultNotifications]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle outside clicks to close popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        helpRef.current &&
        !helpRef.current.contains(event.target as Node)
      ) {
        setIsHelpOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle ESC key to close popovers & modal
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
        setIsHelpOpen(false);
        setIsUserMenuOpen(false);
        setIsHelpModalOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setIsNotificationOpen(false);

    if (item.actionMenu && onNavigateMenu) {
      onNavigateMenu(item.actionMenu);
    }
  };

  // Compute active breadcrumbs list
  const activeBreadcrumbs: BreadcrumbItem[] =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : [{ label: "Dashboard" }, { label: title || "Ringkasan" }];

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#DBEAFE]/90 px-4 sm:px-6 lg:px-8 h-[74px] flex items-center justify-between select-none shadow-2xs">
        {/* 1. Sisi Kiri: Hamburger Mobile & Dynamic Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-3 sm:mr-6 overflow-hidden">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 hover:text-[#0A2558] hover:bg-[#EDF6FF] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5]"
            title="Buka Menu Navigasi"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center min-w-0 flex-1 overflow-hidden">
            <ol className="flex items-center flex-nowrap whitespace-nowrap gap-1 sm:gap-1.5 text-xs sm:text-sm min-w-0 w-full overflow-hidden">
              {activeBreadcrumbs.map((crumb, idx) => {
                const isLast = idx === activeBreadcrumbs.length - 1;
                const isClickable = !!crumb.onClick && !isLast;
                const hideOnMobile = activeBreadcrumbs.length > 2 && idx === 0;

                return (
                  <li
                    key={`${crumb.label}-${idx}`}
                    className={`flex items-center ${
                      isLast ? "min-w-0 flex-1 overflow-hidden" : "shrink-0"
                    } ${hideOnMobile ? "hidden sm:flex" : ""}`}
                  >
                    {idx > 0 && (
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-slate-400 mx-1 shrink-0 ${
                          activeBreadcrumbs.length > 2 && idx === 1 ? "hidden sm:block" : ""
                        }`}
                      />
                    )}

                    {isLast ? (
                      <span
                        className="font-bold text-[#0A2558] truncate leading-tight block min-w-0"
                        title={crumb.label}
                        aria-current="page"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={crumb.onClick}
                        disabled={!isClickable}
                        className={`text-slate-600 whitespace-nowrap transition-colors leading-tight ${
                          isClickable
                            ? "hover:text-[#1765F5] hover:underline cursor-pointer"
                            : "cursor-default"
                        }`}
                      >
                        {crumb.label}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* 2. Sisi Kanan: Action Tambahan & Quick Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Optional context action (e.g. Inisiasi Peluang Baru) */}
          {rightAction && <div className="shrink-0">{rightAction}</div>}

          {/* Divider pemisah subtle */}
          {rightAction && (
            <div className="h-6 w-[1px] bg-[#DBEAFE] mx-0.5 hidden sm:block" />
          )}

          {/* Quick Action 1: Notifikasi */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotificationOpen((prev) => !prev);
                setIsHelpOpen(false);
              }}
              className={`relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10519B] ${
                isNotificationOpen
                  ? "bg-gradient-to-r from-[#1A60B0] via-[#10519B] to-[#073E8A] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#0A2558] hover:bg-[#EDF6FF]"
              }`}
              title="Notifikasi & Tugas"
              aria-label="Buka Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            {/* Dropdown Popover Notifikasi */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-[#DBEAFE] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header Dropdown */}
                <div className="p-4 border-b border-[#DBEAFE]/80 flex items-center justify-between bg-[#F8FBFF]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0A2558]">
                      Aktivitas & Notifikasi
                    </span>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF6FF] text-[#0A2558] border border-[#CBE7FD]">
                        {unreadCount} Baru
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Semua Terbaca
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-[#1765F5] hover:text-[#0A2558] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tandai dibaca
                    </button>
                  )}
                </div>

                {/* List Notifikasi */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#EDF6FF]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-[#93C5FD] mx-auto" />
                      <p className="text-xs font-semibold text-[#0A2558]">
                        Tidak ada aktivitas baru
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Semua tugas telah diselesaikan.
                      </p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 sm:p-4 hover:bg-[#F4F9FF] transition-colors cursor-pointer flex gap-3 ${
                          !item.isRead ? "bg-[#EDF6FF]/45" : ""
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {item.type === "proposal" && (
                            <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] border border-[#CBE7FD] text-[#1765F5] flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === "program" && (
                            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700 flex items-center justify-center">
                              <Activity className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === "collab" && (
                            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] border border-emerald-200/70 text-[#047857] flex items-center justify-center">
                              <FileCheck2 className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === "system" && (
                            <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] border border-[#CBE7FD] text-[#0A2558] flex items-center justify-center">
                              <Info className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`text-xs truncate ${
                                !item.isRead
                                  ? "font-bold text-[#0A2558]"
                                  : "font-semibold text-slate-700"
                              }`}
                            >
                              {item.title}
                            </h4>
                            {!item.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1765F5] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Dropdown */}
                <div className="p-3 bg-[#F8FBFF] border-t border-[#DBEAFE]/80 text-center">
                  <span className="text-[11px] text-slate-600">
                    Sistem audit & pencatatan aktivitas SIPENA
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action 2: Bantuan & Panduan */}
          <div className="relative" ref={helpRef}>
            <button
              type="button"
              onClick={() => {
                setIsHelpOpen((prev) => !prev);
                setIsNotificationOpen(false);
              }}
              className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10519B] ${
                isHelpOpen
                  ? "bg-gradient-to-r from-[#1A60B0] via-[#10519B] to-[#073E8A] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#0A2558] hover:bg-[#EDF6FF]"
              }`}
              title="Pusat Bantuan & Panduan"
              aria-label="Buka Panduan"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Dropdown Popover Bantuan */}
            {isHelpOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-[#DBEAFE] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header Dropdown */}
                <div className="p-4 border-b border-[#DBEAFE]/80 bg-[#F8FBFF]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A60B0] to-[#073E8A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      ?
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#0A2558]">
                        Pusat Bantuan SIPENA
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        Panduan penggunaan platform & tata kelola CSR
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Opsi Bantuan */}
                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHelpOpen(false);
                      setActiveHelpTab("flow");
                      setIsHelpModalOpen(true);
                    }}
                    className="w-full p-2.5 rounded-2xl text-left hover:bg-[#EDF6FF]/70 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] border border-[#CBE7FD] text-[#1765F5] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1765F5] group-hover:text-white transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0A2558] group-hover:text-[#1765F5]">
                        Alur Tata Kelola CSR
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Tahapan inisiasi peluang, seleksi proposal, hingga penerbitan MoU.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsHelpOpen(false);
                      setActiveHelpTab("verification");
                      setIsHelpModalOpen(true);
                    }}
                    className="w-full p-2.5 rounded-2xl text-left hover:bg-[#EDF6FF]/70 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] border border-emerald-200/80 text-[#047857] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#047857] group-hover:text-white transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0A2558] group-hover:text-[#065F46]">
                        Verifikasi Mitra & Dokumen
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Standar kurasi administratif dan kepatuhan legalitas yayasan/NGO.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsHelpOpen(false);
                      setActiveHelpTab("monitoring");
                      setIsHelpModalOpen(true);
                    }}
                    className="w-full p-2.5 rounded-2xl text-left hover:bg-[#EDF6FF]/70 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0A2558] group-hover:text-amber-800">
                        Monitoring & Dampak ESG
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Format pelaporan capaian penerima manfaat dan realisasi anggaran.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsHelpOpen(false);
                      setActiveHelpTab("support");
                      setIsHelpModalOpen(true);
                    }}
                    className="w-full p-2.5 rounded-2xl text-left hover:bg-[#EDF6FF]/70 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-[#0A2558] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#0A2558] group-hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0A2558]">
                        Kontak Tim Dukungan SIPENA
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Hubungi tim helpdesk untuk pendampingan teknis dan demo sistem.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action 3: Profil Pengguna Dropdown */}
          {user && (
            <div ref={userMenuRef} className="relative pl-1 sm:pl-2 border-l border-[#DBEAFE]">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-[#EDF6FF] transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5]"
                title="Buka Menu Akun"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-[#0A2558] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs overflow-hidden border border-[#CBE7FD]">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>
                <div className="hidden md:block text-left max-w-[140px]">
                  <span className="text-xs font-bold text-[#0A2558] block truncate leading-tight group-hover:text-[#1765F5]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-600 block truncate">
                    {user.position || (user.role === "SUPER_ADMIN" ? "Super Admin" : user.role)}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* User Account Dropdown Popover */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-xl border border-[#DBEAFE] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {/* Account Summary */}
                  <div className="p-4 bg-[#F8FBFF] border-b border-[#DBEAFE]/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0A2558] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-[#CBE7FD]">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#0A2558] block truncate">
                          {user.name}
                        </span>
                        <span className="text-[11px] text-slate-600 block truncate">
                          {user.email}
                        </span>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF6FF] text-[#0A2558] border border-[#CBE7FD]">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-1">
                    {onOpenProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#EDF6FF] hover:text-[#1765F5] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#0A2558] cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Pengaturan Akun</span>
                      </button>
                    )}

                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-2.5 text-xs font-semibold text-rose-600 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Keluar dari Akun</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MODAL PANDUAN LENGKAP PLATFORM SIPENA */}
      {/* ========================================================================= */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DBEAFE] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#DBEAFE]/80 flex items-center justify-between bg-[#F8FBFF]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDF6FF] border border-[#CBE7FD] text-[#1765F5] flex items-center justify-center font-bold text-sm shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0A2558]">
                    Panduan Platform SIPENA
                  </h3>
                  <p className="text-xs text-slate-600">
                    Tata kelola kolaborasi CSR, kurasi mitra, dan monitoring dampak
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-[#0A2558] hover:bg-[#EDF6FF] transition-colors cursor-pointer"
                aria-label="Tutup Panduan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-[#DBEAFE]/80 px-6 bg-white overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveHelpTab("flow")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeHelpTab === "flow"
                    ? "border-[#1765F5] text-[#1765F5]"
                    : "border-transparent text-slate-600 hover:text-[#0A2558]"
                }`}
              >
                Alur Kerja CSR
              </button>
              <button
                type="button"
                onClick={() => setActiveHelpTab("verification")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeHelpTab === "verification"
                    ? "border-[#1765F5] text-[#1765F5]"
                    : "border-transparent text-slate-600 hover:text-[#0A2558]"
                }`}
              >
                Verifikasi Mitra
              </button>
              <button
                type="button"
                onClick={() => setActiveHelpTab("monitoring")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeHelpTab === "monitoring"
                    ? "border-[#1765F5] text-[#1765F5]"
                    : "border-transparent text-slate-600 hover:text-[#0A2558]"
                }`}
              >
                Monitoring & ESG
              </button>
              <button
                type="button"
                onClick={() => setActiveHelpTab("support")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeHelpTab === "support"
                    ? "border-[#1765F5] text-[#1765F5]"
                    : "border-transparent text-slate-600 hover:text-[#0A2558]"
                }`}
              >
                Kontak Bantuan
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600">
              {activeHelpTab === "flow" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#EDF6FF] border border-[#CBE7FD] flex items-start gap-3">
                    <Info className="w-4 h-4 text-[#1765F5] shrink-0 mt-0.5" />
                    <p className="text-[#0A2558] font-medium">
                      Platform SIPENA mendigitalisasi siklus kolaborasi program CSR dari inisiasi awal hingga pelaporan akhir yang akuntabel.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-[#DBEAFE] bg-white">
                      <span className="font-bold text-[#0A2558] block text-xs mb-1">
                        1. Inisiasi Peluang CSR (Opportunities)
                      </span>
                      <p className="text-slate-600">
                        Perusahaan mempublikasikan kebutuhan inisiatif CSR beserta anggaran indikatif, target lokasi, dan pilar SDGs/ESG yang dituju.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#DBEAFE] bg-white">
                      <span className="font-bold text-[#0A2558] block text-xs mb-1">
                        2. Kurasi Mitra & Pengajuan Proposal
                      </span>
                      <p className="text-slate-600">
                        Mitra pelaksana yang terverifikasi mengajukan proposal teknis beserta Rencana Anggaran Biaya (RAB) yang transparan.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#DBEAFE] bg-white">
                      <span className="font-bold text-[#0A2558] block text-xs mb-1">
                        3. Negosiasi & Penerbitan Kontrak MoU
                      </span>
                      <p className="text-slate-600">
                        Penyelarasan target milestone, persetujuan alokasi dana, dan penandatanganan nota kesepahaman secara resmi.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#DBEAFE] bg-white">
                      <span className="font-bold text-[#0A2558] block text-xs mb-1">
                        4. Monitoring Pelaksanaan & Evaluasi Dampak
                      </span>
                      <p className="text-slate-600">
                        Pelaporan aktivitas bertahap oleh mitra lapangan yang diverifikasi oleh tim perusahaan, disertai rekapitulasi data dampak riil.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeHelpTab === "verification" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-200 flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
                    <p className="text-[#065F46] font-medium">
                      Kurasi administratif memastikan setiap mitra pelaksana memiliki legalitas resmi dan rekam jejak pelaksanaan program yang kredibel.
                    </p>
                  </div>

                  <ul className="space-y-2.5 list-disc list-inside text-slate-600 pl-1">
                    <li>
                      <strong className="text-[#0A2558]">Legalitas Organisasi:</strong> Memeriksa keabsahan Akta Notaris, SK Kemenkumham, serta NPWP lembaga.
                    </li>
                    <li>
                      <strong className="text-[#0A2558]">Portofolio Pengalaman:</strong> Evaluasi riwayat program kerja yang pernah diselesaikan mitra di bidang terkait.
                    </li>
                    <li>
                      <strong className="text-[#0A2558]">Kepatuhan Administrasi:</strong> Dokumen rekening bank atas nama lembaga dan pakta integritas pelaksanaan program.
                    </li>
                  </ul>
                </div>
              )}

              {activeHelpTab === "monitoring" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <Activity className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-amber-900 font-medium">
                      Monitoring progres program berbasis aktivitas nyata di lapangan dengan pencatatan serapan dana dan dokumentasi kegiatan.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-[#DBEAFE]">
                      <h4 className="font-bold text-[#0A2558] mb-1">Verifikasi Bertahap</h4>
                      <p className="text-slate-600">
                        Pencairan dana per termin terikat pada verifikasi laporan aktivitas lapangan yang diunggah oleh mitra pelaksana.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-[#DBEAFE]">
                      <h4 className="font-bold text-[#0A2558] mb-1">Metrik Capaian ESG</h4>
                      <p className="text-slate-600">
                        Data penerima manfaat, jam pelatihan, dan indikator lingkungan terkompilasi otomatis ke dalam modul laporan keberlanjutan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeHelpTab === "support" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#F4F9FF] border border-[#DBEAFE] space-y-3">
                    <h4 className="text-sm font-bold text-[#0A2558]">
                      Layanan Bantuan & Dukungan Teknis SIPENA
                    </h4>
                    <p className="text-slate-600">
                      Jika Anda membutuhkan konsultasi tata kelola, kendala sistem, atau bantuan onboarding akun organisasi:
                    </p>

                    <div className="pt-2 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#1765F5]" />
                        <span className="text-slate-600">Email Helpdesk:</span>
                        <a
                          href="mailto:support@sipena.id"
                          className="font-bold text-[#0A2558] hover:text-[#1765F5] hover:underline"
                        >
                          support@sipena.id
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#1765F5]" />
                        <span className="text-slate-600">Jam Layanan:</span>
                        <span className="font-semibold text-slate-700">
                          Senin - Jumat, 09:00 - 17:00 WIB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#DBEAFE]/80 bg-[#F8FBFF] flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="min-h-[40px] px-5 py-2 rounded-full bg-gradient-to-r from-[#1A60B0] via-[#10519B] to-[#073E8A] text-white font-bold text-xs hover:brightness-105 transition-all cursor-pointer shadow-sm shadow-[#10519B]/20"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
