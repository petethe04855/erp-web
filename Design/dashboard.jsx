/* dashboard.jsx — premium finance-grade dashboard */

function KpiTile({ t, label, value, sub, delta, primary }) {
  const c = t.color;
  const deltaColor = delta == null ? c.ink3 : delta >= 0 ? c.pos : c.neg;
  return (
    <div style={{
      background: primary ? c.subtle : c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: t.radius,
      padding: '20px 22px 22px',
      display: 'flex', flexDirection: 'column',
      minHeight: 132,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 500, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: c.ink3,
      }}>{label}</div>
      <div style={{
        marginTop: 14,
        fontFamily: t.font.sans,
        fontSize: 30,
        fontWeight: 600,
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
        color: c.ink,
        lineHeight: 1.05,
      }}>{value}</div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 'auto', paddingTop: 16,
      }}>
        {delta != null && (
          <span style={{
            fontFamily: t.font.mono,
            fontSize: 11,
            fontWeight: 500,
            color: deltaColor,
            fontVariantNumeric: 'tabular-nums',
          }}>{delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%</span>
        )}
        <span style={{ fontSize: 11, color: c.ink3 }}>{sub}</span>
      </div>
    </div>
  );
}

function CashFlowChart({ t, data, height = 280 }) {
  const c = t.color;
  const w = 900, padL = 56, padR = 16, padT = 24, padB = 30;
  const innerW = w - padL - padR, innerH = height - padT - padB;
  const max = Math.max(...data.map(d => Math.max(d.rev, d.exp))) * 1.12;
  const niceStep = (() => {
    const target = max / 4;
    const pow = Math.pow(10, Math.floor(Math.log10(target)));
    const n = target / pow;
    const m = n >= 5 ? 5 : n >= 2 ? 2 : 1;
    return m * pow;
  })();
  const yMax = Math.ceil(max / niceStep) * niceStep;
  const ticks = []; for (let v = 0; v <= yMax; v += niceStep) ticks.push(v);
  const fmtK = (v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v/1000)}K` : v;

  const slot = innerW / data.length;
  const barW = Math.min((slot - 4) / 2, 8);
  const yOf = (v) => padT + (1 - v / yMax) * innerH;

  // 7-day moving average of net
  const ma = data.map((_, i) => {
    const lo = Math.max(0, i - 3), hi = Math.min(data.length - 1, i + 3);
    let s = 0, n = 0;
    for (let k = lo; k <= hi; k++) { s += (data[k].rev - data[k].exp); n++; }
    return s / n;
  });
  const xCenter = (i) => padL + slot * (i + 0.5);
  const yMA = (v) => padT + (1 - v / yMax) * innerH;
  const maPath = ma.map((v, i) => `${i ? 'L' : 'M'}${xCenter(i).toFixed(1)},${yMA(v).toFixed(1)}`).join(' ');

  // Peak detection
  const peakIdx = data.reduce((best, d, i) => d.rev > data[best].rev ? i : best, 0);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={c.accent} stopOpacity={1} />
          <stop offset="100%" stopColor={c.accent} stopOpacity={t.isDark ? 0.45 : 0.55} />
        </linearGradient>
        <linearGradient id="expBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={c.expense} stopOpacity={1} />
          <stop offset="100%" stopColor={c.expense} stopOpacity={t.isDark ? 0.45 : 0.55} />
        </linearGradient>
      </defs>

      {/* Y gridlines + labels */}
      {ticks.map((v, i) => {
        const y = yOf(v);
        return (
          <g key={i}>
            <line x1={padL} x2={padL + innerW} y1={y} y2={y}
              stroke={c.border} strokeWidth={0.6}
              strokeDasharray={v === 0 ? 'none' : '2 5'} />
            <text x={padL - 10} y={y + 3.5}
              fontSize={10} fill={c.ink3}
              fontFamily={t.font.mono}
              textAnchor="end">฿{fmtK(v)}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const cx = xCenter(i);
        const isPeak = i === peakIdx;
        const yRev = yOf(d.rev), yExp = yOf(d.exp), yZero = yOf(0);
        return (
          <g key={i}>
            <rect x={cx - barW - 1} y={yRev} width={barW} height={yZero - yRev}
              fill="url(#revBarGrad)" rx={1} />
            <rect x={cx + 1} y={yExp} width={barW} height={yZero - yExp}
              fill="url(#expBarGrad)" rx={1} opacity={0.85} />
            {isPeak && (
              <line x1={cx} x2={cx} y1={yRev - 8} y2={yRev - 2}
                stroke={c.accent} strokeWidth={1} />
            )}
          </g>
        );
      })}

      {/* 7-day moving average line — subtle ink, behind bars feel */}
      <path d={maPath} stroke={c.ink2} strokeWidth={1.25} fill="none"
        strokeDasharray="0" strokeLinecap="round" strokeLinejoin="round" opacity={0.45} />

      {/* Peak annotation */}
      {(() => {
        const cx = xCenter(peakIdx);
        const cy = yOf(data[peakIdx].rev);
        const labelX = Math.min(cx + 10, padL + innerW - 90);
        const labelY = Math.max(cy - 28, padT + 4);
        return (
          <g>
            <line x1={cx} x2={labelX} y1={cy - 6} y2={labelY + 14}
              stroke={c.ink3} strokeWidth={0.6} strokeDasharray="2 3" opacity={0.6} />
            <rect x={labelX} y={labelY} width={86} height={22}
              fill={c.surface} stroke={c.border} strokeWidth={1} rx={4} />
            <text x={labelX + 8} y={labelY + 14}
              fontSize={10} fontFamily={t.font.mono} fill={c.ink}
              fontWeight={600}>Peak ฿{fmtK(data[peakIdx].rev)}</text>
          </g>
        );
      })()}

      {/* X labels */}
      {[0, Math.floor(data.length/4), Math.floor(data.length/2), Math.floor(data.length*3/4), data.length-1].map(i => (
        <text key={i} x={xCenter(i)} y={height - 10}
          fontSize={10} fill={c.ink3}
          fontFamily={t.font.mono}
          textAnchor="middle">
          May {String(i+1).padStart(2,'0')}
        </text>
      ))}
    </svg>
  );
}

function ChannelBar({ t, item, max }) {
  const c = t.color;
  const pct = (item.rev / max) * 100;
  const dColor = item.delta >= 0 ? c.pos : c.neg;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px 70px', alignItems: 'center', gap: 14, padding: '10px 0' }}>
      <div style={{ fontSize: 13, color: c.ink, fontWeight: 500, letterSpacing: '-0.005em' }}>{item.name}</div>
      <div style={{ height: 8, background: c.subtle, borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: c.accent,
          borderRadius: 999,
        }} />
      </div>
      <Mono t={t} size={13} weight={500}>{formatBaht(item.rev)}</Mono>
      <Mono t={t} size={11} weight={500} color={dColor} style={{ textAlign: 'right' }}>
        {item.delta >= 0 ? '+' : '−'}{Math.abs(item.delta).toFixed(1)}%
      </Mono>
    </div>
  );
}

function AlertRow({ t, alert, divider }) {
  const c = t.color;
  const sev = alert.sev;
  const color = sev === 'high' ? c.neg : sev === 'med' ? c.warn : c.ink3;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center', gap: 14,
      padding: '14px 0',
      borderTop: divider ? `1px solid ${c.border}` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 80 }}>
        <Dot color={color} size={6} />
        <span style={{ fontSize: 10, color: color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
          {sev === 'high' ? 'Critical' : sev === 'med' ? 'Warning' : 'Notice'}
        </span>
      </div>
      <div>
        <div style={{ fontSize: 13, color: c.ink, fontWeight: 500, letterSpacing: '-0.005em' }}>{alert.title}</div>
        <div style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>{alert.meta}</div>
      </div>
      <Mono t={t} size={11} color={c.ink3}>{alert.age}</Mono>
    </div>
  );
}

function PnlBars({ t, data }) {
  const c = t.color;
  const max = Math.max(...data.map(d => d.rev));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140, padding: '10px 0 0' }}>
      {data.map(d => {
        const revH = (d.rev / max) * 110;
        const netH = (d.net / max) * 110;
        return (
          <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 110, width: '100%', justifyContent: 'center' }}>
              <div style={{ width: '38%', height: revH, background: c.subtle, border: `1px solid ${c.border}`, borderRadius: 2 }} title={`Revenue ${formatBahtK(d.rev)}`}/>
              <div style={{ width: '38%', height: netH, background: c.accent, borderRadius: 2 }} title={`Profit ${formatBahtK(d.net)}`}/>
            </div>
            <Mono t={t} size={10} color={c.ink3}>{d.month}</Mono>
          </div>
        );
      })}
    </div>
  );
}

function Dashboard({ t, onNavigate }) {
  const c = t.color;
  const m = window.mockData;
  const k = m.kpi;
  const maxChan = Math.max(...m.channels.map(c => c.rev));

  return (
    <div>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Dashboard']}
        title="Good morning, ภัทรพล"
        subtitle={`${formatDate(new Date())} · ภาพรวมระบบ Chawy ERP`}
        right={
          <React.Fragment>
            <Btn t={t} variant="ghost">Export</Btn>
            <Btn t={t} variant="ghost">May 2026 ▾</Btn>
            <Btn t={t} variant="primary">+ New Order</Btn>
          </React.Fragment>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        {/* KPI tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <KpiTile t={t} primary label="Revenue · today"     value={formatBaht(k.revToday.value)}    delta={k.revToday.delta}    sub={k.revToday.sub} />
          <KpiTile t={t}         label="Revenue · MTD"       value={formatBaht(k.revMonth.value)}    delta={k.revMonth.delta}    sub={k.revMonth.sub} />
          <KpiTile t={t}         label="Net profit · MTD"    value={formatBaht(k.profitMonth.value)} delta={k.profitMonth.delta} sub={k.profitMonth.sub} />
          <KpiTile t={t}         label="Cash on hand"        value={formatBaht(k.cashOnHand.value)}  delta={k.cashOnHand.delta}  sub={k.cashOnHand.sub} />
        </div>

        {/* Cash flow card */}
        <Card t={t} style={{ marginBottom: 24, padding: 0 }}>
          {/* Header */}
          <div style={{ padding: '22px 24px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${c.border}` }}>
            <div>
              <SectionLabel t={t} style={{ marginBottom: 4 }}>Cash Flow · 30 Days</SectionLabel>
              <div style={{ fontSize: 13, color: c.ink3 }}>Daily revenue vs expenses · May 2026</div>
            </div>
            <div style={{ display: 'inline-flex', border: `1px solid ${c.border}`, borderRadius: Math.max(t.radius-2, 0), padding: 2, background: c.canvas }}>
              {['7D','30D','90D','12M'].map((p, i) => (
                <button key={p} style={{
                  padding: '5px 12px',
                  fontSize: 11,
                  background: i === 1 ? c.surface : 'transparent',
                  border: i === 1 ? `1px solid ${c.border}` : `1px solid transparent`,
                  color: i === 1 ? c.ink : c.ink3,
                  cursor: 'pointer',
                  borderRadius: Math.max(t.radius - 4, 0),
                  fontFamily: t.font.sans,
                  fontWeight: i === 1 ? 600 : 500,
                  letterSpacing: '-0.005em',
                }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Stat tiles row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${c.border}` }}>
            {(() => {
              const totalRev = m.series30.reduce((s, d) => s + d.rev, 0);
              const totalExp = m.series30.reduce((s, d) => s + d.exp, 0);
              const totalNet = totalRev - totalExp;
              const stats = [
                { label: 'Revenue · MTD',  value: formatBaht(totalRev), delta: +18.7, swatch: c.accent, sub: `${m.series30.length} days` },
                { label: 'Expenses · MTD', value: formatBaht(totalExp), delta: +6.2,  swatch: c.expense, sub: `${(totalExp/totalRev*100).toFixed(1)}% of revenue` },
                { label: 'Net cash flow',  value: formatBaht(totalNet), delta: +24.1, swatch: null,     sub: `${(totalNet/totalRev*100).toFixed(1)}% margin` },
              ];
              return stats.map((s, i) => (
                <div key={s.label} style={{
                  padding: '20px 24px 22px',
                  borderRight: i < 2 ? `1px solid ${c.border}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    {s.swatch ? <span style={{ width: 10, height: 10, background: s.swatch, borderRadius: 2, display: 'inline-block' }} /> : null}
                    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{s.label}</span>
                  </div>
                  <Mono t={t} size={24} weight={600} style={{ display: 'block', letterSpacing: '-0.02em' }}>{s.value}</Mono>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
                    <Mono t={t} size={11} weight={500} color={s.delta >= 0 ? c.pos : c.neg}>
                      {s.delta >= 0 ? '↑' : '↓'} {Math.abs(s.delta).toFixed(1)}%
                    </Mono>
                    <span style={{ fontSize: 11, color: c.ink3 }}>{s.sub}</span>
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Chart */}
          <div style={{ padding: '12px 16px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '4px 8px 8px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 16, background: c.accent, borderRadius: 2, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: c.ink, fontWeight: 500 }}>รายรับ</span>
                <span style={{ fontSize: 11, color: c.ink3 }}>Revenue · แท่งซ้าย</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 16, background: c.expense, borderRadius: 2, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: c.ink, fontWeight: 500 }}>รายจ่าย</span>
                <span style={{ fontSize: 11, color: c.ink3 }}>Expenses · แท่งขวา</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 2, background: c.ink2, opacity: 0.5, borderRadius: 2, display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: c.ink3 }}>ค่าเฉลี่ยกำไร 7 วัน</span>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 11, color: c.ink3 }}>ยิ่งแท่งสูง = ยอดยิ่งมาก</div>
            </div>
            <CashFlowChart t={t} data={m.series30} />
          </div>

          {/* Weekly breakdown strip */}
          <div style={{ borderTop: `1px solid ${c.border}`, padding: '14px 24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
            {(() => {
              const weeks = [];
              for (let i = 0; i < m.series30.length; i += 7) {
                const slice = m.series30.slice(i, i + 7);
                weeks.push({
                  label: `Week ${Math.floor(i/7) + 1}`,
                  range: `May ${slice[0].d}–${slice[slice.length-1].d}`,
                  rev: slice.reduce((s,d)=>s+d.rev,0),
                  exp: slice.reduce((s,d)=>s+d.exp,0),
                });
              }
              return weeks.slice(0, 5).map((w, i) => (
                <div key={w.label} style={{
                  paddingRight: 16,
                  borderRight: i < 4 ? `1px solid ${c.border}` : 'none',
                  paddingLeft: i === 0 ? 0 : 16,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.ink3 }}>{w.label}</div>
                  <Mono t={t} size={11} color={c.ink3} style={{ display: 'block', marginTop: 2 }}>{w.range}</Mono>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                    <Mono t={t} size={14} weight={600}>{formatBahtK(w.rev - w.exp)}</Mono>
                    <span style={{ fontSize: 10, color: c.ink3 }}>net</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </Card>

        {/* Channels + Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginBottom: 24 }}>
          <Card t={t}>
            <SectionLabel t={t} action={
              <button onClick={() => onNavigate('sales')} style={{ fontSize: 11, color: c.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: t.font.sans, fontWeight: 500 }}>
                View all →
              </button>
            }>Revenue by Channel · MTD</SectionLabel>
            <div style={{ marginTop: 4 }}>
              {m.channels.map(item => <ChannelBar key={item.name} t={t} item={item} max={maxChan} />)}
            </div>
          </Card>

          <Card t={t}>
            <SectionLabel t={t} action={
              <Mono t={t} size={11} color={c.ink3}>{m.alerts.length} active</Mono>
            }>Alerts</SectionLabel>
            <div>
              {m.alerts.map((a, i) => <AlertRow key={i} t={t} alert={a} divider={i > 0} />)}
            </div>
          </Card>
        </div>

        {/* P&L 6-month */}
        <Card t={t}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <SectionLabel t={t} style={{ marginBottom: 6 }}>Profit & Loss · 6 Months</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <div>
                  <span style={{ fontSize: 11, color: c.ink3 }}>Net margin</span>
                  <Mono t={t} size={20} weight={600} style={{ marginLeft: 10 }}>46.5%</Mono>
                </div>
                <span style={{ fontSize: 12, color: c.pos, fontFamily: t.font.mono }}>+10.2 pp YoY</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: c.subtle, border: `1px solid ${c.border}`, display: 'inline-block', borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: c.ink2 }}>Revenue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: c.accent, display: 'inline-block', borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: c.ink2 }}>Net profit</span>
              </div>
              <button onClick={() => onNavigate('pl')} style={{ fontSize: 11, color: c.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: t.font.sans, fontWeight: 500 }}>
                Open P&L →
              </button>
            </div>
          </div>
          <PnlBars t={t} data={m.pnl6} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
            {m.pnl6.map(d => (
              <div key={d.month} style={{ textAlign: 'left' }}>
                <Mono t={t} size={13} weight={600}>{formatBahtK(d.net)}</Mono>
                <div style={{ fontSize: 10, color: c.ink3, marginTop: 2, fontFamily: t.font.mono }}>{d.mPct}% margin</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
