import { useState } from 'react'
import { useStore } from '../store'
import { supabase, INSURANCE_CATEGORIES, type Insurance } from '../lib/supabase'

function fmt(n: number) { return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const DEMO: Insurance[] = [
  { id: '1', user_id: '', name: 'Haftpflicht', provider: 'HanseMerkur', amount: 60,  period: 'yearly',  category: 'Haftpflicht', created_at: '' },
  { id: '2', user_id: '', name: 'Hausrat',     provider: 'HanseMerkur', amount: 50,  period: 'yearly',  category: 'Hausrat',     created_at: '' },
]

export function VersicherungenPage() {
  const { insurances, setInsurances, userId } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', provider: '', amount: '', period: 'yearly' as 'monthly'|'yearly', category: 'Haftpflicht' })
  const [saving, setSaving] = useState(false)

  const data = insurances.length > 0 ? insurances : DEMO

  const totalMonthly = data.reduce((s, i) => s + (i.period === 'monthly' ? i.amount : i.amount / 12), 0)
  const totalYearly  = totalMonthly * 12

  async function handleAdd() {
    if (!form.name || !form.amount) return
    setSaving(true)
    const ins = {
      user_id:  userId ?? 'demo',
      name:     form.name,
      provider: form.provider,
      amount:   parseFloat(form.amount),
      period:   form.period,
      category: form.category,
    }
    if (userId) {
      const { data: row } = await supabase.from('insurances').insert(ins).select().single()
      if (row) setInsurances([...insurances, row])
    } else {
      setInsurances([...insurances, { ...ins, id: Date.now().toString(), created_at: new Date().toISOString() }])
    }
    setForm({ name: '', provider: '', amount: '', period: 'yearly', category: 'Haftpflicht' })
    setShowAdd(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (userId) await supabase.from('insurances').delete().eq('id', id)
    setInsurances(insurances.filter(i => i.id !== id))
  }

  return (
    <div className="pb-28 min-h-screen" style={{ background: '#F4F2EE' }}>

      {/* Header */}
      <div className="bg-navy px-5 pt-14 pb-6" style={{ borderBottom: '3px solid #C8392B' }}>
        <div className="font-mono text-[10px] text-red tracking-widest uppercase mb-1">// 04 — Schutz</div>
        <div className="font-display text-white text-4xl tracking-wide">VERSICHERUNGEN</div>
        <div className="font-sans text-white/30 text-xs font-light mt-1">Alle Policen im Überblick</div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 animate-in">
          <div className="ak-card p-4" style={{ borderLeft: '3px solid #9AA0A6' }}>
            <div className="font-mono text-[9px] tracking-widest uppercase text-cement mb-1">Monatlich</div>
            <div className="font-display text-navy text-2xl leading-none">{fmt(totalMonthly)}<span className="text-sm font-sans text-cement ml-0.5">€</span></div>
          </div>
          <div className="ak-card p-4" style={{ borderLeft: '3px solid #0D1B2A' }}>
            <div className="font-mono text-[9px] tracking-widest uppercase text-cement mb-1">Jährlich</div>
            <div className="font-display text-navy text-2xl leading-none">{fmt(totalYearly)}<span className="text-sm font-sans text-cement ml-0.5">€</span></div>
          </div>
        </div>

        {/* List */}
        <div className="animate-in-2">
          <div className="font-mono text-[10px] tracking-widest uppercase text-cement mb-3 flex items-center gap-2">
            <span>Policen ({data.length})</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }}/>
          </div>
          <div className="space-y-2">
            {data.map((ins) => {
              const monthly = ins.period === 'monthly' ? ins.amount : ins.amount / 12
              return (
                <div key={ins.id} className="ak-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center text-sm">🛡</div>
                    <div>
                      <div className="font-sans text-sm font-semibold text-navy">{ins.name}</div>
                      <div className="font-mono text-[9px] text-cement uppercase tracking-wider">{ins.provider} · {ins.period === 'yearly' ? 'jährlich' : 'monatlich'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-display text-navy text-lg">{ins.amount.toLocaleString('de-DE')}€</div>
                      <div className="font-mono text-[9px] text-cement">{fmt(monthly)}€/mo</div>
                    </div>
                    {insurances.length > 0 && (
                      <button onClick={() => handleDelete(ins.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-cement hover:text-red transition-colors"
                        style={{ background: 'rgba(0,0,0,0.05)' }}>
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Add button */}
        <button onClick={() => setShowAdd(true)}
          className="w-full ak-btn ak-btn-primary animate-in-3">
          + Versicherung hinzufügen
        </button>

      </div>

      {/* Add sheet */}
      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="flex items-center justify-between mb-5">
              <div className="font-display text-navy text-2xl tracking-wide">NEU</div>
              <button onClick={() => setShowAdd(false)} className="text-cement text-2xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              <input className="ak-input" placeholder="Name (z.B. Haftpflicht)" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
              <input className="ak-input" placeholder="Anbieter (z.B. HanseMerkur)" value={form.provider} onChange={e => setForm({...form, provider: e.target.value})}/>
              <input className="ak-input" type="number" placeholder="Betrag in €" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}/>
              <div className="flex gap-2">
                {(['monthly','yearly'] as const).map(p => (
                  <button key={p} onClick={() => setForm({...form, period: p})}
                    className={`ak-tab flex-1 ${form.period === p ? 'active' : ''}`}>
                    {p === 'monthly' ? 'Monatlich' : 'Jährlich'}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {INSURANCE_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm({...form, category: cat})}
                    className={`cat-chip ${form.category === cat ? 'selected' : ''}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <button onClick={handleAdd} disabled={saving}
                className="w-full ak-btn ak-btn-primary mt-2">
                {saving ? 'Speichern...' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
