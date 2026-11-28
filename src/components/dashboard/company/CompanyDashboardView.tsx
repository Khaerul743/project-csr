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
  FileSearch,
  ClipboardList,
  FileEdit,
  Folder,
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
  ChevronLeft,
  ChevronRight,
  Coins,
  GraduationCap,
  HeartPulse,
  Inbox,
  Landmark,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Play,
  Activity,
  MessageSquare,
  Layers,
  MessageSquareQuote,
  RotateCcw,
  ShieldAlert,
  Sprout,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { opportunityStatusEnum, OpportunityStatus } from "@/db/schema/opportunities";
import { InviteMemberModal } from "../InviteMemberModal";
import { Sidebar, CompanyNavMenu } from "../Sidebar";
import { DashboardHeader, NotificationItem } from "../DashboardHeader";
import { CreateOpportunityPageView, type OpportunityDraftData } from "./opportunities/CreateOpportunityPageView";
import { EditOpportunityPageView } from "./opportunities/EditOpportunityPageView";
import { InvitePartnerModal } from "./InvitePartnerModal";
import { OpportunityDetailModal } from "./OpportunityDetailModal";
import { DashboardHeaderBackdrop } from "../common/DashboardPageHeader";
import { TemplateCustomizationView } from "./templates/TemplateCustomizationView";
import {
  CompanyProfile,
  OpportunityItem,
  PartnerItem,
  TeamInvitation,
  CompanyProposalItem,
  CompanyCollaborationItem,
  CompanyProgramItem,
  CompanyOpportunityInvitationItem,
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
import { ReviewProposalPageView, cleanProposalText } from "./proposals/ReviewProposalPageView";
import { CollaborationDetailFullPageView } from "./collaborations/CollaborationDetailFullPageView";
import { CompanyInvitationsTab } from "./collaborations/CompanyInvitationsTab";
import { ProgramMonitoringDetailView } from "./programs/ProgramMonitoringDetailView";
import { EsgAnalyticsView } from "../analytics/EsgAnalyticsView";
import { ConversationCenterView } from "../conversations/ConversationCenterView";
import { ChatbotView } from "../chat/ChatbotView";
import { PartnerFullProfileView } from "../partner/profile/PartnerFullProfileView";
import { CompanyFullProfileView } from "./profile/CompanyFullProfileView";
import { ExecutiveOverviewView } from "./overview/ExecutiveOverviewView";
import { OpportunitiesManagementView } from "./opportunities/OpportunitiesManagementView";
import { PartnerCurationView } from "./partners/PartnerCurationView";
import { TeamManagementView } from "./team/TeamManagementView";
import { CompanyFinancialOversightView } from "./finances/CompanyFinancialOversightView";
import { PartnerPerformanceEvaluationView } from "./partners/PartnerPerformanceEvaluationView";
import { BeneficiarySentimentDashboardView } from "./sentiment/BeneficiarySentimentDashboardView";
import { UserProfileModal, UserProfileData } from "../UserProfileModal";


function getProgramCategoryVisual(focusArea: string | undefined | null) {
  switch (focusArea) {
    case "LINGKUNGAN":
      return {
        label: "Lingkungan & Alam",
        icon: Sprout,
        thumbnailBg: "bg-emerald-50/70 border border-emerald-100",
        iconColor: "text-emerald-700",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
      };
    case "PENDIDIKAN":
      return {
        label: "Pendidikan",
        icon: GraduationCap,
        thumbnailBg: "bg-indigo-50/70 border border-indigo-100",
        iconColor: "text-indigo-700",
        badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200/70",
      };
    case "KESEHATAN":
      return {
        label: "Kesehatan",
        icon: HeartPulse,
        thumbnailBg: "bg-rose-50/70 border border-rose-100",
        iconColor: "text-rose-700",
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-200/70",
      };
    case "PEMBERDAYAAN_EKONOMI":
      return {
        label: "Pemberdayaan Ekonomi",
        icon: TrendingUp,
        thumbnailBg: "bg-amber-50/70 border border-amber-100",
        iconColor: "text-amber-700",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200/70",
      };
    case "INFRASTRUKTUR_SOSIAL":
      return {
        label: "Infrastruktur Sosial",
        icon: Building2,
        thumbnailBg: "bg-sky-50/70 border border-sky-100",
        iconColor: "text-sky-700",
        badgeClass: "bg-sky-50 text-sky-700 border border-sky-200/70",
      };
    case "TANGGAP_BENCANA":
      return {
        label: "Tanggap Bencana",
        icon: ShieldAlert,
        thumbnailBg: "bg-orange-50/70 border border-orange-100",
        iconColor: "text-orange-700",
        badgeClass: "bg-orange-50 text-orange-700 border border-orange-200/70",
      };
    default:
      return {
        label: "Inisiatif Umum",
        icon: Layers,
        thumbnailBg: "bg-slate-50 border border-slate-200/80",
        iconColor: "text-slate-700",
        badgeClass: "bg-slate-50 text-slate-700 border border-slate-200/70",
      };
  }
}

function renderProgramStatusPill(status: string, pendingVerification: number = 0) {
  if (pendingVerification > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Menunggu Verifikasi</span>
      </span>
    );
  }

  switch (status) {
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Selesai</span>
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
          <span>Sedang Berjalan</span>
        </span>
      );
    case "PLANNED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/80">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Persiapan</span>
        </span>
      );
    case "ON_HOLD":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
          <span>Ditunda</span>
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>Dibatalkan</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
          <span>{status}</span>
        </span>
      );
  }
}

