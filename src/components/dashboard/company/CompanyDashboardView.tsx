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
  Activity,
  MessageSquare,
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
  CompanyProposalItem,
  CompanyCollaborationItem,
  CompanyProgramItem,
} from "./types";
import {
  FOCUS_AREA_CONFIG,
  STATUS_CONFIG,
  PROPOSAL_STATUS_CONFIG,
  COLLABORATION_STATUS_CONFIG,
  PROGRAM_STATUS_CONFIG,
  formatRupiah,
  formatDate,
} from "./helpers";
import { ReviewProposalModal } from "./ReviewProposalModal";
import { CollaborationDetailModal } from "./CollaborationDetailModal";
import { ProgramDetailModal } from "./ProgramDetailModal";
import { EsgAnalyticsView } from "../analytics/EsgAnalyticsView";
import { ConversationCenterView } from "../conversations/ConversationCenterView";
import { PartnerFullProfileView } from "../partner/profile/PartnerFullProfileView";
import { CompanyFullProfileView } from "./profile/CompanyFullProfileView";

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
  const [activeCollaborationChatId, setActiveCollaborationChatId] = useState<string | null>(null);

  // Data states
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [proposals, setProposals] = useState<CompanyProposalItem[]>([]);
  const [collaborations, setCollaborations] = useState<CompanyCollaborationItem[]>([]);
  const [programs, setPrograms] = useState<CompanyProgramItem[]>([]);

  // Loading states
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [isLoadingCollaborations, setIsLoadingCollaborations] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  // Filters
  const [oppSearch, setOppSearch] = useState("");
  const [oppStatusFilter, setOppStatusFilter] = useState<string>("ALL");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerFocusFilter, setPartnerFocusFilter] = useState<string>("ALL");
  const [proposalSearch, setProposalSearch] = useState("");
  const [proposalStatusFilter, setProposalStatusFilter] = useState<string>("ALL");
  const [proposalOppFilter, setProposalOppFilter] = useState<string>("ALL");
  const [collabSearch, setCollabSearch] = useState("");
  const [collabStatusFilter, setCollabStatusFilter] = useState<string>("ALL");
  const [programSearch, setProgramSearch] = useState("");
  const [programStatusFilter, setProgramStatusFilter] = useState<string>("ALL");
  const [programFocusFilter, setProgramFocusFilter] = useState<string>("ALL");

  // Modal states
  const [isCreateOppOpen, setIsCreateOppOpen] = useState(false);
  const [selectedOppForEdit, setSelectedOppForEdit] = useState<OpportunityItem | null>(null);
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<OpportunityItem | null>(null);
  const [selectedPartnerForInvite, setSelectedPartnerForInvite] = useState<PartnerItem | null>(null);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [selectedProposalForReview, setSelectedProposalForReview] = useState<CompanyProposalItem | null>(null);
  const [selectedCollabForDetail, setSelectedCollabForDetail] = useState<CompanyCollaborationItem | null>(null);
  const [selectedProgramForDetail, setSelectedProgramForDetail] = useState<CompanyProgramItem | null>(null);
  const [selectedPartnerForDetail, setSelectedPartnerForDetail] = useState<any | null>(null);
  const [isLoadingPartnerDetail, setIsLoadingPartnerDetail] = useState(false);
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

  const handleViewPartnerDetail = async (partnerItem: PartnerItem) => {
    setIsLoadingPartnerDetail(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/partners/${partnerItem.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setSelectedPartnerForDetail(json.data);
      } else {
        setSelectedPartnerForDetail(partnerItem);
      }
    } catch {
      setSelectedPartnerForDetail(partnerItem);
    } finally {
      setIsLoadingPartnerDetail(false);
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

  const fetchProposals = async () => {
    setIsLoadingProposals(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("/api/proposals/company?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
          ? json.data.data
          : [];
        setProposals(list);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingProposals(false);
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
      // fallback
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
      // fallback
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCompanyData();
    fetchOpportunities();
    fetchPartners();
    fetchProposals();
    fetchCollaborations();
    fetchPrograms();
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

    const propList = Array.isArray(proposals) ? proposals : [];
    const submittedProposalsCount = propList.filter((p) => p?.status === "SUBMITTED").length;
    const underReviewProposalsCount = propList.filter((p) => p?.status === "UNDER_REVIEW").length;
    const acceptedProposalsCount = propList.filter((p) => p?.status === "ACCEPTED").length;
    const totalProposalBudget = propList.reduce((acc, curr) => {
      const num = curr?.proposedBudget ? parseFloat(curr.proposedBudget) : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

    const collabList = Array.isArray(collaborations) ? collaborations : [];
    const negotiatingCollabsCount = collabList.filter((c) => c?.status === "NEGOTIATION").length;
    const agreedCollabsCount = collabList.filter((c) => c?.status === "AGREED").length;
    const totalAgreedBudget = collabList
      .filter((c) => c?.status === "AGREED")
      .reduce((acc, curr) => {
        const num = curr?.finalBudget ? parseFloat(curr.finalBudget) : 0;
        return acc + (isNaN(num) ? 0 : num);
      }, 0);

    const progList = Array.isArray(programs) ? programs : [];
    const totalProgramsCount = progList.length;
    const inProgressProgramsCount = progList.filter((p) => p?.status === "IN_PROGRESS").length;
    const completedProgramsCount = progList.filter((p) => p?.status === "COMPLETED").length;
    const totalProgramBudget = progList.reduce((acc, curr) => {
      const num = curr?.budget ? parseFloat(curr.budget) : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    const totalSpentBudget = progList.reduce((acc, curr) => {
      const num = curr?.spentBudget ? parseFloat(curr.spentBudget) : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    const budgetAbsorptionRate =
      totalProgramBudget > 0 ? Math.round((totalSpentBudget / totalProgramBudget) * 100) : 0;

    return {
      totalOpps,
      activeOpps,
      totalBudget,
      membersCount,
      pendingInvitesCount,
      submittedProposalsCount,
      underReviewProposalsCount,
      acceptedProposalsCount,
      totalProposalBudget,
      negotiatingCollabsCount,
      agreedCollabsCount,
      totalAgreedBudget,
      totalProgramsCount,
      inProgressProgramsCount,
      completedProgramsCount,
      totalProgramBudget,
      totalSpentBudget,
      budgetAbsorptionRate,
    };
  }, [opportunities, company, invitations, proposals, collaborations, programs]);

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

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    const list = Array.isArray(proposals) ? proposals : [];
    return list.filter((p) => {
      if (!p) return false;
      const matchSearch =
        p.title?.toLowerCase().includes(proposalSearch.toLowerCase()) ||
        (p.partnerName && p.partnerName.toLowerCase().includes(proposalSearch.toLowerCase())) ||
        (p.opportunityTitle && p.opportunityTitle.toLowerCase().includes(proposalSearch.toLowerCase()));

      const matchStatus =
        proposalStatusFilter === "ALL" || p.status === proposalStatusFilter;

      const matchOpp =
        proposalOppFilter === "ALL" || p.opportunityId === proposalOppFilter;

      return matchSearch && matchStatus && matchOpp;
    });
  }, [proposals, proposalSearch, proposalStatusFilter, proposalOppFilter]);

  // Filtered Collaborations
  const filteredCollaborations = useMemo(() => {
    const list = Array.isArray(collaborations) ? collaborations : [];
    return list.filter((c) => {
      if (!c) return false;
      const matchSearch =
        (c.opportunityTitle && c.opportunityTitle.toLowerCase().includes(collabSearch.toLowerCase())) ||
        (c.partnerName && c.partnerName.toLowerCase().includes(collabSearch.toLowerCase())) ||
        (c.proposalTitle && c.proposalTitle.toLowerCase().includes(collabSearch.toLowerCase())) ||
        (c.notes && c.notes.toLowerCase().includes(collabSearch.toLowerCase()));

      const matchStatus =
        collabStatusFilter === "ALL" || c.status === collabStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [collaborations, collabSearch, collabStatusFilter]);

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    const list = Array.isArray(programs) ? programs : [];
    return list.filter((p) => {
      if (!p) return false;
      const matchSearch =
        (p.title && p.title.toLowerCase().includes(programSearch.toLowerCase())) ||
        (p.partnerName && p.partnerName.toLowerCase().includes(programSearch.toLowerCase())) ||
        (p.opportunityTitle && p.opportunityTitle.toLowerCase().includes(programSearch.toLowerCase())) ||
        (p.targetCity && p.targetCity.toLowerCase().includes(programSearch.toLowerCase())) ||
        (p.actualBeneficiaries && p.actualBeneficiaries.toLowerCase().includes(programSearch.toLowerCase()));

      const matchStatus =
        programStatusFilter === "ALL" || p.status === programStatusFilter;

      const matchFocus =
        programFocusFilter === "ALL" || p.focusArea === programFocusFilter;

      return matchSearch && matchStatus && matchFocus;
    });
  }, [programs, programSearch, programStatusFilter, programFocusFilter]);

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
    conversations: {
      title: "Pesan & Negosiasi",
      subtitle: "Ruang komunikasi dan negosiasi teknis langsung bersama mitra pelaksana",
    },
    programs: {
      title: "Pelaksanaan Program & Monitoring",
      subtitle: "Pantau progres eksekusi program di lapangan, realisasi serapan anggaran, dan capaian penerima manfaat riil",
    },
    analytics: {
      title: "Laporan & Dampak ESG",
      subtitle: "Analisis akuntabilitas dana CSR, pilar keberlanjutan (E-S-G), dan ekspor laporan resmi",
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
          proposals: metrics.submittedProposalsCount,
          collaborations: metrics.negotiatingCollabsCount,
          programs: metrics.inProgressProgramsCount || programs.length,
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

              {/* Proposal Baru Perlu Ditinjau Banner */}
              {metrics.submittedProposalsCount > 0 && (
                <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                        <h4 className="font-extrabold text-blue-950 text-sm">
                          Ada {metrics.submittedProposalsCount} Proposal Masuk Baru Menunggu Evaluasi!
                        </h4>
                      </div>
                      <p className="text-xs text-blue-800 leading-relaxed max-w-2xl">
                        Mitra pelaksana telah mengajukan proposal penawaran untuk program CSR Anda. Segera lakukan peninjauan teknis dan anggaran untuk memulai kerja sama.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0 shadow-sm"
                    onClick={() => setActiveMenu("proposals")}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Buka Proposal Masuk ({metrics.submittedProposalsCount})
                  </Button>
                </div>
              )}

              {/* Kontrak Kolaborasi Menunggu Negosiasi / MoU Banner */}
              {metrics.negotiatingCollabsCount > 0 && (
                <div className="p-6 rounded-3xl bg-amber-50/80 border border-amber-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
                        <h4 className="font-extrabold text-amber-950 text-sm">
                          Ada {metrics.negotiatingCollabsCount} Kontrak Kerja Sama Menunggu Finalisasi MoU!
                        </h4>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                        Proposal mitra yang telah disetujui berada dalam tahap negosiasi anggaran dan penandatanganan dokumen legal MoU sebelum program CSR resmi dimulai.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 shadow-sm"
                    onClick={() => setActiveMenu("collaborations")}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Kelola Kontrak ({metrics.negotiatingCollabsCount})
                  </Button>
                </div>
              )}

              {/* Program Berjalan & Monitoring Banner */}
              {metrics.inProgressProgramsCount > 0 && (
                <div className="p-6 rounded-3xl bg-teal-50/80 border border-teal-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
                        <h4 className="font-extrabold text-teal-950 text-sm">
                          {metrics.inProgressProgramsCount} Program CSR Sedang Berjalan di Lapangan!
                        </h4>
                      </div>
                      <p className="text-xs text-teal-800 leading-relaxed max-w-2xl">
                        Realisasi serapan anggaran saat ini mencapai {formatRupiah(metrics.totalSpentBudget)} ({metrics.budgetAbsorptionRate}% dari total alokasi). Pantau progres lapangan dan laporan dampak mitra.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs shrink-0 shadow-sm"
                    onClick={() => setActiveMenu("programs")}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Pantau Program ({metrics.inProgressProgramsCount})
                  </Button>
                </div>
              )}

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
                          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 overflow-hidden group"
                        >
                          <div className="space-y-2">
                            {opp.bannerUrl ? (
                              <div
                                className="relative -mx-5 -mt-5 h-36 overflow-hidden bg-slate-900 cursor-pointer"
                                onClick={() => setSelectedOppForDetail(opp)}
                              >
                                <img
                                  src={opp.bannerUrl}
                                  alt={opp.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                                  <Badge
                                    variant={statusCfg.variant}
                                    size="sm"
                                    hasDot
                                    className="shadow-sm backdrop-blur-md bg-white/95"
                                  >
                                    {statusCfg.label}
                                  </Badge>
                                  <Badge
                                    variant={focus.variant}
                                    size="sm"
                                    className="shadow-sm backdrop-blur-md bg-white/95"
                                  >
                                    {focus.label}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant={statusCfg.variant} size="sm" hasDot>
                                  {statusCfg.label}
                                </Badge>
                                <Badge variant={focus.variant} size="sm">
                                  {focus.label}
                                </Badge>
                              </div>
                            )}

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
                        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 overflow-hidden group"
                      >
                        <div className="space-y-3">
                          {opp.bannerUrl ? (
                            <div
                              className="relative -mx-5 -mt-5 h-44 overflow-hidden bg-slate-900 cursor-pointer"
                              onClick={() => setSelectedOppForDetail(opp)}
                            >
                              <img
                                src={opp.bannerUrl}
                                alt={opp.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                                <Badge
                                  variant={statusCfg.variant}
                                  size="sm"
                                  hasDot
                                  className="shadow-sm backdrop-blur-md bg-white/95"
                                >
                                  {statusCfg.label}
                                </Badge>
                                <Badge
                                  variant={focus.variant}
                                  size="sm"
                                  className="shadow-sm backdrop-blur-md bg-white/95"
                                >
                                  {focus.label}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant={statusCfg.variant} size="sm" hasDot>
                                {statusCfg.label}
                              </Badge>
                              <Badge variant={focus.variant} size="sm">
                                {focus.label}
                              </Badge>
                            </div>
                          )}

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
            selectedPartnerForDetail ? (
              <PartnerFullProfileView
                partner={selectedPartnerForDetail}
                isOwner={false}
                onBack={() => setSelectedPartnerForDetail(null)}
                onInvitePitch={() => {
                  const p = selectedPartnerForDetail;
                  setSelectedPartnerForDetail(null);
                  setSelectedPartnerForInvite(p);
                }}
                onOpenChat={() => {
                  setSelectedPartnerForDetail(null);
                  setActiveMenu("conversations");
                }}
              />
            ) : (
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
                        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 overflow-hidden">
                              {partner.logoUrl ? (
                                <img
                                  src={partner.logoUrl}
                                  alt={partner.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                partner.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <Badge variant={focus.variant} size="sm">
                              {focus.label}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                              {partner.name}
                            </h4>
                            {partner.tagline ? (
                              <p className="text-xs font-semibold text-teal-700 line-clamp-1 mt-0.5">
                                {partner.tagline}
                              </p>
                            ) : null}
                            {partner.city && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>
                                  {partner.city}, {partner.province || "Indonesia"}
                                </span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {partner.description || "Organisasi pelaksana program dampak sosial masyarakat."}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isLoadingPartnerDetail}
                            onClick={() => handleViewPartnerDetail(partner)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            className="text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50"
                          >
                            Lihat Profil
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedPartnerForInvite(partner)}
                            leftIcon={<Send className="w-3.5 h-3.5" />}
                            className="text-xs font-bold"
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
            )
          )}

          {/* ============================================================ */}
          {/* VIEW: PROPOSALS (PROPOSAL MASUK) */}
          {/* ============================================================ */}
          {activeMenu === "proposals" && (
            <div className="space-y-6">
              {/* Proposal Stat Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500">Total Proposal Masuk</span>
                    <div className="text-2xl font-extrabold text-slate-900">{proposals.length}</div>
                    <span className="text-[11px] text-slate-400 block">Dari seluruh inisiatif</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-blue-600">Perlu Ditinjau Segera</span>
                    <div className="text-2xl font-extrabold text-blue-600">{metrics.submittedProposalsCount}</div>
                    <span className="text-[11px] text-slate-400 block">Status SUBMITTED</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-amber-600">Sedang Dikaji</span>
                    <div className="text-2xl font-extrabold text-amber-600">{metrics.underReviewProposalsCount}</div>
                    <span className="text-[11px] text-slate-400 block">Status UNDER_REVIEW</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-emerald-600">Proposal Disetujui</span>
                    <div className="text-2xl font-extrabold text-emerald-600">{metrics.acceptedProposalsCount}</div>
                    <span className="text-[11px] text-slate-400 block">Menuju Kolaborasi</span>
                  </CardContent>
                </Card>
              </div>

              {/* Filters & Search Controls */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={proposalSearch}
                      onChange={(e) => setProposalSearch(e.target.value)}
                      placeholder="Cari proposal berdasarkan judul, nama mitra, atau inisiatif..."
                      className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Dropdown Inisiatif Filter */}
                  <div className="w-full md:w-64">
                    <select
                      value={proposalOppFilter}
                      onChange={(e) => setProposalOppFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="ALL">Semua Inisiatif CSR</option>
                      {opportunities.map((opp) => (
                        <option key={opp.id} value={opp.id}>
                          {opp.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {["ALL", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "ACCEPTED", "REJECTED", "WITHDRAWN"].map((st) => {
                    const isSelected = proposalStatusFilter === st;
                    const label =
                      st === "ALL"
                        ? "Semua Status"
                        : (PROPOSAL_STATUS_CONFIG as Record<string, { label: string }>)[st]?.label || st;
                    return (
                      <button
                        key={st}
                        onClick={() => setProposalStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Proposals Cards List */}
              {isLoadingProposals ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-600" />
                  <p className="text-xs">Memuat proposal masuk...</p>
                </div>
              ) : filteredProposals.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">
                    {proposals.length === 0
                      ? "Belum Ada Proposal Masuk"
                      : "Tidak Ada Proposal Sesuai Filter"}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {proposals.length === 0
                      ? "Saat mitra pelaksana mengirimkan proposal untuk peluang inisiatif Anda, proposal mereka akan muncul di sini untuk dievaluasi."
                      : "Coba ubah kata kunci pencarian atau sesuaikan filter status untuk melihat proposal lainnya."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProposals.map((prop) => {
                    const statusCfg = (PROPOSAL_STATUS_CONFIG as Record<string, { label: string; variant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate" }>)[prop.status] || {
                      label: prop.status,
                      variant: "slate" as const,
                    };
                    return (
                      <div
                        key={prop.id}
                        className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 sm:p-6 space-y-4"
                      >
                        {/* Top row: Mitra & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {prop.partnerLogo ? (
                              <img
                                src={prop.partnerLogo}
                                alt={prop.partnerName || "Logo"}
                                className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 border border-teal-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                                <HeartHandshake className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">
                                  {prop.partnerName || "Mitra Pelaksana"}
                                </h4>
                                {prop.partnerCity && (
                                  <span className="text-[11px] text-slate-400">
                                    • {prop.partnerCity}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Diajukan {formatDate(prop.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={statusCfg.variant} size="sm" hasDot>
                              {statusCfg.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Title & Opportunity Target */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                              Inisiatif:
                            </span>
                            <span className="font-bold text-emerald-700 truncate">
                              {prop.opportunityTitle}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                            {prop.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {prop.summary}
                          </p>
                        </div>

                        {/* Metrics Bar */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 font-medium">Usulan Anggaran</span>
                            <div className="text-sm font-extrabold text-emerald-600">
                              {formatRupiah(prop.proposedBudget)}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 font-medium">Durasi Pelaksanaan</span>
                            <div className="text-xs font-bold text-slate-800">
                              {prop.durationMonths ? `${prop.durationMonths} Bulan` : "Fleksibel"}
                            </div>
                          </div>

                          <div className="space-y-0.5 max-w-[200px] truncate">
                            <span className="text-[11px] text-slate-400 font-medium">Penerima Manfaat</span>
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {prop.targetBeneficiaries || "-"}
                            </div>
                          </div>

                          <div className="pt-1 sm:pt-0">
                            <Button
                              variant="primary"
                              size="sm"
                              className={
                                prop.status === "SUBMITTED"
                                  ? "bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-xs"
                              }
                              onClick={() => setSelectedProposalForReview(prop)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              {prop.status === "SUBMITTED" ? "Evaluasi Proposal" : "Tinjau / Edit Keputusan"}
                            </Button>
                          </div>
                        </div>

                        {/* Feedback preview if present */}
                        {prop.feedback && (
                          <div className="text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                            <span className="font-semibold text-amber-900 not-italic mr-1.5">Catatan Evaluasi:</span>
                            "{prop.feedback}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: COLLABORATIONS (KOLABORASI & KONTRAK KERJASAMA MOU) */}
          {/* ============================================================ */}
          {activeMenu === "collaborations" && (
            <div className="space-y-6">
              {/* Top Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500">Total Kontrak / MoU</span>
                    <div className="text-2xl font-extrabold text-slate-900">{collaborations.length}</div>
                    <span className="text-[11px] text-slate-400 block">Dari seluruh proposal diterima</span>
                  </CardContent>
                </Card>

                <Card className={metrics.negotiatingCollabsCount > 0 ? "border-amber-200 bg-amber-50/20" : ""}>
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-600">Tahap Negosiasi</span>
                      {metrics.negotiatingCollabsCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <div className="text-2xl font-extrabold text-amber-600">{metrics.negotiatingCollabsCount}</div>
                    <span className="text-[11px] text-amber-700 font-medium block">Perlu penyepakatan & MoU</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-emerald-600">MoU Disepakati</span>
                    <div className="text-2xl font-extrabold text-emerald-600">{metrics.agreedCollabsCount}</div>
                    <span className="text-[11px] text-slate-400 block">Siap / dalam eksekusi program</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1.5">
                    <span className="text-xs font-semibold text-teal-600">Total Anggaran Disahkan</span>
                    <div className="text-2xl font-extrabold text-teal-600 truncate">
                      {formatRupiah(metrics.totalAgreedBudget)}
                    </div>
                    <span className="text-[11px] text-slate-400 block">Komitmen CSR definitif</span>
                  </CardContent>
                </Card>
              </div>

              {/* Filters & Search Controls */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={collabSearch}
                      onChange={(e) => setCollabSearch(e.target.value)}
                      placeholder="Cari kolaborasi berdasarkan nama mitra, judul inisiatif, atau proposal..."
                      className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Status Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {[
                    { key: "ALL", label: `Semua (${collaborations.length})` },
                    { key: "NEGOTIATION", label: `Tahap Negosiasi (${metrics.negotiatingCollabsCount})` },
                    { key: "AGREED", label: `MoU Disahkan (${metrics.agreedCollabsCount})` },
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

              {/* List Content */}
              {isLoadingCollaborations ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
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
                        ? "Kontrak kolaborasi terbentuk secara otomatis saat Anda menerima (Accept) proposal mitra pada tab Proposal Masuk. Anda kemudian dapat menyepakati anggaran final, jadwal pelaksanaan, dan mengunggah dokumen MoU."
                        : "Coba ubah kata kunci pencarian atau ganti filter status di atas."}
                    </p>
                  </div>
                  {collaborations.length === 0 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveMenu("proposals")}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Buka Tab Proposal Masuk
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
                        className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all space-y-4"
                      >
                        {/* Header: Partner + Status + Date */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-700 text-sm overflow-hidden shrink-0">
                              {collab.partnerLogo ? (
                                <img
                                  src={collab.partnerLogo}
                                  alt={collab.partnerName || "Partner"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (collab.partnerName || "P").substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">
                                  {collab.partnerName || "Mitra CSR"}
                                </h4>
                                {collab.partnerFocusArea && (
                                  <Badge
                                    variant={
                                      FOCUS_AREA_CONFIG[collab.partnerFocusArea as CsrFocusArea]?.variant || "slate"
                                    }
                                    size="sm"
                                  >
                                    {FOCUS_AREA_CONFIG[collab.partnerFocusArea as CsrFocusArea]?.label ||
                                      collab.partnerFocusArea}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                {collab.partnerCity && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {collab.partnerCity}
                                  </span>
                                )}
                                <span>•</span>
                                <span>Dibuat: {formatDate(collab.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={statusConfig.variant} size="md" hasDot>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Title & Opportunity Context */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                              Inisiatif:
                            </span>
                            <span className="font-bold text-emerald-700 truncate">
                              {collab.opportunityTitle || "Inisiatif CSR"}
                            </span>
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
                            <span className="text-[11px] text-slate-400 font-medium">Target Penerima Manfaat</span>
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
                                Lihat Dokumen MoU
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                                <Clock className="w-3 h-3" /> Belum Terlampir
                              </span>
                            )}
                          </div>

                          <div className="pt-2 sm:pt-0 flex items-center gap-2">
                            {!isManagement && (
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
                            )}

                            {collab.status === "NEGOTIATION" ? (
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs shadow-xs"
                                onClick={() => setSelectedCollabForDetail(collab)}
                                leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
                              >
                                Kelola & Sahkan MoU
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs border-slate-200 hover:border-slate-300"
                                onClick={() => setSelectedCollabForDetail(collab)}
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                {collab.status === "AGREED" ? "Detail Kesepakatan" : "Lihat Catatan"}
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

          {/* ============================================================ */}
          {/* VIEW: PROGRAMS (PELAKSANAAN PROGRAM & MONITORING) */}
          {/* ============================================================ */}
          {activeMenu === "programs" && (
            <div className="space-y-8">
              {/* Executive Metrics Grid */}
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
                      {metrics.totalProgramsCount}
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Alokasi: {formatRupiah(metrics.totalProgramBudget)}
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
                      {metrics.inProgressProgramsCount}
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
                        Realisasi Serapan
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-indigo-600 truncate">
                      {formatRupiah(metrics.totalSpentBudget)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(metrics.budgetAbsorptionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        {metrics.budgetAbsorptionRate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Program Selesai
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {metrics.completedProgramsCount}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Telah rampung & tuntas
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Filters Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari judul program, mitra pelaksana, inisiatif, atau lokasi..."
                      value={programSearch}
                      onChange={(e) => setProgramSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={programFocusFilter}
                      onChange={(e) => setProgramFocusFilter(e.target.value)}
                      className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="ALL">Semua Bidang CSR</option>
                      {csrFocusAreaEnum.map((fa: CsrFocusArea) => (
                        <option key={fa} value={fa}>
                          {FOCUS_AREA_CONFIG[fa]?.label || fa}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Status:
                  </span>
                  {[
                    { id: "ALL", label: "Semua Status" },
                    { id: "PLANNED", label: "Direncanakan (PLANNED)" },
                    { id: "IN_PROGRESS", label: "Sedang Berjalan (IN_PROGRESS)" },
                    { id: "COMPLETED", label: "Selesai (COMPLETED)" },
                    { id: "ON_HOLD", label: "Tertunda (ON_HOLD)" },
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
                  Memuat data pelaksanaan program...
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
                    {programSearch || programStatusFilter !== "ALL" || programFocusFilter !== "ALL"
                      ? "Tidak ada program yang sesuai dengan kriteria filter pencarian."
                      : "Program pelaksanaan akan otomatis terbuat saat kontrak kolaborasi disepakati (status AGREED) bersama mitra."}
                  </p>
                  {collaborations.some((c) => c.status === "NEGOTIATION") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveMenu("collaborations")}
                      leftIcon={<FileCheck2 className="w-4 h-4" />}
                      className="mt-2"
                    >
                      Buka Tab Kolaborasi & Sahkan MoU
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
                              : "Periode belum diatur"}
                          </div>
                        </div>

                        {/* Title & Context */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                              Mitra Pelaksana:
                            </span>
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-teal-600" />
                              {prog.partnerName || "Mitra NGO"}
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
                              Penerima Manfaat Lapangan
                            </span>
                            <div className="text-xs font-bold text-slate-800">
                              {prog.actualBeneficiaries || (
                                <span className="text-slate-400 font-normal italic">
                                  Belum dilaporkan
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
                                Pembaruan Terakhir: {formatDate(prog.updatedAt)}
                              </span>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs shadow-xs"
                              onClick={() => setSelectedProgramForDetail(prog)}
                              leftIcon={<Activity className="w-3.5 h-3.5" />}
                            >
                              Kelola & Pantau Program
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

          {/* ============================================================ */}
          {/* VIEW: ANALYTICS (LAPORAN & DAMPAK ESG) */}
          {/* ============================================================ */}
          {activeMenu === "analytics" && (
            <EsgAnalyticsView
              role="COMPANY"
              organizationName={company?.name}
              programs={programs}
              onOpenProgramDetail={(p) => {
                const found = programs.find((item) => item.id === p.id);
                if (found) setSelectedProgramForDetail(found);
              }}
            />
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
          {/* VIEW: CONVERSATIONS (PESAN & NEGOSIASI) */}
          {/* ============================================================ */}
          {activeMenu === "conversations" && (
            <div className="space-y-4">
              <ConversationCenterView
                userRole="CSR_ADMIN"
                initialCollaborationId={activeCollaborationChatId}
                onViewCollaborationDetails={(collabId) => {
                  const found = collaborations.find((c) => c.id === collabId);
                  if (found) setSelectedCollabForDetail(found);
                }}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: PROFILE (PROFIL PERUSAHAAN ALA LINKEDIN) */}
          {/* ============================================================ */}
          {activeMenu === "profile" && (
            <CompanyFullProfileView
              company={company}
              isOwner={true}
              onProfileUpdated={(updated) => {
                setCompany(updated);
              }}
            />
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

      <ReviewProposalModal
        isOpen={!!selectedProposalForReview}
        proposal={selectedProposalForReview}
        onClose={() => setSelectedProposalForReview(null)}
        onSuccess={() => {
          fetchProposals();
          fetchOpportunities();
          fetchCollaborations();
        }}
      />

      <CollaborationDetailModal
        isOpen={!!selectedCollabForDetail}
        collaboration={selectedCollabForDetail}
        onClose={() => setSelectedCollabForDetail(null)}
        onOpenChat={(collabId) => {
          setSelectedCollabForDetail(null);
          setActiveCollaborationChatId(collabId);
          setActiveMenu("conversations");
        }}
        onSuccess={() => {
          fetchCollaborations();
          fetchOpportunities();
          fetchProposals();
          fetchPrograms();
        }}
      />

      <ProgramDetailModal
        isOpen={!!selectedProgramForDetail}
        program={selectedProgramForDetail}
        onClose={() => setSelectedProgramForDetail(null)}
        onSuccess={() => {
          fetchPrograms();
        }}
      />
    </div>
  );
}
