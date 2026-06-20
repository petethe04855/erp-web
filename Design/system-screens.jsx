/* system-screens.jsx — Live & Content, Users, Settings */

const _c2 = (t, last, extra) => ({ padding: '14px 22px', borderBottom: last?'none':`1px solid ${t.color.border}`, ...extra });

// ── Live & Content ───────────────────────────────────────────
function LiveContentScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const ct = m.content;
  const totalReach = ct.posts.reduce((s,p)=>s+p.reach,0);
  const avgEng = ct.posts.reduce((s,p)=>s+p.eng,0)/ct.posts.length;

  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy','Channels','Live & Content']}
        title="Live & Content"
        subtitle="ไลฟ์และคอนเทนต์ · ปฏิทินไลฟ์และผลงานโพสต์"
        right={<React.Fragment><Btn t={t} variant="ghost">Content Calendar</Btn><Btn t={t} variant="primary">+ Schedule Live</Btn></React.Fragment>} />
      <div style={{ padding: '24px 32px 48px' }}>
        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { l: 'Total reach · MTD', v: formatNum(totalReach), s: `${ct.posts.length} posts`, primary: true },
            { l: 'Avg. engagement',  v: `${avgEng.toFixed(1)}%`, s: 'across posts' },
            { l: 'Scheduled lives',  v: ct.schedule.filter(s=>s.status==='scheduled').length.toString(), s: 'upcoming' },
            { l: 'Best post reach',  v: formatNum(Math.max(...ct.posts.map(p=>p.reach))), s: 'top performer' },
          ].map(s => (
            <div key={s.l} style={{ background: s.primary?c.subtle:c.surface, border: `1px solid ${c.border}`, borderRadius: t.radius, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{s.l}</div>
              <Mono t={t} size={24} weight={600} style={{ display: 'block', marginTop: 10 }}>{s.v}</Mono>
              <div style={{ fontSize: 11, color: c.ink3, marginTop: 6 }}>{s.s}</div>
            </div>
          ))}
        </div>

        {/* Upcoming live schedule */}
        <SectionLabel t={t}>Upcoming Live Schedule</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {ct.schedule.map((s, i) => (
            <Card t={t} key={i}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: c.accent, letterSpacing: '0.04em' }}>{s.platform}</span>
                <StatusPill t={t} status={s.status==='scheduled'?'shipped':'draft'} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.ink, letterSpacing: '-0.01em', lineHeight: 1.35, minHeight: 42 }}>{s.topic}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
                <div>
                  <div style={{ fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>วันเวลา</div>
                  <Mono t={t} size={12} weight={500} style={{ marginTop: 2, display: 'block' }}>{formatDateShort(s.date)} · {s.time}</Mono>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Host</div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: c.ink, marginTop: 2, display: 'block' }}>{s.host}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Post performance */}
        <SectionLabel t={t}>Content Performance</SectionLabel>
        <Card t={t} pad={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
            <thead>
              <tr>
                {[{l:'Content'},{l:'Platform'},{l:'Reach',r:true},{l:'Engagement',r:true},{l:'Posted',r:true}].map(h => (
                  <th key={h.l} style={{ textAlign: h.r?'right':'left', padding: '11px 22px', fontSize: 10, fontWeight: 500, color: c.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, background: c.canvas }}>{h.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ct.posts.map((p, i, arr) => {
                const last = i === arr.length-1;
                const maxReach = Math.max(...ct.posts.map(x=>x.reach));
                return (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background=c.subtle} onMouseLeave={e=>e.currentTarget.style.background='transparent'} style={{ cursor: 'pointer' }}>
                    <td style={_c2(t,last)}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{p.title}</span></td>
                    <td style={_c2(t,last)}><span style={{ fontSize: 12, color: c.ink2 }}>{p.platform}</span></td>
                    <td style={_c2(t,last,{textAlign:'right'})}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                        <div style={{ width: 70, height: 6, background: c.subtle, borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${(p.reach/maxReach)*100}%`, height: '100%', background: c.accent }} />
                        </div>
                        <Mono t={t} size={13} weight={600} style={{ minWidth: 60, textAlign: 'right' }}>{formatNum(p.reach)}</Mono>
                      </div>
                    </td>
                    <td style={_c2(t,last,{textAlign:'right'})}><Mono t={t} size={12} weight={500} color={p.eng>=6?c.pos:c.ink2}>{p.eng.toFixed(1)}%</Mono></td>
                    <td style={_c2(t,last,{textAlign:'right'})}><Mono t={t} size={11} color={c.ink3}>{formatDateShort(p.date)}</Mono></td>
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

// ── Users ────────────────────────────────────────────────────
function UsersScreen({ t }) {
  const c = t.color;
  const m = window.mockData;
  const active = m.users.filter(u=>u.active).length;
  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy','System','Users']}
        title="User Management"
        subtitle={`จัดการผู้ใช้ · ${m.users.length} บัญชี · ${active} ใช้งานอยู่`}
        right={<Btn t={t} variant="primary">+ Invite User</Btn>} />
      <div style={{ padding: '24px 32px 48px' }}>
        <Card t={t} pad={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
            <thead>
              <tr>
                {[{l:'User'},{l:'Role'},{l:'Access'},{l:'Last active'},{l:'Status'},{l:''}].map((h,i) => (
                  <th key={h.l+i} style={{ textAlign: 'left', padding: '11px 22px', fontSize: 10, fontWeight: 500, color: c.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, background: c.canvas }}>{h.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.users.map((u, i, arr) => {
                const last = i === arr.length-1;
                const initial = u.name.trim().charAt(0);
                return (
                  <tr key={u.email} onMouseEnter={e=>e.currentTarget.style.background=c.subtle} onMouseLeave={e=>e.currentTarget.style.background='transparent'} style={{ cursor: 'pointer' }}>
                    <td style={_c2(t,last)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.subtle, border: `1px solid ${c.border}`, color: c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{initial}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: c.ink, letterSpacing: '-0.005em' }}>{u.name}</div>
                          <Mono t={t} size={11} color={c.ink3} style={{ marginTop: 1, display: 'block' }}>{u.email}</Mono>
                        </div>
                      </div>
                    </td>
                    <td style={_c2(t,last)}>
                      <span style={{ fontSize: 13, color: c.ink }}>{u.role}</span>
                      <span style={{ fontSize: 11, color: c.ink3, marginLeft: 6 }}>{u.th}</span>
                    </td>
                    <td style={_c2(t,last)}>
                      <span style={{ fontSize: 11, color: c.ink2, background: c.subtle, padding: '3px 9px', borderRadius: 4, border: `1px solid ${c.border}`, fontWeight: 500 }}>{u.access}</span>
                    </td>
                    <td style={_c2(t,last)}><span style={{ fontSize: 12, color: c.ink2 }}>{u.last}</span></td>
                    <td style={_c2(t,last)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: u.active?c.pos:c.ink3 }}>
                        <Dot color={u.active?c.pos:c.ink4} /> {u.active?'Active':'Inactive'}
                      </span>
                    </td>
                    <td style={_c2(t,last,{textAlign:'right'})}><span style={{ fontSize: 13, color: c.ink3 }}>›</span></td>
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

// ── Settings ─────────────────────────────────────────────────
function SettingsScreen({ t }) {
  const c = t.color;
  const m = window.mockData;

  const Field = ({ label, value, sub, last }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, padding: '16px 0', borderBottom: last?'none':`1px solid ${c.border}`, alignItems: 'baseline' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 13, color: c.ink2 }}>{value}</div>
    </div>
  );

  const SettingCard = ({ title, th, children }) => (
    <Card t={t} style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 6, paddingBottom: 14, borderBottom: `1px solid ${c.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: c.ink, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>{th}</div>
      </div>
      {children}
    </Card>
  );

  const Toggle = ({ on }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', width: 36, height: 20, borderRadius: 999, background: on?c.accent:c.borderStrong, padding: 2, transition: 'background 160ms' }}>
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', transform: on?'translateX(16px)':'translateX(0)', transition: 'transform 160ms', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </span>
  );

  return (
    <div>
      <TopBar t={t} breadcrumb={['Chawy','System','Settings']}
        title="Master Settings"
        subtitle="ตั้งค่าหลัก · ข้อมูลบริษัทและการกำหนดค่าระบบ"
        right={<Btn t={t} variant="primary">Save Changes</Btn>} />
      <div style={{ padding: '24px 32px 48px', maxWidth: 820 }}>
        <SettingCard title="Company Profile" th="ข้อมูลบริษัท">
          <Field label="ชื่อบริษัท" value="บริษัท ชาวี เพ็ทฟู้ด จำกัด" />
          <Field label="เลขประจำตัวผู้เสียภาษี" value="0105563012345" />
          <Field label="ที่อยู่" value="88/12 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310" />
          <Field label="โทรศัพท์" value="02-123-4567 · 081-234-5678" last />
        </SettingCard>

        <SettingCard title="Financial" th="การเงินและภาษี">
          <Field label="สกุลเงินหลัก" value="฿ บาทไทย (THB)" />
          <Field label="อัตรา VAT" value="7%" sub="ภาษีมูลค่าเพิ่ม" />
          <Field label="เงื่อนไขชำระเงินเริ่มต้น" value="Net 14 วัน" />
          <Field label="รอบบัญชี" value="มกราคม – ธันวาคม" last />
        </SettingCard>

        <SettingCard title="Notifications" th="การแจ้งเตือน">
          {[
            { label: 'แจ้งเตือนสต็อคต่ำ', sub: 'เมื่อสินค้าต่ำกว่าจุดสั่งซื้อ', on: true },
            { label: 'แจ้งเตือน Invoice เกินกำหนด', sub: 'ส่งอีเมลทุกเช้า 09:00', on: true },
            { label: 'สรุปยอดขายรายวัน', sub: 'ส่งทาง LINE Notify', on: true },
            { label: 'แจ้งเตือน PR รออนุมัติ', sub: 'แจ้งทันทีเมื่อมีคำขอใหม่', on: false },
          ].map((r, i, arr) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i<arr.length-1?`1px solid ${c.border}`:'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{r.label}</div>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>{r.sub}</div>
              </div>
              <Toggle on={r.on} />
            </div>
          ))}
        </SettingCard>
      </div>
    </div>
  );
}

window.LiveContentScreen = LiveContentScreen;
window.UsersScreen = UsersScreen;
window.SettingsScreen = SettingsScreen;
