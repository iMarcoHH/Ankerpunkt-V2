import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { supabase, CATEGORIES_EXPENSE, CATEGORIES_INCOME } from '../lib/supabase'
import type { RecurringEntry } from '../store'
import { TrendingUp, TrendingDown, Trash2, CalendarClock, ArrowRightLeft, Plus, RefreshCw } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

const TABS = [
  { value: 'all',       label: 'Alle'          },
  { value: 'income',    label: 'Einnahmen'      },
  { value: 'expense',   label: 'Ausgaben'       },
  { value: 'recurring', label: 'Wiederkehrend'  },
] as const

export function BuchungenPage() {
  const { transactions, setTransactions, recurring, setRecurring, userId, viewMonth, viewYear, goToPrevMonth, goToNextMonth } = useStore()
  const [tab, setTab] = useState<'all'|'income'|'expense'|'recurring'>('all')
  const [showAdd, setShowAdd] = useState(false)

  const now = new Date()
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const monthTx = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear
  }), [transactions, viewMonth, viewYear])

  const filtered = tab === 'recurring' ? [] : monthTx.filter(t => tab === 'all' || t.type === tab)
  const incomeTotal  = monthTx.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0)
  const expenseTotal = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  async function handleDelete(id: string) {
    if (!confirm('Eintrag löschen?')) return
    if (userId) await supabase.from('transactions').delete().eq('id', id)
    setTransactions(transactions.filter(t => t.id !== id))
  }

  async function handleDeleteRecurring(id: string) {
    if (!confirm('Wiederkehrenden Eintrag löschen?')) return
    if (userId) await supabase.from('recurring_entries').delete().eq('id', id)
    setRecurring(recurring.filter(r => r.id !== id))
  }

  async function handleToggle(id: string) {
    const r = recurring.find(r => r.id === id); if (!r) return
    const updated = { ...r, active: !r.active }
    if (userId) await supabase.from('recurring_entries').update({ active: updated.active }).eq('id', id)
    setRecurring(recurring.map(r => r.id === id ? updated : r))
  }

  return (
    <div className="p-5 space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-end justify-between pt-14">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-white">Buchungen</h1>
          <p className="text-cement text-sm mt-1">Einnahmen und Ausgaben verwalten</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-display tracking-wide text-sm text-white transition-all"
          style={{ background: '#C8392B' }}>
          <Plus className="w-4 h-4"/> Neu
        </button>
      </div>

      {/* Monatsnavigation */}
      <div className="flex items-center justify-between ak-card p-3">
        <button onClick={goToPrevMonth} className="w-8 h-8 rounded-full flex items-center justify-center text-cement"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
          <div className="font-display text-white text-xl tracking-wide">{MONTH_NAMES[viewMonth]} {viewYear}</div>
        </div>
        <button onClick={goToNextMonth} disabled={isCurrentMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-cement"
          style={{ background: 'rgba(255,255,255,0.06)', opacity: isCurrentMonth ? 0.3 : 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 gap-3">
        <div className="ak-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(232,168,50,0.15)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#E8A832' }}/>
          </div>
          <div>
            <p className="text-xs text-cement">Einnahmen</p>
            <p className="font-display text-lg" style={{ color: '#E8A832' }}>{fmt(incomeTotal)}</p>
          </div>
        </div>
        <div className="ak-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(200,57,43,0.15)' }}>
            <TrendingDown className="w-5 h-5" style={{ color: '#C8392B' }}/>
          </div>
          <div>
            <p className="text-xs text-cement">Ausgaben</p>
            <p className="font-display text-lg" style={{ color: '#C8392B' }}>{fmt(expenseTotal)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(61,81,102,0.4)' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className="flex-1 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: tab === t.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                     color: tab === t.value ? 'white' : '#9AA0A6' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {tab === 'recurring' ? (
        <div className="space-y-2">
          {recurring.length === 0 ? (
            <EmptyState icon={<RefreshCw className="w-6 h-6 text-cement opacity-40"/>} text="Keine wiederkehrenden Einträge. Beim Hinzufügen 'Wiederkehrend' aktivieren."/>
          ) : recurring.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.04 }}
              className="ak-card p-4 flex items-center gap-3" style={{ opacity: r.active ? 1 : 0.5 }}>
              <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                   style={{ background: r.type === 'income' ? 'rgba(232,168,50,0.15)' : 'rgba(200,57,43,0.15)' }}>
                <RefreshCw className="w-4 h-4" style={{ color: r.type === 'income' ? '#E8A832' : '#C8392B' }}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{r.description}</p>
                <p className="text-xs text-cement">{r.category} · jeden {r.day_of_month}. des Monats</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-semibold" style={{ color: r.type === 'income' ? '#E8A832' : '#E8DFD0' }}>
                  {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                </span>
                <button onClick={() => handleToggle(r.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{ background: r.active ? '#C8392B' : 'rgba(255,255,255,0.08)', color: 'white' }}>
                  {r.active ? '✓' : '○'}
                </button>
                <button onClick={() => handleDeleteRecurring(r.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-cement hover:text-red-400"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ArrowRightLeft className="w-6 h-6 text-cement opacity-40"/>} text="Keine Einträge für diesen Monat."/>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.04 }}
              className="ak-card p-4 flex items-center gap-3 group">
              <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-display text-sm"
                   style={{ background: tx.type === 'income' ? 'rgba(232,168,50,0.15)' : 'rgba(200,57,43,0.15)',
                            color: tx.type === 'income' ? '#E8A832' : '#C8392B' }}>
                {tx.category?.slice(0,2).toUpperCase() || (tx.type === 'income' ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{tx.description}</p>
                <div className="flex gap-2 text-xs text-cement mt-0.5">
                  {tx.category && <span>{tx.category}</span>}
                  {tx.category && <span>·</span>}
                  <span>{new Date(tx.date).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-semibold"
                      style={{ color: tx.type === 'income' ? '#E8A832' : '#E8DFD0' }}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </span>
                <button onClick={() => handleDelete(tx.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-cement opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(200,57,43,0.15)' }}>
                  <Trash2 className="w-3.5 h-3.5 text-red-400"/>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAdd && <AddSheet onClose={() => setShowAdd(false)}/>}
    </div>
  )
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-2xl gap-4"
         style={{ border: '2px dashed rgba(61,81,102,0.4)' }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(61,81,102,0.2)' }}>{icon}</div>
      <p className="text-sm text-cement text-center px-4">{text}</p>
    </div>
  )
}

function AddSheet({ onClose }: { onClose: () => void }) {
  const { transactions, setTransactions, recurring, setRecurring, userId, viewMonth, viewYear } = useStore()
  const [type, setType]             = useState<'income'|'expense'>('expense')
  const [amount, setAmount]         = useState('')
  const [desc, setDesc]             = useState('')
  const [category, setCategory]     = useState('')
  const [date, setDate]             = useState(
    new Date(viewYear, viewMonth, Math.min(new Date().getDate(), new Date(viewYear, viewMonth+1, 0).getDate()))
      .toISOString().split('T')[0]
  )
  const [recurrence, setRecurrence] = useState<'once'|'monthly'|'yearly'>('once')
  const [recurringDay, setDay]      = useState(new Date().getDate().toString())
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const cats = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  async function handleSave() {
    if (!amount || !desc || !category) { setError('Bitte alle Felder ausfüllen.'); return }
    setSaving(true); setError('')
    try {
      const tx = { user_id: userId ?? 'demo', type, amount: parseFloat(amount), description: desc, category, date }
      if (userId) {
        const { data: row, error: err } = await supabase.from('transactions').insert(tx).select().single()
        if (err) throw err
        setTransactions([row, ...transactions])
      } else {
        setTransactions([{ ...tx, id: Date.now().toString(), created_at: new Date().toISOString() }, ...transactions])
      }
      if (recurrence !== 'once') {
        const entry: Omit<RecurringEntry,'id'|'created_at'> = {
          user_id: userId ?? 'demo', type, amount: parseFloat(amount),
          description: desc, category, day_of_month: parseInt(recurringDay), active: true,
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="flex justify-center mb-3"><div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}/></div>
        <div className="flex justify-between items-center mb-5">
          <div className="font-display text-white text-2xl">NEUER EINTRAG</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-cement text-xl"
            style={{ background: 'rgba(255,255,255,0.08)' }}>×</button>
        </div>

        {/* Type */}
        <div className="flex gap-2 mb-4">
          {(['expense','income'] as const).map(t => (
            <button key={t} onClick={() => { setType(t); setCategory('') }}
              className="flex-1 py-3 rounded-xl font-display text-base tracking-wider transition-all"
              style={{ background: type===t ? (t==='expense'?'#C8392B':'#E8A832') : 'rgba(255,255,255,0.06)',
                       color: type===t ? (t==='expense'?'white':'#0D1B2A') : '#9AA0A6' }}>
              {t === 'expense' ? '↓ Ausgabe' : '↑ Einnahme'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl" style={{ color: 'rgba(255,255,255,0.2)' }}>€</div>
            <input className="ak-input pl-10 font-display text-3xl" type="number" inputMode="decimal"
              placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus/>
          </div>
          <input className="ak-input" placeholder="Beschreibung" value={desc} onChange={e => setDesc(e.target.value)}/>
          <input className="ak-input" type="date" value={date} onChange={e => setDate(e.target.value)}/>

          <div>
            <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Kategorie</div>
            <div className="flex flex-wrap gap-1.5">
              {cats.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`cat-chip ${category===cat?'selected':''}`}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Wiederholung</div>
            <div className="flex gap-1.5">
              {([['once','Einmalig'],['monthly','Monatlich'],['yearly','Jährlich']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setRecurrence(val)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{ background: recurrence===val ? '#C8392B' : 'rgba(255,255,255,0.06)',
                           color: recurrence===val ? 'white' : '#9AA0A6' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {recurrence !== 'once' && (
            <div>
              <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Tag im Monat</label>
              <select className="ak-input" value={recurringDay} onChange={e => setDay(e.target.value)}>
                {Array.from({length:28},(_,i)=>i+1).map(d => <option key={d} value={d}>{d}. des Monats</option>)}
              </select>
            </div>
          )}

          {error && <div className="text-red-400 font-mono text-[10px] px-3 py-2 rounded-lg" style={{ background: 'rgba(200,57,43,0.15)' }}>{error}</div>}

          <button onClick={handleSave} disabled={saving} className="w-full ak-btn ak-btn-primary">
            {saving ? 'Speichern...' : recurrence !== 'once' ? 'Eintragen & wiederholen' : 'Eintragen'}
          </button>
        </div>
      </div>
    </div>
  )
}
