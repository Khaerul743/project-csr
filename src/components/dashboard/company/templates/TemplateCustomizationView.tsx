"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LayoutTemplate,
  Plus,
  Pencil,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Copy,
  FileText,
  Clock,
  Info,
  MailWarning,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export type CompanyTemplateCategory =
  | "PARTNER_INVITATION"
  | "INVITATION_OVERDUE";

export interface CompanyTemplateItem {
  id: string;
  companyId: string;
  category: CompanyTemplateCategory;
  title: string;
  content: string;
  isDefault: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TemplateCustomizationViewProps {
  companyName?: string | null;
  picName?: string | null;
  picPosition?: string | null;
}

const PLACEHOLDERS = [
  {
    token: "{{nama_yayasan}}",
    label: "Nama Yayasan/Mitra",
    sample: "Yayasan Bina Nusantara",
  },
  {
    token: "{{nama_perusahaan}}",
    label: "Nama Perusahaan",
    sample: "PT Sinergi Karya",
  },
  {
    token: "{{nama_program}}",
    label: "Nama Program",
    sample: "Program Beasiswa Pendidikan Digital",
  },
  {
    token: "{{bidang_csr}}",
    label: "Bidang CSR",
    sample: "Pendidikan",
  },
  {
    token: "{{lokasi_program}}",
    label: "Lokasi Program",
    sample: "Kota Bandung, Jawa Barat",
  },
  {
    token: "{{batas_respons}}",
    label: "Batas Respons",
    sample: "3 Desember 2026",
  },
  {
    token: "{{nama_pic}}",
    label: "Nama PIC",
    sample: "Budi Santoso",
  },
  {
    token: "{{jabatan_pic}}",
    label: "Jabatan PIC",
    sample: "CSR Administrator",
  },
];

const STARTER_TEMPLATES_BY_CATEGORY: Record<
  CompanyTemplateCategory,
  Array<{ title: string; content: string }>
> = {
  PARTNER_INVITATION: [
    {
      title: "Undangan Resmi Kolaborasi CSR (Standar)",
      content: `Yth. Bapak/Ibu Pengurus {{nama_yayasan}},

Salam sejahtera,

Perkenalkan, kami dari {{nama_perusahaan}}. Melalui program Corporate Social Responsibility (CSR), kami berkomitmen untuk mendukung berbagai inisiatif sosial dan lingkungan yang memberikan dampak positif bagi masyarakat.

Sehubungan dengan hal tersebut, kami bermaksud mengundang {{nama_yayasan}} untuk menjalin kolaborasi dalam pelaksanaan program CSR kami yang berjudul "{{nama_program}}", dengan fokus pada bidang {{bidang_csr}} di wilayah {{lokasi_program}}.

Kami melihat bahwa fokus dan pengalaman organisasi Bapak/Ibu memiliki kesesuaian dengan tujuan program tersebut. Oleh karena itu, kami berharap dapat membangun kemitraan yang sinergis dalam mendukung pelaksanaan program dan memberikan manfaat nyata bagi masyarakat.

Untuk informasi lebih lanjut mengenai program, Bapak/Ibu dapat meninjau detail peluang CSR yang kami tawarkan. Apabila tertarik untuk menjajaki kolaborasi ini, kami mengharapkan tanggapan Bapak/Ibu paling lambat pada {{batas_respons}}.

Terima kasih atas perhatian dan kesediaannya. Kami berharap undangan ini dapat menjadi awal dari kolaborasi yang baik dan berkelanjutan bersama {{nama_yayasan}}.

Hormat kami,

{{nama_perusahaan}}
{{nama_pic}}
{{jabatan_pic}}`,
    },
    {
      title: "Undangan Penjajakan & Diskusi Awal (Ringkas)",
      content:
        "Yth. Pengurus {{nama_yayasan}},\n\n{{nama_perusahaan}} mengundang organisasi Anda untuk berkolaborasi dalam program {{nama_program}} (bidang {{bidang_csr}}) di wilayah {{lokasi_program}}. Apabila berminat, kami mengharapkan tanggapan Anda paling lambat pada {{batas_respons}}.\n\nSalam hangat,\n{{nama_pic}} - {{jabatan_pic}}",
    },
  ],
  INVITATION_OVERDUE: [
    {
      title: "Pemberitahuan Undangan Melewati Batas Waktu (Standar)",
      content: `Yth. Bapak/Ibu Pengurus {{nama_yayasan}},

Salam sejahtera,

Kami dari {{nama_perusahaan}} ingin menginformasikan bahwa undangan kolaborasi untuk program CSR "{{nama_program}}" telah melewati batas waktu tanggapan yang ditentukan, yaitu {{batas_respons}}.

Hingga batas waktu tersebut, kami belum menerima tanggapan dari Bapak/Ibu. Dengan demikian, kami memutuskan untuk membatalkan undangan kolaborasi ini.

Kami mohon maaf apabila keputusan ini menimbulkan ketidaknyamanan. Terima kasih atas perhatian dan kesempatan yang telah diberikan. Kami berharap dapat menjalin kerja sama dengan Bapak/Ibu pada kesempatan lainnya.

Hormat kami,
{{nama_perusahaan}}`,
    },
    {
      title: "Notifikasi Pembatalan Otomatis (Ringkas)",
      content:
        "Yth. Pengurus {{nama_yayasan}},\n\nKami dari {{nama_perusahaan}} menginformasikan bahwa undangan kolaborasi untuk program \"{{nama_program}}\" telah melewati batas waktu tanggapan ({{batas_respons}}) sehingga otomatis dibatalkan. Kami berharap dapat menjalin kerja sama di kesempatan mendatang.\n\nHormat kami,\n{{nama_perusahaan}}",
    },
  ],
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return "-";
  }
}

