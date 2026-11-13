"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  disabled?: boolean;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  className?: string;
  id?: string;
}

export function SearchableSelect({
  label,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari wilayah...",
  value,
  onChange,
  options,
  disabled = false,
  helperText,
  error,
  leftIcon,
  className = "",
  id,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search query
  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const lowerQuery = query.toLowerCase();
    return options.filter((item) => item.toLowerCase().includes(lowerQuery));
  }, [options, query]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

      // Pre-highlight selected value if present
      if (value) {
        const idx = filtered.indexOf(value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      } else {
        setHighlightedIndex(0);
      }
    } else {
      setQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen, filtered, value]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        if (!disabled) setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1 >= filtered.length ? 0 : prev + 1;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1 < 0 ? filtered.length - 1 : prev - 1;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        onChange(filtered[highlightedIndex]);
        setIsOpen(false);
        setQuery("");
      }
    }
  };

  const scrollIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLButtonElement>("[data-select-item]");
    if (items[index]) {
      items[index].scrollIntoView({ block: "nearest" });
    }
  };

  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div
      className={`w-full flex flex-col gap-1.5 relative ${className}`}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 tracking-wide select-none"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
            {leftIcon}
          </div>
        )}

        <button
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full text-left text-xs sm:text-sm rounded-2xl border transition-all duration-200 outline-none flex items-center justify-between py-3 ${
            leftIcon ? "pl-10" : "pl-4"
          } pr-4 ${
            disabled
              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed select-none"
              : isOpen
              ? "bg-white border-slate-800 ring-1 ring-slate-800/10 text-[#181343] shadow-xs cursor-pointer"
              : error
              ? "bg-white border-rose-400 hover:border-rose-500 text-[#181343] cursor-pointer"
              : "bg-white border-slate-200 hover:border-slate-300 text-[#181343] cursor-pointer"
          }`}
        >
          <span
            className={`truncate block ${
              value ? "font-medium text-[#181343]" : "text-slate-400 font-normal"
            }`}
          >
            {value || placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-slate-800" : ""
            }`}
          />
        </button>
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 leading-normal mt-0.5">{helperText}</p>
      ) : null}

      {/* Popover Dropdown List (z-50) */}
      {isOpen && !disabled && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 z-50 overflow-hidden animate-in fade-in duration-150"
          role="listbox"
        >
          {/* Search Input Bar */}
          <div className="p-2.5 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none text-[#181343] placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              />
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 text-xs sm:text-sm [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs italic">
                Wilayah tidak ditemukan
              </div>
            ) : (
              filtered.map((item, index) => {
                const isSelected = item === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={item}
                    data-select-item
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(item);
                      setIsOpen(false);
                      setQuery("");
                      setHighlightedIndex(-1);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-slate-100 text-[#181343] font-semibold"
                        : isHighlighted
                        ? "bg-slate-50 text-[#181343]"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate">{item}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    )}
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
