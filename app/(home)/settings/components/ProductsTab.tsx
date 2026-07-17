"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/design/ThemeContext";

interface ProductsTabProps {
  categories: string[];
  onAddCategory: (cat: string) => void;
  onRemoveCategory: (index: number) => void;
}

export function ProductsTab({
  categories,
  onAddCategory,
  onRemoveCategory,
}: ProductsTabProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [newCat, setNewCat] = useState("");

  const handleAdd = () => {
    if (newCat.trim()) {
      onAddCategory(newCat.trim());
      setNewCat("");
    }
  };

  return (
    <div>
      <div className="text-sm font-bold text-foreground mb-4" style={{ color: "var(--erp-ink)" }}>
        หมวดหมู่สินค้า
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="ชื่อหมวดหมู่ใหม่..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAdd();
            }
          }}
        />
        <Button onClick={handleAdd} className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none">
          + เพิ่ม
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            style={{ borderColor: "var(--erp-border)" }}
          >
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "var(--erp-accent)" }}
            >
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-medium" style={{ color: "var(--erp-ink)" }}>
              {cat}
            </span>
            <button
              onClick={() => onRemoveCategory(i)}
              className="bg-transparent border-none cursor-pointer text-lg font-bold text-red-500 hover:text-red-600 px-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
