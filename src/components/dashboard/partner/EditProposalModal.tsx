"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  DollarSign,
  Calendar,
  Users,
  Link2,
  Building2,
  AlertCircle,
  CheckCircle2,
  Send,
  UploadCloud,
  Trash2,
  Loader2,
  ExternalLink,
  RotateCcw,
  MessageSquareQuote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalItem } from "./types";
import { formatRupiah } from "./helpers";

interface EditProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalItem | null;
  onSuccess: () => void;
}

export function EditProposalModal({
  isOpen,
  onClose,
  proposal,
  onSuccess,
}: EditProposalModalProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [durationMonths, setDurationMonths] = useState<number | "">("");
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  // Upload States
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size?: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize form when proposal opens
  useEffect(() => {
    if (proposal) {
      setTitle(proposal.title || "");
      setSummary(proposal.summary || "");
      setProposedBudget(
        proposal.proposedBudget ? String(parseInt(String(proposal.proposedBudget), 10)) : ""
      );
      setDurationMonths(proposal.durationMonths || "");
      setTargetBeneficiaries(proposal.targetBeneficiaries || "");
      const doc = proposal.documentUrl || "";
      setDocumentUrl(doc);

      if (doc) {
        if (doc.startsWith("http://") || doc.startsWith("https://")) {
          setUploadMode("url");
          setUploadedFile(null);
        } else {
          setUploadMode("file");
          const extractedName = doc.split("/").pop() || "Dokumen Proposal";
          setUploadedFile({ name: extractedName });
        }
      } else {
        setUploadMode("file");
        setUploadedFile(null);
      }

      setErrorMsg(null);
      setUploadError(null);
    }
  }, [proposal]);

  if (!isOpen || !proposal) return null;

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setProposedBudget(raw);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadFile = async (file: File) => {
    setUploadError(null);
    setErrorMsg(null);

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx"];
    if (!allowedExtensions.includes(ext)) {
      setUploadError("Hanya berkas berformat PDF, DOC, atau DOCX yang diperbolehkan.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Ukuran dokumen terlalu besar. Maksimal 15MB.");
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Harap login kembali.");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/proposal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah dokumen proposal");
      }

      setDocumentUrl(json.data.url);
      setUploadedFile({
        name: json.data.originalName || file.name,
        size: file.size,
      });
    } catch (err: any) {
      setUploadError(err.message || "Gagal mengunggah dokumen proposal.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleRemoveFile = () => {
    setDocumentUrl("");
    setUploadedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isUploading) {
      setErrorMsg("Mohon tunggu hingga proses unggah berkas selesai.");
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg("Judul proposal minimal 3 karakter");
      return;
    }
    if (!summary.trim() || summary.trim().length < 10) {
      setErrorMsg("Ringkasan teknis minimal 10 karakter");
      return;
    }
    const budgetNum = parseFloat(proposedBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setErrorMsg("Anggaran yang diajukan harus lebih dari Rp 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Harap login kembali.");

      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          proposedBudget: budgetNum,
          durationMonths: durationMonths ? Number(durationMonths) : null,
          targetBeneficiaries: targetBeneficiaries.trim() || null,
          documentUrl: documentUrl.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui proposal");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan penyesuaian proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasFeedback = Boolean(proposal.feedback);
  const isRevisionRequested = proposal.status === "REVISION_REQUESTED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Sesuaikan / Revisi Proposal</h2>
              <p className="text-xs text-slate-300">
                Perbarui isi proposal inisiatif berdasarkan umpan balik perusahaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Feedback Banner if available */}
          {hasFeedback && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <MessageSquareQuote className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isRevisionRequested
                    ? "Catatan Permintaan Revisi Perusahaan"
                    : "Catatan Evaluasi Perusahaan"}
                </span>
                {isRevisionRequested && (
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    Perlu Revisi
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-800 italic leading-relaxed pl-6">
                "{proposal.feedback}"
              </p>
              <p className="text-[11px] text-amber-700/80 pl-6">
                Silakan sesuaikan rincian proposal, anggaran, atau dokumen di bawah ini sesuai arahan di atas.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Judul Proposal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Proposal Inisiatif <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Program Revitalisasi Terumbu Karang Teluk Ambon"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Ringkasan & Metodologi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ringkasan Teknis & Metodologi Pelaksanaan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Jelaskan secara ringkas latar belakang masalah, metode pelaksanaan kegiatan di lapangan, tahap timeline, dan indikator keberhasilan program..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tuliskan minimal 10 karakter ringkasan komprehensif.
            </span>
          </div>

          {/* Anggaran & Durasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Anggaran Diajukan (IDR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  required
                  value={proposedBudget ? Number(proposedBudget).toLocaleString("id-ID") : ""}
                  onChange={handleBudgetChange}
                  placeholder="0"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-slate-900"
                />
              </div>
              {proposedBudget && (
                <span className="text-[11px] text-teal-600 font-semibold mt-1 block">
                  {formatRupiah(proposedBudget)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimasi Durasi (Bulan)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={durationMonths}
                  onChange={(e) =>
                    setDurationMonths(e.target.value ? parseInt(e.target.value, 10) : "")
                  }
                  placeholder="3"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Misal: 3 bulan atau 6 bulan</span>
            </div>
          </div>

          {/* Target Penerima Manfaat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Penerima Manfaat
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={targetBeneficiaries}
                onChange={(e) => setTargetBeneficiaries(e.target.value)}
                placeholder="Contoh: 120 KK Nelayan Pesisir & 50 Pemuda Karang Taruna"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Dokumen Proposal / TOR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Dokumen Proposal & TOR <span className="text-slate-400 font-normal">(Disarankan)</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    uploadMode === "file"
                      ? "bg-white text-teal-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Unggah Berkas
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    uploadMode === "url"
                      ? "bg-white text-teal-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Tautan URL
                </button>
              </div>
            </div>

            {uploadMode === "file" ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center shrink-0 border border-teal-600/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {uploadedFile.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {uploadedFile.size ? (
                            <span className="text-[11px] text-slate-500">
                              {formatFileSize(uploadedFile.size)}
                            </span>
                          ) : null}
                          <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            Berkas Terpasang
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {documentUrl && (
                        <a
                          href={documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-white transition"
                          title="Pratinjau berkas"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Hapus / ganti berkas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-teal-500 bg-teal-50/50 scale-[0.99]"
                        : "border-slate-200 hover:border-teal-500 hover:bg-slate-50/70"
                    } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center py-2 gap-2 text-teal-700">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-xs font-bold">Mengunggah dokumen proposal...</p>
                        <span className="text-[11px] text-slate-400">Menyimpan berkas ke server</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-3 shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Pilih berkas baru atau seret ke sini
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Format <strong className="text-slate-600">PDF, DOC, DOCX</strong> (Maksimal 15MB)
                        </p>
                      </>
                    )}
                  </div>
                )}

                {uploadError && (
                  <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/proposal-full.pdf"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Sertakan tautan Google Drive / Dropbox jika dokumen berada di cloud.
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              Menyimpan revisi akan mengirimkan proposal kembali ke peninjauan perusahaan.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onClose}
                disabled={isSubmitting || isUploading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || isUploading}
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                leftIcon={<Send className="w-4 h-4" />}
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : isUploading
                  ? "Mengunggah..."
                  : "Simpan & Ajukan Revisi"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
