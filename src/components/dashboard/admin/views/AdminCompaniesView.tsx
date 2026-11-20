"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminCompanyDetail, AdminCompanyListItem, PaginatedResult } from "../types";
import {
  ENTITY_STATUS_CONFIG,
  USER_ROLE_CONFIG,
  formatCompactRupiah,
  formatDate,
} from "../helpers";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminKpiCard,
  AdminLoadingState,
  AdminModal,
  AdminPaginationBar,
} from "../AdminSharedPrimitives";
import { TenantModerationModal } from "../TenantModerationModal";

interface AdminCompaniesViewProps {
  onMutated?: () => void;
}

type QuickFilterTab = "ALL" | "UNVERIFIED" | "VERIFIED" | "SUSPENDED";

export function AdminCompaniesView({ onMutated }: AdminCompaniesViewProps) {
  const [data, setData] = useState<PaginatedResult<AdminCompanyListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<QuickFilterTab>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("ALL");

  // Detail modal state
  const [selectedDetail, setSelectedDetail] = useState<AdminCompanyDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Moderation modal state
  const [moderatingCompany, setModeratingCompany] = useState<AdminCompanyListItem | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (verifiedFilter !== "ALL") params.set("isVerified", verifiedFilter);

      const res = await fetch(`/api/admin/companies?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat daftar perusahaan");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar perusahaan");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, verifiedFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleOpenDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setDetailError(null);
    setSelectedDetail(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");
      const res = await fetch(`/api/admin/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat detail perusahaan");
      }
      setSelectedDetail(json.data);
    } catch (err: any) {
      setDetailError(err.message || "Gagal memuat detail perusahaan");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleTabChange = (tab: QuickFilterTab) => {
    setActiveTab(tab);
    setPage(1);
    if (tab === "ALL") {
      setStatusFilter("ALL");
      setVerifiedFilter("ALL");
    } else if (tab === "UNVERIFIED") {
      setStatusFilter("ALL");
      setVerifiedFilter("false");
    } else if (tab === "VERIFIED") {
      setStatusFilter("ALL");
      setVerifiedFilter("true");
    } else if (tab === "SUSPENDED") {
      setStatusFilter("SUSPENDED");
      setVerifiedFilter("ALL");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setActiveTab("ALL");
    setStatusFilter("ALL");
    setVerifiedFilter("ALL");
    setPage(1);
  };

  const companyStats = useMemo(() => {
    if (data?.summary) {
      return {
        total: data.summary.total,
        verified: data.summary.verified,
        unverified: data.summary.unverified,
        active: data.summary.active,
        suspended: data.summary.suspended,
      };
    }
    if (!data) return { total: 0, verified: 0, unverified: 0, active: 0, suspended: 0 };
    return {
      total: data.total,
      verified: data.data.filter((c) => c.isVerified).length,
      unverified: data.data.filter((c) => !c.isVerified).length,
      active: data.data.filter((c) => c.status === "ACTIVE").length,
      suspended: data.data.filter((c) => c.status === "SUSPENDED").length,
    };
  }, [data]);

  const complianceRate = useMemo(() => {
    if (companyStats.total === 0) return 100;
    return Math.round((companyStats.verified / companyStats.total) * 100);
  }, [companyStats]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Perusahaan Sponsor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pengawasan direktori korporasi sponsor, uji tuntas dokumen legalitas (NIB &amp; NPWP), serta tata kelola status akun operasional.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => fetchCompanies()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#181343]" : "text-slate-600"}`}
              aria-hidden="true"
            />
            <span>Segarkan Data</span>
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#181343] shadow-2xs">
            {companyStats.total} Entitas Terdaftar
          </div>
        </div>
      </div>

      {/* 4 Standard Executive KPI Metric Cards (Faktual, Anti AI-Slop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          label="Total perusahaan sponsor"
          value={companyStats.total}
          subtitle={`${companyStats.active} akun beroperasi aktif di platform`}
          icon={Building2}
        />
        <AdminKpiCard
          label="Kepatuhan verifikasi legal"
          value={`${complianceRate}%`}
          subtitle={`${companyStats.verified} dari ${companyStats.total} entitas lolos verifikasi berkas`}
          icon={ShieldCheck}
          valueColor="text-emerald-700"
        />
        <AdminKpiCard
          label="Perlu audit legalitas"
          value={companyStats.unverified}
          subtitle={
            companyStats.unverified > 0
              ? `${companyStats.unverified} entitas menunggu tinjauan berkas`
              : "Seluruh berkas perusahaan telah terverifikasi"
          }
          icon={Clock}
          valueColor={companyStats.unverified > 0 ? "text-amber-600" : "text-[#181343]"}
        />
        <AdminKpiCard
          label="Status pengawasan akun"
          value={companyStats.suspended > 0 ? `${companyStats.suspended} Ditangguhkan` : "Nir-Sanksi"}
          subtitle={
            companyStats.suspended > 0
              ? `${companyStats.suspended} perusahaan dalam sanksi penangguhan`
              : "Semua akun beroperasi dalam koridor kepatuhan"
          }
          icon={companyStats.suspended > 0 ? ShieldAlert : CheckCircle2}
          valueColor={companyStats.suspended > 0 ? "text-rose-600" : "text-emerald-700"}
        />
      </div>

      {/* Main Corporate Directory Card */}
      <section
        aria-label="Direktori Perusahaan Sponsor"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4"
      >
        {/* Controls Bar: Segmented Quick Filter Tabs & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#181343]">
                Daftar Korporasi &amp; Mitra Finansial CSR
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Pilih filter status untuk meninjau entitas yang membutuhkan tindakan verifikasi admin.
              </p>
            </div>

            {/* Segmented Filter Pills (Style Kapsul Rapi) */}
            <div
              role="tablist"
              aria-label="Filter status perusahaan"
              className="flex items-center gap-2 overflow-x-auto max-w-full pb-1"
            >
              {[
                {
                  id: "ALL" as const,
                  label: "Semua",
                  count: companyStats.total,
                },
                {
                  id: "UNVERIFIED" as const,
                  label: "Perlu Verifikasi",
                  count: companyStats.unverified,
                  highlight: companyStats.unverified > 0,
                },
                {
                  id: "VERIFIED" as const,
                  label: "Terverifikasi Resmi",
                  count: companyStats.verified,
                },
                {
                  id: "SUSPENDED" as const,
                  label: "Ditangguhkan",
                  count: companyStats.suspended,
                },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-2 shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] ${
                      isSelected
                        ? "bg-[#181343] text-white border-[#181343] shadow-xs font-bold"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold tabular-nums flex items-center justify-center ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : tab.highlight
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Input with Clear Button */}
          <div className="relative">
            <label htmlFor="admin-company-search" className="sr-only">
              Cari perusahaan sponsor
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-company-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari berdasarkan nama perusahaan, kota domisili, sektor industri, atau email resmi..."
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#181343] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#181343] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Data View */}
        <div className="p-4 sm:p-5 pt-0">
          {isLoading ? (
            <AdminLoadingState message="Memuat direktori perusahaan sponsor..." />
          ) : error ? (
            <AdminErrorState message={error} onRetry={fetchCompanies} />
          ) : !data || data.data.length === 0 ? (
            <AdminEmptyState
              title="Tidak Ada Perusahaan Ditemukan"
              description={
                search || activeTab !== "ALL"
                  ? "Tidak ada perusahaan sponsor yang cocok dengan kriteria filter saat ini."
                  : "Belum ada entitas perusahaan sponsor yang menyelesaikan onboarding di platform."
              }
              actionLabel={search || activeTab !== "ALL" ? "Reset Filter" : undefined}
              onAction={handleResetFilters}
            />
          ) : (
            <>
              {/* Desktop Table: Clean Executive Layout */}
              <div className="hidden lg:block rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-3.5 px-5">Perusahaan &amp; Domisili</th>
                      <th className="py-3.5 px-4">Dokumen Legalitas</th>
                      <th className="py-3.5 px-4">Aktivitas Program</th>
                      <th className="py-3.5 px-4">Status &amp; Verifikasi</th>
                      <th className="py-3.5 px-5 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {data.data.map((company) => {
                      const st = ENTITY_STATUS_CONFIG[company.status] || {
                        label: company.status,
                        variant: "slate" as const,
                      };
                      return (
                        <tr
                          key={company.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Col 1: Identity & Location */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#181343] text-xs shrink-0 overflow-hidden">
                                {company.logoUrl ? (
                                  <img
                                    src={company.logoUrl}
                                    alt={company.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  company.name.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#181343] truncate block">
                                    {company.name}
                                  </span>
                                  {company.isVerified && (
                                    <ShieldCheck
                                      className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                                      aria-label="Terverifikasi Resmi"
                                    />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                                  <span>{company.industry || "Industri Umum"}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {company.city || "Lokasi belum diisi"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Legal Documentation */}
                          <td className="py-4 px-4 text-slate-700">
                            <div className="space-y-1">
                              <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                                <span className="font-bold text-slate-500 font-sans">NIB:</span>
                                <span className="font-semibold text-[#181343]">
                                  {company.nibNumber || "Belum diisi"}
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                                <span className="font-bold text-slate-500 font-sans">NPWP:</span>
                                <span className="font-semibold text-[#181343]">
                                  {company.npwpNumber || "Belum diisi"}
                                </span>
                              </div>
                              {company.sustainabilityReportUrl && (
                                <a
                                  href={company.sustainabilityReportUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline pt-0.5"
                                >
                                  <FileCheck2 className="w-3 h-3" />
                                  <span>Laporan Keberlanjutan</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Col 3: Programs & Team */}
                          <td className="py-4 px-4 text-slate-700">
                            <div className="space-y-1">
                              <span className="font-semibold text-[#181343] block">
                                {company.programsCount} Inisiatif Program CSR
                              </span>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>{company.opportunitiesCount} Peluang Kemitraan</span>
                                <span>•</span>
                                <span>{company.membersCount} Anggota Tim</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 4: Status & Verification Badges */}
                          <td className="py-4 px-4">
                            <div className="space-y-1.5">
                              <div>
                                <Badge
                                  variant={company.isVerified ? "emerald" : "amber"}
                                  size="sm"
                                >
                                  {company.isVerified ? "Terverifikasi Resmi" : "Belum Verifikasi"}
                                </Badge>
                              </div>
                              <div>
                                <Badge variant={st.variant} size="sm" hasDot>
                                  {st.label}
                                </Badge>
                              </div>
                            </div>
                          </td>

                          {/* Col 5: Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(company.id)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                                <span>Inspeksi</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setModeratingCompany(company)}
                                className="px-3.5 py-1.5 rounded-lg bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Kelola</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Stacked Cards (Sesuai Standar Anti-Slop) */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {data.data.map((company) => {
                  const st = ENTITY_STATUS_CONFIG[company.status] || {
                    label: company.status,
                    variant: "slate" as const,
                  };
                  return (
                    <div
                      key={company.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#181343] text-xs shrink-0 overflow-hidden">
                            {company.logoUrl ? (
                              <img
                                src={company.logoUrl}
                                alt={company.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              company.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#181343] truncate">
                              {company.name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {company.industry || "Industri Umum"} • {company.city || "Kota belum diisi"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={company.isVerified ? "emerald" : "amber"}
                          size="sm"
                        >
                          {company.isVerified ? "Terverifikasi Resmi" : "Belum Verifikasi"}
                        </Badge>
                        <Badge variant={st.variant} size="sm" hasDot>
                          {st.label}
                        </Badge>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">NIB Korporat:</span>
                          <span className="font-mono font-semibold text-[#181343]">
                            {company.nibNumber || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">NPWP Perusahaan:</span>
                          <span className="font-mono font-semibold text-[#181343]">
                            {company.npwpNumber || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">Program &amp; Mitra:</span>
                          <span className="font-semibold text-[#181343]">
                            {company.programsCount} Program, {company.opportunitiesCount} Peluang
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(company.id)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                          <span>Inspeksi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setModeratingCompany(company)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Kelola</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="pt-4 border-t border-slate-100">
                <AdminPaginationBar
                  page={data.page}
                  limit={data.limit}
                  total={data.total}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Comprehensive Corporate Audit Dossier Modal */}
      <AdminModal
        isOpen={Boolean(selectedDetail || isLoadingDetail || detailError)}
        onClose={() => {
          setSelectedDetail(null);
          setDetailError(null);
        }}
        title={selectedDetail ? selectedDetail.name : "Inspeksi Detail Perusahaan"}
        subtitle={
          selectedDetail
            ? `${selectedDetail.industry || "Industri Umum"} • ${selectedDetail.city || "Indonesia"}`
            : undefined
        }
        maxWidthClass="max-w-3xl"
      >
        {isLoadingDetail ? (
          <AdminLoadingState message="Memuat berkas legalitas dan rincian portofolio perusahaan..." />
        ) : detailError ? (
          <AdminErrorState
            message={detailError}
            onRetry={() => setDetailError(null)}
          />
        ) : selectedDetail ? (
          <div className="space-y-6 text-xs">
            {/* Action Bar Inside Dossier */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant={selectedDetail.isVerified ? "emerald" : "amber"}
                  size="sm"
                >
                  {selectedDetail.isVerified ? "Terverifikasi Resmi" : "Belum Verifikasi"}
                </Badge>
                <Badge
                  variant={
                    selectedDetail.status === "ACTIVE"
                      ? "emerald"
                      : selectedDetail.status === "SUSPENDED"
                      ? "rose"
                      : "slate"
                  }
                  size="sm"
                  hasDot
                >
                  {selectedDetail.status === "ACTIVE"
                    ? "Akun Aktif"
                    : selectedDetail.status === "SUSPENDED"
                    ? "Akun Ditangguhkan"
                    : "Akun Nonaktif"}
                </Badge>
              </div>

              <button
                type="button"
                onClick={() => {
                  const companyToModerate = data?.data.find((c) => c.id === selectedDetail.id) || {
                    id: selectedDetail.id,
                    name: selectedDetail.name,
                    industry: selectedDetail.industry,
                    city: selectedDetail.city,
                    status: selectedDetail.status,
                    isVerified: selectedDetail.isVerified,
                    verificationNotes: selectedDetail.verificationNotes,
                    membersCount: selectedDetail.members.length,
                    opportunitiesCount: selectedDetail.opportunities.length,
                    programsCount: selectedDetail.programs.length,
                  } as AdminCompanyListItem;
                  setSelectedDetail(null);
                  setModeratingCompany(companyToModerate);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181343] hover:bg-[#26224C] text-white font-semibold text-xs transition-colors self-start sm:self-auto"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ubah Status &amp; Verifikasi</span>
              </button>
            </div>

            {/* Section 1: Dokumen Legalitas & Kontak Resmi */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                Kelengkapan Dokumen Legalitas &amp; Alamat
              </h3>
              <div className="p-4 rounded-xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-medium block">Nomor Induk Berusaha (NIB)</span>
                  <span className="font-mono font-bold text-[#181343] text-sm mt-0.5 block">
                    {selectedDetail.nibNumber || "Belum diisi"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">NPWP Badan Usaha</span>
                  <span className="font-mono font-bold text-[#181343] text-sm mt-0.5 block">
                    {selectedDetail.npwpNumber || "Belum diisi"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Kontak Email Resmi</span>
                  <span className="font-semibold text-[#181343] flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedDetail.email || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Telepon Kantor</span>
                  <span className="font-semibold text-[#181343] flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedDetail.phone || "-"}
                  </span>
                </div>
                {selectedDetail.website && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-medium block">Situs Web Resmi</span>
                    <a
                      href={selectedDetail.website.startsWith("http") ? selectedDetail.website : `https://${selectedDetail.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:underline mt-0.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{selectedDetail.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {selectedDetail.address && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-medium block">Alamat Kantor Pusat</span>
                    <span className="text-slate-700 mt-0.5 block">
                      {selectedDetail.address}, {selectedDetail.city}, {selectedDetail.province}
                    </span>
                  </div>
                )}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-500 font-medium block">Laporan Keberlanjutan Perusahaan</span>
                    <span className="text-slate-700 text-[11px]">
                      {selectedDetail.sustainabilityReportUrl
                        ? "Dokumen pertanggungjawaban keberlanjutan telah diunggah."
                        : "Perusahaan belum melampirkan berkas laporan keberlanjutan."}
                    </span>
                  </div>
                  {selectedDetail.sustainabilityReportUrl && (
                    <a
                      href={selectedDetail.sustainabilityReportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Buka Dokumen</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
                {selectedDetail.verificationNotes && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                    <span className="text-amber-900 font-bold block">Catatan Verifikasi Admin Platform</span>
                    <p className="text-amber-800 mt-0.5">
                      {selectedDetail.verificationNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Anggota Tim & Pengguna Terdaftar */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                  Pengguna Terdaftar Perusahaan ({selectedDetail.members.length})
                </h3>
              </div>
              {selectedDetail.members.length === 0 ? (
                <p className="text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  Belum ada akun tim yang terdaftar di bawah entitas ini.
                </p>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedDetail.members.map((m) => {
                    const roleCfg = USER_ROLE_CONFIG[m.role] || {
                      label: m.role,
                      variant: "slate" as const,
                    };
                    return (
                      <div key={m.id} className="p-3 bg-white flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-[#181343] truncate">{m.name}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {m.email} {m.position ? `• ${m.position}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant={roleCfg.variant} size="sm">
                            {roleCfg.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 3: Inisiatif Program CSR Terkait */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                  Inisiatif Program CSR Terkait ({selectedDetail.programs.length})
                </h3>
              </div>
              {selectedDetail.programs.length === 0 ? (
                <p className="text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  Perusahaan belum memiliki program CSR yang terdaftar aktif di platform.
                </p>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedDetail.programs.map((p) => (
                    <div key={p.id} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-[#181343] truncate">{p.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Mitra: {p.partnerName || "Mitra Lapangan"} • Terdaftar {formatDate(p.createdAt)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-emerald-700 block">
                          {formatCompactRupiah(p.budget)}
                        </span>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </AdminModal>

      {/* Moderation & Legal Verification Modal */}
      {moderatingCompany && (
        <TenantModerationModal
          isOpen={Boolean(moderatingCompany)}
          entityType="COMPANY"
          entityId={moderatingCompany.id}
          entityName={moderatingCompany.name}
          currentStatus={moderatingCompany.status}
          currentVerified={moderatingCompany.isVerified}
          currentNotes={moderatingCompany.verificationNotes}
          onClose={() => setModeratingCompany(null)}
          onUpdated={() => {
            fetchCompanies();
            onMutated?.();
          }}
        />
      )}
    </div>
  );
}
