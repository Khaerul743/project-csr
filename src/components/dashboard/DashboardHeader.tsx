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
  notifications: customNotifications,
}: DashboardHeaderProps) {
  // Popover States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<"flow" | "verification" | "monitoring" | "support">("flow");

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    customNotifications !== undefined ? customNotifications : DEFAULT_NOTIFICATIONS
  );

  useEffect(() => {
    if (customNotifications !== undefined) {
      setNotifications(customNotifications);
    }
  }, [customNotifications]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

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
      <header className="sticky top-0 z-20 w-full bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between select-none">
        {/* 1. Sisi Kiri: Hamburger Mobile & Dynamic Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-[#181343] hover:bg-[#F4F4F6] transition-colors cursor-pointer"
            title="Buka Menu Navigasi"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center min-w-0">
            <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5 text-xs sm:text-sm">
              {activeBreadcrumbs.map((crumb, idx) => {
                const isLast = idx === activeBreadcrumbs.length - 1;
                const isClickable = !!crumb.onClick && !isLast;

                return (
                  <li key={`${crumb.label}-${idx}`} className="flex items-center min-w-0">
                    {idx > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
                    )}

                    {isLast ? (
                      <span
                        className="font-bold text-[#181343] truncate leading-tight"
                        aria-current="page"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={crumb.onClick}
                        disabled={!isClickable}
                        className={`text-slate-500 transition-colors truncate leading-tight ${
                          isClickable
                            ? "hover:text-[#181343] hover:underline cursor-pointer"
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
            <div className="h-6 w-[1px] bg-[#E5E7EB] mx-0.5 hidden sm:block" />
          )}

          {/* Quick Action 1: Notifikasi */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotificationOpen((prev) => !prev);
                setIsHelpOpen(false);
              }}
              className={`relative p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                isNotificationOpen
                  ? "bg-[#181343] text-white shadow-xs"
                  : "text-slate-500 hover:text-[#181343] hover:bg-[#F4F4F6]"
              }`}
              title="Notifikasi & Tugas"
              aria-label="Buka Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            {/* Dropdown Popover Notifikasi */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header Dropdown */}
                <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9F9FB]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#181343]">
                      Aktivitas & Notifikasi
                    </span>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECEAF8] text-[#181343] border border-[#D8D2F2]">
                        {unreadCount} Baru
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                        Semua Terbaca
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tandai dibaca
                    </button>
                  )}
                </div>

                {/* List Notifikasi */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E7EB]/60">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">
                        Tidak ada aktivitas baru
                      </p>
                      <p className="text-[11px]">
                        Semua tugas telah diselesaikan.
                      </p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 sm:p-4 hover:bg-[#F4F4F6] transition-colors cursor-pointer flex gap-3 ${
                          !item.isRead ? "bg-indigo-50/20" : ""
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {item.type === "proposal" && (
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === "program" && (
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                              <Activity className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === "collab" && (
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <FileCheck2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`text-xs truncate ${
                                !item.isRead
                                  ? "font-bold text-[#181343]"
                                  : "font-semibold text-slate-700"
                              }`}
                            >
                              {item.title}
                            </h4>
                            {!item.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Dropdown */}
                <div className="p-3 bg-[#F9F9FB] border-t border-[#E5E7EB] text-center">
                  <span className="text-[11px] text-slate-500">
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
              className={`p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                isHelpOpen
                  ? "bg-[#181343] text-white shadow-xs"
                  : "text-slate-500 hover:text-[#181343] hover:bg-[#F4F4F6]"
              }`}
              title="Pusat Bantuan & Panduan"
              aria-label="Buka Panduan"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Dropdown Popover Bantuan */}
            {isHelpOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header Dropdown */}
                <div className="p-4 border-b border-[#E5E7EB] bg-[#F9F9FB]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#181343] text-white flex items-center justify-center font-bold text-xs">
                      ?
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#181343]">
                        Pusat Bantuan SIPENA
                      </h3>
                      <p className="text-[11px] text-slate-500">
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
                    className="w-full p-2.5 rounded-xl text-left hover:bg-[#F4F4F6] transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#181343] group-hover:text-white transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#181343] group-hover:text-indigo-900">
                        Alur Tata Kelola CSR
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
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
                    className="w-full p-2.5 rounded-xl text-left hover:bg-[#F4F4F6] transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#181343] group-hover:text-white transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#181343] group-hover:text-emerald-900">
                        Verifikasi Mitra & Dokumen
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
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
                    className="w-full p-2.5 rounded-xl text-left hover:bg-[#F4F4F6] transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#181343] group-hover:text-white transition-colors">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#181343] group-hover:text-amber-900">
                        Monitoring & Dampak ESG
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
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
                    className="w-full p-2.5 rounded-xl text-left hover:bg-[#F4F4F6] transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#181343] group-hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#181343]">
                        Kontak Tim Dukungan SIPENA
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Hubungi tim helpdesk untuk pendampingan teknis dan demo sistem.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action 3: Profil Pengguna */}
          {user && (
            <div className="relative pl-1 sm:pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-[#F4F4F6] transition-colors cursor-pointer group"
                title="Buka Pengaturan Profil Akun"
              >
                <div className="w-8 h-8 rounded-full bg-[#181343] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs overflow-hidden border border-slate-200">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>
                <div className="hidden md:block text-left max-w-[130px]">
                  <span className="text-xs font-bold text-[#181343] block truncate leading-tight group-hover:text-indigo-950">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-600 block truncate">
                    {user.position || (user.role === "SUPER_ADMIN" ? "Super Admin" : user.role)}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MODAL PANDUAN LENGKAP PLATFORM SIPENA */}
      {/* ========================================================================= */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9F9FB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#181343] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#181343]">
                    Panduan Platform SIPENA
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tata kelola kolaborasi CSR, kurasi mitra, dan monitoring dampak
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-[#181343] hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Tutup Panduan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-[#E5E7EB] px-6 bg-white overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveHelpTab("flow")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeHelpTab === "flow"
                    ? "border-[#181343] text-[#181343]"
                    : "border-transparent text-slate-500 hover:text-[#181343]"
                }`}
              >
                Alur Kerja CSR
              </button>
              <button
                type="button"
                onClick={() => setActiveHelpTab("verification")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeHelpTab === "verification"
                    ? "border-[#181343] text-[#181343]"
                    : "border-transparent text-slate-500 hover:text-[#181343]"
                }`}
              >
                Verifikasi Mitra
              </button>
              <button
                type="button"
                onClick={() => setActiveHelpTab("monitoring")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeHelpTab === "monitoring"
                    ? "border-[#181343] text-[#181343]"
                    : "border-transparent text-slate-500 hover:text-[#181343]"
                }`}
              >
                Monitoring & ESG
              </button>
              <button
                type="button"
                onClick={() => setActiveHelpTab("support")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeHelpTab === "support"
                    ? "border-[#181343] text-[#181343]"
                    : "border-transparent text-slate-500 hover:text-[#181343]"
                }`}
              >
                Kontak Bantuan
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600">
              {activeHelpTab === "flow" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
                    <Info className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                    <p className="text-indigo-950 font-medium">
                      Platform SIPENA mendigitalisasi siklus kolaborasi program CSR dari inisiasi awal hingga pelaporan akhir yang akuntabel.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white">
                      <span className="font-bold text-[#181343] block text-xs mb-1">
                        1. Inisiasi Peluang CSR (Opportunities)
                      </span>
                      <p className="text-slate-500">
                        Perusahaan mempublikasikan kebutuhan inisiatif CSR beserta anggaran indikatif, target lokasi, dan pilar SDGs/ESG yang dituju.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white">
                      <span className="font-bold text-[#181343] block text-xs mb-1">
                        2. Kurasi Mitra & Pengajuan Proposal
                      </span>
                      <p className="text-slate-500">
                        Mitra pelaksana yang terverifikasi mengajukan proposal teknis beserta Rencana Anggaran Biaya (RAB) yang transparan.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white">
                      <span className="font-bold text-[#181343] block text-xs mb-1">
                        3. Negosiasi & Penerbitan Kontrak MoU
                      </span>
                      <p className="text-slate-500">
                        Penyelarasan target milestone, persetujuan alokasi dana, dan penandatanganan nota kesepahaman secara resmi.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white">
                      <span className="font-bold text-[#181343] block text-xs mb-1">
                        4. Monitoring Pelaksanaan & Evaluasi Dampak
                      </span>
                      <p className="text-slate-500">
                        Pelaporan aktivitas bertahap oleh mitra lapangan yang diverifikasi oleh tim perusahaan, disertai rekapitulasi data dampak riil.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeHelpTab === "verification" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="text-emerald-950 font-medium">
                      Kurasi administratif memastikan setiap mitra pelaksana memiliki legalitas resmi dan rekam jejak pelaksanaan program yang kredibel.
                    </p>
                  </div>

                  <ul className="space-y-2.5 list-disc list-inside text-slate-600 pl-1">
                    <li>
                      <strong className="text-[#181343]">Legalitas Organisasi:</strong> Memeriksa keabsahan Akta Notaris, SK Kemenkumham, serta NPWP lembaga.
                    </li>
                    <li>
                      <strong className="text-[#181343]">Portofolio Pengalaman:</strong> Evaluasi riwayat program kerja yang pernah diselesaikan mitra di bidang terkait.
                    </li>
                    <li>
                      <strong className="text-[#181343]">Kepatuhan Administrasi:</strong> Dokumen rekening bank atas nama lembaga dan pakta integritas pelaksanaan program.
                    </li>
                  </ul>
                </div>
              )}

              {activeHelpTab === "monitoring" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-3">
                    <Activity className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-amber-950 font-medium">
                      Monitoring progres program berbasis aktivitas nyata di lapangan dengan pencatatan serapan dana dan dokumentasi kegiatan.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-[#E5E7EB]">
                      <h4 className="font-bold text-[#181343] mb-1">Verifikasi Bertahap</h4>
                      <p className="text-slate-500">
                        Pencairan dana per termin terikat pada verifikasi laporan aktivitas lapangan yang diunggah oleh mitra pelaksana.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-[#E5E7EB]">
                      <h4 className="font-bold text-[#181343] mb-1">Metrik Capaian ESG</h4>
                      <p className="text-slate-500">
                        Data penerima manfaat, jam pelatihan, dan indikator lingkungan terkompilasi otomatis ke dalam modul laporan keberlanjutan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeHelpTab === "support" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#F4F4F6] border border-[#E5E7EB] space-y-3">
                    <h4 className="text-sm font-bold text-[#181343]">
                      Layanan Bantuan & Dukungan Teknis SIPENA
                    </h4>
                    <p className="text-slate-500">
                      Jika Anda membutuhkan konsultasi tata kelola, kendala sistem, atau bantuan onboarding akun organisasi:
                    </p>

                    <div className="pt-2 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">Email Helpdesk:</span>
                        <a
                          href="mailto:support@sipena.id"
                          className="font-bold text-[#181343] hover:underline"
                        >
                          support@sipena.id
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
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
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9F9FB] flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#181343] text-white font-bold text-xs hover:bg-[#26224C] transition-colors cursor-pointer shadow-xs"
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
