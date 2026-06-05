import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import type { CategoryBudget } from '../store'
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRightLeft, ShieldCheck,
         AlertTriangle, X, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase, CATEGORIES_EXPENSE } from '../lib/supabase'

const fmt        = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(v)
const fmtTooltip = (v: unknown) => [fmt(v as number), '']
const MONTH_NAMES = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const MONTH_LONG  = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const tooltipStyle = { backgroundColor:'#162030', borderColor:'#3D5166', borderRadius:12, color:'#E8DFD0', fontSize:12 }

const fadeUp = {
  hidden: { opacity:0, y:16 },
  show:   (i: number) => ({ opacity:1, y:0, transition:{ delay:i*0.07, duration:0.35 } }),
}

export function DashboardPage() {
  const { transactions, insurances, goals, debts, budgets, setBudgets,
          setActiveTab, viewMonth, viewYear, goToPrevMonth, goToNextMonth, userId, profile } = useStore()

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
  const prevExpense  = useMemo(() => prevMonthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0), [prevMonthTx])
  const prevIncome   = useMemo(() => prevMonthTx.filter(t=>t.type==='income') .reduce((s,t)=>s+t.amount,0), [prevMonthTx])
  const balance      = totalIncome - totalExpense
  const prevBalance  = prevIncome - prevExpense
  const savingsRate  = totalIncome > 0 ? Math.round((balance/totalIncome)*100) : 0
  const monthlyIns   = useMemo(() => insurances.reduce((s,i)=>s+(i.recurrence==='monthly'?i.amount:i.amount/12),0), [insurances])
  const recentTx     = useMemo(() => [...transactions].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,6), [transactions])

  // Schulden
  const totalDebtLeft = debts.reduce((s,d) => s + (d.total_amount - d.paid_amount), 0)

  // Kategorien-Ausgaben
  const catSpend = useMemo(() => {
    const map: Record<string,number> = {}
    monthTx.filter(t=>t.type==='expense').forEach(t => { map[t.category] = (map[t.category]??0)+t.amount })
    return map
  }, [monthTx])

  // Prognose
  const today       = now.getDate()
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate()
  const daysPassed  = isCurrentMonth ? today : daysInMonth
  const factor      = daysInMonth / Math.max(daysPassed, 1)
  const projExpense = Math.round(totalExpense * factor)
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
    <div className="p-5 space-y-4 pb-8">

      {/* Monatsnavigation */}
      <div className="flex items-center justify-between pt-14">
        <button onClick={goToPrevMonth} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background:'rgba(255,255,255,0.06)', color:'#9AA0A6' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
          <div className="font-display text-2xl tracking-wide" style={{ color:'var(--sand)' }}>{MONTH_LONG[viewMonth]} {viewYear}</div>
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

      {/* Budget-Warnung */}
      <AnimatePresence>
        {showBudgetWarn && (
          <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background:budgetPct>=100?'rgba(200,57,43,0.2)':'rgba(232,168,50,0.15)', border:`1px solid ${budgetPct>=100?'rgba(200,57,43,0.4)':'rgba(232,168,50,0.3)'}` }}>
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color:budgetPct>=100?'#C8392B':'#E8A832' }}/>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color:'var(--sand)' }}>{budgetPct>=100?'Budget überschritten!':'Budget fast aufgebraucht'}</p>
              <p className="text-xs text-cement mt-0.5">{fmt(totalExpense)} von {fmt(monthlyBudget)} — {Math.round(budgetPct)}% verbraucht</p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full" style={{ width:`${Math.min(budgetPct,100)}%`, background:budgetPct>=100?'#C8392B':'#E8A832' }}/>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monatsabschluss */}
      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
            className="ak-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background:'#3D5166' }}/>
              <p className="font-mono text-[10px] text-cement tracking-widest uppercase">Monatsabschluss</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:'Einnahmen', val:prevIncome,  color:'#E8A832' },
                { label:'Ausgaben',  val:prevExpense, color:'#C8392B' },
                { label:'Netto',     val:prevBalance, color:prevBalance>=0?'#E8A832':'#C8392B' },
              ].map(k => (
                <div key={k.label} className="rounded-xl p-3 text-center" style={{ background:'rgba(255,255,255,0.04)' }}>
                  <p className="text-[9px] text-cement mb-1">{k.label}</p>
                  <p className="font-display text-sm" style={{ color:k.color }}>{fmt(k.val)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero balance */}
      <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
        className="hero-card relative overflow-hidden rounded-2xl p-6"
        style={{ background:'linear-gradient(135deg, #162030 0%, #1e3048 60%, #243850 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
             style={{ background:'#E8A832', filter:'blur(60px)', transform:'translate(20%,-20%)' }}/>
        <p className="text-xs text-cement uppercase tracking-widest font-medium">
          {balance >= 0 ? 'Aktuelles Plus' : 'Aktuelles Minus'} · {MONTH_NAMES[viewMonth]}
        </p>
        <p className="text-4xl font-display tracking-wide mt-2" style={{ color:balance>=0?'white':'#C8392B' }}>
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
          { label:'Einnahmen',    value:fmt(totalIncome),      Icon:TrendingUp,   accent:'#E8A832' },
          { label:'Ausgaben',     value:fmt(totalExpense),     Icon:TrendingDown, accent:'#C8392B' },
          { label:'Sparquote',    value:`${savingsRate}%`,     Icon:Wallet,       accent:'#E8A832' },
          { label:'Versicherung', value:fmt(monthlyIns)+'/mo', Icon:ShieldCheck,  accent:'#3D5166' },
        ].map(({ label, value, Icon, accent }, i) => (
          <motion.div key={label} variants={fadeUp} custom={i} initial="hidden" animate="show">
            <div className="ak-card p-4 flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:accent+'22' }}>
                <Icon className="w-5 h-5" style={{ color:accent }}/>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-cement uppercase tracking-wider">{label}</p>
                <p className="font-display text-lg mt-0.5 truncate" style={{ color:'var(--sand)' }}>{value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ziele + Schulden Quick Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setActiveTab('ziele')}
          className="ak-card p-4 flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(232,168,50,0.15)' }}>
              <Target className="w-4 h-4" style={{ color:'#E8A832' }}/>
            </div>
            <span className="font-mono text-[9px] text-cement">→</span>
          </div>
          <div>
            <p className="font-display text-xl" style={{ color:'var(--sand)' }}>{goals.length}</p>
            <p className="text-xs text-cement">Sparziele</p>
          </div>
        </button>
        <button onClick={() => setActiveTab('schulden')}
          className="ak-card p-4 flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(200,57,43,0.15)' }}>
              <TrendingDown className="w-4 h-4" style={{ color:'#C8392B' }}/>
            </div>
            <span className="font-mono text-[9px] text-cement">→</span>
          </div>
          <div>
            <p className="font-display text-xl" style={{ color: totalDebtLeft > 0 ? '#C8392B' : 'var(--sand)' }}>
              {totalDebtLeft > 0 ? fmt(totalDebtLeft) : '0 €'}
            </p>
            <p className="text-xs text-cement">Schulden offen</p>
          </div>
        </button>
      </div>

      {/* Prognose */}
      {showForecast && (
        <motion.div className="ak-card p-4" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
          style={{ border:'1px solid rgba(232,168,50,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background:'#E8A832' }}/>
            <p className="font-mono text-[10px] text-cement tracking-widest uppercase">Prognose Monatsende</p>
            <p className="font-mono text-[10px] tracking-widest ml-auto" style={{ color:'rgba(232,168,50,0.6)' }}>
              Tag {daysPassed}/{daysInMonth}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background:'rgba(200,57,43,0.08)' }}>
              <p className="text-[9px] text-cement uppercase mb-1">Ausgaben (proj.)</p>
              <p className="font-display text-sm" style={{ color:'#C8392B' }}>{fmt(projExpense)}</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background:projBalance>=0?'rgba(232,168,50,0.08)':'rgba(200,57,43,0.08)' }}>
              <p className="text-[9px] text-cement uppercase mb-1">Netto (proj.)</p>
              <p className="font-display text-sm" style={{ color:projBalance>=0?'#E8A832':'#C8392B' }}>{fmt(projBalance)}</p>
            </div>
          </div>
          <p className="text-[10px] text-cement mt-2 text-center">Hochrechnung basierend auf {daysPassed} von {daysInMonth} Tagen</p>
        </motion.div>
      )}

      {/* Chart */}
      <motion.div className="ak-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}>
        <p className="font-display text-xl tracking-wide mb-1" style={{ color:'var(--sand)' }}>Cashflow</p>
        <p className="text-xs text-cement mb-4">6-Monats-Verlauf</p>
        <div style={{ height:200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top:4,right:0,left:-20,bottom:0 }}>
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

      {/* Letzte Buchungen */}
      <motion.div className="ak-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.35 }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-xl tracking-wide" style={{ color:'var(--sand)' }}>Aktuell</p>
          <button onClick={() => setActiveTab('buchungen')} className="text-xs text-cement">Alle →</button>
        </div>
        {recentTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <ArrowRightLeft className="w-8 h-8 text-cement opacity-30"/>
            <p className="text-sm text-cement">Noch keine Einträge</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTx.map((tx,i) => (
              <motion.div key={tx.id} className="flex items-center gap-3"
                initial={{ opacity:0,x:10 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.4+i*0.05 }}>
                <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                     style={{ background:tx.type==='income'?'rgba(232,168,50,0.15)':'rgba(200,57,43,0.15)' }}>
                  <ArrowRightLeft className="w-4 h-4" style={{ color:tx.type==='income'?'#E8A832':'#C8392B' }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color:'var(--sand)' }}>{tx.description}</p>
                  <p className="text-xs text-cement">{new Date(tx.date).toLocaleDateString('de-DE')}</p>
                </div>
                <span className="text-sm font-mono font-semibold shrink-0" style={{ color:tx.type==='income'?'#E8A832':'var(--sand)' }}>
                  {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
