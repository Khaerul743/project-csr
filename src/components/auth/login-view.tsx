"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";

const INPUT_BASE_CLASS =
  "w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#C8C5D0] rounded-xl text-[14px] text-[#181343] placeholder:text-[#64748B] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all";

const PASSWORD_INPUT_CLASS =
  "w-full h-11 pl-10 pr-11 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#C8C5D0] rounded-xl text-[14px] text-[#181343] placeholder:text-[#64748B] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all";

export function LoginView() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Silakan lengkapi email dan kata sandi Anda.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(
          result.message || "Gagal masuk ke akun. Silakan coba lagi."
        );
        return;
      }

      // Simpan token ke localStorage & cookie browser
      if (result.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        document.cookie = `token=${result.data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }

      // Navigasi ke halaman dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan atau server tidak merespon.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9FB] text-[#181343] relative overflow-hidden flex items-center justify-center font-sans select-none">
      {/* Pola titik latar khas landing page SIPENA */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.028] z-0"
        style={{
          backgroundImage:
            "radial-gradient(#181343 1px, transparent 1px), radial-gradient(#181343 1px, #F9F9FB 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      />

      {/* Ambient glow mint & ice-blue sesuai token globals.css SIPENA */}
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-24 w-[480px] h-[480px] rounded-full bg-[#EAF8F4] blur-[90px] opacity-90 pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-20 w-[440px] h-[440px] rounded-full bg-[#EDF5FA] blur-[100px] opacity-90 pointer-events-none z-0"
      />

      {/* Aksen garis gelombang halus khas SIPENA pada sudut kiri bawah */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute bottom-0 left-0 w-[620px] xl:w-[700px] pointer-events-none select-none z-0"
      >
        <svg
          viewBox="0 0 700 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
        >
          <defs>
            <linearGradient
              id="sipena-login-hill-back"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#181343" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient
              id="sipena-login-hill-mid"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#059669" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#181343" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient
              id="sipena-login-wave-stroke"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#059669" stopOpacity="0.32" />
              <stop offset="55%" stopColor="#181343" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path
            d="M0 150C120 90 250 130 375 180C495 228 595 215 700 250V280H0V150Z"
            fill="url(#sipena-login-hill-back)"
          />
          <path
            d="M0 198C115 162 245 198 365 232C480 264 585 250 700 280H0V198Z"
            fill="url(#sipena-login-hill-mid)"
          />
          <path
            d="M-20 175C120 112 255 152 380 202C500 248 600 232 710 268"
            stroke="url(#sipena-login-wave-stroke)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M-20 220C115 182 240 218 360 250C475 280 580 266 690 288"
            stroke="#181343"
            strokeOpacity="0.12"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="148" cy="138" r="5" fill="#059669" fillOpacity="0.35" />
          <circle cx="298" cy="176" r="4" fill="#181343" fillOpacity="0.25" />
          <circle cx="445" cy="222" r="4.5" fill="#10B981" fillOpacity="0.32" />
        </svg>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-16">
        {/* Kolom Kiri: Identitas Brand & Headline SIPENA */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col items-start lg:-mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#47464F] hover:text-[#181343] transition-colors mb-6 rounded-lg py-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-3">
            <Image
              src="/LOGO SIPENA.png"
              alt="Logo SIPENA"
              width={44}
              height={44}
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
              priority
            />
            <div className="leading-tight">
              <span
                className="text-2xl font-extrabold tracking-tight text-[#181343] block leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                SIPENA
              </span>
              <span className="text-[11px] font-semibold text-[#181343]/60 tracking-wide block mt-1">
                Petakan Kebutuhan, Pantau Perubahan
              </span>
            </div>
          </div>

          <h1
            className="mt-6 text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-extrabold tracking-tight leading-[1.18] text-[#181343]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pantau & Kelola
            <br />
            Program CSR Anda
            <br />
            Bersama <span className="text-emerald-600">SIPENA</span>
          </h1>

          <p className="mt-4 max-w-[430px] text-[15px] leading-[1.6] text-[#47464F]">
            Masuk ke akun Anda untuk memantau realisasi kegiatan, meninjau laporan mitra,
            dan memastikan setiap inisiatif sosial berjalan sesuai rencana.
          </p>
        </div>

        {/* Kolom Kanan: Kartu Form Masuk */}
        <div className="w-full max-w-[520px] shrink-0 flex justify-center">
          <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_20px_50px_-15px_rgba(24,19,67,0.08)] p-6 sm:p-8 lg:p-9">
            <div>
              <h2
                className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-[#181343] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Masuk ke Akun SIPENA
              </h2>
              <p className="mt-1 text-sm text-[#47464F]">
                Gunakan kredensial akun Anda untuk mengakses dashboard.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-[13px] font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[13px] font-semibold text-[#181343] mb-1.5"
                >
                  Email <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail
                    aria-hidden="true"
                    className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none"
                  />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email terdaftar"
                    required
                    className={INPUT_BASE_CLASS}
                  />
                </div>
              </div>

              {/* Kata Sandi */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-[13px] font-semibold text-[#181343]"
                  >
                    Kata Sandi <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Silakan hubungi administrator institusi Anda atau tim sekretariat SIPENA di support@sipena.id untuk bantuan pemulihan kata sandi."
                      )
                    }
                    className="text-xs font-semibold text-[#047857] hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock
                    aria-hidden="true"
                    className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    required
                    className={PASSWORD_INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    className="absolute right-1.5 inline-flex items-center justify-center min-w-[36px] min-h-[36px] text-[#64748B] hover:text-[#181343] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tombol Masuk ke Akun */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-full bg-[#181343] hover:bg-[#26224C] active:bg-[#110D30] text-white font-semibold text-[14.5px] shadow-[0_10px_24px_-8px_rgba(24,19,67,0.4)] transition-colors cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] focus-visible:ring-offset-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <span>Masuk ke Akun</span>
                  )}
                </button>
              </div>

              {/* Pembatas */}
              <div className="relative flex items-center py-0.5">
                <div className="flex-grow border-t border-[#E2E8F0]" />
                <span className="shrink-0 mx-3.5 text-xs text-[#64748B] font-medium">
                  atau
                </span>
                <div className="flex-grow border-t border-[#E2E8F0]" />
              </div>

              {/* Tombol Masuk dengan Google */}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  alert(
                    "Autentikasi Single Sign-On (SSO) Google khusus untuk domain institusi terdaftar."
                  );
                }}
                className="w-full h-11 rounded-full bg-white border border-[#CBC8DB] hover:border-[#181343]/50 hover:bg-[#F4F3FA] text-[#181343] font-medium text-[14px] transition-colors cursor-pointer flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] focus-visible:ring-offset-2"
              >
                <svg
                  aria-hidden="true"
                  className="w-[18px] h-[18px] shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </button>

              {/* Tautan Belum Memiliki Akun? Daftar Sekarang */}
              <div className="pt-1 text-center">
                <p className="text-[13px] text-[#47464F]">
                  Belum memiliki akun?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-[#047857] hover:text-emerald-800 hover:underline rounded px-0.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343]"
                  >
                    Daftar Sekarang
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
