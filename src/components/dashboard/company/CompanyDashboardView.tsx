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
  Layers,
  MessageSquareQuote,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { opportunityStatusEnum, OpportunityStatus } from "@/db/schema/opportunities";
import { InviteMemberModal } from "../InviteMemberModal";
import { Sidebar, CompanyNavMenu } from "../Sidebar";
import { DashboardHeader } from "../DashboardHeader";
import { CreateOpportunityPageView } from "./opportunities/CreateOpportunityPageView";
import { EditOpportunityPageView } from "./opportunities/EditOpportunityPageView";
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
import { ProgramMonitoringDetailView } from "./programs/ProgramMonitoringDetailView";
import { EsgAnalyticsView } from "../analytics/EsgAnalyticsView";
import { ConversationCenterView } from "../conversations/ConversationCenterView";
import { PartnerFullProfileView } from "../partner/profile/PartnerFullProfileView";
import { CompanyFullProfileView } from "./profile/CompanyFullProfileView";
import { ExecutiveOverviewView } from "./overview/ExecutiveOverviewView";
import { OpportunitiesManagementView } from "./opportunities/OpportunitiesManagementView";
import { PartnerCurationView } from "./partners/PartnerCurationView";
import { TeamManagementView } from "./team/TeamManagementView";


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
  const [collabOppFilter, setCollabOppFilter] = useState<string>("ALL");
  const [programSearch, setProgramSearch] = useState("");
  const [programStatusFilter, setProgramStatusFilter] = useState<string>("ALL");
  const [programFocusFilter, setProgramFocusFilter] = useState<string>("ALL");

  // Modal and sub-view states
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
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


  // Proposals action count & KPIs
  const proposalKpis = useMemo(() => {
    const list = Array.isArray(proposals) ? proposals : [];
    const waitingReview = list.filter((p) => p?.status === "SUBMITTED").length;
    const needsRevision = list.filter((p) => p?.status === "REVISION_REQUESTED").length;
    const accepted = list.filter((p) => p?.status === "ACCEPTED").length;
    return { waitingReview, needsRevision, accepted, total: list.length };
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

  // Header Title & Subtitle based on activeMenu
  const headerMeta: Record<CompanyNavMenu, { title: string; subtitle: string }> = {
    overview: {
      title: "Ringkasan Eksekutif",
      subtitle: "Ikhtisar portofolio inisiatif, realisasi anggaran, dan mitra CSR",
    },
    opportunities: {
      title: "Kelola Peluang CSR",
      subtitle: "Rencanakan dan kelola peluang kerja sama CSR berdasarkan kebutuhan masyarakat.",
    },
    partners: {
      title: "Kurasi & Direktori Mitra",
      subtitle: "Jelajahi yayasan dan NGO terverifikasi berdasarkan spesialisasi bidang",
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
      title: "Pelaksanaan Program & Monitoring",
      subtitle: "Pantau progres eksekusi program di lapangan, realisasi serapan anggaran, dan capaian penerima manfaat riil",
    },
    analytics: {
      title: "Laporan & Dampak ESG",
      subtitle: "Analisis akuntabilitas dana CSR, pilar keberlanjutan (E-S-G), dan ekspor laporan resmi",
    },
    team: {
      title: "Anggota Tim & Akses",
      subtitle: "Kelola anggota organisasi, penugasan hak akses peran (Role-Based Access Control), dan undangan tim internal.",
    },
    profile: {
      title: "Profil Perusahaan",
      subtitle: "Informasi legalitas, domisili, dan profil publik organisasi",
    },
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        user={user}
        organizationName={company?.name}
        activeMenu={activeMenu}
        onSelectMenu={(menu) => {
          if (menu !== "programs") {
            setSelectedProgramForDetail(null);
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
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Dashboard Header */}
        <DashboardHeader
          breadcrumbs={
            activeMenu === "opportunities" && isCreatingOpportunity
              ? [
                  { label: "Peluang CSR", onClick: () => setIsCreatingOpportunity(false) },
                  { label: "Buat Peluang Baru" },
                ]
              : activeMenu === "opportunities" && selectedOppForEdit
              ? [
                  { label: "Peluang CSR", onClick: () => setSelectedOppForEdit(null) },
                  { label: "Edit Peluang" },
                ]
              : activeMenu === "proposals"
              ? [
                  { label: "Kolaborasi & Mitra" },
                  { label: "Kelola Proposal" },
                ]
              : activeMenu === "partners"
              ? selectedPartnerForDetail
                ? [
                    { label: "Kolaborasi & Mitra" },
                    { label: "Kurasi Mitra", onClick: () => setSelectedPartnerForDetail(null) },
                    { label: selectedPartnerForDetail.name },
                  ]
                : [
                    { label: "Kolaborasi & Mitra" },
                    { label: "Kurasi Mitra" },
                  ]
              : activeMenu === "team"
              ? [
                  { label: "Pengaturan & Akses" },
                  { label: "Anggota Tim & Akses" },
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
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
              onOpenCreateOpportunity={() => {
                setActiveMenu("opportunities");
                setIsCreatingOpportunity(true);
              }}
              onSelectOpportunityDetail={(opp) => setSelectedOppForDetail(opp)}
            />
          )}

          {/* ============================================================ */}
          {/* VIEW: OPPORTUNITIES (PELUANG CSR & BI INITIATIVES) */}
          {/* ============================================================ */}
          {activeMenu === "opportunities" && (
            isCreatingOpportunity ? (
              <CreateOpportunityPageView
                onBack={() => setIsCreatingOpportunity(false)}
                onSuccess={() => {
                  setIsCreatingOpportunity(false);
                  fetchOpportunities();
                }}
              />
            ) : selectedOppForEdit ? (
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
                onOpenCreateModal={() => setIsCreatingOpportunity(true)}
                onOpenEditModal={(opp) => setSelectedOppForEdit(opp)}
                onOpenDetailModal={(opp) => setSelectedOppForDetail(opp)}
                onDeleteOpportunity={handleDeleteOpportunity}
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
              <PartnerCurationView
                partners={partners}
                isLoading={isLoadingPartners}
                focusFilter={partnerFocusFilter}
                onFocusFilterChange={(focus) => setPartnerFocusFilter(focus)}
                onRefresh={fetchPartners}
                onViewPartnerDetail={handleViewPartnerDetail}
                onInvitePitch={(partner) => setSelectedPartnerForInvite(partner)}
                isLoadingDetail={isLoadingPartnerDetail}
              />
            )
          )}

          {/* ============================================================ */}
          {/* VIEW: PROPOSALS (KELOLA PROPOSAL) */}
          {/* ============================================================ */}
          {activeMenu === "proposals" && (
            <div className="w-full space-y-6 animate-in fade-in duration-300">
              {/* Header Identitas & Ringkasan Total */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 w-full">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight">
                    Kelola Proposal CSR
                  </h2>
                  <p className="text-xs sm:text-sm text-[#787680] mt-1">
                    Tinjau pengajuan mitra dan pantau proses persetujuan kerja sama.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-[#E8E8EA] text-xs font-semibold text-[#181343] self-start sm:self-auto shrink-0 shadow-2xs">
                  Total <span className="font-bold text-[#181343]">{proposals.length}</span> proposal diajukan
                </div>
              </div>

              {/* 3 KPI Cards Horizontal (Statistik Read-Only) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {/* KPI 1: Menunggu Tinjauan */}
                <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex flex-col justify-between cursor-default">
                  <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
                    Menunggu Tinjauan
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-1.5">
                    {proposalKpis.waitingReview}
                  </div>
                  <span className="text-xs text-[#787680] block">
                    Proposal baru &amp; revisi masuk
                  </span>
                </div>

                {/* KPI 2: Perlu Revisi */}
                <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex flex-col justify-between cursor-default">
                  <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
                    Perlu Revisi
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-1.5">
                    {proposalKpis.needsRevision}
                  </div>
                  <span className="text-xs text-[#787680] block">
                    Menunggu pembaruan mitra
                  </span>
                </div>

                {/* KPI 3: Disetujui */}
                <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex flex-col justify-between cursor-default">
                  <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
                    Disetujui
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] my-1.5">
                    {proposalKpis.accepted}
                  </div>
                  <span className="text-xs text-[#787680] block">
                    Lanjut ke tahap kolaborasi
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
                    { id: "OTHER", label: "Lainnya" },
                  ].map((st) => {
                    const isSelected = proposalStatusFilter === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setProposalStatusFilter(st.id)}
                        className={`px-3.5 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer text-xs ${
                          isSelected
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

              {/* Proposals Cards List */}
              {isLoadingProposals ? (
                <div className="py-20 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-[#E8E8EA] w-full">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-600" />
                  <p className="text-xs font-medium text-slate-600">Memuat daftar proposal...</p>
                </div>
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
                <div className="space-y-4 w-full">
                  {filteredProposals.map((prop) => {
                    const statusCfg = (PROPOSAL_STATUS_CONFIG as Record<string, { label: string; variant: "emerald" | "blue" | "rose" | "amber" | "purple" | "slate" }>)[prop.status] || {
                      label: prop.status,
                      variant: "slate" as const,
                    };
                    const actionBtn = getProposalActionButton(prop.status);

                    return (
                      <div
                        key={prop.id}
                        className="w-full bg-white rounded-2xl border border-[#E8E8EA] hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all p-5 sm:p-6 space-y-4 group"
                      >
                        {/* Baris 1 — Informasi Mitra */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <ProposalPartnerLogo logoUrl={prop.partnerLogo} name={prop.partnerName || "Mitra Pelaksana"} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-[#181343] text-sm sm:text-base truncate">
                                  {prop.partnerName || "Mitra Pelaksana"}
                                </h4>
                                {prop.partnerCity && (
                                  <span className="text-xs text-[#787680] truncate">
                                    • {prop.partnerCity}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#787680] mt-0.5">
                                Diajukan {formatDate(prop.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 self-start sm:self-auto">
                            <Badge variant={statusCfg.variant} size="sm" hasDot>
                              {statusCfg.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Baris 2 — Identitas Proposal */}
                        <div className="space-y-1">
                          <h3 className="text-base sm:text-lg font-bold text-[#181343] leading-snug group-hover:text-[#25205c] transition-colors">
                            {prop.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#787680]">
                            Peluang CSR: <span className="text-[#181343] font-semibold">{prop.opportunityTitle || "Peluang Umum"}</span>
                          </p>
                        </div>

                        {/* Baris 3 — Informasi Proposal (Area abu-abu sangat muda, 3 kolom) */}
                        <div className="p-4 sm:p-5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs w-full">
                          <div>
                            <span className="text-[11px] uppercase font-bold text-[#787680] tracking-wider block">
                              Usulan Anggaran
                            </span>
                            <span className="text-base font-bold text-[#181343] mt-1 block">
                              {formatRupiah(prop.proposedBudget)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] uppercase font-bold text-[#787680] tracking-wider block">
                              Durasi Pelaksanaan
                            </span>
                            <span className="text-sm font-semibold text-[#181343] mt-1 block">
                              {prop.durationMonths ? `${prop.durationMonths} Bulan Pelaksanaan` : "Fleksibel"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] uppercase font-bold text-[#787680] tracking-wider block">
                              Target Penerima Manfaat
                            </span>
                            <span className="text-sm font-semibold text-[#181343] mt-1 block" title={prop.targetBeneficiaries || "-"}>
                              {prop.targetBeneficiaries || "Masyarakat Umum"}
                            </span>
                          </div>
                        </div>

                        {/* Baris 4 — Aksi (Tombol di kanan bawah, dan subtle status feedback jika ada di kiri) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 w-full">
                          <div>
                            {prop.feedback && prop.status !== "ACCEPTED" ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-medium">
                                <MessageSquareQuote className="w-4 h-4 text-amber-600 shrink-0" />
                                Memiliki Riwayat Evaluasi
                              </span>
                            ) : (
                              <div />
                            )}
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedProposalForReview(prop)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#181343] hover:bg-[#25205c] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-2xs cursor-pointer shrink-0"
                            >
                              {actionBtn.icon}
                              <span>{actionBtn.label}</span>
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
          {/* VIEW: COLLABORATIONS (KELOLA KERJA SAMA & MOU) */}
          {/* ============================================================ */}
          {activeMenu === "collaborations" && (
            <div className="w-full space-y-6 animate-in fade-in duration-300">
              {/* Header Identitas & Ringkasan Total */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 w-full">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight">
                    Kelola Kerja Sama &amp; MoU
                  </h2>
                  <p className="text-xs sm:text-sm text-[#787680] mt-1">
                    Pantau proses kesepakatan, dokumen perjanjian, dan kesiapan pelaksanaan program CSR bersama mitra.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-[#E8E8EA] text-xs font-semibold text-[#181343] self-start sm:self-auto shrink-0 shadow-2xs">
                  Total <span className="font-bold text-[#181343]">{collaborations.length}</span> kerja sama aktif
                </div>
              </div>

              {/* 3 KPI Cards Horizontal (Statistik Read-Only) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {/* KPI 1: Dalam Proses */}
                <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs w-full flex flex-col justify-between cursor-default">
                  <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
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
                  <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
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
                  <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
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
                        className={`px-3.5 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer text-xs ${
                          isSelected
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
                <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E8EA] p-8 space-y-3">
                  <RefreshCw className="w-6 h-6 text-[#181343] animate-spin mx-auto" />
                  <p className="text-xs text-[#787680]">Memuat data kerja sama &amp; MoU...</p>
                </div>
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
                <div className="space-y-4 w-full">
                  {filteredCollaborations.map((collab) => {
                    const isAgreed = collab.status === "AGREED";
                    const isNegotiation = collab.status === "NEGOTIATION";
                    const isCancelled = collab.status === "CANCELLED";

                    return (
                      <div
                        key={collab.id}
                        className="w-full bg-white rounded-2xl border border-[#E8E8EA] hover:border-slate-300 shadow-2xs hover:shadow-xs p-5 sm:p-6 space-y-4 transition"
                      >
                        {/* Baris 1: Header Mitra & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8EA]">
                          <div className="flex items-center gap-3">
                            <ProposalPartnerLogo logoUrl={collab.partnerLogo} name={collab.partnerName || "Mitra"} />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-[#181343] text-sm sm:text-base">
                                  {collab.partnerName || "Mitra CSR"}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#787680] mt-0.5">
                                {collab.partnerCity && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {collab.partnerCity}
                                  </span>
                                )}
                                {collab.partnerCity && <span>•</span>}
                                <span>
                                  {isAgreed && collab.agreedAt
                                    ? `Disepakati ${formatDate(collab.agreedAt)}`
                                    : `Dibuat ${formatDate(collab.createdAt)}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                            {isAgreed ? (
                              <Badge variant="emerald" size="md">
                                MoU Disepakati
                              </Badge>
                            ) : isNegotiation ? (
                              <Badge variant="amber" size="md">
                                Tahap Negosiasi
                              </Badge>
                            ) : isCancelled ? (
                              <Badge variant="rose" size="md">
                                Dibatalkan
                              </Badge>
                            ) : (
                              <Badge variant="slate" size="md">
                                {collab.status}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Baris 2: Identitas Program & Peluang */}
                        <div className="space-y-1">
                          <h3 className="text-base sm:text-lg font-bold text-[#181343] leading-snug">
                            {collab.proposalTitle || collab.opportunityTitle || "Program Kerja Sama CSR"}
                          </h3>
                          <div className="text-xs text-[#787680]">
                            Peluang CSR:{" "}
                            <span className="font-semibold text-slate-700">
                              {collab.opportunityTitle || "Inisiatif CSR"}
                            </span>
                          </div>
                        </div>

                        {/* Baris 3: Informasi Kesepakatan (Box Abu-Abu Muda) */}
                        <div className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                          {/* Kolom 1: Nilai Anggaran Disepakati */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-[#787680] block">
                              Nilai Anggaran Disepakati
                            </span>
                            <div className="text-sm font-bold text-[#009E75]">
                              {formatRupiah(collab.finalBudget || collab.proposedBudget)}
                            </div>
                            {collab.finalBudget && collab.proposedBudget && collab.finalBudget !== collab.proposedBudget && (
                              <span className="text-[10px] text-slate-400 block line-through">
                                Usulan: {formatRupiah(collab.proposedBudget)}
                              </span>
                            )}
                          </div>

                          {/* Kolom 2: Periode Pelaksanaan */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-[#787680] block">
                              Periode Pelaksanaan
                            </span>
                            <div className="text-xs font-semibold text-[#181343] flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>
                                {collab.startDate && collab.endDate
                                  ? `${formatDate(collab.startDate)} s/d ${formatDate(collab.endDate)}`
                                  : "Sesuai Jadwal Proposal"}
                              </span>
                            </div>
                          </div>

                          {/* Kolom 3: Status Dokumen MoU/PKS */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-[#787680] block">
                              Status Dokumen MoU/PKS
                            </span>
                            <div>
                              {isAgreed ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Telah Disepakati
                                </span>
                              ) : collab.mouDocumentUrl ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  Dalam Proses
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  Belum Diunggah
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Kolom 4: Target Penerima Manfaat */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-[#787680] block">
                              Target Penerima Manfaat
                            </span>
                            <div className="text-xs font-semibold text-[#181343] truncate">
                              {collab.targetBeneficiaries || "-"}
                            </div>
                          </div>
                        </div>

                        {/* Baris 4: Aksi & Catatan */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E8E8EA]">
                          {/* Indikator Catatan jika ada (tanpa kotak "belum ada") */}
                          <div>
                            {collab.notes && collab.notes.trim() ? (
                              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                                <MessageSquareQuote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Memiliki Catatan Kesepakatan</span>
                              </div>
                            ) : null}
                          </div>

                          {/* Tindakan Sekunder & Utama */}
                          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                            {/* Tombol Sekunder: Dokumen MoU jika tersedia */}
                            {collab.mouDocumentUrl && (
                              <a
                                href={collab.mouDocumentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#181343] bg-white border border-[#E8E8EA] hover:bg-slate-50 transition shadow-2xs"
                              >
                                <FileCheck2 className="w-3.5 h-3.5 text-[#009E75]" />
                                <span>Lihat Dokumen MoU</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
                              </a>
                            )}

                            {/* Tombol Monitoring jika sudah AGREED */}
                            {isAgreed && (
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition shadow-2xs cursor-pointer"
                              >
                                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Monitoring Program</span>
                              </button>
                            )}

                            {/* Tombol Utama: Lihat Detail Kesepakatan */}
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-[#181343] hover:bg-[#25205c] text-white text-xs sm:text-sm font-bold shadow-2xs rounded-xl px-4 py-2.5 cursor-pointer"
                              onClick={() => setSelectedCollabForDetail(collab)}
                              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                            >
                              Lihat Detail Kesepakatan
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
          {/* ============================================================ */}
          {/* VIEW: PROGRAMS (PELAKSANAAN PROGRAM & MONITORING) */}
          {/* ============================================================ */}
          {activeMenu === "programs" && (
            selectedProgramForDetail ? (
              <ProgramMonitoringDetailView
                program={selectedProgramForDetail}
                onBack={() => setSelectedProgramForDetail(null)}
                onProgramUpdated={() => {
                  fetchPrograms();
                }}
                onOpenChat={(collabId) => {
                  setSelectedProgramForDetail(null);
                  if (collabId) {
                    setActiveCollaborationChatId(collabId);
                  }
                  setActiveMenu("conversations");
                }}
                isManagement={isManagement}
              />
            ) : (
            <div className="space-y-6">
              {/* 1. 4 KPI Card Pelaksanaan Program (Desain Clean, Modern & Konsisten) */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Kartu 1: Program Berjalan */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-600">
                          Program Berjalan
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50/80 text-emerald-600 flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight">
                          {opStats.inProgress}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Program dalam pelaksanaan
                        </p>
                      </div>
                    </div>

                    {/* Kartu 2: Aktivitas Tersisa */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-600">
                          Aktivitas Tersisa
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-slate-100/80 text-[#181343] flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4 text-[#181343]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight">
                          {opStats.pendingActivities}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Kegiatan yang belum selesai
                        </p>
                      </div>
                    </div>

                    {/* Kartu 3: Menunggu Verifikasi */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-600">
                          Menunggu Verifikasi
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50/80 text-amber-600 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight">
                          {opStats.pendingVerification}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Laporan perlu ditinjau
                        </p>
                      </div>
                    </div>

                    {/* Kartu 4: Program Selesai */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-600">
                          Program Selesai
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-slate-100/80 text-[#181343] flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-[#181343]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight">
                          {opStats.completed}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Program yang telah rampung
                        </p>
                      </div>
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
                      onChange={(e) => setProgramSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="w-full sm:w-auto">
                    <select
                      value={programFocusFilter}
                      onChange={(e) => setProgramFocusFilter(e.target.value)}
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
                        onClick={() => setProgramStatusFilter(chip.id)}
                        className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                          isSelected
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

              {/* 3. Sederhanakan Kartu Program: Fokus pada Monitoring Aktivitas & Bukti */}
              {isLoadingPrograms ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                  Memuat data pelaksanaan program...
                </div>
              ) : filteredPrograms.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
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
                    const activityProgress = prog.activityProgressPercent ?? 0;
                    const totalActs = prog.totalActivitiesCount ?? 0;
                    const completedActs = prog.completedActivitiesCount ?? 0;
                    const pendingVerif = prog.pendingVerificationCount ?? 0;

                    return (
                      <div
                        key={prog.id}
                        className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-5"
                      >
                        {/* Header Row: Focus area, status, location, period */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/80">
                              {focusConfig.label}
                            </span>
                            <Badge variant={statusConfig.variant} size="md" hasDot>
                              {statusConfig.label}
                            </Badge>
                            {prog.targetCity && (
                              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {prog.targetCity}{prog.targetProvince ? `, ${prog.targetProvince}` : ""}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {prog.startDate && prog.endDate
                              ? `${formatDate(prog.startDate)} s/d ${formatDate(prog.endDate)}`
                              : "Jadwal Belum Ditetapkan"}
                          </div>
                        </div>

                        {/* Title & Partner Information */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                              Mitra Pelaksana:
                            </span>
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-teal-600" />
                              {prog.partnerName || "Mitra Pelaksana"}
                            </span>
                            {prog.opportunityTitle && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 truncate text-[11px]">
                                  Inisiatif: {prog.opportunityTitle}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-base font-extrabold text-[#181343] leading-snug">
                            {prog.title}
                          </h3>
                        </div>

                        {/* 3-Column Operational Monitoring Grid */}
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Column 1: Progres Aktivitas Proposal */}
                          <div className="space-y-1.5 md:border-r border-slate-200/60 md:pr-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                                Progres Aktivitas Proposal
                              </span>
                              <span className="font-extrabold text-emerald-700 text-xs">
                                {activityProgress}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(activityProgress, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              {totalActs > 0
                                ? `${completedActs} dari ${totalActs} tahapan terselesaikan`
                                : "Tahapan disinkronkan dari proposal"}
                            </span>
                          </div>

                          {/* Column 2: Aktivitas Berikutnya & Jadwal */}
                          <div className="space-y-1 md:border-r border-slate-200/60 md:pr-4">
                            <span className="text-[11px] text-slate-500 font-semibold block">
                              Aktivitas Berikutnya
                            </span>
                            <div className="text-xs font-bold text-slate-800 line-clamp-1">
                              {prog.nextActivityTitle || "Semua tahapan terselesaikan"}
                            </div>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {prog.nextActivityDate
                                ? `Target: ${formatDate(prog.nextActivityDate)}`
                                : "Jadwal Belum Ditetapkan"}
                            </span>
                          </div>

                          {/* Column 3: Status Laporan / Verifikasi Terakhir */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] text-slate-500 font-semibold block">
                              Status Laporan Terakhir
                            </span>
                            <div>
                              {pendingVerif > 0 ? (
                                <Badge variant="amber" size="sm" hasDot>
                                  {pendingVerif} Menunggu Verifikasi
                                </Badge>
                              ) : prog.lastReportStatus === "VERIFIED" ? (
                                <Badge variant="emerald" size="sm" hasDot>
                                  Laporan Terverifikasi
                                </Badge>
                              ) : prog.lastReportStatus === "REVISION_REQUESTED" ? (
                                <Badge variant="rose" size="sm" hasDot>
                                  Perlu Revisi
                                </Badge>
                              ) : prog.lastReportStatus === "SUBMITTED" ? (
                                <Badge variant="amber" size="sm" hasDot>
                                  Menunggu Verifikasi
                                </Badge>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Belum Ada Laporan Kegiatan
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              {prog.lastReportDate
                                ? `Pembaruan: ${formatDate(prog.lastReportDate)}`
                                : "Sesuai timeline proposal"}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer: Ringkasan Anggaran & Target + Tombol Lihat Detail Monitoring */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>
                              Anggaran MoU: <strong className="text-slate-700">{formatRupiah(prog.budget)}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>
                              Serapan: <strong className="text-slate-700">{formatRupiah(prog.spentBudget || "0")}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>
                              Target: <strong className="text-slate-700">{prog.targetBeneficiaries || "-"}</strong>
                            </span>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-[#009E75] hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs rounded-xl cursor-pointer self-end sm:self-auto"
                            onClick={() => setSelectedProgramForDetail(prog)}
                            leftIcon={<Activity className="w-3.5 h-3.5" />}
                          >
                            Lihat Detail Monitoring
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
      <OpportunityDetailModal
        isOpen={!!selectedOppForDetail}
        opportunity={selectedOppForDetail}
        onClose={() => setSelectedOppForDetail(null)}
        onEdit={(opp) => {
          setSelectedOppForDetail(null);
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


    </div>
  );
}
