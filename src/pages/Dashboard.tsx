import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRightLeft, ShieldCheck, Trophy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
const fmtTooltip = (v: unknown) => [fmt(v as number), '']
const MONTH_NAMES = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const tooltipStyle = { backgroundColor:'#162030', borderColor:'#3D5166', borderRadius:12, color:'#E8DFD0', fontSize:12 }

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
}

export function DashboardPage() {
  const { transactions, insurances, goals, profile, achievements, setActiveTab, viewMonth, viewYear, goToPrevMonth, goToNextMonth } = useStore()

  const now = new Date()
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const monthTx = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear
  }), [transactions, viewMonth, viewYear])

  const totalIncome  = useMemo(() => monthTx.filter(t => t.type==='income') .reduce((s,t) => s+t.amount, 0), [monthTx])
  const totalExpense = useMemo(() => monthTx.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0), [monthTx])
  const balance      = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0
  const monthlyIns   = useMemo(() => insurances.reduce((s,i) => s + (i.period==='monthly' ? i.amount : i.amount/12), 0), [insurances])
  const recentTx     = useMemo(() => [...transactions].sort((a,b) => new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,6), [transactions])

  const trend = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(viewYear, viewMonth - 5 + i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    const inc = transactions.filter(t => { const td=new Date(t.date); return td.getMonth()===m&&td.getFullYear()===y&&t.type==='income'  }).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t => { const td=new Date(t.date); return td.getMonth()===m&&td.getFullYear()===y&&t.type==='expense' }).reduce((s,t)=>s+t.amount,0)
    return { month: MONTH_NAMES[m], income: inc, expenses: exp }
  }), [transactions, viewMonth, viewYear])

  return (
    <div className="p-5 space-y-5 pb-8">

      {/* Monatsnavigation */}
      <div className="flex items-center justify-between pt-14">
        <button onClick={goToPrevMonth} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background:'rgba(255,255,255,0.06)', color:'#9AA0A6' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
          <div className="font-display text-white text-2xl tracking-wide">{MONTH_NAMES[viewMonth]} {viewYear}</div>
          <div className="font-mono text-[10px] text-cement tracking-widest uppercase mt-0.5">
            {isCurrentMonth ? 'Aktueller Monat' : 'Vergangener Monat'}
          </div>
        </div>
        <button onClick={goToNextMonth} disabled={isCurrentMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background:isCurrentMonth?'rgba(255,255,255,0.02)':'rgba(255,255,255,0.06)', color:isCurrentMonth?'rgba(154,160,166,0.3)':'#9AA0A6' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Hero balance */}
      <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.4 }}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background:'linear-gradient(135deg, #162030 0%, #1e3048 60%, #243850 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
             style={{ background:'#E8A832', filter:'blur(60px)', transform:'translate(20%,-20%)' }}/>
        <p className="text-xs text-cement uppercase tracking-widest font-medium">
          {balance >= 0 ? 'Aktuelles Plus' : 'Aktuelles Minus'} · {MONTH_NAMES[viewMonth]}
        </p>
        <p className="text-4xl font-display tracking-wide mt-2" style={{ color: balance >= 0 ? 'white' : '#C8392B' }}>
          {fmt(balance)}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:'#E8A832'}}/><span className="text-xs text-cement">Einnahmen {fmt(totalIncome)}</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:'#C8392B'}}/><span className="text-xs text-cement">Ausgaben {fmt(totalExpense)}</span></div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'Einnahmen',    value:fmt(totalIncome),           Icon:TrendingUp,   accent:'#E8A832' },
          { label:'Ausgaben',     value:fmt(totalExpense),          Icon:TrendingDown, accent:'#C8392B' },
          { label:'Sparquote',    value:`${savingsRate}%`,          Icon:Wallet,       accent:'#E8A832' },
          { label:'Versicherung', value:fmt(monthlyIns)+'/mo',      Icon:ShieldCheck,  accent:'#3D5166' },
        ].map(({ label, value, Icon, accent }, i) => (
          <motion.div key={label} variants={fadeUp} custom={i} initial="hidden" animate="show">
            <div className="ak-card p-4 flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:accent+'22' }}>
                <Icon className="w-5 h-5" style={{ color:accent }}/>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-cement uppercase tracking-wider">{label}</p>
                <p className="font-display text-lg text-white mt-0.5 truncate">{value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div className="ak-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}>
        <p className="font-display text-xl tracking-wide text-white mb-1">Cashflow</p>
        <p className="text-xs text-cement mb-4">6-Monats-Verlauf</p>
        <div style={{ height:200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top:4, right:0, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(61,81,102,0.4)"/>
              <XAxis dataKey="month" tick={{ fill:'#9AA0A6', fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#9AA0A6', fontSize:10 }} axisLine={false} tickLine={false}
                tickFormatter={v => (v as number)>=1000?`€${((v as number)/1000).toFixed(0)}k`:`€${v}`}/>
              <Tooltip contentStyle={tooltipStyle} formatter={fmtTooltip} cursor={{ fill:'rgba(255,255,255,0.04)' }}/>
              <Bar dataKey="income"   name="Einnahmen" fill="#E8A832" radius={[6,6,0,0]} maxBarSize={24}/>
              <Bar dataKey="expenses" name="Ausgaben"  fill="#C8392B" radius={[6,6,0,0]} maxBarSize={24}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-cement"><span className="w-3 h-3 rounded-sm" style={{background:'#E8A832'}}/> Einnahmen</div>
          <div className="flex items-center gap-1.5 text-xs text-cement"><span className="w-3 h-3 rounded-sm" style={{background:'#C8392B'}}/> Ausgaben</div>
        </div>
      </motion.div>

      {/* Recent */}
      <motion.div className="ak-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.35 }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-xl tracking-wide text-white">Aktuell</p>
          <button onClick={() => setActiveTab('buchungen')} className="text-xs text-cement hover:text-white transition-colors">Alle →</button>
        </div>
        {recentTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <ArrowRightLeft className="w-8 h-8 text-cement opacity-30"/>
            <p className="text-sm text-cement">Noch keine Einträge</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTx.map((tx, i) => (
              <motion.div key={tx.id} className="flex items-center gap-3"
                initial={{ opacity:0,x:10 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.4+i*0.05 }}>
                <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                     style={{ background:tx.type==='income'?'rgba(232,168,50,0.15)':'rgba(200,57,43,0.15)' }}>
                  <ArrowRightLeft className="w-4 h-4" style={{ color:tx.type==='income'?'#E8A832':'#C8392B' }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                  <p className="text-xs text-cement">{new Date(tx.date).toLocaleDateString('de-DE')}</p>
                </div>
                <span className="text-sm font-mono font-semibold shrink-0" style={{ color:tx.type==='income'?'#E8A832':'#E8DFD0' }}>
                  {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick nav */}
      <motion.div className="grid grid-cols-3 gap-3" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
        {[
          { label:'Versicherungen', tab:'versicherungen', Icon:ShieldCheck, color:'#3D5166' },
          { label:`${goals.length} Ziele`,       tab:'ziele',          Icon:Target,     color:'#E8A832' },
          { label:`${achievements.length} Erfolge`, tab:'gamification', Icon:Trophy,     color:'#C8392B' },
        ].map(({ label, tab, Icon, color }) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="ak-card p-4 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:color+'22' }}>
              <Icon className="w-5 h-5" style={{ color }}/>
            </div>
            <span className="text-xs font-medium text-cement text-center leading-tight">{label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  )
}
