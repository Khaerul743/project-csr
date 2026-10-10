"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Info notice mengenai role default */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-800 text-xs">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
        <span className="leading-normal">
          Pendaftaran akun baru secara otomatis berstatus <strong>STAGING</strong>. Anda dapat menghubungkan profil Perusahaan atau Mitra setelah masuk.
        </span>
      </div>

      <Input
        label="Username / Nama Pengguna"
        type="text"
        placeholder="budi_santoso / yayasan_harapan"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        leftIcon={<User className="w-4 h-4" />}
        required
        autoComplete="username"
      />

      <Input
        label="Email Akun"
        type="email"
        placeholder="nama@perusahaan.com / nama@mitra.org"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="w-4 h-4" />}
        required
        autoComplete="email"
      />

      <PasswordInput
        label="Kata Sandi"
        placeholder="Minimal 6 karakter"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
      />

      <PasswordInput
        label="Konfirmasi Kata Sandi"
        placeholder="Ulangi kata sandi Anda"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full mt-2"
        isLoading={isLoading}
        rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
      >
        Daftar Akun Baru
      </Button>
    </form>
  );
}
