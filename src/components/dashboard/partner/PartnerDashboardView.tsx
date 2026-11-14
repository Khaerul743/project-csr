"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  HeartHandshake,
  ChevronRight,
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
  Layers,
  BookOpen,
  HeartPulse,
  TreePine,
  RotateCcw,
  ClipboardCheck,
  X,
  PieChart,
  Target,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardHeader, BreadcrumbItem } from "../DashboardHeader";
import { PartnerSidebar } from "./PartnerSidebar";
import { SubmitProposalPageView } from "./SubmitProposalPageView";
import { ProposalDetailModal } from "./ProposalDetailModal";
import { PartnerOpportunityDetailPageView } from "./PartnerOpportunityDetailPageView";
import { PartnerCollaborationDetailModal } from "./PartnerCollaborationDetailModal";
import { PartnerProgramDetailPageView } from "./PartnerProgramDetailPageView";
import { EsgAnalyticsView } from "../analytics/EsgAnalyticsView";
import { ConversationCenterView } from "../conversations/ConversationCenterView";
import { PartnerFullProfileView } from "./profile/PartnerFullProfileView";
import { CompanyFullProfileView } from "../company/profile/CompanyFullProfileView";
import { ChatbotView } from "../chat/ChatbotView";
import { UserProfileModal, UserProfileData } from "../UserProfileModal";
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
  user: UserProfileData;
  onLogout?: () => void;
  onProfileUpdated?: (updatedUser: UserProfileData) => void;
}


interface OpportunityCardProps {
  opp: OpportunityItem;
  existingProposal?: ProposalItem;
  onSelectDetail: (opp: OpportunityItem) => void;
  onSelectProposal: (opp: OpportunityItem) => void;
  onSelectExistingProposal: (prop: ProposalItem) => void;
  onViewCompany: (companyId: string) => void;
}

const getFocusAreaIcon = (area: string) => {
  switch (area) {
    case "PENDIDIKAN":
      return <BookOpen className="w-5 h-5 text-blue-600" />;
    case "KESEHATAN":
      return <HeartPulse className="w-5 h-5 text-rose-600" />;
    case "LINGKUNGAN":
      return <TreePine className="w-5 h-5 text-emerald-600" />;
    case "PEMBERDAYAAN_EKONOMI":
      return <TrendingUp className="w-5 h-5 text-amber-600" />;
    case "INFRASTRUKTUR_SOSIAL":
      return <Building2 className="w-5 h-5 text-purple-600" />;
    case "TANGGAP_BENCANA":
      return <ShieldCheck className="w-5 h-5 text-rose-600" />;
    default:
      return <Compass className="w-5 h-5 text-teal-600" />;
  }
};

const getFocusAreaGradient = (area: string) => {
  switch (area) {
    case "PENDIDIKAN":
      return "from-blue-50/80 via-slate-50 to-indigo-50/40";
    case "KESEHATAN":
      return "from-rose-50/80 via-slate-50 to-pink-50/40";
    case "LINGKUNGAN":
      return "from-emerald-50/80 via-slate-50 to-teal-50/40";
    case "PEMBERDAYAAN_EKONOMI":
      return "from-amber-50/80 via-slate-50 to-orange-50/40";
    case "INFRASTRUKTUR_SOSIAL":
      return "from-purple-50/80 via-slate-50 to-violet-50/40";
    case "TANGGAP_BENCANA":
      return "from-rose-50/80 via-slate-50 to-orange-50/40";
    default:
      return "from-slate-100 via-slate-50 to-teal-50/40";
  }
};

