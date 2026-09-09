"use client";
import { useId } from "react";
import { Input } from "@/components/ui/input";
import { useLookup } from "../hooks/useLookup";
export function RecordLookup({
  kind,
  value,
  onChange,
  label,
}: {
  kind: "products" | "customers" | "orders";
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const id = useId();
  const query = useLookup(kind, value);
  return (
    <label className="block text-xs font-medium">
      {label}
      <Input
        className="mt-2"
        list={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete="off"
      />
      <datalist id={id}>
        {query.data?.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </datalist>
      {query.isFetching && (
        <span className="text-neutral-500">กำลังค้นหา…</span>
      )}
      {query.isError && (
        <span className="block text-neutral-600">{query.error.message}</span>
      )}
    </label>
  );
}
