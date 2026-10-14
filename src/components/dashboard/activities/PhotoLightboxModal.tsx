"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  initialIndex?: number;
  title?: string;
}

export function PhotoLightboxModal({
  isOpen,
  onClose,
  photos,
  initialIndex = 0,
  title,
}: PhotoLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
            {title || "Dokumentasi Kegiatan Lapangan"}
          </span>
          <span className="text-xs text-slate-400">
            ({currentIndex + 1} / {photos.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Tutup Pratinjau"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image View */}
      <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center min-h-0 py-2">
        {photos.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-10 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-white/10 shadow-lg transition-transform active:scale-95"
            aria-label="Foto Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative max-h-full max-w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl">
          <img
            src={photos[currentIndex]}
            alt={`Dokumentasi ${currentIndex + 1}`}
            className="max-h-[75vh] max-w-full object-contain rounded-2xl"
          />
        </div>

        {photos.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-10 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-white/10 shadow-lg transition-transform active:scale-95"
            aria-label="Foto Selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip (if multiple photos) */}
      {photos.length > 1 && (
        <div className="w-full max-w-2xl flex items-center justify-center gap-2 pt-3 overflow-x-auto py-1">
          {photos.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                idx === currentIndex
                  ? "border-emerald-400 scale-105 shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
