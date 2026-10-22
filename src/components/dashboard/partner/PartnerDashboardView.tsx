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
  FileCheck2,
  Activity,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartnerSidebar } from "./PartnerSidebar";
import { SubmitProposalModal } from "./SubmitProposalModal";
import { ProposalDetailModal } from "./ProposalDetailModal";
import { PartnerOpportunityDetailModal } from "./PartnerOpportunityDetailModal";
import { PartnerCollaborationDetailModal } from "./PartnerCollaborationDetailModal";
import { PartnerProgramDetailModal } from "./PartnerProgramDetailModal";
import { EsgAnalyticsView } from "../analytics/EsgAnalyticsView";
import { ConversationCenterView } from "../conversations/ConversationCenterView";
import { PartnerFullProfileView } from "./profile/PartnerFullProfileView";
import { CompanyFullProfileView } from "../company/profile/CompanyFullProfileView";
import {
  PartnerNavMenu,
  PartnerProfile,
  OpportunityItem,
  ProposalItem,
  PartnerOpportunityInvitationItem,
  PartnerCollaborationItem,
  PartnerProgramItem,
} from "./types";
import {
  FOCUS_AREA_CONFIG,
  STATUS_CONFIG,
  PROPOSAL_STATUS_CONFIG,
  INVITATION_STATUS_CONFIG,
  COLLABORATION_STATUS_CONFIG,
  PROGRAM_STATUS_CONFIG,
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
  const [activeCollaborationChatId, setActiveCollaborationChatId] = useState<string | null>(null);

  // Data states
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [invitations, setInvitations] = useState<PartnerOpportunityInvitationItem[]>([]);
  const [collaborations, setCollaborations] = useState<PartnerCollaborationItem[]>([]);
  const [programs, setPrograms] = useState<PartnerProgramItem[]>([]);

  // Loading states
  const [isLoadingPartner, setIsLoadingPartner] = useState(true);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [isLoadingCollaborations, setIsLoadingCollaborations] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  // Filters
  const [exploreSearch, setExploreSearch] = useState("");
  const [exploreFocusFilter, setExploreFocusFilter] = useState<string>("ALL");
  const [proposalStatusFilter, setProposalStatusFilter] = useState<string>("ALL");
  const [collabSearch, setCollabSearch] = useState("");
  const [collabStatusFilter, setCollabStatusFilter] = useState<string>("ALL");
  const [programSearch, setProgramSearch] = useState("");
  const [programStatusFilter, setProgramStatusFilter] = useState<string>("ALL");

  // Modals state
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<OpportunityItem | null>(null);
  const [selectedOppForProposal, setSelectedOppForProposal] = useState<OpportunityItem | null>(null);
  const [selectedProposalForDetail, setSelectedProposalForDetail] = useState<ProposalItem | null>(null);
  const [selectedCollabForDetail, setSelectedCollabForDetail] = useState<PartnerCollaborationItem | null>(null);
  const [selectedProgramForDetail, setSelectedProgramForDetail] = useState<PartnerProgramItem | null>(null);
  const [selectedCompanyForDetail, setSelectedCompanyForDetail] = useState<any | null>(null);
  const [isLoadingCompanyDetail, setIsLoadingCompanyDetail] = useState(false);

  const handleViewCompanyDetail = async (companyId: string) => {
    setIsLoadingCompanyDetail(true);
    try {
      const res = await fetch(`/api/companies/${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedCompanyForDetail(json.data);
        setActiveMenu("explore");
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingCompanyDetail(false);
    }
  };

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

  const fetchCollaborations = async () => {
    setIsLoadingCollaborations(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("/api/collaborations?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
          ? json.data.data
          : [];
        setCollaborations(list);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingCollaborations(false);
    }
  };

  const fetchPrograms = async () => {
    setIsLoadingPrograms(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("/api/programs?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
          ? json.data.data
          : [];
        setPrograms(list);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  useEffect(() => {
    fetchPartnerProfile();
    fetchOpportunities();
    fetchProposals();
    fetchInvitations();
    fetchCollaborations();
    fetchPrograms();
  }, [user.partnerId]);

  const handleRefreshAll = () => {
    fetchPartnerProfile();
    fetchOpportunities();
    fetchProposals();
    fetchInvitations();
    fetchCollaborations();
    fetchPrograms();
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

  const negotiatingCollabs = useMemo(
    () => collaborations.filter((c) => c.status === "NEGOTIATION"),
    [collaborations]
  );

  const agreedCollabs = useMemo(
    () => collaborations.filter((c) => c.status === "AGREED"),
    [collaborations]
  );

  const totalAgreedCollabBudget = useMemo(() => {
    return agreedCollabs.reduce((acc, curr) => {
      const num = curr.finalBudget ? parseFloat(curr.finalBudget) : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [agreedCollabs]);

  const inProgressPrograms = useMemo(
    () => programs.filter((p) => p.status === "IN_PROGRESS"),
    [programs]
  );

  const completedPrograms = useMemo(
    () => programs.filter((p) => p.status === "COMPLETED"),
    [programs]
  );

  const totalProgramBudget = useMemo(() => {
    return programs.reduce((acc, curr) => {
      const num = curr.budget ? parseFloat(curr.budget) : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [programs]);

  const totalSpentBudget = useMemo(() => {
    return programs.reduce((acc, curr) => {
      const num = curr.spentBudget ? parseFloat(curr.spentBudget) : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [programs]);

  const budgetAbsorptionRate =
    totalProgramBudget > 0 ? Math.round((totalSpentBudget / totalProgramBudget) * 100) : 0;

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch =
        (p.title && p.title.toLowerCase().includes(programSearch.toLowerCase())) ||
        (p.companyName && p.companyName.toLowerCase().includes(programSearch.toLowerCase())) ||
        (p.opportunityTitle && p.opportunityTitle.toLowerCase().includes(programSearch.toLowerCase())) ||
        (p.targetCity && p.targetCity.toLowerCase().includes(programSearch.toLowerCase())) ||
        (p.actualBeneficiaries && p.actualBeneficiaries.toLowerCase().includes(programSearch.toLowerCase()));

      const matchStatus =
        programStatusFilter === "ALL" || p.status === programStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [programs, programSearch, programStatusFilter]);

  const filteredCollaborations = useMemo(() => {
    return collaborations.filter((c) => {
      const matchSearch =
        (c.companyName && c.companyName.toLowerCase().includes(collabSearch.toLowerCase())) ||
        (c.opportunityTitle && c.opportunityTitle.toLowerCase().includes(collabSearch.toLowerCase())) ||
        (c.proposalTitle && c.proposalTitle.toLowerCase().includes(collabSearch.toLowerCase())) ||
        (c.notes && c.notes.toLowerCase().includes(collabSearch.toLowerCase()));

      const matchStatus =
        collabStatusFilter === "ALL" || c.status === collabStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [collaborations, collabSearch, collabStatusFilter]);

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
          collaborations: collaborations.length,
          programs: inProgressPrograms.length || programs.length,
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
                {activeMenu === "collaborations" && "Kolaborasi & Kontrak MoU"}
                {activeMenu === "conversations" && "Pesan & Negosiasi"}
                {activeMenu === "programs" && "Pelaksanaan Program & Monitoring"}
                {activeMenu === "analytics" && "Laporan & Dampak ESG"}
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

              {/* Kontrak Kolaborasi Menunggu Negosiasi / MoU Banner */}
              {negotiatingCollabs.length > 0 && (
                <div className="p-6 rounded-3xl bg-teal-50/80 border border-teal-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
                        <h4 className="font-extrabold text-teal-950 text-sm">
                          Ada {negotiatingCollabs.length} Kontrak Kolaborasi Baru Menunggu Finalisasi MoU!
                        </h4>
                      </div>
                      <p className="text-xs text-teal-800 leading-relaxed max-w-2xl">
                        Proposal Anda telah diterima oleh perusahaan sponsor. Silakan periksa rincian anggaran yang disetujui, tanggal jadwal program, dan dokumen perjanjian MoU resmi.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs shrink-0 shadow-sm"
                    onClick={() => setActiveMenu("collaborations")}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Buka Kolaborasi ({negotiatingCollabs.length})
                  </Button>
                </div>
              )}

              {/* Program Lapangan Berjalan & Monitoring Banner */}
              {inProgressPrograms.length > 0 && (
                <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                        <h4 className="font-extrabold text-emerald-950 text-sm">
                          {inProgressPrograms.length} Program Sedang Berjalan & Butuh Pembaruan Progres Lapangan!
                        </h4>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed max-w-2xl">
                        Laporkan realisasi serapan anggaran ({formatRupiah(totalSpentBudget)} terserap dari {formatRupiah(totalProgramBudget)}) dan capaian penerima manfaat lapangan agar perusahaan donor mendapatkan visibilitas dampak secara real-time.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shrink-0 shadow-sm"
                    onClick={() => setActiveMenu("programs")}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Buka Pelaksanaan Program ({inProgressPrograms.length})
                  </Button>
                </div>
              )}

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
          {activeMenu === "explore" && selectedCompanyForDetail ? (
            <CompanyFullProfileView
              company={selectedCompanyForDetail}
              isOwner={false}
              onBack={() => setSelectedCompanyForDetail(null)}
              onApplyOpportunity={(opp) => {
                setSelectedCompanyForDetail(null);
                setSelectedOppForProposal(opp);
              }}
            />
          ) : activeMenu === "explore" && (
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
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (opp.companyId) handleViewCompanyDetail(opp.companyId);
                              }}
                              className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-700 transition-colors text-left group/comp"
                              title="Lihat Profil Perusahaan"
                            >
                              <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0 group-hover/comp:scale-110 transition-transform" />
                              <span className="font-semibold text-slate-700 group-hover/comp:text-emerald-700 group-hover/comp:underline truncate">
                                {opp.companyName || "Perusahaan CSR"}
                              </span>
                            </button>

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
          {/* SUBVIEW 5: COLLABORATIONS (KOLABORASI & KONTRAK MOU) */}
          {/* ========================================================================= */}
          {activeMenu === "collaborations" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Kontrak Kolaborasi & Perjanjian MoU
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar resmi kesepakatan kerja sama program CSR antara organisasi Anda dan perusahaan sponsor
                </p>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500">Total Kontrak / MoU</span>
                    <div className="text-2xl font-extrabold text-slate-900">{collaborations.length}</div>
                    <span className="text-[11px] text-slate-400 block">Dari proposal yang diterima</span>
                  </CardContent>
                </Card>

                <Card className={negotiatingCollabs.length > 0 ? "border-amber-200 bg-amber-50/20" : ""}>
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-600">Tahap Negosiasi</span>
                      {negotiatingCollabs.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <div className="text-2xl font-extrabold text-amber-600">{negotiatingCollabs.length}</div>
                    <span className="text-[11px] text-amber-700 font-medium block">Penyepakatan & berkas legal</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-emerald-600">MoU Disepakati</span>
                    <div className="text-2xl font-extrabold text-emerald-600">{agreedCollabs.length}</div>
                    <span className="text-[11px] text-slate-400 block">Siap dieksekusi di lapangan</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-teal-600">Total Nilai Disahkan</span>
                    <div className="text-2xl font-extrabold text-teal-600 truncate">
                      {formatRupiah(totalAgreedCollabBudget)}
                    </div>
                    <span className="text-[11px] text-slate-400 block">Anggaran definitif disetujui</span>
                  </CardContent>
                </Card>
              </div>

              {/* Filters & Search Bar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={collabSearch}
                    onChange={(e) => setCollabSearch(e.target.value)}
                    placeholder="Cari kolaborasi berdasarkan nama perusahaan, inisiatif CSR, atau proposal..."
                    className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {[
                    { key: "ALL", label: `Semua (${collaborations.length})` },
                    { key: "NEGOTIATION", label: `Tahap Negosiasi (${negotiatingCollabs.length})` },
                    { key: "AGREED", label: `MoU Disahkan (${agreedCollabs.length})` },
                    { key: "CANCELLED", label: "Dibatalkan" },
                  ].map((tab) => {
                    const isSelected = collabStatusFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setCollabStatusFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content List */}
              {isLoadingCollaborations ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                  <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Memuat data kontrak kerja sama...</p>
                </div>
              ) : filteredCollaborations.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="font-bold text-slate-800 text-base">
                      {collaborations.length === 0
                        ? "Belum Ada Kontrak Kolaborasi"
                        : "Tidak Ada Kolaborasi yang Sesuai"}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {collaborations.length === 0
                        ? "Saat proposal inisiatif Anda disetujui (Accepted) oleh pihak perusahaan, proyek tersebut secara otomatis tercatat sebagai kontrak kolaborasi di sini untuk disepakati MoU-nya."
                        : "Coba ubah kata kunci pencarian atau ganti filter status di atas."}
                    </p>
                  </div>
                  {collaborations.length === 0 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveMenu("proposals")}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Buka Proposal Saya
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCollabSearch("");
                        setCollabStatusFilter("ALL");
                      }}
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCollaborations.map((collab) => {
                    const statusConfig =
                      COLLABORATION_STATUS_CONFIG[collab.status] || {
                        label: collab.status,
                        variant: "slate",
                      };

                    return (
                      <div
                        key={collab.id}
                        className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all space-y-4"
                      >
                        {/* Header: Company Profile + Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-700 text-sm overflow-hidden shrink-0">
                              {collab.companyLogo ? (
                                <img
                                  src={collab.companyLogo}
                                  alt={collab.companyName || "Perusahaan"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (collab.companyName || "C").substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">
                                  {collab.companyName || "Perusahaan Sponsor"}
                                </h4>
                                {collab.companyCity && (
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {collab.companyCity}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 mt-0.5 block">
                                Dibuat: {formatDate(collab.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={statusConfig.variant} size="md" hasDot>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Program & Proposal Info */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                              Inisiatif CSR:
                            </span>
                            <span className="font-bold text-teal-700 truncate">
                              {collab.opportunityTitle || "Inisiatif CSR"}
                            </span>
                            {collab.opportunityFocusArea && (
                              <Badge
                                variant={
                                  FOCUS_AREA_CONFIG[collab.opportunityFocusArea as CsrFocusArea]?.variant || "slate"
                                }
                                size="sm"
                              >
                                {FOCUS_AREA_CONFIG[collab.opportunityFocusArea as CsrFocusArea]?.label ||
                                  collab.opportunityFocusArea}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                            {collab.proposalTitle || "Program Kerjasama CSR"}
                          </h3>
                          {collab.proposalSummary && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {collab.proposalSummary}
                            </p>
                          )}
                        </div>

                        {/* Metrics Bar */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 font-medium">Anggaran Disepakati</span>
                            <div className="text-sm font-extrabold text-emerald-600">
                              {formatRupiah(collab.finalBudget || collab.proposedBudget)}
                            </div>
                            {collab.finalBudget && collab.proposedBudget && collab.finalBudget !== collab.proposedBudget && (
                              <span className="text-[10px] text-slate-400 block line-through">
                                Usulan: {formatRupiah(collab.proposedBudget)}
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 font-medium">Jadwal Pelaksanaan</span>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {collab.startDate && collab.endDate
                                ? `${formatDate(collab.startDate)} s/d ${formatDate(collab.endDate)}`
                                : "Belum ditentukan"}
                            </div>
                          </div>

                          <div className="space-y-0.5 max-w-[200px]">
                            <span className="text-[11px] text-slate-400 font-medium">Penerima Manfaat</span>
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {collab.targetBeneficiaries || "-"}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 font-medium block">Dokumen MoU</span>
                            {collab.mouDocumentUrl ? (
                              <a
                                href={collab.mouDocumentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                              >
                                <FileCheck2 className="w-3.5 h-3.5" />
                                Lihat Berkas MoU
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                                <Clock className="w-3 h-3" /> Menunggu Berkas
                              </span>
                            )}
                          </div>

                          <div className="pt-2 sm:pt-0 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs border-teal-200 text-teal-700 bg-teal-50/60 hover:bg-teal-100/70"
                              onClick={() => {
                                setActiveCollaborationChatId(collab.id);
                                setActiveMenu("conversations");
                              }}
                              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                            >
                              Pesan
                            </Button>

                            {collab.status === "NEGOTIATION" ? (
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs shadow-xs"
                                onClick={() => setSelectedCollabForDetail(collab)}
                                leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
                              >
                                Tinjau Kesepakatan & MoU
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs border-slate-200 hover:border-slate-300"
                                onClick={() => setSelectedCollabForDetail(collab)}
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                {collab.status === "AGREED" ? "Detail Kontrak & MoU" : "Lihat Catatan"}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Notes Preview if available */}
                        {collab.notes && (
                          <div className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/50 flex items-start gap-2">
                            <span className="font-semibold text-amber-900 not-italic shrink-0">Catatan Kesepakatan:</span>
                            <span className="not-italic text-slate-700 line-clamp-2">"{collab.notes}"</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW: PROGRAMS (PELAKSANAAN PROGRAM & IMPACT TRACKING) */}
          {/* ========================================================================= */}
          {activeMenu === "programs" && (
            <div className="space-y-8">
              {/* Executive Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Total Program
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {programs.length}
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Alokasi MoU: {formatRupiah(totalProgramBudget)}
                    </span>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Sedang Berjalan
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-600">
                      {inProgressPrograms.length}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium block">
                      Eksekusi aktif di lapangan
                    </span>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Serapan Anggaran
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-indigo-600 truncate">
                      {formatRupiah(totalSpentBudget)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(budgetAbsorptionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        {budgetAbsorptionRate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Program Tuntas
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {completedPrograms.length}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Telah selesai dilaporkan
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Filters & Search */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari program, perusahaan mitra, inisiatif, atau penerima manfaat..."
                    value={programSearch}
                    onChange={(e) => setProgramSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Status:
                  </span>
                  {[
                    { id: "ALL", label: "Semua Status" },
                    { id: "PLANNED", label: "Direncanakan (PLANNED)" },
                    { id: "IN_PROGRESS", label: "Sedang Berjalan (IN_PROGRESS)" },
                    { id: "COMPLETED", label: "Selesai (COMPLETED)" },
                    { id: "ON_HOLD", label: "Ditunda (ON_HOLD)" },
                    { id: "CANCELLED", label: "Dibatalkan (CANCELLED)" },
                  ].map((chip) => {
                    const isSelected = programStatusFilter === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setProgramStatusFilter(chip.id)}
                        className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Programs List */}
              {isLoadingPrograms ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                  Memuat data program pelaksanaan...
                </div>
              ) : filteredPrograms.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Tidak Ada Program Ditemukan
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {programSearch || programStatusFilter !== "ALL"
                      ? "Tidak ada program yang sesuai dengan kata kunci pencarian Anda."
                      : "Program lapangan dibuat secara otomatis setelah perjanjian MoU disahkan (status AGREED) bersama perusahaan donor."}
                  </p>
                  {collaborations.some((c) => c.status === "NEGOTIATION") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveMenu("collaborations")}
                      leftIcon={<FileCheck2 className="w-4 h-4" />}
                      className="mt-2"
                    >
                      Buka Tab Kolaborasi & Selesaikan MoU
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredPrograms.map((prog) => {
                    const statusConfig = PROGRAM_STATUS_CONFIG[prog.status] || {
                      label: prog.status,
                      variant: "slate" as const,
                    };
                    const focusConfig = FOCUS_AREA_CONFIG[prog.focusArea as CsrFocusArea] || {
                      label: prog.focusArea || "Umum",
                    };
                    const numBudget = prog.budget ? parseFloat(prog.budget) : 0;
                    const numSpent = prog.spentBudget ? parseFloat(prog.spentBudget) : 0;
                    const absorptionRate =
                      numBudget > 0 ? Math.round((numSpent / numBudget) * 100) : 0;

                    return (
                      <div
                        key={prog.id}
                        className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-5"
                      >
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/80">
                              {focusConfig.label}
                            </span>
                            <Badge variant={statusConfig.variant} size="md" hasDot>
                              {statusConfig.label}
                            </Badge>
                            {prog.targetCity && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {prog.targetCity}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {prog.startDate && prog.endDate
                              ? `${formatDate(prog.startDate)} s/d ${formatDate(prog.endDate)}`
                              : "Periode belum ditentukan"}
                          </div>
                        </div>

                        {/* Title & Organization Context */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                              Perusahaan Sponsor:
                            </span>
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-teal-600" />
                              {prog.companyName || "Perusahaan Mitra"}
                            </span>
                            {prog.opportunityTitle && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 truncate">
                                  Inisiatif: {prog.opportunityTitle}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                            {prog.title}
                          </h3>

                          {prog.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {prog.description}
                            </p>
                          )}
                        </div>

                        {/* Financial & Impact Metrics Card */}
                        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Serapan Anggaran */}
                          <div className="space-y-1.5 md:border-r border-slate-200/60 md:pr-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500 font-medium">
                                Serapan Anggaran
                              </span>
                              <span className="font-bold text-slate-700 text-[11px]">
                                {absorptionRate}%
                              </span>
                            </div>
                            <div className="text-sm font-extrabold text-emerald-600">
                              {formatRupiah(prog.spentBudget || "0")}
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(absorptionRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Alokasi MoU: {formatRupiah(prog.budget)}
                            </span>
                          </div>

                          {/* Penerima Manfaat */}
                          <div className="space-y-1 md:border-r border-slate-200/60 md:pr-4">
                            <span className="text-[11px] text-slate-500 font-medium block">
                              Penerima Manfaat Riil Lapangan
                            </span>
                            <div className="text-xs font-bold text-slate-800">
                              {prog.actualBeneficiaries || (
                                <span className="text-slate-400 font-normal italic">
                                  Belum diisi
                                </span>
                              )}
                            </div>
                            {prog.targetBeneficiaries && (
                              <span className="text-[10px] text-slate-400 block">
                                Target MoU: {prog.targetBeneficiaries}
                              </span>
                            )}
                          </div>

                          {/* Action Button & Status */}
                          <div className="flex flex-col justify-between gap-2 pt-1 md:pt-0">
                            <div>
                              <span className="text-[10px] text-slate-400 block">
                                Update Terakhir: {formatDate(prog.updatedAt)}
                              </span>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs shadow-xs"
                              onClick={() => setSelectedProgramForDetail(prog)}
                              leftIcon={<Activity className="w-3.5 h-3.5" />}
                            >
                              Update Laporan Progres & Serapan
                            </Button>
                          </div>
                        </div>

                        {/* Recent Progress Notes if any */}
                        {prog.description && (
                          <div className="text-xs text-slate-600 bg-teal-50/50 p-3 rounded-xl border border-teal-200/60 flex items-start gap-2">
                            <span className="font-semibold text-teal-900 shrink-0">
                              Catatan Lapangan Terakhir:
                            </span>
                            <span className="text-slate-700 line-clamp-2">
                              "{prog.description}"
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW: ANALYTICS (LAPORAN & DAMPAK ESG) */}
          {/* ========================================================================= */}
          {activeMenu === "analytics" && (
            <EsgAnalyticsView
              role="PARTNER"
              organizationName={partner?.name}
              programs={programs}
              onOpenProgramDetail={(p) => {
                const found = programs.find((item) => item.id === p.id);
                if (found) setSelectedProgramForDetail(found);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW 6: PROFILE (PROFIL LEMBAGA) */}
          {/* ========================================================================= */}
          {activeMenu === "profile" && partner && (
            <PartnerFullProfileView
              partner={partner}
              isOwner={true}
              onProfileUpdated={(updated) => {
                setPartner(updated);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW: CONVERSATIONS (PESAN & NEGOSIASI) */}
          {/* ========================================================================= */}
          {activeMenu === "conversations" && (
            <div className="space-y-4">
              <ConversationCenterView
                userRole="PARTNER_ADMIN"
                initialCollaborationId={activeCollaborationChatId}
                onViewCollaborationDetails={(collabId) => {
                  const found = collaborations.find((c) => c.id === collabId);
                  if (found) setSelectedCollabForDetail(found);
                }}
              />
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
        onViewCompany={(companyId) => handleViewCompanyDetail(companyId)}
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

      {/* 4. Modal Detail Kolaborasi & MoU */}
      <PartnerCollaborationDetailModal
        isOpen={Boolean(selectedCollabForDetail)}
        collaboration={selectedCollabForDetail}
        onClose={() => setSelectedCollabForDetail(null)}
        onOpenChat={(collabId) => {
          setSelectedCollabForDetail(null);
          setActiveCollaborationChatId(collabId);
          setActiveMenu("conversations");
        }}
        onSuccess={() => {
          fetchCollaborations();
          fetchPrograms();
        }}
      />

      {/* 5. Modal Detail Pelaksanaan Program */}
      <PartnerProgramDetailModal
        isOpen={Boolean(selectedProgramForDetail)}
        program={selectedProgramForDetail}
        onClose={() => setSelectedProgramForDetail(null)}
        onSuccess={() => {
          fetchPrograms();
        }}
      />
    </div>
  );
}
