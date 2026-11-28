"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Inbox,
  FileText,
  Activity,
  Wallet,
  ArrowRight,
  Compass,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  MapPin,
  TrendingUp,
  Target,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Layers,
  Sprout,
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  HelpCircle,
  HeartHandshake,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PartnerNavMenu,
  PartnerProfile,
  OpportunityItem,
  ProposalItem,
  PartnerOpportunityInvitationItem,
  PartnerCollaborationItem,
  PartnerProgramItem,
} from "../types";
import {
  FOCUS_AREA_CONFIG,
  STATUS_CONFIG,
  PROPOSAL_STATUS_CONFIG,
  PROGRAM_STATUS_CONFIG,
  formatRupiah,
  formatDate,
  cleanProposalText,
} from "../helpers";
import { parseCollaborationPlan, PlanMilestoneItem } from "../../common/collaboration-plan";

interface PartnerOverviewViewProps {
  user: {
    id?: string;
    name: string;
    email?: string;
    role?: string;
  };
  partner: PartnerProfile | null;
  opportunities: OpportunityItem[];
  proposals: ProposalItem[];
  invitations: PartnerOpportunityInvitationItem[];
  collaborations: PartnerCollaborationItem[];
  programs: PartnerProgramItem[];
  onNavigateMenu: (menu: PartnerNavMenu) => void;
  onSelectOppDetail?: (opp: OpportunityItem) => void;
  onSelectProposalDetail?: (prop: ProposalItem) => void;
  onSelectProgramDetail?: (prog: PartnerProgramItem) => void;
  onSelectCollabDetail?: (collab: PartnerCollaborationItem) => void;
}

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Helper to format compact rupiah (e.g. Rp 65 Juta, Rp 1,5 Miliar)
function formatCompact(val: number): string {
  if (val >= 1_000_000_000) {
    const b = val / 1_000_000_000;
    return `Rp ${b % 1 === 0 ? b.toFixed(0) : b.toFixed(1).replace(".", ",")} Miliar`;
  }
  if (val >= 1_000_000) {
    const m = val / 1_000_000;
    return `Rp ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(".", ",")} Jt`;
  }
  if (val > 0) {
    return formatRupiah(val);
  }
  return "Rp 0";
}

function getFocusVisual(focusArea?: string | null) {
  switch (focusArea) {
    case "LINGKUNGAN":
    case "LINGKUNGAN_HIDUP":
      return {
        label: "Lingkungan & Alam",
        icon: Sprout,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        barGradient: "from-emerald-600 to-teal-500",
      };
    case "PENDIDIKAN":
      return {
        label: "Pendidikan",
        icon: GraduationCap,
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80",
        barGradient: "from-blue-600 to-cyan-500",
      };
    case "KESEHATAN":
      return {
        label: "Kesehatan",
        icon: HeartPulse,
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
        barGradient: "from-rose-600 to-pink-500",
      };
    case "PEMBERDAYAAN_EKONOMI":
      return {
        label: "Pemberdayaan Ekonomi",
        icon: TrendingUp,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
        barGradient: "from-amber-600 to-yellow-500",
      };
    case "INFRASTRUKTUR_SOSIAL":
      return {
        label: "Infrastruktur Sosial",
        icon: Building2,
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
        barGradient: "from-indigo-600 to-purple-500",
      };
    case "TANGGAP_BENCANA":
      return {
        label: "Tanggap Bencana",
        icon: ShieldAlert,
        badgeClass: "bg-orange-50 text-orange-700 border-orange-200/80",
        barGradient: "from-orange-600 to-amber-500",
      };
    default:
      return {
        label: "Inisiatif Umum",
        icon: Layers,
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200/80",
        barGradient: "from-slate-600 to-slate-500",
      };
  }
}

