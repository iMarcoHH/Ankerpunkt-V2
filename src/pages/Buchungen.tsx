import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { supabase, CATEGORIES_EXPENSE, CATEGORIES_INCOME } from '../lib/supabase'
import type { RecurringEntry } from '../store'
import { TrendingUp, TrendingDown, Trash2, RefreshCw, Plus } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const TABS = [
  { value: 'all',       label: 'Alle'         },
  { value: 'income',    label: 'Einnahmen'     },
  { value: 'expense',   label: 'Ausgaben'      },
  { value: 'recurring', label: 'Wiederk.'      },
] as const

export function BuchungenPage() {
  const { transactions, setTransactions, recurring, setRecurring, userId,
          viewMonth, viewYear, goToPrevMonth, goToNextMonth } = useStore()
  const [tab, setTab]     = useState<'all'|'income'|'expense'|'recurring'>('all')
  const [showAdd, setAdd] = useState(false)

  const now = new Date()
  const isNow = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const monthTx = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear
  }), [transactions, viewMonth, viewYear])

  const filtered   = tab === 'recurring' ? [] : monthTx.filter(t => tab === 'all' || t.type === tab)
  const incTotal   = monthTx.filter(t => t.type==='income') .reduce((s,t) => s+t.amount, 0)
  const expTotal   = monthTx.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0)

  async function del(id: string) {
    if (!confirm('Löschen?')) return
    if (userId) await supabase.from('transactions').delete().eq('id', id)
    setTransactions(transactions.filter(t => t.id !== id))
  }
  async function delRec(id: string) {
    if (!confirm('Löschen?')) return
    if (userId) await supabase.from('recurring_entries').delete().eq('id', id)
    setRecurring(recurring.filter(r => r.id !== id))
  }
  async function toggleRec(id: string) {
    const r = recurring.find(r => r.id===id); if (!r) return
    const up = { ...r, active: !r.active }
    if (userId) await supabase.from('recurring_entries').update({ active: up.active }).eq('id', id)
    setRecurring(recurring.map(r => r.id===id ? up : r))
  }

  return (
    <div className="p-5 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-end justify-between pt-14">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-white">Buchungen</h1>
          <p className="text-cement text-sm mt-0.5">Einnahmen & Ausgaben</p>
        </div>
        <button onClick={() => setAdd(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-display tracking-wide text-sm text-white"
          style={{ background:'#C8392B' }}>
          <Plus className="w-4 h-4"/> Neu
        </button>
      </div>

      {/* Monat */}
      <div className="flex items-center justify-between ak-card p-3">
        <button onClick={goToPrevMonth} className="w-8 h-8 rounded-full flex items-center justify-center text-cement"
          style={{ background:'rgba(255,255,255,0.06)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span className="font-display text-white text-xl tracking-wide">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={goToNextMonth} disabled={isNow}
          className="w-8 h-8 rounded-full flex items-center justify-center text-cement"
          style={{ background:'rgba(255,255,255,0.06)', opacity: isNow ? 0.3 : 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="ak-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(232,168,50,0.15)' }}>
            <TrendingUp className="w-4 h-4" style={{ color:'#E8A832' }}/>
          </div>
          <div>
            <p className="text-xs text-cement">Einnahmen</p>
            <p className="font-display text-base" style={{ color:'#E8A832' }}>{fmt(incTotal)}</p>
          </div>
        </div>
        <div className="ak-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(200,57,43,0.15)' }}>
            <TrendingDown className="w-4 h-4" style={{ color:'#C8392B' }}/>
          </div>
          <div>
            <p className="text-xs text-cement">Ausgaben</p>
            <p className="font-display text-base" style={{ color:'#C8392B' }}>{fmt(expTotal)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(61,81,102,0.4)' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className="flex-1 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: tab===t.value?'rgba(255,255,255,0.1)':'transparent', color: tab===t.value?'white':'#9AA0A6' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {tab === 'recurring' ? (
        recurring.length === 0 ? (
          <Empty icon={<RefreshCw className="w-5 h-5 text-cement opacity-40"/>} text="Keine Einträge. Beim + 'Wiederkehrend' wählen."/>
        ) : (
          <div className="space-y-2">
            {recurring.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
                className="ak-card p-3.5 flex items-center gap-3 group" style={{ opacity: r.active ? 1 : 0.5 }}>
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background:r.type==='income'?'rgba(232,168,50,0.15)':'rgba(200,57,43,0.15)' }}>
                  <RefreshCw className="w-4 h-4" style={{ color:r.type==='income'?'#E8A832':'#C8392B' }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{r.description}</p>
                  <p className="text-xs text-cement">{r.category} · jeden {r.day_of_month}.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-sm font-semibold" style={{ color:r.type==='income'?'#E8A832':'#E8DFD0' }}>
                    {r.type==='income'?'+':'-'}{fmt(r.amount)}
                  </span>
                  <button onClick={() => toggleRec(r.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                    style={{ background:r.active?'#C8392B':'rgba(255,255,255,0.08)', color:'white' }}>
                    {r.active?'✓':'○'}
                  </button>
                  <button onClick={() => delRec(r.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                    style={{ background:'rgba(200,57,43,0.15)' }}>
                    <Trash2 className="w-3 h-3 text-red-400"/>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <Empty icon={<TrendingDown className="w-5 h-5 text-cement opacity-40"/>} text={`Keine Einträge für ${MONTH_NAMES[viewMonth]}.`}/>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
              className="ak-card p-3.5 flex items-center gap-3 group">
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display text-xs"
                   style={{ background:tx.type==='income'?'rgba(232,168,50,0.15)':'rgba(200,57,43,0.15)',
                            color:tx.type==='income'?'#E8A832':'#C8392B' }}>
                {tx.category?.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{tx.description}</p>
                <p className="text-xs text-cement">{tx.category} · {new Date(tx.date).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-sm font-semibold" style={{ color:tx.type==='income'?'#E8A832':'#E8DFD0' }}>
                  {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                </span>
                <button onClick={() => del(tx.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                  style={{ background:'rgba(200,57,43,0.15)' }}>
                  <Trash2 className="w-3 h-3 text-red-400"/>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAdd && <AddSheet onClose={() => setAdd(false)}/>}
    </div>
  )
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 rounded-2xl gap-3"
         style={{ border:'2px dashed rgba(61,81,102,0.4)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:'rgba(61,81,102,0.2)' }}>{icon}</div>
      <p className="text-sm text-cement text-center px-4">{text}</p>
    </div>
  )
}

function AddSheet({ onClose }: { onClose: () => void }) {
  const { transactions, setTransactions, recurring, setRecurring, userId, viewMonth, viewYear } = useStore()
  const [type, setType]       = useState<'income'|'expense'>('expense')
  const [amount, setAmount]   = useState('')
  const [desc, setDesc]       = useState('')
  const [category, setCat]    = useState('')
  const [date, setDate]       = useState(
    new Date(viewYear, viewMonth, Math.min(new Date().getDate(), new Date(viewYear, viewMonth+1, 0).getDate()))
      .toISOString().split('T')[0]
  )
  const [recurrence, setRec]  = useState<'once'|'monthly'|'yearly'>('once')
  const [recDay, setRecDay]   = useState(new Date().getDate().toString())
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const cats = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  async function save() {
    if (!amount || !desc || !category) { setError('Alle Felder ausfüllen.'); return }
    setSaving(true); setError('')
    try {
      const tx = { user_id: userId??'demo', type, amount: parseFloat(amount), description: desc, category, date }
      if (userId) {
        const { data: row, error: err } = await supabase.from('transactions').insert(tx).select().single()
        if (err) throw err
        setTransactions([row, ...transactions])
      } else {
        setTransactions([{ ...tx, id: Date.now().toString(), created_at: new Date().toISOString() }, ...transactions])
      }
      if (recurrence !== 'once') {
        const entry: Omit<RecurringEntry,'id'|'created_at'> = {
          user_id: userId??'demo', type, amount: parseFloat(amount),
          description: desc, category, day_of_month: parseInt(recDay), active: true,
        }
        if (userId) {
          const { data: row } = await supabase.from('recurring_entries').insert(entry).select().single()
          if (row) setRecurring([...recurring, row])
        } else {
          setRecurring([...recurring, { ...entry, id: Date.now()+'r', created_at: new Date().toISOString() }])
        }
      }
      onClose()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Fehler') }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="flex justify-center mb-3"><div className="w-10 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/></div>
        <div className="flex justify-between items-center mb-4">
          <div className="font-display text-white text-2xl">NEUER EINTRAG</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-cement text-xl" style={{ background:'rgba(255,255,255,0.08)' }}>×</button>
        </div>
        <div className="flex gap-2 mb-4">
          {(['expense','income'] as const).map(t => (
            <button key={t} onClick={() => { setType(t); setCat('') }}
              className="flex-1 py-2.5 rounded-xl font-display text-sm tracking-wider transition-all"
              style={{ background:type===t?(t==='expense'?'#C8392B':'#E8A832'):'rgba(255,255,255,0.06)',
                       color:type===t?(t==='expense'?'white':'#0D1B2A'):'#9AA0A6' }}>
              {t==='expense'?'↓ Ausgabe':'↑ Einnahme'}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl" style={{ color:'rgba(255,255,255,0.2)' }}>€</div>
            <input className="ak-input pl-10 font-display text-3xl" type="number" inputMode="decimal"
              placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus/>
          </div>
          <input className="ak-input" placeholder="Beschreibung" value={desc} onChange={e => setDesc(e.target.value)}/>
          <input className="ak-input" type="date" value={date} onChange={e => setDate(e.target.value)}/>
          <div>
            <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Kategorie</div>
            <div className="flex flex-wrap gap-1.5">
              {cats.map(c => <button key={c} onClick={() => setCat(c)} className={`cat-chip ${category===c?'selected':''}`}>{c}</button>)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Wiederholung</div>
            <div className="flex gap-1.5">
              {([['once','Einmalig'],['monthly','Monatlich'],['yearly','Jährlich']] as const).map(([val,label]) => (
                <button key={val} onClick={() => setRec(val)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{ background:recurrence===val?'#C8392B':'rgba(255,255,255,0.06)', color:recurrence===val?'white':'#9AA0A6' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {recurrence !== 'once' && (
            <div>
              <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-1">Tag im Monat</div>
              <select className="ak-input" value={recDay} onChange={e => setRecDay(e.target.value)}>
                {Array.from({length:28},(_,i)=>i+1).map(d => <option key={d} value={d}>{d}. des Monats</option>)}
              </select>
            </div>
          )}
          {error && <div className="font-mono text-[10px] px-3 py-2 rounded-lg" style={{ background:'rgba(200,57,43,0.15)', color:'#f87171' }}>{error}</div>}
          <button onClick={save} disabled={saving} className="w-full ak-btn ak-btn-primary">
            {saving ? 'Speichern...' : recurrence !== 'once' ? 'Eintragen & wiederholen' : 'Eintragen'}
          </button>
        </div>
      </div>
    </div>
  )
}
