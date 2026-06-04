import { useState } from 'react'
import { useStore } from '../store'
import { supabase, ACHIEVEMENT_DEFS } from '../lib/supabase'
import { NewsView } from '../components/NewsView'
import { useRef } from 'react'

type SubPage = 'menu' | 'sparziele' | 'achievements' | 'ki' | 'rechner' | 'news'

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
  const back = () => setSub('menu')

  if (sub === 'sparziele')    return <SparzieleView    onBack={back}/>
  if (sub === 'achievements') return <AchievementsView onBack={back}/>
  if (sub === 'ki')           return <KIView           onBack={back}/>
  if (sub === 'rechner')      return <RechnerView      onBack={back}/>
  if (sub === 'news')         return <NewsView         onBack={back}/>

  const MENU = [
    { id: 'sparziele',    label: 'Sparziele',        icon: '🎯', desc: 'Ziele setzen & verfolgen'    },
    { id: 'achievements', label: 'Achievements',     icon: '🏆', desc: 'XP & Belohnungen'            },
    { id: 'ki',           label: 'KI-Assistent',     icon: '🤖', desc: 'Frag deinen Finanzcoach'     },
    { id: 'rechner',      label: 'Rechner',           icon: '🧮', desc: 'Kredit, Zins, ALG I & mehr' },
    { id: 'news',         label: 'Live-News',         icon: '📰', desc: 'Aktuelle Wirtschaftsnews'   },
  ]

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-1">// 04 — Mehr</div>
        <div className="font-display text-white text-4xl tracking-wide">MEHR</div>
      </div>
      <div className="px-4 py-5 space-y-2">
        {MENU.map((item) => (
          <button key={item.id} onClick={() => setSub(item.id as SubPage)}
            className="ak-card w-full p-4 flex items-center justify-between"
            style={{ textAlign: 'left' }}>
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

function SparzieleView({ onBack }: { onBack: () => void }) {
  const { goals, setGoals, userId } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', deadline: '' })
  const COLORS = ['#C8392B','#E8A832','#0D1B2A','#3D5166','#9AA0A6']
  const [color, setColor] = useState(COLORS[0])

  async function handleAdd() {
    if (!form.name || !form.target) return
    const goal = { user_id: userId ?? 'demo', name: form.name, target: parseFloat(form.target), current: 0, deadline: form.deadline || null, color }
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

  async function handleDelete(id: string) {
    if (userId) await supabase.from('savings_goals').delete().eq('id', id)
    setGoals(goals.filter(g => g.id !== id))
  }

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <PageHeader title="SPARZIELE" onBack={onBack}/>
      <div className="px-4 py-4 space-y-3">
        {goals.length === 0 ? (
          <div className="ak-card p-8 text-center"><div className="text-4xl mb-3">🎯</div><p className="font-sans text-sm text-cement">Noch keine Ziele gesetzt.</p></div>
        ) : goals.map(g => {
          const pct = g.target > 0 ? Math.min(100, Math.round(g.current / g.target * 100)) : 0
          return (
            <div key={g.id} className="ak-card p-4" style={{ borderLeft: `3px solid ${g.color}` }}>
              <div className="flex justify-between mb-2">
                <div>
                  <div className="font-sans text-sm font-semibold text-navy">{g.name}</div>
                  {g.deadline && <div className="font-mono text-[9px] text-cement mt-0.5">bis {new Date(g.deadline).toLocaleDateString('de-DE')}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-display text-navy text-2xl">{pct}<span className="text-sm text-cement">%</span></div>
                  <button onClick={() => handleDelete(g.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-cement text-lg" style={{ background: 'rgba(0,0,0,0.05)' }}>×</button>
                </div>
              </div>
              <div className="progress-track mb-2"><div className="progress-fill" style={{ width: `${pct}%`, background: g.color }}/></div>
              <div className="flex justify-between mb-3">
                <span className="font-mono text-[9px] text-cement">{fmt(g.current)}€</span>
                <span className="font-mono text-[9px] text-cement">{fmt(g.target)}€</span>
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
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="flex justify-between mb-5">
              <div className="font-display text-navy text-2xl">NEUES ZIEL</div>
              <button onClick={() => setShowAdd(false)} className="text-cement text-2xl">×</button>
            </div>
            <div className="space-y-3">
              <input className="ak-input" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
              <input className="ak-input" type="number" placeholder="Zielbetrag in €" value={form.target} onChange={e => setForm({...form, target: e.target.value})}/>
              <input className="ak-input" type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}/>
              <div className="flex gap-2">{COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full" style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }}/>
              ))}</div>
              <button onClick={handleAdd} className="w-full ak-btn ak-btn-primary">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AchievementsView({ onBack }: { onBack: () => void }) {
  const { achievements, profile } = useStore()
  const xp = profile?.xp ?? 0
  const level = profile?.level ?? 1
  const unlockedKeys = new Set(achievements.map(a => a.key))
  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <PageHeader title="ACHIEVEMENTS" subtitle={`Level ${level} · ${xp} XP`} onBack={onBack}/>
      <div className="px-4 py-4">
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
          {ACHIEVEMENT_DEFS.map(def => {
            const unlocked = unlockedKeys.has(def.key)
            return (
              <div key={def.key} className={`ak-card p-4 ${unlocked ? '' : 'opacity-40'}`}
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

function KIView({ onBack }: { onBack: () => void }) {
  const { transactions, insurances, goals } = useStore()
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Ahoi! Ich bin dein Finanz-Assistent. Was möchtest du wissen?' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const totalIncome  = transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  async function send() {
    if (!input.trim() || loading) return
    const q = input.trim(); setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)
    const context = `Du bist ein knapper Finanz-Assistent für "Ankerpunkt". Antworte auf Deutsch, max 3 Sätze.
Daten: Einnahmen: ${totalIncome}€, Ausgaben: ${totalExpense}€, Netto: ${totalIncome - totalExpense}€, Versicherungen: ${insurances.length}, Sparziele: ${goals.length}`
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 300, system: context, messages: [{ role: 'user', content: q }] })
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
        {['Wie viel gebe ich aus?','Größte Ausgaben?','Bin ich auf Kurs?','Spartipps'].map(q => (
          <button key={q} onClick={() => setInput(q)}
            className="flex-shrink-0 bg-white border border-navy/10 rounded-full px-3 py-1.5 font-mono text-[9px] text-steel tracking-wider uppercase whitespace-nowrap">{q}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'bubble-user self-end' : 'bubble-ai'}>
            {m.role === 'ai' && <div className="font-mono text-[8px] text-cement tracking-widest uppercase mb-1">ANKERPUNKT KI</div>}
            {m.text}
          </div>
        ))}
        {loading && <div className="bubble-ai"><div className="font-mono text-[8px] text-cement mb-1">ANKERPUNKT KI</div><div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-cement rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div className="px-4 py-3 bg-white border-t border-navy/10 flex-shrink-0" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom,0px))' }}>
        <div className="flex gap-2">
          <input className="ak-input flex-1" placeholder="Frag etwas..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}/>
          <button onClick={send} disabled={loading || !input.trim()} className="w-11 h-11 rounded-lg bg-red flex items-center justify-center flex-shrink-0 disabled:opacity-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function RechnerView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'kredit'|'zins'|'alg'|'waehrung'>('kredit')
  const [betrag, setBetrag] = useState('20000'); const [zinssatz, setZins] = useState('4.5'); const [laufzeit, setLauf] = useState('5')
  const [kapital, setKapital] = useState('10000'); const [jahreszins, setJz] = useState('5'); const [jahre, setJahre] = useState('10')
  const [brutto, setBrutto] = useState('3000'); const [kinder, setKinder] = useState<'ja'|'nein'>('nein')
  const rate = (() => { const p=parseFloat(betrag),r=parseFloat(zinssatz)/100/12,n=parseFloat(laufzeit)*12; if(!p||!r||!n)return null; return (p*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) })()
  const endkapital = (() => { const k=parseFloat(kapital),z=parseFloat(jahreszins)/100,j=parseFloat(jahre); if(!k||!z||!j)return null; return k*Math.pow(1+z,j) })()
  const algI = (() => { const b=parseFloat(brutto); if(!b)return null; return b*0.645*(kinder==='ja'?0.67:0.60) })()

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>
      <PageHeader title="RECHNER" onBack={onBack}/>
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {([['kredit','Kredit'],['zins','Zinseszins'],['alg','ALG I'],['waehrung','Währung']] as const).map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)} className={`ak-tab flex-shrink-0 ${tab===t?'active':''}`}>{l}</button>
          ))}
        </div>
        {tab==='kredit' && <div className="space-y-3"><CalcField label="Kreditbetrag (€)" value={betrag} onChange={setBetrag}/><CalcField label="Zinssatz (% p.a.)" value={zinssatz} onChange={setZins}/><CalcField label="Laufzeit (Jahre)" value={laufzeit} onChange={setLauf}/>{rate&&<ResultCard label="Monatliche Rate" value={`${rate.toFixed(2).replace('.',',')}€`} note={`Gesamt: ${(rate*parseFloat(laufzeit)*12).toLocaleString('de-DE',{maximumFractionDigits:0})}€`}/>}</div>}
        {tab==='zins' && <div className="space-y-3"><CalcField label="Startkapital (€)" value={kapital} onChange={setKapital}/><CalcField label="Jahreszins (%)" value={jahreszins} onChange={setJz}/><CalcField label="Laufzeit (Jahre)" value={jahre} onChange={setJahre}/>{endkapital&&<ResultCard label={`Endkapital nach ${jahre} Jahren`} value={`${endkapital.toLocaleString('de-DE',{maximumFractionDigits:0})}€`} note={`+${(endkapital-parseFloat(kapital)).toLocaleString('de-DE',{maximumFractionDigits:0})}€ Gewinn`} accent="#E8A832"/>}</div>}
        {tab==='alg' && <div className="space-y-3">
          <CalcField label="Bruttogehalt / Monat (€)" value={brutto} onChange={setBrutto}/>
          <div><label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-2">Kind mit Anspruch?</label><div className="flex gap-2">{(['nein','ja'] as const).map(v=><button key={v} onClick={()=>setKinder(v)} className={`ak-tab flex-1 ${kinder===v?'active':''}`}>{v==='ja'?'Ja (67%)':'Nein (60%)'}</button>)}</div></div>
          <div className="ak-card p-3" style={{background:'rgba(13,27,42,0.04)'}}><div className="font-mono text-[9px] text-cement uppercase mb-1">Hinweis</div><div className="font-sans text-xs text-steel font-light leading-relaxed">ALG I = 60% (ohne Kind) bzw. 67% (mit Kind) des pauschalierten Netto. Richtwert — genaue Berechnung via Bundesagentur für Arbeit.</div></div>
          {algI&&<ResultCard label="ALG I / Monat (ca.)" value={`${algI.toLocaleString('de-DE',{maximumFractionDigits:0})}€`} note={`${kinder==='ja'?'67%':'60%'} · Netto ca. ${(parseFloat(brutto)*0.645).toLocaleString('de-DE',{maximumFractionDigits:0})}€`}/>}
        </div>}
        {tab==='waehrung' && <CurrencyCalc/>}
      </div>
    </div>
  )
}

function CalcField({ label, value, onChange }: { label:string; value:string; onChange:(v:string)=>void }) {
  return <div><label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">{label}</label><input className="ak-input" type="number" inputMode="decimal" value={value} onChange={e=>onChange(e.target.value)}/></div>
}
function ResultCard({ label, value, note, accent='#C8392B' }: { label:string; value:string; note?:string; accent?:string }) {
  return <div className="ak-card bg-navy p-4" style={{borderLeft:`3px solid ${accent}`}}><div className="font-mono text-[9px] text-white/40 tracking-widest uppercase mb-1">{label}</div><div className="font-display text-white text-4xl">{value}</div>{note&&<div className="font-mono text-[9px] mt-1" style={{color:accent}}>{note}</div>}</div>
}
function CurrencyCalc() {
  const [amount,setAmount]=useState('100'); const [from,setFrom]=useState('EUR'); const [to,setTo]=useState('USD'); const [result,setResult]=useState<number|null>(null)
  const RATES:Record<string,number>={EUR:1,USD:1.08,GBP:0.86,CHF:0.96,JPY:163.5,DKK:7.46,SEK:11.2,NOK:11.5}
  return <div className="space-y-3"><CalcField label="Betrag" value={amount} onChange={setAmount}/><div className="flex gap-2"><div className="flex-1"><label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Von</label><select className="ak-input" value={from} onChange={e=>setFrom(e.target.value)}>{Object.keys(RATES).map(c=><option key={c}>{c}</option>)}</select></div><div className="flex-1"><label className="font-mono text-[9px] text-cement tracking-widest uppercase block mb-1">Nach</label><select className="ak-input" value={to} onChange={e=>setTo(e.target.value)}>{Object.keys(RATES).map(c=><option key={c}>{c}</option>)}</select></div></div><button onClick={()=>setResult(parseFloat(amount)/(RATES[from]??1)*(RATES[to]??1))} className="w-full ak-btn ak-btn-primary">Umrechnen</button>{result!==null&&<ResultCard label={`${amount} ${from} =`} value={`${result.toFixed(2).replace('.',',')} ${to}`} note="Richtwert · Stand heute"/>}</div>
}
