import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
const fmtTooltip = (v: unknown) => [fmt(v as number), '']
const MONTH_NAMES = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const PIE_COLORS = ['#C8392B','#E8A832','#3D5166','#9AA0A6','#E8DFD0','#4a6d8c','#d4703a']

type ViewMode = 'chart' | 'compare' | 'cats'

export function AnalysenPage() {
  const { transactions } = useStore()
  const [mode, setMode] = useState<ViewMode>('chart')
  const now = new Date()

  const cashflow = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    const income   = transactions.filter(t => { const td = new Date(t.date); return td.getMonth()===m && td.getFullYear()===y && t.type==='income'  }).reduce((s,t) => s+t.amount, 0)
    const expenses = transactions.filter(t => { const td = new Date(t.date); return td.getMonth()===m && td.getFullYear()===y && t.type==='expense' }).reduce((s,t) => s+t.amount, 0)
    return { month: MONTH_NAMES[m], income, expenses }
  }), [transactions])

  const categories = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount })
    return Object.entries(map).sort((a,b) => b[1]-a[1]).map(([category, total]) => ({ category, total }))
  }, [transactions])
  const catTotal = categories.reduce((s,c) => s + c.total, 0)

  const thisM = now.getMonth(), thisY = now.getFullYear()
  const lastM = thisM === 0 ? 11 : thisM - 1
  const lastY = thisM === 0 ? thisY - 1 : thisY

  const comp = useMemo(() => {
    const get = (m: number, y: number, type: 'income'|'expense') =>
      transactions.filter(t => { const d = new Date(t.date); return d.getMonth()===m && d.getFullYear()===y && t.type===type }).reduce((s,t) => s+t.amount, 0)
    return { tI: get(thisM,thisY,'income'), tE: get(thisM,thisY,'expense'), lI: get(lastM,lastY,'income'), lE: get(lastM,lastY,'expense') }
  }, [transactions, thisM, thisY, lastM, lastY])

  const tooltipStyle = { backgroundColor:'#162030', borderColor:'#3D5166', borderRadius:12, color:'#E8DFD0', fontSize:12 }

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="pt-14">
        <h1 className="font-display text-4xl tracking-widest text-white">Analysen</h1>
        <p className="text-cement text-sm mt-1">Visuelle Auswertungen deiner Finanzen</p>
      </div>

      <div className="flex gap-2">
        {([['chart','Cashflow'],['compare','Vergleich'],['cats','Kategorien']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setMode(val)}
            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ background: mode===val ? '#C8392B' : 'rgba(255,255,255,0.06)', color: mode===val ? 'white' : '#9AA0A6' }}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'chart' && (
        <motion.div className="ak-card p-5" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}>
          <p className="font-display text-xl tracking-wide text-white mb-1">Cashflow</p>
          <p className="text-xs text-cement mb-5">Letzte 12 Monate</p>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow} margin={{ top:4, right:0, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(61,81,102,0.4)"/>
                <XAxis dataKey="month" tick={{ fill:'#9AA0A6', fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'#9AA0A6', fontSize:10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => (v as number) >= 1000 ? `€${((v as number)/1000).toFixed(0)}k` : `€${v}`}/>
                <Tooltip contentStyle={tooltipStyle} formatter={fmtTooltip} cursor={{ fill:'rgba(255,255,255,0.04)' }}/>
                <Bar dataKey="income"   name="Einnahmen" fill="#E8A832" radius={[6,6,0,0]} maxBarSize={28}/>
                <Bar dataKey="expenses" name="Ausgaben"  fill="#C8392B" radius={[6,6,0,0]} maxBarSize={28}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-3">
            <div className="flex items-center gap-2 text-xs text-cement"><span className="w-3 h-3 rounded-sm" style={{background:'#E8A832'}}/> Einnahmen</div>
            <div className="flex items-center gap-2 text-xs text-cement"><span className="w-3 h-3 rounded-sm" style={{background:'#C8392B'}}/> Ausgaben</div>
          </div>
        </motion.div>
      )}

      {mode === 'compare' && (
        <motion.div className="ak-card p-5" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}>
          <p className="font-display text-xl tracking-wide text-white mb-1">Monatsvergleich</p>
          <p className="text-xs text-cement mb-5">{MONTH_NAMES[lastM]} vs. {MONTH_NAMES[thisM]}</p>
          {([
            { label:'Einnahmen', cur:comp.tI, prev:comp.lI, color:'#E8A832' },
            { label:'Ausgaben',  cur:comp.tE, prev:comp.lE, color:'#C8392B' },
            { label:'Netto',     cur:comp.tI-comp.tE, prev:comp.lI-comp.lE, color:'#3D5166' },
          ]).map(row => {
            const diff = row.cur - row.prev
            const pct  = row.prev > 0 ? `${diff >= 0 ? '+' : ''}${((diff/row.prev)*100).toFixed(0)}%` : '—'
            return (
              <div key={row.label} className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-cement">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs" style={{ color: diff >= 0 ? '#E8A832' : '#C8392B' }}>{pct}</span>
                    <span className="font-display text-white text-base">{fmt(row.cur)}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width:`${Math.min(100, row.cur / Math.max(row.cur, row.prev, 1) * 100)}%`, background:row.color }}/>
                  </div>
                  <span className="text-xs text-cement w-20 text-right">{fmt(row.prev)}</span>
                </div>
                <div className="text-[9px] text-cement mt-0.5 font-mono uppercase tracking-wider">{MONTH_NAMES[lastM]}: {fmt(row.prev)}</div>
              </div>
            )
          })}
        </motion.div>
      )}

      {mode === 'cats' && (
        <motion.div className="ak-card p-5" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}>
          <p className="font-display text-xl tracking-wide text-white mb-1">Ausgaben nach Kategorien</p>
          <p className="text-xs text-cement mb-5">Alle Einträge</p>
          {categories.length === 0 ? (
            <div className="py-14 text-center"><p className="text-sm text-cement">Noch keine Daten.</p></div>
          ) : (
            <div className="flex flex-col gap-5">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="total" nameKey="category">
                      {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={fmtTooltip}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5">
                {categories.map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}/>
                    <span className="text-sm text-sand flex-1 truncate">{cat.category}</span>
                    <span className="text-xs font-mono text-cement">{fmt(cat.total)}</span>
                    <span className="text-xs text-cement w-10 text-right">{catTotal > 0 ? ((cat.total/catTotal)*100).toFixed(0) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
