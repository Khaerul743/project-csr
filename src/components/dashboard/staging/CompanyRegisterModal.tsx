"use client";

import React, { useState } from "react";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RegionSelectGroup } from "@/components/ui/region-select-group";

interface CompanyRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
}

export function CompanyRegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: CompanyRegisterModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    city: "",
    province: "",
    website: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage("Nama resmi perusahaan wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal mendaftarkan profil perusahaan.");
      }

      // Perbarui token sesi dan informasi user lokal
      if (json.data?.accessToken) {
        localStorage.setItem("accessToken", json.data.accessToken);
        document.cookie = `token=${json.data.accessToken}; path=/; max-age=86400`;
      }
      if (json.data?.user) {
        localStorage.setItem("user", JSON.stringify(json.data.user));
      }

      onSuccess(json.data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Terjadi kesalahan sistem saat mendaftarkan perusahaan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daftarkan Profil Perusahaan Sponsor"
      description="Lengkapi data dasar korporasi Anda untuk memulai perencanaan dan evaluasi program CSR terpadu."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Informasi Jalur Role */}
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#181343] text-white flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-[#181343] block">
              Jalur Organisasi: Perusahaan Sponsor CSR
            </span>
            <span className="text-slate-600">
              Akun Anda akan otomatis ditetapkan sebagai peran <strong>MANAGEMENT</strong>.
            </span>
          </div>
        </div>

        {/* Section 1: Profil Utama */}
        <div className="space-y-3 pt-1">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            1. Profil Utama Perusahaan
          </div>

          <Input
            label={
              <>
                Nama Resmi Perusahaan <span className="text-rose-500">*</span>
              </>
            }
            name="name"
            placeholder="Contoh: PT Sumber Daya Hijau Nusantara"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Textarea
            label="Deskripsi Singkat & Visi Keberlanjutan"
            name="description"
            placeholder="Jelaskan bidang usaha utama dan komitmen keberlanjutan sosial atau fokus CSR perusahaan Anda..."
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Section 2: Kontak Resmi */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Kontak & Komunikasi Resmi
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Email Resmi CSR / Komunikasi"
              name="email"
              type="email"
              placeholder="csr@perusahaan.co.id"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Nomor Telepon / Hotline"
              name="phone"
              placeholder="+62 21 555 1234"
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Situs Web Resmi"
            name="website"
            placeholder="https://perusahaan.co.id"
            leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        {/* Section 3: Domisili & Kantor */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            3. Domisili Kantor Pusat
          </div>

          {/* Pemilihan Wilayah Terintegrasi (Provinsi -> Kota/Kabupaten) */}
          <RegionSelectGroup
            province={formData.province}
            city={formData.city}
            onProvinceChange={(prov) =>
              setFormData((prev) => ({ ...prev, province: prov, city: "" }))
            }
            onCityChange={(cit) =>
              setFormData((prev) => ({ ...prev, city: cit }))
            }
            provinceLabel="Provinsi Kantor Pusat"
            cityLabel="Kota / Kabupaten"
            provincePlaceholder="Pilih Provinsi..."
            cityPlaceholder="Pilih Kota / Kabupaten..."
            provinceHelperText="Pilih provinsi domisili kantor pusat"
            cityHelperText="Pilih kota/kabupaten kantor pusat"
          />

          <Input
            label="Alamat Lengkap Kantor"
            name="address"
            placeholder="Gedung Menara Tower Lt. 18, Jl. Jend. Sudirman Kav. 21..."
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs font-semibold cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="text-xs font-bold px-5 bg-[#181343] hover:bg-[#26224C] text-white border-[#181343] cursor-pointer"
            leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
          >
            Konfirmasi &amp; Daftarkan Perusahaan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
