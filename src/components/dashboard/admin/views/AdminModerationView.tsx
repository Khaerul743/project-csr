"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Lock,
  RefreshCw,
  Search,
  Unlock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CsrFocusArea, csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import {
  AdminOpportunityListItem,
  AdminProposalListItem,
  PaginatedResult,
} from "../types";
import {
  FOCUS_AREA_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  PROPOSAL_STATUS_LABELS,
  formatCompactRupiah,
  formatDate,
  formatRupiah,
  getFocusAreaLabel,
} from "../helpers";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminModal,
  AdminPaginationBar,
} from "../AdminSharedPrimitives";

interface AdminModerationViewProps {
  onMutated?: () => void;
}

export function AdminModerationView({ onMutated }: AdminModerationViewProps) {
  const [activeTab, setActiveTab] = useState<"opportunities" | "proposals">("opportunities");

  // Opportunities State
  const [oppData, setOppData] = useState<PaginatedResult<AdminOpportunityListItem> | null>(null);
  const [isLoadingOpp, setIsLoadingOpp] = useState(true);
  const [oppError, setOppError] = useState<string | null>(null);
  const [oppPage, setOppPage] = useState(1);
  const [oppSearch, setOppSearch] = useState("");
  const [oppStatus, setOppStatus] = useState("ALL");
  const [oppFocus, setOppFocus] = useState("ALL");

  // Proposals State
  const [propData, setPropData] = useState<PaginatedResult<AdminProposalListItem> | null>(null);
  const [isLoadingProp, setIsLoadingProp] = useState(false);
  const [propError, setPropError] = useState<string | null>(null);
  const [propPage, setPropPage] = useState(1);
  const [propSearch, setPropSearch] = useState("");
  const [propStatus, setPropStatus] = useState("ALL");

  // Detail & Moderation Modals
  const [selectedOpp, setSelectedOpp] = useState<AdminOpportunityListItem | null>(null);
  const [moderatingOpp, setModeratingOpp] = useState<AdminOpportunityListItem | null>(null);
  const [moderateTargetStatus, setModerateTargetStatus] = useState<"CLOSED" | "OPEN">("CLOSED");
  const [moderateReason, setModerateReason] = useState("");
  const [isModerating, setIsModerating] = useState(false);
  const [moderateError, setModerateError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  const [selectedProposal, setSelectedProposal] = useState<AdminProposalListItem | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setIsLoadingOpp(true);
    setOppError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const params = new URLSearchParams();
      params.set("page", String(oppPage));
      params.set("limit", "10");
      if (oppSearch.trim()) params.set("search", oppSearch.trim());
      if (oppStatus !== "ALL") params.set("status", oppStatus);
      if (oppFocus !== "ALL") params.set("focusArea", oppFocus);

      const res = await fetch(`/api/admin/opportunities?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat daftar peluang CSR");
      }
      setOppData(json.data);
    } catch (err: any) {
      setOppError(err.message || "Gagal memuat daftar peluang CSR");
    } finally {
      setIsLoadingOpp(false);
    }
  }, [oppPage, oppSearch, oppStatus, oppFocus]);

  const fetchProposals = useCallback(async () => {
    setIsLoadingProp(true);
    setPropError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const params = new URLSearchParams();
      params.set("page", String(propPage));
      params.set("limit", "10");
      if (propSearch.trim()) params.set("search", propSearch.trim());
      if (propStatus !== "ALL") params.set("status", propStatus);

      const res = await fetch(`/api/admin/proposals?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat daftar proposal mitra");
      }
      setPropData(json.data);
    } catch (err: any) {
      setPropError(err.message || "Gagal memuat daftar proposal mitra");
    } finally {
      setIsLoadingProp(false);
    }
  }, [propPage, propSearch, propStatus]);

  useEffect(() => {
    if (activeTab === "opportunities") {
      fetchOpportunities();
    } else {
      fetchProposals();
    }
  }, [activeTab, fetchOpportunities, fetchProposals]);

  const handleOpenModerateModal = (opp: AdminOpportunityListItem) => {
    setModeratingOpp(opp);
    setModerateTargetStatus(opp.status === "CLOSED" ? "OPEN" : "CLOSED");
    setModerateReason("");
    setModerateError(null);
  };

  const handleSubmitModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderatingOpp) return;
    setModerateError(null);

    if (moderateReason.trim().length < 5) {
      setModerateError("Alasan moderasi wajib diisi minimal 5 karakter.");
      return;
    }

    try {
      setIsModerating(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const res = await fetch(`/api/admin/opportunities/${moderatingOpp.id}/moderate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: moderateTargetStatus,
          reason: moderateReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memoderasi peluang CSR");
      }

      const title = moderatingOpp.title;
      setModeratingOpp(null);
      setBannerSuccess(
        `Status peluang "${title}" diubah menjadi ${
          moderateTargetStatus === "CLOSED" ? "Ditutup (CLOSED)" : "Terbuka (OPEN)"
        } dan dicatat di log audit.`
      );
      fetchOpportunities();
      onMutated?.();
    } catch (err: any) {
      setModerateError(err.message || "Terjadi kesalahan saat memoderasi peluang");
    } finally {
      setIsModerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Moderasi Peluang &amp; Proposal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Awasi peluang CSR publik dari seluruh perusahaan dan pantau lalu lintas proposal mitra secara transparan.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Tab moderasi peluang dan proposal"
          className="inline-flex rounded-xl bg-slate-200/70 p-1 border border-slate-200 self-start md:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "opportunities"}
            onClick={() => setActiveTab("opportunities")}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#181343] ${
              activeTab === "opportunities"
                ? "bg-white text-[#181343] font-bold shadow-2xs"
                : "text-slate-700 hover:text-[#181343]"
            }`}
          >
            Peluang CSR Global
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "proposals"}
            onClick={() => setActiveTab("proposals")}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#181343] ${
              activeTab === "proposals"
                ? "bg-white text-[#181343] font-bold shadow-2xs"
                : "text-slate-700 hover:text-[#181343]"
            }`}
          >
            Arus Proposal Masuk
          </button>
        </div>
      </div>

      {bannerSuccess && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>{bannerSuccess}</span>
          </span>
          <button
            type="button"
            onClick={() => setBannerSuccess(null)}
            className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-bold text-emerald-800 hover:underline rounded-lg"
          >
            Tutup
          </button>
        </div>
      )}

      {/* TAB 1: OPPORTUNITIES */}
      {activeTab === "opportunities" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <label htmlFor="mod-opp-search" className="sr-only">
                  Cari peluang CSR
                </label>
                <Search
                  className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="mod-opp-search"
                  type="text"
                  value={oppSearch}
                  onChange={(e) => {
                    setOppSearch(e.target.value);
                    setOppPage(1);
                  }}
                  placeholder="Cari judul peluang, perusahaan, atau kota target..."
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
                />
              </div>

              <div className="md:col-span-3">
                <label htmlFor="mod-opp-focus" className="sr-only">
                  Filter bidang fokus peluang
                </label>
                <select
                  id="mod-opp-focus"
                  value={oppFocus}
                  onChange={(e) => {
                    setOppFocus(e.target.value);
                    setOppPage(1);
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
                >
                  <option value="ALL">Semua Bidang Fokus</option>
                  {csrFocusAreaEnum.map((fa: CsrFocusArea) => (
                    <option key={fa} value={fa}>
                      {FOCUS_AREA_LABELS[fa]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label htmlFor="mod-opp-status" className="sr-only">
                  Filter status peluang
                </label>
                <select
                  id="mod-opp-status"
                  value={oppStatus}
                  onChange={(e) => {
                    setOppStatus(e.target.value);
                    setOppPage(1);
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="OPEN">Terbuka (OPEN)</option>
                  <option value="IN_REVIEW">Dalam Tinjauan</option>
                  <option value="DRAFT">Draf</option>
                  <option value="CLOSED">Ditutup (CLOSED)</option>
                </select>
              </div>
            </div>
          </div>

          {isLoadingOpp ? (
            <AdminLoadingState message="Memuat daftar peluang CSR lintas perusahaan..." />
          ) : oppError ? (
            <AdminErrorState message={oppError} onRetry={fetchOpportunities} />
          ) : !oppData || oppData.data.length === 0 ? (
            <AdminEmptyState
              title="Tidak Ada Peluang Ditemukan"
              description={
                oppSearch || oppStatus !== "ALL" || oppFocus !== "ALL"
                  ? "Tidak ada peluang CSR yang sesuai dengan filter pencarian Anda."
                  : "Belum ada peluang CSR yang dibuat oleh perusahaan pada platform."
              }
              actionLabel={
                oppSearch || oppStatus !== "ALL" || oppFocus !== "ALL"
                  ? "Reset Filter"
                  : undefined
              }
              onAction={() => {
                setOppSearch("");
                setOppStatus("ALL");
                setOppFocus("ALL");
                setOppPage(1);
              }}
            />
          ) : (
            <>
              <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-3.5 px-5">Judul Peluang &amp; Bidang</th>
                      <th className="py-3.5 px-4">Perusahaan Sponsor</th>
                      <th className="py-3.5 px-4">Anggaran &amp; Lokasi</th>
                      <th className="py-3.5 px-4">Proposal</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Moderasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {oppData.data.map((opp) => {
                      const st = OPPORTUNITY_STATUS_LABELS[opp.status] || {
                        label: opp.status,
                        variant: "slate" as const,
                      };
                      return (
                        <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5 max-w-[260px]">
                            <span className="font-bold text-[#181343] block truncate">
                              {opp.title}
                            </span>
                            <span className="text-[11px] text-slate-600 block truncate">
                              {getFocusAreaLabel(opp.focusArea)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-[#181343] block">
                              {opp.companyName || "-"}
                            </span>
                            <span
                              className={`text-[11px] font-medium ${
                                opp.companyVerified ? "text-emerald-700" : "text-amber-700"
                              }`}
                            >
                              {opp.companyVerified ? "Terverifikasi" : "Belum verifikasi"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-700">
                            <div className="font-bold text-[#181343]">
                              {opp.estimatedBudget ? formatCompactRupiah(opp.estimatedBudget) : "-"}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              {opp.targetCity || "Nasional"}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#181343]">
                            {opp.proposalsCount} masuk
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={st.variant} size="sm" hasDot>
                              {st.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOpp(opp)}
                                className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Tinjau</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenModerateModal(opp)}
                                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${
                                  opp.status === "CLOSED"
                                    ? "border border-slate-300 bg-white hover:bg-slate-50 text-[#181343]"
                                    : "bg-rose-700 hover:bg-rose-800 text-white"
                                }`}
                              >
                                {opp.status === "CLOSED" ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Buka</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Tutup Paksa</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                {oppData.data.map((opp) => {
                  const st = OPPORTUNITY_STATUS_LABELS[opp.status] || {
                    label: opp.status,
                    variant: "slate" as const,
                  };
                  return (
                    <div
                      key={opp.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#181343] line-clamp-2">
                            {opp.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {opp.companyName || "-"} | {getFocusAreaLabel(opp.focusArea)}
                          </p>
                        </div>
                        <Badge variant={st.variant} size="sm" hasDot>
                          {st.label}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-slate-100">
                        <span>
                          Pagu:{" "}
                          <strong className="text-[#181343]">
                            {opp.estimatedBudget ? formatCompactRupiah(opp.estimatedBudget) : "-"}
                          </strong>
                        </span>
                        <span>{opp.proposalsCount} proposal</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedOpp(opp)}
                          className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenModerateModal(opp)}
                          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 ${
                            opp.status === "CLOSED"
                              ? "border border-slate-300 bg-white text-[#181343]"
                              : "bg-rose-700 hover:bg-rose-800 text-white"
                          }`}
                        >
                          {opp.status === "CLOSED" ? "Buka Kembali" : "Tutup Paksa"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <AdminPaginationBar
                page={oppData.page}
                limit={oppData.limit}
                total={oppData.total}
                onPageChange={setOppPage}
              />
            </>
          )}
        </div>
      )}

      {/* TAB 2: PROPOSALS (READ-ONLY) */}
      {activeTab === "proposals" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <label htmlFor="mod-prop-search" className="sr-only">
                  Cari proposal mitra
                </label>
                <Search
                  className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="mod-prop-search"
                  type="text"
                  value={propSearch}
                  onChange={(e) => {
                    setPropSearch(e.target.value);
                    setPropPage(1);
                  }}
                  placeholder="Cari judul proposal, lembaga pengusul, perusahaan tujuan, atau peluang..."
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
                />
              </div>

              <div className="md:col-span-4">
                <label htmlFor="mod-prop-status" className="sr-only">
                  Filter status proposal
                </label>
                <select
                  id="mod-prop-status"
                  value={propStatus}
                  onChange={(e) => {
                    setPropStatus(e.target.value);
                    setPropPage(1);
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
                >
                  <option value="ALL">Semua Status Proposal</option>
                  <option value="SUBMITTED">Terkirim</option>
                  <option value="UNDER_REVIEW">Dalam Tinjauan</option>
                  <option value="REVISION_REQUESTED">Perlu Revisi</option>
                  <option value="ACCEPTED">Disetujui</option>
                  <option value="REJECTED">Ditolak</option>
                  <option value="WITHDRAWN">Ditarik Mitra</option>
                </select>
              </div>
            </div>
          </div>

          {isLoadingProp ? (
            <AdminLoadingState message="Memuat lalu lintas proposal mitra..." />
          ) : propError ? (
            <AdminErrorState message={propError} onRetry={fetchProposals} />
          ) : !propData || propData.data.length === 0 ? (
            <AdminEmptyState
              title="Tidak Ada Proposal Ditemukan"
              description={
                propSearch || propStatus !== "ALL"
                  ? "Tidak ada proposal yang cocok dengan pencarian Anda."
                  : "Belum ada proposal yang diajukan oleh mitra pelaksana."
              }
              actionLabel={propSearch || propStatus !== "ALL" ? "Reset Filter" : undefined}
              onAction={() => {
                setPropSearch("");
                setPropStatus("ALL");
                setPropPage(1);
              }}
            />
          ) : (
            <>
              <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-3.5 px-5">Proposal &amp; Pengusul</th>
                      <th className="py-3.5 px-4">Perusahaan &amp; Peluang Tujuan</th>
                      <th className="py-3.5 px-4">Usulan Anggaran</th>
                      <th className="py-3.5 px-4">Skor AI</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Inspeksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {propData.data.map((prop) => {
                      const st = PROPOSAL_STATUS_LABELS[prop.status] || {
                        label: prop.status,
                        variant: "slate" as const,
                      };
                      return (
                        <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5 max-w-[260px]">
                            <span className="font-bold text-[#181343] block truncate">
                              {prop.title}
                            </span>
                            <span className="text-[11px] text-slate-600 block truncate">
                              Oleh {prop.partnerName || "-"} ({prop.partnerCity || "Indonesia"})
                            </span>
                          </td>
                          <td className="py-4 px-4 max-w-[240px]">
                            <span className="font-semibold text-[#181343] block truncate">
                              {prop.companyName || "-"}
                            </span>
                            <span className="text-[11px] text-slate-600 block truncate">
                              {prop.opportunityTitle || "-"}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#181343]">
                            {formatCompactRupiah(prop.proposedBudget)}
                            <span className="block text-[11px] font-normal text-slate-600">
                              {prop.durationMonths ? `${prop.durationMonths} bulan` : "-"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {prop.aiScore !== null && prop.aiScore !== undefined ? (
                              <span className="font-bold text-emerald-700">{prop.aiScore}/100</span>
                            ) : (
                              <span className="text-slate-600">Belum dinilai</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={st.variant} size="sm" hasDot>
                              {st.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedProposal(prop)}
                              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Detail</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                {propData.data.map((prop) => {
                  const st = PROPOSAL_STATUS_LABELS[prop.status] || {
                    label: prop.status,
                    variant: "slate" as const,
                  };
                  return (
                    <div
                      key={prop.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#181343] line-clamp-2">
                            {prop.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {prop.partnerName || "-"} kepada {prop.companyName || "-"}
                          </p>
                        </div>
                        <Badge variant={st.variant} size="sm" hasDot>
                          {st.label}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-slate-100">
                        <span>
                          RAB: <strong className="text-[#181343]">{formatCompactRupiah(prop.proposedBudget)}</strong>
                        </span>
                        <span>
                          Skor AI:{" "}
                          <strong className="text-emerald-700">
                            {prop.aiScore !== null && prop.aiScore !== undefined ? `${prop.aiScore}/100` : "-"}
                          </strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedProposal(prop)}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span>Inspeksi Proposal</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <AdminPaginationBar
                page={propData.page}
                limit={propData.limit}
                total={propData.total}
                onPageChange={setPropPage}
              />
            </>
          )}
        </div>
      )}

      {/* Modal Detail Peluang */}
      <AdminModal
        isOpen={Boolean(selectedOpp)}
        onClose={() => setSelectedOpp(null)}
        title={selectedOpp ? selectedOpp.title : "Detail Peluang"}
        subtitle={
          selectedOpp
            ? `${selectedOpp.companyName || "-"} | ${getFocusAreaLabel(selectedOpp.focusArea)}`
            : undefined
        }
        maxWidthClass="max-w-2xl"
      >
        {selectedOpp && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-600 block">Estimasi Anggaran</span>
                <span className="font-bold text-[#181343]">
                  {selectedOpp.estimatedBudget ? formatRupiah(selectedOpp.estimatedBudget) : "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">Lokasi Sasaran</span>
                <span className="font-bold text-[#181343]">
                  {selectedOpp.targetCity || "Nasional"}
                  {selectedOpp.targetProvince ? `, ${selectedOpp.targetProvince}` : ""}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">Batas Pengajuan</span>
                <span className="font-bold text-[#181343]">{formatDate(selectedOpp.deadline)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-[#181343] text-sm">Deskripsi Inisiatif</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedOpp.description}
              </p>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Modal Moderasi Peluang */}
      <AdminModal
        isOpen={Boolean(moderatingOpp)}
        onClose={() => setModeratingOpp(null)}
        title={
          moderateTargetStatus === "CLOSED"
            ? "Tutup Paksa Peluang CSR"
            : "Buka Kembali Peluang CSR"
        }
        subtitle={moderatingOpp ? moderatingOpp.title : undefined}
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSubmitModeration} className="space-y-4">
          {moderateError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{moderateError}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            {moderateTargetStatus === "CLOSED"
              ? "Menutup peluang akan menghentikan penerimaan proposal baru dari mitra NGO. Aksi ini dicatat permanen dalam log audit admin."
              : "Membuka kembali peluang membuat mitra NGO dapat kembali mengajukan proposal pada inisiatif ini."}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="moderate-opp-reason" className="block text-xs font-bold text-[#181343]">
              Alasan Moderasi (Wajib Minimal 5 Karakter) *
            </label>
            <textarea
              id="moderate-opp-reason"
              required
              minLength={5}
              rows={3}
              value={moderateReason}
              onChange={(e) => setModerateReason(e.target.value)}
              placeholder="Jelaskan pelanggaran konten, duplikasi, atau hasil klarifikasi dengan perusahaan..."
              className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343] resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setModeratingOpp(null)}
              disabled={isModerating}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isModerating}
              className={`min-h-[44px] px-5 py-2 rounded-xl text-white text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-60 ${
                moderateTargetStatus === "CLOSED"
                  ? "bg-rose-700 hover:bg-rose-800"
                  : "bg-[#181343] hover:bg-[#26224C]"
              }`}
            >
              {isModerating && <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>
                {isModerating
                  ? "Memproses..."
                  : moderateTargetStatus === "CLOSED"
                  ? "Konfirmasi Tutup Paksa"
                  : "Buka Kembali Peluang"}
              </span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Modal Detail Proposal (Read-Only) */}
      <AdminModal
        isOpen={Boolean(selectedProposal)}
        onClose={() => setSelectedProposal(null)}
        title={selectedProposal ? selectedProposal.title : "Inspeksi Proposal"}
        subtitle={
          selectedProposal
            ? `Pengusul: ${selectedProposal.partnerName || "-"} -> ${
                selectedProposal.companyName || "-"
              }`
            : undefined
        }
        maxWidthClass="max-w-2xl"
      >
        {selectedProposal && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-600 block">Anggaran Diajukan</span>
                <span className="font-bold text-[#181343]">
                  {formatRupiah(selectedProposal.proposedBudget)}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">Target Penerima</span>
                <span className="font-bold text-[#181343]">
                  {selectedProposal.targetBeneficiaries || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">Dokumen Proposal</span>
                {selectedProposal.documentUrl ? (
                  <a
                    href={selectedProposal.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Buka PDF</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-slate-600">Tidak ada lampiran</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-[#181343] text-sm">Ringkasan Proposal</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedProposal.summary}
              </p>
            </div>

            {selectedProposal.feedback && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 block">Catatan Review Perusahaan</span>
                <p className="text-amber-900">{selectedProposal.feedback}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}

