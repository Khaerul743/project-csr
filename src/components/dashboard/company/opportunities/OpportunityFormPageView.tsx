"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
  Info,
  Check,
  Search,
  Layers,
  Clock,
  Sparkles,
  FileText,
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
import { AiNeedPrioritizationPanel } from "./AiNeedPrioritizationPanel";

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

const FORM_STEPS = [
  { id: 1, label: "Informasi Dasar", shortDesc: "Judul & bidang fokus" },
  { id: 2, label: "Wilayah & AI", shortDesc: "Lokasi sasaran & prioritas" },
  { id: 3, label: "Sasaran SDGs", shortDesc: "17 Sasaran & pilar ESG" },
  { id: 4, label: "Jadwal Program", shortDesc: "Batas pengajuan & periode" },
  { id: 5, label: "Deskripsi & Pratinjau", shortDesc: "Detail ruang lingkup & simpan" },
];

const INPUT_BASE_CLASS =
  "w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium";

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
    <div className="flex flex-col relative" ref={dropdownRef}>
      <label className="text-[13px] font-semibold text-[#181343] mb-1.5 block">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full h-11 text-left px-3.5 rounded-xl border text-[14px] font-medium flex items-center justify-between transition-all ${
          disabled
            ? "bg-slate-100 border-[#E2E8F0] text-slate-400 cursor-not-allowed"
            : isOpen
            ? "bg-white border-[#181343] ring-2 ring-[#181343]/15 text-[#181343] shadow-2xs"
            : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1] text-[#181343] cursor-pointer"
        }`}
      >
        <span className={value ? "text-[#181343]" : "text-[#94A3B8] font-normal"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {helperText && <span className="text-[11px] text-[#64748B] mt-1">{helperText}</span>}

      {/* Popover list */}
      {isOpen && !disabled && (
        <div className="absolute top-[100%] left-0 right-0 mt-1.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in duration-150">
          <div className="p-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Cari wilayah..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg outline-none focus:border-[#181343]"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
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
                    className={`w-full text-left px-3.5 py-2.5 transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#181343] text-white font-semibold"
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

  // Multi-step State (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Initial description without SDGs metadata tag
  const parseCleanDescription = (desc?: string | null) => {
    if (!desc) return "";
    return desc.replace(/\n\n\[Klasifikasi SDGs:.*?\]/g, "").trim();
  };

  // Helper to parse existing SDGs from opportunity
  const parseInitialSdgs = (opp?: OpportunityItem | null): number[] => {
    if (!opp) return [];

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

    const calculated = getProgramSdgs({
      id: opp.id,
      title: opp.title,
      description: opp.description,
      focusArea: opp.focusArea,
      status: "PLANNED",
      budget: opp.estimatedBudget || "0",
    });
    if (calculated.length > 0) return calculated.sort((a, b) => a - b);

    return [];
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

  // UI & submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDescriptionHighlighted, setIsDescriptionHighlighted] = useState(false);
  const [appliedAiSnippet, setAppliedAiSnippet] = useState<string | null>(null);
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

  const handleProvinceChange = (prov: string) => {
    setTargetProvince(prov);
    setTargetCity("");
  };

  const handleFocusAreaChange = (newArea: CsrFocusArea) => {
    setFocusArea(newArea);
  };

  const toggleSdg = (id: number) => {
    setSelectedSdgs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].sort((a, b) => a - b)
    );
  };

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

  const handleApplyAiRecommendation = ({
    focusArea: nextFocusArea,
    sdgs: nextSdgs,
    descriptionSnippet,
    feedbackMessage,
  }: {
    focusArea?: CsrFocusArea;
    sdgs?: number[];
    descriptionSnippet?: string;
    feedbackMessage?: string;
  }) => {
    if (nextFocusArea) {
      setFocusArea(nextFocusArea);
    }
    if (nextSdgs && nextSdgs.length > 0) {
      // Set directly to the newly selected priority's SDGs so it replaces the previous choice
      setSelectedSdgs([...nextSdgs].sort((a, b) => a - b));
    }
    if (descriptionSnippet) {
      const newSnippet = descriptionSnippet.trim();
      setDescription((prev) => {
        const trimmed = prev.trim();

        // 1. If description was empty, just use the new snippet
        if (!trimmed) {
          return newSnippet;
        }

        // 2. If description equals the previous AI snippet, replace completely
        if (appliedAiSnippet && trimmed === appliedAiSnippet.trim()) {
          return newSnippet;
        }

        // 3. If description contains the previous AI snippet, replace that specific snippet
        if (appliedAiSnippet && trimmed.includes(appliedAiSnippet.trim())) {
          return trimmed.replace(appliedAiSnippet.trim(), newSnippet);
        }

        // 4. If description was previously generated by an AI priority (starts with "Prioritas Wilayah (")
        if (trimmed.startsWith("Prioritas Wilayah (")) {
          return newSnippet;
        }

        // 5. If user had custom manual text, append or replace
        return `${trimmed}\n\n${newSnippet}`;
      });

      setAppliedAiSnippet(newSnippet);
    }

    setSuccessMessage(
      feedbackMessage ||
        "Rekomendasi AI berhasil diterapkan ke form. Sasaran SDGs dan draf deskripsi telah diperbarui."
    );
    setIsDescriptionHighlighted(true);
    setTimeout(() => {
      setIsDescriptionHighlighted(false);
    }, 4000);
  };

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

  // Step Navigation Handlers
  const validateCurrentStep = (step: number): boolean => {
    setErrorMessage(null);

    if (step === 1) {
      if (!title.trim()) {
        setErrorMessage("Nama / Judul Peluang CSR wajib diisi sebelum melanjutkan.");
        return false;
      }
    }

    if (step === 2) {
      if (!targetProvince || !targetCity) {
        setErrorMessage("Silakan pilih Provinsi dan Kota/Kabupaten sasaran terlebih dahulu.");
        return false;
      }
    }

    if (step === 4) {
      if (deadline) {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadlineDate < today) {
          setErrorMessage("Batas waktu pengajuan proposal tidak boleh mendahului hari ini.");
          return false;
        }
      }
      if (startDate && endDate) {
        if (new Date(endDate) < new Date(startDate)) {
          setErrorMessage("Tanggal selesai program tidak boleh lebih awal dari tanggal mulai.");
          return false;
        }
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrorMessage(null);
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (targetStep: number) => {
    if (targetStep > currentStep) {
      if (!validateCurrentStep(currentStep)) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setErrorMessage(null);
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // CREATE Save Handler: DRAFT or OPEN
  const handleSaveCreate = async (targetStatus: "DRAFT" | "OPEN") => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage("Nama / Judul Peluang CSR wajib diisi.");
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (targetStatus === "OPEN") {
      if (!targetProvince || !targetCity) {
        setErrorMessage("Wilayah sasaran (Provinsi dan Kota/Kabupaten) wajib dipilih sebelum mempublikasikan.");
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!deadline) {
        setErrorMessage("Batas waktu pengajuan proposal wajib diisi sebelum mempublikasikan.");
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!description.trim()) {
        setErrorMessage("Deskripsi & ruang lingkup inisiatif wajib diisi sebelum mempublikasikan.");
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (deadline) {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadlineDate < today) {
          setErrorMessage("Batas waktu pengajuan proposal tidak boleh mendahului tanggal hari ini.");
          setCurrentStep(4);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
      if (startDate && endDate) {
        if (new Date(endDate) < new Date(startDate)) {
          setErrorMessage("Tanggal selesai program tidak boleh lebih awal dari tanggal mulai.");
          setCurrentStep(4);
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
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan peluang CSR.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // EDIT Save Handler
  const handleSaveEdit = async () => {
    if (!opportunity) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage("Nama / Judul Peluang CSR wajib diisi.");
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Deskripsi inisiatif peluang wajib diisi.");
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (opportunity.status === "OPEN" && deadline) {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        setErrorMessage("Batas waktu pengajuan proposal tidak boleh mendahului tanggal hari ini.");
        setCurrentStep(4);
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
      };

      const res = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: "PUT",
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Bar */}
      <div className="space-y-1 pb-3 border-b border-slate-200/80 w-full">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#181343] transition mb-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Peluang CSR</span>
        </button>
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isEdit ? "Edit Peluang CSR" : "Buat Peluang CSR Baru"}
          </h1>
          {isEdit && opportunity && (
            <Badge variant={STATUS_CONFIG[opportunity.status]?.variant || "slate"} size="sm" hasDot>
              {STATUS_CONFIG[opportunity.status]?.label || opportunity.status}
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-[#64748B]">
          {isEdit
            ? "Perbarui rincian inisiatif kolaborasi CSR melalui tahapan formulir di bawah ini."
            : "Rencanakan dan publikasikan peluang kolaborasi CSR melalui 5 tahapan yang terstruktur."}
        </p>
      </div>

      {/* 2. Top Stepper Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 sm:p-4 shadow-2xs">
        {/* Desktop 5-step segments */}
        <div className="hidden sm:grid grid-cols-5 gap-2">
          {FORM_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#181343]/5 border border-[#181343]/20"
                    : isCompleted
                    ? "hover:bg-slate-50 border border-transparent"
                    : "opacity-60 hover:opacity-100 border border-transparent"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                    isCurrent
                      ? "bg-[#181343] text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                </div>
                <div className="min-w-0">
                  <span
                    className={`text-xs block truncate ${
                      isCurrent ? "font-bold text-[#181343]" : "font-medium text-slate-700"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[11px] text-[#64748B] block truncate">
                    {step.shortDesc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Stepper bar */}
        <div className="sm:hidden space-y-2 px-1 py-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#181343]">
              Langkah {currentStep} dari 5: {FORM_STEPS[currentStep - 1].label}
            </span>
            <span className="text-slate-500 font-medium">
              {Math.round((currentStep / 5) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#181343] rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
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

      {/* 3. Main Step Form Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-2xs space-y-6">
        {/* ============================================================ */}
        {/* LANGKAH 1: INFORMASI DASAR */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Informasi Dasar Inisiatif CSR
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Tentukan nama judul inisiatif dan bidang fokus program yang direncanakan.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Nama / Judul */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#181343] block">
                  Nama / Judul Peluang CSR <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Program Air Bersih dan Sanitasi Terpadu Pedesaan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={INPUT_BASE_CLASS}
                />
                <span className="text-[12px] text-[#64748B]">
                  Gunakan judul yang jelas, ringkas, dan merefleksikan sasaran intervensi sosial.
                </span>
              </div>

              {/* Grid 2 Kolom: Bidang Fokus & Estimasi Anggaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Bidang Fokus */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#181343] block">
                    Bidang Fokus CSR <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={focusArea}
                    onChange={(e) => handleFocusAreaChange(e.target.value as CsrFocusArea)}
                    className={INPUT_BASE_CLASS}
                  >
                    {csrFocusAreaEnum.map((area: CsrFocusArea) => (
                      <option key={area} value={area}>
                        {FOCUS_AREA_CONFIG[area]?.label || area}
                      </option>
                    ))}
                  </select>
                  <span className="text-[12px] text-[#64748B]">
                    Pilih pilar tematik CSR yang paling sesuai dengan mandat perusahaan.
                  </span>
                </div>

                {/* Estimasi Alokasi Anggaran */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#181343] block">
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
                      className={`${INPUT_BASE_CLASS} pl-10`}
                    />
                  </div>
                  <span className="text-[12px] text-[#64748B]">
                    Kosongkan jika anggaran program belum dipublikasikan atau bersifat fleksibel.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* LANGKAH 2: WILAYAH SASARAN & ANALISIS AI */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Wilayah Sasaran &amp; Analisis Kebutuhan
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Tentukan wilayah intervensi dan gunakan asisten AI untuk memetakan prioritas masyarakat lokal.
                  </p>
                </div>
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
                helperText="Pilih provinsi utama pelaksanaan program"
              />

              <SearchableSelect
                label="Kota / Kabupaten Sasaran *"
                placeholder="Pilih Kota / Kabupaten..."
                value={targetCity}
                onChange={setTargetCity}
                options={cityOptions}
                disabled={!targetProvince}
                helperText={!targetProvince ? "Pilih provinsi untuk mengaktifkan daftar kota" : "Pilih kabupaten/kota sasaran"}
              />
            </div>

            {/* AI Need Prioritization Assistant */}
            <div className="pt-2">
              <AiNeedPrioritizationPanel
                targetProvince={targetProvince}
                targetCity={targetCity}
                focusArea={focusArea}
                title={title}
                description={description}
                estimatedBudget={estimatedBudget}
                excludeOpportunityId={isEdit ? opportunity?.id : null}
                onApplyRecommendation={handleApplyAiRecommendation}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* LANGKAH 3: SASARAN SDGS & PEMETAAN ESG */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Sasaran SDGs &amp; Pemetaan Pilar ESG
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Pilih sasaran SDGs yang relevan dari 17 tujuan resmi PBB. Sistem memetakan pilar ESG secara otomatis.
                  </p>
                </div>
              </div>
              <Badge variant="emerald" size="sm" className="font-bold self-start sm:self-auto">
                {selectedSdgs.length} SDGs Terpilih
              </Badge>
            </div>

            {/* Interactive 17 SDGs Grid */}
            <div className="space-y-2.5">
              <span className="text-[13px] font-semibold text-[#181343] block">
                Pilih Sasaran SDGs yang Ditargetkan:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {ALL_17_SDGS.map((sdg) => {
                  const isChecked = selectedSdgs.includes(sdg.id);
                  return (
                    <button
                      key={sdg.id}
                      type="button"
                      onClick={() => toggleSdg(sdg.id)}
                      className={`p-3 rounded-xl text-left transition-colors duration-150 border flex items-start gap-2.5 cursor-pointer ${
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
            <div className="space-y-2 pt-2">
              <span className="text-[13px] font-semibold text-[#181343] block">
                Hasil Pemetaan Otomatis Pilar ESG:
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* E */}
                <div className="p-3 rounded-lg bg-white border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">Lingkungan (E)</span>
                    <span className="font-bold text-[#181343]">{mappedEsgPillars.E.length}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {mappedEsgPillars.E.length > 0
                      ? mappedEsgPillars.E.map((g) => g.code).join(", ")
                      : "Tidak ada sasaran lingkungan langsung"}
                  </div>
                </div>

                {/* S */}
                <div className="p-3 rounded-lg bg-white border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800">Sosial (S)</span>
                    <span className="font-bold text-[#181343]">{mappedEsgPillars.S.length}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {mappedEsgPillars.S.length > 0
                      ? mappedEsgPillars.S.map((g) => g.code).join(", ")
                      : "Tidak ada sasaran sosial langsung"}
                  </div>
                </div>

                {/* G */}
                <div className="p-3 rounded-lg bg-white border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-800">Tata Kelola (G)</span>
                    <span className="font-bold text-[#181343]">{mappedEsgPillars.G.length}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {mappedEsgPillars.G.length > 0
                      ? mappedEsgPillars.G.map((g) => g.code).join(", ")
                      : "Tidak ada sasaran tata kelola langsung"}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-[#64748B] block mt-1">
                Klasifikasi SDGs dan ESG tersimpan otomatis untuk integrasi laporan Analisis Kontribusi.
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* LANGKAH 4: JADWAL PELUANG & PELAKSANAAN PROGRAM */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Jadwal Peluang &amp; Pelaksanaan Program
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Atur batas waktu pengajuan proposal bagi calon mitra serta estimasi periode eksekusi program.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Batas Pengajuan Proposal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#181343] block">
                  Batas Pengajuan Proposal *
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={INPUT_BASE_CLASS}
                />
                <span className="text-[11px] text-[#64748B]">
                  Batas akhir mitra mengajukan proposal teknis &amp; RAB
                </span>
              </div>

              {/* Tanggal Mulai Program */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#181343] block">
                  Mulai Program (Estimasi)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={INPUT_BASE_CLASS}
                />
                <span className="text-[11px] text-[#64748B]">
                  Perkiraan kick-off kegiatan di lapangan
                </span>
              </div>

              {/* Tanggal Selesai Program */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#181343] block">
                  Selesai Program (Estimasi)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={INPUT_BASE_CLASS}
                />
                <span className="text-[11px] text-[#64748B]">
                  Target rampung seluruh kegiatan program
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* LANGKAH 5: DESKRIPSI, BANNER & PRATINJAU AKHIR */}
        {/* ============================================================ */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#181343]/10 text-[#181343] flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181343]">
                    Deskripsi, Banner &amp; Pratinjau Akhir
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Lengkapi uraian ruang lingkup inisiatif dan tinjau ringkasan sebelum mempublikasikan.
                  </p>
                </div>
              </div>
            </div>

            {/* Deskripsi Textarea */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="field-description" className="text-[13px] font-semibold text-[#181343] block">
                  Deskripsi &amp; Ruang Lingkup Inisiatif <span className="text-rose-500">*</span>
                </label>
                {isDescriptionHighlighted && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Rekomendasi AI Berhasil Disisipkan
                  </span>
                )}
              </div>
              <textarea
                id="field-description"
                rows={6}
                placeholder="Jelaskan latar belakang program, sasaran penerima manfaat, ruang lingkup kegiatan yang diharapkan, serta kualifikasi calon mitra pelaksana yang dicari..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-3.5 rounded-xl border text-[14px] text-[#181343] focus:outline-none transition-all duration-300 leading-relaxed resize-y ${
                  isDescriptionHighlighted
                    ? "bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/25 shadow-sm"
                    : "border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#181343]/15 focus:border-[#181343]"
                }`}
              />
              <span className="text-[12px] text-[#64748B]">
                Informasi yang lengkap mempermudah mitra pelaksana menyusun proposal teknis dan RAB yang akurat.
              </span>
            </div>

            {/* Banner Upload / Preview */}
            <div className="space-y-2 pt-2">
              <label className="text-[13px] font-semibold text-[#181343] block">
                Gambar Sampul / Banner Peluang (Opsional)
              </label>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {bannerUrl && !imageError ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] h-48 sm:h-56 bg-slate-100 group">
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
                <label className="border-2 border-dashed border-[#E5E7EB] hover:border-slate-400 rounded-2xl p-6 text-center cursor-pointer transition bg-[#F9F9FB] hover:bg-white flex flex-col items-center justify-center gap-2 group">
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
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] text-slate-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {imageError
                            ? "Gambar sebelumnya tidak dapat dimuat. Klik untuk mengunggah gambar baru"
                            : "Pilih Gambar Sampul dari Komputer"}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Format PNG, JPG, atau WEBP - Maksimal 5MB
                        </span>
                      </div>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* Pratinjau Ringkasan Inisiatif */}
            <div className="pt-2">
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-3">
                <span className="text-xs font-bold text-[#181343] block">
                  Ringkasan Pratinjau Peluang:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Judul Inisiatif</span>
                    <span className="font-semibold text-[#181343]">{title || "Belum diisi"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Bidang Fokus</span>
                    <span className="font-semibold text-[#181343]">{FOCUS_AREA_CONFIG[focusArea]?.label}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Wilayah Sasaran</span>
                    <span className="font-semibold text-[#181343]">
                      {targetCity && targetProvince ? `${targetCity}, ${targetProvince}` : "Belum ditentukan"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Estimasi Anggaran</span>
                    <span className="font-bold text-[#047857]">
                      {estimatedBudget && parseFloat(estimatedBudget) > 0 ? formatRupiah(estimatedBudget) : "Fleksibel / Belum Ditentukan"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Batas Pengajuan Proposal</span>
                    <span className="font-medium text-[#181343]">{deadline || "Belum ditentukan"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Sasaran SDGs &amp; ESG</span>
                    <span className="font-medium text-[#181343]">
                      {selectedSdgs.length > 0 ? `${selectedSdgs.length} SDGs (E:${mappedEsgPillars.E.length}, S:${mappedEsgPillars.S.length}, G:${mappedEsgPillars.G.length})` : "Belum dipilih"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP FOOTER / NAVIGATION CONTROLS */}
        {/* ============================================================ */}
        <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          {/* Tombol Kiri */}
          <div>
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs sm:text-sm font-semibold text-[#47464F] hover:text-[#181343] py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Batal
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs sm:text-sm font-semibold text-[#47464F] hover:text-[#181343] py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            )}
          </div>

          {/* Tombol Kanan */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Simpan Draf Selalu Tersedia */}
            {!isEdit && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleSaveCreate("DRAFT")}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial text-xs sm:text-sm font-semibold border-[#E5E7EB] text-[#47464F] hover:bg-slate-50 rounded-xl px-4 py-2.5 cursor-pointer"
              >
                Simpan Draf
              </Button>
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNextStep}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial bg-[#181343] hover:bg-[#25205c] text-white text-xs sm:text-sm font-bold rounded-xl px-6 py-2.5 shadow-2xs cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Langkah Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : isEdit ? (
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
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleSaveCreate("OPEN")}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial bg-[#181343] hover:bg-[#25205c] text-white text-xs sm:text-sm font-bold rounded-xl px-7 py-2.5 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Publikasikan Peluang CSR</span>
                )}
              </Button>
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
