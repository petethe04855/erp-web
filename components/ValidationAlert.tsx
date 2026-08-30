"use client";

/** Standard form-validation feedback, matching the SKU Master form. */
export function ValidationAlert({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-3.5 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600"
    >
      {message}
    </div>
  );
}
