import { useState, useRef } from 'react'
import { useStore } from '../store'
import { supabase, ACHIEVEMENT_DEFS, INSURANCE_CATEGORIES } from '../lib/supabase'
import { NewsPage } from './News'

type SubPage = 'menu' | 'sparziele' | 'achievements' | 'ki' | 'versicherungen' | 'news'

function fmt(n: number) { return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }

function PageHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
      <button onClick={onBack} className="flex items-center gap-2 mb-3"
        style={{ color: '#9AA0A6', WebkitTapHighlightColor: 'transparent' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        <span className="font-mono text-[10px] tracking-widest uppercase">Zurück</span>
      </button>
      <div className="font-display text-white text-4xl tracking-wide leading-none">{title}</div>
      {subtitle && <div className="font-sans text-white/30 text-xs mt-1">{subtitle}</div>}
    </div>
  )
}

export function MehrPage() {
  const [sub, setSub] = useState<SubPage>('menu')
  const { setUserId, setTransactions, setInsurances, setGoals, setAchievements, setProfile } = useStore()
  const back = () => setSub('menu')

  if (sub === 'sparziele')      return <SparzieleView    onBack={back}/>
  if (sub === 'achievements')   return <AchievementsView onBack={back}/>
  if (sub === 'ki')             return <KIView           onBack={back}/>
  if (sub === 'versicherungen') return <VersicherungenView onBack={back}/>
  if (sub === 'news')           return <NewsPage         onBack={back}/>

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserId(null); setTransactions([]); setInsurances([])
    setGoals([]); setAchievements([]); setProfile(null)
  }

  const MENU = [
    { id: 'versicherungen', label: 'Versicherungen', icon: '🛡', desc: 'Alle Policen verwalten'         },
    { id: 'sparziele',      label: 'Sparziele',       icon: '🎯', desc: 'Ziele setzen & verfolgen'      },
    { id: 'achievements',   label: 'Achievements',    icon: '🏆', desc: 'XP & Belohnungen'              },
    { id: 'ki',             label: 'KI-Assistent',    icon: '🤖', desc: 'Frag deinen Finanzcoach'       },
    { id: 'news',           label: 'Live-News',        icon: '📰', desc: 'Aktuelle Wirtschaftsnews'     },
  ]

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-1">// Mehr</div>
            <div className="font-display text-white text-4xl tracking-wide">MEHR</div>
          </div>
          <button onClick={handleLogout} title="Ausloggen"
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(200,57,43,0.2)', WebkitTapHighlightColor: 'transparent' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C8392B" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="px-4 py-5 space-y-2">
        {MENU.map(item => (
          <button key={item.id} onClick={() => setSub(item.id as SubPage)}
            className="ak-card w-full p-4 flex items-center justify-between"
            style={{ textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                   style={{ background: 'rgba(13,27,42,0.06)' }}>{item.icon}</div>
              <div>
                <div className="font-sans text-sm font-semibold text-navy">{item.label}</div>
                <div className="font-mono text-[9px] text-cement uppercase tracking-wider mt-0.5">{item.desc}</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Versicherungen ───────────────────────────────────────────────────────────
function VersicherungenView({ onBack }: { onBack: () => void }) {
  const { insurances, setInsurances, userId } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', provider: '', amount: '', period: 'yearly' as 'monthly'|'yearly', category: 'Haftpflicht' })

  const totalMonthly = insurances.reduce((s, i) => s + (i.recurrence==='monthly' ? i.amount : i.amount/12), 0)

  async function handleAdd() {
    if (!form.name || !form.amount) return
    const ins = { user_id: userId??'demo', name: form.name, provider: form.provider, amount: parseFloat(form.amount), recurrence: form.period, category: form.category }
    if (userId) {
      const { data: row } = await supabase.from('insurances').insert(ins).select().single()
      if (row) setInsurances([...insurances, row])
    } else {
      setInsurances([...insurances, { ...ins, id: Date.now().toString(), created_at: new Date().toISOString() }])
    }
    setForm({ name: '', provider: '', amount: '', period: 'yearly', category: 'Haftpflicht' })
    setShowAdd(false)
  }

  async function handleDelete(id: string) {
    if (userId) await supabase.from('insurances').delete().eq('id', id)
    setInsurances(insurances.filter(i => i.id !== id))
  }

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <PageHeader title="VERSICHERUNGEN" subtitle="Alle Policen im Überblick" onBack={onBack}/>
      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="ak-card p-4" style={{ borderLeft: '3px solid #9AA0A6' }}>
            <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-1">Monatlich</div>
            <div className="font-display text-navy text-2xl">{totalMonthly.toFixed(2).replace('.',',')}€</div>
          </div>
          <div className="ak-card p-4" style={{ borderLeft: '3px solid #0D1B2A' }}>
            <div className="font-mono text-[9px] text-cement tracking-widest uppercase mb-1">Jährlich</div>
            <div className="font-display text-navy text-2xl">{(totalMonthly*12).toFixed(0).replace('.',',')}€</div>
          </div>
        </div>
        {insurances.length === 0 ? (
          <div className="ak-card p-8 text-center"><div className="text-4xl mb-2">🛡</div><p className="font-sans text-sm text-cement">Noch keine Versicherungen.</p></div>
        ) : (
          <div className="space-y-2">
            {insurances.map(ins => (
              <div key={ins.id} className="ak-card p-4 flex items-center justify-between" style={{ borderLeft: '3px solid #9AA0A6' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(154,160,166,0.1)' }}>🛡</div>
                  <div>
                    <div className="font-sans text-sm font-semibold text-navy">{ins.name}</div>
                    <div className="font-mono text-[9px] text-cement uppercase tracking-wider mt-0.5">
                      {ins.provider} · {ins.recurrence === 'yearly' ? 'jährlich' : 'monatlich'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-display text-navy text-lg">{ins.amount.toLocaleString('de-DE')}€</div>
                    <div className="font-mono text-[9px] text-cement">{(ins.recurrence==='monthly'?ins.amount:ins.amount/12).toFixed(2)}€/mo</div>
                  </div>
                  <button onClick={() => handleDelete(ins.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-cement text-lg"
                    style={{ background: 'rgba(0,0,0,0.05)', WebkitTapHighlightColor: 'transparent' }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setShowAdd(true)} className="w-full ak-btn ak-btn-primary">+ Versicherung hinzufügen</button>
      </div>
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="flex justify-between mb-4"><div className="font-display text-navy text-2xl">NEU</div><button onClick={() => setShowAdd(false)} className="text-cement text-2xl">×</button></div>
            <div className="space-y-3">
              <input className="ak-input" placeholder="Name (z.B. Haftpflicht)" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
              <input className="ak-input" placeholder="Anbieter" value={form.provider} onChange={e => setForm({...form, provider: e.target.value})}/>
              <input className="ak-input" type="number" placeholder="Betrag in €" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}/>
              <div className="flex gap-2">
                {(['monthly','yearly'] as const).map(p => (
                  <button key={p} onClick={() => setForm({...form, period: p})}
                    className={`ak-tab flex-1 ${form.period===p?'active':''}`}>
                    {p==='monthly'?'Monatlich':'Jährlich'}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INSURANCE_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm({...form, category: cat})}
                    className={`cat-chip ${form.category===cat?'selected':''}`}>{cat}</button>
                ))}
              </div>
              <button onClick={handleAdd} className="w-full ak-btn ak-btn-primary">Hinzufügen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sparziele ────────────────────────────────────────────────────────────────
function SparzieleView({ onBack }: { onBack: () => void }) {
  const { goals, setGoals, userId } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', deadline: '' })
  const COLORS = ['#C8392B','#E8A832','#0D1B2A','#3D5166','#9AA0A6']
  const [color, setColor] = useState(COLORS[0])

  async function handleAdd() {
    if (!form.name || !form.target) return
    const goal = { user_id: userId??'demo', name: form.name, target_amount: parseFloat(form.target), current_amount: 0, deadline: form.deadline||null }
    if (userId) {
      const { data: row } = await supabase.from('savings_goals').insert(goal).select().single()
      if (row) setGoals([...goals, row])
    } else {
      setGoals([...goals, { ...goal, id: Date.now().toString(), created_at: new Date().toISOString() }])
    }
    setForm({ name: '', target: '', deadline: '' }); setShowAdd(false)
  }

  async function handleQuickAdd(id: string, amount: number) {
    const g = goals.find(g => g.id===id); if (!g) return
    const newCurrent = Math.min(g.target_amount, g.current_amount + amount)
    if (userId) await supabase.from('savings_goals').update({ current_amount: newCurrent }).eq('id', id)
    setGoals(goals.map(g => g.id===id ? { ...g, current_amount: newCurrent } : g))
  }

  async function handleDelete(id: string) {
    if (userId) await supabase.from('savings_goals').delete().eq('id', id)
    setGoals(goals.filter(g => g.id!==id))
  }

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <PageHeader title="SPARZIELE" onBack={onBack}/>
      <div className="px-4 py-4 space-y-3">
        {goals.length === 0 ? (
          <div className="ak-card p-8 text-center"><div className="text-4xl mb-3">🎯</div><p className="font-sans text-sm text-cement">Noch keine Ziele.</p></div>
        ) : goals.map(g => {
          const pct = g.target_amount > 0 ? Math.min(100, Math.round(g.current_amount/g.target_amount*100)) : 0
          return (
            <div key={g.id} className="ak-card p-4" style={{ borderLeft: `3px solid ${g.color}` }}>
              <div className="flex justify-between mb-2">
                <div><div className="font-sans text-sm font-semibold text-navy">{g.name}</div>
                  {g.deadline && <div className="font-mono text-[9px] text-cement mt-0.5">bis {new Date(g.deadline).toLocaleDateString('de-DE')}</div>}</div>
                <div className="flex items-center gap-2">
                  <div className="font-display text-navy text-2xl">{pct}<span className="text-sm text-cement">%</span></div>
                  <button onClick={() => handleDelete(g.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-cement text-lg" style={{ background: 'rgba(0,0,0,0.05)' }}>×</button>
                </div>
              </div>
              <div className="progress-track mb-2"><div className="progress-fill" style={{ width: `${pct}%`, background: g.color }}/></div>
              <div className="flex justify-between mb-3">
                <span className="font-mono text-[9px] text-cement">{fmt(g.current_amount)}€</span>
                <span className="font-mono text-[9px] text-cement">{fmt(g.target_amount)}€</span>
              </div>
              <div className="flex gap-2">
                {[50,100,500].map(amt => (
                  <button key={amt} onClick={() => handleQuickAdd(g.id, amt)}
                    className="flex-1 py-2 text-center font-mono text-[10px] text-navy border border-navy/20 rounded-lg"
                    style={{ WebkitTapHighlightColor: 'transparent' }}>+{amt}€</button>
                ))}
              </div>
            </div>
          )
        })}
        <button onClick={() => setShowAdd(true)} className="w-full ak-btn ak-btn-primary">+ Neues Sparziel</button>
      </div>
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="flex justify-between mb-4"><div className="font-display text-navy text-2xl">NEUES ZIEL</div><button onClick={() => setShowAdd(false)} className="text-cement text-2xl">×</button></div>
            <div className="space-y-3">
              <input className="ak-input" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
              <input className="ak-input" type="number" placeholder="Zielbetrag in €" value={form.target} onChange={e => setForm({...form, target: e.target.value})}/>
              <input className="ak-input" type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}/>
              <div className="flex gap-2">{COLORS.map(c => (<button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full" style={{ background: c, outline: color===c?`3px solid ${c}`:'none', outlineOffset: 2 }}/>))}</div>
              <button onClick={handleAdd} className="w-full ak-btn ak-btn-primary">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Achievements ─────────────────────────────────────────────────────────────
function AchievementsView({ onBack }: { onBack: () => void }) {
  const { achievements, profile } = useStore()
  const xp = profile?.xp ?? 0; const level = profile?.level ?? 1
  const unlockedKeys = new Set(achievements.map(a => a.key))
  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <PageHeader title="ACHIEVEMENTS" subtitle={`Level ${level} · ${xp} XP`} onBack={onBack}/>
      <div className="px-4 py-4">
        <div className="ak-card bg-navy p-4 mb-4" style={{ borderLeft: '3px solid #C8392B' }}>
          <div className="flex justify-between mb-2">
            <div className="font-mono text-[10px] text-red tracking-widest uppercase">Level {level}</div>
            <div className="font-mono text-[10px] text-white/30">{xp} / {level*100} XP</div>
          </div>
          <div className="progress-track" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="progress-fill" style={{ width: `${Math.min(100,Math.round(xp/(level*100)*100))}%` }}/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENT_DEFS.map(def => {
            const unlocked = unlockedKeys.has(def.key)
            return (
              <div key={def.key} className={`ak-card p-4 ${unlocked?'':'opacity-40'}`}
                   style={{ borderLeft: unlocked?'3px solid #E8A832':'3px solid #9AA0A6' }}>
                <div className="text-2xl mb-2">{unlocked?def.icon:'🔒'}</div>
                <div className="font-sans text-xs font-semibold text-navy mb-0.5">{def.label}</div>
                <div className="font-mono text-[9px] text-cement">{def.desc}</div>
                <div className="font-display text-signal text-lg mt-1">+{def.xp} XP</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── KI ───────────────────────────────────────────────────────────────────────
function KIView({ onBack }: { onBack: () => void }) {
  const { transactions, insurances, goals } = useStore()
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Ahoi! Was möchtest du wissen?' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const totalIncome  = transactions.filter(t => t.type==='income') .reduce((s,t) => s+t.amount, 0)
  const totalExpense = transactions.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0)

  async function send() {
    if (!input.trim() || loading) return
    const q = input.trim(); setInput('')
    setMessages(m => [...m, { role: 'user', text: q }]); setLoading(true)
    const ctx = `Finanz-Assistent für Ankerpunkt. Deutsch, max 3 Sätze, direkt.
Daten: Einnahmen ${totalIncome}€, Ausgaben ${totalExpense}€, Netto ${totalIncome-totalExpense}€, ${insurances.length} Versicherungen, ${goals.length} Sparziele`
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 300, system: ctx, messages: [{ role: 'user', content: q }] })
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'ai', text: data.content?.[0]?.text ?? 'Keine Antwort.' }])
    } catch { setMessages(m => [...m, { role: 'ai', text: 'Verbindungsfehler.' }]) }
    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: '#F4F2EE' }}>
      <PageHeader title="KI-ASSISTENT" onBack={onBack}/>
      <div className="px-4 pt-3 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0 pb-2">
        {['Ausgaben?','Größte Posten?','Auf Kurs?','Spartipps'].map(q => (
          <button key={q} onClick={() => setInput(q)}
            className="flex-shrink-0 bg-white border border-navy/10 rounded-full px-3 py-1.5 font-mono text-[9px] text-steel tracking-wider uppercase whitespace-nowrap">{q}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role==='user'?'bubble-user self-end':'bubble-ai'}>
            {m.role==='ai' && <div className="font-mono text-[8px] text-cement tracking-widest uppercase mb-1">ANKERPUNKT KI</div>}
            {m.text}
          </div>
        ))}
        {loading && <div className="bubble-ai"><div className="font-mono text-[8px] text-cement mb-1">ANKERPUNKT KI</div><div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-cement rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div className="px-4 py-3 bg-white border-t border-navy/10 flex-shrink-0" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom,0px))' }}>
        <div className="flex gap-2">
          <input className="ak-input flex-1" placeholder="Frag etwas..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()}/>
          <button onClick={send} disabled={loading||!input.trim()} className="w-11 h-11 rounded-lg bg-red flex items-center justify-center flex-shrink-0 disabled:opacity-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
