/* invoice.jsx — invoice detail screen */

function InvoiceScreen({ t, onNavigate }) {
  const c = t.color;
  const m = window.mockData;
  const inv = m.invoice;

  const subtotal = inv.lines.reduce((s, l) => s + l.amount, 0);
  const afterDisc = subtotal - inv.discount;
  const vat = afterDisc * 0.07;
  const total = afterDisc + vat;

  return (
    <div>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Sales', 'Invoices', inv.id]}
        title={inv.id}
        subtitle={
          <span>
            Reference{' '}
            <button onClick={() => onNavigate('sales')} style={{ background:'none', border:'none', cursor:'pointer', color: c.accent, fontFamily: t.font.mono, fontSize: 13, padding: 0 }}>{inv.soRef}</button>
            {' · '}{inv.customer.name}
          </span>
        }
        right={
          <React.Fragment>
            <Btn t={t} variant="ghost">Print</Btn>
            <Btn t={t} variant="ghost">Download PDF</Btn>
            <Btn t={t} variant="ghost">Send to customer</Btn>
            <Btn t={t} variant="primary">Record payment</Btn>
          </React.Fragment>
        }
      />

      <div style={{ padding: '24px 32px 48px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'flex-start' }}>
        {/* Main */}
        <div>
          {/* Invoice card */}
          <Card t={t} style={{ padding: 0 }}>
            {/* Header */}
            <div style={{ padding: '28px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>Invoice</div>
                <Mono t={t} size={24} weight={600} style={{ display: 'block', marginTop: 6 }}>{inv.id}</Mono>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <StatusPill t={t} status={inv.status} />
                </div>
                <Mono t={t} size={11} color={c.ink3} style={{ display: 'block', marginTop: 6 }}>Issued {formatDate(inv.issueDate)}</Mono>
              </div>
            </div>

            {/* Customer + dates row */}
            <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 32, borderBottom: `1px solid ${c.border}` }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3, marginBottom: 8 }}>Bill to</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.ink, letterSpacing: '-0.005em' }}>{inv.customer.name}</div>
                <div style={{ fontSize: 12, color: c.ink2, marginTop: 4, lineHeight: 1.6 }}>{inv.customer.address}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: c.ink3 }}>
                  <span>Tax ID <Mono t={t} size={11} color={c.ink2}>{inv.customer.taxId}</Mono></span>
                  <span>·</span>
                  <span>{inv.customer.contact}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3, marginBottom: 8 }}>Due date</div>
                <Mono t={t} size={14} weight={500}>{formatDate(inv.dueDate)}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 4 }}>{inv.terms} · 14 days from issue</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3, marginBottom: 8 }}>Amount due</div>
                <Mono t={t} size={20} weight={600}>{formatBaht(total)}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 4 }}>incl. VAT 7%</div>
              </div>
            </div>

            {/* Line items */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
              <thead>
                <tr>
                  {[
                    { label: 'SKU',         w: 130 },
                    { label: 'Description', w: 'auto' },
                    { label: 'Qty',         w: 80, right: true },
                    { label: 'Unit price',  w: 110, right: true },
                    { label: 'Amount',      w: 130, right: true },
                  ].map((h, i) => (
                    <th key={h.label} style={{
                      textAlign: h.right ? 'right' : 'left',
                      padding: '14px 32px',
                      fontSize: 10,
                      fontWeight: 500,
                      color: c.ink3,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      borderBottom: `1px solid ${c.border}`,
                      whiteSpace: 'nowrap',
                      width: h.w,
                    }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inv.lines.map((l, i) => (
                  <tr key={l.sku}>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}` }}>
                      <Mono t={t} size={12} weight={500}>{l.sku}</Mono>
                    </td>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}` }}>
                      <span style={{ fontSize: 13, color: c.ink, letterSpacing: '-0.005em' }}>{l.name}</span>
                    </td>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
                      <Mono t={t} size={12} color={c.ink2}>{formatNum(l.qty)}</Mono>
                    </td>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
                      <Mono t={t} size={12} color={c.ink2}>{formatBaht(l.price)}</Mono>
                    </td>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
                      <Mono t={t} size={13} weight={500}>{formatBaht(l.amount)}</Mono>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ padding: '20px 32px 28px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Subtotal',          val: subtotal,  color: c.ink2, weight: 500 },
                  { label: 'Volume discount',   val: -inv.discount, color: c.ink2, weight: 500 },
                  { label: 'VAT (7%)',          val: vat,       color: c.ink2, weight: 500 },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: c.ink3 }}>{r.label}</span>
                    <Mono t={t} size={13} weight={r.weight} color={r.color}>{formatBaht(r.val)}</Mono>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>Total due</span>
                  <Mono t={t} size={22} weight={600}>{formatBaht(total)}</Mono>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity */}
          <div style={{ marginTop: 24 }}>
            <SectionLabel t={t}>Activity</SectionLabel>
            <Card t={t}>
              {[
                { who: 'ภัทรพล ศรีวิชัย', when: 'May 26, 2026 · 14:22', what: 'Invoice issued',           note: 'Auto-generated from SO-2026-0418' },
                { who: 'System',           when: 'May 26, 2026 · 14:22', what: 'Sent to customer',         note: 'Email delivered to นภาพร@abc-pet.co.th' },
                { who: 'ภัทรพล ศรีวิชัย', when: 'May 24, 2026 · 11:08', what: 'Sales order confirmed',    note: 'Stock reserved for 6 SKUs' },
                { who: 'นภาพร (Customer)', when: 'May 24, 2026 · 10:45', what: 'Quotation approved',       note: 'QT-2026-0045 — Volume discount ฿4,000' },
              ].map((a, i, arr) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'baseline', gap: 16,
                  padding: '12px 0',
                  borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none',
                }}>
                  <Dot color={i === 0 ? c.accent : c.ink4} />
                  <div>
                    <div style={{ fontSize: 13, color: c.ink, letterSpacing: '-0.005em' }}>
                      <span style={{ fontWeight: 600 }}>{a.who}</span>
                      <span style={{ color: c.ink2 }}> {a.what}</span>
                    </div>
                    <div style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>{a.note}</div>
                  </div>
                  <Mono t={t} size={11} color={c.ink3}>{a.when}</Mono>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 120 }}>
          <Card t={t}>
            <SectionLabel t={t}>Payment</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Mono t={t} size={26} weight={600} style={{ display: 'block' }}>{formatBaht(total)}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 4 }}>Due in 14 days · {formatDate(inv.dueDate)}</div>
              </div>
              <div style={{ height: 1, background: c.border }} />
              {[
                { label: 'Outstanding', val: total },
                { label: 'Paid',        val: 0 },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: c.ink3 }}>{r.label}</span>
                  <Mono t={t} size={12} weight={500}>{formatBaht(r.val)}</Mono>
                </div>
              ))}
              <Btn t={t} variant="accent" style={{ padding: '9px 14px', fontSize: 13, marginTop: 4 }}>Record payment</Btn>
            </div>
          </Card>

          <Card t={t}>
            <SectionLabel t={t}>Customer summary</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Lifetime revenue',    v: formatBaht(2840000) },
                { l: 'Open invoices',       v: '3' },
                { l: 'Avg. payment terms',  v: '12.4 days' },
                { l: 'Credit limit',        v: formatBaht(500000) },
                { l: 'Credit used',         v: formatBaht(324600) },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, color: c.ink3 }}>{r.l}</span>
                  <Mono t={t} size={12} weight={500}>{r.v}</Mono>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

window.InvoiceScreen = InvoiceScreen;
