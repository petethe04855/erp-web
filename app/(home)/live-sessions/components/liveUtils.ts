import { liveStaff } from "@/lib/mockData";

export function dateLabel(v: string) {
  if (!v) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
  }).format(new Date(v));
}

export function timeLabel(v: string) {
  if (!v) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(v));
}

export function getStaffName(id: string) {
  return liveStaff.find((s) => s.id === id)?.name ?? id;
}

export function calcDuration(start: string, end: string): string | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60; // Support overnight live streams
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 && m > 0
    ? `${h} ชม. ${m} นาที`
    : h > 0
      ? `${h} ชม.`
      : `${m} นาที`;
}
