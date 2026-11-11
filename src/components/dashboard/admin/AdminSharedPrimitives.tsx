"use client";

import React, { useEffect, useId, useRef } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw, X } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidthClass = "max-w-2xl",
  children,
}: AdminModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full ${maxWidthClass} bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] focus:outline-none`}
      >
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base sm:text-lg font-bold text-[#181343] truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center rounded-xl text-slate-600 hover:text-[#181343] hover:bg-slate-200/70 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">{children}</div>
      </div>
    </div>
  );
}

interface AdminLoadingStateProps {
  message: string;
}

export function AdminLoadingState({ message }: AdminLoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center justify-center text-center gap-3"
    >
      <RefreshCw className="w-6 h-6 text-[#181343] animate-spin" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">{message}</p>
    </div>
  );
}

interface AdminErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function AdminErrorState({ message, onRetry }: AdminErrorStateProps) {
  return (
    <div
      role="alert"
      className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-700">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#181343]">Gagal Memuat Data</h3>
          <p className="text-xs sm:text-sm text-slate-700 mt-0.5">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-[44px] px-4 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] shrink-0"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        <span>Muat Ulang</span>
      </button>
    </div>
  );
}

interface AdminEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: AdminEmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2.5">
      <h3 className="text-sm font-bold text-[#181343]">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#181343] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

interface AdminPaginationBarProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (nextPage: number) => void;
}

export function AdminPaginationBar({
  page,
  limit,
  total,
  onPageChange,
}: AdminPaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
      <p className="text-xs font-medium text-slate-600">
        Halaman <span className="font-bold text-[#181343]">{page}</span> dari{" "}
        <span className="font-bold text-[#181343]">{totalPages}</span> (Total {total} data)
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-45 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Sebelumnya</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-45 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

