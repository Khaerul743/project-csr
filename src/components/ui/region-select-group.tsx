"use client";

import React, { useMemo } from "react";
import { MapPin } from "lucide-react";
import { SearchableSelect } from "./searchable-select";
import { INDONESIAN_REGIONS } from "@/components/dashboard/company/opportunities/indonesian-regions";

export interface RegionSelectGroupProps {
  province: string;
  city: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  provinceLabel?: string;
  cityLabel?: string;
  provincePlaceholder?: string;
  cityPlaceholder?: string;
  provinceHelperText?: string;
  cityHelperText?: string;
  disabled?: boolean;
  required?: boolean;
  provinceError?: string;
  cityError?: string;
  layout?: "grid" | "vertical";
  className?: string;
  showIcon?: boolean;
}

/**
 * RegionSelectGroup — Komponen Reusable Pemilihan Wilayah Administratif Indonesia (Provinsi & Kota/Kabupaten)
 * 
 * Karakteristik:
 * 1. Urutan resmi: Provinsi terlebih dahulu, kemudian Kota/Kabupaten.
 * 2. Dependent dropdown: Daftar kota/kabupaten menyesuaikan provinsi yang dipilih.
 * 3. Otomatis mengosongkan kota/kabupaten jika provinsi berganti untuk mencegah kombinasi wilayah invalid.
 * 4. UX Fleksibel: Pengguna dapat langsung mencari kota/kabupaten dan provinsi akan terisi secara otomatis jika belum dipilih.
 * 5. Searchable combobox: Pencarian cepat, responsif, dan ramah keyboard ("Cari wilayah...").
 * 6. Tampilan bersih dan rapi sesuai referensi SIPENA tanpa label/placeholder blokir.
 */
export function RegionSelectGroup({
  province,
  city,
  onProvinceChange,
  onCityChange,
  provinceLabel = "Provinsi Kantor Pusat",
  cityLabel = "Kota / Kabupaten",
  provincePlaceholder = "Pilih Provinsi...",
  cityPlaceholder = "Pilih Kota / Kabupaten...",
  provinceHelperText = "Pilih provinsi domisili kantor pusat",
  cityHelperText = "Pilih kota/kabupaten kantor pusat",
  disabled = false,
  required = false,
  provinceError,
  cityError,
  layout = "grid",
  className = "",
  showIcon = false,
}: RegionSelectGroupProps) {
  // 1. Daftar 38 Provinsi Indonesia
  const provinceOptions = useMemo(() => {
    return INDONESIAN_REGIONS.map((p) => p.name);
  }, []);

  // 2. Daftar Kota/Kabupaten
  // Jika provinsi sudah dipilih: ambil daftar kota di provinsi tersebut.
  // Jika belum dipilih: sediakan daftar seluruh kota/kabupaten di Indonesia agar pengguna tetap bisa mencari langsung!
  const cityOptions = useMemo(() => {
    if (!province) {
      const all: string[] = [];
      INDONESIAN_REGIONS.forEach((p) => {
        all.push(...p.cities);
      });
      return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
    }
    const found = INDONESIAN_REGIONS.find(
      (p) => p.name.toLowerCase() === province.trim().toLowerCase()
    );
    return found ? found.cities : [];
  }, [province]);

  const handleProvinceChange = (newProvince: string) => {
    onProvinceChange(newProvince);
    // Kosongkan kota jika provinsi diganti
    if (newProvince.toLowerCase() !== province.toLowerCase()) {
      onCityChange("");
    }
  };

  const handleCityChange = (newCity: string) => {
    onCityChange(newCity);
    // Jika provinsi belum dipilih, otomatis deteksi dan isi provinsinya dari kota yang dipilih
    if (!province && newCity) {
      for (const p of INDONESIAN_REGIONS) {
        if (p.cities.some((c) => c.toLowerCase() === newCity.trim().toLowerCase())) {
          onProvinceChange(p.name);
          break;
        }
      }
    }
  };

  const containerClasses =
    layout === "grid"
      ? `grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`
      : `space-y-4 ${className}`;

  return (
    <div className={containerClasses}>
      {/* 1. Field Provinsi */}
      <SearchableSelect
        id="region-province"
        label={required ? `${provinceLabel} *` : provinceLabel}
        placeholder={provincePlaceholder}
        searchPlaceholder="Cari wilayah..."
        value={province}
        onChange={handleProvinceChange}
        options={provinceOptions}
        disabled={disabled}
        error={provinceError}
        helperText={provinceHelperText}
        leftIcon={showIcon ? <MapPin className="w-4 h-4" /> : undefined}
      />

      {/* 2. Field Kota/Kabupaten */}
      <SearchableSelect
        id="region-city"
        label={required ? `${cityLabel} *` : cityLabel}
        placeholder={cityPlaceholder}
        searchPlaceholder="Cari wilayah..."
        value={city}
        onChange={handleCityChange}
        options={cityOptions}
        disabled={disabled}
        error={cityError}
        helperText={cityHelperText}
        leftIcon={showIcon ? <MapPin className="w-4 h-4" /> : undefined}
      />
    </div>
  );
}
