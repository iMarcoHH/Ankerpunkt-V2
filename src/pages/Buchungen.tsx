import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import type { RecurringEntry } from '../store'
import { supabase, CATEGORIES_EXPENSE, CATEGORIES_INCOME } from '../lib/supabase'
import type { Transaction } from '../lib/supabase'
import { TrendingUp, TrendingDown, Trash2, RefreshCw, Plus, Search, X, Pencil } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
const MONTHS_LONG = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

export function BuchungenPage() {
  const { transactions, setTransactions, recurring, setRecurring, userId, viewMonth, viewYear, goToPrevMonth, goToNextMonth } = useStore()
  const [tab, setTab]       = useState<'all'|'income'|'expense'|'recurring'>('all')
  const [showAdd, setAdd]   = useState(false)
  const [editTx, setEditTx] = useState<Transaction|null>(null)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const now   = new Date()
  const isNow = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const monthTx = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [transactions, viewMonth, viewYear])

  const shown = useMemo(() => {
    if (tab === 'recurring') return []
    let list = tab === 'all' ? monthTx : monthTx.filter(t => t.type === tab)
    if (search.trim()) list = list.filter(t =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [monthTx, tab, search])

  const incTotal = monthTx.filter(t => t.type==='income') .reduce((s,t)=>s+t.amount,0)
  const expTotal = monthTx.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0)

  async function del(id: string) {
    if (userId) await supabase.from('transactions').delete().eq('id', id)
    setTransactions(transactions.filter(t => t.id !== id))
  }
  async function delRec(id: string) {
    if (userId) await supabase.from('recurring_entries').delete().eq('id', id)
    setRecurring(recurring.filter(r => r.id !== id))
  }
  async function toggleRec(id: string) {
    const r = recurring.find(r=>r.id===id); if (!r) return
    const up = {...r, active:!r.active}
    if (userId) await supabase.from('recurring_entries').update({active:up.active}).eq('id',id)
    setRecurring(recurring.map(r=>r.id===id?up:r))
  }

  return (
    <div className="p-4 space-y-3 pb-8">
      <div className="flex items-center justify-between pt-14">
        <h1 className="font-display text-3xl tracking-widest text-white">Buchungen</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowSearch(v=>!v); setSearch('') }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: showSearch ? 'rgba(200,57,43,0.2)' : 'rgba(255,255,255,0.06)', color: showSearch ? '#C8392B' : '#9AA0A6' }}>
            {showSearch ? <X className="w-3.5 h-3.5"/> : <Search className="w-3.5 h-3.5"/>}
          </button>
          <button onClick={() => setAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-display tracking-wide text-sm text-white"
            style={{ background:'#C8392B' }}>
            <Plus className="w-3.5 h-3.5"/> Neu
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity:0,y:-8,height:0 }} animate={{ opacity:1,y:0,height:'auto' }} exit={{ opacity:0,y:-8,height:0 }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cement"/>
              <input className="ak-input pl-9" placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between ak-card p-3">
        <button onClick={goToPrevMonth} className="w-7 h-7 rounded-full flex items-center justify-center text-cement" style={{ background:'rgba(255,255,255,0.06)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span className="font-display text-white text-lg tracking-wide">{MONTHS_LONG[viewMonth]} {viewYear}</span>
        <button onClick={goToNextMonth} disabled={isNow} className="w-7 h-7 rounded-full flex items-center justify-center text-cement" style={{ background:'rgba(255,255,255,0.06)', opacity:isNow?0.3:1 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="ak-card p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'rgba(232,168,50,0.15)' }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color:'#E8A832' }}/>
          </div>
          <div><p className="text-[10px] text-cement">Einnahmen</p><p className="font-display text-sm" style={{ color:'#E8A832' }}>{fmt(incTotal)}</p></div>
        </div>
        <div className="ak-card p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'rgba(200,57,43,0.15)' }}>
            <TrendingDown className="w-3.5 h-3.5" style={{ color:'#C8392B' }}/>
          </div>
          <div><p className="text-[10px] text-cement">Ausgaben</p><p className="font-display text-sm" style={{ color:'#C8392B' }}>{fmt(expTotal)}</p></div>
        </div>
      </div>

      <div className="flex gap-1 p-0.5 rounded-xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(61,81,102,0.35)' }}>
        {([['all','Alle'],['income','Einnahmen'],['expense','Ausgaben'],['recurring','Wiederk.']] as const).map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            style={{ background:tab===v?'rgba(255,255,255,0.1)':'transparent', color:tab===v?'white':'#9AA0A6' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'recurring' ? (
        recurring.length === 0 ? <Leer text="Beim Neu-Eintrag 'Monatlich' wählen."/> : (
          <div className="space-y-1.5">
            {recurring.map((r, i) => (
              <SwipeDelete key={r.id} onDelete={() => delRec(r.id)} onTap={() => {}}>
                <motion.div initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.03 }}
                  className="ak-card p-3 flex items-center gap-3" style={{ opacity:r.active?1:0.5 }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                       style={{ background:r.type==='income'?'rgba(232,168,50,0.15)':'rgba(200,57,43,0.15)' }}>
                    <RefreshCw className="w-3.5 h-3.5" style={{ color:r.type==='income'?'#E8A832':'#C8392B' }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.description}</p>
                    <p className="text-[10px] text-cement">{r.category} · {r.day_of_month}. des Monats</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-sm" style={{ color:r.type==='income'?'#E8A832':'#E8DFD0' }}>
                      {r.type==='income'?'+':'-'}{fmt(r.amount)}
                    </span>
                    <button onClick={() => toggleRec(r.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                      style={{ background:r.active?'#C8392B':'rgba(255,255,255,0.08)', color:'white' }}>
                      {r.active?'✓':'○'}
                    </button>
                  </div>
                </motion.div>
              </SwipeDelete>
            ))}
          </div>
        )
      ) : shown.length === 0 ? (
        <Leer text={search ? `Keine Ergebnisse für "${search}"` : `Keine Einträge für ${MONTHS_LONG[viewMonth]}.`}/>
      ) : (
        <div className="space-y-1.5">
          {shown.map((tx, i) => (
            <SwipeDelete key={tx.id} onDelete={() => del(tx.id)} onTap={() => setEditTx(tx)}>
              <motion.div initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.03 }}
                className="ak-card p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-display text-xs font-bold"
                     style={{ background:tx.type==='income'?'rgba(232,168,50,0.15)':'rgba(200,57,43,0.15)',
                              color:tx.type==='income'?'#E8A832':'#C8392B' }}>
                  {tx.category?.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                  <p className="text-[10px] text-cement">{tx.category} · {new Date(tx.date).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-sm font-semibold" style={{ color:tx.type==='income'?'#E8A832':'#E8DFD0' }}>
                    {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                  </span>
                  <Pencil className="w-3 h-3 text-cement opacity-40"/>
                </div>
              </motion.div>
            </SwipeDelete>
          ))}
        </div>
      )}

      {showAdd && <AddSheet  onClose={() => setAdd(false)}/>}
      {editTx  && <EditSheet tx={editTx} onClose={() => setEditTx(null)}/>}
    </div>
  )
}

// SwipeDelete: onTap nur wenn kein Swipe stattfand
function SwipeDelete({ children, onDelete, onTap }: { children: React.ReactNode; onDelete: () => void; onTap: () => void }) {
  const startX = useRef(0)
  const startY = useRef(0)
  const [offset, setOffset] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const moved = useRef(false)

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {offset < -8 && (
        <div className="absolute inset-0 flex items-center justify-end pr-4 rounded-2xl" style={{ background:'#C8392B' }}>
          <Trash2 className="w-5 h-5 text-white"/>
        </div>
      )}
      <motion.div
        style={{ x: offset, opacity: deleting ? 0 : 1 }}
        animate={{ x: offset }}
        transition={{ type:'spring', stiffness:400, damping:35 }}
        onTouchStart={e => {
          startX.current = e.touches[0].clientX
          startY.current = e.touches[0].clientY
          moved.current = false
        }}
        onTouchMove={e => {
          const dx = e.touches[0].clientX - startX.current
          const dy = e.touches[0].clientY - startY.current
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved.current = true
          if (dx < 0 && Math.abs(dx) > Math.abs(dy)) setOffset(Math.max(dx, -120))
        }}
        onTouchEnd={() => {
          if (offset < -80) { setDeleting(true); setTimeout(() => onDelete(), 250) }
          else {
            setOffset(0)
            if (!moved.current) onTap()
          }
        }}>
        {children}
      </motion.div>
    </div>
  )
}

function Leer({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 rounded-2xl gap-3"
         style={{ border:'2px dashed rgba(61,81,102,0.35)' }}>
      <p className="text-sm text-cement text-center px-4">{text}</p>
    </div>
  )
}

function EditSheet({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const { transactions, setTransactions, userId } = useStore()
  const [amount, setAmount] = useState(String(tx.amount))
  const [desc,   setDesc]   = useState(tx.description)
  const [cat,    setCat]    = useState(tx.category)
  const [date,   setDate]   = useState(tx.date)
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')
  const cats = tx.type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  async function save() {
    if (!amount || !desc || !cat) { setErr('Alle Felder ausfüllen.'); return }
    setSaving(true)
    const update = { amount: parseFloat(amount), description: desc, category: cat, date }
    if (userId) {
      const { error: e } = await supabase.from('transactions').update(update).eq('id', tx.id)
      if (e) { setErr(e.message); setSaving(false); return }
    }
    setTransactions(transactions.map(t => t.id === tx.id ? { ...t, ...update } : t))
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="flex justify-center mb-3">
          <div className="w-9 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="font-display text-white text-xl">BEARBEITEN</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-cement"
            style={{ background:'rgba(255,255,255,0.08)' }}>×</button>
        </div>
        <div className="space-y-2">
          <input className="ak-input" type="number" inputMode="decimal"
            placeholder="Betrag in €" value={amount} onChange={e => setAmount(e.target.value)}/>
          <input className="ak-input" placeholder="Beschreibung"
            value={desc} onChange={e => { setDesc(e.target.value); suggestCategory(e.target.value) }}/>
          {aiSuggesting && (
            <div className="flex items-center gap-2 px-1">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ background:'rgba(200,57,43,0.5)' }}/>
              <span className="text-[10px] text-cement">KI erkennt Kategorie...</span>
            </div>
          )}
          {aiSuggested && !aiSuggesting && cat === aiSuggested && (
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px]" style={{ color:'#34D399' }}>✓ KI hat Kategorie erkannt: <strong>{aiSuggested}</strong></span>
            </div>
          )}
          <input className="ak-input" type="date"
            value={date} onChange={e => setDate(e.target.value)}/>
          <div>
            <p className="font-mono text-[9px] text-cement tracking-widest uppercase mb-1">Kategorie</p>
            <div className="flex flex-wrap gap-1">
              {cats.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`cat-chip ${cat===c?'selected':''}`}
                  style={{ fontSize:10, padding:'3px 9px' }}>{c}
                </button>
              ))}
            </div>
          </div>
          {err && <p className="text-[10px] px-2 py-1.5 rounded-lg" style={{ background:'rgba(200,57,43,0.15)', color:'#f87171' }}>{err}</p>}
          <button onClick={save} disabled={saving} className="w-full ak-btn ak-btn-primary">
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddSheet({ onClose }: { onClose: () => void }) {
  const { transactions, setTransactions, recurring, setRecurring, userId, viewMonth, viewYear } = useStore()
  const [type, setType]     = useState<'income'|'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [desc,   setDesc]   = useState('')
  const [cat,    setCat]    = useState('')
  const [date,   setDate]   = useState(
    new Date(viewYear, viewMonth, Math.min(new Date().getDate(), new Date(viewYear,viewMonth+1,0).getDate()))
      .toISOString().split('T')[0]
  )
  const [rec,    setRec]    = useState<'once'|'monthly'>('once')
  const [recDay, setRecDay] = useState(new Date().getDate().toString())
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')
  const [aiSuggesting, setAiSuggesting] = useState(false)
  const [aiSuggested,  setAiSuggested]  = useState<string|null>(null)
  const descTimer = useRef<ReturnType<typeof setTimeout>|null>(null)
  const cats = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  // Auto-Kategorisierung via KI
  async function suggestCategory(text: string) {
    if (!text || text.length < 3 || type === 'income') return
    if (descTimer.current) clearTimeout(descTimer.current)
    descTimer.current = setTimeout(async () => {
      setAiSuggesting(true)
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 20,
            messages: [{
              role: 'user',
              content: `Ordne diese Ausgabe einer Kategorie zu. Antworte NUR mit dem Kategorienamen, nichts anderes.

Kategorien: ${CATEGORIES_EXPENSE.join(', ')}

Ausgabe: "${text}"

Kategorie:`
            }]
          })
        })
        const data = await res.json()
        const suggested = data.content?.[0]?.text?.trim()
        if (suggested && CATEGORIES_EXPENSE.includes(suggested)) {
          setAiSuggested(suggested)
          if (!cat) setCat(suggested)
        }
      } catch {}
      setAiSuggesting(false)
    }, 600)
  }

  async function save() {
    if (!amount || !desc || !cat) { setErr('Bitte alle Felder ausfüllen.'); return }
    setSaving(true); setErr('')
    try {
      const tx = { user_id:userId??'demo', type, amount:parseFloat(amount), description:desc, category:cat, date }
      if (userId) {
        const { data: row, error: e } = await supabase.from('transactions').insert(tx).select().single()
        if (e) throw e
        setTransactions([row, ...transactions])
      } else {
        setTransactions([{ ...tx, id:Date.now().toString(), created_at:new Date().toISOString() }, ...transactions])
      }
      if (rec === 'monthly') {
        const entry: Omit<RecurringEntry,'id'|'created_at'> = {
          user_id:userId??'demo', type, amount:parseFloat(amount),
          description:desc, category:cat, day_of_month:parseInt(recDay), active:true,
        }
        if (userId) {
          const { data: row } = await supabase.from('recurring_entries').insert(entry).select().single()
          if (row) setRecurring([...recurring, row])
        } else {
          setRecurring([...recurring, { ...entry, id:Date.now()+'r', created_at:new Date().toISOString() }])
        }
      }
      onClose()
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Fehler') }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="flex justify-center mb-3">
          <div className="w-9 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="font-display text-white text-xl">NEUER EINTRAG</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-cement"
            style={{ background:'rgba(255,255,255,0.08)' }}>×</button>
        </div>
        <div className="flex gap-2 mb-3">
          {(['expense','income'] as const).map(t => (
            <button key={t} onClick={() => { setType(t); setCat('') }}
              className="flex-1 py-2 rounded-xl font-display text-sm tracking-wider"
              style={{ background:type===t?(t==='expense'?'#C8392B':'#E8A832'):'rgba(255,255,255,0.06)',
                       color:type===t?(t==='expense'?'white':'#0D1B2A'):'#9AA0A6' }}>
              {t==='expense'?'↓ Ausgabe':'↑ Einnahme'}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <input className="ak-input" type="number" inputMode="decimal"
            placeholder="Betrag in €" value={amount} onChange={e => setAmount(e.target.value)}/>
          <input className="ak-input" placeholder="Beschreibung"
            value={desc} onChange={e => setDesc(e.target.value)}/>
          <input className="ak-input" type="date"
            value={date} onChange={e => setDate(e.target.value)}/>
          <div>
            <p className="font-mono text-[9px] text-cement tracking-widest uppercase mb-1">Kategorie</p>
            <div className="flex flex-wrap gap-1">
              {cats.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`cat-chip ${cat===c?'selected':''}`}
                  style={{ fontSize:10, padding:'3px 9px' }}>{c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {([['once','Einmalig'],['monthly','Monatlich']] as const).map(([v,l]) => (
              <button key={v} onClick={() => setRec(v)}
                className="flex-1 py-1.5 rounded-xl text-xs font-medium"
                style={{ background:rec===v?'#C8392B':'rgba(255,255,255,0.06)', color:rec===v?'white':'#9AA0A6' }}>
                {l}
              </button>
            ))}
          </div>
          {rec === 'monthly' && (
            <select className="ak-input" value={recDay} onChange={e => setRecDay(e.target.value)}>
              {Array.from({length:28},(_,i)=>i+1).map(d => (
                <option key={d} value={d}>{d}. des Monats</option>
              ))}
            </select>
          )}
          {err && <p className="text-[10px] px-2 py-1.5 rounded-lg" style={{ background:'rgba(200,57,43,0.15)', color:'#f87171' }}>{err}</p>}
          <button onClick={save} disabled={saving} className="w-full ak-btn ak-btn-primary">
            {saving ? 'Speichern...' : 'Eintragen'}
          </button>
        </div>
      </div>
    </div>
  )
}
