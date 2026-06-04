import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { supabase, CATEGORIES_EXPENSE, CATEGORIES_INCOME } from '../lib/supabase'
import type { RecurringEntry } from '../store'

const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

export function BuchungenPage() {
  const { transactions, setTransactions, recurring, setRecurring, userId,
          viewMonth, viewYear, goToPrevMonth, goToNextMonth } = useStore()
  const [tab, setTab]         = useState<'ausgaben'|'einnahmen'|'wiederkehrend'>('ausgaben')
  const [showAdd, setShowAdd] = useState(false)

  const isCurrentMonth = () => {
    const n = new Date()
    return viewMonth === n.getMonth() && viewYear === n.getFullYear()
  }

  const monthTx = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear &&
             t.type === (tab === 'ausgaben' ? 'expense' : 'income')
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, viewMonth, viewYear, tab]
  )

  const total = monthTx.reduce((s, t) => s + t.amount, 0)

  async function handleDelete(id: string) {
    if (userId) await supabase.from('transactions').delete().eq('id', id)
    setTransactions(transactions.filter(t => t.id !== id))
  }

  async function handleDeleteRecurring(id: string) {
    if (userId) await supabase.from('recurring_entries').delete().eq('id', id)
    setRecurring(recurring.filter(r => r.id !== id))
  }

  async function handleToggleRecurring(id: string) {
    const r = recurring.find(r => r.id === id)
    if (!r) return
    const updated = { ...r, active: !r.active }
    if (userId) await supabase.from('recurring_entries').update({ active: updated.active }).eq('id', id)
    setRecurring(recurring.map(r => r.id === id ? updated : r))
  }

  return (
    <div className="pb-24 min-h-screen" style={{ background: '#F4F2EE' }}>

      {/* Header */}
      <div className="bg-navy px-5 pt-14 pb-5" style={{ borderBottom: '3px solid #C8392B' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-1">// Buchungen</div>
            <div className="font-display text-white text-4xl tracking-wide leading-none">BUCHUNGEN</div>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#C8392B', boxShadow: '0 4px 16px rgba(200,57,43,0.4)', WebkitTapHighlightColor: 'transparent' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Monatsnavigation */}
        <div className="flex items-center justify-between">
          <button onClick={goToPrevMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', WebkitTapHighlightColor: 'transparent' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="text-center">
            <div className="font-display text-white text-2xl tracking-wide">{MONTH_NAMES[viewMonth]}</div>
            <div className="font-mono text-[9px] text-white/40 tracking-widest">{viewYear}</div>
          </div>
          <button onClick={goToNextMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: isCurrentMonth() ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)',
                     opacity: isCurrentMonth() ? 0.3 : 1, WebkitTapHighlightColor: 'transparent' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">

        {/* Tabs */}
        <div className="flex gap-1.5">
          {([['ausgaben','Ausgaben'],['einnahmen','Einnahmen'],['wiederkehrend','Wiederkehrend']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`ak-tab flex-1 ${tab === val ? 'active' : ''}`}
              style={{ fontSize: 8 }}>{label}</button>
          ))}
        </div>

        {/* Summe */}
        {tab !== 'wiederkehrend' && (
          <div className="ak-card p-4 flex items-center justify-between"
               style={{ borderLeft: `3px solid ${tab === 'ausgaben' ? '#C8392B' : '#E8A832'}` }}>
            <div className="font-mono text-[10px] text-cement tracking-widest uppercase">
              {tab === 'ausgaben' ? 'Ausgaben' : 'Einnahmen'} · {MONTH_NAMES[viewMonth].slice(0,3)}
            </div>
            <div className={`font-display text-2xl ${tab === 'ausgaben' ? 'text-red' : 'text-signal'}`}>
              {tab === 'ausgaben' ? '-' : '+'}{total.toLocaleString('de-DE')}€
            </div>
          </div>
        )}

        {/* Transaktionen */}
        {tab !== 'wiederkehrend' && (
          monthTx.length === 0 ? (
            <div className="ak-card p-8 text-center">
              <div className="text-3xl mb-2">{tab === 'ausgaben' ? '💸' : '💰'}</div>
              <p className="font-sans text-sm text-cement">Keine {tab === 'ausgaben' ? 'Ausgaben' : 'Einnahmen'} in {MONTH_NAMES[viewMonth]}.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {monthTx.map(tx => (
                <div key={tx.id} className="ak-card p-3.5"
                     style={{ borderLeft: `3px solid ${tx.type === 'income' ? '#E8A832' : '#C8392B'}` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                           style={{ background: tx.type === 'income' ? 'rgba(232,168,50,0.12)' : 'rgba(200,57,43,0.1)',
                                    color: tx.type === 'income' ? '#E8A832' : '#C8392B' }}>
                        {tx.type === 'income' ? '↑' : '↓'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-sans text-sm font-semibold text-navy truncate">{tx.description}</div>
                        <div className="font-mono text-[9px] text-cement uppercase tracking-wider mt-0.5">
                          {tx.category} · {new Date(tx.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <div className={`font-display text-xl ${tx.type === 'income' ? 'text-signal' : 'text-red'}`}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('de-DE')}€
                      </div>
                      <button onClick={() => handleDelete(tx.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-lg text-cement"
                        style={{ background: 'rgba(0,0,0,0.05)', WebkitTapHighlightColor: 'transparent' }}>×</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Wiederkehrende */}
        {tab === 'wiederkehrend' && (
          <>
            <div className="ak-card p-3" style={{ borderLeft: '3px solid #E8A832' }}>
              <div className="font-mono text-[9px] text-cement tracking-wider">
                Aktive Einträge werden automatisch am eingestellten Tag gebucht.
              </div>
            </div>
            {recurring.length === 0 ? (
              <div className="ak-card p-8 text-center">
                <div className="text-3xl mb-2">🔁</div>
                <p className="font-sans text-sm text-cement">Noch keine wiederkehrenden Einträge.</p>
                <p className="font-sans text-xs text-cement mt-1">Beim + Hinzufügen "Wiederkehrend" aktivieren.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recurring.map(r => (
                  <div key={r.id} className="ak-card p-3.5"
                       style={{ borderLeft: `3px solid ${r.type === 'income' ? '#E8A832' : '#C8392B'}`, opacity: r.active ? 1 : 0.5 }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                             style={{ background: r.type === 'income' ? 'rgba(232,168,50,0.12)' : 'rgba(200,57,43,0.1)' }}>
                          🔁
                        </div>
                        <div className="min-w-0">
                          <div className="font-sans text-sm font-semibold text-navy truncate">{r.description}</div>
                          <div className="font-mono text-[9px] text-cement uppercase tracking-wider mt-0.5">
                            {r.category} · jeden {r.day_of_month}.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <div className={`font-display text-xl ${r.type === 'income' ? 'text-signal' : 'text-red'}`}>
                          {r.type === 'income' ? '+' : '-'}{r.amount.toLocaleString('de-DE')}€
                        </div>
                        <button onClick={() => handleToggleRecurring(r.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                          style={{ background: r.active ? '#0D1B2A' : 'rgba(0,0,0,0.05)', color: r.active ? 'white' : '#9AA0A6', WebkitTapHighlightColor: 'transparent' }}>
                          {r.active ? '✓' : '○'}
                        </button>
                        <button onClick={() => handleDeleteRecurring(r.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-lg text-cement"
                          style={{ background: 'rgba(0,0,0,0.05)', WebkitTapHighlightColor: 'transparent' }}>×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showAdd && <AddSheet onClose={() => setShowAdd(false)} defaultType={tab === 'einnahmen' ? 'income' : 'expense'}/>}
    </div>
  )
}

// ── Add Sheet (mit Wiederkehrend-Option) ─────────────────────────────────────
function AddSheet({ onClose, defaultType }: { onClose: () => void; defaultType: 'income'|'expense' }) {
  const { transactions, setTransactions, recurring, setRecurring, userId, viewMonth, viewYear } = useStore()
  const [type, setType]           = useState<'income'|'expense'>(defaultType)
  const [amount, setAmount]       = useState('')
  const [desc, setDesc]           = useState('')
  const [category, setCategory]   = useState('')
  const [date, setDate]           = useState(
    new Date(viewYear, viewMonth, Math.min(new Date().getDate(), new Date(viewYear, viewMonth+1, 0).getDate()))
      .toISOString().split('T')[0]
  )
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDay, setRecurringDay] = useState(new Date().getDate().toString())
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const cats = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  async function handleSave() {
    if (!amount || !desc || !category) { setError('Bitte alle Felder ausfüllen.'); return }
    setSaving(true); setError('')

    try {
      // Eintrag buchen
      const tx = { user_id: userId ?? 'demo', type, amount: parseFloat(amount), description: desc, category, date }
      if (userId) {
        const { data: row, error: err } = await supabase.from('transactions').insert(tx).select().single()
        if (err) throw err
        setTransactions([row, ...transactions])
      } else {
        setTransactions([{ ...tx, id: Date.now().toString(), created_at: new Date().toISOString() }, ...transactions])
      }

      // Wiederkehrend anlegen
      if (isRecurring) {
        const entry: Omit<RecurringEntry, 'id'|'created_at'> = {
          user_id: userId ?? 'demo', type, amount: parseFloat(amount),
          description: desc, category, day_of_month: parseInt(recurringDay), active: true,
        }
        if (userId) {
          const { data: row } = await supabase.from('recurring_entries').insert(entry).select().single()
          if (row) setRecurring([...recurring, row])
        } else {
          setRecurring([...recurring, { ...entry, id: Date.now().toString()+'r', created_at: new Date().toISOString() }])
        }
      }
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern.')
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="flex justify-center mb-3"><div className="w-10 h-1 rounded-full bg-navy/15"/></div>
        <div className="flex justify-between items-center mb-4">
          <div className="font-display text-navy text-2xl">EINTRAG</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-navy/6 flex items-center justify-center text-cement text-xl leading-none">×</button>
        </div>

        {/* Type */}
        <div className="flex gap-2 mb-4">
          {(['expense','income'] as const).map(t => (
            <button key={t} onClick={() => { setType(t); setCategory('') }}
              className="flex-1 py-3 rounded-xl font-display text-base tracking-wider transition-all"
              style={{ background: type===t ? (t==='expense'?'#C8392B':'#E8A832') : '#F4F2EE', color: type===t?'white':'#9AA0A6' }}>
              {t === 'expense' ? '↓ Ausgabe' : '↑ Einnahme'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl text-navy/30">€</div>
            <input className="ak-input pl-10 font-display text-3xl" type="number" inputMode="decimal"
              placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus/>
          </div>

          <input className="ak-input" placeholder="Beschreibung" value={desc} onChange={e => setDesc(e.target.value)}/>
          <input className="ak-input" type="date" value={date} onChange={e => setDate(e.target.value)}/>

          {/* Kategorien */}
          <div>
            <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Kategorie</div>
            <div className="flex flex-wrap gap-1.5">
              {cats.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`cat-chip ${category===cat?'selected':''}`}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Wiederkehrend Toggle */}
          <button onClick={() => setIsRecurring(!isRecurring)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all"
            style={{ background: isRecurring ? 'rgba(13,27,42,0.06)' : '#F4F2EE', border: isRecurring ? '1.5px solid #0D1B2A' : '1.5px solid transparent' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">🔁</span>
              <div className="text-left">
                <div className="font-sans text-sm font-semibold text-navy">Wiederkehrend</div>
                <div className="font-mono text-[9px] text-cement uppercase tracking-wider">Automatisch jeden Monat buchen</div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
                 style={{ background: isRecurring ? '#0D1B2A' : 'rgba(0,0,0,0.08)', color: isRecurring ? 'white' : '#9AA0A6' }}>
              {isRecurring ? '✓' : '○'}
            </div>
          </button>

          {isRecurring && (
            <div>
              <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Tag im Monat</label>
              <select className="ak-input" value={recurringDay} onChange={e => setRecurringDay(e.target.value)}>
                {Array.from({length: 28}, (_, i) => i+1).map(d => (
                  <option key={d} value={d}>{d}. des Monats</option>
                ))}
              </select>
            </div>
          )}

          {error && <div className="bg-red/10 text-red font-mono text-[10px] px-3 py-2 rounded-lg">{error}</div>}

          <button onClick={handleSave} disabled={saving} className="w-full ak-btn ak-btn-primary">
            {saving ? 'Speichern...' : isRecurring ? 'Eintragen & Wiederholen' : 'Eintragen'}
          </button>
        </div>
      </div>
    </div>
  )
}
