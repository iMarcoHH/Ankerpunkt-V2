import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { TrendingUp, TrendingDown, Target, ArrowRightLeft, ShieldCheck,
         AlertTriangle, ChevronLeft, ChevronRight, ChevronRight as Arrow } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(v)
const MONTH_NAMES = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const MONTH_LONG  = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

const CAT_ICONS: Record<string,string> = {
  'Wohnen':'🏠','Lebensmittel':'🛒','Transport':'🚌','Abos':'📱',
  'Gesundheit':'💊','Freizeit':'🎉','Kleidung':'👗','Bildung':'📚','Sonstiges':'💳'
}

export function DashboardPage() {
  const { transactions, insurances, goals, debts,
          setActiveTab, viewMonth, viewYear, goToPrevMonth, goToNextMonth, profile } = useStore()

  const now            = new Date()
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()
  const prevMonth      = viewMonth === 0 ? 11 : viewMonth - 1
  const prevYear       = viewMonth === 0 ? viewYear - 1 : viewYear

  const monthTx = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear
  }), [transactions, viewMonth, viewYear])

  const prevMonthTx = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear
  }), [transactions, prevMonth, prevYear])

  const totalIncome  = useMemo(() => monthTx.filter(t=>t.type==='income') .reduce((s,t)=>s+t.amount,0), [monthTx])
  const totalExpense = useMemo(() => monthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0), [monthTx])
  const prevIncome   = useMemo(() => prevMonthTx.filter(t=>t.type==='income') .reduce((s,t)=>s+t.amount,0), [prevMonthTx])
  const prevExpense  = useMemo(() => prevMonthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0), [prevMonthTx])
  const balance      = totalIncome - totalExpense
  const prevBalance  = prevIncome - prevExpense
  const savingsRate  = totalIncome > 0 ? Math.round((balance/totalIncome)*100) : 0
  const monthlyIns   = useMemo(() => insurances.reduce((s,i)=>s+(i.recurrence==='monthly'?i.amount:i.amount/12),0), [insurances])
  const recentTx     = useMemo(() => [...transactions].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,5), [transactions])
  const totalDebtLeft = debts.reduce((s,d) => s + (d.total_amount - d.paid_amount), 0)
  const firstName    = (profile as any)?.full_name?.split(' ')[0] ?? ''

  // Top Kategorien diesen Monat
  const topCats = useMemo(() => {
    const map: Record<string,number> = {}
    monthTx.filter(t=>t.type==='expense').forEach(t => { map[t.category]=(map[t.category]??0)+t.amount })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,3)
  }, [monthTx])

  // Prognose
  const today       = now.getDate()
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate()
  const daysPassed  = isCurrentMonth ? today : daysInMonth
  const projExpense = Math.round(totalExpense * daysInMonth / Math.max(daysPassed,1))
  const projBalance = totalIncome - projExpense
  const showForecast = isCurrentMonth && daysPassed < daysInMonth && totalExpense > 0

  // Budget-Warnung
  const monthlyBudget  = (profile as any)?.monthly_budget ?? 0
  const budgetPct      = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0
  const showBudgetWarn = isCurrentMonth && monthlyBudget > 0 && budgetPct >= 80

  // Monatsabschluss
  const showSummary = !isCurrentMonth && (prevIncome > 0 || prevExpense > 0)

  // Trend
  const trend = useMemo(() => Array.from({length:6},(_,i) => {
    const d = new Date(viewYear, viewMonth-5+i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    const inc = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='income'}).reduce((s,t)=>s+t.amount,0)
    const exp = transactions.filter(t=>{const td=new Date(t.date);return td.getMonth()===m&&td.getFullYear()===y&&t.type==='expense'}).reduce((s,t)=>s+t.amount,0)
    return { month:MONTH_NAMES[m], income:inc, expenses:exp }
  }), [transactions, viewMonth, viewYear])

  return (
    <div style={{ background:'var(--navy)', minHeight:'100vh' }} className="pb-8">

      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          {firstName && <p className="text-sm text-cement mb-0.5">Guten Tag, {firstName} 👋</p>}
          <h1 className="font-display text-3xl tracking-wide" style={{ color:'var(--sand)' }}>Lagebericht</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToPrevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background:'rgba(255,255,255,0.08)' }}>
            <ChevronLeft className="w-4 h-4 text-cement"/>
          </button>
          <span className="text-xs text-cement font-mono">{MONTH_NAMES[viewMonth]}</span>
          <button onClick={goToNextMonth} disabled={isCurrentMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background:'rgba(255,255,255,0.08)', opacity:isCurrentMonth?0.3:1 }}>
            <ChevronRight className="w-4 h-4 text-cement"/>
          </button>
        </div>
      </div>

      {/* Budget-Warnung */}
      <AnimatePresence>
        {showBudgetWarn && (
          <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }}
            className="mx-5 mb-3 rounded-2xl p-3.5 flex items-center gap-3"
            style={{ background:budgetPct>=100?'rgba(200,57,43,0.15)':'rgba(232,168,50,0.12)', border:`1px solid ${budgetPct>=100?'rgba(200,57,43,0.3)':'rgba(232,168,50,0.25)'}` }}>
            <AlertTriangle className="w-4 h-4 shrink-0" style={{ color:budgetPct>=100?'#C8392B':'#E8A832' }}/>
            <p className="text-xs font-medium" style={{ color:'var(--sand)' }}>
              {budgetPct>=100?'Budget überschritten!':'Budget fast aufgebraucht'} · {Math.round(budgetPct)}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Balance Card */}
      <div className="px-5 mb-4">
        <div className="rounded-3xl p-6 relative overflow-hidden"
             style={{ background:'#C8392B' }}>
          {/* Decorative circle */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full"
               style={{ background:'rgba(255,255,255,0.1)' }}/>
          <div className="absolute -bottom-10 -right-4 w-48 h-48 rounded-full"
               style={{ background:'rgba(255,255,255,0.06)' }}/>

          <p className="text-sm text-white/70 mb-1 relative z-10">{MONTH_LONG[viewMonth]} {viewYear}</p>
          <p className="font-display text-4xl text-white mb-0.5 relative z-10 tracking-tight">
            {fmt(balance)}
          </p>
          <p className="text-xs text-white/60 relative z-10">
            {balance >= 0 ? 'Aktuelles Plus' : 'Aktuelles Minus'}
          </p>

          <div className="flex gap-6 mt-5 relative z-10">
            <div>
              <p className="text-xs text-white/60 mb-0.5">Einnahmen</p>
              <p className="text-base font-semibold text-white">{fmt(totalIncome)}</p>
            </div>
            <div style={{ width:'1px', background:'rgba(255,255,255,0.2)' }}/>
            <div>
              <p className="text-xs text-white/60 mb-0.5">Ausgaben</p>
              <p className="text-base font-semibold text-white">{fmt(totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Row */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-4">
        {[
          { label:'Sparquote',    value:`${savingsRate}%`,     color:'#E8A832' },
          { label:'Versicherung', value:fmt(monthlyIns),       color:'var(--sand)' },
          { label:'Schulden',     value:fmt(totalDebtLeft),    color: totalDebtLeft>0?'#C8392B':'var(--sand)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-3 text-center"
               style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] text-cement mb-1">{label}</p>
            <p className="font-semibold text-sm" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Monatsabschluss */}
      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="mx-5 mb-4 rounded-2xl p-4"
            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] text-cement uppercase tracking-widest mb-3 font-mono">Monatsabschluss {MONTH_NAMES[prevMonth]}</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:'Einnahmen', val:prevIncome,  color:'#E8A832' },
                { label:'Ausgaben',  val:prevExpense, color:'#C8392B' },
                { label:'Netto',     val:prevBalance, color:prevBalance>=0?'#E8A832':'#C8392B' },
              ].map(k => (
                <div key={k.label} className="text-center">
                  <p className="text-[9px] text-cement mb-0.5">{k.label}</p>
                  <p className="font-semibold text-sm" style={{ color:k.color }}>{fmt(k.val)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prognose */}
      {showForecast && (
        <div className="mx-5 mb-4 rounded-2xl p-4"
             style={{ background:'rgba(232,168,50,0.08)', border:'1px solid rgba(232,168,50,0.2)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-cement uppercase tracking-widest font-mono">Prognose</p>
            <p className="text-[10px]" style={{ color:'rgba(232,168,50,0.7)' }}>Tag {daysPassed}/{daysInMonth}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] text-cement mb-0.5">Ausgaben (proj.)</p>
              <p className="font-semibold text-sm" style={{ color:'#C8392B' }}>{fmt(projExpense)}</p>
            </div>
            <div>
              <p className="text-[9px] text-cement mb-0.5">Netto (proj.)</p>
              <p className="font-semibold text-sm" style={{ color:projBalance>=0?'#E8A832':'#C8392B' }}>{fmt(projBalance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Nav — Ziele & Schulden */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-4">
        <button onClick={() => setActiveTab('ziele')}
          className="rounded-2xl p-4 text-left"
          style={{ background:'rgba(232,168,50,0.1)', border:'1px solid rgba(232,168,50,0.2)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                 style={{ background:'rgba(232,168,50,0.2)' }}>
              <Target className="w-4 h-4" style={{ color:'#E8A832' }}/>
            </div>
            <Arrow className="w-3.5 h-3.5 text-cement"/>
          </div>
          <p className="font-semibold text-lg" style={{ color:'#E8A832' }}>{goals.length}</p>
          <p className="text-xs text-cement">Sparziele</p>
        </button>
        <button onClick={() => setActiveTab('schulden')}
          className="rounded-2xl p-4 text-left"
          style={{ background: totalDebtLeft>0?'rgba(200,57,43,0.1)':'rgba(255,255,255,0.06)',
                   border: `1px solid ${totalDebtLeft>0?'rgba(200,57,43,0.2)':'rgba(255,255,255,0.08)'}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                 style={{ background: totalDebtLeft>0?'rgba(200,57,43,0.2)':'rgba(255,255,255,0.1)' }}>
              <TrendingDown className="w-4 h-4" style={{ color: totalDebtLeft>0?'#C8392B':'var(--cement)' }}/>
            </div>
            <Arrow className="w-3.5 h-3.5 text-cement"/>
          </div>
          <p className="font-semibold text-lg" style={{ color: totalDebtLeft>0?'#C8392B':'var(--sand)' }}>
            {fmt(totalDebtLeft)}
          </p>
          <p className="text-xs text-cement">Schulden offen</p>
        </button>
      </div>

      {/* Top Kategorien */}
      {topCats.length > 0 && (
        <div className="mx-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color:'var(--sand)' }}>Top Ausgaben</p>
            <button onClick={() => setActiveTab('analysen')} className="text-xs text-cement">Mehr →</button>
          </div>
          <div className="space-y-2">
            {topCats.map(([cat, amount]) => {
              const pct = totalExpense > 0 ? (amount/totalExpense)*100 : 0
              return (
                <div key={cat} className="rounded-2xl p-3.5 flex items-center gap-3"
                     style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                       style={{ background:'rgba(255,255,255,0.08)' }}>
                    {CAT_ICONS[cat] ?? '💳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium" style={{ color:'var(--sand)' }}>{cat}</p>
                      <p className="text-sm font-semibold" style={{ color:'#C8392B' }}>{fmt(amount)}</p>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width:`${pct}%`, background:'#C8392B', opacity:0.7 }}/>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mx-5 mb-4 rounded-2xl p-4"
           style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color:'var(--sand)' }}>Cashflow</p>
          <p className="text-xs text-cement">6 Monate</p>
        </div>
        <div style={{ height:160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top:0,right:0,left:-28,bottom:0 }} barGap={2}>
              <XAxis dataKey="month" tick={{ fill:'#9AA0A6', fontSize:9 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#9AA0A6', fontSize:9 }} axisLine={false} tickLine={false}
                tickFormatter={v => (v as number)>=1000?`${((v as number)/1000).toFixed(0)}k`:`${v}`}/>
              <Tooltip contentStyle={{ backgroundColor:'#162030', borderColor:'rgba(61,81,102,0.5)', borderRadius:12, color:'#E8DFD0', fontSize:11 }}
                formatter={(v:unknown)=>[fmt(v as number),'']} cursor={{ fill:'rgba(255,255,255,0.04)' }}/>
              <Bar dataKey="income"   name="Einnahmen" fill="#E8A832" radius={[4,4,0,0]} maxBarSize={20}/>
              <Bar dataKey="expenses" name="Ausgaben"  fill="#C8392B" radius={[4,4,0,0]} maxBarSize={20}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:'#E8A832'}}/><span className="text-[10px] text-cement">Einnahmen</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:'#C8392B'}}/><span className="text-[10px] text-cement">Ausgaben</span></div>
        </div>
      </div>

      {/* Letzte Buchungen */}
      <div className="mx-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color:'var(--sand)' }}>Letzte Buchungen</p>
          <button onClick={() => setActiveTab('buchungen')} className="text-xs text-cement">Alle →</button>
        </div>
        {recentTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <ArrowRightLeft className="w-7 h-7 text-cement opacity-30"/>
            <p className="text-sm text-cement">Noch keine Einträge</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTx.map((tx) => (
              <motion.div key={tx.id} className="flex items-center gap-3 rounded-2xl p-3.5"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
                     style={{ background: tx.type==='income'?'rgba(232,168,50,0.15)':'rgba(200,57,43,0.15)' }}>
                  {CAT_ICONS[tx.category] ?? (tx.type==='income'?'💰':'💳')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color:'var(--sand)' }}>{tx.description}</p>
                  <p className="text-xs text-cement">{tx.category} · {new Date(tx.date).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {tx.type==='income'
                    ? <TrendingUp className="w-3 h-3" style={{ color:'#E8A832' }}/>
                    : <TrendingDown className="w-3 h-3" style={{ color:'#C8392B' }}/>}
                  <span className="text-sm font-semibold" style={{ color:tx.type==='income'?'#E8A832':'var(--sand)' }}>
                    {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
