import { useState, useRef } from 'react'
import { useStore } from '../store'
import { supabase, ACHIEVEMENT_DEFS } from '../lib/supabase'

type SubPage = 'menu' | 'sparziele' | 'achievements' | 'ki' | 'rechner' | 'news'

function fmt(n: number) { return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }

export function MehrPage() {
  const [sub, setSub] = useState<SubPage>('menu')

  if (sub !== 'menu') {
    const Back = () => (
      <button onClick={() => setSub('menu')} className="flex items-center gap-2 text-cement mb-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        <span className="font-mono text-[10px] tracking-widest uppercase">Zurück</span>
      </button>
    )
    if (sub === 'sparziele')   return <SparzieleView onBack={Back}/>
    if (sub === 'achievements')return <AchievementsView onBack={Back}/>
    if (sub === 'ki')          return <KIView onBack={Back}/>
    if (sub === 'rechner')     return <RechnerView onBack={Back}/>
    if (sub === 'news')        return <NewsView onBack={Back}/>
  }

  const MENU = [
    { id: 'sparziele',    label: 'Sparziele',    icon: '🎯', desc: 'Ziele setzen & verfolgen' },
    { id: 'achievements', label: 'Achievements', icon: '🏆', desc: 'XP & Belohnungen'         },
    { id: 'ki',           label: 'KI-Assistent', icon: '🤖', desc: 'Frag deinen Finanzcoach'  },
    { id: 'rechner',      label: 'Rechner',       icon: '🧮', desc: 'Kredit, Zins, Währung'   },
    { id: 'news',         label: 'Live-News',     icon: '📰', desc: 'Wirtschaft & Märkte'     },
  ]

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-1">// 05 — Mehr</div>
        <div className="font-display text-white text-4xl tracking-wide">MEHR</div>
      </div>
      <div className="px-4 py-5 space-y-2">
        {MENU.map((item, i) => (
          <button key={item.id} onClick={() => setSub(item.id as SubPage)}
            className="ak-card w-full p-4 flex items-center justify-between animate-in"
            style={{ animationDelay: `${i * 0.06}s`, opacity: 0, textAlign: 'left' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(13,27,42,0.06)' }}>{item.icon}</div>
              <div>
                <div className="font-sans text-sm font-semibold text-navy">{item.label}</div>
                <div className="font-mono text-[9px] text-cement uppercase tracking-wider mt-0.5">{item.desc}</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Sparziele ──────────────────────────────────────────────────────────────

function SparzieleView({ onBack: Back }: { onBack: React.FC }) {
  const { goals, setGoals, userId } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', deadline: '' })
  const COLORS = ['#C8392B','#E8A832','#0D1B2A','#3D5166','#9AA0A6']
  const [color, setColor] = useState(COLORS[0])

  async function handleAdd() {
    if (!form.name || !form.target) return
    const goal = {
      user_id:  userId ?? 'demo',
      name:     form.name,
      target:   parseFloat(form.target),
      current:  0,
      deadline: form.deadline || null,
      color,
    }
    if (userId) {
      const { data: row } = await supabase.from('savings_goals').insert(goal).select().single()
      if (row) setGoals([...goals, row])
    } else {
      setGoals([...goals, { ...goal, id: Date.now().toString(), created_at: new Date().toISOString() }])
    }
    setForm({ name: '', target: '', deadline: '' })
    setShowAdd(false)
  }

  async function handleQuickAdd(id: string, amount: number) {
    const g = goals.find(g => g.id === id)
    if (!g) return
    const updated = { ...g, current: Math.min(g.target, g.current + amount) }
    if (userId) await supabase.from('savings_goals').update({ current: updated.current }).eq('id', id)
    setGoals(goals.map(g => g.id === id ? updated : g))
  }

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <Back/>
        <div className="font-display text-white text-4xl tracking-wide">SPARZIELE</div>
      </div>
      <div className="px-4 py-5 space-y-3">
        {goals.length === 0 ? (
          <div className="ak-card p-8 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="font-sans text-sm text-cement">Noch keine Ziele gesetzt.</p>
          </div>
        ) : goals.map(g => {
          const pct = g.target > 0 ? Math.min(100, Math.round(g.current / g.target * 100)) : 0
          return (
            <div key={g.id} className="ak-card p-4" style={{ borderLeft: `3px solid ${g.color}` }}>
              <div className="flex justify-between mb-2">
                <div>
                  <div className="font-sans text-sm font-semibold text-navy">{g.name}</div>
                  {g.deadline && <div className="font-mono text-[9px] text-cement mt-0.5">bis {new Date(g.deadline).toLocaleDateString('de-DE')}</div>}
                </div>
                <div className="font-display text-navy text-2xl">{pct}<span className="text-sm text-cement">%</span></div>
              </div>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: `${pct}%`, background: g.color }}/>
              </div>
              <div className="flex justify-between mb-3">
                <span className="font-mono text-[9px] text-cement">{fmt(g.current)}€</span>
                <span className="font-mono text-[9px] text-cement">{fmt(g.target)}€</span>
              </div>
              <div className="flex gap-2">
                {[50,100,500].map(amt => (
                  <button key={amt} onClick={() => handleQuickAdd(g.id, amt)}
                    className="flex-1 py-1.5 text-center font-mono text-[10px] text-navy border border-navy/20 rounded-md hover:bg-navy hover:text-white transition-all">
                    +{amt}€
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        <button onClick={() => setShowAdd(true)} className="w-full ak-btn ak-btn-primary">
          + Neues Sparziel
        </button>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="flex justify-between mb-5">
              <div className="font-display text-navy text-2xl">NEUES ZIEL</div>
              <button onClick={() => setShowAdd(false)} className="text-cement text-2xl">×</button>
            </div>
            <div className="space-y-3">
              <input className="ak-input" placeholder="Name (z.B. Urlaub Japan)" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
              <input className="ak-input" type="number" placeholder="Zielbetrag in €" value={form.target} onChange={e => setForm({...form, target: e.target.value})}/>
              <input className="ak-input" type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}/>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }}/>
                ))}
              </div>
              <button onClick={handleAdd} className="w-full ak-btn ak-btn-primary">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Achievements ────────────────────────────────────────────────────────────

function AchievementsView({ onBack: Back }: { onBack: React.FC }) {
  const { achievements, profile } = useStore()
  const xp    = profile?.xp    ?? 0
  const level = profile?.level ?? 1
  const unlockedKeys = new Set(achievements.map(a => a.key))

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <Back/>
        <div className="font-display text-white text-4xl tracking-wide">ACHIEVEMENTS</div>
        <div className="font-sans text-white/30 text-xs mt-1">Level {level} · {xp} XP</div>
      </div>
      <div className="px-4 py-5">
        <div className="ak-card bg-navy p-4 mb-4" style={{ borderLeft: '3px solid #C8392B' }}>
          <div className="flex justify-between mb-2">
            <div className="font-mono text-[10px] text-red tracking-widest uppercase">Level {level}</div>
            <div className="font-mono text-[10px] text-white/30">{xp} / {level * 100} XP</div>
          </div>
          <div className="progress-track" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, Math.round(xp / (level * 100) * 100))}%` }}/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENT_DEFS.map((def) => {
            const unlocked = unlockedKeys.has(def.key)
            return (
              <div key={def.key} className={`ak-card p-4 transition-all ${unlocked ? '' : 'opacity-40'}`}
                   style={{ borderLeft: unlocked ? '3px solid #E8A832' : '3px solid #9AA0A6' }}>
                <div className="text-2xl mb-2">{unlocked ? def.icon : '🔒'}</div>
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

// ── KI-Assistent ────────────────────────────────────────────────────────────

function KIView({ onBack: Back }: { onBack: React.FC }) {
  const { transactions, insurances, goals } = useStore()
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Ahoi! Ich bin dein Finanz-Assistent. Was möchtest du wissen?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const totalIncome  = transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  async function send() {
    if (!input.trim() || loading) return
    const q = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)

    const context = `
Du bist ein knapper, direkter Finanz-Assistent für die App "Ankerpunkt".
Antworte auf Deutsch, maximal 3 Sätze. Keine Floskeln.
Nutzerdaten:
- Gesamteinnahmen: ${totalIncome}€
- Gesamtausgaben: ${totalExpense}€
- Netto: ${totalIncome - totalExpense}€
- Versicherungen: ${insurances.length} (${insurances.reduce((s,i) => s + (i.period==='monthly'?i.amount:i.amount/12), 0).toFixed(2)}€/mo)
- Sparziele: ${goals.length}
- Letzte Transaktionen: ${transactions.slice(-5).map(t => `${t.description} (${t.type === 'income' ? '+' : '-'}${t.amount}€)`).join(', ')}
    `.trim()

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: context,
          messages: [{ role: 'user', content: q }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text ?? 'Keine Antwort erhalten.'
      setMessages(m => [...m, { role: 'ai', text }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Verbindungsfehler. Versuche es erneut.' }])
    }
    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const QUICK = ['Wie viel gebe ich aus?','Größte Ausgaben?','Bin ich auf Kurs?','Spartipps für mich']

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F4F2EE' }}>
      <div className="bg-navy px-5 pt-14 pb-5 flex-shrink-0" style={{ borderBottom: '3px solid #C8392B' }}>
        <Back/>
        <div className="font-display text-white text-4xl tracking-wide">KI-ASSISTENT</div>
      </div>
      <div className="px-4 pt-4 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0 pb-2">
        {QUICK.map(q => (
          <button key={q} onClick={() => setInput(q)}
            className="flex-shrink-0 bg-white border border-navy/10 rounded-full px-3 py-1.5 font-mono text-[9px] text-steel tracking-wider uppercase whitespace-nowrap">
            {q}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'bubble-user self-end' : 'bubble-ai'}>
            {m.role === 'ai' && (
              <div className="font-mono text-[8px] text-cement tracking-widest uppercase mb-1">ANKERPUNKT KI</div>
            )}
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="bubble-ai">
            <div className="font-mono text-[8px] text-cement tracking-widest uppercase mb-1">ANKERPUNKT KI</div>
            <div className="flex gap-1">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-cement rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div className="px-4 py-3 border-t border-navy/10 bg-white flex-shrink-0" style={{ paddingBottom: 'calc(12px + var(--nav-h) + env(safe-area-inset-bottom,0px))' }}>
        <div className="flex gap-2">
          <input
            className="ak-input flex-1"
            placeholder="Frag etwas zu deinen Finanzen..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button onClick={send} disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-lg bg-red flex items-center justify-center flex-shrink-0 disabled:opacity-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Rechner ─────────────────────────────────────────────────────────────────

function RechnerView({ onBack: Back }: { onBack: React.FC }) {
  const [tab, setTab] = useState<'kredit'|'zins'|'waehrung'>('kredit')
  const [betrag, setBetrag] = useState('20000')
  const [zinssatz, setZins] = useState('4.5')
  const [laufzeit, setLauf] = useState('5')
  const [kapital, setKapital] = useState('10000')
  const [jahreszins, setJz] = useState('5')
  const [jahre, setJahre] = useState('10')

  const rate = (() => {
    const p = parseFloat(betrag), r = parseFloat(zinssatz)/100/12, n = parseFloat(laufzeit)*12
    if (!p || !r || !n) return null
    return (p * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1)
  })()

  const endkapital = (() => {
    const k = parseFloat(kapital), z = parseFloat(jahreszins)/100, j = parseFloat(jahre)
    if (!k || !z || !j) return null
    return k * Math.pow(1+z, j)
  })()

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <Back/>
        <div className="font-display text-white text-4xl tracking-wide">RECHNER</div>
      </div>
      <div className="px-4 py-5 space-y-4">
        <div className="flex gap-2">
          {(['kredit','zins','waehrung'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`ak-tab flex-1 ${tab===t?'active':''}`}>
              {t === 'kredit' ? 'Kredit' : t === 'zins' ? 'Zinseszins' : 'Währung'}
            </button>
          ))}
        </div>
        {tab === 'kredit' && (
          <div className="space-y-3">
            <CalcField label="Kreditbetrag (€)" value={betrag} onChange={setBetrag} type="number"/>
            <CalcField label="Zinssatz (% p.a.)" value={zinssatz} onChange={setZins} type="number"/>
            <CalcField label="Laufzeit (Jahre)"  value={laufzeit} onChange={setLauf} type="number"/>
            {rate !== null && (
              <div className="ak-card bg-navy p-4" style={{ borderLeft: '3px solid #C8392B' }}>
                <div className="font-mono text-[9px] text-white/40 tracking-widest uppercase mb-1">Monatliche Rate</div>
                <div className="font-display text-white text-4xl">{rate.toFixed(2).replace('.',',')}€</div>
                <div className="font-mono text-[9px] text-white/30 mt-1">Gesamt: {(rate * parseFloat(laufzeit) * 12).toFixed(0)}€</div>
              </div>
            )}
          </div>
        )}
        {tab === 'zins' && (
          <div className="space-y-3">
            <CalcField label="Startkapital (€)" value={kapital}    onChange={setKapital} type="number"/>
            <CalcField label="Jahreszins (%)"    value={jahreszins} onChange={setJz}      type="number"/>
            <CalcField label="Laufzeit (Jahre)"  value={jahre}      onChange={setJahre}   type="number"/>
            {endkapital !== null && (
              <div className="ak-card bg-navy p-4" style={{ borderLeft: '3px solid #E8A832' }}>
                <div className="font-mono text-[9px] text-white/40 tracking-widest uppercase mb-1">Endkapital nach {jahre} Jahren</div>
                <div className="font-display text-white text-4xl">{endkapital.toLocaleString('de-DE',{maximumFractionDigits:0})}€</div>
                <div className="font-mono text-[9px] text-signal mt-1">+{(endkapital - parseFloat(kapital)).toLocaleString('de-DE',{maximumFractionDigits:0})}€ Gewinn</div>
              </div>
            )}
          </div>
        )}
        {tab === 'waehrung' && <CurrencyCalc/>}
      </div>
    </div>
  )
}

function CalcField({ label, value, onChange, type }: { label:string; value:string; onChange:(v:string)=>void; type:string }) {
  return (
    <div>
      <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">{label}</label>
      <input className="ak-input" type={type} value={value} onChange={e => onChange(e.target.value)}/>
    </div>
  )
}

function CurrencyCalc() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('USD')
  const [result, setResult] = useState<number|null>(null)
  const RATES: Record<string, number> = { EUR: 1, USD: 1.08, GBP: 0.86, CHF: 0.96, JPY: 163.5 }
  const CURRENCIES = ['EUR','USD','GBP','CHF','JPY']

  function convert() {
    const base = parseFloat(amount) / (RATES[from] ?? 1)
    setResult(base * (RATES[to] ?? 1))
  }

  return (
    <div className="space-y-3">
      <CalcField label="Betrag" value={amount} onChange={setAmount} type="number"/>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Von</label>
          <select className="ak-input" value={from} onChange={e => setFrom(e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Nach</label>
          <select className="ak-input" value={to} onChange={e => setTo(e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button onClick={convert} className="w-full ak-btn ak-btn-primary">Umrechnen</button>
      {result !== null && (
        <div className="ak-card bg-navy p-4" style={{ borderLeft: '3px solid #C8392B' }}>
          <div className="font-mono text-[9px] text-white/40 mb-1">{amount} {from} =</div>
          <div className="font-display text-white text-4xl">{result.toFixed(2).replace('.',',')} {to}</div>
        </div>
      )}
    </div>
  )
}

// ── News ─────────────────────────────────────────────────────────────────────

function NewsView({ onBack: Back }: { onBack: React.FC }) {
  const DEMO_NEWS = [
    { source: 'Handelsblatt', title: 'DAX klettert auf Jahreshoch — Anleger optimistisch',       time: 'vor 2h',  cat: 'Märkte'      },
    { source: 'Tagesschau',   title: 'EZB hält Leitzins stabil — nächste Sitzung im Juli',       time: 'vor 4h',  cat: 'Geldpolitik' },
    { source: 'Spiegel',      title: 'Inflation sinkt auf 2,1% — Kaufkraft erholt sich',         time: 'vor 6h',  cat: 'Konjunktur'  },
    { source: 'Handelsblatt', title: 'Bitcoin über 70.000$ — Krypto-Boom hält an',               time: 'vor 8h',  cat: 'Krypto'      },
    { source: 'Tagesschau',   title: 'Arbeitslosenzahlen stabil — Wirtschaft erholt sich',       time: 'gestern', cat: 'Wirtschaft'  },
    { source: 'Spiegel',      title: 'Immobilienmarkt: Preise stabilisieren sich in Großstädten',time: 'gestern', cat: 'Immobilien'  },
  ]

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <Back/>
        <div className="font-display text-white text-4xl tracking-wide">LIVE-NEWS</div>
        <div className="font-sans text-white/30 text-xs mt-1">Wirtschaft & Märkte</div>
      </div>
      <div className="px-4 py-5 space-y-2">
        {DEMO_NEWS.map((n, i) => (
          <div key={i} className="ak-card p-4 animate-in" style={{ animationDelay: `${i*0.05}s`, opacity: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] tracking-widest uppercase text-red">{n.source}</span>
              <div className="w-1 h-1 rounded-full bg-cement"/>
              <span className="font-mono text-[9px] text-cement">{n.time}</span>
              <div className="ml-auto">
                <span className="font-mono text-[8px] tracking-widest text-steel" style={{ background: '#F4F2EE', padding: '2px 6px', borderRadius: 3 }}>{n.cat}</span>
              </div>
            </div>
            <div className="font-sans text-sm font-medium text-navy leading-snug">{n.title}</div>
          </div>
        ))}
        <div className="text-center pt-4">
          <p className="font-mono text-[9px] text-cement tracking-widest uppercase">Demo-Daten · Live-Integration via RSS in V2.1</p>
        </div>
      </div>
    </div>
  )
}