function OpportunityCard({
  opp,
  existingProposal,
  onSelectDetail,
  onSelectProposal,
  onSelectExistingProposal,
  onViewCompany,
}: OpportunityCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const focusConfig = FOCUS_AREA_CONFIG[opp.focusArea] || {
    label: opp.focusArea,
    variant: "slate" as const,
  };

  const isExpired = opp.deadline ? new Date(opp.deadline) < new Date() : false;
  const isClosed = (opp.status && opp.status !== "OPEN") || isExpired;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#181343]/30 transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* 1. Banner atau Fallback Visual */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-50 border-b border-[#E5E7EB]">
          {opp.bannerUrl && !imgFailed ? (
            <img
              src={opp.bannerUrl}
              alt=""
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${getFocusAreaGradient(
                opp.focusArea
              )} flex flex-col items-center justify-center relative`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-2xs border border-white/80 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                {getFocusAreaIcon(opp.focusArea)}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 mt-2">
                Inisiatif CSR
              </span>
            </div>
          )}

          {/* 2. Badge Bidang Fokus */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant={focusConfig.variant} size="sm" className="shadow-2xs font-semibold">
              {focusConfig.label}
            </Badge>
          </div>

          {/* Status Penutupan / Tenggat Berakhir */}
          {isClosed && (
            <div className="absolute top-3 right-3 z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/85 text-white backdrop-blur-xs shadow-2xs">
                {isExpired ? "Tenggat Berakhir" : STATUS_CONFIG[opp.status]?.label || opp.status}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* 3. Nama Perusahaan Penyelenggara */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (opp.companyId) onViewCompany(opp.companyId);
              }}
              className="font-semibold text-slate-700 hover:text-emerald-700 hover:underline truncate text-left transition-colors cursor-pointer"
              title="Lihat Profil Perusahaan"
            >
              {opp.companyName || "Perusahaan Penyelenggara"}
            </button>
          </div>

          {/* 4. Judul Peluang CSR (Paling Menonjol) */}
          <h3
            className="font-bold text-slate-900 text-base leading-snug line-clamp-2 min-h-[44px]"
            title={opp.title}
          >
            {opp.title}
          </h3>

          {/* 5. Deskripsi Singkat (Maks 2 Baris) */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[36px]">
            {opp.description || "Tidak ada ringkasan deskripsi untuk inisiatif ini."}
          </p>

          {/* Metadata: Lokasi & Deadline */}
          <div className="pt-2 space-y-1.5 border-t border-slate-100 text-xs">
            {/* 6. Lokasi Sasaran */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium text-slate-600">
                {[opp.targetCity, opp.targetProvince].filter(Boolean).join(", ") || "Nasional / Seluruh Wilayah"}
              </span>
            </div>

            {/* 7. Batas Pengajuan Proposal */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 font-medium">Batas Pengajuan:</span>
              <span className={`font-semibold ${isExpired ? "text-rose-600 font-bold" : "text-slate-800"}`}>
                {opp.deadline
                  ? isExpired
                    ? `${formatDate(opp.deadline)} (Tenggat Berakhir)`
                    : formatDate(opp.deadline)
                  : "Terbuka / Fleksibel"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Estimasi Anggaran & 9. Tombol Tindakan */}
      <div className="p-5 pt-0 space-y-3">
        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Alokasi Anggaran:</span>
          <span className="text-sm font-extrabold text-[#009E75]">
            {formatRupiah(opp.estimatedBudget)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Detail */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-[#E5E7EB] cursor-pointer"
            onClick={() => onSelectDetail(opp)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Detail
          </Button>

          {/* Tombol Ajukan / Status Proposal */}
          {existingProposal ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs font-semibold border-[#E5E7EB] text-[#181343] cursor-pointer"
              onClick={() => onSelectExistingProposal(existingProposal)}
              leftIcon={<FileCheck2 className="w-3.5 h-3.5 text-[#181343] shrink-0" />}
              title="Proposal telah diajukan. Klik untuk melihat detail proposal Anda."
            >
              Proposal Diajukan ({PROPOSAL_STATUS_CONFIG[existingProposal.status]?.label || existingProposal.status})
            </Button>
          ) : isClosed ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="flex-1 text-xs font-semibold bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-75"
              title={isExpired ? "Batas pengajuan proposal telah berakhir" : "Peluang CSR telah ditutup"}
            >
              {isExpired ? "Tenggat Berakhir" : "Ditutup"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="flex-1 text-xs font-semibold cursor-pointer bg-[#009E75] hover:bg-emerald-700 text-white"
              onClick={() => onSelectProposal(opp)}
              leftIcon={<Send className="w-3.5 h-3.5 shrink-0" />}
            >
              Ajukan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PartnerDashboardView({ user, onLogout, onProfileUpdated }: PartnerDashboardViewProps) {
  // Navigation Menu state
  const [currentUser, setCurrentUser] = useState<UserProfileData>(user);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<PartnerNavMenu>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeCollaborationChatId, setActiveCollaborationChatId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

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
  const [exploreLocationFilter, setExploreLocationFilter] = useState<string>("ALL");

  // Distinct locations for explore filter dropdown
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    opportunities.forEach((o) => {
      if (o.targetProvince) locSet.add(o.targetProvince.trim());
      if (o.targetCity) locSet.add(o.targetCity.trim());
    });
    return Array.from(locSet).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [opportunities]);

  const isAnyExploreFilterActive =
    exploreSearch.trim().length > 0 ||
    exploreFocusFilter !== "ALL" ||
    exploreLocationFilter !== "ALL";

  const handleResetExploreFilters = () => {
    setExploreSearch("");
    setExploreFocusFilter("ALL");
    setExploreLocationFilter("ALL");
  };
  const [proposalStatusFilter, setProposalStatusFilter] = useState<string>("ALL");
  const [collabSearch, setCollabSearch] = useState("");
  const [collabStatusFilter, setCollabStatusFilter] = useState<string>("ALL");
  const [programSearch, setProgramSearch] = useState("");
  const [programStatusFilter, setProgramStatusFilter] = useState<string>("ALL");
  const [programFocusFilter, setProgramFocusFilter] = useState<string>("ALL");

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
        setSelectedOppForDetail(null);
        setSelectedOppForProposal(null);
        setSelectedCompanyForDetail(json.data);
        setActiveMenu("explore");
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingCompanyDetail(false);
    }
  };

  const handleSelectMenu = (menu: string) => {
    setSelectedOppForProposal(null);
    setSelectedOppForDetail(null);
    setSelectedCompanyForDetail(null);
    if (menu !== "programs") {
      setSelectedProgramForDetail(null);
    }
    setActiveMenu(menu as PartnerNavMenu);
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

  // 1. Metrik Proposal & Pipeline Kemitraan
  const proposalStats = useMemo(() => {
    const total = proposals.length;
    const accepted = proposals.filter((p) => p.status === "ACCEPTED").length;
    const underReview = proposals.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length;
    const revision = proposals.filter((p) => p.status === "REVISION_REQUESTED").length;
    const rejected = proposals.filter((p) => p.status === "REJECTED").length;
    const decided = accepted + rejected;
    const winRate = decided > 0 ? Math.round((accepted / decided) * 100) : total > 0 && accepted > 0 ? Math.round((accepted / total) * 100) : 0;
    return {
      total,
      accepted,
      underReview,
      revision,
      rejected,
      winRate,
    };
  }, [proposals]);

  // 2. Metrik Distribusi Sektor / Bidang Fokus CSR
  const sectorDistribution = useMemo(() => {
    if (programs.length === 0) return [];
    const map = new Map<string, { focusArea: string; count: number; totalBudget: number }>();
    programs.forEach((p) => {
      const fa = p.focusArea || "LAINNYA";
      const b = p.budget ? parseFloat(p.budget) : 0;
      if (!map.has(fa)) {
        map.set(fa, { focusArea: fa, count: 0, totalBudget: 0 });
      }
      const item = map.get(fa)!;
      item.count += 1;
      item.totalBudget += isNaN(b) ? 0 : b;
    });
    const list = Array.from(map.values()).map((s) => ({
      ...s,
      percentage: Math.round((s.count / programs.length) * 100),
    }));
    list.sort((a, b) => b.count - a.count);
    return list;
  }, [programs]);

  // 3. Metrik Capaian Dampak Sosial & Pelaksanaan Lapangan
  const impactSummary = useMemo(() => {
    let totalBeneficiaries = 0;
    let totalProgressSum = 0;
    let programsWithProgress = 0;

    programs.forEach((p) => {
      const bStr = p.actualBeneficiaries || p.targetBeneficiaries;
      if (bStr) {
        const match = bStr.match(/\d[\d.,]*/);
        if (match) {
          const num = parseInt(match[0].replace(/[.,]/g, ""), 10);
          if (!isNaN(num)) totalBeneficiaries += num;
        }
      }
      if (p.activityProgressPercent !== undefined && p.activityProgressPercent !== null) {
        totalProgressSum += p.activityProgressPercent;
        programsWithProgress += 1;
      }
    });

    const averageProgress = programsWithProgress > 0 ? Math.round(totalProgressSum / programsWithProgress) : 0;

    return {
      totalBeneficiaries,
      averageProgress,
      totalPrograms: programs.length,
      inProgressCount: inProgressPrograms.length,
      completedCount: completedPrograms.length,
    };
  }, [programs, inProgressPrograms, completedPrograms]);

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

      const matchFocus =
        programFocusFilter === "ALL" || p.focusArea === programFocusFilter;

      return matchSearch && matchStatus && matchFocus;
    });
  }, [programs, programSearch, programStatusFilter, programFocusFilter]);

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
      const q = exploreSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        (o.companyName && o.companyName.toLowerCase().includes(q)) ||
        (o.targetCity && o.targetCity.toLowerCase().includes(q)) ||
        (o.targetProvince && o.targetProvince.toLowerCase().includes(q)) ||
        (o.description && o.description.toLowerCase().includes(q));

      const matchesFocus =
        exploreFocusFilter === "ALL" || o.focusArea === exploreFocusFilter;

      const matchesLocation =
        exploreLocationFilter === "ALL" ||
        (o.targetCity && o.targetCity.toLowerCase() === exploreLocationFilter.toLowerCase()) ||
        (o.targetProvince && o.targetProvince.toLowerCase() === exploreLocationFilter.toLowerCase());

      return matchesSearch && matchesFocus && matchesLocation;
    });
  }, [opportunities, exploreSearch, exploreFocusFilter, exploreLocationFilter]);

  const exploreGridClass = useMemo(() => {
    if (filteredOpportunities.length === 1) {
      return "grid grid-cols-1 md:grid-cols-2 max-w-3xl gap-5";
    }
    if (filteredOpportunities.length === 2) {
      return "grid grid-cols-1 md:grid-cols-2 gap-5";
    }
    return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5";
  }, [filteredOpportunities.length]);

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (proposalStatusFilter === "ALL") return true;
      return p.status === proposalStatusFilter;
    });
  }, [proposals, proposalStatusFilter]);

  // Operational NGO Dashboard Metrics & Helpers
  const inProgressProposals = useMemo(
    () =>
      proposals.filter(
        (p) =>
          p.status === "SUBMITTED" ||
          p.status === "UNDER_REVIEW" ||
          p.status === "REVISION_REQUESTED"
      ),
    [proposals]
  );

  const totalReportsNeedingAction = useMemo(() => {
    return programs.reduce((acc, p) => {
      const revCount =
        p.revisionRequestedReportsCount ??
        (p.lastReportStatus === "REVISION_REQUESTED" ? 1 : 0);
      return acc + revCount;
    }, 0);
  }, [programs]);

  const isProfileIncomplete = useMemo(() => {
    if (!partner) return false;
    return !partner.description || !partner.city || !partner.website || !partner.phone;
  }, [partner]);

  const isNewPartner = useMemo(() => {
    return (
      invitations.length === 0 &&
      proposals.length === 0 &&
      collaborations.length === 0 &&
      programs.length === 0
    );
  }, [invitations.length, proposals.length, collaborations.length, programs.length]);

  const hasActiveInitiatives = useMemo(() => {
    return programs.length > 0 || collaborations.length > 0;
  }, [programs.length, collaborations.length]);

  // Section 3: Prioritas Tindak Lanjut (Max 3 actionable items)
  const prioritizedActionItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      subtitle?: string;
      meta?: string;
      badgeLabel: string;
      badgeVariant: "amber" | "rose" | "blue" | "emerald";
      icon: React.ReactNode;
      buttonLabel: string;
      onClick: () => void;
    }> = [];

    // Priority 1: Invitations awaiting response
    if (pendingInvitations.length > 0) {
      const firstInv = pendingInvitations[0];
      items.push({
        id: "invitations-action",
        title: `${pendingInvitations.length} Undangan Kolaborasi Menunggu Respons`,
        subtitle: `Dari ${firstInv.companyName || "Perusahaan Mitra"}${pendingInvitations.length > 1 ? ` dan ${pendingInvitations.length - 1} perusahaan lainnya` : ""
          }`,
        meta: `Diterima ${formatDate(firstInv.createdAt)}`,
        badgeLabel: "Perlu Respons",
        badgeVariant: "amber",
        icon: <Inbox className="w-4 h-4 text-amber-600" />,
        buttonLabel: "Tinjau Undangan",
        onClick: () => setActiveMenu("invitations"),
      });
    }

    // Priority 2: Proposals requiring revision
    const revisionProposals = proposals.filter((p) => p.status === "REVISION_REQUESTED");
    revisionProposals.forEach((prop) => {
      if (items.length < 3) {
        items.push({
          id: `proposal-rev-${prop.id}`,
          title: `Revisi Proposal Diperlukan: "${prop.title}"`,
          subtitle: `Mitra: ${prop.companyName || "Perusahaan Sponsor"}`,
          meta: prop.reviewedAt ? `Diminta ${formatDate(prop.reviewedAt)}` : undefined,
          badgeLabel: "Revisi Diperlukan",
          badgeVariant: "rose",
          icon: <FileText className="w-4 h-4 text-rose-600" />,
          buttonLabel: "Buka Proposal",
          onClick: () => {
            setSelectedProposalForDetail(prop);
            setActiveMenu("proposals");
          },
        });
      }
    });

    // Priority 3: Program reports requiring revision
    const programsNeedingRevision = programs.filter(
      (p) =>
        p.lastReportStatus === "REVISION_REQUESTED" ||
        (p.revisionRequestedReportsCount && p.revisionRequestedReportsCount > 0)
    );
    programsNeedingRevision.forEach((prog) => {
      if (items.length < 3) {
        items.push({
          id: `program-rev-${prog.id}`,
          title: `Laporan Pelaksanaan Perlu Diperbaiki: "${prog.title}"`,
          subtitle: `Mitra: ${prog.companyName || "Perusahaan Sponsor"}`,
          meta: prog.lastReportDate ? `Catatan ${formatDate(prog.lastReportDate)}` : undefined,
          badgeLabel: "Perbaiki Laporan",
          badgeVariant: "rose",
          icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
          buttonLabel: "Perbaiki Laporan",
          onClick: () => {
            setSelectedProgramForDetail(prog);
            setActiveMenu("programs");
          },
        });
      }
    });

    // Priority 4: Upcoming deadlines on in-progress programs
    if (items.length < 3) {
      const now = new Date().getTime();
      const upcomingPrograms = inProgressPrograms
        .filter((p) => {
          if (!p.endDate) return false;
          const end = new Date(p.endDate).getTime();
          const diffDays = (end - now) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 14;
        })
        .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime());

      upcomingPrograms.forEach((prog) => {
        if (items.length < 3) {
          items.push({
            id: `program-deadline-${prog.id}`,
            title: `Tenggat Pelaksanaan Mendekati Batas: "${prog.title}"`,
            subtitle: `Mitra: ${prog.companyName || "Perusahaan"}`,
            meta: `Batas akhir: ${formatDate(prog.endDate!)}`,
            badgeLabel: "Mendekati Batas",
            badgeVariant: "amber",
            icon: <Clock className="w-4 h-4 text-amber-600" />,
            buttonLabel: "Lihat Kegiatan",
            onClick: () => {
              setSelectedProgramForDetail(prog);
              setActiveMenu("programs");
            },
          });
        }
      });
    }

    return items.slice(0, 3);
  }, [pendingInvitations, proposals, programs, inProgressPrograms]);

  // Section 4: Latest Open Opportunities (Preview max 2-3)
  const latestOpenOpportunities = useMemo(() => {
    return opportunities
      .filter((o) => o.status === "OPEN" && (!o.deadline || new Date(o.deadline) >= new Date()))
      .slice(0, 3);
  }, [opportunities]);

  const latestOpportunitiesGridClass = useMemo(() => {
    if (latestOpenOpportunities.length === 1) {
      return "grid grid-cols-1 md:grid-cols-2 max-w-3xl gap-5";
    }
    if (latestOpenOpportunities.length === 2) {
      return "grid grid-cols-1 md:grid-cols-2 gap-5";
    }
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5";
  }, [latestOpenOpportunities.length]);

  // Section 5: Recent Collaboration Activities (max 3-5 history items)
  const recentCollaborationActivities = useMemo(() => {
    const list: Array<{
      id: string;
      type: "INVITATION" | "PROPOSAL" | "COLLABORATION" | "REPORT";
      title: string;
      organizationOrProgram: string;
      date: string;
      statusBadge: {
        label: string;
        variant: "emerald" | "blue" | "rose" | "amber" | "slate" | "navy";
      };
      icon: React.ReactNode;
      targetMenu: PartnerNavMenu;
    }> = [];

    // Invitations
    invitations.forEach((inv) => {
      const badge =
        inv.status === "ACCEPTED"
          ? { label: "Undangan Diterima", variant: "emerald" as const }
          : inv.status === "DECLINED"
            ? { label: "Undangan Ditolak", variant: "slate" as const }
            : { label: "Undangan Masuk", variant: "amber" as const };

      list.push({
        id: `inv-${inv.id}`,
        type: "INVITATION",
        title: inv.opportunityTitle || "Undangan Kolaborasi CSR",
        organizationOrProgram: inv.companyName || "Perusahaan Mitra",
        date: inv.createdAt,
        statusBadge: badge,
        icon: <Inbox className="w-4 h-4 text-teal-600" />,
        targetMenu: "invitations",
      });
    });

    // Proposals
    proposals.forEach((prop) => {
      let badge: { label: string; variant: "emerald" | "blue" | "rose" | "amber" | "slate" | "navy" } = {
        label: "Proposal Dikirim",
        variant: "blue",
      };
      if (prop.status === "ACCEPTED") badge = { label: "Proposal Diterima", variant: "emerald" as const };
      else if (prop.status === "REVISION_REQUESTED") badge = { label: "Perlu Revisi", variant: "rose" as const };
      else if (prop.status === "REJECTED") badge = { label: "Proposal Ditolak", variant: "slate" as const };
      else if (prop.status === "UNDER_REVIEW") badge = { label: "Dalam Peninjauan", variant: "blue" as const };

      list.push({
        id: `prop-${prop.id}`,
        type: "PROPOSAL",
        title: prop.title,
        organizationOrProgram: prop.companyName || "Perusahaan Sponsor",
        date: prop.reviewedAt || prop.createdAt,
        statusBadge: badge,
        icon: <FileText className="w-4 h-4 text-blue-600" />,
        targetMenu: "proposals",
      });
    });

    // Collaborations
    collaborations.forEach((collab) => {
      const badge =
        collab.status === "AGREED"
          ? { label: "MoU Disepakati", variant: "emerald" as const }
          : collab.status === "NEGOTIATION"
            ? { label: "Tahap Negosiasi MoU", variant: "amber" as const }
            : { label: "Kolaborasi Dibatalkan", variant: "slate" as const };

      list.push({
        id: `collab-${collab.id}`,
        type: "COLLABORATION",
        title: collab.opportunityTitle || collab.proposalTitle || "Kerja Sama CSR",
        organizationOrProgram: collab.companyName || "Perusahaan Sponsor",
        date: collab.agreedAt || collab.updatedAt || collab.createdAt,
        statusBadge: badge,
        icon: <HeartHandshake className="w-4 h-4 text-emerald-600" />,
        targetMenu: "collaborations",
      });
    });

    // Program Reports
    programs
      .filter((p) => p.lastReportDate && p.lastReportStatus)
      .forEach((prog) => {
        let badge: { label: string; variant: "emerald" | "blue" | "rose" | "amber" | "slate" | "navy" } = {
          label: "Laporan Dikirim",
          variant: "blue",
        };
        if (prog.lastReportStatus === "VERIFIED") badge = { label: "Laporan Diverifikasi", variant: "emerald" as const };
        else if (prog.lastReportStatus === "REVISION_REQUESTED") badge = { label: "Laporan Perlu Revisi", variant: "rose" as const };

        list.push({
          id: `prog-report-${prog.id}`,
          type: "REPORT",
          title: `Laporan Progres: ${prog.title}`,
          organizationOrProgram: `Program Lapangan (${prog.companyName || "Mitra"})`,
          date: prog.lastReportDate!,
          statusBadge: badge,
          icon: <Activity className="w-4 h-4 text-purple-600" />,
          targetMenu: "programs",
        });
      });

    return list
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [invitations, proposals, collaborations, programs]);

  const partnerFocus = partner ? FOCUS_AREA_CONFIG[partner.focusArea] : null;

  // Standardized SIPENA Dynamic Breadcrumbs for Partner Dashboard
  const headerBreadcrumbs: BreadcrumbItem[] = useMemo(() => {
    if (selectedOppForProposal) {
      return [
        {
          label: "Dashboard",
          onClick: () => {
            setSelectedOppForProposal(null);
            setSelectedOppForDetail(null);
            setActiveMenu("overview");
          },
        },
        {
          label: "Eksplorasi Peluang",
          onClick: () => {
            setSelectedOppForProposal(null);
            setSelectedOppForDetail(null);
          },
        },
        ...(selectedOppForDetail
          ? [
              {
                label: "Detail Peluang",
                onClick: () => setSelectedOppForProposal(null),
              },
            ]
          : []),
        { label: "Ajukan Proposal CSR" },
      ];
    }
    if (selectedOppForDetail) {
      return [
        {
          label: "Dashboard",
          onClick: () => {
            setSelectedOppForDetail(null);
            setActiveMenu("overview");
          },
        },
        {
          label: "Eksplorasi Peluang",
          onClick: () => setSelectedOppForDetail(null),
        },
        { label: "Detail Peluang" },
      ];
    }
    if (activeMenu === "chat") {
      return [
        { label: "Dashboard", onClick: () => setActiveMenu("overview") },
        { label: "AI CSR Advisor" },
      ];
    }
    if (activeMenu === "explore" && selectedCompanyForDetail) {
      return [
        { label: "Dashboard", onClick: () => { setSelectedCompanyForDetail(null); setActiveMenu("overview"); } },
        { label: "Eksplorasi Peluang", onClick: () => setSelectedCompanyForDetail(null) },
        { label: selectedCompanyForDetail.name },
      ];
    }
    if (activeMenu === "explore") {
      return [
        { label: "Dashboard", onClick: () => setActiveMenu("overview") },
        { label: "Eksplorasi Peluang" },
      ];
    }
    if (activeMenu === "invitations") {
      return [
        { label: "Dashboard", onClick: () => setActiveMenu("overview") },
        { label: "Undangan Masuk" },
      ];
    }
    if (activeMenu === "proposals") {
      return [
        { label: "Dashboard", onClick: () => setActiveMenu("overview") },
        { label: "Proposal Saya" },
      ];
    }
    if (activeMenu === "collaborations") {
      return [
        { label: "Dashboard", onClick: () => setActiveMenu("overview") },
        { label: "Kolaborasi Aktif" },
      ];
    }
    if (activeMenu === "conversations") {
      return [
        { label: "Dashboard", onClick: () => setActiveMenu("overview") },
        { label: "Pesan & Negosiasi" },
      ];
    }
    if (activeMenu === "programs") {
      if (selectedProgramForDetail) {
        return [
          { label: "Dashboard", onClick: () => { setSelectedProgramForDetail(null); setActiveMenu("overview"); } },
          { label: "Pelaksanaan Program", onClick: () => setSelectedProgramForDetail(null) },
          { label: selectedProgramForDetail.title },
        ];
      }
      return [
        { label: "Dashboard", onClick: () => setActiveMenu("overview") },
        { label: "Pelaksanaan Program" },
      ];
    }
    if (activeMenu === "analytics") {
      return [
        { label: "Dashboard", onClick: () => setActiveMenu("overview") },
        { label: "Laporan & Dampak ESG" },
      ];
    }
    if (activeMenu === "profile") {
      return [
        { label: "Dashboard", onClick: () => setActiveMenu("overview") },
        { label: "Profil Lembaga" },
      ];
    }
    return [{ label: "Dashboard" }, { label: "Ringkasan Aktivitas" }];
  }, [activeMenu, selectedCompanyForDetail, selectedOppForProposal, selectedOppForDetail, selectedProgramForDetail]);

  // Standardized SIPENA Right Action for Partner Dashboard Header
  const headerRightAction = (
    <div className="flex items-center gap-2">
      {/* Subtle Aligned Refresh Button */}
      <button
        type="button"
        onClick={handleRefreshAll}
        className="p-2 rounded-xl border border-[#E8E8EA] bg-white hover:bg-[#F4F4F6] text-[#787680] hover:text-[#181343] transition-colors cursor-pointer shadow-2xs"
        title="Segarkan data workspace"
      >
        <RefreshCw
          className={`w-4 h-4 ${isLoadingOpportunities || isLoadingProposals || isLoadingCollaborations || isLoadingPrograms
              ? "animate-spin text-emerald-600"
              : ""
            }`}
        />
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans ${activeMenu === "chat" ? "lg:h-screen lg:overflow-hidden" : ""}`}>
      {/* 1. Sidebar */}
      <PartnerSidebar
        user={currentUser}
        organizationName={partner?.name}
        activeMenu={activeMenu}
        onSelectMenu={(menu) => handleSelectMenu(menu)}
        counts={{
          invitations: pendingInvitations.length,
          proposals: proposals.length,
          programs: inProgressPrograms.length || programs.length,
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
        onOpenProfile={() => setIsUserProfileModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 lg:pl-64 ${activeMenu === "chat" ? "h-screen overflow-hidden" : ""}`}>
        {/* Top Header - Standardized SIPENA DashboardHeader */}
        <DashboardHeader
          user={currentUser}
          onOpenProfile={() => setIsUserProfileModalOpen(true)}
          onLogout={handleLogout}
          breadcrumbs={headerBreadcrumbs}
          title={
            selectedOppForProposal
              ? "Ajukan Proposal CSR" :
            selectedOppForDetail
              ? "Detail Peluang CSR" :
            activeMenu === "programs" && selectedProgramForDetail
              ? "Monitoring Pelaksanaan Program" :
            activeMenu === "chat"
              ? "AI CSR Advisor"
              : activeMenu === "explore"
                ? "Eksplorasi Peluang CSR"
                : activeMenu === "invitations"
                  ? "Undangan Masuk"
                  : activeMenu === "proposals"
                    ? "Pengajuan Proposal"
                    : activeMenu === "collaborations"
                      ? "Kolaborasi & Kontrak MoU"
                      : activeMenu === "conversations"
                        ? "Pesan & Negosiasi"
                        : activeMenu === "programs"
                          ? "Pelaksanaan Program & Monitoring"
                          : activeMenu === "analytics"
                            ? "Laporan & Dampak ESG"
                            : activeMenu === "profile"
                              ? "Profil Lembaga"
                              : "Ringkasan Aktivitas"
          }
          subtitle={
            activeMenu === "programs" && selectedProgramForDetail
              ? `Detail pelaporan lapangan, keuangan, dan evaluasi: ${selectedProgramForDetail.title}`
              : undefined
          }
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          rightAction={headerRightAction}
          onNavigateMenu={handleSelectMenu}
          organizationName={partner?.name}
        />

        {/* Dynamic Subviews Content */}
        <main className={`w-full mx-auto ${activeMenu === "chat" ? "p-3 sm:p-4 lg:p-5 max-w-[1150px] flex-1 flex flex-col min-h-0 overflow-hidden" : "p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl"}`}>
          {selectedOppForProposal ? (
            <SubmitProposalPageView
              opportunity={selectedOppForProposal}
              onBack={() => setSelectedOppForProposal(null)}
              onSuccess={() => {
                setSelectedOppForProposal(null);
                setSelectedOppForDetail(null);
                fetchProposals();
                fetchInvitations();
                fetchOpportunities();
                setActiveMenu("proposals");
              }}
            />
          ) : selectedOppForDetail ? (
            <PartnerOpportunityDetailPageView
              opportunity={selectedOppForDetail}
              existingProposal={proposals.find(
                (p) => p.opportunityId === selectedOppForDetail.id && p.status !== "WITHDRAWN"
              )}
              partnerStatus={partner?.status}
              onBack={() => setSelectedOppForDetail(null)}
              onApply={(opp) => setSelectedOppForProposal(opp)}
              onViewProposal={(prop) => {
                setSelectedOppForDetail(null);
                setSelectedProposalForDetail(prop);
              }}
              onViewCompany={(companyId) => handleViewCompanyDetail(companyId)}
            />
          ) : (
            <>
          {/* ========================================================================= */}
          {/* SUBVIEW 1: OVERVIEW (RINGKASAN OPERASIONAL & KOLABORASI) */}
          {/* ========================================================================= */}
          {activeMenu === "overview" && (
            <div className="space-y-6 w-full animate-in fade-in duration-300">
              {/* ========================================================================= */}
              {/* SECTION 1: HEADER HALAMAN (Bersih, Tenang & Elegan) */}
              {/* ========================================================================= */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
                <div className="space-y-1">
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Ringkasan Aktivitas Lembaga
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Selamat datang kembali, {partner?.name || user.name}. Kelola kolaborasi dan pantau pelaksanaan program CSR.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveMenu("explore")}
                    className="bg-[#009E75] hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    leftIcon={<Compass className="w-3.5 h-3.5" />}
                  >
                    Eksplorasi Peluang CSR
                  </Button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION 2: 4 INDIKATOR KUNCI UTAMA (Non-Overlapping & Terarah)            */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {/* KPI 1: Peluang CSR Terbuka */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveMenu("explore")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveMenu("explore");
                    }
                  }}
                  className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#181343]/30 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600">Peluang CSR Terbuka</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-500 group-hover:text-emerald-700 border border-slate-200/80 group-hover:border-emerald-200 flex items-center justify-center transition-colors">
                      <Compass className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className="text-3xl font-extrabold text-[#181343] tracking-tight tabular-nums">
                      {latestOpenOpportunities.length || opportunities.length}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block font-medium">
                      Inisiatif siap diajukan
                    </span>
                  </div>
                </div>

                {/* KPI 2: Pipeline Pengajuan (Proposal & Undangan) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveMenu(proposals.length > 0 ? "proposals" : "invitations")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveMenu(proposals.length > 0 ? "proposals" : "invitations");
                    }
                  }}
                  className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#181343]/30 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600">Pipeline Pengajuan</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-700 border border-slate-200/80 group-hover:border-blue-200 flex items-center justify-center transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className="text-3xl font-extrabold text-[#181343] tracking-tight tabular-nums">
                      {proposals.length + pendingInvitations.length}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block font-medium truncate">
                      {proposals.length > 0
                        ? `${proposalStats.underReview} tinjauan • ${proposalStats.accepted} disetujui`
                        : pendingInvitations.length > 0
                          ? `${pendingInvitations.length} undangan menunggu respon`
                          : "Belum ada pengajuan aktif"}
                    </span>
                  </div>
                </div>

                {/* KPI 3: Program Kolaborasi (MoU Aktif) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveMenu("collaborations")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveMenu("collaborations");
                    }
                  }}
                  className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#181343]/30 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600">Program Kolaborasi</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-500 group-hover:text-emerald-700 border border-slate-200/80 group-hover:border-emerald-200 flex items-center justify-center transition-colors">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className="text-3xl font-extrabold text-[#181343] tracking-tight tabular-nums">
                      {agreedCollabs.length}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block font-medium">
                      {agreedCollabs.length > 0 ? "MoU resmi berjalan" : "Belum ada program aktif"}
                    </span>
                  </div>
                </div>

                {/* KPI 4: Penerima Manfaat Terdata */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveMenu("programs")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveMenu("programs");
                    }
                  }}
                  className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#181343]/30 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600">Penerima Manfaat</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-purple-50 text-slate-500 group-hover:text-purple-700 border border-slate-200/80 group-hover:border-purple-200 flex items-center justify-center transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className="text-3xl font-extrabold text-[#181343] tracking-tight tabular-nums">
                      {impactSummary.totalBeneficiaries > 0
                        ? impactSummary.totalBeneficiaries.toLocaleString("id-ID")
                        : "0"}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block font-medium">
                      {impactSummary.totalBeneficiaries > 0
                        ? "Warga / kelompok sasaran"
                        : "Tercatat di pelaporan"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION 3: DASHBOARD BI & ANALITIK KEMITRAAN (2 KARTU SIMETRIS & SEIMBANG)*/}
              {/* ========================================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Kartu BI 1: Realisasi Anggaran Program (Keuangan) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-[#181343]">
                        Realisasi Anggaran Program
                      </h3>
                      <p className="text-xs text-slate-500">
                        Perbandingan serapan dana lapangan terhadap komitmen MoU.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#009E75] tabular-nums bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                      {budgetAbsorptionRate}% Serapan
                    </span>
                  </div>

                  {/* Donut Gauge & Ringkasan Anggaran (Simetris & Terstruktur) */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 my-auto py-2">
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                        <circle cx="60" cy="60" r="46" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                        <circle
                          cx="60"
                          cy="60"
                          r="46"
                          stroke="#009E75"
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={`${(budgetAbsorptionRate / 100) * 289.026} 289.026`}
                          strokeDashoffset="0"
                          fill="none"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#181343] tabular-nums tracking-tight">
                          {budgetAbsorptionRate}%
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Terserap</span>
                      </div>
                    </div>

                    <div className="flex-1 w-full divide-y divide-slate-100">
                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#181343] shrink-0" />
                          <span>Total Pagu Komitmen</span>
                        </span>
                        <span className="font-bold text-[#181343] tabular-nums text-xs sm:text-sm">
                          {formatRupiah(totalProgramBudget)}
                        </span>
                      </div>

                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#009E75] shrink-0" />
                          <span>Dana Terealisasi</span>
                        </span>
                        <span className="font-bold text-[#009E75] tabular-nums text-xs sm:text-sm">
                          {formatRupiah(totalSpentBudget)}
                        </span>
                      </div>

                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                          <span>Sisa Alokasi Pagu</span>
                        </span>
                        <span className="font-semibold text-slate-700 tabular-nums text-xs sm:text-sm">
                          {formatRupiah(Math.max(0, totalProgramBudget - totalSpentBudget))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Progress Bar Serapan Dana */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Rasio Serapan Dana Lapangan</span>
                      <span className="font-semibold text-emerald-700 tabular-nums">
                        {budgetAbsorptionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#009E75] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, budgetAbsorptionRate)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Kartu BI 2: Pelaksanaan & Status Program (Operasional) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-[#181343]">
                        Pelaksanaan &amp; Status Program
                      </h3>
                      <p className="text-xs text-slate-500">
                        Progres rata-rata eksekusi dan proporsi status program kolaborasi.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {impactSummary.totalPrograms} Program Terdata
                    </span>
                  </div>

                  {/* Donut Gauge & Ringkasan Status Program (Symmetrical Twin to Card 1) */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 my-auto py-2">
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                        <circle cx="60" cy="60" r="46" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                        <circle
                          cx="60"
                          cy="60"
                          r="46"
                          stroke="#181343"
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={`${(impactSummary.averageProgress / 100) * 289.026} 289.026`}
                          strokeDashoffset="0"
                          fill="none"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#181343] tabular-nums tracking-tight">
                          {impactSummary.averageProgress}%
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Eksekusi</span>
                      </div>
                    </div>

                    <div className="flex-1 w-full divide-y divide-slate-100">
                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                          <span>Program Berjalan</span>
                        </span>
                        <span className="font-bold text-[#181343] tabular-nums text-xs sm:text-sm">
                          {inProgressPrograms.length || agreedCollabs.length} Program
                        </span>
                      </div>

                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                          <span>Tahap Persiapan</span>
                        </span>
                        <span className="font-bold text-amber-600 tabular-nums text-xs sm:text-sm">
                          {Math.max(0, agreedCollabs.length - inProgressPrograms.length)} Program
                        </span>
                      </div>

                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                          <span>Program Selesai</span>
                        </span>
                        <span className="font-bold text-emerald-600 tabular-nums text-xs sm:text-sm">
                          {impactSummary.completedCount} Program
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Progress Bar Pelaksanaan Program */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Rata-rata Pelaksanaan Program ({impactSummary.totalPrograms} Program)</span>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {impactSummary.averageProgress}% Selesai
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#181343] h-full rounded-full transition-all duration-500"
                        style={{ width: `${impactSummary.averageProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifikasi Kelengkapan Profil (Hanya ditampilkan jika profil belum lengkap) */}
              {isProfileIncomplete && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                        Lengkapi Profil Lembaga Anda
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Data profil dan legalitas yang lengkap meningkatkan kredibilitas lembaga di mata mitra perusahaan CSR.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveMenu("profile")}
                    className="text-xs font-semibold text-slate-700 hover:bg-white bg-white/80 border-slate-300 shrink-0 self-end sm:self-auto cursor-pointer"
                  >
                    Lengkapi Profil
                  </Button>
                </div>
              )}

              {/* Prioritas Tindak Lanjut jika ada */}
              {prioritizedActionItems.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <h2
                      className="text-base sm:text-lg font-bold text-[#181343]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Prioritas Tindak Lanjut
                    </h2>
                    <p className="text-xs text-slate-600">
                      Aktivitas yang membutuhkan perhatian atau revisi lembaga Anda.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-2.5">
                    {prioritizedActionItems.map((action) => (
                      <div
                        key={action.id}
                        className="p-3.5 sm:p-4 rounded-xl border border-[#E5E7EB] bg-slate-50/60 hover:bg-white hover:border-[#181343]/30 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 mt-0.5 text-slate-600 shadow-2xs">
                            {action.icon}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                                {action.title}
                              </span>
                              <Badge variant={action.badgeVariant} size="sm">
                                {action.badgeLabel}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                              {action.subtitle && <span className="truncate">{action.subtitle}</span>}
                              {action.subtitle && action.meta && <span>•</span>}
                              {action.meta && <span>{action.meta}</span>}
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={action.onClick}
                          className="self-end sm:self-center shrink-0 text-xs font-semibold bg-[#181343] hover:bg-[#26224C] text-white shadow-xs cursor-pointer"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          {action.buttonLabel}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SECTION 4: PELUANG CSR TERBARU (Katalog Terbuka Siap Diajukan) */}
              {/* ========================================================================= */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h2
                      className="text-base sm:text-lg font-bold text-[#181343]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Peluang CSR Terbaru
                    </h2>
                    <p className="text-xs text-slate-600">
                      Inisiatif CSR terbuka dari perusahaan yang siap diajukan proposal oleh lembaga Anda.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveMenu("explore")}
                    className="text-xs font-semibold text-[#009E75] hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Lihat Semua Peluang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {latestOpenOpportunities.length === 0 ? (
                  <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-6 space-y-2">
                    <Compass className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600">Saat ini belum ada peluang CSR terbuka baru.</p>
                  </div>
                ) : (
                  <div className={latestOpportunitiesGridClass}>
                    {latestOpenOpportunities.map((opp) => {
                      const existingProposal = proposals.find((p) => p.opportunityId === opp.id);
                      return (
                        <OpportunityCard
                          key={opp.id}
                          opp={opp}
                          existingProposal={existingProposal}
                          onSelectDetail={setSelectedOppForDetail}
                          onSelectProposal={setSelectedOppForProposal}
                          onSelectExistingProposal={setSelectedProposalForDetail}
                          onViewCompany={handleViewCompanyDetail}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* SECTION 5: AKTIVITAS KOLABORASI TERBARU (Jika Ada Riwayat Aktivitas) */}
              {/* ========================================================================= */}
              {recentCollaborationActivities.length > 0 && (
                <div className="space-y-3.5">
                  <div className="space-y-0.5">
                    <h2
                      className="text-base sm:text-lg font-bold text-[#181343]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Aktivitas Kolaborasi Terbaru
                    </h2>
                    <p className="text-xs text-slate-600">
                      Riwayat perkembangan kesepakatan dan pelaksanaan program kerja sama lembaga Anda.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs divide-y divide-[#E5E7EB] overflow-hidden">
                    {recentCollaborationActivities.map((act) => (
                      <div
                        key={act.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveMenu(act.targetMenu)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveMenu(act.targetMenu);
                          }
                        }}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-600 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors">
                            {act.icon}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs sm:text-sm font-semibold text-[#181343] truncate">
                              {act.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                              <span className="truncate">{act.organizationOrProgram}</span>
                              <span>•</span>
                              <span>{act.date ? formatDate(act.date) : "-"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <Badge variant={act.statusBadge.variant} size="sm">
                            {act.statusBadge.label}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

              {/* ========================================================================= */}
              {/* 1. Page Header: Eksplorasi Peluang CSR (Clean, Sederhana, Sejajar) */}
              {/* ========================================================================= */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Katalog Inisiatif
                    </span>
                  </div>

                  <h1
                    className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Eksplorasi Peluang CSR
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Temukan inisiatif CSR perusahaan yang terbuka dan ajukan proposal sesuai kapasitas lembaga Anda.
                  </p>
                </div>

                {/* Sisi Kanan: Ringkasan Inisiatif (Sederhana, Bersih & Tanpa Tombol Refresh Duplikat) */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E8EA] text-xs font-semibold text-[#181343] shadow-2xs flex items-center gap-1.5">
                    <span className="font-bold text-[#009E75]">{filteredOpportunities.length}</span>
                    <span>Peluang Ditemukan</span>
                  </div>
                </div>
              </div>

              {/* 2. Sederhanakan Filter: Search Bar Full Width & Dropdown Kategori + Lokasi */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
                {/* Search Bar Full Width */}
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787680] pointer-events-none" />
                  <input
                    type="text"
                    value={exploreSearch}
                    onChange={(e) => setExploreSearch(e.target.value)}
                    placeholder="Cari berdasarkan judul inisiatif, nama perusahaan, atau target kota..."
                    className="w-full bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#1A1C1D] placeholder:text-[#9A98A6] outline-none transition-colors focus:bg-white focus:border-[#181343]/40 focus:ring-2 focus:ring-[#181343]/8 shadow-2xs"
                  />
                  {exploreSearch && (
                    <button
                      type="button"
                      onClick={() => setExploreSearch("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    {/* Dropdown Bidang Fokus CSR */}
                    <div className="relative min-w-[200px] flex-1 sm:flex-none">
                      <select
                        value={exploreFocusFilter}
                        onChange={(e) => setExploreFocusFilter(e.target.value)}
                        className="w-full sm:w-auto min-w-[210px] h-10 text-xs rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] hover:bg-white font-semibold text-[#181343] px-3.5 outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/40 transition cursor-pointer shadow-2xs"
                      >
                        <option value="ALL">Semua Bidang Fokus CSR</option>
                        {csrFocusAreaEnum.map((focus) => {
                          const cfg = FOCUS_AREA_CONFIG[focus];
                          return (
                            <option key={focus} value={focus}>
                              {cfg?.label || focus}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Dropdown Lokasi Wilayah */}
                    {availableLocations.length > 0 && (
                      <div className="relative min-w-[180px] flex-1 sm:flex-none">
                        <select
                          value={exploreLocationFilter}
                          onChange={(e) => setExploreLocationFilter(e.target.value)}
                          className="w-full sm:w-auto min-w-[190px] h-10 text-xs rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] hover:bg-white font-semibold text-[#181343] px-3.5 outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/40 transition cursor-pointer shadow-2xs"
                        >
                          <option value="ALL">Semua Lokasi Sasaran</option>
                          {availableLocations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Tombol Reset jika filter aktif */}
                    {isAnyExploreFilterActive && (
                      <button
                        type="button"
                        onClick={handleResetExploreFilters}
                        className="h-10 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Reset semua filter"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  {/* Keterangan Status Filter Aktual */}
                  <div className="text-xs text-[#787680] font-medium self-start sm:self-center shrink-0">
                    Menampilkan <span className="font-bold text-[#181343]">{filteredOpportunities.length}</span> dari {opportunities.length} peluang
                  </div>
                </div>
              </div>

              {/* Opportunities Grid: Responsive, Proporsional & Hierarki Rapi */}
              {isLoadingOpportunities ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-teal-600" />
                  <p className="text-xs font-semibold">Memuat katalog peluang CSR...</p>
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-[#E8E8EA] p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] flex items-center justify-center text-[#787680] mx-auto">
                    <Compass className="w-6 h-6 text-[#787680]" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Peluang Ditemukan</h4>
                  <p className="text-xs text-[#787680] max-w-sm mx-auto">
                    Coba ubah kata kunci pencarian atau sesuaikan filter fokus kategori & lokasi untuk melihat seluruh inisiatif terbuka.
                  </p>
                  {isAnyExploreFilterActive && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetExploreFilters}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      className="mt-2 text-xs font-semibold text-slate-700"
                    >
                      Reset Semua Filter
                    </Button>
                  )}
                </div>
              ) : (
                <div className={exploreGridClass}>
                  {filteredOpportunities.map((opp) => {
                    const existingProposal = proposals.find((p) => p.opportunityId === opp.id);
                    return (
                      <OpportunityCard
                        key={opp.id}
                        opp={opp}
                        existingProposal={existingProposal}
                        onSelectDetail={setSelectedOppForDetail}
                        onSelectProposal={setSelectedOppForProposal}
                        onSelectExistingProposal={setSelectedProposalForDetail}
                        onViewCompany={handleViewCompanyDetail}
                      />
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
                <div className="space-y-1">
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Undangan Kolaborasi dari Perusahaan
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Perusahaan secara langsung mengundang yayasan/organisasi Anda untuk mengajukan proposal ke inisiatif mereka.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E8EA] text-xs font-semibold text-[#181343] shadow-2xs flex items-center gap-1.5">
                    <span>Total</span>
                    <span className="font-bold text-[#009E75]">{invitations.length}</span>
                    <span>Undangan</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshAll}
                    className="p-2.5 rounded-xl border border-[#E8E8EA] bg-white hover:bg-slate-50 text-[#787680] hover:text-[#181343] transition-colors cursor-pointer shadow-2xs"
                    title="Segarkan undangan"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingInvitations ? "animate-spin text-emerald-600" : ""}`} />
                  </button>
                </div>
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
                                className="text-xs font-semibold"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
                <div className="space-y-1">
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Daftar Proposal Inisiatif Saya
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Riwayat seluruh proposal yang diajukan beserta status peninjauan resmi dari perusahaan mitra.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#181343] hover:bg-[#26224C] text-white text-xs font-bold shadow-2xs"
                    leftIcon={<Compass className="w-3.5 h-3.5" />}
                    onClick={() => setActiveMenu("explore")}
                  >
                    Cari Peluang Baru
                  </Button>
                  <button
                    type="button"
                    onClick={handleRefreshAll}
                    className="p-2.5 rounded-xl border border-[#E8E8EA] bg-white hover:bg-slate-50 text-[#787680] hover:text-[#181343] transition-colors cursor-pointer shadow-2xs"
                    title="Segarkan proposal"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingProposals ? "animate-spin text-emerald-600" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {["ALL", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "ACCEPTED", "REJECTED", "WITHDRAWN"].map(
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
                        className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${isSelected
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
                    className="text-xs mt-2"
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
                            {prop.status === "REVISION_REQUESTED" && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                                Perlu Penyesuaian
                              </span>
                            )}
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
              {/* Header Kolaborasi Aktif */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
                <div className="space-y-1">
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Kolaborasi Aktif &amp; Kesepakatan MoU
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Daftar resmi kesepakatan program CSR yang disetujui bersama perusahaan sponsor.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleRefreshAll}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-xs"
                    title="Segarkan daftar kolaborasi"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCollaborations ? "animate-spin text-[#009E75]" : "text-slate-500"}`} />
                    <span>Segarkan</span>
                  </button>
                </div>
              </div>

              {/* Summary Metrics (4 Kartu Simetris Bersih) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-600 block">
                    Total Kolaborasi
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#181343] tracking-tight tabular-nums">
                    {collaborations.length}
                  </div>
                  <span className="text-[11px] text-slate-500 block">Kesepakatan tercatat</span>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-600 block">
                    Tahap Negosiasi
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-amber-700 tracking-tight tabular-nums">
                    {negotiatingCollabs.length}
                  </div>
                  <span className="text-[11px] text-slate-500 block">Finalisasi berkas legal &amp; RAB</span>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-600 block">
                    MoU Disahkan
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#009E75] tracking-tight tabular-nums">
                    {agreedCollabs.length}
                  </div>
                  <span className="text-[11px] text-slate-500 block">Siap dieksekusi di lapangan</span>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-600 block">
                    Komitmen Anggaran
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#181343] tracking-tight tabular-nums truncate">
                    {formatRupiah(totalAgreedCollabBudget)}
                  </div>
                  <span className="text-[11px] text-slate-500 block">Pagu definitif disetujui</span>
                </div>
              </div>

              {/* Filter & Pencarian */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={collabSearch}
                    onChange={(e) => setCollabSearch(e.target.value)}
                    placeholder="Cari berdasarkan nama perusahaan, inisiatif CSR, atau proposal..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:border-[#181343] focus:ring-1 focus:ring-[#181343] focus:outline-hidden transition bg-white"
                  />
                </div>

                {/* Filter Status Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
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
                        type="button"
                        onClick={() => setCollabStatusFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer text-xs ${
                          isSelected
                            ? "bg-[#181343] text-white shadow-2xs"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-[#E5E7EB]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daftar Kontrak Kolaborasi */}
              {isLoadingCollaborations ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-[#E5E7EB] p-8 space-y-3 shadow-xs">
                  <RefreshCw className="w-5 h-5 text-[#009E75] animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Memuat data kontrak kolaborasi...</p>
                </div>
              ) : filteredCollaborations.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-[#E5E7EB] p-8 space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 text-[#181343] border border-slate-200/80 flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {collaborations.length === 0
                        ? "Belum Ada Kontrak Kolaborasi Aktif"
                        : "Tidak Ada Kolaborasi yang Sesuai"}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {collaborations.length === 0
                        ? "Saat proposal inisiatif Anda disetujui oleh pihak perusahaan, usulan tersebut akan otomatis tercatat sebagai kontrak kolaborasi untuk difinalisasi MoU-nya."
                        : "Coba ubah kata kunci pencarian atau pilih filter status lainnya."}
                    </p>
                  </div>
                  {collaborations.length === 0 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveMenu("proposals")}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="font-semibold text-xs py-2 px-4 rounded-xl"
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
                      className="text-xs font-semibold rounded-xl"
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
                        className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-slate-300 transition-all space-y-4"
                      >
                        {/* Header: Profil Perusahaan Mitra + Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-[#E5E7EB] flex items-center justify-center font-bold text-[#181343] text-sm overflow-hidden shrink-0">
                              {collab.companyLogo ? (
                                <img
                                  src={collab.companyLogo}
                                  alt={collab.companyName || "Perusahaan"}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                (collab.companyName || "C").substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-[#181343] text-sm truncate">
                                  {collab.companyName || "Perusahaan Sponsor"}
                                </h4>
                                {collab.companyCity && (
                                  <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {collab.companyCity}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 block">
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

                        {/* Detail Inisiatif & Usulan Program */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                              Inisiatif CSR:
                            </span>
                            <span className="font-semibold text-slate-700 truncate">
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
                          <h3 className="text-base font-bold text-[#181343] leading-snug">
                            {collab.proposalTitle || "Program Kerjasama CSR"}
                          </h3>
                          {collab.proposalSummary && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {collab.proposalSummary}
                            </p>
                          )}
                        </div>

                        {/* Bar Parameter Kolaborasi (Bersih & Rapi) */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-wrap items-center justify-between gap-4 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-500 font-medium">Anggaran Disepakati</span>
                            <div className="text-sm font-bold text-[#009E75] tabular-nums">
                              {formatRupiah(collab.finalBudget || collab.proposedBudget)}
                            </div>
                            {collab.finalBudget && collab.proposedBudget && collab.finalBudget !== collab.proposedBudget && (
                              <span className="text-[10px] text-slate-400 block line-through">
                                Usulan: {formatRupiah(collab.proposedBudget)}
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-500 font-medium">Jadwal Pelaksanaan</span>
                            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {collab.startDate && collab.endDate
                                ? `${formatDate(collab.startDate)} s/d ${formatDate(collab.endDate)}`
                                : "Belum ditentukan"}
                            </div>
                          </div>

                          <div className="space-y-0.5 max-w-[180px]">
                            <span className="text-[11px] text-slate-500 font-medium">Penerima Manfaat</span>
                            <div className="text-xs font-semibold text-slate-800 truncate">
                              {collab.targetBeneficiaries || "-"}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-500 font-medium block">Dokumen MoU</span>
                            {collab.mouDocumentUrl ? (
                              <a
                                href={collab.mouDocumentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#009E75] hover:text-emerald-800 hover:underline"
                              >
                                <FileCheck2 className="w-3.5 h-3.5" />
                                <span>Lihat Berkas MoU</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                                <Clock className="w-3 h-3" />
                                <span>Menunggu Berkas</span>
                              </span>
                            )}
                          </div>

                          {/* Tombol Aksi */}
                          <div className="pt-2 sm:pt-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs font-semibold border-[#E5E7EB] hover:bg-white text-slate-700 rounded-xl"
                              onClick={() => {
                                setActiveCollaborationChatId(collab.id);
                                setActiveMenu("conversations");
                              }}
                              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                            >
                              Pesan
                            </Button>

                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              className="text-xs font-semibold bg-[#181343] hover:bg-[#26224C] text-white rounded-xl shadow-xs"
                              onClick={() => setSelectedCollabForDetail(collab)}
                              leftIcon={collab.status === "NEGOTIATION" ? <FileCheck2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            >
                              {collab.status === "NEGOTIATION"
                                ? "Tinjau Kesepakatan"
                                : collab.status === "AGREED"
                                  ? "Detail Kontrak"
                                  : "Lihat Catatan"}
                            </Button>
                          </div>
                        </div>

                        {/* Catatan Kesepakatan jika ada */}
                        {collab.notes && (
                          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-start gap-2">
                            <span className="font-semibold text-slate-800 shrink-0">Catatan:</span>
                            <span className="text-slate-700 line-clamp-2">{collab.notes}</span>
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
            selectedProgramForDetail ? (
              <PartnerProgramDetailPageView
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
              />
            ) : (
            <div className="space-y-5">
              {/* Page Header: Pelaksanaan Program & Monitoring */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
                <div className="space-y-1">
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Pelaksanaan Program &amp; Monitoring
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Pantau realisasi milestone lapangan, serapan dana, serta pelaporan akuntabilitas kegiatan.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleRefreshAll}
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
                      placeholder="Cari program, perusahaan mitra, inisiatif, atau lokasi..."
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

              {/* 3. Sederhanakan Kartu Program: Fokus pada Monitoring Aktivitas & Bukti Lapangan */}
              {isLoadingPrograms ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                  Memuat data program pelaksanaan...
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

                        {/* Title & Company Information */}
                        <div className="space-y-1">
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
                            variant="outline"
                            size="sm"
                            className="text-xs cursor-pointer self-end sm:self-auto"
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
                if (found) {
                  setSelectedProgramForDetail(found);
                  setActiveMenu("programs");
                }
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* SUBVIEW 6: PROFILE (PROFIL LEMBAGA) */}
          {/* ========================================================================= */}
          {activeMenu === "profile" && partner && (
            <PartnerFullProfileView
              partner={partner}
              programs={programs}
              collaborations={collaborations}
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

          {/* ========================================================================= */}
          {/* SUBVIEW: AI CHATBOT (FULL-SCREEN AI ADVISOR) */}
          {/* ========================================================================= */}
          {activeMenu === "chat" && (
            <ChatbotView
              role={user.role}
              userName={user.name}
              organizationName={partner?.name}
              onNavigate={(menu) => setActiveMenu(menu as PartnerNavMenu)}
            />
          )}
            </>
          )}
        </main>
      </div>

      {/* --- MODALS --- */}



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
