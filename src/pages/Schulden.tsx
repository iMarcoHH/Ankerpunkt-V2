import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import type { Debt } from '../store'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, TrendingDown, AlertCircle, Check, X } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(v)

const DEBT_COLORS = ['#C8392B','#E8A832','#3B82F6','#10B981','#8B5CF6','#F97316']
const DEBT_CATEGORIES = ['Kredit','Raten','Dispo','Freunde/Familie','Studentenkredit','Sonstiges']

export function SchuldenPage() {
  const { debts, setDebts, userId } = useStore()
  const [showAdd, setAdd]     = useState(false)
  const [showPay, setShowPay] = useState<Debt|null>(null)

  const totalDebt    = debts.reduce((s,d) => s + d.total_amount, 0)
  const totalPaid    = debts.reduce((s,d) => s + d.paid_amount, 0)
  const totalLeft    = totalDebt - totalPaid
  const monthlyTotal = debts.reduce((s,d) => s + d.monthly_rate, 0)
  const overallPct   = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0

  async function del(id: string) {
    if (userId) await supabase.from('debts').delete().eq('id', id)
    setDebts(debts.filter(d => d.id !== id))
  }

  return (
    <div className="p-5 space-y-4 pb-8">
      <div className="pt-14 flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-white">Schulden</h1>
          <p className="text-cement text-sm mt-0.5">Tracker & Überblick</p>
        </div>
        <button onClick={() => setAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-display tracking-wide text-sm text-white"
          style={{ background:'#C8392B' }}>
          <Plus className="w-3.5 h-3.5"/> Neu
        </button>
      </div>

      {debts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-5xl">🎉</div>
          <p className="font-display text-xl tracking-wide text-white">Keine Schulden!</p>
          <p className="text-sm text-cement text-center">Oder trag hier Kredite und<br/>Ratenzahlungen ein um den Überblick zu behalten.</p>
        </div>
      ) : (
        <>
          {/* Übersicht */}
          <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
            className="relative overflow-hidden rounded-2xl p-5"
            style={{ background:'linear-gradient(135deg, #1a0a0a 0%, #2d1515 100%)' }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
                 style={{ background:'#C8392B', filter:'blur(50px)', transform:'translate(20%,-20%)' }}/>
            <p className="text-xs text-cement uppercase tracking-widest mb-1">Noch offen</p>
            <p className="font-display text-4xl text-white mb-1">{fmt(totalLeft)}</p>
            <p className="text-xs text-cement mb-4">von {fmt(totalDebt)} gesamt · {fmt(totalPaid)} bereits bezahlt</p>
            <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background:'rgba(255,255,255,0.1)' }}>
              <motion.div className="h-full rounded-full" style={{ background:'#C8392B' }}
                initial={{ width:0 }} animate={{ width:`${overallPct}%` }} transition={{ duration:1 }}/>
            </div>
            <p className="text-xs text-cement">{overallPct.toFixed(0)}% abbezahlt</p>
          </motion.div>

          {/* KPI */}
          <div className="grid grid-cols-2 gap-3">
            <div className="ak-card p-4">
              <p className="text-[10px] text-cement uppercase tracking-wider mb-1">Monatliche Rate</p>
              <p className="font-display text-xl" style={{ color:'#C8392B' }}>{fmt(monthlyTotal)}</p>
            </div>
            <div className="ak-card p-4">
              <p className="text-[10px] text-cement uppercase tracking-wider mb-1">Offene Posten</p>
              <p className="font-display text-xl text-white">{debts.length}</p>
            </div>
          </div>

          {/* Schulden Liste */}
          <div className="space-y-3">
            {debts.map((debt, i) => {
              const pct  = debt.total_amount > 0 ? (debt.paid_amount / debt.total_amount) * 100 : 0
              const left = debt.total_amount - debt.paid_amount
              const monthsLeft = debt.monthly_rate > 0 ? Math.ceil(left / debt.monthly_rate) : null
              return (
                <motion.div key={debt.id} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
                  className="ak-card p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-display text-sm"
                           style={{ background:`${debt.color}22`, color:debt.color }}>
                        {debt.category.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{debt.name}</p>
                        <p className="text-[10px] text-cement">{debt.category}{debt.interest > 0 ? ` · ${debt.interest}% p.a.` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setShowPay(debt)}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{ background:`${debt.color}22`, color:debt.color }}>
                        Zahlen
                      </button>
                      <button onClick={() => del(debt.id)} className="text-cement opacity-50">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-cement">{fmt(debt.paid_amount)} bezahlt</span>
                    <span className="font-mono text-sm font-semibold" style={{ color:debt.color }}>{fmt(left)} offen</span>
                  </div>

                  <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background:'rgba(255,255,255,0.08)' }}>
                    <motion.div className="h-full rounded-full" style={{ background:debt.color }}
                      initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, delay:i*0.1 }}/>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-cement">{pct.toFixed(0)}% abbezahlt</span>
                    <div className="flex items-center gap-3">
                      {debt.monthly_rate > 0 && <span className="text-[10px] text-cement">{fmt(debt.monthly_rate)}/mo</span>}
                      {monthsLeft && <span className="text-[10px] text-cement">~{monthsLeft} Monate</span>}
                      {debt.due_date && <span className="text-[10px]" style={{ color:debt.color }}>bis {new Date(debt.due_date).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'})}</span>}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Tipp */}
          {monthlyTotal > 0 && (
            <div className="rounded-2xl p-4 flex gap-3" style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color:'#60A5FA' }}/>
              <p className="text-xs text-cement leading-relaxed">
                Du zahlst <span className="text-white font-semibold">{fmt(monthlyTotal)}/Monat</span> an Schulden zurück. Priorisiere Schulden mit dem höchsten Zinssatz zuerst.
              </p>
            </div>
          )}
        </>
      )}

      {showAdd  && <AddDebtSheet   onClose={() => setAdd(false)}/>}
      {showPay  && <PaySheet debt={showPay} onClose={() => setShowPay(null)}/>}
    </div>
  )
}

