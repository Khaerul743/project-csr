"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User as UserIcon,
  Camera,
  Trash2,
  Lock,
  Phone,
  Briefcase,
  Mail,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  companyId?: string | null;
  partnerId?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  position?: string | null;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileData;
  onProfileUpdated: (updatedUser: UserProfileData) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile Form States
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [position, setPosition] = useState(user.position || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setPosition(user.position || "");
      setAvatarUrl(user.avatarUrl || null);
      setProfileSuccessMsg(null);
      setProfileErrorMsg(null);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSuccessMsg(null);
      setPasswordErrorMsg(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Handle Avatar Upload
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMsg("Ukuran foto maksimal 5MB");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setProfileErrorMsg("Format foto harus JPG, PNG, atau WEBP");
      return;
    }

    setIsUploadingAvatar(true);
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Silakan login kembali.");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengunggah foto profil");
      }

      setAvatarUrl(json.data.url);
    } catch (err: any) {
      setProfileErrorMsg(err.message || "Terjadi kesalahan saat mengunggah foto");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
  };

  // Handle Save Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    if (!name.trim()) {
      setProfileErrorMsg("Nama lengkap wajib diisi");
      return;
    }

    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Silakan login kembali.");

      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        position: position.trim() || null,
        avatarUrl: avatarUrl || null,
      };

      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui profil");
      }

      setProfileSuccessMsg("Profil berhasil disimpan");
      const updatedUser: UserProfileData = {
        ...user,
        ...json.data,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onProfileUpdated(updatedUser);

      setTimeout(() => {
        setProfileSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setProfileErrorMsg(err.message || "Terjadi kesalahan saat menyimpan profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Save Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (!currentPassword) {
      setPasswordErrorMsg("Kata sandi saat ini wajib diisi");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErrorMsg("Kata sandi baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMsg("Konfirmasi kata sandi baru tidak sesuai");
      return;
    }

    setIsSavingPassword(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Silakan login kembali.");

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengubah kata sandi");
      }

      setPasswordSuccessMsg("Kata sandi berhasil diperbarui");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setTimeout(() => {
        setPasswordSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setPasswordErrorMsg(err.message || "Terjadi kesalahan saat mengubah kata sandi");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "CSR_ADMIN":
        return <Badge variant="navy">CSR Admin</Badge>;
      case "MANAGEMENT":
        return <Badge variant="emerald">Management</Badge>;
      case "PARTNER_ADMIN":
        return <Badge variant="purple">Partner Admin</Badge>;
      default:
        return <Badge variant="slate">{role}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Pengaturan Profil Akun
              </h2>
              <p className="text-xs text-slate-300">
                Kelola informasi akun personal dan kredensial keamanan Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal profil"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`min-h-[44px] px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "profile"
                ? "border-[#181343] text-[#181343]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Biodata Personal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`min-h-[44px] px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "security"
                ? "border-[#181343] text-[#181343]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Keamanan & Kata Sandi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: BIODATA & PROFIL */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{profileErrorMsg}</span>
                </div>
              )}

              {/* Avatar Photo Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-white shadow-md overflow-hidden flex items-center justify-center text-[#181343] font-bold text-2xl select-none">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name || "Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{name ? name.charAt(0).toUpperCase() : "U"}</span>
                    )}
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-full bg-slate-900/60 flex items-center justify-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Foto Profil Personal
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Format didukung JPG, PNG, atau WEBP. Ukuran file maksimal 5MB.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarSelect}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="min-h-[44px] text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-white cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      {avatarUrl ? "Ganti Foto" : "Unggah Foto"}
                    </Button>

                    {avatarUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                        className="min-h-[44px] text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" />
                        Hapus Foto
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Input: Nama Lengkap */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#181343] focus:ring-1 focus:ring-[#181343] font-medium"
                  />
                </div>
              </div>

              {/* Grid 2 Kolom: Telepon & Posisi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nomor Telepon */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#181343] focus:ring-1 focus:ring-[#181343]"
                    />
                  </div>
                </div>

                {/* Jabatan / Posisi */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Jabatan / Posisi
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Contoh: CSR Specialist"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#181343] focus:ring-1 focus:ring-[#181343]"
                    />
                  </div>
                </div>
              </div>

              {/* Email (Read-only) & Role Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Akun:</span>
                  </div>
                  <span className="font-semibold text-slate-800">{user.email}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Peran Akses:</span>
                  </div>
                  <div>{getRoleBadge(user.role)}</div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSavingProfile || isUploadingAvatar}
                  className="min-h-[44px] bg-[#181343] hover:bg-[#251e66] text-white text-xs sm:text-sm font-semibold rounded-xl px-5 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan Profil</span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: KEAMANAN & PASSWORD */}
          {activeTab === "security" && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              {passwordSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{passwordErrorMsg}</span>
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed">
                Pastikan menggunakan kata sandi yang kuat dengan minimal 6 karakter kombinasi huruf dan angka.
              </p>

              {/* Kata Sandi Saat Ini */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#181343] focus:ring-1 focus:ring-[#181343]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="min-w-[44px] min-h-[44px] absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#181343] focus:ring-1 focus:ring-[#181343]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="min-w-[44px] min-h-[44px] absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#181343] focus:ring-1 focus:ring-[#181343]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="min-w-[44px] min-h-[44px] absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSavingPassword}
                  className="min-h-[44px] bg-[#181343] hover:bg-[#251e66] text-white text-xs sm:text-sm font-semibold rounded-xl px-5 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Perbarui Kata Sandi</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
