"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface QuickLookupOption {
  id: string | number;
  title: string;
  subtitle?: string;
  badge?: string;
  extra?: string;
  /** Optional domain payload carried by the caller; typed loosely on purpose. */
  data?: Record<string, unknown>;
}

export interface QuickLookupProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  selectedDisplay?: string;
  onChange: (value: string | number, selectedOption?: QuickLookupOption) => void;
  onSearch: (query: string) => Promise<QuickLookupOption[]>;
  disabled?: boolean;
  className?: string;
}

export function QuickLookup({
  label,
  placeholder = "พิมพ์เพื่อค้นหา...",
  value,
  selectedDisplay,
  onChange,
  onSearch,
  disabled = false,
  className = "",
}: QuickLookupProps) {
  const [query, setQuery] = useState(selectedDisplay || "");
  const [options, setOptions] = useState<QuickLookupOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  // Monotonic token guarding against out-of-order responses: only the most
  // recent search may write results/loading state.
  const searchTokenRef = useRef(0);

  // Sync query when external selectedDisplay changes: adjust state during
  // render (React docs pattern) instead of setState-in-effect.
  const [prevDisplay, setPrevDisplay] = useState(selectedDisplay);
  if (selectedDisplay !== prevDisplay) {
    setPrevDisplay(selectedDisplay);
    if (selectedDisplay !== undefined) {
      setQuery(selectedDisplay);
    }
  }

  // Reset highlight whenever the option list changes
  const optionsSignature = options.map((o) => String(o.id)).join("|");
  const [prevOptionsSignature, setPrevOptionsSignature] = useState(optionsSignature);
  if (prevOptionsSignature !== optionsSignature) {
    setPrevOptionsSignature(optionsSignature);
    setHighlightIndex(-1);
  }

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      const token = ++searchTokenRef.current;
      setIsLoading(true);
      try {
        const results = await onSearch(query);
        if (token !== searchTokenRef.current) return; // stale response
        setOptions(results);
      } catch (err) {
        console.error("QuickLookup search error:", err);
        if (token !== searchTokenRef.current) return; // stale response
        setOptions([]);
      } finally {
        if (token === searchTokenRef.current) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, onSearch]);

  const handleSelect = (opt: QuickLookupOption) => {
    onChange(opt.id, opt);
    setQuery(opt.title);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("", undefined);
    setQuery("");
    setOptions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < options.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < options.length) {
        handleSelect(options[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}

      <div className="relative">
        <Input
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="pr-16 text-sm"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 space-x-1 text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : query && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="ล้างค่า"
            >
              <X className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600" />
            </button>
          ) : (
            <Search className="h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white p-1 text-sm shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          {isLoading && options.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>กำลังค้นหา...</span>
            </div>
          ) : options.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              ไม่พบผลลัพธ์ที่ตรงกัน
            </div>
          ) : (
            <ul className="space-y-0.5">
              {options.map((opt, idx) => {
                const isSelected = String(opt.id) === String(value);
                const isHighlighted = idx === highlightIndex;

                return (
                  <li
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : isHighlighted
                          ? "bg-neutral-100 dark:bg-neutral-800 text-foreground"
                          : "text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold truncate">
                          {opt.title}
                        </span>
                        {opt.badge && (
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.subtitle && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {opt.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {opt.extra && (
                        <span className="font-medium tabular-nums text-neutral-800 dark:text-neutral-200">
                          {opt.extra}
                        </span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
