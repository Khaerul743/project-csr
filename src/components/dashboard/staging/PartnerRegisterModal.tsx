"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Globe,
  Mail,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  Users2,
  Compass,
} from "lucide-react";
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
      setErrorMessage("Nama resmi lembaga mitra wajib diisi.");
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
        throw new Error(json.message || "Gagal mendaftarkan lembaga mitra.");
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
        err.message || "Terjadi kesalahan sistem saat mendaftarkan lembaga mitra."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daftarkan Lembaga Mitra Pelaksana (NGO)"
      description="Lengkapi data dasar yayasan, organisasi nirlaba, atau komunitas pelaksana Anda untuk mulai mengajukan proposal inisiatif CSR."
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
            <HeartHandshake className="w-5 h-5 text-teal-300" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-[#181343] block">
              Jalur Organisasi: Mitra Pelaksana CSR / NGO
            </span>
            <span className="text-slate-600">
              Akun Anda akan otomatis ditetapkan sebagai peran <strong>PARTNER_ADMIN</strong>.
            </span>
          </div>
        </div>

        {/* Section 1: Profil Utama Lembaga */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Users2 className="w-3.5 h-3.5 text-[#181343]" />
            <span>1. Profil Utama Lembaga</span>
          </div>

          <Input
            label="Nama Yayasan / Lembaga / Komunitas *"
            name="name"
            placeholder="Contoh: Yayasan Konservasi Bahari Nusantara"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Textarea
            label="Profil Singkat & Fokus Isu Dampak Sosial"
            name="description"
            placeholder="Jelaskan visi sosial lembaga, rekam jejak program, dan fokus isu (misalnya: pemberdayaan UMKM pesisir, pendidikan anak pelosok, penanaman mangrove)..."
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Section 2: Kontak Resmi */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-[#181343]" />
            <span>2. Kontak & Komunikasi Resmi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Email Resmi Lembaga"
              name="email"
              type="email"
              placeholder="sekretariat@organisasi.id"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Nomor Telepon / WhatsApp Resmi"
              name="phone"
              placeholder="+62 812 3456 7890"
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Situs Web Resmi / Akun Media Sosial"
            name="website"
            placeholder="https://organisasi.id atau instagram.com/organisasi"
            leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        {/* Section 3: Domisili Sekretariat */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#181343]" />
            <span>3. Domisili & Sekretariat</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Kota / Kabupaten"
              name="city"
              placeholder="Surabaya"
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              label="Provinsi"
              name="province"
              placeholder="Jawa Timur"
              value={formData.province}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Alamat Lengkap Sekretariat"
            name="address"
            placeholder="Jl. Dharmawangsa Indah No. 45, Kecamatan Gubeng..."
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
            className="text-xs font-bold px-5 bg-[#181343] hover:bg-[#231b5e] text-white border-[#181343] cursor-pointer"
            leftIcon={<CheckCircle2 className="w-4 h-4 text-teal-300" />}
          >
            Konfirmasi &amp; Daftarkan Mitra
          </Button>
        </div>
      </form>
    </Modal>
  );
}