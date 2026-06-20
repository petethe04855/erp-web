/* warehouse-screens.jsx — Returns, Purchase Req, Goods Receive, Goods Issue */

// Reuse genericTable from ops-screens.jsx via window
function _table(t, cols, rows, renderRow) {
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

function _statTiles(t, tiles) {
  const c = t.color;
  return (
    <Card t={t} pad={false} style={{ marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tiles.length}, 1fr)` }}>
        {tiles.map((s, i) => (
          <div key={s.l} style={{ padding: '16px 22px', borderRight: i<tiles.length-1?`1px solid ${c.border}`:'none' }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{s.l}</div>
            <Mono t={t} size={20} weight={600} color={s.tone||c.ink} style={{ display: 'block', marginTop: 8 }}>{s.v}</Mono>
            <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>{s.s}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const _cell = (t, last, extra) => ({ padding: '14px 22px', borderBottom: last?'none':`1px solid ${t.color.border}`, ...extra });
const _hoverRow = (c) => ({
  onMouseEnter: e => e.currentTarget.style.background = c.subtle,
  onMouseLeave: e => e.currentTarget.style.background = 'transparent',
  style: { cursor: 'pointer' },
});

// ── Returns / RMA ────────────────────────────────────────────
function ReturnsScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const total = m.returns.reduce((s,r)=>s+r.amount,0);
  const open = m.returns.filter(r => r.status==='pending'||r.status==='processing').length;
  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy','Sales','Returns']}
        title="Returns"
        subtitle={`คืนสินค้า · ${m.returns.length} รายการ · ${formatBaht(total)} มูลค่ารวม`}
        right={<React.Fragment><Btn t={t} variant="ghost">Export</Btn><Btn t={t} variant="primary">+ New Return</Btn></React.Fragment>} />
      <div style={{ padding: '24px 32px 48px' }}>
        {_statTiles(t, [
          { l: 'Total value', v: formatBaht(total), s: 'this month' },
          { l: 'Open RMAs',   v: open.toString(), s: 'awaiting action', tone: open?c.warn:c.ink },
          { l: 'Return rate',  v: '1.8%', s: 'of orders' },
          { l: 'Top reason',  v: 'ชำรุด', s: 'Damaged · 40%' },
        ])}
        {_table(t,
          [{l:'RMA'},{l:'SO Ref'},{l:'Customer'},{l:'Date'},{l:'Reason'},{l:'Qty',r:true},{l:'Amount',r:true},{l:'Status'}],
          m.returns,
          (r, i, last) => (
            <tr key={r.id} {..._hoverRow(c)}>
              <td style={_cell(t,last)}><Mono t={t} size={12} weight={500}>{r.id}</Mono></td>
              <td style={_cell(t,last)}><Mono t={t} size={12} color={c.accent}>{r.soRef}</Mono></td>
              <td style={_cell(t,last)}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{r.customer}</span></td>
              <td style={_cell(t,last)}><Mono t={t} size={12} color={c.ink2}>{formatDateShort(r.date)}</Mono></td>
              <td style={_cell(t,last)}><span style={{ fontSize: 13, color: c.ink }}>{r.reason}</span><span style={{ fontSize: 11, color: c.ink3, marginLeft: 6 }}>{r.en}</span></td>
              <td style={_cell(t,last,{textAlign:'right'})}><Mono t={t} size={12} color={c.ink2}>{r.qty}</Mono></td>
              <td style={_cell(t,last,{textAlign:'right'})}><Mono t={t} size={13} weight={600}>{formatBaht(r.amount)}</Mono></td>
              <td style={_cell(t,last)}><StatusPill t={t} status={r.status} /></td>
            </tr>
          )
        )}
      </div>
    </div>
  );
}

// ── Purchase Requisitions ────────────────────────────────────
function PurchaseReqScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const pending = m.purchaseReqs.filter(p=>p.status==='pending');
  const totalEst = m.purchaseReqs.reduce((s,p)=>s+p.est,0);
  const statusMap = { approved: 'completed', rejected: 'cancelled', pending: 'pending' };
  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy','Purchasing','Purchase Req.']}
        title="Purchase Requisitions"
        subtitle={`ใบขอซื้อ · ${pending.length} รออนุมัติ · ${formatBaht(totalEst)} มูลค่าประมาณ`}
        right={<Btn t={t} variant="primary">+ New Request</Btn>} />
      <div style={{ padding: '24px 32px 48px' }}>
        {_statTiles(t, [
          { l: 'Pending approval', v: pending.length.toString(), s: 'awaiting review', tone: pending.length?c.warn:c.ink },
          { l: 'Est. value',       v: formatBaht(pending.reduce((s,p)=>s+p.est,0)), s: 'pending requests' },
          { l: 'Approved · MTD',   v: m.purchaseReqs.filter(p=>p.status==='approved').length.toString(), s: 'this month' },
          { l: 'Avg. lead time',   v: '4.2 วัน', s: 'request → PO' },
        ])}
        {_table(t,
          [{l:'PR'},{l:'Requester'},{l:'Date'},{l:'Item'},{l:'Quantity'},{l:'Est. value',r:true},{l:'Status'}],
          m.purchaseReqs,
          (p, i, last) => (
            <tr key={p.id} {..._hoverRow(c)}>
              <td style={_cell(t,last)}><Mono t={t} size={12} weight={500}>{p.id}</Mono></td>
              <td style={_cell(t,last)}><span style={{ fontSize: 13, color: c.ink2 }}>{p.requester}</span></td>
              <td style={_cell(t,last)}><Mono t={t} size={12} color={c.ink2}>{formatDateShort(p.date)}</Mono></td>
              <td style={_cell(t,last)}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{p.item}</span></td>
              <td style={_cell(t,last)}><Mono t={t} size={12} color={c.ink2}>{p.qty}</Mono></td>
              <td style={_cell(t,last,{textAlign:'right'})}><Mono t={t} size={13} weight={600}>{formatBaht(p.est)}</Mono></td>
              <td style={_cell(t,last)}>
                {p.status === 'pending'
                  ? <div style={{ display: 'flex', gap: 6 }}>
                      <Btn t={t} variant="accent" style={{ padding: '4px 10px', fontSize: 11 }}>Approve</Btn>
                      <Btn t={t} variant="ghost" style={{ padding: '4px 10px', fontSize: 11 }}>Reject</Btn>
                    </div>
                  : <StatusPill t={t} status={statusMap[p.status]} />}
              </td>
            </tr>
          )
        )}
      </div>
    </div>
  );
}

// ── Goods Receive ────────────────────────────────────────────
function GoodsReceiveScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const total = m.goodsReceipts.reduce((s,g)=>s+g.value,0);
  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy','Inventory','Goods Receive']}
        title="Goods Receive"
        subtitle={`รับสินค้าเข้า · ${m.goodsReceipts.length} รายการ · ${formatBaht(total)} มูลค่ารวม`}
        right={<Btn t={t} variant="primary">+ Receive Goods</Btn>} />
      <div style={{ padding: '24px 32px 48px' }}>
        {_statTiles(t, [
          { l: 'Received · MTD', v: formatBaht(total), s: `${m.goodsReceipts.length} receipts` },
          { l: 'Pending QC',     v: m.goodsReceipts.filter(g=>g.status==='partial').length.toString(), s: 'partial receipts', tone: c.warn },
          { l: 'Suppliers',      v: new Set(m.goodsReceipts.map(g=>g.supplier)).size.toString(), s: 'this month' },
          { l: 'On-time rate',   v: '92%', s: 'vs ETA' },
        ])}
        {_table(t,
          [{l:'GR'},{l:'PO Ref'},{l:'Supplier'},{l:'Date'},{l:'Items',r:true},{l:'Quantity'},{l:'Value',r:true},{l:'Status'}],
          m.goodsReceipts,
          (g, i, last) => (
            <tr key={g.id} {..._hoverRow(c)}>
              <td style={_cell(t,last)}><Mono t={t} size={12} weight={500}>{g.id}</Mono></td>
              <td style={_cell(t,last)}><Mono t={t} size={12} color={c.accent}>{g.poRef}</Mono></td>
              <td style={_cell(t,last)}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{g.supplier}</span></td>
              <td style={_cell(t,last)}><Mono t={t} size={12} color={c.ink2}>{formatDateShort(g.date)}</Mono></td>
              <td style={_cell(t,last,{textAlign:'right'})}><Mono t={t} size={12} color={c.ink2}>{g.items}</Mono></td>
              <td style={_cell(t,last)}><Mono t={t} size={12} color={c.ink2}>{g.qty}</Mono></td>
              <td style={_cell(t,last,{textAlign:'right'})}><Mono t={t} size={13} weight={600}>{formatBaht(g.value)}</Mono></td>
              <td style={_cell(t,last)}><StatusPill t={t} status={g.status==='partial'?'pending':g.status} /></td>
            </tr>
          )
        )}
      </div>
    </div>
  );
}

// ── Goods Issue ──────────────────────────────────────────────
function GoodsIssueScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const total = m.goodsIssues.reduce((s,g)=>s+g.value,0);
  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy','Inventory','Goods Issue']}
        title="Goods Issue"
        subtitle={`เบิกสินค้าออก · ${m.goodsIssues.length} รายการ · ${formatBaht(total)} มูลค่ารวม`}
        right={<Btn t={t} variant="primary">+ Issue Goods</Btn>} />
      <div style={{ padding: '24px 32px 48px' }}>
        {_statTiles(t, [
          { l: 'Issued · MTD',   v: formatBaht(total), s: `${m.goodsIssues.length} issues` },
          { l: 'To production',  v: formatBaht(m.goodsIssues.filter(g=>g.dept==='ฝ่ายผลิต').reduce((s,g)=>s+g.value,0)), s: 'ฝ่ายผลิต' },
          { l: 'Pending',        v: m.goodsIssues.filter(g=>g.status==='pending').length.toString(), s: 'awaiting pick', tone: c.warn },
          { l: 'Departments',    v: new Set(m.goodsIssues.map(g=>g.dept)).size.toString(), s: 'requesting' },
        ])}
        {_table(t,
          [{l:'GI'},{l:'Purpose'},{l:'Department'},{l:'Date'},{l:'Items',r:true},{l:'Quantity'},{l:'Value',r:true},{l:'Status'}],
          m.goodsIssues,
          (g, i, last) => (
            <tr key={g.id} {..._hoverRow(c)}>
              <td style={_cell(t,last)}><Mono t={t} size={12} weight={500}>{g.id}</Mono></td>
              <td style={_cell(t,last)}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{g.purpose}</span></td>
              <td style={_cell(t,last)}><span style={{ fontSize: 12, color: c.ink2 }}>{g.dept}</span></td>
              <td style={_cell(t,last)}><Mono t={t} size={12} color={c.ink2}>{formatDateShort(g.date)}</Mono></td>
              <td style={_cell(t,last,{textAlign:'right'})}><Mono t={t} size={12} color={c.ink2}>{g.items}</Mono></td>
              <td style={_cell(t,last)}><Mono t={t} size={12} color={c.ink2}>{g.qty}</Mono></td>
              <td style={_cell(t,last,{textAlign:'right'})}><Mono t={t} size={13} weight={600}>{formatBaht(g.value)}</Mono></td>
              <td style={_cell(t,last)}><StatusPill t={t} status={g.status} /></td>
            </tr>
          )
        )}
      </div>
    </div>
  );
}

window.ReturnsScreen = ReturnsScreen;
window.PurchaseReqScreen = PurchaseReqScreen;
window.GoodsReceiveScreen = GoodsReceiveScreen;
window.GoodsIssueScreen = GoodsIssueScreen;
