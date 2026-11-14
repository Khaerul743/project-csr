"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Activity, Eye, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CsrFocusArea, csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";
import { AdminProgramListItem, PaginatedResult } from "../types";
import {
  FOCUS_AREA_LABELS,
  PROGRAM_STATUS_LABELS,
  formatCompactRupiah,
  formatDate,
  getFocusAreaLabel,
} from "../helpers";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPaginationBar,
} from "../AdminSharedPrimitives";

interface AdminProgramsViewProps {
  onOpenProgramAudit: (programId: string) => void;
}

export function AdminProgramsView({ onOpenProgramAudit }: AdminProgramsViewProps) {
  const [data, setData] = useState<PaginatedResult<AdminProgramListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [focusFilter, setFocusFilter] = useState("ALL");

  const fetchPrograms = useCallback(async () => {
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

      const res = await fetch(`/api/admin/programs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat daftar program CSR");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar program CSR");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, focusFilter]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setFocusFilter("ALL");
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
            Pengawasan Program &amp; Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pantau realisasi tahapan fisik, penyaluran termin dana, dan nota pengeluaran lintas perusahaan serta mitra dalam mode audit read-only.
          </p>
        </div>
        {data && (
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#181343] self-start sm:self-auto shrink-0">
            Total {data.total} Program
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <label htmlFor="admin-prog-search" className="sr-only">
              Cari program CSR
            </label>
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-prog-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama program, kota target, perusahaan, atau mitra..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="admin-prog-focus" className="sr-only">
              Filter bidang fokus program
            </label>
            <select
              id="admin-prog-focus"
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

          <div className="md:col-span-3">
            <label htmlFor="admin-prog-status" className="sr-only">
              Filter status program
            </label>
            <select
              id="admin-prog-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
            >
              <option value="ALL">Semua Status</option>
              <option value="PLANNED">Persiapan</option>
              <option value="IN_PROGRESS">Berjalan</option>
              <option value="COMPLETED">Selesai</option>
              <option value="ON_HOLD">Ditunda</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <AdminLoadingState message="Memuat daftar program CSR lintas organisasi..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchPrograms} />
      ) : !data || data.data.length === 0 ? (
        <AdminEmptyState
          title="Tidak Ada Program Ditemukan"
          description={
            search || statusFilter !== "ALL" || focusFilter !== "ALL"
              ? "Tidak ada program yang sesuai dengan kriteria filter Anda."
              : "Belum ada program pelaksanaan CSR yang terbentuk di platform."
          }
          actionLabel={
            search || statusFilter !== "ALL" || focusFilter !== "ALL"
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
                  <th className="py-3.5 px-5">Program &amp; Pihak Terlibat</th>
                  <th className="py-3.5 px-4">Progres Aktivitas</th>
                  <th className="py-3.5 px-4">Pagu &amp; Pencairan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {data.data.map((prog) => {
                  const st = PROGRAM_STATUS_LABELS[prog.status] || {
                    label: prog.status,
                    variant: "slate" as const,
                  };
                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 max-w-[300px]">
                        <span className="font-bold text-[#181343] block truncate">
                          {prog.title}
                        </span>
                        <span className="text-[11px] text-slate-600 block truncate mt-0.5">
                          {prog.companyName || "-"} &amp; {prog.partnerName || "-"}
                        </span>
                        <span className="text-[11px] text-slate-600 block truncate">
                          {getFocusAreaLabel(prog.focusArea)} | {prog.targetCity || "Nasional"}
                        </span>
                      </td>
                      <td className="py-4 px-4 w-48">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-700">
                            {prog.completedActivitiesCount}/{prog.totalActivitiesCount} tahap
                          </span>
                          <span className="font-bold text-[#181343]">
                            {prog.activityProgressPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-700"
                            style={{ width: `${Math.min(100, prog.activityProgressPercent)}%` }}
                          />
                        </div>
                        {prog.pendingVerificationCount > 0 && (
                          <span className="text-[10px] font-semibold text-amber-800 block mt-1">
                            {prog.pendingVerificationCount} bukti menunggu verifikasi
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-700 space-y-0.5">
                        <div className="font-bold text-[#181343]">
                          Pagu: {formatCompactRupiah(prog.budget)}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Cair: {formatCompactRupiah(prog.disbursedAmount)} | Nota sah:{" "}
                          {formatCompactRupiah(prog.verifiedExpensesAmount)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={st.variant} size="sm" hasDot>
                          {st.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenProgramAudit(prog.id)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                        >
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Audit Program</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.data.map((prog) => {
              const st = PROGRAM_STATUS_LABELS[prog.status] || {
                label: prog.status,
                variant: "slate" as const,
              };
              return (
                <div
                  key={prog.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#181343] line-clamp-2">
                        {prog.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {prog.companyName || "-"} &amp; {prog.partnerName || "-"}
                      </p>
                    </div>
                    <Badge variant={st.variant} size="sm" hasDot>
                      {st.label}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">
                        Tahapan ({prog.completedActivitiesCount}/{prog.totalActivitiesCount})
                      </span>
                      <span className="font-bold text-[#181343]">
                        {prog.activityProgressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-700"
                        style={{ width: `${Math.min(100, prog.activityProgressPercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 pt-2 border-t border-slate-100 space-y-0.5">
                    <div>
                      Pagu: <strong className="text-[#181343]">{formatCompactRupiah(prog.budget)}</strong>
                    </div>
                    <div className="text-slate-600">
                      Termin: {formatCompactRupiah(prog.disbursedAmount)} | Nota sah:{" "}
                      {formatCompactRupiah(prog.verifiedExpensesAmount)} |{" "}
                      {formatDate(prog.updatedAt)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenProgramAudit(prog.id)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" aria-hidden="true" />
                    <span>Buka Detail Audit</span>
                  </button>
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
    </div>
  );
}

