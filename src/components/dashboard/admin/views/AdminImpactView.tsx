"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  MapPin,
  RefreshCw,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminImpactOverviewResponse } from "../types";
import {
  PROGRAM_STATUS_LABELS,
  formatCompactRupiah,
  formatDate,
  getFocusAreaLabel,
} from "../helpers";
import { AdminErrorState, AdminLoadingState } from "../AdminSharedPrimitives";

interface AdminImpactViewProps {
  onOpenProgramAudit: (programId: string) => void;
}

export function AdminImpactView({ onOpenProgramAudit }: AdminImpactViewProps) {
  const [data, setData] = useState<AdminImpactOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImpact = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const res = await fetch("/api/admin/impact", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat data dampak dan suara warga");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data dampak dan suara warga");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImpact();
  }, [fetchImpact]);

  if (isLoading && !data) {
    return <AdminLoadingState message="Memuat agregasi suara warga dan sebaran dampak ESG..." />;
  }

  if (error && !data) {
    return <AdminErrorState message={error} onRetry={fetchImpact} />;
  }

  if (!data) {
    return (
      <AdminErrorState
        message="Data suara warga dan dampak platform belum tersedia."
        onRetry={fetchImpact}
      />
    );
  }

  const {
    summary,
    geoDistribution,
    focusAreaImpact,
    lowRatedOrNegativePrograms,
    recentReviews,
  } = data;

  const totalSentimentCount =
    summary.positiveCount + summary.neutralCount + summary.negativeCount;
  const posPct =
    totalSentimentCount > 0 ? Math.round((summary.positiveCount / totalSentimentCount) * 100) : 0;
  const neuPct =
    totalSentimentCount > 0 ? Math.round((summary.neutralCount / totalSentimentCount) * 100) : 0;
  const negPct = totalSentimentCount > 0 ? Math.max(0, 100 - posPct - neuPct) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Suara Warga &amp; Dampak ESG
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pemantauan sentimen penerima manfaat publik, deteksi dini program berisiko rendah, dan sebaran dampak geografis.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchImpact}
          disabled={isLoading}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-700" : "text-slate-600"}`}
            aria-hidden="true"
          />
          <span>Segarkan Dampak</span>
        </button>
      </div>

      {/* Top Impact Anchor */}
      <section
        aria-label="Ringkasan Kepuasan Masyarakat Lintas Platform"
        className="rounded-2xl bg-[#181343] text-white p-5 sm:p-7 border border-[#26224C] space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
              Rata-Rata Rating Publik
            </span>
            <div className="text-3xl font-extrabold text-white">
              {summary.totalReviews > 0 ? `${summary.averageRating} / 5` : "Belum Ada"}
            </div>
            <span className="text-xs text-slate-200 block">
              Dari {summary.totalReviews} ulasan penerima manfaat
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
            <span className="text-xs text-slate-200 block">Program Terevaluasi</span>
            <span className="text-2xl font-bold text-white block">
              {summary.totalProgramsReviewed}
            </span>
            <span className="text-[11px] text-slate-200 block">
              Telah menerima ulasan langsung
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
            <span className="text-xs text-slate-200 block">Cakupan Kota/Kabupaten</span>
            <span className="text-2xl font-bold text-white block">
              {summary.totalCitiesCovered}
            </span>
            <span className="text-[11px] text-slate-200 block">
              Wilayah sasaran program CSR
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
            <span className="text-xs text-slate-200 block">Sentimen Negatif</span>
            <span className="text-2xl font-bold text-amber-200 block">
              {summary.negativeCount} ulasan
            </span>
            <span className="text-[11px] text-slate-200 block">
              Perlu evaluasi kualitas pelaksanaan
            </span>
          </div>
        </div>

        {/* Sentiment Distribution Bar */}
        {totalSentimentCount > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/15">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200">
              <span className="font-semibold text-white">Proporsi Sentimen Penerima Manfaat</span>
              <div className="flex flex-wrap gap-4">
                <span>Positif: {summary.positiveCount} ({posPct}%)</span>
                <span>Netral: {summary.neutralCount} ({neuPct}%)</span>
                <span>Negatif: {summary.negativeCount} ({negPct}%)</span>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden flex">
              {posPct > 0 && (
                <div className="h-full bg-emerald-400" style={{ width: `${posPct}%` }} />
              )}
              {neuPct > 0 && (
                <div className="h-full bg-amber-300" style={{ width: `${neuPct}%` }} />
              )}
              {negPct > 0 && (
                <div className="h-full bg-rose-400" style={{ width: `${negPct}%` }} />
              )}
            </div>
          </div>
        )}
      </section>

      {/* Row 2: Early Warning Low Rated Programs (7) + Geographic Coverage (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section
          aria-label="Deteksi Dini Program Berisiko"
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-[#181343]">
              Program dengan Ulasan Negatif atau Rating Rendah
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Daftar program dengan rata-rata rating di bawah 3.5 atau memiliki ulasan bersentimen negatif.
            </p>
          </div>

          <div className="p-5">
            {lowRatedOrNegativePrograms.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto" aria-hidden="true" />
                <p className="text-sm font-bold text-[#181343]">
                  Tidak Ada Program Berisiko Rating Rendah
                </p>
                <p className="text-xs text-slate-600">
                  Seluruh program yang diulas masyarakat memiliki skor kepuasan di atas ambang peringatan.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {lowRatedOrNegativePrograms.map((item) => {
                  const st = PROGRAM_STATUS_LABELS[item.status] || {
                    label: item.status,
                    variant: "slate" as const,
                  };
                  return (
                    <div
                      key={item.programId}
                      className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[#181343]">
                            {item.programTitle}
                          </span>
                          <Badge variant={st.variant} size="sm">
                            {st.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">
                          {item.companyName || "-"} &amp; {item.partnerName || "-"}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] font-semibold">
                          <span className="text-rose-700 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                            Rating {item.avgRating}/5 ({item.totalReviews} ulasan, {item.negativeCount} negatif)
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenProgramAudit(item.programId)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span>Audit Program</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Geographic Distribution */}
        <section
          aria-label="Sebaran Wilayah Program"
          className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
        >
          <div>
            <h2 className="text-base font-bold text-[#181343]">Sebaran Wilayah Sasaran</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Konsentrasi program dan total komitmen pendanaan per kota/kabupaten.
            </p>
          </div>

          {geoDistribution.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">
              Belum ada sebaran program yang tercatat.
            </p>
          ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
              {geoDistribution.slice(0, 8).map((g) => (
                <div key={g.city} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="font-bold text-[#181343] block truncate">{g.city}</span>
                      <span className="text-[11px] text-slate-600">
                        {g.province || "Indonesia"} | {g.reviewCount} ulasan
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-[#181343] block">{g.programCount} program</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {formatCompactRupiah(g.totalBudget)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Row 3: Focus Area Impact (5) + Recent Citizen Reviews (7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section
          aria-label="Dampak per Bidang Fokus"
          className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
        >
          <div>
            <h2 className="text-base font-bold text-[#181343]">Dampak per Bidang Fokus</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Perbandingan program, anggaran, dan rata-rata rating tiap sektor.
            </p>
          </div>

          {focusAreaImpact.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">
              Belum ada data sektor program.
            </p>
          ) : (
            <div className="space-y-3">
              {focusAreaImpact.map((f) => (
                <div
                  key={f.focusArea}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#181343]">
                      {getFocusAreaLabel(f.focusArea)}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {f.reviewCount > 0 ? `${f.avgRating}/5` : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      {f.programCount} program | {formatCompactRupiah(f.totalBudget)}
                    </span>
                    <span>{f.reviewCount} ulasan</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          aria-label="Ulasan Penerima Manfaat Terbaru"
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
        >
          <div>
            <h2 className="text-base font-bold text-[#181343]">
              Suara Penerima Manfaat Terbaru
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Penilaian langsung dari masyarakat penerima dampak di berbagai program aktif.
            </p>
          </div>

          {recentReviews.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-600">
              Belum ada ulasan warga yang masuk dari survei lapangan.
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviews.slice(0, 8).map((rv) => (
                <div
                  key={rv.id}
                  className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs"
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
                        <Star className="w-3 h-3 mr-1 inline" aria-hidden="true" />
                        {rv.rating}/5
                      </Badge>
                      <span className="text-[11px] text-slate-600">
                        {formatDate(rv.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{rv.comment}</p>
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex flex-wrap justify-between gap-2">
                    <span>
                      Program: <strong className="text-[#181343]">{rv.programTitle || "-"}</strong>
                    </span>
                    <span>
                      {rv.companyName || "-"} &amp; {rv.partnerName || "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

