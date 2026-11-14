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

const INPUT_BASE_CLASS =
  "w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#64748B] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium";

const PASSWORD_INPUT_CLASS =
  "w-full h-11 pl-10 pr-11 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[14px] text-[#181343] placeholder:text-[#64748B] focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#181343] focus-visible:ring-2 focus-visible:ring-[#181343]/15 transition-all font-medium";

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);

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

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, user, onClose]);

  if (!isOpen) return null;

  // Handle Avatar Upload
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMsg("Ukuran foto maksimal 5MB");
      return;
    }

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
      case "SUPER_ADMIN":
        return <Badge variant="navy" hasDot>Super Admin</Badge>;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden my-auto transition-all animate-in zoom-in-95 duration-200 z-10"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal Bersih & Terpadu */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#181343] tracking-tight">
              Pengaturan Profil Akun
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Kelola informasi akun personal dan kredensial keamanan Anda
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Tutup modal profil"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Segmented Control */}
        <div className="px-6 pt-3 pb-2.5 border-b border-slate-100 bg-[#F9F9FB] shrink-0">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/60 gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "profile"
                  ? "bg-white text-[#181343] shadow-xs"
                  : "text-[#64748B] hover:text-[#181343]"
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Biodata Personal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "security"
                  ? "bg-white text-[#181343] shadow-xs"
                  : "text-[#64748B] hover:text-[#181343]"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Keamanan & Kata Sandi</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: BIODATA & PROFIL */}
          {activeTab === "profile" && (
            <form id="user-profile-form" onSubmit={handleSaveProfile} className="space-y-4">
              {profileSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{profileErrorMsg}</span>
                </div>
              )}

              {/* Avatar Photo Section */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#181343] text-white overflow-hidden flex items-center justify-center font-bold text-xl select-none shadow-xs">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name || "Avatar"}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{name ? name.charAt(0).toUpperCase() : "U"}</span>
                    )}
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-full bg-slate-900/60 flex items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#181343]">
                      Foto Profil Personal
                    </span>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    JPG, PNG, atau WEBP. Maksimal 5MB.
                  </p>
                  <div className="pt-0.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarSelect}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#181343] bg-white border border-[#CBD5E1] hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{avatarUrl ? "Ganti Foto" : "Unggah Foto"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Input: Nama Lengkap */}
              <div>
                <label htmlFor="profile-fullname" className="block text-[13px] font-semibold text-[#181343] mb-1.5">
                  Nama Lengkap <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                  <input
                    id="profile-fullname"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={INPUT_BASE_CLASS}
                  />
                </div>
              </div>

              {/* Grid 2 Kolom: Telepon & Posisi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Nomor Telepon */}
                <div>
                  <label htmlFor="profile-phone" className="block text-[13px] font-semibold text-[#181343] mb-1.5">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                    <input
                      id="profile-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                      className={INPUT_BASE_CLASS}
                    />
                  </div>
                </div>

                {/* Jabatan / Posisi */}
                <div>
                  <label htmlFor="profile-position" className="block text-[13px] font-semibold text-[#181343] mb-1.5">
                    Jabatan / Posisi
                  </label>
                  <div className="relative flex items-center">
                    <Briefcase className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                    <input
                      id="profile-position"
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Contoh: CSR Specialist"
                      className={INPUT_BASE_CLASS}
                    />
                  </div>
                </div>
              </div>

              {/* Email (Read-only) & Role Info */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Akun:</span>
                  </div>
                  <span className="font-semibold text-[#181343]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]/80">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Peran Akses:</span>
                  </div>
                  <div>{getRoleBadge(user.role)}</div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: KEAMANAN & PASSWORD */}
          {activeTab === "security" && (
            <form id="user-password-form" onSubmit={handleSavePassword} className="space-y-4">
              {passwordSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{passwordErrorMsg}</span>
                </div>
              )}

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-[#47464F] leading-relaxed">
                <Lock className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
                <p>
                  Gunakan minimal 6 karakter kombinasi huruf dan angka untuk menjaga keamanan akun Anda.
                </p>
              </div>

              {/* Kata Sandi Saat Ini */}
              <div>
                <label htmlFor="security-current-password" className="block text-[13px] font-semibold text-[#181343] mb-1.5">
                  Kata Sandi Saat Ini <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                  <input
                    id="security-current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama"
                    className={PASSWORD_INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-1.5 inline-flex items-center justify-center min-w-[36px] min-h-[36px] text-[#64748B] hover:text-[#181343] rounded-lg transition-colors cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div>
                <label htmlFor="security-new-password" className="block text-[13px] font-semibold text-[#181343] mb-1.5">
                  Kata Sandi Baru <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                  <input
                    id="security-new-password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className={PASSWORD_INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-1.5 inline-flex items-center justify-center min-w-[36px] min-h-[36px] text-[#64748B] hover:text-[#181343] rounded-lg transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div>
                <label htmlFor="security-confirm-password" className="block text-[13px] font-semibold text-[#181343] mb-1.5">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                  <input
                    id="security-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className={PASSWORD_INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-1.5 inline-flex items-center justify-center min-w-[36px] min-h-[36px] text-[#64748B] hover:text-[#181343] rounded-lg transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0 flex items-center justify-between rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#47464F] hover:text-[#181343] hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          {activeTab === "profile" ? (
            <button
              form="user-profile-form"
              type="submit"
              disabled={isSavingProfile || isUploadingAvatar}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#181343] hover:bg-[#26224C] active:bg-[#110D30] transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          ) : (
            <button
              form="user-password-form"
              type="submit"
              disabled={isSavingPassword}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#181343] hover:bg-[#26224C] active:bg-[#110D30] transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memperbarui...</span>
                </>
              ) : (
                <span>Perbarui Kata Sandi</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
