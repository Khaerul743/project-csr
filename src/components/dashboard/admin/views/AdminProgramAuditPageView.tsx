"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Camera,
  ExternalLink,
  FileCheck2,
  FileText,
  HeartHandshake,
  Lock,
  MapPin,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminProgramAuditDetail } from "../types";
import {
  EXPENSE_CATEGORY_LABELS,
  PROGRAM_STATUS_LABELS,
  formatCompactRupiah,
  formatDate,
  formatRupiah,
  getFocusAreaLabel,
} from "../helpers";
import { AdminErrorState, AdminLoadingState } from "../AdminSharedPrimitives";

interface AdminProgramAuditPageViewProps {
  programId: string;
  onBack: () => void;
}

export function AdminProgramAuditPageView({
  programId,
  onBack,
}: AdminProgramAuditPageViewProps) {
  const [detail, setDetail] = useState<AdminProgramAuditDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "activities" | "finances" | "reviews" | "esg" | "params"
  >("activities");

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const res = await fetch(`/api/admin/programs/${programId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat detail audit program");
      }
      setDetail(json.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat detail audit program");
    } finally {
      setIsLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Program</span>
        </button>
        <AdminLoadingState message="Memuat paket data audit program (timeline, keuangan, ulasan, dan laporan ESG)..." />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Program</span>
        </button>
        <AdminErrorState
          message={error || "Detail audit program tidak tersedia"}
          onRetry={fetchDetail}
        />
      </div>
    );
  }

  const { program, stages, activities, financialSummary, disbursements, expenses, reviews, reviewStats } =
    detail;
  const st = PROGRAM_STATUS_LABELS[program.status] || {
    label: program.status,
    variant: "slate" as const,
  };

  let parsedEsg: Record<string, any> | null = null;
  if (program.sustainabilityReport) {
    try {
      parsedEsg = JSON.parse(program.sustainabilityReport);
    } catch {
      parsedEsg = null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Program</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-[#181343] inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>Mode Audit Read-Only</span>
          </span>

          {program.collaborationMouUrl && (
            <a
              href={program.collaborationMouUrl}
              target="_blank"
              rel="noreferrer"
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>Dokumen MoU</span>
              <ExternalLink className="w-3 h-3 text-slate-600" aria-hidden="true" />
            </a>
          )}

          <Badge variant={st.variant} size="md" hasDot>
            {st.label}
          </Badge>
        </div>
      </div>

      {/* Program Identity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="navy" size="sm">
            {getFocusAreaLabel(program.focusArea)}
          </Badge>
          <span className="text-slate-600 inline-flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
            {program.targetCity || "Wilayah Nasional"}
            {program.targetProvince ? `, ${program.targetProvince}` : ""}
          </span>
          <span className="text-slate-600 inline-flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#181343]" aria-hidden="true" />
            {program.startDate && program.endDate
              ? `${formatDate(program.startDate)} s/d ${formatDate(program.endDate)}`
              : "Periode belum ditentukan"}
          </span>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {program.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#181343] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="text-slate-600 block">Perusahaan Sponsor</span>
              <span className="font-bold text-[#181343] truncate block">
                {program.companyName || "-"}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <HeartHandshake className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="text-slate-600 block">Mitra Pelaksana NGO</span>
              <span className="font-bold text-[#181343] truncate block">
                {program.partnerName || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Audit Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-600 block">Progres Tahapan</span>
          <div className="text-2xl font-extrabold text-[#181343]">
            {program.activityProgressPercent}%
          </div>
          <span className="text-xs text-slate-600 block">
            {program.completedActivitiesCount} dari {program.totalActivitiesCount} selesai
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-600 block">Pagu &amp; Termin</span>
          <div className="text-2xl font-extrabold text-[#181343] truncate">
            {formatCompactRupiah(financialSummary.totalDisbursed)}
          </div>
          <span className="text-xs text-slate-600 block truncate">
            Dari pagu {formatCompactRupiah(financialSummary.agreedBudget)}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-600 block">Nota Terverifikasi</span>
          <div className="text-2xl font-extrabold text-emerald-700 truncate">
            {formatCompactRupiah(financialSummary.totalExpensesVerified)}
          </div>
          <span className="text-xs text-slate-600 block">
            Serapan: {financialSummary.absorptionRate}%
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-600 block">Kepuasan Warga</span>
          <div className="text-2xl font-extrabold text-[#181343]">
            {reviewStats.totalReviews > 0 ? `${reviewStats.averageRating} / 5` : "-"}
          </div>
          <span className="text-xs text-slate-600 block">
            Dari {reviewStats.totalReviews} ulasan masyarakat
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div
          role="tablist"
          aria-label="Bagian audit program"
          className="px-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 sm:gap-4 overflow-x-auto"
        >
          {[
            { id: "activities" as const, label: "Tahapan & Bukti Lapangan", icon: Camera },
            { id: "finances" as const, label: "Keuangan, Termin & Kuitansi", icon: Wallet },
            { id: "reviews" as const, label: "Ulasan Masyarakat", icon: Star },
            { id: "esg" as const, label: "Laporan ESG AI", icon: Sparkles },
            { id: "params" as const, label: "Parameter Program", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[48px] py-3 px-2 border-b-2 text-xs font-semibold inline-flex items-center gap-2 shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#181343] ${
                  selected
                    ? "border-[#181343] text-[#181343] font-bold"
                    : "border-transparent text-slate-600 hover:text-[#181343]"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6">
          {/* TAB 1: ACTIVITIES & STAGES */}
          {activeTab === "activities" && (
            <div className="space-y-6 text-xs">
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-[#181343]">
                  Rencana Tahapan Proposal ({stages.length})
                </h2>
                {stages.length === 0 ? (
                  <p className="text-slate-600">Belum ada tahapan terstruktur yang tercatat.</p>
                ) : (
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                    {stages.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[#181343]">
                            {s.orderIndex}. {s.title}
                          </div>
                          {s.description && (
                            <p className="text-slate-600 mt-0.5">{s.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="slate" size="sm">
                            {s.source === "AI_GENERATED" ? "AI" : "Manual"}
                          </Badge>
                          <Badge
                            variant={
                              s.status === "COMPLETED"
                                ? "emerald"
                                : s.status === "IN_PROGRESS"
                                ? "amber"
                                : "slate"
                            }
                            size="sm"
                          >
                            {s.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-bold text-[#181343]">
                  Log Laporan Bukti Lapangan ({activities.length})
                </h2>
                {activities.length === 0 ? (
                  <p className="text-slate-600">
                    Mitra pelaksana belum mengunggah laporan aktivitas lapangan.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activities.map((act) => {
                      let photos: string[] = [];
                      if (act.mediaUrls) {
                        try {
                          const parsed = JSON.parse(act.mediaUrls);
                          if (Array.isArray(parsed)) photos = parsed;
                        } catch {
                          photos = [];
                        }
                      }
                      return (
                        <div
                          key={act.id}
                          className="p-4 rounded-xl border border-slate-200 space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-sm text-[#181343]">{act.title}</span>
                            <Badge
                              variant={
                                act.status === "VERIFIED"
                                  ? "emerald"
                                  : act.status === "REVISION_REQUESTED"
                                  ? "rose"
                                  : "amber"
                              }
                              size="sm"
                            >
                              {act.status}
                            </Badge>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{act.description}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
                            <span>Tanggal: {formatDate(act.activityDate)}</span>
                            <span>Lokasi: {act.location || "-"}</span>
                            <span>Penerima: {act.beneficiariesReached || "-"}</span>
                            <span>Dana terpakai: {formatRupiah(act.fundsSpent || 0)}</span>
                            {act.verifierName && <span>Diverifikasi oleh: {act.verifierName}</span>}
                          </div>
                          {act.companyFeedback && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                              Catatan Verifikator: {act.companyFeedback}
                            </div>
                          )}
                          {(photos.length > 0 || act.documentUrl) && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {photos.map((url, idx) => (
                                <a
                                  key={`${act.id}-photo-${idx}`}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-[#181343] hover:bg-slate-50 inline-flex items-center gap-1.5"
                                >
                                  <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Foto #{idx + 1}</span>
                                </a>
                              ))}
                              {act.documentUrl && (
                                <a
                                  href={act.documentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 inline-flex items-center gap-1.5"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Lampiran PDF</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FINANCES */}
          {activeTab === "finances" && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-600 block">Pagu MoU Disepakati</span>
                  <span className="font-bold text-[#181343] text-sm">
                    {formatRupiah(financialSummary.agreedBudget)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block">Diterima Resmi Mitra</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatRupiah(financialSummary.totalConfirmedReceived)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block">Total Belanja Dilaporkan</span>
                  <span className="font-bold text-[#181343] text-sm">
                    {formatRupiah(financialSummary.totalExpensesReported)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block">Sisa Kas di Mitra</span>
                  <span className="font-bold text-[#181343] text-sm">
                    {formatRupiah(financialSummary.remainingPartnerBalance)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-bold text-[#181343]">
                  Riwayat Pencairan Termin ({disbursements.length})
                </h2>
                {disbursements.length === 0 ? (
                  <p className="text-slate-600">Belum ada catatan pencairan termin dana.</p>
                ) : (
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                    {disbursements.map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#181343]">
                            Termin {d.trancheNumber}: {d.trancheName}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {formatDate(d.disbursedDate)} |{" "}
                            {d.bankName ? `${d.bankName} - ${d.bankAccountNumber || ""}` : "Transfer"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-[#181343]">{formatRupiah(d.amount)}</span>
                          <Badge
                            variant={
                              d.status === "CONFIRMED"
                                ? "emerald"
                                : d.status === "REJECTED"
                                ? "rose"
                                : "amber"
                            }
                            size="sm"
                          >
                            {d.status}
                          </Badge>
                          {d.transferProofUrl && (
                            <a
                              href={d.transferProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 font-semibold hover:underline"
                            >
                              Bukti Transfer
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-bold text-[#181343]">
                  Daftar Nota Pengeluaran Lapangan ({expenses.length})
                </h2>
                {expenses.length === 0 ? (
                  <p className="text-slate-600">Belum ada nota pengeluaran yang dilaporkan mitra.</p>
                ) : (
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                    {expenses.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#181343]">{ex.title}</div>
                          <div className="text-[11px] text-slate-600">
                            {EXPENSE_CATEGORY_LABELS[ex.category] || ex.category} |{" "}
                            {formatDate(ex.expenseDate)}
                            {ex.verifiedByName ? ` | Verifikator: ${ex.verifiedByName}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-[#181343]">
                            {formatRupiah(ex.amount)}
                          </span>
                          <Badge
                            variant={
                              ex.verificationStatus === "VERIFIED"
                                ? "emerald"
                                : ex.verificationStatus === "REJECTED"
                                ? "rose"
                                : "amber"
                            }
                            size="sm"
                          >
                            {ex.verificationStatus}
                          </Badge>
                          {ex.receiptUrl && (
                            <a
                              href={ex.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 font-semibold hover:underline"
                            >
                              Kuitansi
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-6">
                <div>
                  <span className="text-slate-600 block">Total Ulasan</span>
                  <span className="text-lg font-extrabold text-[#181343]">
                    {reviewStats.totalReviews}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block">Rata-Rata Rating</span>
                  <span className="text-lg font-extrabold text-[#181343]">
                    {reviewStats.averageRating} / 5
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block">Sentimen Positif / Netral / Negatif</span>
                  <span className="text-sm font-bold text-[#181343]">
                    {reviewStats.sentimentBreakdown.POSITIVE} /{" "}
                    {reviewStats.sentimentBreakdown.NEUTRAL} /{" "}
                    {reviewStats.sentimentBreakdown.NEGATIVE}
                  </span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-slate-600">
                  Belum ada testimoni atau rating penerima manfaat untuk program ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rv) => (
                    <div
                      key={rv.id}
                      className="p-4 rounded-xl border border-slate-200 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-[#181343]">{rv.reviewerName}</span>{" "}
                          <span className="text-slate-600">
                            ({rv.reviewerRole}
                            {rv.reviewerCity ? `, ${rv.reviewerCity}` : ""})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              rv.rating >= 4 ? "emerald" : rv.rating === 3 ? "amber" : "rose"
                            }
                            size="sm"
                          >
                            Rating {rv.rating}/5
                          </Badge>
                          <span className="text-slate-600">{formatDate(rv.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{rv.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ESG */}
          {activeTab === "esg" && (
            <div className="space-y-4 text-xs">
              {!parsedEsg ? (
                <p className="text-slate-600">
                  Laporan Keberlanjutan &amp; ESG AI belum digenerate untuk program ini.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-slate-600 mb-1">
                      Digenerate pada {formatDate(program.reportGeneratedAt)}
                    </div>
                    <h3 className="text-sm font-bold text-[#181343] mb-1">
                      Ringkasan Eksekutif Laporan ESG
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {parsedEsg.executiveSummary || "Ringkasan laporan tersedia di data terstruktur."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PARAMS */}
          {activeTab === "params" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-600 block">Target Penerima Manfaat (MoU)</span>
                  <span className="font-bold text-[#181343]">
                    {program.targetBeneficiaries || "-"}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-600 block">Realisasi Penerima Manfaat Aktual</span>
                  <span className="font-bold text-[#181343]">
                    {program.actualBeneficiaries || "Belum dilaporkan"}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-[#181343] block">Deskripsi &amp; Catatan Program</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {program.description || "Tidak ada catatan evaluasi tambahan."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
