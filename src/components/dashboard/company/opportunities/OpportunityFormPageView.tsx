"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Tag,
  ImageIcon,
  Upload,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Search,
  Layers,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { OpportunityStatus } from "@/db/schema/opportunities";
import { FOCUS_AREA_CONFIG, STATUS_CONFIG, formatRupiah } from "../helpers";
import { OpportunityItem } from "../types";
import { ALL_17_SDGS, getProgramSdgs } from "@/components/dashboard/analytics/helpers";
import { SdgGoal } from "@/components/dashboard/analytics/types";
import { INDONESIAN_REGIONS } from "./indonesian-regions";

export interface OpportunityFormPageViewProps {
  mode: "create" | "edit";
  opportunity?: OpportunityItem | null;
  onBack: () => void;
  onSuccess: () => void;
}

const DEFAULT_SDGS_BY_FOCUS: Record<CsrFocusArea, number[]> = {
  LINGKUNGAN: [13, 14, 15, 17],
  PENDIDIKAN: [4, 8, 10, 17],
  KESEHATAN: [3, 2, 6, 17],
  PEMBERDAYAAN_EKONOMI: [1, 8, 10, 17],
  INFRASTRUKTUR_SOSIAL: [9, 11, 6, 17],
  TANGGAP_BENCANA: [11, 1, 3, 17],
  LAINNYA: [10, 17],
};

