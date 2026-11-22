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
  Clock,
} from "lucide-react";

export interface VerifyEmailCardProps {
  initialEmail?: string;
  onBackToRegister?: () => void;
  className?: string;
  bare?: boolean;
  animateIn?: boolean;
}

export function VerifyEmailCardContent({
  initialEmail,
  onBackToRegister,
  className = "",
  bare = false,
  animateIn = false,
}: VerifyEmailCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramEmail = initialEmail || searchParams?.get("email") || "";

  const [email, setEmail] = useState(paramEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!paramEmail);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Staggered reveal state for smooth entry
  const [isStaggerRevealed, setIsStaggerRevealed] = useState(!animateIn);

  useEffect(() => {
    if (animateIn) {
      const frame = requestAnimationFrame(() => {
        setIsStaggerRevealed(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsStaggerRevealed(true);
    }
  }, [animateIn]);

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

  // Focus input pertama: jika animateIn, tunggu hingga panel & stagger tiba (~700ms)
  useEffect(() => {
    if (!isEditingEmail && inputRefs.current[0]) {
      const delay = animateIn ? 700 : 50;
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isEditingEmail, animateIn]);

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

      // Beri jeda sebelum beralih ke dashboard
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

  const body = (
    <div className={bare ? className : ""}>
      {/* 1. Tombol Navigasi Kembali & Judul Verifikasi Email Anda + Deskripsi */}
      <div
        className={`transition-all duration-[220ms] ease-out motion-reduce:transition-none ${
          animateIn
            ? isStaggerRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
        style={{
          transitionDelay: animateIn && isStaggerRevealed ? "350ms" : "0ms",
        }}
      >
        <div className="mb-4">
          {onBackToRegister ? (
            <button
              type="button"
              onClick={onBackToRegister}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#47464F] hover:text-[#181343] transition-colors rounded-lg py-1 pr-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Formulir Pendaftaran</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#47464F] hover:text-[#181343] transition-colors rounded-lg py-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          )}
        </div>

        <div>
          <h2
            className="text-[24px] sm:text-[26px] font-extrabold tracking-tight text-[#181343] leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Verifikasi Email Anda
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#47464F] leading-relaxed">
            Masukkan 6 digit kode OTP yang kami kirimkan untuk mengonfirmasi kepemilikan akun Anda.
          </p>
        </div>
      </div>

      {/* 2. Informasi Alamat Email Pengguna & Feedback Messages */}
      <div
        className={`transition-all duration-[220ms] ease-out motion-reduce:transition-none ${
          animateIn
            ? isStaggerRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
        style={{
          transitionDelay: animateIn && isStaggerRevealed ? "395ms" : "0ms",
        }}
      >
        {/* Email Address Container */}
        <div className="mt-4 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mail className="w-4 h-4 text-[#181343]/70 shrink-0" />
            {isEditingEmail ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full text-xs sm:text-[13px] font-semibold text-[#181343] bg-transparent outline-none border-b border-[#181343] py-0.5"
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
            className="text-xs font-semibold text-[#181343] hover:text-emerald-700 shrink-0 transition-colors cursor-pointer underline underline-offset-2"
          >
            {isEditingEmail ? "Simpan" : "Ubah"}
          </button>
        </div>

        {/* Feedback messages */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-[13px] font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div
            role="status"
            className="mt-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-[13px] font-medium"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{infoMessage}</span>
          </div>
        )}
      </div>

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
        <form onSubmit={handleSubmit} className="mt-5">
          {/* 3. Enam Kotak Input Kode OTP */}
          <div
            className={`transition-all duration-[220ms] ease-out motion-reduce:transition-none ${
              animateIn
                ? isStaggerRevealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
            style={{
              transitionDelay: animateIn && isStaggerRevealed ? "440ms" : "0ms",
            }}
          >
            <label className="block text-[13px] font-semibold text-[#181343] mb-2.5">
              Kode Verifikasi (6 Digit) <span className="text-rose-600">*</span>
            </label>
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
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
                  className="w-12 h-12 sm:w-14 sm:h-14 aspect-square text-center text-xl sm:text-2xl font-black font-mono text-[#181343] bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl sm:rounded-2xl outline-none focus:bg-white focus:border-[#181343] focus:ring-4 focus:ring-[#181343]/10 transition-all shadow-xs disabled:opacity-50"
                  aria-label={`Digit ke ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 4. Informasi Masa Berlaku OTP */}
          <div
            className={`transition-all duration-[220ms] ease-out motion-reduce:transition-none mt-3.5 flex items-center justify-center gap-1.5 text-xs text-[#64748B] ${
              animateIn
                ? isStaggerRevealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
            style={{
              transitionDelay: animateIn && isStaggerRevealed ? "485ms" : "0ms",
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Kode OTP berlaku selama 10 menit</span>
          </div>

          {/* 5. Tombol Verifikasi Sekarang */}
          <div
            className={`transition-all duration-[220ms] ease-out motion-reduce:transition-none pt-2 ${
              animateIn
                ? isStaggerRevealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
            style={{
              transitionDelay: animateIn && isStaggerRevealed ? "530ms" : "0ms",
            }}
          >
            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="mt-4 w-full h-11 rounded-full bg-[#181343] hover:bg-[#26224C] active:bg-[#110D30] text-white font-semibold text-[14.5px] shadow-[0_10px_24px_-8px_rgba(24,19,67,0.4)] transition-colors cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <span>Verifikasi Sekarang</span>
              )}
            </button>
          </div>

          {/* 6. Kirim Ulang OTP Section & Footer Bantuan */}
          <div
            className={`transition-all duration-[220ms] ease-out motion-reduce:transition-none ${
              animateIn
                ? isStaggerRevealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
            style={{
              transitionDelay: animateIn && isStaggerRevealed ? "575ms" : "0ms",
            }}
          >
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

            {/* Footer bantuan */}
            <div className="mt-6 text-center">
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Periksa juga folder <span className="font-semibold text-[#64748B]">Spam</span> atau{" "}
                <span className="font-semibold text-[#64748B]">Promosi</span> jika email tidak masuk ke Kotak Masuk.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  if (bare) {
    return body;
  }

  return (
    <div
      className={`w-full max-w-[480px] bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_20px_50px_-15px_rgba(24,19,67,0.08)] p-6 sm:p-8 lg:p-9 ${className}`}
    >
      {body}
    </div>
  );
}

export function VerifyEmailCard(props: VerifyEmailCardProps) {
  return (
    <Suspense
      fallback={
        props.bare ? (
          <div className="w-full h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#181343]" />
          </div>
        ) : (
          <div className="w-full max-w-[480px] h-[460px] bg-white rounded-3xl border border-[#E5E7EB] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#181343]" />
          </div>
        )
      }
    >
      <VerifyEmailCardContent {...props} />
    </Suspense>
  );
}

function VerifyEmailPageWrapper() {
  return (
    <div className="min-h-screen w-full bg-[#F9F9FB] text-[#181343] relative overflow-hidden flex items-center justify-center font-sans select-none py-10 px-4">
      {/* Pola titik latar khas SIPENA */}
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

      <div className="w-full max-w-lg mx-auto relative z-10 flex flex-col items-center">
        {/* SIPENA Logo & Header Centered */}
        <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
          <Image
            src="/LOGO SIPENA.png"
            alt="Logo SIPENA"
            width={44}
            height={44}
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
            priority
          />
          <div className="leading-tight text-left">
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

        {/* Verification Card in Center */}
        <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <VerifyEmailCard />
        </div>
      </div>
    </div>
  );
}

export function VerifyEmailView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F9F9FB] text-[#181343]">
          <Loader2 className="w-8 h-8 animate-spin text-[#181343]" />
        </div>
      }
    >
      <VerifyEmailPageWrapper />
    </Suspense>
  );
}
