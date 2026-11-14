"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Building2,
  ExternalLink,
  Eye,
  FileCheck2,
  Search,
  ShieldCheck,
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
  AdminLoadingState,
  AdminModal,
  AdminPaginationBar,
} from "../AdminSharedPrimitives";
import { TenantModerationModal } from "../TenantModerationModal";

interface AdminCompaniesViewProps {
  onMutated?: () => void;
}

export function AdminCompaniesView({ onMutated }: AdminCompaniesViewProps) {
  const [data, setData] = useState<PaginatedResult<AdminCompanyListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setVerifiedFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 w-full">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Perusahaan Sponsor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Periksa kelengkapan dokumen legalitas korporat (NIB, NPWP, Laporan Keberlanjutan) serta kelola verifikasi dan status akun.
          </p>
        </div>
        {data && (
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#181343] self-start sm:self-auto shrink-0">
            Total {data.total} Perusahaan
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <label htmlFor="admin-company-search" className="sr-only">
              Cari perusahaan
            </label>
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
              placeholder="Cari nama perusahaan, kota, industri, atau email..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="admin-company-status-filter" className="sr-only">
              Filter status perusahaan
            </label>
            <select
              id="admin-company-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
            >
              <option value="ALL">Semua Status Akun</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
              <option value="SUSPENDED">Ditangguhkan</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="admin-company-verified-filter" className="sr-only">
              Filter status verifikasi perusahaan
            </label>
            <select
              id="admin-company-verified-filter"
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
            >
              <option value="ALL">Semua Verifikasi</option>
              <option value="true">Sudah Terverifikasi</option>
              <option value="false">Belum Terverifikasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Views */}
      {isLoading ? (
        <AdminLoadingState message="Memuat direktori perusahaan sponsor..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchCompanies} />
      ) : !data || data.data.length === 0 ? (
        <AdminEmptyState
          title="Tidak Ada Perusahaan Ditemukan"
          description={
            search || statusFilter !== "ALL" || verifiedFilter !== "ALL"
              ? "Tidak ada perusahaan yang cocok dengan filter pencarian Anda."
              : "Belum ada perusahaan sponsor yang menyelesaikan onboarding di platform."
          }
          actionLabel={
            search || statusFilter !== "ALL" || verifiedFilter !== "ALL"
              ? "Reset Filter"
              : undefined
          }
          onAction={handleResetFilters}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-5">Perusahaan &amp; Domisili</th>
                  <th className="py-3.5 px-4">Kelengkapan Legalitas</th>
                  <th className="py-3.5 px-4">Aktivitas</th>
                  <th className="py-3.5 px-4">Verifikasi</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {data.data.map((company) => {
                  const st = ENTITY_STATUS_CONFIG[company.status] || {
                    label: company.status,
                    variant: "slate" as const,
                  };
                  return (
                    <tr key={company.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
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
                            <span className="font-bold text-[#181343] block truncate">
                              {company.name}
                            </span>
                            <span className="text-[11px] text-slate-600 block truncate">
                              {company.industry || "Industri umum"} |{" "}
                              {company.city || "Lokasi belum diisi"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700 space-y-0.5">
                        <div className="text-[11px]">
                          NIB: <span className="font-semibold">{company.nibNumber || "-"}</span>
                        </div>
                        <div className="text-[11px]">
                          NPWP: <span className="font-semibold">{company.npwpNumber || "-"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium">
                        <div>{company.membersCount} anggota</div>
                        <div className="text-[11px] text-slate-600">
                          {company.opportunitiesCount} peluang, {company.programsCount} program
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={company.isVerified ? "emerald" : "amber"} size="sm">
                          {company.isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                        </Badge>
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
                            onClick={() => handleOpenDetail(company.id)}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Detail</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setModeratingCompany(company)}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
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

          {/* Mobile/Tablet Stacked Cards */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.data.map((company) => {
              const st = ENTITY_STATUS_CONFIG[company.status] || {
                label: company.status,
                variant: "slate" as const,
              };
              return (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
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
                        <p className="text-xs text-slate-600 truncate">
                          {company.city || "Kota belum diisi"} | {company.industry || "Umum"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={company.isVerified ? "emerald" : "amber"} size="sm">
                      {company.isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                    </Badge>
                    <Badge variant={st.variant} size="sm" hasDot>
                      {st.label}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-700 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>NIB: {company.nibNumber || "-"}</div>
                    <div>NPWP: {company.npwpNumber || "-"}</div>
                    <div>{company.membersCount} anggota</div>
                    <div>
                      {company.opportunitiesCount} peluang, {company.programsCount} program
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(company.id)}
                      className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      <span>Inspeksi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeratingCompany(company)}
                      className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                    >
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                      <span>Verifikasi</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <AdminPaginationBar
            page={data.page}
            limit={data.limit}
            total={data.total}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Detail Inspection Modal */}
      <AdminModal
        isOpen={Boolean(selectedDetail || isLoadingDetail || detailError)}
        onClose={() => {
          setSelectedDetail(null);
          setDetailError(null);
        }}
        title={selectedDetail ? selectedDetail.name : "Inspeksi Detail Perusahaan"}
        subtitle={
          selectedDetail
            ? `${selectedDetail.industry || "Industri Umum"} | ${selectedDetail.city || "Indonesia"}`
            : undefined
        }
        maxWidthClass="max-w-3xl"
      >
        {isLoadingDetail ? (
          <AdminLoadingState message="Memuat dokumen legalitas dan daftar anggota..." />
        ) : detailError ? (
          <AdminErrorState
            message={detailError}
            onRetry={() => setDetailError(null)}
          />
        ) : selectedDetail ? (
          <div className="space-y-5 text-xs">
            {/* Legalitas & Profil */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-600 block">Nomor Induk Berusaha (NIB)</span>
                <span className="font-bold text-[#181343]">{selectedDetail.nibNumber || "-"}</span>
              </div>
              <div>
                <span className="text-slate-600 block">NPWP Korporat</span>
                <span className="font-bold text-[#181343]">{selectedDetail.npwpNumber || "-"}</span>
              </div>
              <div>
                <span className="text-slate-600 block">Email &amp; Telepon</span>
                <span className="font-semibold text-[#181343]">
                  {selectedDetail.email || "-"} | {selectedDetail.phone || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">Laporan Keberlanjutan</span>
                {selectedDetail.sustainabilityReportUrl ? (
                  <a
                    href={selectedDetail.sustainabilityReportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Buka Dokumen</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-slate-600">Belum diunggah</span>
                )}
              </div>
              {selectedDetail.verificationNotes && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-600 block">Catatan Admin Platform</span>
                  <span className="font-medium text-[#181343]">
                    {selectedDetail.verificationNotes}
                  </span>
                </div>
              )}
            </div>

            {/* Members */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#181343]">
                Anggota Tim Perusahaan ({selectedDetail.members.length})
              </h3>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                {selectedDetail.members.map((m) => {
                  const roleCfg = USER_ROLE_CONFIG[m.role] || {
                    label: m.role,
                    variant: "slate" as const,
                  };
                  return (
                    <div key={m.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-[#181343] truncate">{m.name}</div>
                        <div className="text-[11px] text-slate-600 truncate">
                          {m.email} {m.position ? `| ${m.position}` : ""}
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
            </div>

            {/* Programs summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#181343]">
                Program CSR Terkait ({selectedDetail.programs.length})
              </h3>
              {selectedDetail.programs.length === 0 ? (
                <p className="text-slate-600">Belum ada program yang berjalan.</p>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                  {selectedDetail.programs.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-[#181343] truncate">{p.title}</div>
                        <div className="text-[11px] text-slate-600">
                          Mitra: {p.partnerName || "-"} | Terdaftar {formatDate(p.createdAt)}
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700 shrink-0">
                        {formatCompactRupiah(p.budget)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </AdminModal>

      {/* Moderation Modal */}
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