// Searchable Dropdown for Province and City
function SearchableSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  disabled = false,
  helperText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  disabled?: boolean;
  helperText?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition ${
          disabled
            ? "bg-slate-100 border-[#E8E8EA] text-slate-400 cursor-not-allowed"
            : isOpen
            ? "bg-white border-[#181343] ring-2 ring-[#181343]/10 text-slate-900 shadow-2xs"
            : "bg-white border-[#E8E8EA] hover:border-slate-300 text-slate-800 cursor-pointer"
        }`}
      >
        <span className={value ? "font-semibold text-slate-900" : "text-slate-400 font-normal"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}

      {/* Popover list */}
      {isOpen && !disabled && (
        <div className="absolute top-[100%] left-0 right-0 mt-1.5 bg-white border border-[#E8E8EA] rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in duration-150">
          <div className="p-2 border-b border-[#E8E8EA] bg-[#F9F9FB]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Cari wilayah..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E8E8EA] rounded-lg outline-none focus:border-[#181343]/40"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 text-xs">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs italic">
                Wilayah tidak ditemukan
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = item === value;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onChange(item);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-3.5 py-2 transition flex items-center justify-between ${
                      isSelected
                        ? "bg-[#181343] text-white font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OpportunityFormPageView({
  mode,
  opportunity,
  onBack,
  onSuccess,
}: OpportunityFormPageViewProps) {
  const isEdit = mode === "edit" && !!opportunity;

  // Initial description without SDGs metadata tag
  const parseCleanDescription = (desc?: string | null) => {
    if (!desc) return "";
    return desc.replace(/\n\n\[Klasifikasi SDGs:.*?\]/g, "").trim();
  };

  // Helper to parse existing SDGs from opportunity
  const parseInitialSdgs = (opp?: OpportunityItem | null): number[] => {
    if (!opp) return DEFAULT_SDGS_BY_FOCUS["LINGKUNGAN"] || [13, 14, 15, 17];

    // 1. Try regex on description tag
    const match = opp.description?.match(/\[Klasifikasi SDGs:\s*([^\]]+)\]/);
    if (match && match[1]) {
      const found: number[] = [];
      ALL_17_SDGS.forEach((s) => {
        if (
          match[1].includes(s.code) ||
          match[1].includes(s.name) ||
          new RegExp(`\\bSDG\\s*${s.id}\\b`, "i").test(match[1])
        ) {
          if (!found.includes(s.id)) found.push(s.id);
        }
      });
      if (found.length > 0) return found.sort((a, b) => a - b);
    }

    // 2. Try getProgramSdgs helper
    const calculated = getProgramSdgs({
      id: opp.id,
      title: opp.title,
      description: opp.description,
      focusArea: opp.focusArea,
      status: "PLANNED",
      budget: opp.estimatedBudget || "0",
    });
    if (calculated.length > 0) return calculated.sort((a, b) => a - b);

    // 3. Fallback to default by focus area
    return DEFAULT_SDGS_BY_FOCUS[opp.focusArea] || [17];
  };

  // Form States
  const [title, setTitle] = useState(opportunity?.title || "");
  const [focusArea, setFocusArea] = useState<CsrFocusArea>(opportunity?.focusArea || "LINGKUNGAN");
  const [estimatedBudget, setEstimatedBudget] = useState<string>(
    opportunity?.estimatedBudget ? String(Math.round(parseFloat(opportunity.estimatedBudget))) : ""
  );
  const [targetProvince, setTargetProvince] = useState(opportunity?.targetProvince || "");
  const [targetCity, setTargetCity] = useState(opportunity?.targetCity || "");
  const [startDate, setStartDate] = useState(
    opportunity?.startDate ? new Date(opportunity.startDate).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    opportunity?.endDate ? new Date(opportunity.endDate).toISOString().split("T")[0] : ""
  );
  const [deadline, setDeadline] = useState(
    opportunity?.deadline ? new Date(opportunity.deadline).toISOString().split("T")[0] : ""
  );
  const [description, setDescription] = useState(parseCleanDescription(opportunity?.description));
  const [bannerUrl, setBannerUrl] = useState<string>(opportunity?.bannerUrl || "");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>(parseInitialSdgs(opportunity));

  // Sync state if opportunity prop updates
  useEffect(() => {
    if (opportunity && isEdit) {
      setTitle(opportunity.title || "");
      setFocusArea(opportunity.focusArea || "LINGKUNGAN");
      setEstimatedBudget(
        opportunity.estimatedBudget ? String(Math.round(parseFloat(opportunity.estimatedBudget))) : ""
      );
      setTargetProvince(opportunity.targetProvince || "");
      setTargetCity(opportunity.targetCity || "");
      setStartDate(
        opportunity.startDate ? new Date(opportunity.startDate).toISOString().split("T")[0] : ""
      );
      setEndDate(
        opportunity.endDate ? new Date(opportunity.endDate).toISOString().split("T")[0] : ""
      );
      setDeadline(
        opportunity.deadline ? new Date(opportunity.deadline).toISOString().split("T")[0] : ""
      );
      setDescription(parseCleanDescription(opportunity.description));
      setBannerUrl(opportunity.bannerUrl || "");
      setSelectedSdgs(parseInitialSdgs(opportunity));
    }
  }, [opportunity, isEdit]);

  // AI Need Prioritization & UI states
  const [isAiNeedOpen, setIsAiNeedOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [bannerUrl]);

  // Available provinces list
  const provinceOptions = useMemo(() => {
    return INDONESIAN_REGIONS.map((p) => p.name);
  }, []);

  // Available cities based on selected province
  const cityOptions = useMemo(() => {
    if (!targetProvince) return [];
    const found = INDONESIAN_REGIONS.find((p) => p.name === targetProvince);
    return found ? found.cities : [];
  }, [targetProvince]);

  // When province changes, reset city selection
  const handleProvinceChange = (prov: string) => {
    setTargetProvince(prov);
    setTargetCity("");
  };

  // Suggest SDGs when focusArea changes in Create mode
  const handleFocusAreaChange = (newArea: CsrFocusArea) => {
    setFocusArea(newArea);
    if (!isEdit) {
      const suggested = DEFAULT_SDGS_BY_FOCUS[newArea] || [17];
      setSelectedSdgs(suggested);
    }
  };

  const toggleSdg = (id: number) => {
    setSelectedSdgs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].sort((a, b) => a - b)
    );
  };

  // Mapped ESG Pillars
  const mappedEsgPillars = useMemo(() => {
    const pillars = {
      E: [] as SdgGoal[],
      S: [] as SdgGoal[],
      G: [] as SdgGoal[],
    };
    selectedSdgs.forEach((id) => {
      const goal = ALL_17_SDGS.find((g) => g.id === id);
      if (goal) {
        goal.esgPillars.forEach((p) => {
          if (p === "E" && !pillars.E.some((x) => x.id === id)) pillars.E.push(goal);
          if (p === "S" && !pillars.S.some((x) => x.id === id)) pillars.S.push(goal);
          if (p === "G" && !pillars.G.some((x) => x.id === id)) pillars.G.push(goal);
        });
      }
    });
    return pillars;
  }, [selectedSdgs]);

  // Image upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file gambar maksimal 5MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah gambar sampul");
      }

      setBannerUrl(json.data.url);
      setImageError(false);
    } catch (err: any) {
      setUploadError(err.message || "Terjadi kesalahan saat mengunggah gambar");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Check if form is dirty for leave confirmation
  const isDirty = useMemo(() => {
    if (!isEdit) {
      return (
        title.trim() !== "" ||
        targetProvince !== "" ||
        targetCity !== "" ||
        description.trim() !== "" ||
        estimatedBudget !== "" ||
        bannerUrl !== ""
      );
    }
    if (!opportunity) return false;
    const initialDesc = parseCleanDescription(opportunity.description);
    const initialBudget = opportunity.estimatedBudget
      ? String(Math.round(parseFloat(opportunity.estimatedBudget)))
      : "";
    return (
      title !== (opportunity.title || "") ||
      focusArea !== (opportunity.focusArea || "LINGKUNGAN") ||
      estimatedBudget !== initialBudget ||
      targetProvince !== (opportunity.targetProvince || "") ||
      targetCity !== (opportunity.targetCity || "") ||
      description !== initialDesc ||
      bannerUrl !== (opportunity.bannerUrl || "") ||
      startDate !== (opportunity.startDate ? new Date(opportunity.startDate).toISOString().split("T")[0] : "") ||
      endDate !== (opportunity.endDate ? new Date(opportunity.endDate).toISOString().split("T")[0] : "") ||
      deadline !== (opportunity.deadline ? new Date(opportunity.deadline).toISOString().split("T")[0] : "")
    );
  }, [
    isEdit,
    opportunity,
    title,
    focusArea,
    estimatedBudget,
    targetProvince,
    targetCity,
    description,
    bannerUrl,
    startDate,
    endDate,
    deadline,
  ]);

  const handleCancel = () => {
    if (isDirty) {
      if (
        window.confirm(
          "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar dan membatalkan?"
        )
      ) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  // CREATE Save Handler: DRAFT or OPEN
  const handleSaveCreate = async (targetStatus: "DRAFT" | "OPEN") => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage("Nama / Judul Peluang CSR wajib diisi.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (targetStatus === "OPEN") {
      if (!description.trim()) {
        setErrorMessage("Deskripsi & ruang lingkup inisiatif wajib diisi sebelum mempublikasikan.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!targetProvince || !targetCity) {
        setErrorMessage("Wilayah sasaran (Provinsi dan Kota/Kabupaten) wajib dipilih sebelum mempublikasikan.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (deadline) {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadlineDate < today) {
          setErrorMessage("Batas waktu pengajuan proposal tidak boleh mendahului tanggal hari ini.");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
      if (startDate && endDate) {
        if (new Date(endDate) < new Date(startDate)) {
          setErrorMessage("Tanggal selesai program tidak boleh lebih awal dari tanggal mulai.");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const rawBudget = estimatedBudget ? parseFloat(estimatedBudget.replace(/[^\d]/g, "")) : 0;
      const budgetNum = rawBudget > 0 ? rawBudget : undefined;

      const sdgLabels = selectedSdgs
        .map((id) => {
          const s = ALL_17_SDGS.find((g) => g.id === id);
          return s ? `${s.code} (${s.name})` : `SDG ${id}`;
        })
        .join(", ");

      const cleanDesc = description.trim();
      const payloadDesc =
        selectedSdgs.length > 0 && !cleanDesc.includes("[Klasifikasi SDGs:")
          ? `${cleanDesc}\n\n[Klasifikasi SDGs: ${sdgLabels}]`
          : cleanDesc;

      const payload = {
        title: title.trim(),
        description: payloadDesc || "Draf inisiatif program CSR.",
        focusArea,
        targetCity: targetCity.trim() || undefined,
        targetProvince: targetProvince.trim() || undefined,
        estimatedBudget: budgetNum,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        deadline: deadline || undefined,
        bannerUrl: bannerUrl || undefined,
        status: targetStatus,
      };

      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan peluang CSR");
      }

      setSuccessMessage(
        targetStatus === "OPEN"
          ? "Peluang CSR berhasil dipublikasikan! Calon mitra dapat mulai mengajukan proposal."
          : "Draf peluang CSR berhasil disimpan di sistem internal."
      );

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan peluang CSR.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // EDIT Save Handler: Updates existing opportunity
  const handleSaveEdit = async () => {
    if (!opportunity) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage("Nama / Judul Peluang CSR wajib diisi.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Deskripsi inisiatif peluang wajib diisi.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (opportunity.status === "OPEN" && deadline) {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        setErrorMessage("Batas waktu pengajuan proposal tidak boleh mendahului tanggal hari ini.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        setErrorMessage("Tanggal selesai program tidak boleh lebih awal dari tanggal mulai.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const rawBudget = estimatedBudget ? parseFloat(estimatedBudget.replace(/[^\d]/g, "")) : 0;
      const budgetNum = rawBudget > 0 ? rawBudget : undefined;

      const sdgLabels = selectedSdgs
        .map((id) => {
          const s = ALL_17_SDGS.find((g) => g.id === id);
          return s ? `${s.code} (${s.name})` : `SDG ${id}`;
        })
        .join(", ");

      const baseDesc = description.replace(/\n\n\[Klasifikasi SDGs:.*?\]/g, "").trim();
      const payloadDesc =
        selectedSdgs.length > 0 ? `${baseDesc}\n\n[Klasifikasi SDGs: ${sdgLabels}]` : baseDesc;

      const payload = {
        title: title.trim(),
        description: payloadDesc,
        focusArea,
        targetCity: targetCity.trim() || undefined,
        targetProvince: targetProvince.trim() || undefined,
        estimatedBudget: budgetNum,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        deadline: deadline || undefined,
        bannerUrl: bannerUrl || undefined,
        status: opportunity.status, // preserve existing status!
      };

      const res = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui peluang CSR");
      }

      setSuccessMessage("Perubahan peluang CSR berhasil disimpan!");
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan perubahan.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Completion calculation for sidebar
  const completionScore = useMemo(() => {
    let score = 0;
    if (title.trim()) score += 20;
    if (targetProvince && targetCity) score += 25;
    if (selectedSdgs.length > 0) score += 20;
    if (deadline) score += 15;
    if (description.trim()) score += 20;
    return score;
  }, [title, targetProvince, targetCity, selectedSdgs, deadline, description]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Halaman Khusus */}
      <div className="pb-2 border-b border-[#E8E8EA]">
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#181343] transition mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Peluang CSR</span>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#181343] tracking-tight">
              {isEdit ? "Edit Peluang CSR" : "Buat Peluang CSR Baru"}
            </h2>
            {isEdit && opportunity && (
              <Badge variant={STATUS_CONFIG[opportunity.status]?.variant || "slate"} size="sm" hasDot>
                {STATUS_CONFIG[opportunity.status]?.label || opportunity.status}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#787680]">
            {isEdit
              ? "Perbarui informasi dan perencanaan peluang kerja sama CSR."
              : "Rencanakan dan publikasikan peluang kerja sama CSR berdasarkan kebutuhan masyarakat."}
          </p>
        </div>
      </div>

      {/* Alert Error / Success */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Notice if opportunity already has submitted proposals */}
      {isEdit && opportunity?.stats?.proposalsCount && opportunity.stats.proposalsCount > 0 ? (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">
              Peluang ini telah memiliki {opportunity.stats.proposalsCount} proposal dari mitra pelaksana.
            </strong>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Anda tetap dapat memperbarui informasi inisiatif, jadwal, dan banner. Harap perhatikan agar penyesuaian substansi tetap selaras dengan proposal yang telah diajukan mitra.
            </p>
          </div>
        </div>
      ) : null}

      {/* 2. Main Two-Column Layout (Form 70%, Summary 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* ============================================================ */}
        {/* FORM UTAMA (Kolom Kiri) */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: Informasi Dasar Peluang */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F4F4F6]">
              <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#181343]">
                  Informasi Dasar Peluang
                </h3>
                <span className="text-[11px] text-[#787680]">
                  Tentukan judul inisiatif dan bidang fokus program CSR yang direncanakan.
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Nama / Judul */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nama / Judul Peluang CSR <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Program Air Bersih dan Sanitasi Terpadu Pedesaan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EA] bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 transition"
                />
              </div>

              {/* Grid 2 Kolom: Bidang Fokus & Estimasi Anggaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bidang Fokus */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Bidang Fokus CSR <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={focusArea}
                    onChange={(e) => handleFocusAreaChange(e.target.value as CsrFocusArea)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EA] bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 cursor-pointer"
                  >
                    {csrFocusAreaEnum.map((area: CsrFocusArea) => (
                      <option key={area} value={area}>
                        {FOCUS_AREA_CONFIG[area]?.label || area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estimasi Alokasi Anggaran */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Estimasi Alokasi Anggaran (Opsional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      placeholder="Contoh: 150.000.000"
                      value={estimatedBudget ? Number(estimatedBudget).toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/[^\d]/g, "");
                        setEstimatedBudget(numeric);
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E8EA] bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Kosongkan jika anggaran program belum dipublikasikan atau fleksibel.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Lokasi Sasaran & AI Need Prioritization */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F4F4F6]">
              <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#181343]">
                  Lokasi Sasaran &amp; Analisis Kebutuhan Wilayah
                </h3>
                <span className="text-[11px] text-[#787680]">
                  Tentukan wilayah intervensi CSR melalui dropdown terhubung 38 provinsi di Indonesia.
                </span>
              </div>
            </div>

            {/* Connected Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SearchableSelect
                label="Provinsi Sasaran *"
                placeholder="Pilih Provinsi..."
                value={targetProvince}
                onChange={handleProvinceChange}
                options={provinceOptions}
                helperText="Pilih provinsi utama program"
              />

              <SearchableSelect
                label="Kota / Kabupaten Sasaran *"
                placeholder={targetProvince ? "Pilih Kota / Kabupaten..." : "Pilih Provinsi terlebih dahulu"}
                value={targetCity}
                onChange={setTargetCity}
                options={cityOptions}
                disabled={!targetProvince}
                helperText={!targetProvince ? "Pilih provinsi untuk mengaktifkan daftar kota" : "Pilih kabupaten/kota sasaran"}
              />
            </div>

            {/* AI Need Prioritization Assistant (Expandable) */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsAiNeedOpen(!isAiNeedOpen)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                      AI Need Prioritization &amp; Analisis Kebutuhan Wilayah
                    </h4>
                    <span className="text-[11px] text-emerald-700">
                      Rekomendasi prioritas masalah dan intervensi berbasis data wilayah.
                    </span>
                  </div>
                </div>
                <button type="button" className="text-emerald-700 p-1">
                  {isAiNeedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isAiNeedOpen && (
                <div className="pt-2 border-t border-emerald-200/60 space-y-3 text-xs animate-in fade-in">
                  {targetProvince && targetCity ? (
                    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          Profil Kebutuhan: {targetCity}, {targetProvince}
                        </span>
                        <Badge variant="emerald" size="sm">
                          Prioritas Wilayah Tinggi
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                          <span className="font-semibold text-slate-800 block">
                            Tantangan Sosial-Ekonomi Dominan:
                          </span>
                          <p>
                            Kebutuhan peningkatan sarana pemberdayaan kelompok rentan dan fasilitasi infrastruktur ramah lingkungan di wilayah sasaran {targetCity}.
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                          <span className="font-semibold text-slate-800 block">
                            Rekomendasi Intervensi CSR:
                          </span>
                          <p>
                            Program penguatan kapasitas komunitas lokal, pendampingan berkelanjutan, dan kemitraan dengan NGO lokal bersertifikasi.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 italic">
                          Sumber data: Indeks Kebutuhan Wilayah &amp; AI Analytics SIPENA
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const snippet = `\n\nFokus Wilayah (${targetCity}): Program ini difokuskan untuk menjawab tantangan peningkatan sarana dan kapasitas masyarakat setempat melalui intervensi berkelanjutan.`;
                            setDescription((prev) => prev + snippet);
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                        >
                          + Terapkan Rekomendasi ke Deskripsi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/80 border border-emerald-100 text-center text-slate-500 space-y-1">
                      <p className="font-semibold text-xs text-slate-700">
                        Pilih Provinsi dan Kota/Kabupaten Sasaran
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Modul AI akan otomatis menganalisis urgensi kebutuhan masyarakat dan merekomendasikan intervensi yang paling tepat sasaran.
                      </p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-white/60 p-2.5 rounded-lg border border-emerald-100/60">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Pemberitahuan:</strong> Rekomendasi AI Need Prioritization berfungsi sebagai bahan pertimbangan strategis perusahaan (decision support), bukan merupakan ketetapan otomatis sistem.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: Sasaran SDGs & Pemetaan ESG (Prioritas Arahan Dosen) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F4F4F6]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#181343]">
                    Sasaran SDGs &amp; Pemetaan ESG
                  </h3>
                  <span className="text-[11px] text-[#787680]">
                    Pilih sasaran SDGs yang relevan dari 17 kategori resmi PBB. Sistem memetakan pilar ESG secara otomatis.
                  </span>
                </div>
              </div>
              <Badge variant="emerald" size="sm" className="font-bold">
                {selectedSdgs.length} SDGs Terpilih
              </Badge>
            </div>

            {/* Interactive 17 SDGs Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pilih Sasaran SDGs yang Ditargetkan:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {ALL_17_SDGS.map((sdg) => {
                  const isChecked = selectedSdgs.includes(sdg.id);
                  return (
                    <button
                      key={sdg.id}
                      type="button"
                      onClick={() => toggleSdg(sdg.id)}
                      className={`p-2.5 rounded-xl text-left transition-colors duration-150 border flex items-start gap-2.5 cursor-pointer ${
                        isChecked
                          ? "bg-[#EDF9F3] border-[#35B98E] text-[#181343]"
                          : "bg-[#F9F9FB] hover:bg-slate-100/80 border-[#E5E7EB] text-[#181343]"
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: sdg.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-[#181343] flex items-center justify-between">
                          <span>{sdg.code}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-[#009E75] shrink-0" />}
                        </div>
                        <span
                          className={`text-[11px] line-clamp-1 block mt-0.5 ${
                            isChecked ? "text-[#181343]/80 font-medium" : "text-[#787680]"
                          }`}
                        >
                          {sdg.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mapped ESG Summary */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Hasil Pemetaan Otomatis Pilar ESG:
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-[#E8E8EA] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* E */}
                <div className="p-3 rounded-lg bg-white border border-[#E8E8EA] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">🌿 Lingkungan (E)</span>
                    <span className="font-extrabold text-slate-900">{mappedEsgPillars.E.length}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {mappedEsgPillars.E.length > 0
                      ? mappedEsgPillars.E.map((g) => g.code).join(", ")
                      : "Tidak ada sasaran lingkungan langsung"}
                  </div>
                </div>

                {/* S */}
                <div className="p-3 rounded-lg bg-white border border-[#E8E8EA] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800">👥 Sosial (S)</span>
                    <span className="font-extrabold text-slate-900">{mappedEsgPillars.S.length}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {mappedEsgPillars.S.length > 0
                      ? mappedEsgPillars.S.map((g) => g.code).join(", ")
                      : "Tidak ada sasaran sosial langsung"}
                  </div>
                </div>

                {/* G */}
                <div className="p-3 rounded-lg bg-white border border-[#E8E8EA] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-800">🏛️ Tata Kelola (G)</span>
                    <span className="font-extrabold text-slate-900">{mappedEsgPillars.G.length}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {mappedEsgPillars.G.length > 0
                      ? mappedEsgPillars.G.map((g) => g.code).join(", ")
                      : "Tidak ada sasaran tata kelola langsung"}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 italic block">
                Klasifikasi SDGs &amp; ESG tersimpan otomatis untuk integrasi laporan Analisis Kontribusi SDGs &amp; ESG.
              </span>
            </div>
          </div>

          {/* SECTION 4: Jadwal Peluang & Pelaksanaan Program */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F4F4F6]">
              <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#181343]">
                  Jadwal Peluang &amp; Pelaksanaan Program
                </h3>
                <span className="text-[11px] text-[#787680]">
                  Atur batas waktu pengajuan proposal serta estimasi periode eksekusi program bersama mitra.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Batas Pengajuan Proposal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Batas Pengajuan Proposal *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EA] bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30"
                  />
                </div>
                <span className="text-[11px] text-slate-400">
                  Batas akhir mitra mengajukan proposal
                </span>
              </div>

              {/* Tanggal Mulai Program */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mulai Program (Estimasi)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EA] bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30"
                />
                <span className="text-[11px] text-slate-400">Kick-off pelaksanaan kegiatan</span>
              </div>

              {/* Tanggal Selesai Program */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Selesai Program (Estimasi)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EA] bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30"
                />
                <span className="text-[11px] text-slate-400">Target rampung kegiatan</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Deskripsi & Materi Pendukung */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F4F4F6]">
              <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                5
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#181343]">
                  Deskripsi &amp; Materi Pendukung
                </h3>
                <span className="text-[11px] text-[#787680]">
                  Uraikan latar belakang masalah, profil penerima manfaat, dan banner representatif inisiatif.
                </span>
              </div>
            </div>

            {/* Deskripsi Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Deskripsi &amp; Ruang Lingkup Inisiatif <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Jelaskan latar belakang program, sasaran penerima manfaat, ruang lingkup kegiatan yang diharapkan, serta kualifikasi calon mitra pelaksana yang dicari..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#E8E8EA] bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#181343]/10 focus:border-[#181343]/30 transition leading-relaxed resize-y"
              />
              <span className="text-[11px] text-slate-400">
                Informasi yang lengkap mempermudah mitra pelaksana menyusun proposal teknis dan RAB yang akurat.
              </span>
            </div>

            {/* Banner Upload / Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Gambar Sampul / Banner Peluang
              </label>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {bannerUrl && !imageError ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#E8E8EA] h-48 sm:h-56 bg-slate-100 group">
                  <img
                    src={bannerUrl}
                    alt="Pratinjau Sampul"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="px-3.5 py-2 rounded-xl bg-white text-slate-800 text-xs font-bold cursor-pointer shadow-sm transition flex items-center gap-1.5 hover:bg-slate-50">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ganti Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setBannerUrl("")}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-[#E8E8EA] hover:border-slate-400 rounded-2xl p-6 text-center cursor-pointer transition bg-[#F9F9FB] hover:bg-white flex flex-col items-center justify-center gap-2 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                      <span className="text-xs font-semibold text-slate-600">
                        Mengunggah gambar sampul...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E8EA] text-slate-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {imageError
                            ? "Gambar sebelumnya tidak dapat dimuat. Klik untuk mengunggah gambar baru"
                            : "Pilih Gambar Sampul dari Komputer"}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Format PNG, JPG, atau WEBP • Maksimal 5MB
                        </span>
                      </div>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SIDEBAR RINGKASAN & KELENGKAPAN (Kolom Kanan) */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 sticky top-24 space-y-5">
          {/* Kelengkapan Form */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181343] uppercase tracking-wider block">
                Kelengkapan Peluang
              </span>
              <span className="text-xs font-extrabold text-emerald-700">{completionScore}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${completionScore}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs pt-1 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {title.trim() ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                  Nama / Judul Peluang
                </span>
                <span className={title.trim() ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                  {title.trim() ? "Terisi" : "Wajib"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {targetProvince && targetCity ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                  Wilayah Sasaran
                </span>
                <span className={targetProvince && targetCity ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                  {targetProvince && targetCity ? "Terpilih" : "Wajib"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {selectedSdgs.length > 0 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                  Sasaran SDGs
                </span>
                <span className="text-emerald-700 font-semibold">
                  {selectedSdgs.length} Terpilih
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {deadline ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                  Batas Pengajuan
                </span>
                <span className={deadline ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                  {deadline ? "Diatur" : "Wajib"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {description.trim() ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                  Deskripsi Inisiatif
                </span>
                <span className={description.trim() ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                  {description.trim() ? "Terisi" : "Wajib"}
                </span>
              </div>
            </div>
          </div>

          {/* Pratinjau Cepat Ringkasan */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E8EA] shadow-2xs space-y-3">
            <span className="text-xs font-bold text-[#181343] uppercase tracking-wider block">
              Ringkasan Inisiatif
            </span>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bidang Fokus</span>
                <span className="font-bold text-[#181343]">{FOCUS_AREA_CONFIG[focusArea]?.label}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wilayah Sasaran</span>
                <span className="font-semibold text-slate-800">
                  {targetCity && targetProvince ? `${targetCity}, ${targetProvince}` : "Belum ditentukan"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estimasi Anggaran</span>
                <span className="font-bold text-[#009E75]">
                  {estimatedBudget && parseFloat(estimatedBudget) > 0 ? formatRupiah(estimatedBudget) : "Belum ditentukan"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pemetaan Pilar ESG</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Badge variant="emerald" size="sm">E: {mappedEsgPillars.E.length}</Badge>
                  <Badge variant="blue" size="sm">S: {mappedEsgPillars.S.length}</Badge>
                  <Badge variant="purple" size="sm">G: {mappedEsgPillars.G.length}</Badge>
                </div>
              </div>

              {/* Status Peluang Saat Ini (Read-only) */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Status Peluang Saat Ini
                </span>
                <div className="pt-1">
                  {isEdit && opportunity ? (
                    <Badge variant={STATUS_CONFIG[opportunity.status]?.variant || "slate"} size="sm" hasDot>
                      {STATUS_CONFIG[opportunity.status]?.label || opportunity.status}
                    </Badge>
                  ) : (
                    <Badge variant="blue" size="sm" hasDot>
                      Draf Baru
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. STICKY FOOTER — SATU-SATUNYA AREA TINDAKAN */}
      {/* ============================================================ */}
      <div className="sticky bottom-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 bg-white/95 backdrop-blur-md border-t border-[#E8E8EA] shadow-md transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tombol Batal di Sisi Kiri */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 py-2.5 px-4 rounded-xl border border-[#E8E8EA] sm:border-transparent hover:bg-slate-100/80 transition-colors cursor-pointer text-center"
          >
            Batal
          </button>

          {/* Sisi Kanan: Aksi Sesuai Mode */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isEdit ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial bg-[#181343] hover:bg-[#25205c] text-white text-xs sm:text-sm font-bold rounded-xl px-7 py-2.5 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => handleSaveCreate("DRAFT")}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial text-xs sm:text-sm font-semibold border-[#E8E8EA] text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 cursor-pointer"
                >
                  Simpan Draf
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => handleSaveCreate("OPEN")}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial bg-[#181343] hover:bg-[#25205c] text-white text-xs sm:text-sm font-bold rounded-xl px-6 py-2.5 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Publikasikan Peluang</span>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper for Create Opportunity
export function CreateOpportunityPageView(props: { onBack: () => void; onSuccess: () => void }) {
  return <OpportunityFormPageView mode="create" {...props} />;
}

// Wrapper for Edit Opportunity
export function EditOpportunityPageView(props: {
  opportunity: OpportunityItem;
  onBack: () => void;
  onSuccess: () => void;
}) {
  return <OpportunityFormPageView mode="edit" {...props} />;
}
