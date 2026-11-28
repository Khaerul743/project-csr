"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  Copy,
  FileText,
  Calendar,
  Info,
  MailWarning,
  RefreshCw,
  Settings,
  Eye,
  Save,
  ChevronRight,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    description: "Nama organisasi yayasan atau NGO tujuan undangan.",
    sample: "Yayasan Bina Nusantara",
  },
  {
    token: "{{nama_perusahaan}}",
    label: "Nama Perusahaan",
    description: "Nama resmi perusahaan Anda.",
    sample: "PT Sinergi Karya",
  },
  {
    token: "{{nama_program}}",
    label: "Nama Program",
    description: "Judul inisiatif atau peluang program CSR yang dipilih.",
    sample: "Program Beasiswa Pendidikan Digital",
  },
  {
    token: "{{bidang_csr}}",
    label: "Bidang CSR",
    description: "Kategori bidang fokus program CSR (misal Pendidikan).",
    sample: "Pendidikan & Literasi",
  },
  {
    token: "{{lokasi_program}}",
    label: "Lokasi Program",
    description: "Kota dan provinsi sasaran program CSR.",
    sample: "Kota Bandung, Jawa Barat",
  },
  {
    token: "{{batas_respons}}",
    label: "Batas Respons",
    description: "Tanggal tenggat waktu tanggapan yang ditentukan perusahaan.",
    sample: "3 Desember 2026",
  },
  {
    token: "{{nama_pic}}",
    label: "Nama PIC",
    description: "Nama akun CSR Admin pengirim undangan.",
    sample: "Budi Santoso",
  },
  {
    token: "{{jabatan_pic}}",
    label: "Jabatan PIC",
    description: "Jabatan pada profil akun pengirim undangan.",
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

export { DashboardHeaderBackdrop as TemplateHeaderBackdrop } from "../../common/DashboardPageHeader";

export function TemplateCustomizationView({
  companyName,
  picName,
  picPosition,
}: TemplateCustomizationViewProps) {
  const [templates, setTemplates] = useState<CompanyTemplateItem[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<CompanyTemplateCategory>("PARTNER_INVITATION");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inline Right-Panel Editor states
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [isSavingInline, setIsSavingInline] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [showStatusInfo, setShowStatusInfo] = useState(false);

  // Preview Modal & Tips Guide Modal states
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  // Create New Template Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormError, setCreateFormError] = useState<string | null>(null);

  // Delete confirmation state
  const [templateToDelete, setTemplateToDelete] =
    useState<CompanyTemplateItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const inlineTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const createTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  // Resolve currently active template for selected category
  const activeTemplate = useMemo(() => {
    if (displayedTemplates.length === 0) return null;
    const matched = displayedTemplates.find((t) => t.id === selectedTemplateId);
    if (matched) return matched;
    return (
      displayedTemplates.find((t) => t.isDefault) || displayedTemplates[0]
    );
  }, [displayedTemplates, selectedTemplateId]);

  // Sync inline editor values when activeTemplate changes
  useEffect(() => {
    if (!activeTemplate) {
      setEditTitle("");
      setEditContent("");
      setEditIsDefault(false);
      setInlineError(null);
      return;
    }
    setSelectedTemplateId(activeTemplate.id);
    setEditTitle(activeTemplate.title);
    setEditContent(activeTemplate.content);
    setEditIsDefault(activeTemplate.isDefault);
    setInlineError(null);
  }, [activeTemplate?.id, activeTemplate?.updatedAt]);

  const isDirty = useMemo(() => {
    if (!activeTemplate) return false;
    return (
      editTitle.trim() !== activeTemplate.title.trim() ||
      editContent.trim() !== activeTemplate.content.trim() ||
      editIsDefault !== activeTemplate.isDefault
    );
  }, [activeTemplate, editTitle, editContent, editIsDefault]);

  const insertPlaceholderAtCursor = (
    token: string,
    ref: React.RefObject<HTMLTextAreaElement | null>,
    currentValue: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const el = ref.current;
    if (!el) {
      setter(
        (prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${token}`
      );
      return;
    }

    const start = el.selectionStart ?? currentValue.length;
    const end = el.selectionEnd ?? currentValue.length;
    const updated =
      currentValue.substring(0, start) + token + currentValue.substring(end);
    setter(updated);

    setTimeout(() => {
      el.focus();
      const newCursorPos = start + token.length;
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSaveInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;
    setInlineError(null);

    if (editTitle.trim().length < 3) {
      setInlineError("Judul template minimal 3 karakter.");
      return;
    }
    if (editContent.trim().length < 10) {
      setInlineError("Isi pesan template minimal 10 karakter.");
      return;
    }

    try {
      setIsSavingInline(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login tidak valid.");

      const res = await fetch(
        `/api/companies/current/templates/${activeTemplate.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            content: editContent.trim(),
            isDefault: editIsDefault,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.details && Array.isArray(json.details)) {
          throw new Error(json.details.map((d: any) => d.message).join(", "));
        }
        throw new Error(json.message || "Gagal menyimpan perubahan template.");
      }

      setSuccessMessage("Perubahan template berhasil disimpan.");
      await fetchTemplates();
    } catch (err: any) {
      setInlineError(
        err.message || "Terjadi kesalahan saat menyimpan perubahan template."
      );
    } finally {
      setIsSavingInline(false);
    }
  };

  const openCreateModal = (preset?: { title: string; content: string }) => {
    setNewTitle(preset?.title || "");
    setNewContent(preset?.content || "");
    setNewIsDefault(displayedTemplates.length === 0);
    setCreateFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormError(null);

    if (newTitle.trim().length < 3) {
      setCreateFormError("Judul template minimal 3 karakter.");
      return;
    }
    if (newContent.trim().length < 10) {
      setCreateFormError("Isi pesan template minimal 10 karakter.");
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login tidak valid.");

      const res = await fetch("/api/companies/current/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: activeCategory,
          title: newTitle.trim(),
          content: newContent.trim(),
          isDefault: newIsDefault,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.details && Array.isArray(json.details)) {
          throw new Error(json.details.map((d: any) => d.message).join(", "));
        }
        throw new Error(json.message || "Gagal membuat template baru.");
      }

      setIsCreateModalOpen(false);
      if (json.data?.id) {
        setSelectedTemplateId(json.data.id);
      }
      setSuccessMessage("Template baru berhasil ditambahkan.");
      await fetchTemplates();
    } catch (err: any) {
      setCreateFormError(
        err.message || "Terjadi kesalahan saat membuat template."
      );
    } finally {
      setIsCreating(false);
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

      if (selectedTemplateId === templateToDelete.id) {
        setSelectedTemplateId(null);
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
      .replace(/\{\{bidang_csr\}\}/gi, "Pendidikan & Literasi")
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
    <div className="relative space-y-5">
      {/* A. Page Header (Compact, Aligned with Landing Page Blue Identity) */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#EDF6FF] border border-[#CBE7FD] flex items-center justify-center shrink-0">
            <Image
              src="/images/templates/template-header-icon.png"
              alt=""
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1
              className="text-xl sm:text-2xl font-extrabold text-[#0A2558] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Kustomisasi Template
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
              Kelola naskah pesan undangan mitra dan email pemberitahuan batas waktu (Overdue) agar komunikasi kemitraan tetap konsisten.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1D6CE0] via-[#1765F5] to-[#1748D5] hover:brightness-105 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#1765F5]/20 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] focus-visible:ring-offset-2"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          <span>Buat Template Baru</span>
        </button>
      </div>

      {/* B. Template Category Tabs */}
      <div
        role="tablist"
        aria-label="Kategori Template Perusahaan"
        className="relative z-10 flex flex-wrap items-center gap-2.5 pt-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "PARTNER_INVITATION"}
          onClick={() => {
            setActiveCategory("PARTNER_INVITATION");
            setSelectedTemplateId(null);
          }}
          className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] ${
            activeCategory === "PARTNER_INVITATION"
              ? "bg-gradient-to-r from-[#1D6CE0] via-[#1765F5] to-[#1748D5] text-white shadow-sm shadow-[#1765F5]/20 font-bold"
              : "bg-white border border-[#DBEAFE] text-[#0A2558] hover:bg-[#F4F9FF]"
          }`}
        >
          <FileText
            aria-hidden="true"
            className={`w-4 h-4 ${
              activeCategory === "PARTNER_INVITATION"
                ? "text-white"
                : "text-[#1765F5]"
            }`}
          />
          <span>Undangan Mitra</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeCategory === "PARTNER_INVITATION"
                ? "bg-white/20 text-white"
                : "bg-[#EDF6FF] text-[#0A2558]"
            }`}
          >
            {countsByCategory.PARTNER_INVITATION}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "INVITATION_OVERDUE"}
          onClick={() => {
            setActiveCategory("INVITATION_OVERDUE");
            setSelectedTemplateId(null);
          }}
          className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] ${
            activeCategory === "INVITATION_OVERDUE"
              ? "bg-gradient-to-r from-[#1D6CE0] via-[#1765F5] to-[#1748D5] text-white shadow-sm shadow-[#1765F5]/20 font-bold"
              : "bg-white border border-[#DBEAFE] text-[#0A2558] hover:bg-[#F4F9FF]"
          }`}
        >
          <MailWarning
            aria-hidden="true"
            className={`w-4 h-4 ${
              activeCategory === "INVITATION_OVERDUE"
                ? "text-white"
                : "text-[#1765F5]"
            }`}
          />
          <span>Notifikasi Overdue</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeCategory === "INVITATION_OVERDUE"
                ? "bg-white/20 text-white"
                : "bg-[#EDF6FF] text-[#0A2558]"
            }`}
          >
            {countsByCategory.INVITATION_OVERDUE}
          </span>
        </button>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
          className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-emerald-200 text-[#065F46] text-xs sm:text-sm flex items-center gap-2.5"
        >
          <CheckCircle2
            aria-hidden="true"
            className="w-4 h-4 shrink-0 text-[#047857]"
          />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Main Content Area: Loading / Empty / Split Layout Workspace */}
      {isLoading ? (
        <div
          aria-busy="true"
          aria-label="Memuat workspace kustomisasi template"
          className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5"
        >
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-4 animate-pulse">
            <div className="h-32 w-full bg-[#EDF6FF] rounded-2xl" />
            <div className="h-5 w-2/3 mx-auto bg-slate-200 rounded" />
            <div className="h-40 w-full bg-slate-100 rounded-2xl" />
          </div>
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-4 animate-pulse">
            <div className="h-12 w-full bg-[#EDF6FF] rounded-2xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-52 w-full bg-slate-100 rounded-2xl" />
          </div>
        </div>
      ) : displayedTemplates.length === 0 ? (
        <div className="relative z-10 bg-white rounded-3xl border border-[#DBEAFE] p-6 sm:p-10 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF6FF] border border-[#CBE7FD] text-[#1765F5] flex items-center justify-center mx-auto mb-3">
              <LayoutTemplate aria-hidden="true" className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#0A2558]">
              {isOverdueCategory
                ? "Belum Ada Template Notifikasi Overdue"
                : "Belum Ada Template Undangan Mitra"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
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
                  className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#DBEAFE] hover:border-[#1765F5]/40 transition-colors flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0A2558]">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 whitespace-pre-line">
                      {preset.content}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openCreateModal(preset)}
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                    className="w-full min-h-[44px] border-[#CBE7FD] text-[#0A2558] hover:bg-[#EDF6FF] cursor-pointer"
                  >
                    Gunakan Contoh Ini
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Compact Template Selector Strip (Top of Workspace) */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center">
              <span className="text-xs font-bold text-[#0A2558]">
                Pilih Template ({displayedTemplates.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {displayedTemplates.map((tpl) => {
                const isSelected = activeTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    aria-pressed={isSelected}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer min-h-[44px] flex items-center justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] ${
                      isSelected
                        ? "bg-[#EDF6FF] border-[#1765F5] ring-1 ring-[#1765F5]/20"
                        : "bg-white border-[#E2E8F0] hover:border-[#93C5FD] hover:bg-[#F8FBFF]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold truncate ${
                          isSelected ? "text-[#0A2558]" : "text-slate-700"
                        }`}
                        title={tpl.title}
                      >
                        {tpl.title}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                        Diperbarui {formatDate(tpl.updatedAt)}
                      </p>
                    </div>

                    {tpl.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-emerald-200 text-[#065F46] text-[10px] font-bold shrink-0">
                        <Check aria-hidden="true" className="w-2.5 h-2.5" />
                        <span>Default</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. Main Split Workspace (42:58 => 5/12 Left Preview : 7/12 Right Editor) */}
          {activeTemplate && (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN (~42%): Template Preview Card */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DBEAFE] shadow-xs overflow-hidden">
                {/* Soft Sky-Blue Top Hero Zone */}
                <div className="relative bg-gradient-to-b from-[#EDF6FF] via-[#F4F9FF] to-white px-6 pt-6 pb-5 text-center border-b border-[#EDF6FF]">
                  {/* Default Badge top-right */}
                  {editIsDefault && (
                    <div className="flex justify-end mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-emerald-200 text-[#065F46] text-xs font-bold">
                        <Check aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Default</span>
                      </span>
                    </div>
                  )}

                  {/* Centered Illustration */}
                  <div className="mx-auto w-[156px] h-[112px] flex items-center justify-center">
                    <Image
                      src={
                        isOverdueCategory
                          ? "/images/templates/overdue-clock-notice.png"
                          : "/images/templates/paper-plane-invite.png"
                      }
                      alt={
                        isOverdueCategory
                          ? "Ilustrasi notifikasi batas waktu undangan"
                          : "Ilustrasi pesawat kertas undangan mitra"
                      }
                      width={156}
                      height={112}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>

                  <h2
                    className="mt-3 text-base sm:text-lg font-extrabold text-[#0A2558] tracking-tight leading-snug break-words"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {editTitle.trim() || activeTemplate.title}
                  </h2>

                  <p className="mt-1.5 inline-flex items-center justify-center gap-1.5 text-xs text-slate-600">
                    <Calendar aria-hidden="true" className="w-3.5 h-3.5 text-[#1765F5]" />
                    <span>Diperbarui: {formatDate(activeTemplate.updatedAt)}</span>
                  </p>
                </div>

                {/* Partner Message Preview Body */}
                <div className="p-5 sm:p-6 bg-white">
                  <div className="rounded-2xl bg-[#F8FBFF] border border-[#E6F0FD] p-4 sm:p-5">
                    <p className="text-xs sm:text-[13px] text-[#334155] whitespace-pre-line leading-relaxed max-h-[290px] overflow-y-auto pr-1">
                      {editContent.trim() || activeTemplate.content}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (~58%): Inline Template Settings & Editor */}
              <form
                onSubmit={handleSaveInline}
                className="lg:col-span-7 bg-white rounded-3xl border border-[#DBEAFE] shadow-xs overflow-hidden"
              >
                {/* 1. Template Info Header */}
                <div className="px-5 sm:px-6 py-4 bg-[#F8FBFF] border-b border-[#E6F0FD] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#E6F1FF] border border-[#CBE7FD] text-[#1765F5] flex items-center justify-center shrink-0">
                      <Pencil aria-hidden="true" className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-sm sm:text-base font-extrabold text-[#0A2558] truncate"
                        title={editTitle || activeTemplate.title}
                      >
                        {editTitle.trim() || activeTemplate.title}
                      </h3>
                      <p className="text-xs text-slate-600 truncate">
                        {isOverdueCategory
                          ? "Template pemberitahuan otomatis saat undangan melewati batas waktu."
                          : "Template pesan untuk mengundang mitra dalam program CSR."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTemplateToDelete(activeTemplate)}
                    className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                    aria-label={`Hapus template ${activeTemplate.title}`}
                    title="Hapus Template"
                  >
                    <Trash2 aria-hidden="true" className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  {inlineError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2"
                    >
                      <AlertCircle
                        aria-hidden="true"
                        className="w-4 h-4 shrink-0 mt-0.5 text-rose-700"
                      />
                      <span>{inlineError}</span>
                    </div>
                  )}

                  {/* 2. Pengaturan Template */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0A2558]">
                      <Settings
                        aria-hidden="true"
                        className="w-4 h-4 text-[#1765F5]"
                      />
                      <span>Pengaturan Template</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                      <div className="sm:col-span-8 space-y-1.5">
                        <label
                          htmlFor="inline-template-title"
                          className="text-xs font-semibold text-[#0A2558] block"
                        >
                          Nama Template
                        </label>
                        <input
                          id="inline-template-title"
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={120}
                          required
                          placeholder="Masukkan nama template..."
                          className="w-full min-h-[44px] text-xs sm:text-sm bg-white border border-[#CBD5E1] hover:border-[#93C5FD] rounded-xl px-3.5 py-2 text-[#0A2558] placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] transition-colors"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1.5">
                        <span className="text-xs font-semibold text-[#0A2558] block">
                          Status
                        </span>
                        <div className="flex items-center gap-2 min-h-[44px]">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={editIsDefault}
                            aria-label="Jadikan template utama default"
                            onClick={() => setEditIsDefault((prev) => !prev)}
                            className={`inline-flex items-center gap-2 min-h-[40px] pl-1.5 pr-3 py-1 rounded-full border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] ${
                              editIsDefault
                                ? "bg-[#ECFDF5] border-emerald-200 text-[#065F46]"
                                : "bg-slate-100 border-slate-200 text-slate-700"
                            }`}
                          >
                            <span
                              className={`w-7 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                                editIsDefault ? "bg-[#047857]" : "bg-slate-400"
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full bg-white flex items-center justify-center transition-transform ${
                                  editIsDefault
                                    ? "translate-x-2"
                                    : "translate-x-0"
                                }`}
                              >
                                {editIsDefault && (
                                  <Check
                                    aria-hidden="true"
                                    className="w-2.5 h-2.5 text-[#047857]"
                                  />
                                )}
                              </span>
                            </span>
                            <span className="text-xs font-bold">
                              {editIsDefault ? "Default" : "Standar"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowStatusInfo((prev) => !prev)}
                            aria-expanded={showStatusInfo}
                            aria-label="Informasi status default template"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:text-[#1765F5] hover:bg-[#EDF6FF] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5]"
                          >
                            <Info aria-hidden="true" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {showStatusInfo && (
                      <p className="text-xs text-slate-600 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl px-3.5 py-2.5">
                        {isOverdueCategory
                          ? "Template berstatus Default otomatis dipakai sistem saat mengirim email pemberitahuan undangan Overdue ke mitra."
                          : "Template berstatus Default otomatis terisi saat Anda membuka form Undang Mitra di Kurasi Mitra."}
                      </p>
                    )}
                  </div>

                  {/* 3. Konten Template Editor */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="inline-template-content"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0A2558]"
                      >
                        <FileText
                          aria-hidden="true"
                          className="w-4 h-4 text-[#1765F5]"
                        />
                        <span>Konten Template</span>
                      </label>
                      <span className="text-xs text-slate-600">
                        {editContent.length}/2000 karakter
                      </span>
                    </div>

                    {/* Quick-Insert Variable Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-600 mr-1">
                        Sisipkan variabel:
                      </span>
                      {PLACEHOLDERS.map((ph) => (
                        <button
                          key={ph.token}
                          type="button"
                          onClick={() =>
                            insertPlaceholderAtCursor(
                              ph.token,
                              inlineTextareaRef,
                              editContent,
                              setEditContent
                            )
                          }
                          className="inline-flex items-center gap-1 min-h-[32px] px-2.5 py-1 rounded-lg bg-[#EDF6FF] hover:bg-[#1765F5] hover:text-white text-[#0A2558] border border-[#CBE7FD] text-[11px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5]"
                        >
                          <Plus aria-hidden="true" className="w-3 h-3" />
                          <span>{ph.label}</span>
                        </button>
                      ))}
                    </div>

                    <textarea
                      ref={inlineTextareaRef}
                      id="inline-template-content"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={9}
                      maxLength={2000}
                      required
                      placeholder="Tuliskan isi pesan template..."
                      className="w-full text-xs sm:text-[13px] bg-white border border-[#CBD5E1] hover:border-[#93C5FD] rounded-2xl p-4 text-[#1E293B] placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] resize-y transition-colors leading-relaxed"
                    />
                  </div>

                  {/* 4. Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-600">
                      {isDirty ? (
                        <span className="font-semibold text-amber-800">
                          Ada perubahan yang belum disimpan
                        </span>
                      ) : (
                        <span>Seluruh perubahan tersimpan</span>
                      )}
                    </span>

                    <div className="flex items-center gap-2.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => setIsPreviewModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FBFF] hover:border-[#93C5FD] text-xs sm:text-sm font-semibold text-[#0A2558] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5]"
                      >
                        <Eye aria-hidden="true" className="w-4 h-4 text-[#1765F5]" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingInline || !isDirty}
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#1D6CE0] via-[#1765F5] to-[#1748D5] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#1765F5]/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] focus-visible:ring-offset-2"
                      >
                        {isSavingInline ? (
                          <RefreshCw
                            aria-hidden="true"
                            className="w-4 h-4 animate-spin"
                          />
                        ) : (
                          <Save aria-hidden="true" className="w-4 h-4" />
                        )}
                        <span>
                          {isSavingInline ? "Menyimpan..." : "Simpan Perubahan"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* D. Compact Bottom Tips Banner */}
      <div className="bg-[#F4F9FF] border border-[#DBEFFF] rounded-2xl px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white border border-[#DBEFFF] flex items-center justify-center shrink-0">
            <Image
              src="/images/templates/tips-lightbulb-icon.png"
              alt=""
              width={22}
              height={22}
              className="w-5.5 h-5.5 object-contain"
            />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#0A2558] block">
              Tips Penggunaan
            </span>
            <p className="text-xs text-[#334155] leading-relaxed">
              {isOverdueCategory
                ? "Template berstatus Default otomatis digunakan saat sistem mengirim email pemberitahuan Overdue ke mitra."
                : "Template berstatus Default otomatis terisi di form Undang Mitra, namun tetap bisa Anda sunting atau buat variasinya."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsTipsModalOpen(true)}
          className="inline-flex items-center gap-1 min-h-[40px] px-2 text-xs font-bold text-[#1765F5] hover:text-[#1748D5] transition-colors cursor-pointer shrink-0 self-end sm:self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] rounded-lg"
        >
          <span>Pelajari lebih lanjut</span>
          <ChevronRight aria-hidden="true" className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Preview Hasil Variabel */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Pratinjau Pesan Terisi"
        description="Simulasi tampilan pesan yang akan diterima oleh mitra setelah variabel otomatis diisi oleh sistem."
        maxWidth="lg"
        footer={
          <div className="flex justify-end w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewModalOpen(false)}
              className="min-h-[44px] cursor-pointer"
            >
              Tutup Pratinjau
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FBFF] border border-[#DBEAFE] text-xs sm:text-sm text-[#1E293B] whitespace-pre-line leading-relaxed max-h-[420px] overflow-y-auto">
            {renderPreviewText(editContent || activeTemplate?.content || "")}
          </div>
        </div>
      </Modal>

      {/* Modal Panduan Variabel ("Pelajari lebih lanjut") */}
      <Modal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
        title="Panduan Variabel Otomatis Template"
        description="Daftar variabel pintar yang dapat disisipkan ke dalam pesan Undangan Mitra maupun Notifikasi Overdue."
        maxWidth="lg"
        footer={
          <div className="flex justify-end w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTipsModalOpen(false)}
              className="min-h-[44px] cursor-pointer"
            >
              Tutup
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="divide-y divide-slate-100 border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white">
            {PLACEHOLDERS.map((ph) => (
              <div
                key={ph.token}
                className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <code className="px-2 py-0.5 rounded-md bg-[#EDF6FF] border border-[#CBE7FD] text-[#0A2558] font-bold">
                    {ph.token}
                  </code>
                  <p className="text-slate-600 mt-1">{ph.description}</p>
                </div>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                  Contoh: {ph.sample}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Buat Template Baru */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isCreating && setIsCreateModalOpen(false)}
        title={
          isOverdueCategory
            ? "Buat Template Notifikasi Overdue Baru"
            : "Buat Template Undangan Baru"
        }
        description={
          isOverdueCategory
            ? "Buat variasi pesan email pemberitahuan ketika undangan kolaborasi melewati batas waktu."
            : "Buat variasi pesan undangan baru untuk dipilih pada modal Undang Mitra."
        }
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
              className="min-h-[44px] cursor-pointer"
            >
              Batal
            </Button>
            <button
              type="submit"
              form="create-template-form"
              disabled={isCreating}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#1D6CE0] via-[#1765F5] to-[#1748D5] hover:brightness-105 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5]"
            >
              {isCreating ? "Menyimpan..." : "Simpan Template"}
            </button>
          </div>
        }
      >
        <form
          id="create-template-form"
          onSubmit={handleCreateTemplate}
          className="space-y-4"
        >
          {createFormError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2"
            >
              <AlertCircle
                aria-hidden="true"
                className="w-4 h-4 shrink-0 mt-0.5 text-rose-700"
              />
              <span>{createFormError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="new-template-title"
              className="text-xs font-semibold text-[#0A2558] block"
            >
              Judul Template <span className="text-rose-600">*</span>
            </label>
            <input
              id="new-template-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={
                isOverdueCategory
                  ? "Contoh: Pemberitahuan Pembatalan Undangan Formal"
                  : "Contoh: Undangan Program Lingkungan Prioritas"
              }
              maxLength={120}
              required
              className="w-full min-h-[44px] text-xs sm:text-sm bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0A2558] placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="new-template-content"
                className="text-xs font-semibold text-[#0A2558]"
              >
                Isi Pesan Template <span className="text-rose-600">*</span>
              </label>
              <span className="text-xs text-slate-600">
                {newContent.length}/2000 karakter
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {PLACEHOLDERS.map((ph) => (
                <button
                  key={ph.token}
                  type="button"
                  onClick={() =>
                    insertPlaceholderAtCursor(
                      ph.token,
                      createTextareaRef,
                      newContent,
                      setNewContent
                    )
                  }
                  className="inline-flex items-center gap-1 min-h-[32px] px-2.5 py-1 rounded-lg bg-[#EDF6FF] hover:bg-[#1765F5] hover:text-white text-[#0A2558] border border-[#CBE7FD] text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <Plus aria-hidden="true" className="w-3 h-3" />
                  <span>{ph.label}</span>
                </button>
              ))}
            </div>

            <textarea
              ref={createTextareaRef}
              id="new-template-content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Tuliskan isi pesan template..."
              rows={7}
              maxLength={2000}
              required
              className="w-full text-xs sm:text-sm bg-white border border-[#CBD5E1] rounded-xl p-3.5 text-[#1E293B] placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5] resize-y transition-colors leading-relaxed"
            />
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ECFDF5] border border-emerald-200 cursor-pointer">
            <input
              type="checkbox"
              checked={newIsDefault}
              onChange={(e) => setNewIsDefault(e.target.checked)}
              className="mt-0.5 rounded border-emerald-500 text-[#047857] focus-visible:ring-2 focus-visible:ring-[#047857] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-[#0A2558] block">
                Jadikan sebagai template utama (Default)
              </span>
              <span className="text-[#334155]">
                {isOverdueCategory
                  ? "Otomatis dipakai sistem untuk email pemberitahuan Overdue."
                  : "Otomatis terisi saat membuka form Undang Mitra."}
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
          <strong className="text-[#0A2558]">
            &quot;{templateToDelete?.title}&quot;
          </strong>
          ?
        </p>
      </Modal>
    </div>
  );
}