// ── Add Sheet ────────────────────────────────────────────────────────────────
function AddDebtSheet({ onClose }: { onClose: () => void }) {
  const { debts, setDebts, userId } = useStore()
  const [name,     setName]     = useState('')
  const [total,    setTotal]    = useState('')
  const [paid,     setPaid]     = useState('0')
  const [interest, setInterest] = useState('')
  const [monthly,  setMonthly]  = useState('')
  const [dueDate,  setDueDate]  = useState('')
  const [category, setCategory] = useState(DEBT_CATEGORIES[0])
  const [color,    setColor]    = useState(DEBT_COLORS[0])
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState('')

  async function save() {
    if (!name || !total) { setErr('Name und Betrag pflicht.'); return }
    setSaving(true)
    const debt = {
      user_id:      userId ?? 'demo',
      name,
      total_amount: parseFloat(total),
      paid_amount:  parseFloat(paid) || 0,
      interest:     parseFloat(interest) || 0,
      monthly_rate: parseFloat(monthly) || 0,
      due_date:     dueDate || null,
      category,
      color,
    }
    if (userId) {
      const { data: row, error } = await supabase.from('debts').insert(debt).select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      if (row) setDebts([...debts, row as Debt])
    } else {
      setDebts([...debts, { ...debt, id: Date.now().toString(), created_at: new Date().toISOString() } as Debt])
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="flex justify-center mb-3"><div className="w-9 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/></div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-display text-white text-xl">NEUE SCHULD</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-cement" style={{ background:'rgba(255,255,255,0.08)' }}>×</button>
        </div>
        <div className="space-y-2">
          <input className="ak-input" placeholder="Bezeichnung (z.B. Autokredit)" value={name} onChange={e=>setName(e.target.value)}/>
          <div className="grid grid-cols-2 gap-2">
            <input className="ak-input" type="number" inputMode="decimal" placeholder="Gesamtbetrag €" value={total} onChange={e=>setTotal(e.target.value)}/>
            <input className="ak-input" type="number" inputMode="decimal" placeholder="Bereits bezahlt €" value={paid} onChange={e=>setPaid(e.target.value)}/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="ak-input" type="number" inputMode="decimal" placeholder="Zinssatz % p.a." value={interest} onChange={e=>setInterest(e.target.value)}/>
            <input className="ak-input" type="number" inputMode="decimal" placeholder="Monatsrate €" value={monthly} onChange={e=>setMonthly(e.target.value)}/>
          </div>
          <input className="ak-input" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
          <div>
            <p className="font-mono text-[9px] text-cement tracking-widest uppercase mb-1.5">Kategorie</p>
            <div className="flex flex-wrap gap-1.5">
              {DEBT_CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className="text-[10px] px-2.5 py-1 rounded-full transition-all"
                  style={{ background:category===c?'#C8392B':'rgba(255,255,255,0.06)', color:category===c?'white':'#9AA0A6' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] text-cement tracking-widest uppercase mb-1.5">Farbe</p>
            <div className="flex gap-2">
              {DEBT_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background:c, outline:color===c?`3px solid ${c}`:undefined, outlineOffset:2 }}/>
              ))}
            </div>
          </div>
          {err && <p className="text-[10px] px-2 py-1.5 rounded-lg" style={{ background:'rgba(200,57,43,0.15)', color:'#f87171' }}>{err}</p>}
          <button onClick={save} disabled={saving} className="w-full ak-btn ak-btn-primary">
            {saving ? 'Speichern...' : 'Eintragen'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pay Sheet ────────────────────────────────────────────────────────────────
function PaySheet({ debt, onClose }: { debt: Debt; onClose: () => void }) {
  const { debts, setDebts, userId } = useStore()
  const [amount, setAmount] = useState(String(debt.monthly_rate || ''))
  const [saving, setSaving] = useState(false)
  const left = debt.total_amount - debt.paid_amount

  async function save() {
    const pay = Math.min(parseFloat(amount) || 0, left)
    if (pay <= 0) return
    setSaving(true)
    const newPaid = debt.paid_amount + pay
    if (userId) await supabase.from('debts').update({ paid_amount: newPaid }).eq('id', debt.id)
    setDebts(debts.map(d => d.id===debt.id ? { ...d, paid_amount: newPaid } : d))
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="flex justify-center mb-3"><div className="w-9 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/></div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-display text-white text-xl">ZAHLUNG</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-cement" style={{ background:'rgba(255,255,255,0.08)' }}>×</button>
        </div>
        <div className="ak-card p-3 mb-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-sm"
               style={{ background:`${debt.color}22`, color:debt.color }}>
            {debt.category.slice(0,2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{debt.name}</p>
            <p className="text-xs text-cement">Noch offen: {fmt(left)}</p>
          </div>
        </div>
        <div className="space-y-2">
          <input className="ak-input" type="number" inputMode="decimal"
            placeholder="Betrag zahlen €" value={amount} onChange={e=>setAmount(e.target.value)}/>
          <div className="flex gap-2">
            {[debt.monthly_rate, left].filter(v=>v>0).map(v => (
              <button key={v} onClick={() => setAmount(String(v))}
                className="flex-1 py-1.5 rounded-xl text-xs font-medium"
                style={{ background:'rgba(255,255,255,0.06)', color:'#9AA0A6' }}>
                {fmt(v)}
              </button>
            ))}
          </div>
          <button onClick={save} disabled={saving} className="w-full ak-btn ak-btn-primary">
            {saving ? 'Buche...' : 'Zahlung buchen'}
          </button>
        </div>
      </div>
    </div>
  )
}
