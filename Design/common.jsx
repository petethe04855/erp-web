/* common.jsx — shared UI primitives */

function TopBar({ t, title, subtitle, breadcrumb, right }) {
  const c = t.color;
  return (
    <div style={{
      borderBottom: `1px solid ${c.border}`,
      background: c.canvas,
      position: 'sticky', top: 0, zIndex: 10,
      backdropFilter: 'saturate(180%) blur(8px)',
    }}>
      {/* Breadcrumb row */}
      <div style={{
        padding: '14px 32px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.ink3, fontFamily: t.font.sans }}>
          {(breadcrumb || ['Chawy ERP']).map((b, i, arr) => (
            <React.Fragment key={i}>
              <span style={{ color: i === arr.length - 1 ? c.ink2 : c.ink3 }}>{b}</span>
              {i < arr.length - 1 && <span style={{ color: c.ink4 }}>/</span>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>
      </div>
      {/* Title row */}
      <div style={{ padding: '8px 32px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{
            fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em',
            color: c.ink, margin: 0, lineHeight: 1.15,
          }}>{title}</h1>
          {subtitle && <div style={{ fontSize: 13, color: c.ink3, marginTop: 4 }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function Card({ t, children, style, pad = true }) {
  const c = t.color;
  return (
    <div style={{
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: t.radius,
      padding: pad ? 20 : 0,
      ...style,
    }}>{children}</div>
  );
}

function SectionLabel({ t, children, action, style }) {
  const c = t.color;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 12, ...style,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 500, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: c.ink3,
      }}>{children}</div>
      {action}
    </div>
  );
}

function Btn({ t, children, variant = 'ghost', onClick, style }) {
  const c = t.color;
  const styles = {
    primary: { background: c.ink, color: c.canvas, border: `1px solid ${c.ink}` },
    ghost:   { background: 'transparent', color: c.ink, border: `1px solid ${c.border}` },
    subtle:  { background: c.subtle, color: c.ink2, border: `1px solid transparent` },
    accent:  { background: c.accent, color: t.isDark ? '#0B0E13' : '#FFFFFF', border: `1px solid ${c.accent}` },
  };
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px',
      borderRadius: Math.max(t.radius - 2, 0),
      fontSize: 12, fontWeight: 500,
      fontFamily: t.font.sans,
      cursor: 'pointer',
      letterSpacing: '-0.005em',
      transition: 'all 120ms',
      ...styles[variant],
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{children}</button>
  );
}

function Mono({ t, children, size = 14, weight = 500, color, style }) {
  return (
    <span style={{
      fontFamily: t.font.mono,
      fontVariantNumeric: 'tabular-nums',
      fontSize: size,
      fontWeight: weight,
      color: color || t.color.ink,
      letterSpacing: '-0.01em',
      ...style,
    }}>{children}</span>
  );
}

function Dot({ color, size = 6 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      borderRadius: '50%', background: color, flexShrink: 0,
    }} />
  );
}

// Status: returns {label, color, bg} for stock/order/invoice statuses
function statusStyle(t, status) {
  const c = t.color;
  const map = {
    completed:  { label: 'Completed',  color: c.pos,  bg: c.posBg  },
    shipped:    { label: 'Shipped',    color: c.info, bg: c.infoBg },
    processing: { label: 'Processing', color: c.info, bg: c.infoBg },
    pending:    { label: 'Pending',    color: c.warn, bg: c.warnBg },
    cancelled:  { label: 'Cancelled',  color: c.ink3, bg: c.subtle },
    overdue:    { label: 'Overdue',    color: c.neg,  bg: c.negBg  },
    sent:       { label: 'Sent',       color: c.info, bg: c.infoBg },
    paid:       { label: 'Paid',       color: c.pos,  bg: c.posBg  },
    draft:      { label: 'Draft',      color: c.ink3, bg: c.subtle },
  };
  return map[status] || { label: status, color: c.ink3, bg: c.subtle };
}

function StatusPill({ t, status }) {
  const s = statusStyle(t, status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 500, letterSpacing: '-0.005em',
      color: s.color,
    }}>
      <Dot color={s.color} />
      {s.label}
    </span>
  );
}

window.TopBar = TopBar;
window.Card = Card;
window.SectionLabel = SectionLabel;
window.Btn = Btn;
window.Mono = Mono;
window.Dot = Dot;
window.StatusPill = StatusPill;
window.statusStyle = statusStyle;
