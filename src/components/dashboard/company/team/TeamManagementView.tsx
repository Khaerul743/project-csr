"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Copy,
  Check,
  RotateCw,
  XCircle,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Search,
  ExternalLink,
  UserX,
  UserCheck,
  MailCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CompanyProfile, CompanyMember, TeamInvitation } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface TeamManagementViewProps {
  company: CompanyProfile | null;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  invitations: TeamInvitation[];
  isLoadingInvitations: boolean;
  onRefreshCompany: () => Promise<void> | void;
  onRefreshInvitations: () => Promise<void> | void;
  onOpenInviteModal: () => void;
}

// Helpers format tanggal Indonesia
function formatDateIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTimeIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// Format role ke label Bahasa Indonesia
function getRoleLabel(role: string): string {
  switch (role) {
    case "MANAGEMENT":
      return "Management";
    case "CSR_ADMIN":
      return "CSR Admin";
    default:
      return role;
  }
}

export function TeamManagementView({
  company,
  currentUser,
  invitations,
  isLoadingInvitations,
  onRefreshCompany,
  onRefreshInvitations,
  onOpenInviteModal,
}: TeamManagementViewProps) {
  const isManagement = currentUser.role === "MANAGEMENT";

  // State pencarian & filter anggota
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // State interaksi
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Modal states
  const [detailMember, setDetailMember] = useState<CompanyMember | null>(null);
  const [roleChangeMember, setRoleChangeMember] = useState<CompanyMember | null>(null);
  const [statusToggleMember, setStatusToggleMember] = useState<CompanyMember | null>(null);
  const [invitationToCancel, setInvitationToCancel] = useState<TeamInvitation | null>(null);
  const [invitationToResend, setInvitationToResend] = useState<TeamInvitation | null>(null);
  const [resendSuccessData, setResendSuccessData] = useState<{ email: string; token: string } | null>(null);

  // Loading action states
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Anggota organisasi
  const members = useMemo(() => {
    return Array.isArray(company?.members) ? company.members : [];
  }, [company?.members]);

  // Hitung jumlah akun Management yang berstatus ACTIVE
  const activeManagementCount = useMemo(() => {
    return members.filter((m) => m.role === "MANAGEMENT" && m.status === "ACTIVE").length;
  }, [members]);

  // Filter anggota berdasarkan search & filter role
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase());
      const matchRole = roleFilter === "ALL" || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [members, memberSearch, roleFilter]);

  // 1. Undangan Menunggu Konfirmasi (HANYA status PENDING dan belum kedaluwarsa)
  const pendingInvitations = useMemo(() => {
    const now = new Date();
    return (invitations || []).filter((inv) => {
      const isExpired = new Date(inv.expiresAt) <= now;
      return inv.status === "PENDING" && !isExpired;
    });
  }, [invitations]);

  // 2. Riwayat Undangan (ACCEPTED, CANCELLED, REJECTED, atau PENDING tapi kedaluwarsa)
  const historyInvitations = useMemo(() => {
    const now = new Date();
    return (invitations || []).filter((inv) => {
      const isExpired = new Date(inv.expiresAt) <= now;
      return inv.status !== "PENDING" || isExpired;
    });
  }, [invitations]);

  // Salin token undangan
  const handleCopyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  // Handler: Ubah Role Anggota
  const handleExecuteChangeRole = async () => {
    if (!roleChangeMember) return;
    setIsSubmittingAction(true);
    setActionErrorMessage(null);

    const newRole = roleChangeMember.role === "MANAGEMENT" ? "CSR_ADMIN" : "MANAGEMENT";

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/companies/current/members/${roleChangeMember.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengubah role anggota");
      }

      await onRefreshCompany();
      setRoleChangeMember(null);
    } catch (err: any) {
      setActionErrorMessage(err.message || "Terjadi kesalahan saat mengubah role");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handler: Nonaktifkan / Aktifkan Kembali Akses Anggota
  const handleExecuteToggleStatus = async () => {
    if (!statusToggleMember) return;
    setIsSubmittingAction(true);
    setActionErrorMessage(null);

    const newStatus = statusToggleMember.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/companies/current/members/${statusToggleMember.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui status akses anggota");
      }

      await onRefreshCompany();
      setStatusToggleMember(null);
    } catch (err: any) {
      setActionErrorMessage(err.message || "Terjadi kesalahan saat memperbarui status akses");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handler: Batalkan Undangan
  const handleExecuteCancelInvitation = async () => {
    if (!invitationToCancel) return;
    setIsSubmittingAction(true);
    setActionErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/invitations/${invitationToCancel.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal membatalkan undangan");
      }

      await onRefreshInvitations();
      setInvitationToCancel(null);
    } catch (err: any) {
      setActionErrorMessage(err.message || "Terjadi kesalahan saat membatalkan undangan");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handler: Kirim Ulang Undangan (Perbarui masa berlaku & token)
  const handleExecuteResendInvitation = async () => {
    if (!invitationToResend) return;
    setIsSubmittingAction(true);
    setActionErrorMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/invitations/${invitationToResend.id}/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengirim ulang undangan");
      }

      await onRefreshInvitations();
      setResendSuccessData({
        email: invitationToResend.email,
        token: json.data?.token || "",
      });
      setInvitationToResend(null);
    } catch (err: any) {
      setActionErrorMessage(err.message || "Terjadi kesalahan saat mengirim ulang undangan");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ============================================================ */}
      {/* 1. HEADER HALAMAN */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#181343] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#181343] tracking-tight">
                Anggota Tim & Akses
              </h2>
              <p className="text-xs text-[#787680]">
                Kelola anggota organisasi, penugasan hak akses peran (Role-Based Access Control), dan undangan tim internal.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        {isManagement ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onOpenInviteModal}
            leftIcon={<UserPlus className="w-4 h-4 text-emerald-300" />}
            className="shrink-0 bg-[#009E75] hover:bg-[#008764] text-white font-bold shadow-xs transition-all"
          >
            Undang Anggota Baru
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#787680] bg-[#F9F9FB] px-3 py-1.5 rounded-xl border border-[#E8E8EA]">
            <Info className="w-4 h-4 text-[#787680] shrink-0" />
            <span>Mode Lihat Anggota (Hak administratif dikelola oleh Management)</span>
          </div>
        )}
      </div>

      {/* Compact Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Total Anggota
          </span>
          <span className="text-xl font-black text-[#181343] mt-0.5 block">
            {members.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Management
          </span>
          <span className="text-xl font-black text-indigo-700 mt-0.5 block">
            {members.filter((m) => m.role === "MANAGEMENT").length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            CSR Admin
          </span>
          <span className="text-xl font-black text-[#009E75] mt-0.5 block">
            {members.filter((m) => m.role === "CSR_ADMIN").length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs">
          <span className="text-[11px] font-bold text-[#787680] uppercase tracking-wider block">
            Undangan Menunggu
          </span>
          <span className="text-xl font-black text-amber-600 mt-0.5 block">
            {pendingInvitations.length}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ANGGOTA TIM AKTIF */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
        {/* Card Header & Filters */}
        <div className="p-5 sm:p-6 border-b border-[#F4F4F6] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#181343]">
                Anggota Tim Aktif
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EDF9F3] text-[#009E75]">
                {members.length} Pengguna
              </span>
            </div>
            <p className="text-xs text-[#787680]">
              Pengguna internal yang memiliki akses ke workspace organisasi ini
            </p>
          </div>

          {/* Quick Search & Role Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-[#181343] placeholder:text-[#787680] focus:outline-none focus:border-[#35B98E] focus:ring-1 focus:ring-[#35B98E]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] text-[#181343] font-medium focus:outline-none focus:border-[#35B98E]"
            >
              <option value="ALL">Semua Peran</option>
              <option value="MANAGEMENT">Management</option>
              <option value="CSR_ADMIN">CSR Admin</option>
            </select>
          </div>
        </div>

        {/* Member List */}
        <div className="divide-y divide-[#F4F4F6]">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const isCurrentUser = member.id === currentUser.id;
              const isSoleActiveManagement =
                member.role === "MANAGEMENT" &&
                member.status === "ACTIVE" &&
                activeManagementCount <= 1;

              return (
                <div
                  key={member.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F9F9FB]/60 transition-colors"
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 text-[#181343] font-black text-sm flex items-center justify-center shrink-0">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#181343] truncate">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold bg-[#F4F4F6] text-[#5F5D6B] px-2 py-0.5 rounded-full border border-[#E8E8EA]">
                            Anda
                          </span>
                        )}
                        {member.status === "INACTIVE" && (
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#787680] block truncate">
                        {member.email}
                      </span>
                    </div>
                  </div>

                  {/* Right: Meta & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pl-13 md:pl-0">
                    {/* Role Badge */}
                    <div className="shrink-0">
                      {member.role === "MANAGEMENT" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Management
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          CSR Admin
                        </span>
                      )}
                    </div>

                    {/* Join Date */}
                    <div className="text-xs text-[#787680] hidden sm:flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bergabung {formatDateIndo(member.createdAt)}</span>
                    </div>

                    {/* Action Menu Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuMemberId(
                            activeMenuMemberId === member.id ? null : member.id
                          )
                        }
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                        title="Opsi Anggota"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuMemberId === member.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActiveMenuMemberId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-[#E8E8EA] py-1.5 z-30 divide-y divide-[#F4F4F6] animate-in fade-in-50 zoom-in-95 duration-100">
                            {/* Option 1: Lihat Detail */}
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMemberId(null);
                                  setDetailMember(member);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#181343] hover:bg-[#F9F9FB] flex items-center gap-2 cursor-pointer"
                              >
                                <Info className="w-3.5 h-3.5 text-slate-500" />
                                <span>Lihat Detail Pengguna</span>
                              </button>
                            </div>

                            {/* Option 2 & 3: Management Actions */}
                            {isManagement && (
                              <div className="py-1">
                                {/* Change Role */}
                                <button
                                  type="button"
                                  disabled={isSoleActiveManagement}
                                  onClick={() => {
                                    setActiveMenuMemberId(null);
                                    setRoleChangeMember(member);
                                  }}
                                  className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2 ${
                                    isSoleActiveManagement
                                      ? "opacity-40 cursor-not-allowed text-slate-400"
                                      : "text-[#181343] hover:bg-[#F9F9FB] cursor-pointer"
                                  }`}
                                  title={
                                    isSoleActiveManagement
                                      ? "Satu-satunya akun Management yang aktif"
                                      : undefined
                                  }
                                >
                                  <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>
                                    Ubah ke {member.role === "MANAGEMENT" ? "CSR Admin" : "Management"}
                                  </span>
                                </button>

                                {/* Toggle Active / Inactive Status */}
                                <button
                                  type="button"
                                  disabled={isCurrentUser || isSoleActiveManagement}
                                  onClick={() => {
                                    setActiveMenuMemberId(null);
                                    setStatusToggleMember(member);
                                  }}
                                  className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2 ${
                                    isCurrentUser || isSoleActiveManagement
                                      ? "opacity-40 cursor-not-allowed text-slate-400"
                                      : member.status === "ACTIVE"
                                      ? "text-rose-600 hover:bg-rose-50 cursor-pointer"
                                      : "text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                                  }`}
                                  title={
                                    isCurrentUser
                                      ? "Tidak dapat menonaktifkan akun sendiri"
                                      : isSoleActiveManagement
                                      ? "Satu-satunya akun Management yang aktif"
                                      : undefined
                                  }
                                >
                                  {member.status === "ACTIVE" ? (
                                    <>
                                      <UserX className="w-3.5 h-3.5 text-rose-500" />
                                      <span>Nonaktifkan Akses</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Aktifkan Kembali</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#787680]">
              {memberSearch || roleFilter !== "ALL"
                ? "Tidak ada anggota tim yang cocok dengan kriteria pencarian."
                : "Belum ada anggota tim internal yang terdaftar."}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. UNDANGAN MENUNGGU KONFIRMASI (PENDING ONLY) */}
      {/* ============================================================ */}
      {isManagement && (
        <div className="bg-white rounded-3xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
          {/* Card Header */}
          <div className="p-5 sm:p-6 border-b border-[#F4F4F6] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#181343]">
                  Undangan Menunggu Konfirmasi
                </h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    pendingInvitations.length > 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-[#F4F4F6] text-[#787680]"
                  }`}
                >
                  {pendingInvitations.length}
                </span>
              </div>
              <p className="text-xs text-[#787680]">
                Undangan aktif yang telah dikirimkan dan menunggu konfirmasi login penerima
              </p>
            </div>
          </div>

          {/* Body Content */}
          {isLoadingInvitations ? (
            <div className="p-8 text-center text-xs text-[#787680]">
              Memuat data undangan tim...
            </div>
          ) : pendingInvitations.length === 0 ? (
            /* Empty State sesuai instruksi user */
            <div className="p-8 sm:p-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA] text-[#787680] flex items-center justify-center mx-auto">
                <MailCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-[#181343]">
                Tidak ada undangan yang menunggu konfirmasi.
              </h4>
              <p className="text-xs text-[#787680] max-w-sm mx-auto">
                Seluruh undangan yang terkirim telah diterima oleh rekan tim atau telah diproses sebelumnya.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F4F4F6]">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-[#F9F9FB]/60 transition-colors"
                >
                  {/* Left: Email, Status & Role */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm text-[#181343]">
                        {inv.email}
                      </span>
                      {/* Status Badge Bahasa Indonesia */}
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Menunggu Konfirmasi
                      </span>
                      {/* Role Badge */}
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {getRoleLabel(inv.role)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#787680]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Berlaku s/d: {formatDateTimeIndo(inv.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Right: Actions (Salin Token, Kirim Ulang, Batalkan) */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Salin Token */}
                    <button
                      type="button"
                      onClick={() => handleCopyToken(inv.token, inv.id)}
                      className="px-2.5 py-1.5 rounded-xl border border-[#E8E8EA] bg-[#F9F9FB] hover:bg-white text-[#181343] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Salin Token Undangan"
                    >
                      {copiedTokenId === inv.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#009E75]" />
                          <span className="text-[#009E75] font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Salin Token</span>
                        </>
                      )}
                    </button>

                    {/* Kirim Ulang */}
                    <button
                      type="button"
                      onClick={() => setInvitationToResend(inv)}
                      className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Perbarui token dan masa berlaku"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Kirim Ulang</span>
                    </button>

                    {/* Batalkan */}
                    <button
                      type="button"
                      onClick={() => setInvitationToCancel(inv)}
                      className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Batalkan Undangan"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Batalkan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. RIWAYAT UNDANGAN (ACCEPTED / CANCELLED / EXPIRED) */}
      {/* ============================================================ */}
      {isManagement && historyInvitations.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E8E8EA] shadow-2xs overflow-hidden">
          {/* Collapsible Header */}
          <div
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#F9F9FB]/50 transition-colors"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#181343]">
                  Riwayat Undangan
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F4F4F6] text-[#787680]">
                  {historyInvitations.length} Catatan
                </span>
              </div>
              <p className="text-xs text-[#787680]">
                Catatan undangan yang telah diterima, kedaluwarsa, atau dibatalkan sebelumnya
              </p>
            </div>

            <button
              type="button"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isHistoryExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>
          </div>

          {/* Expanded List */}
          {isHistoryExpanded && (
            <div className="border-t border-[#F4F4F6] divide-y divide-[#F4F4F6]">
              {historyInvitations.map((inv) => {
                const now = new Date();
                const isExpired =
                  inv.status === "EXPIRED" ||
                  (inv.status === "PENDING" && new Date(inv.expiresAt) <= now);

                let statusLabel = "Diterima";
                let badgeClass = "bg-emerald-50 text-[#009E75] border-emerald-200";

                if (inv.status === "ACCEPTED") {
                  statusLabel = "Diterima";
                  badgeClass = "bg-[#EDF9F3] text-[#009E75] border-[#35B98E]/50";
                } else if (inv.status === "CANCELLED") {
                  statusLabel = "Dibatalkan";
                  badgeClass = "bg-slate-100 text-slate-600 border-slate-200";
                } else if (isExpired) {
                  statusLabel = "Kedaluwarsa";
                  badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                }

                return (
                  <div
                    key={inv.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-[#181343]">
                          {inv.email}
                        </span>
                        {/* Status Label Bahasa Indonesia */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeClass}`}
                        >
                          {statusLabel}
                        </span>
                        {/* Role */}
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F9F9FB] text-[#787680] border border-[#E8E8EA]">
                          {getRoleLabel(inv.role)}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#787680]">
                        Dibuat: {formatDateTimeIndo(inv.createdAt)}
                      </div>
                    </div>

                    {/* Resend Option for Cancelled or Expired */}
                    {(inv.status === "CANCELLED" || isExpired) && (
                      <button
                        type="button"
                        onClick={() => setInvitationToResend(inv)}
                        className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-medium self-end sm:self-center transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Undang kembali pengguna ini"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Undang Kembali</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL: LIHAT DETAIL PENGGUNA */}
      {/* ============================================================ */}
      {detailMember && (
        <Modal
          isOpen={!!detailMember}
          onClose={() => setDetailMember(null)}
          title="Detail Anggota Tim"
          description="Informasi akun pengguna dan kewenangan dalam sistem"
          maxWidth="md"
        >
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#F9F9FB] border border-[#E8E8EA]">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E8E8EA] text-[#181343] font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                {detailMember.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#181343] truncate">
                  {detailMember.name}
                </h4>
                <p className="text-xs text-[#787680] truncate">
                  {detailMember.email}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E8E8EA] text-[#181343]">
                    {getRoleLabel(detailMember.role)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      detailMember.status === "ACTIVE"
                        ? "bg-[#EDF9F3] text-[#009E75] border-[#35B98E]/50"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {detailMember.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Kewenangan Peran */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#181343] block">
                Cakupan Kewenangan Peran ({getRoleLabel(detailMember.role)}):
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-[#5F5D6B] space-y-1.5">
                {detailMember.role === "MANAGEMENT" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Hak penuh manajerial dan persetujuan portofolio CSR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Undang, ubah hak akses, dan kelola anggota tim perusahaan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Akses penuh analisis Business Intelligence dan Ringkasan Eksekutif</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#009E75] shrink-0" />
                      <span>Operasional harian pelaksanaan program dan verifikasi mitra</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#009E75] shrink-0" />
                      <span>Tinjau proposal masuk dan lakukan negosiasi teknis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#009E75] shrink-0" />
                      <span>Pelaporan aktivitas lapangan dan verifikasi pertanggungjawaban</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-[11px] text-[#787680] pt-1">
              Terdaftar sejak: {formatDateIndo(detailMember.createdAt)}
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setDetailMember(null)}
                className="w-full"
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: UBAH ROLE ANGGOTA */}
      {/* ============================================================ */}
      {roleChangeMember && (
        <Modal
          isOpen={!!roleChangeMember}
          onClose={() => {
            setRoleChangeMember(null);
            setActionErrorMessage(null);
          }}
          title="Ubah Hak Akses Peran"
          description="Sesuaikan tingkat kewenangan akun pengguna di sistem"
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            {actionErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{actionErrorMessage}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-1">
              <span className="text-xs text-[#787680] block">Pengguna:</span>
              <p className="text-sm font-bold text-[#181343]">
                {roleChangeMember.name}{" "}
                <span className="text-xs font-normal text-[#787680]">
                  ({roleChangeMember.email})
                </span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#181343]">
                <span>Role Saat Ini:</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700">
                  {getRoleLabel(roleChangeMember.role)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[#181343]">
                <span>Role Baru:</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-700 text-white font-extrabold">
                  {roleChangeMember.role === "MANAGEMENT" ? "CSR Admin" : "Management"}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#787680] leading-relaxed">
              {roleChangeMember.role === "MANAGEMENT"
                ? "Peran akan dialihkan menjadi CSR Admin. Pengguna tidak akan memiliki akses administratif untuk mengundang anggota lain atau mengubah role organisasi."
                : "Peran akan dialihkan menjadi Management. Pengguna akan memperoleh hak manajerial penuh termasuk persetujuan portofolio CSR dan pengelolaan anggota tim."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F6]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setRoleChangeMember(null);
                  setActionErrorMessage(null);
                }}
                disabled={isSubmittingAction}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleExecuteChangeRole}
                isLoading={isSubmittingAction}
              >
                Simpan Perubahan Role
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 7. MODAL: NONAKTIFKAN / AKTIFKAN STATUS ANGGOTA */}
      {/* ============================================================ */}
      {statusToggleMember && (
        <Modal
          isOpen={!!statusToggleMember}
          onClose={() => {
            setStatusToggleMember(null);
            setActionErrorMessage(null);
          }}
          title={
            statusToggleMember.status === "ACTIVE"
              ? "Nonaktifkan Akses Anggota"
              : "Aktifkan Kembali Akses"
          }
          description="Konfirmasi perubahan status akses pengguna"
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            {actionErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{actionErrorMessage}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#F9F9FB] border border-[#E8E8EA] space-y-1">
              <span className="text-xs text-[#787680] block">Pengguna:</span>
              <p className="text-sm font-bold text-[#181343]">
                {statusToggleMember.name}{" "}
                <span className="text-xs font-normal text-[#787680]">
                  ({statusToggleMember.email})
                </span>
              </p>
            </div>

            <p className="text-xs text-[#787680] leading-relaxed">
              {statusToggleMember.status === "ACTIVE"
                ? "Apakah Anda yakin ingin menonaktifkan akun anggota ini? Pengguna tidak akan dapat login atau mengakses data workspace CSR hingga statusnya diaktifkan kembali."
                : "Apakah Anda yakin ingin memulihkan status akses akun ini? Pengguna akan dapat kembali login dan mengakses workspace CSR organisasi."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F6]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setStatusToggleMember(null);
                  setActionErrorMessage(null);
                }}
                disabled={isSubmittingAction}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant={statusToggleMember.status === "ACTIVE" ? "danger" : "primary"}
                size="md"
                onClick={handleExecuteToggleStatus}
                isLoading={isSubmittingAction}
              >
                {statusToggleMember.status === "ACTIVE"
                  ? "Ya, Nonaktifkan Akses"
                  : "Ya, Aktifkan Kembali"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 8. MODAL: BATALKAN UNDANGAN */}
      {/* ============================================================ */}
      {invitationToCancel && (
        <Modal
          isOpen={!!invitationToCancel}
          onClose={() => {
            setInvitationToCancel(null);
            setActionErrorMessage(null);
          }}
          title="Batalkan Undangan"
          description="Hentikan masa berlaku undangan tim"
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            {actionErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{actionErrorMessage}</span>
              </div>
            )}

            <p className="text-xs text-[#787680] leading-relaxed">
              Batalkan undangan untuk email{" "}
              <strong className="text-[#181343]">{invitationToCancel.email}</strong>?
              Tautan dan token undangan ini tidak akan dapat digunakan lagi.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F6]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setInvitationToCancel(null);
                  setActionErrorMessage(null);
                }}
                disabled={isSubmittingAction}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={handleExecuteCancelInvitation}
                isLoading={isSubmittingAction}
              >
                Ya, Batalkan Undangan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 9. MODAL: KONFIRMASI KIRIM ULANG UNDANGAN */}
      {/* ============================================================ */}
      {invitationToResend && (
        <Modal
          isOpen={!!invitationToResend}
          onClose={() => {
            setInvitationToResend(null);
            setActionErrorMessage(null);
          }}
          title="Kirim Ulang Undangan"
          description="Perbarui token dan perpanjang masa aktif undangan"
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            {actionErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{actionErrorMessage}</span>
              </div>
            )}

            <p className="text-xs text-[#787680] leading-relaxed">
              Perbarui undangan untuk{" "}
              <strong className="text-[#181343]">{invitationToResend.email}</strong>?
              Sistem akan membuat token baru dan memperpanjang masa berlaku hingga 7 hari ke depan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F6]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setInvitationToResend(null);
                  setActionErrorMessage(null);
                }}
                disabled={isSubmittingAction}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleExecuteResendInvitation}
                isLoading={isSubmittingAction}
              >
                Kirim Ulang Sekarang
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 10. MODAL: SUKSES KIRIM ULANG DENGAN TOKEN BARU */}
      {/* ============================================================ */}
      {resendSuccessData && (
        <Modal
          isOpen={!!resendSuccessData}
          onClose={() => setResendSuccessData(null)}
          title="Undangan Berhasil Diperbarui"
          description="Token baru siap dibagikan kepada calon anggota tim"
          maxWidth="md"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#009E75] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#181343]">
                Undangan untuk {resendSuccessData.email} Aktif Kembali
              </h4>
              <p className="text-xs text-[#787680] mt-1 max-w-sm mx-auto">
                Masa berlaku telah diperpanjang 7 hari ke depan.
              </p>
            </div>

            <div className="p-3 bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl text-left space-y-1.5">
              <span className="text-[11px] font-bold text-[#787680] block">
                Token Undangan Baru:
              </span>
              <div className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-[#E8E8EA] text-xs font-mono text-[#181343]">
                <span className="truncate">{resendSuccessData.token}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(resendSuccessData.token);
                    setCopiedTokenId("new-token");
                    setTimeout(() => setCopiedTokenId(null), 2000);
                  }}
                  className="text-slate-400 hover:text-emerald-600 shrink-0 p-1"
                  title="Salin Token"
                >
                  {copiedTokenId === "new-token" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setResendSuccessData(null)}
              className="w-full"
            >
              Selesai
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

