"use client";

import React, { useState } from "react";
import {
  Building2,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Mail,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyRegisterModal } from "./CompanyRegisterModal";
import { PartnerRegisterModal } from "./PartnerRegisterModal";

interface StagingOnboardingViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onRoleUpdated: (updatedUser: any) => void;
}

export function StagingOnboardingView({
  user,
  onRoleUpdated,
}: StagingOnboardingViewProps) {
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Hero Welcome Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dashboard Staging • Tahap Onboarding</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Selamat Datang,{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            {user.name}
          </span>
          ! 👋
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Akun Anda saat ini berada dalam status <strong>STAGING</strong>. Silakan pilih jalur
          organisasi Anda di bawah ini untuk memulai langkah kolaborasi dampak sosial.
        </p>
      </div>

      {/* 2 Main Pathway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Card 1: Perusahaan */}
        <Card className="group relative overflow-hidden border-2 border-slate-200/90 hover:border-emerald-500/80 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:h-2 transition-all duration-200" />

          <CardContent className="p-7 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
                  <Building2 className="w-7 h-7" />
                </div>
                <Badge variant="emerald" size="sm" hasDot>
                  Peran: MANAGEMENT
                </Badge>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                  Daftarkan Perusahaan
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Untuk entitas bisnis atau korporasi yang ingin mendanai, menginisiasi,
                  dan memantau program CSR serta komitmen ESG.
                </p>
              </div>

              {/* Value Points */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dashboard Strategis:</strong> Analisis dampak program dan metrik ESG secara holistik.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Kelola Tim:</strong> Anda dapat mengundang anggota tim internal sebagai <em>CSR Admin</em>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Kemitraan Terverifikasi:</strong> Pilih dan verifikasi mitra pelaksana terpercaya.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsCompanyModalOpen(true)}
                className="w-full group-hover:shadow-lg group-hover:shadow-emerald-600/25"
                rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              >
                Mulai sebagai Perusahaan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Mitra CSR / NGO */}
        <Card className="group relative overflow-hidden border-2 border-slate-200/90 hover:border-teal-500/80 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 group-hover:h-2 transition-all duration-200" />

          <CardContent className="p-7 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <Badge variant="purple" size="sm" hasDot>
                  Peran: PARTNER_ADMIN
                </Badge>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
                  Daftarkan Mitra / NGO
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Untuk yayasan sosial, lembaga nirlaba, atau komunitas pelaksana yang
                  mencari pendanaan dan kolaborasi CSR.
                </p>
              </div>

              {/* Value Points */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <FileCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ajukan Proposal:</strong> Terhubung dengan katalog inisiatif perusahaan yang relevan.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <TrendingUp className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Laporan & Dokumentasi:</strong> Unggah progres kegiatan lapangan transparan.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rekam Jejak Kredibel:</strong> Bangun portofolio dampak terverifikasi untuk kemitraan berulang.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsPartnerModalOpen(true)}
                className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 group-hover:shadow-lg group-hover:shadow-teal-600/25"
                rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              >
                Mulai sebagai Mitra / NGO
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notice Section: Undangan Tim */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Bergabung Melalui Undangan Tim?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Jika Anda bergabung untuk membantu tim yang sudah ada (sebagai <em>CSR Admin</em> perusahaan atau staf mitra),
              Anda tidak perlu mendaftarkan organisasi baru. Cek kotak masuk email <strong>{user.email}</strong> untuk tautan undangan resmi dari pimpinan Anda.
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <span className="text-[11px] text-slate-400 block text-center sm:text-right">
            Sistem Undangan Otomatis
          </span>
        </div>
      </div>

      {/* Modals */}
      <CompanyRegisterModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={onRoleUpdated}
      />

      <PartnerRegisterModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSuccess={onRoleUpdated}
      />
    </div>
  );
}
