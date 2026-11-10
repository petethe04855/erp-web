"use client";
import { useMemo } from "react";

/**
 * Live password-policy feedback: while the user types, list every rule that
 * is not satisfied yet in red. Hidden while the field is empty or once all
 * rules pass, so it never blocks the initial render of the form.
 */
export function PasswordHints({ password }: { password: string }) {
  const hints = useMemo<string[]>(() => {
    const list: string[] = [];
    if (password.length < 6) list.push("มีความยาวอย่างน้อย 6 ตัวอักษร");
    if (!/[A-Z]/.test(password)) list.push("มีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว");
    if (!/[a-z]/.test(password)) list.push("มีตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว");
    return list;
  }, [password]);

  if (!password || hints.length === 0) return null;
  return (
    <div
      role="alert"
      className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-700"
    >
      <p className="font-medium">รหัสผ่านยังไม่ตรงเงื่อนไข:</p>
      <ul className="mt-0.5 list-disc pl-4">
        {hints.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>
    </div>
  );
}
