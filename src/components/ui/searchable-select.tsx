"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface SearchableSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  disabled?: boolean;
  helperText?: string;
  className?: string;
}

export function SearchableSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  disabled = false,
  helperText,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`} ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-700">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition ${
          disabled
            ? "bg-slate-100 border-[#E8E8EA] text-slate-400 cursor-not-allowed"
            : isOpen
            ? "bg-white border-[#181343] ring-2 ring-[#181343]/10 text-slate-900 shadow-2xs"
            : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 cursor-pointer"
        }`}
      >
        <span className={value ? "font-semibold text-slate-900" : "text-slate-400 font-normal"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}

      {/* Popover list */}
      {isOpen && !disabled && (
        <div className="absolute top-[100%] left-0 right-0 mt-1.5 bg-white border border-[#E8E8EA] rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in duration-150">
          <div className="p-2 border-b border-[#E8E8EA] bg-[#F9F9FB]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Cari wilayah..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E8E8EA] rounded-lg outline-none focus:border-[#181343]/40"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 text-xs">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs italic">
                Wilayah tidak ditemukan
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = item === value;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onChange(item);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-3.5 py-2 transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#181343] text-white font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

