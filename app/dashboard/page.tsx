"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/dashboard/Navbar";
import { StagingOnboardingView } from "@/components/dashboard/staging/StagingOnboardingView";
import { RoleDashboardView } from "@/components/dashboard/RoleDashboardView";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  companyId?: string | null;
  partnerId?: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // fallback
      }
    }

    // Ambil data user paling mutakhir dari server
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setUser(json.data);
            localStorage.setItem("user", JSON.stringify(json.data));
          }
        }
      } catch {
        // Abaikan jika offline, tetap gunakan data localStorage
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  const handleRoleUpdated = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Memuat sesi Anda...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isStaging = user.role === "STAGING";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sticky Top Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1">
        {isStaging ? (
          <StagingOnboardingView
            user={user}
            onRoleUpdated={handleRoleUpdated}
          />
        ) : (
          <RoleDashboardView user={user} />
        )}
      </main>
    </div>
  );
}
