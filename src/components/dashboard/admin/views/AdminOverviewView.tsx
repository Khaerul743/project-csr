"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  HeartHandshake,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminNavMenu, AdminOverviewResponse } from "../types";
import {
  formatCompactRupiah,
  formatDate,
  formatRupiah,
  getFocusAreaLabel,
} from "../helpers";
import { AdminErrorState, AdminLoadingState } from "../AdminSharedPrimitives";

interface AdminOverviewViewProps {
  overview: AdminOverviewResponse | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onNavigateMenu: (menu: AdminNavMenu) => void;
  onOpenProgramAudit?: (programId: string) => void;
}

export function AdminOverviewView({
  overview,
  isLoading,
  error,
  onRefresh,
  onNavigateMenu,
  onOpenProgramAudit,
}: AdminOverviewViewProps) {
  const [queueTab, setQueueTab] = useState<"verification" | "programs">("verification");
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  if (isLoading && !overview) {
    return <AdminLoadingState message="Memuat ringkasan ekosistem dan metrik platform..." />;
  }

  if (error && !overview) {
    return <AdminErrorState message={error} onRetry={onRefresh} />;
  }

  if (!overview) {
    return (
      <AdminErrorState
        message="Data ringkasan platform belum tersedia saat ini."
        onRetry={onRefresh}
      />
    );
  }

  const { kpis, monthlyTrends, focusAreaDistribution, conversionFunnel, escalationQueue } =
    overview;

  const totalPendingVerification =
    escalationQueue.unverifiedCompanies.length + escalationQueue.unverifiedPartners.length;
  const totalProgramIssues =
    escalationQueue.flaggedPrograms.length + escalationQueue.lowRatedPrograms.length;

  const maxTrendValue = Math.max(
    1,
    ...monthlyTrends.map((m) => m.newCompanies + m.newPartners + m.newUsers + m.newPrograms)
  );
  const maxFunnelValue = Math.max(
    1,
    conversionFunnel.openOpportunities,
    conversionFunnel.submittedProposals,
    conversionFunnel.agreedCollaborations,
    conversionFunnel.activeOrCompletedPrograms
  );
  const maxFocusPrograms = Math.max(
    1,
    ...focusAreaDistribution.map((f) => f.programCount)
  );

  const activeMonth =
    monthlyTrends.find((m) => m.monthKey === selectedMonthKey) ||
    monthlyTrends[monthlyTrends.length - 1] ||
    null;

  return (
    <div className="space-y-6">
      {/* Header Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ringkasan Ekosistem Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pemantauan lintas perusahaan sponsor, mitra pelaksana NGO, dan realisasi pendanaan CSR.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-700" : "text-slate-600"}`}
            aria-hidden="true"
          />
          <span>{isLoading ? "Memperbarui..." : "Segarkan Metrik"}</span>
        </button>
      </div>

      {/* Band 1: Focal Financial & Platform Commitment Anchor */}
      <section
        aria-label="Komitmen Pendanaan dan Eksekusi Ekosistem"
        className="rounded-2xl bg-[#181343] text-white p-5 sm:p-7 border border-[#26224C]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Akumulasi Komitmen Dana MoU
            </p>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {formatRupiah(kpis.totalCommittedBudget)}
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Tersebar pada {kpis.totalPrograms} program CSR lintas {kpis.totalCompanies} perusahaan dan{" "}
              {kpis.totalPartners} mitra NGO.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 lg:pt-0 lg:border-l lg:border-white/15 lg:pl-6">
            <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-slate-200 block">Termin Disalurkan</span>
              <span className="text-lg sm:text-xl font-bold text-white block">
                {formatCompactRupiah(kpis.totalDisbursedFunds)}
              </span>
              <span className="text-[11px] text-emerald-200 block">
                {kpis.agreedCollaborations} MoU disepakati
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-slate-200 block">Nota Terverifikasi</span>
              <span className="text-lg sm:text-xl font-bold text-white block">
                {formatCompactRupiah(kpis.totalVerifiedExpenses)}
              </span>
              <span className="text-[11px] text-slate-200 block">
                Serapan tercatat: {formatCompactRupiah(kpis.totalSpentBudget)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-slate-200 block">Status Pelaksanaan</span>
              <span className="text-lg sm:text-xl font-bold text-white block">
                {kpis.inProgressPrograms} Berjalan / {kpis.completedPrograms} Selesai
              </span>
              <span className="text-[11px] text-amber-200 block">
                {kpis.onHoldPrograms + kpis.cancelledPrograms} ditunda atau dibatalkan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Band 2: Action Queue (7 cols) + Funnel & Tenant Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Antrean Tinjauan & Eskalasi */}
        <section
          aria-label="Antrean Tinjauan dan Eskalasi"
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#181343]">
                Antrean Tinjauan &amp; Eskalasi
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Entitas yang memerlukan pemeriksaan legalitas atau perhatian pengawasan.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Kategori antrean tinjauan"
              className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto"
            >
              <button
                type="button"
                role="tab"
                aria-selected={queueTab === "verification"}
                onClick={() => setQueueTab("verification")}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#181343] ${
                  queueTab === "verification"
                    ? "bg-white text-[#181343] shadow-2xs font-bold"
                    : "text-slate-600 hover:text-[#181343]"
                }`}
              >
                Verifikasi ({totalPendingVerification})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={queueTab === "programs"}
                onClick={() => setQueueTab("programs")}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#181343] ${
                  queueTab === "programs"
                    ? "bg-white text-[#181343] shadow-2xs font-bold"
                    : "text-slate-600 hover:text-[#181343]"
                }`}
              >
                Program Bermasalah ({totalProgramIssues})
              </button>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {queueTab === "verification" ? (
              totalPendingVerification === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto" aria-hidden="true" />
                  <p className="text-sm font-bold text-[#181343]">
                    Semua Organisasi Sudah Terverifikasi
                  </p>
                  <p className="text-xs text-slate-600">
                    Tidak ada antrean perusahaan atau mitra yang menunggu pemeriksaan legalitas.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                  {escalationQueue.unverifiedCompanies.map((c) => (
                    <div
                      key={`comp-${c.id}`}
                      className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#181343] flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-[#181343] truncate">
                              {c.name}
                            </span>
                            <Badge variant="amber" size="sm">
                              Perusahaan
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">
                            {c.city || "Kota belum diisi"} | Terdaftar {formatDate(c.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigateMenu("companies")}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                      >
                        Tinjau Perusahaan
                      </button>
                    </div>
                  ))}

                  {escalationQueue.unverifiedPartners.map((p) => (
                    <div
                      key={`part-${p.id}`}
                      className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-[#181343] truncate">
                              {p.name}
                            </span>
                            <Badge variant="purple" size="sm">
                              Mitra NGO
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">
                            {p.city || "Kota belum diisi"} | {getFocusAreaLabel(p.focusArea)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigateMenu("partners")}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                      >
                        Tinjau Mitra
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : totalProgramIssues === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto" aria-hidden="true" />
                <p className="text-sm font-bold text-[#181343]">
                  Seluruh Program Berjalan Normal
                </p>
                <p className="text-xs text-slate-600">
                  Tidak ditemukan program dengan status ditunda, dibatalkan, atau rating rendah.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {escalationQueue.flaggedPrograms.map((fp) => (
                  <div
                    key={`flag-${fp.id}`}
                    className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[#181343] truncate">
                            {fp.title}
                          </span>
                          <Badge
                            variant={fp.status === "CANCELLED" ? "rose" : "amber"}
                            size="sm"
                          >
                            {fp.status === "CANCELLED" ? "Dibatalkan" : "Ditunda"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 truncate">
                          {fp.companyName || "Perusahaan"} &amp; {fp.partnerName || "Mitra"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="text-[11px] font-medium text-slate-600">
                        Update {formatDate(fp.updatedAt)}
                      </span>
                      {onOpenProgramAudit && (
                        <button
                          type="button"
                          onClick={() => onOpenProgramAudit(fp.id)}
                          className="min-h-[44px] px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                        >
                          Audit Program
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {escalationQueue.lowRatedPrograms.map((lr) => (
                  <div
                    key={`low-${lr.id}`}
                    className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[#181343] truncate">
                            {lr.title}
                          </span>
                          <Badge variant="rose" size="sm">
                            Rating {lr.avgRating}/5 ({lr.reviewCount} ulasan)
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 truncate">
                          {lr.companyName || "Perusahaan"} &amp; {lr.partnerName || "Mitra"}
                        </p>
                      </div>
                    </div>
                    {onOpenProgramAudit && (
                      <button
                        type="button"
                        onClick={() => onOpenProgramAudit(lr.id)}
                        className="min-h-[44px] px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] transition-colors shrink-0 self-end sm:self-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                      >
                        Audit Program
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right: Ekosistem & Corong Konversi */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Tenant Health Directory Links */}
          <section
            aria-label="Ringkasan Organisasi dan Pengguna"
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5"
          >
            <h2 className="text-base font-bold text-[#181343]">
              Populasi Ekosistem Terdaftar
            </h2>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigateMenu("companies")}
                className="w-full min-h-[44px] p-3.5 rounded-xl border border-slate-200 hover:border-[#181343]/40 hover:bg-slate-50 flex items-center justify-between gap-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Building2 className="w-5 h-5 text-[#181343] shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="text-xs font-bold text-[#181343] block">
                      Perusahaan Sponsor
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      {kpis.verifiedCompanies} terverifikasi, {kpis.suspendedCompanies} ditangguhkan
                    </span>
                  </span>
                </span>
                <span className="text-lg font-extrabold text-[#181343] shrink-0">
                  {kpis.totalCompanies}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateMenu("partners")}
                className="w-full min-h-[44px] p-3.5 rounded-xl border border-slate-200 hover:border-[#181343]/40 hover:bg-slate-50 flex items-center justify-between gap-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <HeartHandshake className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="text-xs font-bold text-[#181343] block">
                      Mitra Pelaksana NGO
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      {kpis.verifiedPartners} terverifikasi, {kpis.suspendedPartners} ditangguhkan
                    </span>
                  </span>
                </span>
                <span className="text-lg font-extrabold text-[#181343] shrink-0">
                  {kpis.totalPartners}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateMenu("users")}
                className="w-full min-h-[44px] p-3.5 rounded-xl border border-slate-200 hover:border-[#181343]/40 hover:bg-slate-50 flex items-center justify-between gap-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Users className="w-5 h-5 text-[#181343] shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="text-xs font-bold text-[#181343] block">
                      Akun Pengguna Sistem
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      {kpis.activeUsers} aktif, {kpis.stagingUsers} belum onboarding,{" "}
                      {kpis.superAdmins} admin
                    </span>
                  </span>
                </span>
                <span className="text-lg font-extrabold text-[#181343] shrink-0">
                  {kpis.totalUsers}
                </span>
              </button>
            </div>
          </section>

          {/* Funnel Konversi */}
          <section
            aria-label="Corong Konversi Inisiatif hingga Program"
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-[#181343]">
                Dari Peluang ke Program Lapangan
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Jumlah tahapan siklus kemitraan yang tercatat di platform saat ini.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Peluang CSR Terbuka",
                  count: conversionFunnel.openOpportunities,
                  barColor: "bg-[#181343]",
                },
                {
                  label: "Proposal Mitra Diajukan",
                  count: conversionFunnel.submittedProposals,
                  barColor: "bg-slate-600",
                },
                {
                  label: "Kesepakatan MoU Sah",
                  count: conversionFunnel.agreedCollaborations,
                  barColor: "bg-emerald-700",
                },
                {
                  label: "Program Aktif & Selesai",
                  count: conversionFunnel.activeOrCompletedPrograms,
                  barColor: "bg-emerald-600",
                },
              ].map((step) => {
                const pct = Math.max(6, Math.round((step.count / maxFunnelValue) * 100));
                return (
                  <div key={step.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{step.label}</span>
                      <span className="font-bold text-[#181343]">{step.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${step.barColor}`}
                        style={{ width: `${step.count === 0 ? 0 : pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Band 3: Growth Chart + Focus Area Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Trend Bar Visualization */}
        <section
          aria-label="Pertumbuhan 6 Bulan Terakhir"
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#181343]">
                Pertumbuhan Entitas per Bulan (6 Bulan Terakhir)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Pilih salah satu bulan untuk melihat rincian penambahan organisasi, pengguna, dan program.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-44 pt-4 border-b border-slate-200 pb-3">
            {monthlyTrends.map((m) => {
              const totalMonth =
                m.newCompanies + m.newPartners + m.newUsers + m.newPrograms;
              const heightPct =
                totalMonth === 0 ? 4 : Math.max(10, Math.round((totalMonth / maxTrendValue) * 100));
              const isSelected = activeMonth?.monthKey === m.monthKey;

              return (
                <button
                  key={m.monthKey}
                  type="button"
                  onClick={() => setSelectedMonthKey(m.monthKey)}
                  aria-pressed={isSelected}
                  className="h-full flex flex-col items-center justify-end gap-2 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] rounded-lg p-1"
                >
                  <span className="text-[11px] font-bold text-[#181343]">
                    {totalMonth}
                  </span>
                  <div className="w-full max-w-[40px] flex-1 flex items-end justify-center">
                    <div
                      className={`w-full rounded-t-lg transition-colors ${
                        isSelected
                          ? "bg-[#181343]"
                          : "bg-slate-300 group-hover:bg-emerald-700"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-semibold truncate w-full text-center ${
                      isSelected ? "text-[#181343] font-bold" : "text-slate-600"
                    }`}
                  >
                    {m.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {activeMonth && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#181343]">
                Rincian {activeMonth.label}:
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700 font-medium">
                <span>+{activeMonth.newCompanies} Perusahaan</span>
                <span>+{activeMonth.newPartners} Mitra NGO</span>
                <span>+{activeMonth.newUsers} Pengguna</span>
                <span>+{activeMonth.newPrograms} Program</span>
              </div>
            </div>
          )}
        </section>

        {/* Focus Area Distribution */}
        <section
          aria-label="Distribusi Bidang Fokus CSR"
          className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4"
        >
          <div>
            <h2 className="text-base font-bold text-[#181343]">
              Sebaran Bidang Fokus Program CSR
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Konsentrasi program dan komitmen anggaran berdasarkan bidang dampak.
            </p>
          </div>

          {focusAreaDistribution.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-6 h-6 text-slate-400 mx-auto mb-2" aria-hidden="true" />
              <p className="text-xs text-slate-600">
                Belum ada program CSR yang terbentuk pada platform.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {focusAreaDistribution.map((item) => {
                const widthPct = Math.max(
                  8,
                  Math.round((item.programCount / maxFocusPrograms) * 100)
                );
                return (
                  <div key={item.focusArea} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#181343] truncate">
                        {getFocusAreaLabel(item.focusArea)}
                      </span>
                      <span className="text-slate-700 font-semibold shrink-0">
                        {item.programCount} program ({formatCompactRupiah(item.committedBudget)})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-700"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

