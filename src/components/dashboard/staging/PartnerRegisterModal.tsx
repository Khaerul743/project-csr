"use client";

import React, { useState } from "react";
import { HeartHandshake, Globe, Mail, MapPin, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PartnerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
}

export function PartnerRegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: PartnerRegisterModalProps) {
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
      setErrorMessage("Nama mitra / lembaga wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal mendaftarkan mitra");
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
      setErrorMessage(err.message || "Terjadi kesalahan saat mendaftarkan mitra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daftarkan Mitra Pelaksana / NGO"
      description="Lengkapi informasi dasar yayasan atau organisasi Anda. Anda akan otomatis dipromosikan menjadi Pimpinan Mitra (PARTNER_ADMIN)."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-teal-900 block">Jalur Mitra CSR / NGO</span>
            <span className="text-teal-700">
              Role akun Anda akan beralih menjadi <strong>PARTNER_ADMIN</strong>
            </span>
          </div>
        </div>

        <Input
          label="Nama Yayasan / Komunitas / NGO *"
          name="name"
          placeholder="Contoh: Yayasan Lindungi Hutan Nusantara"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Profil Singkat & Fokus Isu"
          name="description"
          placeholder="Jelaskan bidang fokus dampak sosial (misal: konservasi lingkungan, pendidikan anak, pemberdayaan ekonomi lokal)..."
          rows={3}
          value={formData.description}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Email Kontak Resmi"
            name="email"
            type="email"
            placeholder="kontak@lindungi-hutan.org"
            leftIcon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Nomor Telepon / WhatsApp"
            name="phone"
            placeholder="+62 812 3456 7890"
            leftIcon={<Phone className="w-4 h-4" />}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Kota Domisili"
            name="city"
            placeholder="Semarang"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={formData.city}
            onChange={handleChange}
          />
          <Input
            label="Provinsi"
            name="province"
            placeholder="Jawa Tengah"
            value={formData.province}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Website / Akun Media Sosial"
          name="website"
          placeholder="https://lindungi-hutan.org"
          leftIcon={<Globe className="w-4 h-4" />}
          value={formData.website}
          onChange={handleChange}
        />

        <Input
          label="Alamat Sekretariat"
          name="address"
          placeholder="Jl. Hutan Lestari No. 12..."
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
            className="bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Konfirmasi & Buat Mitra
          </Button>
        </div>
      </form>
    </Modal>
  );
}
