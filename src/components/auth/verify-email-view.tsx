"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Clock,
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(paramEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!paramEmail);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Countdown timer untuk kirim ulang kode (60 detik)
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (paramEmail) {
      setEmail(paramEmail);
      setIsEditingEmail(false);
    }
  }, [paramEmail]);

  // Focus input pertama saat halaman dimuat
  useEffect(() => {
    if (!isEditingEmail && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isEditingEmail]);

  // Timer cooldown resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Hanya izinkan angka
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) {
      const updated = [...otp];
      updated[index] = "";
      setOtp(updated);
      return;
    }

    const lastChar = numericValue[numericValue.length - 1];
    const updated = [...otp];
    updated[index] = lastChar;
    setOtp(updated);

    // Auto pindah ke input berikutnya jika ada karakter
    if (index < 5 && lastChar) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const updated = [...otp];
    for (let i = 0; i < 6; i++) {
      updated[i] = pastedData[i] || "";
    }
    setOtp(updated);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const fullOtp = otp.join("");
    if (!email.trim()) {
      setErrorMessage("Silakan masukkan alamat email Anda.");
      setIsEditingEmail(true);
      return;
    }

    if (fullOtp.length !== 6) {
      setErrorMessage("Silakan lengkapi seluruh 6 digit kode OTP.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: fullOtp,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "Kode verifikasi tidak sesuai atau telah kedaluwarsa.");
        return;
      }

      setIsVerified(true);

      // Simpan session token jika ada
      if (result.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        document.cookie = `token=${result.data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }

      // Beri sedikit jeda agar user melihat animasi sukses sebelum dialihkan
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan atau server tidak merespon.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isResending) return;
    if (!email.trim()) {
      setErrorMessage("Alamat email tidak boleh kosong.");
      setIsEditingEmail(true);
      return;
    }

    try {
      setIsResending(true);
      setErrorMessage(null);

      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "Gagal mengirim ulang kode OTP.");
        return;
      }

      setInfoMessage("Kode OTP baru telah berhasil dikirim ke email Anda.");
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setErrorMessage("Gagal mengirim ulang kode. Periksa koneksi internet Anda.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9FB] text-[#181343] relative overflow-hidden flex items-center justify-center font-sans">
      {/* Pola latar titik khas SIPENA */}
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

      {/* Ambient glow mint & ice-blue */}
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-24 w-[480px] h-[480px] rounded-full bg-[#EAF8F4] blur-[90px] opacity-90 pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-20 w-[440px] h-[440px] rounded-full bg-[#EDF5FA] blur-[100px] opacity-90 pointer-events-none z-0"
      />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 flex flex-col items-center">
        {/* Navigasi atas */}
        <div className="w-full max-w-[480px] flex items-center justify-between mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#47464F] hover:text-[#181343] transition-colors rounded-lg py-1 pr-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>

        {/* Kartu Utama Verifikasi OTP */}
        <div className="w-full max-w-[480px] bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_20px_50px_-15px_rgba(24,19,67,0.08)] p-6 sm:p-9">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h1
              className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#181343]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Verifikasi Email Anda
            </h1>

            <p className="mt-2 text-sm text-[#47464F] leading-relaxed max-w-sm">
              Masukkan 6 digit kode OTP yang kami kirimkan untuk mengonfirmasi kepemilikan akun Anda.
            </p>

            {/* Email Address Container */}
            <div className="mt-4 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                {isEditingEmail ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full text-xs sm:text-[13px] font-semibold text-[#181343] bg-transparent outline-none border-b border-emerald-500 py-0.5"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs sm:text-[13px] font-semibold text-[#181343] truncate">
                    {email || "Belum ada email yang diisi"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditingEmail(!isEditingEmail)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 shrink-0 transition-colors cursor-pointer"
              >
                {isEditingEmail ? "Simpan" : "Ubah"}
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-[13px] font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div
              role="status"
              className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-[13px] font-medium"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Sukses Verifikasi State */}
          {isVerified ? (
            <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-fade-in">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-emerald-950">Email Berhasil Diverifikasi!</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Akun Anda telah aktif. Mengalihkan Anda secara otomatis ke dashboard SIPENA...
              </p>
              <div className="mt-4 flex justify-center">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6">
              {/* 6-Digit OTP Boxes */}
              <div>
                <label className="block text-[13px] font-semibold text-[#181343] text-center mb-3">
                  Kode Verifikasi (6 Digit)
                </label>
                <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      disabled={isLoading}
                      className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-[#181343] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#C8C5D0] rounded-xl outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all shadow-xs disabled:opacity-50"
                      aria-label={`Digit ke ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Expire indicator notice */}
              <div className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
                <Clock className="w-3.5 h-3.5" />
                <span>Kode OTP berlaku selama 10 menit</span>
              </div>

              {/* Tombol Verifikasi */}
              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="mt-6 w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-xl transition-all shadow-md shadow-emerald-700/15 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Verifikasi Sekarang</span>
                )}
              </button>

              {/* Kirim Ulang OTP Section */}
              <div className="mt-6 pt-5 border-t border-[#F1F5F9] text-center">
                <p className="text-xs text-[#64748B] mb-2">Tidak menerima kode verifikasi di email Anda?</p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim kode baru...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Kirim Ulang Kode OTP</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs font-medium text-[#94A3B8]">
                    Kirim ulang kode dalam <strong className="text-[#47464F]">{countdown}s</strong>
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Footer bantuan */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-[#94A3B8]">
              Periksa juga folder <span className="font-semibold text-[#64748B]">Spam</span> atau{" "}
              <span className="font-semibold text-[#64748B]">Promosi</span> jika email tidak masuk ke Kotak Masuk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerifyEmailView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F9F9FB] text-emerald-700">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

