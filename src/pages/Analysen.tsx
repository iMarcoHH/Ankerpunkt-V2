import { useMemo, useState } from 'react'
import { useStore } from '../store'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(v)
const MONTHS  = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const MONTHS_LONG = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const PIE_COLS = ['#E5483F','#F59E0B','#22C55E','#3B82F6','#8B5CF6','#EC4899']
type Tab = 'cashflow' | 'vergleich' | 'kategorien' | 'jahresuebersicht' | 'sparquote' | 'ausblick'

const TIP = { backgroundColor:'var(--surface)', borderColor:'var(--border)', borderRadius:12, color:'var(--primary)', fontSize:12 }

export function AnalysenPage() {
  const { transactions, recurring } = useStore()
  const [tab, setTab] = useState<Tab>('cashflow')
  const now = new Date()
  const tm = now.getMonth(), ty = now.getFullYear()
  const lm = tm === 0 ? 11 : tm - 1
  const ly = tm === 0 ? ty - 1 : ty

  // ── 12-Monat Cashflow ────────────────────────────────────────────
  const cashflow = useMemo(() => Array.from({ length:12 }, (_,i) => {
    const d = new Date(ty, tm - 11 + i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    const inc = transactions.filter(t => { const td=new Date(t.date); return td.getMonth()===m && td.getFullYear()===y && t.type==='income' }).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t => { const td=new Date(t.date); return td.getMonth()===m && td.getFullYear()===y && t.type==='expense' }).reduce((s,t)=>s+t.amount,0)
    return { month: MONTHS[m], income: inc, expenses: exp, netto: inc - exp }
  }), [transactions])

  // ── Kategorien aktueller Monat ───────────────────────────────────
  const cats = useMemo(() => {
    const map: Record<string,number> = {}
    transactions.filter(t => { const d=new Date(t.date); return d.getMonth()===tm && d.getFullYear()===ty && t.type==='expense' })
      .forEach(t => { map[t.category] = (map[t.category]??0) + t.amount })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([c,v])=>({ category:c, total:v }))
  }, [transactions])
  const catTotal = cats.reduce((s,c)=>s+c.total, 0)

  // ── Monatsvergleich ───────────────────────────────────────────────
  const get = (m:number, y:number, type:'income'|'expense') =>
    transactions.filter(t => { const d=new Date(t.date); return d.getMonth()===m && d.getFullYear()===y && t.type===type }).reduce((s,t)=>s+t.amount,0)
  const comp = useMemo(() => ({
    tI: get(tm,ty,'income'), tE: get(tm,ty,'expense'),
    lI: get(lm,ly,'income'), lE: get(lm,ly,'expense'),
  }), [transactions])

  // ── Jahresübersicht ───────────────────────────────────────────────
  const jahres = useMemo(() => Array.from({ length:12 }, (_,i) => {
    const inc = transactions.filter(t => { const d=new Date(t.date); return d.getMonth()===i && d.getFullYear()===ty && t.type==='income' }).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t => { const d=new Date(t.date); return d.getMonth()===i && d.getFullYear()===ty && t.type==='expense' }).reduce((s,t)=>s+t.amount,0)
    return { month: MONTHS[i], income: inc, expenses: exp, netto: inc - exp, isCurrentMonth: i === tm }
  }), [transactions])
  const jahresInc   = jahres.reduce((s,m)=>s+m.income,0)
  const jahresExp   = jahres.reduce((s,m)=>s+m.expenses,0)
  const jahresNetto = jahresInc - jahresExp
  const aktiveMonate = jahres.filter(m => m.income > 0 || m.expenses > 0).length
  const besterMonat = [...jahres].sort((a,b) => b.netto - a.netto)[0]
  const schlechtesterMonat = [...jahres].sort((a,b) => a.netto - b.netto)[0]

  // ── Sparquote ─────────────────────────────────────────────────────
  const sparquote = useMemo(() => Array.from({ length:12 }, (_,i) => {
    const d = new Date(ty, tm - 11 + i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    // Einnahmen fix, nur Ausgaben werden für Prognose berücksichtigt
    const inc = transactions.filter(t => { const td=new Date(t.date); return td.getMonth()===m && td.getFullYear()===y && t.type==='income' }).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t => { const td=new Date(t.date); return td.getMonth()===m && td.getFullYear()===y && t.type==='expense' }).reduce((s,t)=>s+t.amount,0)
    const rate = inc > 0 ? Math.round(((inc-exp)/inc)*100) : 0
    return { month: MONTHS[m], rate, income: inc, expenses: exp }
  }), [transactions])
  const avgRate = (() => {
    const active = sparquote.filter(m => m.income > 0)
    return active.length > 0 ? Math.round(active.reduce((s,m)=>s+m.rate,0) / active.length) : 0
  })()

  // ── Finanz-Ausblick ─────────────────────────────────────────────
  const ausblick = useMemo(() => {
    const recurringIncome = recurring
      .filter((r:any) => r.type === 'income')
      .reduce((sum:number, r:any) => sum + r.amount, 0)

    const recurringExpenses = recurring
      .filter((r:any) => r.type === 'expense')
      .reduce((sum:number, r:any) => sum + r.amount, 0)

    const surplus = recurringIncome - recurringExpenses
    const fixedCostRate = recurringIncome > 0
      ? Math.round((recurringExpenses / recurringIncome) * 100)
      : 0

    return {
      recurringIncome,
      recurringExpenses,
      surplus,
      fixedCostRate,
    }
  }, [recurring])

  // ── Top Ausgaben aktueller Monat ──────────────────────────────────
  const topAusgaben = useMemo(() =>
    [...transactions]
      .filter(t => { const d=new Date(t.date); return d.getMonth()===tm && d.getFullYear()===ty && t.type==='expense' })
      .sort((a,b) => b.amount - a.amount)
      .slice(0,5)
  , [transactions])

  const TABS: [Tab, string][] = [
    ['cashflow',        'Cashflow'],
    ['vergleich',       'Vergleich'],
    ['kategorien',      'Kategorien'],
    ['jahresuebersicht','Jahr'],
    ['sparquote',       'Sparquote'],
    ['ausblick',        'Ausblick'],
  ]

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px' }}>
        <h1 className="page-title">Analysen</h1>
      </div>

      {/* Tabs */}
      <div style={{ padding:'0 20px 20px', display:'flex', gap:8, overflowX:'auto' }}>
        {TABS.map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ padding:'8px 14px', borderRadius:16, fontSize:12, fontWeight:500, cursor:'pointer', border:'none', whiteSpace:'nowrap', flexShrink:0,
                     background: tab===v ? 'var(--accent)' : 'var(--surface)',
                     color: tab===v ? 'white' : 'var(--secondary)',
                     boxShadow: tab===v ? '0 4px 12px rgba(229,72,63,.25)' : 'var(--shadow-sm)' }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── CASHFLOW ── */}
      {tab === 'cashflow' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>
          {/* KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { label:'Ø Einnahmen', val: cashflow.filter(m=>m.income>0).reduce((s,m)=>s+m.income,0) / Math.max(cashflow.filter(m=>m.income>0).length,1), color:'var(--success)' },
              { label:'Ø Ausgaben',  val: cashflow.filter(m=>m.expenses>0).reduce((s,m)=>s+m.expenses,0) / Math.max(cashflow.filter(m=>m.expenses>0).length,1), color:'var(--accent)' },
              { label:'Ø Netto',     val: cashflow.filter(m=>m.income>0).reduce((s,m)=>s+m.netto,0) / Math.max(cashflow.filter(m=>m.income>0).length,1), color:'var(--primary)' },
            ].map(k => (
              <div key={k.label} className="app-card" style={{ padding:'14px 12px', textAlign:'center' }}>
                <p style={{ fontSize:11, color:'var(--tertiary)', marginBottom:4 }}>{k.label}</p>
                <p style={{ fontSize:15, fontWeight:800, color:k.color }}>{fmt(Math.round(k.val))}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:2 }}>Einnahmen vs. Ausgaben</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:16 }}>Nur tatsächlich erfasste Buchungen der letzten 12 Monate</p>
            <div style={{ height:180, width:'100%' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={cashflow} margin={{ top:0, right:0, left:-24, bottom:0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
                  <XAxis dataKey="month" tick={{ fill:'var(--tertiary)', fontSize:9 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:'var(--tertiary)', fontSize:9 }} axisLine={false} tickLine={false}
                    tickFormatter={v => (v as number) >= 1000 ? `${((v as number)/1000).toFixed(0)}k` : `${v}`}/>
                  <Tooltip contentStyle={TIP} formatter={(v:unknown) => [fmt(v as number),'']} cursor={{ fill:'rgba(15,23,42,0.03)' }}/>
                  <Bar dataKey="income"   name="Einnahmen" fill="#22C55E" radius={[6,6,0,0]} maxBarSize={18}/>
                  <Bar dataKey="expenses" name="Ausgaben"  fill="#E5483F" radius={[6,6,0,0]} maxBarSize={18}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:'flex', gap:16, marginTop:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10, height:10, borderRadius:3, background:'#22C55E' }}/><span style={{ fontSize:12, color:'var(--tertiary)' }}>Einnahmen</span></div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10, height:10, borderRadius:3, background:'#E5483F' }}/><span style={{ fontSize:12, color:'var(--tertiary)' }}>Ausgaben</span></div>
            </div>
          </div>


          {/* Top Ausgaben */}
          {topAusgaben.length > 0 && (
            <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'16px 20px 8px' }}>
                <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)' }}>Größte Ausgaben</p>
                <p style={{ fontSize:13, color:'var(--tertiary)' }}>{MONTHS_LONG[tm]} {ty}</p>
              </div>
              {topAusgaben.map((tx, i, arr) => (
                <div key={tx.id} style={{ display:'flex', alignItems:'center', padding:'12px 20px',
                                          borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ width:22, fontSize:13, fontWeight:700, color:'var(--tertiary)', marginRight:12 }}>#{i+1}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:500, color:'var(--primary)' }}>{tx.description}</p>
                    <p style={{ fontSize:12, color:'var(--tertiary)' }}>{tx.category}</p>
                  </div>
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--accent)' }}>{fmt(tx.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VERGLEICH ── */}
      {tab === 'vergleich' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:2 }}>Monat im Vergleich</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:20 }}>{MONTHS_LONG[lm]} vs. {MONTHS_LONG[tm]}</p>
            {([
              { label:'Einnahmen', cur:comp.tI, prev:comp.lI, betterWhenHigher:true },
              { label:'Ausgaben',  cur:comp.tE, prev:comp.lE, betterWhenHigher:false },
              { label:'Netto',     cur:comp.tI-comp.tE, prev:comp.lI-comp.lE, betterWhenHigher:true },
            ]).map((row, i) => {
              const diff   = row.cur - row.prev
              const pct    = row.prev > 0 ? `${diff >= 0 ? '+' : ''}${((diff/row.prev)*100).toFixed(0)}%` : '—'
              const better = row.betterWhenHigher ? diff >= 0 : diff <= 0
              return (
                <div key={row.label} style={{ marginBottom: i < 2 ? 20 : 0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontSize:14, color:'var(--secondary)' }}>{row.label}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20,
                                     background: better ? 'rgba(34,197,94,0.1)' : 'rgba(229,72,63,0.1)',
                                     color: better ? 'var(--success)' : 'var(--danger)' }}>{pct}</span>
                      <span style={{ fontSize:16, fontWeight:700, color:'var(--primary)' }}>{fmt(row.cur)}</span>
                    </div>
                  </div>
                  <div style={{ height:6, borderRadius:3, background:'var(--bg)', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:3,
                                  background: better ? 'var(--success)' : 'var(--accent)',
                                  width:`${Math.min(100, row.cur / Math.max(row.cur, row.prev, 1) * 100)}%` }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <p style={{ fontSize:11, color:'var(--tertiary)' }}>{MONTHS_LONG[tm]}: {fmt(row.cur)}</p>
                    <p style={{ fontSize:11, color:'var(--tertiary)' }}>{MONTHS_LONG[lm]}: {fmt(row.prev)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Kategorie-Vergleich */}
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:2 }}>Kategorie-Vergleich</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:16 }}>Ausgaben {MONTHS_LONG[lm]} vs. {MONTHS_LONG[tm]}</p>
            {(() => {
              const allCats = new Set([
                ...transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===tm&&d.getFullYear()===ty&&t.type==='expense'}).map(t=>t.category),
                ...transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===lm&&d.getFullYear()===ly&&t.type==='expense'}).map(t=>t.category),
              ])
              const rows = Array.from(allCats).map(cat => {
                const cur  = transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===tm&&d.getFullYear()===ty&&t.type==='expense'&&t.category===cat}).reduce((s,t)=>s+t.amount,0)
                const prev = transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===lm&&d.getFullYear()===ly&&t.type==='expense'&&t.category===cat}).reduce((s,t)=>s+t.amount,0)
                return { cat, cur, prev }
              }).sort((a,b) => b.cur - a.cur)
              const maxVal = Math.max(...rows.map(r => Math.max(r.cur, r.prev)), 1)
              return rows.map((r, i) => (
                <div key={r.cat} style={{ marginBottom: i < rows.length-1 ? 14 : 0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <p style={{ fontSize:13, fontWeight:500, color:'var(--primary)' }}>{r.cat}</p>
                    <div style={{ display:'flex', gap:8 }}>
                      <span style={{ fontSize:12, color:'var(--tertiary)' }}>{fmt(r.prev)}</span>
                      <span style={{ fontSize:12, fontWeight:600, color: r.cur <= r.prev ? 'var(--success)' : 'var(--accent)' }}>{fmt(r.cur)}</span>
                    </div>
                  </div>
                  <div style={{ position:'relative', height:6 }}>
                    <div style={{ position:'absolute', inset:0, borderRadius:3, background:'var(--bg)' }}/>
                    <div style={{ position:'absolute', top:0, left:0, height:'100%', borderRadius:3, background:'rgba(229,72,63,0.2)', width:`${r.prev/maxVal*100}%` }}/>
                    <div style={{ position:'absolute', top:1, left:0, height:4, borderRadius:2, background:'var(--accent)', width:`${r.cur/maxVal*100}%` }}/>
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      )}

      {/* ── KATEGORIEN ── */}
      {tab === 'kategorien' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:2 }}>Ausgaben nach Kategorie</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:16 }}>{MONTHS_LONG[tm]} {ty}</p>
            {cats.length === 0 ? (
              <p style={{ fontSize:15, color:'var(--tertiary)', textAlign:'center', padding:'24px 0' }}>Keine Ausgaben diesen Monat.</p>
            ) : (
              <>
                <div style={{ height:180, width:'100%', marginBottom:16 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={cats} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="total" nameKey="category">
                        {cats.map((_,i) => <Cell key={i} fill={PIE_COLS[i % PIE_COLS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={TIP} formatter={(v:unknown) => [fmt(v as number),'']}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {cats.map((c, i) => {
                    const pct = catTotal > 0 ? (c.total/catTotal)*100 : 0
                    return (
                      <div key={c.category}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                          <div style={{ width:10, height:10, borderRadius:'50%', background:PIE_COLS[i%PIE_COLS.length], flexShrink:0 }}/>
                          <span style={{ fontSize:14, color:'var(--primary)', flex:1 }}>{c.category}</span>
                          <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:'var(--bg)', color:'var(--secondary)' }}>{pct.toFixed(0)}%</span>
                          <span style={{ fontSize:14, fontWeight:700, color:'var(--primary)' }}>{fmt(c.total)}</span>
                        </div>
                        <div style={{ height:4, borderRadius:2, background:'var(--bg)', overflow:'hidden', marginLeft:18 }}>
                          <div style={{ height:'100%', borderRadius:2, background:PIE_COLS[i%PIE_COLS.length], width:`${pct}%` }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── JAHRESÜBERSICHT ── */}
      {tab === 'jahresuebersicht' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>
          {/* KPI */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Gebuchte Einnahmen', val:jahresInc,   color:'var(--success)' },
              { label:'Gebuchte Ausgaben',  val:jahresExp,   color:'var(--accent)' },
              { label:'Gebuchtes Netto',    val:jahresNetto, color: jahresNetto >= 0 ? 'var(--success)' : 'var(--accent)' },
            ].map(k => (
              <div key={k.label} className="app-card" style={{ padding:'14px 12px', textAlign:'center' }}>
                <p style={{ fontSize:11, color:'var(--tertiary)', marginBottom:4 }}>{k.label}</p>
                <p style={{ fontSize:15, fontWeight:800, color:k.color }}>{fmt(k.val)}</p>
              </div>
            ))}
          </div>
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:12 }}>Jahresfakten</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <p style={{ fontSize:12, color:'var(--tertiary)' }}>Aktive Monate</p>
                <p style={{ fontSize:18, fontWeight:800, color:'var(--primary)' }}>{aktiveMonate}/12</p>
              </div>

              <div>
                <p style={{ fontSize:12, color:'var(--tertiary)' }}>Ø Monatsüberschuss</p>
                <p style={{ fontSize:18, fontWeight:800, color: jahresNetto >= 0 ? 'var(--success)' : 'var(--accent)' }}>
                  {fmt(Math.round(jahresNetto / Math.max(aktiveMonate,1)))}
                </p>
              </div>

              <div>
                <p style={{ fontSize:12, color:'var(--tertiary)' }}>Bester Monat</p>
                <p style={{ fontSize:14, fontWeight:700, color:'var(--success)' }}>
                  {besterMonat?.month || '—'}
                </p>
              </div>

              <div>
                <p style={{ fontSize:12, color:'var(--tertiary)' }}>Schwächster Monat</p>
                <p style={{ fontSize:14, fontWeight:700, color:'var(--accent)' }}>
                  {schlechtesterMonat?.month || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:2 }}>Jahr {ty}</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:16 }}>Tatsächlich erfasste Buchungen im aktuellen Jahr</p>
            <div style={{ height:180, width:'100%' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={jahres} margin={{ top:0, right:0, left:-24, bottom:0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
                  <XAxis dataKey="month" tick={{ fill:'var(--tertiary)', fontSize:9 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:'var(--tertiary)', fontSize:9 }} axisLine={false} tickLine={false}
                    tickFormatter={v => (v as number) >= 1000 ? `${((v as number)/1000).toFixed(0)}k` : `${v}`}/>
                  <Tooltip contentStyle={TIP} formatter={(v:unknown) => [fmt(v as number),'']} cursor={{ fill:'rgba(15,23,42,0.03)' }}/>
                  <Bar dataKey="income"   name="Einnahmen" fill="#22C55E" radius={[4,4,0,0]} maxBarSize={18}/>
                  <Bar dataKey="expenses" name="Ausgaben"  fill="#E5483F" radius={[4,4,0,0]} maxBarSize={18}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monatsübersicht */}
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>Monatsübersicht</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:16 }}>Es werden nur tatsächlich gebuchte Werte angezeigt.</p>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {jahres.filter(m => m.income > 0 || m.expenses > 0).map(m => (
                <div
                  key={m.month}
                  style={{
                    padding:'14px 16px',
                    borderRadius:16,
                    background:m.isCurrentMonth ? 'rgba(229,72,63,0.05)' : 'var(--bg)',
                    border:m.isCurrentMonth ? '1px solid rgba(229,72,63,0.15)' : '1px solid transparent'
                  }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:m.isCurrentMonth ? 'var(--accent)' : 'var(--primary)' }}>{m.month}</p>
                    <p style={{ fontSize:14, fontWeight:800, color:m.netto >= 0 ? 'var(--success)' : 'var(--accent)' }}>{fmt(m.netto)}</p>
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:12, color:'var(--success)' }}>↑ {fmt(m.income)}</span>
                    <span style={{ fontSize:12, color:'var(--accent)' }}>↓ {fmt(m.expenses)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SPARQUOTE ── */}
      {tab === 'sparquote' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>
          {/* Hero */}
          <div className="app-card" style={{ textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%',
                          background: avgRate >= 20 ? 'rgba(34,197,94,0.08)' : 'rgba(229,72,63,0.08)' }}/>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:8, position:'relative' }}>Durchschnittliche Sparquote</p>
            <p style={{ fontSize:64, fontWeight:800, letterSpacing:'-0.04em', position:'relative',
                        color: avgRate >= 20 ? 'var(--success)' : avgRate >= 10 ? 'var(--warning)' : 'var(--accent)' }}>
              {avgRate}%
            </p>
            <p style={{ fontSize:14, color:'var(--tertiary)', marginTop:4, position:'relative' }}>
              {avgRate >= 20 ? '🟢 Sehr gut!' : avgRate >= 10 ? '🟡 Solide' : avgRate > 0 ? '🔴 Ausbaufähig' : '— Noch keine Daten'}
            </p>
            <p style={{ fontSize:12, color:'var(--tertiary)', marginTop:8, position:'relative' }}>
              Orientierungswert: 20% oder mehr gelten häufig als starke Sparquote.
            </p>
            <div style={{
              marginTop:16,
              height:8,
              borderRadius:999,
              background:'var(--bg)',
              overflow:'hidden'
            }}>
              <div style={{
                height:'100%',
                width:`${Math.min(avgRate,100)}%`,
                borderRadius:999,
                background: avgRate >= 20 ? 'var(--success)' : 'var(--accent)'
              }}/>
            </div>
          </div>

          {/* Verlauf Chart */}
          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:2 }}>Sparquote Verlauf</p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:16 }}>Letzte 12 Monate in %</p>
            <div style={{ height:180, width:'100%' }}>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={sparquote} margin={{ top:4, right:4, left:-24, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
                  <XAxis dataKey="month" tick={{ fill:'var(--tertiary)', fontSize:9 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:'var(--tertiary)', fontSize:9 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v}%`} domain={['auto','auto']}/>
                  <Tooltip contentStyle={TIP} formatter={(v:unknown) => [`${v}%`, 'Sparquote']}
                    cursor={{ stroke:'rgba(15,23,42,0.1)' }}/>
                  <Line type="monotone" dataKey="rate" stroke="#22C55E" strokeWidth={2.5}
                    dot={{ fill:'#22C55E', strokeWidth:0, r:3 }} activeDot={{ r:5, strokeWidth:0 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabelle */}
          <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'10px 16px',
                          borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
              {['Monat','Sparbetrag','Quote'].map(h => (
                <p key={h} style={{ fontSize:11, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</p>
              ))}
            </div>
            {sparquote.filter(m => m.income > 0).map((m, i, arr) => (
              <div key={m.month} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'10px 16px',
                                          borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                <p style={{ fontSize:13, color:'var(--primary)' }}>{m.month}</p>
                <p style={{ fontSize:13, color: (m.income-m.expenses) > 0 ? 'var(--success)' : 'var(--accent)' }}>
                  {fmt(m.income - m.expenses)}
                </p>
                <p style={{ fontSize:13, fontWeight:600,
                             color: m.rate >= 20 ? 'var(--success)' : m.rate >= 10 ? 'var(--warning)' : 'var(--accent)' }}>
                  {m.rate}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FINANZ-AUSBLICK ── */}
      {tab === 'ausblick' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>

          <div className="app-card" style={{ textAlign:'center' }}>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginBottom:8 }}>
              Erwarteter monatlicher Überschuss
            </p>
            <p style={{
              fontSize:48,
              fontWeight:800,
              color: ausblick.surplus >= 0 ? 'var(--success)' : 'var(--accent)'
            }}>
              {fmt(ausblick.surplus)}
            </p>
            <p style={{ fontSize:12, color:'var(--tertiary)', marginTop:8 }}>
              Basierend auf deinen wiederkehrenden Buchungen
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div className="app-card">
              <p style={{ fontSize:12, color:'var(--tertiary)' }}>Wiederkehrende Einnahmen</p>
              <p style={{ fontSize:20, fontWeight:800, color:'var(--success)' }}>
                {fmt(ausblick.recurringIncome)}
              </p>
            </div>

            <div className="app-card">
              <p style={{ fontSize:12, color:'var(--tertiary)' }}>Wiederkehrende Ausgaben</p>
              <p style={{ fontSize:20, fontWeight:800, color:'var(--accent)' }}>
                {fmt(ausblick.recurringExpenses)}
              </p>
            </div>
          </div>

          <div className="app-card">
            <p style={{ fontSize:17, fontWeight:700, color:'var(--primary)', marginBottom:12 }}>
              Fixkostenquote
            </p>
            <p style={{ fontSize:36, fontWeight:800, color:'var(--primary)' }}>
              {ausblick.fixedCostRate}%
            </p>
            <p style={{ fontSize:13, color:'var(--tertiary)', marginTop:8 }}>
              Anteil deiner wiederkehrenden Ausgaben an den regelmäßigen Einnahmen.
            </p>
          </div>

        </div>
      )}

      <div style={{ height:20 }}/>
    </div>
  )
}
