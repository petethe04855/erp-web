"use client";
import { Select } from "@/components/ui/select";
import { useLookup } from "../hooks/useLookup";
import type { CustomerRecord } from "@/types/records";
import { MapPin, FileText, Phone, Mail, User } from "lucide-react";

export function RecordLookup({
  kind,
  value,
  onChange,
  label,
  showDetails = true,
}: {
  kind: "products" | "customers" | "orders";
  value: string;
  onChange: (value: string, selectedRecord?: unknown) => void;
  label: string;
  showDetails?: boolean;
}) {
  const query = useLookup(kind, "");

  const placeholderText =
    kind === "customers"
      ? "-- เลือกลูกค้า --"
      : kind === "orders"
        ? "-- เลือกใบสั่งขาย (Sales Order) --"
        : "-- เลือกสินค้า --";

  const selectedItem = query.data?.find((r) => r.value === value);
  const customer = (kind === "customers" && selectedItem?.record) as CustomerRecord | undefined;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-neutral-800 dark:text-neutral-200">
        {label && <span>{label}</span>}
        <div className={label ? "mt-1.5" : ""}>
          <Select
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              const matched = query.data?.find((r) => r.value === val);
              onChange(val, matched?.record);
            }}
            required
          >
            <option value="">{query.isLoading ? "กำลังโหลดข้อมูล..." : placeholderText}</option>
            {query.data?.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>
        {query.isError && (
          <span className="mt-1 block text-[11px] text-rose-500">
            โหลดข้อมูลไม่สำเร็จ: {query.error.message}
          </span>
        )}
      </label>

      {/* Customer Details Display Card */}
      {showDetails && customer && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-3 text-xs space-y-1.5 dark:border-neutral-800 dark:bg-neutral-900/60 transition-all">
          <div className="flex items-center justify-between border-b border-neutral-200/60 pb-1.5 mb-1.5 dark:border-neutral-800">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-500" />
              {customer.name}
            </span>
            {customer.taxId ? (
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 flex items-center gap-1 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                <FileText className="h-3 w-3 text-neutral-500" />
                เลขผู้เสียภาษี: {customer.taxId}
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400">ไม่มีเลขผู้เสียภาษี</span>
            )}
          </div>

          {customer.address && (
            <div className="flex items-start gap-1.5 text-neutral-600 dark:text-neutral-400">
              <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{customer.address}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-neutral-500">
            {customer.contactPerson && customer.contactPerson !== customer.name && (
              <div className="flex items-center gap-1">
                <span className="text-neutral-400">ผู้ติดต่อ:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{customer.contactPerson}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-neutral-400" />
                <span className="font-mono text-neutral-700 dark:text-neutral-300">{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-neutral-400" />
                <span className="text-neutral-700 dark:text-neutral-300">{customer.email}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
