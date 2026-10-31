"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

export function RegisterForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Silakan lengkapi seluruh kolom formulir pendaftaran.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.details && Array.isArray(result.details)) {
          const detailMessages = result.details.map((d: { message: string }) => d.message).join(", ");
          setErrorMessage(detailMessages || result.message);
        } else {
          setErrorMessage(result.message || "Gagal mendaftarkan akun. Silakan coba lagi.");
        }
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
    } catch (err: unknown) {
      setErrorMessage("Terjadi kesalahan jaringan atau server tidak merespon.");
    } finally {
      setIsLoading(false);
    }
  };

  // Shared input styles
  const inputClass =
    "w-full h-11 pl-11 pr-4 text-[14px] text-[#1A1C1D] placeholder:text-[#C8C5D0] bg-[#F9F9FB] border border-[#E8E8EA] rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-[#181343]/40 focus:ring-2 focus:ring-[#181343]/8";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FFDAD6]/40 border border-[#BA1A1A]/10 text-[#93000A] text-[13px] leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#BA1A1A]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Info notice — default role */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F0FAF0] border border-[#C8E6C9]/60 text-[#2E7D32] text-[12px] leading-relaxed">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#43A047]" />
        <span>
          Akun baru secara otomatis berstatus <strong>STAGING</strong>. Hubungkan
          profil Perusahaan atau Mitra setelah masuk.
        </span>
      </div>

      {/* Username field */}
      <div className="space-y-1.5">
        <label
          htmlFor="register-username"
          className="block text-[13px] font-semibold text-[#1A1C1D]"
        >
          Username
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C8C5D0] pointer-events-none">
            <User className="w-[18px] h-[18px]" />
          </div>
          <input
            id="register-username"
            type="text"
            placeholder="budi_santoso"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email field */}
      <div className="space-y-1.5">
        <label
          htmlFor="register-email"
          className="block text-[13px] font-semibold text-[#1A1C1D]"
        >
          Email
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C8C5D0] pointer-events-none">
            <Mail className="w-[18px] h-[18px]" />
          </div>
          <input
            id="register-email"
            type="email"
            placeholder="nama@perusahaan.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-1.5">
        <label
          htmlFor="register-password"
          className="block text-[13px] font-semibold text-[#1A1C1D]"
        >
          Kata Sandi
        </label>
        <PasswordInput
          id="register-password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="h-11 text-[14px] bg-[#F9F9FB] border-[#E8E8EA] focus:bg-white focus:border-[#181343]/40 focus:ring-2 focus:ring-[#181343]/8"
        />
      </div>

      {/* Confirm password field */}
      <div className="space-y-1.5">
        <label
          htmlFor="register-confirm-password"
          className="block text-[13px] font-semibold text-[#1A1C1D]"
        >
          Konfirmasi Kata Sandi
        </label>
        <PasswordInput
          id="register-confirm-password"
          placeholder="Ulangi kata sandi Anda"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="h-11 text-[14px] bg-[#F9F9FB] border-[#E8E8EA] focus:bg-white focus:border-[#181343]/40 focus:ring-2 focus:ring-[#181343]/8"
        />
      </div>

      {/* Submit button */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 inline-flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#181343] rounded-xl transition-all duration-200 hover:bg-[#26224C] hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          style={{
            boxShadow: "0 1px 3px rgba(24,19,67,0.12), 0 2px 8px rgba(24,19,67,0.08)",
          }}
        >
          {isLoading ? (
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <>
              <span>Daftar Akun Baru</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