function ProposalPartnerLogo({ logoUrl, name }: { logoUrl?: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => {
    if (!name) return "MP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }, [name]);

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="w-11 h-11 rounded-2xl object-cover border border-[#E8E8EA] shrink-0"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-2xl bg-[#181343] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
      {initials}
    </div>
  );
}

interface CompanyDashboardViewProps {
  user: UserProfileData;
  onLogout?: () => void;
  onProfileUpdated?: (updatedUser: UserProfileData) => void;
}

export function CompanyDashboardView({ user, onLogout, onProfileUpdated }: CompanyDashboardViewProps) {
  // Navigation Menu state
  const [currentUser, setCurrentUser] = useState<UserProfileData>(user);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<CompanyNavMenu>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeCollaborationChatId, setActiveCollaborationChatId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Data states
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [proposals, setProposals] = useState<CompanyProposalItem[]>([]);
  const [collaborations, setCollaborations] = useState<CompanyCollaborationItem[]>([]);
  const [companyInvitations, setCompanyInvitations] = useState<CompanyOpportunityInvitationItem[]>([]);
  const [programs, setPrograms] = useState<CompanyProgramItem[]>([]);

  // Loading states
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [isLoadingCompanyInvitations, setIsLoadingCompanyInvitations] = useState(false);
  const [companyInvitationsError, setCompanyInvitationsError] = useState<string | null>(null);
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
  const [collabMainTab, setCollabMainTab] = useState<"mou" | "invitations">("mou");
  const [collabSearch, setCollabSearch] = useState("");
  const [collabStatusFilter, setCollabStatusFilter] = useState<string>("ALL");
  const [collabOppFilter, setCollabOppFilter] = useState<string>("ALL");
  const [programSearch, setProgramSearch] = useState("");
  const [programStatusFilter, setProgramStatusFilter] = useState<string>("ALL");
  const [programFocusFilter, setProgramFocusFilter] = useState<string>("ALL");
  const [programPage, setProgramPage] = useState(1);

  // Modal and sub-view states
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [opportunityPrefillProvince, setOpportunityPrefillProvince] = useState<string | null>(null);
  const [opportunityPrefillDraft, setOpportunityPrefillDraft] = useState<OpportunityDraftData | null>(null);
  const [selectedOppForEdit, setSelectedOppForEdit] = useState<OpportunityItem | null>(null);
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<OpportunityItem | null>(null);
  const [selectedPartnerForInvite, setSelectedPartnerForInvite] = useState<PartnerItem | null>(null);
  const [selectedInviteInitialOppId, setSelectedInviteInitialOppId] = useState<string | null>(null);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [selectedProposalForReview, setSelectedProposalForReview] = useState<CompanyProposalItem | null>(null);
  const [selectedCollabForDetail, setSelectedCollabForDetail] = useState<CompanyCollaborationItem | null>(null);
  const [selectedProgramForDetail, setSelectedProgramForDetail] = useState<CompanyProgramItem | null>(null);
  const [programInitialTab, setProgramInitialTab] = useState<
    "activities" | "finances" | "reviews" | "esg-report" | "settings" | undefined
  >(undefined);
  const [selectedPartnerForDetail, setSelectedPartnerForDetail] = useState<any | null>(null);
  const [isLoadingPartnerDetail, setIsLoadingPartnerDetail] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const isManagement = user.role === "MANAGEMENT";

  // Safeguard: Role MANAGEMENT tidak diperbolehkan mengakses menu operasional proposal/kolaborasi
  useEffect(() => {
    if (
      isManagement &&
      (activeMenu === "proposals" ||
        activeMenu === "collaborations" ||
        activeMenu === "conversations")
    ) {
      setActiveMenu("overview");
    }
  }, [isManagement, activeMenu]);

  useEffect(() => {
    const handleOpenChatEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ collaborationId?: string }>;
      setSelectedProgramForDetail(null);
      if (customEvent.detail?.collaborationId) {
        setActiveCollaborationChatId(customEvent.detail.collaborationId);
      }
      setActiveMenu("conversations");
    };

    window.addEventListener("sipena:open-chat", handleOpenChatEvent);
    return () => window.removeEventListener("sipena:open-chat", handleOpenChatEvent);
  }, []);

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

  const fetchCompanyInvitations = async () => {
    if (isManagement) return;
    setIsLoadingCompanyInvitations(true);
    setCompanyInvitationsError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("/api/companies/current/invitations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat daftar undangan mitra.");
      }
      const list = Array.isArray(json.data) ? json.data : [];
      setCompanyInvitations(list);
    } catch (err: any) {
      setCompanyInvitationsError(
        err?.message || "Terjadi kendala jaringan saat memuat daftar undangan."
      );
    } finally {
      setIsLoadingCompanyInvitations(false);
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
    } else {
      fetchCompanyInvitations();
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
    if (isManagement) return;
    const opp = opportunities.find((o) => o.id === oppId);
    if (opp?.stats?.proposalsCount && opp.stats.proposalsCount > 0) {
      alert(
        `Peluang "${oppTitle}" sudah memiliki ${opp.stats.proposalsCount} proposal yang diajukan oleh mitra dan tidak dapat dihapus untuk menjaga riwayat kerja sama. Anda dapat mengubah statusnya menjadi Ditutup (Closed) jika tidak lagi menerima proposal baru.`
      );
      return;
    }

    const linkedProposal = proposals.some((p) => p.opportunityId === oppId);
    const linkedCollab = collaborations.some((c) => c.opportunityId === oppId);
    if (linkedProposal || linkedCollab) {
      alert(
        `Peluang "${oppTitle}" telah terhubung dengan proposal atau kerja sama mitra aktif dan tidak dapat dihapus. Silakan gunakan opsi penutupan peluang.`
      );
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus peluang CSR "${oppTitle}"?`)) {
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
        alert(json.message || "Gagal menghapus peluang CSR");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus peluang CSR");
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
        proposalStatusFilter === "ALL"
          ? true
          : proposalStatusFilter === "OTHER"
            ? p.status === "REJECTED" || p.status === "WITHDRAWN" || !["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "ACCEPTED"].includes(p.status)
            : p.status === proposalStatusFilter;

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
      const q = collabSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.opportunityTitle && c.opportunityTitle.toLowerCase().includes(q)) ||
        (c.partnerName && c.partnerName.toLowerCase().includes(q)) ||
        (c.proposalTitle && c.proposalTitle.toLowerCase().includes(q)) ||
        (c.partnerCity && c.partnerCity.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q));

      let matchStatus = true;
      if (collabStatusFilter === "ALL") {
        matchStatus = true;
      } else if (collabStatusFilter === "IN_DISCUSSION") {
        matchStatus = c.status === "NEGOTIATION" && !c.mouDocumentUrl;
      } else if (collabStatusFilter === "AWAITING_SIGNATURE") {
        matchStatus = c.status === "NEGOTIATION" && !!c.mouDocumentUrl;
      } else if (collabStatusFilter === "AGREED") {
        matchStatus = c.status === "AGREED";
      } else if (collabStatusFilter === "OTHER") {
        matchStatus = c.status === "CANCELLED" || (c.status !== "NEGOTIATION" && c.status !== "AGREED");
      } else {
        matchStatus = c.status === collabStatusFilter;
      }

      const matchOpp =
        collabOppFilter === "ALL" || c.opportunityId === collabOppFilter;

      return matchSearch && matchStatus && matchOpp;
    });
  }, [collaborations, collabSearch, collabStatusFilter, collabOppFilter]);

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

  const PROGRAM_ITEMS_PER_PAGE = 5;
  const totalProgramPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredPrograms.length / PROGRAM_ITEMS_PER_PAGE));
  }, [filteredPrograms.length]);

  const paginatedPrograms = useMemo(() => {
    const start = (programPage - 1) * PROGRAM_ITEMS_PER_PAGE;
    return filteredPrograms.slice(start, start + PROGRAM_ITEMS_PER_PAGE);
  }, [filteredPrograms, programPage]);


  // Proposals action count & KPIs
  const proposalKpis = useMemo(() => {
    const list = Array.isArray(proposals) ? proposals : [];
    const waitingReview = list.filter((p) => p?.status === "SUBMITTED").length;
    const underReview = list.filter((p) => p?.status === "UNDER_REVIEW").length;
    const needsRevision = list.filter((p) => p?.status === "REVISION_REQUESTED").length;
    const accepted = list.filter((p) => p?.status === "ACCEPTED").length;
    return { waitingReview, underReview, needsRevision, accepted, total: list.length };
  }, [proposals]);

  const pendingActionProposalsCount = proposalKpis.waitingReview;

  // Collaborations KPIs (Read-only statistics)
  const collabKpis = useMemo(() => {
    const list = Array.isArray(collaborations) ? collaborations : [];
    const inProcess = list.filter((c) => c?.status === "NEGOTIATION").length;
    const agreed = list.filter((c) => c?.status === "AGREED").length;
    const totalAgreedBudget = list
      .filter((c) => c?.status === "AGREED")
      .reduce((acc, curr) => {
        const num = curr?.finalBudget ? parseFloat(curr.finalBudget) : 0;
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
    return { inProcess, agreed, totalAgreedBudget, total: list.length };
  }, [collaborations]);

  const getProposalActionButton = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return {
          label: "Tinjau Proposal",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "UNDER_REVIEW":
        return {
          label: "Lanjutkan Peninjauan",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case "REVISION_REQUESTED":
        return {
          label: "Lihat Revisi",
          icon: <RotateCcw className="w-3.5 h-3.5" />,
        };
      case "ACCEPTED":
        return {
          label: "Lihat Proposal",
          icon: <Check className="w-3.5 h-3.5" />,
        };
      case "REJECTED":
        return {
          label: "Lihat Keputusan",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      case "WITHDRAWN":
        return {
          label: "Lihat Riwayat",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: "Lihat Detail",
          icon: <Eye className="w-3.5 h-3.5" />,
        };
    }
  };

  const getProposalStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return {
          label: "Menunggu Tinjauan",
          bg: "bg-blue-500/10",
          text: "text-blue-700",
          border: "border-blue-200/50",
          dot: "bg-blue-500",
          icon: <FileSearch className="w-5 h-5 text-blue-600 shrink-0" />,
        };
      case "UNDER_REVIEW":
        return {
          label: "Dalam Tinjauan",
          bg: "bg-purple-500/10",
          text: "text-purple-700",
          border: "border-purple-200/50",
          dot: "bg-purple-500",
          icon: <ClipboardList className="w-5 h-5 text-purple-600 shrink-0" />,
        };
      case "REVISION_REQUESTED":
        return {
          label: "Perlu Revisi",
          bg: "bg-amber-500/10",
          text: "text-amber-700",
          border: "border-amber-200/50",
          dot: "bg-amber-500",
          icon: <FileEdit className="w-5 h-5 text-amber-600 shrink-0" />,
        };
      case "ACCEPTED":
        return {
          label: "Disetujui",
          bg: "bg-emerald-500/10",
          text: "text-emerald-700",
          border: "border-emerald-200/50",
          dot: "bg-emerald-500",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
        };
      case "REJECTED":
        return {
          label: "Ditolak",
          bg: "bg-rose-500/10",
          text: "text-rose-700",
          border: "border-rose-200/50",
          dot: "bg-rose-500",
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
        };
      case "WITHDRAWN":
        return {
          label: "Ditarik",
          bg: "bg-slate-500/10",
          text: "text-slate-700",
          border: "border-slate-200/50",
          dot: "bg-slate-500",
          icon: <Clock className="w-5 h-5 text-slate-500 shrink-0" />,
        };
      default:
        return {
          label: status,
          bg: "bg-slate-500/10",
          text: "text-slate-700",
          border: "border-slate-200/50",
          dot: "bg-slate-500",
          icon: <FileSearch className="w-5 h-5 text-slate-500 shrink-0" />,
        };
    }
  };

  // Role-aware notifications derived from live workspace data
  const dashboardNotifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];
    const pendingReportsCount = programs.reduce(
      (acc, p) =>
        acc +
        (typeof p.pendingVerificationCount === "number"
          ? p.pendingVerificationCount
          : p.lastReportStatus === "SUBMITTED"
            ? 1
            : 0),
      0
    );
    const esgReadyCount = programs.filter((p) => Boolean(p.sustainabilityReport)).length;

    if (isManagement) {
      if (pendingReportsCount > 0) {
        list.push({
          id: "mgmt-reports-monitoring",
          title: "Pemantauan Laporan Lapangan",
          description: `${pendingReportsCount} laporan aktivitas mitra sedang menunggu verifikasi tim CSR.`,
          time: "Pantauan aktif",
          type: "program",
          actionMenu: "programs",
          isRead: false,
        });
      }
      if (esgReadyCount > 0) {
        list.push({
          id: "mgmt-esg-ready",
          title: "Laporan Dampak ESG Tersedia",
          description: `${esgReadyCount} program telah dilengkapi ringkasan keberlanjutan ESG.`,
          time: "Portofolio program",
          type: "collab",
          actionMenu: "analytics",
          isRead: false,
        });
      }
      if (metrics.totalProgramsCount > 0) {
        list.push({
          id: "mgmt-budget-oversight",
          title: "Ringkasan Pengawasan Anggaran",
          description: `Serapan anggaran tercatat ${metrics.budgetAbsorptionRate}% dari total pagu program aktif.`,
          time: "Pengawasan anggaran",
          type: "system",
          actionMenu: "finances",
          isRead: false,
        });
      } else if (metrics.activeOpps > 0) {
        list.push({
          id: "mgmt-open-opps",
          title: "Katalog Peluang CSR Aktif",
          description: `${metrics.activeOpps} inisiatif peluang CSR perusahaan sedang dipublikasikan.`,
          time: "Katalog inisiatif",
          type: "system",
          actionMenu: "opportunities",
          isRead: false,
        });
      }
      return list;
    }

    if (pendingActionProposalsCount > 0) {
      list.push({
        id: "csr-pending-proposals",
        title: "Proposal Mitra Menunggu Tinjauan",
        description: `${pendingActionProposalsCount} proposal pengajuan mitra memerlukan peninjauan atau tindak lanjut.`,
        time: "Antrean proposal",
        type: "proposal",
        actionMenu: "proposals",
        isRead: false,
      });
    }
    if (pendingReportsCount > 0) {
      list.push({
        id: "csr-pending-reports",
        title: "Laporan Aktivitas Butuh Verifikasi",
        description: `${pendingReportsCount} laporan realisasi lapangan dari mitra menunggu verifikasi.`,
        time: "Monitoring lapangan",
        type: "program",
        actionMenu: "programs",
        isRead: false,
      });
    }
    if (metrics.negotiatingCollabsCount > 0) {
      list.push({
        id: "csr-collabs-negotiation",
        title: "Negosiasi & Pengesahan MoU",
        description: `${metrics.negotiatingCollabsCount} kerja sama mitra masih dalam tahap kesepakatan MoU.`,
        time: "Kolaborasi aktif",
        type: "collab",
        actionMenu: "collaborations",
        isRead: false,
      });
    }

    return list;
  }, [
    isManagement,
    programs,
    metrics.budgetAbsorptionRate,
    metrics.totalProgramsCount,
    metrics.activeOpps,
    metrics.negotiatingCollabsCount,
    pendingActionProposalsCount,
  ]);

  // Header Title & Subtitle based on activeMenu & role
  const headerMeta: Record<CompanyNavMenu, { title: string; subtitle: string }> = {
    overview: {
      title: "Ringkasan Eksekutif",
      subtitle: isManagement
        ? "Pantauan eksekutif atas portofolio inisiatif, serapan anggaran, dan kinerja mitra CSR"
        : "Ikhtisar portofolio inisiatif, realisasi anggaran, dan mitra CSR",
    },
    opportunities: {
      title: isManagement ? "Katalog Peluang CSR" : "Kelola Peluang CSR",
      subtitle: isManagement
        ? "Pantau daftar inisiatif peluang CSR perusahaan yang telah dipublikasikan."
        : "Rencanakan dan kelola peluang kerja sama CSR berdasarkan kebutuhan masyarakat.",
    },
    partners: {
      title: isManagement ? "Direktori Mitra CSR" : "Kurasi & Direktori Mitra",
      subtitle: isManagement
        ? "Pantau profil, legalitas, dan spesialisasi yayasan serta NGO terverifikasi."
        : "Jelajahi yayasan dan NGO terverifikasi berdasarkan spesialisasi bidang",
    },
    proposals: {
      title: "Kelola Proposal",
      subtitle: "Tinjau pengajuan mitra dan pantau proses persetujuan kerja sama.",
    },
    collaborations: {
      title: "Kelola Kerja Sama & MoU",
      subtitle: "Pantau proses kesepakatan, dokumen perjanjian, dan kesiapan pelaksanaan program CSR bersama mitra.",
    },
    conversations: {
      title: "Pesan & Negosiasi",
      subtitle: "Ruang komunikasi dan negosiasi teknis langsung bersama mitra pelaksana",
    },
    programs: {
      title: isManagement ? "Pengawasan Program CSR" : "Pelaksanaan Program & Monitoring",
      subtitle: isManagement
        ? "Pantau progres pelaksanaan di lapangan, serapan anggaran, dan capaian dampak program CSR"
        : "Pantau progres eksekusi program di lapangan, realisasi serapan anggaran, dan capaian penerima manfaat riil",
    },
    finances: {
      title: "Pengawasan Anggaran & Keuangan CSR",
      subtitle: "Audit komparasi pagu alokasi dana, realisasi belanja lapangan, dan rasio efisiensi penyerapan anggaran program CSR",
    },
    "partner-performance": {
      title: "Evaluasi Kinerja & Indeks Akuntabilitas Mitra",
      subtitle: "Audit kinerja operasional, kepatuhan laporan lapangan, dan integritas anggaran mitra pelaksana CSR perusahaan",
    },
    sentiment: {
      title: "Intelijen Sentimen & Suara Warga",
      subtitle: "Analisis kepuasan masyarakat penerima manfaat berbasis Natural Language Processing (AI), rating bintang, dan feedback langsung dari lapangan",
    },
    analytics: {
      title: "Laporan & Dampak ESG",
      subtitle: "Analisis akuntabilitas dana CSR, pilar keberlanjutan (E-S-G), dan ekspor laporan resmi",
    },
    team: {
      title: "Anggota Tim & Akses",
      subtitle: "Kelola anggota organisasi, penugasan hak akses peran (Role-Based Access Control), dan undangan tim internal.",
    },
    templates: {
      title: "Kustomisasi Template",
      subtitle: "Kelola template pesan standar organisasi untuk mempercepat komunikasi kemitraan CSR.",
    },
    profile: {
      title: "Profil Perusahaan",
      subtitle: "Informasi legalitas, domisili, dan profil publik organisasi",
    },
    chat: {
      title: "AI CSR Advisor",
      subtitle: "Asisten cerdas perencanaan inisiatif, monitoring portofolio, dan konsultasi ESG",
    },
  };

  return (
    <div className={`min-h-screen bg-[#F9F9FB] flex ${activeMenu === "chat" || activeMenu === "conversations" ? "h-screen overflow-hidden" : ""}`}>
      {/* 1. Sidebar Navigation */}
      <Sidebar
        user={currentUser}
        organizationName={company?.name}
        activeMenu={activeMenu}
        onSelectMenu={(menu) => {
          if (menu !== "programs") {
            setSelectedProgramForDetail(null);
            setProgramInitialTab(undefined);
          }
          if (menu !== "partners") {
            setSelectedPartnerForDetail(null);
          }
          if (menu !== "opportunities") {
            setIsCreatingOpportunity(false);
            setSelectedOppForEdit(null);
          }
          setActiveMenu(menu);
        }}
        counts={{
          proposals: pendingActionProposalsCount,
          programs: metrics.inProgressProgramsCount || programs.length,
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
        onOpenProfile={() => setIsUserProfileModalOpen(true)}
      />

      {/* 2. Main Workspace Layout */}
      <div className={`flex-1 flex flex-col min-w-0 ${activeMenu === "chat" || activeMenu === "conversations" ? "h-screen overflow-hidden" : ""}`}>
        {/* Sticky Dashboard Header */}
        <DashboardHeader
          user={currentUser}
          notifications={dashboardNotifications}
          onNavigateMenu={(menu) => setActiveMenu(menu as CompanyNavMenu)}
          onOpenProfile={() => setIsUserProfileModalOpen(true)}
          onLogout={onLogout}
          breadcrumbs={
            activeMenu === "overview"
              ? [
                { label: isManagement ? "Pengawasan Eksekutif" : "Utama" },
                { label: "Ringkasan Eksekutif" },
              ]
              : activeMenu === "opportunities" && isCreatingOpportunity
                ? [
                  { label: "Peluang CSR", onClick: () => setIsCreatingOpportunity(false) },
                  { label: "Buat Peluang Baru" },
                ]
                : activeMenu === "opportunities" && selectedOppForEdit
                  ? [
                    { label: "Peluang CSR", onClick: () => setSelectedOppForEdit(null) },
                    { label: "Edit Peluang" },
                  ]
                  : activeMenu === "opportunities"
                    ? [
                      { label: isManagement ? "Inisiatif & Mitra" : "Utama" },
                      { label: isManagement ? "Katalog Peluang CSR" : "Peluang CSR" },
                    ]
                    : activeMenu === "proposals"
                      ? selectedProposalForReview
                        ? [
                          { label: "Kolaborasi & Mitra" },
                          {
                            label: "Kelola Proposal",
                            onClick: () => setSelectedProposalForReview(null),
                          },
                          { label: cleanProposalText(selectedProposalForReview.title) || selectedProposalForReview.title },
                        ]
                        : [
                          { label: "Kolaborasi & Mitra" },
                          { label: "Kelola Proposal" },
                        ]
                      : activeMenu === "collaborations"
                        ? selectedCollabForDetail
                          ? [
                            { label: "Kolaborasi & Mitra" },
                            {
                              label: "Kelola Kerja Sama & MoU",
                              onClick: () => setSelectedCollabForDetail(null),
                            },
                            {
                              label: cleanProposalText(selectedCollabForDetail.proposalTitle) ||
                                selectedCollabForDetail.opportunityTitle ||
                                "Detail Kesepakatan & MoU",
                            },
                          ]
                          : [
                            { label: "Kolaborasi & Mitra" },
                            { label: "Kelola Kerja Sama & MoU" },
                          ]
                        : activeMenu === "partners"
                          ? selectedPartnerForDetail
                            ? [
                              { label: isManagement ? "Inisiatif & Mitra" : "Kolaborasi & Mitra" },
                              {
                                label: isManagement ? "Direktori Mitra" : "Kurasi Mitra",
                                onClick: () => setSelectedPartnerForDetail(null),
                              },
                              { label: selectedPartnerForDetail.name },
                            ]
                            : [
                              { label: isManagement ? "Inisiatif & Mitra" : "Kolaborasi & Mitra" },
                              { label: isManagement ? "Direktori Mitra" : "Kurasi Mitra" },
                            ]
                          : activeMenu === "programs"
                            ? selectedProgramForDetail
                              ? [
                                { label: isManagement ? "Pengawasan Eksekutif" : "Pelaksanaan & Dampak" },
                                {
                                  label: isManagement ? "Pengawasan Program" : "Pelaksanaan Program",
                                  onClick: () => setSelectedProgramForDetail(null),
                                },
                                { label: selectedProgramForDetail.title },
                              ]
                              : [
                                { label: isManagement ? "Pengawasan Eksekutif" : "Pelaksanaan & Dampak" },
                                { label: isManagement ? "Pengawasan Program" : "Pelaksanaan Program" },
                              ]
                            : activeMenu === "team"
                              ? [
                                { label: isManagement ? "Tata Kelola Korporat" : "Organisasi" },
                                { label: "Anggota Tim & Akses" },
                              ]
                              : activeMenu === "templates"
                                ? [
                                  { label: "Organisasi" },
                                  { label: "Kustomisasi Template" },
                                ]
                                : activeMenu === "profile"
                                ? [
                                  { label: isManagement ? "Tata Kelola Korporat" : "Organisasi" },
                                  { label: "Profil Perusahaan" },
                                ]
                                : activeMenu === "finances"
                                  ? [
                                    { label: isManagement ? "Pengawasan Eksekutif" : "Pelaksanaan & Dampak" },
                                    { label: "Pengawasan Anggaran & Keuangan" },
                                  ]
                                  : activeMenu === "partner-performance"
                                    ? [
                                      { label: isManagement ? "Pengawasan Eksekutif" : "Kolaborasi & Mitra" },
                                      { label: "Evaluasi Kinerja Mitra" },
                                    ]
                                    : activeMenu === "sentiment"
                                      ? [
                                        { label: isManagement ? "Pengawasan Eksekutif" : "Pelaksanaan & Dampak" },
                                        { label: "Suara Warga & Sentimen" },
                                      ]
                                      : activeMenu === "analytics"
                                        ? [
                                          { label: isManagement ? "Pengawasan Eksekutif" : "Pelaksanaan & Dampak" },
                                          { label: "Laporan & Dampak ESG" },
                                        ]
                                        : activeMenu === "chat"
                                          ? [
                                            { label: "Konsultasi Strategis" },
                                            { label: "AI CSR Advisor" },
                                          ]
                                          : activeMenu === "conversations"
                                            ? [
                                              { label: "Kolaborasi & Mitra" },
                                              { label: "Pesan & Negosiasi" },
                                            ]
                                            : undefined
          }
          title={
            activeMenu === "opportunities" && isCreatingOpportunity
              ? "Buat Peluang CSR Baru"
              : activeMenu === "opportunities" && selectedOppForEdit
                ? "Edit Peluang CSR"
                : activeMenu === "programs" && selectedProgramForDetail
                  ? "Monitoring Pelaksanaan Program"
                  : headerMeta[activeMenu]?.title || "Dashboard Perusahaan"
          }
          subtitle={
            activeMenu === "opportunities" && isCreatingOpportunity
              ? "Rencanakan dan publikasikan peluang kerja sama CSR berdasarkan kebutuhan masyarakat."
              : activeMenu === "opportunities" && selectedOppForEdit
                ? "Perbarui informasi dan perencanaan peluang kerja sama CSR."
                : activeMenu === "programs" && selectedProgramForDetail
                  ? `Detail pelaporan lapangan, keuangan, dan evaluasi: ${selectedProgramForDetail.title}`
                  : headerMeta[activeMenu]?.subtitle
          }
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          rightAction={null}
        />

        {/* Content Body Container */}
        <div className="relative flex-1 flex flex-col min-w-0 min-h-0 overflow-x-clip">
          {(activeMenu === "overview" ||
            activeMenu === "opportunities" ||
            activeMenu === "chat" ||
            (!isManagement && activeMenu === "templates")) && (
            <DashboardHeaderBackdrop />
          )}
          <main
            style={
              activeMenu === "chat" || activeMenu === "conversations"
                ? { height: "calc(100vh - 72px)", maxHeight: "calc(100vh - 72px)" }
                : undefined
            }
            className={`relative z-10 w-full mx-auto ${activeMenu === "chat"
              ? "p-4 sm:p-5 lg:p-6 max-w-[1150px] flex-1 flex flex-col min-h-0 overflow-hidden"
              : activeMenu === "conversations"
                ? "p-4 sm:p-5 lg:p-6 max-w-7xl flex-1 flex flex-col min-h-0 overflow-hidden"
                : "flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl space-y-8"
              }`}
          >
          {/* ============================================================ */}
          {/* VIEW: OVERVIEW (RINGKASAN EKSEKUTIF & BI ANALYTICS) */}
          {/* ============================================================ */}
          {activeMenu === "overview" && (
            <ExecutiveOverviewView
              company={company}
              user={user}
              opportunities={opportunities}
              partners={partners}
              proposals={proposals}
              collaborations={collaborations}
              programs={programs}
              metrics={metrics}
              onNavigateMenu={(menu) => setActiveMenu(menu)}
              onOpenCreateOpportunity={
                !isManagement
                  ? (initialProvince) => {
                    setActiveMenu("opportunities");
                    setIsCreatingOpportunity(true);
                    if (initialProvince) {
                      setOpportunityPrefillProvince(initialProvince);
                    } else {
                      setOpportunityPrefillProvince(null);
                    }
                  }
                  : undefined
              }
              onSelectOpportunityDetail={(opp) => setSelectedOppForDetail(opp)}
            />
          )}

          {/* ============================================================ */}
          {/* VIEW: OPPORTUNITIES (PELUANG CSR & BI INITIATIVES) */}
          {/* ============================================================ */}
          {activeMenu === "opportunities" && (
            !isManagement && isCreatingOpportunity ? (
              <CreateOpportunityPageView
                initialProvince={opportunityPrefillProvince || undefined}
                initialDraft={opportunityPrefillDraft || undefined}
                onBack={() => {
                  setIsCreatingOpportunity(false);
                  setOpportunityPrefillProvince(null);
                  setOpportunityPrefillDraft(null);
                }}
                onSuccess={() => {
                  setIsCreatingOpportunity(false);
                  setOpportunityPrefillProvince(null);
                  setOpportunityPrefillDraft(null);
                  fetchOpportunities();
                }}
              />
            ) : !isManagement && selectedOppForEdit ? (
              <EditOpportunityPageView
                opportunity={selectedOppForEdit}
                onBack={() => setSelectedOppForEdit(null)}
                onSuccess={() => {
                  setSelectedOppForEdit(null);
                  fetchOpportunities();
                }}
              />
            ) : (
              <OpportunitiesManagementView
                opportunities={opportunities}
                isLoading={isLoadingOpportunities}
                onRefresh={fetchOpportunities}
                onOpenCreateModal={!isManagement ? () => setIsCreatingOpportunity(true) : undefined}
                onOpenEditModal={!isManagement ? (opp) => setSelectedOppForEdit(opp) : undefined}
                onOpenDetailModal={(opp) => setSelectedOppForDetail(opp)}
                onDeleteOpportunity={!isManagement ? handleDeleteOpportunity : undefined}
                isManagement={isManagement}
              />
            )
          )}

          {/* ============================================================ */}
          {/* VIEW: PARTNERS (KURASI MITRA & BI ECOSYSTEM) */}
          {/* ============================================================ */}
          {activeMenu === "partners" && (
            selectedPartnerForDetail ? (
              <PartnerFullProfileView
                partner={selectedPartnerForDetail}
                isOwner={false}
                onBack={() => setSelectedPartnerForDetail(null)}
                onInvitePitch={
                  !isManagement
                    ? () => {
                      const p = selectedPartnerForDetail;
                      setSelectedPartnerForDetail(null);
                      setSelectedPartnerForInvite(p);
                    }
                    : undefined
                }
                onOpenChat={
                  !isManagement
                    ? () => {
                      setSelectedPartnerForDetail(null);
                      setActiveMenu("conversations");
                    }
                    : undefined
                }
              />
            ) : (
              <PartnerCurationView
                partners={partners}
                isLoading={isLoadingPartners}
                focusFilter={partnerFocusFilter}
                onFocusFilterChange={(focus) => setPartnerFocusFilter(focus)}
                onRefresh={fetchPartners}
                onViewPartnerDetail={handleViewPartnerDetail}
                onInvitePitch={
                  !isManagement ? (partner) => setSelectedPartnerForInvite(partner) : undefined
                }
                isLoadingDetail={isLoadingPartnerDetail}
                isManagement={isManagement}
              />
            )
          )}

          {/* ============================================================ */}
          {/* VIEW: PROPOSALS (KELOLA PROPOSAL - KHUSUS CSR_ADMIN) */}
          {/* ============================================================ */}
          {!isManagement && activeMenu === "proposals" && (
            selectedProposalForReview ? (
              <ReviewProposalPageView
                proposal={selectedProposalForReview}
                onBack={() => setSelectedProposalForReview(null)}
                onSuccess={() => {
                  fetchProposals();
                  fetchOpportunities();
                  fetchCollaborations();
                }}
                onNavigateToCollaboration={() => {
                  setSelectedProposalForReview(null);
                  setActiveMenu("collaborations");
                }}
              />
            ) : (
              <div className="w-full space-y-6 animate-in fade-in duration-300">
                {/* Header Identitas & Ringkasan Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
                  <div>
                    <h1
                      className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Kelola Proposal CSR
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Pantau dan kelola seluruh proposal kerja sama CSR yang terdaftar di sistem.
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-[#E8E8EA] text-xs font-semibold text-[#181343] self-start sm:self-auto shrink-0 shadow-2xs">
                    Total <span className="font-bold text-[#181343]">{proposals.length}</span> Proposal
                  </div>
                </div>

                {/* 3 KPI Cards Horizontal (Statistik Read-Only - Seragam & Anti-Slop) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {/* KPI 1: Menunggu Tinjauan */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex items-center gap-4 cursor-default">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                      <FileSearch className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-600 block">
                        Menunggu Tinjauan
                      </span>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-0.5 tabular-nums">
                        {proposalKpis.waitingReview}
                      </div>
                      <span className="text-xs text-slate-400 block">
                        Proposal baru masuk
                      </span>
                    </div>
                  </div>

                  {/* KPI 2: Dalam Tinjauan */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex items-center gap-4 cursor-default">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                      <ClipboardList className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-600 block">
                        Dalam Tinjauan
                      </span>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-0.5 tabular-nums">
                        {proposalKpis.underReview}
                      </div>
                      <span className="text-xs text-slate-400 block">
                        Sedang dievaluasi tim CSR
                      </span>
                    </div>
                  </div>

                  {/* KPI 3: Perlu Revisi */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex items-center gap-4 cursor-default">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                      <FileEdit className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-600 block">
                        Perlu Revisi
                      </span>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-0.5 tabular-nums">
                        {proposalKpis.needsRevision}
                      </div>
                      <span className="text-xs text-slate-400 block">
                        Menunggu pembaruan mitra
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toolbar Pencarian & Filter Selebar Area Konten */}
                <div className="w-full p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
                    {/* Search Input: ~70-75% width */}
                    <div className="relative flex-1 md:flex-[3]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={proposalSearch}
                        onChange={(e) => setProposalSearch(e.target.value)}
                        placeholder="Cari judul proposal, nama mitra, atau peluang CSR..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343] placeholder:text-[#9A98A6]"
                      />
                    </div>

                    {/* Dropdown Peluang CSR Filter: ~25-30% width */}
                    <div className="w-full md:flex-1 md:max-w-xs">
                      <select
                        value={proposalOppFilter}
                        onChange={(e) => setProposalOppFilter(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-xs font-semibold text-[#181343] bg-[#F9F9FB] focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 cursor-pointer"
                      >
                        <option value="ALL">Semua Peluang CSR</option>
                        {opportunities.map((opp) => (
                          <option key={opp.id} value={opp.id}>
                            {opp.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status Filter Buttons (Chips) */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 text-xs w-full">
                    {[
                      { id: "ALL", label: "Semua" },
                      { id: "SUBMITTED", label: "Menunggu Tinjauan" },
                      { id: "UNDER_REVIEW", label: "Dalam Tinjauan" },
                      { id: "REVISION_REQUESTED", label: "Perlu Revisi" },
                      { id: "ACCEPTED", label: "Disetujui" },
                      { id: "REJECTED", label: "Ditolak" },
                    ].map((st) => {
                      const isSelected = proposalStatusFilter === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setProposalStatusFilter(st.id)}
                          className={`px-3.5 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer text-xs ${isSelected
                            ? "bg-[#181343] text-white shadow-2xs font-bold"
                            : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                            }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Proposals Cards List (Responsive Grid) */}
                {isLoadingProposals ? (
                  <CardGridSkeleton count={3} />
                ) : filteredProposals.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-[#C8C5D0] p-8 space-y-3 w-full">
                    <div className="w-12 h-12 rounded-2xl bg-[#181343]/5 text-[#181343] flex items-center justify-center mx-auto">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-[#181343] text-sm">
                      {proposals.length === 0
                        ? "Belum Ada Proposal Masuk"
                        : "Tidak Ada Proposal Sesuai Filter"}
                    </h4>
                    <p className="text-xs text-[#787680] max-w-sm mx-auto leading-relaxed">
                      {proposals.length === 0
                        ? "Saat mitra pelaksana mengajukan proposal untuk peluang inisiatif Anda, proposal mereka akan muncul di sini untuk ditinjau."
                        : "Coba sesuaikan kata kunci pencarian atau pilih filter status lainnya."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
                    {filteredProposals.map((prop) => {
                      const statusBadge = getProposalStatusBadge(prop.status);

                      return (
                        <div
                          key={prop.id}
                          className="w-full bg-white rounded-2xl border border-[#E8E8EA] hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all p-5 flex flex-col justify-between space-y-4 group"
                        >
                          {/* Baris 1: Icon status di kiri atas (disamakan dengan referensi), Status badge di kanan atas */}
                          <div className="flex items-center justify-between gap-2 w-full">
                            {statusBadge.icon}

                            {/* Status Badge di samping kanan kecil sesuai referensi Gambar 2 */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusBadge.dot}`} />
                              <span>{statusBadge.label}</span>
                            </span>
                          </div>

                          {/* Baris 2: Tulisan Yayasan di bawah icon, lalu Judul Proposal */}
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                              <span className="truncate" title={prop.partnerName || "Mitra Pelaksana"}>
                                {prop.partnerName || "Mitra Pelaksana"}
                              </span>
                              {prop.partnerCity && (
                                <span className="text-[11px] text-slate-400 font-normal shrink-0">
                                  • {prop.partnerCity}
                                </span>
                              )}
                            </div>

                            <h3
                              className="text-base font-bold text-[#181343] leading-snug group-hover:text-[#25205c] transition-colors line-clamp-2 cursor-pointer pt-0.5"
                              onClick={() => setSelectedProposalForReview(prop)}
                              title={cleanProposalText(prop.title) || prop.title}
                            >
                              {cleanProposalText(prop.title) || prop.title}
                            </h3>
                            <p className="text-xs text-[#787680] truncate">
                              Peluang: <span className="text-slate-700 font-medium">{prop.opportunityTitle || "Peluang Umum"}</span>
                            </p>
                          </div>

                          {/* Baris 3: Informasi Ringkas (Anggaran & Tanggal Pengajuan) */}
                          <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] grid grid-cols-2 gap-3 text-xs w-full">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#787680] tracking-wider block">
                                Anggaran
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-[#181343] mt-0.5 block truncate">
                                {formatRupiah(prop.proposedBudget)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#787680] tracking-wider block">
                                Diajukan
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-[#181343] mt-0.5 block truncate">
                                {formatDate(prop.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Baris 4: Footer Meta & Aksi Lihat Detail */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0F0F2] w-full text-xs">
                            <div>
                              {prop.aiScore != null ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs">
                                  <Sparkles className="w-3 h-3 text-emerald-600" />
                                  <span>Skor {prop.aiScore}</span>
                                </span>
                              ) : prop.feedback && prop.status !== "ACCEPTED" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70">
                                  <MessageSquareQuote className="w-3 h-3 text-amber-600" />
                                  <span>Ada Catatan</span>
                                </span>
                              ) : prop.partnerCity ? (
                                <span className="text-[11px] text-[#787680] flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {prop.partnerCity}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">
                                  {prop.durationMonths ? `${prop.durationMonths} Bulan` : "Fleksibel"}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedProposalForReview(prop)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#181343] hover:text-[#25205c] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50"
                            >
                              <span>Lihat Detail</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
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
          {/* VIEW: COLLABORATIONS (KELOLA KERJA SAMA & MOU - KHUSUS CSR_ADMIN) */}
          {/* ============================================================ */}
          {!isManagement && activeMenu === "collaborations" && (
            selectedCollabForDetail ? (
              <CollaborationDetailFullPageView
                collaboration={selectedCollabForDetail}
                onBack={() => setSelectedCollabForDetail(null)}
                onSuccess={() => {
                  fetchCollaborations();
                  fetchOpportunities();
                  fetchProposals();
                  fetchPrograms();
                }}
                onOpenChat={(collabId) => {
                  setSelectedCollabForDetail(null);
                  setActiveCollaborationChatId(collabId);
                  setActiveMenu("conversations");
                }}
                onNavigateToMonitoring={() => {
                  const linkedProg = programs.find(
                    (p) =>
                      p.collaborationId === selectedCollabForDetail.id ||
                      (p.opportunityId === selectedCollabForDetail.opportunityId &&
                        p.partnerId === selectedCollabForDetail.partnerId)
                  );
                  setSelectedCollabForDetail(null);
                  if (linkedProg) {
                    setSelectedProgramForDetail(linkedProg);
                  }
                  setActiveMenu("programs");
                }}
              />
            ) : (
              <div className="w-full space-y-6 animate-in fade-in duration-300">
                {/* Header Identitas & Ringkasan Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
                  <div>
                    <h1
                      className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Kelola Kerja Sama &amp; MoU
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Pantau proses kesepakatan MoU, dokumen perjanjian, dan status undangan kolaborasi yang dikirim kepada mitra.
                    </p>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-[#E8E8EA] text-xs font-semibold text-[#181343] self-start sm:self-auto shrink-0">
                    {collabMainTab === "mou" ? (
                      <>
                        Total <span className="font-bold text-[#181343]">{collaborations.length}</span> kerja sama aktif
                      </>
                    ) : (
                      <>
                        Total <span className="font-bold text-[#181343]">{companyInvitations.length}</span> undangan dikirim
                      </>
                    )}
                  </div>
                </div>

                {/* Tab Switcher: Kesepakatan & MoU vs Daftar Undangan Mitra */}
                <div
                  role="tablist"
                  aria-label="Sub-menu Kolaborasi dan Undangan Mitra"
                  className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3"
                >
                  <button
                    type="button"
                    role="tab"
                    id="tab-collab-mou"
                    aria-selected={collabMainTab === "mou"}
                    onClick={() => setCollabMainTab("mou")}
                    className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] ${
                      collabMainTab === "mou"
                        ? "bg-[#181343] text-white font-bold"
                        : "bg-white border border-[#E8E8EA] text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>Kesepakatan &amp; MoU</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        collabMainTab === "mou"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {collaborations.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="tab-collab-invitations"
                    aria-selected={collabMainTab === "invitations"}
                    onClick={() => {
                      setCollabMainTab("invitations");
                      fetchCompanyInvitations();
                    }}
                    className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] ${
                      collabMainTab === "invitations"
                        ? "bg-[#181343] text-white font-bold"
                        : "bg-white border border-[#E8E8EA] text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>Daftar Undangan Mitra</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        collabMainTab === "invitations"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {companyInvitations.length}
                    </span>
                  </button>
                </div>

                {collabMainTab === "invitations" ? (
                  <div
                    role="tabpanel"
                    aria-labelledby="tab-collab-invitations"
                  >
                    <CompanyInvitationsTab
                      invitations={companyInvitations}
                      opportunities={opportunities}
                      isLoading={isLoadingCompanyInvitations}
                      errorMessage={companyInvitationsError}
                      onRetry={fetchCompanyInvitations}
                      onNavigateToPartners={() => setActiveMenu("partners")}
                      onNavigateToProposals={() => setActiveMenu("proposals")}
                      onReinvitePartner={(inv) => {
                        const existingPartner = partners.find(
                          (p) => p.id === inv.partnerId
                        );
                        setSelectedInviteInitialOppId(inv.opportunityId);
                        setSelectedPartnerForInvite(
                          existingPartner || {
                            id: inv.partnerId,
                            name: inv.partnerName || "Organisasi Mitra",
                            city: inv.partnerCity,
                            province: inv.partnerProvince,
                            logoUrl: inv.partnerLogo,
                            organizationType: inv.partnerOrganizationType,
                            email: inv.partnerEmail,
                            focusArea: (inv.partnerFocusArea as any) || "LAINNYA",
                            status: "ACTIVE",
                            createdAt: inv.createdAt,
                          }
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div
                    role="tabpanel"
                    aria-labelledby="tab-collab-mou"
                    className="space-y-6"
                  >

                {/* 3 KPI Cards Horizontal (Statistik Read-Only) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {/* KPI 1: Dalam Proses */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex flex-col justify-between cursor-default">
                    <span className="text-xs font-semibold text-slate-600 block">
                      Dalam Proses
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-1.5">
                      {collabKpis.inProcess}
                    </div>
                    <span className="text-xs text-[#787680] block">
                      Tahap pembahasan kesepakatan
                    </span>
                  </div>

                  {/* KPI 2: MoU Disepakati */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex flex-col justify-between cursor-default">
                    <span className="text-xs font-semibold text-slate-600 block">
                      MoU Disepakati
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-1.5">
                      {collabKpis.agreed}
                    </div>
                    <span className="text-xs text-[#787680] block">
                      Perjanjian resmi disahkan
                    </span>
                  </div>

                  {/* KPI 3: Nilai Kesepakatan */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex flex-col justify-between cursor-default">
                    <span className="text-xs font-semibold text-slate-600 block">
                      Nilai Kesepakatan
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-1.5 truncate">
                      {formatRupiah(collabKpis.totalAgreedBudget)}
                    </div>
                    <span className="text-xs text-[#787680] block">
                      Total komitmen dana MoU disahkan
                    </span>
                  </div>
                </div>

                {/* Toolbar Pencarian & Filter Selebar Area Konten */}
                <div className="w-full p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
                    {/* Search Input: ~70-75% width */}
                    <div className="relative flex-1 md:flex-[3]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={collabSearch}
                        onChange={(e) => setCollabSearch(e.target.value)}
                        placeholder="Cari kerja sama berdasarkan nama mitra, judul inisiatif, atau program..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] text-xs focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 text-[#181343] placeholder:text-[#9A98A6]"
                      />
                    </div>

                    {/* Dropdown Peluang CSR Filter: ~25-30% width */}
                    <div className="w-full md:flex-1 md:max-w-xs">
                      <select
                        value={collabOppFilter}
                        onChange={(e) => setCollabOppFilter(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EA] text-xs font-semibold text-[#181343] bg-[#F9F9FB] focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 cursor-pointer"
                      >
                        <option value="ALL">Semua Peluang CSR</option>
                        {opportunities.map((opp) => (
                          <option key={opp.id} value={opp.id}>
                            {opp.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status Filter Buttons (Chips) */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 text-xs w-full">
                    {[
                      { id: "ALL", label: "Semua" },
                      { id: "IN_DISCUSSION", label: "Dalam Pembahasan" },
                      { id: "AWAITING_SIGNATURE", label: "Menunggu Penandatanganan" },
                      { id: "AGREED", label: "Disepakati" },
                      { id: "OTHER", label: "Lainnya" },
                    ].map((st) => {
                      const isSelected = collabStatusFilter === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setCollabStatusFilter(st.id)}
                          className={`px-3.5 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer text-xs ${isSelected
                            ? "bg-[#181343] text-white shadow-2xs font-bold"
                            : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                            }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* List Content */}
                {isLoadingCollaborations ? (
                  <CardGridSkeleton count={3} />
                ) : filteredCollaborations.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#E8E8EA] p-8 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F9F9FB] text-[#181343] flex items-center justify-center mx-auto border border-[#E8E8EA]">
                      <HeartHandshake className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="font-bold text-[#181343] text-base">
                        {collaborations.length === 0
                          ? "Belum Ada Kerja Sama Terbentuk"
                          : "Tidak Ada Kerja Sama yang Sesuai"}
                      </h4>
                      <p className="text-xs text-[#787680] leading-relaxed">
                        {collaborations.length === 0
                          ? "Kerja sama dan kesepakatan MoU terbentuk otomatis setelah Anda menyetujui proposal dari mitra pelaksana di tab Kelola Proposal."
                          : "Coba ubah kata kunci pencarian atau ganti filter status di atas."}
                      </p>
                    </div>
                    {collaborations.length === 0 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveMenu("proposals")}
                        className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-bold rounded-xl"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Buka Kelola Proposal
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCollabSearch("");
                          setCollabStatusFilter("ALL");
                          setCollabOppFilter("ALL");
                        }}
                        className="border-[#E8E8EA] text-slate-700 text-xs rounded-xl"
                      >
                        Reset Filter
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                    {filteredCollaborations.map((collab) => {
                      const isAgreed = collab.status === "AGREED";
                      const isNegotiation = collab.status === "NEGOTIATION";
                      const isCancelled = collab.status === "CANCELLED";
                      const titleClean = cleanProposalText(collab.proposalTitle) || collab.opportunityTitle || "Program Kerja Sama CSR";

                      return (
                        <div
                          key={collab.id}
                          className="bg-white rounded-2xl border border-[#E8E8EA] hover:border-slate-300 shadow-2xs hover:shadow-xs p-5 flex flex-col justify-between gap-4 transition"
                        >
                          {/* Header: Logo, Nama Mitra, Kota & Status Badge */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <ProposalPartnerLogo logoUrl={collab.partnerLogo} name={collab.partnerName || "Mitra"} />
                                <div className="min-w-0">
                                  <h4 className="font-bold text-[#181343] text-sm truncate" title={collab.partnerName || "Mitra CSR"}>
                                    {collab.partnerName || "Mitra CSR"}
                                  </h4>
                                  {collab.partnerCity && (
                                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{collab.partnerCity}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isAgreed ? (
                                  <Badge variant="emerald" size="sm" hasDot>
                                    MoU Disepakati
                                  </Badge>
                                ) : isNegotiation ? (
                                  <Badge variant="amber" size="sm" hasDot>
                                    Negosiasi
                                  </Badge>
                                ) : isCancelled ? (
                                  <Badge variant="rose" size="sm" hasDot>
                                    Dibatalkan
                                  </Badge>
                                ) : (
                                  <Badge variant="slate" size="sm">
                                    {collab.status}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Judul Proposal & Peluang CSR */}
                            <div className="space-y-1">
                              <h3
                                className="text-sm font-bold text-[#181343] leading-snug line-clamp-2"
                                title={titleClean}
                              >
                                {titleClean}
                              </h3>
                              {collab.opportunityTitle && (
                                <p className="text-[11px] text-slate-500 truncate" title={collab.opportunityTitle}>
                                  Inisiatif: <span className="font-medium text-slate-700">{collab.opportunityTitle}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Parameter Utama: Anggaran & Jadwal/Sasaran */}
                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E8E8EA] space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500">Anggaran Disepakati</span>
                                <span className="font-bold text-[#009E75]">
                                  {formatRupiah(collab.finalBudget || collab.proposedBudget)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Dokumen MoU</span>
                                {isAgreed ? (
                                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Telah Disepakati
                                  </span>
                                ) : collab.mouDocumentUrl ? (
                                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Dalam Proses
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Belum Diunggah</span>
                                )}
                              </div>

                              {collab.targetBeneficiaries && (
                                <div className="text-[11px] text-slate-600 truncate pt-0.5 border-t border-slate-200/60">
                                  Sasaran: <span className="text-slate-700">{collab.targetBeneficiaries}</span>
                                </div>
                              )}
                            </div>

                            {/* Actions Bottom */}
                            <div className="flex items-center justify-between gap-2 pt-1">
                              {isAgreed ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const linkedProg = programs.find(
                                      (p) =>
                                        p.collaborationId === collab.id ||
                                        (p.opportunityId === collab.opportunityId && p.partnerId === collab.partnerId)
                                    );
                                    if (linkedProg) {
                                      setSelectedProgramForDetail(linkedProg);
                                    }
                                    setActiveMenu("programs");
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                  <span>Monitoring</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">
                                  {collab.notes && collab.notes.trim() ? "Catatan terlampir" : ""}
                                </span>
                              )}

                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-[#181343] hover:bg-[#25205c] text-white text-xs font-semibold rounded-xl px-3 py-1.5 cursor-pointer ml-auto"
                                onClick={() => setSelectedCollabForDetail(collab)}
                                rightIcon={<ArrowRight className="w-3 h-3" />}
                              >
                                Detail Kesepakatan
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                  </div>
                )}
              </div>
            )
          )}
          {/* ============================================================ */}
          {/* VIEW: PROGRAMS (PELAKSANAAN PROGRAM & MONITORING) */}
          {/* ============================================================ */}
          {activeMenu === "programs" && (
            selectedProgramForDetail ? (
              <ProgramMonitoringDetailView
                program={selectedProgramForDetail}
                onBack={() => {
                  setSelectedProgramForDetail(null);
                  setProgramInitialTab(undefined);
                }}
                onProgramUpdated={() => {
                  fetchPrograms();
                }}
                onOpenChat={(collabId) => {
                  setSelectedProgramForDetail(null);
                  setProgramInitialTab(undefined);
                  if (collabId) {
                    setActiveCollaborationChatId(collabId);
                  }
                  setActiveMenu("conversations");
                }}
                isManagement={isManagement}
                initialTab={programInitialTab}
              />
            ) : (
              <div className="space-y-5">
                {/* Header Pengawasan Program (Standar Seragam Anti-Slop) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
                  <div className="space-y-1">
                    <h1
                      className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {isManagement ? "Pengawasan Program" : "Pelaksanaan Program"}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {isManagement
                        ? "Pantau realisasi milestone lapangan, progres kegiatan mitra, dan verifikasi pelaporan kegiatan."
                        : "Pantau progres pelaksanaan program CSR, tahapan kegiatan lapangan, dan kepatuhan pelaporan."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={fetchPrograms}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-xs"
                      title="Segarkan program"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPrograms ? "animate-spin text-[#009E75]" : "text-slate-500"}`} />
                      <span>Segarkan</span>
                    </button>
                  </div>
                </div>

                {/* 1. 4 KPI Card Pelaksanaan Program (Desain Clean, Modern & Konsisten Persis Kolaborasi Aktif) */}
                {(() => {
                  const opStats = {
                    inProgress: programs.filter((p) => p.status === "IN_PROGRESS").length,
                    pendingActivities: programs.reduce(
                      (acc, p) => acc + (p.pendingActivitiesCount ?? (p.status === "IN_PROGRESS" ? 1 : 0)),
                      0
                    ),
                    pendingVerification: programs.reduce(
                      (acc, p) => acc + (p.pendingVerificationCount || 0),
                      0
                    ),
                    completed: programs.filter((p) => p.status === "COMPLETED").length,
                  };

                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* Kartu 1: Program Berjalan */}
                      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-1">
                        <span className="text-xs font-semibold text-slate-600 block">
                          Program Berjalan
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-[#181343] tracking-tight tabular-nums">
                          {opStats.inProgress}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Program dalam pelaksanaan
                        </span>
                      </div>

                      {/* Kartu 2: Aktivitas Tersisa */}
                      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-1">
                        <span className="text-xs font-semibold text-slate-600 block">
                          Aktivitas Tersisa
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-[#181343] tracking-tight tabular-nums">
                          {opStats.pendingActivities}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Kegiatan yang belum selesai
                        </span>
                      </div>

                      {/* Kartu 3: Menunggu Verifikasi */}
                      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-1">
                        <span className="text-xs font-semibold text-slate-600 block">
                          Menunggu Verifikasi
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-amber-700 tracking-tight tabular-nums">
                          {opStats.pendingVerification}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Laporan perlu ditinjau
                        </span>
                      </div>

                      {/* Kartu 4: Program Selesai */}
                      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-1">
                        <span className="text-xs font-semibold text-slate-600 block">
                          Program Selesai
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-[#009E75] tracking-tight tabular-nums">
                          {opStats.completed}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Program yang telah rampung
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Filter & Pencarian yang Rapi dalam Bahasa Indonesia */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari judul program, mitra pelaksana, inisiatif, atau lokasi..."
                        value={programSearch}
                        onChange={(e) => {
                          setProgramSearch(e.target.value);
                          setProgramPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div className="w-full sm:w-auto">
                      <select
                        value={programFocusFilter}
                        onChange={(e) => {
                          setProgramFocusFilter(e.target.value);
                          setProgramPage(1);
                        }}
                        className="w-full sm:w-auto text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
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

                  {/* Status Filter Chips - Bahasa Indonesia, tanpa kode teknis internal */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" /> Status Program:
                    </span>
                    {[
                      { id: "ALL", label: "Semua Status" },
                      { id: "PLANNED", label: "Persiapan" },
                      { id: "IN_PROGRESS", label: "Sedang Berjalan" },
                      { id: "COMPLETED", label: "Selesai" },
                      { id: "ON_HOLD", label: "Ditunda" },
                      { id: "CANCELLED", label: "Dibatalkan" },
                    ].map((chip) => {
                      const isSelected = programStatusFilter === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => {
                            setProgramStatusFilter(chip.id);
                            setProgramPage(1);
                          }}
                          className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${isSelected
                            ? "bg-[#181343] text-white shadow-2xs font-semibold"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                            }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Kartu Program Ramping & Berbasis Thumbnail Kategori (Sesuai Referensi UI) */}
                {isLoadingPrograms ? (
                  <CardGridSkeleton count={3} />
                ) : filteredPrograms.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-[#181343]">
                      Tidak Ada Program Ditemukan
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      {programSearch || programStatusFilter !== "ALL" || programFocusFilter !== "ALL"
                        ? "Tidak ada program yang sesuai dengan kriteria filter pencarian."
                        : "Program pelaksanaan akan otomatis terbuat saat kontrak kolaborasi disepakati bersama mitra."}
                    </p>
                    {!isManagement && collaborations.some((c) => c.status === "NEGOTIATION") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveMenu("collaborations")}
                        leftIcon={<FileCheck2 className="w-4 h-4" />}
                        className="mt-2"
                      >
                        Buka Tab Kolaborasi &amp; Sahkan MoU
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3.5">
                      {paginatedPrograms.map((prog) => {
                        const categoryConfig = getProgramCategoryVisual(prog.focusArea);
                        const CategoryIcon = categoryConfig.icon;
                        const activityProgress = Math.min(100, Math.max(0, prog.activityProgressPercent ?? 0));
                        const pendingVerif = prog.pendingVerificationCount ?? 0;
                        const budgetNum = parseFloat(prog.budget || "0");
                        const spentNum = parseFloat(prog.spentBudget || "0");
                        const spentPercent = budgetNum > 0 ? Math.min(100, Math.round((spentNum / budgetNum) * 100)) : 0;

                        return (
                          <div
                            key={prog.id}
                            onClick={() => setSelectedProgramForDetail(prog)}
                            className="group relative bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                          >
                            {/* Sisi Kiri: Thumbnail Kategori & Info Utama */}
                            <div className="flex items-center gap-4 min-w-0 flex-1 lg:pr-8 xl:pr-10">
                              {/* Thumbnail Box */}
                              <div
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${categoryConfig.thumbnailBg}`}
                              >
                                <CategoryIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${categoryConfig.iconColor}`} />
                              </div>

                              {/* Text Block */}
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${categoryConfig.badgeClass}`}
                                  >
                                    {categoryConfig.label}
                                  </span>
                                  {prog.sustainabilityReport && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                      <Sparkles className="w-3 h-3 text-emerald-600" />
                                      <span>Laporan ESG Siap</span>
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug group-hover:text-[#181343] transition-colors line-clamp-2 max-w-full lg:max-w-[360px] xl:max-w-[430px]">
                                  {prog.title}
                                </h3>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{prog.partnerName || "Mitra Pelaksana"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Kolom Tengah 1: Progress Program */}
                            <div className="flex lg:flex-col items-center lg:items-start justify-between lg:justify-center min-w-[120px] lg:min-w-[135px] px-2 sm:px-4 lg:pl-6 lg:pr-4 lg:border-l lg:border-slate-100 py-0.5 space-y-0 lg:space-y-1.5">
                              <span className="text-[11px] font-medium text-slate-500">
                                Progress Program
                              </span>
                              <div className="space-y-1.5">
                                <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                                  {activityProgress}%
                                </div>
                                <div className="w-24 sm:w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${activityProgress >= 100
                                      ? "bg-emerald-600"
                                      : activityProgress > 0
                                        ? "bg-[#181343]"
                                        : "bg-slate-200"
                                      }`}
                                    style={{ width: `${Math.min(activityProgress, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Kolom Tengah 2: Lokasi */}
                            <div className="flex items-center gap-2 min-w-[125px] lg:min-w-[145px] px-2 sm:px-4 lg:pl-6 lg:pr-4 lg:border-l lg:border-slate-100 py-0.5">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <div className="min-w-0 text-xs">
                                <span className="font-semibold text-slate-900 block truncate">
                                  {prog.targetCity || "Indonesia"}
                                </span>
                                <span className="text-[11px] text-slate-500 block truncate">
                                  {prog.targetProvince || "Nasional"}
                                </span>
                              </div>
                            </div>

                            {/* Kolom Kanan: Status & Anggaran */}
                            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center min-w-[160px] lg:min-w-[185px] px-2 sm:px-4 lg:pl-6 lg:pr-4 lg:border-l lg:border-slate-100 py-0.5 space-y-2">
                              {/* Status Badge Pill */}
                              <div>{renderProgramStatusPill(prog.status, pendingVerif)}</div>

                              {/* Anggaran & Serapan */}
                              <div className="text-left sm:text-right space-y-0.5">
                                <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                                  <span>{formatRupiah(prog.budget)}</span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-normal block">
                                  Serapan: {formatRupiah(prog.spentBudget || "0")}
                                  {budgetNum > 0 ? ` (${spentPercent}%)` : ""}
                                </span>
                              </div>
                            </div>

                            {/* Ujung Kanan: Tombol Navigasi Panah */}
                            <div className="hidden lg:flex items-center justify-center pl-1">
                              <div className="w-9 h-9 rounded-xl border border-slate-200/90 bg-slate-50 text-slate-400 group-hover:bg-[#181343] group-hover:text-white group-hover:border-[#181343] group-hover:translate-x-0.5 transition-all flex items-center justify-center shrink-0">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Bar */}
                    {filteredPrograms.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                        <div>
                          Menampilkan{" "}
                          <span className="font-bold text-[#181343]">
                            {Math.min((programPage - 1) * PROGRAM_ITEMS_PER_PAGE + 1, filteredPrograms.length)}
                          </span>
                          -
                          <span className="font-bold text-[#181343]">
                            {Math.min(programPage * PROGRAM_ITEMS_PER_PAGE, filteredPrograms.length)}
                          </span>{" "}
                          dari{" "}
                          <span className="font-bold text-[#181343]">
                            {filteredPrograms.length}
                          </span>{" "}
                          program
                        </div>

                        {totalProgramPages > 1 && (
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setProgramPage((prev) => Math.max(1, prev - 1))}
                              disabled={programPage === 1}
                              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center transition cursor-pointer"
                              title="Halaman sebelumnya"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalProgramPages }, (_, i) => i + 1).map((pNum) => (
                              <button
                                key={pNum}
                                type="button"
                                onClick={() => setProgramPage(pNum)}
                                className={`w-8 h-8 rounded-xl font-bold text-xs transition cursor-pointer ${programPage === pNum
                                  ? "bg-[#181343] text-white shadow-2xs"
                                  : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                  }`}
                              >
                                {pNum}
                              </button>
                            ))}

                            <button
                              type="button"
                              onClick={() => setProgramPage((prev) => Math.min(totalProgramPages, prev + 1))}
                              disabled={programPage === totalProgramPages}
                              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center transition cursor-pointer"
                              title="Halaman berikutnya"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}

          {/* ============================================================ */}
          {/* VIEW: FINANCES (PENGAWASAN ANGGARAN & KEUANGAN CSR) */}
          {/* ============================================================ */}
          {activeMenu === "finances" && (
            <CompanyFinancialOversightView
              programs={programs}
              company={company}
              isLoading={isLoadingPrograms}
              onRefresh={fetchPrograms}
              onSelectProgramFinances={(prog) => {
                setSelectedProgramForDetail(prog);
                setProgramInitialTab("finances");
                setActiveMenu("programs");
              }}
            />
          )}

          {/* ============================================================ */}
          {/* VIEW: PARTNER PERFORMANCE (EVALUASI KINERJA & AKUNTABILITAS MITRA) */}
          {/* ============================================================ */}
          {activeMenu === "partner-performance" && (
            <PartnerPerformanceEvaluationView
              programs={programs}
              partners={partners}
              company={company}
              isLoading={isLoadingPartners || isLoadingPrograms}
              onRefresh={() => {
                fetchPartners();
                fetchPrograms();
              }}
              onViewPartnerDetail={(partner) => {
                setSelectedPartnerForDetail(partner);
                setActiveMenu("partners");
              }}
            />
          )}

          {/* ============================================================ */}
          {/* VIEW: BENEFICIARY SENTIMENT (INTELIJEN SENTIMEN & SUARA WARGA) */}
          {/* ============================================================ */}
          {activeMenu === "sentiment" && (
            <BeneficiarySentimentDashboardView
              company={company}
              onSelectProgram={(programId, tab) => {
                const found = programs.find((item) => item.id === programId);
                if (found) {
                  setSelectedProgramForDetail(found);
                  setProgramInitialTab(tab || "reviews");
                  setActiveMenu("programs");
                }
              }}
              onRefresh={fetchPrograms}
            />
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
                if (found) {
                  setSelectedProgramForDetail(found);
                  setActiveMenu("programs");
                }
              }}
            />
          )}

          {/* ============================================================ */}
          {/* VIEW: TEAM (ANGGOTA TIM & AKSES) */}
          {/* ============================================================ */}
          {activeMenu === "team" && (
            <TeamManagementView
              company={company}
              currentUser={user}
              invitations={invitations}
              isLoadingInvitations={isLoadingInvitations}
              onRefreshCompany={fetchCompanyData}
              onRefreshInvitations={fetchInvitations}
              onOpenInviteModal={() => setIsInviteMemberOpen(true)}
            />
          )}

          {/* ============================================================ */}
          {/* VIEW: TEMPLATES (KUSTOMISASI TEMPLATE - KHUSUS CSR_ADMIN) */}
          {/* ============================================================ */}
          {!isManagement && activeMenu === "templates" && (
            <TemplateCustomizationView
              companyName={company?.name}
              picName={currentUser.name}
              picPosition={currentUser.position}
            />
          )}

          {/* ============================================================ */}
          {/* VIEW: CONVERSATIONS (PESAN & NEGOSIASI - KHUSUS CSR_ADMIN) */}
          {/* ============================================================ */}
          {!isManagement && activeMenu === "conversations" && (
            <div className="w-full h-full min-h-0 flex-1 flex flex-col">
              <ConversationCenterView
                userRole="CSR_ADMIN"
                initialCollaborationId={activeCollaborationChatId}
                onViewCollaborationDetails={async (collabId) => {
                  let found = collaborations.find((c) => c.id === collabId);
                  if (!found) {
                    try {
                      const token = localStorage.getItem("accessToken");
                      if (token) {
                        const res = await fetch(`/api/collaborations/${collabId}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        if (res.ok) {
                          const json = await res.json();
                          found = json.data?.data || json.data;
                        }
                      }
                    } catch (err) {
                      console.error("Gagal memuat detail kolaborasi:", err);
                    }
                  }
                  if (found) {
                    setSelectedCollabForDetail(found);
                  }
                  setActiveMenu("collaborations");
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

          {/* ============================================================ */}
          {/* VIEW: AI CHATBOT (FULL-SCREEN AI ADVISOR) */}
          {/* ============================================================ */}
          {activeMenu === "chat" && (
            <div className="w-full h-full min-h-0 flex-1 flex flex-col">
              <ChatbotView
                role={user.role}
                userName={user.name}
                organizationName={company?.name}
                onNavigate={(menu) => setActiveMenu(menu as CompanyNavMenu)}
                onOpenCreateOpportunity={
                  !isManagement
                    ? (initialProvince, draftData) => {
                      setActiveMenu("opportunities");
                      setIsCreatingOpportunity(true);
                      setOpportunityPrefillProvince(initialProvince || null);
                      setOpportunityPrefillDraft(draftData || null);
                    }
                    : undefined
                }
              />
            </div>
          )}
        </main>
        </div>
      </div>

      {/* --- Modals --- */}
      <OpportunityDetailModal
        isOpen={!!selectedOppForDetail}
        opportunity={selectedOppForDetail}
        isManagement={isManagement}
        onClose={() => setSelectedOppForDetail(null)}
        onEdit={
          !isManagement
            ? (opp) => {
              setSelectedOppForDetail(null);
              setSelectedOppForEdit(opp);
            }
            : undefined
        }
        onInvitePartner={
          !isManagement
            ? () => {
              setActiveMenu("partners");
            }
            : undefined
        }
      />

      {!isManagement && (
        <InvitePartnerModal
          isOpen={!!selectedPartnerForInvite}
          partner={selectedPartnerForInvite}
          opportunities={opportunities}
          initialOpportunityId={selectedInviteInitialOppId}
          companyName={company?.name}
          picName={currentUser.name}
          picPosition={currentUser.position}
          onNavigateToTemplates={() => {
            setSelectedPartnerForInvite(null);
            setSelectedInviteInitialOppId(null);
            setActiveMenu("templates");
          }}
          onClose={() => {
            setSelectedPartnerForInvite(null);
            setSelectedInviteInitialOppId(null);
          }}
          onSuccess={() => {
            fetchOpportunities();
            fetchCompanyInvitations();
          }}
        />
      )}

      {isManagement && (
        <InviteMemberModal
          isOpen={isInviteMemberOpen}
          onClose={() => setIsInviteMemberOpen(false)}
          onSuccess={() => {
            fetchInvitations();
          }}
        />
      )}





      {/* User Profile Modal */}
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
