"use client";

import React, { useState } from "react";
import { Mail, UserPlus, AlertCircle, CheckCircle2, Shield, Copy, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CSR_ADMIN" | "MANAGEMENT">("CSR_ADMIN");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessData(null);

    if (!email.trim()) {
      setErrorMessage("Alamat email wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengirim undangan");
      }

      setSuccessData(json.data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat mengirim undangan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (successData?.token) {
      navigator.clipboard.writeText(successData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setEmail("");
    setRole("CSR_ADMIN");
    setErrorMessage(null);
    setSuccessData(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Undang Anggota Tim Perusahaan"
      description="Kirimkan undangan resmi kepada rekan tim Anda untuk bergabung mengelola program CSR."
      maxWidth="md"
    >
      {successData ? (
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">
              Undangan Berhasil Dibuat!
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Undangan untuk <strong>{successData.email}</strong> dengan peran <strong>{successData.role}</strong> siap digunakan.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Token Undangan (Masa berlaku 7 hari):
            </span>
            <div className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700">
              <span className="truncate">{successData.token}</span>
              <button
                type="button"
                onClick={handleCopyToken}
                className="text-slate-400 hover:text-emerald-600 shrink-0 p-1"
                title="Salin Token"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              Ketika pengguna login menggunakan email tersebut, sistem akan langsung mendeteksi undangan ini secara otomatis.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleReset}
            className="w-full"
          >
            Selesai
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Alamat Email Calon Anggota *"
            type="email"
            placeholder="staf.csr@perusahaan.co.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Peran / Role yang Diberikan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("CSR_ADMIN")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === "CSR_ADMIN"
                    ? "border-emerald-500 bg-emerald-50/50 text-slate-900 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSR_ADMIN</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Operasional program & verifikasi mitra CSR
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("MANAGEMENT")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === "MANAGEMENT"
                    ? "border-emerald-500 bg-emerald-50/50 text-slate-900 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Shield className="w-3.5 h-3.5 text-slate-700" />
                  <span>MANAGEMENT</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Hak penuh manajerial & analisis strategis
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleReset}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Kirim Undangan
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
