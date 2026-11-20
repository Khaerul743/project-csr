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
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CsrFocusArea, csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import { AdminPartnerDetail, AdminPartnerListItem, PaginatedResult } from "../types";
import {
  ENTITY_STATUS_CONFIG,
  FOCUS_AREA_LABELS,
  PROGRAM_STATUS_LABELS,
  PROPOSAL_STATUS_LABELS,
  USER_ROLE_CONFIG,
  formatCompactRupiah,
  formatDate,
  getFocusAreaLabel,
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

  const partnerStats = useMemo(() => {
    if (!data) return { total: 0, verified: 0, unverified: 0, active: 0 };
    return {
      total: data.total,
      verified: data.data.filter((p) => p.isVerified).length,
      unverified: data.data.filter((p) => !p.isVerified).length,
      active: data.data.filter((p) => p.status === "ACTIVE").length,
    };
  }, [data]);

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
          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs font-semibold text-[#181343] self-start sm:self-auto shrink-0 shadow-2xs">
            Total {data.total} Mitra NGO
          </div>
        )}
      </div>

      {/* 4 Standard KPI Cards (Anti AI-Slop & Seragam dengan Management/Mitra) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          label="Total mitra NGO"
          value={partnerStats.total}
          subtitle="Yayasan &amp; komunitas terdaftar"
          icon={HeartHandshake}
          iconColor="emerald"
        />
        <AdminKpiCard
          label="Terverifikasi resmi"
          value={partnerStats.verified}
          subtitle="SK Kemenkumham &amp; NPWP valid"
          icon={ShieldCheck}
          iconColor="blue"
          valueColor="text-blue-700"
        />
        <AdminKpiCard
          label="Menunggu verifikasi"
          value={partnerStats.unverified}
          subtitle="Antrean tinjauan legalitas"
          icon={Clock}
          iconColor="amber"
          valueColor={partnerStats.unverified > 0 ? "text-amber-600" : "text-[#181343]"}
        />
        <AdminKpiCard
          label="Mitra aktif"
          value={partnerStats.active}
          subtitle="Siap bermitra &amp; eksekusi"
          icon={CheckCircle2}
          iconColor="indigo"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
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
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
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
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Detail</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setModeratingPartner(partner)}
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
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span>Inspeksi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeratingPartner(partner)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
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
            ? `${selectedDetail.organizationType || "NGO/Yayasan"} • ${selectedDetail.city || "Indonesia"} • ${getFocusAreaLabel(
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
          <div className="space-y-6 text-xs">
            {/* Action Bar Inside Dossier (Anti-AI Slop, Seragam dengan Halaman Perusahaan Sponsor) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={selectedDetail.isVerified ? "emerald" : "amber"}
                  size="sm"
                  hasDot
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
                <Badge variant="purple" size="sm">
                  {getFocusAreaLabel(selectedDetail.focusArea)}
                </Badge>
              </div>

              <button
                type="button"
                onClick={() => {
                  const partnerToModerate = data?.data.find((p) => p.id === selectedDetail.id) || {
                    id: selectedDetail.id,
                    name: selectedDetail.name,
                    organizationType: selectedDetail.organizationType,
                    city: selectedDetail.city,
                    focusArea: selectedDetail.focusArea,
                    status: selectedDetail.status,
                    isVerified: selectedDetail.isVerified,
                    verificationNotes: selectedDetail.verificationNotes,
                    membersCount: selectedDetail.members.length,
                    proposalsCount: selectedDetail.proposals.length,
                    programsCount: selectedDetail.programs.length,
                  } as AdminPartnerListItem;
                  setSelectedDetail(null);
                  setModeratingPartner(partnerToModerate);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181343] hover:bg-[#26224C] text-white font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ubah Status &amp; Verifikasi</span>
              </button>
            </div>

            {/* Section 1: Kelengkapan Dokumen Legalitas & Kontak Resmi */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                Kelengkapan Dokumen Legalitas &amp; Kontak Resmi
              </h3>
              <div className="p-4 rounded-xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-medium block">Nomor Legalitas (SK Kemenkumham / Dinsos)</span>
                  <span className="font-mono font-bold text-[#181343] text-sm mt-0.5 block">
                    {selectedDetail.legalNumber || "Belum diisi"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">NPWP Lembaga</span>
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
                  <span className="text-slate-500 font-medium block">Telepon Kantor / PIC</span>
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
                    <span className="text-slate-500 font-medium block">Alamat Sekretariat / Domisili</span>
                    <span className="text-slate-700 mt-0.5 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {selectedDetail.address}
                        {selectedDetail.city ? `, ${selectedDetail.city}` : ""}
                        {selectedDetail.province ? `, ${selectedDetail.province}` : ""}
                      </span>
                    </span>
                  </div>
                )}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-500 font-medium block">Dokumen Portofolio Lembaga</span>
                    <span className="text-slate-700 text-[11px]">
                      {selectedDetail.portfolioDocUrl
                        ? "Berkas portofolio dan rekam jejak resmi telah diunggah."
                        : "Lembaga belum melampirkan berkas dokumen portofolio."}
                    </span>
                  </div>
                  {selectedDetail.portfolioDocUrl && (
                    <a
                      href={selectedDetail.portfolioDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Buka Dokumen Portofolio</span>
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

            {/* Section 2: Pengurus & Pengguna Terdaftar Lembaga */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                  Pengurus &amp; Pengguna Terdaftar ({selectedDetail.members.length})
                </h3>
              </div>
              {selectedDetail.members.length === 0 ? (
                <p className="text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  Belum ada akun tim yang terdaftar di bawah entitas mitra ini.
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

            {/* Section 3: Riwayat Pengajuan Proposal */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                  Riwayat Pengajuan Proposal ({selectedDetail.proposals.length})
                </h3>
              </div>
              {selectedDetail.proposals.length === 0 ? (
                <p className="text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  Mitra ini belum mengajukan proposal kemitraan CSR ke platform.
                </p>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedDetail.proposals.map((prop) => {
                    const st = PROPOSAL_STATUS_LABELS[prop.status] || {
                      label: prop.status,
                      variant: "slate" as const,
                    };
                    return (
                      <div key={prop.id} className="p-3 bg-white flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-[#181343] truncate">{prop.title}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            Tujuan: {prop.companyName || "Perusahaan"} • {prop.opportunityTitle || "Inisiatif CSR"} • {formatDate(prop.createdAt)}
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <div>
                            <span className="font-bold text-[#181343] block">
                              {formatCompactRupiah(prop.proposedBudget)}
                            </span>
                            {prop.aiScore !== null && prop.aiScore !== undefined && (
                              <span className="text-[10px] text-emerald-700 font-semibold block">
                                Skor AI: {prop.aiScore}/100
                              </span>
                            )}
                          </div>
                          <Badge variant={st.variant} size="sm">
                            {st.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 4: Inisiatif Program CSR Dijalankan */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#181343] uppercase tracking-wider">
                  Inisiatif Program CSR Dijalankan ({selectedDetail.programs.length})
                </h3>
              </div>
              {selectedDetail.programs.length === 0 ? (
                <p className="text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  Belum ada program pelaksanaan yang sedang dijalankan oleh mitra ini.
                </p>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedDetail.programs.map((prog) => {
                    const progSt = PROGRAM_STATUS_LABELS[prog.status] || {
                      label: prog.status,
                      variant: "slate" as const,
                    };
                    return (
                      <div key={prog.id} className="p-3 bg-white flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-[#181343] truncate">{prog.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Sponsor: {prog.companyName || "Perusahaan Sponsor"} • Terdaftar {formatDate(prog.createdAt)}
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="font-bold text-emerald-700 block">
                            {formatCompactRupiah(prog.budget)}
                          </span>
                          <Badge variant={progSt.variant} size="sm">
                            {progSt.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
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

