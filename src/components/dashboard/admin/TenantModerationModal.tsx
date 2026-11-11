"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { AdminModal } from "./AdminSharedPrimitives";

interface TenantModerationModalProps {
  isOpen: boolean;
  entityType: "COMPANY" | "PARTNER";
  entityId: string | null;
  entityName: string;
  currentStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  currentVerified: boolean;
  currentNotes?: string | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function TenantModerationModal({
  isOpen,
  entityType,
  entityId,
  entityName,
  currentStatus,
  currentVerified,
  currentNotes,
  onClose,
  onUpdated,
}: TenantModerationModalProps) {
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">(currentStatus);
  const [isVerified, setIsVerified] = useState<boolean>(currentVerified);
  const [notes, setNotes] = useState<string>(currentNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus);
      setIsVerified(currentVerified);
      setNotes(currentNotes || "");
      setErrorMsg(null);
    }
  }, [isOpen, currentStatus, currentVerified, currentNotes]);

  const entityLabel = entityType === "COMPANY" ? "Perusahaan" : "Mitra NGO";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId) return;
    setErrorMsg(null);

    const trimmedNotes = notes.trim();
    if (status === "SUSPENDED" && trimmedNotes.length < 5) {
      setErrorMsg(
        `Alasan penangguhan ${entityLabel.toLowerCase()} wajib diisi minimal 5 karakter.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Silakan login kembali.");

      const endpoint =
        entityType === "COMPANY"
          ? `/api/admin/companies/${entityId}/status`
          : `/api/admin/partners/${entityId}/status`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          isVerified,
          verificationNotes: trimmedNotes || null,
          reason: trimmedNotes || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Gagal memperbarui status ${entityLabel.toLowerCase()}`);
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan perubahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Verifikasi & Kontrol Status ${entityLabel}`}
      subtitle={entityName}
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Verification status toggle */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold text-[#181343]">
            Status Verifikasi Legalitas
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsVerified(true)}
              aria-pressed={isVerified}
              className={`min-h-[44px] p-3 rounded-xl border text-left transition-colors flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] ${
                isVerified
                  ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-bold"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <span className="text-xs">Terverifikasi Resmi</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVerified(false)}
              aria-pressed={!isVerified}
              className={`min-h-[44px] p-3 rounded-xl border text-left transition-colors flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] ${
                !isVerified
                  ? "border-amber-700 bg-amber-50 text-amber-900 font-bold"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" aria-hidden="true" />
              <span className="text-xs">Belum Terverifikasi</span>
            </button>
          </div>
        </fieldset>

        {/* Account Status */}
        <div className="space-y-2">
          <label
            htmlFor="tenant-status-select"
            className="block text-xs font-bold text-[#181343]"
          >
            Status Operasional Akun {entityLabel}
          </label>
          <select
            id="tenant-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE" | "SUSPENDED")}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
          >
            <option value="ACTIVE">Aktif (Dapat beroperasi penuh)</option>
            <option value="INACTIVE">Nonaktif (Diarsipkan sementara)</option>
            <option value="SUSPENDED">Ditangguhkan (SUSPENDED akibat pelanggaran)</option>
          </select>
        </div>

        {/* Notes / Reason */}
        <div className="space-y-1.5">
          <label
            htmlFor="tenant-moderation-notes"
            className="block text-xs font-bold text-[#181343]"
          >
            Catatan Verifikasi / Alasan Perubahan Status{" "}
            {status === "SUSPENDED" ? "(Wajib diisi)" : "(Opsional)"}
          </label>
          <textarea
            id="tenant-moderation-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Catat hasil pemeriksaan dokumen NIB/NPWP/SK atau alasan penangguhan..."
            className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343] resize-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] disabled:opacity-60"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{isSubmitting ? "Menyimpan..." : "Simpan Keputusan"}</span>
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

