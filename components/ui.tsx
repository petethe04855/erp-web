"use client";
import type { DesignTokens } from "@/lib/design/tokens";
import { Button } from "@/components/ui/button";
import { Card as CardPrimitive } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export { Badge } from "@/components/ui/badge";
export { Checkbox } from "@/components/ui/checkbox";
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

// ── TopBar ──────────────────────────────────────────────────────────────────

interface TopBarProps {
  t: DesignTokens;
  title: string;
  subtitle?: React.ReactNode;
  breadcrumb?: string[];
  right?: React.ReactNode;
}

export function TopBar({ t, title, subtitle, breadcrumb, right }: TopBarProps) {
  const c = t.color;
  return (
    <div
      style={{
        borderBottom: `1px solid ${c.border}`,
        background: c.canvas,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: "14px 32px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: c.ink3,
            fontFamily: t.font.sans,
          }}
        >
          {(breadcrumb ?? ["Chawy ERP"]).map((b, i, arr) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ color: i === arr.length - 1 ? c.ink2 : c.ink3 }}>
                {b}
              </span>
              {i < arr.length - 1 && <span style={{ color: c.ink4 }}>/</span>}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {right}
        </div>
      </div>
      <div
        style={{
          padding: "8px 32px 20px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: c.ink,
              margin: 0,
              lineHeight: 1.15,
              fontFamily: t.font.sans,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <div
              style={{
                fontSize: 13,
                color: c.ink3,
                marginTop: 4,
                fontFamily: t.font.sans,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PageBody ────────────────────────────────────────────────────────────────

interface PageBodyProps {
  t: DesignTokens;
  children: React.ReactNode;
  maxWidth?: number | string;
  style?: React.CSSProperties;
}

export function PageBody({
  t,
  children,
  maxWidth = 1320,
  style,
}: PageBodyProps) {
  return (
    <div
      style={{
        padding: "24px 32px 40px",
        maxWidth,
        margin: maxWidth === "none" ? 0 : "0 auto",
        color: t.color.ink,
        fontFamily: t.font.sans,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  t: DesignTokens;
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: boolean;
  className?: string;
}

export function Card({ t, children, style, pad = true, className }: CardProps) {
  return (
    <CardPrimitive
      className={className}
      style={{
        borderRadius: t.radius,
        padding: pad ? 20 : 0,
        ...style,
      }}
    >
      {children}
    </CardPrimitive>
  );
}

// ── Premium Stat Strip ──────────────────────────────────────────────────────

interface StatStripTile {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: string;
}

export function StatStrip({
  t,
  tiles,
  style,
}: {
  t: DesignTokens;
  tiles: StatStripTile[];
  style?: React.CSSProperties;
}) {
  const c = t.color;
  return (
    <Card
      t={t}
      pad={false}
      style={{ marginBottom: 16, overflow: "hidden", ...style }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((tile, i) => (
          <div
            key={tile.label}
            style={{
              padding: "16px 22px",
              borderRight:
                i < tiles.length - 1 ? `1px solid ${c.border}` : "none",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: c.ink3,
              }}
            >
              {tile.label}
            </div>
            <Mono
              t={t}
              size={20}
              weight={600}
              color={tile.tone ?? c.ink}
              style={{ display: "block", marginTop: 8 }}
            >
              {tile.value}
            </Mono>
            {tile.sub && (
              <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>
                {tile.sub}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── MetricTile ──────────────────────────────────────────────────────────────

interface MetricTileProps {
  t: DesignTokens;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  delta?: number | null;
  primary?: boolean;
  style?: React.CSSProperties;
}

export function MetricTile({
  t,
  label,
  value,
  sub,
  delta,
  primary,
  style,
}: MetricTileProps) {
  const c = t.color;
  const deltaColor = delta == null ? c.ink3 : delta >= 0 ? c.pos : c.neg;
  return (
    <Card
      t={t}
      style={{
        minHeight: 132,
        display: "flex",
        flexDirection: "column",
        background: primary ? c.subtle : c.surface,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: c.ink3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
          color: c.ink,
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
      {(sub || delta != null) && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginTop: "auto",
            paddingTop: 16,
          }}
        >
          {delta != null && (
            <Mono t={t} size={11} weight={500} color={deltaColor}>
              {delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
            </Mono>
          )}
          {sub && <span style={{ fontSize: 11, color: c.ink3 }}>{sub}</span>}
        </div>
      )}
    </Card>
  );
}

// ── SectionLabel ─────────────────────────────────────────────────────────────

interface SectionLabelProps {
  t: DesignTokens;
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function SectionLabel({
  t,
  children,
  action,
  style,
  className,
}: SectionLabelProps) {
  const c = t.color;
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: c.ink3,
          fontFamily: t.font.sans,
        }}
      >
        {children}
      </div>
      {action}
    </div>
  );
}

// ── Btn ──────────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "ghost" | "subtle" | "accent";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  t: DesignTokens;
  variant?: BtnVariant;
}

export function Btn({
  t,
  children,
  variant = "ghost",
  type = "button",
  disabled,
  style,
  ...props
}: BtnProps) {
  const mappedVariant = {
    primary: "default",
    ghost: "outline",
    subtle: "secondary",
    accent: "default",
  }[variant] as "default" | "outline" | "secondary";

  return (
    <Button
      type={type}
      disabled={disabled}
      variant={mappedVariant}
      size="sm"
      {...props}
      style={{
        borderRadius: Math.max(t.radius - 2, 0),
        fontFamily: t.font.sans,
        ...(variant === "primary" ? { background: t.color.ink, color: t.color.canvas } : null),
        ...style,
      }}
    >
      {children}
    </Button>
  );
}

// ── Mono ─────────────────────────────────────────────────────────────────────

interface MonoProps {
  t: DesignTokens;
  children: React.ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}

export function Mono({
  t,
  children,
  size = 14,
  weight = 500,
  color,
  style,
}: MonoProps) {
  return (
    <span
      style={{
        fontFamily: t.font.mono,
        fontVariantNumeric: "tabular-nums",
        fontSize: size,
        fontWeight: weight,
        color: color ?? t.color.ink,
        letterSpacing: "-0.01em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ── Dot ──────────────────────────────────────────────────────────────────────

export function Dot({ color, size = 6 }: { color: string; size?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

// ── StatusPill ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  string,
  { label: string; colorKey: "pos" | "neg" | "warn" | "info" | "ink3" }
> = {
  completed: { label: "Completed", colorKey: "pos" },
  shipped: { label: "Shipped", colorKey: "info" },
  processing: { label: "Processing", colorKey: "info" },
  pending: { label: "Pending", colorKey: "warn" },
  cancelled: { label: "Cancelled", colorKey: "ink3" },
  overdue: { label: "Overdue", colorKey: "neg" },
  sent: { label: "Sent", colorKey: "info" },
  paid: { label: "Paid", colorKey: "pos" },
  draft: { label: "Draft", colorKey: "ink3" },
};

export function StatusPill({ t, status }: { t: DesignTokens; status: string }) {
  const s = STATUS_MAP[status.toLowerCase()] ?? {
    label: status,
    colorKey: "ink3" as const,
  };
  const color = t.color[s.colorKey];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 500,
        color,
        fontFamily: t.font.sans,
      }}
    >
      <Dot color={color} />
      {s.label}
    </span>
  );
}

// ── DataTable ───────────────────────────────────────────────────────────────

interface DataTableProps {
  t: DesignTokens;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function DataTable({ t, children, style }: DataTableProps) {
  return (
    <div
      className="overflow-x-auto border border-border rounded-lg bg-card"
      style={style}
    >
      <Table className="w-full min-w-[760px] text-[13px] border-collapse">
        {children}
      </Table>
    </div>
  );
}

export function PremiumTable({
  t,
  children,
  minWidth = 760,
  style,
}: {
  t: DesignTokens;
  children: React.ReactNode;
  minWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <Card t={t} pad={false} className="overflow-auto" style={style}>
      <Table style={{ minWidth }} className="border-collapse">
        {children}
      </Table>
    </Card>
  );
}

export function PremiumTh({
  t,
  children,
  right,
  style,
}: {
  t: DesignTokens;
  children: React.ReactNode;
  right?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <TableHead
      className={cn(
        "px-[22px] py-[11px] text-[10px] font-medium tracking-[0.10em] uppercase border-b border-border bg-muted/30 whitespace-nowrap text-muted-foreground",
        right ? "text-right" : "text-left"
      )}
      style={style}
    >
      {children}
    </TableHead>
  );
}

export function PremiumTd({
  t,
  children,
  last,
  right,
  colSpan,
  style,
}: {
  t: DesignTokens;
  children: React.ReactNode;
  last?: boolean;
  right?: boolean;
  colSpan?: number;
  style?: React.CSSProperties;
} & Pick<React.TdHTMLAttributes<HTMLTableCellElement>, "colSpan">) {
  return (
    <TableCell
      colSpan={colSpan}
      className={cn(
        "px-[22px] py-3.5 align-middle text-sm text-foreground",
        last ? "border-b-0" : "border-b border-border",
        right ? "text-right" : "text-left"
      )}
      style={style}
    >
      {children}
    </TableCell>
  );
}

export function Th({
  t,
  children,
  style,
}: {
  t: DesignTokens;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <TableHead
      className="px-3.5 py-2.5 bg-muted text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground border-b border-border whitespace-nowrap"
      style={style}
    >
      {children}
    </TableHead>
  );
}

export function Td({
  t,
  children,
  mono,
  style,
}: {
  t: DesignTokens;
  children: React.ReactNode;
  mono?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <TableCell
      className={cn(
        "px-3.5 py-[11px] border-b border-border align-middle text-muted-foreground",
        mono ? "font-mono tabular-nums text-xs" : "font-sans text-sm"
      )}
      style={style}
    >
      {children}
    </TableCell>
  );
}

// ── Forms ──────────────────────────────────────────────────────────────────

const controlBase = (t: DesignTokens): React.CSSProperties => ({
  width: "100%",
  minHeight: 34,
  padding: "7px 10px",
  border: `1px solid ${t.color.border}`,
  borderRadius: Math.max(t.radius - 2, 0),
  background: t.color.surface,
  color: t.color.ink,
  fontFamily: t.font.sans,
  fontSize: 13,
  outline: "none",
});

interface FieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "style"
> {
  t: DesignTokens;
  label?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export function Field({ t, label, style, inputStyle, ...props }: FieldProps) {
  return (
    <Label style={{ display: "grid", gap: 6, fontFamily: t.font.sans, ...style }}>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: t.color.ink3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
      )}
      <Input {...props} style={inputStyle} />
    </Label>
  );
}

interface SelectFieldProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "style"
> {
  t: DesignTokens;
  label?: string;
  style?: React.CSSProperties;
  selectStyle?: React.CSSProperties;
}

export function SelectField({
  t,
  label,
  style,
  selectStyle,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <Label style={{ display: "grid", gap: 6, fontFamily: t.font.sans, ...style }}>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: t.color.ink3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
      )}
      <NativeSelect {...props} style={selectStyle}>
        {children}
      </NativeSelect>
    </Label>
  );
}

interface TextAreaFieldProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "style"
> {
  t: DesignTokens;
  label?: string;
  style?: React.CSSProperties;
  textareaStyle?: React.CSSProperties;
}

export function TextAreaField({
  t,
  label,
  style,
  textareaStyle,
  ...props
}: TextAreaFieldProps) {
  return (
    <Label style={{ display: "grid", gap: 6, fontFamily: t.font.sans, ...style }}>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: t.color.ink3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
      )}
      <Textarea
        {...props}
        style={{
          ...textareaStyle,
        }}
      />
    </Label>
  );
}

export function CheckboxRow({
  t,
  checked,
  onChange,
  label,
  sub,
}: {
  t: DesignTokens;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 py-2.5 cursor-pointer select-none">
      <Checkbox
        id={`checkbox-row-${label}`}
        checked={checked}
        onCheckedChange={(checkedState) => onChange(Boolean(checkedState))}
      />
      <Label
        htmlFor={`checkbox-row-${label}`}
        className="grid gap-0.5 cursor-pointer"
      >
        <span className="text-sm font-medium text-foreground">{label}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </Label>
    </div>
  );
}

// ── formatBaht / formatBahtK ────────────────────────────────────────────────

export function fmtBaht(n: number, dec = 0): string {
  const sign = n < 0 ? "−" : "";
  const v = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
  return `${sign}฿${v}`;
}

export function fmtBahtK(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `฿${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `฿${(n / 1_000).toFixed(1)}K`;
  return `฿${n.toFixed(0)}`;
}

export function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Category & Stock Badges ──────────────────────────────────────────────────

export type ProductCategory = "Cat" | "Dog" | "Bundle" | "Other";

const CATEGORY_LABELS: Record<
  ProductCategory,
  { label: string; color: string; bg: string }
> = {
  Cat: { label: "แมว", color: "#7C3AED", bg: "#EDE9FE" },
  Dog: { label: "สุนัข", color: "#1D4ED8", bg: "#DBEAFE" },
  Bundle: { label: "เซ็ต", color: "#065F46", bg: "#D1FAE5" },
  Other: { label: "อื่นๆ", color: "#92400E", bg: "#FEF3C7" },
};

export function CategoryBadge({ type }: { type: ProductCategory }) {
  const c = CATEGORY_LABELS[type];
  const variant = type.toLowerCase() as "cat" | "dog" | "bundle" | "other";
  return (
    <Badge variant={variant} className="px-2.5 py-0.5 text-[11px] font-semibold">
      {c.label}
    </Badge>
  );
}

export function StockBadge({
  stock,
  reorder,
  isBundle,
}: {
  stock: number;
  reorder: number;
  isBundle: boolean;
}) {
  if (isBundle) {
    return <Badge variant="virtual" className="px-2.5 py-0.5 text-[11px] font-semibold">Virtual</Badge>;
  }
  if (stock === 0) {
    return <Badge variant="empty" className="px-2.5 py-0.5 text-[11px] font-semibold">หมด</Badge>;
  }
  if (stock < reorder) {
    return <Badge variant="low" className="px-2.5 py-0.5 text-[11px] font-semibold">ใกล้หมด</Badge>;
  }
  return <Badge variant="normal" className="px-2.5 py-0.5 text-[11px] font-semibold">ปกติ</Badge>;
}
