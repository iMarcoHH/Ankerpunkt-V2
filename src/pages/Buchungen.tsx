import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import type { RecurringEntry } from '../store'
import { supabase, CATEGORIES_EXPENSE, CATEGORIES_INCOME } from '../lib/supabase'
import type { Transaction } from '../lib/supabase'
import { Plus, Search, X, SlidersHorizontal, Trash2, RefreshCw, Pencil } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(v)
const MONTH_LONG = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

const CAT_ICONS: Record<string,string> = {
  Wohnen:'🏠', Lebensmittel:'🛒', Transport:'🚌', Abos:'📱',
  Gesundheit:'💊', Freizeit:'🎉', Kleidung:'👗', Bildung:'📚', Sonstiges:'💳',
  Gehalt:'💼', Zinsen:'📈', Sonstiges_Ein:'💰',
}

export function BuchungenPage() {
  const { transactions, setTransactions, recurring, setRecurring,
          userId, viewMonth, viewYear, goToPrevMonth, goToNextMonth } = useStore()
  const [search, setSearch]   = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [tab, setTab]         = useState<'all'|'income'|'expense'|'recurring'>('all')
  const [showAdd, setAdd]     = useState(false)
  const [editTx, setEditTx]   = useState<Transaction|null>(null)

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

  const income  = monthTx.filter(t=>t.type==='income') .reduce((s,t)=>s+t.amount,0)
  const expense = monthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)
  const balance = income - expense

  async function del(id: string) {
    if (userId) await supabase.from('transactions').delete().eq('id', id)
    setTransactions(transactions.filter(t => t.id !== id))
  }
  async function delRec(id: string) {
    if (userId) await supabase.from('recurring_entries').delete().eq('id', id)
    setRecurring(recurring.filter(r => r.id !== id))
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ padding:'56px 20px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <h1 className="page-title">Buchungen</h1>
        <button onClick={() => setAdd(true)}
          style={{ width:48, height:48, borderRadius:16, background:'var(--accent)', border:'none',
                   display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginTop:4 }}>
          <Plus width={20} height={20} style={{ color:'white' }}/>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding:'0 20px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            display:'flex',
            alignItems:'center',
            gap:8,
            padding:'10px 14px',
            borderRadius:14,
            border:'none',
            background:'var(--surface)',
            boxShadow:'var(--shadow-sm)',
            cursor:'pointer',
            color:'var(--secondary)',
            fontWeight:600,
          }}
        >
          <Search width={16} height={16} />
          Filter & Suche
        </button>
      </div>

      {showSearch && (
        <div style={{ padding:'0 20px 16px' }}>
          <div style={{ position:'relative' }}>
            <Search width={16} height={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--tertiary)' }}/>
            <input
              className="ak-input"
              style={{ paddingLeft:40, height:44 }}
              placeholder="Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer' }}>
                <X width={14} height={14} style={{ color:'var(--tertiary)' }}/>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Monat Nav */}
      <div style={{ padding:'0 20px 20px' }}>
        <div className="app-card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px' }}>
          <button onClick={goToPrevMonth}
            style={{ width:36, height:36, borderRadius:12, background:'var(--bg)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:18, fontWeight:800, color:'var(--primary)' }}>{MONTH_LONG[viewMonth]} {viewYear}</p>
          </div>

          <button onClick={goToNextMonth} disabled={isNow}
            style={{ width:36, height:36, borderRadius:12, background:'var(--bg)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:isNow?0.3:1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ padding:'0 20px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="app-card" style={{ padding:16 }}>
          <p style={{ fontSize:12, color:'var(--tertiary)', fontWeight:500, marginBottom:6 }}>Einnahmen</p>
          <p style={{ fontSize:20, fontWeight:800, color:'var(--success)', letterSpacing:'-0.02em' }}>{fmt(income)}</p>
        </div>
        <div className="app-card" style={{ padding:16 }}>
          <p style={{ fontSize:12, color:'var(--tertiary)', fontWeight:500, marginBottom:6 }}>Ausgaben</p>
          <p style={{ fontSize:20, fontWeight:800, color:'var(--accent)', letterSpacing:'-0.02em' }}>{fmt(expense)}</p>
        </div>
        <div className="app-card" style={{ padding:18, gridColumn:'1 / -1' }}>
          <p style={{ fontSize:12, color:'var(--tertiary)', fontWeight:500, marginBottom:6 }}>Verfügbar</p>
          <p style={{
            fontSize:28,
            fontWeight:800,
            color: balance >= 0 ? 'var(--success)' : 'var(--accent)',
            letterSpacing:'-0.03em'
          }}>
            {fmt(balance)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding:'0 20px 16px', display:'flex', gap:8 }}>
        {([['all','Alle'],['income','Einnahmen'],['expense','Ausgaben'],['recurring','Wiederkehrend']] as const).map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ padding:'8px 12px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer', border:'none', whiteSpace:'nowrap',
                     background: tab===v ? 'var(--accent)' : 'var(--surface)',
                     color: tab===v ? 'white' : 'var(--secondary)',
                     boxShadow: tab===v ? '0 4px 12px rgba(229,72,63,.25)' : 'var(--shadow-sm)' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div style={{ padding:'0 20px' }}>
        {tab === 'recurring' ? (
          recurring.length === 0 ? (
            <Empty text="Beim Neu-Eintrag 'Monatlich' wählen."/>
          ) : (
            <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
              {recurring.map((r, i) => (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px',
                                         borderBottom: i<recurring.length-1?'1px solid var(--border)':'none',
                                         opacity: r.active?1:0.45 }}>
                  <div style={{ width:44, height:44, borderRadius:14, background: r.type==='income'?'rgba(34,197,94,0.1)':'rgba(229,72,63,0.1)',
                                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18 }}>
                    <RefreshCw width={18} height={18} style={{ color: r.type==='income'?'var(--success)':'var(--accent)' }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'var(--primary)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.description}</p>
                    <p style={{ fontSize:13, color:'var(--tertiary)' }}>{r.category} · {r.day_of_month}. des Monats</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                    <span style={{ fontSize:15, fontWeight:700, color: r.type==='income'?'var(--success)':'var(--accent)' }}>
                      {r.type==='income'?'+':'-'}{fmt(r.amount)}
                    </span>
                    <button onClick={() => delRec(r.id)} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
                      <Trash2 width={14} height={14} style={{ color:'var(--tertiary)' }}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : shown.length === 0 ? (
          <Empty text={search ? `Keine Ergebnisse für "${search}"` : `Keine Einträge für ${MONTH_LONG[viewMonth]}.`}/>
        ) : (
          <div className="app-card" style={{ padding:0, overflow:'hidden' }}>
            {shown.map((tx, i) => (
              <SwipeTx key={tx.id} onDelete={() => del(tx.id)} onTap={() => setEditTx(tx)}>
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px',
                               borderBottom: i<shown.length-1?'1px solid var(--border)':'none', background:'var(--surface)' }}>
                  <div style={{ width:48, height:48, borderRadius:14,
                                background: tx.type==='income'?'rgba(34,197,94,0.1)':'rgba(229,72,63,0.1)',
                                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>
                    {CAT_ICONS[tx.category] ?? (tx.type==='income'?'💰':'💳')}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:16, fontWeight:700, color:'var(--primary)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.description}</p>
                    <p style={{ fontSize:13, color:'var(--tertiary)' }}>
                      {tx.category} · {new Date(tx.date).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}
                    </p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                    <span style={{ fontSize:16, fontWeight:800, color: tx.type==='income'?'var(--success)':'var(--accent)' }}>
                      {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                    </span>
                    <Pencil width={12} height={12} style={{ color:'var(--tertiary)' }}/>
                  </div>
                </div>
              </SwipeTx>
            ))}
          </div>
        )}
      </div>

      {showAdd  && <AddSheet  onClose={() => setAdd(false)}/>}
      {editTx   && <EditSheet tx={editTx} onClose={() => setEditTx(null)}/>}
    </div>
  )
}

function SwipeTx({ children, onDelete, onTap }: { children: React.ReactNode; onDelete:()=>void; onTap:()=>void }) {
  const startX = useRef(0)
  const startY = useRef(0)
  const [offset, setOffset] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const moved = useRef(false)
  return (
    <div style={{ position:'relative', overflow:'hidden' }}>
      {offset < -8 && (
        <div style={{ position:'absolute', inset:0, background:'var(--danger)', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:20 }}>
          <Trash2 width={20} height={20} style={{ color:'white' }}/>
        </div>
      )}
      <motion.div
        style={{ x:offset, opacity:deleting?0:1 }}
        animate={{ x:offset }}
        transition={{ type:'spring', stiffness:400, damping:35 }}
        onTouchStart={e => { startX.current=e.touches[0].clientX; startY.current=e.touches[0].clientY; moved.current=false }}
        onTouchMove={e => {
          const dx=e.touches[0].clientX-startX.current, dy=e.touches[0].clientY-startY.current
          if (Math.abs(dx)>6||Math.abs(dy)>6) moved.current=true
          if (dx<0&&Math.abs(dx)>Math.abs(dy)) setOffset(Math.max(dx,-100))
        }}
        onTouchEnd={() => {
          if (offset<-70) { setDeleting(true); setTimeout(()=>onDelete(),250) }
          else { setOffset(0); if(!moved.current) onTap() }
        }}>
        {children}
      </motion.div>
    </div>
  )
}

function Empty({ text }: { text:string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', gap:8 }}>
      <p style={{ fontSize:40 }}>📭</p>
      <p style={{ fontSize:15, color:'var(--tertiary)', textAlign:'center' }}>{text}</p>
    </div>
  )
}

function EditSheet({ tx, onClose }: { tx:Transaction; onClose:()=>void }) {
  const { transactions, setTransactions, userId } = useStore()
  const [amount, setAmount] = useState(String(tx.amount))
  const [desc,   setDesc]   = useState(tx.description)
  const [cat,    setCat]    = useState(tx.category)
  const [date,   setDate]   = useState(tx.date)
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')
  const cats = tx.type==='expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  async function save() {
    if (!amount||!desc||!cat) { setErr('Alle Felder ausfüllen.'); return }
    setSaving(true)
    const update = { amount:parseFloat(amount), description:desc, category:cat, date }
    if (userId) {
      const { error:e } = await supabase.from('transactions').update(update).eq('id',tx.id)
      if (e) { setErr(e.message); setSaving(false); return }
    }
    setTransactions(transactions.map(t => t.id===tx.id ? {...t,...update} : t))
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div style={{ width:36, height:4, borderRadius:2, background:'var(--border)', margin:'0 auto 20px' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span style={{ fontSize:20, fontWeight:800, color:'var(--primary)' }}>Bearbeiten</span>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:10, background:'var(--bg)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X width={16} height={16} style={{ color:'var(--secondary)' }}/>
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input className="ak-input" type="number" inputMode="decimal" placeholder="Betrag in €" value={amount} onChange={e=>setAmount(e.target.value)}/>
          <input className="ak-input" placeholder="Beschreibung" value={desc} onChange={e=>setDesc(e.target.value)}/>
          <input className="ak-input" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Kategorie</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {cats.map(c => <button key={c} onClick={()=>setCat(c)} className={`cat-chip ${cat===c?'selected':''}`}>{c}</button>)}
            </div>
          </div>
          {err && <p style={{ fontSize:13, color:'var(--danger)', background:'rgba(239,68,68,0.08)', padding:'10px 14px', borderRadius:12 }}>{err}</p>}
          <button onClick={save} disabled={saving} className="btn-primary">{saving?'Speichern...':'Speichern'}</button>
        </div>
      </div>
    </div>
  )
}

function AddSheet({ onClose }: { onClose:()=>void }) {
  const { transactions, setTransactions, recurring, setRecurring, userId, viewMonth, viewYear } = useStore()
  const [type,   setType]   = useState<'income'|'expense'>('expense')
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
  const cats = type==='expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  async function save() {
    if (!amount||!desc||!cat) { setErr('Bitte alle Felder ausfüllen.'); return }
    setSaving(true); setErr('')
    try {
      const tx = { user_id:userId??'demo', type, amount:parseFloat(amount), description:desc, category:cat, date }
      if (userId) {
        const { data:row, error:e } = await supabase.from('transactions').insert(tx).select().single()
        if (e) throw e
        setTransactions([row, ...transactions])
      } else {
        setTransactions([{...tx, id:Date.now().toString(), created_at:new Date().toISOString()}, ...transactions])
      }
      if (rec==='monthly') {
        const entry: Omit<RecurringEntry,'id'|'created_at'> = { user_id:userId??'demo', type, amount:parseFloat(amount), description:desc, category:cat, day_of_month:parseInt(recDay), active:true }
        if (userId) {
          const { data:row } = await supabase.from('recurring_entries').insert(entry).select().single()
          if (row) setRecurring([...recurring, row])
        } else {
          setRecurring([...recurring, {...entry, id:Date.now()+'r', created_at:new Date().toISOString()}])
        }
      }
      onClose()
    } catch(e:unknown) { setErr(e instanceof Error?e.message:'Fehler') }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div style={{ width:36, height:4, borderRadius:2, background:'var(--border)', margin:'0 auto 20px' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span style={{ fontSize:20, fontWeight:800, color:'var(--primary)' }}>Neuer Eintrag</span>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:10, background:'var(--bg)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X width={16} height={16} style={{ color:'var(--secondary)' }}/>
          </button>
        </div>

        {/* Type Toggle */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16,
                      background:'var(--bg)', borderRadius:16, padding:4 }}>
          {(['expense','income'] as const).map(t => (
            <button key={t} onClick={() => { setType(t); setCat('') }}
              style={{ padding:'10px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:600, fontSize:14,
                       background: type===t ? 'var(--surface)' : 'transparent',
                       color: type===t ? (t==='expense'?'var(--accent)':'var(--success)') : 'var(--tertiary)',
                       boxShadow: type===t ? 'var(--shadow-sm)' : 'none' }}>
              {t==='expense'?'↓ Ausgabe':'↑ Einnahme'}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input className="ak-input" type="number" inputMode="decimal" placeholder="Betrag in €" value={amount} onChange={e=>setAmount(e.target.value)}/>
          <input className="ak-input" placeholder="Beschreibung" value={desc} onChange={e=>setDesc(e.target.value)}/>
          <input className="ak-input" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Kategorie</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {cats.map(c => <button key={c} onClick={()=>setCat(c)} className={`cat-chip ${cat===c?'selected':''}`}>{c}</button>)}
            </div>
          </div>

          {/* Wiederkehrend */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, background:'var(--bg)', borderRadius:16, padding:4 }}>
            {([['once','Einmalig'],['monthly','Monatlich']] as const).map(([v,l]) => (
              <button key={v} onClick={() => setRec(v)}
                style={{ padding:'10px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:600, fontSize:13,
                         background: rec===v ? 'var(--surface)' : 'transparent',
                         color: rec===v ? 'var(--primary)' : 'var(--tertiary)',
                         boxShadow: rec===v ? 'var(--shadow-sm)' : 'none' }}>
                {l}
              </button>
            ))}
          </div>

          {rec==='monthly' && (
            <select className="ak-input" value={recDay} onChange={e=>setRecDay(e.target.value)}>
              {Array.from({length:28},(_,i)=>i+1).map(d => (
                <option key={d} value={d}>{d}. des Monats</option>
              ))}
            </select>
          )}

          {err && <p style={{ fontSize:13, color:'var(--danger)', background:'rgba(239,68,68,0.08)', padding:'10px 14px', borderRadius:12 }}>{err}</p>}
          <button onClick={save} disabled={saving} className="btn-primary">{saving?'Speichern...':'Eintragen'}</button>
        </div>
      </div>
    </div>
  )
}
