"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/ui/app-logo";
import { Badge } from "@/components/ui/badge";
import { UserProfileModal, UserProfileData } from "./UserProfileModal";

interface NavbarProps {
  user: UserProfileData;
  onLogout: () => void;
  onProfileUpdated?: (updatedUser: UserProfileData) => void;
}

export function Navbar({ user, onLogout, onProfileUpdated }: NavbarProps) {
  const [currentUser, setCurrentUser] = useState<UserProfileData>(user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileUpdated = (updated: UserProfileData) => {
    setCurrentUser(updated);
    onProfileUpdated?.(updated);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#DBEAFE]/90">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Sebelah Kiri: Logo SIPENA Terpadu Landing Page */}
          <AppLogo
            size="md"
            theme="light"
            subtitle="Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR"
          />

          {/* Sebelah Kanan: Profil Dropdown & Logout */}
          <div className="flex items-center gap-3" ref={dropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#EDF6FF] transition-colors cursor-pointer select-none border border-transparent hover:border-[#CBE7FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1765F5]"
              >
                <div className="w-8 h-8 rounded-full bg-[#0A2558] text-white flex items-center justify-center font-bold text-xs shadow-2xs overflow-hidden border border-[#CBE7FD] shrink-0">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs sm:text-[13px] font-semibold text-[#0A2558] block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-600 block truncate">
                    {currentUser.position || currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#DBEAFE] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 border-b border-[#DBEAFE]/80 bg-[#F8FBFF]">
                    <p className="text-xs font-bold text-[#0A2558] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-600 truncate">{currentUser.email}</p>
                    <div className="mt-1.5">
                      <Badge variant="blue" size="sm" className="text-[10px] py-0">
                        {currentUser.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#0A2558] hover:bg-[#EDF6FF] hover:text-[#1765F5] rounded-xl transition cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pengaturan Profil</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal Edit Profil Pengguna */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
}
