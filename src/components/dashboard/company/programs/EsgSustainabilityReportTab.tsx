"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Printer,
  RefreshCw,
  Award,
  Globe,
  Leaf,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Users,
  TrendingUp,
  AlertCircle,
  Quote,
  Clock,
  ArrowRight,
  Download,
  Check,
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  Copy,
  CheckCheck,
  Coins,
  FileText,
  Target,
  BarChart3,
  BookmarkCheck,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyProgramItem } from "../types";
import { formatDate, formatRupiah } from "../helpers";
import { EsgReportResult } from "@/modules/ai";

interface EsgSustainabilityReportTabProps {
  program: CompanyProgramItem;
  onProgramUpdated?: () => void;
  isManagement?: boolean;
}

export function EsgSustainabilityReportTab({
  program,
  onProgramUpdated,
  isManagement = false,
}: EsgSustainabilityReportTabProps) {
  const [report, setReport] = useState<EsgReportResult | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(
    program.reportGeneratedAt || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Muat laporan yang sudah ada
  useEffect(() => {
    if (program.sustainabilityReport) {
      try {
        const parsed = JSON.parse(program.sustainabilityReport);
        setReport(parsed);
      } catch {
        setReport(null);
      }
    } else {
      fetchExistingReport();
    }
  }, [program.id, program.sustainabilityReport]);

  const fetchExistingReport = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/programs/${program.id}/esg-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.data?.report) {
        setReport(json.data.report);
        if (json.data.generatedAt) {
          setGeneratedAt(json.data.generatedAt);
        }
      }
    } catch {
      // Abaikan kegagalan inisialisasi awal
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Sesi login telah berakhir. Silakan masuk kembali.");
      }

      const res = await fetch(`/api/programs/${program.id}/esg-report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menyusun laporan keberlanjutan AI.");
      }

      setReport(json.data);
      const now = new Date().toISOString();
      setGeneratedAt(now);
      setSuccessMsg(
        "Laporan Keberlanjutan & Dampak ESG resmi berhasil disusun dan diperbarui oleh AI!"
      );
      if (onProgramUpdated) onProgramUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kendala saat menghubungi layanan AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySummary = async () => {
    if (!report?.executiveSummary) return;
    try {
      await navigator.clipboard.writeText(
        `RINGKASAN EKSEKUTIF ESG - ${program.title}\n\n${report.executiveSummary}\n\nHighlight Utama: ${report.programHighlight}\nSkor ESG: ${report.metrics.overallEsgScore}/100\nTarget SDG: ${report.primarySdg.goalTitle}`
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const safeTitle = (program.title || "Program_CSR").replace(/[^a-zA-Z0-9]/g, "_");
    document.title = `Laporan_Keberlanjutan_ESG_${safeTitle}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Helper warna badge SDG PBB
  const getSdgColor = (goalNumber: number) => {
    const colors: Record<number, { bg: string; text: string; border: string }> = {
      1: { bg: "bg-red-600", text: "text-white", border: "border-red-700" },
      2: { bg: "bg-amber-600", text: "text-white", border: "border-amber-700" },
      3: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-700" },
      4: { bg: "bg-rose-600", text: "text-white", border: "border-rose-700" },
      5: { bg: "bg-orange-600", text: "text-white", border: "border-orange-700" },
      6: { bg: "bg-cyan-600", text: "text-white", border: "border-cyan-700" },
      7: { bg: "bg-yellow-500", text: "text-slate-950", border: "border-yellow-600" },
      8: { bg: "bg-rose-800", text: "text-white", border: "border-rose-900" },
      9: { bg: "bg-orange-500", text: "text-white", border: "border-orange-600" },
      10: { bg: "bg-pink-600", text: "text-white", border: "border-pink-700" },
      11: { bg: "bg-amber-500", text: "text-white", border: "border-amber-600" },
      12: { bg: "bg-amber-700", text: "text-white", border: "border-amber-800" },
      13: { bg: "bg-emerald-800", text: "text-white", border: "border-emerald-900" },
      14: { bg: "bg-blue-600", text: "text-white", border: "border-blue-700" },
      15: { bg: "bg-lime-600", text: "text-white", border: "border-lime-700" },
      16: { bg: "bg-blue-800", text: "text-white", border: "border-blue-900" },
      17: { bg: "bg-indigo-900", text: "text-white", border: "border-indigo-950" },
    };
    return colors[goalNumber] || {
      bg: "bg-emerald-700",
      text: "text-white",
      border: "border-emerald-800",
    };
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Feedback */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-xs print:hidden">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <p className="font-semibold leading-relaxed">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 hover:text-rose-900 font-bold px-2 py-1 rounded-md cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-xs print:hidden">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <p className="font-semibold leading-relaxed">{successMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-1 rounded-md cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Navigasi & Aksi Laporan */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] print:hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#181343] tracking-tight">
            Laporan Keberlanjutan &amp; Dampak ESG
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sintesis aktivitas lapangan, audit verifikasi dana CSR, dan ulasan warga (selaras standar ESG &amp; SDGs).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {report && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                leftIcon={
                  isCopied ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                  )
                }
                className="text-xs font-semibold cursor-pointer"
              >
                {isCopied ? "Tersalin!" : "Salin Ringkasan"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-3.5 h-3.5 text-[#181343]" />}
                className="text-xs font-semibold cursor-pointer"
              >
                Cetak / PDF Resmi
              </Button>
            </>
          )}

          {!isManagement && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleGenerateReport}
              disabled={isGenerating}
              isLoading={isGenerating}
              className="text-xs font-bold px-4 cursor-pointer"
              leftIcon={
                isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                )
              }
            >
              {report ? "Analisis Ulang AI" : "Susun Laporan ESG (AI)"}
            </Button>
          )}
        </div>
      </div>

      {/* STATE KOSONG (JIKA BELUM DISINTESIS) */}
      {!report && !isGenerating && (
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-100 shadow-2xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Sintesis Laporan Keberlanjutan Belum Dibuat
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Platform Sipena siap mengompilasi seluruh catatan kemajuan inisiatif <strong>{program.title}</strong> menjadi dokumen Laporan Keberlanjutan resmi yang selaras dengan kerangka <strong>Environmental, Social, &amp; Governance (ESG)</strong> dan sasaran <strong>UN SDGs</strong>.
            </p>
          </div>

          {/* 3 Sumber Data Riil yang Diagregasi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-4xl mx-auto pt-2">
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">
                1. Pemetaan 3 Pilar ESG
              </h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Menakar dampak nyata pada Lingkungan Hidup (E), Kesejahteraan Sosial (S), serta Akuntabilitas Tata Kelola (G).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">
                2. Target 17 UN SDGs
              </h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Menghubungkan target dan output kegiatan lapangan langsung ke indikator pembangunan berkelanjutan PBB.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">
                3. Audit Kuitansi &amp; Warga
              </h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Menghitung efisiensi anggaran per jiwa penerima manfaat serta mengagregasi ulasan kepuasan warga sekitar.
              </p>
            </div>
          </div>

          {!isManagement ? (
            <div className="pt-2 text-center">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="text-xs sm:text-sm font-bold px-7 py-3 cursor-pointer"
                leftIcon={<Sparkles className="w-4 h-4 text-emerald-200" />}
              >
                Mulai Penyusunan Laporan ESG (AI)
              </Button>
              <p className="text-[11px] text-slate-400 mt-2">
                Proses sintesis memerlukan waktu sekitar 5 hingga 10 detik.
              </p>
            </div>
          ) : (
            <div className="pt-2 text-center">
              <p className="inline-block px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
                Laporan keberlanjutan AI akan disusun oleh tim operasional (CSR Admin) untuk Anda pantau di sini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STATE LOADING SAAT MEN-GENERATE */}
      {isGenerating && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-base font-extrabold text-[#181343]">
              Sedang Mengompilasi Laporan Dampak ESG...
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI sedang memeriksa data log lapangan, menghitung rasio anggaran terhadap penerima manfaat, dan menyusun narasi evaluasi dampak serta keberlanjutan ESG.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAMPILAN RESMI LAPORAN KEBERLANJUTAN (PRINT & SCREEN READY)   */}
      {/* ============================================================ */}
      {report && !isGenerating && (
        <div id="printable-esg-report" className="space-y-6 bg-white">
          {/* Print-Only Header: Kop Laporan Resmi */}
          <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Laporan Keberlanjutan &amp; Dampak ESG
                </h1>
                <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  Kerangka Kerja ESG &bull; Global Reporting Initiative (GRI Standards) &bull; UN SDGs
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <p className="font-bold">{program.companyName || "Perusahaan Sponsor"}</p>
                <p>Dokumen Resmi Platform Sipena</p>
                <p>Dicetak: {formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>

          {/* 1. HERO BANNER: SKOR ESG & RINGKASAN EKSEKUTIF */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#181343] text-white shadow-sm border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-5 border-b border-white/10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Sintesis Keberlanjutan Resmi
                  </span>
                  {generatedAt && (
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Disusun pada {formatDate(generatedAt)}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {program.title}
                </h3>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-slate-300">
                  <span>
                    Sponsor: <strong className="text-white">{program.companyName || "Perusahaan"}</strong>
                  </span>
                  <span>&bull;</span>
                  <span>
                    Mitra: <strong className="text-white">{program.partnerName || "Mitra Pelaksana"}</strong>
                  </span>
                  <span>&bull;</span>
                  <span>
                    Lokasi: <strong className="text-white">{program.targetCity || "Nasional"}</strong>
                  </span>
                </div>
              </div>

              {/* Skor Terpadu Performa ESG */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 shrink-0 shadow-inner">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
                    Indeks Performa ESG
                  </span>
                  <div className="text-3xl font-black text-emerald-400">
                    {report.metrics.overallEsgScore}
                    <span className="text-xs font-bold text-slate-400">/100</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-lg border border-emerald-500/30 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Narasi Ringkasan Eksekutif */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Ringkasan Eksekutif Direksi
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                "{report.executiveSummary}"
              </p>
            </div>

            {/* Highlight Keberhasilan Utama */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-extrabold text-emerald-300 block">
                  Nilai Keberhasilan Paling Menonjol:
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {report.programHighlight}
                </p>
              </div>
            </div>
          </div>

          {/* 2. PENYELARASAN TARGET SDG (UN SUSTAINABLE DEVELOPMENT GOALS) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#181343]">
                    Penyelarasan UN Sustainable Development Goals (SDGs)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Pemetaan kontribusi program terhadap target pembangunan global Agenda 2030 PBB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
              {/* Primary SDG Card */}
              <div className="lg:col-span-2 p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-xs shrink-0 ${
                      getSdgColor(report.primarySdg.goalNumber).bg
                    } ${getSdgColor(report.primarySdg.goalNumber).text}`}
                  >
                    {report.primarySdg.goalNumber}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Target SDG Prioritas Utama
                    </span>
                    <h5 className="font-extrabold text-slate-900 text-sm">
                      {report.primarySdg.goalTitle}
                    </h5>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">
                    Justifikasi Kontribusi Lapangan:
                  </span>
                  {report.primarySdg.alignmentRationale}
                </div>
              </div>

              {/* Secondary SDGs List */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Target SDG Pendukung
                </span>

                <div className="space-y-2.5">
                  {report.secondarySdgs && report.secondarySdgs.length > 0 ? (
                    report.secondarySdgs.map((sdg, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white border border-slate-200/60 flex items-start gap-2.5 text-xs"
                      >
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                            getSdgColor(sdg.goalNumber).bg
                          } ${getSdgColor(sdg.goalNumber).text}`}
                        >
                          {sdg.goalNumber}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {sdg.goalTitle}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {sdg.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Tidak ada target sekunder tambahan yang terdeteksi.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. TRIDAYA PILAR ESG (ENVIRONMENT, SOCIAL, GOVERNANCE) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Environmental Pillar */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-emerald-950 text-sm">
                    Environmental (E)
                  </h5>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Kelestarian Lingkungan Hidup
                  </span>
                </div>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed font-normal">
                {report.esgBreakdown.environmentalImpact}
              </p>
            </div>

            {/* Social Pillar */}
            <div className="p-5 rounded-2xl bg-cyan-50/60 border border-cyan-200/70 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center shadow-xs shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-cyan-950 text-sm">
                    Social (S)
                  </h5>
                  <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">
                    Pemberdayaan Masyarakat
                  </span>
                </div>
              </div>
              <p className="text-xs text-cyan-950 leading-relaxed font-normal">
                {report.esgBreakdown.socialImpact}
              </p>
            </div>

            {/* Governance Pillar */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#181343] text-white flex items-center justify-center shadow-xs shrink-0">
                  <ShieldCheck className="w-4 h-4 text-teal-300" />
                </div>
                <div>
                  <h5 className="font-extrabold text-indigo-950 text-sm">
                    Governance (G)
                  </h5>
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                    Tata Kelola &amp; Akuntabilitas
                  </span>
                </div>
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed font-normal">
                {report.esgBreakdown.governanceTransparency}
              </p>
            </div>
          </div>

          {/* 4. SCORECARDS METRIK DAMPAK KUANTITATIF */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#181343] uppercase tracking-wider">
                Metrik Efisiensi &amp; Capaian Kuantitatif Lapangan
              </h4>
              <span className="text-[11px] text-slate-500">
                Audit Serapan Anggaran &bull; Data Terverifikasi
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Metrik 1: Jiwa Penerima */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Penerima Manfaat
                  </span>
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-xl font-black text-[#181343]">
                  {report.metrics.beneficiariesReached.toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-semibold text-slate-500">Jiwa</span>
                </p>
                <p className="text-[10px] text-slate-500">Capaian langsung lapangan</p>
              </div>

              {/* Metrik 2: Biaya per Jiwa */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Biaya per Jiwa
                  </span>
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-base font-black text-[#181343] truncate">
                  {report.metrics.costPerBeneficiaryFormatted}
                </p>
                <p className="text-[10px] text-slate-500">Rasio efisiensi serapan</p>
              </div>

              {/* Metrik 3: Kepuasan Warga */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Indeks Kepuasan
                  </span>
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xl font-black text-emerald-700">
                  {report.metrics.beneficiarySatisfactionScore}%
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">Ulasan warga positif</p>
              </div>

              {/* Metrik 4: Rating Efisiensi Budget */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Efisiensi Anggaran
                  </span>
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="pt-0.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold inline-block ${
                      report.metrics.budgetEfficiencyRating === "EXCELLENT"
                        ? "bg-emerald-100 text-emerald-800"
                        : report.metrics.budgetEfficiencyRating === "GOOD"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {report.metrics.budgetEfficiencyRating === "EXCELLENT"
                      ? "Sangat Efisien"
                      : report.metrics.budgetEfficiencyRating === "GOOD"
                      ? "Baik & Sesuai"
                      : "Perlu Optimasi"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Audit kepatuhan belanja</p>
              </div>
            </div>
          </div>

          {/* 5. SUCCESS STORY & HUMAN INTEREST HIGHLIGHT */}
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
              <Quote className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cerita Perubahan Nyata (Human Interest Chronicle)</span>
            </div>

            <div className="space-y-1.5">
              <h5 className="text-base font-extrabold text-slate-900 leading-snug">
                {report.successStory.headline}
              </h5>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {report.successStory.narrative}
              </p>
            </div>

            {report.successStory.beneficiaryQuote && (
              <div className="p-4 rounded-xl bg-white border border-amber-200/70 text-xs italic text-slate-800 leading-relaxed shadow-2xs">
                "{report.successStory.beneficiaryQuote}"
              </div>
            )}
          </div>

          {/* 6. TANTANGAN OPERASIONAL & REKOMENDASI MASA DEPAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tantangan Lapangan */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Tantangan &amp; Kendala Lapangan</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {report.challengesFaced.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold">&bull;</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rekomendasi Keberlanjutan */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Rekomendasi Strategis Lanjutan</span>
              </div>
              <ul className="space-y-2 text-xs text-emerald-950">
                {report.futureRecommendations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">&bull;</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Print-Only Signature Section */}
          <div className="hidden print:block pt-8 border-t border-slate-300 mt-8">
            <div className="grid grid-cols-2 gap-12 text-center text-xs text-slate-700">
              <div className="space-y-16">
                <p className="font-semibold">Mengetahui &amp; Mengesahkan,</p>
                <div>
                  <p className="font-bold underline text-slate-900">
                    {program.companyName || "Direksi / Komite CSR"}
                  </p>
                  <p className="text-[11px] text-slate-500">Perusahaan Sponsor</p>
                </div>
              </div>

              <div className="space-y-16">
                <p className="font-semibold">Disusun Bersama Oleh,</p>
                <div>
                  <p className="font-bold underline text-slate-900">
                    {program.partnerName || "Pimpinan Mitra Pelaksana"}
                  </p>
                  <p className="text-[11px] text-slate-500">Mitra Pelaksana Lapangan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}