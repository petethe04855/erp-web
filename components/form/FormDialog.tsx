"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  isSubmitting,
  children,
  zIndex,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: () => Promise<unknown>;
  isSubmitting?: boolean;
  children: React.ReactNode;
  zIndex?: number;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      zIndex={zIndex}
      onOpenChange={(v) => {
        if (!busy) {
          setError("");
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClose={() => {
          if (!busy) onOpenChange(false);
        }}
        className="max-h-[85vh] overflow-y-auto"
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-2 mb-6">
          {description}
        </DialogDescription>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);
            try {
              await onSubmit();
              onOpenChange(false);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "ทำรายการไม่สำเร็จ",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <fieldset className="space-y-4" disabled={busy || isSubmitting}>
            {children}
          </fieldset>
          {error && (
            <p
              role="alert"
              className="border border-neutral-300 bg-neutral-100 p-3 text-sm"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button disabled={busy || isSubmitting}>
              {busy || isSubmitting ? "กำลังบันทึก…" : "บันทึก"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
