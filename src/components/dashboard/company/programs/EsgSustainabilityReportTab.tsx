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
  const [generatedAt, setGeneratedAt] = useState<string | null>(program.reportGeneratedAt || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing report
  useEffect(() => {
    if (program.sustainabilityReport) {
      try {
        const parsed = JSON.parse(program.sustainabilityReport);
        setReport(parsed);
      } catch {
        setReport(null);
      }
    } else {
      // Fetch from API
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
      // Ignore initial load failure
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
      if (!token) throw new Error("Sesi login telah berakhir. Silakan masuk kembali.");

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
      setSuccessMsg("Laporan Keberlanjutan & Dampak ESG berhasil disusun oleh AI!");
      if (onProgramUpdated) onProgramUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kendala saat menghubungi layanan AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper warna badge SDG (PBB style)
  const getSdgColor = (goalNumber: number) => {
    const colors: Record<number, { bg: string; text: string; border: string }> = {
      1: { bg: "bg-red-500", text: "text-white", border: "border-red-600" },
      2: { bg: "bg-amber-600", text: "text-white", border: "border-amber-700" },
      3: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-700" },
      4: { bg: "bg-rose-600", text: "text-white", border: "border-rose-700" },
      5: { bg: "bg-orange-600", text: "text-white", border: "border-orange-700" },
      6: { bg: "bg-cyan-500", text: "text-white", border: "border-cyan-600" },
      7: { bg: "bg-yellow-500", text: "text-slate-900", border: "border-yellow-600" },
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
    return colors[goalNumber] || { bg: "bg-emerald-700", text: "text-white", border: "border-emerald-800" };
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Feedback */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3 shadow-xs print:hidden">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <p className="font-semibold">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-800 font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-xs print:hidden">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <p className="font-semibold">{successMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Navigasi & Aksi Laporan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-[#181343] tracking-tight">
              Laporan Keberlanjutan &amp; Dampak ESG
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
              POJK 51 &bull; GRI
            </span>
          </div>
          <p className="text-xs text-[#787680]">
            Sintesis cerdas capaian aktivitas lapangan, serapan kuitansi, dan ulasan warga penerima manfaat.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {report && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5 text-[#181343]" />}
              className="text-xs font-bold"
            >
              Cetak / PDF Resmi
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            isLoading={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            leftIcon={
              isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )
            }
          >
            {report ? "Analisis Ulang AI" : "Susun Laporan ESG (AI)"}
          </Button>
        </div>
      </div>

      {/* JIKA LAPORAN BELUM ADA: STATE KOSONG DENGAN TEASER ELEGAN */}
      {!report && !isGenerating && (
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-[#181343] text-white border border-slate-800 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-white/10 text-emerald-400 mx-auto flex items-center justify-center border border-white/15 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Laporan Keberlanjutan Belum Disusun
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Gunakan mesin AI Cerdas Sipena untuk mengekstrak seluruh log kegiatan lapangan, audit nota belanja, dan suara warga menjadi narasi Laporan Keberlanjutan berstandar <strong>GRI Standards</strong> dan <strong>POJK 51</strong> secara otomatis.
            </p>
          </div>

          {/* 3 Keunggulan Fitur */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <h5 className="font-bold text-xs text-white">Penyelarasan 3 Pilar ESG</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Membedah dampak Lingkungan (E), Sosial (S), dan Tata Kelola (G).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <h5 className="font-bold text-xs text-white">Pemetaan 17 UN SDGs</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Menghubungkan capaian kegiatan dengan indikator tujuan global PBB.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </div>
              <h5 className="font-bold text-xs text-white">Format Laporan Eksekutif</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Siap cetak ke PDF resmi untuk dipresentasikan ke Dewan Direksi.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 px-8 py-3.5 rounded-2xl cursor-pointer"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              🚀 Susun Laporan Keberlanjutan AI Sekarang
            </Button>
          </div>
        </div>
      )}

      {/* STATE LOADING SAAT MEN-GENERATE */}
      {isGenerating && (
        <div className="p-12 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-60" />
            <div className="w-14 h-14 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin flex items-center justify-center" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-[#181343]">
              Sedang Mengompilasi Laporan Dampak ESG...
            </h4>
            <p className="text-xs text-[#787680] max-w-md mx-auto">
              AI sedang mengaudit seluruh tahapan kegiatan, mengekstrak metrik penerima manfaat, dan menyusun narasi standar POJK 51. Mohon tunggu sekitar 5–10 detik.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAMPILAN RESMI LAPORAN KEBERLANJUTAN (PRINT & SCREEN READY)   */}
      {/* ============================================================ */}
      {report && !isGenerating && (
        <div className="space-y-6 print:m-0 print:p-0">
          {/* Print-Only Header: Kop Laporan Resmi */}
          <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Laporan Keberlanjutan &amp; Dampak ESG
                </h1>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Standar POJK 51/POJK.03/2017 &bull; Global Reporting Initiative (GRI Standards)
                </p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p className="font-bold">{program.companyName || "Perusahaan Sponsor"}</p>
                <p>Dokumen Resmi Platform Sipena</p>
                <p>Dicetak: {formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>

          {/* 1. HERO BANNER: SKOR ESG & RINGKASAN EKSEKUTIF */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#181343] via-[#201B54] to-slate-900 text-white shadow-md border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-white/10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Official Sustainability Synthesis
                  </span>
                  {generatedAt && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Disusun pada {formatDate(generatedAt)}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {program.title}
                </h3>

                <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>Sponsor: <strong>{program.companyName || "Perusahaan"}</strong></span>
                  <span>&bull;</span>
                  <span>Mitra: <strong>{program.partnerName || "Mitra Pelaksana"}</strong></span>
                  <span>&bull;</span>
                  <span>Lokasi: <strong>{program.targetCity || "Nasional"}</strong></span>
                </p>
              </div>

              {/* Skor Terpadu Performa ESG */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 shrink-0 shadow-inner">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Indeks Performa ESG
                  </span>
                  <div className="text-3xl font-black text-emerald-400">
                    {report.metrics.overallEsgScore}
                    <span className="text-xs font-bold text-slate-400">/100</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30 shrink-0">
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
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-xs">
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
          <div className="p-6 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#181343]">
                    Penyelarasan UN Sustainable Development Goals (SDGs)
                  </h4>
                  <p className="text-[11px] text-[#787680]">
                    Pemetaan kontribusi inisiatif terhadap target pembangunan global
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
              {/* Primary SDG Card */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
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
                      Target SDG Utama
                    </span>
                    <h5 className="font-extrabold text-slate-900 text-sm">
                      {report.primarySdg.goalTitle}
                    </h5>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">
                    Justifikasi Kontribusi Lapangan:
                  </span>
                  {report.primarySdg.alignmentRationale}
                </div>
              </div>

              {/* Secondary SDGs List */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Target SDG Pendukung
                </span>

                <div className="space-y-2.5">
                  {report.secondarySdgs && report.secondarySdgs.length > 0 ? (
                    report.secondarySdgs.map((sdg, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-slate-100 flex items-start gap-2.5 text-xs"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            getSdgColor(sdg.goalNumber).bg
                          } ${getSdgColor(sdg.goalNumber).text}`}
                        >
                          {sdg.goalNumber}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-extrabold text-slate-900 truncate">
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
                      Tidak ada target sekunder tambahan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. TRIDAYA PILAR ESG (ENVIRONMENT, SOCIAL, GOVERNANCE) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Environmental Pillar */}
            <div className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-100 shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-emerald-950 text-sm">
                    Environmental (E)
                  </h5>
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                    Kelestarian Lingkungan
                  </span>
                </div>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-normal">
                {report.esgBreakdown.environmentalImpact}
              </p>
            </div>

            {/* Social Pillar */}
            <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-blue-950 text-sm">
                    Social (S)
                  </h5>
                  <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">
                    Kesejahteraan Masyarakat
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed font-normal">
                {report.esgBreakdown.socialImpact}
              </p>
            </div>

            {/* Governance Pillar */}
            <div className="p-5 rounded-3xl bg-purple-50/50 border border-purple-100 shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-purple-950 text-sm">
                    Governance (G)
                  </h5>
                  <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider block">
                    Tata Kelola &amp; Akuntabilitas
                  </span>
                </div>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed font-normal">
                {report.esgBreakdown.governanceTransparency}
              </p>
            </div>
          </div>

          {/* 4. SCORECARDS METRIK DAMPAK KUANTITATIF */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E8EA] shadow-2xs space-y-4">
            <h4 className="text-xs font-extrabold text-[#181343] uppercase tracking-wider">
              Metrik Efisiensi &amp; Capaian Kuantitatif Lapangan
            </h4>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Metrik 1: Jiwa Penerima */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Jiwa Terjangkau
                </span>
                <p className="text-xl font-black text-[#181343]">
                  {report.metrics.beneficiariesReached.toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-semibold text-slate-500">Jiwa</span>
                </p>
              </div>

              {/* Metrik 2: Biaya per Jiwa */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Biaya per Penerima
                </span>
                <p className="text-base font-black text-[#181343] truncate">
                  {report.metrics.costPerBeneficiaryFormatted}
                </p>
              </div>

              {/* Metrik 3: Kepuasan Warga */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Indeks Kepuasan Warga
                </span>
                <p className="text-xl font-black text-emerald-700">
                  {report.metrics.beneficiarySatisfactionScore}%{" "}
                  <span className="text-xs font-semibold text-slate-500">Puas</span>
                </p>
              </div>

              {/* Metrik 4: Rating Efisiensi Budget */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Efisiensi Anggaran
                </span>
                <div className="pt-0.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold inline-block ${
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
              </div>
            </div>
          </div>

          {/* 5. SUCCESS STORY & HUMAN INTEREST HIGHLIGHT */}
          <div className="p-6 sm:p-7 rounded-3xl bg-amber-50/60 border border-amber-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <Quote className="w-4 h-4 text-amber-600" />
              <span>Cerita Perubahan Nyata (Human Interest Story)</span>
            </div>

            <div className="space-y-2">
              <h5 className="text-base font-extrabold text-slate-900">
                {report.successStory.headline}
              </h5>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {report.successStory.narrative}
              </p>
            </div>

            {report.successStory.beneficiaryQuote && (
              <div className="p-4 rounded-2xl bg-white border border-amber-200/60 text-xs italic text-slate-800">
                "{report.successStory.beneficiaryQuote}"
              </div>
            )}
          </div>

          {/* 6. TANTANGAN OPERASIONAL & REKOMENDASI MASA DEPAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tantangan Lapangan */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span>Tantangan &amp; Kendala Lapangan</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {report.challengesFaced.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold">&bull;</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rekomendasi Keberlanjutan */}
            <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Rekomendasi Strategis Lanjutan</span>
              </div>
              <ul className="space-y-2 text-xs text-emerald-950">
                {report.futureRecommendations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">&bull;</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Print-Only Signature Section */}
          <div className="hidden print:block pt-10 border-t border-slate-300 mt-8">
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
