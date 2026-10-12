"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Building2,
  Sparkles,
  Plus,
  Search,
  Filter,
  Users,
  HeartHandshake,
  TrendingUp,
  FileText,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  Send,
  ShieldCheck,
  RefreshCw,
  XCircle,
  Copy,
  Check,
  Inbox,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { opportunityStatusEnum, OpportunityStatus } from "@/db/schema/opportunities";
import { InviteMemberModal } from "../InviteMemberModal";
import { Sidebar, CompanyNavMenu } from "../Sidebar";
import { DashboardHeader } from "../DashboardHeader";
import { CreateOpportunityModal } from "./CreateOpportunityModal";
import { EditOpportunityModal } from "./EditOpportunityModal";
import { InvitePartnerModal } from "./InvitePartnerModal";
import { OpportunityDetailModal } from "./OpportunityDetailModal";
import {
  CompanyProfile,
  OpportunityItem,
  PartnerItem,
  TeamInvitation,
} from "./types";
import {
  FOCUS_AREA_CONFIG,
  STATUS_CONFIG,
  formatRupiah,
  formatDate,
} from "./helpers";

interface CompanyDashboardViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId?: string | null;
  };
  onLogout?: () => void;
}

export function CompanyDashboardView({ user, onLogout }: CompanyDashboardViewProps) {
  // Navigation Menu state
  const [activeMenu, setActiveMenu] = useState<CompanyNavMenu>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);

  // Loading states
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

  // Filters
  const [oppSearch, setOppSearch] = useState("");
  const [oppStatusFilter, setOppStatusFilter] = useState<string>("ALL");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerFocusFilter, setPartnerFocusFilter] = useState<string>("ALL");

  // Modal states
  const [isCreateOppOpen, setIsCreateOppOpen] = useState(false);
  const [selectedOppForEdit, setSelectedOppForEdit] = useState<OpportunityItem | null>(null);
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<OpportunityItem | null>(null);
  const [selectedPartnerForInvite, setSelectedPartnerForInvite] = useState<PartnerItem | null>(null);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const isManagement = user.role === "MANAGEMENT";

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

  // --- Data Fetching ---

  const fetchCompanyData = async () => {
    setIsLoadingCompany(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/companies/current", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setCompany(json.data);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingCompany(false);
    }
  };

  const fetchOpportunities = async () => {
    setIsLoadingOpportunities(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/opportunities/my-company?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
          ? json.data.data
          : [];
        setOpportunities(list);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingOpportunities(false);
    }
  };

  const fetchPartners = async () => {
    setIsLoadingPartners(true);
    try {
      const token = localStorage.getItem("accessToken");
      let url = "/api/partners?limit=50";
      if (partnerFocusFilter !== "ALL") {
        url += `&focusArea=${partnerFocusFilter}`;
      }
      if (partnerSearch.trim()) {
        url += `&search=${encodeURIComponent(partnerSearch.trim())}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
          ? json.data.data
          : [];
        setPartners(list);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingPartners(false);
    }
  };

  const fetchInvitations = async () => {
    if (!isManagement) return;
    setIsLoadingInvitations(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/invitations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
          ? json.data.data
          : [];
        setInvitations(list);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCompanyData();
    fetchOpportunities();
    fetchPartners();
    if (isManagement) {
      fetchInvitations();
    }
  }, [user.role]);

  // Load partners when filter changes
  useEffect(() => {
    if (activeMenu === "partners" || activeMenu === "overview") {
      fetchPartners();
    }
  }, [partnerFocusFilter]);

  const handlePartnerSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPartners();
  };

  const handleDeleteOpportunity = async (oppId: string, oppTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus opportunity "${oppTitle}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/opportunities/${oppId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchOpportunities();
      } else {
        const json = await res.json();
        alert(json.message || "Gagal menghapus opportunity");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus opportunity");
    }
  };

  const handleCancelInvitation = async (invId: string) => {
    if (!confirm("Batalkan undangan ini?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/invitations/${invId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchInvitations();
      } else {
        const json = await res.json();
        alert(json.message || "Gagal membatalkan undangan");
      }
    } catch {
      alert("Terjadi kesalahan saat membatalkan undangan");
    }
  };

  const handleCopyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  // --- Computed Metrics ---

  const metrics = useMemo(() => {
    const oppList = Array.isArray(opportunities) ? opportunities : [];
    const inviteList = Array.isArray(invitations) ? invitations : [];

    const totalOpps = oppList.length;
    const activeOpps = oppList.filter((o) => o?.status === "OPEN").length;
    const totalBudget = oppList.reduce((acc, curr) => {
      const num = curr?.estimatedBudget ? parseFloat(curr.estimatedBudget) : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    const membersCount = company?.members?.length || 1;
    const pendingInvitesCount = inviteList.filter((i) => i?.status === "PENDING").length;

    return {
      totalOpps,
      activeOpps,
      totalBudget,
      membersCount,
      pendingInvitesCount,
    };
  }, [opportunities, company, invitations]);

  // Filtered Opportunities
  const filteredOpportunities = useMemo(() => {
    const oppList = Array.isArray(opportunities) ? opportunities : [];
    return oppList.filter((opp) => {
      if (!opp) return false;
      const matchSearch =
        opp.title?.toLowerCase().includes(oppSearch.toLowerCase()) ||
        opp.description?.toLowerCase().includes(oppSearch.toLowerCase()) ||
        (opp.targetCity && opp.targetCity.toLowerCase().includes(oppSearch.toLowerCase()));

      const matchStatus =
        oppStatusFilter === "ALL" || opp.status === oppStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [opportunities, oppSearch, oppStatusFilter]);

  // Header Title & Subtitle based on activeMenu
  const headerMeta: Record<CompanyNavMenu, { title: string; subtitle: string }> = {
    overview: {
      title: "Ringkasan Eksekutif",
      subtitle: "Ikhtisar portofolio inisiatif, realisasi anggaran, dan mitra CSR",
    },
    opportunities: {
      title: "Peluang CSR (Opportunities)",
      subtitle: "Kelola inisiatif terbuka, draf program, dan undang mitra pelaksana",
    },
    partners: {
      title: "Kurasi & Direktori Mitra",
      subtitle: "Jelajahi yayasan dan NGO terverifikasi berdasarkan spesialisasi bidang",
    },
    proposals: {
      title: "Proposal Masuk",
      subtitle: "Tinjau dan seleksi proposal program yang diajukan oleh mitra pelaksana",
    },
    collaborations: {
      title: "Kolaborasi & Kontrak MoU",
      subtitle: "Kesepakatan bersama, rincian anggaran disetujui, dan dokumen legal",
    },
    team: {
      title: "Anggota Tim & Akses",
      subtitle: "Kelola akun pengguna internal perusahaan dan undang staf CSR",
    },
    profile: {
      title: "Profil Perusahaan",
      subtitle: "Informasi legalitas, domisili, dan profil publik organisasi",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        user={user}
        organizationName={company?.name}
        activeMenu={activeMenu}
        onSelectMenu={(menu) => setActiveMenu(menu)}
        counts={{
          opportunities: opportunities.length,
          partners: partners.length,
          team: company?.members?.length,
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Dashboard Header */}
        <DashboardHeader
          title={headerMeta[activeMenu]?.title || "Dashboard Perusahaan"}
          subtitle={headerMeta[activeMenu]?.subtitle}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          rightAction={
            (activeMenu === "overview" || activeMenu === "opportunities") && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOppOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Buka Opportunity Baru</span>
                <span className="sm:hidden">Baru</span>
              </Button>
            )
          }
        />

        {/* Content Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* ============================================================ */}
          {/* VIEW: OVERVIEW (RINGKASAN EKSEKUTIF) */}
          {/* ============================================================ */}
          {activeMenu === "overview" && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Workspace Perusahaan
                      </span>
                      <Badge variant="emerald" size="sm" hasDot>
                        {user.role}
                      </Badge>
                    </div>

                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Selamat Datang, {user.name}! 👋
                      </h1>
                      <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                        Kelola strategi program CSR {company?.name || "perusahaan Anda"}, kurasi mitra pelaksana bereputasi, dan buka peluang kolaborasi berdampak nyata.
                      </p>
                    </div>

                    {company && (
                      <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                        {company.city && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              {company.city}, {company.province || "Indonesia"}
                            </span>
                          </div>
                        )}
                        {company.email && (
                          <span className="text-slate-400">
                            Email: <span className="text-slate-200">{company.email}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setIsCreateOppOpen(true)}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Buka Opportunity Baru
                    </Button>
                  </div>
                </div>
              </div>

              {/* Live Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Peluang CSR Aktif
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {metrics.activeOpps}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">
                        / {metrics.totalOpps} total
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium block">
                      Status publikasi OPEN
                    </span>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Alokasi Anggaran
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-600 truncate">
                      {formatRupiah(metrics.totalBudget)}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Estimasi kumulatif inisiatif
                    </span>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Mitra Tersedia
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {partners.length}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      NGO / Yayasan terdaftar
                    </span>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Tim Internal CSR
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {metrics.membersCount}
                      {metrics.pendingInvitesCount > 0 && (
                        <span className="text-xs font-normal text-amber-600 ml-1.5">
                          (+{metrics.pendingInvitesCount} pending)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Pengelola workspace aktif
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Opportunities Snapshot */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Peluang Inisiatif Terkini
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar program CSR yang baru dibuka oleh perusahaan Anda
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveMenu("opportunities")}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Lihat Semua ({opportunities.length})
                  </Button>
                </div>

                {opportunities.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center space-y-3">
                    <p className="text-xs text-slate-500">
                      Belum ada inisiatif opportunity yang dibuat.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsCreateOppOpen(true)}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Buka Opportunity Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {opportunities.slice(0, 3).map((opp) => {
                      const focus = FOCUS_AREA_CONFIG[opp.focusArea] || {
                        label: opp.focusArea,
                        variant: "emerald" as const,
                      };
                      const statusCfg = STATUS_CONFIG[opp.status] || {
                        label: opp.status,
                        variant: "emerald" as const,
                      };

                      return (
                        <div
                          key={opp.id}
                          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant={statusCfg.variant} size="sm" hasDot>
                                {statusCfg.label}
                              </Badge>
                              <Badge variant={focus.variant} size="sm">
                                {focus.label}
                              </Badge>
                            </div>

                            <h4
                              onClick={() => setSelectedOppForDetail(opp)}
                              className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
                            >
                              {opp.title}
                            </h4>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-400">Anggaran:</span>
                              <span className="font-bold text-emerald-700">
                                {formatRupiah(opp.estimatedBudget)}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setSelectedOppForDetail(opp)}
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Detail</span>
                            </button>
                            <span className="text-[11px] text-slate-400">
                              Batas: {formatDate(opp.deadline)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: OPPORTUNITIES (PELUANG CSR) */}
          {/* ============================================================ */}
          {activeMenu === "opportunities" && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari inisiatif atau lokasi..."
                    value={oppSearch}
                    onChange={(e) => setOppSearch(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Status:</span>
                  </div>
                  <select
                    value={oppStatusFilter}
                    onChange={(e) => setOppStatusFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 text-slate-800 font-medium"
                  >
                    <option value="ALL">Semua Status</option>
                    {opportunityStatusEnum.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st]?.label || st}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchOpportunities}
                    title="Refresh Data"
                    className="p-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Opportunity Cards */}
              {isLoadingOpportunities ? (
                <div className="p-12 text-center text-sm text-slate-400 space-y-3">
                  <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span>Memuat data inisiatif CSR perusahaan Anda...</span>
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {oppSearch || oppStatusFilter !== "ALL"
                        ? "Tidak ada opportunity yang sesuai filter"
                        : "Belum Ada Peluang Inisiatif CSR"}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                      {oppSearch || oppStatusFilter !== "ALL"
                        ? "Coba sesuaikan kata kunci pencarian atau ubah status filter."
                        : "Mulai buat inisiatif CSR pertama Anda untuk mengundang mitra pelaksana dan membuka penerimaan proposal."}
                    </p>
                  </div>
                  {!oppSearch && oppStatusFilter === "ALL" && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setIsCreateOppOpen(true)}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Buka Opportunity Sekarang
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredOpportunities.map((opp) => {
                    const focus = FOCUS_AREA_CONFIG[opp.focusArea] || {
                      label: opp.focusArea,
                      variant: "emerald" as const,
                    };
                    const statusCfg = STATUS_CONFIG[opp.status] || {
                      label: opp.status,
                      variant: "emerald" as const,
                    };

                    return (
                      <div
                        key={opp.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant={statusCfg.variant} size="sm" hasDot>
                              {statusCfg.label}
                            </Badge>
                            <Badge variant={focus.variant} size="sm">
                              {focus.label}
                            </Badge>
                          </div>

                          <h3
                            onClick={() => setSelectedOppForDetail(opp)}
                            className="text-base font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
                          >
                            {opp.title}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {opp.description}
                          </p>

                          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="text-slate-400">Anggaran:</span>
                              <span className="font-bold text-emerald-700">
                                {formatRupiah(opp.estimatedBudget)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-600">
                              <span className="text-slate-400">Lokasi:</span>
                              <span className="font-medium truncate max-w-[150px]">
                                {opp.targetCity || opp.targetProvince || "Nasional"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-600">
                              <span className="text-slate-400">Batas Proposal:</span>
                              <span className="font-medium">
                                {formatDate(opp.deadline)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOppForDetail(opp)}
                            className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                            title="Lihat Detail Inisiatif"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Detail</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedOppForEdit(opp)}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Edit Inisiatif"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOpportunity(opp.id, opp.title)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Inisiatif"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: PARTNERS (KURASI MITRA) */}
          {/* ============================================================ */}
          {activeMenu === "partners" && (
            <div className="space-y-6">
              {/* Search & Focus Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <form onSubmit={handlePartnerSearchSubmit} className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari nama mitra atau kota..."
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                  />
                </form>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Bidang Fokus:</span>
                  </div>
                  <select
                    value={partnerFocusFilter}
                    onChange={(e) => setPartnerFocusFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 text-slate-800 font-medium"
                  >
                    <option value="ALL">Semua Bidang</option>
                    {csrFocusAreaEnum.map((area) => (
                      <option key={area} value={area}>
                        {FOCUS_AREA_CONFIG[area]?.label || area}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPartners}
                    title="Refresh Mitra"
                    className="p-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Partner Grid */}
              {isLoadingPartners ? (
                <div className="p-12 text-center text-sm text-slate-400 space-y-3">
                  <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span>Memuat direktori mitra pelaksana...</span>
                </div>
              ) : partners.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Mitra Tidak Ditemukan
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Belum ada mitra pelaksana yang cocok dengan kriteria filter saat ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {partners.map((partner) => {
                    const focus = FOCUS_AREA_CONFIG[partner.focusArea] || {
                      label: partner.focusArea,
                      variant: "emerald" as const,
                    };

                    return (
                      <div
                        key={partner.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                              {partner.name.substring(0, 2).toUpperCase()}
                            </div>
                            <Badge variant={focus.variant} size="sm">
                              {focus.label}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-slate-900 leading-snug">
                              {partner.name}
                            </h4>
                            {partner.city && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>
                                  {partner.city}, {partner.province || "Indonesia"}
                                </span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {partner.description || "Organisasi pelaksana program dampak sosial masyarakat."}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">
                            {partner.email || "Email terproteksi"}
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedPartnerForInvite(partner)}
                            leftIcon={<Send className="w-3.5 h-3.5" />}
                          >
                            Undang Pitch
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: PROPOSALS (PROPOSAL MASUK) - PREVIEW */}
          {/* ============================================================ */}
          {activeMenu === "proposals" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Inbox className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Modul Seleksi & Penilaian Proposal Masuk
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Saat mitra pelaksana mengajukan proposal untuk opportunity yang Anda publikasikan, proposal lengkap beserta rincian Rencana Anggaran Biaya (RAB) dan timeline akan tampil di sini untuk dievaluasi.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block">
                    Tahapan Alur Kerja Proposal:
                  </span>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px]">1</span>
                    <span>Mitra submit proposal melalui katalog opportunity</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px]">2</span>
                    <span>CSR Admin perusahaan mereview dokumen & rencana kegiatan</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">3</span>
                    <span>Proposal disetujui (ACCEPTED) $\rightarrow$ Masuk tahap Kolaborasi & MoU</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setActiveMenu("opportunities")}
                  >
                    Buka Opportunity Baru Terlebih Dahulu
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: COLLABORATIONS (KOLABORASI & MOU) - PREVIEW */}
          {/* ============================================================ */}
          {activeMenu === "collaborations" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                  <FileCheck2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Ruang Kolaborasi & Kontrak Perjanjian (MoU)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Setelah proposal disetujui, perusahaan dan mitra menyepakati anggaran final, klausul kerja sama, dan penandatanganan dokumen MoU sebelum program resmi dieksekusi di lapangan.
                  </p>
                </div>

                <Badge variant="blue" size="md">
                  Akan aktif otomatis saat proposal mitra diterima
                </Badge>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: TEAM (ANGGOTA TIM & AKSES) */}
          {/* ============================================================ */}
          {activeMenu === "team" && (
            <div className="space-y-8">
              {/* Internal Members */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Anggota Tim Internal Perusahaan
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pengguna internal yang memiliki akses ke workspace organisasi ini
                    </p>
                  </div>

                  {isManagement && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsInviteMemberOpen(true)}
                      leftIcon={<Users className="w-4 h-4" />}
                    >
                      Undang CSR Admin Baru
                    </Button>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-100">
                    {company?.members && company.members.length > 0 ? (
                      company.members.map((member) => (
                        <div
                          key={member.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                              {member.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">
                                  {member.name}
                                </span>
                                {member.id === user.id && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 block mt-0.5">
                                {member.email}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <Badge
                              variant={member.role === "MANAGEMENT" ? "purple" : "emerald"}
                              size="sm"
                              hasDot
                            >
                              {member.role}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              Bergabung {formatDate(member.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-xs text-slate-500 text-center">
                        Belum ada anggota tim lainnya.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pending Invitations (MANAGEMENT only) */}
              {isManagement && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Undangan Tim Pending ({invitations.filter((i) => i.status === "PENDING").length})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Undangan terkirim yang menunggu konfirmasi login penerima
                      </p>
                    </div>
                  </div>

                  {isLoadingInvitations ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Memuat data undangan...
                    </div>
                  ) : invitations.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      Tidak ada undangan tertunda saat ini.
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="divide-y divide-slate-100">
                        {invitations.map((inv) => (
                          <div
                            key={inv.id}
                            className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  {inv.email}
                                </span>
                                <Badge
                                  variant={
                                    inv.status === "ACCEPTED"
                                      ? "emerald"
                                      : inv.status === "PENDING"
                                      ? "amber"
                                      : "slate"
                                  }
                                  size="sm"
                                  hasDot
                                >
                                  {inv.status}
                                </Badge>
                                <Badge variant="blue" size="sm">
                                  {inv.role}
                                </Badge>
                              </div>
                              <span className="text-[11px] text-slate-400 block">
                                Berlaku s/d: {formatDate(inv.expiresAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {inv.status === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyToken(inv.token, inv.id)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 transition-colors"
                                    title="Salin Token Undangan"
                                  >
                                    {copiedTokenId === inv.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700 font-semibold">Tersalin</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin Token</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCancelInvitation(inv.id)}
                                    className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition-colors"
                                  >
                                    Batalkan
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: PROFILE (PROFIL PERUSAHAAN) */}
          {/* ============================================================ */}
          {activeMenu === "profile" && (
            <div className="space-y-6">
              {company ? (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                      {company.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        {company.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="emerald" size="sm" hasDot>
                          Terverifikasi Aktif
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {company.city}, {company.province}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Deskripsi Profil
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {company.description || "Belum ada deskripsi profil perusahaan."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Kontak</span>
                      </div>
                      <span className="font-semibold text-slate-800 block">
                        {company.email || "-"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Nomor Telepon</span>
                      </div>
                      <span className="font-semibold text-slate-800 block">
                        {company.phone || "-"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Alamat Domisili</span>
                      </div>
                      <span className="font-semibold text-slate-800 block">
                        {company.address || "-"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Website Resmi</span>
                      </div>
                      <span className="font-semibold text-slate-800 block truncate">
                        {company.website || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Memuat profil perusahaan...
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- Modals --- */}
      <CreateOpportunityModal
        isOpen={isCreateOppOpen}
        onClose={() => setIsCreateOppOpen(false)}
        onSuccess={() => {
          fetchOpportunities();
        }}
      />

      <EditOpportunityModal
        isOpen={!!selectedOppForEdit}
        opportunity={selectedOppForEdit}
        onClose={() => setSelectedOppForEdit(null)}
        onSuccess={() => {
          fetchOpportunities();
        }}
      />

      <OpportunityDetailModal
        isOpen={!!selectedOppForDetail}
        opportunity={selectedOppForDetail}
        onClose={() => setSelectedOppForDetail(null)}
        onEdit={(opp) => {
          setSelectedOppForEdit(opp);
        }}
        onInvitePartner={(opp) => {
          setActiveMenu("partners");
        }}
      />

      <InvitePartnerModal
        isOpen={!!selectedPartnerForInvite}
        partner={selectedPartnerForInvite}
        opportunities={opportunities}
        onClose={() => setSelectedPartnerForInvite(null)}
        onSuccess={() => {
          fetchOpportunities();
        }}
      />

      {isManagement && (
        <InviteMemberModal
          isOpen={isInviteMemberOpen}
          onClose={() => setIsInviteMemberOpen(false)}
          onSuccess={() => {
            fetchInvitations();
          }}
        />
      )}
    </div>
  );
}
