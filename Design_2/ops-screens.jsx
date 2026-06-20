/* ops-screens.jsx — Purchase Orders, TikTok, Quotation, SKU Master */

function genericTable(t, cols, rows, renderRow) {
  const c = t.color;
  return (
    <Card t={t} pad={false}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
        <thead>
          <tr>
            {cols.map(h => (
              <th key={h.l} style={{ textAlign: h.r?'right':'left', padding: '11px 22px', fontSize: 10, fontWeight: 500, color: c.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, background: c.canvas, whiteSpace: 'nowrap' }}>{h.l}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map((r, i) => renderRow(r, i, i === rows.length - 1))}</tbody>
      </table>
    </Card>
  );
}

// ── Purchase Orders ──────────────────────────────────────────
function PurchaseOrdersScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const total = m.purchaseOrders.reduce((s,p)=>s+p.amount,0);
  const open = m.purchaseOrders.filter(p => p.status !== 'completed').reduce((s,p)=>s+p.amount,0);

  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy', 'Purchasing', 'Purchase Orders']}
        title="Purchase Orders"
        subtitle={`ใบสั่งซื้อ · ${m.purchaseOrders.length} รายการ · ${formatBaht(open)} ค้างรับ`}
        right={<React.Fragment><Btn t={t} variant="ghost">Export</Btn><Btn t={t} variant="primary">+ New PO</Btn></React.Fragment>} />
      <div style={{ padding: '24px 32px 48px' }}>
        <Card t={t} pad={false} style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { l: 'Total ordered', v: formatBaht(total), s: 'this month' },
              { l: 'Open value',    v: formatBaht(open), s: 'awaiting receipt' },
              { l: 'Overdue POs',   v: m.purchaseOrders.filter(p=>p.status==='overdue').length.toString(), s: 'past ETA', tone: c.neg },
              { l: 'Suppliers',     v: new Set(m.purchaseOrders.map(p=>p.supplier)).size.toString(), s: 'active' },
            ].map((s,i) => (
              <div key={s.l} style={{ padding: '16px 22px', borderRight: i<3?`1px solid ${c.border}`:'none' }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{s.l}</div>
                <Mono t={t} size={20} weight={600} color={s.tone||c.ink} style={{ display: 'block', marginTop: 8 }}>{s.v}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </Card>
        {genericTable(t,
          [{l:'PO'},{l:'Supplier'},{l:'Order date'},{l:'ETA'},{l:'Items',r:true},{l:'Amount',r:true},{l:'Status'}],
          m.purchaseOrders,
          (p, i, last) => (
            <tr key={p.id} style={{ cursor: 'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.background=c.subtle}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} weight={500}>{p.id}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{p.supplier}</span></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} color={c.ink2}>{formatDateShort(p.date)}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} color={p.status==='overdue'?c.neg:c.ink2}>{formatDateShort(p.eta)}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={12} color={c.ink2}>{p.items}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={13} weight={600}>{formatBaht(p.amount)}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><StatusPill t={t} status={p.status} /></td>
            </tr>
          )
        )}
      </div>
    </div>
  );
}

// ── TikTok / Live ────────────────────────────────────────────
function TiktokScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const tk = m.tiktok;
  const todayGmv = tk.liveSessions[0].gmv;
  const totalGmv = tk.liveSessions.reduce((s,l)=>s+l.gmv,0);

  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy', 'Channels', 'TikTok Orders']}
        title="TikTok Shop"
        subtitle="ออร์เดอร์และไลฟ์ TikTok · พฤษภาคม 2026"
        right={<React.Fragment><Btn t={t} variant="ghost">Export</Btn><Btn t={t} variant="primary">Schedule Live</Btn></React.Fragment>} />
      <div style={{ padding: '24px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { l: 'GMV · last live',  v: formatBaht(todayGmv), s: tk.liveSessions[0].date.slice(5), primary: true },
            { l: 'GMV · MTD',        v: formatBaht(totalGmv), s: `${tk.liveSessions.length} sessions` },
            { l: 'Avg. conversion',  v: `${(tk.liveSessions.reduce((s,l)=>s+l.conv,0)/tk.liveSessions.length*100).toFixed(1)}%`, s: 'viewer → order' },
            { l: 'Orders today',     v: formatNum(tk.orders.length * 24), s: 'across channel' },
          ].map(s => (
            <div key={s.l} style={{ background: s.primary?c.subtle:c.surface, border: `1px solid ${c.border}`, borderRadius: t.radius, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{s.l}</div>
              <Mono t={t} size={24} weight={600} style={{ display: 'block', marginTop: 10 }}>{s.v}</Mono>
              <div style={{ fontSize: 11, color: c.ink3, marginTop: 6 }}>{s.s}</div>
            </div>
          ))}
        </div>

        {/* Live sessions */}
        <SectionLabel t={t}>Recent Live Sessions</SectionLabel>
        <div style={{ marginBottom: 24 }}>
          {genericTable(t,
            [{l:'Date'},{l:'Host'},{l:'Duration'},{l:'Viewers',r:true},{l:'Orders',r:true},{l:'GMV',r:true},{l:'Conv.',r:true}],
            tk.liveSessions,
            (l, i, last) => (
              <tr key={i}>
                <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} weight={500}>{formatDateShort(l.date)}</Mono></td>
                <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{l.host}</span></td>
                <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} color={c.ink2}>{l.dur}</Mono></td>
                <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={12} color={c.ink2}>{formatNum(l.viewers)}</Mono></td>
                <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={12}>{l.orders}</Mono></td>
                <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={13} weight={600}>{formatBaht(l.gmv)}</Mono></td>
                <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={12} weight={500} color={c.pos}>{(l.conv*100).toFixed(0)}%</Mono></td>
              </tr>
            )
          )}
        </div>

        {/* Live orders feed */}
        <SectionLabel t={t} action={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: c.pos }}><Dot color={c.pos} /> Live now</span>}>Order Feed</SectionLabel>
        {genericTable(t,
          [{l:'Order'},{l:'Handle'},{l:'Product'},{l:'Qty',r:true},{l:'Amount',r:true},{l:'Time',r:true},{l:'Status'}],
          tk.orders,
          (o, i, last) => (
            <tr key={o.id} style={{ cursor: 'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.background=c.subtle}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{ padding: '13px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} weight={500}>{o.id}</Mono></td>
              <td style={{ padding: '13px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><span style={{ fontSize: 12, color: c.accent, fontWeight: 500 }}>{o.handle}</span></td>
              <td style={{ padding: '13px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><span style={{ fontSize: 13, color: c.ink }}>{o.product}</span></td>
              <td style={{ padding: '13px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={12} color={c.ink2}>{o.qty}</Mono></td>
              <td style={{ padding: '13px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={13} weight={600}>{formatBaht(o.amount)}</Mono></td>
              <td style={{ padding: '13px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={11} color={c.ink3}>{o.time}</Mono></td>
              <td style={{ padding: '13px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><StatusPill t={t} status={o.status} /></td>
            </tr>
          )
        )}
      </div>
    </div>
  );
}

// ── Quotation ────────────────────────────────────────────────
function QuotationScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const total = m.quotations.reduce((s,q)=>s+q.amount,0);

  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy', 'Sales', 'Quotations']}
        title="Quotations"
        subtitle={`ใบเสนอราคา · ${m.quotations.length} รายการ · ${formatBaht(total)} pipeline`}
        right={<Btn t={t} variant="primary">+ New Quotation</Btn>} />
      <div style={{ padding: '24px 32px 48px' }}>
        {genericTable(t,
          [{l:'Quote'},{l:'Customer'},{l:'Issued'},{l:'Valid until'},{l:'Amount',r:true},{l:'Status'}],
          m.quotations,
          (q, i, last) => (
            <tr key={q.id} style={{ cursor: 'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.background=c.subtle}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} weight={500}>{q.id}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{q.customer}</span></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} color={c.ink2}>{formatDateShort(q.date)}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} color={c.ink2}>{formatDateShort(q.valid)}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={13} weight={600}>{formatBaht(q.amount)}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><StatusPill t={t} status={q.status==='accepted'?'completed':q.status==='expired'?'cancelled':q.status} /></td>
            </tr>
          )
        )}
      </div>
    </div>
  );
}

// ── SKU Master ───────────────────────────────────────────────
function SkuScreen({ t }) {
  const c = t.color;
  const m = window.mockData;

  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy', 'Inventory', 'SKU Master']}
        title="SKU Master"
        subtitle={`ข้อมูลสินค้า · ${m.skus.length} รายการ`}
        right={<React.Fragment><Btn t={t} variant="ghost">Import</Btn><Btn t={t} variant="primary">+ New SKU</Btn></React.Fragment>} />
      <div style={{ padding: '24px 32px 48px' }}>
        {genericTable(t,
          [{l:'SKU'},{l:'Product'},{l:'Category'},{l:'Cost',r:true},{l:'Price',r:true},{l:'Margin',r:true},{l:'Sold · 30D',r:true}],
          m.skus,
          (s, i, last) => (
            <tr key={s.sku} style={{ cursor: 'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.background=c.subtle}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><Mono t={t} size={12} weight={500}>{s.sku}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{s.name}</span></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}` }}>
                <span style={{ fontSize: 11, color: c.ink2, background: c.subtle, padding: '2px 8px', borderRadius: 4, border: `1px solid ${c.border}` }}>{s.cat}</span>
              </td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={12} color={c.ink2}>{formatBaht(s.cost)}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={13} weight={600}>{formatBaht(s.price)}</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={12} weight={500} color={c.pos}>{s.margin.toFixed(1)}%</Mono></td>
              <td style={{ padding: '14px 22px', borderBottom: last?'none':`1px solid ${c.border}`, textAlign: 'right' }}><Mono t={t} size={12} color={c.ink2}>{formatNum(s.sold30)}</Mono></td>
            </tr>
          )
        )}
      </div>
    </div>
  );
}

window.PurchaseOrdersScreen = PurchaseOrdersScreen;
window.TiktokScreen = TiktokScreen;
window.QuotationScreen = QuotationScreen;
window.SkuScreen = SkuScreen;
