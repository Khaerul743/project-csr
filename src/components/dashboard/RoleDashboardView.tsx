"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  HeartHandshake,
  TrendingUp,
  Users,
  FileText,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoleDashboardViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId?: string | null;
    partnerId?: string | null;
  };
}

export function RoleDashboardView({ user }: RoleDashboardViewProps) {
  const [orgData, setOrgData] = useState<any>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);

  useEffect(() => {
    const fetchOrgData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      setIsLoadingOrg(true);
      try {
        if (user.role === "MANAGEMENT" || user.role === "CSR_ADMIN") {
          const res = await fetch("/api/companies/current", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            setOrgData(json.data);
          }
        } else if (user.role === "PARTNER_ADMIN") {
          const res = await fetch("/api/partners/current", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            setOrgData(json.data);
          }
        }
      } catch {
        // silent fallback
      } finally {
        setIsLoadingOrg(false);
      }
    };

    fetchOrgData();
  }, [user.role, user.companyId, user.partnerId]);

  const isManagement = user.role === "MANAGEMENT";
  const isCsrAdmin = user.role === "CSR_ADMIN";
  const isPartner = user.role === "PARTNER_ADMIN";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Banner Onboarding Success / Status */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-60 h-60 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Organisasi Terhubung
            </span>
            <Badge
              variant={isPartner ? "purple" : "emerald"}
              size="sm"
              hasDot
            >
              {user.role}
            </Badge>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang di Workspace CSR, {user.name}! 🎉
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              {isManagement &&
                "Anda terdaftar sebagai pemilik/manajemen perusahaan. Anda memiliki akses penuh untuk memantau performa program CSR dan mengarahkan strategi ESG."}
              {isCsrAdmin &&
                "Anda bertugas mengelola inisiatif CSR, meninjau proposal mitra pelaksana, dan memantau realisasi di lapangan."}
              {isPartner &&
                "Anda terdaftar sebagai pimpinan mitra pelaksana (NGO/Yayasan). Anda dapat mengajukan proposal inisiatif baru dan melaporkan pencapaian kegiatan."}
            </p>
          </div>

          {/* Org Profile Summary */}
          {orgData && (
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                {isPartner ? (
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Building2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-semibold text-white text-sm">
                  {orgData.name}
                </span>
              </div>
              {orgData.city && (
                <div>
                  <span className="text-slate-400">Lokasi: </span>
                  <span className="text-slate-200">
                    {orgData.city}, {orgData.province}
                  </span>
                </div>
              )}
              {orgData.email && (
                <div>
                  <span className="text-slate-400">Email: </span>
                  <span className="text-slate-200">{orgData.email}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Highlights Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isManagement ? (
          <>
            <Card>
              <CardContent className="p-5 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Total Program CSR
                </span>
                <div className="text-2xl font-extrabold text-slate-900">0</div>
                <span className="text-[11px] text-slate-400 block">
                  Siap diinisiasi
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Alokasi Anggaran
                </span>
                <div className="text-2xl font-extrabold text-emerald-600">
                  Rp 0
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Tahun berjalan
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Mitra Terhubung
                </span>
                <div className="text-2xl font-extrabold text-slate-900">0</div>
                <span className="text-[11px] text-slate-400 block">
                  Mitra aktif
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Anggota Tim CSR
                </span>
                <div className="text-2xl font-extrabold text-slate-900">1</div>
                <span className="text-[11px] text-slate-400 block">
                  Termasuk Anda
                </span>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-5 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Proposal Aktif
                </span>
                <div className="text-2xl font-extrabold text-slate-900">0</div>
                <span className="text-[11px] text-slate-400 block">
                  Menunggu peninjauan
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Proyek Berjalan
                </span>
                <div className="text-2xl font-extrabold text-teal-600">0</div>
                <span className="text-[11px] text-slate-400 block">
                  Tahap implementasi
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Laporan Masuk
                </span>
                <div className="text-2xl font-extrabold text-slate-900">0</div>
                <span className="text-[11px] text-slate-400 block">
                  Dokumentasi lapangan
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Status Akun
                </span>
                <div className="text-2xl font-extrabold text-emerald-600">
                  Aktif
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Siap berkolaborasi
                </span>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Next Step Information Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Modul Dashboard Lengkap Sedang Dipersiapkan
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Onboarding berhasil! Modul rincian program CSR, kurasi proposal mitra, pelaporan ESG,
            dan tabel undangan anggota tim akan segera hadir di langkah berikutnya.
          </p>
        </div>

        <Badge variant="emerald" size="md">
          Sistem Siap
        </Badge>
      </div>
    </div>
  );
}
