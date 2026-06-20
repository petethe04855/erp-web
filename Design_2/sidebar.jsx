/* sidebar.jsx — Collapsible accordion nav. Text-first, no icon library.
   Each module group can be expanded / collapsed. */

const NAV_GROUPS = [
  { id: 'overview', label: 'Overview', th: 'ภาพรวม', items: [
    { id: 'dashboard', label: 'Dashboard', th: 'หน้าหลัก' },
  ]},
  { id: 'sales', label: 'Sales', th: 'งานขาย', items: [
    { id: 'quotation', label: 'Quotation',    th: 'ใบเสนอราคา' },
    { id: 'sales',     label: 'Sales Orders', th: 'ออร์เดอร์ขาย', badge: 4 },
    { id: 'invoice',   label: 'Invoices',     th: 'ใบแจ้งหนี้' },
    { id: 'returns',   label: 'Returns',      th: 'คืนสินค้า' },
  ]},
  { id: 'purchasing', label: 'Purchasing', th: 'งานจัดซื้อ', items: [
    { id: 'pr', label: 'Purchase Req.',  th: 'ใบขอซื้อ' },
    { id: 'po', label: 'Purchase Order', th: 'ใบสั่งซื้อ' },
  ]},
  { id: 'inventory', label: 'Inventory', th: 'คลังสินค้า', items: [
    { id: 'stock',     label: 'Stock Balance', th: 'สต็อคคงคลัง' },
    { id: 'sku',       label: 'SKU Master',    th: 'ข้อมูลสินค้า' },
    { id: 'goods-in',  label: 'Goods Receive', th: 'รับสินค้าเข้า' },
    { id: 'goods-out', label: 'Goods Issue',   th: 'เบิกสินค้าออก' },
  ]},
  { id: 'finance', label: 'Finance', th: 'การเงิน', items: [
    { id: 'pl',       label: 'P&L Report', th: 'กำไร-ขาดทุน' },
    { id: 'expenses', label: 'Expenses',   th: 'ค่าใช้จ่าย' },
    { id: 'budget',   label: 'Budget',     th: 'งบประมาณ' },
  ]},
  { id: 'channels', label: 'Channels', th: 'ช่องทางขาย', items: [
    { id: 'tiktok', label: 'TikTok Orders', th: 'ออร์เดอร์ TikTok' },
    { id: 'live',   label: 'Live & Content', th: 'ไลฟ์และคอนเทนต์' },
  ]},
  { id: 'system', label: 'System', th: 'ระบบ', items: [
    { id: 'users',    label: 'Users',    th: 'จัดการผู้ใช้' },
    { id: 'settings', label: 'Settings', th: 'ตั้งค่าหลัก' },
  ]},
];

// Caret affordance — pure CSS, rotates on open. No icon library.
function Caret({ open, color }) {
  return (
    <span style={{
      width: 7, height: 7,
      borderRight: `1.5px solid ${color}`,
      borderBottom: `1.5px solid ${color}`,
      transform: open ? 'rotate(45deg)' : 'rotate(-45deg)',
      transition: 'transform 160ms ease',
      flexShrink: 0,
      marginTop: open ? -2 : 0,
      marginRight: open ? 0 : 2,
    }} />
  );
}

