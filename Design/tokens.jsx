/* tokens.jsx — design tokens, helpers, mock data
   exposes to window: getTokens, formatBaht, formatNum, formatPct, mock */

// ─────────────────────────────────────────────────────────────
// Theme tokens — Stripe / Mercury flavored, finance-grade
// ─────────────────────────────────────────────────────────────
const ACCENTS = {
  jade:   { l: '#0F6E58', d: '#5EC8AD', name: 'Jade'   },
  navy:   { l: '#1E3A8A', d: '#7DA6FF', name: 'Navy'   },
  plum:   { l: '#5B2A86', d: '#C4A1E8', name: 'Plum'   },
  copper: { l: '#A14D1B', d: '#E5A472', name: 'Copper' },
  ink:    { l: '#1A1A1A', d: '#ECEAE3', name: 'Mono'   },
};

function getTokens(opts) {
  const { theme = 'light', accent = 'jade', radius = 6, density = 'regular', tone = 'paper' } = opts || {};
  const isDark = theme === 'dark';
  const a = ACCENTS[accent] || ACCENTS.jade;

  // Density scales
  const dens = density === 'compact' ? { row: 36, padY: 8, padX: 14, gap: 4 }
            : density === 'comfy'   ? { row: 52, padY: 14, padX: 20, gap: 12 }
            : { row: 44, padY: 11, padX: 16, gap: 8 };

  // Background tone (light mode only)
  const lightBgs = {
    paper:   { canvas: '#FBFAF7', surface: '#FFFFFF', subtle: '#F4F2EC', border: '#E8E4DA', borderStrong: '#D7D2C5' },
    cool:    { canvas: '#F7F8FA', surface: '#FFFFFF', subtle: '#EFF1F5', border: '#E2E5EB', borderStrong: '#CDD2DB' },
    neutral: { canvas: '#F8F8F8', surface: '#FFFFFF', subtle: '#EFEFEF', border: '#E5E5E5', borderStrong: '#D0D0D0' },
  };
  const bgs = isDark
    ? { canvas: '#0B0E13', surface: '#12161D', subtle: '#181D26', border: '#212732', borderStrong: '#2D3441' }
    : (lightBgs[tone] || lightBgs.paper);

  return {
    theme,
    isDark,
    radius,
    density: dens,
    color: {
      canvas: bgs.canvas,
      surface: bgs.surface,
      subtle: bgs.subtle,
      border: bgs.border,
      borderStrong: bgs.borderStrong,
      ink:   isDark ? '#ECEAE3' : '#171717',
      ink2:  isDark ? '#B8B5AC' : '#525050',
      ink3:  isDark ? '#7A766E' : '#8A8881',
      ink4:  isDark ? '#52504A' : '#B2AFA6',
      accent: isDark ? a.d : a.l,
      accentBg: isDark ? 'rgba(94,200,173,0.10)' : 'rgba(15,110,88,0.06)',
      pos:   isDark ? '#4ADE80' : '#0E7C49',
      neg:   isDark ? '#F87171' : '#B91C1C',
      warn:  isDark ? '#FCD34D' : '#B45309',
      info:  isDark ? '#7DD3FC' : '#1E5F8B',
      posBg: isDark ? 'rgba(74,222,128,0.10)' : 'rgba(14,124,73,0.08)',
      negBg: isDark ? 'rgba(248,113,113,0.10)' : 'rgba(185,28,28,0.06)',
      warnBg: isDark ? 'rgba(252,211,77,0.10)' : 'rgba(180,83,9,0.08)',
      infoBg: isDark ? 'rgba(125,211,252,0.10)' : 'rgba(30,95,139,0.08)',
      // Dedicated chart series colors — chosen for max contrast with all accents
      expense: isDark ? '#FB923C' : '#C2410C', // warm amber, opposite hue of jade
    },
    font: {
      sans: "'IBM Plex Sans Thai', 'Inter', system-ui, sans-serif",
      mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────
function formatBaht(n, opts = {}) {
  const sign = n < 0 ? '−' : '';
  const v = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: opts.dec ?? 0, maximumFractionDigits: opts.dec ?? 0 });
  return `${sign}฿${v}`;
}
function formatBahtK(n) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `฿${(n/1_000_000).toFixed(2)}M`;
  if (abs >= 1_000)     return `฿${(n/1_000).toFixed(1)}K`;
  return `฿${n.toFixed(0)}`;
}
function formatNum(n) { return n.toLocaleString('en-US'); }
function formatPct(n, dec=1) { return `${n>=0?'+':''}${n.toFixed(dec)}%`; }
function formatDate(d) {
  const dt = new Date(d);
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${m[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}
function formatDateShort(d) {
  const dt = new Date(d);
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${m[dt.getMonth()]} ${String(dt.getDate()).padStart(2,'0')}`;
}

// ─────────────────────────────────────────────────────────────
// Mock data — Chawy Pet Food
// ─────────────────────────────────────────────────────────────
const mock = {
  company: { name: 'Chawy', subtitle: 'ชาวี — Freeze-Dry Pet Food', user: { name: 'ภัทรพล ศรีวิชัย', role: 'Owner', initial: 'ภ' } },

  kpi: {
    revToday:    { value: 48600,   delta: +12.4, sub: '18 orders' },
    revMonth:    { value: 1520000, delta: +18.7, sub: 'May 2026' },
    profitMonth: { value: 707000,  delta: +13.4, sub: '46.5% margin' },
    cashOnHand:  { value: 2840000, delta: +6.2,  sub: 'across 3 accounts' },
  },

  // 30-day revenue (smoothed)
  series30: (() => {
    const seed = [38,42,40,45,52,48,55,60,58,62,65,70,68,72,75,72,78,82,85,80,88,92,95,90,98,102,99,105,110,108];
    return seed.map((v,i) => ({
      d: i+1, rev: v*1000 + Math.sin(i*0.7)*3000,
      exp: v*1000*0.55 + Math.cos(i*0.5)*2000,
    }));
  })(),

  channels: [
    { name: 'TikTok Shop',  rev: 642000, share: 42.2, delta: +24.1 },
    { name: 'LINE Direct',  rev: 388000, share: 25.5, delta:  +9.8 },
    { name: 'Shopee',       rev: 251000, share: 16.5, delta:  +4.2 },
    { name: 'B2B Wholesale',rev: 156000, share: 10.3, delta: +31.0 },
    { name: 'Facebook',     rev:  83000, share:  5.5, delta:  -2.4 },
  ],

  pnl6: [
    { month: 'Nov', rev:  780000, net: 283000, mPct: 36.3 },
    { month: 'Dec', rev:  920000, net: 367000, mPct: 39.9 },
    { month: 'Jan', rev: 1050000, net: 435000, mPct: 41.4 },
    { month: 'Feb', rev: 1180000, net: 513000, mPct: 43.5 },
    { month: 'Mar', rev: 1380000, net: 623000, mPct: 45.1 },
    { month: 'Apr', rev: 1520000, net: 707000, mPct: 46.5 },
  ],

  alerts: [
    { kind: 'inventory', sev: 'high', title: 'มิกซ์ฟรีซดราย 200g หมดสต็อค', meta: 'CAT-MIX-200 · reorder due', age: '2h' },
    { kind: 'po',        sev: 'high', title: 'PO-2026-0184 เกิน ETA 3 วัน',  meta: 'SuppCo · ฿82,400',          age: '3d' },
    { kind: 'invoice',   sev: 'med',  title: 'Invoice เกินกำหนด 5 รายการ',   meta: 'รวม ฿284,600 ค้างชำระ',     age: '1d' },
    { kind: 'lot',       sev: 'med',  title: 'Lot L240312 ใกล้หมดอายุ',       meta: '142 ชิ้น · 18 วัน',          age: '4h' },
    { kind: 'pr',        sev: 'low',  title: 'PR รออนุมัติ 3 รายการ',          meta: 'รวมประมาณ ฿156,000',        age: '6h' },
  ],

  salesOrders: [
    { id: 'SO-2026-0418', customer: 'บริษัท ABC Pet Supply',    channel: 'B2B',     date: '2026-05-26', amount: 125400, status: 'processing', items: 4 },
    { id: 'SO-2026-0417', customer: 'ร้าน Star Pet Shop',        channel: 'LINE',    date: '2026-05-26', amount:  68200, status: 'pending',    items: 3 },
    { id: 'SO-2026-0416', customer: 'คุณสมใจ พุ่มพวง',           channel: 'LINE',    date: '2026-05-25', amount:  18900, status: 'shipped',    items: 2 },
    { id: 'SO-2026-0415', customer: 'TikTok @sweetpaws_th',      channel: 'TikTok',  date: '2026-05-25', amount:   2670, status: 'completed',  items: 1 },
    { id: 'SO-2026-0414', customer: 'Shopee — chawy_official',   channel: 'Shopee',  date: '2026-05-25', amount:   5670, status: 'completed',  items: 2 },
    { id: 'SO-2026-0413', customer: 'ร้าน Happy Pet',             channel: 'B2B',     date: '2026-05-24', amount:  45600, status: 'completed',  items: 2 },
    { id: 'SO-2026-0412', customer: 'บริษัท ABC Pet Supply',     channel: 'B2B',     date: '2026-05-24', amount: 125400, status: 'completed',  items: 4 },
    { id: 'SO-2026-0411', customer: 'คุณนิดา (Walk-in)',          channel: 'Manual',  date: '2026-05-23', amount:  28500, status: 'cancelled',  items: 1 },
    { id: 'SO-2026-0410', customer: 'TikTok @petlover.bkk',      channel: 'TikTok',  date: '2026-05-23', amount:   4490, status: 'shipped',    items: 1 },
    { id: 'SO-2026-0409', customer: 'บริษัท Woof & Meow',         channel: 'B2B',     date: '2026-05-23', amount: 189000, status: 'processing', items: 5 },
    { id: 'SO-2026-0408', customer: 'คุณวรัญญา ทองดี',            channel: 'LINE',    date: '2026-05-22', amount:  12780, status: 'completed',  items: 3 },
    { id: 'SO-2026-0407', customer: 'Shopee — chawy_official',   channel: 'Shopee',  date: '2026-05-22', amount:   3780, status: 'completed',  items: 1 },
  ],

  invoice: {
    id: 'INV-2026-0418',
    soRef: 'SO-2026-0418',
    customer: { name: 'บริษัท ABC Pet Supply จำกัด', taxId: '0105561234567', address: '142/8 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110', contact: 'คุณนภาพร · 081-234-5678' },
    issueDate: '2026-05-26',
    dueDate: '2026-06-09',
    terms: 'Net 14',
    status: 'sent',
    lines: [
      { sku: 'CAT-CHK-30',  name: 'ไก่อกฟรีซดราย 30g',     qty: 200, price:  72, amount: 14400 },
      { sku: 'CAT-SAL-100', name: 'แซลมอนฟรีซดราย 100g',   qty: 120, price: 155, amount: 18600 },
      { sku: 'CAT-DUK-30',  name: 'เป็ดฟรีซดราย 30g',      qty: 150, price:  80, amount: 12000 },
      { sku: 'DOG-CHK-100', name: 'ไก่อกสุนัข 100g',       qty: 100, price: 120, amount: 12000 },
      { sku: 'CAT-MIX-200', name: 'มิกซ์ฟรีซดราย 200g',    qty:  80, price: 245, amount: 19600 },
      { sku: 'BUNDLE-TRIO', name: 'เซ็ต 3 ชิ้น (Trio)',    qty:  50, price: 200, amount: 10000 },
    ],
    discount: 4000,
  },

  stock: [
    { sku: 'CAT-CHK-30',  name: 'ไก่อกฟรีซดราย 30g',    onHand: 1200, reorder: 100, value: 45600,  trend: +12.4, lot: 'L240501' },
    { sku: 'CAT-SAL-100', name: 'แซลมอนฟรีซดราย 100g',  onHand:   45, reorder:  80, value:  6975,  trend:  -8.2, lot: 'L240412' },
    { sku: 'CAT-DUK-30',  name: 'เป็ดฟรีซดราย 30g',     onHand:  890, reorder: 100, value: 37380,  trend:  +4.6, lot: 'L240428' },
    { sku: 'DOG-CHK-100', name: 'ไก่อกสุนัข 100g',      onHand:   12, reorder:  50, value:   780,  trend:  -2.1, lot: 'L240315' },
    { sku: 'CAT-MIX-200', name: 'มิกซ์ฟรีซดราย 200g',   onHand:    0, reorder:  60, value:     0,  trend: -100.0, lot: '—'      },
    { sku: 'DOG-DUK-50',  name: 'เป็ดสุนัข 50g',        onHand:  340, reorder:  60, value: 18700,  trend:  +6.3, lot: 'L240502' },
  ],

  // P&L statement — May 2026 vs Apr 2026
  pnl: {
    revenue: [
      { label: 'ยอดขายสินค้า', en: 'Product sales',     cur: 1486000, prev: 1252000 },
      { label: 'ค่าจัดส่ง',     en: 'Shipping income',    cur:   34000, prev:   28000 },
    ],
    cogs: [
      { label: 'ต้นทุนวัตถุดิบ', en: 'Raw materials',     cur: 512000, prev: 448000 },
      { label: 'ค่าแรงผลิต',    en: 'Production labor',   cur: 168000, prev: 152000 },
      { label: 'ค่าฟรีซดราย',   en: 'Freeze-dry / utility', cur: 96000, prev: 88000 },
      { label: 'บรรจุภัณฑ์',    en: 'Packaging',          cur:  64000, prev:  58000 },
    ],
    opex: [
      { label: 'การตลาด & โฆษณา', en: 'Marketing & ads',  cur: 142000, prev: 118000 },
      { label: 'เงินเดือนพนักงาน', en: 'Salaries',         cur: 168000, prev: 168000 },
      { label: 'ค่าเช่า & สาธารณูปโภค', en: 'Rent & utilities', cur: 48000, prev: 48000 },
      { label: 'ค่าธรรมเนียมแพลตฟอร์ม', en: 'Platform fees', cur: 89000, prev: 71000 },
      { label: 'อื่นๆ',          en: 'Other',             cur:  26000, prev:  24000 },
    ],
  },

  expenses: [
    { id: 'EXP-0612', date: '2026-05-30', vendor: 'SuppCo วัตถุดิบ',      cat: 'วัตถุดิบ',    en: 'Raw materials', amount: 82400, method: 'โอน',       status: 'paid' },
    { id: 'EXP-0611', date: '2026-05-29', vendor: 'TikTok Ads',          cat: 'การตลาด',    en: 'Marketing',     amount: 45000, method: 'บัตรเครดิต', status: 'paid' },
    { id: 'EXP-0610', date: '2026-05-28', vendor: 'บจก. แพ็คดีไซน์',      cat: 'บรรจุภัณฑ์',  en: 'Packaging',     amount: 28600, method: 'โอน',       status: 'pending' },
    { id: 'EXP-0609', date: '2026-05-27', vendor: 'การไฟฟ้านครหลวง',     cat: 'สาธารณูปโภค', en: 'Utilities',     amount: 18200, method: 'หักบัญชี',   status: 'paid' },
    { id: 'EXP-0608', date: '2026-05-26', vendor: 'Kerry Express',        cat: 'ขนส่ง',       en: 'Logistics',     amount: 12400, method: 'เครดิต',     status: 'paid' },
    { id: 'EXP-0607', date: '2026-05-25', vendor: 'Facebook Ads',        cat: 'การตลาด',    en: 'Marketing',     amount: 32000, method: 'บัตรเครดิต', status: 'paid' },
    { id: 'EXP-0606', date: '2026-05-24', vendor: 'เงินเดือน พ.ค.',      cat: 'เงินเดือน',   en: 'Salaries',      amount: 168000, method: 'โอน',      status: 'paid' },
    { id: 'EXP-0605', date: '2026-05-23', vendor: 'บจก. ฟรีซเทค',        cat: 'ซ่อมบำรุง',   en: 'Maintenance',   amount: 24500, method: 'โอน',       status: 'overdue' },
  ],

  purchaseOrders: [
    { id: 'PO-2026-0184', supplier: 'SuppCo วัตถุดิบ',       date: '2026-05-20', eta: '2026-05-28', amount: 82400, items: 3, status: 'overdue' },
    { id: 'PO-2026-0183', supplier: 'บจก. แพ็คดีไซน์',       date: '2026-05-24', eta: '2026-06-02', amount: 56000, items: 2, status: 'processing' },
    { id: 'PO-2026-0182', supplier: 'ฟาร์มไก่สดพรีเมียม',    date: '2026-05-22', eta: '2026-05-30', amount: 124000, items: 1, status: 'shipped' },
    { id: 'PO-2026-0181', supplier: 'แซลมอนนำเข้า Co.',      date: '2026-05-18', eta: '2026-05-26', amount: 98500, items: 2, status: 'completed' },
    { id: 'PO-2026-0180', supplier: 'SuppCo วัตถุดิบ',       date: '2026-05-15', eta: '2026-05-23', amount: 67200, items: 4, status: 'completed' },
    { id: 'PO-2026-0179', supplier: 'บจก. ฉลากโปร',          date: '2026-05-12', eta: '2026-05-20', amount: 18400, items: 1, status: 'completed' },
  ],

  tiktok: {
    liveSessions: [
      { date: '2026-05-30', host: 'พี่หมวย', dur: '3h 12m', viewers: 18400, orders: 142, gmv: 168000, conv: 0.77 },
      { date: '2026-05-28', host: 'น้องเฟิร์น', dur: '2h 45m', viewers: 12200, orders: 98, gmv: 112000, conv: 0.80 },
      { date: '2026-05-26', host: 'พี่หมวย', dur: '3h 30m', viewers: 21000, orders: 168, gmv: 198000, conv: 0.80 },
      { date: '2026-05-24', host: 'น้องเฟิร์น', dur: '2h 10m', viewers: 9800, orders: 64, gmv: 74000, conv: 0.65 },
    ],
    orders: [
      { id: 'TT-48201', handle: '@sweetpaws_th',   product: 'มิกซ์ฟรีซดราย 200g', qty: 2, amount: 490, time: '14:22', status: 'completed' },
      { id: 'TT-48200', handle: '@petlover.bkk',   product: 'ไก่อกฟรีซดราย 30g',  qty: 5, amount: 360, time: '14:18', status: 'processing' },
      { id: 'TT-48199', handle: '@meowmeow_cafe',  product: 'แซลมอนฟรีซดราย 100g', qty: 3, amount: 465, time: '14:15', status: 'completed' },
      { id: 'TT-48198', handle: '@doglover99',     product: 'ไก่อกสุนัข 100g',    qty: 2, amount: 240, time: '14:11', status: 'completed' },
      { id: 'TT-48197', handle: '@catmom.th',      product: 'เซ็ต 3 ชิ้น (Trio)', qty: 1, amount: 200, time: '14:08', status: 'pending' },
      { id: 'TT-48196', handle: '@furryfriends',   product: 'เป็ดฟรีซดราย 30g',   qty: 4, amount: 320, time: '14:02', status: 'completed' },
    ],
  },

  quotations: [
    { id: 'QT-2026-0048', customer: 'บจก. Woof & Meow',    date: '2026-05-29', valid: '2026-06-12', amount: 189000, status: 'sent' },
    { id: 'QT-2026-0047', customer: 'ร้าน Happy Pet',       date: '2026-05-28', valid: '2026-06-11', amount: 45600, status: 'draft' },
    { id: 'QT-2026-0046', customer: 'บจก. PetMart Chain',  date: '2026-05-27', valid: '2026-06-10', amount: 342000, status: 'sent' },
    { id: 'QT-2026-0045', customer: 'บจก. ABC Pet Supply', date: '2026-05-24', valid: '2026-06-07', amount: 125400, status: 'accepted' },
    { id: 'QT-2026-0044', customer: 'ร้าน Star Pet Shop',   date: '2026-05-22', valid: '2026-06-05', amount: 68200, status: 'expired' },
  ],

  skus: [
    { sku: 'CAT-CHK-30',  name: 'ไก่อกฟรีซดราย 30g',   cat: 'แมว',   cost: 38, price: 72,  margin: 47.2, sold30: 1240 },
    { sku: 'CAT-SAL-100', name: 'แซลมอนฟรีซดราย 100g', cat: 'แมว',   cost: 82, price: 155, margin: 47.1, sold30: 680 },
    { sku: 'CAT-DUK-30',  name: 'เป็ดฟรีซดราย 30g',    cat: 'แมว',   cost: 42, price: 80,  margin: 47.5, sold30: 920 },
    { sku: 'DOG-CHK-100', name: 'ไก่อกสุนัข 100g',     cat: 'สุนัข', cost: 64, price: 120, margin: 46.7, sold30: 540 },
    { sku: 'CAT-MIX-200', name: 'มิกซ์ฟรีซดราย 200g',  cat: 'แมว',   cost: 128, price: 245, margin: 47.8, sold30: 410 },
    { sku: 'DOG-DUK-50',  name: 'เป็ดสุนัข 50g',       cat: 'สุนัข', cost: 32, price: 62,  margin: 48.4, sold30: 760 },
    { sku: 'BUNDLE-TRIO', name: 'เซ็ต 3 ชิ้น (Trio)',  cat: 'เซ็ต',  cost: 104, price: 200, margin: 48.0, sold30: 320 },
  ],

  budget: [
    { cat: 'การตลาด & โฆษณา', en: 'Marketing',    budget: 150000, actual: 142000 },
    { cat: 'วัตถุดิบ',         en: 'Raw materials', budget: 500000, actual: 512000 },
    { cat: 'เงินเดือน',        en: 'Salaries',      budget: 168000, actual: 168000 },
    { cat: 'บรรจุภัณฑ์',       en: 'Packaging',     budget:  70000, actual:  64000 },
    { cat: 'ค่าขนส่ง',         en: 'Logistics',     budget:  45000, actual:  38600 },
    { cat: 'สาธารณูปโภค',     en: 'Utilities',     budget:  50000, actual:  48000 },
    { cat: 'ซ่อมบำรุง',        en: 'Maintenance',   budget:  30000, actual:  24500 },
  ],

  returns: [
    { id: 'RMA-2026-0042', soRef: 'SO-2026-0411', customer: 'คุณนิดา (Walk-in)',     date: '2026-05-29', reason: 'สินค้าชำรุด',      en: 'Damaged',       qty: 2, amount: 4900, status: 'pending' },
    { id: 'RMA-2026-0041', soRef: 'SO-2026-0408', customer: 'คุณวรัญญา ทองดี',       date: '2026-05-28', reason: 'ส่งผิดรายการ',    en: 'Wrong item',    qty: 1, amount: 1550, status: 'processing' },
    { id: 'RMA-2026-0040', soRef: 'SO-2026-0405', customer: 'ร้าน Star Pet Shop',     date: '2026-05-26', reason: 'ใกล้หมดอายุ',     en: 'Near expiry',   qty: 6, amount: 1470, status: 'completed' },
    { id: 'RMA-2026-0039', soRef: 'SO-2026-0399', customer: 'TikTok @petlover.bkk',   date: '2026-05-24', reason: 'ลูกค้าเปลี่ยนใจ', en: 'Changed mind', qty: 1, amount:  490, status: 'completed' },
    { id: 'RMA-2026-0038', soRef: 'SO-2026-0392', customer: 'บจก. Happy Pet',         date: '2026-05-22', reason: 'สินค้าชำรุด',      en: 'Damaged',       qty: 4, amount: 3120, status: 'cancelled' },
  ],

  purchaseReqs: [
    { id: 'PR-2026-0091', requester: 'ฝ่ายผลิต',   date: '2026-05-30', item: 'ไก่อกสด เกรด A',       qty: '200 kg',  est: 64000, status: 'pending' },
    { id: 'PR-2026-0090', requester: 'ฝ่ายแพ็ค',   date: '2026-05-29', item: 'ถุงซิปล็อค 200g',     qty: '5,000 ใบ', est: 28600, status: 'pending' },
    { id: 'PR-2026-0089', requester: 'ฝ่ายผลิต',   date: '2026-05-28', item: 'แซลมอนนำเข้า',         qty: '80 kg',   est: 98500, status: 'approved' },
    { id: 'PR-2026-0088', requester: 'ฝ่ายการตลาด', date: '2026-05-27', item: 'กล่องของขวัญ Limited', qty: '1,000 ใบ', est: 42000, status: 'approved' },
    { id: 'PR-2026-0087', requester: 'ฝ่ายซ่อมบำรุง', date: '2026-05-25', item: 'อะไหล่เครื่องฟรีซดราย', qty: '1 ชุด', est: 24500, status: 'rejected' },
  ],

  goodsReceipts: [
    { id: 'GR-2026-0156', poRef: 'PO-2026-0182', supplier: 'ฟาร์มไก่สดพรีเมียม', date: '2026-05-30', items: 1, qty: '200 kg',  value: 124000, status: 'completed' },
    { id: 'GR-2026-0155', poRef: 'PO-2026-0181', supplier: 'แซลมอนนำเข้า Co.',   date: '2026-05-28', items: 2, qty: '120 kg',  value:  98500, status: 'completed' },
    { id: 'GR-2026-0154', poRef: 'PO-2026-0180', supplier: 'SuppCo วัตถุดิบ',    date: '2026-05-26', items: 4, qty: '320 หน่วย', value: 67200, status: 'completed' },
    { id: 'GR-2026-0153', poRef: 'PO-2026-0183', supplier: 'บจก. แพ็คดีไซน์',    date: '2026-05-25', items: 2, qty: '8,000 ใบ', value:  56000, status: 'partial' },
  ],

  goodsIssues: [
    { id: 'GI-2026-0241', purpose: 'ผลิตล็อต L240502', date: '2026-05-30', items: 3, qty: '180 kg',   value: 72000, dept: 'ฝ่ายผลิต',  status: 'completed' },
    { id: 'GI-2026-0240', purpose: 'เบิกตัวอย่างไลฟ์',  date: '2026-05-29', items: 5, qty: '24 ชิ้น',   value:  4800, dept: 'ฝ่ายการตลาด', status: 'completed' },
    { id: 'GI-2026-0239', purpose: 'ตัดสต็อคเสียหาย',   date: '2026-05-28', items: 1, qty: '12 ชิ้น',   value:  2940, dept: 'คลังสินค้า',  status: 'completed' },
    { id: 'GI-2026-0238', purpose: 'ผลิตล็อต L240501',  date: '2026-05-26', items: 4, qty: '240 kg',   value: 96000, dept: 'ฝ่ายผลิต',  status: 'completed' },
    { id: 'GI-2026-0237', purpose: 'เบิกของแถม',        date: '2026-05-25', items: 2, qty: '50 ชิ้น',   value:  6200, dept: 'ฝ่ายขาย',   status: 'pending' },
  ],

  content: {
    schedule: [
      { date: '2026-05-31', time: '20:00', platform: 'TikTok Live', host: 'พี่หมวย',   topic: 'รีวิวสูตรใหม่ แซลมอน+ไก่', status: 'scheduled' },
      { date: '2026-06-01', time: '19:30', platform: 'Facebook Live', host: 'น้องเฟิร์น', topic: 'โปรเดือนมิถุนายน', status: 'scheduled' },
      { date: '2026-06-02', time: '20:00', platform: 'TikTok Live', host: 'พี่หมวย',   topic: 'ตอบคำถามเรื่องอาหารแมว', status: 'draft' },
    ],
    posts: [
      { title: 'รีวิวจากลูกค้า: แมวกินเก่งขึ้น', platform: 'TikTok',   reach: 84200, eng: 6.8, date: '2026-05-29' },
      { title: 'เบื้องหลังกระบวนการฟรีซดราย',     platform: 'Instagram', reach: 32400, eng: 4.2, date: '2026-05-27' },
      { title: 'โปรโมชั่น 3 ชิ้น ลด 15%',         platform: 'Facebook',  reach: 56800, eng: 3.9, date: '2026-05-25' },
      { title: 'เคล็ดลับเลือกอาหารสัตว์',          platform: 'TikTok',   reach: 128000, eng: 8.1, date: '2026-05-23' },
    ],
  },

  users: [
    { name: 'ภัทรพล ศรีวิชัย',  email: 'pat@chawy.co.th',     role: 'Owner',      th: 'เจ้าของ',      access: 'Full',      last: '2 นาทีที่แล้ว',  active: true },
    { name: 'สุดารัตน์ ใจดี',    email: 'suda@chawy.co.th',    role: 'Admin',      th: 'ผู้ดูแลระบบ',  access: 'Full',      last: '1 ชม.ที่แล้ว',   active: true },
    { name: 'วิชัย พงษ์ทอง',    email: 'wichai@chawy.co.th',  role: 'Accountant', th: 'บัญชี',         access: 'Finance',   last: '3 ชม.ที่แล้ว',   active: true },
    { name: 'พิมพ์ชนก ดวงดี',   email: 'pim@chawy.co.th',     role: 'Sales',      th: 'ฝ่ายขาย',      access: 'Sales',     last: 'เมื่อวาน',       active: true },
    { name: 'ธนกร แสงทอง',     email: 'thanakorn@chawy.co.th', role: 'Warehouse', th: 'คลังสินค้า',   access: 'Inventory', last: '2 วันที่แล้ว',   active: false },
  ],
};

window.getTokens = getTokens;
window.formatBaht = formatBaht;
window.formatBahtK = formatBahtK;
window.formatNum = formatNum;
window.formatPct = formatPct;
window.formatDate = formatDate;
window.formatDateShort = formatDateShort;
window.mockData = mock;
window.ACCENTS = ACCENTS;