export function TemplateCustomizationView({
  companyName,
  picName,
  picPosition,
}: TemplateCustomizationViewProps) {
  const [templates, setTemplates] = useState<CompanyTemplateItem[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<CompanyTemplateCategory>("PARTNER_INVITATION");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal Create / Edit state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<CompanyTemplateItem | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation state
  const [templateToDelete, setTemplateToDelete] =
    useState<CompanyTemplateItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch("/api/companies/current/templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat daftar template");
      }

      setTemplates(Array.isArray(json.data) ? json.data : []);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memuat daftar template");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const countsByCategory = useMemo(() => {
    return {
      PARTNER_INVITATION: templates.filter(
        (t) => t.category === "PARTNER_INVITATION"
      ).length,
      INVITATION_OVERDUE: templates.filter(
        (t) => t.category === "INVITATION_OVERDUE"
      ).length,
    };
  }, [templates]);

  const displayedTemplates = useMemo(() => {
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  const openCreateModal = (preset?: { title: string; content: string }) => {
    setEditingTemplate(null);
    setTitle(preset?.title || "");
    setContent(preset?.content || "");
    setIsDefault(displayedTemplates.length === 0);
    setFormError(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (tpl: CompanyTemplateItem) => {
    setEditingTemplate(tpl);
    setTitle(tpl.title);
    setContent(tpl.content);
    setIsDefault(tpl.isDefault);
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleInsertPlaceholder = (token: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContent(
        (prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${token}`
      );
      return;
    }

    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const updated =
      content.substring(0, start) + token + content.substring(end);
    setContent(updated);

    setTimeout(() => {
      el.focus();
      const newCursorPos = start + token.length;
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (title.trim().length < 3) {
      setFormError("Judul template minimal 3 karakter.");
      return;
    }
    if (content.trim().length < 10) {
      setFormError("Isi pesan template minimal 10 karakter.");
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login tidak valid.");

      const url = editingTemplate
        ? `/api/companies/current/templates/${editingTemplate.id}`
        : "/api/companies/current/templates";
      const method = editingTemplate ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(editingTemplate ? {} : { category: activeCategory }),
          title: title.trim(),
          content: content.trim(),
          isDefault,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.details && Array.isArray(json.details)) {
          throw new Error(json.details.map((d: any) => d.message).join(", "));
        }
        throw new Error(json.message || "Gagal menyimpan template.");
      }

      setIsEditorOpen(false);
      setSuccessMessage(
        editingTemplate
          ? "Template pesan berhasil diperbarui."
          : "Template pesan baru berhasil ditambahkan."
      );
      await fetchTemplates();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan saat menyimpan template.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (tpl: CompanyTemplateItem) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/companies/current/templates/${tpl.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isDefault: !tpl.isDefault }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memperbarui status default.");
      }

      setSuccessMessage(
        !tpl.isDefault
          ? `"${tpl.title}" dijadikan template utama (default).`
          : `Status default untuk "${tpl.title}" dinonaktifkan.`
      );
      await fetchTemplates();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memperbarui template.");
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(
        `/api/companies/current/templates/${templateToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus template.");
      }

      setTemplateToDelete(null);
      setSuccessMessage("Template berhasil dihapus.");
      await fetchTemplates();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghapus template.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPreviewText = (raw: string) => {
    return raw
      .replace(/\{\{nama_yayasan\}\}/gi, "Yayasan Bina Nusantara")
      .replace(/\{\{nama_mitra\}\}/gi, "Yayasan Bina Nusantara")
      .replace(/\{\{nama_program\}\}/gi, "Program Beasiswa Pendidikan Digital")
      .replace(/\{\{bidang_csr\}\}/gi, "Pendidikan")
      .replace(/\{\{lokasi_program\}\}/gi, "Kota Bandung, Jawa Barat")
      .replace(/\{\{batas_respons\}\}/gi, "3 Desember 2026")
      .replace(/\{\{nama_pic\}\}/gi, picName?.trim() || "Budi Santoso")
      .replace(/\{\{jabatan_pic\}\}/gi, picPosition?.trim() || "CSR Administrator")
      .replace(
        /\{\{nama_perusahaan\}\}/gi,
        companyName?.trim() || "Perusahaan Anda"
      );
  };

  const isOverdueCategory = activeCategory === "INVITATION_OVERDUE";
  const starterPresets = STARTER_TEMPLATES_BY_CATEGORY[activeCategory];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#181343]/5 border border-[#181343]/10 flex items-center justify-center text-[#181343]">
              <LayoutTemplate aria-hidden="true" className="w-4.5 h-4.5" />
            </div>
            <h1
              className="text-lg sm:text-xl font-extrabold text-[#181343] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Kustomisasi Template
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#47464F] max-w-2xl">
            Kelola naskah pesan undangan mitra dan email pemberitahuan batas waktu (Overdue) agar komunikasi kemitraan perusahaan tetap konsisten dan cepat disesuaikan.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => openCreateModal()}
          leftIcon={<Plus className="w-4 h-4" />}
          className="min-h-[44px] shrink-0 cursor-pointer"
        >
          Buat Template Baru
        </Button>
      </div>

      {/* Category Tabs */}
      <div
        role="tablist"
        aria-label="Kategori Template Perusahaan"
        className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] pb-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "PARTNER_INVITATION"}
          onClick={() => setActiveCategory("PARTNER_INVITATION")}
          className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] ${
            activeCategory === "PARTNER_INVITATION"
              ? "bg-[#181343] text-white font-bold"
              : "bg-white border border-[#E2E8F0] text-slate-700 hover:bg-slate-50"
          }`}
        >
          <FileText
            aria-hidden="true"
            className={`w-4 h-4 ${
              activeCategory === "PARTNER_INVITATION"
                ? "text-emerald-400"
                : "text-slate-600"
            }`}
          />
          <span>Undangan Mitra</span>
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-bold ${
              activeCategory === "PARTNER_INVITATION"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {countsByCategory.PARTNER_INVITATION}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "INVITATION_OVERDUE"}
          onClick={() => setActiveCategory("INVITATION_OVERDUE")}
          className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] ${
            activeCategory === "INVITATION_OVERDUE"
              ? "bg-[#181343] text-white font-bold"
              : "bg-white border border-[#E2E8F0] text-slate-700 hover:bg-slate-50"
          }`}
        >
          <MailWarning
            aria-hidden="true"
            className={`w-4 h-4 ${
              activeCategory === "INVITATION_OVERDUE"
                ? "text-rose-300"
                : "text-slate-600"
            }`}
          />
          <span>Notifikasi Overdue</span>
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-bold ${
              activeCategory === "INVITATION_OVERDUE"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {countsByCategory.INVITATION_OVERDUE}
          </span>
        </button>
      </div>

      {/* Feedback Alerts */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle
              aria-hidden="true"
              className="w-4 h-4 shrink-0 mt-0.5 text-rose-700"
            />
            <span>{errorMessage}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="min-h-[40px] border-rose-300 text-rose-900 hover:bg-rose-100 shrink-0 cursor-pointer"
          >
            Muat Ulang
          </Button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <CheckCircle2
            aria-hidden="true"
            className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700"
          />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Template List / Loading / Empty State */}
      {isLoading ? (
        <div
          aria-busy="true"
          aria-label="Memuat daftar template"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-3 animate-pulse"
            >
              <div className="h-5 w-1/2 bg-slate-200 rounded" />
              <div className="h-24 w-full bg-slate-100 rounded-xl" />
              <div className="h-4 w-1/3 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : displayedTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-10 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <LayoutTemplate aria-hidden="true" className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#181343]">
              {isOverdueCategory
                ? "Belum Ada Template Notifikasi Overdue"
                : "Belum Ada Template Undangan Mitra"}
            </h2>
            <p className="text-xs sm:text-sm text-[#47464F] leading-relaxed">
              {isOverdueCategory
                ? "Buat template email pemberitahuan yang otomatis dikirimkan kepada mitra apabila undangan melewati batas waktu tanggapan."
                : "Buat template pesan undangan agar saat mengundang mitra di menu Kurasi Mitra, pesan dapat langsung dipilih dalam satu klik."}
            </p>
          </div>

          {/* Starter Presets */}
          <div className="max-w-3xl mx-auto text-left space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 text-center">
              Atau Mulai Cepat dari Contoh Template
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {starterPresets.map((preset) => (
                <div
                  key={preset.title}
                  className="p-4 rounded-xl bg-[#F9F9FB] border border-[#E2E8F0] hover:border-emerald-400 transition-colors flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-[#181343]">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-[#47464F] line-clamp-3 whitespace-pre-line">
                      {preset.content}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openCreateModal(preset)}
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                    className="w-full min-h-[40px] cursor-pointer"
                  >
                    Gunakan Contoh Ini
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                tpl.isDefault
                  ? "border-emerald-300 ring-1 ring-emerald-500/10"
                  : "border-[#E5E7EB] hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-[#181343] truncate">
                        {tpl.title}
                      </h3>
                      {tpl.isDefault && (
                        <Badge variant="emerald" className="text-[11px] font-bold">
                          Utama (Default)
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>Diperbarui {formatDate(tpl.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155] whitespace-pre-line leading-relaxed max-h-44 overflow-y-auto">
                  {tpl.content}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSetDefault(tpl)}
                  className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] ${
                    tpl.isDefault
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "text-slate-700 hover:text-[#181343] hover:bg-slate-100"
                  }`}
                >
                  <Star
                    aria-hidden="true"
                    className={`w-3.5 h-3.5 ${
                      tpl.isDefault ? "fill-emerald-600 text-emerald-600" : ""
                    }`}
                  />
                  <span>{tpl.isDefault ? "Default Aktif" : "Jadikan Default"}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(tpl)}
                    leftIcon={<Pencil className="w-3.5 h-3.5" />}
                    className="min-h-[40px] cursor-pointer"
                  >
                    Ubah
                  </Button>
                  <button
                    type="button"
                    onClick={() => setTemplateToDelete(tpl)}
                    className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                    aria-label={`Hapus template ${tpl.title}`}
                    title="Hapus Template"
                  >
                    <Trash2 aria-hidden="true" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box Cara Kerja */}
      <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-[#334155] leading-relaxed">
        <Info aria-hidden="true" className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#181343]">Tips Penggunaan:</strong>{" "}
          {isOverdueCategory
            ? "Template Notifikasi Overdue yang berstatus Default otomatis dipakai sistem untuk mengirim email pemberitahuan kepada mitra ketika undangan melewati batas waktu tanggapan."
            : "Template Undangan Mitra yang berstatus Default otomatis terisi di form Undang Mitra pada menu Kurasi Mitra, dan tetap dapat disunting sebelum dikirim."}{" "}
          Anda dapat menyisipkan variabel pintar seperti{" "}
          <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[#181343] font-semibold">
            {"{{nama_yayasan}}"}
          </code>
          ,{" "}
          <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[#181343] font-semibold">
            {"{{nama_program}}"}
          </code>
          ,{" "}
          <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[#181343] font-semibold">
            {"{{batas_respons}}"}
          </code>
          , dan lainnya agar data terisi otomatis.
        </p>
      </div>

      {/* Modal Tambah / Edit Template */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => !isSaving && setIsEditorOpen(false)}
        title={
          editingTemplate
            ? isOverdueCategory
              ? "Ubah Template Notifikasi Overdue"
              : "Ubah Template Undangan"
            : isOverdueCategory
              ? "Buat Template Notifikasi Overdue Baru"
              : "Buat Template Undangan Baru"
        }
        description={
          isOverdueCategory
            ? "Sesuaikan isi email pemberitahuan otomatis saat undangan melewati batas waktu tanggapan."
            : "Siapkan pesan undangan standar untuk mempercepat proses kolaborasi di menu Kurasi Mitra."
        }
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditorOpen(false)}
              disabled={isSaving}
              className="min-h-[44px] cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="template-editor-form"
              isLoading={isSaving}
              className="min-h-[44px] cursor-pointer"
            >
              {editingTemplate ? "Simpan Perubahan" : "Simpan Template"}
            </Button>
          </div>
        }
      >
        <form id="template-editor-form" onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2"
            >
              <AlertCircle
                aria-hidden="true"
                className="w-4 h-4 shrink-0 mt-0.5 text-rose-700"
              />
              <span>{formError}</span>
            </div>
          )}

          {/* Judul Template */}
          <div className="space-y-1.5">
            <label
              htmlFor="template-title-input"
              className="text-xs font-semibold text-[#181343] block"
            >
              Judul Template <span className="text-rose-600">*</span>
            </label>
            <input
              id="template-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isOverdueCategory
                  ? "Contoh: Pemberitahuan Undangan Melewati Batas Waktu"
                  : "Contoh: Undangan Kolaborasi Program Pendidikan"
              }
              maxLength={120}
              required
              className="w-full min-h-[44px] text-xs sm:text-sm bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#181343] placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] transition-colors"
            />
          </div>

          {/* Quick-insert Placeholder Chips */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="template-content-input"
                className="text-xs font-semibold text-[#181343]"
              >
                Isi Pesan Template <span className="text-rose-600">*</span>
              </label>
              <span className="text-xs text-slate-600">
                {content.length}/2000 karakter
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              <span className="text-xs font-medium text-slate-600 mr-1">
                Sisipkan variabel:
              </span>
              {PLACEHOLDERS.map((ph) => (
                <button
                  key={ph.token}
                  type="button"
                  onClick={() => handleInsertPlaceholder(ph.token)}
                  className="inline-flex items-center gap-1 min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#181343] hover:text-white text-[#181343] text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343]"
                >
                  <Plus aria-hidden="true" className="w-3 h-3" />
                  <span>{ph.label}</span>
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              id="template-content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isOverdueCategory
                  ? "Tuliskan isi email pemberitahuan pembatalan undangan karena melewati batas waktu..."
                  : "Tuliskan isi pesan undangan kepada mitra..."
              }
              rows={7}
              maxLength={2000}
              required
              className="w-full text-xs sm:text-sm bg-white border border-[#CBD5E1] rounded-xl p-3.5 text-[#181343] placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181343] resize-y transition-colors leading-relaxed"
            />
          </div>

          {/* Live Preview */}
          {content.trim() && (
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Pratinjau Hasil Pesan
              </span>
              <p className="text-xs text-[#334155] whitespace-pre-line leading-relaxed">
                {renderPreviewText(content)}
              </p>
            </div>
          )}

          {/* Checkbox Default */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="mt-0.5 rounded border-emerald-500 text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#181343] block">
                Jadikan sebagai template utama (Default)
              </span>
              <span className="text-[#334155]">
                {isOverdueCategory
                  ? "Otomatis digunakan oleh sistem saat mengirim email pemberitahuan undangan Overdue ke mitra."
                  : "Otomatis dipilih saat Anda membuka form Undang Mitra di Kurasi Mitra (tetap bisa diganti atau dihapus kapan saja)."}
              </span>
            </div>
          </label>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={!!templateToDelete}
        onClose={() => !isDeleting && setTemplateToDelete(null)}
        title="Hapus Template Pesan"
        description="Tindakan ini tidak dapat dibatalkan."
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTemplateToDelete(null)}
              disabled={isDeleting}
              className="min-h-[44px] cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="min-h-[44px] bg-rose-700 hover:bg-rose-800 text-white cursor-pointer"
            >
              Ya, Hapus Template
            </Button>
          </div>
        }
      >
        <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
          Apakah Anda yakin ingin menghapus template{" "}
          <strong className="text-[#181343]">
            &quot;{templateToDelete?.title}&quot;
          </strong>
          ?
        </p>
      </Modal>
    </div>
  );
}
