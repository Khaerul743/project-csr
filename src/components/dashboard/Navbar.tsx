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
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          {/* Sebelah Kiri: Logo SIPENA, Wordmark & Tagline Resmi */}
          <AppLogo
            size="md"
            theme="light"
            subtitle="Petakan Kebutuhan, Pantau Perubahan"
          />

          {/* Sebelah Kanan: Profil Dropdown & Logout */}
          <div className="flex items-center gap-3" ref={dropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-[#181343] text-white flex items-center justify-center font-bold text-xs shadow-2xs overflow-hidden border border-slate-200 shrink-0">
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
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-800 block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {currentUser.position || currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 border-b border-slate-100 bg-slate-50/80">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5">
                      <Badge variant="slate" size="sm" className="text-[10px] py-0">
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
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-[#181343] hover:bg-slate-100 rounded-xl transition cursor-pointer"
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
