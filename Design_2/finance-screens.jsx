/* finance-screens.jsx — P&L Report, Expenses, Budget */

// ── P&L Report ───────────────────────────────────────────────
function PnlScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const p = m.pnl;

  const sum = (arr, k) => arr.reduce((s, r) => s + r[k], 0);
  const revCur = sum(p.revenue, 'cur'), revPrev = sum(p.revenue, 'prev');
  const cogsCur = sum(p.cogs, 'cur'), cogsPrev = sum(p.cogs, 'prev');
  const opexCur = sum(p.opex, 'cur'), opexPrev = sum(p.opex, 'prev');
  const grossCur = revCur - cogsCur, grossPrev = revPrev - cogsPrev;
  const netCur = grossCur - opexCur, netPrev = grossPrev - opexPrev;

  const Row = ({ label, en, cur, prev, kind }) => {
    const delta = prev ? ((cur - prev) / prev) * 100 : 0;
    const isHead = kind === 'head';
    const isSub = kind === 'sub';
    return (
      <tr style={{ background: isHead ? c.subtle : 'transparent' }}>
        <td style={{
          padding: isHead ? '14px 24px' : '10px 24px',
          paddingLeft: isSub ? 44 : 24,
          borderBottom: `1px solid ${c.border}`,
        }}>
          <span style={{
            fontSize: isHead ? 13 : 13,
            fontWeight: isHead ? 600 : isSub ? 400 : 500,
            color: isSub ? c.ink2 : c.ink,
            letterSpacing: '-0.005em',
          }}>{label}</span>
          {en && <span style={{ fontSize: 11, color: c.ink3, marginLeft: 8 }}>{en}</span>}
        </td>
        <td style={{ padding: isHead ? '14px 24px' : '10px 24px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          <Mono t={t} size={13} weight={isHead ? 600 : isSub ? 400 : 500} color={isSub ? c.ink2 : c.ink}>{formatBaht(cur)}</Mono>
        </td>
        <td style={{ padding: isHead ? '14px 24px' : '10px 24px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          <Mono t={t} size={12} color={c.ink3}>{formatBaht(prev)}</Mono>
        </td>
        <td style={{ padding: isHead ? '14px 24px' : '10px 24px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          {prev ? <Mono t={t} size={12} weight={500} color={delta >= 0 ? (kind==='cost'?c.neg:c.pos) : (kind==='cost'?c.pos:c.neg)}>{delta >= 0 ? '+' : '−'}{Math.abs(delta).toFixed(1)}%</Mono> : <span style={{ color: c.ink4 }}>—</span>}
        </td>
      </tr>
    );
  };

  const TotalRow = ({ label, cur, prev, accent }) => {
    const delta = prev ? ((cur - prev) / prev) * 100 : 0;
    return (
      <tr style={{ background: accent ? c.accentBg : c.subtle }}>
        <td style={{ padding: '16px 24px', borderTop: `1px solid ${c.borderStrong}`, borderBottom: `1px solid ${c.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: accent ? c.accent : c.ink, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</span>
        </td>
        <td style={{ padding: '16px 24px', borderTop: `1px solid ${c.borderStrong}`, borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          <Mono t={t} size={16} weight={600} color={accent ? c.accent : c.ink}>{formatBaht(cur)}</Mono>
        </td>
        <td style={{ padding: '16px 24px', borderTop: `1px solid ${c.borderStrong}`, borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          <Mono t={t} size={13} color={c.ink3}>{formatBaht(prev)}</Mono>
        </td>
        <td style={{ padding: '16px 24px', borderTop: `1px solid ${c.borderStrong}`, borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          <Mono t={t} size={13} weight={600} color={delta >= 0 ? c.pos : c.neg}>{delta >= 0 ? '+' : '−'}{Math.abs(delta).toFixed(1)}%</Mono>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy', 'Finance', 'P&L Report']}
        title="Profit & Loss"
        subtitle="งบกำไรขาดทุน · พฤษภาคม 2026 เทียบกับ เมษายน 2026"
        right={<React.Fragment>
          <Btn t={t} variant="ghost">Export PDF</Btn>
          <Btn t={t} variant="ghost">May 2026 ▾</Btn>
        </React.Fragment>} />

      <div style={{ padding: '24px 32px 48px' }}>
        {/* Summary tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { l: 'Total revenue', v: revCur, d: ((revCur-revPrev)/revPrev)*100 },
            { l: 'Gross profit',  v: grossCur, d: ((grossCur-grossPrev)/grossPrev)*100, sub: `${(grossCur/revCur*100).toFixed(1)}% margin` },
            { l: 'Operating exp.',v: opexCur, d: ((opexCur-opexPrev)/opexPrev)*100, cost: true },
            { l: 'Net profit',    v: netCur, d: ((netCur-netPrev)/netPrev)*100, primary: true, sub: `${(netCur/revCur*100).toFixed(1)}% net margin` },
          ].map((s, i) => (
            <div key={s.l} style={{
              background: s.primary ? c.accentBg : c.surface,
              border: `1px solid ${s.primary ? c.accent : c.border}`,
              borderRadius: t.radius, padding: '18px 20px 20px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{s.l}</div>
              <Mono t={t} size={24} weight={600} color={s.primary ? c.accent : c.ink} style={{ display: 'block', marginTop: 12, letterSpacing: '-0.02em' }}>{formatBaht(s.v)}</Mono>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <Mono t={t} size={11} weight={500} color={s.d >= 0 ? (s.cost?c.neg:c.pos) : (s.cost?c.pos:c.neg)}>{s.d >= 0 ? '↑' : '↓'} {Math.abs(s.d).toFixed(1)}%</Mono>
                <span style={{ fontSize: 11, color: c.ink3 }}>{s.sub || 'vs Apr'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Statement table */}
        <Card t={t} pad={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
            <thead>
              <tr>
                {[{l:'Account'},{l:'May 2026',r:true},{l:'Apr 2026',r:true},{l:'Change',r:true}].map(h => (
                  <th key={h.l} style={{
                    textAlign: h.r ? 'right' : 'left', padding: '12px 24px',
                    fontSize: 10, fontWeight: 500, color: c.ink3,
                    letterSpacing: '0.10em', textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.borderStrong}`, background: c.canvas,
                  }}>{h.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="รายได้" en="Revenue" cur={revCur} prev={revPrev} kind="head" />
              {p.revenue.map(r => <Row key={r.en} {...r} kind="sub" />)}
              <Row label="ต้นทุนขาย" en="Cost of goods sold" cur={cogsCur} prev={cogsPrev} kind="head" />
              {p.cogs.map(r => <Row key={r.en} {...r} kind="cost" />)}
              <TotalRow label="กำไรขั้นต้น · Gross profit" cur={grossCur} prev={grossPrev} />
              <Row label="ค่าใช้จ่ายดำเนินงาน" en="Operating expenses" cur={opexCur} prev={opexPrev} kind="head" />
              {p.opex.map(r => <Row key={r.en} {...r} kind="cost" />)}
              <TotalRow label="กำไรสุทธิ · Net profit" cur={netCur} prev={netPrev} accent />
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ── Expenses ─────────────────────────────────────────────────
function ExpensesScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const total = m.expenses.reduce((s, e) => s + e.amount, 0);
  const pending = m.expenses.filter(e => e.status === 'pending' || e.status === 'overdue').reduce((s,e)=>s+e.amount,0);

  // Category breakdown
  const byCat = {};
  m.expenses.forEach(e => { byCat[e.cat] = (byCat[e.cat] || 0) + e.amount; });
  const cats = Object.entries(byCat).sort((a,b) => b[1]-a[1]).slice(0, 5);
  const maxCat = cats[0][1];

  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy', 'Finance', 'Expenses']}
        title="Expenses"
        subtitle={`ค่าใช้จ่าย · ${m.expenses.length} รายการ · ${formatBaht(total)} เดือนนี้`}
        right={<React.Fragment>
          <Btn t={t} variant="ghost">Export</Btn>
          <Btn t={t} variant="primary">+ Record Expense</Btn>
        </React.Fragment>} />

      <div style={{ padding: '24px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 24, marginBottom: 16, alignItems: 'stretch' }}>
          {/* Summary */}
          <Card t={t} pad={false}>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', height: '100%' }}>
              <div style={{ padding: '18px 22px', borderBottom: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>Total · MTD</div>
                <Mono t={t} size={24} weight={600} style={{ display: 'block', marginTop: 8 }}>{formatBaht(total)}</Mono>
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>Unpaid</div>
                <Mono t={t} size={24} weight={600} color={c.warn} style={{ display: 'block', marginTop: 8 }}>{formatBaht(pending)}</Mono>
              </div>
            </div>
          </Card>
          {/* Category bars */}
          <Card t={t}>
            <SectionLabel t={t}>By Category · MTD</SectionLabel>
            <div>
              {cats.map(([name, val]) => (
                <div key={name} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px', alignItems: 'center', gap: 14, padding: '7px 0' }}>
                  <span style={{ fontSize: 13, color: c.ink, fontWeight: 500 }}>{name}</span>
                  <div style={{ height: 8, background: c.subtle, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${(val/maxCat)*100}%`, height: '100%', background: c.expense, borderRadius: 999 }} />
                  </div>
                  <Mono t={t} size={12} weight={500} style={{ textAlign: 'right' }}>{formatBaht(val)}</Mono>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card t={t} pad={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
            <thead>
              <tr>
                {[{l:'Ref'},{l:'Date'},{l:'Vendor'},{l:'Category'},{l:'Method'},{l:'Amount',r:true},{l:'Status'}].map((h,i) => (
                  <th key={h.l} style={{ textAlign: h.r?'right':'left', padding: '11px 22px', fontSize: 10, fontWeight: 500, color: c.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, background: c.canvas }}>{h.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.expenses.map((e, i) => (
                <tr key={e.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = c.subtle}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '13px 22px', borderBottom: i<m.expenses.length-1?`1px solid ${c.border}`:'none' }}><Mono t={t} size={12} weight={500}>{e.id}</Mono></td>
                  <td style={{ padding: '13px 22px', borderBottom: i<m.expenses.length-1?`1px solid ${c.border}`:'none' }}><Mono t={t} size={12} color={c.ink2}>{formatDateShort(e.date)}</Mono></td>
                  <td style={{ padding: '13px 22px', borderBottom: i<m.expenses.length-1?`1px solid ${c.border}`:'none' }}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{e.vendor}</span></td>
                  <td style={{ padding: '13px 22px', borderBottom: i<m.expenses.length-1?`1px solid ${c.border}`:'none' }}><span style={{ fontSize: 12, color: c.ink2 }}>{e.cat}</span></td>
                  <td style={{ padding: '13px 22px', borderBottom: i<m.expenses.length-1?`1px solid ${c.border}`:'none' }}><span style={{ fontSize: 12, color: c.ink3 }}>{e.method}</span></td>
                  <td style={{ padding: '13px 22px', borderBottom: i<m.expenses.length-1?`1px solid ${c.border}`:'none', textAlign: 'right' }}><Mono t={t} size={13} weight={600}>{formatBaht(e.amount)}</Mono></td>
                  <td style={{ padding: '13px 22px', borderBottom: i<m.expenses.length-1?`1px solid ${c.border}`:'none' }}><StatusPill t={t} status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ── Budget ───────────────────────────────────────────────────
function BudgetScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const totalBudget = m.budget.reduce((s,b)=>s+b.budget,0);
  const totalActual = m.budget.reduce((s,b)=>s+b.actual,0);
  const usedPct = (totalActual/totalBudget)*100;

  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy', 'Finance', 'Budget']}
        title="Budget"
        subtitle="งบประมาณ · พฤษภาคม 2026"
        right={<Btn t={t} variant="primary">Adjust Budget</Btn>} />

      <div style={{ padding: '24px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { l: 'Total budget', v: totalBudget, sub: 'allocated' },
            { l: 'Actual spend', v: totalActual, sub: `${usedPct.toFixed(1)}% used`, tone: usedPct > 100 ? c.neg : c.ink },
            { l: 'Remaining',    v: totalBudget - totalActual, sub: 'available', tone: (totalBudget-totalActual) < 0 ? c.neg : c.pos },
          ].map(s => (
            <div key={s.l} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: t.radius, padding: '18px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{s.l}</div>
              <Mono t={t} size={24} weight={600} color={s.tone || c.ink} style={{ display: 'block', marginTop: 10 }}>{formatBaht(s.v)}</Mono>
              <div style={{ fontSize: 11, color: c.ink3, marginTop: 6 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <Card t={t} pad={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
            <thead>
              <tr>
                {[{l:'Category'},{l:'Budget',r:true},{l:'Actual',r:true},{l:'Usage'},{l:'Variance',r:true}].map(h => (
                  <th key={h.l} style={{ textAlign: h.r?'right':'left', padding: '11px 24px', fontSize: 10, fontWeight: 500, color: c.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, background: c.canvas }}>{h.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.budget.map((b, i) => {
                const pct = (b.actual/b.budget)*100;
                const over = b.actual > b.budget;
                const variance = b.budget - b.actual;
                const barColor = over ? c.neg : pct > 90 ? c.warn : c.pos;
                return (
                  <tr key={b.en}>
                    <td style={{ padding: '14px 24px', borderBottom: i<m.budget.length-1?`1px solid ${c.border}`:'none' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{b.cat}</span>
                      <span style={{ fontSize: 11, color: c.ink3, marginLeft: 8 }}>{b.en}</span>
                    </td>
                    <td style={{ padding: '14px 24px', borderBottom: i<m.budget.length-1?`1px solid ${c.border}`:'none', textAlign: 'right' }}><Mono t={t} size={12} color={c.ink2}>{formatBaht(b.budget)}</Mono></td>
                    <td style={{ padding: '14px 24px', borderBottom: i<m.budget.length-1?`1px solid ${c.border}`:'none', textAlign: 'right' }}><Mono t={t} size={13} weight={600}>{formatBaht(b.actual)}</Mono></td>
                    <td style={{ padding: '14px 24px', borderBottom: i<m.budget.length-1?`1px solid ${c.border}`:'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                        <div style={{ flex: 1, height: 6, background: c.subtle, borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barColor }} />
                        </div>
                        <Mono t={t} size={11} weight={500} color={barColor} style={{ minWidth: 42, textAlign: 'right' }}>{pct.toFixed(0)}%</Mono>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px', borderBottom: i<m.budget.length-1?`1px solid ${c.border}`:'none', textAlign: 'right' }}>
                      <Mono t={t} size={12} weight={500} color={variance >= 0 ? c.pos : c.neg}>{variance >= 0 ? '+' : '−'}{formatBaht(Math.abs(variance)).replace('฿','฿')}</Mono>
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

window.PnlScreen = PnlScreen;
window.ExpensesScreen = ExpensesScreen;
window.BudgetScreen = BudgetScreen;
