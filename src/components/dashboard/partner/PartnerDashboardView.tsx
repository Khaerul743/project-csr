"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  HeartHandshake,
  Sparkles,
  Search,
  Filter,
  Users,
  Compass,
  FileText,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Building2,
  ShieldCheck,
  RefreshCw,
  XCircle,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  Inbox,
  Check,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartnerSidebar } from "./PartnerSidebar";
import { SubmitProposalModal } from "./SubmitProposalModal";
import { ProposalDetailModal } from "./ProposalDetailModal";
import { PartnerOpportunityDetailModal } from "./PartnerOpportunityDetailModal";
import {
  PartnerNavMenu,
  PartnerProfile,
  OpportunityItem,
  ProposalItem,
  PartnerOpportunityInvitationItem,
} from "./types";
import {
  FOCUS_AREA_CONFIG,
  STATUS_CONFIG,
  PROPOSAL_STATUS_CONFIG,
  INVITATION_STATUS_CONFIG,
  formatRupiah,
  formatDate,
} from "./helpers";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";

interface PartnerDashboardViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    partnerId?: string | null;
  };
  onLogout?: () => void;
}

export function PartnerDashboardView({ user, onLogout }: PartnerDashboardViewProps) {
  // Navigation Menu state
  const [activeMenu, setActiveMenu] = useState<PartnerNavMenu>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [invitations, setInvitations] = useState<PartnerOpportunityInvitationItem[]>([]);

  // Loading states
  const [isLoadingPartner, setIsLoadingPartner] = useState(true);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

  // Filters
  const [exploreSearch, setExploreSearch] = useState("");
  const [exploreFocusFilter, setExploreFocusFilter] = useState<string>("ALL");
  const [proposalStatusFilter, setProposalStatusFilter] = useState<string>("ALL");

  // Modals state
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<OpportunityItem | null>(null);
  const [selectedOppForProposal, setSelectedOppForProposal] = useState<OpportunityItem | null>(null);
  const [selectedProposalForDetail, setSelectedProposalForDetail] = useState<ProposalItem | null>(null);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.getItem("accessToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0";
      window.location.href = "/login";
    }
  };

  // --- Data Fetching ---

  const fetchPartnerProfile = async () => {
    setIsLoadingPartner(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("/api/partners/current", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setPartner(json.data);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingPartner(false);
    }
  };

  const fetchOpportunities = async () => {
    setIsLoadingOpportunities(true);
    try {
      const res = await fetch("/api/opportunities?limit=50&status=OPEN");
      if (res.ok) {
        const json = await res.json();
        setOpportunities(json.data?.data || []);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingOpportunities(false);
    }
  };

  const fetchProposals = async () => {
    setIsLoadingProposals(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("/api/proposals/my-partner?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setProposals(json.data?.data || []);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingProposals(false);
    }
  };

  const fetchInvitations = async () => {
    setIsLoadingInvitations(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("/api/opportunities/my-invitations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setInvitations(json.data || []);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  useEffect(() => {
    fetchPartnerProfile();
    fetchOpportunities();
    fetchProposals();
    fetchInvitations();
  }, [user.partnerId]);

  const handleRefreshAll = () => {
    fetchPartnerProfile();
    fetchOpportunities();
    fetchProposals();
    fetchInvitations();
  };

  // Responding to opportunity invitation
  const handleRespondInvitation = async (invitationId: string, status: "ACCEPTED" | "DECLINED", oppItem?: OpportunityItem) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/opportunities/my-invitations/${invitationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchInvitations();
        if (status === "ACCEPTED" && oppItem) {
          setSelectedOppForProposal(oppItem);
        }
      }
    } catch {
      // silent error
    }
  };

  // --- Computed Metrics ---
  const pendingInvitations = useMemo(
    () => invitations.filter((i) => i.status === "INVITED"),
    [invitations]
  );

  const activeProposals = useMemo(
    () => proposals.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW"),
    [proposals]
  );

  const acceptedCollaborations = useMemo(
    () => proposals.filter((p) => p.status === "ACCEPTED"),
    [proposals]
  );

  const totalProposedBudget = useMemo(() => {
    return proposals.reduce((acc, curr) => {
      const num = curr.proposedBudget ? parseFloat(curr.proposedBudget) : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [proposals]);

  // Filtered Opportunities for Explore
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((o) => {
      const matchesSearch =
        o.title.toLowerCase().includes(exploreSearch.toLowerCase()) ||
        (o.companyName && o.companyName.toLowerCase().includes(exploreSearch.toLowerCase())) ||
        (o.targetCity && o.targetCity.toLowerCase().includes(exploreSearch.toLowerCase()));

      const matchesFocus =
        exploreFocusFilter === "ALL" || o.focusArea === exploreFocusFilter;

      return matchesSearch && matchesFocus;
    });
  }, [opportunities, exploreSearch, exploreFocusFilter]);

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (proposalStatusFilter === "ALL") return true;
      return p.status === proposalStatusFilter;
    });
  }, [proposals, proposalStatusFilter]);

  const partnerFocus = partner ? FOCUS_AREA_CONFIG[partner.focusArea] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* 1. Sidebar */}
      <PartnerSidebar
        user={user}
        organizationName={partner?.name}
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        counts={{
          opportunities: opportunities.length,
          invitations: pendingInvitations.length,
          proposals: proposals.length,
          collaborations: acceptedCollaborations.length,
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Buka Menu"
            >
              <Inbox className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight hidden sm:inline">
                {partner?.name || "Workspace Mitra"}
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-xs font-semibold text-teal-600 capitalize">
                {activeMenu === "overview" && "Ringkasan Aktivitas"}
                {activeMenu === "explore" && "Eksplorasi Peluang CSR"}
                {activeMenu === "invitations" && "Undangan Masuk"}
                {activeMenu === "proposals" && "Pengajuan Proposal"}
                {activeMenu === "collaborations" && "Kolaborasi Disetujui"}
                {activeMenu === "profile" && "Profil Lembaga"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefreshAll}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Perbarui Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Badge variant="purple" size="sm">
              Mitra Pelaksana
            </Badge>
          </div>
        </header>

        {/* Dynamic Subviews Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* ========================================================================= */}
          {/* SUBVIEW 1: OVERVIEW (RINGKASAN) */}
          {/* ========================================================================= */}
          {activeMenu === "overview" && (
            <div className="space-y-8">
              {/* Hero Banner */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-12 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      Mitra Terverifikasi
                    </span>
                    {partnerFocus && (
                      <Badge variant={partnerFocus.variant} size="sm">
                        {partnerFocus.label}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Halo, {user.name}! Selamat Datang di Workspace Mitra 🎉
                    </h1>
                    <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                      Eksplorasi berbagai program inisiatif CSR yang dibuka oleh perusahaan mitra,
                      tanggap undangan kolaborasi langsung, dan ajukan proposal penawaran kegiatan sosial Anda.
                    </p>
                  </div>

                  {partner && (
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-teal-400" />
                        <span className="font-semibold text-white text-sm">{partner.name}</span>
                      </div>
                      {partner.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {partner.city}, {partner.province}
                          </span>
                        </div>
                      )}
                      {partner.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{partner.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics Highlights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Peluang CSR Terbuka</span>
                      <Compass className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {opportunities.length}
                    </div>
                    <span className="text-[11px] text-slate-400 block">Siap diajukan proposal</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Undangan Menunggu</span>
                      <Inbox className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-amber-600">
                      {pendingInvitations.length}
                    </div>
                    <span className="text-[11px] text-slate-400 block">Dari perusahaan</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Proposal Aktif</span>
                      <FileText className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-teal-600">
                      {activeProposals.length}
                    </div>
                    <span className="text-[11px] text-slate-400 block">Dalam evaluasi</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Total Nilai Usulan</span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xl font-extrabold text-emerald-600 truncate">
                      {formatRupiah(totalProposedBudget)}
                    </div>
                    <span className="text-[11px] text-slate-400 block">Dari seluruh proposal</span>
                  </CardContent>
                </Card>
              </div>

              {/* Undangan Masuk Alert / Quick Respond */}
              {pendingInvitations.length > 0 && (
                <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <h3 className="font-extrabold text-amber-950 text-sm">
                        Anda Memiliki {pendingInvitations.length} Undangan Kolaborasi Baru
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveMenu("invitations")}
                      className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingInvitations.slice(0, 2).map((inv) => (
                      <div
                        key={inv.id}
                        className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-xs flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Building2 className="w-3.5 h-3.5 text-teal-600" />
                            <span className="font-bold text-slate-800">{inv.companyName}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {inv.opportunityTitle}
                          </h4>
                          {inv.message && (
                            <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              "{inv.message}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-xs font-bold text-emerald-600">
                            {formatRupiah(inv.opportunityBudget)}
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                            onClick={() => {
                              const oppMatch = opportunities.find((o) => o.id === inv.opportunityId);
                              if (oppMatch) {
                                setSelectedOppForProposal(oppMatch);
                              } else {
                                setActiveMenu("invitations");
                              }
                            }}
                          >
                            Ajukan Proposal
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rekomendasi Peluang CSR Terbuka */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Peluang Inisiatif CSR Terbaru
                    </h3>
                    <p className="text-xs text-slate-500">
                      Program yang sedang membuka pengajuan proposal dari mitra
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveMenu("explore")}
                    className="text-teal-600 hover:text-teal-700"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Buka Katalog Lengkap
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {opportunities.slice(0, 3).map((opp) => {
                    const fConfig = FOCUS_AREA_CONFIG[opp.focusArea] || {
                      label: opp.focusArea,
                      variant: "slate" as const,
                    };
                    return (
                      <div
                        key={opp.id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                      >
                        {opp.bannerUrl ? (
                          <div className="h-32 w-full bg-slate-100 overflow-hidden relative">
                            <img
                              src={opp.bannerUrl}
                              alt={opp.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2.5 left-2.5">
                              <Badge variant={fConfig.variant} size="sm">
                                {fConfig.label}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="h-24 w-full bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 p-3 flex items-start">
                            <Badge variant={fConfig.variant} size="sm">
                              {fConfig.label}
                            </Badge>
                          </div>
                        )}

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Building2 className="w-3 h-3 text-teal-600" />
                              <span className="truncate">{opp.companyName || "Perusahaan"}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                              {opp.title}
                            </h4>
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">Alokasi Anggaran:</span>
                              <span className="font-extrabold text-emerald-600">
                                {formatRupiah(opp.estimatedBudget)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => setSelectedOppForDetail(opp)}
                              >
                                Detail
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                                onClick={() => setSelectedOppForProposal(opp)}
                              >
                                Ajukan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW 2: EXPLORE OPPORTUNITIES (KATALOG PELUANG) */}
          {/* ========================================================================= */}
          {activeMenu === "explore" && (
            <div className="space-y-6">
              {/* Header Title & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Eksplorasi Peluang CSR Perusahaan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Temukan program inisiatif CSR terbuka dan ajukan proposal penawaran kegiatan
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    {filteredOpportunities.length} Inisiatif Tersedia
                  </span>
                </div>
              </div>

              {/* Search & Focus Area Filter Pills */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={exploreSearch}
                    onChange={(e) => setExploreSearch(e.target.value)}
                    placeholder="Cari berdasarkan judul inisiatif, nama perusahaan, atau target kota..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
                  />
                </div>

                {/* Focus Area Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                  <button
                    onClick={() => setExploreFocusFilter("ALL")}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                      exploreFocusFilter === "ALL"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {csrFocusAreaEnum.map((focus) => {
                    const cfg = FOCUS_AREA_CONFIG[focus];
                    const isSelected = exploreFocusFilter === focus;
                    return (
                      <button
                        key={focus}
                        onClick={() => setExploreFocusFilter(focus)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                          isSelected
                            ? "bg-teal-600 text-white shadow-xs"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opportunities Grid */}
              {isLoadingOpportunities ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-teal-600" />
                  <p className="text-xs">Memuat katalog peluang CSR...</p>
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
                  <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">Tidak Ada Peluang Ditemukan</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Coba ubah kata kunci pencarian atau bersihkan filter fokus kategori untuk melihat seluruh inisiatif terbuka.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredOpportunities.map((opp) => {
                    const focusConfig = FOCUS_AREA_CONFIG[opp.focusArea] || {
                      label: opp.focusArea,
                      variant: "slate" as const,
                    };
                    return (
                      <div
                        key={opp.id}
                        className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                      >
                        {/* Thumbnail Banner */}
                        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                          {opp.bannerUrl ? (
                            <img
                              src={opp.bannerUrl}
                              alt={opp.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-slate-600">
                              <Compass className="w-10 h-10 text-white/20" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          <div className="absolute top-3 left-3">
                            <Badge variant={focusConfig.variant} size="sm">
                              {focusConfig.label}
                            </Badge>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="truncate">
                                {opp.targetCity || "Nasional"}
                              </span>
                            </div>
                            {opp.deadline && (
                              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(opp.deadline)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            {/* Company Name */}
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span className="font-semibold text-slate-700 truncate">
                                {opp.companyName || "Perusahaan CSR"}
                              </span>
                            </div>

                            <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                              {opp.title}
                            </h3>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {opp.description}
                            </p>
                          </div>

                          {/* Budget & Actions */}
                          <div className="pt-3 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-medium">Alokasi Anggaran:</span>
                              <span className="text-sm font-extrabold text-emerald-600">
                                {formatRupiah(opp.estimatedBudget)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => setSelectedOppForDetail(opp)}
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                Detail
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs shadow-sm"
                                onClick={() => setSelectedOppForProposal(opp)}
                                leftIcon={<Send className="w-3.5 h-3.5" />}
                              >
                                Ajukan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW 3: INVITATIONS (UNDANGAN MASUK) */}
          {/* ========================================================================= */}
          {activeMenu === "invitations" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Undangan Kolaborasi dari Perusahaan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perusahaan secara langsung mengundang yayasan/organisasi Anda untuk mengajukan proposal ke inisiatif mereka
                </p>
              </div>

              {isLoadingInvitations ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-teal-600" />
                  <p className="text-xs">Memuat daftar undangan...</p>
                </div>
              ) : invitations.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">Belum Ada Undangan</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Ketika perusahaan mencari mitra di bidang fokus Anda dan mengirimkan undangan langsung, undangannya akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((inv) => {
                    const statusCfg = INVITATION_STATUS_CONFIG[inv.status] || {
                      label: inv.status,
                      variant: "slate" as const,
                    };
                    const isPending = inv.status === "INVITED";
                    const oppMatch = opportunities.find((o) => o.id === inv.opportunityId);

                    return (
                      <div
                        key={inv.id}
                        className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusCfg.variant} size="sm" hasDot>
                              {statusCfg.label}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              Diterima pada {formatDate(inv.createdAt)}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <Building2 className="w-3.5 h-3.5 text-teal-600" />
                              <span>{inv.companyName}</span>
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                              {inv.opportunityTitle}
                            </h3>
                          </div>

                          {inv.message && (
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                              "{inv.message}"
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                            <div>
                              <span>Alokasi Anggaran: </span>
                              <span className="font-extrabold text-emerald-600">
                                {formatRupiah(inv.opportunityBudget)}
                              </span>
                            </div>
                            {inv.opportunityDeadline && (
                              <div>
                                <span>Batas Waktu: </span>
                                <span className="font-semibold text-slate-700">
                                  {formatDate(inv.opportunityDeadline)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {isPending ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                                onClick={() => handleRespondInvitation(inv.id, "DECLINED")}
                              >
                                Tolak
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-teal-600 hover:bg-teal-700 text-white text-xs shadow-sm"
                                leftIcon={<Send className="w-3.5 h-3.5" />}
                                onClick={() => {
                                  if (oppMatch) {
                                    setSelectedOppForProposal(oppMatch);
                                  } else {
                                    // Make synthetic opportunity item for proposal
                                    setSelectedOppForProposal({
                                      id: inv.opportunityId,
                                      companyId: inv.companyId,
                                      title: inv.opportunityTitle || "Peluang CSR",
                                      description: inv.opportunityDescription || "",
                                      focusArea: (inv.opportunityFocusArea as any) || "LAINNYA",
                                      estimatedBudget: inv.opportunityBudget,
                                      status: "OPEN",
                                      companyName: inv.companyName,
                                      createdAt: inv.createdAt,
                                    });
                                  }
                                }}
                              >
                                Terima & Buat Proposal
                              </Button>
                            </>
                          ) : (
                            <Badge variant={statusCfg.variant} size="md">
                              {statusCfg.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW 4: PROPOSALS (PROPOSAL SAYA) */}
          {/* ========================================================================= */}
          {activeMenu === "proposals" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Daftar Proposal Inisiatif Saya
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Riwayat seluruh proposal yang diajukan beserta status peninjauan dari perusahaan
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs shadow-sm self-start sm:self-auto"
                  leftIcon={<Compass className="w-3.5 h-3.5" />}
                  onClick={() => setActiveMenu("explore")}
                >
                  Cari Peluang Baru
                </Button>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {["ALL", "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "WITHDRAWN"].map(
                  (st) => {
                    const isSelected = proposalStatusFilter === st;
                    const label =
                      st === "ALL"
                        ? "Semua Proposal"
                        : (PROPOSAL_STATUS_CONFIG as Record<string, { label: string }>)[st]?.label || st;
                    return (
                      <button
                        key={st}
                        onClick={() => setProposalStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Proposals List */}
              {isLoadingProposals ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-teal-600" />
                  <p className="text-xs">Memuat proposal Anda...</p>
                </div>
              ) : filteredProposals.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">Belum Ada Proposal Diajukan</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Kunjungi katalog peluang CSR dan ajukan proposal penawaran kegiatan sosial pertama Anda.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs mt-2"
                    onClick={() => setActiveMenu("explore")}
                  >
                    Buka Katalog Peluang
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProposals.map((prop) => {
                    const statusCfg = PROPOSAL_STATUS_CONFIG[prop.status] || {
                      label: prop.status,
                      variant: "slate" as const,
                    };
                    return (
                      <div
                        key={prop.id}
                        onClick={() => setSelectedProposalForDetail(prop)}
                        className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusCfg.variant} size="sm" hasDot>
                              {statusCfg.label}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              Diajukan {formatDate(prop.createdAt)}
                            </span>
                          </div>

                          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-600 transition truncate">
                            {prop.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-teal-600" />
                              <span className="truncate">{prop.companyName || "Perusahaan CSR"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{prop.opportunityTitle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 block font-medium">
                              Anggaran Diajukan
                            </span>
                            <span className="text-sm font-extrabold text-teal-600">
                              {formatRupiah(prop.proposedBudget)}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-slate-400 group-hover:text-teal-600"
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                          >
                            Detail
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW 5: COLLABORATIONS (KOLABORASI AKTIF) */}
          {/* ========================================================================= */}
          {activeMenu === "collaborations" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Proyek Kolaborasi yang Disetujui
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar program kerja sama resmi antara organisasi Anda dan perusahaan sponsor
                </p>
              </div>

              {acceptedCollaborations.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
                  <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">Belum Ada Kolaborasi Aktif</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Saat proposal inisiatif Anda disetujui (Accepted) oleh pihak perusahaan, proyek tersebut secara otomatis tercatat sebagai kontrak kolaborasi di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {acceptedCollaborations.map((collab) => (
                    <div
                      key={collab.id}
                      className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Kolaborasi Terbentuk
                            </span>
                            <span className="text-xs text-slate-400">
                              Disetujui pada {formatDate(collab.reviewedAt || collab.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900">{collab.title}</h3>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[11px] text-slate-400 block font-medium">Nilai Kontrak</span>
                          <span className="text-base font-extrabold text-emerald-600">
                            {formatRupiah(collab.proposedBudget)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-semibold text-slate-800">
                            Perusahaan: {collab.companyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-slate-400" />
                          <span>Inisiatif: {collab.opportunityTitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Durasi: {collab.durationMonths || "-"} Bulan</span>
                        </div>
                      </div>

                      {collab.feedback && (
                        <p className="text-xs text-emerald-800 italic bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                          Catatan Perusahaan: "{collab.feedback}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW 6: PROFILE (PROFIL LEMBAGA) */}
          {/* ========================================================================= */}
          {activeMenu === "profile" && partner && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Profil Lembaga Mitra Pelaksana
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informasi profil ini ditampilkan kepada perusahaan CSR saat mereka meninjau proposal atau mencari mitra
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-2xl bg-teal-500/10 text-teal-600 border border-teal-500/20 flex items-center justify-center font-extrabold text-2xl shrink-0">
                    {partner.logoUrl ? (
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      partner.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-900">{partner.name}</h3>
                      {partnerFocus && (
                        <Badge variant={partnerFocus.variant} size="sm">
                          {partnerFocus.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Terdaftar pada {formatDate(partner.createdAt)} • Status Akun:{" "}
                      <span className="font-bold text-emerald-600">Aktif</span>
                    </p>
                  </div>
                </div>

                {/* Deskripsi Lembaga */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Deskripsi & Rekam Jejak Lembaga
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {partner.description || "Belum ada deskripsi profil lembaga."}
                  </p>
                </div>

                {/* Kontak & Lokasi Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Wilayah Operasional
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>
                        {partner.city ? `${partner.city}, ${partner.province}` : "-"}
                      </span>
                    </div>
                    {partner.address && (
                      <p className="text-[11px] text-slate-500 pt-0.5">{partner.address}</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Email Resmi
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{partner.email || "-"}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Nomor Telepon / Hotline
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{partner.phone || "-"}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Website / Media Sosial
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Globe className="w-4 h-4 text-teal-600 shrink-0" />
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-teal-700 truncate"
                        >
                          {partner.website}
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Modal Detail Opportunity */}
      <PartnerOpportunityDetailModal
        isOpen={Boolean(selectedOppForDetail)}
        opportunity={selectedOppForDetail}
        onClose={() => setSelectedOppForDetail(null)}
        onApply={(opp) => setSelectedOppForProposal(opp)}
      />

      {/* 2. Modal Ajukan Proposal */}
      <SubmitProposalModal
        isOpen={Boolean(selectedOppForProposal)}
        opportunity={selectedOppForProposal}
        onClose={() => setSelectedOppForProposal(null)}
        onSuccess={() => {
          fetchProposals();
          fetchInvitations();
          setActiveMenu("proposals");
        }}
      />

      {/* 3. Modal Detail Proposal Saya */}
      <ProposalDetailModal
        isOpen={Boolean(selectedProposalForDetail)}
        proposal={selectedProposalForDetail}
        onClose={() => setSelectedProposalForDetail(null)}
        onSuccess={() => {
          fetchProposals();
        }}
      />
    </div>
  );
}
