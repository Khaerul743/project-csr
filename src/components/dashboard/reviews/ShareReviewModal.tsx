"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  QrCode,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programTitle: string;
}

export function ShareReviewModal({
  isOpen,
  onClose,
  programId,
  programTitle,
}: ShareReviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [publicUrl, setPublicUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/review/${programId}`;
      setPublicUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f766e", // Teal 700
          light: "#ffffff",
        },
      })
        .then((dataUrl) => {
          setQrDataUrl(dataUrl);
        })
        .catch((err) => {
          console.error("Gagal generate QR Code:", err);
        });
    }
  }, [programId]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin link:", err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-Survei-${programTitle.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Bagikan Survei & QR Code
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {programTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-xs text-slate-600 leading-relaxed">
              Masyarakat dan penerima manfaat dapat langsung mengisi ulasan kepuasan 
              <strong className="text-slate-800"> tanpa perlu mendaftar/login</strong>.
            </p>
          </div>

          {/* QR Code Card */}
          <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-teal-50/40 to-slate-50 border border-teal-100/70 rounded-2xl">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 mb-3">
                <img
                  src={qrDataUrl}
                  alt="QR Code Survei Masyarakat"
                  className="w-48 h-48 rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                <QrCode className="w-10 h-10 animate-spin" />
              </div>
            )}
            <p className="text-[11px] font-medium text-slate-500 mb-3 text-center">
              Pindai dengan kamera smartphone di lokasi kegiatan
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadQr}
              className="w-full text-xs font-bold text-teal-700 border-teal-200 hover:bg-teal-50"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Unduh QR Code (Cetak Spanduk/Flyer)
            </Button>
          </div>

          {/* Direct Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Tautan Langsung Survei Publik
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 select-all font-mono focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleCopy}
                size="sm"
                className={`text-xs font-bold transition-all ${
                  copied
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-200" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Salin
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* External Link Action */}
          <div className="pt-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline py-1"
            >
              Buka Halaman Ulasan Publik
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
