import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const val = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(val)) return "0.00";
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatThaiDateTime(
  dateInput?: string | Date | null,
  options?: { includeTime?: boolean }
): string {
  if (!dateInput) return "-";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "-";

  const includeTime = options?.includeTime ?? true;

  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }).format(d);
}

export function getImageUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const configured = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const origin = configured.replace(/\/api(?:\/v1)?\/?$/, "").replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${cleanPath}`;
}

/**
 * Validates and sanitizes internal redirect URLs to prevent open redirect vulnerabilities (WEB-TS-01).
 * Rejects protocol-relative URLs (e.g., `//evil.com`), backslashes, control characters, or external origins.
 */
export function sanitizeRedirectPath(path: string | null | undefined, defaultPath: string = "/dashboard"): string {
  if (!path || typeof path !== "string") {
    return defaultPath;
  }
  const trimmed = path.trim();
  // Must start with exactly one '/' and not contain backslashes or protocol-relative '//'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return defaultPath;
  }
  try {
    // Parse using dummy base to ensure origin matches and pathname is legitimate
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return defaultPath;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return defaultPath;
  }
}
