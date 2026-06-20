/* misc-screens.jsx — Stock + a generic placeholder for the long tail */

function StockScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const totalValue = m.stock.reduce((s, p) => s + p.value, 0);
  const outOfStock = m.stock.filter(p => p.onHand === 0).length;
  const lowStock   = m.stock.filter(p => p.onHand > 0 && p.onHand <= p.reorder).length;
  const totalUnits = m.stock.reduce((s, p) => s + p.onHand, 0);

  return (
    <div>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Inventory', 'Stock Balance']}
        title="Stock Balance"
        subtitle={`${m.stock.length} SKUs tracked · ${formatBahtK(totalValue)} on-hand value`}
        right={
          <React.Fragment>
            <Btn t={t} variant="ghost">Stock Check</Btn>
            <Btn t={t} variant="ghost">Adjust</Btn>
            <Btn t={t} variant="primary">+ Receive Goods</Btn>
          </React.Fragment>
        }
      />
      <div style={{ padding: '24px 32px 48px' }}>
        <Card t={t} pad={false} style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { l: 'On-hand value',  v: formatBaht(totalValue), s: 'across all SKUs' },
              { l: 'Total units',    v: formatNum(totalUnits),  s: 'physical inventory' },
              { l: 'Low stock',      v: lowStock.toString(),    s: 'below reorder point', tone: c.warn },
              { l: 'Out of stock',   v: outOfStock.toString(),  s: 'reorder required',     tone: c.neg },
            ].map((s, i) => (
              <div key={s.l} style={{ padding: '16px 22px', borderRight: i < 3 ? `1px solid ${c.border}` : 'none' }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{s.l}</div>
                <Mono t={t} size={20} weight={600} color={s.tone || c.ink} style={{ display: 'block', marginTop: 8 }}>{s.v}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card t={t} pad={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
            <thead>
              <tr>
                {[
                  { l: 'SKU' },
                  { l: 'Product' },
                  { l: 'Lot' },
                  { l: 'On hand', r: true },
                  { l: 'Reorder',   r: true },
                  { l: 'Stock level' },
                  { l: 'Value', r: true },
                  { l: '30D trend', r: true },
                ].map((h, i) => (
                  <th key={h.l} style={{
                    textAlign: h.r ? 'right' : 'left',
                    padding: '11px 22px',
                    fontSize: 10, fontWeight: 500, color: c.ink3,
                    letterSpacing: '0.10em', textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.border}`,
                    background: c.canvas, whiteSpace: 'nowrap',
                  }}>{h.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.stock.map((p, i) => {
                const status = p.onHand === 0 ? 'out' : p.onHand <= p.reorder ? 'low' : 'ok';
                const ratio  = Math.min(p.onHand / Math.max(p.reorder * 2, 1), 1);
                const barColor = status === 'out' ? c.neg : status === 'low' ? c.warn : c.pos;
                return (
                  <tr key={p.sku}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = c.subtle}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 22px', borderBottom: i < m.stock.length-1 ? `1px solid ${c.border}` : 'none' }}>
                      <Mono t={t} size={12} weight={500}>{p.sku}</Mono>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < m.stock.length-1 ? `1px solid ${c.border}` : 'none' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: c.ink, letterSpacing: '-0.005em' }}>{p.name}</div>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < m.stock.length-1 ? `1px solid ${c.border}` : 'none' }}>
                      <Mono t={t} size={11} color={c.ink3}>{p.lot}</Mono>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < m.stock.length-1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}>
                      <Mono t={t} size={13} weight={600} color={status === 'out' ? c.neg : c.ink}>{formatNum(p.onHand)}</Mono>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < m.stock.length-1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}>
                      <Mono t={t} size={12} color={c.ink3}>{p.reorder}</Mono>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < m.stock.length-1 ? `1px solid ${c.border}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                        <div style={{ flex: 1, height: 6, background: c.subtle, borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(ratio * 100, p.onHand > 0 ? 6 : 0)}%`, height: '100%', background: barColor }} />
                        </div>
                        <span style={{ fontSize: 11, color: barColor, fontWeight: 500, minWidth: 50 }}>
                          {status === 'out' ? 'Out' : status === 'low' ? 'Low' : 'Healthy'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < m.stock.length-1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}>
                      <Mono t={t} size={12}>{formatBaht(p.value)}</Mono>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < m.stock.length-1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}>
                      <Mono t={t} size={11} color={p.trend >= 0 ? c.pos : c.neg}>{p.trend >= 0 ? '+' : '−'}{Math.abs(p.trend).toFixed(1)}%</Mono>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

const SCREEN_META = {
  quotation: { title: 'Quotations',         sub: 'ใบเสนอราคา',         section: 'Sales' },
  returns:   { title: 'Returns',            sub: 'คืนสินค้า',          section: 'Sales' },
  pr:        { title: 'Purchase Requisitions', sub: 'ใบขอซื้อ',         section: 'Purchasing' },
  po:        { title: 'Purchase Orders',    sub: 'ใบสั่งซื้อ',          section: 'Purchasing' },
  sku:       { title: 'SKU Master',         sub: 'ข้อมูลสินค้า',       section: 'Inventory' },
  'goods-in':  { title: 'Goods Receive',    sub: 'รับสินค้าเข้า',      section: 'Inventory' },
  'goods-out': { title: 'Goods Issue',      sub: 'เบิกสินค้าออก',      section: 'Inventory' },
  pl:        { title: 'P&L Report',         sub: 'กำไร-ขาดทุน',        section: 'Finance' },
  expenses:  { title: 'Expenses',           sub: 'ค่าใช้จ่าย',         section: 'Finance' },
  budget:    { title: 'Budget',             sub: 'งบประมาณ',           section: 'Finance' },
  tiktok:    { title: 'TikTok Orders',      sub: 'ออร์เดอร์ TikTok',   section: 'Channels' },
  live:      { title: 'Live & Content',     sub: 'ไลฟ์และคอนเทนต์',    section: 'Channels' },
  users:     { title: 'User Management',    sub: 'จัดการผู้ใช้',       section: 'System' },
  settings:  { title: 'Master Settings',    sub: 'ตั้งค่าหลัก',        section: 'System' },
};

function PlaceholderScreen({ t, screen }) {
  const c = t.color;
  const meta = SCREEN_META[screen] || { title: screen, sub: '', section: '' };
  return (
    <div>
      <TopBar
        t={t}
        breadcrumb={['Chawy', meta.section, meta.title]}
        title={meta.title}
        subtitle={meta.sub}
      />
      <div style={{ padding: '24px 32px 48px' }}>
        <Card t={t} style={{ padding: '72px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>Module preview</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: c.ink, marginTop: 14, letterSpacing: '-0.02em' }}>
            หน้านี้ใช้ design system เดียวกัน
          </div>
          <div style={{ fontSize: 14, color: c.ink3, marginTop: 8, maxWidth: 480, margin: '8px auto 0', lineHeight: 1.5 }}>
            ดู Dashboard / Sales Orders / Invoice / Stock Balance เพื่อตัวอย่างจริงของ premium design system ที่ใช้ทั้งระบบ
          </div>
        </Card>
      </div>
    </div>
  );
}

window.StockScreen = StockScreen;
window.PlaceholderScreen = PlaceholderScreen;
