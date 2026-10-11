"use client";

import React, { useState } from "react";
import { Building2, Globe, Mail, MapPin, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
      setErrorMessage("Nama perusahaan wajib diisi.");
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
        throw new Error(json.message || "Gagal mendaftarkan perusahaan");
      }

      // Simpan access token baru & user data yang baru diperbarui
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
      setErrorMessage(err.message || "Terjadi kesalahan saat mendaftarkan perusahaan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daftarkan Profil Perusahaan"
      description="Lengkapi informasi dasar perusahaan Anda. Anda akan otomatis dipromosikan menjadi Manajemen Perusahaan."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-emerald-900 block">Jalur Perusahaan</span>
            <span className="text-emerald-700">
              Role akun Anda akan beralih menjadi <strong>MANAGEMENT</strong>
            </span>
          </div>
        </div>

        <Input
          label="Nama Perusahaan *"
          name="name"
          placeholder="Contoh: PT Sumber Daya Hijau Indonesia"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Deskripsi / Fokus CSR"
          name="description"
          placeholder="Jelaskan bidang usaha dan komitmen keberlanjutan atau fokus CSR perusahaan Anda..."
          rows={3}
          value={formData.description}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Email Resmi CSR"
            name="email"
            type="email"
            placeholder="csr@perusahaan.co.id"
            leftIcon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Nomor Telepon / Hotline"
            name="phone"
            placeholder="+62 21 555 1234"
            leftIcon={<Phone className="w-4 h-4" />}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Kota"
            name="city"
            placeholder="Jakarta Selatan"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={formData.city}
            onChange={handleChange}
          />
          <Input
            label="Provinsi"
            name="province"
            placeholder="DKI Jakarta"
            value={formData.province}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Situs Web Perusahaan"
          name="website"
          placeholder="https://perusahaan.co.id"
          leftIcon={<Globe className="w-4 h-4" />}
          value={formData.website}
          onChange={handleChange}
        />

        <Input
          label="Alamat Kantor"
          name="address"
          placeholder="Gedung Menara CSR Lt. 15, Jl. Jend. Sudirman..."
          value={formData.address}
          onChange={handleChange}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Konfirmasi & Buat Perusahaan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
