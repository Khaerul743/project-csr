"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
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
import { AdminErrorState, AdminKpiCard, AdminLoadingState } from "../AdminSharedPrimitives";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
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
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-700" : "text-slate-600"}`}
            aria-hidden="true"
          />
          <span>Segarkan Dampak</span>
        </button>
      </div>

      {/* 4 Standard KPI Cards (Anti AI-Slop & Seragam dengan Management/Mitra) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          label="Rata-rata rating publik"
          value={summary.totalReviews > 0 ? `${summary.averageRating} / 5` : "Belum Ada"}
          subtitle={`Dari ${summary.totalReviews} ulasan penerima manfaat`}
          icon={Star}
          iconColor="amber"
          valueColor="text-amber-600"
        />
        <AdminKpiCard
          label="Program terevaluasi"
          value={summary.totalProgramsReviewed}
          subtitle="Telah menerima ulasan langsung"
          icon={Activity}
          iconColor="emerald"
          valueColor="text-emerald-700"
        />
        <AdminKpiCard
          label="Cakupan wilayah"
          value={summary.totalCitiesCovered}
          subtitle="Kota &amp; kabupaten sebaran CSR"
          icon={MapPin}
          iconColor="blue"
        />
        <AdminKpiCard
          label="Sentimen negatif"
          value={`${summary.negativeCount} ulasan`}
          subtitle="Perlu evaluasi kualitas kegiatan"
          icon={AlertTriangle}
          iconColor="rose"
          valueColor={summary.negativeCount > 0 ? "text-rose-600" : "text-[#181343]"}
        />
      </div>

      {/* Sentiment Distribution Bar (Clean Corporate Card) */}
      {totalSentimentCount > 0 && (
        <section
          aria-label="Distribusi Proporsi Sentimen Penerima Manfaat"
          className="rounded-2xl bg-white border border-[#E5E7EB] p-5 shadow-xs space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[#181343]">Proporsi Sentimen Penerima Manfaat</span>
            <div className="flex flex-wrap gap-4 font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Positif: {summary.positiveCount} ({posPct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Netral: {summary.neutralCount} ({neuPct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Negatif: {summary.negativeCount} ({negPct}%)
              </span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
            {posPct > 0 && (
              <div className="h-full bg-emerald-500" style={{ width: `${posPct}%` }} />
            )}
            {neuPct > 0 && (
              <div className="h-full bg-amber-400" style={{ width: `${neuPct}%` }} />
            )}
            {negPct > 0 && (
              <div className="h-full bg-rose-500" style={{ width: `${negPct}%` }} />
            )}
          </div>
        </section>
      )}

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
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
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