export function PartnerOverviewView({
  user,
  partner,
  opportunities,
  proposals,
  invitations,
  collaborations,
  programs,
  onNavigateMenu,
  onSelectOppDetail,
  onSelectProposalDetail,
  onSelectProgramDetail,
  onSelectCollabDetail,
}: PartnerOverviewViewProps) {
  // 1. Current Indonesian date string for hero banner
  const currentDateString = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  // 2. Computed KPI Metrics
  const pendingInvitations = useMemo(
    () => invitations.filter((i) => i.status === "INVITED"),
    [invitations]
  );

  const proposalStats = useMemo(() => {
    const total = proposals.length;
    const accepted = proposals.filter((p) => p.status === "ACCEPTED").length;
    const underReview = proposals.filter(
      (p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW"
    ).length;
    const revision = proposals.filter((p) => p.status === "REVISION_REQUESTED").length;
    const rejected = proposals.filter((p) => p.status === "REJECTED").length;
    return { total, accepted, underReview, revision, rejected };
  }, [proposals]);

  const inProgressPrograms = useMemo(
    () => programs.filter((p) => p.status === "IN_PROGRESS"),
    [programs]
  );

  const completedPrograms = useMemo(
    () => programs.filter((p) => p.status === "COMPLETED"),
    [programs]
  );

  const agreedCollabs = useMemo(
    () => collaborations.filter((c) => c.status === "AGREED"),
    [collaborations]
  );

  const totalProgramBudget = useMemo(() => {
    const fromPrograms = programs.reduce((acc, curr) => {
      const b = curr.budget ? parseFloat(curr.budget) : 0;
      return acc + (isNaN(b) ? 0 : b);
    }, 0);
    if (fromPrograms > 0) return fromPrograms;

    return agreedCollabs.reduce((acc, curr) => {
      const b = curr.finalBudget ? parseFloat(curr.finalBudget) : 0;
      return acc + (isNaN(b) ? 0 : b);
    }, 0);
  }, [programs, agreedCollabs]);

  const totalSpentBudget = useMemo(() => {
    return programs.reduce((acc, curr) => {
      const s = curr.spentBudget ? parseFloat(curr.spentBudget) : 0;
      return acc + (isNaN(s) ? 0 : s);
    }, 0);
  }, [programs]);

  const budgetAbsorptionRate = useMemo(() => {
    if (totalProgramBudget <= 0) return 0;
    return Math.round((totalSpentBudget / totalProgramBudget) * 1000) / 10;
  }, [totalProgramBudget, totalSpentBudget]);

  // 3. Smart To-Do List state & dynamic items
  const [todoTab, setTodoTab] = useState<"pending" | "completed">("pending");

  // Dynamic real agenda items
  const { pendingAgenda, completedAgenda } = useMemo(() => {
    const pendingList: Array<{
      id: string;
      title: string;
      programOrCompany: string;
      category: string;
      deadline?: string | null;
      urgency: "amber" | "rose" | "blue";
      urgencyLabel?: string;
      icon: typeof Inbox;
      actionLabel: string;
      onAction: () => void;
    }> = [];

    const completedList: Array<{
      id: string;
      title: string;
      programOrCompany: string;
      category: string;
      completedAt: string;
      icon: typeof CheckCircle2;
      actionLabel: string;
      onAction: () => void;
    }> = [];

    const now = Date.now();
    const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

    // A. Pending Invitations
    invitations.forEach((inv) => {
      if (inv.status === "INVITED") {
        const isPastDeadline = inv.responseDeadline
          ? new Date(inv.responseDeadline).getTime() < now
          : false;
        pendingList.push({
          id: `inv-${inv.id}`,
          title: `Tanggapi Undangan Kolaborasi: ${inv.opportunityTitle || "Peluang CSR"}`,
          programOrCompany: inv.companyName || "Perusahaan Mitra",
          category: "Undangan Kolaborasi",
          deadline: inv.responseDeadline || null,
          urgency: isPastDeadline ? "rose" : "amber",
          urgencyLabel: isPastDeadline ? "Tenggat Terlewat" : "Menunggu Tanggapan",
          icon: Inbox,
          actionLabel: "Tanggapi Undangan",
          onAction: () => onNavigateMenu("invitations"),
        });
      } else if (inv.status === "ACCEPTED") {
        completedList.push({
          id: `inv-done-${inv.id}`,
          title: `Undangan Diterima: ${inv.opportunityTitle || "Peluang CSR"}`,
          programOrCompany: inv.companyName || "Perusahaan Mitra",
          category: "Undangan Kolaborasi",
          completedAt: inv.updatedAt || inv.createdAt,
          icon: CheckCircle2,
          actionLabel: "Lihat Undangan",
          onAction: () => onNavigateMenu("invitations"),
        });
      }
    });

    // B. Proposals
    proposals.forEach((prop) => {
      if (prop.status === "REVISION_REQUESTED") {
        pendingList.push({
          id: `prop-rev-${prop.id}`,
          title: `Perbarui Proposal Revisi: "${prop.title}"`,
          programOrCompany: prop.companyName || "Perusahaan Sponsor",
          category: "Proposal Program",
          deadline: null,
          urgency: "rose",
          urgencyLabel: "Perlu Revisi",
          icon: FileText,
          actionLabel: "Perbaiki Proposal",
          onAction: () => {
            if (onSelectProposalDetail) {
              onSelectProposalDetail(prop);
            }
            onNavigateMenu("proposals");
          },
        });
      } else if (prop.status === "ACCEPTED") {
        completedList.push({
          id: `prop-done-${prop.id}`,
          title: `Proposal Disetujui: "${prop.title}"`,
          programOrCompany: prop.companyName || "Perusahaan Sponsor",
          category: "Proposal Program",
          completedAt: prop.reviewedAt || prop.createdAt,
          icon: CheckCircle2,
          actionLabel: "Lihat Proposal",
          onAction: () => {
            if (onSelectProposalDetail) {
              onSelectProposalDetail(prop);
            }
            onNavigateMenu("proposals");
          },
        });
      }
    });

    // C. Collaborations (MoU)
    collaborations.forEach((collab) => {
      if (collab.status === "NEGOTIATION") {
        pendingList.push({
          id: `collab-nego-${collab.id}`,
          title: `Tinjau Kesepakatan & MoU: ${collab.opportunityTitle || "Kerja Sama CSR"}`,
          programOrCompany: collab.companyName || "Perusahaan Mitra",
          category: "Kesepakatan MoU",
          deadline: null,
          urgency: "amber",
          icon: HeartHandshake,
          actionLabel: "Tinjau MoU",
          onAction: () => {
            if (onSelectCollabDetail) {
              onSelectCollabDetail(collab);
            }
            onNavigateMenu("collaborations");
          },
        });
      } else if (collab.status === "AGREED") {
        completedList.push({
          id: `collab-done-${collab.id}`,
          title: `MoU Ditandatangani: ${collab.opportunityTitle || "Kerja Sama CSR"}`,
          programOrCompany: collab.companyName || "Perusahaan Mitra",
          category: "Kesepakatan MoU",
          completedAt: collab.agreedAt || collab.updatedAt || collab.createdAt,
          icon: CheckCircle2,
          actionLabel: "Lihat Kesepakatan",
          onAction: () => {
            if (onSelectCollabDetail) {
              onSelectCollabDetail(collab);
            }
            onNavigateMenu("collaborations");
          },
        });
      }
    });

    // D. Programs Execution & Reports
    programs.forEach((prog) => {
      // 1. Revision requested on report
      if (
        prog.lastReportStatus === "REVISION_REQUESTED" ||
        (prog.revisionRequestedReportsCount && prog.revisionRequestedReportsCount > 0)
      ) {
        pendingList.push({
          id: `prog-rep-rev-${prog.id}`,
          title: `Perbaiki Laporan Pelaksanaan: "${prog.title}"`,
          programOrCompany: prog.companyName || "Perusahaan Sponsor",
          category: "Laporan Kegiatan",
          deadline: null,
          urgency: "rose",
          urgencyLabel: "Perlu Revisi Laporan",
          icon: AlertCircle,
          actionLabel: "Perbaiki Laporan",
          onAction: () => {
            if (onSelectProgramDetail) {
              onSelectProgramDetail(prog);
            }
            onNavigateMenu("programs");
          },
        });
      }

      // 2. In-progress program approaching deadline
      if (prog.status === "IN_PROGRESS" && prog.endDate) {
        const endTime = new Date(prog.endDate).getTime();
        const diff = endTime - now;
        if (diff > 0 && diff <= FOURTEEN_DAYS_MS) {
          pendingList.push({
            id: `prog-deadline-${prog.id}`,
            title: `Tenggat Waktu Kegiatan Lapangan: "${prog.title}"`,
            programOrCompany: prog.companyName || "Perusahaan Sponsor",
            category: "Pelaksanaan Program",
            deadline: prog.endDate,
            urgency: "amber",
            urgencyLabel: "Mendekati Batas",
            icon: Clock,
            actionLabel: "Lihat Kegiatan",
            onAction: () => {
              if (onSelectProgramDetail) {
                onSelectProgramDetail(prog);
              }
              onNavigateMenu("programs");
            },
          });
        }
      }

      // 3. In-progress program needing report upload
      if (
        prog.status === "IN_PROGRESS" &&
        (!prog.lastReportDate || prog.lastReportStatus === "DRAFT")
      ) {
        pendingList.push({
          id: `prog-rep-needed-${prog.id}`,
          title: `Unggah Laporan Progres Kegiatan: "${prog.title}"`,
          programOrCompany: prog.companyName || "Perusahaan Sponsor",
          category: "Laporan Kegiatan",
          deadline: null,
          urgency: "blue",
          urgencyLabel: "Tugas Pelaporan",
          icon: Activity,
          actionLabel: "Unggah Laporan",
          onAction: () => {
            if (onSelectProgramDetail) {
              onSelectProgramDetail(prog);
            }
            onNavigateMenu("programs");
          },
        });
      }

      // 4. Verified report or completed program
      if (prog.lastReportStatus === "VERIFIED") {
        completedList.push({
          id: `prog-rep-verified-${prog.id}`,
          title: `Laporan Diverifikasi: "${prog.title}"`,
          programOrCompany: prog.companyName || "Perusahaan Sponsor",
          category: "Laporan Kegiatan",
          completedAt: prog.lastReportDate || prog.updatedAt || prog.createdAt,
          icon: CheckCircle2,
          actionLabel: "Lihat Detail",
          onAction: () => {
            if (onSelectProgramDetail) {
              onSelectProgramDetail(prog);
            }
            onNavigateMenu("programs");
          },
        });
      }

      if (prog.status === "COMPLETED") {
        completedList.push({
          id: `prog-done-${prog.id}`,
          title: `Program Berhasil Diselesaikan: "${prog.title}"`,
          programOrCompany: prog.companyName || "Perusahaan Sponsor",
          category: "Pelaksanaan Program",
          completedAt: prog.endDate || prog.updatedAt || prog.createdAt,
          icon: CheckCircle2,
          actionLabel: "Lihat Program",
          onAction: () => {
            if (onSelectProgramDetail) {
              onSelectProgramDetail(prog);
            }
            onNavigateMenu("programs");
          },
        });
      }
    });

    return {
      pendingAgenda: pendingList,
      completedAgenda: completedList,
    };
  }, [
    invitations,
    proposals,
    collaborations,
    programs,
    onNavigateMenu,
    onSelectProposalDetail,
    onSelectCollabDetail,
    onSelectProgramDetail,
  ]);

  // 4. Interactive Monthly Calendar State & Computations
  const today = useMemo(() => new Date(), []);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth(); // 0-indexed

  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

    const days: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      dots: {
        blue: boolean; // Program milestone
        amber: boolean; // Invitation/proposal deadline
        green: boolean; // Disbursement/verified report
        red: boolean; // Overdue deadline
      };
    }> = [];

    const nowTime = today.getTime();

    // Map all relevant events to date strings YYYY-MM-DD
    const eventsMap: Record<
      string,
      { blue: boolean; amber: boolean; green: boolean; red: boolean }
    > = {};

    const addEventDot = (
      dateStr: string | null | undefined,
      color: "blue" | "amber" | "green" | "red"
    ) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      if (!eventsMap[key]) {
        eventsMap[key] = { blue: false, amber: false, green: false, red: false };
      }
      eventsMap[key][color] = true;
    };

    // Invitations deadlines
    invitations.forEach((inv) => {
      if (inv.responseDeadline) {
        const isPast = new Date(inv.responseDeadline).getTime() < nowTime;
        addEventDot(inv.responseDeadline, isPast ? "red" : "amber");
      }
    });

    // Program start / end / milestones
    programs.forEach((prog) => {
      if (prog.startDate) addEventDot(prog.startDate, "blue");
      if (prog.endDate) {
        const isPast =
          prog.status !== "COMPLETED" && new Date(prog.endDate).getTime() < nowTime;
        addEventDot(prog.endDate, isPast ? "red" : "blue");
      }
      if (prog.lastReportDate && prog.lastReportStatus === "VERIFIED") {
        addEventDot(prog.lastReportDate, "green");
      }
      if (prog.nextActivityDate) {
        addEventDot(prog.nextActivityDate, "blue");
      }
    });

    // Collaborations agreed dates
    collaborations.forEach((collab) => {
      if (collab.agreedAt) addEventDot(collab.agreedAt, "green");
      if (collab.startDate) addEventDot(collab.startDate, "blue");
      if (collab.endDate) addEventDot(collab.endDate, "blue");
    });

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = new Date(calYear, calMonth - 1, prevMonthDays - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      days.push({
        date: d,
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        dots: eventsMap[key] || { blue: false, amber: false, green: false, red: false },
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(calYear, calMonth, i);
      const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(i).padStart(
        2,
        "0"
      )}`;
      const isToday =
        today.getFullYear() === calYear &&
        today.getMonth() === calMonth &&
        today.getDate() === i;
      const isSelected =
        selectedCalendarDate.getFullYear() === calYear &&
        selectedCalendarDate.getMonth() === calMonth &&
        selectedCalendarDate.getDate() === i;

      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isToday,
        isSelected,
        dots: eventsMap[key] || { blue: false, amber: false, green: false, red: false },
      });
    }

    // Next month padding (complete 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(calYear, calMonth + 1, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        dots: eventsMap[key] || { blue: false, amber: false, green: false, red: false },
      });
    }

    return days;
  }, [calYear, calMonth, today, selectedCalendarDate, invitations, programs, collaborations]);

  // Selected date events list
  const selectedDateEvents = useMemo(() => {
    const selYear = selectedCalendarDate.getFullYear();
    const selMonth = selectedCalendarDate.getMonth();
    const selDay = selectedCalendarDate.getDate();

    const matchesDate = (dateStr?: string | null) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return (
        d.getFullYear() === selYear &&
        d.getMonth() === selMonth &&
        d.getDate() === selDay
      );
    };

    const list: Array<{
      id: string;
      title: string;
      type: "program" | "deadline" | "finance" | "overdue";
      timeDesc: string;
      badgeLabel: string;
      badgeColor: string;
    }> = [];

    programs.forEach((p) => {
      if (matchesDate(p.startDate)) {
        list.push({
          id: `p-start-${p.id}`,
          title: `Awal Program: ${p.title}`,
          type: "program",
          timeDesc: "Jadwal Peluncuran Lapangan",
          badgeLabel: "Kick-off",
          badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        });
      }
      if (matchesDate(p.endDate)) {
        list.push({
          id: `p-end-${p.id}`,
          title: `Batas Akhir Program: ${p.title}`,
          type: "program",
          timeDesc: "Target Penyelesaian Program",
          badgeLabel: "Tenggat",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        });
      }
      if (matchesDate(p.nextActivityDate)) {
        list.push({
          id: `p-act-${p.id}`,
          title: `Milestone: ${p.nextActivityTitle || p.title}`,
          type: "program",
          timeDesc: "Kegiatan Mendatang",
          badgeLabel: "Milestone",
          badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
        });
      }
    });

    invitations.forEach((inv) => {
      if (matchesDate(inv.responseDeadline)) {
        list.push({
          id: `inv-dl-${inv.id}`,
          title: `Tenggat Undangan: ${inv.opportunityTitle || "Peluang CSR"}`,
          type: "deadline",
          timeDesc: `Dari ${inv.companyName || "Perusahaan Mitra"}`,
          badgeLabel: "Undangan",
          badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        });
      }
    });

    collaborations.forEach((collab) => {
      if (matchesDate(collab.agreedAt)) {
        list.push({
          id: `collab-agr-${collab.id}`,
          title: `MoU Disepakati: ${collab.opportunityTitle || "Kemitraan"}`,
          type: "finance",
          timeDesc: `Mitra ${collab.companyName || "Perusahaan"}`,
          badgeLabel: "MoU",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        });
      }
    });

    return list;
  }, [selectedCalendarDate, programs, invitations, collaborations]);

  // Nearest upcoming event if no events on selected date
  const nearestUpcomingEvent = useMemo(() => {
    const nowTime = today.getTime();
    const candidateList: Array<{
      date: Date;
      title: string;
      desc: string;
      badgeLabel: string;
    }> = [];

    invitations.forEach((inv) => {
      if (inv.responseDeadline && inv.status === "INVITED") {
        const d = new Date(inv.responseDeadline);
        if (d.getTime() >= nowTime) {
          candidateList.push({
            date: d,
            title: `Tenggat Respons Undangan: ${inv.opportunityTitle || "Peluang CSR"}`,
            desc: `Dari ${inv.companyName || "Perusahaan"}`,
            badgeLabel: "Undangan",
          });
        }
      }
    });

    programs.forEach((p) => {
      if (p.nextActivityDate) {
        const d = new Date(p.nextActivityDate);
        if (d.getTime() >= nowTime) {
          candidateList.push({
            date: d,
            title: `Milestone: ${p.nextActivityTitle || p.title}`,
            desc: `Program ${p.title}`,
            badgeLabel: "Milestone",
          });
        }
      } else if (p.endDate && p.status === "IN_PROGRESS") {
        const d = new Date(p.endDate);
        if (d.getTime() >= nowTime) {
          candidateList.push({
            date: d,
            title: `Tenggat Program: ${p.title}`,
            desc: `Penyelesaian seluruh milestone lapangan`,
            badgeLabel: "Program",
          });
        }
      }
    });

    candidateList.sort((a, b) => a.date.getTime() - b.date.getTime());
    return candidateList[0] || null;
  }, [today, invitations, programs]);

  // Tabbed deep-dive section for Partner (Roadmap, Program & Aktivitas, Pencairan & Realisasi)
  const tabSectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"roadmap" | "programs" | "finance">("roadmap");

  // 5. Program Roadmap & Milestone Selected Program State
  const activeProgramList = useMemo(() => {
    return programs.length > 0 ? programs : [];
  }, [programs]);

  const [selectedRoadmapProgramId, setSelectedRoadmapProgramId] = useState<string>(
    activeProgramList[0]?.id || ""
  );

  const selectedRoadmapProgram = useMemo(() => {
    if (!selectedRoadmapProgramId && activeProgramList.length > 0) {
      return activeProgramList[0];
    }
    return (
      activeProgramList.find((p) => p.id === selectedRoadmapProgramId) ||
      activeProgramList[0] ||
      null
    );
  }, [activeProgramList, selectedRoadmapProgramId]);

  // Compute 5-stage status for selected roadmap program
  const roadmapStages = useMemo(() => {
    if (!selectedRoadmapProgram) {
      return [
        {
          num: 1,
          name: "Pengajuan Proposal",
          desc: "Proposal diajukan & disetujui",
          status: "pending" as const,
        },
        {
          num: 2,
          name: "Kesepakatan Kerja Sama",
          desc: "MoU resmi ditandatangani",
          status: "pending" as const,
        },
        {
          num: 3,
          name: "Pelaksanaan Program",
          desc: "Eksekusi milestone lapangan",
          status: "pending" as const,
        },
        {
          num: 4,
          name: "Pelaporan Akhir",
          desc: "Laporan pertanggungjawaban",
          status: "pending" as const,
        },
        {
          num: 5,
          name: "Evaluasi & Selesai",
          desc: "Penutupan resmi kemitraan",
          status: "pending" as const,
        },
      ];
    }

    const progStatus = selectedRoadmapProgram.status;
    const progress = selectedRoadmapProgram.activityProgressPercent ?? 0;

    if (progStatus === "COMPLETED") {
      return [
        {
          num: 1,
          name: "Pengajuan Proposal",
          desc: "Disetujui perusahaan",
          status: "completed" as const,
        },
        {
          num: 2,
          name: "Kesepakatan Kerja Sama",
          desc: "MoU aktif & disahkan",
          status: "completed" as const,
        },
        {
          num: 3,
          name: "Pelaksanaan Program",
          desc: "100% milestone terlaksana",
          status: "completed" as const,
        },
        {
          num: 4,
          name: "Pelaporan Akhir",
          desc: "Laporan terverifikasi",
          status: "completed" as const,
        },
        {
          num: 5,
          name: "Evaluasi & Selesai",
          desc: "Dampak sosial tercatat resmi",
          status: "completed" as const,
        },
      ];
    }

    if (progStatus === "IN_PROGRESS") {
      const isNearCompletion = progress >= 85;
      return [
        {
          num: 1,
          name: "Pengajuan Proposal",
          desc: "Disetujui perusahaan",
          status: "completed" as const,
        },
        {
          num: 2,
          name: "Kesepakatan Kerja Sama",
          desc: "MoU aktif & disahkan",
          status: "completed" as const,
        },
        {
          num: 3,
          name: "Pelaksanaan Program",
          desc: `${progress}% milestone tercapai`,
          status: isNearCompletion ? "completed" as const : "active" as const,
        },
        {
          num: 4,
          name: "Pelaporan Akhir",
          desc: isNearCompletion
            ? "Tahap penyusunan laporan"
            : "Menunggu selesainya kegiatan",
          status: isNearCompletion ? "active" as const : "pending" as const,
        },
        {
          num: 5,
          name: "Evaluasi & Selesai",
          desc: "Verifikasi dampak akhir",
          status: "pending" as const,
        },
      ];
    }

    // Default planned
    return [
      {
        num: 1,
        name: "Pengajuan Proposal",
        desc: "Disetujui perusahaan",
        status: "completed" as const,
      },
      {
        num: 2,
        name: "Kesepakatan Kerja Sama",
        desc: "MoU aktif & disahkan",
        status: "completed" as const,
      },
      {
        num: 3,
        name: "Pelaksanaan Program",
        desc: "Tahap persiapan awal",
        status: "active" as const,
      },
      {
        num: 4,
        name: "Pelaporan Akhir",
        desc: "Laporan pertanggungjawaban",
        status: "pending" as const,
      },
      {
        num: 5,
        name: "Evaluasi & Selesai",
        desc: "Penutupan kemitraan",
        status: "pending" as const,
      },
    ];
  }, [selectedRoadmapProgram]);

  // 6. Chronological Recent Activities (for Row 5 right panel)
  const recentActivities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      date: string;
      icon: typeof Inbox;
      iconBg: string;
      iconColor: string;
      statusBadge: {
        label: string;
        className: string;
      };
      onClick: () => void;
    }> = [];

    // Invitations
    invitations.forEach((inv) => {
      const isAccepted = inv.status === "ACCEPTED";
      const isDeclined = inv.status === "DECLINED";
      list.push({
        id: `act-inv-${inv.id}`,
        title: inv.opportunityTitle || "Undangan Kolaborasi CSR",
        subtitle: inv.companyName || "Perusahaan Mitra",
        date: inv.updatedAt || inv.createdAt,
        icon: Inbox,
        iconBg: "bg-blue-50 border-blue-200/80",
        iconColor: "text-blue-600",
        statusBadge: isAccepted
          ? { label: "Undangan Diterima", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
          : isDeclined
            ? { label: "Undangan Ditolak", className: "bg-slate-50 text-slate-600 border-slate-200" }
            : { label: "Menunggu Respons", className: "bg-amber-50 text-amber-700 border-amber-200" },
        onClick: () => onNavigateMenu("invitations"),
      });
    });

    // Proposals
    proposals.forEach((prop) => {
      let badge = { label: "Diajukan", className: "bg-blue-50 text-blue-700 border-blue-200" };
      if (prop.status === "ACCEPTED") {
        badge = { label: "Disetujui", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      } else if (prop.status === "REVISION_REQUESTED") {
        badge = { label: "Perlu Revisi", className: "bg-rose-50 text-rose-700 border-rose-200" };
      } else if (prop.status === "REJECTED") {
        badge = { label: "Ditolak", className: "bg-slate-50 text-slate-600 border-slate-200" };
      }
      list.push({
        id: `act-prop-${prop.id}`,
        title: prop.title,
        subtitle: `Proposal untuk ${prop.companyName || "Perusahaan Sponsor"}`,
        date: prop.reviewedAt || (prop as { updatedAt?: string }).updatedAt || prop.createdAt,
        icon: FileText,
        iconBg: "bg-emerald-50 border-emerald-200/80",
        iconColor: "text-emerald-600",
        statusBadge: badge,
        onClick: () => {
          if (onSelectProposalDetail) onSelectProposalDetail(prop);
          onNavigateMenu("proposals");
        },
      });
    });

    // Collaborations
    collaborations.forEach((collab) => {
      const isAgreed = collab.status === "AGREED";
      list.push({
        id: `act-collab-${collab.id}`,
        title: collab.opportunityTitle || collab.proposalTitle || "Kesepakatan MoU Kemitraan",
        subtitle: `Mitra ${collab.companyName || "Perusahaan"}`,
        date: collab.agreedAt || collab.updatedAt || collab.createdAt,
        icon: HeartHandshake,
        iconBg: "bg-indigo-50 border-indigo-200/80",
        iconColor: "text-indigo-600",
        statusBadge: isAgreed
          ? { label: "MoU Disahkan", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
          : { label: "Negosiasi", className: "bg-amber-50 text-amber-700 border-amber-200" },
        onClick: () => {
          if (onSelectCollabDetail) onSelectCollabDetail(collab);
          onNavigateMenu("collaborations");
        },
      });
    });

    // Program reports
    programs
      .filter((p) => p.lastReportDate && p.lastReportStatus)
      .forEach((prog) => {
        const isVer = prog.lastReportStatus === "VERIFIED";
        const isRev = prog.lastReportStatus === "REVISION_REQUESTED";
        list.push({
          id: `act-prog-${prog.id}`,
          title: `Laporan Progres: ${prog.title}`,
          subtitle: `Mitra ${prog.companyName || "Perusahaan"}`,
          date: prog.lastReportDate!,
          icon: Activity,
          iconBg: "bg-purple-50 border-purple-200/80",
          iconColor: "text-purple-600",
          statusBadge: isVer
            ? { label: "Terverifikasi", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
            : isRev
              ? { label: "Perlu Revisi", className: "bg-rose-50 text-rose-700 border-rose-200" }
              : { label: "Laporan Dikirim", className: "bg-blue-50 text-blue-700 border-blue-200" },
          onClick: () => {
            if (onSelectProgramDetail) onSelectProgramDetail(prog);
            onNavigateMenu("programs");
          },
        });
      });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [invitations, proposals, collaborations, programs, onNavigateMenu, onSelectProposalDetail, onSelectCollabDetail, onSelectProgramDetail]);

  // 7. Finance Row 6 Metrics & Comparisons
  const estimatedDisbursed = useMemo(() => {
    // Estimasi pencairan termin: jika program berjalan, rata-rata 50-70% termin telah disalurkan
    // atau menggunakan totalSpentBudget + buffer 15% jika dana kas telah masuk
    if (totalProgramBudget <= 0) return 0;
    const disbursed = Math.max(totalSpentBudget * 1.15, totalProgramBudget * 0.5);
    return Math.min(totalProgramBudget, disbursed);
  }, [totalProgramBudget, totalSpentBudget]);

  const cashRemaining = useMemo(() => {
    return Math.max(0, totalProgramBudget - totalSpentBudget);
  }, [totalProgramBudget, totalSpentBudget]);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* ROW 1: WELCOME HERO BANNER (Modern Enterprise & Overflowing NGO Character)*/}
      {/* ========================================================================= */}
      <div className="relative pt-10 sm:pt-12 lg:pt-14 overflow-visible w-full mt-1 sm:mt-2">
        {/* Layer 1: Kotak Background Banner (overflow: hidden agar gedung & dekorasi mengikuti rounded corners) */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1067A9] via-[#0E60A1] to-[#0D5B99] text-white border border-[#2B7CBD]/40 shadow-sm overflow-hidden min-h-[175px] sm:min-h-[185px] lg:min-h-[195px] flex items-center">
          {/* Latar Belakang Gedung Perusahaan & Pepohonan di Sisi Kanan Banner */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[55%] md:w-[48%] pointer-events-none select-none overflow-hidden opacity-30 sm:opacity-35 mix-blend-luminosity">
            <Image
              src="/images/overview/executive-banner-building.jpg"
              alt=""
              fill
              priority
              className="object-cover object-right"
              sizes="(max-width: 1024px) 50vw, 480px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1067A9] via-[#0E60A1]/85 to-transparent" />
          </div>

          {/* Gelombang Dekoratif & Efek Ambient Glow Halus */}
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"
          />

          {/* Konten Teks & Tombol di Sisi Kiri */}
          <div className="relative z-10 px-6 py-5 sm:px-8 sm:py-6 max-w-[64%] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white tracking-tight leading-tight">
                Halo,{" "}
                <span className="font-extrabold text-white">
                  {partner?.name || user.name || "Mitra Pelaksana"}
                </span>{" "}
                <span className="inline-block" role="img" aria-label="Melambai">
                  👋
                </span>
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/15 text-white/95 border border-white/20 backdrop-blur-xs">
                {currentDateString}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              Mari lanjutkan kolaborasi dan wujudkan dampak nyata. Pantau agenda, selesaikan tanggung jawab, dan kelola perkembangan program CSR Anda hari ini.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateMenu("programs")}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white hover:bg-blue-50 active:scale-[0.99] text-[#0E60A1] text-xs font-bold shadow-xs transition-all cursor-pointer group"
              >
                <span>Lihat Program Saya</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0E60A1] transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateMenu("explore")}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-white" />
                <span>Eksplorasi Peluang CSR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Layer 2: Ilustrasi Karakter Breakout / Overflowing (Lapisan Paling Depan di Kanan, menempel di dasar banner) */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-3 sm:right-6 lg:right-8 z-20 pointer-events-none select-none leading-none"
        >
          <Image
            src="/images/overview/partner-ngo-character.png"
            alt="Ilustrasi Tim Mitra Pelaksana SIPENA"
            width={850}
            height={797}
            priority
            className="w-[165px] sm:w-[185px] md:w-[205px] lg:w-[225px] xl:w-[240px] h-auto block align-bottom"
            style={{ display: "block", verticalAlign: "bottom" }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: 4 KPI CARDS (Left Accent Border 3px & Soft Tinted Background)      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
        {/* KPI 1: Undangan Kolaborasi (Left Accent Border Biru #2563EB) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateMenu("invitations")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateMenu("invitations");
            }
          }}
          className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#D9E8F9] border-l-[3.5px] border-l-[#2563EB] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-full min-h-[142px] space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Undangan Kolaborasi</span>
            <div className="w-9 h-9 rounded-full bg-blue-50/90 border border-blue-200/60 text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-[34px] font-black text-[#0A2558] tabular-nums tracking-tight leading-none">
              {invitations.length}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {pendingInvitations.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              )}
              <p className="text-xs text-slate-500 truncate">
                {pendingInvitations.length > 0
                  ? `${pendingInvitations.length} menunggu tanggapan`
                  : "Semua undangan telah direspons"}
              </p>
            </div>
          </div>
        </div>

        {/* KPI 2: Proposal Diajukan (Left Accent Border Hijau #059669) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateMenu("proposals")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateMenu("proposals");
            }
          }}
          className="p-5 rounded-2xl bg-[#F8FDFB] border border-[#D1F4E4] border-l-[3.5px] border-l-[#059669] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-full min-h-[142px] space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Proposal Diajukan</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50/90 border border-emerald-200/60 text-[#059669] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-[34px] font-black text-[#065F46] tabular-nums tracking-tight leading-none">
              {proposals.length}
            </div>
            <p className="text-xs text-slate-500 pt-1 truncate">
              {proposalStats.underReview} ditinjau • {proposalStats.revision} perlu revisi
            </p>
          </div>
        </div>

        {/* KPI 3: Program Berjalan (Left Accent Border Biru #2563EB) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setActiveTab("programs");
            tabSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveTab("programs");
              tabSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
          className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#D9E8F9] border-l-[3.5px] border-l-[#2563EB] shadow-xs hover:shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between h-full min-h-[142px] space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Program Berjalan</span>
            <div className="w-9 h-9 rounded-full bg-blue-50/90 border border-blue-200/60 text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-[34px] font-black text-[#0A2558] tabular-nums tracking-tight leading-none">
                {inProgressPrograms.length}
              </span>
              <span className="text-xs font-semibold text-slate-400 tabular-nums">
                / {programs.length || agreedCollabs.length} program
              </span>
            </div>
            <p className="text-xs text-slate-500 pt-1 truncate">
              {completedPrograms.length} program telah selesai
            </p>
          </div>
        </div>

        {/* KPI 4: Realisasi Dana (Left Accent Border Hijau #059669) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setActiveTab("finance");
            tabSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveTab("finance");
              tabSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
          className="p-5 rounded-2xl bg-[#F8FDFB] border border-[#D1F4E4] border-l-[3.5px] border-l-[#059669] shadow-xs hover:shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between h-full min-h-[142px] space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Realisasi Dana</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50/90 border border-emerald-200/60 text-[#059669] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-[28px] font-black text-[#065F46] tabular-nums tracking-tight truncate leading-none">
                {formatCompact(totalSpentBudget)}
              </span>
              <span className="text-xs font-bold text-[#065F46] bg-emerald-100/90 border border-emerald-200/80 px-2 py-0.5 rounded-full tabular-nums shrink-0">
                {budgetAbsorptionRate}%
              </span>
            </div>
            <div className="space-y-1 pt-0.5">
              <div className="w-full h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#059669] to-[#10B981] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, budgetAbsorptionRate))}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 truncate">
                Dari komitmen {formatCompact(totalProgramBudget)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: AGENDA & TINDAK LANJUT (60%) & KALENDER PROGRAM (40%)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* Kolom Kiri: Agenda & Tindak Lanjut (Smart To-Do List) (60% / lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header To-Do List */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-base sm:text-lg font-bold text-[#0A2558]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Agenda &amp; Tindak Lanjut
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Smart Workspace
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Aktivitas yang membutuhkan tindakan responsif atau catatan resmi lembaga Anda.
                </p>
              </div>

              {/* Ringkasan Counters */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Total: {pendingAgenda.length + completedAgenda.length}
                </span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  Perlu: {pendingAgenda.length}
                </span>
              </div>
            </div>

            {/* Tab Navigasi: Perlu Dilakukan vs Selesai */}
            <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setTodoTab("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${todoTab === "pending"
                  ? "bg-white text-[#0A2558] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <span>Perlu Dilakukan</span>
                {pendingAgenda.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center justify-center">
                    {pendingAgenda.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTodoTab("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${todoTab === "completed"
                  ? "bg-white text-[#0A2558] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <span>Selesai</span>
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center justify-center">
                  {completedAgenda.length}
                </span>
              </button>
            </div>

            {/* List Agenda Sesuai Tab Aktif */}
            <div className="space-y-3 min-h-[260px]">
              {todoTab === "pending" ? (
                pendingAgenda.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">
                        Semua agenda telah diselesaikan!
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Tidak ada tindakan yang mendesak saat ini. Pantau perkembangan pelaksanaan program Anda secara berkala.
                      </p>
                    </div>
                  </div>
                ) : (
                  pendingAgenda.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${item.urgency === "rose"
                              ? "bg-rose-50 border-rose-200 text-rose-600"
                              : item.urgency === "amber"
                                ? "bg-amber-50 border-amber-200 text-amber-600"
                                : "bg-blue-50 border-blue-200 text-blue-600"
                              }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#1067A9] transition-colors truncate">
                                {item.title}
                              </h3>
                              {item.urgencyLabel ? (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.urgency === "rose"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : item.urgency === "amber"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}
                                >
                                  {item.urgencyLabel}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                              <span className="font-medium text-slate-700 truncate">
                                {item.programOrCompany}
                              </span>
                              <span>•</span>
                              <span>{item.category}</span>
                              {item.deadline && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3 inline" />
                                    Batas: {formatDate(item.deadline)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={item.onAction}
                          className="self-end sm:self-center shrink-0 h-8 px-3 rounded-lg bg-[#0E60A1] hover:bg-[#0D5B99] active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span>{item.actionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )
              ) : completedAgenda.length === 0 ? (
                <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                  <p className="text-xs text-slate-500">Belum ada riwayat aktivitas yang diselesaikan.</p>
                </div>
              ) : (
                completedAgenda.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                            {item.title}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Selesai
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-600 truncate">{item.programOrCompany}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{formatDate(item.completedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={item.onAction}
                      className="self-end sm:self-center shrink-0 h-8 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>{item.actionLabel}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kalender & Pengingat Program (40% / lg:col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Kalender Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-base font-bold text-[#0A2558]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Kalender Program
                </h2>
                <p className="text-xs text-slate-500">
                  Pantau tanggal penting &amp; tenggat agenda.
                </p>
              </div>

              {/* Month Switcher */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-[#0A2558] min-w-[105px] text-center">
                  {MONTH_NAMES_ID[calMonth]} {calYear}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 pb-1.5">
              {WEEKDAYS.map((w, idx) => (
                <span
                  key={w}
                  className={`text-[11px] font-bold ${idx === 0 ? "text-rose-600" : "text-slate-500"
                    }`}
                >
                  {w}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarGrid.map((cell, idx) => {
                const hasDots =
                  cell.dots.blue || cell.dots.amber || cell.dots.green || cell.dots.red;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCalendarDate(cell.date)}
                    className={`h-9 w-full rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group ${cell.isSelected
                      ? "bg-[#1067A9] text-white font-bold shadow-xs"
                      : cell.isToday
                        ? "bg-blue-50/80 text-[#1067A9] font-bold border border-blue-200"
                        : cell.isCurrentMonth
                          ? "text-slate-800 hover:bg-slate-100 font-medium"
                          : "text-slate-300 font-normal"
                      }`}
                  >
                    <span className="text-xs">{cell.dayNumber}</span>
                    {hasDots && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {cell.dots.blue && (
                          <span
                            className={`w-1 h-1 rounded-full ${cell.isSelected ? "bg-white" : "bg-blue-600"
                              }`}
                          />
                        )}
                        {cell.dots.amber && (
                          <span
                            className={`w-1 h-1 rounded-full ${cell.isSelected ? "bg-white" : "bg-amber-500"
                              }`}
                          />
                        )}
                        {cell.dots.green && (
                          <span
                            className={`w-1 h-1 rounded-full ${cell.isSelected ? "bg-white" : "bg-emerald-500"
                              }`}
                          />
                        )}
                        {cell.dots.red && (
                          <span
                            className={`w-1 h-1 rounded-full ${cell.isSelected ? "bg-white" : "bg-rose-500"
                              }`}
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Milestone
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Tenggat
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Disetujui
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Terlewat
              </span>
            </div>
          </div>

          {/* Bottom Panel: Agenda pada Tanggal Terpilih atau Agenda Terdekat */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#0A2558] uppercase tracking-wide">
                {selectedCalendarDate.getDate()} {MONTH_NAMES_ID[selectedCalendarDate.getMonth()]}{" "}
                {selectedCalendarDate.getFullYear()}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {selectedDateEvents.length} Agenda
              </span>
            </div>

            {selectedDateEvents.length > 0 ? (
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                {selectedDateEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{evt.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{evt.timeDesc}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${evt.badgeColor}`}
                    >
                      {evt.badgeLabel}
                    </span>
                  </div>
                ))}
              </div>
            ) : nearestUpcomingEvent ? (
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                    Agenda Terdekat Berikutnya
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700">
                    {formatDate(nearestUpcomingEvent.date.toISOString())}
                  </span>
                </div>
                <p className="font-bold text-[#0A2558] truncate">{nearestUpcomingEvent.title}</p>
                <p className="text-[11px] text-slate-600 truncate">{nearestUpcomingEvent.desc}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-1">
                Tidak ada agenda yang dijadwalkan pada tanggal ini.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN 4: DETAIL PELAKSANAAN & PENGAWASAN (TAB SWITCHER)                  */}
      {/* ========================================================================= */}
      <div ref={tabSectionRef} className="space-y-5 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div
            className="flex items-center gap-2.5 shrink-0 whitespace-nowrap overflow-x-auto max-w-full"
            role="tablist"
            aria-label="Tampilan detail pelaksanaan program"
          >
            {[
              { id: "roadmap" as const, label: "Roadmap & Milestone", count: activeProgramList.length },
              { id: "programs" as const, label: "Program & Aktivitas", count: programs.length },
              { id: "finance" as const, label: "Pencairan & Realisasi", count: agreedCollabs.length || programs.length },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 shrink-0 whitespace-nowrap h-9 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#10519B] ${
                    isSelected
                      ? "bg-gradient-to-r from-[#1A60B0] via-[#10519B] to-[#073E8A] text-white border-transparent shadow-xs font-semibold"
                      : "bg-white text-[#0A2558] border-[#DBEAFE] hover:bg-[#F8FBFF]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#EDF6FF] text-[#0A2558]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigateMenu("programs")}
            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#1765F5]" />}
            className="text-xs font-semibold rounded-lg h-9 px-3.5 cursor-pointer self-start sm:self-auto"
          >
            Lihat Semua Program
          </Button>
        </div>

        {/* TAB 1: ROADMAP & MILESTONE (Full Width, 5-Stage Stepper) */}
        {activeTab === "roadmap" && (
          <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-6 w-full">
        {/* Header Roadmap */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2
                className="text-base sm:text-lg font-bold text-[#0A2558]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Roadmap &amp; Milestone Program
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Siklus Kemitraan
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pantau tahapan siklus kemitraan dan progres capaian milestone program CSR.
            </p>
          </div>

          {/* Program Dropdown Selector */}
          {activeProgramList.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="roadmap-program-select" className="text-xs font-semibold text-slate-600 shrink-0">
                Program:
              </label>
              <select
                id="roadmap-program-select"
                value={selectedRoadmapProgramId}
                onChange={(e) => setSelectedRoadmapProgramId(e.target.value)}
                className="h-9 px-3 text-xs font-semibold text-[#0A2558] bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1067A9] cursor-pointer max-w-[280px] truncate"
              >
                {activeProgramList.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 5-Stage Horizontal Stepper */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[680px] grid grid-cols-5 gap-2 relative">
            {roadmapStages.map((stage, idx) => {
              const isCompleted = stage.status === "completed";
              const isActive = stage.status === "active";
              const isLast = idx === roadmapStages.length - 1;

              return (
                <div key={stage.num} className="relative flex flex-col items-center text-center">
                  {/* Connecting Line to next step */}
                  {!isLast && (
                    <div
                      className={`absolute top-4 left-[50%] right-[-50%] h-[3px] z-0 transition-colors ${isCompleted
                        ? "bg-emerald-500"
                        : isActive
                          ? "bg-gradient-to-r from-blue-600 to-slate-200"
                          : "bg-slate-200"
                        }`}
                    />
                  )}

                  {/* Stage Number / Check Icon */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${isCompleted
                      ? "bg-emerald-600 text-white"
                      : isActive
                        ? "bg-[#1067A9] text-white ring-4 ring-blue-100 animate-pulse"
                        : "bg-white text-slate-400 border-2 border-slate-300"
                      }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stage.num}
                  </div>

                  {/* Stage Titles & Description */}
                  <div className="mt-2.5 space-y-0.5 px-1">
                    <p
                      className={`text-xs font-bold leading-tight ${isCompleted
                        ? "text-emerald-900"
                        : isActive
                          ? "text-[#0A2558]"
                          : "text-slate-500"
                        }`}
                    >
                      {stage.name}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Milestone Program Terpilih */}
        {selectedRoadmapProgram ? (
          <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#1067A9] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h3
                  className="text-xs sm:text-sm font-bold text-[#0A2558] truncate max-w-[280px] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[540px]"
                  title={selectedRoadmapProgram.title.replace(/[—–]/g, "-")}
                >
                  {selectedRoadmapProgram.title.replace(/[—–]/g, "-")}
                </h3>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                  <span className="truncate max-w-[180px] sm:max-w-[240px]">
                    Mitra: {selectedRoadmapProgram.companyName || "Perusahaan Sponsor"}
                  </span>
                  <span>•</span>
                  <span>
                    Progres:{" "}
                    <strong className="text-emerald-700">
                      {selectedRoadmapProgram.activityProgressPercent ?? 0}% Selesai
                    </strong>
                  </span>
                  {selectedRoadmapProgram.endDate && (
                    <>
                      <span>•</span>
                      <span>Target: {formatDate(selectedRoadmapProgram.endDate)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectProgramDetail) onSelectProgramDetail(selectedRoadmapProgram);
                onNavigateMenu("programs");
              }}
              className="h-8 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 self-start md:self-auto shrink-0 shadow-2xs"
            >
              <span>Buka Detail Kegiatan &amp; Milestone</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 text-center py-4">
            <p className="text-xs text-slate-500">
              Belum ada program CSR aktif yang berkontrak. Silakan eksplorasi peluang untuk memulai kemitraan.
            </p>
          </div>
        )}
        </div>
      )}

      {/* TAB 2: RINGKASAN PROGRAM AKTIF (60%) & AKTIVITAS TERBARU (40%) */}
      {activeTab === "programs" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* Kolom Kiri: Ringkasan Program Aktif (60% / lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-base sm:text-lg font-bold text-[#0A2558]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Program CSR Berjalan
                </h2>
                <p className="text-xs text-slate-500">
                  Ikhtisar pelaksanaan program aktif dan serapan dana lapangan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateMenu("programs")}
                className="text-xs font-semibold text-[#1067A9] hover:text-[#0D5B99] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Lihat Semua Program</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List Program Aktif */}
            <div className="space-y-3">
              {programs.length === 0 ? (
                <div className="py-10 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                  <Activity className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700">
                      Belum ada program CSR yang sedang berjalan
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Ajukan proposal melalui katalog peluang CSR untuk memulai program kemitraan baru.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigateMenu("explore")}
                    className="bg-[#0E60A1] hover:bg-[#0D5B99] text-xs font-semibold cursor-pointer"
                  >
                    Eksplorasi Peluang
                  </Button>
                </div>
              ) : (
                programs.slice(0, 3).map((prog) => {
                  const visual = getFocusVisual(prog.focusArea);
                  const IconComp = visual.icon;
                  const progPercent = prog.activityProgressPercent ?? 0;
                  const spent = prog.spentBudget ? parseFloat(prog.spentBudget) : 0;
                  const total = prog.budget ? parseFloat(prog.budget) : 0;
                  const absorption = total > 0 ? Math.round((spent / total) * 100) : 0;

                  return (
                    <div
                      key={prog.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all space-y-3 bg-white group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${visual.badgeClass}`}
                          >
                            <IconComp className="w-3 h-3" />
                            <span>{visual.label}</span>
                          </span>
                          <span className="text-xs text-slate-500 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {prog.companyName || "Perusahaan Mitra"}
                          </span>
                        </div>

                        {prog.targetCity && (
                          <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {prog.targetCity}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-[#0A2558] group-hover:text-[#1067A9] transition-colors leading-snug line-clamp-1">
                        {prog.title}
                      </h3>

                      {/* Progress Bar & Metrik */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">
                            Progres:{" "}
                            <strong className="text-slate-800 tabular-nums">
                              {progPercent}%
                            </strong>
                          </span>
                          <span className="text-slate-500 font-medium">
                            Serapan:{" "}
                            <strong className="text-emerald-700 tabular-nums">
                              {absorption}%
                            </strong>{" "}
                            ({formatCompact(spent)})
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${visual.barGradient} transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(0, progPercent))}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500">
                          Periode:{" "}
                          <span className="font-medium text-slate-700">
                            {prog.startDate ? formatDate(prog.startDate) : "TBD"} -{" "}
                            {prog.endDate ? formatDate(prog.endDate) : "TBD"}
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectProgramDetail) onSelectProgramDetail(prog);
                            onNavigateMenu("programs");
                          }}
                          className="font-bold text-[#1067A9] hover:text-[#0D5B99] flex items-center gap-1 cursor-pointer"
                        >
                          <span>Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Aktivitas Terbaru (40% / lg:col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div>
              <h2
                className="text-base sm:text-lg font-bold text-[#0A2558]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Aktivitas Terbaru
              </h2>
              <p className="text-xs text-slate-500">
                Linimasa riwayat kegiatan dan interaksi lembaga.
              </p>
            </div>

            {/* Vertical Activity Timeline */}
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Belum ada riwayat aktivitas terbaru.
                </div>
              ) : (
                recentActivities.map((act) => {
                  const IconComp = act.icon;
                  return (
                    <div
                      key={act.id}
                      role="button"
                      tabIndex={0}
                      onClick={act.onClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          act.onClick();
                        }
                      }}
                      className="p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${act.iconBg} ${act.iconColor}`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-bold text-[#0A2558] group-hover:text-[#1067A9] transition-colors truncate">
                            {act.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="truncate max-w-[130px]">{act.subtitle}</span>
                            <span>•</span>
                            <span className="shrink-0">{formatDate(act.date)}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${act.statusBadge.className}`}
                      >
                        {act.statusBadge.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB 3: RINGKASAN PENCAIRAN & REALISASI DANA (Full Width) */}
      {activeTab === "finance" && (
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-6 w-full">
        {/* Header Ringkasan Keuangan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2
                className="text-base sm:text-lg font-bold text-[#0A2558]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ringkasan Pencairan &amp; Realisasi Dana
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Transparansi Anggaran
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Akuntabilitas arus kas termin pencairan dan realisasi belanja kegiatan lapangan.
            </p>
          </div>
        </div>

        {/* 4 Financial Metric Cards (Left Accent Border 3.5px & Design System Harmony) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Disepakati (Left Accent Border Biru #2563EB) */}
          <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#D9E8F9] border-l-[3.5px] border-l-[#2563EB] shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">Total Komitmen Disepakati</span>
              <div className="w-8 h-8 rounded-full bg-blue-50/90 border border-blue-200/60 text-[#2563EB] flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0A2558] tabular-nums tracking-tight">
                {formatCompact(totalProgramBudget)}
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                Komitmen MoU dari {agreedCollabs.length || programs.length} program
              </p>
            </div>
          </div>

          {/* Card 2: Total Dicairkan (Left Accent Border Hijau #059669) */}
          <div className="p-5 rounded-2xl bg-[#F8FDFB] border border-[#D1F4E4] border-l-[3.5px] border-l-[#059669] shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">Dana Dicairkan (Termin)</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50/90 border border-emerald-200/60 text-[#059669] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-extrabold text-[#065F46] tabular-nums tracking-tight">
                  {formatCompact(estimatedDisbursed)}
                </span>
                <span className="text-xs font-bold text-[#065F46] bg-emerald-100/90 border border-emerald-200/80 px-2 py-0.5 rounded-full tabular-nums shrink-0">
                  {totalProgramBudget > 0 ? Math.round((estimatedDisbursed / totalProgramBudget) * 100) : 0}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                Penyaluran bertahap dari mitra perusahaan
              </p>
            </div>
          </div>

          {/* Card 3: Total Direalisasikan (Left Accent Border Biru #2563EB) */}
          <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#D9E8F9] border-l-[3.5px] border-l-[#2563EB] shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">Dana Direalisasikan</span>
              <div className="w-8 h-8 rounded-full bg-blue-50/90 border border-blue-200/60 text-[#2563EB] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-extrabold text-[#0A2558] tabular-nums tracking-tight">
                  {formatCompact(totalSpentBudget)}
                </span>
                <span className="text-xs font-bold text-[#0A2558] bg-blue-100/90 border border-blue-200/80 px-2 py-0.5 rounded-full tabular-nums shrink-0">
                  {budgetAbsorptionRate}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                Serapan nota lapangan terverifikasi
              </p>
            </div>
          </div>

          {/* Card 4: Sisa Kas Lapangan (Left Accent Border Netral #64748B) */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] border-l-[3.5px] border-l-slate-400 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">Sisa Alokasi Pagu</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800 tabular-nums tracking-tight">
                {formatCompact(cashRemaining)}
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                Alokasi untuk milestone kegiatan berikutnya
              </p>
            </div>
          </div>
        </div>

        {/* Visualisasi Progres Aliran Dana Kemitraan */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-[#0A2558] uppercase tracking-wider">
                Perbandingan Aliran Dana Kemitraan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemantauan serapan anggaran dari tahap pencairan termin hingga nota realisasi lapangan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-xs shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#1067A9] font-medium border border-blue-200/70">
                <span className="w-2 h-2 rounded-full bg-[#1067A9]" />
                Pencairan Termin: {totalProgramBudget > 0 ? Math.round((estimatedDisbursed / totalProgramBudget) * 100) : 0}%
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#059669] font-medium border border-emerald-200/70">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                Serapan Lapangan: {budgetAbsorptionRate}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Bar 1: Pencairan Termin */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1067A9]" />
                  Dana Dicairkan dari Perusahaan
                </span>
                <span className="font-bold text-[#0A2558] tabular-nums">
                  {formatCompact(estimatedDisbursed)}{" "}
                  <span className="font-normal text-slate-400">/ {formatCompact(totalProgramBudget)}</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#1067A9] to-[#2563EB] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalProgramBudget > 0
                      ? Math.min(100, Math.max(0, (estimatedDisbursed / totalProgramBudget) * 100))
                      : 0}%`,
                  }}
                  title="Penyaluran Termin"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Termin aktif yang telah ditransfer ke rekening operasional program.
              </p>
            </div>

            {/* Bar 2: Serapan Lapangan */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" />
                  Realisasi Serapan Lapangan Terverifikasi
                </span>
                <span className="font-bold text-[#065F46] tabular-nums">
                  {formatCompact(totalSpentBudget)}{" "}
                  <span className="font-normal text-slate-400">/ {formatCompact(totalProgramBudget)}</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#059669] to-[#10B981] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, budgetAbsorptionRate))}%`,
                  }}
                  title="Serapan Lapangan"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Total nota belanja dan laporan SPJ kegiatan yang telah disetujui.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  </div>
);
}
