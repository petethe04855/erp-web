/* sales-orders.jsx — sales order list */

function SalesOrdersScreen({ t, onNavigate }) {
  const c = t.color;
  const m = window.mockData;
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const filtered = m.salesOrders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !(o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const counts = {
    all: m.salesOrders.length,
    pending: m.salesOrders.filter(o => o.status === 'pending').length,
    processing: m.salesOrders.filter(o => o.status === 'processing').length,
    shipped: m.salesOrders.filter(o => o.status === 'shipped').length,
    completed: m.salesOrders.filter(o => o.status === 'completed').length,
  };
  const totalAmount = filtered.reduce((s, o) => s + o.amount, 0);

  return (
    <div>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Sales', 'Orders']}
        title="Sales Orders"
        subtitle={`${m.salesOrders.length} orders · ${formatBaht(m.salesOrders.reduce((s,o)=>s+o.amount, 0))} total`}
        right={
          <React.Fragment>
            <Btn t={t} variant="ghost">Export CSV</Btn>
            <Btn t={t} variant="primary">+ New Order</Btn>
          </React.Fragment>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
          <div style={{ display: 'flex', gap: 0, border: `1px solid ${c.border}`, borderRadius: t.radius, overflow: 'hidden', background: c.surface }}>
            {[
              { k: 'all',        label: 'All',         n: counts.all },
              { k: 'pending',    label: 'Pending',     n: counts.pending },
              { k: 'processing', label: 'Processing',  n: counts.processing },
              { k: 'shipped',    label: 'Shipped',     n: counts.shipped },
              { k: 'completed',  label: 'Completed',   n: counts.completed },
            ].map((f, i) => (
              <button key={f.k} onClick={() => setFilter(f.k)} style={{
                padding: '7px 14px',
                background: filter === f.k ? c.subtle : 'transparent',
                color: filter === f.k ? c.ink : c.ink2,
                border: 'none',
                borderLeft: i === 0 ? 'none' : `1px solid ${c.border}`,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: filter === f.k ? 600 : 500,
                fontFamily: t.font.sans,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                letterSpacing: '-0.005em',
              }}>
                {f.label}
                <span style={{
                  fontFamily: t.font.mono,
                  fontSize: 10,
                  color: filter === f.k ? c.ink2 : c.ink3,
                  background: filter === f.k ? c.surface : c.subtle,
                  padding: '1px 6px',
                  borderRadius: 4,
                }}>{f.n}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหา order หรือ ลูกค้า…"
              style={{
                padding: '7px 12px',
                fontSize: 12,
                fontFamily: t.font.sans,
                background: c.surface,
                color: c.ink,
                border: `1px solid ${c.border}`,
                borderRadius: t.radius,
                width: 240,
                outline: 'none',
              }}
            />
            <Btn t={t} variant="ghost">Filters</Btn>
          </div>
        </div>

        {/* Summary strip */}
        <Card t={t} pad={false} style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { label: 'Selection total', value: formatBaht(totalAmount), sub: `${filtered.length} orders` },
              { label: 'Average order',   value: formatBaht(filtered.length ? totalAmount / filtered.length : 0), sub: 'per order' },
              { label: 'Items shipped',   value: formatNum(filtered.reduce((s,o)=>s+o.items, 0)), sub: 'across selection' },
              { label: 'Largest order',   value: formatBaht(Math.max(...(filtered.length?filtered.map(o=>o.amount):[0]))), sub: 'in selection' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '16px 22px',
                borderRight: i < 3 ? `1px solid ${c.border}` : 'none',
              }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{s.label}</div>
                <Mono t={t} size={20} weight={600} style={{ display: 'block', marginTop: 8 }}>{s.value}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Table */}
        <Card t={t} pad={false}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: t.font.sans,
          }}>
            <thead>
              <tr>
                {['Order', 'Customer', 'Channel', 'Date', 'Items', 'Amount', 'Status', ''].map((h, i) => (
                  <th key={h+i} style={{
                    textAlign: i === 4 || i === 5 ? 'right' : 'left',
                    padding: '11px 22px',
                    fontSize: 10,
                    fontWeight: 500,
                    color: c.ink3,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.border}`,
                    background: c.canvas,
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} style={{
                  cursor: 'pointer',
                  transition: 'background 100ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = c.subtle}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => o.id === 'SO-2026-0418' ? onNavigate('invoice') : null}
                >
                  <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <Mono t={t} size={12} weight={500}>{o.id}</Mono>
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: c.ink, letterSpacing: '-0.005em' }}>{o.customer}</div>
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <span style={{ fontSize: 12, color: c.ink2 }}>{o.channel}</span>
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <Mono t={t} size={12} color={c.ink2}>{formatDateShort(o.date)}</Mono>
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}>
                    <Mono t={t} size={12} color={c.ink2}>{o.items}</Mono>
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}>
                    <Mono t={t} size={13} weight={600}>{formatBaht(o.amount)}</Mono>
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <StatusPill t={t} status={o.status} />
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}>
                    <span style={{ fontSize: 13, color: c.ink3, letterSpacing: '0.05em' }}>›</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: c.ink3, fontSize: 13 }}>
              ไม่พบ order ที่ตรงกับเงื่อนไข
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

window.SalesOrdersScreen = SalesOrdersScreen;
