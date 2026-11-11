"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { DashboardHeader, NotificationItem } from "../DashboardHeader";
import { UserProfileData, UserProfileModal } from "../UserProfileModal";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavMenu, AdminOverviewResponse } from "./types";
import { AdminOverviewView } from "./views/AdminOverviewView";
import { AdminCompaniesView } from "./views/AdminCompaniesView";
import { AdminPartnersView } from "./views/AdminPartnersView";
import { AdminUsersView } from "./views/AdminUsersView";
import { AdminModerationView } from "./views/AdminModerationView";
import { AdminProgramsView } from "./views/AdminProgramsView";
import { AdminProgramAuditPageView } from "./views/AdminProgramAuditPageView";
import { AdminImpactView } from "./views/AdminImpactView";
import { AdminSystemAuditView } from "./views/AdminSystemAuditView";

interface AdminDashboardViewProps {
  user: UserProfileData;
  onLogout?: () => void;
  onProfileUpdated?: (updatedUser: UserProfileData) => void;
}

export function AdminDashboardView({
  user,
  onLogout,
  onProfileUpdated,
}: AdminDashboardViewProps) {
  const [currentUser, setCurrentUser] = useState<UserProfileData>(user);
  const [activeMenu, setActiveMenu] = useState<AdminNavMenu>("overview");
  const [selectedProgramIdForAudit, setSelectedProgramIdForAudit] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0";
      window.location.href = "/login";
    }
  };

  const fetchOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    setOverviewError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const res = await fetch("/api/admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat ringkasan platform");
      }
      setOverview(json.data);
    } catch (err: any) {
      setOverviewError(err.message || "Gagal memuat ringkasan platform");
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Build real platform notifications from database escalationQueue
  const headerNotifications = useMemo<NotificationItem[]>(() => {
    if (!overview) return [];
    const items: NotificationItem[] = [];

    overview.escalationQueue.unverifiedCompanies.forEach((c) => {
      items.push({
        id: `adm-comp-${c.id}`,
        title: `Perusahaan Menunggu Verifikasi: ${c.name}`,
        description: `${c.city || "Lokasi belum diisi"} | ${c.industry || "Industri umum"}`,
        time: "Perlu tinjauan legalitas",
        type: "collab",
        actionMenu: "companies",
        isRead: false,
      });
    });

    overview.escalationQueue.unverifiedPartners.forEach((p) => {
      items.push({
        id: `adm-part-${p.id}`,
        title: `Mitra NGO Menunggu Verifikasi: ${p.name}`,
        description: `${p.city || "Lokasi belum diisi"} | ${p.focusArea}`,
        time: "Perlu tinjauan legalitas",
        type: "proposal",
        actionMenu: "partners",
        isRead: false,
      });
    });

    overview.escalationQueue.flaggedPrograms.forEach((fp) => {
      items.push({
        id: `adm-prog-${fp.id}`,
        title: `Program Berstatus ${fp.status === "CANCELLED" ? "Dibatalkan" : "Ditunda"}`,
        description: `${fp.title} (${fp.companyName || "Perusahaan"})`,
        time: "Eskalasi program",
        type: "program",
        actionMenu: "programs",
        isRead: false,
      });
    });

    return items.slice(0, 8);
  }, [overview]);

  const handleSelectMenu = useCallback((menu: AdminNavMenu) => {
    setSelectedProgramIdForAudit(null);
    setActiveMenu(menu);
  }, []);

  const handleOpenProgramAudit = useCallback((programId: string) => {
    setSelectedProgramIdForAudit(programId);
    setActiveMenu("programs");
  }, []);

  const headerMeta = useMemo(() => {
    switch (activeMenu) {
      case "companies":
        return { title: "Perusahaan Sponsor", crumb: "Perusahaan Sponsor" };
      case "partners":
        return { title: "Mitra Pelaksana (NGO)", crumb: "Mitra Pelaksana (NGO)" };
      case "users":
        return { title: "Pengguna Sistem", crumb: "Pengguna Sistem" };
      case "moderation":
        return { title: "Moderasi Peluang & Proposal", crumb: "Moderasi Peluang & Proposal" };
      case "programs":
        return {
          title: selectedProgramIdForAudit
            ? "Detail Audit Program"
            : "Pengawasan Program & Dana",
          crumb: "Pengawasan Program & Dana",
        };
      case "impact":
        return { title: "Suara Warga & Dampak ESG", crumb: "Suara Warga & Dampak ESG" };
      case "system":
        return { title: "Sistem, AI & Log Audit", crumb: "Sistem, AI & Log Audit" };
      default:
        return { title: "Ringkasan Platform", crumb: "Ringkasan Platform" };
    }
  }, [activeMenu, selectedProgramIdForAudit]);

  const breadcrumbs = useMemo(() => {
    if (activeMenu === "programs" && selectedProgramIdForAudit) {
      return [
        { label: "Super Admin", onClick: () => handleSelectMenu("overview") },
        {
          label: "Pengawasan Program & Dana",
          onClick: () => setSelectedProgramIdForAudit(null),
        },
        { label: "Detail Audit Program" },
      ];
    }

    return [
      { label: "Super Admin", onClick: () => handleSelectMenu("overview") },
      { label: headerMeta.crumb },
    ];
  }, [activeMenu, selectedProgramIdForAudit, headerMeta.crumb, handleSelectMenu]);

  const sidebarCounts = useMemo(
    () => ({
      unverifiedCompanies: overview?.escalationQueue.unverifiedCompanies.length ?? 0,
      unverifiedPartners: overview?.escalationQueue.unverifiedPartners.length ?? 0,
      flaggedPrograms:
        (overview?.escalationQueue.flaggedPrograms.length ?? 0) +
        (overview?.escalationQueue.lowRatedPrograms.length ?? 0),
    }),
    [overview]
  );

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-[#1A1C1D] flex flex-col lg:flex-row font-sans">
      {/* Skip link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[#181343] focus:text-white focus:text-xs focus:font-bold"
      >
        Lewati ke konten utama
      </a>

      <AdminSidebar
        user={currentUser}
        activeMenu={activeMenu}
        onSelectMenu={handleSelectMenu}
        counts={sidebarCounts}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
        onOpenProfile={() => setIsUserProfileModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72">
        <DashboardHeader
          user={currentUser}
          onOpenProfile={() => setIsUserProfileModalOpen(true)}
          breadcrumbs={breadcrumbs}
          title={headerMeta.title}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateMenu={(menu) => handleSelectMenu(menu as AdminNavMenu)}
          notifications={headerNotifications}
          rightAction={
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-[#181343]">
              <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>Platform Oversight</span>
            </div>
          }
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 focus:outline-none"
        >
          {activeMenu === "overview" && (
            <AdminOverviewView
              overview={overview}
              isLoading={isLoadingOverview}
              error={overviewError}
              onRefresh={fetchOverview}
              onNavigateMenu={handleSelectMenu}
              onOpenProgramAudit={handleOpenProgramAudit}
            />
          )}

          {activeMenu === "companies" && <AdminCompaniesView onMutated={fetchOverview} />}

          {activeMenu === "partners" && <AdminPartnersView onMutated={fetchOverview} />}

          {activeMenu === "users" && (
            <AdminUsersView
              currentAdminId={currentUser.id}
              onMutated={fetchOverview}
            />
          )}

          {activeMenu === "moderation" && <AdminModerationView onMutated={fetchOverview} />}

          {activeMenu === "programs" &&
            (selectedProgramIdForAudit ? (
              <AdminProgramAuditPageView
                programId={selectedProgramIdForAudit}
                onBack={() => setSelectedProgramIdForAudit(null)}
              />
            ) : (
              <AdminProgramsView onOpenProgramAudit={handleOpenProgramAudit} />
            ))}

          {activeMenu === "impact" && (
            <AdminImpactView onOpenProgramAudit={handleOpenProgramAudit} />
          )}

          {activeMenu === "system" && <AdminSystemAuditView />}
        </main>
      </div>

      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        user={currentUser}
        onProfileUpdated={(updated) => {
          setCurrentUser(updated);
          onProfileUpdated?.(updated);
        }}
      />
    </div>
  );
}