function Sidebar({ t, current, onNavigate }) {
  const c = t.color;
  const m = window.mockData;

  // Which group is the current screen in?
  const groupOf = (id) => (NAV_GROUPS.find(g => g.items.some(it => it.id === id)) || {}).id;

  const [open, setOpen] = React.useState(() => {
    // Start with every group open
    const init = {};
    NAV_GROUPS.forEach(g => { init[g.id] = true; });
    return init;
  });

  // Ensure the group containing the active screen is always open
  React.useEffect(() => {
    const g = groupOf(current);
    if (g) setOpen(o => o[g] ? o : { ...o, [g]: true });
  }, [current]);

  const toggle = (gid) => setOpen(o => ({ ...o, [gid]: !o[gid] }));
  const allOpen = NAV_GROUPS.every(g => open[g.id]);
  const collapseAll = () => {
    const next = {};
    NAV_GROUPS.forEach(g => { next[g.id] = !allOpen; });
    // keep active group open
    const ag = groupOf(current); if (ag) next[ag] = true;
    setOpen(next);
  };

  return (
    <aside style={{
      width: 252, height: '100vh', position: 'sticky', top: 0,
      background: c.canvas, borderRight: `1px solid ${c.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{
        padding: '18px 20px', borderBottom: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: t.radius, background: c.ink, color: c.canvas,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: t.font.mono, fontWeight: 600, fontSize: 13, letterSpacing: '-0.02em', flexShrink: 0,
        }}>C</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.ink, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{m.company.name}</div>
          <div style={{ fontSize: 11, color: c.ink3, marginTop: 1 }}>Pet Food ERP</div>
        </div>
        <button onClick={collapseAll} title={allOpen ? 'ย่อทั้งหมด' : 'ขยายทั้งหมด'} style={{
          background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 5,
          color: c.ink3, cursor: 'pointer', fontSize: 13, lineHeight: 1,
          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: t.font.mono, flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = c.subtle; e.currentTarget.style.color = c.ink2; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.ink3; }}
        >{allOpen ? '−' : '+'}</button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 10px 16px' }}>
        {NAV_GROUPS.map(group => {
          const isOpen = open[group.id];
          const hasActive = group.items.some(it => it.id === current);
          return (
            <div key={group.id} style={{ marginBottom: 2 }}>
              {/* Group header */}
              <button
                onClick={() => toggle(group.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 10px 7px', background: 'transparent', border: 'none',
                  cursor: 'pointer', fontFamily: t.font.sans, textAlign: 'left',
                }}
              >
                <span style={{
                  flex: 1, fontSize: 10, fontWeight: 600, letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: hasActive && !isOpen ? c.accent : c.ink3,
                }}>{group.label}</span>
                {hasActive && !isOpen && <Dot color={c.accent} size={5} />}
                <Caret open={isOpen} color={c.ink4} />
              </button>

              {/* Items */}
              <div style={{
                overflow: 'hidden',
                maxHeight: isOpen ? group.items.length * 48 + 8 : 0,
                opacity: isOpen ? 1 : 0,
                transition: 'max-height 220ms ease, opacity 160ms ease',
              }}>
                {group.items.map(item => {
                  const active = current === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 10px 6px 14px', marginBottom: 1,
                        background: active ? c.accentBg : 'transparent',
                        border: 'none', borderLeft: `2px solid ${active ? c.accent : 'transparent'}`,
                        borderRadius: active ? `0 ${Math.max(t.radius-2,0)}px ${Math.max(t.radius-2,0)}px 0` : 0,
                        cursor: 'pointer', fontFamily: t.font.sans, textAlign: 'left',
                        transition: 'background 120ms',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.subtle; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{
                          fontSize: 13, fontWeight: active ? 600 : 500,
                          color: active ? c.accent : c.ink2, letterSpacing: '-0.005em',
                          lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{item.label}</span>
                        <span style={{
                          fontSize: 10, color: c.ink3, lineHeight: 1.25,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{item.th}</span>
                      </span>
                      {item.badge ? (
                        <span style={{
                          fontFamily: t.font.mono, fontSize: 10, fontWeight: 500,
                          color: c.ink2, background: c.subtle, border: `1px solid ${c.border}`,
                          padding: '1px 6px', borderRadius: 4, flexShrink: 0,
                        }}>{item.badge}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ borderTop: `1px solid ${c.border}`, padding: '12px' }}>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
          background: 'transparent', border: `1px solid ${c.border}`, borderRadius: t.radius,
          cursor: 'pointer', fontFamily: t.font.sans, textAlign: 'left',
        }}
        onMouseEnter={e => e.currentTarget.style.background = c.subtle}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: c.subtle,
            border: `1px solid ${c.border}`, color: c.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, flexShrink: 0,
          }}>{m.company.user.initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.company.user.name}</div>
            <div style={{ fontSize: 10, color: c.ink3, marginTop: 1 }}>{m.company.user.role}</div>
          </div>
        </button>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
