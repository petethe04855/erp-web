export type LiveSessionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LivePlatform = "TIKTOK" | "SHOPEE" | "LAZADA";

export interface AuditEvent {
  action: string;
  by: string;
  at: string;
  note?: string;
}

export interface LiveStaffUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LiveSession {
  id: number;
  session_no: string;
  staff_id: number;
  staff?: LiveStaffUser;
  live_date: string; // YYYY-MM-DD
  platform: LivePlatform;
  tiktok_account?: string;
  start_datetime: string; // ISO string
  end_datetime: string;   // ISO string
  break_minutes: number;
  revenue_generated: number;
  has_clip: boolean;
  clip_link?: string;
  live_summary_image?: string;
  host_notes?: string;
  status: LiveSessionStatus;
  approved_by?: number;
  rejection_reason?: string;
  created_by?: string;
  updated_by?: string;
  audit_trail?: string; // JSON string of AuditEvent[]
  created_at?: string;
  updated_at?: string;
}

export type ContentKind = "SCHEDULED" | "PUBLISHED";

export interface ContentItem {
  id: number;
  kind: ContentKind;
  title: string;
  platform: string;
  scheduled_for?: string | null;
  published_at?: string | null;
  host_id?: number | null;
  host?: LiveStaffUser;
  host_name?: string;
  reach: number;
  engagement_pct: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export type RoundingPolicy = "actual" | "quarter_up" | "up10" | "up30";

export interface PayrollRow {
  staff_id: number;
  staff_name: string;
  approved_sessions_count: number;
  total_net_minutes: number;
  rounded_minutes: number;
  decimal_hours: number;
  hourly_rate: number;
  base_pay: number;
  clip_bonus_count: number;
  clip_bonus_rate: number;
  clip_bonus_pay: number;
  total_pay: number;
}

export interface PayrollSummary {
  month: string;
  rounding_policy: string;
  total_hours: number;
  total_pay: number;
  total_clips: number;
  staff_payroll: PayrollRow[];
}

export interface CreateLiveSessionDTO {
  staff_id: number;
  live_date?: string;
  platform: LivePlatform;
  tiktok_account?: string;
  start_datetime: string;
  end_datetime: string;
  break_minutes: number;
  revenue_generated: number;
  has_clip: boolean;
  clip_link?: string;
  live_summary_image?: string;
  host_notes?: string;
}

export interface UpdateLiveSessionDTO {
  platform: LivePlatform;
  tiktok_account?: string;
  start_datetime: string;
  end_datetime: string;
  break_minutes: number;
  revenue_generated: number;
  has_clip: boolean;
  clip_link?: string;
  live_summary_image?: string;
  host_notes?: string;
}

export interface CreateContentItemDTO {
  kind: ContentKind;
  title: string;
  platform: string;
  scheduled_for?: string | null;
  published_at?: string | null;
  host_id?: number | null;
  host_name?: string;
  reach?: number;
  engagement_pct?: number;
  notes?: string;
}

export interface UpdateContentItemDTO {
  title: string;
  platform: string;
  scheduled_for?: string | null;
  published_at?: string | null;
  host_id?: number | null;
  host_name?: string;
  reach?: number;
  engagement_pct?: number;
  notes?: string;
}
