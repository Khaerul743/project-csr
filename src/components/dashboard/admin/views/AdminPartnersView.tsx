"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ExternalLink,
  Eye,
  FileCheck2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CsrFocusArea, csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import { AdminPartnerDetail, AdminPartnerListItem, PaginatedResult } from "../types";
import {
  ENTITY_STATUS_CONFIG,
  FOCUS_AREA_LABELS,
  formatCompactRupiah,
  formatDate,
  getFocusAreaLabel,
} from "../helpers";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminModal,
  AdminPaginationBar,
} from "../AdminSharedPrimitives";
import { TenantModerationModal } from "../TenantModerationModal";

interface AdminPartnersViewProps {
  onMutated?: () => void;
}

export function AdminPartnersView({ onMutated }: AdminPartnersViewProps) {
  const [data, setData] = useState<PaginatedResult<AdminPartnerListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [focusFilter, setFocusFilter] = useState<string>("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("ALL");

  const [selectedDetail, setSelectedDetail] = useState<AdminPartnerDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [moderatingPartner, setModeratingPartner] = useState<AdminPartnerListItem | null>(null);

  const fetchPartners = useCallback(async () => {
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
      if (focusFilter !== "ALL") params.set("focusArea", focusFilter);
      if (verifiedFilter !== "ALL") params.set("isVerified", verifiedFilter);

      const res = await fetch(`/api/admin/partners?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat daftar mitra NGO");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar mitra NGO");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, focusFilter, verifiedFilter]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleOpenDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setDetailError(null);
    setSelectedDetail(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");
      const res = await fetch(`/api/admin/partners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat detail mitra");
      }
      setSelectedDetail(json.data);
    } catch (err: any) {
      setDetailError(err.message || "Gagal memuat detail mitra");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setFocusFilter("ALL");
    setVerifiedFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 w-full">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mitra Pelaksana (NGO &amp; Yayasan)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Inspeksi legalitas lembaga (SK Kemenkumham/Dinsos, NPWP, berkas portofolio) serta validasi verifikasi dan status kepatuhan.
          </p>
        </div>
        {data && (
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#181343] self-start sm:self-auto shrink-0">
            Total {data.total} Mitra NGO
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <label htmlFor="admin-partner-search" className="sr-only">
              Cari mitra NGO
            </label>
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-partner-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama yayasan, kota, tipe lembaga, atau email..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="admin-partner-focus-filter" className="sr-only">
              Filter bidang fokus mitra
            </label>
            <select
              id="admin-partner-focus-filter"
              value={focusFilter}
              onChange={(e) => {
                setFocusFilter(e.target.value);
                setPage(1);
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

          <div className="md:col-span-2">
            <label htmlFor="admin-partner-status-filter" className="sr-only">
              Filter status mitra
            </label>
            <select
              id="admin-partner-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
              <option value="SUSPENDED">Ditangguhkan</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="admin-partner-verified-filter" className="sr-only">
              Filter verifikasi mitra
            </label>
            <select
              id="admin-partner-verified-filter"
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
            >
              <option value="ALL">Semua Verifikasi</option>
              <option value="true">Terverifikasi</option>
              <option value="false">Belum Verifikasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Views */}
      {isLoading ? (
        <AdminLoadingState message="Memuat direktori mitra pelaksana NGO..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchPartners} />
      ) : !data || data.data.length === 0 ? (
        <AdminEmptyState
          title="Tidak Ada Mitra NGO Ditemukan"
          description={
            search || statusFilter !== "ALL" || focusFilter !== "ALL" || verifiedFilter !== "ALL"
              ? "Tidak ada lembaga mitra yang sesuai dengan filter pencarian Anda."
              : "Belum ada mitra pelaksana yang terdaftar di platform."
          }
          actionLabel={
            search || statusFilter !== "ALL" || focusFilter !== "ALL" || verifiedFilter !== "ALL"
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
                  <th className="py-3.5 px-5">Lembaga &amp; Domisili</th>
                  <th className="py-3.5 px-4">Fokus &amp; Legalitas</th>
                  <th className="py-3.5 px-4">Rekam Jejak</th>
                  <th className="py-3.5 px-4">Verifikasi</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {data.data.map((partner) => {
                  const st = ENTITY_STATUS_CONFIG[partner.status] || {
                    label: partner.status,
                    variant: "slate" as const,
                  };
                  return (
                    <tr key={partner.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0 overflow-hidden">
                            {partner.logoUrl ? (
                              <img
                                src={partner.logoUrl}
                                alt={partner.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              partner.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#181343] block truncate">
                              {partner.name}
                            </span>
                            <span className="text-[11px] text-slate-600 block truncate">
                              {partner.organizationType || "NGO/Yayasan"} |{" "}
                              {partner.city || "Lokasi belum diisi"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700 space-y-0.5">
                        <div className="font-semibold text-[#181343]">
                          {getFocusAreaLabel(partner.focusArea)}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          SK/Izin: {partner.legalNumber || "-"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium">
                        <div>{partner.proposalsCount} proposal</div>
                        <div className="text-[11px] text-slate-600">
                          {partner.programsCount} program, {partner.membersCount} admin
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={partner.isVerified ? "emerald" : "amber"} size="sm">
                          {partner.isVerified ? "Terverifikasi" : "Belum Verifikasi"}
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
                            onClick={() => handleOpenDetail(partner.id)}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Detail</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setModeratingPartner(partner)}
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
            {data.data.map((partner) => {
              const st = ENTITY_STATUS_CONFIG[partner.status] || {
                label: partner.status,
                variant: "slate" as const,
              };
              return (
                <div
                  key={partner.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0 overflow-hidden">
                      {partner.logoUrl ? (
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        partner.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#181343] truncate">
                        {partner.name}
                      </h3>
                      <p className="text-xs text-slate-600 truncate">
                        {partner.city || "Kota belum diisi"} | {getFocusAreaLabel(partner.focusArea)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={partner.isVerified ? "emerald" : "amber"} size="sm">
                      {partner.isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                    </Badge>
                    <Badge variant={st.variant} size="sm" hasDot>
                      {st.label}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-700 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="truncate">SK: {partner.legalNumber || "-"}</div>
                    <div className="truncate">NPWP: {partner.npwpNumber || "-"}</div>
                    <div>{partner.proposalsCount} proposal</div>
                    <div>{partner.programsCount} program</div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(partner.id)}
                      className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      <span>Inspeksi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeratingPartner(partner)}
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

      {/* Detail Modal */}
      <AdminModal
        isOpen={Boolean(selectedDetail || isLoadingDetail || detailError)}
        onClose={() => {
          setSelectedDetail(null);
          setDetailError(null);
        }}
        title={selectedDetail ? selectedDetail.name : "Inspeksi Detail Mitra NGO"}
        subtitle={
          selectedDetail
            ? `${selectedDetail.organizationType || "NGO/Yayasan"} | ${getFocusAreaLabel(
                selectedDetail.focusArea
              )}`
            : undefined
        }
        maxWidthClass="max-w-3xl"
      >
        {isLoadingDetail ? (
          <AdminLoadingState message="Memuat dokumen legalitas dan rekam jejak mitra..." />
        ) : detailError ? (
          <AdminErrorState message={detailError} onRetry={() => setDetailError(null)} />
        ) : selectedDetail ? (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-600 block">Nomor Legalitas (SK Kemenkumham / Dinsos)</span>
                <span className="font-bold text-[#181343]">
                  {selectedDetail.legalNumber || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">NPWP Lembaga</span>
                <span className="font-bold text-[#181343]">{selectedDetail.npwpNumber || "-"}</span>
              </div>
              <div>
                <span className="text-slate-600 block">Email &amp; Telepon</span>
                <span className="font-semibold text-[#181343]">
                  {selectedDetail.email || "-"} | {selectedDetail.phone || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">Dokumen Portofolio</span>
                {selectedDetail.portfolioDocUrl ? (
                  <a
                    href={selectedDetail.portfolioDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Buka Berkas Portofolio</span>
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

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#181343]">
                Riwayat Proposal ({selectedDetail.proposals.length})
              </h3>
              {selectedDetail.proposals.length === 0 ? (
                <p className="text-slate-600">Mitra ini belum mengajukan proposal.</p>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                  {selectedDetail.proposals.map((prop) => (
                    <div key={prop.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-[#181343] truncate">{prop.title}</div>
                        <div className="text-[11px] text-slate-600 truncate">
                          Untuk: {prop.companyName || "-"} ({prop.opportunityTitle || "-"}) |{" "}
                          {formatDate(prop.createdAt)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-[#181343] block">
                          {formatCompactRupiah(prop.proposedBudget)}
                        </span>
                        {prop.aiScore !== null && prop.aiScore !== undefined && (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            Skor AI: {prop.aiScore}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#181343]">
                Program Dijalankan ({selectedDetail.programs.length})
              </h3>
              {selectedDetail.programs.length === 0 ? (
                <p className="text-slate-600">Belum ada program pelaksanaan.</p>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                  {selectedDetail.programs.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-[#181343] truncate">{p.title}</div>
                        <div className="text-[11px] text-slate-600">
                          Sponsor: {p.companyName || "-"} | {formatDate(p.createdAt)}
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

      {moderatingPartner && (
        <TenantModerationModal
          isOpen={Boolean(moderatingPartner)}
          entityType="PARTNER"
          entityId={moderatingPartner.id}
          entityName={moderatingPartner.name}
          currentStatus={moderatingPartner.status}
          currentVerified={moderatingPartner.isVerified}
          currentNotes={moderatingPartner.verificationNotes}
          onClose={() => setModeratingPartner(null)}
          onUpdated={() => {
            fetchPartners();
            onMutated?.();
          }}
        />
      )}
    </div>
  );
}

