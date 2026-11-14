"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  UserCog,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminUserListItem, PaginatedResult } from "../types";
import {
  ENTITY_STATUS_CONFIG,
  USER_ROLE_CONFIG,
  formatDate,
} from "../helpers";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminModal,
  AdminPaginationBar,
} from "../AdminSharedPrimitives";

interface AdminUsersViewProps {
  currentAdminId?: string;
  onMutated?: () => void;
}

export function AdminUsersView({ currentAdminId, onMutated }: AdminUsersViewProps) {
  const [data, setData] = useState<PaginatedResult<AdminUserListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  // Create Super Admin Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // User Status Modal States
  const [editingUser, setEditingUser] = useState<AdminUserListItem | null>(null);
  const [nextStatus, setNextStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">("ACTIVE");
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "15");
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat daftar pengguna");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar pengguna");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewPosition("");
    setNewPhone("");
    setShowNewPassword(false);
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (newName.trim().length < 2) {
      setCreateError("Nama lengkap minimal 2 karakter.");
      return;
    }
    if (!newEmail.trim()) {
      setCreateError("Email wajib diisi.");
      return;
    }
    if (newPassword.length < 8) {
      setCreateError("Kata sandi Super Admin minimal 8 karakter.");
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const res = await fetch("/api/admin/users/super-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          position: newPosition.trim() || null,
          phone: newPhone.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal membuat akun Super Admin");
      }

      setIsCreateOpen(false);
      setBannerSuccess(`Akun Super Admin untuk ${newEmail.trim()} berhasil dibuat.`);
      fetchUsers();
      onMutated?.();
    } catch (err: any) {
      setCreateError(err.message || "Terjadi kesalahan saat membuat akun");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenStatusModal = (u: AdminUserListItem) => {
    setEditingUser(u);
    setNextStatus(u.status);
    setStatusReason("");
    setStatusError(null);
  };

  const handleUpdateUserStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setStatusError(null);

    if (nextStatus === "SUSPENDED" && statusReason.trim().length < 5) {
      setStatusError("Alasan penangguhan akun wajib diisi minimal 5 karakter.");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir.");

      const res = await fetch(`/api/admin/users/${editingUser.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
          reason: statusReason.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memperbarui status pengguna");
      }

      const targetName = editingUser.name;
      setEditingUser(null);
      setBannerSuccess(`Status akun ${targetName} diperbarui menjadi ${nextStatus}.`);
      fetchUsers();
      onMutated?.();
    } catch (err: any) {
      setStatusError(err.message || "Terjadi kesalahan saat mengubah status pengguna");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 w-full">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#181343] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pengguna Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pantau seluruh akun pengguna lintas peran (termasuk akun tertahan di tahap STAGING), kelola akses login, serta tambah Super Admin internal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343] self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          <span>Tambah Super Admin</span>
        </button>
      </div>

      {bannerSuccess && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>{bannerSuccess}</span>
          </span>
          <button
            type="button"
            onClick={() => setBannerSuccess(null)}
            className="min-h-[44px] min-w-[44px] text-xs font-bold text-emerald-800 hover:underline px-3 py-2 rounded-lg"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <label htmlFor="admin-user-search" className="sr-only">
              Cari pengguna sistem
            </label>
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-user-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama lengkap, email, atau jabatan..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="admin-user-role-filter" className="sr-only">
              Filter peran pengguna
            </label>
            <select
              id="admin-user-role-filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
            >
              <option value="ALL">Semua Peran</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MANAGEMENT">Management</option>
              <option value="CSR_ADMIN">CSR Admin</option>
              <option value="PARTNER_ADMIN">Mitra NGO</option>
              <option value="STAGING">Belum Onboarding (STAGING)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="admin-user-status-filter" className="sr-only">
              Filter status pengguna
            </label>
            <select
              id="admin-user-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
            >
              <option value="ALL">Semua Status Akun</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
              <option value="SUSPENDED">Ditangguhkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Views */}
      {isLoading ? (
        <AdminLoadingState message="Memuat daftar akun pengguna sistem..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchUsers} />
      ) : !data || data.data.length === 0 ? (
        <AdminEmptyState
          title="Tidak Ada Pengguna Ditemukan"
          description={
            search || roleFilter !== "ALL" || statusFilter !== "ALL"
              ? "Tidak ada pengguna yang cocok dengan kriteria pencarian Anda."
              : "Belum ada pengguna terdaftar pada sistem."
          }
          actionLabel={
            search || roleFilter !== "ALL" || statusFilter !== "ALL" ? "Reset Filter" : undefined
          }
          onAction={handleResetFilters}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-5">Pengguna</th>
                  <th className="py-3.5 px-4">Peran (Role)</th>
                  <th className="py-3.5 px-4">Organisasi Terhubung</th>
                  <th className="py-3.5 px-4">Terdaftar</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {data.data.map((u) => {
                  const roleCfg = USER_ROLE_CONFIG[u.role] || {
                    label: u.role,
                    variant: "slate" as const,
                  };
                  const statusCfg = ENTITY_STATUS_CONFIG[u.status] || {
                    label: u.status,
                    variant: "slate" as const,
                  };
                  const isSelf = currentAdminId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#181343] text-xs shrink-0 overflow-hidden">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                width={36}
                                height={36}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#181343] truncate">{u.name}</span>
                              {isSelf && (
                                <Badge variant="slate" size="sm">
                                  Akun Anda
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-600 block truncate">
                              {u.email}
                              {u.position ? ` | ${u.position}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={roleCfg.variant} size="sm">
                          {roleCfg.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-slate-700">
                        {u.role === "SUPER_ADMIN" ? (
                          <span className="font-semibold text-[#181343]">Level Platform</span>
                        ) : u.organizationName ? (
                          <div>
                            <span className="font-semibold text-[#181343] block truncate max-w-[200px]">
                              {u.organizationName}
                            </span>
                            <span className="text-[11px] text-slate-600">
                              {u.organizationType === "COMPANY" ? "Perusahaan" : "Mitra NGO"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-800 font-medium">Belum terhubung</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600">{formatDate(u.createdAt)}</td>
                      <td className="py-4 px-4">
                        <Badge variant={statusCfg.variant} size="sm" hasDot>
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(u)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "Akun yang sedang aktif digunakan tidak dapat diubah statusnya"
                              : `Kelola status akun ${u.name}`
                          }
                          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-45 text-xs font-semibold text-[#181343] inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                        >
                          <UserCog className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Kelola Akses</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.data.map((u) => {
              const roleCfg = USER_ROLE_CONFIG[u.role] || {
                label: u.role,
                variant: "slate" as const,
              };
              const statusCfg = ENTITY_STATUS_CONFIG[u.status] || {
                label: u.status,
                variant: "slate" as const,
              };
              const isSelf = currentAdminId === u.id;

              return (
                <div
                  key={u.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#181343] truncate">
                        {u.name} {isSelf ? "(Anda)" : ""}
                      </h3>
                      <p className="text-xs text-slate-600 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={roleCfg.variant} size="sm">
                      {roleCfg.label}
                    </Badge>
                    <Badge variant={statusCfg.variant} size="sm" hasDot>
                      {statusCfg.label}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-700 pt-2 border-t border-slate-100 space-y-1">
                    <div>
                      Organisasi:{" "}
                      <span className="font-semibold text-[#181343]">
                        {u.role === "SUPER_ADMIN"
                          ? "Level Platform"
                          : u.organizationName || "Belum terhubung"}
                      </span>
                    </div>
                    <div className="text-slate-600">Terdaftar: {formatDate(u.createdAt)}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenStatusModal(u)}
                    disabled={isSelf}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-45 text-xs font-semibold text-[#181343] inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181343]"
                  >
                    <UserCog className="w-4 h-4" aria-hidden="true" />
                    <span>{isSelf ? "Akun Anda Sedang Aktif" : "Kelola Status Akses"}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <AdminPaginationBar
            page={data.page}
            limit={data.limit}
            total={data.total}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modal Tambah Super Admin */}
      <AdminModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Akun Super Admin Baru"
        subtitle="Akun ini memiliki akses pengawasan penuh lintas organisasi di platform SIPENA."
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
          {createError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{createError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="sa-name" className="block text-xs font-bold text-[#181343]">
              Nama Lengkap *
            </label>
            <input
              id="sa-name"
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama lengkap pengelola"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sa-email" className="block text-xs font-bold text-[#181343]">
              Email Resmi *
            </label>
            <input
              id="sa-email"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@sipena.id"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sa-password" className="block text-xs font-bold text-[#181343]">
              Kata Sandi Sementara (Minimal 8 Karakter) *
            </label>
            <div className="relative">
              <input
                id="sa-password"
                type={showNewPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter kombinasi huruf dan angka"
                className="w-full min-h-[44px] pl-3.5 pr-12 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center absolute right-0 top-0 text-slate-600 hover:text-[#181343]"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="sa-position" className="block text-xs font-bold text-[#181343]">
                Jabatan (Opsional)
              </label>
              <input
                id="sa-position"
                type="text"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="Platform Super Admin"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sa-phone" className="block text-xs font-bold text-[#181343]">
                Nomor Telepon (Opsional)
              </label>
              <input
                id="sa-phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Nomor telepon aktif"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-60"
            >
              {isCreating ? (
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{isCreating ? "Membuat Akun..." : "Buat Akun Super Admin"}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Modal Ubah Status Pengguna */}
      <AdminModal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Kelola Status Akses Pengguna"
        subtitle={editingUser ? `${editingUser.name} (${editingUser.email})` : undefined}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleUpdateUserStatus} className="space-y-4">
          {statusError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{statusError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="user-status-select" className="block text-xs font-bold text-[#181343]">
              Status Akun Pengguna
            </label>
            <select
              id="user-status-select"
              value={nextStatus}
              onChange={(e) =>
                setNextStatus(e.target.value as "ACTIVE" | "INACTIVE" | "SUSPENDED")
              }
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#181343] focus:outline-none focus:ring-2 focus:ring-[#181343]"
            >
              <option value="ACTIVE">Aktif (Login diizinkan)</option>
              <option value="INACTIVE">Nonaktif (Sementara tidak dapat login)</option>
              <option value="SUSPENDED">Ditangguhkan (SUSPENDED)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="user-status-reason" className="block text-xs font-bold text-[#181343]">
              Alasan Perubahan Status {nextStatus === "SUSPENDED" ? "(Wajib diisi)" : "(Opsional)"}
            </label>
            <textarea
              id="user-status-reason"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              rows={3}
              placeholder="Catat alasan administratif yang akan tersimpan di log audit..."
              className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs text-[#181343] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#181343] resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              disabled={isUpdatingStatus}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUpdatingStatus}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#181343] hover:bg-[#26224C] text-white text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-60"
            >
              {isUpdatingStatus ? (
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{isUpdatingStatus ? "Menyimpan..." : "Simpan Status"}</span>
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

