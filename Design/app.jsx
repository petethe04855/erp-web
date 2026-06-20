/* app.jsx — top-level app, routing, tweaks panel */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "jade",
  "tone": "paper",
  "density": "regular",
  "radius": 6,
  "fontSize": 14
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const t = getTokens({
    theme: tweaks.theme,
    accent: tweaks.accent,
    radius: tweaks.radius,
    density: tweaks.density,
    tone: tweaks.tone,
  });
  const [current, setCurrent] = React.useState('dashboard');

  // Apply global CSS variables to body
  React.useEffect(() => {
    document.body.style.background = t.color.canvas;
    document.body.style.color = t.color.ink;
    document.body.style.fontFamily = t.font.sans;
    document.body.style.fontSize = (tweaks.fontSize || 14) + 'px';
    document.documentElement.style.colorScheme = t.isDark ? 'dark' : 'light';
  }, [t.color.canvas, t.color.ink, t.isDark, tweaks.fontSize]);

  let screen;
  if (current === 'dashboard')         screen = <Dashboard t={t} onNavigate={setCurrent} />;
  else if (current === 'sales')        screen = <SalesOrdersScreen t={t} onNavigate={setCurrent} />;
  else if (current === 'invoice')      screen = <InvoiceScreen t={t} onNavigate={setCurrent} />;
  else if (current === 'stock')        screen = <StockScreen t={t} />;
  else if (current === 'pl')           screen = <PnlScreen t={t} />;
  else if (current === 'expenses')     screen = <ExpensesScreen t={t} />;
  else if (current === 'budget')       screen = <BudgetScreen t={t} />;
  else if (current === 'po')           screen = <PurchaseOrdersScreen t={t} />;
  else if (current === 'tiktok')       screen = <TiktokScreen t={t} />;
  else if (current === 'quotation')    screen = <QuotationScreen t={t} />;
  else if (current === 'sku')          screen = <SkuScreen t={t} />;
  else if (current === 'returns')      screen = <ReturnsScreen t={t} />;
  else if (current === 'pr')           screen = <PurchaseReqScreen t={t} />;
  else if (current === 'goods-in')     screen = <GoodsReceiveScreen t={t} />;
  else if (current === 'goods-out')    screen = <GoodsIssueScreen t={t} />;
  else if (current === 'live')         screen = <LiveContentScreen t={t} />;
  else if (current === 'users')        screen = <UsersScreen t={t} />;
  else if (current === 'settings')     screen = <SettingsScreen t={t} />;
  else                                 screen = <PlaceholderScreen t={t} screen={current} />;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: t.color.canvas,
      color: t.color.ink,
      fontFamily: t.font.sans,
      fontSize: (tweaks.fontSize || 14),
      lineHeight: 1.5,
    }}>
      <Sidebar t={t} current={current} onNavigate={setCurrent} />
      <main style={{ flex: 1, minWidth: 0 }}>{screen}</main>

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={tweaks.theme}
          options={['light', 'dark']}
          onChange={v => setTweak('theme', v)} />
        <TweakColor label="Accent"
          value={ACCENTS[tweaks.accent][tweaks.theme === 'dark' ? 'd' : 'l']}
          options={Object.keys(ACCENTS).map(k => ACCENTS[k][tweaks.theme === 'dark' ? 'd' : 'l'])}
          onChange={(v) => {
            const k = Object.keys(ACCENTS).find(k => ACCENTS[k][tweaks.theme === 'dark' ? 'd' : 'l'] === v);
            if (k) setTweak('accent', k);
          }} />
        <TweakRadio label="Tone" value={tweaks.tone}
          options={['paper', 'cool', 'neutral']}
          onChange={v => setTweak('tone', v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={tweaks.density}
          options={['compact', 'regular', 'comfy']}
          onChange={v => setTweak('density', v)} />
        <TweakSlider label="Radius" value={tweaks.radius} min={0} max={12} step={1} unit="px"
          onChange={v => setTweak('radius', v)} />
        <TweakSlider label="Font size" value={tweaks.fontSize} min={12} max={16} step={1} unit="px"
          onChange={v => setTweak('fontSize', v)} />

        <TweakSection label="Navigate" />
        <TweakSelect label="Screen" value={current}
          options={[
            { value: 'dashboard', label: 'Dashboard' },
            { value: 'quotation', label: 'Quotation' },
            { value: 'sales',     label: 'Sales Orders' },
            { value: 'invoice',   label: 'Invoice detail' },
            { value: 'po',        label: 'Purchase Orders' },
            { value: 'stock',     label: 'Stock Balance' },
            { value: 'sku',       label: 'SKU Master' },
            { value: 'pl',        label: 'P&L Report' },
            { value: 'expenses',  label: 'Expenses' },
            { value: 'budget',    label: 'Budget' },
            { value: 'tiktok',    label: 'TikTok Orders' },
            { value: 'live',      label: 'Live & Content' },
            { value: 'returns',   label: 'Returns' },
            { value: 'pr',        label: 'Purchase Req.' },
            { value: 'goods-in',  label: 'Goods Receive' },
            { value: 'goods-out', label: 'Goods Issue' },
            { value: 'users',     label: 'Users' },
            { value: 'settings',  label: 'Settings' },
          ]}
          onChange={v => setCurrent(v)} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
