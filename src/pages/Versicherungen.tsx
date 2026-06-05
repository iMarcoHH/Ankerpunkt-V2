import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { supabase, INSURANCE_CATEGORIES } from '../lib/supabase'
import { Shield, Plus, Trash2 } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)

export function VersicherungenPage() {
  const { insurances, setInsurances, userId } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name:'', provider:'', amount:'', period:'yearly' as 'monthly'|'yearly', category:'Haftpflicht' })

  const totalMonthly = insurances.reduce((s,i) => s + (i.recurrence==='monthly' ? i.amount : i.amount/12), 0)
  const totalYearly  = totalMonthly * 12

  async function handleAdd() {
    if (!form.name || !form.amount) return
    const ins = { user_id: userId??'demo', name:form.name, provider:form.provider, amount:parseFloat(form.amount), recurrence:form.period, category:form.category }
    if (userId) {
      const { data: row } = await supabase.from('insurances').insert(ins).select().single()
      if (row) setInsurances([...insurances, row])
    } else {
      setInsurances([...insurances, { ...ins, id: Date.now().toString(), created_at: new Date().toISOString() }])
    }
    setForm({ name:'', provider:'', amount:'', period:'yearly', category:'Haftpflicht' })
    setShowAdd(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Versicherung löschen?')) return
    if (userId) await supabase.from('insurances').delete().eq('id', id)
    setInsurances(insurances.filter(i => i.id !== id))
  }

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="flex items-end justify-between pt-14">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-white">Versicherungen</h1>
          <p className="text-cement text-sm mt-1">Alle Policen im Überblick</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-display tracking-wide text-sm text-white"
          style={{ background: '#C8392B' }}>
          <Plus className="w-4 h-4"/> Neu
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="ak-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(61,81,102,0.3)' }}>
            <Shield className="w-5 h-5 text-cement"/>
          </div>
          <div>
            <p className="text-xs text-cement">Monatlich</p>
            <p className="font-display text-lg text-white">{fmt(totalMonthly)}</p>
          </div>
        </div>
        <div className="ak-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(61,81,102,0.3)' }}>
            <Shield className="w-5 h-5 text-cement"/>
          </div>
          <div>
            <p className="text-xs text-cement">Jährlich</p>
            <p className="font-display text-lg text-white">{fmt(totalYearly)}</p>
          </div>
        </div>
      </div>

      {/* List */}
      {insurances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl gap-4"
             style={{ border: '2px dashed rgba(61,81,102,0.4)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(61,81,102,0.2)' }}>
            <Shield className="w-7 h-7 text-cement opacity-40"/>
          </div>
          <p className="text-sm text-cement">Noch keine Versicherungen.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {insurances.map((ins, i) => (
            <motion.div key={ins.id} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
              className="ak-card p-4 flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(61,81,102,0.3)' }}>
                <Shield className="w-5 h-5 text-cement"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{ins.name}</p>
                <p className="text-xs text-cement">{ins.provider} · {ins.recurrence === 'yearly' ? 'jährlich' : 'monatlich'}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-display text-lg text-white">{fmt(ins.amount)}</div>
                  <div className="text-xs text-cement font-mono">{fmt(ins.period==='monthly'?ins.amount:ins.amount/12)}/mo</div>
                </div>
                <button onClick={() => handleDelete(ins.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background:'rgba(200,57,43,0.15)' }}>
                  <Trash2 className="w-3.5 h-3.5 text-red-400"/>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="flex justify-center mb-3"><div className="w-10 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/></div>
            <div className="flex justify-between items-center mb-5">
              <div className="font-display text-white text-2xl">NEUE VERSICHERUNG</div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full text-cement text-xl flex items-center justify-center" style={{ background:'rgba(255,255,255,0.08)' }}>×</button>
            </div>
            <div className="space-y-3">
              <input className="ak-input" placeholder="Name (z.B. Haftpflicht)" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}/>
              <input className="ak-input" placeholder="Anbieter (z.B. HanseMerkur)" value={form.provider} onChange={e => setForm(f=>({...f,provider:e.target.value}))}/>
              <input className="ak-input" type="number" placeholder="Betrag in €" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))}/>
              <div className="flex gap-2">
                {(['monthly','yearly'] as const).map(p => (
                  <button key={p} onClick={() => setForm(f=>({...f,period:p}))}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: form.period===p ? '#C8392B' : 'rgba(255,255,255,0.06)', color: form.period===p?'white':'#9AA0A6' }}>
                    {p==='monthly'?'Monatlich':'Jährlich'}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INSURANCE_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm(f=>({...f,category:cat}))}
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
