"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      // Jika belum login, redirect ke halaman login
      router.push("/login");
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // ignore
      }
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Halaman uji coba mekanisme login & autentikasi
          </p>
        </div>

        {user ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Status Login:</span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <UserCheck className="w-4 h-4" />
                <span>Terautentikasi</span>
              </div>
            </div>

            <div className="text-xs text-slate-700">
              <span className="text-slate-400 block text-[11px]">Nama Pengguna:</span>
              <span className="font-semibold">{user.name}</span>
            </div>

            <div className="text-xs text-slate-700">
              <span className="text-slate-400 block text-[11px]">Email:</span>
              <span className="font-semibold">{user.email}</span>
            </div>

            <div className="text-xs text-slate-700 flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-400 text-[11px]">Role:</span>
              <Badge variant="amber" size="sm">
                {user.role}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Tidak ada data user lokal.</p>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4" />}
          className="w-full"
        >
          Keluar (Logout)
        </Button>
      </div>
    </div>
  );
}
