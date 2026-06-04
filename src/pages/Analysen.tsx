import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'

const fmt      = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(v)
const fmtTip   = (v: unknown) => [fmt(v as number), '']
const MONTHS   = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const PIE_COLS = ['#C8392B','#E8A832','#3D5166','#9AA0A6','#E8DFD0','#4a6d8c','#d4703a']
const TIP_STYLE = { backgroundColor:'#162030', borderColor:'#3D5166', borderRadius:12, color:'#E8DFD0', fontSize:11 }

type Mode = 'cashflow' | 'vergleich' | 'kategorien' | 'jahresuebersicht' | 'sparquote'

export function AnalysenPage() {
  const { transactions } = useStore()
  const [mode, setMode]  = useState<Mode>('cashflow')
  const now = new Date()

  // ── 12-month cashflow ──────────────────────────────────────────────────────
  const cashflow = useMemo(() => Array.from({ length:12 }, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-11+i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    const inc = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='income'}).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='expense'}).reduce((s,t)=>s+t.amount,0)
    return { month:MONTHS[m], income:inc, expenses:exp }
  }), [transactions])

  // ── Category breakdown ─────────────────────────────────────────────────────
  const cats = useMemo(() => {
    const map: Record<string,number> = {}
    transactions.filter(t=>t.type==='expense').forEach(t=>{ map[t.category]=(map[t.category]??0)+t.amount })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([c,v])=>({ category:c, total:v }))
  }, [transactions])
  const catTotal = cats.reduce((s,c)=>s+c.total,0)

  // ── Monthly comparison ─────────────────────────────────────────────────────
  const tm = now.getMonth(), ty = now.getFullYear()
  const lm = tm===0?11:tm-1, ly = tm===0?ty-1:ty
  const get = (m:number,y:number,type:'income'|'expense') =>
    transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===m&&d.getFullYear()===y&&t.type===type}).reduce((s,t)=>s+t.amount,0)
  const comp = useMemo(()=>({
    tI:get(tm,ty,'income'), tE:get(tm,ty,'expense'),
    lI:get(lm,ly,'income'), lE:get(lm,ly,'expense'),
  }),[transactions])

  // ── Jahresübersicht ────────────────────────────────────────────────────────
  const jahres = useMemo(() => Array.from({ length:12 }, (_,i) => {
    const d = new Date(now.getFullYear(), i, 1)
    const m = i, y = now.getFullYear()
    const inc = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='income'}).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='expense'}).reduce((s,t)=>s+t.amount,0)
    return { month:MONTHS[i], income:inc, expenses:exp, netto:inc-exp, label:MONTHS[i] }
  }), [transactions])

  const jahresInc  = jahres.reduce((s,m)=>s+m.income,0)
  const jahresExp  = jahres.reduce((s,m)=>s+m.expenses,0)
  const jahresNetto = jahresInc - jahresExp

  // ── Sparquote-Tracking ─────────────────────────────────────────────────────
  const sparquote = useMemo(() => Array.from({ length:12 }, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-11+i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    const inc = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='income'}).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='expense'}).reduce((s,t)=>s+t.amount,0)
    const rate = inc > 0 ? Math.round(((inc-exp)/inc)*100) : 0
    return { month:MONTHS[m], rate, income:inc, expenses:exp }
  }), [transactions])

  const avgRate = sparquote.filter(m=>m.income>0).length > 0
    ? Math.round(sparquote.filter(m=>m.income>0).reduce((s,m)=>s+m.rate,0) / sparquote.filter(m=>m.income>0).length)
    : 0

  const MODES: [Mode, string][] = [
    ['cashflow',       'Cashflow'],
    ['vergleich',      'Vergleich'],
    ['kategorien',     'Kategorien'],
    ['jahresuebersicht','Jahr'],
    ['sparquote',      'Sparquote'],
  ]

  return (
    <div className="p-5 space-y-4 pb-8">
      <div className="pt-14">
        <h1 className="font-display text-4xl tracking-widest text-white">Analysen</h1>
        <p className="text-cement text-sm mt-0.5">Visuelle Auswertungen</p>
      </div>

      {/* Mode tabs — horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {MODES.map(([val, label]) => (
          <button key={val} onClick={() => setMode(val)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{ background:mode===val?'#C8392B':'rgba(255,255,255,0.06)', color:mode===val?'white':'#9AA0A6' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Cashflow ── */}
      {mode === 'cashflow' && (
        <motion.div className="ak-card p-5" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}>
          <p className="font-display text-xl tracking-wide text-white mb-1">Cashflow</p>
          <p className="text-xs text-cement mb-4">Letzte 12 Monate</p>
          <div style={{ height:220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow} margin={{ top:4,right:0,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(61,81,102,0.4)"/>
                <XAxis dataKey="month" tick={{ fill:'#9AA0A6', fontSize:9 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'#9AA0A6', fontSize:9 }} axisLine={false} tickLine={false}
                  tickFormatter={v => (v as number)>=1000?`€${((v as number)/1000).toFixed(0)}k`:`€${v}`}/>
                <Tooltip contentStyle={TIP_STYLE} formatter={fmtTip} cursor={{ fill:'rgba(255,255,255,0.04)' }}/>
                <Bar dataKey="income"   name="Einnahmen" fill="#E8A832" radius={[4,4,0,0]} maxBarSize={24}/>
                <Bar dataKey="expenses" name="Ausgaben"  fill="#C8392B" radius={[4,4,0,0]} maxBarSize={24}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-cement"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:'#E8A832'}}/> Einnahmen</div>
            <div className="flex items-center gap-1.5 text-xs text-cement"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:'#C8392B'}}/> Ausgaben</div>
          </div>
        </motion.div>
      )}

      {/* ── Monatsvergleich ── */}
      {mode === 'vergleich' && (
        <motion.div className="ak-card p-5" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}>
          <p className="font-display text-xl tracking-wide text-white mb-1">Monatsvergleich</p>
          <p className="text-xs text-cement mb-5">{MONTHS[lm]} vs. {MONTHS[tm]}</p>
          {([
            { label:'Einnahmen', cur:comp.tI, prev:comp.lI, color:'#E8A832' },
            { label:'Ausgaben',  cur:comp.tE, prev:comp.lE, color:'#C8392B' },
            { label:'Netto',     cur:comp.tI-comp.tE, prev:comp.lI-comp.lE, color:'#3D5166' },
          ]).map(row => {
            const diff = row.cur - row.prev
            const pct  = row.prev > 0 ? `${diff>=0?'+':''}${((diff/row.prev)*100).toFixed(0)}%` : '—'
            return (
              <div key={row.label} className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-cement">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs" style={{ color:diff>=0?'#E8A832':'#C8392B' }}>{pct}</span>
                    <span className="font-display text-white text-base">{fmt(row.cur)}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width:`${Math.min(100,row.cur/Math.max(row.cur,row.prev,1)*100)}%`, background:row.color }}/>
                  </div>
                  <span className="text-xs text-cement w-20 text-right">{fmt(row.prev)}</span>
                </div>
                <p className="text-[9px] text-cement mt-0.5 font-mono uppercase tracking-wider">{MONTHS[lm]}: {fmt(row.prev)}</p>
              </div>
            )
          })}
        </motion.div>
      )}

      {/* ── Kategorien ── */}
      {mode === 'kategorien' && (
        <motion.div className="ak-card p-5" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}>
          <p className="font-display text-xl tracking-wide text-white mb-1">Ausgaben nach Kategorien</p>
          <p className="text-xs text-cement mb-4">Alle Einträge</p>
          {cats.length === 0 ? (
            <div className="py-12 text-center"><p className="text-sm text-cement">Noch keine Ausgaben.</p></div>
          ) : (
            <div className="space-y-4">
              <div style={{ height:200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={cats} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="total" nameKey="category">
                      {cats.map((_,i) => <Cell key={i} fill={PIE_COLS[i%PIE_COLS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={TIP_STYLE} formatter={fmtTip}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {cats.map((c,i) => (
                  <div key={c.category} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:PIE_COLS[i%PIE_COLS.length] }}/>
                    <span className="text-sm text-sand flex-1 truncate">{c.category}</span>
                    <span className="text-xs font-mono text-cement">{fmt(c.total)}</span>
                    <span className="text-xs text-cement w-8 text-right">{catTotal>0?((c.total/catTotal)*100).toFixed(0):0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Jahresübersicht ── */}
      {mode === 'jahresuebersicht' && (
        <motion.div className="space-y-3" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}>
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label:'Einnahmen', value:fmt(jahresInc),   color:'#E8A832' },
              { label:'Ausgaben',  value:fmt(jahresExp),   color:'#C8392B' },
              { label:'Netto',     value:fmt(jahresNetto), color: jahresNetto>=0?'#E8A832':'#C8392B' },
            ].map(k => (
              <div key={k.label} className="ak-card p-3 text-center">
                <p className="text-[9px] text-cement uppercase tracking-wider mb-1">{k.label}</p>
                <p className="font-display text-sm" style={{ color:k.color }}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="ak-card p-5">
            <p className="font-display text-xl tracking-wide text-white mb-1">Jahr {now.getFullYear()}</p>
            <p className="text-xs text-cement mb-4">Alle 12 Monate</p>
            <div style={{ height:200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jahres} margin={{ top:4,right:0,left:-20,bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(61,81,102,0.4)"/>
                  <XAxis dataKey="month" tick={{ fill:'#9AA0A6', fontSize:9 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:'#9AA0A6', fontSize:9 }} axisLine={false} tickLine={false}
                    tickFormatter={v => (v as number)>=1000?`€${((v as number)/1000).toFixed(0)}k`:`€${v}`}/>
                  <Tooltip contentStyle={TIP_STYLE} formatter={fmtTip} cursor={{ fill:'rgba(255,255,255,0.04)' }}/>
                  <Bar dataKey="income"   name="Einnahmen" fill="#E8A832" radius={[4,4,0,0]} maxBarSize={20}/>
                  <Bar dataKey="expenses" name="Ausgaben"  fill="#C8392B" radius={[4,4,0,0]} maxBarSize={20}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monatstabelle */}
          <div className="ak-card overflow-hidden">
            <div className="grid grid-cols-4 px-4 py-2.5" style={{ borderBottom:'1px solid rgba(61,81,102,0.4)', background:'rgba(255,255,255,0.03)' }}>
              {['Monat','Einnahmen','Ausgaben','Netto'].map(h => (
                <span key={h} className="font-mono text-[9px] text-cement uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {jahres.map((m, i) => {
              const isCurrent = i === now.getMonth()
              return (
                <div key={m.month} className="grid grid-cols-4 px-4 py-2.5"
                     style={{ borderBottom: i < 11 ? '1px solid rgba(61,81,102,0.2)' : 'none',
                              background: isCurrent ? 'rgba(200,57,43,0.08)' : 'transparent' }}>
                  <span className="text-xs font-medium" style={{ color: isCurrent ? '#C8392B' : '#E8DFD0' }}>{m.month}</span>
                  <span className="text-xs font-mono" style={{ color:m.income>0?'#E8A832':'#9AA0A6' }}>{m.income>0?fmt(m.income):'—'}</span>
                  <span className="text-xs font-mono" style={{ color:m.expenses>0?'#C8392B':'#9AA0A6' }}>{m.expenses>0?fmt(m.expenses):'—'}</span>
                  <span className="text-xs font-mono" style={{ color:m.netto>0?'#E8A832':m.netto<0?'#C8392B':'#9AA0A6' }}>{m.income>0||m.expenses>0?fmt(m.netto):'—'}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── Sparquote ── */}
      {mode === 'sparquote' && (
        <motion.div className="space-y-3" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}>
          {/* Avg */}
          <div className="ak-card p-5 text-center relative overflow-hidden"
               style={{ background:'linear-gradient(135deg,#162030 0%,#1e3048 100%)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
                 style={{ background:'#E8A832', filter:'blur(40px)', transform:'translate(20%,-20%)' }}/>
            <p className="text-xs text-cement uppercase tracking-widest mb-1">Ø Sparquote</p>
            <p className="font-display text-5xl tracking-wide" style={{ color:avgRate>=20?'#E8A832':avgRate>=10?'#E8DFD0':'#C8392B' }}>
              {avgRate}%
            </p>
            <p className="text-xs text-cement mt-1">
              {avgRate >= 20 ? '🟢 Sehr gut!' : avgRate >= 10 ? '🟡 Solide' : avgRate > 0 ? '🔴 Ausbaufähig' : 'Noch keine Daten'}
            </p>
          </div>

          <div className="ak-card p-5">
            <p className="font-display text-xl tracking-wide text-white mb-1">Sparquote</p>
            <p className="text-xs text-cement mb-4">Letzte 12 Monate in %</p>
            <div style={{ height:200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparquote} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(61,81,102,0.4)"/>
                  <XAxis dataKey="month" tick={{ fill:'#9AA0A6', fontSize:9 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:'#9AA0A6', fontSize:9 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v}%`} domain={['auto','auto']}/>
                  <Tooltip contentStyle={TIP_STYLE}
                    formatter={(v:unknown) => [`${v}%`, 'Sparquote']}
                    cursor={{ stroke:'rgba(255,255,255,0.1)' }}/>
                  <Line type="monotone" dataKey="rate" name="Sparquote" stroke="#E8A832" strokeWidth={2.5}
                    dot={{ fill:'#E8A832', strokeWidth:0, r:3 }}
                    activeDot={{ fill:'#E8A832', r:5, strokeWidth:0 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monatstabelle */}
          <div className="ak-card overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-2.5" style={{ borderBottom:'1px solid rgba(61,81,102,0.4)', background:'rgba(255,255,255,0.03)' }}>
              {['Monat','Gespart','Quote'].map(h => <span key={h} className="font-mono text-[9px] text-cement uppercase tracking-wider">{h}</span>)}
            </div>
            {sparquote.filter(m=>m.income>0).map((m,i,arr) => (
              <div key={m.month} className="grid grid-cols-3 px-4 py-2.5"
                   style={{ borderBottom:i<arr.length-1?'1px solid rgba(61,81,102,0.2)':'none' }}>
                <span className="text-xs text-sand">{m.month}</span>
                <span className="text-xs font-mono" style={{ color:(m.income-m.expenses)>0?'#E8A832':'#C8392B' }}>
                  {fmt(m.income - m.expenses)}
                </span>
                <span className="text-xs font-mono font-semibold" style={{ color:m.rate>=20?'#E8A832':m.rate>=10?'#E8DFD0':'#C8392B' }}>
                  {m.rate}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
