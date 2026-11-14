"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminSystemStatusResponse } from "../types";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_TARGET_LABELS,
  formatDateTime,
} from "../helpers";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPaginationBar,
} from "../AdminSharedPrimitives";

function formatAuditSnapshot(raw: string | null): string {
  if (!raw) return "-";
  try {
    const obj = JSON.parse(raw);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(", ");
  } catch {
    return raw;
  }
}

export function AdminSystemAuditView() {
  const [data, setData] = useState<AdminSystemStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [targetType, setTargetType] = useState("ALL");

  const fetchSystem = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "15");
      if (search.trim()) params.set("search", search.trim());
      if (targetType !== "ALL") params.set("targetType", targetType);

      const res = await fetch(`/api/admin/system?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat status sistem dan log audit");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat status sistem dan log audit");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, targetType]);

  useEffect(() => {
    fetchSystem();
  }, [fetchSystem]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sistem, Layanan AI &amp; Log Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pemantauan konfigurasi modul kecerdasan buatan platform serta rekam jejak tindakan administratif Super Admin.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSystem}
          disabled={isLoading}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-700" : "text-slate-600"}`}
            aria-hidden="true"
          />
          <span>Segarkan Status</span>
        </button>
      </div>

      {isLoading && !data ? (
        <AdminLoadingState message="Memuat status konfigurasi AI dan riwayat audit admin..." />
      ) : error && !data ? (
        <AdminErrorState message={error} onRetry={fetchSystem} />
      ) : data ? (
        <>
          {/* AI Config & Usage Metrics */}
          <section
            aria-label="Konfigurasi dan Utilisasi AI Platform"
            className="grid grid-cols-1 lg:grid-cols-12 gap-5"
          >
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#181343]">Konfigurasi Modul AI</h2>
                <Badge variant={data.aiConfig.enabled ? "emerald" : "slate"} size="sm" hasDot>
                  {data.aiConfig.enabled ? "Fitur AI Aktif" : "Fitur AI Nonaktif"}
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                  <span className="text-slate-600">Model LangChain</span>
                  <span className="font-bold text-[#181343]">{data.aiConfig.model}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                  <span className="text-slate-600">Status Koneksi OpenAI</span>
                  <span
                    className={`font-bold ${
                      data.aiConfig.openAiConfigured ? "text-emerald-700" : "text-amber-800"
                    }`}
                  >
                    {data.aiConfig.openAiConfigured
                      ? "API Key Terkonfigurasi"
                      : "Mode Heuristic Fallback"}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h2 className="text-base font-bold text-[#181343]">
                Statistik Utilisasi AI Tercatat di Database
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Proposal Di-Screening
                  </span>
                  <span className="text-2xl font-extrabold text-[#181343] block">
                    {data.aiMetrics.screenedProposalsCount}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Tahapan AI Dibentuk
                  </span>
                  <span className="text-2xl font-extrabold text-[#181343] block">
                    {data.aiMetrics.aiGeneratedStagesCount}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Laporan ESG AI
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700 block">
                    {data.aiMetrics.esgReportsGeneratedCount}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Analisis Sentimen
                  </span>
                  <span className="text-2xl font-extrabold text-[#181343] block">
                    {data.aiMetrics.sentimentAnalyzedProgramsCount}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Audit Logs Section */}
          <section aria-label="Riwayat Log Audit Admin" className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#181343] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#181343]" aria-hidden="true" />
                  <span>Riwayat Log Audit Super Admin</span>
                </h2>
                <span className="text-xs font-semibold text-slate-600">
                  Total {data.auditLogs.total} catatan
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8 relative">
                  <label htmlFor="audit-log-search" className="sr-only">
                    Cari log audit admin
                  </label>
                  <Search
                    className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="audit-log-search"
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari nama sasaran, jenis aksi, eksekutor, atau alasan..."
                    className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
                  />
                </div>

                <div className="md:col-span-4">
                  <label htmlFor="audit-target-filter" className="sr-only">
                    Filter kategori target audit
                  </label>
                  <select
                    id="audit-target-filter"
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value);
                      setPage(1);
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
                  >
                    <option value="ALL">Semua Kategori Sasaran</option>
                    <option value="COMPANY">Perusahaan Sponsor</option>
                    <option value="PARTNER">Mitra NGO</option>
                    <option value="USER">Pengguna Sistem</option>
                    <option value="OPPORTUNITY">Peluang CSR</option>
                    <option value="PROGRAM">Program</option>
                    <option value="SYSTEM">Sistem</option>
                  </select>
                </div>
              </div>
            </div>

            {data.auditLogs.data.length === 0 ? (
              <AdminEmptyState
                title="Belum Ada Catatan Log Audit"
                description={
                  search || targetType !== "ALL"
                    ? "Tidak ada log audit yang cocok dengan pencarian Anda."
                    : "Riwayat audit akan terisi otomatis saat Super Admin melakukan verifikasi, suspensi, moderasi peluang, atau penambahan admin baru."
                }
                actionLabel={search || targetType !== "ALL" ? "Reset Filter" : undefined}
                onAction={() => {
                  setSearch("");
                  setTargetType("ALL");
                  setPage(1);
                }}
              />
            ) : (
              <>
                <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        <th className="py-3.5 px-5">Waktu &amp; Eksekutor</th>
                        <th className="py-3.5 px-4">Aksi Administratif</th>
                        <th className="py-3.5 px-4">Entitas Sasaran</th>
                        <th className="py-3.5 px-4">Perubahan</th>
                        <th className="py-3.5 px-5">Alasan / Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {data.auditLogs.data.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-[#181343] block">
                              {formatDateTime(log.createdAt)}
                            </span>
                            <span className="text-[11px] text-slate-600 block">
                              {log.adminName || "Super Admin"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant="navy" size="sm">
                              {AUDIT_ACTION_LABELS[log.action] || log.action}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#181343] block">
                              {log.targetLabel || log.targetId}
                            </span>
                            <span className="text-[11px] text-slate-600">
                              {AUDIT_TARGET_LABELS[log.targetType] || log.targetType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-700 max-w-[240px]">
                            {log.previousValue && (
                              <div className="text-slate-600 truncate">
                                Sebelum: {formatAuditSnapshot(log.previousValue)}
                              </div>
                            )}
                            {log.newValue && (
                              <div className="font-semibold text-[#181343] truncate">
                                Sesudah: {formatAuditSnapshot(log.newValue)}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-slate-700 max-w-[240px]">
                            {log.reason || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden grid grid-cols-1 gap-3">
                  {data.auditLogs.data.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="navy" size="sm">
                          {AUDIT_ACTION_LABELS[log.action] || log.action}
                        </Badge>
                        <span className="text-[11px] text-slate-600">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      <div className="font-bold text-[#181343]">
                        {log.targetLabel || log.targetId} (
                        {AUDIT_TARGET_LABELS[log.targetType] || log.targetType})
                      </div>
                      <div className="text-slate-600">
                        Oleh: {log.adminName || "Super Admin"}
                      </div>
                      {log.newValue && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-[#181343]">
                          Sesudah: {formatAuditSnapshot(log.newValue)}
                        </div>
                      )}
                      {log.reason && <p className="text-slate-700">Alasan: {log.reason}</p>}
                    </div>
                  ))}
                </div>

                <AdminPaginationBar
                  page={data.auditLogs.page}
                  limit={data.auditLogs.limit}
                  total={data.auditLogs.total}
                  onPageChange={setPage}
                />
              </>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

