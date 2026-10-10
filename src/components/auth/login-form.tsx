"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setErrorMessage(result.message || "Gagal masuk ke akun. Silakan coba lagi.");
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
        placeholder="Masukkan kata sandi Anda"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      <div className="flex items-center justify-end text-xs pt-1">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Fitur lupa kata sandi akan segera hadir.");
          }}
          className="text-slate-500 hover:text-emerald-600 transition-colors"
        >
          Lupa kata sandi?
        </a>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full mt-2"
        isLoading={isLoading}
        rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
      >
        Masuk ke Platform
      </Button>
    </form>
  );
}
